/* Suite 6.5 · Hotfix 31.4 (Auftrag 261126 Hotfix 31.4): Tag nur mit „Erledigt am …“ ohne Dauer erscheint in analyseRohTage (H4.2 mit erledigt > 0),
   Tag ohne Zeit, Punkte und Abschluss fehlt weiter; Nachzug-Toast nur bei mindestens einer Karte, Marke immer; Version 4.5.9. Aufruf: jsc tests/v65-hotfix31-4.js */
var _toasts=[]; toast=function(m){ _toasts.push(String(m)); }; haptik=function(){}; var confirm=function(){ return true; };
fsliveStumm(); var src=readFile('index.html');
uuid=function(){ return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c){ var r=Math.random()*16|0; return (c==='x' ? r : (r&3|8)).toString(16); }); };
var K=testTag(); S.ui.spezial=null; S.ui.tkWahl=null; seiteZeigen('fokus'); var heute=heuteApp(), vor3=anVorTage(heute, 3), vor5=anVorTage(heute, 5), vor7=anVorTage(heute, 7);
S.meta.karten43=null; S.meta.migrationen=[]; migrationKarten43(); S.fokus={ laeuft:false }; S.meta.korrekturProtokoll=[]; HF27.korrSchritte=[];
function karte(id, titel, extra){ var k=Object.assign(neueKarte({ titel:titel, domain:'dfm' }), { id:id, status:'offen', std42:true, art:'aufgabe', sollMin:0, matrixFeld:'ziel', projekt:'Projekt P', prio:3, belastung:0 }, extra||{}); S.karten.push(k); return k; }
var kA=karte('a-1', 'Ohne Dauer', { faelligkeit:vor5 }); saveKarten(); k43KettenNormieren(); hf26StandardKetten(heute);
function _roh(tag){ return analyseRohTage().filter(function(e){ return e.datum===tag; })[0] || null; }

// ══ §1 · Quelle ══
pruef('§1 Filter H4.2: e.heute || e.min>0.01 || e.punkte!==0 || e.erledigt>0, Kommentar ergänzt', /arr=arr\.filter\(e=> e\.heute \|\| e\.min>0\.01 \|\| e\.punkte!==0 \|\| e\.erledigt>0\);/.test(src) && src.indexOf('Hotfix 31.4: auch Tage mit mindestens einem Abschluss (erledigt > 0)')>=0);

// ══ a · Tag nur mit „Erledigt am …“ ohne Dauer ══
var r0=_roh(vor5); hf311Oeffnen('a-1'); hf311TagSetzen(vor5); var E=HF31.erl; var okA=hf311Buchen(); var rA=_roh(vor5);
pruef('a) Tag nur mit „Erledigt am …“ ohne Dauer erscheint in analyseRohTage: erledigt 1, min 0, punkte 0', okA===true && E.dauer===0 && E.punkte===0 && r0===null && !!rA && rA.erledigt===1 && rA.min===0 && rA.punkte===0, JSON.stringify([okA, r0, rA && { erledigt:rA.erledigt, min:rA.min, punkte:rA.punkte }]));

// ══ b · Tag ohne Zeit, Punkte und Abschluss ══
var hB=korrSnapshotAnlegen(vor7);
pruef('b) Tag ohne Zeit, Punkte und Abschluss (Snapshot leer) fehlt weiter in analyseRohTage', !!hB && hB.datum===vor7 && _roh(vor7)===null);

// ══ c · Nachzug mit 0 Karten ══
S.meta.hf313=null; _toasts.length=0; var nzC=hf313Nachzug();
pruef('c) Nachzug mit 0 Karten: kein Toast, Marke gesetzt (anzahl 0)', !!nzC && nzC.anzahl===0 && !!S.meta.hf313 && !!S.meta.hf313.ts && S.meta.hf313.anzahl===0 && !_toasts.some(function(t){ return /^Nachzug/.test(t); }), JSON.stringify([nzC, _toasts]));

// ══ d · Nachzug mit 1 Karte ══
var kD=karte('d-1', 'Nachzug eine Karte', { status:'erledigt', erledigtAuf:vor3 }); saveKarten(); S.meta.hf313=null; _toasts.length=0; var nzD=hf313Nachzug();
pruef('d) Nachzug mit 1 Karte: Toast „Nachzug: 1 erledigte Karten gezählt“, Marke anzahl 1', !!nzD && nzD.anzahl===1 && JSON.stringify(nzD.karten)==='["d-1"]' && _toasts.indexOf('Nachzug: 1 erledigte Karten gezählt')>=0, JSON.stringify([nzD, _toasts]));
pruef('§2 Quelle: Toast nur bei ids.length>0', /if\(ids\.length>0\)\{ try\{ toast\('Nachzug: '\+ids\.length\+' erledigte Karten gezählt'\); \}catch\(e\)\{\} \}/.test(src));

// ══ §4 · Version ══
pruef('4 App 4.5.9 · Build 2026-11-26-69 · sw.js Cache fokus4-v4.5.9-1', APP_VERSION==='4.5.9' && APP_BUILD==='2026-11-26-69' && /const CACHE = 'fokus4-v4\.5\.9-1'/.test(readFile('sw.js')));
suiteEnde('Hotfix 31.4 · Statistik mit Abschlüssen ohne Dauer, Nachzug-Toast (4.5.9)');
