-- ─────────────────────────────────────────────────────────────────────────
-- Jaarclub kas — Supabase schema
-- Plak dit hele bestand in het Supabase-dashboard onder "SQL Editor" → "New query" → Run.
-- Idempotent: gebruikt "if not exists" / "or replace" waar mogelijk, dus opnieuw
-- draaien op een lege of gedeeltelijk opgezette database is veilig.
-- ─────────────────────────────────────────────────────────────────────────

-- ───────────── rollen ─────────────
do $$ begin
  create type app_role as enum ('penningmeester', 'kijker');
exception when duplicate_object then null;
end $$;

-- Eén profiel per Supabase-auth-gebruiker. Rol wordt NIET door de app zelf gewijzigd
-- (geen self-elevation-risico) — die zet je zelf even in de Supabase Table Editor
-- nadat iemand voor het eerst is ingelogd.
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  role app_role not null default 'kijker',
  created_at timestamptz not null default now()
);

-- Nieuwe auth-gebruiker → automatisch een profiel-rij (standaard kijker).
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, role)
  values (new.id, new.raw_user_meta_data->>'display_name', 'kijker');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- Helper: is de ingelogde gebruiker penningmeester? (security definer zodat dit
-- werkt zonder dat profiles zelf voor iedereen leesbaar hoeft te zijn via RLS-recursie)
create or replace function is_penningmeester()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from profiles where id = auth.uid() and role = 'penningmeester'
  );
$$;

-- ───────────── club / meta (1 rij) ─────────────
create table if not exists club (
  id int primary key default 1 check (id = 1),
  group_name text not null default 'Jaarclub kas',
  iban text not null default '',
  beheerders text not null default '',
  lustrum_target numeric not null default 3000,
  lustrum_einddatum text,
  pm_pin text not null default '1865',
  last_updated date,
  last_updated_by text
);
insert into club (id) values (1) on conflict (id) do nothing;
alter table club add column if not exists pm_pin text not null default '1865';
alter table club add column if not exists lustrum_einddatum text;

-- ───────────── leden ─────────────
create table if not exists members (
  id text primary key,                 -- bestaande "m0","m1",... ids blijven werken
  name text not null,
  short text not null,
  type text not null default 'fulltime',
  rate numeric not null default 0,
  color text not null default '#9c6b3f',
  saved numeric not null default 0,
  target numeric not null default 3000
);

-- ───────────── betaalrooster ─────────────
create table if not exists months (
  month text primary key               -- "YYYY-MM", zichtbare kolommen in het rooster
);

create table if not exists ledger (
  member_id text not null references members(id) on delete cascade,
  month text not null references months(month) on delete cascade,
  req numeric,
  paid boolean not null default false,
  date date,
  primary key (member_id, month)
);

-- ───────────── categorieën ─────────────
create table if not exists categories (
  name text primary key,
  color text not null default '#6b5436'
);

-- ───────────── uitgaves & inkomsten (huidig jaar) ─────────────
create table if not exists expenses (
  id text primary key,
  month text not null,
  description text not null,
  amount numeric not null,
  cat text references categories(name) on delete set null
);

create table if not exists income (
  month text primary key,
  amount numeric not null
);

-- ───────────── rekeningen (1 rij) ─────────────
create table if not exists accounts (
  id int primary key default 1 check (id = 1),
  betaalrekening numeric not null default 0,
  spaarrekening_vakantie numeric not null default 0,
  lustrum numeric not null default 0,
  tegoed_vereniging numeric not null default 0
);
insert into accounts (id) values (1) on conflict (id) do nothing;

-- ───────────── prognose: hoofdinstellingen (1 rij) ─────────────
create table if not exists forecast_config (
  id int primary key default 1 check (id = 1),
  start_month text not null,
  horizon int not null default 8,
  start_saldo_override numeric,        -- null = volgt accounts.betaalrekening
  start_schuld numeric not null default 0,
  avg_months int not null default 6,
  incl_schuld boolean not null default false,
  override numeric,                    -- handmatig vast bedrag p.p., null = berekend
  betalers_override numeric            -- null = gemiddeld (automatisch)
);
insert into forecast_config (id, start_month) values (1, to_char(now(), 'YYYY-MM'))
  on conflict (id) do nothing;

-- ───────────── prognose: bestemmingen (buckets) ─────────────
create table if not exists forecast_buckets (
  id text primary key,
  name text not null,
  cat text references categories(name) on delete set null,
  start_maand text not null,
  eind_maand text not null,
  totaal_bedrag numeric not null default 0,
  enabled boolean not null default true,
  is_boeking_pot boolean not null default false,
  is_activiteiten_pot boolean not null default false,
  is_buffer boolean not null default false
);

-- ───────────── prognose: overige eenmalige uitgaves ─────────────
create table if not exists forecast_one_offs (
  id text primary key,
  month text not null,
  description text not null,
  amount numeric not null default 0,
  cat text references categories(name) on delete set null
);

-- ───────────── prognose: clubvakantie-cyclus ─────────────
create table if not exists forecast_vakantie (
  id int primary key default 1 check (id = 1),
  boeking_start_pot numeric not null default 0,
  activiteiten_start_pot numeric not null default 0,
  activiteiten_vakantiemaand text,
  activiteiten_verwacht_bedrag numeric not null default 0
);
insert into forecast_vakantie (id) values (1) on conflict (id) do nothing;

create table if not exists forecast_boeking_betalingen (
  id text primary key,
  maand text not null,
  bedrag numeric not null default 0,
  label text not null default 'Betaling'
);

-- ─────────────────────────────────────────────────────────────────────────
-- Row Level Security: zowel LEZEN als SCHRIJVEN staat open voor iedereen met
-- de (publieke) anon key — er zijn geen accounts. De penningmeester-status
-- wordt alleen in de app zelf afgedwongen via een 4-cijferige pincode
-- (data.pmPin / club.pm_pin), net zoals in de oorspronkelijke lokale versie.
-- ─────────────────────────────────────────────────────────────────────────

do $$
declare
  t text;
begin
  for t in select unnest(array[
    'profiles','club','members','months','ledger','categories','expenses','income',
    'accounts','forecast_config','forecast_buckets','forecast_one_offs',
    'forecast_vakantie','forecast_boeking_betalingen'
  ])
  loop
    execute format('alter table %I enable row level security;', t);

    execute format('drop policy if exists "read_authenticated" on %I;', t); -- oude naam, opruimen
    execute format('drop policy if exists "write_pm" on %I;', t); -- oude naam, opruimen
    execute format('drop policy if exists "read_public" on %I;', t);
    execute format('drop policy if exists "all_public" on %I;', t);
    execute format(
      'create policy "all_public" on %I for all using (true) with check (true);', t
    );
  end loop;
end $$;

-- profiles: iedereen mag alle profielen lezen (handig om namen te tonen), maar
-- schrijven naar profiles (incl. rol-wijzigingen) gebeurt NIET via de app — dat
-- doe je zelf in de Supabase Table Editor. De "write_pm"-policy hierboven staat
-- dus ook PM-schrijven naar profiles toe; als je dat liever helemaal dicht wil
-- zetten, verwijder dan los de "write_pm"-policy op profiles.
