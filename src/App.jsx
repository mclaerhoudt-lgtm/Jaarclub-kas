import { useState, useEffect, useRef, useMemo, Component } from "react";
import { loadAll, saveAll } from "./lib/db";
import { supabase } from "./lib/supabase";

// Startdata uit jullie eigen spreadsheet (apr 2026)
const SEED = {"groupName":"Jaarclub kas","iban":"NL45RABO0386282927","beheerders":"Thomas Wit & Jasper Rutten","members":[{"id":"m0","name":"Julian (Cosmo) Adang","short":"Cosmo","type":"fulltime","rate":270,"color":"#b5532a","saved":200.0,"target":3000},{"id":"m1","name":"Cas Marseille","short":"Cas","type":"fulltime","rate":270,"color":"#c8841a","saved":150.0,"target":3000},{"id":"m2","name":"Casper van Aarem","short":"Casper","type":"fulltime","rate":270,"color":"#2c3e63","saved":50.0,"target":3000},{"id":"m3","name":"Clovis Kien","short":"Clovis","type":"fulltime","rate":270,"color":"#5f7d34","saved":0.0,"target":3000},{"id":"m4","name":"Floris ter Linden","short":"Floris","type":"parttime","rate":220,"color":"#9c6b3f","saved":100.0,"target":3000},{"id":"m5","name":"Jasper Rutten","short":"Jasper","type":"parttime+sparen","rate":210,"color":"#7a4a2e","saved":350.0,"target":3000},{"id":"m6","name":"Julian van Dealen","short":"Julian vD","type":"fulltime","rate":270,"color":"#a8852c","saved":50.0,"target":3000},{"id":"m7","name":"Mats van Geest","short":"Mats","type":"fulltime","rate":270,"color":"#3a5a7a","saved":0.0,"target":3000},{"id":"m8","name":"Max Claerhoudt","short":"Max","type":"fulltime+sparen","rate":320,"color":"#6e7d3a","saved":300.0,"target":3000},{"id":"m9","name":"Olaf van den Boom","short":"Olaf","type":"fulltime","rate":270,"color":"#8a5a3a","saved":50.0,"target":3000},{"id":"m10","name":"Pepijn de Groen","short":"Pepijn","type":"fulltime","rate":270,"color":"#bf7a35","saved":0.0,"target":3000},{"id":"m11","name":"Sam van Luipen","short":"Sam","type":"fulltime","rate":270,"color":"#445f86","saved":50.0,"target":3000},{"id":"m12","name":"Siebrand van Dellen","short":"Siebrand","type":"fulltime","rate":270,"color":"#7d6332","saved":0.0,"target":3000},{"id":"m13","name":"Thomas Wit","short":"Thomas","type":"fulltime","rate":270,"color":"#5a7340","saved":50.0,"target":3000},{"id":"m14","name":"Tijl Zwart","short":"Tijl Z","type":"fulltime","rate":270,"color":"#a05a35","saved":0.0,"target":3000},{"id":"m15","name":"Tom Schapers","short":"Tom","type":"fulltime","rate":270,"color":"#4a6378","saved":0.0,"target":3000}],"months":["2025-11","2025-12","2026-01","2026-02","2026-03","2026-04","2026-05","2026-06"],"ledger":{"m0|2025-11":{"req":270.0,"paid":true,"date":"2025-11-24"},"m0|2025-12":{"req":270.0,"paid":true,"date":"2025-12-22"},"m0|2026-01":{"req":270.0,"paid":true,"date":"2026-01-25"},"m0|2026-02":{"req":220.0,"paid":true,"date":"2026-02-24"},"m0|2026-03":{"req":270.0,"paid":true,"date":"2026-03-24"},"m0|2026-04":{"req":270.0,"paid":true,"date":"2026-04-24"},"m0|2026-05":{"req":220.0,"paid":true,"date":"2026-05-26"},"m0|2026-06":{"req":null,"paid":false},"m1|2025-11":{"req":115.0,"paid":true,"date":"2025-12-01"},"m1|2025-12":{"req":115.0,"paid":true,"date":"2025-12-29"},"m1|2026-01":{"req":115.0,"paid":true,"date":"2026-02-24"},"m1|2026-02":{"req":270.0,"paid":true,"date":"2026-02-24"},"m1|2026-03":{"req":270.0,"paid":true,"date":"2026-04-26"},"m1|2026-04":{"req":270.0,"paid":true,"date":"2026-05-23"},"m1|2026-05":{"req":270.0,"paid":false},"m1|2026-06":{"req":null,"paid":false},"m2|2025-11":{"req":100.0,"paid":true,"date":"2025-11-24"},"m2|2025-12":{"req":270.0,"paid":true,"date":"2025-01-06"},"m2|2026-01":{"req":270.0,"paid":true,"date":"2026-02-24"},"m2|2026-02":{"req":270.0,"paid":true,"date":"2026-03-25"},"m2|2026-03":{"req":270.0,"paid":true,"date":"2026-04-24"},"m2|2026-04":{"req":270.0,"paid":true,"date":"2026-05-05"},"m2|2026-05":{"req":270.0,"paid":true,"date":"2026-06-03"},"m2|2026-06":{"req":null,"paid":false},"m3|2025-11":{"req":270.0,"paid":true,"date":"2025-12-02"},"m3|2025-12":{"req":270.0,"paid":true},"m3|2026-01":{"req":540.0,"paid":true},"m3|2026-02":{"req":270.0,"paid":true,"date":"2026-03-03"},"m3|2026-03":{"req":270.0,"paid":false},"m3|2026-04":{"req":540.0,"paid":true,"date":"2026-05-05"},"m3|2026-05":{"req":270.0,"paid":false},"m3|2026-06":{"req":null,"paid":false},"m4|2025-11":{"req":345.0,"paid":true,"date":"2025-12-08"},"m4|2025-12":{"req":115.0,"paid":true,"date":"2026-01-14"},"m4|2026-01":{"req":270.0,"paid":true,"date":"2026-02-27"},"m4|2026-02":{"req":220.0,"paid":false},"m4|2026-03":{"req":440.0,"paid":false},"m4|2026-04":{"req":660.0,"paid":true,"date":"2026-04-23"},"m4|2026-05":{"req":220.0,"paid":false},"m4|2026-06":{"req":null,"paid":false},"m5|2025-11":{"req":178.0,"paid":true,"date":"2025-11-24"},"m5|2025-12":{"req":null,"paid":true,"date":"2025-11-24"},"m5|2026-01":{"req":210.0,"paid":true,"date":"2026-01-26"},"m5|2026-02":{"req":210.0,"paid":true,"date":"2026-02-25"},"m5|2026-03":{"req":210.0,"paid":true,"date":"2026-03-25"},"m5|2026-04":{"req":210.0,"paid":true,"date":"2026-04-27"},"m5|2026-05":{"req":210.0,"paid":true,"date":"2026-05-25"},"m5|2026-06":{"req":null,"paid":false},"m6|2025-11":{"req":320.0,"paid":true,"date":"2025-11-24"},"m6|2025-12":{"req":270.0,"paid":false},"m6|2026-01":{"req":540.0,"paid":true,"date":"2026-02-18"},"m6|2026-02":{"req":270.0,"paid":true,"date":"2026-04-30"},"m6|2026-03":{"req":270.0,"paid":true,"date":"2026-05-04"},"m6|2026-04":{"req":270.0,"paid":true,"date":"2026-05-05"},"m6|2026-05":{"req":270.0,"paid":true,"date":"2026-06-08"},"m6|2026-06":{"req":null,"paid":false},"m7|2025-11":{"req":270.0,"paid":true,"date":"2025-11-24"},"m7|2025-12":{"req":270.0,"paid":true,"date":"2026-01-06"},"m7|2026-01":{"req":270.0,"paid":true,"date":"2026-01-26"},"m7|2026-02":{"req":270.0,"paid":true,"date":"2026-02-25"},"m7|2026-03":{"req":270.0,"paid":true,"date":"2026-03-25"},"m7|2026-04":{"req":270.0,"paid":true,"date":"2026-05-23"},"m7|2026-05":{"req":270.0,"paid":false},"m7|2026-06":{"req":null,"paid":false},"m8|2025-11":{"req":320.0,"paid":true,"date":"2025-11-24"},"m8|2025-12":{"req":320.0,"paid":true,"date":"2026-01-05"},"m8|2026-01":{"req":320.0,"paid":true,"date":"2026-02-07"},"m8|2026-02":{"req":320.0,"paid":true,"date":"2026-03-06"},"m8|2026-03":{"req":270.0,"paid":true,"date":"2026-04-07"},"m8|2026-04":{"req":320.0,"paid":true,"date":"2026-05-05"},"m8|2026-05":{"req":320.0,"paid":true,"date":"2026-06-06"},"m8|2026-06":{"req":null,"paid":false},"m9|2025-11":{"req":50.0,"paid":false},"m9|2025-12":{"req":270.0,"paid":false},"m9|2026-01":{"req":270.0,"paid":false},"m9|2026-02":{"req":860.0,"paid":false},"m9|2026-03":{"req":860.0,"paid":false},"m9|2026-04":{"req":1030.0,"paid":false},"m9|2026-05":{"req":980.0,"paid":true},"m9|2026-06":{"req":null,"paid":false},"m10|2025-11":{"req":270.0,"paid":true,"date":"2025-11-28"},"m10|2025-12":{"req":270.0,"paid":true,"date":"2026-01-21"},"m10|2026-01":{"req":270.0,"paid":true,"date":"2026-03-04"},"m10|2026-02":{"req":270.0,"paid":false},"m10|2026-03":{"req":540.0,"paid":true,"date":"2026-05-04"},"m10|2026-04":{"req":270.0,"paid":true,"date":"2026-06-08"},"m10|2026-05":{"req":270.0,"paid":false},"m10|2026-06":{"req":null,"paid":false},"m11|2025-11":{"req":270.0,"paid":true,"date":"2025-11-24"},"m11|2025-12":{"req":270.0,"paid":true,"date":"2025-12-28"},"m11|2026-01":{"req":270.0,"paid":true,"date":"2026-01-26"},"m11|2026-02":{"req":null,"paid":false},"m11|2026-03":{"req":null,"paid":false},"m11|2026-04":{"req":165.0,"paid":true,"date":"2026-04-28"},"m11|2026-05":{"req":115.0,"paid":true,"date":"2026-05-27"},"m11|2026-06":{"req":null,"paid":false},"m12|2025-11":{"req":370.0,"paid":true,"date":"2025-11-27"},"m12|2025-12":{"req":200.0,"paid":false},"m12|2026-01":{"req":470.0,"paid":false},"m12|2026-02":{"req":740.0,"paid":false},"m12|2026-03":{"req":1010.0,"paid":false},"m12|2026-04":{"req":960.0,"paid":false},"m12|2026-05":{"req":1230.0,"paid":false},"m12|2026-06":{"req":null,"paid":false},"m13|2025-11":{"req":100.0,"paid":true,"date":"2025-11-24"},"m13|2025-12":{"req":270.0,"paid":true,"date":"2025-12-29"},"m13|2026-01":{"req":270.0,"paid":true,"date":"2026-03-19"},"m13|2026-02":{"req":270.0,"paid":true,"date":"2026-03-19"},"m13|2026-03":{"req":270.0,"paid":false},"m13|2026-04":{"req":540.0,"paid":true,"date":"2026-05-08"},"m13|2026-05":{"req":270.0,"paid":false},"m13|2026-06":{"req":null,"paid":false},"m14|2025-11":{"req":270.0,"paid":true,"date":"2025-11-24"},"m14|2025-12":{"req":270.0,"paid":true,"date":"2025-12-23"},"m14|2026-01":{"req":270.0,"paid":true,"date":"2026-01-26"},"m14|2026-02":{"req":270.0,"paid":true,"date":"2026-03-24"},"m14|2026-03":{"req":245.0,"paid":true,"date":"2026-03-25"},"m14|2026-04":{"req":245.0,"paid":true,"date":"2026-04-25"},"m14|2026-05":{"req":245.0,"paid":true,"date":"2026-05-26"},"m14|2026-06":{"req":null,"paid":false},"m15|2025-11":{"req":270.0,"paid":true,"date":"2025-10-28"},"m15|2025-12":{"req":270.0,"paid":true,"date":"2025-12-22"},"m15|2026-01":{"req":270.0,"paid":true,"date":"2026-01-23"},"m15|2026-02":{"req":null,"paid":false},"m15|2026-03":{"req":540.0,"paid":true,"date":"2026-03-24"},"m15|2026-04":{"req":270.0,"paid":true,"date":"2026-05-03"},"m15|2026-05":{"req":270.0,"paid":true,"date":"2026-05-22"},"m15|2026-06":{"req":null,"paid":false}},"expenses":[{"month":"2025-11","desc":"Borrels november","amount":684.17,"cat":"Borrels & dixo's","id":"e0"},{"month":"2025-11","desc":"Dixo's november","amount":421,"cat":"Borrels & dixo's","id":"e1"},{"month":"2025-12","desc":"Borrels december","amount":1183.51,"cat":"Borrels & dixo's","id":"e2"},{"month":"2025-12","desc":"Herenakkoord","amount":562.89,"cat":"Activiteit","id":"e3"},{"month":"2026-01","desc":"Borrels januari","amount":995.87,"cat":"Borrels & dixo's","id":"e4"},{"month":"2026-02","desc":"Borrels februari","amount":844.05,"cat":"Borrels & dixo's","id":"e5"},{"month":"2026-02","desc":"AHC voorrondes","amount":29.4,"cat":"Activiteit","id":"e6"},{"month":"2026-03","desc":"Borrels maart","amount":1141.51,"cat":"Borrels & dixo's","id":"e7"},{"month":"2026-03","desc":"LAN dixo 26-3","amount":303.79,"cat":"Borrels & dixo's","id":"e8"},{"month":"2026-04","desc":"Borrels april","amount":1942.15,"cat":"Borrels & dixo's","id":"e9"},{"month":"2026-04","desc":"Datediner","amount":668,"cat":"Activiteit","id":"e10"},{"month":"2026-04","desc":"Kleding","amount":450,"cat":"Overig","id":"e11"},{"month":"2026-05","desc":"Borrels mei","amount":1709.58,"cat":"Borrels & dixo's","id":"e12"},{"month":"2026-05","desc":"N8W8 (netto)","amount":500,"cat":"Activiteit","id":"e13"},{"month":"2026-05","desc":"Clubvakantie sparen","amount":375,"cat":"Sparen","id":"e14"}],"income":{"2025-11":4233,"2025-12":2928,"2026-01":4155,"2026-02":2640,"2026-03":2075},"accounts":{"betaalrekening":2762,"spaarrekeningVakantie":1925,"lustrum":1350,"tegoedVereniging":1000},"debts":[],"lustrumTarget":3000,"categories":[{"name":"Borrels & dixo's","color":"#b5532a"},{"name":"Activiteit","color":"#2c3e63"},{"name":"Sparen","color":"#5f7d34"},{"name":"Overig","color":"#6b5436"}],"forecast":{"startMonth":"2026-07","horizon":8,"startSaldoOverride":null,"startSchuld":0,"avgMonths":6,"inclSchuld":false,"override":null,"betalersOverride":null,"oneOffs":[],"buckets":[{"id":"b1","name":"Naar vereniging","cat":"Borrels & dixo's","startMaand":"2026-07","eindMaand":"2027-02","totaalBedrag":10800,"enabled":true},{"id":"b2","name":"Activiteiten","cat":"Activiteit","startMaand":"2026-07","eindMaand":"2027-02","totaalBedrag":2400,"enabled":true},{"id":"b3","name":"Clubvakantie — boeking","cat":"Sparen","startMaand":"2026-07","eindMaand":"2027-02","totaalBedrag":5600,"enabled":true,"isBoekingPot":true},{"id":"b5","name":"Clubvakantie — activiteiten","cat":"Sparen","startMaand":"2026-07","eindMaand":"2027-02","totaalBedrag":1600,"enabled":true,"isActiviteitenPot":true},{"id":"b4","name":"Buffer/overig","cat":"Overig","startMaand":"2026-07","eindMaand":"2027-02","totaalBedrag":600,"enabled":true,"isBuffer":true}],"vakantie":{"boeking":{"startPot":0,"betalingen":[{"id":"p1","maand":"2026-09","bedrag":3000,"label":"Aanbetaling"},{"id":"p2","maand":"2027-02","bedrag":5000,"label":"Restbetaling"}]},"activiteiten":{"startPot":1925,"vakantiemaand":"2026-07","verwachtBedrag":2400}}},"pmPin":"1865","lastUpdated":"2026-06-17","lastUpdatedBy":"penningmeester"}
;

// ───────────── storage ─────────────
// Vervangen door Supabase (src/lib/db.js: loadAll/saveAll). SEED + de migratiefuncties
// hieronder blijven staan t.b.v. het eenmalige migratiescript (stap 5) en zijn niet
// meer onderdeel van het live laad-/opslagpad van de app.

// Eenmalige migratie: betaaldata uit "Betaal spreadsheet (1).xlsx" (bron van de huidige ledger),
// gevuld voor alle reeds bestaande betalingen die nog geen datum hadden — vult alleen lege gaten, overschrijft nooit.
const HISTORICAL_DATES={"m0|2025-11":"2025-11-24","m0|2025-12":"2025-12-22","m0|2026-01":"2026-01-25","m0|2026-02":"2026-02-24","m0|2026-03":"2026-03-24","m0|2026-04":"2026-04-24","m0|2026-05":"2026-05-26","m1|2025-11":"2025-12-01","m1|2025-12":"2025-12-29","m1|2026-01":"2026-02-24","m1|2026-02":"2026-02-24","m1|2026-03":"2026-04-26","m1|2026-04":"2026-05-23","m2|2025-11":"2025-11-24","m2|2025-12":"2025-01-06","m2|2026-01":"2026-02-24","m2|2026-02":"2026-03-25","m2|2026-03":"2026-04-24","m2|2026-04":"2026-05-05","m2|2026-05":"2026-06-03","m3|2025-11":"2025-12-02","m3|2026-02":"2026-03-03","m3|2026-04":"2026-05-05","m4|2025-11":"2025-12-08","m4|2025-12":"2026-01-14","m4|2026-01":"2026-02-27","m4|2026-04":"2026-04-23","m5|2025-11":"2025-11-24","m5|2025-12":"2025-11-24","m5|2026-01":"2026-01-26","m5|2026-02":"2026-02-25","m5|2026-03":"2026-03-25","m5|2026-04":"2026-04-27","m5|2026-05":"2026-05-25","m6|2025-11":"2025-11-24","m6|2026-01":"2026-02-18","m6|2026-02":"2026-04-30","m6|2026-03":"2026-05-04","m6|2026-04":"2026-05-05","m6|2026-05":"2026-06-08","m7|2025-11":"2025-11-24","m7|2025-12":"2026-01-06","m7|2026-01":"2026-01-26","m7|2026-02":"2026-02-25","m7|2026-03":"2026-03-25","m7|2026-04":"2026-05-23","m8|2025-11":"2025-11-24","m8|2025-12":"2026-01-05","m8|2026-01":"2026-02-07","m8|2026-02":"2026-03-06","m8|2026-03":"2026-04-07","m8|2026-04":"2026-05-05","m8|2026-05":"2026-06-06","m10|2025-11":"2025-11-28","m10|2025-12":"2026-01-21","m10|2026-01":"2026-03-04","m10|2026-03":"2026-05-04","m10|2026-04":"2026-06-08","m11|2025-11":"2025-11-24","m11|2025-12":"2025-12-28","m11|2026-01":"2026-01-26","m11|2026-04":"2026-04-28","m11|2026-05":"2026-05-27","m12|2025-11":"2025-11-27","m13|2025-11":"2025-11-24","m13|2025-12":"2025-12-29","m13|2026-01":"2026-03-19","m13|2026-02":"2026-03-19","m13|2026-04":"2026-05-08","m14|2025-11":"2025-11-24","m14|2025-12":"2025-12-23","m14|2026-01":"2026-01-26","m14|2026-02":"2026-03-24","m14|2026-03":"2026-03-25","m14|2026-04":"2026-04-25","m14|2026-05":"2026-05-26","m15|2025-11":"2025-10-28","m15|2025-12":"2025-12-22","m15|2026-01":"2026-01-23","m15|2026-03":"2026-03-24","m15|2026-04":"2026-05-03","m15|2026-05":"2026-05-22"};
function backfillHistoricalDates(data){
  for(const key in HISTORICAL_DATES){
    const e=data.ledger[key];
    if(e&&e.paid&&!e.date) e.date=HISTORICAL_DATES[key];
  }
  return data;
}

// Eenmalige migratie: "Borrel" en "Dixo" samenvoegen tot één categorie "Borrels & dixo's".
function mergeBorrelDixo(data){
  const MERGED="Borrels & dixo's";
  (data.expenses||[]).forEach(e=>{if(e.cat==="Borrel"||e.cat==="Dixo")e.cat=MERGED;});
  data.categories=(data.categories||[]).filter(c=>c.name!=="Borrel"&&c.name!=="Dixo");
  if(!data.categories.some(c=>c.name===MERGED)) data.categories.unshift({name:MERGED,color:"#b5532a"});
  return data;
}

// Eenmalige migratie: prognose-buckets (begin-/eindmaand + totaalbedrag) + clubvakantie-cyclus met twee aparte
// potjes (boeking & activiteiten) die vanaf de startmaand elke maand vollopen — geen sparen-vanaf/tot-vensters meer.
function migrateForecast(data){
  const f=data.forecast;
  const oldSinglePot=(f.buckets||[]).find(b=>b.isVakantiePot);
  const horizonStart=f.startMonth,horizonEind=addMonth(f.startMonth,Math.max(1,f.horizon)-1);
  if(!f.buckets||!f.buckets.length){
    f.buckets=[
      {id:"b1",name:"Naar vereniging",cat:"Borrels & dixo's",startMaand:horizonStart,eindMaand:horizonEind,totaalBedrag:10800,enabled:true},
      {id:"b2",name:"Activiteiten",cat:"Activiteit",startMaand:horizonStart,eindMaand:horizonEind,totaalBedrag:2400,enabled:true},
      {id:"b3",name:"Clubvakantie — boeking",cat:"Sparen",startMaand:horizonStart,eindMaand:horizonEind,totaalBedrag:5600,enabled:true,isBoekingPot:true},
      {id:"b5",name:"Clubvakantie — activiteiten",cat:"Sparen",startMaand:horizonStart,eindMaand:horizonEind,totaalBedrag:1600,enabled:true,isActiviteitenPot:true},
      {id:"b4",name:"Buffer/overig",cat:"Overig",startMaand:horizonStart,eindMaand:horizonEind,totaalBedrag:600,enabled:true,isBuffer:true},
    ];
  } else if(!f.bucketsPP){
    // bestaande buckets waren clubtotalen per maand; omzetten naar bedrag per persoon (zelfde werkelijke geldstroom)
    const gemBet=Math.max(1,avgPayers(data,f.avgMonths));
    f.buckets.forEach(b=>{b.amount=Math.round((b.amount/gemBet)*10)/10;});
    if(!f.buckets.some(b=>b.isBoekingPot)){
      f.buckets.push({id:"b3",name:"Clubvakantie — boeking",cat:"Sparen",amount:60,enabled:true,isBoekingPot:true});
      f.buckets.push({id:"b5",name:"Clubvakantie — activiteiten",cat:"Sparen",amount:oldSinglePot?Math.round((oldSinglePot.amount/gemBet)*10)/10:20,enabled:true,isActiviteitenPot:true});
    }
  }
  f.bucketsPP=true;
  // buffer/overig blijft in de kas i.p.v. eruit te gaan als uitgave — markeer 'm zo als dat nog niet zo is
  f.buckets.forEach(b=>{if(b.name==="Buffer/overig"&&!b.isBoekingPot&&!b.isActiviteitenPot)b.isBuffer=true;});
  if(!f.bucketsRange){
    // bestaande buckets hadden een vast bedrag per persoon per maand, geldig over de hele horizon;
    // omzetten naar begin-/eindmaand (= horizon) + totaalbedrag (= pp-bedrag × gem. betalers × aantal maanden)
    const gemBet=Math.max(1,avgPayers(data,f.avgMonths));
    const aantalMaanden=monthsBetween(horizonStart,horizonEind);
    f.buckets.forEach(b=>{
      if(b.startMaand&&b.eindMaand&&b.totaalBedrag!=null)return;
      b.startMaand=horizonStart;b.eindMaand=horizonEind;
      b.totaalBedrag=Math.round((b.amount||0)*gemBet*aantalMaanden);
      delete b.amount;
    });
  }
  f.bucketsRange=true;
  delete f.maandSparen;

  if(!f.vakantie||!f.vakantie.boeking||f.vakantie.boeking.spaarStart!==undefined){
    const oldV=f.vakantie||{};const oldB=oldV.boeking||{};const oldA=oldV.activiteiten||{};
    f.vakantie={
      boeking:{
        startPot:oldB.startPot||0,
        betalingen:(oldB.betalingen&&oldB.betalingen.length)?oldB.betalingen
          :(oldV.boekingsmaand?[{id:"p1",maand:oldV.boekingsmaand,bedrag:oldV.boekingsbedrag||0,label:"Boeking"}]
          :[{id:"p1",maand:addMonth(f.startMonth,2),bedrag:3000,label:"Aanbetaling"},{id:"p2",maand:addMonth(f.startMonth,7),bedrag:5000,label:"Restbetaling"}]),
      },
      activiteiten:{
        startPot:oldA.startPot??oldV.startPot??(data.accounts?.spaarrekeningVakantie??0),
        vakantiemaand:oldA.vakantiemaand||oldV.vakantiemaand||f.startMonth,
        verwachtBedrag:oldA.verwachtBedrag||2400,
      },
    };
  }
  f.oneOffs=(f.oneOffs||[]).filter(o=>o.id!=="o1");
  if(f.betalersOverride===undefined)f.betalersOverride=null;
  // startsaldo van de prognose volgt vanaf nu het echte rekeningsaldo i.p.v. een los, vast getal
  if(f.startSaldoOverride===undefined){f.startSaldoOverride=null;delete f.startSaldo;}
  return data;
}

// ───────────── helpers ─────────────
const MFULL=["januari","februari","maart","april","mei","juni","juli","augustus","september","oktober","november","december"];
const MSHORT=["jan","feb","mrt","apr","mei","jun","jul","aug","sep","okt","nov","dec"];
const eur=(n)=>"€ "+(Math.round((n||0)*100)/100).toLocaleString("nl-NL",{minimumFractionDigits:0,maximumFractionDigits:2});
const eur0=(n)=>"€ "+Math.round(n||0).toLocaleString("nl-NL");
function mLabel(k,full=false){const[y,m]=k.split("-").map(Number);return (full?MFULL:MSHORT)[m-1]+" "+(full?y:"'"+String(y).slice(2));}
function addMonth(k,n){let[y,m]=k.split("-").map(Number);m+=n;while(m>12){m-=12;y++;}while(m<1){m+=12;y--;}return `${y}-${String(m).padStart(2,"0")}`;}
function dmy(iso){if(!iso)return "—";const[y,m,dd]=iso.split("-").map(Number);return `${dd} ${MSHORT[m-1]} ${y}`;}
function dmShort(iso){if(!iso)return "";const[,m,dd]=iso.split("-").map(Number);return `${dd}-${m}`;}
const NOW=(()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;})();
const TODAY=new Date().toISOString().slice(0,10);

function cellReq(data,mid,month){const e=data.ledger[`${mid}|${month}`];if(e&&e.req!=null)return e.req;const m=data.members.find(x=>x.id===mid);return m?m.rate:0;}
function isPaid(data,mid,month){const e=data.ledger[`${mid}|${month}`];return !!(e&&e.paid);}
function hasEntry(data,mid,month){const e=data.ledger[`${mid}|${month}`];return !!e&&(e.paid||e.req!=null);}
function arrears(data,mid){const months=data.months;for(let i=months.length-1;i>=0;i--){const e=data.ledger[`${mid}|${months[i]}`];if(e&&(e.req!=null||e.paid)){if(e.paid)return 0;return e.req!=null?e.req:(data.members.find(m=>m.id===mid)?.rate||0);}}return 0;}
function catColor(data,name){const c=(data.categories||[]).find(x=>x.name===name);return c?c.color:"#6b5436";}
function monthIncome(data,mo){return data.income[mo]!=null?data.income[mo]:data.members.reduce((a,m)=>a+(isPaid(data,m.id,mo)?cellReq(data,m.id,mo):0),0);}
function monthExpense(data,mo,exclSparen=false){return data.expenses.filter(e=>e.month===mo&&(!exclSparen||e.cat!=="Sparen")).reduce((a,e)=>a+e.amount,0);}

// gemiddelden voor prognose
function histMonths(data,n){const set=new Set();data.expenses.forEach(e=>set.add(e.month));data.months.forEach(mo=>{if(data.members.some(m=>isPaid(data,m.id,mo)))set.add(mo);});return [...set].sort().slice(-n);}
function avgExpense(data,n){const ms=histMonths(data,n);if(!ms.length)return 0;return Math.round(ms.reduce((a,mo)=>a+monthExpense(data,mo,true),0)/ms.length);}
function avgPayers(data,n){const ms=histMonths(data,n);if(!ms.length)return data.members.length;return Math.round((ms.reduce((a,mo)=>a+data.members.filter(m=>isPaid(data,m.id,mo)).length,0)/ms.length)*10)/10;}
function avgIncome(data,n){const ms=histMonths(data,n);if(!ms.length)return 0;return Math.round(ms.reduce((a,mo)=>a+monthIncome(data,mo),0)/ms.length);}
function avgExpenseByCat(data,n,cat){const ms=histMonths(data,n);if(!ms.length)return 0;return Math.round(ms.reduce((a,mo)=>a+data.expenses.filter(e=>e.month===mo&&e.cat===cat).reduce((s,e)=>s+e.amount,0),0)/ms.length);}
function monthsBetween(a,b){if(!a||!b)return 0;const[ay,am]=a.split("-").map(Number);const[by,bm]=b.split("-").map(Number);return Math.max(1,(by-ay)*12+(bm-am)+1);}
function bucketMonthlyTotal(b){return b.startMaand&&b.eindMaand?(b.totaalBedrag||0)/monthsBetween(b.startMaand,b.eindMaand):0;}
function bucketActiveIn(b,mo){return !!(b.startMaand&&b.eindMaand&&mo>=b.startMaand&&mo<=b.eindMaand);}

// ───────────── error boundary ─────────────
class EB extends Component{ constructor(p){super(p);this.state={err:null};} static getDerivedStateFromError(e){return{err:e};}
  render(){ if(this.state.err) return <div className="jc-card" style={{margin:"4px 0"}}><b className="clay">Er ging iets mis bij het tonen.</b><pre style={{whiteSpace:"pre-wrap",fontSize:11,color:"#6b5436"}}>{String(this.state.err.message||this.state.err)}</pre></div>; return this.props.children; } }

// ───────────── app ─────────────
export default function App(){
  const [session,setSession]=useState(undefined);
  const [profile,setProfile]=useState(null);
  const [data,setData]=useState(null);
  const [loadError,setLoadError]=useState(null);
  const [tab,setTab]=useState("overzicht");
  const [loginOpen,setLoginOpen]=useState(false);
  const loaded=useRef(false);
  const [saving,setSaving]=useState(false);
  const edit=profile?.role==="penningmeester";

  // Lezen is publiek (geen account nodig) — alleen schrijven vereist een login met de rol penningmeester.
  useEffect(()=>{(async()=>{
    try{ const n=await loadAll(); setData(n); loaded.current=true; }
    catch(e){ setLoadError(e.message||String(e)); }
  })();},[]);

  useEffect(()=>{
    supabase.auth.getSession().then(({data:{session}})=>setSession(session));
    const {data:sub}=supabase.auth.onAuthStateChange((_event,s)=>setSession(s));
    return ()=>sub.subscription.unsubscribe();
  },[]);

  useEffect(()=>{
    if(!session){ setProfile(null); return; }
    (async()=>{
      const {data:p,error}=await supabase.from("profiles").select("*").eq("id",session.user.id).single();
      if(!error) setProfile(p);
    })();
  },[session]);

  useEffect(()=>{if(!loaded.current||!data)return;setSaving(true);const t=setTimeout(async()=>{
    try{ await saveAll(data); } catch(e){ console.error("Opslaan naar Supabase mislukt:",e); }
    setSaving(false);
  },400);return()=>clearTimeout(t);},[data]);

  const update=(fn)=>{ if(!edit)return; setData(prev=>{const n=structuredClone(prev);fn(n);n.lastUpdated=TODAY;return n;}); };

  if(loadError) return <div style={{padding:40,fontFamily:"Inter,sans-serif",color:"#b5532a"}}>Kon de kas niet laden: {loadError}</div>;
  if(!data) return <div style={{padding:40,fontFamily:"Inter,sans-serif",color:"#6b5436"}}>Kas laden…</div>;

  const TABS=[["overzicht","Overzicht"],["betalingen","Betalingen"],["achterstand","Achterstanden"],["uitgaves","Uitgaves"],["lustrum","Lustrum"],["prognose","Prognose"]];
  if(edit) TABS.push(["beheer","Beheer"]);

  return (
    <div className="jc-root">
      <Header data={data} saving={saving} edit={edit} loggedIn={!!session} onLoginClick={()=>setLoginOpen(true)} onLogout={()=>supabase.auth.signOut()}/>
      <div className="jc-bogolan"/>
      <nav className="jc-tabs">{TABS.map(([k,l])=><button key={k} className={"jc-tab"+(tab===k?" on":"")} onClick={()=>setTab(k)}>{l}</button>)}</nav>
      <main className="jc-main"><EB key={tab}>
        {tab==="overzicht"  && <Overzicht data={data} go={setTab}/>}
        {tab==="betalingen" && <Betalingen data={data} update={update} edit={edit}/>}
        {tab==="achterstand"&& <Achterstand data={data}/>}
        {tab==="uitgaves"   && <Uitgaves data={data} update={update} edit={edit}/>}
        {tab==="lustrum"    && <Lustrum data={data} update={update} edit={edit}/>}
        {tab==="prognose"   && <Prognose data={data} update={update} edit={edit}/>}
        {tab==="beheer" && edit && <Beheer data={data} update={update} setData={setData}/>}
      </EB></main>
      <footer className="jc-foot">Gedeelde kas · iedereen met deze app ziet dezelfde gegevens · {data.iban}</footer>
      {loginOpen && <LoginModal onClose={()=>setLoginOpen(false)}/>}
    </div>
  );
}

function LoginModal({onClose}){
  const [mode,setMode]=useState("login");
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [name,setName]=useState("");
  const [err,setErr]=useState(null);
  const [info,setInfo]=useState(null);
  const [busy,setBusy]=useState(false);
  const submit=async(e)=>{
    e.preventDefault();setErr(null);setInfo(null);setBusy(true);
    try{
      if(mode==="login"){
        const {error}=await supabase.auth.signInWithPassword({email,password});
        if(error)throw error;
        onClose();
      }else{
        const {error}=await supabase.auth.signUp({email,password,options:{data:{display_name:name}}});
        if(error)throw error;
        setInfo("Account aangemaakt. Check je mail als er een bevestiging nodig is, of je bent al ingelogd.");
      }
    }catch(e){ setErr(e.message||String(e)); }
    setBusy(false);
  };
  return (<div className="jc-overlay" onClick={onClose}><form className="jc-pin" onClick={e=>e.stopPropagation()} onSubmit={submit}>
      <div className="jc-pintitle">Penningmeester-login</div>
      <p className="jc-pinsub">{mode==="login"?"Log in om de kas te kunnen bewerken.":"Maak een account aan (vraag de huidige penningmeester om je daarna de rol te geven)."}</p>
      {mode==="signup"&&<input className="jc-pinin" style={{fontSize:14,letterSpacing:0,marginBottom:8,textAlign:"left"}} placeholder="Naam" value={name} onChange={e=>setName(e.target.value)}/>}
      <input className="jc-pinin" style={{fontSize:14,letterSpacing:0,marginBottom:8,textAlign:"left"}} type="email" placeholder="E-mail" autoComplete="email" required value={email} onChange={e=>setEmail(e.target.value)}/>
      <input className="jc-pinin" style={{fontSize:14,letterSpacing:0,textAlign:"left"}} type="password" placeholder="Wachtwoord" autoComplete={mode==="login"?"current-password":"new-password"} required minLength={6} value={password} onChange={e=>setPassword(e.target.value)}/>
      {err && <span className="jc-pinerr">{err}</span>}
      {info && <span className="jc-pinerr" style={{color:"var(--sahel)"}}>{info}</span>}
      <div className="jc-pinrow">
        <button type="button" className="jc-ghost" onClick={onClose}>annuleren</button>
        <button type="submit" className="jc-primary" disabled={busy}>{mode==="login"?"inloggen":"aanmaken"}</button>
      </div>
      <p className="jc-pinsub" style={{marginTop:10,marginBottom:0}}>
        <button type="button" className="jc-mini" onClick={()=>{setMode(mode==="login"?"signup":"login");setErr(null);setInfo(null);}}>{mode==="login"?"nog geen account? maak er een":"al een account? inloggen"}</button>
      </p>
    </form>
  </div>);
}

// ───────────── header ─────────────
function Header({data,saving,edit,loggedIn,onLoginClick,onLogout}){
  const saldo=data.accounts.betaalrekening;
  return (<header className="jc-header">
    <div className="jc-headtop"><div className="jc-brand"><span className="jc-diamond"/><div>
      <div className="jc-gname">{data.groupName}</div>
      <div className="jc-gsub">Laatst bijgewerkt {dmy(data.lastUpdated)}{data.lastUpdatedBy?` · ${data.lastUpdatedBy}`:""}</div>
    </div></div><div className="jc-headright">
      <span className={"jc-save"+(saving?" busy":"")}>{saving?"opslaan…":"opgeslagen"}</span>
      {edit
        ? <><span className="jc-rolebtn pm">● Penningmeester</span><button className="jc-rolebtn" onClick={onLogout}>Uitloggen</button></>
        : loggedIn
          ? <><span className="jc-rolebtn">Kijkmodus (ingelogd)</span><button className="jc-rolebtn" onClick={onLogout}>Uitloggen</button></>
          : <button className="jc-rolebtn" onClick={onLoginClick}>Inloggen als penningmeester</button>}
    </div></div>
    <div className="jc-balance"><div className="jc-balmain"><span className="jc-ballabel">Saldo betaalrekening</span><span className="jc-balnum">{eur0(saldo)}</span></div>
      <div className="jc-balside"><div><span className="ochre">{eur0(data.accounts.lustrum)}</span><label>lustrum spaarpot</label></div>
        <div><span className="ochre">{eur0(data.accounts.spaarrekeningVakantie)}</span><label>clubvakantie</label></div></div></div>
  </header>);
}

// ───────────── overzicht ─────────────
function Overzicht({data,go}){
  const months=data.months;const thisM=months.includes(NOW)?NOW:months[months.length-1];
  const betaald=data.members.filter(m=>isPaid(data,m.id,thisM)).length;
  const niet=data.members.filter(m=>!isPaid(data,m.id,thisM));
  const achterTot=data.members.reduce((a,m)=>a+arrears(data,m.id),0);
  const lustrumTot=data.members.reduce((a,m)=>a+(m.saved||0),0);const lustrumDoel=data.members.reduce((a,m)=>a+(m.target||0),0);
  const perMonth=months.map(mo=>({mo,uit:monthExpense(data,mo),ink:monthIncome(data,mo)}));
  const maxBar=Math.max(1,...perMonth.map(p=>Math.max(p.ink,p.uit)));
  return (<div className="jc-grid">
    <div className="jc-cards4">
      <Stat label="Betaald deze maand" value={`${betaald}/${data.members.length}`} sub={mLabel(thisM,true)} tone={betaald===data.members.length?"sahel":"ochre"} onClick={()=>go("betalingen")}/>
      <Stat label="Totaal achterstand" value={eur0(achterTot)} sub="huidige schuld leden" tone="clay" onClick={()=>go("achterstand")}/>
      <Stat label="Saldo op rekening" value={eur0(data.accounts.betaalrekening)} sub="betaalrekening" tone="sahel" onClick={()=>go("beheer")}/>
      <Stat label="Lustrum gespaard" value={eur0(lustrumTot)} sub={`van ${eur0(lustrumDoel)}`} tone="ochre" onClick={()=>go("lustrum")}/>
    </div>
    <div className="jc-card"><div className="jc-cardhead"><h3>Inkomsten vs. uitgaven</h3><span className="jc-legend"><i className="sahel"/>in <i className="clay"/>uit</span></div>
      <div className="jc-bars">{perMonth.map(p=>(<div key={p.mo} className="jc-barcol"><div className="jc-bargroup">
        <div className="jc-bar sahelb" style={{height:`${(p.ink/maxBar)*100}%`}} title={"in "+eur(p.ink)}/>
        <div className="jc-bar clayb" style={{height:`${(p.uit/maxBar)*100}%`}} title={"uit "+eur(p.uit)}/></div>
        <span className="jc-barlabel">{MSHORT[Number(p.mo.split("-")[1])-1]}</span></div>))}</div></div>
    <div className="jc-card"><div className="jc-cardhead"><h3>Nog niet betaald — {mLabel(thisM,true)}</h3><span className="jc-count">{niet.length}</span></div>
      {niet.length===0?<p className="jc-empty">Iedereen heeft deze maand betaald.</p>:<div className="jc-chiprow">{niet.map(m=>(<span key={m.id} className="jc-person"><span className="jc-av" style={{background:m.color}}>{m.short[0]}</span>{m.short}<b>{eur0(cellReq(data,m.id,thisM))}</b></span>))}</div>}</div>
  </div>);
}
function Stat({label,value,sub,tone,onClick}){return(<button className={"jc-stat "+tone} onClick={onClick} style={{cursor:onClick?"pointer":"default"}}><span className="jc-statlabel">{label}</span><span className="jc-statval">{value}</span><span className="jc-statsub">{sub}</span></button>);}

// ───────────── betalingen ─────────────
function Betalingen({data,update,edit}){
  const [sel,setSel]=useState(null);const months=data.months;
  const [confirmLeeg,setConfirmLeeg]=useState(false);
  const toggle=(mid,mo)=>{if(!edit)return;update(d=>{const k=`${mid}|${mo}`;const e=d.ledger[k]||{};const p=!e.paid;d.ledger[k]={...e,paid:p,date:p?e.date:null};});};
  const counts=months.map(mo=>data.members.filter(m=>isPaid(data,m.id,mo)).length);
  let legeCount=0;data.members.forEach(m=>months.forEach(mo=>{if(!hasEntry(data,m.id,mo))legeCount++;}));
  const vulLegeIn=()=>{update(d=>{d.members.forEach(m=>{months.forEach(mo=>{if(!hasEntry(d,m.id,mo)){const k=`${m.id}|${mo}`;d.ledger[k]={req:m.rate,paid:false};}});});});setConfirmLeeg(false);};
  return (<div className="jc-card jc-nopad">
    <div className="jc-cardhead pad"><h3>Betaaloverzicht</h3><span className="jc-hint">{edit?"tik een vakje om te wisselen · tik een naam voor details":"alleen-lezen"}</span></div>
    {edit&&<div className="jc-importfoot" style={{borderTop:"none",borderBottom:"1px solid var(--line)"}}>
      {confirmLeeg?<><span className="jc-needcat">{legeCount} lege vakje{legeCount!==1?"s":""} omzetten naar niet-betaald?</span><button className="jc-ghost" onClick={()=>setConfirmLeeg(false)}>annuleren</button><button className="jc-primary" onClick={vulLegeIn}>ja, omzetten</button></>
        :<button className="jc-addbtn ghost" onClick={()=>setConfirmLeeg(true)} disabled={legeCount===0}>Lege vakjes → niet betaald{legeCount>0?` (${legeCount})`:""}</button>}
    </div>}
    <div className="jc-gridscroll"><table className="jc-paytable">
      <thead><tr><th className="jc-sticky jc-nameh">Lid</th>{months.map(mo=><th key={mo}>{mLabel(mo)}</th>)}</tr></thead>
      <tbody>{data.members.map(m=>(<tr key={m.id}>
        <td className="jc-sticky jc-namecell" onClick={()=>edit&&setSel(m.id)} style={{cursor:edit?"pointer":"default"}}><span className="jc-av sm" style={{background:m.color}}>{m.short[0]}</span><span className="jc-nm">{m.short}</span><span className="jc-rate">{eur0(m.rate)}</span></td>
        {months.map(mo=>{const paid=isPaid(data,m.id,mo);const entry=hasEntry(data,m.id,mo);const req=cellReq(data,m.id,mo);const date=data.ledger[`${m.id}|${mo}`]?.date;
          return(<td key={mo} className={"jc-cell "+(paid?"paid":entry?"open":"none")} onClick={()=>toggle(m.id,mo)} style={{cursor:edit?"pointer":"default"}}><span className="jc-mark">{paid?"✓":entry?"✕":"·"}</span><span className="jc-amt">{eur0(req)}</span>{paid&&date&&<span className="jc-date">{dmShort(date)}</span>}</td>);})}
      </tr>))}</tbody>
      <tfoot><tr><td className="jc-sticky jc-namecell foot">betaald</td>{counts.map((c,i)=><td key={i} className="jc-foot">{c}/{data.members.length}</td>)}</tr></tfoot>
    </table></div>
    {sel&&<MemberSheet data={data} update={update} mid={sel} edit={edit} onClose={()=>setSel(null)}/>}
  </div>);
}
function MemberSheet({data,update,mid,edit,onClose}){
  const m=data.members.find(x=>x.id===mid);const months=data.months;
  const setReq=(mo,v)=>update(d=>{const k=`${mid}|${mo}`;const e=d.ledger[k]||{};const n=v===""?null:Number(v);d.ledger[k]={...e,req:isNaN(n)?null:n};});
  const setPaid=(mo,p)=>update(d=>{const k=`${mid}|${mo}`;const e=d.ledger[k]||{};d.ledger[k]={...e,paid:p,date:p?e.date:null};});
  const open=arrears(data,mid);
  return (<div className="jc-overlay" onClick={onClose}><div className="jc-sheet" onClick={e=>e.stopPropagation()}>
    <div className="jc-sheethead"><span className="jc-av" style={{background:m.color}}>{m.short[0]}</span><div><div className="jc-sheetname">{m.name}</div><div className="jc-sheetsub">{m.type} · tarief {eur0(m.rate)}</div></div><button className="jc-x" onClick={onClose}>✕</button></div>
    <div className="jc-sheetopen">Huidige achterstand: <b className={open>0?"clay":"sahel"}>{eur(open)}</b></div>
    <div className="jc-sheetlist">{months.map(mo=>{const paid=isPaid(data,mid,mo);const req=cellReq(data,mid,mo);const date=data.ledger[`${mid}|${mo}`]?.date;
      return(<div key={mo} className="jc-sheetrow"><span className="jc-sheetmo">{mLabel(mo,true)}</span><input className="jc-reqin" type="number" value={req} disabled={!edit} onChange={e=>setReq(mo,e.target.value)}/>{date&&<span className="jc-datero">{dmShort(date)} (uit import)</span>}<button className={"jc-toggle "+(paid?"on":"")} disabled={!edit} onClick={()=>setPaid(mo,!paid)}>{paid?"✓ betaald":"✕ open"}</button></div>);})}</div>
  </div></div>);
}

// ───────────── achterstand ─────────────
function Achterstand({data}){
  const months=data.months;
  const rows=data.members.map(m=>{let last=null;for(let i=months.length-1;i>=0;i--){const e=data.ledger[`${m.id}|${months[i]}`];if(e&&(e.req!=null||e.paid)){last=months[i];break;}}return{m,open:arrears(data,m.id),last};}).sort((a,b)=>b.open-a.open);
  const totaal=rows.reduce((a,r)=>a+r.open,0);
  return (<div className="jc-card"><div className="jc-cardhead"><h3>Achterstanden</h3><span className="jc-bigclay">{eur0(totaal)}</span></div>
    <p className="jc-sub" style={{marginTop:-6,marginBottom:12}}>Het openstaande bedrag is het laatst gevraagde bedrag dat nog niet is voldaan (loopt cumulatief op).</p>
    <div className="jc-achlist">{rows.map(({m,open,last})=>(<div key={m.id} className={"jc-achrow"+(open===0?" clear":"")}><span className="jc-av sm" style={{background:m.color}}>{m.short[0]}</span><div className="jc-achname">{m.name}{last&&<span className="jc-achmonths">stand per {mLabel(last,true)}</span>}</div><span className={"jc-achamt "+(open>0?"clay":"sahel")}>{open>0?eur0(open):"bij"}</span></div>))}</div></div>);
}

// ───────────── uitgaves ─────────────
function Uitgaves({data,update,edit}){
  const cats=data.categories||[];
  const [adding,setAdding]=useState(false);
  const [form,setForm]=useState({month:data.months[data.months.length-1],desc:"",amount:"",cat:cats[0]?.name||"Overig"});
  const [newCat,setNewCat]=useState(false);const [catName,setCatName]=useState("");const [catColor2,setCatColor2]=useState("#9c6b3f");

  const byMonth={};data.expenses.forEach(e=>{(byMonth[e.month]=byMonth[e.month]||[]).push(e);});
  const monthsAsc=Object.keys(byMonth).sort();const monthsDesc=[...monthsAsc].reverse();
  const totaal=data.expenses.reduce((a,e)=>a+e.amount,0);

  const add=()=>{if(!form.desc||!form.amount)return;update(d=>{d.expenses.push({id:"e"+Date.now(),month:form.month,desc:form.desc,amount:Number(form.amount),cat:form.cat});});setForm({...form,desc:"",amount:""});setAdding(false);};
  const del=(id)=>update(d=>{d.expenses=d.expenses.filter(e=>e.id!==id);});
  const setExp=(id,k,v)=>update(d=>{const e=d.expenses.find(x=>x.id===id);if(!e)return;e[k]=k==="amount"?(Number(v)||0):v;});
  const addCat=()=>{if(!catName.trim())return;update(d=>{(d.categories=d.categories||[]).push({name:catName.trim(),color:catColor2});});setForm(f=>({...f,cat:catName.trim()}));setCatName("");setNewCat(false);};

  // chart: gestapelde uitgave-staaf + inkomsten-staaf per maand
  const chartMonths=monthsAsc;
  const catList=cats.map(c=>c.name).concat(Object.keys(data.expenses.reduce((a,e)=>{a[e.cat]=1;return a;},{})).filter(n=>!cats.find(c=>c.name===n)));
  const maxBar=Math.max(1,...chartMonths.map(mo=>Math.max(monthIncome(data,mo),monthExpense(data,mo))));

  const catTot={};data.expenses.forEach(e=>catTot[e.cat]=(catTot[e.cat]||0)+e.amount);

  return (<div className="jc-grid">
    <div className="jc-card"><div className="jc-cardhead"><h3>Per maand</h3><span className="jc-legend"><i className="sahel"/>inkomsten</span></div>
      <div className="jc-stackwrap"><div className="jc-stackbars">{chartMonths.map(mo=>{const inc=monthIncome(data,mo);const exp=monthExpense(data,mo);
        return(<div key={mo} className="jc-stackcol"><div className="jc-stackgroup">
          <div className="jc-incbar" style={{height:`${(inc/maxBar)*100}%`}} title={"inkomsten "+eur(inc)}/>
          <div className="jc-expbar" style={{height:`${(exp/maxBar)*100}%`}} title={"uitgaven "+eur(exp)}>
            {catList.map(cn=>{const v=data.expenses.filter(e=>e.month===mo&&e.cat===cn).reduce((a,e)=>a+e.amount,0);if(!v)return null;return <div key={cn} className="jc-stackseg" style={{flexBasis:`${(v/Math.max(exp,1))*100}%`,background:catColor(data,cn)}} title={cn+" "+eur(v)}/>;})}
          </div></div><span className="jc-barlabel">{MSHORT[Number(mo.split("-")[1])-1]}</span></div>);})}</div></div>
      <div className="jc-catlegend">{catList.filter(cn=>catTot[cn]).map(cn=><span key={cn}><i style={{background:catColor(data,cn)}}/>{cn} <b>{eur0(catTot[cn])}</b></span>)}<span><i style={{background:"var(--sahel)"}}/>inkomsten <b>{eur0(chartMonths.reduce((a,mo)=>a+monthIncome(data,mo),0))}</b></span></div>
    </div>

    <div className="jc-card jc-nopad"><div className="jc-cardhead pad"><h3>Uitgaves <span className="jc-bigclay" style={{marginLeft:8}}>{eur0(totaal)}</span></h3>
      {edit&&<button className="jc-addbtn" onClick={()=>setAdding(a=>!a)}>{adding?"sluiten":"+ uitgave"}</button>}</div>
      {adding&&edit&&<div className="jc-addform">
        <select value={form.month} onChange={e=>setForm({...form,month:e.target.value})}>{data.months.map(mo=><option key={mo} value={mo}>{mLabel(mo,true)}</option>)}</select>
        <input placeholder="omschrijving" value={form.desc} onChange={e=>setForm({...form,desc:e.target.value})}/>
        <input placeholder="bedrag" type="number" value={form.amount} onChange={e=>setForm({...form,amount:e.target.value})}/>
        <select value={form.cat} onChange={e=>{if(e.target.value==="__new")setNewCat(true);else setForm({...form,cat:e.target.value});}}>{cats.map(c=><option key={c.name}>{c.name}</option>)}<option value="__new">+ nieuwe categorie…</option></select>
        <button className="jc-save-btn" onClick={add}>toevoegen</button>
        {newCat&&<div className="jc-newcat"><input placeholder="categorienaam" value={catName} onChange={e=>setCatName(e.target.value)}/><input type="color" value={catColor2} onChange={e=>setCatColor2(e.target.value)}/><button className="jc-save-btn" onClick={addCat}>opslaan</button></div>}
      </div>}
      {monthsDesc.map(mo=>{const items=byMonth[mo];const mtot=items.reduce((a,e)=>a+e.amount,0);const ink=data.income[mo];
        return(<div key={mo} className="jc-mblock"><div className="jc-mhead"><span>{mLabel(mo,true)}</span><span className="jc-mtot">{ink!=null&&<em className="sahel">in {eur0(ink)}</em>}uit {eur0(mtot)}</span></div>
          {items.map(e=>(edit?(<div key={e.id} className="jc-exprow edit">
            <i className="jc-cattag" style={{background:catColor(data,e.cat)}}/>
            <input className="jc-expname" value={e.desc} onChange={ev=>setExp(e.id,"desc",ev.target.value)}/>
            <select className="jc-expcatsel" value={e.cat} onChange={ev=>setExp(e.id,"cat",ev.target.value)}>{cats.map(c=><option key={c.name}>{c.name}</option>)}{!cats.find(c=>c.name===e.cat)&&<option>{e.cat}</option>}</select>
            <input className="jc-expamtin" type="number" value={e.amount} onChange={ev=>setExp(e.id,"amount",ev.target.value)}/>
            <button className="jc-del" onClick={()=>del(e.id)}>✕</button></div>):(
            <div key={e.id} className="jc-exprow"><i className="jc-cattag" style={{background:catColor(data,e.cat)}}/><span className="jc-expdesc">{e.desc}<span className="jc-expcat">{e.cat}</span></span><span className="jc-expamt">{eur(e.amount)}</span></div>)))}
        </div>);})}
    </div>
  </div>);
}

// ───────────── CSV import ─────────────
function normName(s){return (s||"").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"").replace(/[^a-z ]/g," ").split(/\s+/).filter(t=>t.length>2);}
function matchMember(name,members){const toks=normName(name);let best=null,sc=0;for(const m of members){const mt=normName(m.name).concat(normName(m.short));let s=0;for(const t of toks)if(mt.includes(t))s++;if(s>sc){sc=s;best=m;}}return sc>=1?best:null;}
function guessCat(desc,cats){const d=(desc||"").toLowerCase();if(/borrel|bier|drank|cafe|kroeg|dranken|dixo|disco/.test(d))return "Borrels & dixo's";if(/diner|eten|restaurant|activiteit|uitje|reis|n8w8|herenak|vebo|lancet/.test(d))return "Activiteit";if(/spar|lustrum|vakantie/.test(d))return "Sparen";return null;}
function parseCSV(text){
  text=text.replace(/^﻿/,"");const lines=text.split(/\r?\n/).filter(l=>l.trim());if(!lines.length)return{rows:[],err:"Leeg bestand"};
  const delim=(lines[0].match(/;/g)||[]).length>=(lines[0].match(/,/g)||[]).length?";":",";
  const split=(l)=>{const out=[];let cur="",q=false;for(let i=0;i<l.length;i++){const c=l[i];if(c==='"'){if(q&&l[i+1]==='"'){cur+='"';i++;}else q=!q;}else if(c===delim&&!q){out.push(cur);cur="";}else cur+=c;}out.push(cur);return out.map(s=>s.trim().replace(/^"|"$/g,""));};
  const head=split(lines[0]).map(h=>h.toLowerCase());
  const find=(...keys)=>head.findIndex(h=>keys.some(k=>h.includes(k)));
  const iDate=find("datum","date");const iAmt=find("bedrag","amount","mutatie");const iName=find("naam tegenpartij","tegenpartij","naam / omschrijving","naam","name");const iDesc=find("omschrijving","mededeling","description","memo");const iAfBij=find("af bij","af/bij","debit","credit","bij/af");const iCode=find("af bij","debit");
  const rows=[];
  for(let i=1;i<lines.length;i++){const c=split(lines[i]);if(c.length<2)continue;
    let raw=(iAmt>=0?c[iAmt]:"")||"";let amt=parseFloat(raw.replace(/\./g,"").replace(",",".").replace(/[^0-9.\-]/g,""));if(isNaN(amt))continue;
    if(iAfBij>=0){const ab=(c[iAfBij]||"").toLowerCase();if(ab.includes("af")||ab.includes("debet"))amt=-Math.abs(amt);else if(ab.includes("bij")||ab.includes("credit"))amt=Math.abs(amt);}
    let dateRaw=(iDate>=0?c[iDate]:"")||"";let mo=null,date=null;const m1=dateRaw.match(/(\d{4})[-\/]?(\d{2})[-\/]?(\d{2})/);const m2=dateRaw.match(/(\d{2})[-\/](\d{2})[-\/](\d{4})/);
    if(m1){mo=`${m1[1]}-${m1[2]}`;date=`${m1[1]}-${m1[2]}-${m1[3]}`;}else if(m2){mo=`${m2[3]}-${m2[2]}`;date=`${m2[3]}-${m2[2]}-${m2[1]}`;}
    const name=(iName>=0?c[iName]:"")||"";const desc=(iDesc>=0?c[iDesc]:"")||name;
    rows.push({amt,mo,date,name,desc:desc||name});
  }
  return{rows,cols:{iDate,iAmt,iName,iDesc},err:rows.length?null:"Geen herkenbare transacties — controleer of het een bankexport (CSV) is."};
}

function ImportModal({data,update,onClose}){
  const [step,setStep]=useState("upload");const [err,setErr]=useState(null);
  const [inc,setInc]=useState([]);const [out,setOut]=useState([]);
  const [newCatFor,setNewCatFor]=useState(null);const [catName,setCatName]=useState("");const [catColor2,setCatColor2]=useState("#9c6b3f");
  const cats=data.categories||[];

  const onFile=(e)=>{const f=e.target.files?.[0];if(!f)return;const r=new FileReader();
    r.onload=()=>{try{const{rows,err}=parseCSV(String(r.result));if(err){setErr(err);return;}
      const incoming=[],outgoing=[];
      rows.forEach((row,idx)=>{
        if(row.amt>0){
          const m=matchMember(row.name,data.members);const mo=row.mo&&data.months.includes(row.mo)?row.mo:(data.months.includes(NOW)?NOW:data.months[data.months.length-1]);
          const dup=m?isPaid(data,m.id,mo):false;
          incoming.push({id:"i"+idx,name:row.name,amt:row.amt,mo,date:row.date,memberId:m?m.id:"",sel:!!m&&!dup,dup});
        }else if(row.amt<0){
          const mo=row.mo&&data.months.includes(row.mo)?row.mo:(data.months.includes(NOW)?NOW:data.months[data.months.length-1]);
          const amount=Math.abs(row.amt);const dup=data.expenses.some(x=>x.month===mo&&Math.abs(x.amount-amount)<0.02);
          const cat=guessCat(row.desc,cats);
          outgoing.push({id:"o"+idx,desc:row.desc.slice(0,60),amt:amount,mo,cat:cat||"",sel:!dup,dup,unclear:!cat});
        }
      });
      setInc(incoming);setOut(outgoing);setErr(null);setStep("review");
    }catch(ex){setErr("Kon bestand niet lezen: "+ex.message);}};
    r.readAsText(f);};

  const setI=(id,k,v)=>setInc(a=>a.map(x=>x.id===id?{...x,[k]:v}:x));
  const setO=(id,k,v)=>setOut(a=>a.map(x=>x.id===id?{...x,[k]:v}:x));
  const needCat=out.filter(o=>o.sel&&!o.cat);
  const addCat=()=>{const name=catName.trim();if(!name)return;update(d=>{(d.categories=d.categories||[]).push({name,color:catColor2});});if(newCatFor)setO(newCatFor,"cat",name);setCatName("");setNewCatFor(null);};

  const apply=()=>{update(d=>{
    inc.filter(x=>x.sel&&x.memberId).forEach(x=>{if(!d.months.includes(x.mo)){d.months.push(x.mo);d.months.sort();}const k=`${x.memberId}|${x.mo}`;const e=d.ledger[k]||{};d.ledger[k]={...e,paid:true,req:e.req!=null?e.req:Math.round(x.amt),date:e.date||x.date||null};});
    out.filter(x=>x.sel&&x.cat).forEach(x=>{d.expenses.push({id:"e"+Date.now()+Math.random().toString(36).slice(2,6),month:x.mo,desc:x.desc,amount:x.amt,cat:x.cat});});
  });onClose();};

  return (<div className="jc-overlay" onClick={onClose}><div className="jc-import" onClick={e=>e.stopPropagation()}>
    <div className="jc-sheethead"><div><div className="jc-sheetname">Bankafschrift importeren</div><div className="jc-sheetsub">CSV van ING, ABN AMRO, Rabobank e.a.</div></div><button className="jc-x" onClick={onClose}>✕</button></div>
    {step==="upload"&&<div className="jc-importbody">
      <p className="jc-sub">Upload een CSV-export van jullie rekening. De app herkent inkomende betalingen (wie heeft betaald) en uitgaves, en vraagt om een categorie als die onduidelijk is. Bestaande bedragen die al kloppen worden niet dubbel toegevoegd.</p>
      <label className="jc-filebtn">Kies CSV-bestand<input type="file" accept=".csv,text/csv" onChange={onFile} style={{display:"none"}}/></label>
      {err&&<p className="jc-pinerr">{err}</p>}
    </div>}
    {step==="review"&&<div className="jc-importbody scroll">
      {err&&<p className="jc-pinerr">{err}</p>}
      <h4 className="jc-imh">Inkomsten — wie heeft betaald ({inc.filter(x=>x.sel).length}/{inc.length})</h4>
      {inc.length===0&&<p className="jc-empty">Geen inkomende transacties gevonden.</p>}
      {inc.map(x=>(<div key={x.id} className={"jc-imrow"+(x.dup?" dup":"")+(x.sel&&!x.date?" warn":"")}>
        <input type="checkbox" checked={x.sel} onChange={e=>setI(x.id,"sel",e.target.checked)}/>
        <span className="jc-imname" title={x.name}>{x.name||"—"}</span>
        <select value={x.memberId} onChange={e=>setI(x.id,"memberId",e.target.value)}><option value="">— kies lid —</option>{data.members.map(m=><option key={m.id} value={m.id}>{m.short}</option>)}</select>
        <select value={x.mo} onChange={e=>setI(x.id,"mo",e.target.value)}>{data.months.map(mo=><option key={mo} value={mo}>{mLabel(mo)}</option>)}</select>
        <input className={"jc-imdate"+(!x.date?" need":"")} type="date" value={x.date||""} onChange={e=>setI(x.id,"date",e.target.value)}/>
        <span className="jc-imamt sahel">{eur0(x.amt)}</span>{x.dup&&<span className="jc-dupbadge">al betaald</span>}
      </div>))}
      <h4 className="jc-imh">Uitgaves ({out.filter(x=>x.sel).length}/{out.length})</h4>
      {out.length===0&&<p className="jc-empty">Geen uitgaande transacties gevonden.</p>}
      {out.map(x=>(<div key={x.id} className={"jc-imrow"+(x.dup?" dup":"")+(x.sel&&!x.cat?" warn":"")}>
        <input type="checkbox" checked={x.sel} onChange={e=>setO(x.id,"sel",e.target.checked)}/>
        <input className="jc-imdesc" value={x.desc} onChange={e=>setO(x.id,"desc",e.target.value)}/>
        <select value={x.mo} onChange={e=>setO(x.id,"mo",e.target.value)}>{data.months.map(mo=><option key={mo} value={mo}>{mLabel(mo)}</option>)}</select>
        <select className={!x.cat?"need":""} value={x.cat} onChange={e=>{if(e.target.value==="__new"){setNewCatFor(x.id);}else setO(x.id,"cat",e.target.value);}}><option value="">categorie?</option>{cats.map(c=><option key={c.name}>{c.name}</option>)}<option value="__new">+ nieuwe categorie…</option></select>
        <span className="jc-imamt clay">{eur0(x.amt)}</span>{x.dup&&<span className="jc-dupbadge">mogelijk dubbel</span>}
      </div>))}
      {newCatFor&&<div className="jc-newcat"><input placeholder="categorienaam" autoFocus value={catName} onChange={e=>setCatName(e.target.value)}/><input type="color" value={catColor2} onChange={e=>setCatColor2(e.target.value)}/><button className="jc-save-btn" onClick={addCat}>opslaan</button><button className="jc-ghost" onClick={()=>{setNewCatFor(null);setCatName("");}}>annuleren</button></div>}
    </div>}
    {step==="review"&&<div className="jc-importfoot">
      {needCat.length>0&&<span className="jc-needcat">{needCat.length} uitgave(s) hebben nog een categorie nodig</span>}
      <button className="jc-ghost" onClick={onClose}>Annuleren</button>
      <button className="jc-primary" disabled={needCat.length>0} onClick={apply}>Toepassen</button>
    </div>}
  </div></div>);
}

// ───────────── lustrum ─────────────
function Lustrum({data,update,edit}){
  const rows=[...data.members].sort((a,b)=>(b.saved||0)-(a.saved||0));
  const tot=data.members.reduce((a,m)=>a+(m.saved||0),0);const doel=data.members.reduce((a,m)=>a+(m.target||0),0);
  const setSaved=(id,v)=>update(d=>{d.members.find(x=>x.id===id).saved=Number(v)||0;});
  const add=(id,v)=>update(d=>{const m=d.members.find(x=>x.id===id);m.saved=(m.saved||0)+v;});
  return (<div className="jc-grid">
    <div className="jc-card"><div className="jc-cardhead"><h3>Lustrum sparen — clubreis</h3><span className="jc-bigochre">{eur0(tot)}</span></div>
      <div className="jc-lustrumbar"><div style={{width:`${Math.min(100,(tot/doel)*100)}%`}}/></div>
      <p className="jc-sub">{eur0(tot)} van {eur0(doel)} ({Math.round((tot/doel)*100)}%) · doel {eur0(data.lustrumTarget)} p.p.</p></div>
    <div className="jc-card jc-nopad"><div className="jc-cardhead pad"><h3>Per lid</h3>{edit&&<span className="jc-hint">+50 of typ een totaal</span>}</div>
      <div className="jc-luslist">{rows.map(m=>{const pct=Math.min(100,((m.saved||0)/(m.target||3000))*100);
        return(<div key={m.id} className="jc-lusrow"><span className="jc-av sm" style={{background:m.color}}>{m.short[0]}</span>
          <div className="jc-lusmid"><div className="jc-lustop"><span>{m.short}</span><span className="ochre">{eur0(m.saved||0)}</span></div><div className="jc-lustrack"><div style={{width:pct+"%"}}/></div></div>
          {edit&&<span style={{display:"contents"}}><input className="jc-lusin" type="number" value={m.saved||0} onChange={e=>setSaved(m.id,e.target.value)}/><button className="jc-plus" onClick={()=>add(m.id,50)}>+50</button></span>}</div>);})}</div></div>
  </div>);
}

// ───────────── prognose ─────────────
const VAK_OCHRE="var(--ochre)",VAK_SAHEL="var(--sahel)",VAK_GREY="#9c8a6a";
function Prognose({data,update,edit}){
  const f=data.forecast;const v=f.vakantie;const vb=v.boeking;const va=v.activiteiten;
  const [selMonth,setSelMonth]=useState(null);
  const monthOptions=useMemo(()=>Array.from({length:36},(_,i)=>addMonth(addMonth(NOW,-12),i)),[]);
  const setF=(k,val)=>update(d=>{d.forecast[k]=val;});const setNum=(k,val)=>setF(k,Number(val)||0);
  const setVakB=(k,val)=>update(d=>{d.forecast.vakantie.boeking[k]=val;});const setVakBNum=(k,val)=>setVakB(k,Number(val)||0);
  const setVakA=(k,val)=>update(d=>{d.forecast.vakantie.activiteiten[k]=val;});const setVakANum=(k,val)=>setVakA(k,Number(val)||0);
  const addBetaling=()=>update(d=>{d.forecast.vakantie.boeking.betalingen.push({id:"p"+Date.now(),maand:d.forecast.startMonth,bedrag:0,label:"Betaling"});});
  const setBetaling=(id,k,val)=>update(d=>{const b=d.forecast.vakantie.boeking.betalingen.find(x=>x.id===id);b[k]=k==="bedrag"?(Number(val)||0):val;});
  const delBetaling=(id)=>update(d=>{d.forecast.vakantie.boeking.betalingen=d.forecast.vakantie.boeking.betalingen.filter(x=>x.id!==id);});
  const addOneOff=()=>update(d=>{d.forecast.oneOffs.push({id:"o"+Date.now(),month:d.forecast.startMonth,desc:"Grote uitgave",amount:0,cat:(d.categories||[])[0]?.name||""});});
  const setOneOff=(id,k,val)=>update(d=>{const o=d.forecast.oneOffs.find(x=>x.id===id);o[k]=k==="amount"?(Number(val)||0):val;});
  const delOneOff=(id)=>update(d=>{d.forecast.oneOffs=d.forecast.oneOffs.filter(x=>x.id!==id);});
  const setBucket=(id,k,val)=>update(d=>{const b=d.forecast.buckets.find(x=>x.id===id);b[k]=k==="totaalBedrag"?(Number(val)||0):val;});
  const addBucket=()=>update(d=>{d.forecast.buckets.push({id:"b"+Date.now(),name:"Nieuwe bestemming",cat:"",startMaand:d.forecast.startMonth,eindMaand:addMonth(d.forecast.startMonth,Math.max(1,d.forecast.horizon)-1),totaalBedrag:0,enabled:true});});
  const delBucket=(id)=>update(d=>{d.forecast.buckets=d.forecast.buckets.filter(x=>x.id!==id);});
  const fillBucketAvg=(id)=>update(d=>{const b=d.forecast.buckets.find(x=>x.id===id);if(!b||!b.cat||!b.startMaand||!b.eindMaand)return;const maanden=monthsBetween(b.startMaand,b.eindMaand);b.totaalBedrag=Math.round(avgExpenseByCat(d,d.forecast.avgMonths,b.cat)*maanden);});

  const calc=useMemo(()=>{
    const startSaldo=f.startSaldoOverride!=null?f.startSaldoOverride:data.accounts.betaalrekening;
    const gemBetAuto=avgPayers(data,f.avgMonths);
    const gemBet=f.betalersOverride!=null?f.betalersOverride:gemBetAuto;
    const gemInk=avgIncome(data,f.avgMonths);
    const buckets=f.buckets||[];
    const boekingBucketRaw=buckets.find(b=>b.isBoekingPot);
    const activiteitenBucket=buckets.find(b=>b.isActiviteitenPot);
    // de boeking-bucket loopt automatisch tot de laatste boekingsbetaling — niet langer sparen voor iets dat al betaald is
    const laatsteBetaling=(vb.betalingen||[]).reduce((m,b)=>!m||b.maand>m?b.maand:m,null);
    const boekingBucket=boekingBucketRaw&&laatsteBetaling?{...boekingBucketRaw,eindMaand:laatsteBetaling}:boekingBucketRaw;
    const enabled=buckets.filter(b=>b.enabled).map(b=>b.isBoekingPot&&boekingBucket?boekingBucket:b);
    const realBuckets=enabled.filter(b=>!b.isBoekingPot&&!b.isActiviteitenPot&&!b.isBuffer);
    const bufferBuckets=enabled.filter(b=>b.isBuffer);

    const horizonMonths=Array.from({length:f.horizon},(_,i)=>addMonth(f.startMonth,i));
    const oneOffTot=f.oneOffs.filter(o=>horizonMonths.includes(o.month)).reduce((a,o)=>a+o.amount,0);
    const schuldDeel=f.inclSchuld?f.startSchuld/f.horizon:0;
    const oneOffSpread=oneOffTot/f.horizon;

    // validatie: vallen boekings-/vakantiemaanden binnen de horizon?
    const buitenHorizon=[];
    (vb.betalingen||[]).forEach(b=>{if(b.maand&&!horizonMonths.includes(b.maand))buitenHorizon.push(`${b.label||"betaling"} (${mLabel(b.maand,true)})`);});
    if(va.vakantiemaand&&!horizonMonths.includes(va.vakantiemaand))buitenHorizon.push(`vakantiemaand (${mLabel(va.vakantiemaand,true)})`);

    // herleiding: alle kosten over de hele horizon optellen, dan ÷ aantal maanden ÷ gem. betalers → één vast bedrag p.p.
    const herleiding=enabled.map(b=>({label:b.name,totaal:b.totaalBedrag||0,periode:b.startMaand&&b.eindMaand?`${mLabel(b.startMaand,true)} – ${mLabel(b.eindMaand,true)}`:"—",maanden:monthsBetween(b.startMaand,b.eindMaand),perMaand:bucketMonthlyTotal(b)}));
    if(oneOffTot>0)herleiding.push({label:"Eenmalige uitgaves",totaal:oneOffTot,periode:`hele horizon`,maanden:f.horizon,perMaand:oneOffSpread});
    if(f.inclSchuld&&f.startSchuld)herleiding.push({label:"Beginschuld",totaal:f.startSchuld,periode:`hele horizon`,maanden:f.horizon,perMaand:schuldDeel});
    const totaalKosten=herleiding.reduce((a,h)=>a+h.totaal,0);
    const clubgeldPerMaand=totaalKosten/f.horizon;
    const benodigdPP=clubgeldPerMaand/Math.max(1,gemBet);
    const aanbevolen=Math.max(0,Math.ceil(benodigdPP/5)*5);
    const bijdrage=f.override!=null?f.override:aanbevolen;

    // drie gescheiden saldi: kas, boekingspotje, activiteitenpotje — geen reservering meer binnen het kassaldo
    let saldo=startSaldo,saldoVol=startSaldo;
    let potBoeking=vb.startPot||0;
    let potActiviteiten=va.startPot||0;
    const tekortBetaling={};let tekortActiviteiten=0;
    const aantalLeden=data.members.length;

    const rows=horizonMonths.map(mo=>{
      const saldoStart=saldo;
      const ink=Math.round(bijdrage*gemBet);
      const inkVol=Math.round(bijdrage*aantalLeden);
      const oneOffItems=f.oneOffs.filter(o=>o.month===mo);
      const oneOff=oneOffItems.reduce((a,o)=>a+o.amount,0);

      const realBucketAmounts=realBuckets.filter(b=>bucketActiveIn(b,mo)).map(b=>({name:b.name,color:catColor(data,b.cat),value:Math.round(bucketMonthlyTotal(b))}));
      const uitVereniging=realBucketAmounts.reduce((a,b)=>a+b.value,0);
      const bufferAmounts=bufferBuckets.filter(b=>bucketActiveIn(b,mo)).map(b=>({name:b.name,color:catColor(data,b.cat),value:Math.round(bucketMonthlyTotal(b))}));
      const boekingInleg=boekingBucket&&boekingBucket.enabled&&bucketActiveIn(boekingBucket,mo)?Math.round(bucketMonthlyTotal(boekingBucket)):0;
      const activiteitenInleg=activiteitenBucket&&activiteitenBucket.enabled&&bucketActiveIn(activiteitenBucket,mo)?Math.round(bucketMonthlyTotal(activiteitenBucket)):0;

      // kas: bijdrage erin, vereniging + eenmalig + overboekingen naar de potjes eruit (buffer blijft staan)
      saldo+=ink-uitVereniging-oneOff-boekingInleg-activiteitenInleg;
      saldoVol+=inkVol-uitVereniging-oneOff-boekingInleg-activiteitenInleg;

      potBoeking+=boekingInleg;
      let boeking=0;
      (vb.betalingen||[]).forEach(b=>{
        if(b.maand!==mo)return;
        boeking+=b.bedrag;
        const tekort=Math.max(0,b.bedrag-potBoeking);
        if(tekort>0){tekortBetaling[b.id]=tekort;saldo-=tekort;saldoVol-=tekort;}
        potBoeking=Math.max(0,potBoeking-b.bedrag);
      });

      potActiviteiten+=activiteitenInleg;
      let activiteiten=0;
      if(mo===va.vakantiemaand){
        activiteiten=va.verwachtBedrag||0;
        const tekortA=Math.max(0,activiteiten-potActiviteiten);
        tekortActiviteiten=tekortA;
        if(tekortA>0){saldo-=tekortA;saldoVol-=tekortA;}
        potActiviteiten=Math.max(0,potActiviteiten-activiteiten);
      }

      const totaal=saldo+potBoeking+potActiviteiten;
      const netto=saldo-saldoStart;
      const expenseSegs=[...realBucketAmounts];
      oneOffItems.forEach(o=>{if(o.amount>0)expenseSegs.push({name:o.cat||o.desc||"Eenmalig",color:o.cat?catColor(data,o.cat):VAK_GREY,value:o.amount});});
      if(boeking>0)expenseSegs.push({name:boekingBucket?.name||"Boeking",color:VAK_OCHRE,value:boeking});
      if(activiteiten>0)expenseSegs.push({name:activiteitenBucket?.name||"Activiteiten (vakantie)",color:VAK_SAHEL,value:activiteiten});
      const incomeSegs=[...realBucketAmounts,...bufferAmounts,
        {name:boekingBucket?.name||"Boeking-sparen",color:VAK_OCHRE,value:boekingInleg},
        {name:activiteitenBucket?.name||"Activiteiten-sparen",color:VAK_SAHEL,value:activiteitenInleg},
      ];
      return{mo,ink,inkVol,uit:uitVereniging,oneOff,boeking,activiteiten,netto,saldo,saldoVol,potBoeking,potActiviteiten,totaal,expenseSegs,incomeSegs};
    });
    // waarschuwing: kassaldo mag nooit negatief worden (potjes kunnen dat niet, die worden bij een tekort altijd door de kas aangevuld)
    const negatief=rows.filter(r=>r.saldo<0).map(r=>({mo:r.mo,saldo:r.saldo}));
    return{gemBet,gemBetAuto,gemInk,startSaldo,benodigdPP,aanbevolen,bijdrage,schuldDeel,oneOffSpread,herleiding,totaalKosten,clubgeldPerMaand,buckets,boekingBucket,activiteitenBucket,laatsteBetaling,buitenHorizon,warnings:{boeking:tekortBetaling,activiteiten:tekortActiviteiten,negatief},rows};
  },[data,f,v,vb,va]);

  const eind=calc.rows[calc.rows.length-1];
  const maxBar=Math.max(1,...calc.rows.map(r=>Math.max(r.ink,r.uit+r.oneOff+r.boeking+r.activiteiten)));
  const potBMax=Math.max(1,vb.startPot||0,...calc.rows.map(r=>r.potBoeking));
  const potAMax=Math.max(1,va.startPot||0,...calc.rows.map(r=>r.potActiviteiten));
  const legendItems=[...new Map(calc.rows.flatMap(r=>r.expenseSegs).map(s=>[s.name,s])).values()];
  return (<div className="jc-grid">
    {calc.buitenHorizon.length>0&&<div className="jc-card" style={{borderColor:"var(--clay)",background:"var(--clay-bg)"}}>
      <b className="clay">⚠ Buiten de prognose-horizon (worden niet meegerekend):</b>
      <p className="jc-sub" style={{color:"#7a3a1f"}}>{calc.buitenHorizon.join(", ")}. Horizon loopt van {mLabel(f.startMonth,true)} tot {mLabel(addMonth(f.startMonth,f.horizon-1),true)} — pas de maand of de horizon aan.</p>
    </div>}

    {calc.warnings.negatief.length>0&&<div className="jc-card" style={{borderColor:"var(--clay)",background:"var(--clay-bg)"}}>
      <b className="clay">⚠ Kassaldo wordt negatief — het vaste bedrag dekt dit niet, of de boeking/vakantie staat te vroeg:</b>
      <p className="jc-sub" style={{color:"#7a3a1f"}}>{calc.warnings.negatief.map(n=>`${mLabel(n.mo,true)} (${eur0(n.saldo)})`).join(", ")}. Verhoog het vaste bedrag, schuif de boeking op, of verhoog het startsaldo.</p>
    </div>}

    <div className="jc-card jc-reco-card">
      <div className="jc-recotop"><span className="jc-recolabel">Vast bedrag per lid · elke maand gelijk</span>
        <span className="jc-recobig">{eur0(calc.bijdrage)}<em>/maand</em></span></div>
      <div className="jc-recorow">
        <Mini label="totale kosten horizon" val={eur0(calc.totaalKosten)}/>
        <Mini label="÷ aantal maanden" val={String(f.horizon)}/>
        <Mini label="clubgeld/maand" val={eur0(calc.clubgeldPerMaand)}/>
        <Mini label="÷ gem. betalers" val={String(calc.gemBet)}/>
        <Mini label="benodigd p.p." val={eur0(calc.benodigdPP)}/>
      </div>
      <p className="jc-sub">Eén vast bedrag, elke maand hetzelfde. Omdat de uitgaven ongelijk over het jaar vallen maar de bijdrage vast is, leg je in sommige maanden geld opzij en spreek je het in andere maanden weer aan; dat verschil vangen het kassaldo en de potjes op (zie de "Netto"-kolom in de maandtabel).</p>
      {f.override!=null&&<p className="jc-sub clay">Handmatig bedrag actief ({eur0(f.override)}). {edit&&<button className="jc-mini" onClick={()=>setF("override",null)}>terug naar berekend</button>}</p>}
      <div className="jc-herleiding">
        <div className="jc-herltitel">Herleiding van het maandbedrag</div>
        {calc.herleiding.map((h,i)=>(<div key={i} className="jc-segrow"><span className="jc-segname">{h.label}<span className="jc-herlperiode">{h.periode} · {h.maanden} mnd</span></span><div className="jc-herlamts"><b>{eur0(h.perMaand)}/mnd</b><span className="jc-herlklein">totaal {eur0(h.totaal)}</span></div></div>))}
        <div className="jc-segrow jc-herltotal"><span className="jc-segname">Som over de horizon</span><b>{eur0(calc.totaalKosten)}</b></div>
        <div className="jc-segrow"><span className="jc-segname">÷ {f.horizon} maanden = clubgeld/maand</span><b>{eur0(calc.clubgeldPerMaand)}</b></div>
        <div className="jc-segrow"><span className="jc-segname">÷ {calc.gemBet} gem. betalers = benodigd p.p.</span><b>{eur0(calc.benodigdPP)}</b></div>
        <div className="jc-segrow jc-herltotal"><span className="jc-segname">Naar boven afgerond op €5 = vast bedrag p.p.</span><b className="ochre">{eur0(calc.aanbevolen)}</b></div>
      </div>
      {(()=>{const items=calc.buckets.filter(b=>b.enabled).map(b=>({b,pp:bucketMonthlyTotal(b)/Math.max(1,calc.gemBet)}));const tot=Math.max(1,items.reduce((a,x)=>a+x.pp,0));return(<>
        <div className="jc-splitbar">{items.map(({b,pp})=>(<div key={b.id} className="jc-splitseg" style={{flexBasis:`${(pp/tot)*100}%`,background:b.isBoekingPot?VAK_OCHRE:b.isActiviteitenPot?VAK_SAHEL:catColor(data,b.cat)}} title={`${b.name} ${eur0(pp)} p.p./maand`}/>))}</div>
        <div className="jc-splitlegend">{items.map(({b,pp})=>(<span key={b.id}><i style={{background:b.isBoekingPot?VAK_OCHRE:b.isActiviteitenPot?VAK_SAHEL:catColor(data,b.cat)}}/>{b.name} <b>{eur0(pp)} p.p./maand</b> · {Math.round((pp/tot)*100)}%</span>))}</div>
      </>);})()}
    </div>

    <div className="jc-cards4">
      <Stat label="Inkomsten/maand (verwacht)" value={eur0(Math.round(calc.bijdrage*calc.gemBet))} sub={`${calc.bijdrage} × ${calc.gemBet} betalers`} tone="sahel"/>
      <Stat label="Saldo einde" value={eur0(eind?.saldo)} sub={`incl. potjes: ${eur0(eind?.totaal)}`} tone={eind?.saldo>=0?"sahel":"clay"}/>
    </div>

    {edit&&<div className="jc-card jc-nopad"><div className="jc-cardhead pad"><h3>Bestemmingen (buckets)</h3><button className="jc-addbtn" onClick={addBucket}>+ bucket</button></div>
      <p className="jc-sub" style={{padding:"0 16px"}}>Per bestemming: begin- en eindmaand + totaalbedrag over die periode. Bedrag per maand en per persoon wordt automatisch berekend.</p>
      <div className="jc-bucketlist">{(f.buckets||[]).map(b=>{const eff=b.isBoekingPot&&calc.boekingBucket?calc.boekingBucket:b;const maanden=monthsBetween(eff.startMaand,eff.eindMaand);const perMaand=bucketMonthlyTotal(eff);const perPP=perMaand/Math.max(1,calc.gemBet);
        return(<div key={b.id} className="jc-bucketrow2">
        <div className="jc-bucketrow">
          <input type="checkbox" checked={b.enabled} onChange={e=>setBucket(b.id,"enabled",e.target.checked)}/>
          <input className="jc-bucketname" value={b.name} onChange={e=>setBucket(b.id,"name",e.target.value)}/>
          <select className="jc-bucketcat" value={b.cat||""} onChange={e=>setBucket(b.id,"cat",e.target.value)}><option value="">— geen koppeling —</option>{(data.categories||[]).map(c=><option key={c.name} value={c.name}>{c.name}</option>)}</select>
          <button className="jc-del" onClick={()=>delBucket(b.id)}>✕</button>
        </div>
        <div className="jc-bucketrow">
          <select className="jc-bucketcat" value={b.startMaand||""} onChange={e=>setBucket(b.id,"startMaand",e.target.value)}>{monthOptions.map(k=><option key={k} value={k}>{mLabel(k,true)}</option>)}</select>
          <span className="jc-sub">tot</span>
          {b.isBoekingPot
            ?<span className="jc-sub" title="Loopt automatisch tot de (laatste) boekingsdatum">{eff.eindMaand?mLabel(eff.eindMaand,true):"—"} (auto)</span>
            :<select className="jc-bucketcat" value={b.eindMaand||""} onChange={e=>setBucket(b.id,"eindMaand",e.target.value)}>{monthOptions.map(k=><option key={k} value={k}>{mLabel(k,true)}</option>)}</select>}
          <input className="jc-bucketamt" type="number" value={b.totaalBedrag||0} onChange={e=>setBucket(b.id,"totaalBedrag",e.target.value)}/>
          <span className="jc-sub">totaal</span>
          {b.cat&&<button className="jc-mini" onClick={()=>fillBucketAvg(b.id)}>vul gemiddelde</button>}
        </div>
        {!b.isBoekingPot&&!b.isActiviteitenPot&&<label className="jc-check" style={{margin:"2px 0"}}><input type="checkbox" checked={!!b.isBuffer} onChange={e=>setBucket(b.id,"isBuffer",e.target.checked)}/> blijft in de kas (buffer — nooit een uitgave)</label>}
        <p className="jc-sub" style={{margin:"0 0 4px"}}>= {eur0(perMaand)}/maand over {maanden} maand{maanden!==1?"en":""} · {eur0(perPP)} p.p./maand</p>
      </div>);})}</div>
    </div>}

    {edit&&<div className="jc-card"><h3 className="jc-h">Instellingen</h3>
      <div className="jc-fgrid">
        <Field label="Maanden middelen (historie)"><input type="number" value={f.avgMonths} onChange={e=>setNum("avgMonths",Math.max(1,Number(e.target.value)||1))}/></Field>
        <Field label="Prognose-horizon (maanden)"><input type="number" value={f.horizon} onChange={e=>setNum("horizon",Math.max(1,Math.min(24,Number(e.target.value)||1)))}/></Field>
        <Field label="Startmaand"><select value={f.startMonth} onChange={e=>setF("startMonth",e.target.value)}>{Array.from({length:12},(_,i)=>addMonth(NOW,i)).map(k=><option key={k} value={k}>{mLabel(k,true)}</option>)}</select></Field>
        <Field label="Startsaldo betaalrekening">
          <select value={f.startSaldoOverride!=null?"handmatig":"automatisch"} onChange={e=>setF("startSaldoOverride",e.target.value==="automatisch"?null:data.accounts.betaalrekening)}>
            <option value="automatisch">volgt rekeningsaldo ({eur0(data.accounts.betaalrekening)})</option>
            <option value="handmatig">handmatig</option>
          </select>
        </Field>
        <Field label="Beginschuld"><input type="number" value={f.startSchuld} onChange={e=>setNum("startSchuld",e.target.value)}/></Field>
      </div>
      {f.startSaldoOverride!=null&&<div className="jc-fgrid" style={{marginTop:10}}>
        <Field label="Handmatig startsaldo"><input type="number" value={f.startSaldoOverride} onChange={e=>setF("startSaldoOverride",Number(e.target.value)||0)}/></Field>
      </div>}
      <label className="jc-check"><input type="checkbox" checked={f.inclSchuld} onChange={e=>setF("inclSchuld",e.target.checked)}/> schuld meenemen (verspreid over horizon)</label>
      <div className="jc-fgrid" style={{marginTop:10}}>
        <Field label="Handmatig bedrag (optioneel)"><input type="number" placeholder="berekend" value={f.override??""} onChange={e=>setF("override",e.target.value===""?null:Number(e.target.value))}/></Field>
        <Field label="Aantal betalende leden">
          <select value={f.betalersOverride!=null?"handmatig":"gemiddeld"} onChange={e=>setF("betalersOverride",e.target.value==="gemiddeld"?null:calc.gemBetAuto)}>
            <option value="gemiddeld">gemiddeld (automatisch: {calc.gemBetAuto})</option>
            <option value="handmatig">handmatig</option>
          </select>
        </Field>
      </div>
      {f.betalersOverride!=null&&<div className="jc-fgrid" style={{marginTop:10}}>
        <Field label="Handmatig aantal betalers"><input type="number" step="0.1" value={f.betalersOverride} onChange={e=>setF("betalersOverride",Number(e.target.value)||0)}/></Field>
      </div>}
    </div>}

    <div className="jc-card"><div className="jc-cardhead"><h3>Inkomsten vs. uitgaven (prognose)</h3><span className="jc-hint">tik een maand voor de volledige opbouw</span></div>
      <div className="jc-stackwrap"><div className="jc-stackbars">{calc.rows.map(r=>{const totUit=r.uit+r.oneOff+r.boeking+r.activiteiten;
        return(<div key={r.mo} className="jc-stackcol clickable" onClick={()=>setSelMonth(r.mo)}><div className="jc-barnums"><span className="sahel">{eur0(r.ink)}</span><span className="clay">{eur0(totUit)}</span></div><div className="jc-stackgroup">
          <div className="jc-incbar" style={{height:`${(r.ink/maxBar)*100}%`}} title={"inkomsten "+eur(r.ink)}/>
          <div className="jc-expbar" style={{height:`${(totUit/maxBar)*100}%`}} title={"uitgaven "+eur(totUit)}>
            {r.expenseSegs.filter(s=>s.value>0).map((s,i)=><div key={i} className="jc-stackseg" style={{flexBasis:`${(s.value/Math.max(totUit,1))*100}%`,background:s.color}} title={`${s.name} ${eur(s.value)}`}/>)}
          </div></div>
        <span className="jc-barlabel">{MSHORT[Number(r.mo.split("-")[1])-1]}</span></div>);})}</div></div>
      <div className="jc-catlegend">{legendItems.map(s=><span key={s.name}><i style={{background:s.color}}/>{s.name}</span>)}</div>
      <p className="jc-sub" style={{marginTop:8}}>Som over de hele horizon: {eur0(calc.rows.reduce((a,r)=>a+r.ink,0))} inkomsten, {eur0(calc.rows.reduce((a,r)=>a+r.uit+r.oneOff+r.boeking+r.activiteiten,0))} uitgaven.</p>
    </div>

    <div className="jc-card jc-nopad"><div className="jc-cardhead pad"><h3>Maandprognose</h3><span className="jc-hint">tik een rij voor de volledige opbouw</span></div>
      <p className="jc-sub" style={{padding:"0 16px 8px"}}><b>Verwacht</b> = bij gemiddeld {calc.gemBet} betalers (voorzichtige schatting). <b>Vol</b> = als alle {data.members.length} leden die maand betalen (iedereen haalt zijn achterstand uiteindelijk in). Alle saldo-kolommen zijn de stand <b>aan het einde van</b> die maand, ná de inkomsten en uitgaven van die maand.</p>
      <div className="jc-gridscroll"><table className="jc-ftable">
        <thead><tr><th>Maand</th><th>Inkomsten</th><th>Ink. vol</th><th>Uitgave</th><th>Eenmalig</th><th>Boeking</th><th>Activiteiten</th><th>Netto</th><th title="Kassaldo aan het einde van deze maand">Saldo (einde mnd)</th><th title="Boekingspotje-saldo aan het einde van deze maand">Boekingspotje</th><th title="Activiteitenpotje-saldo aan het einde van deze maand">Activiteitenpotje</th></tr></thead>
        <tbody>{calc.rows.map(r=>(<tr key={r.mo} className={"clickable"+(r.saldo<0?" warnrow":"")} onClick={()=>setSelMonth(r.mo)}><td className="l">{mLabel(r.mo)}</td><td className="sahel">{eur0(r.ink)}</td><td className="sahel" style={{opacity:.6}}>{eur0(r.inkVol)}</td><td className="clay">{eur0(r.uit)}</td><td>{r.oneOff?eur0(r.oneOff):"—"}</td><td>{r.boeking?eur0(r.boeking):"—"}</td><td>{r.activiteiten?eur0(r.activiteiten):"—"}</td><td className={r.netto>=0?"sahel":"clay"}>{r.netto>=0?"+":""}{eur0(r.netto)}</td><td className={r.saldo<0?"clay b":""}>{eur0(r.saldo)}</td><td className="ochre">{eur0(r.potBoeking)}</td><td className="sahel">{eur0(r.potActiviteiten)}</td></tr>))}</tbody>
      </table></div></div>

    <div className="jc-card jc-nopad"><div className="jc-cardhead pad"><h3>Overige eenmalige uitgaves</h3>{edit&&<button className="jc-addbtn" onClick={addOneOff}>+ uitgave</button>}</div>
      <div className="jc-oolist">{f.oneOffs.length===0&&<p className="jc-empty" style={{padding:"0 16px 14px"}}>Nog geen eenmalige uitgaves.</p>}
        {f.oneOffs.map(o=>(<div key={o.id} className="jc-oorow">{edit?<span style={{display:"contents"}}>
          <select value={o.month} onChange={e=>setOneOff(o.id,"month",e.target.value)}>{Array.from({length:f.horizon},(_,i)=>addMonth(f.startMonth,i)).map(k=><option key={k} value={k}>{mLabel(k,true)}</option>)}</select>
          <input className="jc-ooDesc" value={o.desc} onChange={e=>setOneOff(o.id,"desc",e.target.value)}/>
          <select className="jc-bucketcat" value={o.cat||""} onChange={e=>setOneOff(o.id,"cat",e.target.value)}><option value="">— categorie? —</option>{(data.categories||[]).map(c=><option key={c.name} value={c.name}>{c.name}</option>)}</select>
          <input className="jc-ooAmt" type="number" value={o.amount} onChange={e=>setOneOff(o.id,"amount",e.target.value)}/>
          <button className="jc-del" onClick={()=>delOneOff(o.id)}>✕</button></span>:<span style={{display:"contents"}}><i className="jc-cattag" style={{background:catColor(data,o.cat)}}/><span className="jc-oomo">{mLabel(o.month,true)}</span><span className="jc-ooDesc2">{o.desc}{o.cat&&<span className="jc-expcat">{o.cat}</span>}</span><span className="jc-expamt clay">{eur0(o.amount)}</span></span>}</div>))}</div></div>

    <div className="jc-card"><div className="jc-cardhead"><h3>Clubvakantie — boekingspotje</h3></div>
      <p className="jc-sub">Dit potje is bedoeld om vlucht &amp; verblijf van te betalen. Het staat <b>los van het kassaldo</b> — een eigen rekening, net als onze echte spaarrekening clubvakantie. Elke maand vanaf de startmaand komt er geld bij vanuit de bucket "{calc.boekingBucket?.name||"Clubvakantie — boeking"}" ({eur0(calc.boekingBucket?.amount||0)} p.p. → {eur0(Math.round((calc.boekingBucket?.amount||0)*calc.gemBet))}/maand, overgeboekt vanuit de kas). Bij een betaling wordt die zoveel mogelijk uit dit potje betaald; is het potje nog niet vol genoeg, dan vult de kas alleen het ontbrekende stukje bij — niet de volle prijs. De doorlopende maandelijkse inleg bouwt het potje daarna vanzelf weer op.</p>
      <div className="jc-recorow">
        <Mini light label="potje nu" val={eur0(vb.startPot||0)}/>
        <Mini light label="potje einde horizon" val={eind?eur0(eind.potBoeking):"—"}/>
        {(vb.betalingen||[]).map(b=>(<Mini key={b.id} light label={b.label||"betaling"} val={`${mLabel(b.maand,true)} · ${eur0(b.bedrag)}`}/>))}
        <Mini light label="totaal te betalen" val={eur0((vb.betalingen||[]).reduce((a,b)=>a+b.bedrag,0))}/>
      </div>
      {Object.keys(calc.warnings.boeking).length>0&&<p className="jc-sub clay">⚠ niet op tijd genoeg gespaard voor: {(vb.betalingen||[]).filter(b=>calc.warnings.boeking[b.id]).map(b=>`${b.label} (tekort ${eur0(calc.warnings.boeking[b.id])}, kas schiet bij)`).join(", ")}</p>}
      <div className="jc-bars tall">{calc.rows.map(r=>(<div key={r.mo} className="jc-barcol"><div className="jc-barnums"><span className="ochre">{eur0(r.potBoeking)}</span></div><div className="jc-bargroup">
        <div className="jc-bar ochreb" style={{height:`${(r.potBoeking/potBMax)*100}%`}} title={"boekingspotje "+eur(r.potBoeking)}/></div>
        <span className="jc-barlabel">{MSHORT[Number(r.mo.split("-")[1])-1]}</span></div>))}</div>
    </div>

    {edit&&<div className="jc-card"><h3 className="jc-h">Boekingspotje — instellingen</h3>
      <div className="jc-fgrid">
        <Field label="Startsaldo potje"><input type="number" value={vb.startPot} onChange={e=>setVakBNum("startPot",e.target.value)}/></Field>
      </div>
      <div className="jc-cardhead" style={{marginTop:6}}><h3 className="jc-h" style={{marginBottom:0}}>Betalingen</h3><button className="jc-addbtn" onClick={addBetaling}>+ betaling</button></div>
      <div className="jc-bucketlist" style={{padding:"4px 0 0"}}>{(vb.betalingen||[]).map(b=>(<div key={b.id} className="jc-bucketrow">
        <input className="jc-bucketname" value={b.label} onChange={e=>setBetaling(b.id,"label",e.target.value)}/>
        <select className="jc-bucketcat" value={b.maand} onChange={e=>setBetaling(b.id,"maand",e.target.value)}>{monthOptions.map(k=><option key={k} value={k}>{mLabel(k,true)}</option>)}</select>
        <input className="jc-bucketamt" type="number" value={b.bedrag} onChange={e=>setBetaling(b.id,"bedrag",e.target.value)}/>
        <button className="jc-del" onClick={()=>delBetaling(b.id)}>✕</button>
      </div>))}</div>
    </div>}

    <div className="jc-card"><div className="jc-cardhead"><h3>Clubvakantie — activiteitenpotje</h3></div>
      <p className="jc-sub">Dit potje is bedoeld voor de activiteiten tijdens de reis zelf (zakgeld onderweg, niet de vlucht/het verblijf). Het staat <b>los van het kassaldo</b> en los van het boekingspotje — een eigen rekening. Elke maand vanaf de startmaand komt er geld bij vanuit de bucket "{calc.activiteitenBucket?.name||"Clubvakantie — activiteiten"}" ({eur0(calc.activiteitenBucket?.amount||0)} p.p. → {eur0(Math.round((calc.activiteitenBucket?.amount||0)*calc.gemBet))}/maand, overgeboekt vanuit de kas). In de vakantiemaand wordt het potje volledig leeggemaakt — dat geld is dan op aan activiteiten. Is er op dat moment niet genoeg gespaard, dan zie je dat hier als waarschuwing (de kas vult dit potje niet automatisch bij).</p>
      <div className="jc-recorow">
        <Mini light label="potje nu" val={eur0(va.startPot||0)}/>
        <Mini light label="vakantiemaand" val={va.vakantiemaand?mLabel(va.vakantiemaand,true):"—"}/>
        <Mini light label="verwacht bedrag" val={eur0(va.verwachtBedrag||0)}/>
      </div>
      {calc.warnings.activiteiten>0&&<p className="jc-sub clay">⚠ potje is naar verwachting {eur0(calc.warnings.activiteiten)} te kort voor de vakantiemaand.</p>}
      {calc.warnings.activiteiten===0&&va.vakantiemaand&&calc.rows.some(r=>r.mo===va.vakantiemaand)&&<p className="jc-sub sahel">Genoeg gespaard voor de vakantiemaand.</p>}
      <div className="jc-bars tall">{calc.rows.map(r=>(<div key={r.mo} className="jc-barcol"><div className="jc-barnums"><span className="sahel">{eur0(r.potActiviteiten)}</span></div><div className="jc-bargroup">
        <div className="jc-bar sahelb" style={{height:`${(r.potActiviteiten/potAMax)*100}%`}} title={"activiteitenpotje "+eur(r.potActiviteiten)}/></div>
        <span className="jc-barlabel">{MSHORT[Number(r.mo.split("-")[1])-1]}</span></div>))}</div>
    </div>

    {edit&&<div className="jc-card"><h3 className="jc-h">Activiteitenpotje — instellingen</h3>
      <div className="jc-fgrid">
        <Field label="Startsaldo potje"><input type="number" value={va.startPot} onChange={e=>setVakANum("startPot",e.target.value)}/></Field>
        <Field label="Vakantiemaand (potje leeg)"><select value={va.vakantiemaand} onChange={e=>setVakA("vakantiemaand",e.target.value)}>{monthOptions.map(k=><option key={k} value={k}>{mLabel(k,true)}</option>)}</select></Field>
        <Field label="Verwacht activiteitenbedrag"><input type="number" value={va.verwachtBedrag} onChange={e=>setVakANum("verwachtBedrag",e.target.value)}/></Field>
      </div>
    </div>}
    {selMonth&&<MaandPaneel row={calc.rows.find(r=>r.mo===selMonth)} onClose={()=>setSelMonth(null)}/>}
  </div>);
}
function MaandPaneel({row,onClose}){
  if(!row)return null;
  const totUit=row.uit+row.oneOff+row.boeking+row.activiteiten;
  return(<div className="jc-overlay" onClick={onClose}><div className="jc-sheet" onClick={e=>e.stopPropagation()}>
    <div className="jc-sheethead"><div><div className="jc-sheetname">{mLabel(row.mo,true)}</div><div className="jc-sheetsub">volledige opbouw van deze maand</div></div><button className="jc-x" onClick={onClose}>✕</button></div>
    <div className="jc-sheetlist">
      <h4 className="jc-imh">Inkomsten — {eur0(row.ink)}</h4>
      {row.incomeSegs.filter(s=>s.value>0).map((s,i)=>(<div key={i} className="jc-segrow"><i style={{background:s.color}}/><span className="jc-segname">{s.name}</span><span className="jc-segpct">{Math.round((s.value/Math.max(row.ink,1))*100)}%</span><b className="sahel">{eur0(s.value)}</b></div>))}
      <h4 className="jc-imh">Uitgaven — {eur0(totUit)}</h4>
      {totUit===0&&<p className="jc-empty">Geen uitgaven deze maand.</p>}
      {row.expenseSegs.filter(s=>s.value>0).map((s,i)=>(<div key={i} className="jc-segrow"><i style={{background:s.color}}/><span className="jc-segname">{s.name}</span><span className="jc-segpct">{Math.round((s.value/Math.max(totUit,1))*100)}%</span><b className="clay">{eur0(s.value)}</b></div>))}
      <h4 className="jc-imh">Saldo</h4>
      {row.saldo<0&&<p className="jc-sub clay">⚠ Kassaldo is deze maand negatief.</p>}
      <div className="jc-segrow"><span className="jc-segname">Netto deze maand</span><b className={row.netto>=0?"sahel":"clay"}>{row.netto>=0?"+":""}{eur0(row.netto)}</b></div>
      <div className="jc-segrow"><span className="jc-segname">Saldo na deze maand</span><b className={row.saldo<0?"clay":""}>{eur0(row.saldo)}</b></div>
      <div className="jc-segrow"><span className="jc-segname">Boekingspotje</span><b className="ochre">{eur0(row.potBoeking)}</b></div>
      <div className="jc-segrow"><span className="jc-segname">Activiteitenpotje</span><b className="sahel">{eur0(row.potActiviteiten)}</b></div>
      <div className="jc-segrow jc-herltotal"><span className="jc-segname">Totaal (kas + potjes)</span><b>{eur0(row.totaal)}</b></div>
      <h4 className="jc-imh">Scenario: iedereen betaalt</h4>
      <div className="jc-segrow"><span className="jc-segname">Inkomsten (vol)</span><b className="sahel">{eur0(row.inkVol)}</b></div>
      <div className="jc-segrow"><span className="jc-segname">Saldo (vol)</span><b className={row.saldoVol>=0?"sahel":"clay"}>{eur0(row.saldoVol)}</b></div>
    </div>
  </div></div>);
}
function Mini({label,val,light}){return<div className={"jc-minicalc"+(light?" light":"")}><span>{label}</span><b>{val}</b></div>;}

// ───────────── beheer ─────────────
function Beheer({data,update,setData}){
  const [confirmReset,setConfirmReset]=useState(false);const [importing,setImporting]=useState(false);
  const setField=(k,v)=>update(d=>{d[k]=v;});const setAcc=(k,v)=>update(d=>{d.accounts[k]=Number(v)||0;});
  const setMember=(id,k,v)=>update(d=>{const m=d.members.find(x=>x.id===id);m[k]=k==="rate"?(Number(v)||0):v;});
  const delMember=(id)=>update(d=>{d.members=d.members.filter(m=>m.id!==id);});
  const addMember=()=>update(d=>{d.members.push({id:"m"+Date.now(),name:"Nieuw lid",short:"Nieuw",type:"fulltime",rate:270,color:"#9c6b3f",saved:0,target:d.lustrumTarget||3000});});
  const setCat=(i,k,v)=>update(d=>{d.categories[i][k]=v;});const delCat=(i)=>update(d=>{d.categories.splice(i,1);});const addCat=()=>update(d=>{(d.categories=d.categories||[]).push({name:"Nieuw",color:"#9c6b3f"});});
  const reset=()=>{const n=structuredClone(SEED);n.lastUpdated=TODAY;setData(n);setConfirmReset(false);};
  return (<div className="jc-grid">
    <div className="jc-card"><h3 className="jc-h">Algemeen</h3>
      <Field label="Groepsnaam"><input value={data.groupName} onChange={e=>setField("groupName",e.target.value)}/></Field>
      <Field label="IBAN"><input value={data.iban} onChange={e=>setField("iban",e.target.value)}/></Field>
      <Field label="Beheerders rekening"><input value={data.beheerders} onChange={e=>setField("beheerders",e.target.value)}/></Field>
    </div>
    <div className="jc-card"><h3 className="jc-h">Bankafschrift importeren</h3><p className="jc-sub" style={{marginBottom:10}}>Upload een CSV-export van jullie rekening om betalingen en uitgaves automatisch in te lezen. Onduidelijke uitgaves vragen om een categorie; bestaande bedragen worden niet dubbel toegevoegd.</p><button className="jc-addbtn ghost" onClick={()=>setImporting(true)}>⬆ Afschrift importeren</button></div>
    <div className="jc-card"><h3 className="jc-h">Rekeningen</h3>
      <Field label="Betaalrekening"><input type="number" value={data.accounts.betaalrekening} onChange={e=>setAcc("betaalrekening",e.target.value)}/></Field>
      <Field label="Spaarrekening clubvakantie"><input type="number" value={data.accounts.spaarrekeningVakantie} onChange={e=>setAcc("spaarrekeningVakantie",e.target.value)}/></Field>
      <Field label="Lustrum spaarpot"><input type="number" value={data.accounts.lustrum} onChange={e=>setAcc("lustrum",e.target.value)}/></Field>
      <Field label="Tegoed bij vereniging"><input type="number" value={data.accounts.tegoedVereniging} onChange={e=>setAcc("tegoedVereniging",e.target.value)}/></Field>
    </div>
    <div className="jc-card jc-nopad"><div className="jc-cardhead pad"><h3>Categorieën</h3><button className="jc-addbtn" onClick={addCat}>+ categorie</button></div>
      <div className="jc-memlist">{(data.categories||[]).map((c,i)=>(<div key={i} className="jc-memrow"><input type="color" value={c.color} onChange={e=>setCat(i,"color",e.target.value)} className="jc-colorin"/><input className="jc-memname" value={c.name} onChange={e=>setCat(i,"name",e.target.value)}/><button className="jc-del" onClick={()=>delCat(i)}>✕</button></div>))}</div>
    </div>
    <div className="jc-card jc-nopad"><div className="jc-cardhead pad"><h3>Leden & tarieven</h3><button className="jc-addbtn" onClick={addMember}>+ lid</button></div>
      <div className="jc-memlist">{data.members.map(m=>(<div key={m.id} className="jc-memrow"><span className="jc-av sm" style={{background:m.color}}>{m.short[0]}</span><input className="jc-memname" value={m.name} onChange={e=>setMember(m.id,"name",e.target.value)}/><input className="jc-memshort" value={m.short} onChange={e=>setMember(m.id,"short",e.target.value)}/><input className="jc-memrate" type="number" value={m.rate} onChange={e=>setMember(m.id,"rate",e.target.value)}/><button className="jc-del" onClick={()=>delMember(m.id)}>✕</button></div>))}</div>
    </div>
    <div className="jc-card"><h3 className="jc-h">Data</h3><p className="jc-sub">Begonnen met jullie spreadsheet-data van april 2026. Wijzigingen worden gedeeld met iedereen.</p>
      {confirmReset?<div className="jc-confirmrow"><span>Zeker weten? Alle wijzigingen gaan verloren.</span><button className="jc-ghost" onClick={()=>setConfirmReset(false)}>nee</button><button className="jc-reset" onClick={reset}>ja, reset</button></div>:<button className="jc-reset" onClick={()=>setConfirmReset(true)}>Terug naar oorspronkelijke data</button>}
    </div>
    {importing&&<ImportModal data={data} update={update} onClose={()=>setImporting(false)}/>}
  </div>);
}
function Field({label,children}){return<label className="jc-field"><span>{label}</span>{children}</label>;}
