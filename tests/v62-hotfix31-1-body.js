/* Suite 6.2 · Hotfix 31.1 (Auftrag 261119 Hotfix 31.1): ✓ in „Von gestern“ öffnet „Erledigt am …“ — Container data-hf31gestern, Blatt (gestern vorgewählt, heute, 📅 bis heute; Dauer = Soll,
   Punkte = Satz × Dauer, rechnen mit), Buchung über korrekturAnwenden (gestern 23:00, heute jetzt, Datum vor 3 Tagen), Dauer 0 / Punkte 0, Dauer 0 / Punkte 10, abgewiesene Sitzung,
   ✓ in anderen Listen unverändert, hf31TagWahlHtml ohne opt unverändert, Version 4.5.6. Aufruf: jsc tests/v62-hotfix31-1.js */
var _toasts=[]; toast=function(m){ _toasts.push(String(m)); }; haptik=function(){}; var confirm=function(){ return true; };
fsliveStumm(); var src=readFile('index.html');
uuid=function(){ return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c){ var r=Math.random()*16|0; return (c==='x' ? r : (r&3|8)).toString(16); }); };
function _k(id){ return S.karten.find(function(x){ return x.id===id; }); }
var K=testTag(); S.ui.spezial=null; S.ui.tkWahl=null; seiteZeigen('fokus'); var heute=heuteApp(), gestern=anVorTage(heute, 1), vor3=anVorTage(heute, 3);
S.meta.karten43=null; S.meta.migrationen=[]; migrationKarten43(); S.fokus={ laeuft:false }; S.meta.korrekturProtokoll=[]; HF27.korrSchritte=[];
function karte(id, titel, extra){ var k=Object.assign(neueKarte({ titel:titel, domain:'dfm' }), { id:id, status:'offen', std42:true, art:'aufgabe', sollMin:30, matrixFeld:'ziel', projekt:'Projekt P', prio:3, belastung:0 }, extra||{}); S.karten.push(k); return k; }
var kG=karte('g-1', 'Gestern Karte', { faelligkeit:gestern }), kG2=karte('g-2', 'Gestern Karte 2', { faelligkeit:gestern, sollMin:20 }), kG3=karte('g-3', 'Gestern Karte 3', { faelligkeit:gestern, sollMin:45 });
var kG4=karte('g-4', 'Gestern ohne Soll', { faelligkeit:gestern, sollMin:0 }), kG5=karte('g-5', 'Gestern Karte 5', { faelligkeit:gestern, sollMin:10 }), kG6=karte('g-6', 'Gestern Karte 6', { faelligkeit:gestern, sollMin:60 });
var kRout=karte('r-1', 'Routine', { art:'routine', rhythmus:{ typ:'taeglich' }, projekt:null, domain:'privat', faelligkeit:heute });
saveKarten(); k43KettenNormieren(); hf26StandardKetten(heute);
var satz=e42Satz(kG), P30=Math.round(satz*30/60);

// ══ 1.1 · Container und Abfangen ══
hf29AufSetzen(hf29Block('fokus1').id); var bl=hf29Bloecke(heute); var hB=hf29BlockOffenHtml(hf29Block('fokus1'), bl);
pruef('1.1a aufgeklappter Block: die Zeilen „Von gestern · überfällig“ liegen in einem Container data-hf31gestern="1"', (function(){ var i=hB.indexOf('Von gestern · überfällig</p><div data-hf31gestern="1">'); var j=hB.indexOf('data-klcheck="g-1"'); var e=hB.indexOf('</div><p class="k43-lab">Ketten</p>'); return i>=0 && j>i && e>j; })(), hB.indexOf('Von gestern'));
HF29.rot='gestern'; var hP=hf29PlanenHtml(); HF29.rot='heute'; var kH=karte('h-1', 'Heute ohne Block', { faelligkeit:heute }); saveKarten(); var hP2=hf29PlanenHtml(); HF29.rot=null;
pruef('1.1b rote Liste „Von gestern“ trägt data-hf31gestern; die rote Liste „heute ohne Block“ nicht', /class="hf29-rotliste" data-klliste="1" data-hf31gestern="1"/.test(hP) && /data-klcheck="g-1"/.test(hP) && /class="hf29-rotliste" data-klliste="1">/.test(hP2) && /data-klcheck="h-1"/.test(hP2));
pruef('1.1c Quelle: Abfang in der Capture-Phase auf window (vor den document-Handlern 26491 und dem Gestern-✓ aus Hotfix 29), beide alten Wege stehen noch', /window\.addEventListener\('click', e=>\{ const t=e\.target; if\(!t \|\| !t\.closest\) return; const ch=t\.closest\('\[data-klcheck\]'\); if\(!ch \|\| !t\.closest\('\[data-hf31gestern\]'\)\) return; e\.stopPropagation\(\); e\.preventDefault\(\); haptik\(8\); hf311Oeffnen\(ch\.dataset\.klcheck\); \}, true\);/.test(src) && /k43GesternEntscheiden\(ch\.dataset\.klcheck, 'erledigt'\)/.test(src) && /else if\(was==='erledigt'\)\{ if\(k\.status==='offen'\)/.test(src));

// ══ 1.2 · Blatt ══
var ok0=hf311Oeffnen('g-1'); var E=HF31.erl, hs=document.getElementById('sheetBody').innerHTML, hf=document.getElementById('sheetFoot').innerHTML;
pruef('1.2a Blatt öffnet: Titel „Erledigt am …“, Karte als Zeile (live), gestern vorgewählt, heute, 📅 max=heute ohne min', ok0===true && document.getElementById('sheetTitel').textContent==='Erledigt am …' && /kl-z|kz42/.test(hs) && hs.indexOf('class="hf29-chip an" data-hf31tag="erl|'+gestern+'">'+AN_WT[anWochentag(gestern)]+' '+anKurzDatum(gestern)+'.')>=0 && hs.indexOf('data-hf31tag="erl|'+heute+'">heute<')>=0 && hs.indexOf('data-hf31datum="erl" value="" max="'+heute+'"')>=0 && !/min="/.test(hs.slice(hs.indexOf('<input type="date" data-hf31datum'), hs.indexOf('</label>', hs.indexOf('data-hf31datum')))), hs.slice(0,400));
pruef('1.2b Dauer = Soll-Minuten (30), Punkte = round(e42Satz × 30 / 60) = '+P30+', Fuß „✓ Erledigt am Wochentag Datum“', E.tag===gestern && E.dauer===30 && E.punkte===P30 && P30>0 && /data-hf311dauer="1"/.test(hs) && hs.indexOf('value="30" data-hf311dauer')>=0 && hs.indexOf('value="'+P30+'" data-hf311punkte')>=0 && hf.indexOf('✓ Erledigt am '+AN_WT[anWochentag(gestern)]+' '+anKurzDatum(gestern)+'.')>=0 && /data-close="1"/.test(hf), JSON.stringify([E, hf]));
hf311DauerSetzen(60); var p60=HF31.erl.punkte; hf311PunkteSetzen(99); hf311DauerSetzen(30);
pruef('1.2c Dauer ändern rechnet die Punkte mit (60 Min → '+Math.round(satz)+'); nach eigener Punkte-Eingabe (99) bleiben sie bei Dauer-Änderung stehen', p60===Math.round(satz*60/60) && HF31.erl.punkte===99 && HF31.erl.punkteManuell===true && HF31.erl.dauer===30);
pruef('1.2d Dauer wird auf ganze Minuten 0–600 begrenzt, Punkte ganz ≥ 0', (function(){ hf311DauerSetzen(999); var a=HF31.erl.dauer; hf311DauerSetzen(-5); var b=HF31.erl.dauer; hf311DauerSetzen(12.6); var c=HF31.erl.dauer; hf311PunkteSetzen(-3); var d=HF31.erl.punkte; hf311PunkteSetzen(7.4); var e=HF31.erl.punkte; return a===600 && b===0 && c===13 && d===0 && e===7; })());
hf311TagSetzen(heute); pruef('1.2e Tag „heute“ wählen: vorgewählt heute, Fuß „✓ Erledigt am heute“; Tag in der Zukunft abgelehnt („Spätestens heute“)', HF31.erl.tag===heute && document.getElementById('sheetFoot').innerHTML.indexOf('✓ Erledigt am heute')>=0 && hf311TagSetzen(anVorTage(heute, -1))===false && HF31.erl.tag===heute && _toasts.indexOf('Spätestens heute')>=0);
pruef('1.2f hf31TagWaehlen(\'erl\', …) und data-hf31datum laufen über hf311TagSetzen', hf31TagWaehlen('erl', gestern)===true && HF31.erl.tag===gestern);
pruef('1.2g hf31TagWahlHtml ohne opt unverändert: morgen, übermorgen, in 3 Tagen, 📅 min=morgen', (function(){ var h=hf31TagWahlHtml('ziel', null); var m=anVorTage(heute, -1); return (h.match(/data-hf31tag=/g)||[]).length===3 && h.indexOf('data-hf31tag="ziel|'+m+'"')>=0 && h.indexOf('min="'+m+'"')>=0 && !/max="/.test(h) && !/>heute</.test(h); })());
closeSheet(); HF31.erl=null;

// ══ 1.3 · Buchen: gestern mit Vorgaben ══
var hist0=S.historie.length, intra0=S.intraday.length, liveVor=tagesPunkteLive(), logVor=(S.tag.log||[]).length, tagStand=JSON.stringify([S.tag.tagId, S.tag.datum, S.tag.punkteBilanz]);
hf311Oeffnen('g-1'); HF31.erl.block=null; _toasts.length=0; var ok1=hf311Buchen();   // Hotfix 31.2: ohne Block endet die Sitzung wie bisher um 23:00 (mit Block: Suite v63)
var hG=S.historie.filter(function(h){ return h.datum===gestern; }), hG1=hG[hG.length-1], eG=S.intraday.filter(function(e){ return e.kartenId==='g-1' && e.typ==='korrektur'; });
pruef('1.3a Vorgaben bestätigt: Karte erledigt, erledigtAuf = gestern, tagId = Snapshot von gestern (<gestern>-k), Blatt zu, HF31.erl leer', ok1===true && kG.status==='erledigt' && kG.erledigtAuf===gestern && !!hG1 && kG.tagId===hG1.tagId && hG1.tagId===gestern+'-k' && HF31.erl===null, JSON.stringify([kG.status, kG.erledigtAuf, kG.tagId, hG.map(function(h){ return h.tagId; })]));
pruef('1.3b Historie von gestern enthält die Sitzung: zeit.dfm = 30 Min, punkteBilanz = '+P30+', Log „korrektur“ mit den Punkten; Intraday typ korrektur 22:30–23:00 mit tagId, manuell, punkteJeStd', hG.length===1 && hG1.perKorrektur===true && nah(hG1.zeit.dfm, 30*60, 1) && nah(hG1.punkteBilanz, P30, 0.11) && hG1.log.some(function(l){ return l.itemId==='g-1' && l.art==='korrektur' && nah(l.punkte, P30, 0.11); }) && eG.length===1 && nah(eG[0].minuten, 30, 0.1) && nah(eG[0].punkte, P30, 0.11) && eG[0].tagId===gestern+'-k' && eG[0].manuell===true && /^Erledigt am \d\d\.\d\d\. \(Von gestern\)$/.test(eG[0].grund) && new Date(eG[0].ts).getHours()===23 && new Date(eG[0].ts).getMinutes()===0 && new Date(eG[0].von).getHours()===22 && new Date(eG[0].von).getMinutes()===30, JSON.stringify([hG1.zeit, hG1.punkteBilanz, hG1.log, eG]));
pruef('1.3c heute bleibt unverändert (Live-Punkte, Tages-Log, Tag); Toast „Erledigt am TT.MM. · 30 Min · P“', tagesPunkteLive()===liveVor && (S.tag.log||[]).length===logVor && JSON.stringify([S.tag.tagId, S.tag.datum, S.tag.punkteBilanz])===tagStand && _toasts.some(function(t){ return t==='Erledigt am '+anKurzDatum(gestern)+'. · 30 Min · '+fmtP(P30)+' P'; }), JSON.stringify(_toasts));
pruef('1.3d kartenStatusHeute der erledigten Aufgabe = erledigt; sie fehlt in hf29Gestern()', kartenStatusHeute(kG)==='erledigt' && !hf29Gestern().some(function(k){ return k.id==='g-1'; }));

// ══ 1.3 · heute, Dauer 20, Punkte 50 ══
hf311Oeffnen('g-2'); hf311TagSetzen(heute); hf311DauerSetzen(20); hf311PunkteSetzen(50); HF31.erl.block=null; /* Hotfix 31.2: ohne Block endet sie wie bisher jetzt */ var live1=tagesPunkteLive(); var t0=Date.now(); _toasts.length=0; var ok2=hf311Buchen();
var e2=S.intraday.filter(function(e){ return e.kartenId==='g-2' && e.typ==='korrektur'; })[0];
pruef('1.3e Tag heute: Sitzung endet jetzt (±2 Min), 20 Min, 50 P, tagId = laufender Tag; Karte erledigt mit erledigtAuf heute, tagId = S.tag.tagId; kein neuer Snapshot', ok2===true && !!e2 && Math.abs(Date.parse(e2.ts)-t0)<120000 && nah(e2.minuten, 20, 0.1) && nah(e2.punkte, 50, 0.11) && e2.tagId===S.tag.tagId && nah(e2.punkteJeStd, 150, 0.01) && kG2.status==='erledigt' && kG2.erledigtAuf===heute && kG2.tagId===S.tag.tagId && S.historie.length===hist0+1 && _toasts.some(function(t){ return t==='Erledigt am '+anKurzDatum(heute)+'. · 20 Min · 50 P'; }), JSON.stringify([e2, kG2.status, kG2.erledigtAuf, kG2.tagId, _toasts]));
pruef('1.3f die 50 P stehen im laufenden Tag: tagesPunkteLive steigt um 50, kartePunkteHeute = 50 (Ist-Wert punkteOverride statt istSek × Satz = '+Math.round(e42Satz(kG2)*20/60)+'), kein Abhakbonus (Abschluss bonusPunkte 0)', nah(tagesPunkteLive()-live1, 50, 0.11) && nah(kartePunkteHeute(kG2), 50, 0.11) && kG2.punkteOverride===50 && (kG2.abschluesse||[]).some(function(a){ return a.tagId===S.tag.tagId && a.bonusPunkte===0 && a.quelle==='erledigtAm'; }) && aufgabenBonusHeute()===0, JSON.stringify([tagesPunkteLive()-live1, kartePunkteHeute(kG2), kG2.punkteOverride, kG2.abschluesse, aufgabenBonusHeute()]));

// ══ 1.3 · Datum vor 3 Tagen ══
hf311Oeffnen('g-3'); hf31TagWaehlen('erl', vor3); HF31.erl.block=null; var ok3=hf311Buchen(); /* Hotfix 31.2: ohne Block bis 23:00 */ var h3=S.historie.filter(function(h){ return h.datum===vor3; }); var e3=S.intraday.filter(function(e){ return e.kartenId==='g-3' && e.typ==='korrektur'; })[0];
pruef('1.3g Datum vor 3 Tagen: Sitzung 45 Min bis 23:00 auf diesen Tag (Snapshot <vor3>-k), Karte erledigt mit erledigtAuf = vor3, tagId = Snapshot', ok3===true && h3.length===1 && nah(h3[0].zeit.dfm, 45*60, 1) && !!e3 && e3.tagId===vor3+'-k' && kG3.erledigtAuf===vor3 && kG3.tagId===vor3+'-k' && kG3.status==='erledigt', JSON.stringify([h3.map(function(h){ return [h.tagId, h.zeit]; }), e3]));

// ══ 1.3 · Dauer 0 / Punkte 0 ══
var intra4=S.intraday.length, hist4=S.historie.length; hf311Oeffnen('g-4'); var E4=HF31.erl; var ok4=hf311Buchen();
pruef('1.3h Karte ohne Soll: Dauer 0, Punkte 0 vorbelegt; Buchen setzt nur erledigt am Tag (gestern), keine Sitzung, kein Snapshot angelegt, tagId des Snapshots von gestern', E4.dauer===0 && E4.punkte===0 && ok4===true && kG4.status==='erledigt' && kG4.erledigtAuf===gestern && S.intraday.length===intra4+1 && S.intraday[S.intraday.length-1].typ==='abhaken' /* Hotfix 31.3: der Abschluss zählt (abhaken) */ && S.historie.length===hist4 && kG4.tagId===gestern+'-k', JSON.stringify([E4, kG4.tagId]));

// ══ 1.3 · Dauer 0 / Punkte 10 ══
hf311Oeffnen('g-5'); hf311DauerSetzen(0); hf311PunkteSetzen(10); var intra5=S.intraday.length; var ok5=hf311Buchen();
pruef('1.3i Dauer 0, Punkte 10: Meldung „Punkte brauchen eine Dauer“ im Blatt, nichts gebucht, Karte offen, Blatt bleibt offen', ok5===false && HF31.erl && HF31.erl.fehler==='Punkte brauchen eine Dauer' && document.getElementById('sheetBody').innerHTML.indexOf('Punkte brauchen eine Dauer')>=0 && kG5.status==='offen' && S.intraday.length===intra5);
closeSheet(); HF31.erl=null;

// ══ 1.3 · Hotfix 31.2: zweite Karte am selben Tag überschneidet sich — wird gebucht (ueberlappen); abgewiesen wird nur noch z. B. ein Satz über 5.000 P/h ══
hf311Oeffnen('g-6'); HF31.erl.block=null; var intra6=S.intraday.length; _toasts.length=0; var ok6=hf311Buchen(); var e6=S.intraday.filter(function(e){ return e.kartenId==='g-6' && e.typ==='korrektur'; })[0];
pruef('1.3j Überlappung erlaubt (Hotfix 31.2): g-6 60 Min 22:00–23:00 gestern trifft g-1 22:30–23:00 — gebucht, Eintrag ueberlappen:true, Karte erledigt auf gestern, Toast', ok6===true && S.intraday.length===intra6+2 /* Sitzung und abhaken (Hotfix 31.3) */ && !!e6 && e6.ueberlappen===true && nah(e6.minuten, 60, 0.1) && kG6.status==='erledigt' && kG6.erledigtAuf===gestern && _toasts.some(function(t){ return /^Erledigt am/.test(t); }), JSON.stringify([ok6, e6, kG6.status, _toasts]));
hf311Oeffnen('g-5'); hf311DauerSetzen(1); hf311PunkteSetzen(100); var intra7=S.intraday.length; _toasts.length=0; var ok7=hf311Buchen();
pruef('1.3k Abweisung bleibt im Blatt: 1 Min, 100 Punkte (6.000 P/h über korrFesterSatz) — Grund im Blatt, nichts gebucht, Karte bleibt offen, kein Toast', ok7===false && HF31.erl && /^Sitzung abgewiesen: punkteJeStd/.test(HF31.erl.fehler) && document.getElementById('sheetBody').innerHTML.indexOf('Sitzung abgewiesen')>=0 && kG5.status==='offen' && S.intraday.length===intra7 && !_toasts.some(function(t){ return /^Erledigt am/.test(t); }), JSON.stringify([HF31.erl && HF31.erl.fehler, _toasts]));

// ══ andere Listen unverändert ══
closeSheet(); HF31.erl=null;
var zr={ dataset:{ klcheck:'r-1' } }; zr.closest=function(sel){ return (sel==='[data-klcheck]' || sel==='.hf29-zr' || sel==='[data-klliste]') ? zr : null; };
var rK=kettenListeKlick({ target:zr, stopPropagation:function(){}, preventDefault:function(){} });
pruef('1.5 ✓ in einer anderen Liste (ohne data-hf31gestern): kettenListeKlick → kartenListeCheck, Routine heute erledigt, kein Blatt', rK===true && kartenStatusHeute(kRout)==='erledigt' && HF31.erl===null);
pruef('1.4 Beleg Statistik: Zeit und Punkte eines vergangenen Tags stehen im Snapshot (zeit.<dom>, punkteBilanz, log art korrektur, kontoNachziehen), heute als Intraday typ korrektur mit tagId des laufenden Tags (tagesPunkteLive)', /h\.zeit\[dom\]=Math\.max\(0, num\(h\.zeit\[dom\]\)\+dMin\*60\);/.test(src) && /kontoNachziehen\(h, bil0, dP\);/.test(src));

// ══ Version ══
pruef('3 App 4.5.9 · Build 2026-11-26-69 · sw.js Cache fokus4-v4.5.9-1', APP_VERSION==='4.5.9' && APP_BUILD==='2026-11-26-69' && /const CACHE = 'fokus4-v4\.5\.9-1'/.test(readFile('sw.js')));
suiteEnde('Hotfix 31.1 · ✓ in „Von gestern“ mit Tag, Dauer und Punkten über den Korrektur-Weg (4.5.6)');
