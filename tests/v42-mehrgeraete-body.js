/* Suite 4.2 · Mehrgeräte-Betrieb (Hotfix 14, Auftrag 22.10.2026, §13). Aufruf: jsc tests/v42-mehrgeraete.js
   Hotfix 19.1 §4.3: zwei Läufe. Lauf 1 (diese Datei) endet mit der ersten Übernahme, die die Seite neu lädt — im jsc-Ersatz bleibt der Modul-Zustand
   danach in der Sperre (uebernahmeLaeuft) hängen, deshalb lädt tests/v42-mehrgeraete.js die App danach ein zweites Mal (wie das Neuladen) und
   führt die übrigen Prüfpunkte in tests/v42-mehrgeraete-body2.js aus; der Speicher (localStorage-Ersatz) bleibt dabei erhalten.
   Geschrieben, im Rahmen des Auftrags nicht ausgeführt. Läuft gegen einen fetch-Ersatz (Antworten je „METHODE /pfad“), FSLive sonst echt.
   Hotfix 17 (23.10.2026): nicht führende Geräte rufen nichts mehr ab (kein standHolen beim Start, Spiegel und Schlange bleiben stehen), die Pille
   „Nur Anzeige · führend“ ist ersetzt (Stand-Hinweis erst ab 60 Min.), 409 holt keinen Stand mehr, Geräte-Liste zeigt 👑 — Erwartungen angepasst.
   Netz: fetch/AbortController werden hier ersetzt (Funktionsdeklarationen gelten im ganzen eval); Zeit: Date.now mit Versatz;
   setTimeout sammelt Uhren in _timer, timerLaufen() führt sie aus und stellt die Uhr vor. */
var _aufrufe, _antworten={}, _timer, _versatz=0, _angehaengt=[], _hoerer={};
function AbortController(){ this.signal={}; this.abort=function(){}; }
function fetch(url, opt){
  opt=opt||{};
  if(!_aufrufe) return Promise.reject(new TypeError('Load failed'));
  var pfad=String(url).replace(/^https?:\/\/[^/]+/,'');
  _aufrufe.push({ methode:opt.method, pfad:pfad, body:opt.body });
  var a=null, k;
  for(k in _antworten){ if((opt.method+' '+pfad).indexOf(k)===0){ a=_antworten[k]; break; } }
  if(typeof a==='function') a=a(opt, pfad);   // Hotfix 19: Antwort aus dem zuletzt Gesendeten (GET /api/spiegel/<s>)
  if(!a) a={ status:404, json:{ fehler:'unbekannt' } };
  if(a.offline) return Promise.reject(new TypeError('Load failed'));
  var st=a.status||200, j=a.json;
  return Promise.resolve({ ok:(st>=200 && st<300), status:st, json:function(){ return j===undefined ? Promise.reject(new Error('leer')) : Promise.resolve(j); } });
}
function setTimeout(f, ms){ (_timer||(_timer=[])).push({ f:f, ms:Number(ms)||0 }); return _timer.length; }
function timerLaufen(){ var l=_timer||[]; _timer=[]; l.forEach(function(t){ _versatz+=t.ms; try{ t.f(); }catch(e){} }); }
if(!Date.now._versetzt){ var _DateNow=Date.now; Date.now=function(){ return _DateNow()+_versatz; }; Date.now._versetzt=true; }   // Hotfix 19.1 §4.3: nur einmal umhüllen (zwei Läufe)
function drain(n){ for(var i=0;i<(n||40);i++) warten(); }
function ziel(){ return { closest:function(){ return null; }, matches:function(){ return false; } }; }
function ereignis(x, y, t){ var e={ clientX:x, clientY:y, target:t||ziel(), pd:0, sp:0, sip:0 }; e.preventDefault=function(){ e.pd++; }; e.stopPropagation=function(){ e.sp++; }; e.stopImmediatePropagation=function(){ e.sip++; }; return e; }
function feuern(typ, e){ (_hoerer[typ]||[]).forEach(function(f){ f(e); }); }
function sperre(){ for(var i=_angehaengt.length-1;i>=0;i--){ if(_angehaengt[i].id==='fsSperre') return _angehaengt[i]; } return null; }
function pille(){ for(var i=_angehaengt.length-1;i>=0;i--){ if(_angehaengt[i].id==='fsNurAnzeige') return _angehaengt[i]; } return null; }
function aufrufe(methode, pfadAnfang){ return _aufrufe.filter(function(a){ return (!methode || a.methode===methode) && a.pfad.indexOf(pfadAnfang)===0; }); }
// FSLive neu starten: Antworten setzen, Listener und angehängte Elemente einsammeln, Führung lesen lassen
function neuStart(antworten){
  _antworten=antworten||{}; _aufrufe=[]; _hoerer={}; _angehaengt=[]; _timer=[];
  document.addEventListener=function(t, f){ (_hoerer[t]||(_hoerer[t]=[])).push(f); };
  document.body.appendChild=function(e){ _angehaengt.push(e); };
  document.elementFromPoint=function(){ return null; };
  FSLive.start(); drain();
}
var ME=null;
testTag();
localStorage.setItem(PREFIX+'fslive_token', 'test-token');   // gekoppelt (intern über token(), nicht über den Export)
// Die Marke „erste Übernahme erledigt“ liest die App nur beim Laden; sie fehlt hier → die erste Übernahme kommt im Prüfpunkt unten.
neuStart({ 'GET /api/app/fuehrung':{ json:{ fuehrend:'GERAET-B', ich:'x', seit:null, stand_nr:5 } } });
ME=aufrufe('GET', '/api/app/fuehrung').length ? FSLive.geraet() : FSLive.geraet();

// ══ nicht führend → kein PUT gemeinsamer Schlüssel, ui schon ══
pruef('Führung gelesen: anderes Gerät führt → ichFuehre false', FSLive.ichFuehre()===false && aufrufe('GET', '/api/app/fuehrung').length>=1);
pruef('Hotfix 17 §4.2: keine Pille „Nur Anzeige“ mehr — ohne Stand (standZeit leer) bleibt die Pille aus', !!pille() && pille().style.display==='none', pille() && pille().textContent);
pruef('Hotfix 17 §2.1: beim Start kein /api/app/stand', aufrufe('GET', '/api/app/stand').length===0, JSON.stringify(_aufrufe));
_antworten['PUT /api/spiegel/']={ json:{ version:1, empfangen_am:'x' } };
localStorage.setItem(PREFIX+'karten', '[]'); localStorage.setItem(PREFIX+'ui', '{}');
_aufrufe=[]; FSLive.vormerken('karten'); FSLive.vormerken('ui'); FSLive.spiegeln(); drain();
pruef('Hotfix 17 §1.2: nicht führend: weder ui noch karten werden gespiegelt', aufrufe('PUT', '/api/spiegel/').length===0, JSON.stringify(_aufrufe));
pruef('Hotfix 17 §1.2: nicht führend: vorgemerkte Schlüssel (karten, ui) bleiben ausstehend, Zustand nicht rot', FSLive.zustand()!=='rot' && JSON.parse(localStorage.getItem(PREFIX+'fslive_ausstehend')||'[]').indexOf('karten')>=0 && JSON.parse(localStorage.getItem(PREFIX+'fslive_ausstehend')||'[]').indexOf('ui')>=0, localStorage.getItem(PREFIX+'fslive_ausstehend'));
pruef('koennteSchreiben: gekoppelt und nicht führend → false', FSLive.koennteSchreiben()===false);

// ══ Paket-Abruf nur führend ══
_antworten['GET /api/app/pakete']={ json:{ pakete:[] } };
_aufrufe=[]; FSLive.paketeHolen(); drain();
pruef('nicht führend: kein Paket-Abruf', aufrufe('GET', '/api/app/pakete').length===0);

// ══ erste Übernahme sichert vorUebernahme_* über den Dienst (Hotfix 19 §A6.2: PUT + geprüftes GET statt localStorage) und lädt neu ══
function letzterPut(pfadAnfang){ var i; for(i=_aufrufe.length-1;i>=0;i--){ if(_aufrufe[i].methode==='PUT' && _aufrufe[i].pfad.indexOf(pfadAnfang)===0) return _aufrufe[i]; } return null; }
function spiegelGet(opt, pfad){ var p=letzterPut(pfad); return p ? { json:{ inhalt:JSON.parse(p.body), version:1 } } : { status:404, json:{ fehler:'Nicht vorhanden' } }; }
var _dbset=[], _DBset=DB.set; DB.set=function(k, v){ _dbset.push(k); return _DBset(k, v); };
var _reloads=0; window.location.reload=function(){ _reloads++; };
var neueKarten=[Object.assign(neueKarte({ titel:'Vom führenden Gerät', domain:'dfm' }), { id:'t-stand', status:'offen', matrixFeld:'ziel', sollMin:10 })];
localStorage.setItem(PREFIX+'karten', JSON.stringify([{ id:'lokal-alt' }]));
neuStart({ 'GET /api/app/fuehrung':{ json:{ fuehrend:'GERAET-B', ich:'x', seit:null, stand_nr:8 } },
  'GET /api/app/stand':{ json:{ fuehrend:'GERAET-B', stand_nr:8, schluessel:{ karten:neueKarten } } }, 'POST /api/app/fuehrung':{ json:{ fuehrend:FSLive.geraet(), stand_nr:8 } },
  'PUT /api/spiegel/':{ json:{ version:1 } }, 'GET /api/spiegel/':spiegelGet });
feuern('pointerdown', ereignis(50, 50)); feuern('pointerup', ereignis(50, 50)); drain(80);   // Hotfix 17: der Stand kommt erst mit der Übernahme per Tipp · Hotfix 19: Kopie an den Dienst (PUT, GET) davor
var vorKeys=DB.list().filter(function(k){ return k.indexOf('vorUebernahme_')===0; });
var vorPut=aufrufe('PUT', '/api/spiegel/fokus4_vorUebernahme_');
pruef('erste Übernahme (Hotfix 19 §A6.2): Kopie vorUebernahme_<Zeit> mit dem alten Stand geht an den Dienst (PUT, geprüftes GET), nicht in localStorage; Marke gesetzt, Seite lädt neu', vorPut.length===1 && /^\/api\/spiegel\/fokus4_vorUebernahme_\d{4}_\d{2}_\d{2}T\d{6}_\d{3}Z$/.test(vorPut[0].pfad) && JSON.parse(JSON.parse(vorPut[0].body).karten)[0].id==='lokal-alt' && aufrufe('GET', '/api/spiegel/fokus4_vorUebernahme_').length===1 && vorKeys.length===0 && localStorage.getItem(PREFIX+'fslive_ersteUebernahme')==='1' && _reloads===1, JSON.stringify([vorPut.map(function(a){ return a.pfad; }), vorKeys, _reloads]));
pruef('erste Übernahme: Schlüssel des führenden Geräts im Speicher, nicht über DB.set', JSON.parse(localStorage.getItem(PREFIX+'karten'))[0].id==='t-stand' && _dbset.indexOf('karten')<0);
// Lauf 1 endet hier (die Seite „lädt neu“): weiter in tests/v42-mehrgeraete-body2.js
