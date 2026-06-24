// Stap 5a (DRY RUN — schrijft niets weg): parseert het Rabobank-CSV-bankafschrift
// en print een overzicht van wat herkend is, zodat je dat eerst kunt controleren
// vóórdat we het écht naar Supabase migreren.
//
// Gebruik:  node scripts/parse-csv.mjs "../CSV_A_NL45RABO0386282927_EUR_20260101_20260622.csv"

import fs from "fs";
import path from "path";

const csvPath = process.argv[2];
if (!csvPath) { console.error("Geef het pad naar het CSV-bestand als argument."); process.exit(1); }

const members = JSON.parse(fs.readFileSync(new URL("../../members.json", import.meta.url)));

// ── exact dezelfde parse-/matchlogica als de app (src/App.jsx: parseCSV/matchMember/guessCat) ──
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
  if (/borrel|bier|drank|cafe|kroeg|dranken|dixo|disco/.test(d)) return "Borrels & dixo's";
  if (/diner|eten|restaurant|activiteit|uitje|reis|n8w8|herenak|vebo|lancet/.test(d)) return "Activiteit";
  if (/spar|lustrum|vakantie/.test(d)) return "Sparen";
  return null;
}
function parseCSV(text) {
  text = text.replace(/^﻿/, "");
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (!lines.length) return { rows: [], err: "Leeg bestand" };
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
  const iAfBij = find("af bij", "af/bij", "debit", "credit", "bij/af");
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const c = split(lines[i]);
    if (c.length < 2) continue;
    let raw = (iAmt >= 0 ? c[iAmt] : "") || "";
    let amt = parseFloat(raw.replace(/\./g, "").replace(",", ".").replace(/[^0-9.\-]/g, ""));
    if (isNaN(amt)) continue;
    if (iAfBij >= 0) {
      const ab = (c[iAfBij] || "").toLowerCase();
      if (ab.includes("af") || ab.includes("debet")) amt = -Math.abs(amt);
      else if (ab.includes("bij") || ab.includes("credit")) amt = Math.abs(amt);
    }
    let dateRaw = (iDate >= 0 ? c[iDate] : "") || "";
    let mo = null, date = null;
    const m1 = dateRaw.match(/(\d{4})[-/]?(\d{2})[-/]?(\d{2})/);
    const m2 = dateRaw.match(/(\d{2})[-/](\d{2})[-/](\d{4})/);
    if (m1) { mo = `${m1[1]}-${m1[2]}`; date = `${m1[1]}-${m1[2]}-${m1[3]}`; }
    else if (m2) { mo = `${m2[3]}-${m2[2]}`; date = `${m2[3]}-${m2[2]}-${m2[1]}`; }
    const name = (iName >= 0 ? c[iName] : "") || "";
    const desc = (iDesc >= 0 ? c[iDesc] : "") || name;
    rows.push({ amt, mo, date, name, desc: desc || name });
  }
  return { rows, err: rows.length ? null : "Geen herkenbare transacties." };
}

// ── inlezen: Rabobank-export is Latin-1, niet UTF-8 ──
const text = fs.readFileSync(path.resolve(csvPath), "latin1");
const { rows, err } = parseCSV(text);
if (err) { console.error(err); process.exit(1); }

const incoming = [], outgoing = [], unmatchedIncoming = [], uncategorized = [];
for (const row of rows) {
  if (row.amt > 0) {
    const m = matchMember(row.name, members);
    if (m) incoming.push({ ...row, member: m.short });
    else unmatchedIncoming.push(row);
  } else if (row.amt < 0) {
    const cat = guessCat(row.desc);
    const item = { ...row, amt: Math.abs(row.amt), cat };
    outgoing.push(item);
    if (!cat) uncategorized.push(item);
  }
}

console.log(`\n=== ${rows.length} transacties gevonden (${incoming.length + unmatchedIncoming.length} inkomend, ${outgoing.length} uitgaand) ===\n`);

console.log(`--- Inkomend, gematcht aan een lid (${incoming.length}) ---`);
const perMember = {};
for (const r of incoming) perMember[r.member] = (perMember[r.member] || 0) + r.amt;
for (const [naam, tot] of Object.entries(perMember).sort()) console.log(`  ${naam.padEnd(12)} totaal € ${tot.toFixed(2)}`);

console.log(`\n--- Inkomend, NIET gematcht aan een lid (${unmatchedIncoming.length}) — deze moeten we los beoordelen ---`);
for (const r of unmatchedIncoming) console.log(`  ${r.date}  € ${r.amt.toFixed(2).padStart(9)}  "${r.name}" — ${r.desc}`);

console.log(`\n--- Uitgaand, per gok-categorie ---`);
const perCat = {};
for (const r of outgoing) { const k = r.cat || "(geen categorie)"; perCat[k] = (perCat[k] || 0) + r.amt; }
for (const [cat, tot] of Object.entries(perCat).sort()) console.log(`  ${cat.padEnd(20)} totaal € ${tot.toFixed(2)}`);

console.log(`\n--- Uitgaand, ZONDER herkende categorie (${uncategorized.length}) — deze moeten we los beoordelen ---`);
for (const r of uncategorized) console.log(`  ${r.date}  € ${r.amt.toFixed(2).padStart(9)}  "${r.name}" — ${r.desc}`);
