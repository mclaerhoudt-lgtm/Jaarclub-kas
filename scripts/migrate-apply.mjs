// Stap 5b — schrijft de échte data (CSV-bankafschrift jan–juni 2026 + de overige
// SEED-instellingen: leden, categorieën, rekeningen, prognoseconfig) eenmalig naar
// Supabase. Volledig niet-interactief, geen account nodig (schrijftoegang is open,
// bescherming loopt via de pincode in de app zelf) — bevestiging via env var.
//
// Gebruik (in dit project, met je .env al ingevuld):
//   MIGRATE_CONFIRM=JA node --env-file=.env scripts/migrate-apply.mjs "../CSV_A_NL45RABO0386282927_EUR_20260101_20260622.csv"

import fs from "fs";
import path from "path";

if (!process.env.VITE_SUPABASE_URL || !process.env.VITE_SUPABASE_ANON_KEY) {
  console.error("VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY ontbreken. Start met: node --env-file=.env scripts/migrate-apply.mjs ...");
  process.exit(1);
}

// ── 1. SEED + helpers ophalen uit src/App.jsx (members, categorieën, forecast-config) ──
const appSrc = fs.readFileSync(new URL("../src/App.jsx", import.meta.url), "utf8");
const seedLine = appSrc.split("\n").find((l) => l.startsWith("const SEED"));
const SEED = JSON.parse(seedLine.replace(/^const SEED = /, "").replace(/;$/, ""));

// ── 2. CSV parsen (zelfde logica als de app, zie scripts/parse-csv.mjs) ──
function normName(s) {
  return (s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z ]/g, " ").split(/\s+/).filter((t) => t.length > 2);
}
function matchMember(name, members) {
  const toks = normName(name);
  let best = null, sc = 0;
  for (const m of members) {
    const mt = normName(m.name).concat(normName(m.short));
    let s = 0;
    for (const t of toks) if (mt.includes(t)) s++;
    if (s > sc) { sc = s; best = m; }
  }
  return sc >= 1 ? best : null;
}
function guessCat(desc) {
  const d = (desc || "").toLowerCase();
  if (/kss alcuin|katholieke studenten societeit alcuin/.test(d)) return "Vereniging";
  if (/borrel|bier|drank|cafe|kroeg|dranken|dixo|disco/.test(d)) return "Borrels & dixo's";
  if (/diner|eten|restaurant|activiteit|uitje|reis|n8w8|herenak|vebo|lancet/.test(d)) return "Activiteit";
  if (/spar|lustrum|vakantie/.test(d)) return "Sparen";
  return "Overig"; // expliciete keuze: alles wat niet herkend wordt -> Overig, later zelf te verfijnen in de app
}
function parseCSV(text) {
  text = text.replace(/^﻿/, "");
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  const delim = (lines[0].match(/;/g) || []).length >= (lines[0].match(/,/g) || []).length ? ";" : ",";
  const split = (l) => {
    const out = []; let cur = "", q = false;
    for (let i = 0; i < l.length; i++) {
      const c = l[i];
      if (c === '"') { if (q && l[i + 1] === '"') { cur += '"'; i++; } else q = !q; }
      else if (c === delim && !q) { out.push(cur); cur = ""; }
      else cur += c;
    }
    out.push(cur);
    return out.map((s) => s.trim().replace(/^"|"$/g, ""));
  };
  const head = split(lines[0]).map((h) => h.toLowerCase());
  const find = (...keys) => head.findIndex((h) => keys.some((k) => h.includes(k)));
  const iDate = find("datum", "date");
  const iAmt = find("bedrag", "amount", "mutatie");
  const iName = find("naam tegenpartij", "tegenpartij", "naam / omschrijving", "naam", "name");
  const iDesc = find("omschrijving", "mededeling", "description", "memo");
  const iSaldo = find("saldo na trn");
  const rows = [];
  let lastSaldo = null;
  for (let i = 1; i < lines.length; i++) {
    const c = split(lines[i]);
    if (c.length < 2) continue;
    let amt = parseFloat((c[iAmt] || "").replace(/\./g, "").replace(",", ".").replace(/[^0-9.\-]/g, ""));
    if (isNaN(amt)) continue;
    const dateRaw = c[iDate] || "";
    const m1 = dateRaw.match(/(\d{4})[-/]?(\d{2})[-/]?(\d{2})/);
    let mo = null, date = null;
    if (m1) { mo = `${m1[1]}-${m1[2]}`; date = `${m1[1]}-${m1[2]}-${m1[3]}`; }
    const name = c[iName] || "";
    const desc = c[iDesc] || name;
    if (iSaldo >= 0) {
      const s = parseFloat((c[iSaldo] || "").replace(/\./g, "").replace(",", ".").replace(/[^0-9.\-]/g, ""));
      if (!isNaN(s)) lastSaldo = s;
    }
    rows.push({ amt, mo, date, name, desc: desc || name });
  }
  return { rows, finalBalance: lastSaldo };
}

async function main() {
  const csvPath = process.argv[2];
  if (!csvPath) { console.error("Geef het pad naar het CSV-bestand als argument."); process.exit(1); }
  const text = fs.readFileSync(path.resolve(csvPath), "latin1");
  const { rows, finalBalance } = parseCSV(text);

  // ── 3. ledger + expenses opbouwen uit de CSV ──
  const ledgerByKey = {}; // "memberId|maand" -> {bedrag, laatsteDatum}
  const expenses = [];
  let expN = 1;
  const monthsSet = new Set();

  for (const row of rows) {
    if (!row.mo) continue;
    monthsSet.add(row.mo);
    if (row.amt > 0) {
      const m = matchMember(row.name, SEED.members);
      if (!m) continue; // niet-leden-collectes (Betaalverzoeken e.d.) bewust overgeslagen, zie overleg
      const key = `${m.id}|${row.mo}`;
      if (!ledgerByKey[key]) ledgerByKey[key] = { bedrag: 0, datum: row.date };
      ledgerByKey[key].bedrag += row.amt;
      if (row.date > ledgerByKey[key].datum) ledgerByKey[key].datum = row.date;
    } else if (row.amt < 0) {
      expenses.push({
        id: "e" + expN++, month: row.mo, desc: row.desc.slice(0, 120),
        amount: Math.round(Math.abs(row.amt) * 100) / 100, cat: guessCat(row.desc),
      });
    }
  }
  const ledger = {};
  for (const [key, v] of Object.entries(ledgerByKey)) {
    ledger[key] = { req: Math.round(v.bedrag * 100) / 100, paid: true, date: v.datum };
  }
  const months = [...monthsSet].sort();

  // ── 4. categorieën: bestaande SEED-set + "Vereniging" ──
  const categories = [...SEED.categories];
  if (!categories.some((c) => c.name === "Vereniging")) categories.push({ name: "Vereniging", color: "#2c3e63" });

  // ── 5. eindresultaat: SEED als basis, ledger/months/expenses/income/saldo vervangen door de echte data ──
  const data = {
    ...SEED,
    months,
    ledger,
    expenses,
    income: {}, // leeg: inkomsten worden nu afgeleid uit de echte ledger i.p.v. handmatige maandtotalen
    categories,
    accounts: { ...SEED.accounts, betaalrekening: finalBalance ?? SEED.accounts.betaalrekening },
    lastUpdated: new Date().toISOString().slice(0, 10),
    lastUpdatedBy: "migratie (CSV)",
  };
  delete data.debts;

  console.log(`\nKlaar om te schrijven: ${months.length} maanden (${months[0]} t/m ${months[months.length - 1]}), ${Object.keys(ledger).length} ledger-regels, ${expenses.length} uitgaves, saldo € ${data.accounts.betaalrekening}.\n`);

  const confirm = process.env.MIGRATE_CONFIRM;
  if (confirm !== "JA") {
    console.log("Niets geschreven. Zet MIGRATE_CONFIRM=JA om dit echt uit te voeren.");
    process.exit(0);
  }

  // Schrijven mag zonder inloggen: schrijftoegang is open (alleen de pincode in de app zelf beschermt "Beheer").
  console.log("Bezig met schrijven naar Supabase…");
  const { saveAll } = await import("../src/lib/db.js");
  await saveAll(data);
  console.log("Klaar! Open de app en controleer Betalingen/Uitgaves/Overzicht.");
}

main().catch((e) => { console.error(e); process.exit(1); });
