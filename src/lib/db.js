import { supabase } from "./supabase";

// Leest alle Supabase-tabellen en bouwt daar precies dezelfde geneste `data`-vorm
// van die de rest van de app (App.jsx) al verwacht — zodat de UI-componenten
// niet aangepast hoeven te worden, alleen de laag die data ophaalt/opslaat.
export async function loadAll() {
  const [
    club, members, months, ledger, categories, expenses, income, accounts,
    forecastConfig, buckets, oneOffs, vakantie, betalingen,
  ] = await Promise.all([
    supabase.from("club").select("*").eq("id", 1).single(),
    supabase.from("members").select("*"),
    supabase.from("months").select("*"),
    supabase.from("ledger").select("*"),
    supabase.from("categories").select("*"),
    supabase.from("expenses").select("*"),
    supabase.from("income").select("*"),
    supabase.from("accounts").select("*").eq("id", 1).single(),
    supabase.from("forecast_config").select("*").eq("id", 1).single(),
    supabase.from("forecast_buckets").select("*"),
    supabase.from("forecast_one_offs").select("*"),
    supabase.from("forecast_vakantie").select("*").eq("id", 1).single(),
    supabase.from("forecast_boeking_betalingen").select("*"),
  ]);

  for (const r of [club, members, months, ledger, categories, expenses, income, accounts, forecastConfig, buckets, oneOffs, vakantie, betalingen]) {
    if (r.error) throw r.error;
  }

  const ledgerObj = {};
  ledger.data.forEach((r) => {
    ledgerObj[`${r.member_id}|${r.month}`] = { req: r.req, paid: r.paid, date: r.date };
  });
  const incomeObj = {};
  income.data.forEach((r) => { incomeObj[r.month] = r.amount; });

  return {
    groupName: club.data.group_name,
    iban: club.data.iban,
    beheerders: club.data.beheerders,
    lustrumTarget: club.data.lustrum_target,
    lastUpdated: club.data.last_updated,
    lastUpdatedBy: club.data.last_updated_by,
    members: members.data.map((m) => ({
      id: m.id, name: m.name, short: m.short, type: m.type, rate: m.rate, color: m.color, saved: m.saved, target: m.target,
    })),
    months: months.data.map((r) => r.month).sort(),
    ledger: ledgerObj,
    expenses: expenses.data.map((e) => ({ id: e.id, month: e.month, desc: e.description, amount: e.amount, cat: e.cat })),
    income: incomeObj,
    categories: categories.data.map((c) => ({ name: c.name, color: c.color })),
    accounts: {
      betaalrekening: accounts.data.betaalrekening,
      spaarrekeningVakantie: accounts.data.spaarrekening_vakantie,
      lustrum: accounts.data.lustrum,
      tegoedVereniging: accounts.data.tegoed_vereniging,
    },
    debts: [],
    forecast: {
      startMonth: forecastConfig.data.start_month,
      horizon: forecastConfig.data.horizon,
      startSaldoOverride: forecastConfig.data.start_saldo_override,
      startSchuld: forecastConfig.data.start_schuld,
      avgMonths: forecastConfig.data.avg_months,
      inclSchuld: forecastConfig.data.incl_schuld,
      override: forecastConfig.data.override,
      betalersOverride: forecastConfig.data.betalers_override,
      oneOffs: oneOffs.data.map((o) => ({ id: o.id, month: o.month, desc: o.description, amount: o.amount, cat: o.cat })),
      buckets: buckets.data.map((b) => ({
        id: b.id, name: b.name, cat: b.cat, startMaand: b.start_maand, eindMaand: b.eind_maand,
        totaalBedrag: b.totaal_bedrag, enabled: b.enabled,
        isBoekingPot: b.is_boeking_pot, isActiviteitenPot: b.is_activiteiten_pot, isBuffer: b.is_buffer,
      })),
      vakantie: {
        boeking: {
          startPot: vakantie.data.boeking_start_pot,
          betalingen: betalingen.data.map((b) => ({ id: b.id, maand: b.maand, bedrag: b.bedrag, label: b.label })),
        },
        activiteiten: {
          startPot: vakantie.data.activiteiten_start_pot,
          vakantiemaand: vakantie.data.activiteiten_vakantiemaand,
          verwachtBedrag: vakantie.data.activiteiten_verwacht_bedrag,
        },
      },
    },
  };
}

// Vervangt de volledige inhoud van een "verzameling"-tabel door de huidige
// client-state (delete-all + insert-all). Voor een club van 16 leden is dit
// ruim snel genoeg en veel eenvoudiger/betrouwbaarder dan per-rij diffen.
async function syncCollection(table, idCol, rows) {
  const del = await supabase.from(table).delete().not(idCol, "is", null);
  if (del.error) throw del.error;
  if (rows.length === 0) return;
  const ins = await supabase.from(table).insert(rows);
  if (ins.error) throw ins.error;
}

export async function saveAll(data) {
  const f = data.forecast;
  const results = await Promise.all([
    supabase.from("club").update({
      group_name: data.groupName, iban: data.iban, beheerders: data.beheerders,
      lustrum_target: data.lustrumTarget, last_updated: data.lastUpdated, last_updated_by: data.lastUpdatedBy,
    }).eq("id", 1),
    supabase.from("accounts").update({
      betaalrekening: data.accounts.betaalrekening,
      spaarrekening_vakantie: data.accounts.spaarrekeningVakantie,
      lustrum: data.accounts.lustrum,
      tegoed_vereniging: data.accounts.tegoedVereniging,
    }).eq("id", 1),
    supabase.from("forecast_config").update({
      start_month: f.startMonth, horizon: f.horizon, start_saldo_override: f.startSaldoOverride,
      start_schuld: f.startSchuld, avg_months: f.avgMonths, incl_schuld: f.inclSchuld,
      override: f.override, betalers_override: f.betalersOverride,
    }).eq("id", 1),
    supabase.from("forecast_vakantie").update({
      boeking_start_pot: f.vakantie.boeking.startPot,
      activiteiten_start_pot: f.vakantie.activiteiten.startPot,
      activiteiten_vakantiemaand: f.vakantie.activiteiten.vakantiemaand,
      activiteiten_verwacht_bedrag: f.vakantie.activiteiten.verwachtBedrag,
    }).eq("id", 1),
    syncCollection("members", "id", data.members.map((m) => ({
      id: m.id, name: m.name, short: m.short, type: m.type, rate: m.rate, color: m.color, saved: m.saved, target: m.target,
    }))),
    syncCollection("months", "month", data.months.map((mo) => ({ month: mo }))),
    syncCollection("ledger", "member_id", Object.entries(data.ledger).map(([k, v]) => {
      const [member_id, month] = k.split("|");
      return { member_id, month, req: v.req, paid: v.paid, date: v.date };
    })),
    syncCollection("categories", "name", data.categories.map((c) => ({ name: c.name, color: c.color }))),
    syncCollection("expenses", "id", data.expenses.map((e) => ({ id: e.id, month: e.month, description: e.desc, amount: e.amount, cat: e.cat }))),
    syncCollection("income", "month", Object.entries(data.income).map(([month, amount]) => ({ month, amount }))),
    syncCollection("forecast_buckets", "id", f.buckets.map((b) => ({
      id: b.id, name: b.name, cat: b.cat, start_maand: b.startMaand, eind_maand: b.eindMaand,
      totaal_bedrag: b.totaalBedrag, enabled: b.enabled,
      is_boeking_pot: !!b.isBoekingPot, is_activiteiten_pot: !!b.isActiviteitenPot, is_buffer: !!b.isBuffer,
    }))),
    syncCollection("forecast_one_offs", "id", f.oneOffs.map((o) => ({ id: o.id, month: o.month, description: o.desc, amount: o.amount, cat: o.cat }))),
    syncCollection("forecast_boeking_betalingen", "id", f.vakantie.boeking.betalingen.map((b) => ({ id: b.id, maand: b.maand, bedrag: b.bedrag, label: b.label }))),
  ]);
  for (const r of results) {
    if (r && r.error) throw r.error;
  }
}
