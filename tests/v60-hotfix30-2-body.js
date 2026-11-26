/* Suite 6.0 · Hotfix 30.2 (Auftrag 261115 Hotfix 30.2, Phase C) + Hotfix 30.3 §3 (schon gebuchte Nacht = Differenz) · Pflichtfall = Pascals Lage: letzte Nacht Do→Fr (13.11. 01:00–08:00, gebucht, 2026-11-12-1),
   App-Tag 2026-11-13-1 abgeschlossen (ADHS-Erholung 13.11. 22:52:21 – 14.11. 12:03, s-bb2d29ae…), kein App-Tag 14.11., laufender App-Tag 2026-11-15-1 (15.11. 10:56).
   Paket: 13.11. Sitzung ändern bis „00:00“ + Schlafen „00:00“–„09:00“ · 14.11. Erholung „09:00“–„00:00“, Schlafen „00:00“–„09:00“, 7 Tick-Schritte.
   Erwartet: Nacht 14.11. auf 2026-11-13-1, Nacht 15.11. auf 2026-11-14-k (angelegt), letzte = Nacht 15.11. (tagId 2026-11-14-k, gebucht), heute ohne Schlafpunkte und
   ohne Änderung an S.tag.morgen, zweites Einspielen ändert nichts, Prüfung nennt „Tag 13.11.“ bzw. „Tag 14.11.“ · §1.1 heute wie bisher · §1.3 ältere Nacht wie bisher · Version. */
var _toasts=[]; toast=function(m){ _toasts.push(String(m)); }; haptik=function(){}; var confirm=function(){ return true; };
fsliveStumm(); var src=readFile('index.html');
uuid=function(){ return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c){ var r=Math.random()*16|0; return (c==='x' ? r : (r&3|8)).toString(16); }); };
var K=testTag(); S.ui.spezial=null; seiteZeigen('fokus');
function iso(d, hhmm){ return new Date(d+'T'+hhmm+(hhmm.length===5 ? ':00' : '')).toISOString(); }
function ms(d, hhmm){ return new Date(d+'T'+hhmm+(hhmm.length===5 ? ':00' : '')).getTime(); }
var d12='2026-11-12', d13='2026-11-13', d14='2026-11-14', d15='2026-11-15';
// laufender App-Tag 2026-11-15-1, gestartet 15.11. 10:56 (heuteApp() liest S.tag.datum)
S.tag.tagId=d15+'-1'; S.tag.datum=d15; S.tag.laufindex=1; S.tag.startTs=iso(d15,'10:56'); saveTag();
S.meta.korrekturProtokoll=[]; HF27.korrSchritte=[]; S.meta.postfachKarten={};
// Karten: ADHS-Erholung, 🌙 Schlafen (std42), sieben Tick-Karten
var kE=Object.assign(neueKarte({ titel:'ADHS-Erholung', domain:'privat' }), { id:'k-adhs-erh', status:'offen', matrixFeld:'zustand', sollMin:60, erholung:true });
var kS=Object.assign(neueKarte({ titel:'🌙 Schlafen', domain:'privat' }), { id:'k3-schlafen', rolle:'schlafen', status:'offen', std42:true, art:'system', matrixFeld:'werkzeug', immerSichtbar:true, rhythmus:{ typ:'taeglich' } });
function tickKarte(id, titel){ return Object.assign(neueKarte({ titel:titel, domain:'privat' }), { id:id, status:'offen', modus:'zeit', ticksAktiv:true, tickMinuten:5, sollMin:30, matrixFeld:'werkzeug', rhythmus:{ typ:'taeglich' } }); }
var TICKS=[['k-kaffee','Kaffee',1],['k-katzen','Katzen füttern',2],['k-muell','Müll',1],['k-gesicht','Gesicht',1],['k-haare','Haare',1],['k-toilette','Toilette',1],['k-essen','Essen',3]];
var kT=TICKS.map(function(t){ return tickKarte(t[0], t[1]); });
S.karten.push(kE, kS); kT.forEach(function(k){ S.karten.push(k); }); saveKarten();
// Historie: 2026-11-12-1 und 2026-11-13-1 abgeschlossen; kein 14.11.
S.historie.push({ tagId:d12+'-1', datum:d12, laufindex:1, urlaub:false, spielZufluss:0, startTs:iso(d12,'09:00'), endeTs:iso(d13,'00:30'), akku:50, punkteBilanz:300, abzuege:0, routinenBilanz:[], zeit:{dfm:0,privat:0,projekte:{}}, luecke:false, matrixSpur:[], log:[], akkuVerlauf:[], streak:0, erledigtHeute:0 });
S.historie.push({ tagId:d13+'-1', datum:d13, laufindex:1, urlaub:false, spielZufluss:0, startTs:iso(d13,'09:00'), endeTs:iso(d14,'12:03'), akku:50, punkteBilanz:500, abzuege:0, routinenBilanz:[], zeit:{dfm:0,privat:791*60,projekte:{}}, luecke:false, matrixSpur:[], log:[], akkuVerlauf:[], streak:0, erledigtHeute:0 });
var SX='s-bb2d29ae-0000-4000-8000-000000000001', sxVon=iso(d13,'22:52:21');
S.intraday.push({ id:SX, ts:iso(d14,'12:03'), von:sxVon, kartenId:kE.id, domaene:'privat', punkte:400, minuten:790.65, typ:'timer', tagId:d13+'-1' });
DB.set('intraday', S.intraday); saveHistorie();
// letzte Nacht Do→Fr: 13.11. 01:00–08:00, gebucht auf 2026-11-12-1
var nDoFr={ startTs:iso(d13,'01:00'), endeTs:iso(d13,'08:00'), dauerMin:420, punkte:schlafPunkte(7), schuldVorStd:0, schuldNachStd:0, abendAkku:null, akkuPrognose:null, nachtnotiz:'', gebucht:true, tagId:d12+'-1', korrektur:false, grund:'' };
S.meta.schlaf={ laeuft:null, schuldStd:0, letzte:nDoFr, abendAkku:null }; saveMeta();
var P={ appVersion:'4.5.3', postfachKarte:'pf-hf302', karten:[], korrekturen:[
  { datum:d13, grund:'Samstag nicht getrackt (Pascal 15.11.)', sitzungen:[
    { aktion:'aendern', id:SX, karteId:kE.id, von:sxVon, bis:'00:00', vermerk:'Erholung bis 00:00 gekürzt' },
    { aktion:'hinzu', karteId:kS.id, von:'00:00', bis:'09:00', vermerk:'Nacht Fr→Sa nachgetragen' } ] },
  { datum:d14, grund:'Samstag nicht getrackt (Pascal 15.11.)', sitzungen:[
    { aktion:'hinzu', karteId:kE.id, von:'09:00', bis:'00:00', vermerk:'Samstag erholt' },
    { aktion:'hinzu', karteId:kS.id, von:'00:00', bis:'09:00', vermerk:'Nacht Sa→So nachgetragen' } ],
    ticks:TICKS.map(function(t){ return { karteId:t[0], anzahl:t[2], vermerk:'nachgetragen' }; }) } ] };
var P9=schlafPunkte(9), morgenVor=JSON.stringify(S.tag.morgen===undefined ? null : S.tag.morgen), logVor=(S.tag.log||[]).length, liveVor=tagesPunkteLive();

// ══ 1.5 · Prüfung vor dem Anwenden nennt den Tag ══
var pr=korrekturPruefen(P), prT=hf30PruefungText(pr, 'abcdef01', ms(d15,'12:00')).split('\n');
pruef('1.5a korrekturPruefen: 11 Schritte, die Nächte tragen tag = App-Tag des Einschlafens (2026-11-13, 2026-11-14), kein Schritt abgewiesen', pr.length===11 && pr[1].was==='Nacht' && pr[1].tag===d13 && pr[3].was==='Nacht' && pr[3].tag===d14 && pr.every(function(z){ return z.status!=='abgewiesen'; }) && pr[0].tag===undefined && pr[4].tag===undefined, JSON.stringify(pr.map(function(z){ return [z.was, z.status, z.tag]; })));
pruef('1.5b Prüfzeile einer Nacht endet mit „· Tag TT.MM.“: „Tag 13.11.“ bzw. „Tag 14.11.“; Sitzungs- und Tick-Zeilen ohne Tag', /^✓ Nacht · 🌙 Schlafen · 14\.11\. 00:00–14\.11\. 09:00 · Tag 13\.11\.$/.test(prT[2]) && /^✓ Nacht · 🌙 Schlafen · 15\.11\. 00:00–15\.11\. 09:00 · Tag 14\.11\.$/.test(prT[4]) && !/Tag \d\d\.\d\d\./.test(prT[1]) && !/Tag \d\d\.\d\d\./.test(prT[3]) && !/Tag \d\d\.\d\d\./.test(prT[5]), prT.join(' | '));
pruef('1.5c hf30Tag: JJJJ-MM-TT → TT.MM., anderes unverändert', hf30Tag('2026-11-13')==='13.11.' && hf30Tag('2026-01-05')==='05.01.' && hf30Tag('x')==='x' && hf30Tag(null)==='');

// ══ 1 · Pflichtfall anwenden ══
HF27.korrSchritte=[]; syncImport(JSON.stringify(P)); var sch=HF27.korrSchritte.slice();
pruef('1a alle 11 Schritte angewendet (4 Sitzungen/Nächte, 7 Tick-Schritte), keine Abweisung', sch.length===11 && sch.every(function(s){ return s.status==='angewendet'; }), JSON.stringify(sch));
var kn=schlafZustand().korrekturNaechte||[], n14=kn.find(function(x){ return x.startTs===iso(d14,'00:00'); }), n15=kn.find(function(x){ return x.startTs===iso(d15,'00:00'); });
var h13=S.historie.find(function(h){ return h.tagId===d13+'-1'; }), h14=S.historie.find(function(h){ return h.datum===d14; });
pruef('1b Nacht 14.11. 00:00–09:00 in korrekturNaechte ohne alsLetzte, tagId 2026-11-13-1, 540 Min, Punkte nach Stufen, korrektur:true', !!n14 && !n14.alsLetzte && n14.tagId===d13+'-1' && n14.endeTs===iso(d14,'09:00') && n14.dauerMin===540 && n14.punkte===P9 && n14.korrektur===true && n14.grund==='Samstag nicht getrackt (Pascal 15.11.)', JSON.stringify(kn));
pruef('1c Nacht 15.11. 00:00–09:00 in korrekturNaechte ohne alsLetzte, tagId 2026-11-14-k; genau zwei Einträge, keiner mit alsLetzte', !!n15 && !n15.alsLetzte && n15.tagId===d14+'-k' && n15.dauerMin===540 && n15.punkte===P9 && kn.length===2 && !kn.some(function(x){ return x.alsLetzte; }), JSON.stringify(kn));
var l=schlafZustand().letzte;
pruef('1d letzte = Nacht 15.11. 00:00–09:00 mit tagId 2026-11-14-k, gebucht:true, korrektur:true; Schlafschuld 0', !!l && l.startTs===iso(d15,'00:00') && l.endeTs===iso(d15,'09:00') && l.tagId===d14+'-k' && l.gebucht===true && l.korrektur===true && schlafZustand().schuldStd===0, JSON.stringify(l));
var ks13=S.intraday.filter(function(e){ return e.typ==='korrektur-schlaf' && e.tagId===d13+'-1'; }), ks14=S.intraday.filter(function(e){ return e.typ==='korrektur-schlaf' && e.tagId===d14+'-k'; });
pruef('1e Tag 2026-11-13-1: Log „Nacht nachgetragen“ (art korrektur, Punkte der Nacht), Intraday korrektur-schlaf mit Schlafen-Karte, tagId, datum 2026-11-13, ts = Ende der Nacht', !!h13 && h13.log.some(function(x){ return x.titel==='Nacht nachgetragen' && x.art==='korrektur' && x.punkte===P9 && x.itemId===kS.id; }) && ks13.length===1 && ks13[0].kartenId===kS.id && ks13[0].punkte===logRund(P9) && ks13[0].datum===d13 && ks13[0].ts===iso(d14,'09:00') && ks13[0].quelle==='korrektur', JSON.stringify([h13 && h13.log, ks13]));
var tk14=S.intraday.filter(function(e){ return e.typ==='tick' && e.tagId===d14+'-k'; }), tkP=tk14.reduce(function(a,e){ return a+num(e.punkte); }, 0);
var erh14=S.intraday.find(function(e){ return e.typ==='korrektur' && e.kartenId===kE.id && e.tagId===d14+'-k'; });
pruef('1f Tag 2026-11-14-k angelegt (perKorrektur, notiz, startTs 09:00, endeTs 15.11. 00:00): Erholung 900 Min, 10 Ticks, Nacht im Log und Intraday; Bilanz = Erholung + Ticks + Nacht', !!h14 && h14.tagId===d14+'-k' && h14.perKorrektur===true && h14.notiz==='Nachtrag per Korrektur pf-hf302' && h14.startTs===iso(d14,'09:00') && h14.endeTs===iso(d15,'00:00') && !!erh14 && nah(erh14.minuten, 900, 0.1) && tk14.length===10 && ks14.length===1 && ks14[0].datum===d14 && ks14[0].ts===iso(d15,'09:00') && h14.log.some(function(x){ return x.titel==='Nacht nachgetragen' && x.punkte===P9; }) && nah(h14.punkteBilanz, num(erh14.punkte)+tkP+P9, 0.15), JSON.stringify([h14 && [h14.startTs, h14.endeTs, h14.punkteBilanz], erh14 && erh14.punkte, tkP, P9]));
pruef('1g App-Tag 15.11. unberührt: kein Tick auf Schlafen, kein Intraday typ schlaf, S.tag.morgen unverändert, Tages-Log und Live-Punkte wie vorher', ticksHeuteV3(kS).length===0 && !num(kS.ticksHeute) && !S.intraday.some(function(e){ return e.typ==='schlaf'; }) && JSON.stringify(S.tag.morgen===undefined ? null : S.tag.morgen)===morgenVor && (S.tag.log||[]).length===logVor && tagesPunkteLive()===liveVor, JSON.stringify([ticksHeuteV3(kS), S.tag.morgen, (S.tag.log||[]).length, logVor, tagesPunkteLive(), liveVor]));
var p13=S.meta.korrekturProtokoll.filter(function(e){ return e.datum===d13; }).pop(), p14=S.meta.korrekturProtokoll.filter(function(e){ return e.datum===d14; }).pop();
pruef('1h Protokollzeile „Nacht nachgetragen 00:00–09:00 · 9:00 Std · P · Tag <tagD> · Schlafschuld a → b Std“ je Nacht', !!p13 && p13.aenderungen.some(function(z){ return z==='Nacht nachgetragen 00:00–09:00 · 9:00 Std · '+fmtP(P9)+' P · Tag '+d13+' · Schlafschuld '+fbZahl(0,1)+' → '+fbZahl(0,1)+' Std'; }) && !!p14 && p14.aenderungen.some(function(z){ return z==='Nacht nachgetragen 00:00–09:00 · 9:00 Std · '+fmtP(P9)+' P · Tag '+d14+' · Schlafschuld '+fbZahl(0,1)+' → '+fbZahl(0,1)+' Std'; }), JSON.stringify([p13 && p13.aenderungen, p14 && p14.aenderungen]));
var stand=function(){ return JSON.stringify([S.intraday, S.historie.map(function(h){ return [h.tagId, h.startTs, h.endeTs, h.punkteBilanz, (h.log||[]).length]; }), S.meta.schlaf, ticksHeuteV3(kS).length, S.tag.morgen===undefined ? null : S.tag.morgen]); };
var vor1i=stand(); HF27.korrSchritte=[]; syncImport(JSON.stringify(P));
pruef('1i zweites Einspielen desselben Pakets ändert nichts (Stunden-Log, Tage, Schlaf, heute); kein Schritt abgewiesen', stand()===vor1i && HF27.korrSchritte.length===11 && HF27.korrSchritte.every(function(s){ return s.status!=='abgewiesen'; }), JSON.stringify(HF27.korrSchritte.map(function(s){ return s.status; })));

// ══ 1.1 · Nacht des laufenden Tags: wie bisher (schlafPunkteBuchen, nachtMerken) ══
var abgH=[]; var eH=korrekturAnwenden({ datum:d15, grund:'Mittagsschlaf', sitzungen:[{ aktion:'hinzu', karteId:kS.id, von:'11:00', bis:'12:30', vermerk:'x' }] }, abgH, null);
var lH=schlafZustand().letzte, knH=schlafZustand().korrekturNaechte;
pruef('1.1 Nacht am laufenden Tag (belFensterDatum = S.tag.datum): letzte Nacht, Buchung über schlafPunkteBuchen auf heute (Tick auf Schlafen), Merker alsLetzte in korrekturNaechte, Zeile „Nacht … Schlafschuld“', !abgH.length && !!lH && lH.startTs===iso(d15,'11:00') && lH.gebucht===true && lH.tagId===S.tag.tagId && ticksHeuteV3(kS).length===1 && knH.length===3 && knH.some(function(x){ return x.alsLetzte===true && x.startTs===iso(d15,'11:00') && x.tagId===S.tag.tagId; }) && !!eH && eH.aenderungen.some(function(z){ return /^Nacht 11:00–12:30 · 1:30 Std/.test(z) && /Schlafschuld/.test(z) && !/nachgetragen/.test(z); }), JSON.stringify([abgH, lH, knH, eH && eH.aenderungen]));

// ══ 1.3 · ältere Nacht (neuer:false): nachtAelter wie bisher ══
var abgA=[]; var eA=korrekturAnwenden({ datum:'2026-11-11', grund:'Nacht Mi→Do', sitzungen:[{ aktion:'hinzu', karteId:kS.id, von:'23:00', bis:'06:00', vermerk:'x' }] }, abgA, 'pf-alt');
var nA=(schlafZustand().korrekturNaechte||[]).find(function(x){ return x.startTs===iso('2026-11-11','23:00'); }), h11=S.historie.find(function(h){ return h.datum==='2026-11-11'; });
pruef('1.3 ältere Nacht bleibt im Weg von Hotfix 30 §4: korrekturNaechte mit tagId des Snapshots (2026-11-11-k), letzte unverändert, Zeile „… ältere Nacht — Schuld unverändert“', !abgA.length && !!nA && !nA.alsLetzte && nA.tagId==='2026-11-11-k' && !!h11 && h11.perKorrektur===true && schlafZustand().letzte.startTs===iso(d15,'11:00') && !!eA && eA.aenderungen.some(function(z){ return /^Nacht nachgetragen 23:00–06:00 · 7:00 Std/.test(z) && /ältere Nacht — Schuld unverändert/.test(z); }), JSON.stringify([abgA, nA, eA && eA.aenderungen]));

// ══ Hotfix 30.3 · Korrektur einer schon gebuchten Nacht = Differenz (kein zweites Buchen) ══
// Ausgang: letzte Nacht 13.11. 01:15–07:55, gebucht auf 2026-11-12-1 mit 70 P; laufender App-Tag 2026-11-15-1. Korrektur datum 2026-11-12, Schlafen „01:00“–„08:30“.
S.meta.schlaf.letzte={ startTs:iso(d13,'01:15'), endeTs:iso(d13,'07:55'), dauerMin:400, punkte:70, schuldVorStd:0, schuldNachStd:0, abendAkku:null, akkuPrognose:null, nachtnotiz:'', gebucht:true, tagId:d12+'-1', korrektur:false, grund:'' }; S.meta.schlaf.schuldStd=0; saveMeta();
var h12=S.historie.find(function(h){ return h.tagId===d12+'-1'; }), bil12=num(h12.punkteBilanz), log12=(h12.log||[]).length, P75=schlafPunkte(7.5), dP33=Math.round((P75-70)*10)/10;
var knVor33=(schlafZustand().korrekturNaechte||[]).filter(function(x){ return !x.alsLetzte; }).length, ks12Vor=S.intraday.filter(function(e){ return e.typ==='korrektur-schlaf' && e.tagId===d12+'-1'; }).length;
var heuteVor33=JSON.stringify([ticksHeuteV3(kS).length, S.tag.morgen===undefined ? null : S.tag.morgen, (S.tag.log||[]).length, tagesPunkteLive()]);
var abg33=[]; var e33=korrekturAnwenden({ datum:d12, grund:'Nacht Do→Fr verlängert', sitzungen:[{ aktion:'hinzu', karteId:kS.id, von:'01:00', bis:'08:30', vermerk:'x' }] }, abg33, 'pf-hf303');
var l33=schlafZustand().letzte;
pruef('30.3a schon gebuchte letzte Nacht ersetzt: keine zweite Buchung — kein neuer Eintrag ohne alsLetzte in korrekturNaechte, kein Intraday korrektur-schlaf auf 2026-11-12-1, kein Log „Nacht nachgetragen“', !abg33.length && (schlafZustand().korrekturNaechte||[]).filter(function(x){ return !x.alsLetzte; }).length===knVor33 && S.intraday.filter(function(e){ return e.typ==='korrektur-schlaf' && e.tagId===d12+'-1'; }).length===ks12Vor && !h12.log.some(function(x){ return x.titel==='Nacht nachgetragen'; }), JSON.stringify([abg33, schlafZustand().korrekturNaechte, e33 && e33.aenderungen]));
pruef('30.3b Bilanz von 2026-11-12-1 ändert sich genau um (neue Punkte − 70), Log „Nacht korrigiert“ mit der Differenz, Zeile „Nacht 01:00–08:30 · 7:30 Std … (±Differenz)“', dP33!==0 && nah(h12.punkteBilanz, bil12+dP33, 0.11) && (h12.log||[]).length===log12+1 && h12.log.some(function(x){ return x.titel==='Nacht korrigiert' && x.art==='korrektur' && x.punkte===dP33; }) && !!e33 && e33.aenderungen.some(function(z){ return /^Nacht 01:00–08:30 · 7:30 Std · /.test(z) && z.indexOf((dP33>=0?'+':'−')+fmtP(Math.abs(dP33)))>0 && !/nachgetragen/.test(z); }), JSON.stringify([bil12, h12.punkteBilanz, dP33, P75, h12.log, e33 && e33.aenderungen]));
pruef('30.3c letzte = 13.11. 01:00–08:30 mit tagId 2026-11-12-1 (unverändert), gebucht:true, neue Punkte; Tag 15.11. unverändert', !!l33 && l33.startTs===iso(d13,'01:00') && l33.endeTs===iso(d13,'08:30') && l33.tagId===d12+'-1' && l33.gebucht===true && l33.punkte===P75 && JSON.stringify([ticksHeuteV3(kS).length, S.tag.morgen===undefined ? null : S.tag.morgen, (S.tag.log||[]).length, tagesPunkteLive()])===heuteVor33, JSON.stringify([l33, heuteVor33]));
var vor33d=stand(); var abg33d=[]; var e33d=korrekturAnwenden({ datum:d12, grund:'Nacht Do→Fr verlängert', sitzungen:[{ aktion:'hinzu', karteId:kS.id, von:'01:00', bis:'08:30', vermerk:'x' }] }, abg33d, 'pf-hf303');
pruef('30.3d zweites Einspielen ändert nichts', e33d===null && !abg33d.length && stand()===vor33d && nah(h12.punkteBilanz, bil12+dP33, 0.11));

// ══ 3 · Version ══
pruef('3 App 4.5.9 · Build 2026-11-26-69 · sw.js Cache fokus4-v4.5.9-1', APP_VERSION==='4.5.9' && APP_BUILD==='2026-11-26-69' && /const CACHE = 'fokus4-v4\.5\.9-1'/.test(readFile('sw.js')));
suiteEnde('Hotfix 30.2 · Nächte vergangener Tage · Hotfix 30.3 gebuchte Nacht = Differenz (4.5.4)');
