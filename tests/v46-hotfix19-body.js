/* Suite 4.6 · Hotfix 19 (Auftrag 26.10.2026, §C.3) und Hotfix 19.1 (§4.2: Führung zurück bei gescheiterter Übernahme, Leiste „Stand passt nicht“, Ausnahmen vom Tipp-Abfang, istSicherung mit Unterstrich): §A1 DB bei vollem Speicher · §A2 spiegeln() aus dem Arbeitsspeicher · §A3/§A5 Sperrliste ·
   §A4 rote Leiste (drei Varianten) · §A6 Übernahme ganz oder gar nicht, Kopie an den Dienst · §B1 istSicherung · §B3 sicherungenAuslagern und gleich() ·
   §B4 Aufräumen ohne Löschen · §C Version 4.1.7, Build 42.
   Aufruf: jsc tests/v46-hotfix19.js · Geschrieben, im Rahmen des Auftrags nicht ausgeführt.
   Wie Suite 4.5: fetch/AbortController ersetzt (Antworten je „METHODE /pfad“, auch als Funktion), setTimeout sammelt Uhren in _timer, FSLive sonst echt.
   Voller Speicher: localStorage.setItem wirft bei _voll (alle Schlüssel außer fslive_*) oder genau für _vollSchluessel. */
var _aufrufe, _antworten={}, _timer, _versatz=0, _angehaengt=[], _erzeugt=[], _hoerer={}, _toasts=[], _reloads=0;
function AbortController(){ this.signal={}; this.abort=function(){}; }
function fetch(url, opt){
  opt=opt||{};
  if(!_aufrufe) return Promise.reject(new TypeError('Load failed'));
  var pfad=String(url).replace(/^https?:\/\/[^/]+/,'');
  _aufrufe.push({ methode:opt.method, pfad:pfad, body:opt.body, ts:Date.now() });
  var a=null, k;
  for(k in _antworten){ if((opt.method+' '+pfad).indexOf(k)===0){ a=_antworten[k]; break; } }
  if(typeof a==='function') a=a(opt, pfad);
  if(!a) a={ status:404, json:{ fehler:'unbekannt' } };
  if(a.offline) return Promise.reject(new TypeError('Load failed'));
  var st=a.status||200, j=a.json;
  return Promise.resolve({ ok:(st>=200 && st<300), status:st, json:function(){ return j===undefined ? Promise.reject(new Error('leer')) : Promise.resolve(j); } });
}
function setTimeout(f, ms){ (_timer||(_timer=[])).push({ f:f, ms:Number(ms)||0 }); return _timer.length; }
function timerLaufen(){ var l=_timer||[]; _timer=[]; l.forEach(function(t){ _versatz+=t.ms; try{ t.f(); }catch(e){} }); }
var _DateNow=Date.now; Date.now=function(){ return _DateNow()+_versatz; };
function drain(n){ for(var i=0;i<(n||60);i++) warten(); }
function ziel(){ return { closest:function(){ return null; }, matches:function(){ return false; } }; }
function ereignis(x, y, t){ var e={ clientX:x, clientY:y, target:t||ziel(), pd:0, sp:0, sip:0 }; e.preventDefault=function(){ e.pd++; }; e.stopPropagation=function(){ e.sp++; }; e.stopImmediatePropagation=function(){ e.sip++; }; return e; }
function feuern(typ, e){ (_hoerer[typ]||[]).forEach(function(f){ f(e); }); }
function element(id){ var i; for(i=_angehaengt.length-1;i>=0;i--){ if(_angehaengt[i].id===id) return _angehaengt[i]; } for(i=_erzeugt.length-1;i>=0;i--){ if(_erzeugt[i].id===id) return _erzeugt[i]; } return null; }
function leiste(){ return element('speicherVoll'); }
function aufrufe(methode, pfadAnfang){ return _aufrufe.filter(function(a){ return (!methode || a.methode===methode) && a.pfad.indexOf(pfadAnfang)===0; }); }
function tippen(x, y){ feuern('pointerdown', ereignis(x, y)); var u=ereignis(x, y); feuern('pointerup', u); var k=ereignis(x, y); feuern('click', k); return { up:u, klick:k }; }
function ausstehend(){ try{ return JSON.parse(localStorage.getItem(PREFIX+'fslive_ausstehend')||'[]'); }catch(e){ return []; } }
function letzterPut(pfadAnfang){ var i; for(i=_aufrufe.length-1;i>=0;i--){ if(_aufrufe[i].methode==='PUT' && _aufrufe[i].pfad.indexOf(pfadAnfang)===0) return _aufrufe[i]; } return null; }
// GET /api/spiegel/<s> beantwortet wie der Dienst: der zuletzt mit PUT gesendete Inhalt desselben Schlüssels (jsonb → Objekt)
function spiegelGet(opt, pfad){ var p=letzterPut(pfad); return p ? { json:{ schluessel:pfad.slice('/api/spiegel/'.length), inhalt:JSON.parse(p.body), groesse:p.body.length, version:1, empfangen_am:jetztIso() } } : { status:404, json:{ fehler:'Nicht vorhanden' } }; }
toast=function(m){ _toasts.push(String(m)); };
window.location.reload=function(){ _reloads++; };
var geklickt=[];
var knopf={ closest:function(){ return null; }, matches:function(){ return false; }, click:function(){ geklickt.push('knopf'); }, dispatchEvent:function(){}, focus:function(){} };
function knopfBei(x, y){ return (Math.abs(x-100)<=10 && Math.abs(y-200)<=10) ? knopf : null; }
function ausgenommenZiel(sel){ return { closest:function(s){ return s===sel ? {} : null; }, matches:function(){ return false; } }; }
// voller Speicher
var _voll=false, _vollSchluessel=null, _setItemEcht=localStorage.setItem;
localStorage.setItem=function(k, v){ if((_voll && !/fslive_/.test(k)) || (_vollSchluessel && k===_vollSchluessel)) throw new Error('QuotaExceededError'); return _setItemEcht.call(localStorage, k, v); };
// FSLive neu starten: Antworten setzen, Listener und erzeugte Elemente einsammeln, Führung lesen lassen (der Modul-Zustand bleibt erhalten)
function neuStart(antworten){
  _antworten=antworten||{}; _aufrufe=[]; _hoerer={}; _angehaengt=[]; _erzeugt=[]; _timer=[];
  document.addEventListener=function(t, f){ (_hoerer[t]||(_hoerer[t]=[])).push(f); };
  document.body.appendChild=function(e){ _angehaengt.push(e); };
  document.createElement=function(){ var e=dummyEl(); _erzeugt.push(e); return e; };
  document.elementFromPoint=function(){ return null; };
  document.visibilityState='visible';
  FSLive.start(); drain();
}
var ME=null;
testTag();
localStorage.setItem(PREFIX+'fslive_token', 'test-token');   // gekoppelt
localStorage.setItem(PREFIX+'fslive_ersteUebernahme', '1');  // erste Übernahme erledigt (§A6.2 wird unten eigens geprüft)
DB._auslagernGestartet=true;   // das einmalige Auslagern aus DB.set (§A1) läuft hier nicht mit; §B3 wird direkt geprüft
function fuehrungIch(){ return { json:{ fuehrend:FSLive.geraet(), ich:FSLive.geraet(), seit:null, stand_nr:5 } }; }
var FUEHRUNG_B={ json:{ fuehrend:'GERAET-B', ich:'x', seit:null, stand_nr:5 } };
var OK={ json:{ version:1 } };   // PUT und DELETE /api/spiegel/
var LEER={ json:{ pakete:[] } }, UHR={ json:{ ok:true } }, DBLEER={ json:{ datensaetze:[], gesamt:0 } };
F7.lager.chatKanaele={ ts:Date.now(), daten:[], fehler:'' };

// ══ Start führend ══
neuStart({ 'GET /api/app/fuehrung':fuehrungIch, 'PUT /api/spiegel/':OK, 'DELETE /api/spiegel/':OK, 'GET /api/app/pakete':LEER, 'PUT /api/app/uhr':UHR, 'POST /api/db/':DBLEER });
ME=FSLive.geraet(); timerLaufen(); drain();
pruef('Vorbedingung: gekoppelt, führend, Leiste angelegt und unsichtbar', FSLive.gekoppelt() && FSLive.ichFuehre()===true && !!leiste() && leiste().style.display==='none');
pruef('§A4 Leiste: #f87171, Schrift #111, 13 px, fett, 8px 16px, z-index 330, fest oben unter der Statusleiste', (function(){ var c=String(leiste().style.cssText); return c.indexOf('background:#f87171')>=0 && c.indexOf('color:#111')>=0 && c.indexOf('font-size:13px')>=0 && c.indexOf('font-weight:700')>=0 && c.indexOf('padding:8px 16px')>=0 && c.indexOf('z-index:330')>=0 && c.indexOf('position:fixed')>=0 && c.indexOf('top:var(--tbH')>=0; })(), String(leiste().style.cssText));

// ══ §A1 · DB.set bei vollem Speicher ══
localStorage.setItem(PREFIX+'karten', '[]');
_voll=true; _toasts.length=0;
var neu=[{ id:'k-neu', titel:'Neu' }];
var r1=DB.set('karten', neu);
pruef('§A1 DB.set voll: false, Wert in _ungesichert, Schlüssel in offen, DB.get liefert den neuen Wert, localStorage den alten', r1===false && DB._ungesichert.karten===JSON.stringify(neu) && ausstehend().indexOf('karten')>=0 && DB.get('karten', [])[0].id==='k-neu' && localStorage.getItem(PREFIX+'karten')==='[]', JSON.stringify([r1, Object.keys(DB._ungesichert), ausstehend()]));
pruef('§A3 fslive_ungesichert trägt die Schlüsselnamen', JSON.parse(localStorage.getItem(PREFIX+'fslive_ungesichert')||'[]').indexOf('karten')>=0, localStorage.getItem(PREFIX+'fslive_ungesichert'));
pruef('§A1 kein Toast, kein Aufräumen (Quelltext ohne _quotaCleanup und ohne die alten Toasts)', _toasts.length===0 && (function(){ var s=readFile('index.html'); return s.indexOf('DB._quotaCleanup')<0 && s.indexOf("toast('💾 Speicher war voll")<0 && s.indexOf("toast('⚠️ Speicher voll")<0 && s.indexOf('try{ speicherAufraeumen(true); }')<0; })(), JSON.stringify(_toasts));

// ══ §A2 · spiegeln() sendet den Wert aus _ungesichert, nicht aus localStorage ══
_aufrufe=[]; FSLive.spiegeln(); drain();
var putK=aufrufe('PUT', '/api/spiegel/fokus4_karten');
pruef('§A2 spiegeln(): PUT fokus4_karten mit dem Wert aus dem Arbeitsspeicher', putK.length===1 && putK[0].body===JSON.stringify(neu), JSON.stringify(putK));
pruef('§A2 nach dem Senden: Schlüssel nicht mehr ausstehend, Wert bleibt in _ungesichert (bis nachholen)', ausstehend().indexOf('karten')<0 && DB._ungesichert.karten===JSON.stringify(neu));

// ══ §A4 · Variante 2 (gekoppelt, führend, grün/gelb) und Variante 3 (rot) ══
pruef('§A4 Variante 2: gekoppelt, führend, grün → „Änderungen gehen an FocusSystem“', leiste().style.display==='block' && leiste().textContent==='⚠️ Speicher voll · Änderungen gehen an FocusSystem · App nicht schließen', leiste().textContent+' / '+FSLive.zustand());
_antworten['PUT /api/spiegel/']={ offline:true };
FSLive.vormerken('karten'); FSLive.spiegeln(); drain();
pruef('§A4 Variante 3: Zustand rot → „Änderungen NICHT gesichert“', FSLive.zustand()==='rot' && leiste().textContent==='⚠️ Speicher voll · Änderungen NICHT gesichert · App offen lassen, Mac mini verbinden', leiste().textContent+' / '+FSLive.zustand());
_antworten['PUT /api/spiegel/']=OK;

// ══ §A1 · DB.del und DB.nachholen ══
DB.set('ui', { x:1 });
pruef('§A1 zweiter ungesicherter Schlüssel (ui)', DB._ungesichert.ui===JSON.stringify({ x:1 }) && JSON.parse(localStorage.getItem(PREFIX+'fslive_ungesichert')).length===2);
DB.del('ui');
pruef('§A1 DB.del entfernt aus _ungesichert und aus der Liste', DB._ungesichert.ui===undefined && JSON.parse(localStorage.getItem(PREFIX+'fslive_ungesichert')).indexOf('ui')<0);
_voll=false; DB.nachholen(); FSLive.spiegeln(); drain();
pruef('§A1 nachholen: Wert im Speicher, _ungesichert leer, Liste entfernt, Leiste weg', localStorage.getItem(PREFIX+'karten')===JSON.stringify(neu) && Object.keys(DB._ungesichert).length===0 && localStorage.getItem(PREFIX+'fslive_ungesichert')===null && leiste().style.display==='none', JSON.stringify([localStorage.getItem(PREFIX+'fslive_ungesichert'), leiste().style.display]));

// ══ §A5 · Start mit ungesicherten Schlüsseln: Sperrliste, Variante 1, Dienst nicht erreichbar ══
localStorage.setItem(PREFIX+'karten', JSON.stringify([{ id:'alt' }]));
localStorage.setItem(PREFIX+'fslive_ungesichert', JSON.stringify(['karten']));
_reloads=0;
neuStart({ 'GET /api/app/fuehrung':fuehrungIch, 'GET /api/app/stand':{ offline:true }, 'PUT /api/spiegel/':OK, 'DELETE /api/spiegel/':OK, 'GET /api/app/pakete':LEER, 'PUT /api/app/uhr':UHR, 'POST /api/db/':DBLEER });
timerLaufen(); drain();
pruef('§A5.2 Sperrliste: karten wird nicht gesendet, bleibt ausstehend; andere Betriebsschlüssel gehen raus', FSLive.sperrlisteGroesse()===1 && aufrufe('PUT', '/api/spiegel/fokus4_karten').length===0 && ausstehend().indexOf('karten')>=0 && aufrufe('PUT', '/api/spiegel/fokus4_').length>=1, JSON.stringify(_aufrufe.map(function(a){ return a.methode+' '+a.pfad; })));
pruef('§A5.3 GET /api/app/stand?ab=0 versucht (Zeitgrenze 15 s), Dienst nicht erreichbar → Sperrliste bleibt, kein Neuladen', aufrufe('GET', '/api/app/stand?ab=0').length===1 && FSLive.sperrlisteGroesse()===1 && _reloads===0 && localStorage.getItem(PREFIX+'fslive_ungesichert')!==null);
pruef('§A4 Variante 1: Sperrliste besteht → „Stand vom Mac mini noch nicht geholt“', leiste().style.display==='block' && leiste().textContent==='⚠️ Stand vom Mac mini noch nicht geholt · bitte verbinden', leiste().textContent);
// Sichtbarwerden: Schritt 3 erneut, diesmal erreichbar → geschrieben, Liste leer, Neuladen
_antworten['GET /api/app/stand']={ json:{ fuehrend:'GERAET-B', stand_nr:9, schluessel:{ karten:[{ id:'vom-mini' }], fokus:{ laeuft:false } } } };
_aufrufe=[]; feuern('visibilitychange', {}); drain();
pruef('§A5.3 beim Sichtbarwerden: Stand geholt, Schlüssel geschrieben (auch wenn ein anderes Gerät führt), Marke weg, Sperrliste leer, Neuladen', aufrufe('GET', '/api/app/stand?ab=0').length===1 && JSON.parse(localStorage.getItem(PREFIX+'karten'))[0].id==='vom-mini' && localStorage.getItem(PREFIX+'fslive_ungesichert')===null && FSLive.sperrlisteGroesse()===0 && _reloads===1, JSON.stringify([_aufrufe.map(function(a){ return a.methode+' '+a.pfad; }), localStorage.getItem(PREFIX+'karten'), _reloads]));
pruef('§A4 Leiste nach der Auflösung weg (kein ungesicherter Schlüssel, keine Sperrliste)', leiste().style.display==='none');

// ══ §A5.3 · passt auch nach dem Auslagern nicht → Werte im Arbeitsspeicher, App arbeitet damit ══
localStorage.setItem(PREFIX+'karten', JSON.stringify([{ id:'alt' }]));
localStorage.setItem(PREFIX+'fslive_ungesichert', JSON.stringify(['karten']));
localStorage.setItem(PREFIX+'karten_bak1130', JSON.stringify([{ id:'bak' }]));
_vollSchluessel=PREFIX+'karten'; _reloads=0; _toasts.length=0;
neuStart({ 'GET /api/app/fuehrung':fuehrungIch, 'GET /api/app/stand':{ json:{ fuehrend:ME, stand_nr:10, schluessel:{ karten:[{ id:'vom-mini-2' }] } } }, 'PUT /api/spiegel/':OK, 'DELETE /api/spiegel/':OK, 'GET /api/spiegel/':{ status:404, json:{ fehler:'Nicht vorhanden' } }, 'GET /api/app/pakete':LEER, 'PUT /api/app/uhr':UHR, 'POST /api/db/':DBLEER });
timerLaufen(); drain(200);
pruef('§A5.3 passt nicht: Auslagern versucht (PUT der Sicherung), Schritt 3 genau einmal wiederholt (zwei GET stand?ab=0), kein Neuladen', aufrufe('PUT', '/api/spiegel/fokus4_karten_bak1130').length===1 && aufrufe('GET', '/api/app/stand?ab=0').length===2 && _reloads===0, JSON.stringify(_aufrufe.map(function(a){ return a.methode+' '+a.pfad; })));
pruef('§A5.3 danach: Wert in _ungesichert, Sperrliste leer, Liste gemerkt, App arbeitet mit dem Stand aus dem Arbeitsspeicher (DB.get, S.karten)', DB._ungesichert.karten===JSON.stringify([{ id:'vom-mini-2' }]) && FSLive.sperrlisteGroesse()===0 && JSON.parse(localStorage.getItem(PREFIX+'fslive_ungesichert')).indexOf('karten')>=0 && DB.get('karten', [])[0].id==='vom-mini-2' && S.karten.length===1 && S.karten[0].id==='vom-mini-2' && localStorage.getItem(PREFIX+'karten_bak1130')!==null, JSON.stringify([Object.keys(DB._ungesichert), S.karten.map(function(k){ return k.id; })]));
pruef('§A4 danach Variante 2 (führend, Zustand grün/gelb)', leiste().style.display==='block' && leiste().textContent.indexOf('Änderungen gehen an FocusSystem')>0, leiste().textContent+' / '+FSLive.zustand());
_vollSchluessel=null; DB.nachholen(); localStorage.removeItem(PREFIX+'karten_bak1130');

// ══ §A6.3 · Übernahme mit einem nicht passenden Schlüssel: alles zurück auf alt, standNr unverändert ══
var altKarten=JSON.stringify([{ id:'alt-uebernahme' }]);
localStorage.setItem(PREFIX+'karten', altKarten); localStorage.removeItem(PREFIX+'stapel');
localStorage.setItem(PREFIX+'karten_bak1130', JSON.stringify([{ id:'bak' }]));
_vollSchluessel=PREFIX+'meta'; _reloads=0; _toasts.length=0;
neuStart({ 'GET /api/app/fuehrung':FUEHRUNG_B, 'GET /api/app/stand':{ json:{ fuehrend:'GERAET-B', stand_nr:77, schluessel:{ karten:[{ id:'neu-uebernahme' }], stapel:[{ id:'s1' }], meta:{ migration200:true, x:1 } } } }, 'POST /api/app/fuehrung':fuehrungIch, 'PUT /api/spiegel/':OK, 'DELETE /api/spiegel/':OK, 'GET /api/spiegel/':spiegelGet, 'GET /api/app/pakete':LEER, 'PUT /api/app/uhr':UHR, 'POST /api/db/':DBLEER });
var nr0=FSLive.standNr();
tippen(100, 200); drain(); timerLaufen(); drain(200); timerLaufen(); drain(200);
pruef('§A6.3 meta passt nicht: karten wieder auf alt, stapel (war null) wieder entfernt, standNr unverändert, Toast', localStorage.getItem(PREFIX+'karten')===altKarten && localStorage.getItem(PREFIX+'stapel')===null && FSLive.standNr()===nr0 && _toasts.indexOf('Übernahme passt nicht in den Speicher — Sicherungen werden ausgelagert')>=0, JSON.stringify([localStorage.getItem(PREFIX+'karten'), localStorage.getItem(PREFIX+'stapel'), nr0, FSLive.standNr(), _toasts]));
pruef('§A6.3 Sicherungen werden ausgelagert (PUT und geprüftes GET der Sicherung, danach lokal entfernt)', aufrufe('PUT', '/api/spiegel/fokus4_karten_bak1130').length===1 && aufrufe('GET', '/api/spiegel/fokus4_karten_bak1130').length===1 && localStorage.getItem(PREFIX+'karten_bak1130')===null, JSON.stringify(_aufrufe.map(function(a){ return a.methode+' '+a.pfad; })));
pruef('§A6.3 seit Hotfix 19.1 §1: Führung zurück an GERAET-B, nicht führend, speicherZuKlein', FSLive.ichFuehre()===false && FSLive.speicherZuKlein()===true && aufrufe('POST', '/api/app/fuehrung').some(function(a){ return !!a.body && JSON.parse(a.body).geraet_id==='GERAET-B'; }), JSON.stringify([FSLive.ichFuehre(), FSLive.speicherZuKlein()]));
_vollSchluessel=null; DB.nachholen();
_aufrufe=[]; sicherungenAuslagern({ auto:true }); drain(200);   // Hotfix 19.1 §2.5: Stand passt jetzt → standHolen übernimmt, speicherZuKlein zurück
pruef('§A6.3 danach (19.1 §2.5): Stand übernommen, speicherZuKlein false, weiter nicht führend', JSON.parse(localStorage.getItem(PREFIX+'karten'))[0].id==='neu-uebernahme' && FSLive.speicherZuKlein()===false && FSLive.ichFuehre()===false, JSON.stringify([_aufrufe.map(function(a){ return a.methode+' '+a.pfad; }), FSLive.speicherZuKlein()]));

// ══ §A6.2 · erste Übernahme: Kopie vorUebernahme_<Zeit> geht an den Dienst — scheitert die Prüfung, Abbruch ══
// Die Modulvariable ersteUebernahmeErledigt liest die App nur beim Laden; der Ablauf der ersten Übernahme (Kopie an den Dienst, Neuladen) wird in Suite v42 geprüft.
pruef('§A6.2 Quelltext: Kopie vorUebernahme_<Zeit> geht mit sicherungSenden() an den Dienst, kein localStorage.setItem mehr dafür; Abbruch-Toast; ganz oder gar nicht', (function(){ var s=readFile('index.html');
  return s.indexOf("await sicherungSenden('vorUebernahme_'+new Date().toISOString().replace(/:/g,''), JSON.stringify(vorher))")>=0 &&
    s.indexOf("localStorage.setItem(PREFIX+'vorUebernahme_'")<0 &&
    s.indexOf("toast('Übernahme abgebrochen — Sicherung nicht in FocusSystem')")>=0 &&
    s.indexOf('async function standUebernehmen(d, sofort)')>=0 &&
    s.indexOf("sicherungenAuslagern({ auto:true }).then(()=>standHolen(true))")>=0; })());
pruef('§A6.2 sicherungSenden: PUT, dann GET; true nur bei gleichem Inhalt', (function(){
  var erg=[]; _aufrufe=[]; _antworten={ 'PUT /api/spiegel/':OK, 'GET /api/spiegel/':spiegelGet };
  FSLive.sicherungSenden('vorUebernahme_2026-10-22T205300.123Z', JSON.stringify({ karten:'[]', b:1 })).then(function(ok){ erg.push(ok); }); drain();
  _antworten['GET /api/spiegel/']={ json:{ inhalt:{ karten:'[]', b:2 } } };
  FSLive.sicherungSenden('vorUebernahme_x', JSON.stringify({ karten:'[]', b:1 })).then(function(ok){ erg.push(ok); }); drain();
  _antworten['GET /api/spiegel/']={ status:404, json:{ fehler:'Nicht vorhanden' } };
  FSLive.sicherungSenden('vorUebernahme_y', '{}').then(function(ok){ erg.push(ok); }); drain();
  var p=aufrufe('PUT', '/api/spiegel/fokus4_vorUebernahme_2026_10_22T205300_123Z'), g=aufrufe('GET', '/api/spiegel/fokus4_vorUebernahme_2026_10_22T205300_123Z');
  return erg.length===3 && erg[0]===true && erg[1]===false && erg[2]===false && p.length===1 && g.length===1 && _aufrufe.indexOf(p[0])<_aufrufe.indexOf(g[0]); })(), JSON.stringify(_aufrufe.map(function(a){ return a.methode+' '+a.pfad; })));
pruef('§B3 Dienstschlüssel: -, . und : werden zu _, PREFIX davor, höchstens 80 Zeichen', (function(){
  _aufrufe=[]; _antworten={ 'PUT /api/spiegel/':OK, 'GET /api/spiegel/':spiegelGet };
  FSLive.sicherungSenden('a-b.c:d'+new Array(120).join('x'), '1'); drain();
  var p=_aufrufe[0]; return !!p && p.pfad.indexOf('/api/spiegel/fokus4_a_b_c_d')===0 && decodeURIComponent(p.pfad.slice('/api/spiegel/'.length)).length===80; })(), JSON.stringify(_aufrufe.map(function(a){ return a.pfad; })));

// ══ §B1 · istSicherung ══
pruef('§B1 istSicherung true: karten_bak1130, settings_bak200n, import_bak, shop360_bak, vorUebernahme_2026-10-22T205300.123Z', ['karten_bak1130','settings_bak200n','import_bak','shop360_bak','vorUebernahme_2026-10-22T205300.123Z','reset35_bak','feldkarten353_bak','meta_bak1130','intraday_bak133','historie_bak131','besitz_bak1133','settings_bakimport'].every(istSicherung));
pruef('§B1 istSicherung false: karten, meta, fslive_warteschlange, ui, karten_vomGeraet, fslive_ungesichert', ['karten','meta','fslive_warteschlange','ui','karten_vomGeraet','fslive_ungesichert','tag','settings'].every(function(k){ return !istSicherung(k); }));
localStorage.setItem(PREFIX+'karten_bak1130', '[]'); localStorage.setItem(PREFIX+'karten_bak1120', '[]');
pruef('§B1 speicherBaks liefert alle Sicherungen, auch die jüngste je Art', speicherBaks().indexOf('karten_bak1130')>=0 && speicherBaks().indexOf('karten_bak1120')>=0 && speicherBaks().every(istSicherung), JSON.stringify(speicherBaks()));
speicherBaks().forEach(function(k){ localStorage.removeItem(PREFIX+k); });

// ══ §B3 · gleich() ══
pruef('§B3 gleich: Objekte unabhängig von der Schlüsselreihenfolge, verschachtelt', FSLive.gleich({ a:1, b:{ c:[1,2,{ d:'x' }], e:null } }, { b:{ e:null, c:[1,2,{ d:'x' }] }, a:1 })===true);
pruef('§B3 gleich: Arrays in anderer Reihenfolge ungleich', FSLive.gleich([1,2,3], [1,3,2])===false && FSLive.gleich([1,2], [1,2,3])===false);
pruef('§B3 gleich: Zahlen mit ===, sonst ===', FSLive.gleich(1, 1)===true && FSLive.gleich(1, '1')===false && FSLive.gleich(0, -0)===true && FSLive.gleich(null, {})===false && FSLive.gleich({ a:1 }, { a:1, b:undefined })===false && FSLive.gleich('x', 'x')===true && FSLive.gleich(true, 1)===false);

// ══ §B3 · sicherungenAuslagern: entfernt nur bei gleich() true, nach Größe absteigend ══
localStorage.setItem(PREFIX+'karten_bak1130', JSON.stringify(new Array(300).join('k').split('')));
localStorage.setItem(PREFIX+'import_bak', JSON.stringify({ ts:'x', karten:[1,2,3] }));
localStorage.setItem(PREFIX+'vorUebernahme_2026-10-22T205300.123Z', JSON.stringify({ karten:'[]' }));
localStorage.setItem(PREFIX+'settings_bak200n', JSON.stringify({ a:1 }));
_aufrufe=[]; _toasts.length=0;
_antworten={ 'PUT /api/spiegel/':OK, 'GET /api/spiegel/fokus4_import_bak':{ json:{ inhalt:{ ts:'x', karten:[3,2,1] } } }, 'GET /api/spiegel/':spiegelGet };
var erg3=null; sicherungenAuslagern({ auto:false }).then(function(e){ erg3=e; }); drain(400);
pruef('§B3 auslagern: drei bestätigt und entfernt, import_bak (anderer Inhalt) bleibt, nicht bestätigt', !!erg3 && localStorage.getItem(PREFIX+'karten_bak1130')===null && localStorage.getItem(PREFIX+'vorUebernahme_2026-10-22T205300.123Z')===null && localStorage.getItem(PREFIX+'settings_bak200n')===null && localStorage.getItem(PREFIX+'import_bak')!==null && erg3.ausgelagert.length===3 && erg3.nichtBestaetigt.length===1 && erg3.nichtBestaetigt[0]==='import_bak', JSON.stringify(erg3));
pruef('§B3 Reihenfolge nach Größe absteigend, Dienstschlüssel ohne - . :', aufrufe('PUT', '/api/spiegel/').length===4 && aufrufe('PUT', '/api/spiegel/')[0].pfad==='/api/spiegel/fokus4_karten_bak1130' && aufrufe('PUT', '/api/spiegel/fokus4_vorUebernahme_2026_10_22T205300_123Z').length===1, JSON.stringify(aufrufe('PUT', '/api/spiegel/').map(function(a){ return a.pfad; })));
pruef('§B3 Protokoll S.meta.sicherungAuslagerLog und Toast', !!S.meta.sicherungAuslagerLog && S.meta.sicherungAuslagerLog.ausgelagert.length===3 && S.meta.sicherungAuslagerLog.nichtBestaetigt[0]==='import_bak' && typeof S.meta.sicherungAuslagerLog.vorherKb==='number' && _toasts.some(function(t){ return /^💾 \d+ → \d+ KB · 3 Sicherungen in FocusSystem · 1 nicht bestätigt, bleiben hier$/.test(t); }), JSON.stringify([S.meta.sicherungAuslagerLog, _toasts]));
localStorage.removeItem(PREFIX+'import_bak');
// nicht gekoppelt: nichts entfernt
localStorage.setItem(PREFIX+'reset35_bak', '{"a":1}');
localStorage.removeItem(PREFIX+'fslive_token');
_aufrufe=[]; _toasts.length=0; var erg4='x'; sicherungenAuslagern({ auto:false }).then(function(e){ erg4=e; }); drain();
pruef('§B3 nicht gekoppelt: nichts gesendet, nichts entfernt, Toast „Mac mini nicht erreichbar — nichts entfernt“', erg4===null && _aufrufe.length===0 && localStorage.getItem(PREFIX+'reset35_bak')!==null && _toasts.indexOf('Mac mini nicht erreichbar — nichts entfernt')>=0, JSON.stringify([erg4, _toasts]));
_toasts.length=0; sicherungenAuslagern({ auto:true }); drain();
pruef('§B3 nicht gekoppelt, auto: kein Toast', _toasts.length===0);
localStorage.setItem(PREFIX+'fslive_token', 'test-token');
localStorage.removeItem(PREFIX+'reset35_bak');

// ══ §B4 · Aufräumen löscht keine Sicherungen mehr ══
localStorage.setItem(PREFIX+'karten_bak1130', '[]');
var erg5=speicherAufraeumen(true);
pruef('§B4 speicherAufraeumen: Sicherung bleibt, geloescht leer, Protokoll wie bisher', localStorage.getItem(PREFIX+'karten_bak1130')==='[]' && erg5.geloescht.length===0 && S.meta.speicherAufraeumLog.geloescht.length===0 && typeof S.meta.speicherAufraeumLog.histTageWeg==='number');
localStorage.removeItem(PREFIX+'karten_bak1130');
pruef('§B4 Karte „💾 Speicher“ und Knopf 🧹 (Quelltext)', (function(){ var s=readFile('index.html');
  return s.indexOf('Mit 🗄 markierte Daten liegen in der Browser-Datenbank (viel Platz), der Rest im Browser-Speicher (~2,5 MB, mit der alten App geteilt). Welche Daten umziehen, steht in der Einstellung Speicher-Umzug. Aufräumen lagert Sicherungen nach FocusSystem aus und kappt die Kettenhistorie auf ')>=0 &&   // Hotfix 20 §4.4: neue Beschreibung
    s.indexOf("' Sicherung(en) auslagerbar.</p>'")>=0 && s.indexOf('alte Sicherung(en) löschbar')<0 &&
    s.indexOf("' Sicherung(en) werden nach FocusSystem ausgelagert und hier erst entfernt, wenn FocusSystem sie geprüft zurückgegeben hat:\\n'")>=0 &&
    s.indexOf("sicherungenAuslagern({ auto:false })")>=0 && s.indexOf("<span>Ausgelagert ('")>=0 && s.indexOf("Nicht gespeichert: '")>=0; })());

// ══ §A4 · Leiste verschwindet bei leerem _ungesichert ohne Sperrliste; Tipp öffnet die Einstellungen ══
DB._ungesichert.karten='[]'; FSLive.speicherVollMelden();
pruef('§A4 Leiste sichtbar bei ungesichertem Schlüssel', leiste().style.display==='block');
delete DB._ungesichert.karten; FSLive.speicherVollMelden();
pruef('§A4 Leiste weg, ohne Toast', leiste().style.display==='none' && _toasts.length===0);
pruef('§A4 Tipp: Einstellungen und Abschnitt „💾 Speicher“ (Quelltext)', (function(){ var s=readFile('index.html'); return s.indexOf("leiste.addEventListener('click'")>=0 && s.indexOf("seiteZeigen('einst');")>=0 && s.indexOf('[data-einstabschnitt="speicher"]')>=0; })());

// ══ Hotfix 19.1 §1 · Übernahme scheitert (meta passt nicht) → Führung an das vorige Gerät zurück ══
localStorage.setItem(PREFIX+'fslive_ersteUebernahme', '1');
speicherBaks().forEach(function(k){ localStorage.removeItem(PREFIX+k); });
var altK=JSON.stringify([{ id:'alt-191' }]);
localStorage.setItem(PREFIX+'karten', altK);
var STAND191={ json:{ fuehrend:'GERAET-B', stand_nr:80, schluessel:{ karten:[{ id:'neu-191' }], meta:{ migration200:true, x:1 } } } };
function postFuehrung(opt){ return opt.body ? { json:{ fuehrend:JSON.parse(opt.body).geraet_id, stand_nr:80 } } : fuehrungIch(); }
_vollSchluessel=PREFIX+'meta'; _toasts.length=0; geklickt.length=0;
neuStart({ 'GET /api/app/fuehrung':FUEHRUNG_B, 'GET /api/app/stand':STAND191, 'POST /api/app/fuehrung':postFuehrung, 'PUT /api/spiegel/':OK, 'DELETE /api/spiegel/':OK, 'GET /api/spiegel/':spiegelGet, 'GET /api/app/pakete':LEER, 'PUT /api/app/uhr':UHR, 'POST /api/db/':DBLEER });
document.elementFromPoint=knopfBei;
_aufrufe=[]; tippen(100, 200); drain(); timerLaufen(); drain(200); timerLaufen(); drain(200);
var posts=aufrufe('POST', '/api/app/fuehrung');
pruef('19.1 §1 Übernahme scheitert: erst POST fuehrung ohne Körper, dann POST mit geraet_id des vorigen Geräts (GERAET-B)', posts.length===2 && posts[0].body===undefined && JSON.parse(posts[1].body).geraet_id==='GERAET-B', JSON.stringify(posts));
pruef('19.1 §1 danach: nicht führend, fuehrend = voriges Gerät, im Speicher gemerkt, Krone aus', FSLive.ichFuehre()===false && (function(){ var z=JSON.parse(localStorage.getItem(PREFIX+'fslive_fuehrungZuletzt')||'null'); return !!z && z.fuehrend==='GERAET-B' && z.ichFuehre===false; })() && element('fsKrone').style.display==='none', localStorage.getItem(PREFIX+'fslive_fuehrungZuletzt'));
pruef('19.1 §1 kein gemeinsamer Schlüssel in offen, kein PUT eines Betriebsschlüssels, karten lokal unverändert (alt)', ausstehend().every(function(k){ return k==='ui' || !FSLive.istBetrieb(k); }) && aufrufe('PUT', '/api/spiegel/fokus4_karten').length===0 && aufrufe('PUT', '/api/spiegel/fokus4_tag').length===0 && localStorage.getItem(PREFIX+'karten')===altK, JSON.stringify([ausstehend(), aufrufe('PUT', '/api/spiegel/').map(function(a){ return a.pfad; })]));
pruef('19.1 §1/§2.1 speicherZuKlein, Leiste „Stand passt nicht · hier tippen zum Aufräumen“, Tipp nicht ausgeführt, Sperre weg, Toast „Gerät bleibt Anzeige“', FSLive.speicherZuKlein()===true && leiste().style.display==='block' && leiste().textContent==='⚠️ Speicher voll · Stand passt nicht · hier tippen zum Aufräumen' && geklickt.length===0 && element('fsSperre').style.display==='none' && _toasts.indexOf('Stand passt nicht in den Speicher — Gerät bleibt Anzeige')>=0, JSON.stringify([FSLive.speicherZuKlein(), leiste().textContent, geklickt, element('fsSperre').style.display, _toasts]));
// ══ Hotfix 19.1 §1/§2.5 · nach dem Auslagern: standHolen(true) übernimmt den Stand, Leiste weg, Gerät bleibt Anzeige ══
_vollSchluessel=null; _aufrufe=[];
sicherungenAuslagern({ auto:true }); drain(200);
pruef('19.1 §2.5 nach dem Auslagern (nicht führend, gekoppelt): GET stand, Stand übernommen, speicherZuKlein false, Leiste weg, nicht führend', aufrufe('GET', '/api/app/stand').length===1 && JSON.parse(localStorage.getItem(PREFIX+'karten'))[0].id==='neu-191' && FSLive.speicherZuKlein()===false && leiste().style.display==='none' && FSLive.ichFuehre()===false && aufrufe('POST', '/api/app/fuehrung').length===0, JSON.stringify([_aufrufe.map(function(a){ return a.methode+' '+a.pfad; }), localStorage.getItem(PREFIX+'karten'), FSLive.speicherZuKlein(), leiste().style.display]));
// ══ Hotfix 19.1 §1 · POST scheitert: lokal trotzdem nicht führend, Toast „Führung nicht zurückgegeben …“ ══
localStorage.setItem(PREFIX+'karten', altK);
_vollSchluessel=PREFIX+'meta'; _toasts.length=0; geklickt.length=0;
neuStart({ 'GET /api/app/fuehrung':FUEHRUNG_B, 'GET /api/app/stand':STAND191, 'POST /api/app/fuehrung':function(opt){ return opt.body ? { offline:true } : fuehrungIch(); }, 'PUT /api/spiegel/':OK, 'DELETE /api/spiegel/':OK, 'GET /api/spiegel/':spiegelGet, 'GET /api/app/pakete':LEER, 'PUT /api/app/uhr':UHR, 'POST /api/db/':DBLEER });
document.elementFromPoint=knopfBei;
_aufrufe=[]; tippen(100, 200); drain(); timerLaufen(); drain(200); timerLaufen(); drain(200);
pruef('19.1 §1 POST scheitert: lokal nicht führend, fuehrend = voriges Gerät, Tipp nicht ausgeführt, Toast „Führung nicht zurückgegeben — in Einstellungen › 📱 Geräte das führende Gerät setzen“', FSLive.ichFuehre()===false && JSON.parse(localStorage.getItem(PREFIX+'fslive_fuehrungZuletzt')).fuehrend==='GERAET-B' && geklickt.length===0 && FSLive.speicherZuKlein()===true && _toasts.indexOf('Führung nicht zurückgegeben — in Einstellungen › 📱 Geräte das führende Gerät setzen')>=0 && localStorage.getItem(PREFIX+'karten')===altK, JSON.stringify([FSLive.ichFuehre(), geklickt, _toasts]));
// ══ Hotfix 19.1 §2.2 · Tipp auf #speicherVoll und in [data-speicherkarte]: keine Übernahme ══
_antworten['POST /api/app/fuehrung']=postFuehrung;
_aufrufe=[]; feuern('pointerdown', ereignis(5, 5, ausgenommenZiel('#speicherVoll'))); var uL=ereignis(5, 5, ausgenommenZiel('#speicherVoll')); feuern('pointerup', uL); drain(); timerLaufen(); drain();
var uK=ereignis(5, 5, ausgenommenZiel('[data-speicherkarte]')); feuern('pointerdown', ereignis(5, 5, ausgenommenZiel('[data-speicherkarte]'))); feuern('pointerup', uK); drain(); timerLaufen(); drain();
pruef('19.1 §2.2 Tipp auf die Leiste und in die Karte „💾 Speicher“ (nicht führend): nichts abgefangen, kein /api/app/fuehrung, kein stand', uL.pd===0 && uK.pd===0 && aufrufe('POST', '/api/app/fuehrung').length===0 && aufrufe('GET', '/api/app/stand').length===0 && FSLive.ichFuehre()===false, JSON.stringify([uL.pd, uK.pd, _aufrufe.map(function(a){ return a.methode+' '+a.pfad; })]));
pruef('19.1 §2.3 Karte „💾 Speicher“ trägt data-speicherkarte="1"; Ausnahmen im Quelltext', (function(){ var s=readFile('index.html'); return s.indexOf('<div class="card" data-speicherkarte="1"><h3>💾 Speicher</h3>')>=0 && s.indexOf("t.closest('#speicherVoll') || t.closest('[data-speicherkarte]')")>=0; })());
// zurück in den Normalzustand: Auslagern → standHolen → Stand passt
_vollSchluessel=null; _aufrufe=[]; sicherungenAuslagern({ auto:true }); drain(200);
pruef('19.1 §2.5 zweiter Fall: nach dem Auslagern Stand übernommen, speicherZuKlein false, nicht führend', FSLive.speicherZuKlein()===false && FSLive.ichFuehre()===false && JSON.parse(localStorage.getItem(PREFIX+'karten'))[0].id==='neu-191', JSON.stringify(_aufrufe.map(function(a){ return a.methode+' '+a.pfad; })));
// ══ Hotfix 19.1 §1.2 · Übernahme gelingt: unverändert führend, Tipp ausgeführt ══
_toasts.length=0; geklickt.length=0;
neuStart({ 'GET /api/app/fuehrung':FUEHRUNG_B, 'GET /api/app/stand':{ json:{ fuehrend:'GERAET-B', stand_nr:81, schluessel:{ karten:[{ id:'ok-191' }], fokus:{ laeuft:false } } } }, 'POST /api/app/fuehrung':postFuehrung, 'PUT /api/spiegel/':OK, 'DELETE /api/spiegel/':OK, 'GET /api/app/pakete':LEER, 'PUT /api/app/uhr':UHR, 'POST /api/db/':DBLEER });
document.elementFromPoint=knopfBei;
_aufrufe=[]; tippen(100, 200); drain(); timerLaufen(); drain(200); timerLaufen(); drain(200);
pruef('19.1 §1.2 Übernahme gelingt: führend, Stand übernommen, Tipp ausgeführt, kein POST mit geraet_id, speicherZuKlein false, Leiste weg', FSLive.ichFuehre()===true && S.karten.length===1 && S.karten[0].id==='ok-191' && geklickt.length===1 && aufrufe('POST', '/api/app/fuehrung').length===1 && aufrufe('POST', '/api/app/fuehrung')[0].body===undefined && FSLive.speicherZuKlein()===false && leiste().style.display==='none', JSON.stringify([FSLive.ichFuehre(), S.karten.map(function(k){ return k.id; }), geklickt, aufrufe('POST', '/api/app/fuehrung')]));
// ══ Hotfix 19.1 §3 · istSicherung mit Unterstrich nach _bak ══
pruef('19.1 §3 istSicherung true: settings_bak_ziele400, settings_bak_shopfrei400, settings_bak_ranglast400', ['settings_bak_ziele400','settings_bak_shopfrei400','settings_bak_ranglast400','karten_bak1130','import_bak'].every(istSicherung) && !istSicherung('karten') && !istSicherung('fslive_warteschlange') && !istSicherung('karten_vomGeraet'));

// ══ Hotfix 20.1 · §D Auslagern löscht aus dem Puffer, Nachholen schreibt Betrieb zuerst ══
localStorage.setItem(PREFIX+'fslive_token', 'test-token'); _voll=false; _vollSchluessel=null;
DB._ungesichert={}; DB._ungesichert['karten_bak9']=JSON.stringify([1,2,3]);   // nur im Puffer, nie in localStorage angekommen
_aufrufe=[]; _toasts.length=0; _antworten={ 'PUT /api/spiegel/':OK, 'GET /api/spiegel/':spiegelGet };
var ergD=null; sicherungenAuslagern({ auto:false }).then(function(e){ ergD=e; }); drain(400);
pruef('20.1 §D1 Sicherung nur im Puffer: gesendet, bestätigt, aus dem Puffer gelöscht, nicht in localStorage', !!ergD && ergD.ausgelagert.some(function(e){ return e.key==='karten_bak9'; }) && ergD.nichtBestaetigt.length===0 && DB._ungesichert['karten_bak9']===undefined && localStorage.getItem(PREFIX+'karten_bak9')===null && aufrufe('PUT', '/api/spiegel/fokus4_karten_bak9').length===1, JSON.stringify(ergD)+' '+JSON.stringify(Object.keys(DB._ungesichert)));
localStorage.setItem(PREFIX+'stapel_bak9', '[9]'); DB._ungesichert['stapel_bak9']='[9]';   // in beiden: nach Bestätigung in keinem mehr
_aufrufe=[]; ergD=null; sicherungenAuslagern({ auto:false }).then(function(e){ ergD=e; }); drain(400);
pruef('20.1 §D2 Sicherung in localStorage und Puffer: nach Bestätigung aus beiden entfernt', !!ergD && ergD.ausgelagert.length===1 && DB._ungesichert['stapel_bak9']===undefined && localStorage.getItem(PREFIX+'stapel_bak9')===null, JSON.stringify(ergD));
var _reihe=[]; var _setAlt=localStorage.setItem; localStorage.setItem=function(k, v){ _reihe.push(k); return _setItemEcht.call(localStorage, k, v); };
DB._ungesichert={}; DB._ungesichert['intraday_bak9']='[1]'; DB._ungesichert['meta']='{"x":1}'; DB._ungesichert['karten']='[]';
DB.nachholen(); localStorage.setItem=_setAlt;
pruef('20.1 §D3 nachholen: Betriebsschlüssel (meta, karten) vor der Sicherung (intraday_bak9), alle geschrieben', _reihe.slice(0,3).join(',')==='fokus4_meta,fokus4_karten,fokus4_intraday_bak9' && Object.keys(DB._ungesichert).length===0, _reihe.join(','));
['intraday_bak9','meta','karten'].forEach(function(k){ localStorage.removeItem(PREFIX+k); });
pruef('20.1 §D4 Quelltext: Auslagern löscht aus DB._ungesichert, Puffer-Sicherungen kommen in die Liste', (function(){ var s=readFile('index.html'); return s.indexOf("delete DB._ungesichert[e.key]; ausgelagert.push(")>=0 && s.indexOf("Object.keys(DB._ungesichert).forEach(k=>{ if(istSicherung(k) && namen.indexOf(k)<0) namen.push(k); })")>=0; })());

// ══ Hotfix 20.2 · §E Umzug-Standard alle gemeinsamen Schlüssel, fremde Schlüssel in der Speicher-Karte ══
pruef('20.2 §E1 UMZUG_STANDARD = GEMEINSAM ohne settings (15 Namen, alle erlaubt)', DB.UMZUG_STANDARD.length===15 && DB.UMZUG_STANDARD.indexOf('meta')>=0 && DB.UMZUG_STANDARD.indexOf('karten')>=0 && DB.UMZUG_STANDARD.indexOf('settings')<0 && DB.UMZUG_STANDARD.every(DB.umzugErlaubt) && FSLive.gemeinsam().filter(function(k){ return k!=='settings'; }).every(function(k){ return DB.UMZUG_STANDARD.indexOf(k)>=0; }), DB.UMZUG_STANDARD.join(','));
pruef('20.2 §E2 umzugListe: Standard plus Einstellung, ohne Doppelte; leer/kaputt → Standard', DB.umzugListe(['intraday','x']).length===16 && DB.umzugListe(['intraday','x']).indexOf('x')===15 && DB.umzugListe(null).length===15 && DB.umzugListe('meta').length===15);
pruef('20.2 §E3 DEFAULT_SETTINGS.speicherIdb = Standard', JSON.stringify(DEFAULT_SETTINGS.speicherIdb)===JSON.stringify(DB.UMZUG_STANDARD));
localStorage.setItem('fokus2.alt', '{"a":1}');
var bel=speicherBelegung();
pruef('20.2 §E4 speicherBelegung zählt fremde Schlüssel (ohne Präfix) getrennt, nicht in rows', bel.fremd>=1 && bel.kbFremd>0 && !bel.rows.some(function(r){ return r.key==='fokus2.alt' || r.key==='alt'; }), JSON.stringify({fremd:bel.fremd, kb:bel.kbFremd}));
localStorage.removeItem('fokus2.alt');
pruef('20.2 §E5 Quelltext: Speicher-Karte zeigt „Andere Daten auf dieser Adresse“', readFile('index.html').indexOf("Andere Daten auf dieser Adresse</span><b>'+b.fremd+' Schlüssel")>=0);

pruef('20.2 §E6 Quelltext: umziehen ruft kein saveMeta() mehr auf (überschrieb beim Start das echte meta mit dem Startwert)', (function(){ var s=readFile('index.html'); var a=s.indexOf('async umziehen(liste){'), b=s.indexOf('async laden(){'); var u=s.slice(a, s.indexOf('\n  }\n', a)); return a>0 && u.indexOf('saveMeta();')<0 && u.indexOf('DB._umzugLog={')>=0; })());

// ══ Hotfix 21 · §F Schutz bei leerem meta, Rückroll ohne Entfernen, 422 Schrumpf, Münzen-Korrektur, Speicher-Karte ══
// §A.1 metaFehlt
pruef('21 §A.1 metaFehlt: leer → true · ohne migration200 → true · vollständig → false · ohne Karten → false', metaFehlt(null, [{id:'k'}])===true && metaFehlt({ x:1 }, [{id:'k'}])===true && metaFehlt({ migration200:true }, [{id:'k'}])===false && metaFehlt(null, [])===false && metaFehlt(undefined, null)===false && metaFehlt('text', [{id:'k'}])===true && metaFehlt([], [{id:'k'}])===true);
// §A.2/§A.3 ladeAlles mit leerem meta: anhalten, keine Migration, kein DB.set, Blatt sichtbar, Status
var metaAltText=JSON.stringify(S.meta), kartenAltText=localStorage.getItem(PREFIX+'karten');
var _gebi=document.getElementById; document.getElementById=function(id){ var e=element(id); return e||_gebi.call(document, id); };
_erzeugt=[]; _angehaengt=[]; document.createElement=function(){ var e=dummyEl(); _erzeugt.push(e); return e; }; document.body.appendChild=function(e){ _angehaengt.push(e); };
localStorage.setItem(PREFIX+'karten', JSON.stringify([{ id:'k-schutz' }])); localStorage.removeItem(PREFIX+'meta'); delete DB._ungesichert.meta;
DB._schutz=false; _antworten={ 'GET /api/app/stand':{ offline:true } }; _aufrufe=[]; _reloads=0; _toasts.length=0;
var migrationsLogVorher=(S.meta.migration200Log||{}).ts||null;
var rLade=ladeAlles(); drain(100);
pruef('21 §A.2 ladeAlles mit leerem meta kehrt zurück: Sperre gesetzt, keine Migration gelaufen, meta nicht geschrieben, S.meta unverändert', rLade===false && DB._schutz===true && localStorage.getItem(PREFIX+'meta')===null && JSON.stringify(S.meta)===metaAltText, JSON.stringify([rLade, DB._schutz, localStorage.getItem(PREFIX+'meta')===null]));
pruef('21 §A.3b Blatt: Text genau, Knopf „Stand vom Mac mini holen“, Status „Mac mini nicht erreichbar — App bleibt angehalten.“ (Dienst offline)', !!element('metaSchutz') && element('metaSchutzText').textContent==='⚠️ Daten auf diesem Gerät unvollständig (meta fehlt). Die App hält an, damit nichts überschrieben wird.' && element('metaSchutzHolen').textContent==='Stand vom Mac mini holen' && element('metaSchutzStatus').textContent==='Mac mini nicht erreichbar — App bleibt angehalten.' && aufrufe('GET', '/api/app/stand?ab=0').length===1, JSON.stringify([!!element('metaSchutz'), element('metaSchutzStatus') && element('metaSchutzStatus').textContent, _aufrufe.map(function(a){ return a.methode+' '+a.pfad; })]));
pruef('21 §A.3a Sperre: DB.set false und schreibt nichts, DB.del entfernt nichts, spiegeln() sendet nichts', DB.set('karten', [])===false && localStorage.getItem(PREFIX+'karten')===JSON.stringify([{ id:'k-schutz' }]) && (DB.del('karten'), localStorage.getItem(PREFIX+'karten')===JSON.stringify([{ id:'k-schutz' }])) && (function(){ _aufrufe=[]; FSLive.spiegeln(); drain(); return aufrufe('PUT', '/api/spiegel/').length===0 && aufrufe('DELETE', '/api/spiegel/').length===0; })());
// §A.3d Stand mit leerem meta → angehalten, Hinweis
_antworten={ 'GET /api/app/stand':{ json:{ fuehrend:'GERAET-B', stand_nr:90, schluessel:{ karten:[{ id:'k-mini' }], meta:{ x:1 } } } } }; _aufrufe=[];   // meta ohne migration200 = unvollständig
metaSchutzHolen(); drain(300);
pruef('21 §A.3d Stand auch unvollständig: Hinweis auf stand_wiederherstellen.js, Sperre bleibt, nichts geschrieben', element('metaSchutzStatus').textContent==='Auch der Stand auf dem Mac mini ist unvollständig — Claude Code mit betrieb/stand_wiederherstellen.js beauftragen.' && DB._schutz===true && localStorage.getItem(PREFIX+'meta')===null && localStorage.getItem(PREFIX+'karten')===JSON.stringify([{ id:'k-schutz' }]) && _reloads===0, JSON.stringify([element('metaSchutzStatus').textContent, _metaSchutzLaeuft, _aufrufe.map(function(a){ return a.methode+' '+a.pfad; }), DB._schutz]));
// §A.3c Stand mit gutem meta → geschrieben, Sperre weg, Neuladen
_antworten={ 'GET /api/app/stand':{ json:{ fuehrend:'GERAET-B', stand_nr:91, schluessel:{ karten:[{ id:'k-mini' }], meta:{ migration200:true, x:2 }, tag:{ datum:'2026-10-27' } } } } }; _aufrufe=[]; _reloads=0;
metaSchutzHolen(); drain(100);
pruef('21 §A.3c Stand gut: alle Schlüssel mit rohSetzen geschrieben, Sperre weg, Neuladen', _reloads===1 && DB._schutz===false && JSON.parse(localStorage.getItem(PREFIX+'meta')||'{}').x===2 && JSON.parse(localStorage.getItem(PREFIX+'karten'))[0].id==='k-mini' && JSON.parse(localStorage.getItem(PREFIX+'tag')||'{}').datum==='2026-10-27', JSON.stringify([_reloads, DB._schutz, localStorage.getItem(PREFIX+'meta')]));
pruef('21 §A.4 Quelltext: init() kehrt bei DB._schutz zurück; planen/spiegeln/paketeHolen/uhrMelden/fuehrungPruefen/fuehrungUebernehmen/standHolen prüfen DB._schutz; Tipp-Abfang nicht bei Sperre', (function(){ var s=readFile('index.html'); return s.indexOf("  ladeAlles();\n  if(DB._schutz) return;")>=0 && (s.match(/if\(DB\._schutz\) return/g)||[]).length>=7 && s.indexOf("const abfangen=()=>!DB._schutz && gekoppelt()")>=0; })());
// zurück zum vorigen Stand
document.getElementById=_gebi; localStorage.setItem(PREFIX+'meta', metaAltText); if(kartenAltText===null) localStorage.removeItem(PREFIX+'karten'); else localStorage.setItem(PREFIX+'karten', kartenAltText); localStorage.removeItem(PREFIX+'tag');
DB._schutz=false; ladeAlles();
// §B Rückroll ohne Entfernen: zweiter Schlüssel passt nicht, Zurückschreiben des ersten scheitert → Wert in _ungesichert, nichts entfernt
localStorage.setItem(PREFIX+'fslive_ersteUebernahme', '1');
speicherBaks().forEach(function(k){ localStorage.removeItem(PREFIX+k); });
var altRb=JSON.stringify([{ id:'alt-rb' }]); localStorage.setItem(PREFIX+'karten', altRb); localStorage.removeItem(PREFIX+'stapel'); delete DB._ungesichert.karten; delete DB._ungesichert.stapel;
var _erlaubt=2, _setVorher=localStorage.setItem;
localStorage.setItem=function(k, v){ if(k===PREFIX+'karten' || k===PREFIX+'stapel' || k===PREFIX+'meta'){ if(_erlaubt>0){ _erlaubt--; return _setItemEcht.call(localStorage, k, v); } throw new Error('QuotaExceededError'); } return _setVorher.call(localStorage, k, v); };
var STAND21={ json:{ fuehrend:'GERAET-B', stand_nr:95, schluessel:{ karten:[{ id:'neu-rb' }], stapel:[{ id:'s-rb' }], meta:{ migration200:true, x:3 } } } };
_toasts.length=0; geklickt.length=0;
neuStart({ 'GET /api/app/fuehrung':FUEHRUNG_B, 'GET /api/app/stand':STAND21, 'POST /api/app/fuehrung':postFuehrung, 'PUT /api/spiegel/':OK, 'DELETE /api/spiegel/':OK, 'GET /api/spiegel/':spiegelGet, 'GET /api/app/pakete':LEER, 'PUT /api/app/uhr':UHR, 'POST /api/db/':DBLEER });
document.elementFromPoint=knopfBei;
_aufrufe=[]; tippen(100, 200); drain(); timerLaufen(); drain(200); timerLaufen(); drain(200);
pruef('21 §B Rückroll: karten nicht entfernt (neuer Wert bleibt im Speicher), alter Wert in _ungesichert, Liste gemerkt, Leiste; stapel (war null) entfernt', localStorage.getItem(PREFIX+'karten')===JSON.stringify([{ id:'neu-rb' }]) && DB._ungesichert.karten===altRb && JSON.parse(localStorage.getItem(PREFIX+'fslive_ungesichert')||'[]').indexOf('karten')>=0 && localStorage.getItem(PREFIX+'stapel')===null && leiste().style.display==='block', JSON.stringify([localStorage.getItem(PREFIX+'karten'), DB._ungesichert.karten, localStorage.getItem(PREFIX+'fslive_ungesichert'), localStorage.getItem(PREFIX+'stapel')]));
pruef('21 §B Quelltext: kein rohEntfernen vor dem Zurückschreiben; Ausnahme → _ungesichert, ungesichertMerken, speicherVollMelden', (function(){ var s=readFile('index.html'); var a=s.indexOf('if(passtNicht){'); var u=s.slice(a, a+900); return u.indexOf('for(const name of geschrieben){ try{ DB.rohEntfernen(name); }catch(e){} }')<0 && u.indexOf("if(alt[name]===null){ try{ DB.rohEntfernen(name); }catch(e){} continue; }")>=0 && u.indexOf('catch(e){ DB._ungesichert[name]=alt[name]; try{ ungesichertMerken(); }catch(x){} try{ speicherVollMelden(); }catch(x){} }')>=0; })());
localStorage.setItem=_setVorher; delete DB._ungesichert.karten; localStorage.setItem(PREFIX+'karten', altRb); FSLive.ungesichertMerken(); FSLive.speicherVollMelden();
// §C 422 Schrumpf abgelehnt → rot, Schlüssel bleibt in offen, Toast, kein schnelleres Wiederholen
neuStart({ 'GET /api/app/fuehrung':fuehrungIch, 'PUT /api/spiegel/fokus4_karten':{ status:422, json:{ fehler:'Schrumpf abgelehnt', schluessel:'fokus4_karten', alt:368, neu:3 } }, 'PUT /api/spiegel/':OK, 'DELETE /api/spiegel/':OK, 'GET /api/app/pakete':LEER, 'PUT /api/app/uhr':UHR, 'POST /api/db/':DBLEER });
_toasts.length=0; _aufrufe=[]; FSLive.vormerken('karten'); _timer=[]; FSLive.spiegeln(); drain(100);   // _timer leer: der von vormerken geplante Takt zählt nicht als Wiederholung
pruef('21 §C 422 Schrumpf abgelehnt: Zustand rot, karten bleibt ausstehend, Toast mit Schlüssel', FSLive.ichFuehre()===true && FSLive.zustand()==='rot' && ausstehend().indexOf('karten')>=0 && _toasts.indexOf('FocusSystem hat stark geschrumpfte Daten abgelehnt (fokus4_karten) — auf dem Mac mini ist nichts verloren')>=0, JSON.stringify([FSLive.ichFuehre(), FSLive.zustand(), ausstehend(), _toasts]));
var timerNachFehler=(_timer||[]).length; timerLaufen(); drain(100);
pruef('21 §C kein schnelleres Wiederholen: nach dem Fehler nur der Abbruch-Timer von aufruf(), nach den Timern kein zweiter PUT von selbst', timerNachFehler<=1 && aufrufe('PUT', '/api/spiegel/fokus4_karten').length===1, JSON.stringify([timerNachFehler, aufrufe('PUT', '/api/spiegel/fokus4_karten').length]));
// §D Münzen-Korrektur per Paket
var mG0=num(S.meta.muenzenGesamt), rp0=S.meta.rangPunkte, ws0=S.meta.wohlstand;
S.meta.korrekturProtokoll=(S.meta.korrekturProtokoll||[]).filter(function(e){ return !(e && e.art==='muenzen'); });
var pkM=JSON.stringify({ appVersion:'4.1.12', karten:[], korrekturen:[{ id:'muenzen-2026-10-27-wiederherstellung', muenzen:14225, grund:'Tagesgutschrift 26.10.2026 nach Wiederherstellung vom 27.10.2026 (Hotfix 20) nicht gebucht' }] });
var rM1=syncImport(pkM);
pruef('21 §D.3 Münzen-Korrektur gutgeschrieben: muenzenGesamt +14.225, Protokoll { art:muenzen, id, muenzen, grund }, rangPunkte und wohlstand unverändert', !rM1.fehler && rM1.muenzenKorrekturen.length===1 && num(S.meta.muenzenGesamt)===mG0+14225 && S.meta.rangPunkte===rp0 && S.meta.wohlstand===ws0 && S.meta.korrekturProtokoll.some(function(e){ return e.art==='muenzen' && e.id==='muenzen-2026-10-27-wiederherstellung' && e.muenzen===14225 && !!e.ts && /Tagesgutschrift/.test(e.grund); }), JSON.stringify([rM1.fehler, rM1.muenzenKorrekturen, num(S.meta.muenzenGesamt)-mG0]));
pruef('21 §D.4 Ergebnis-Zeile „🪙 Münzen-Korrektur +14.225 · <grund>“', /🪙 Münzen-Korrektur \+14[. ]225 · Tagesgutschrift/.test(importErgebnisHtml(rM1)), importErgebnisHtml(rM1));
var rM2=syncImport(pkM);
pruef('21 §D.2 zweites Mal: übersprungen „bereits angewendet“, Münzen unverändert', rM2.uebersprungen.some(function(u){ return u.grund==='bereits angewendet'; }) && num(S.meta.muenzenGesamt)===mG0+14225 && rM2.muenzenKorrekturen.length===0, JSON.stringify(rM2.uebersprungen));
var rM3=syncImport(JSON.stringify({ appVersion:'4.1.12', karten:[], korrekturen:[{ id:'m-ohne-grund', muenzen:5 }, { id:'m-zu-gross', muenzen:200000, grund:'x' }, { muenzen:5, grund:'ohne id' }, { id:'m-bruch', muenzen:1.5, grund:'x' }] }));
pruef('21 §D.1 ohne Grund, über 100.000, ohne id, keine ganze Zahl: je übersprungen mit Grund, nichts gutgeschrieben', rM3.uebersprungen.length===4 && rM3.uebersprungen.some(function(u){ return /grund fehlt/.test(u.grund); }) && rM3.uebersprungen.some(function(u){ return /100\.000/.test(u.grund); }) && rM3.uebersprungen.some(function(u){ return /id fehlt/.test(u.grund); }) && rM3.uebersprungen.some(function(u){ return /ganze Zahl/.test(u.grund); }) && num(S.meta.muenzenGesamt)===mG0+14225, JSON.stringify(rM3.uebersprungen));
var rM4=syncImport(JSON.stringify({ appVersion:'4.1.12', karten:[], korrekturen:[{ id:'m-minus', muenzen:-100000, grund:'Abzug' }] }));
pruef('21 §D.3 Abzug bis 100.000 erlaubt, nie unter 0; Zeile mit −', !rM4.fehler && rM4.muenzenKorrekturen.length===1 && num(S.meta.muenzenGesamt)===Math.max(0, mG0+14225-100000) && /Münzen-Korrektur −100[. ]000 · Abzug/.test(importErgebnisHtml(rM4)), importErgebnisHtml(rM4));
pruef('21 §D.4 Quelltext: Blatt „Paket prüfen“ zeigt Münzen-Korrekturen des Pakets', (function(){ var s=readFile('index.html'); var a=s.indexOf('function oeffneSyncFreigabe('); return s.slice(a, a+2500).indexOf("muenzenKorrekturZeile({ muenzen:Number(k.muenzen), grund:k.grund })")>=0; })());
S.meta.muenzenGesamt=mG0; S.meta.korrekturProtokoll=S.meta.korrekturProtokoll.filter(function(e){ return !(e && e.art==='muenzen'); }); saveMeta();
// §E Speicher-Karte und Führungsmarke
pruef('21 §E.1 Speicher-Karte: „~2,5 MB, mit der alten App geteilt“ an beiden Stellen, kein „~5 MB“ mehr', (function(){ var s=readFile('index.html'); return (s.match(/~2,5 MB, mit der alten App geteilt/g)||[]).length===2 && s.indexOf('(~5 MB)')<0; })());
pruef('21 §E.2 Rückweg: K.fuehrtJetzt wird im Zweig !standGezeichnet entfernt', (function(){ var s=readFile('index.html'); return s.indexOf("const vorigesGeraet=d.fuehrend;\n          try{ localStorage.removeItem(K.fuehrtJetzt); }catch(e){}")>=0; })());

pruef('§C.1 App 4.1.12 · Build 2026-10-27-47 · sw.js Cache hochgezählt (seit Hotfix 21)', APP_VERSION==='4.1.12' && APP_BUILD==='2026-10-27-47' && readFile('sw.js').indexOf("const CACHE = 'fokus4-v4.0.0-8'")>=0, APP_VERSION+' / '+APP_BUILD);
suiteEnde('Hotfix 19 und 19.1 · Speicher voll: Verlustschutz, Sicherungen nach FocusSystem, Führung zurück (4.1.8)');
