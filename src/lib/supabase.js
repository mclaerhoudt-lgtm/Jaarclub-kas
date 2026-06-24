import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  throw new Error(
    "Supabase-config ontbreekt. Zet VITE_SUPABASE_URL en VITE_SUPABASE_ANON_KEY in .env (zie .env.example)."
  );
}

export const supabase = createClient(url, anonKey);
