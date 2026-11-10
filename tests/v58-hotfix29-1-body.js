/* Suite 5.8 · Hotfix 29.1 (Auftrag 261110 Hotfix 29.1 §6): 1 Overload-Karte (60 Min, Punkte) ändert in „Heute gesamt“ weder Zeit noch Punkte-% noch „offen gesamt“ ·
   2 Tagesprognose, Statusleiste, Plan-Karte und Plankurve ohne Overload · 3 Werktag ohne Plan: Overload-Kette existiert leer, in Zielbild 14 und 15 sichtbar ·
   4 Erholung trägt bis 19:00 aus den Einstellungen · 5 hf29Weiter ohne Themen sendet · 6 „⤒ Nach vorn“ im Block, S.meta.ketten.alle unverändert · 7 Version 4.5.1. Aufruf: jsc tests/v58-hotfix29-1.js */
var _toasts=[]; toast=function(m){ _toasts.push(String(m)); }; haptik=function(){}; var confirm=function(){ return true; };
fsliveStumm(); var src=readFile('index.html');
uuid=function(){ return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c){ var r=Math.random()*16|0; return (c==='x' ? r : (r&3|8)).toString(16); }); };
function _k(id){ return S.karten.find(function(x){ return x.id===id; }); }
var K=testTag(); S.ui.spezial=null; S.ui.tkWahl=null; seiteZeigen('fokus'); var heute=heuteApp(); S.fokus={ laeuft:false }; S.meta.ketten={ alle:{ datum:heute, ids:['alt-1','alt-2'], entfernt:[] } };
// Werktag erzwingen: heuteApp() ist aus testTag (S.tag.datum); am Wochenende legt hf26StandardKetten nichts an
var we=hf26Wochenende(heute); if(we){ S.tag.datum=anVorTage(heute, 2); heute=heuteApp(); }
S.tagesketten=[]; k43KettenNormieren(); hf26StandardKetten(heute);

// ══ 3 · Overload-Kette an jedem Werktag, auch leer ══
var ov=hf29Block('overload'); var bl=hf29Bloecke();
pruef('3a Werktag ohne Plan: Overload-Kette existiert, leer, ohne von/bis, zuletzt in der Reihenfolge; Standard-Blöcke tragen von und bis', !!ov && ov.karten.length===0 && !ov.von && !ov.bis && ov.quelle==='standard' && bl[bl.length-1]===ov && hf26StandardBloecke().some(function(d){ return d.block==='overload'; }), JSON.stringify(bl.map(function(c){ return c.block+':'+(c.von||'-')+'-'+(c.bis||'-'); })));
var P=k43TP(); P.freigabeTs=null; P.beendetTs=null; S.ui.hf29Auf={ datum:heute, id:null, gesetzt:true }; var h14=hf29PlanenHtml();
pruef('3b Zielbild 14: Overload-Block gestrichelt mit „Puffer · zählt nicht zur Prognose“, „ohne Zeit“, keine Punkte', /class="hf29-blk over"/.test(h14) && /Puffer · zählt nicht zur Prognose/.test(h14) && /ohne Zeit/.test(h14) && !/<span class="r">ohne Zeit<br>/.test(h14));
HF29.zu=null; hf29Zuordnen(K.d.id, { modus:'verschieben' }); var h15=hf29ZuordnenHtml();
pruef('3c Zielbild 15: Overload unter „Andere Blöcke heute“ gestrichelt „Puffer · nicht in der Prognose“', /hf29-opt over"[^>]*data-hf29ziel="block\|overload\|"/.test(h15) && /Puffer · nicht in der Prognose/.test(h15)); closeSheet(); HF29.zu=null;
var A=hf26TagAbschnitte(k43KettenBauen(true).tag[0]);
pruef('3d „Heute gesamt“: Overload als eigener Abschnitt am Ende, auch leer', A.length>=3 && A[A.length-1].block==='overload' && /Puffer · nicht in der Prognose/.test(A[A.length-1].name));

// ══ 4 · bis aus den Einstellungen ══
var bE=hf29Block('erholung'), bF1=hf29Block('fokus1');
pruef('4 Erholung trägt bis 19:00, Fokus 1 09:45–12:45 (engine43.tagesbloecke); hf29BlockBis nimmt c.bis; fehlendes bis wird an bestehender Kette nachgetragen', bE && bE.von==='17:00' && bE.bis==='19:00' && hf29BlockBis(bE)==='19:00' && bF1.bis==='12:45' && (function(){ delete bE.bis; hf26StandardKetten(heute); return bE.bis==='19:00'; })());

// ══ 1 · Overload-Karte zählt nicht mit ══
var kA=Object.assign(neueKarte({ titel:'A1', domain:'dfm' }), { id:'o-a', status:'offen', std42:true, art:'aufgabe', sollMin:40, matrixFeld:'ziel', projekt:'Projekt P', prio:3, belastung:0, faelligkeit:heute });
var kB=Object.assign(neueKarte({ titel:'B1', domain:'dfm' }), { id:'o-b', status:'offen', std42:true, art:'aufgabe', sollMin:20, matrixFeld:'ziel', projekt:'Projekt P', prio:3, belastung:0, faelligkeit:heute });
var kO=Object.assign(neueKarte({ titel:'Puffer', domain:'dfm' }), { id:'o-ov', status:'offen', std42:true, art:'aufgabe', sollMin:60, matrixFeld:'ziel', projekt:'Projekt P', prio:5, belastung:0, faelligkeit:heute });
S.karten.push(kA, kB, kO); saveKarten(); bF1.karten=['o-a','o-b']; bF1.plan={ 'o-a':{ start:'09:45', min:40 }, 'o-b':{ start:'10:30', min:20 } }; DB.set('tagesketten', S.tagesketten); K43K.cache=null;
function stand(){ var Kb=k43KettenBauen(true), t=Kb.tag[0], f=k43KetteFelder(t), T=tagesprognose43(), g=diaGroessen(), pk=planKurveInfo(); return { zeitMin:f.zeitMin, geb:f.gebuchtMin, pct:f.punkteProzent, gesMin:f.offenGesamtMin, gesP:f.offenGesamtP, geplant:f.geplant, prog:T.prognose, karten:T.karten, gProg:g.prognoseHeute, kurve:Math.round(pk.wert(29)), n:t.karten.length }; }
var s0=stand(); hf29KarteEinordnen('o-ov', { art:'block', block:'overload' }); var s1=stand();
pruef('1a Overload-Karte (60 Min, Punkte): „Heute gesamt“ Zeit, gebucht, Punkte-%, offen gesamt (Min und P) und geplant unverändert; die Karte steht trotzdem in Heute gesamt', s0.zeitMin===s1.zeitMin && s0.geb===s1.geb && s0.pct===s1.pct && s0.gesMin===s1.gesMin && s0.gesP===s1.gesP && s0.geplant===s1.geplant && s1.n===s0.n+1 && s0.zeitMin===60 && s0.gesP>0, JSON.stringify([s0, s1]));
pruef('2a Tagesprognose (tagesprognose43, diaGroessen.prognoseHeute → Statusleiste/Tagesprognose/Blockübersicht) und Plankurve (planKurveInfo → Tempo und Blöcke) ohne Overload', s0.prog===s1.prog && s0.gProg===s1.gProg && s0.kurve===s1.kurve && s0.kurve>0, JSON.stringify([s0.prog, s1.prog, s0.kurve, s1.kurve]));
pruef('2b hf29OhneOverload ist die eine Prüfung: Karten nur im Overload fallen heraus, eine Karte in Overload und Fokus 1 bleibt', hf29OhneOverload([kA, kO]).length===1 && hf29OhneOverload(['o-a','o-ov','o-b']).join()==='o-a,o-b' && (function(){ bF1.karten.push('o-ov'); var r=hf29OhneOverload([kO]).length; bF1.karten.pop(); return r===1; })() && /k43KetteFelder=function\(c\)\{ try\{ if\(c && c\.art==='tag'\)\{ const ohne=hf29OhneOverload\(c\.karten\)/.test(src) && /const ok=new Set\(hf29OhneOverload\(/.test(src) && /ketteKarten=function\(dom\)\{ return hf29OhneOverload\(_kk\(dom\)\); \}/.test(src));
var pfTP={ id:'pf-tp-x', Titel:'Tagesplan '+k43Datum(heute)+' · Fassung 1', Agent:'Trainer', Art:'Tagesplan', Status:'offen', Runde:1, erstellt_am:jetztIso() }; F7.lager.postfach={ ts:Date.now(), daten:[pfTP], fehler:'' };
var planX={ datum:heute, bloecke:[{ block:'fokus1', name:'Fokus 1', von:'09:45', bis:'12:45', karten:[{ id:'o-a', start:'09:45', min:40 }] },{ block:'overload', name:'Overload', von:null, bis:null, karten:[{ id:'o-ov', start:null, min:60 }] }] }; HF29.paket['pf-tp-x']=JSON.stringify(planX);
var pOhne=hf29PlanPrognoseOhneOverload(planX), pMit=k43PlanPrognose(planX); F15.karte={ id:'pf-tp-x', optionen:[], text:'', datei:null }; var h16=f15KarteHtml();
pruef('2c Plan-Karte (Zielbild 16 A): „Prognose nach Freigabe (ohne Overload)“ kleiner als mit Overload; Overload-Zeile im Kasten Blöcke ohne Punkte', pOhne<pMit && new RegExp('Prognose nach Freigabe \\(ohne Overload\\)</span><b class="mono">'+fmtP(pOhne).replace(/\./g,'\\.')+' /').test(h16) && /hf29-b over"><span>Overload · Puffer<\/span><span>1 Karten<\/span>/.test(h16), fmtP(pOhne)+' / '+fmtP(pMit));
var st=tagesBloeckeStrahl(); pruef('1e Plan-Streifen ohne Overload-Abschnitt, Blöcke mit bis aus den Ketten (Erholung 17–19)', !st.plan.some(function(b){ return b.name==='Overload'; }) && st.plan.some(function(b){ return b.name==='Erholung' && nah(b.von, 17, 0.01) && nah(b.bis, 19, 0.01); }), JSON.stringify(st.plan));

// ══ 5 · Weiter ohne Themen ══
P.themen=[]; _gesendet.length=0; var _ks=k43Senden, gesendet5=null; k43Senden=function(t, a){ gesendet5={ t:t, a:a }; }; _toasts.length=0; k43Ui().schritt=1; hf29Weiter(); k43Senden=_ks;
pruef('5 hf29Weiter ohne Themen sendet „Themen heute: keine gewählt, bitte aus den Fälligkeiten planen“, Anlass Tagesplan, planTs gesetzt, Schritt 2, keine Meldung', !!gesendet5 && /Themen heute: keine gewählt, bitte aus den Fälligkeiten planen\./.test(gesendet5.t) && /Postfach-Karte Art Tagesplan/.test(gesendet5.t) && gesendet5.a==='Tagesplan' && !!P.planTs && k43Ui().schritt===2 && !_toasts.some(function(t){ return /keine Anforderung/.test(t); }), gesendet5 && gesendet5.t.slice(0,120));

// ══ 6 · Nach vorn im Block, alte Speicher unverändert ══
var stVor=JSON.stringify(S.meta.ketten.alle); bF1.karten=['o-a','o-b']; bF1.plan={ 'o-a':{ start:'09:45', min:40 }, 'o-b':{ start:'10:30', min:20 } }; DB.set('tagesketten', S.tagesketten); K43K.cache=null;
var r6=ketteNachVorn('o-b');
pruef('6a „⤒ Nach vorn“: Karte im Block an erster offener Stelle, plan.start = Start des Blocks (09:45), tagesKette() beginnt damit; S.meta.ketten.alle unverändert', r6===true && bF1.karten.join()==='o-b,o-a' && bF1.plan['o-b'].start==='09:45' && tagesKette()[0]==='o-b' && JSON.stringify(S.meta.ketten.alle)===stVor, JSON.stringify([bF1.karten, bF1.plan['o-b']]));
HF29.zu=null; var r6b=ketteNachVorn(K.p.id);
pruef('6b Karte ohne Block: „Nach vorn“ öffnet die Zuordnung (verschieben)', r6b===false && HF29.zu && HF29.zu.modus==='verschieben' && HF29.zu.kid===K.p.id); closeSheet(); HF29.zu=null;
_toasts.length=0; var r6c=ketteBewegen('o-a', 'hoch'); tagStartTmp={ sortOrder:['o-a'] }; tagStartPrioFinish();
pruef('6c ketteBewegen und tagStartPrioFinish schreiben nichts und melden „Reihenfolge nur in den Blöcken (Hotfix 29)“; detailSpeichern ohne kettenOben', r6c===false && _toasts.filter(function(t){ return t==='Reihenfolge nur in den Blöcken (Hotfix 29)'; }).length===2 && JSON.stringify(S.meta.ketten.alle)===stVor && bF1.karten.join()==='o-b,o-a' && !/if\(kettenOben && idx<0\)\{/.test(src));

// ══ 7 · Version ══
pruef('7 App 4.5.1 · Build 2026-11-10-61 · sw.js Cache fokus4-v4.5.1-1', APP_VERSION==='4.5.1' && APP_BUILD==='2026-11-10-61' && /const CACHE = 'fokus4-v4\.5\.1-1'/.test(readFile('sw.js')));
suiteEnde('Hotfix 29.1 · Overload ohne Zeit und Punkte, Nachzug (4.5.1)');
