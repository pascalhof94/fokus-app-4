/* Suite 6.3 · Hotfix 31.2 (Auftrag 261126 Hotfix 31.2): „Erledigt am …“ — Block des Tages wählen (mittig, ganzer Block, ohne Block), Überschneidung erlaubt (ueberlappen),
   Statistik des gewählten Tags, Datumswahl bleibt offen in allen drei Blättern (Erledigt am, Karte zuordnen, ↷ Auf anderen Tag), Version 4.5.7.
   Ein kleiner DOM-Ersatz für #sheetBody prüft, dass das Datumsfeld dasselbe Objekt bleibt. Aufruf: jsc tests/v63-hotfix31-2.js */
var _toasts=[]; toast=function(m){ _toasts.push(String(m)); }; haptik=function(){}; var confirm=function(){ return true; };
fsliveStumm(); var src=readFile('index.html');
uuid=function(){ return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c){ var r=Math.random()*16|0; return (c==='x' ? r : (r&3|8)).toString(16); }); };
// verstellbare Uhr: Date.now und jetztIso lesen _uhr (null = echte Zeit)
var _uhr=null, _DateNow=Date.now; Date.now=function(){ return _uhr!=null ? _uhr : _DateNow(); }; jetztIso=function(){ return new Date(Date.now()).toISOString(); };
function _ms(datum, hhmm){ return new Date(datum+'T'+hhmm+':00').getTime(); }
function _hm(iso){ var d=new Date(iso); return String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0'); }

// ── DOM-Ersatz für #sheetBody: Elemente mit Eltern, Klassen, dataset; innerHTML setzen baut die Kinder neu (neue Objekte) ──
var _VOID={ input:1, br:1, img:1, hr:1, meta:1, path:1, circle:1, line:1, rect:1 };
function _passt(x, sel){ var m=/^([a-z0-9]*)((?:\.[\w-]+)*)(?:\[([\w-]+)(?:="([^"]*)")?\])?$/i.exec(sel); if(!m) return false;
  if(m[1] && x.tagName!==m[1].toUpperCase()) return false;
  if(m[2]){ var cs=m[2].split('.').filter(Boolean); for(var i=0;i<cs.length;i++) if(!x.classList.contains(cs[i])) return false; }
  if(m[3]){ if(!(m[3] in x._attrs)) return false; if(m[4]!==undefined && x._attrs[m[3]]!==m[4]) return false; }
  return true; }
function _alle(e){ var l=[]; (e.kinder||[]).forEach(function(k){ if(k.weg) return; l.push(k); l=l.concat(_alle(k)); }); return l; }
function _mkEl(tag, attrs){ var cls={}; String(attrs['class']||'').split(/\s+/).forEach(function(c){ if(c) cls[c]=1; });
  var e={ tagName:String(tag).toUpperCase(), _attrs:attrs, parent:null, kinder:[], _h:'', weg:false, dataset:{}, style:{}, value:attrs.value||'',
    classList:{ add:function(c){ cls[c]=1; }, remove:function(c){ delete cls[c]; }, toggle:function(c, an){ if(an===undefined) an=!cls[c]; if(an) cls[c]=1; else delete cls[c]; return an; }, contains:function(c){ return !!cls[c]; } } };
  Object.keys(attrs).forEach(function(a){ if(a.indexOf('data-')===0) e.dataset[a.slice(5)]=attrs[a]; });
  e.remove=function(){ e.weg=true; };
  e.closest=function(sel){ var x=e; while(x){ if(x.tagName && _passt(x, sel)) return x; x=x.parent; } return null; };
  e.querySelectorAll=function(sel){ return _alle(e).filter(function(x){ return _passt(x, sel); }); };
  e.querySelector=function(sel){ return e.querySelectorAll(sel)[0]||null; };
  Object.defineProperty(e, 'innerHTML', { get:function(){ return e._h; }, set:function(v){ e._h=String(v); e.kinder=_parse(e._h, e); } });
  return e; }
function _unesc(s){ return String(s).replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&'); }
function _parse(html, wurzel){ var kinder=[], stapel=[], re=/<!--[\s\S]*?-->|<(\/?)([a-zA-Z][a-zA-Z0-9]*)([^>]*)>/g, m;
  while((m=re.exec(html))){ if(!m[2]) continue; var tag=m[2].toLowerCase();
    if(m[1]==='/'){ for(var i=stapel.length-1;i>=0;i--){ if(stapel[i].tag===tag){ var s=stapel[i]; s.el._h=html.slice(s.start, m.index); stapel.length=i; break; } } continue; }
    var attrs={}, ra=/([\w:-]+)(?:\s*=\s*"([^"]*)")?/g, a; while((a=ra.exec(m[3]))){ attrs[a[1]]=a[2]===undefined ? '' : _unesc(a[2]); }
    var x=_mkEl(tag, attrs), el0=stapel.length ? stapel[stapel.length-1].el : null; x.parent=el0||wurzel; if(el0) el0.kinder.push(x); else kinder.push(x);
    if(!_VOID[tag] && !/\/\s*$/.test(m[3])) stapel.push({ tag:tag, el:x, start:re.lastIndex }); }
  return kinder; }
var _body=_mkEl('div', { id:'sheetBody' }); _els['sheetBody']=_body;
var _sc={}; document.getElementById('sheet').classList={ add:function(c){ _sc[c]=1; }, remove:function(c){ delete _sc[c]; }, toggle:function(){}, contains:function(c){ return !!_sc[c]; } };
function _foot(){ return document.getElementById('sheetFoot').innerHTML; }

// ── Tag und Karten ──
var K=testTag(); S.ui.spezial=null; S.ui.tkWahl=null; seiteZeigen('fokus'); var heute=heuteApp(), gestern=anVorTage(heute, 1), morgen=anVorTage(heute, -1), m5=anVorTage(heute, -6), vor3=anVorTage(heute, 3);
S.meta.karten43=null; S.meta.migrationen=[]; migrationKarten43(); S.fokus={ laeuft:false }; S.meta.korrekturProtokoll=[]; HF27.korrSchritte=[];
function karte(id, titel, extra){ var k=Object.assign(neueKarte({ titel:titel, domain:'dfm' }), { id:id, status:'offen', std42:true, art:'aufgabe', sollMin:30, matrixFeld:'ziel', projekt:'Projekt P', prio:3, belastung:0 }, extra||{}); S.karten.push(k); return k; }
var kA=karte('a-1', 'TMP Weekly', { faelligkeit:gestern, sollMin:145 }), kC=karte('c-1', 'Zweite Karte', { faelligkeit:gestern, sollMin:60 }), kD=karte('d-1', 'Senke Karte', { faelligkeit:gestern, sollMin:145 });
var kE=karte('e-1', 'Heute 10:30', { faelligkeit:gestern, sollMin:30 }), kF=karte('f-1', 'Heute 05:20', { faelligkeit:gestern, sollMin:60 });
var kG=karte('g-1', 'Vorwahl Fokus 2', { faelligkeit:gestern }), kG2=karte('g-2', 'Vorwahl Fokus 1', { faelligkeit:gestern }), kH=karte('h-1', 'Datumsfeld', { faelligkeit:gestern }), kJ=karte('j-1', 'Spätere Korrektur', { faelligkeit:heute });
var kZ=karte('z-1', 'Zuordnen', { faelligkeit:heute }), kS=karte('s-1', 'Schieben', { faelligkeit:heute }), kS2=karte('s-2', 'Schieben Chip', { faelligkeit:heute });
saveKarten(); k43KettenNormieren(); hf26StandardKetten(heute);

// ══ §2 · Blatt mit Blockwahl ══
// b) vorher: Timer-Sitzung einer anderen Karte 10:00–10:30 gestern
S.intraday.push({ id:'s-timer-b', ts:new Date(_ms(gestern,'10:30')).toISOString(), von:new Date(_ms(gestern,'10:00')).toISOString(), kartenId:'t-dfm', domaene:'dfm', punkte:20, minuten:30, typ:'timer', datum:gestern });
var okA0=hf311Oeffnen('a-1'), EA=HF31.erl, hsA=_body.innerHTML, PA=EA.punkte;
pruef('2a Blatt: Block an diesem Tag nach der Tageswahl und vor Dauer/Punkte; Zeile „Gebucht wird“ nach grid2 und vor dem Hinweis; Hinweis wörtlich', okA0===true && (function(){ var t=hsA.indexOf('data-hf31datum="erl"'), l=hsA.indexOf('<p class="k43-lab">Block an diesem Tag</p><div class="hf29-chips" data-hf312bloecke="1">'), g=hsA.indexOf('<div class="grid2">'), z=hsA.indexOf('<div class="hf29-opt" data-hf312zeit="1">'), h=hsA.indexOf('<div class="hint">'); return t>=0 && l>t && g>l && z>g && h>z; })() &&
  hsA.indexOf('Punkte rechnen mit der Dauer mit, bis du sie selbst änderst. Die Zeit liegt mittig im gewählten Block und darf sich mit anderen Buchungen überschneiden. Zeit und Punkte zählen zur Statistik des gewählten Tags; kein Abhakbonus.</div>')>=0, hsA.slice(0, 300));
pruef('2b Blockliste gestern: Standardblöcke in Reihenfolge K43_BLOECKE ohne Overload, Text „Name · von–bis“, fokus1 vorgewählt (an)', (function(){ var l=hf312Bloecke(gestern).map(function(x){ return x.block; }); return l.join(',')==='aufstehen,aufwachen,fokus1,senke,fokus2,erholung,abendroutine'; })() && EA.block==='fokus1' &&
  hsA.indexOf('<button type="button" class="hf29-chip an" data-hf312block="fokus1">Fokus 1 · 09:45–12:45</button>')>=0 && hsA.indexOf('data-hf312block="senke">Senke · 12:45–14:30</button>')>=0 && hsA.indexOf('data-hf312block="overload"')<0, JSON.stringify(hf312Bloecke(gestern)));
pruef('2c Zeile „Gebucht wird <b>10:02–12:27</b> · mittig in Fokus 1“', hsA.indexOf('<span>Gebucht wird <b>10:02–12:27</b> · mittig in Fokus 1</span>')>=0, hf312ZeitInnenHtml());

// ══ §3 a/b · Buchen gestern Fokus 1, 145 Min — Überschneidung mit der Timer-Sitzung ══
var abgVor=S.intraday.length; _toasts.length=0; var okA=hf311Buchen();
var eA=S.intraday.filter(function(e){ return e.kartenId==='a-1' && e.typ==='korrektur'; })[0];
pruef('a) Standardblöcke, Soll 145, gestern, fokus1 (09:45–12:45): Sitzung 10:02–12:27, 145 Min, Grund mit Block, Toast mit 145 Min', okA===true && !!eA && _hm(eA.von)==='10:02' && _hm(eA.ts)==='12:27' && nah(eA.minuten, 145, 0.05) && eA.grund==='Erledigt am '+anKurzDatum(gestern)+'. (Von gestern · Fokus 1)' &&
  _toasts.some(function(t){ return t==='Erledigt am '+anKurzDatum(gestern)+'. · 145 Min · '+fmtP(PA)+' P'; }), JSON.stringify([okA, eA, _toasts, HF31.erl && HF31.erl.fehler]));
pruef('b) Timer-Sitzung 10:00–10:30 einer anderen Karte: keine Abweisung, Eintrag trägt ueberlappen:true, Timer-Sitzung bleibt', okA===true && eA && eA.ueberlappen===true && S.intraday.some(function(e){ return e.id==='s-timer-b'; }) && S.intraday.length===abgVor+2 /* Sitzung und abhaken (Hotfix 31.3) */);
var hG=S.historie.filter(function(h){ return h.datum===gestern; }), hG1=hG[hG.length-1];
pruef('i) Snapshot gestern: punkteBilanz = gewählte Punkte ('+PA+'), zeit.dfm + 8.700 Sek., Log art korrektur; Karte erledigt, erledigtAuf gestern, tagId Snapshot, kein Abhakbonus', hG.length===1 && nah(hG1.punkteBilanz, PA, 0.11) && nah(hG1.zeit.dfm, 8700, 1) && hG1.log.some(function(l){ return l.itemId==='a-1' && l.art==='korrektur' && nah(l.punkte, PA, 0.11); }) &&
  kA.status==='erledigt' && kA.erledigtAuf===gestern && kA.tagId===gestern+'-k' && !(kA.abschluesse||[]).length && nah(eA.punkte, PA, 0.11), JSON.stringify([hG1 && hG1.punkteBilanz, hG1 && hG1.zeit, kA.status, kA.erledigtAuf, kA.tagId, kA.abschluesse]));

// ══ c · zweite Karte, Soll 60, gleicher Block ══
hf311Oeffnen('c-1'); var okC=hf311Buchen(); var eC=S.intraday.filter(function(e){ return e.kartenId==='c-1' && e.typ==='korrektur'; })[0];
pruef('c) zweite Karte Soll 60, gleicher Tag und Block: 10:45–11:45, keine Abweisung', okC===true && !!eC && _hm(eC.von)==='10:45' && _hm(eC.ts)==='11:45' && eC.ueberlappen===true && kC.status==='erledigt', JSON.stringify([okC, eC, HF31.erl && HF31.erl.fehler]));

// ══ d · Senke, Dauer 145 länger als der Block (105), Punkte 1.402 ══
hf311Oeffnen('d-1'); hf312BlockSetzen('senke'); hf311PunkteSetzen(1402); var zD=hf312ZeitInnenHtml(), ist0=num(kD.istSek); var okD=hf311Buchen(); var eD=S.intraday.filter(function(e){ return e.kartenId==='d-1' && e.typ==='korrektur'; })[0];
pruef('d) Block senke (12:45–14:30), Dauer 145, Punkte 1.402: Sitzung 12:45–14:30, minuten 105, punkteJeStd 801,14, Punkte 1.402 (±0,1), istSek + 6.300; Text „ganzer Block Senke · 105 Min. statt 145 Min., Punkte bleiben 1.402“', okD===true && !!eD && _hm(eD.von)==='12:45' && _hm(eD.ts)==='14:30' && nah(eD.minuten, 105, 0.05) && eD.punkteJeStd===801.14 && nah(eD.punkte, 1402, 0.1) && num(kD.istSek)-ist0===6300 &&
  zD==='<span>Gebucht wird <b>12:45–14:30</b> · ganzer Block Senke · 105 Min. statt 145 Min., Punkte bleiben 1.402</span>', JSON.stringify([okD, eD, zD, kD.istSek]));

// ══ j · spätere Korrektur-Sitzung ohne ueberlappen ══
var abgJ=[]; korrekturAnwenden({ datum:gestern, grund:'Test j', sitzungen:[{ aktion:'hinzu', karteId:'j-1', von:'11:00', bis:'11:20' }] }, abgJ, null); var eJ=S.intraday.filter(function(e){ return e.kartenId==='j-1' && e.typ==='korrektur'; });
var abgJ2=[]; korrekturAnwenden({ datum:gestern, grund:'Test j2', sitzungen:[{ aktion:'hinzu', karteId:'j-1', von:'10:05', bis:'10:20' }] }, abgJ2, null);
pruef('j) spätere Korrektur 11:00–11:20 (in a und c) wird nicht abgewiesen (§4.3); 10:05–10:20 trifft die Timer-Sitzung und wird weiter abgewiesen', !abgJ.length && eJ.length===1 && !eJ[0].ueberlappen && abgJ2.length===1 && /^überlappt /.test(abgJ2[0].grund) && S.intraday.filter(function(e){ return e.kartenId==='j-1' && e.typ==='korrektur'; }).length===1, JSON.stringify([abgJ, abgJ2]));

// ══ k · Paket-Sitzung ohne ueberlappen wie vor dem Hotfix ══
var pk1=korrSitzungPruefen({ aktion:'hinzu', karteId:'j-1', von:'10:10', bis:'10:25' }, gestern, S.intraday), pk2=korrSitzungPruefen({ aktion:'hinzu', karteId:'j-1', von:'10:10', bis:'10:25', ueberlappen:true }, gestern, S.intraday);
pruef('k) Paket-Sitzung hinzu ohne ueberlappen gegen die Timer-Sitzung: abgewiesen wie bisher; nur hf311Buchen setzt ueberlappen:true (§4.4)', pk1.status==='abgewiesen' && /^überlappt /.test(pk1.grund) && pk2.status==='ok' && (src.match(/ueberlappen:true \};/g)||[]).length===1 && /punkteJeStd:Math\.round\(punkte\*60\/sp\.min\*100\)\/100, vermerk:grund, ueberlappen:true \};/.test(src), JSON.stringify([pk1.status, pk1.grund, pk2.status]));
pruef('§4 Quelle: korrSitzungPruefen (hinzu) vor korrUeberlappt, korrekturAnwenden markiert den Eintrag, korrUeberlappt überspringt ihn', /if\(sz\.ueberlappen===true\)\{ r\.v=v; r\.b=b; return r; \}[^\n]*\n  const ue=korrUeberlappt\(v, b, null, datum, liste\);/.test(src) && /const r=sitzungHinzu\(k, v, b, pr\.id, fest\);\n    if\(sz\.ueberlappen===true\)\{ const e=\(S\.intraday\|\|\[\]\)\.find\(x=>x && x\.id===pr\.id\); if\(e\) e\.ueberlappen=true; \}/.test(src) && /num\(x\.minuten\)<0\.5\) continue;\n    if\(x\.ueberlappen===true\) continue;/.test(src));

// ══ g · Vorwahl ══
S.tagesketten.push({ id:'tk-test-g', name:'Fokus 2', art:'block', block:'fokus2', datum:gestern, von:'14:30', bis:'17:00', karten:['g-1'], plan:{} });
hf311Oeffnen('g-1'); var bG=HF31.erl.block; closeSheet(); HF31.erl=null; hf311Oeffnen('g-2'); var bG2=HF31.erl.block; closeSheet(); HF31.erl=null;
S.tagesketten=S.tagesketten.filter(function(c){ return c.id!=='tk-test-g'; });
pruef('g) Vorwahl: Karte lag gestern im Block fokus2 → fokus2; sonst fokus1', bG==='fokus2' && bG2==='fokus1', JSON.stringify([bG, bG2]));

// ══ e · heute, jetzt = 10:30 ══
_uhr=_ms(heute, '10:30'); hf311Oeffnen('e-1'); hf311TagSetzen(heute); var lE=hf312Bloecke(heute), bE=HF31.erl.block; var okE=hf311Buchen(); var eE=S.intraday.filter(function(e){ return e.kartenId==='e-1' && e.typ==='korrektur'; })[0];
pruef('e) heute, jetzt 10:30, fokus1, Dauer 30: Fenster 09:45–10:30, Sitzung 09:52–10:22; Blöcke mit Beginn ab 10:30 fehlen in der Auswahl', okE===true && bE==='fokus1' && !!eE && _hm(eE.von)==='09:52' && _hm(eE.ts)==='10:22' && lE.length>0 && lE.every(function(x){ return hf26Std(x.von)<10.5; }) && lE.some(function(x){ return x.block==='fokus1'; }) && !lE.some(function(x){ return x.block==='senke' || x.block==='fokus2'; }), JSON.stringify([okE, bE, eE, lE, HF31.erl && HF31.erl.fehler]));

// ══ f · heute, jetzt = 05:20, keine Blöcke ══
_uhr=_ms(heute, '05:20'); hf311Oeffnen('f-1'); hf311TagSetzen(heute); var lF=hf312Bloecke(heute), bF=HF31.erl.block, hF=_body.innerHTML, zF=hf312ZeitInnenHtml(); var okF=hf311Buchen(); var eF=S.intraday.filter(function(e){ return e.kartenId==='f-1' && e.typ==='korrektur'; })[0];
pruef('f) heute, jetzt 05:20, keine Blöcke in der Liste, Dauer 60: Sitzung 04:20–05:20 gebucht (kein „bis liegt vor von“, kein „Zukunft“); Liste „kein Block mit Zeit — gebucht wird bis jetzt“', okF===true && lF.length===0 && bF===null && hF.indexOf('<div class="leer">kein Block mit Zeit — gebucht wird bis jetzt</div>')>=0 && zF==='<span>Gebucht wird <b>04:20–05:20</b> · bis jetzt</span>' && !!eF && _hm(eF.von)==='04:20' && _hm(eF.ts)==='05:20' && nah(eF.minuten, 60, 0.05), JSON.stringify([okF, bF, zF, eF, HF31.erl && HF31.erl.fehler]));
_uhr=null;

// ══ §1 h · Erledigt am: Datumsfeld bleibt dasselbe Objekt ══
hf311Oeffnen('h-1'); var in1=_body.querySelector('input[data-hf31datum]'), blEl=_body.querySelector('[data-hf312bloecke]'); var okH=hf311TagSetzen(vor3, { ausFeld:true }); var in2=_body.querySelector('input[data-hf31datum]');
var chipG=_body.querySelectorAll('[data-hf31tag]').filter(function(x){ return x.dataset.hf31tag==='erl|'+gestern; })[0], lab=in1 && in1.closest('label.hf31-datum');
pruef('h) hf311TagSetzen(vor 3 Tagen, { ausFeld:true }): input[data-hf31datum="erl"] vor und nach dem Aufruf dasselbe Objekt; Fuß zeigt den neuen Tag; Blockliste des neuen Tages; Chip gestern aus, 📅 an', okH===true && !!in1 && in1.dataset.hf31datum==='erl' && in1===in2 && !in1.weg && HF31.erl.tag===vor3 && _foot().indexOf('✓ Erledigt am '+hf311TagText(vor3))>=0 &&
  _body.querySelector('[data-hf312bloecke]')===blEl && blEl.innerHTML===hf312BlockWahlInnenHtml() && blEl.innerHTML.indexOf('data-hf312block="abendroutine"')>=0 && !!chipG && !chipG.classList.contains('an') && !!lab && lab.classList.contains('an'), JSON.stringify([okH, !!in1, in1===in2, HF31.erl.tag, _foot()]));
_uhr=_ms(heute, '10:30'); hf311TagSetzen(heute, { ausFeld:true }); var in3=_body.querySelector('input[data-hf31datum]'), chipH=_body.querySelectorAll('[data-hf31tag]').filter(function(x){ return x.dataset.hf31tag==='erl|'+heute; })[0];
pruef('h) danach heute aus dem Feld (jetzt 10:30): Datumsfeld bleibt, Blockliste von heute (ohne Blöcke ab 10:30), Chip heute an, 📅 aus, Zeile der Zeit neu', in3===in1 && !!chipH && chipH.classList.contains('an') && !lab.classList.contains('an') && blEl.innerHTML.indexOf('data-hf312block="senke"')<0 && blEl.innerHTML.indexOf('data-hf312block="fokus1"')>=0 && _body.querySelector('[data-hf312zeit]').innerHTML===hf312ZeitInnenHtml() && _foot().indexOf('✓ Erledigt am heute')>=0, blEl.innerHTML);
_uhr=null; closeSheet(); HF31.erl=null;
pruef('§1.1 Quelle: Datumsfeld ruft hf31TagWaehlen mit { ausFeld:true }; Chip-Klick ohne opt', /hf31TagWaehlen\(t\.dataset\.hf31datum, t\.value, \{ ausFeld:true \}\);/.test(src) && /const \[ziel, datum\]=String\(z\.dataset\.hf31tag\)\.split\('\|'\); hf31TagWaehlen\(ziel, datum\); return;/.test(src));

// ══ h2 · Karte zuordnen ══
hf29Zuordnen('z-1', { modus:'verschieben' }); HF29.zu.ziel={ art:'block', block:'fokus1' }; hf29ZuordnenNeu(); var anVor=_body.querySelectorAll('[data-hf29ziel]').filter(function(x){ return x.classList.contains('an'); }).length;
var z1=_body.querySelector('input[data-hf31datum]'); var okZ=hf31TagWaehlen('ziel', m5, { ausFeld:true }); var z2=_body.querySelector('input[data-hf31datum]');
pruef('h2) Karte zuordnen: hf31TagWaehlen(\'ziel\', morgen+5, { ausFeld:true }) — Datumsfeld dasselbe Objekt, HF29.zu.ziel trägt das Datum, kein [data-hf29ziel] an, Fuß neu', okZ===true && !!z1 && z1.dataset.hf31datum==='ziel' && z1===z2 && HF29.zu && HF29.zu.ziel && HF29.zu.ziel.art==='tag' && HF29.zu.ziel.datum===m5 && anVor>0 &&
  _body.querySelectorAll('[data-hf29ziel]').every(function(x){ return !x.classList.contains('an'); }) && _foot()===hf29ZuordnenFussHtml() && _foot().indexOf('anderer Tag '+anKurzDatum(m5)+'.')>=0 && kZ.faelligkeit===heute, JSON.stringify([okZ, !!z1, z1===z2, anVor, HF29.zu && HF29.zu.ziel, _foot()]));
closeSheet(); HF29.zu=null;

// ══ h3 · ↷ Auf anderen Tag ══
hf31Schieben('s-1'); var s1=_body.querySelector('input[data-hf31datum]'); var okS=hf31TagWaehlen('s-1', m5, { ausFeld:true }); var s2=_body.querySelector('input[data-hf31datum]'), labS=s1 && s1.closest('label.hf31-datum');
pruef('h3) ↷ Auf anderen Tag aus dem Feld: Blatt bleibt offen, Karte unverändert, Datumsfeld dasselbe Objekt, Fuß mit data-hf312schiebgo „↷ anderer Tag TT.MM.“', okS===true && sheetOffen() && kS.faelligkeit===heute && s1===s2 && !!s1 && HF31.schieb==='s-1' && HF31.schiebDatum===m5 && !!labS && labS.classList.contains('an') &&
  _foot()==='<button class="btn ghost sm" data-close="1">Abbrechen</button><button class="btn prim" data-hf312schiebgo="1">'+esc('↷ anderer Tag '+anKurzDatum(m5)+'.')+'</button>', JSON.stringify([okS, sheetOffen(), kS.faelligkeit, _foot()]));
pruef('h3) Klick-Handler data-hf312schiebgo ruft hf31TagWaehlen(HF31.schieb, HF31.schiebDatum) ohne opt', /if\(d\('data-hf312schiebgo'\)\)\{ e\.stopPropagation\(\); haptik\(8\); const kid=HF31\.schieb, dat=HF31\.schiebDatum; if\(kid && dat\) hf31TagWaehlen\(kid, dat\); return; \}/.test(src));
var okS2=hf31TagWaehlen(HF31.schieb, HF31.schiebDatum);
pruef('h3) Tippen auf den Fuß ordnet ein und schließt: Datum morgen+5, Blatt zu, HF31.schieb leer', okS2===true && kS.faelligkeit===m5 && !sheetOffen() && HF31.schieb===null, JSON.stringify([okS2, kS.faelligkeit, sheetOffen()]));
hf31Schieben('s-2'); var sd0=HF31.schiebDatum; var okS3=hf31TagWaehlen('s-2', morgen);
pruef('h3) Chip „morgen“ ordnet weiter sofort ein (hf31Schieben setzt schiebDatum zurück)', sd0===null && okS3===true && kS2.faelligkeit===morgen && !sheetOffen() && HF31.schieb===null, JSON.stringify([sd0, okS3, kS2.faelligkeit]));

// ══ §6 · Version ══
pruef('6 App 4.5.8 · Build 2026-11-26-68 · sw.js Cache fokus4-v4.5.8-1', APP_VERSION==='4.5.8' && APP_BUILD==='2026-11-26-68' && /const CACHE = 'fokus4-v4\.5\.8-1'/.test(readFile('sw.js')));
suiteEnde('Hotfix 31.2 · Erledigt am …: Block wählen, Überschneidung erlaubt, Datumswahl bleibt offen (4.5.7)');
