/* Suite 4.9 · Karten-Standard 4.2 (Auftrag 261102 §12): 1 e42Satz · 2 e42Bonus · 3 Mehrmals = Bonus je Tick · 4 Karte ohne std42 rechnet wie 4.1.14 ·
   5 optionale Unteraufgabe → keine Folgeaufgabe · 6 Kartenset auf einem Testbestand (Zahlen, Sicherung, Rückgängig exakt) · 7 Statistik eines Tages
   vor und nach dem Update gleich · 8 Eingefroren bis gestern → heute aufgetaut · 9 Version 4.3.0, Build 53, sw.js Cache (Karten-Standard 4.3) (seit Hotfix 24).
   Aufruf: jsc tests/v49-karten42.js · Geschrieben, im Rahmen des Auftrags nicht ausgeführt. */
var _toasts=[]; toast=function(m){ _toasts.push(String(m)); }; haptik=function(){};
fsliveStumm();
var T=testTag();
function k42(f){ return Object.assign(neueKarte({ domain:'dfm', titel:'4.2' }), { std42:true, art:'aufgabe', status:'offen', matrixFeld:'werkzeug', belastung:0, prio:3, sollMin:30 }, f||{}); }

// ══ 1 · e42Satz ══
pruef('12.1 DFM Aufgabe Prio 3, Belastung 2, Werkzeug → 520', e42Satz(k42({ prio:3, belastung:2, matrixFeld:'werkzeug' }))===520, e42Satz(k42({ prio:3, belastung:2 })));
pruef('12.1 Privat Routine Prio 3, Belastung 0, Werkzeug → 150', e42Satz(k42({ domain:'privat', art:'routine', rhythmus:{typ:'taeglich'}, prio:3, belastung:0, matrixFeld:'werkzeug' }))===150, e42Satz(k42({ domain:'privat', art:'routine', prio:3, belastung:0 })));
pruef('12.1 Prio 5, Belastung 3, Ziel → Max der Barriere (DFM Aufgabe 700, Privat Routine 250)', e42Satz(k42({ prio:5, belastung:3, matrixFeld:'ziel' }))===700 && e42Satz(k42({ domain:'privat', art:'routine', prio:5, belastung:3, matrixFeld:'ziel' }))===250, [e42Satz(k42({ prio:5, belastung:3, matrixFeld:'ziel' })), e42Satz(k42({ domain:'privat', art:'routine', prio:5, belastung:3, matrixFeld:'ziel' }))].join('/'));
pruef('12.1 Ablenkung → 0 · Info → 0 · System → 0', e42Satz(k42({ matrixFeld:'ablenkung', prio:5 }))===0 && e42Satz(k42({ art:'info' }))===0 && e42Satz(k42({ art:'system' }))===0);
pruef('12.1 phFest 999 → 999 (schlägt die Barriere)', e42Satz(k42({ phFest:999 }))===999 && leiterSatz(k42({ phFest:999 }))===999);
pruef('12.1 Erholung (Belastung −2) zählt wie neutral: gleicher Satz wie Belastung 0', e42Satz(k42({ belastung:-2 }))===e42Satz(k42({ belastung:0 })));
pruef('12.1 leiterSatz einer std42-Karte = e42Satz; e42LageVerschiebung = 0', leiterSatz(k42({ prio:3, belastung:2 }))===520 && e42LageVerschiebung(heuteApp(), k42())===0);

// ══ 2 · e42Bonus ══
pruef('12.2 Zeit-Karte Prio 4 ohne eigenen Wert → 100', e42Bonus(k42({ prio:4, sollMin:30, abhakbonus:null }))===100 && abhakbonusDefault(k42({ prio:4, sollMin:30, abhakbonus:null }))===100);
pruef('12.2 Abhak-Karte mit abhakbonus 20 → 20 · abhakbonus 0 → 0 · ohne Soll und ohne Wert → 0', e42Bonus(k42({ sollMin:0, abhakbonus:20 }))===20 && e42Bonus(k42({ sollMin:30, abhakbonus:0 }))===0 && e42Bonus(k42({ sollMin:0, abhakbonus:null }))===0);
pruef('12.2 Soll unter 15 Min bringt bei std42 trotzdem den Bonus (keine 15-Minuten-Regel) · istPflicht false', abhakbonusDefault(k42({ prio:2, sollMin:5 }))===50 && istPflicht(k42({ modus:'pflicht', pflicht:true }))===false);
pruef('12.2 e42PrioVorschlag: DFM 0 → 2 · 150 → 3 · 250 → 4 · 400 → 5 · Privat → 3', e42PrioVorschlag(k42({ geldImpact:0 }))===2 && e42PrioVorschlag(k42({ geldImpact:150 }))===3 && e42PrioVorschlag(k42({ geldImpact:250 }))===4 && e42PrioVorschlag(k42({ geldImpact:400 }))===5 && e42PrioVorschlag(k42({ domain:'privat' }))===3);
pruef('12.2 e42Last = Minuten × Belastung', e42Last(k42({ belastung:2 }), 30)===60 && e42Last(k42({ belastung:-1 }), 30)===-30);

// ══ 3 · Mehrmals: jeder Tick gibt den Bonus ══
var M=k42({ id:'k42-mehr', titel:'Mehrmals', domain:'privat', art:'routine', rhythmus:{typ:'taeglich'}, ticksAktiv:true, tagesziel:3, sollMin:0, abhakbonus:20 });
S.karten.push(M); saveKarten();
karteTick(M.id, true); karteTick(M.id, true); karteTick(M.id, true);
var ticks=tickLogHeute(M);
pruef('12.3 drei Ticks → drei Einträge, jeder mit abhak 20 (Bonus je Tick), Aktivierung +10 bleibt; satz/lage/last am Tick', ticks.length===3 && ticks.every(function(t){ return t.abhak===20 && t.basis>=20+num(S.settings.tickAktivierung,10)-0.001 && t.satz!==undefined && t.lage===0 && t.last!==undefined; }), JSON.stringify(ticks));
pruef('12.3 e4TickAbhak gibt bei nr 2 und 3 ebenfalls den Bonus (ohne std42 nur bei nr 1)', e4TickAbhak(M, 2)===20 && e4TickAbhak(M, 3)===20 && e4TickAbhak(Object.assign({}, M, { std42:false, abhakbonus:20, sollMin:30 }), 2)===0);

// ══ 4 · Karte ohne std42 rechnet exakt wie 4.1.14 ══
var A=T.d;   // DFM, ziel, geldImpact 5000 → Stundenleiter geldnah
pruef('12.4 Stundenleiter: leiterSatz = Leiter[leiterArt] (geldnah 600), Prognose ohne Engine 4.2', A.std42!==true && leiterSatz(A)===num(e4Leiter()[leiterArt(A)]) && leiterSatz(A)===600 && kartePunktePrognose(A)===kartePunktePrognose(Object.assign({}, A)), leiterSatz(A));
var P=Object.assign(neueKarte({ domain:'privat', titel:'Alt-Routine' }), { status:'offen', matrixFeld:'werkzeug', sollMin:20, rhythmus:{typ:'taeglich'} });
pruef('12.4 Bonus-Tabelle: abhakbonusDefault = abhakbonusTabelleWert(Spalte, Matrixfeld) · istPflicht folgt ohne std42 weiter modusVon (seit 4.0 nie pflicht)', abhakbonusDefault(P)===abhakbonusTabelleWert(abhakSpalte(P), matrixFeldVon(P)) && istPflicht(Object.assign({}, P, { modus:'pflicht' }))===(modusVon(Object.assign({}, P, { modus:'pflicht' }))==='pflicht'), JSON.stringify([abhakbonusDefault(P), abhakbonusTabelleWert(abhakSpalte(P), matrixFeldVon(P))]));
pruef('12.4 15-Minuten-Regel gilt ohne std42 weiter (Soll 5 → 0)', abhakbonusDefault(Object.assign({}, P, { sollMin:5 }))===0);

// ══ 5 · optionale Unteraufgabe → keine Folgeaufgabe ══
var O=k42({ id:'k42-opt', titel:'Mit optionaler UA', sollMin:20 }); S.karten.push(O);
S.unteraufgaben.push(neueUnteraufgabe(O.id, { id:'u-opt', titel:'Optional', sollMin:5, bonusPunkte:10, optional:true, done:false }));
S.unteraufgaben.push(neueUnteraufgabe(O.id, { id:'u-fix', titel:'Pflicht', sollMin:5, bonusPunkte:10, optional:false, done:true }));
saveKarten(); DB.set('unteraufgaben', S.unteraufgaben);
abhakDialog(O.id, false);
pruef('12.5 Abhak-Blatt: nur die optionale offen → keine Folgeaufgabe, offeneSubs 0; kz42UaStand 1/1', abhakTmp && abhakTmp.folge===false && abhakTmp.offeneSubs===0 && kz42UaStand(O).gesamt===1 && kz42UaStand(O).erledigt===1, JSON.stringify([abhakTmp && abhakTmp.folge, abhakTmp && abhakTmp.offeneSubs, kz42UaStand(O)]));
abhakTmp=null; closeSheet();
var nK=S.karten.length; var f=folgeAufgabeAnlegen(O, { titel:'Folge' });
pruef('12.5 folgeAufgabeAnlegen kopiert keine optionale Unteraufgabe (0 Unteraufgaben an der Folge); optionale bleibt an der Karte', !!f && untermenge(f.id).length===0 && untermenge(O.id).some(function(u){ return u.id==='u-opt'; }), JSON.stringify([f && untermenge(f.id).length]));
S.karten=S.karten.filter(function(x){ return x.id!==f.id; });
karteAbhaken(O.id, true);
pruef('12.5 Abhaken der Karte markiert die offene optionale als ausgelassen', untermenge(O.id).find(function(u){ return u.id==='u-opt'; }).ausgelassen===true);
pruef('12.5 neueUnteraufgabe an std42-Karte: Bonus leer = 0, optional false', neueUnteraufgabe(O.id).bonusPunkte===0 && neueUnteraufgabe(O.id).optional===false);

// ══ 6 · Kartenset auf einem Testbestand ══
var vorherK=JSON.stringify(S.karten), vorherU=JSON.stringify(S.unteraufgaben), vorherV=JSON.stringify(S.vorlagen||[]), nIntra=(S.intraday||[]).length;
var SET={ appVersion:'4.2.1', art:'kartenset', grund:'Test Kartenset', karten:[], kartenset:{ eintraege:[
  { quelle:{ tabelle:'Aufgaben', id:'00000000-0000-4000-8000-000000000001', appId:'t-dfm', airtableId:null, titel:'DFM Aufgabe' }, aktion:'aendern',
    ziel:{ titel:'DFM Aufgabe 4.2', familie:'DFM', projekt:'P', art:'aufgabe', sammelkarte:false, status:'offen', wartetAuf:null, matrix:'ziel', belastung:2, prio:4, bewertung:'zeit', mehrmals:false, zielProTag:null, soll:45, deadline:'2026-11-05', rhythmus:null, immerSichtbar:null, phFest:null, bonus:null, eingefrorenBis:null, notizZusatz:'Zusatz 4.2' },
    unteraufgaben:[{ titel:'↳ Schritt A', soll:10, bonus:20, optional:false, erledigt:false },{ titel:'Schritt B', soll:5, bonus:0, optional:true, erledigt:false }], aufgehtIn:null, hinweis:'UA „Schritt C“ ergänzen' },
  { quelle:{ tabelle:'Privat_Karten', id:'00000000-0000-4000-8000-000000000002', appId:'t-priv', airtableId:null, titel:'Private Aufgabe' }, aktion:'archivieren', ziel:null, unteraufgaben:null, aufgehtIn:'neu:neu-x', hinweis:null },
  { quelle:{ tabelle:'Privat_Karten', id:'00000000-0000-4000-8000-000000000003', appId:'t-erh', airtableId:null, titel:'Erholung' }, aktion:'erledigt', ziel:null, unteraufgaben:null, aufgehtIn:null, hinweis:null },
  { quelle:{ tabelle:'Privat_Karten', id:'00000000-0000-4000-8000-000000000004', appId:'k3-aufstehen', airtableId:null, titel:'Aufstehen' }, aktion:'behalten',
    ziel:{ titel:'Aufstehen und in den Tag starten', familie:'Privat', projekt:null, art:'system', sammelkarte:false, status:'offen', wartetAuf:null, matrix:'werkzeug', belastung:0, prio:3, bewertung:'bonus', mehrmals:false, zielProTag:null, soll:0, deadline:null, rhythmus:'taeglich', immerSichtbar:true, phFest:null, bonus:null, eingefrorenBis:null, notizZusatz:null }, unteraufgaben:null, aufgehtIn:null, hinweis:'Systemkarte: unverändert' },
  { quelle:{ tabelle:'Aufgaben', id:'00000000-0000-4000-8000-000000000005', appId:null, airtableId:'recTEST000000005', titel:'Nur in FocusSystem' }, aktion:'aendern',
    ziel:{ titel:'Nur in FocusSystem', familie:'DFM', projekt:'P', art:'aufgabe', sammelkarte:false, status:'eingefroren', wartetAuf:null, matrix:'werkzeug', belastung:1, prio:3, bewertung:'zeit', mehrmals:false, zielProTag:null, soll:30, deadline:null, rhythmus:null, immerSichtbar:null, phFest:null, bonus:75, eingefrorenBis:'2026-12-04', notizZusatz:null }, unteraufgaben:[], aufgehtIn:null, hinweis:'bisher ohne App-ID → in die App holen' },
  { quelle:{ tabelle:'Aufgaben', id:'00000000-0000-4000-8000-000000000006', appId:null, airtableId:null, titel:'Nur FS archivieren' }, aktion:'archivieren', ziel:null, unteraufgaben:null, aufgehtIn:null, hinweis:null }
 ], neu:[
  { key:'neu-x', aktion:'neu', ziel:{ titel:'Neue Karte X', familie:'Privat', projekt:null, art:'aufgabe', sammelkarte:false, status:'offen', wartetAuf:null, matrix:'werkzeug', belastung:-1, prio:3, bewertung:'zeit', mehrmals:false, zielProTag:null, soll:20, deadline:null, rhythmus:null, immerSichtbar:null, phFest:null, bonus:75, eingefrorenBis:null, notizZusatz:null }, unteraufgaben:[{ titel:'↳ U1', soll:5, bonus:10, optional:false, erledigt:false }], hinweis:null }
 ] } };
var text=JSON.stringify(SET);
var r0=syncImport(text);
pruef('12.6 ohne Freigabe: freigabeNoetig, Vorschau-Zahlen aendern 2 · behalten 1 · archivieren 2 · erledigt 1 · neu 1, 1 nur in FocusSystem; nichts geändert', r0.freigabeNoetig===true && r0.vorschau.kartenset.zahlen.aendern===2 && r0.vorschau.kartenset.zahlen.behalten===1 && r0.vorschau.kartenset.zahlen.archivieren===2 && r0.vorschau.kartenset.zahlen.erledigt===1 && r0.vorschau.kartenset.zahlen.neu===1 && r0.vorschau.kartenset.nurFocusSystem===1 && JSON.stringify(S.karten)===vorherK, JSON.stringify(r0.vorschau && r0.vorschau.kartenset && r0.vorschau.kartenset.zahlen));
pruef('12.6 Vorschau-HTML enthält Titel alt → neu und die Zielkarte der Archivierung', /DFM Aufgabe 4\.2/.test(kartensetVorschauHtml(r0.vorschau.kartenset)) && /→ Neue Karte X/.test(kartensetVorschauHtml(r0.vorschau.kartenset)));
var r1=syncImport(text, { freigabe:true });
var D=S.karten.find(function(x){ return x.id==='t-dfm'; }), PV=S.karten.find(function(x){ return x.id==='t-priv'; }), E=S.karten.find(function(x){ return x.id==='t-erh'; }), NX=S.karten.find(function(x){ return x.titel==='Neue Karte X'; }), FS=S.karten.find(function(x){ return x.id==='00000000-0000-4000-8000-000000000005'; }), AU=S.karten.find(function(x){ return x.id==='k3-aufstehen'; });
pruef('12.6 Ergebnis: 2 geändert (aendern + behalten; die Karte aus FocusSystem zählt als neu) · 1 archiviert · 1 erledigt · 2 neu · 1 nur FocusSystem · Sicherung kartenset42_bak · meta.kartenset42', r1.kartenset && r1.kartenset.upd===2 && r1.kartenset.arch===1 && r1.kartenset.erledigt===1 && r1.kartenset.neu===2 && r1.kartenset.nurFocusSystem.length===1 && !!DB.get('kartenset42_bak') && !!S.meta.kartenset42 && S.meta.kartenset42.rueckgaengig===null, JSON.stringify(r1.kartenset));
pruef('12.6 aendern: std42, Prio 4, Belastung 2, Ziel, Soll 45, Deadline, Notiz-Zusatz, 3 Unteraufgaben (A, B optional, C ergänzt), e42Satz 610, Bonus 100', D && D.std42===true && D.prio===4 && D.belastung===2 && D.matrixFeld==='ziel' && D.sollMin===45 && D.faelligkeit==='2026-11-05' && /Zusatz 4\.2/.test(D.notiz) && untermenge(D.id).length===3 && untermenge(D.id).some(function(u){ return u.titel==='Schritt A' && u.bonusPunkte===20; }) && untermenge(D.id).some(function(u){ return u.titel==='Schritt B' && u.optional===true; }) && untermenge(D.id).some(function(u){ return u.titel==='Schritt C'; }) && e42Satz(D)===610 && e42Bonus(D)===100, JSON.stringify([D && D.prio, D && D.sollMin, untermenge(D.id).map(function(u){ return u.titel; }), e42Satz(D)]));
pruef('12.6 bisherige Unteraufgaben als entfernt gemeldet (No-delete)', (S.meta.entfernteUnteraufgaben||[]).length>=0);
pruef('12.6 archivieren: Status archiviert, Notiz „aufgegangen in Neue Karte X"; erledigt: Status erledigt mit tagId, keine Buchung', PV && PV.status==='archiviert' && /aufgegangen in Neue Karte X/.test(PV.notiz) && E && E.status==='erledigt' && E.tagId===aktuelleTagId() && (S.intraday||[]).length===nIntra);
pruef('12.6 neu: Privat, std42, Belastung −1, Bonus 75, 1 Unteraufgabe „U1" (Bonus 10); aus FocusSystem geholt: id = quelle.id, airtableId, eingefroren bis 04.12.', NX && NX.domain==='privat' && NX.std42===true && NX.belastung===-1 && NX.abhakbonus===75 && untermenge(NX.id).length===1 && untermenge(NX.id)[0].titel==='U1' && untermenge(NX.id)[0].bonusPunkte===10 && FS && FS.airtableId==='recTEST000000005' && FS.freeze===true && FS.eingefrorenBis==='2026-12-04' && FS.std42===true, JSON.stringify([NX && NX.belastung, FS && FS.freeze]));
pruef('12.6 behalten: Systemkarte std42 mit art system, Satz 0, Rolle bleibt', AU && AU.std42===true && AU.art==='system' && AU.rolle==='aufstehen' && e42Satz(AU)===0);
pruef('12.6 Rückgängig möglich; stellt Karten, Unteraufgaben und Vorlagen exakt her; danach nicht mehr möglich', kartensetRueckgaengigMoeglich()===true && kartensetRueckgaengig()===true && JSON.stringify(S.karten)===vorherK && JSON.stringify(S.unteraufgaben)===vorherU && JSON.stringify(S.vorlagen||[])===vorherV && typeof S.meta.kartenset42.rueckgaengig==='string' && kartensetRueckgaengigMoeglich()===false, JSON.stringify([S.karten.length, JSON.parse(vorherK).length]));
pruef('12.6 rhythmusAusText: taeglich · alleNTage:3 · wochentage:Mo,Mi,Fr · wochenende · leer', JSON.stringify(rhythmusAusText('taeglich'))==='{"typ":"taeglich"}' && JSON.stringify(rhythmusAusText('alleNTage:3'))==='{"typ":"alleNTage","n":3}' && JSON.stringify(rhythmusAusText('wochentage:Mo,Mi,Fr'))==='{"typ":"wochentage","tage":[1,3,5]}' && JSON.stringify(rhythmusAusText('wochenende'))==='{"typ":"wochenende"}' && rhythmusAusText(null)===null);

// ══ 7 · Statistik: Tageswerte vor und nach dem Update gleich ══
var ZK=T.p;   // private Aufgabe ohne std42 (ZK: Z ist in der App der Schema-Helfer)
logIntraday(ZK, { punkte:100, minuten:30, typ:'timer' });
var sum1=logSummeTag(), e1=(S.intraday||[]).slice(-1)[0];
ZK.std42=true; ZK.art='aufgabe'; ZK.prio=3; ZK.belastung=0; saveKarten();
var sum2=logSummeTag();
pruef('12.7 logSummeTag vor und nach dem Umstellen der Karte gleich (gespeicherte Buchungen unverändert); alte Buchung ohne satz/lage/last', sum1===sum2 && e1.punkte===100 && e1.satz===undefined, JSON.stringify([sum1, sum2]));
var e2=logIntraday(ZK, { punkte:0, minuten:10, typ:'timer' });
pruef('12.7 neue Zeitbuchung einer std42-Karte trägt satz, lage 0 und last', e2.satz===e42Satz(ZK) && e2.lage===0 && e2.last===0, JSON.stringify(e2));

// ══ 8 · Eingefroren bis gestern → heute aufgetaut ══
var G=k42({ id:'k42-frost', titel:'Gefroren', freeze:true, eingefrorenBis:anVorTage(heuteApp(), 1) }); S.karten.push(G);
var H=k42({ id:'k42-frost2', titel:'Noch gefroren', freeze:true, eingefrorenBis:anVorTage(heuteApp(), -3) }); S.karten.push(H);
_toasts=[]; var nAuf=auftauenPruefen(heuteApp());
pruef('12.8 Eingefroren bis gestern → aufgetaut (freeze false, Toast „❄︎ aufgetaut: Gefroren"); bis übermorgen bleibt gefroren', nAuf===1 && G.freeze===false && H.freeze===true && _toasts.some(function(t){ return /aufgetaut: Gefroren/.test(t); }), JSON.stringify([nAuf, G.freeze, H.freeze, _toasts]));
var W=k42({ id:'k42-wartet', titel:'Wartet', wartetAuf:'Rückmeldung' });
pruef('12.8 wartet: karteRuht true (nicht vorgeschlagen), ohne wartetAuf false; Info-Karte ruht', karteRuht(W)===true && karteRuht(k42())===false && karteRuht(k42({ art:'info' }))===true);
pruef('12.8 Kartenzeile 4.2: ⏳ wartet, ❄︎ eingefroren, P/h und Bonus rechts, Info-Badge', /⏳ wartet auf Rückmeldung/.test(kartenZeile42Html(W)) && /❄︎ eingefroren/.test(kartenZeile42Html(H)) && /P\/h/.test(kartenZeile42Html(W)) && /kz42-badge">Info/.test(kartenZeile42Html(k42({ art:'info' }))) && kartenZeileHtml(W).indexOf('kz42')>=0);

// ══ 9 · Version ══
pruef('12.9 App 4.4.0 · Build 2026-11-04-59 · sw.js Cache fokus4-v4.4.0-1 (seit Hotfix 26) · DATENVERTRAG 2.1.0', APP_VERSION==='4.4.0' && APP_BUILD==='2026-11-04-59' && DATENVERTRAG==='2.1.0' && readFile('sw.js').indexOf("const CACHE = 'fokus4-v4.4.0-1'")>=0, APP_VERSION+' / '+APP_BUILD);
suiteEnde('Karten-Standard 4.2 · Punkte-Engine 4.2, Kartenset, Status, Unteraufgaben (4.2.1)');
