/* Suite 5.2 · Hotfix 25 (Auftrag 261103 §6): A Statusleiste 4.2 ohne .f4-ring/Avatar, Titel links, ⚙ vorhanden, Tableiste 🔗 🔍 Fokus 🛍 📊 ·
   B tagesprognose43 mit festen Testdaten (Plan, verspätete Karte, laufende Karte, Familie), diaGroessen/tagesprognoseHeute/k43PlanPrognose/Normaltag-Ersatz ·
   C jede Stelle aus §4.2: Skala ohne Prognose, Prognose abgeschnitten (Mini-Kurve, Tagesampel, Tagesverlauf, Leistung, Prognose je Familie, Balken 18 px,
   Wochentags-Balken, Blockade-Insights, Rang, Punkteleiste, Münzen heute, Tagesform) · D Version 4.3.1, Build 54, sw.js Cache.
   Familienwechsel ohne Zwilling und P2 prüft der Dienst (FocusSystem: npm run test-hotfix25, betrieb/korrektur_261103_hotfix25_zwilling.js).
   Aufruf: jsc tests/v52-hotfix25.js · Die Abschnitte liefen während der Umsetzung als Rauchtests (Bericht); die Suite als Ganzes bei A/C. */
var _toasts=[]; toast=function(m){ _toasts.push(String(m)); }; haptik=function(){}; var confirm=function(){ return true; };
fsliveStumm();

// ══ A · Statusleiste und Tableiste (§1, §2) ══
var K=testTag(); renderStatusbar(); var h=el('f4sb').innerHTML;
pruef('A-L1 Statusleiste 4.2: Punkteleiste sBar, Erholung, Kennzeile f4n-kz, Viererzeile f4n-r4, Tagesdiagramm', /id="sBar"/.test(h) && /class="erh"/.test(h) && /f4n-kz/.test(h) && /f4n-r4/.test(h) && /f4n-dia/.test(h) && /sZKonto/.test(h));
pruef('A-L2 ohne Ring und Avatar, ⚙ nach .rz', !/tbRing/.test(h) && !/<img/.test(h) && /<div class="rz">[\s\S]*<\/div><button type="button" class="k43-einst hf25-einst" data-k43einst="1"/.test(h));
pruef('A-L3 keine schmale Leiste 4.3 mehr', !/k43-sb/.test(h));
S.tag=null; F4N.key=''; f4StatusleisteRender(); var h0=el('f4sb').innerHTML; pruef('A-L4 Kein Tag gestartet: ohne Ring, mit ⚙', /Kein Tag gestartet/.test(h0) && !/tbRing/.test(h0) && /data-k43einst/.test(h0));
var src=readFile('index.html'); var nav=src.slice(src.indexOf('<nav id="nav">'), src.indexOf('</nav>'));
pruef('A-T1 Tableiste 🔗 🔍 Fokus 🛍 📊, keine ⛓ ⌕ ◇ ▤', /🔗<\/span>Ketten/.test(nav) && /🔍<\/span>Suche/.test(nav) && /🛍<\/span>Shop/.test(nav) && /📊<\/span>Statistik/.test(nav) && !/[⛓⌕◇▤]/.test(nav) && /aria-label="Fokus"/.test(nav));

// ══ B · Prognose aus der Tageskette (§3) ══
S.ui.spezial=null;
var K=testTag(); var heute=heuteApp();
function _k(id){ return S.karten.find(function(x){ return x.id===id; }); }
// Testkarten: A DFM 30 Min Plan 10:00 (Vergangenheit? nein: Startzeit relativ setzen), B DFM 20 Min ohne Plan, C privat 40 Min läuft mit 10 Min gebucht
var A=Object.assign(neueKarte({ titel:'A', domain:'dfm' }), { id:'pa', std42:true, art:'aufgabe', status:'offen', matrixFeld:'werkzeug', belastung:0, prio:3, sollMin:30, projekt:'P', faelligkeit:heute });
var B=Object.assign(neueKarte({ titel:'B', domain:'dfm' }), { id:'pb', std42:true, art:'aufgabe', status:'offen', matrixFeld:'werkzeug', belastung:0, prio:2, sollMin:20, projekt:'P', faelligkeit:heute });
var C=Object.assign(neueKarte({ titel:'C', domain:'privat' }), { id:'pc', std42:true, art:'aufgabe', status:'offen', matrixFeld:'werkzeug', belastung:0, prio:4, sollMin:40, faelligkeit:heute });
S.karten=S.karten.filter(function(k){ return k.rolle; }).concat([A,B,C]); saveKarten();
var vergangen=new Date(Date.now()-3600000), zukunft=new Date(Date.now()+2*3600000); var hhmm=function(d){ return String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0'); };
S.tagesketten=[{ id:'tk43-fokus1-'+heute, name:'Fokus 1', art:'block', datum:heute, block:'fokus1', karten:['pa','pb','pc'], plan:{ pa:{ start:hhmm(zukunft), min:30 }, pb:{ start:hhmm(vergangen), min:20 } }, quelle:'tagesplan' },{ id:'tk43-tag-'+heute, name:'Heute gesamt', art:'tag', datum:heute, karten:['pa','pb','pc'], quelle:'tagesplan' }]; DB.set('tagesketten', S.tagesketten);
fokusStarten('pc'); S.fokus.startMs=Date.now()-10*60000;
var t=tagesprognose43();
var satzA=leiterSatz(A), satzB=leiterSatz(B), satzC=leiterSatz(C), bA=abhakbonusDefault(A), bB=abhakbonusDefault(B), bC=abhakbonusDefault(C);
var erwartet=30/60*satzA+bA + 20/60*satzB+bB + 30/60*satzC+bC;
pruef('B-P1 Prognose = ist + Σ (Plan-Minuten bzw. Soll − gebucht) × P/h + Bonus; laufende Karte mit Rest 30', nah(t.prognose, t.ist+erwartet, 1) && nah(t.endeDfm, t.dfm+30/60*satzA+bA+20/60*satzB+bB, 1) && nah(t.endePrivat, t.privat+30/60*satzC+bC, 1), JSON.stringify({ t:t.prognose, ist:t.ist, erw:erwartet, dfm:t.endeDfm, priv:t.endePrivat }));
pruef('B-P2 Zeitpunkte: laufende C zuerst ab jetzt, B (Plan vergangen) direkt danach, A (Plan in der Zukunft) zur Planzeit', t.verlauf.length===3 && t.verlauf[0].id==='pc' && Math.abs(Date.parse(t.verlauf[0].ts)-(Date.now()+30*60000))<5000 && t.verlauf[1].id==='pb' && Date.parse(t.verlauf[1].ts)-Date.parse(t.verlauf[0].ts)===20*60000 && t.verlauf[2].id==='pa' && Math.abs(Date.parse(t.verlauf[2].ts)-(zukunft.getTime()-zukunft.getSeconds()*1000-zukunft.getMilliseconds()+30*60000))<1000, JSON.stringify(t.verlauf));
pruef('B-P3 karteRest = Rest der laufenden Karte, Familie privat', t.karteFam==='privat' && nah(t.karteRest, 30/60*satzC+bC, 1));
var g=diaGroessen(); pruef('B-P4 diaGroessen.prognoseHeute = tagesprognose43, Tempo-Hochrechnung bleibt als prognoseAlt', nah(g.prognoseHeute, t.prognose, 0.5) && g.prognoseAlt!=null && g.prognose43 && g.prognose43.karten===3);
var T=tagesprognoseHeute(); pruef('B-P5 tagesprognoseHeute: Teile aus 43, max ohne Prognose (= max(Ziel, Ist))', nah(T.prognose, t.prognose, 0.5) && T.max===Math.max(1, T.ziel, T.dfm+T.privat) && nah(T.restDfm+T.restPrivat+T.karte, t.prognose-t.ist, 1), JSON.stringify(T));
var planP=k43PlanPrognose({ bloecke:[{ karten:[{ id:'pa', min:30 },{ id:'pb', min:20 }] }] }); pruef('B-P6 k43PlanPrognose = dieselbe Rechnung', nah(planP, Math.round(30/60*satzA+bA+20/60*satzB+bB), 1), planP);
var pg=hf25Normaltag(); pruef('B-P7 Ersatz für prognoseHeute(): prognose aus der Kette, k=1', nah(pg.prognose, t.prognose, 0.5) && pg.k===1 && pg.kette===true);
S.fokus={ laeuft:false }; fokusZeitEinbuchen && 0; var t2=tagesprognose43(); pruef('B-P8 ohne laufende Karte: C mit Soll − gebucht (40 − 10 = 30)', nah(t2.prognose, t.prognose, 1) && t2.karteRest===0);
S.tag.endeTs=jetztIso(); var t3=tagesprognose43(); pruef('B-P9 Tag geschlossen: Prognose = Ist', t3.prognose===t3.ist && t3.verlauf.length===0);

// ══ C · Skalierung (§4) ══
var K=testTag(); var heute=heuteApp(); var src=readFile('index.html');
function _k(id){ return S.karten.find(function(x){ return x.id===id; }); }
// große Kette → Prognose weit über dem Ziel
var L=[]; for(var i=0;i<6;i++){ var k=Object.assign(neueKarte({ titel:'K'+i, domain:i%2?'privat':'dfm' }), { id:'pk'+i, std42:true, art:'aufgabe', status:'offen', matrixFeld:'ziel', belastung:0, prio:5, sollMin:120, projekt:'P', faelligkeit:heute }); L.push(k); }
S.karten=S.karten.filter(function(k){ return k.rolle; }).concat(L); saveKarten(); S.settings.tagesZielDfm=500; S.settings.zielWeDfm=500; DB.set('settings', S.settings);
S.tagesketten=[{ id:'tk43-tag-'+heute, name:'Heute gesamt', art:'tag', datum:heute, karten:L.map(function(k){ return k.id; }), quelle:'tagesplan' }]; DB.set('tagesketten', S.tagesketten);
var g=diaGroessen(); pruef('C-S0 Testlage: Prognose deutlich über dem Tagesziel', g.prognoseHeute>g.zielHeute*1.5, JSON.stringify({ p:g.prognoseHeute, z:g.zielHeute }));
// 1 Mini-Kurve
var mk=f4MiniKurveSvg(g); var m=/L250,(-?[\d.]+)" stroke="#e8e9ec" stroke-width="1.5" stroke-dasharray="4 3"/.exec(mk);
pruef('C-S1 Mini-Kurve: Skala ohne Prognose (Prognoselinie endet über dem Rand, y < 0), SVG schneidet ab', !!m && parseFloat(m[1])<0 && /overflow:hidden/.test(mk), m && m[1]);
// 2 Ampel-Kurve
var a={ ist:g.punkteHeute, nowX:belX(jetztIso()), von:belX(jetztIso())-3, bis:belX(jetztIso())+1, kHeute:[{ x:belX(jetztIso())-3, p:0 },{ x:belX(jetztIso())-0.1, p:g.punkteHeute }] };
var ak=ampelKurveSvg(a); var m2=/ L[\d.]+ (-?[\d.]+)" fill="none" stroke="[^"]+" stroke-width="1.5" stroke-dasharray="4 3"/.exec(ak);
pruef('C-S2 Ampel-Kurve: Prognoselinie ungeklemmt über den Rand (y < 0), SVG schneidet ab', !!m2 && parseFloat(m2[1])<0 && /overflow:hidden/.test(ak), m2 && m2[1]);
// 3 Tagesverlauf (Quelle): Prognose-Serien markiert, nicht in der Skala, mit clipPath
pruef('C-S3 Tagesverlauf: prognose:true an den Serien, Skala ohne sie, clip-path auf dem Pfad', /st:DIA_LINIE\.prognose, prognose:true/.test(src) && /if\(se\.prognose\) return; se\.pts\.forEach/.test(src) && /\(se\.prognose \? Yu : Y\)/.test(src) && /se\.prognose \? ' clip-path="url\(#'\+clipId\+'\)"' : ''/.test(src));
// 4 Leistung (Quelle + Lauf)
pruef('C-S4 Leistung: hiDaten ohne prog, Prognosepfad in <g clip-path>', /hiDaten=Math\.max\(1, Math\.max\.apply\(null, echt\.concat\(\[med\|\|0\]\)\)\)\*1\.1/.test(src) && /<g clip-path="url\(#'\+clipId\+'\)"><path d="M'\+x\.toFixed\(1\)\+','\+y\.toFixed\(1\)\+' L'\+x\.toFixed\(1\)\+','\+A\.Y\(prog\)/.test(src));
// 5 Tagesprognose je Familie: Skala aus Ist und Ziel, Breiten ≤ 100 %
var fp=f4PrognoseHtml(); var ws=(fp.match(/width:([\d.]+)%/g)||[]).map(function(x){ return parseFloat(x.slice(6)); });
pruef('C-S5 Prognose-Balken je Familie: kein Segment breiter als 100 %, Zielmarke bei 100 % (Skala = Ziel)', ws.length>0 && ws.every(function(w){ return w<=100.001; }) && /class="z" style="left:100\.0%"/.test(fp), JSON.stringify(ws));
// 6 Tagesprognose-Balken 18 px
var T=tagesprognoseHeute(); var pb=tagesprognoseBalkenHtml(T); var ws2=(pb.match(/width:([\d.]+)%/g)||[]).map(function(x){ return parseFloat(x.slice(6)); });
pruef('C-S6 Balken 18 px: max = max(Ziel, Ist) < Prognose, Segmente geklemmt auf die Skala, Skala-Beschriftung = Ziel', T.max<T.prognose && T.max===Math.max(1, T.ziel, T.dfm+T.privat) && ws2.every(function(w){ return w<=100.001; }) && pb.indexOf('<span>'+fmtP(T.max)+'</span>')>=0, JSON.stringify({ max:T.max, p:T.prognose }));
// 7 Wochentags-Balken (Quelle)
pruef('C-S7 Wochentags-Balken: mx ohne pg.prognose, Prognose aus hf25Normaltag, Segment max-width 100 %', /pg\?\[pg\.ist, pg\.ziel\]:\[\]/.test(src) && /pg=tagOffen\(\)\?hf25Normaltag\(\):null/.test(src) && /\.an-wt \.an-bar \.track i\.prog\{max-width:100%\}/.test(src));
// 8 Blockade-Insights
var I={ g:{ dfm:100, zielDfm:500, startMs:Date.now()-3600000, tagesEndeMs:Date.now()+3600000 }, T:{ endeDfm:2000, prognose:2000 } }; var es=k43EndeSvg(I, 3000);
var m8=/330,(-?[\d.]+)" fill="none" stroke="#3b82f6"/.exec(es), m9=/330,(-?[\d.]+)" fill="none" stroke="#3ecf8e"/.exec(es);
pruef('C-S8 „So endet dein Tag“: Skala aus Ziel und Ist, Prognoselinien ungeklemmt (y < 0) in <g clip-path>', !!m8 && parseFloat(m8[1])<0 && !!m9 && parseFloat(m9[1])<0 && /<clipPath id="k43c\d+"><rect x="30" y="0" width="300" height="130"\/><\/clipPath>/.test(es) && /<g clip-path="url\(#k43c\d+\)"><polyline/.test(es), (m8&&m8[1])+'/'+(m9&&m9[1]));
// 9 Rang (Quelle + Lauf)
var rg=rangDiagrammHtml(rangMass()); pruef('C-S9 Rang: hi ohne progMed, Prognosepfad mit clip-path', !/progMed\.length\?Math\.max\.apply\(null,progMed\):-Infinity\)\/50\)\*50;/.test(src) && /stroke-dasharray="4 3" stroke-linejoin="round" stroke-linecap="round" clip-path="url\(#'\+clipId\+'\)"\/>';   \/\/ Hotfix 25/.test(src) && /<clipPath id="rgc\d+">/.test(rg));
// 10 Punkteleiste
punkteleisteZeichnen('sBar', g, 0, 0); var wD=parseFloat(el('sBarProgD').style.width), t43=g.prognose43; var PL=punkteleisteTeile({ ziel:g.zielHeute, dfm:g.dfm, privat:g.privat, zielDfm:g.zielDfm, zielPrivat:g.zielPrivat });
pruef('C-S10 Punkteleiste: Prognose-Segment DFM = (endeDfm − DFM) ÷ Skala, auf 100 % begrenzt, Skala unverändert', nah(wD, Math.min(100, (t43.endeDfm-g.dfm)/PL.skala*100), 0.2) && PL.skala===Math.max(g.zielHeute, g.dfm+g.privat), JSON.stringify({ wD, erw:(t43.endeDfm-g.dfm)/PL.skala*100, skala:PL.skala }));
// 11 Münzen heute (Quelle)
pruef('C-S11 Münzen heute: Prognose = (Prognose − Punkte) × streakFaktor + Münzen, Skala = Ziel', /prog=m\+Math\.max\(0, num\(\(g\.prognose43\|\|tagesprognose43\(\)\)\.prognose\)-num\(g\.punkteHeute\)\)\*streakFaktor\(\), pz=v=>Math\.max\(0,Math\.min\(100,v\/ziel\*100\)\)/.test(src));
// 12 Tagesform-Treppe
var st=tagesformStufen(); pruef('C-S12 Tagesform: Prognose-Stufe aus tagesprognoseHeute (≥ aktuell)', st.prog>=st.akt && st.prog>=outfitVon(outfitFMit(Math.max(0, tagesPunkteLive())+Math.max(0, T.prognose-(T.dfm+T.privat))))-0);

// ══ D · Version ══
pruef('D1 App 4.3.4 · Build 2026-11-04-58 · sw.js Cache fokus4-v4.3.4-2 (seit Hotfix 26)', APP_VERSION==='4.3.4' && APP_BUILD==='2026-11-04-58' && readFile('sw.js').indexOf("const CACHE = 'fokus4-v4.3.4-2'")>=0, APP_VERSION+' / '+APP_BUILD);
suiteEnde('Hotfix 25 · Statusleiste, Tableiste, Prognose aus der Tageskette (4.3.1)');
