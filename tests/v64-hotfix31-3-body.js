/* Suite 6.4 · Hotfix 31.3 (Auftrag 261126 Hotfix 31.3, Teil A): Erledigt aus der Tagesplanung zählt überall als erledigt — hf313AbschlussZaehlen (heute, vergangener Tag,
   ohne Snapshot, Doppelschutz), „Erledigt am …“ mit und ohne Dauer, ✓ in „Von gestern“ (k43GesternEntscheiden), Nachzug hf313Nachzug, Anzeige „Punkte bleiben …“, Version 4.5.8.
   Aufruf: jsc tests/v64-hotfix31-3.js */
var _toasts=[]; toast=function(m){ _toasts.push(String(m)); }; haptik=function(){}; var confirm=function(){ return true; };
fsliveStumm(); var src=readFile('index.html');
uuid=function(){ return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c){ var r=Math.random()*16|0; return (c==='x' ? r : (r&3|8)).toString(16); }); };
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
var K=testTag(); S.ui.spezial=null; S.ui.tkWahl=null; seiteZeigen('fokus'); var heute=heuteApp(), gestern=anVorTage(heute, 1), vor2=anVorTage(heute, 2), vor3=anVorTage(heute, 3), vor4=anVorTage(heute, 4), vor10=anVorTage(heute, 10);
S.meta.karten43=null; S.meta.migrationen=[]; migrationKarten43(); S.fokus={ laeuft:false }; S.meta.korrekturProtokoll=[]; HF27.korrSchritte=[];
function karte(id, titel, extra){ var k=Object.assign(neueKarte({ titel:titel, domain:'dfm' }), { id:id, status:'offen', std42:true, art:'aufgabe', sollMin:30, matrixFeld:'ziel', projekt:'Projekt P', prio:3, belastung:0 }, extra||{}); S.karten.push(k); return k; }
var kA=karte('a-1', 'TMP Weekly', { faelligkeit:gestern, sollMin:145 }), kB=karte('b-1', 'Heute erledigt', { faelligkeit:gestern, sollMin:20 }), kC=karte('c-1', 'Ohne Dauer', { faelligkeit:gestern, sollMin:0 });
var kD=karte('d-1', 'Vor 10 Tagen', { faelligkeit:gestern, sollMin:0 }), kF=karte('f-1', 'Von gestern ✓', { faelligkeit:gestern }), kH=karte('h-1', 'Anzeige', { faelligkeit:gestern, sollMin:145 });
saveKarten(); k43KettenNormieren(); hf26StandardKetten(heute);
function _abh(kid, tag){ return S.intraday.filter(function(x){ return x && x.typ==='abhaken' && x.kartenId===kid && (!tag || belFensterDatum(x.ts)===tag); }); }
function _snap(tag){ var hs=korrSnapshots(tag); return hs.length ? hs[hs.length-1] : null; }
function _roh(tag){ var r=analyseRohTage().filter(function(e){ return e.datum===tag; })[0]; return r || { erledigt:0, punkte:0 }; }
function _raus(tag){ return reinRausTag(anFlowReihe('alle'), tag).raus; }

// ══ §1 · Quelle ══
pruef('§1.1 korrSnapshotAnlegen: Anlage aus tagSn gezogen (tagId <datum>-k, perKorrektur), tagSn ruft sie und schreibt weiter die Zeile „Tag … angelegt“', /function korrSnapshotAnlegen\(dat\)\{\n  const h=\{ tagId:dat\+'-k', datum:dat, laufindex:1,/.test(src) && /else \{ h=korrSnapshotAnlegen\(dat\); zeilen\.push\('Tag '\+\(andere \? dat\+' ' : ''\)\+'angelegt \(es gab keinen Abschluss\)'\); \}/.test(src) && /akkuVerlauf:\[\], streak:0, erledigtHeute:0, perKorrektur:true \};/.test(src));

// ══ a · Erledigt am gestern, Fokus 1, 145 Min ══
var rohA0=_roh(gestern), rausA0=_raus(gestern);
hf311Oeffnen('a-1'); var PA=HF31.erl.punkte, bA=HF31.erl.block; var okA=hf311Buchen();
var hA=_snap(gestern), sA=S.intraday.filter(function(e){ return e.kartenId==='a-1' && e.typ==='korrektur'; })[0], abA=_abh('a-1');
pruef('a) Erledigt am gestern (Fokus 1, 145 Min): Snapshot erledigtHeute 1, Log +1 art Aufgabe mit 0 Punkten (dazu die Sitzung art korrektur), Intraday +1 abhaken mit ts = Sitzungsende und tagId gestern', okA===true && bA==='fokus1' && !!hA && hA.erledigtHeute===1 && hA.log.filter(function(l){ return l.itemId==='a-1' && l.art==='Aufgabe' && l.punkte===0 && l.quelle==='erledigtAm'; }).length===1 && hA.log.filter(function(l){ return l.itemId==='a-1'; }).length===2 &&
  abA.length===1 && !!sA && abA[0].ts===sA.ts && _hm(abA[0].ts)==='12:27' && abA[0].tagId===gestern+'-k' && abA[0].datum===gestern && abA[0].quelle==='erledigtAm' && abA[0].punkte===0 && abA[0].minuten===0, JSON.stringify([okA, bA, hA && hA.erledigtHeute, hA && hA.log, abA]));
pruef('a) analyseRohTage gestern erledigt +1; reinRausTag(anFlowReihe(alle), gestern).raus +1; Punkte des Tags nur die Sitzung ('+PA+')', _roh(gestern).erledigt===rohA0.erledigt+1 && _raus(gestern)===rausA0+1 && nah(hA.punkteBilanz, PA, 0.11) && nah(_roh(gestern).punkte, PA, 0.11), JSON.stringify([rohA0, _roh(gestern), rausA0, _raus(gestern), hA.punkteBilanz]));

// ══ b · Erledigt am heute ══
var erlB0=num(S.tag.erledigtHeute), logB0=(S.tag.log||[]).length, liveB0=tagesPunkteLive();
hf311Oeffnen('b-1'); hf311TagSetzen(heute); HF31.erl.block=null; hf311DauerSetzen(20); hf311PunkteSetzen(50); var okB=hf311Buchen(); var abB=_abh('b-1');
pruef('b) Erledigt am heute: S.tag.erledigtHeute +1, S.tag.log +1 art Aufgabe, Intraday abhaken heute (tagId des Tags), Tagespunkte + 50 (nicht doppelt)', okB===true && num(S.tag.erledigtHeute)===erlB0+1 && (S.tag.log||[]).length===logB0+1 && (S.tag.log||[]).slice(-1)[0].art==='Aufgabe' && (S.tag.log||[]).slice(-1)[0].itemId==='b-1' &&
  abB.length===1 && belFensterDatum(abB[0].ts)===heute && abB[0].tagId===S.tag.tagId && abB[0].quelle==='erledigtAm' && nah(tagesPunkteLive()-liveB0, 50, 0.11), JSON.stringify([okB, S.tag.erledigtHeute, erlB0, (S.tag.log||[]).slice(-2), abB, tagesPunkteLive()-liveB0]));

// ══ c · ohne Dauer gestern ══
var erlC0=_snap(gestern).erledigtHeute, rohC0=_roh(gestern), rausC0=_raus(gestern), intraC0=S.intraday.filter(function(e){ return e.typ==='korrektur'; }).length;
hf311Oeffnen('c-1'); var EC=HF31.erl; var okC=hf311Buchen(); var abC=_abh('c-1');
pruef('c) Erledigt am gestern ohne Dauer (0 Min., 0 P): keine Sitzung; Zählung wie a (erledigtHeute +1, Log art Aufgabe, abhaken 23:00 gestern, Rohdaten und Flow +1)', okC===true && EC.dauer===0 && EC.punkte===0 && S.intraday.filter(function(e){ return e.typ==='korrektur'; }).length===intraC0 &&
  _snap(gestern).erledigtHeute===erlC0+1 && _snap(gestern).log.some(function(l){ return l.itemId==='c-1' && l.art==='Aufgabe' && l.punkte===0; }) && abC.length===1 && _hm(abC[0].ts)==='23:00' && abC[0].tagId===gestern+'-k' && _roh(gestern).erledigt===rohC0.erledigt+1 && _raus(gestern)===rausC0+1, JSON.stringify([okC, abC, _snap(gestern).erledigtHeute]));

// ══ d · Tag ohne Snapshot (vor 10 Tagen) ══
var snD0=korrSnapshots(vor10).length, histD0=S.historie.length;
hf311Oeffnen('d-1'); hf311TagSetzen(vor10); var okD=hf311Buchen(); var hD=_snap(vor10), abD=_abh('d-1');
pruef('d) Tag ohne Snapshot (vor 10 Tagen): Snapshot über korrSnapshotAnlegen angelegt (<datum>-k, perKorrektur, sortiert), Zählung wie a (Rohdaten: Tag ohne Zeit und Punkte fällt nach H4.2 heraus)', okD===true && snD0===0 && S.historie.length===histD0+1 && !!hD && hD.tagId===vor10+'-k' && hD.perKorrektur===true && hD.erledigtHeute===1 && hD.log.some(function(l){ return l.itemId==='d-1' && l.art==='Aufgabe'; }) &&
  abD.length===1 && abD[0].tagId===vor10+'-k' && !analyseRohTage().some(function(e){ return e.datum===vor10; }) /* H4.2: Tag ohne Zeit und Punkte fehlt in den Rohdaten (Bericht ❓) */ && _raus(vor10)===1 && S.historie.every(function(h, i, a){ return i===0 || a[i-1].datum<=h.datum; }), JSON.stringify([okD, hD, abD]));

// ══ e · Doppelschutz ══
var abE0=_abh('a-1').length, erlE0=_snap(gestern).erledigtHeute, logE0=_snap(gestern).log.length; var e1=hf313AbschlussZaehlen(kA, gestern, Date.parse(gestern+'T23:00:00')), e2=hf313AbschlussZaehlen(kA, gestern, Date.parse(gestern+'T23:00:00'));
pruef('e) zweimal hf313AbschlussZaehlen für dieselbe Karte und denselben Tag: nur ein Eintrag (beide Aufrufe false, nichts geändert)', e1===false && e2===false && _abh('a-1').length===abE0 && abE0===1 && _snap(gestern).erledigtHeute===erlE0 && _snap(gestern).log.length===logE0);
var kE=karte('e-1', 'Doppelt', { status:'erledigt', erledigtAuf:vor4 }); var e3=hf313AbschlussZaehlen(kE, vor4, Date.parse(vor4+'T12:00:00')), e4=hf313AbschlussZaehlen(kE, vor4, Date.parse(vor4+'T13:00:00'));
pruef('e) frische Karte: erster Aufruf true, zweiter false, genau ein abhaken', e3===true && e4===false && _abh('e-1').length===1 && _snap(vor4).erledigtHeute===1);

// ══ f · ✓ in „Von gestern“ über k43GesternEntscheiden ══
var erlF0=_snap(gestern).erledigtHeute, rausF0=_raus(gestern); k43GesternEntscheiden('f-1', 'erledigt'); var abF=_abh('f-1');
pruef('f) k43GesternEntscheiden(id, erledigt): Karte erledigt auf gestern, Zählung am Vortag (abhaken 23:00, erledigtHeute +1, Flow +1)', kF.status==='erledigt' && kF.erledigtAuf===gestern && abF.length===1 && belFensterDatum(abF[0].ts)===gestern && _hm(abF[0].ts)==='23:00' && _snap(gestern).erledigtHeute===erlF0+1 && _raus(gestern)===rausF0+1, JSON.stringify([kF.status, kF.erledigtAuf, abF]));

// ══ g · Nachzug ══
var kG1=karte('g-1', 'Nachzug mit Sitzung', { status:'erledigt', erledigtAuf:vor2 }), kG2=karte('g-2', 'Nachzug ohne Sitzung', { status:'erledigt', erledigtAuf:vor3 }); saveKarten();
S.intraday.push({ id:'s-korr-g-1', typ:'korrektur', kartenId:'g-1', domaene:'dfm', datum:vor2, von:new Date(vor2+'T10:00:00').toISOString(), ts:new Date(vor2+'T11:15:00').toISOString(), punkte:100, minuten:75, grund:'Erledigt am '+anKurzDatum(vor2)+'. (Von gestern · Fokus 1)' });
S.meta.hf313=null; _toasts.length=0; var nz=hf313Nachzug(); var aG1=_abh('g-1', vor2), aG2=_abh('g-2', vor3);
pruef('g) Nachzug: zwei Karten mit erledigtAuf ohne abhaken → je ein Eintrag (ts = Sitzungsende 11:15 bzw. 23:00), Marke { ts, anzahl 2, karten }, Toast', !!nz && nz.anzahl===2 && JSON.stringify(nz.karten)==='["g-1","g-2"]' && !!S.meta.hf313 && !!S.meta.hf313.ts && aG1.length===1 && _hm(aG1[0].ts)==='11:15' && aG2.length===1 && _hm(aG2[0].ts)==='23:00' && _toasts.indexOf('Nachzug: 2 erledigte Karten gezählt')>=0, JSON.stringify([nz, aG1, aG2, _toasts]));
var nIntra=S.intraday.length, nz2=hf313Nachzug();
pruef('g) zweiter Start ändert nichts', nz2===null && S.intraday.length===nIntra && S.meta.hf313.anzahl===2);
var kG3=karte('g-3', 'Nachzug nicht führend', { status:'erledigt', erledigtAuf:vor3 }); var _nf=FSLive.nichtFuehrend; FSLive.nichtFuehrend=function(){ return true; }; S.meta.hf313=null; var nz3=hf313Nachzug(); FSLive.nichtFuehrend=_nf;
pruef('g) nicht führendes Gerät ändert nichts (keine Marke, kein abhaken)', nz3===null && S.meta.hf313===null && _abh('g-3').length===0);
pruef('g) Quelle: Nachzug läuft nach ladeAlles (ohne Schutz)', /\{ const _alt=ladeAlles; ladeAlles=function\(\)\{ const r=_alt\(\); try\{ if\(!DB\._schutz\) hf313Nachzug\(\); \}/.test(src));

// ══ h · Anzeige „Punkte bleiben …“ ══
var _qs=document.querySelector; document.querySelector=function(sel){ return _body.querySelector(sel)||null; };
hf311Oeffnen('h-1'); hf312BlockSetzen('senke'); var z0=_body.querySelector('[data-hf312zeit]').innerHTML; hf311PunkteSetzen(999); var z1=_body.querySelector('[data-hf312zeit]').innerHTML;
document.querySelector=_qs; closeSheet(); HF31.erl=null;
pruef('h) Punkte ändern → [data-hf312zeit] zeigt den neuen Wert („Punkte bleiben 999“)', z0.indexOf('Punkte bleiben 999')<0 && z1.indexOf('ganzer Block Senke · 105 Min. statt 145 Min., Punkte bleiben 999')>=0, JSON.stringify([z0, z1]));

// ══ §6 · Version ══
pruef('6 App 4.5.8 · Build 2026-11-26-68 · sw.js Cache fokus4-v4.5.8-1', APP_VERSION==='4.5.8' && APP_BUILD==='2026-11-26-68' && /const CACHE = 'fokus4-v4\.5\.8-1'/.test(readFile('sw.js')));
suiteEnde('Hotfix 31.3 · Erledigt aus der Tagesplanung zählt überall als erledigt (4.5.8)');
