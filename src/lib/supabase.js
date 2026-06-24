import { createClient } from "@supabase/supabase-js";

// import.meta.env (Vite, in de browser) of process.env (Node, voor de eenmalige
// migratiescripts in scripts/ — gestart met `node --env-file=.env ...`).
const env = import.meta.env || {};
const url = env.VITE_SUPABASE_URL || (typeof process !== "undefined" ? process.env.VITE_SUPABASE_URL : undefined);
const anonKey = env.VITE_SUPABASE_ANON_KEY || (typeof process !== "undefined" ? process.env.VITE_SUPABASE_ANON_KEY : undefined);

if (!url || !anonKey) {
  throw new Error(
    "Supabase-config ontbreekt. Zet VITE_SUPABASE_URL en VITE_SUPABASE_ANON_KEY in .env (zie .env.example)."
  );
}

export const supabase = createClient(url, anonKey);
