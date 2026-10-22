/* Suite 4.2 · Mehrgeräte-Betrieb (Hotfix 14, Auftrag 22.10.2026, §13). Aufruf: jsc tests/v42-mehrgeraete.js
   Geschrieben, im Rahmen des Auftrags nicht ausgeführt. Läuft gegen einen fetch-Ersatz (Antworten je „METHODE /pfad“), FSLive sonst echt.
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
  if(!a) a={ status:404, json:{ fehler:'unbekannt' } };
  if(a.offline) return Promise.reject(new TypeError('Load failed'));
  var st=a.status||200, j=a.json;
  return Promise.resolve({ ok:(st>=200 && st<300), status:st, json:function(){ return j===undefined ? Promise.reject(new Error('leer')) : Promise.resolve(j); } });
}
function setTimeout(f, ms){ (_timer||(_timer=[])).push({ f:f, ms:Number(ms)||0 }); return _timer.length; }
function timerLaufen(){ var l=_timer||[]; _timer=[]; l.forEach(function(t){ _versatz+=t.ms; try{ t.f(); }catch(e){} }); }
var _DateNow=Date.now; Date.now=function(){ return _DateNow()+_versatz; };
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
pruef('Pille „Nur Anzeige · führend: …“ sichtbar (Kennung gekürzt auf 8 Zeichen, solange kein Name bekannt)', !!pille() && pille().style.display==='block' && pille().textContent==='Nur Anzeige · führend: GERAET-B'.slice(0, 'Nur Anzeige · führend: '.length+8), pille() && pille().textContent);
_antworten['PUT /api/spiegel/']={ json:{ version:1, empfangen_am:'x' } };
localStorage.setItem(PREFIX+'karten', '[]'); localStorage.setItem(PREFIX+'ui', '{}');
_aufrufe=[]; FSLive.vormerken('karten'); FSLive.vormerken('ui'); FSLive.spiegeln(); drain();
pruef('nicht führend: ui wird gespiegelt, karten nicht', aufrufe('PUT', '/api/spiegel/fokus4_ui').length===1 && aufrufe('PUT', '/api/spiegel/fokus4_karten').length===0, JSON.stringify(_aufrufe));
pruef('nicht führend: gemeinsame Schlüssel bleiben nicht ausstehend, Zustand nicht rot', FSLive.zustand()!=='rot' && JSON.parse(localStorage.getItem(PREFIX+'fslive_ausstehend')||'[]').indexOf('karten')<0, localStorage.getItem(PREFIX+'fslive_ausstehend'));
pruef('koennteSchreiben: gekoppelt und nicht führend → false', FSLive.koennteSchreiben()===false);

// ══ Paket-Abruf nur führend ══
_antworten['GET /api/app/pakete']={ json:{ pakete:[] } };
_aufrufe=[]; FSLive.paketeHolen(); drain();
pruef('nicht führend: kein Paket-Abruf', aufrufe('GET', '/api/app/pakete').length===0);

// ══ erste Übernahme sichert vorUebernahme_* und lädt neu ══
var _dbset=[], _DBset=DB.set; DB.set=function(k, v){ _dbset.push(k); return _DBset(k, v); };
var _reloads=0; window.location.reload=function(){ _reloads++; };
var neueKarten=[Object.assign(neueKarte({ titel:'Vom führenden Gerät', domain:'dfm' }), { id:'t-stand', status:'offen', matrixFeld:'ziel', sollMin:10 })];
localStorage.setItem(PREFIX+'karten', JSON.stringify([{ id:'lokal-alt' }]));
neuStart({ 'GET /api/app/fuehrung':{ json:{ fuehrend:'GERAET-B', ich:'x', seit:null, stand_nr:8 } },
  'GET /api/app/stand':{ json:{ fuehrend:'GERAET-B', stand_nr:8, schluessel:{ karten:neueKarten } } } });
var vorKeys=DB.list().filter(function(k){ return k.indexOf('vorUebernahme_')===0; });
pruef('erste Übernahme: Sicherung vorUebernahme_<Zeit> mit dem alten Stand, Marke gesetzt, Seite lädt neu', vorKeys.length===1 && JSON.parse(JSON.parse(localStorage.getItem(PREFIX+vorKeys[0])).karten)[0].id==='lokal-alt' && localStorage.getItem(PREFIX+'fslive_ersteUebernahme')==='1' && _reloads===1, JSON.stringify([vorKeys, _reloads]));
pruef('erste Übernahme: Schlüssel des führenden Geräts im Speicher, nicht über DB.set', JSON.parse(localStorage.getItem(PREFIX+'karten'))[0].id==='t-stand' && _dbset.indexOf('karten')<0);

// ══ Stand-Übernahme (danach) schreibt nicht über DB.set und lädt nicht neu ══
_reloads=0; _dbset.length=0; localStorage.setItem(PREFIX+'karten', '[]');
neuStart({ 'GET /api/app/fuehrung':{ json:{ fuehrend:'GERAET-B', ich:'x', seit:null, stand_nr:9 } },
  'GET /api/app/stand':{ json:{ fuehrend:'GERAET-B', stand_nr:9, schluessel:{ karten:neueKarten, fokus:{ laeuft:false } } } } });
pruef('Stand geholt (GET /api/app/stand?ab=<letzte Nummer>) und direkt in den Speicher geschrieben, nicht über DB.set', aufrufe('GET', '/api/app/stand?ab=8').length===1 && JSON.parse(localStorage.getItem(PREFIX+'karten'))[0].id==='t-stand' && _dbset.indexOf('karten')<0, JSON.stringify([aufrufe('GET', '/api/app/stand'), _dbset]));
pruef('nach der Übernahme ist der Zustand neu geladen (S.karten aus dem Speicher), kein Neuladen der Seite', S.karten.length===1 && S.karten[0].id==='t-stand' && _reloads===0, JSON.stringify([S.karten.map(function(k){ return k.id; }), _reloads]));
_aufrufe=[]; FSLive.spiegeln(); drain();
pruef('übernommener Stand wird nicht zurückgespiegelt', aufrufe('PUT', '/api/spiegel/fokus4_karten').length===0);

// ══ 204: gleicher Stand → nichts ══
S.karten=[]; saveKarten();
_antworten['GET /api/app/stand']={ status:204 };
neuStart(_antworten);
pruef('204 vom Dienst: Speicher unverändert', JSON.parse(localStorage.getItem(PREFIX+'karten')).length===0);

DB.set=_DBset;

// ══ 409 → Führung verloren, Stand wird geholt ══
neuStart({ 'GET /api/app/fuehrung':{ json:{ fuehrend:FSLive.geraet(), ich:FSLive.geraet(), seit:null, stand_nr:12 } }, 'GET /api/app/stand':{ status:204 },
  'PUT /api/spiegel/':{ status:409, json:{ fehler:'nicht führend', fuehrend:'GERAET-C' } } });
pruef('dieses Gerät führt → ichFuehre true, Pille aus, koennteSchreiben true', FSLive.ichFuehre()===true && pille().style.display==='none' && FSLive.koennteSchreiben()===true);
_aufrufe=[]; FSLive.paketeHolen(); drain();
pruef('führend: Paket-Abruf läuft', aufrufe('GET', '/api/app/pakete').length===1);
_aufrufe=[]; FSLive.vormerken('karten'); FSLive.spiegeln(); drain();
pruef('409 beim Spiegeln: Führung verloren (ichFuehre false), kein Fehlerzustand, Stand wird geholt', FSLive.ichFuehre()===false && FSLive.zustand()!=='rot' && aufrufe('GET', '/api/app/stand').length===1 && JSON.parse(localStorage.getItem(PREFIX+'fslive_ausstehend')||'[]').indexOf('karten')<0, JSON.stringify([FSLive.zustand(), _aufrufe]));
pruef('409: Pille zeigt das neue führende Gerät', pille().style.display==='block' && pille().textContent.indexOf('GERAET-C')>=0, pille().textContent);

// ══ Tipp nicht führend → Sperre ≥ 1000 ms, danach Klick am selben Punkt ══
var geklickt=[], fokussiert=0;
var knopf={ closest:function(){ return null; }, matches:function(s){ return false; }, click:function(){ geklickt.push('knopf'); }, dispatchEvent:function(){}, focus:function(){ fokussiert++; } };
neuStart({ 'GET /api/app/fuehrung':{ json:{ fuehrend:'GERAET-B', ich:'x', seit:null, stand_nr:12 } }, 'GET /api/app/stand':{ status:204 },
  'POST /api/app/fuehrung':{ json:{ fuehrend:FSLive.geraet(), ich:FSLive.geraet(), seit:'x', stand_nr:12 } }, 'PUT /api/spiegel/':{ json:{ version:2 } } });
document.elementFromPoint=function(x, y){ return (Math.abs(x-100)<=10 && Math.abs(y-200)<=10) ? knopf : null; };
var down=ereignis(100, 200), up=ereignis(104, 203), klick=ereignis(104, 203);
_aufrufe=[]; feuern('pointerdown', down); feuern('pointerup', up); feuern('click', klick); drain();
pruef('Tipp (≤ 10 px): pointerup und click werden verschluckt, pointerdown nicht', down.pd===0 && up.pd===1 && up.sip===1 && klick.pd===1 && klick.sip===1);
pruef('Sperre liegt über der App (display flex), Führung angefordert, Stand vorher geholt', sperre().style.display==='flex' && aufrufe('POST', '/api/app/fuehrung').length===1 && aufrufe('GET', '/api/app/stand?ab=0').length===1 && geklickt.length===0, JSON.stringify(_aufrufe));
var warte=(_timer||[]).map(function(t){ return t.ms; }).filter(function(ms){ return ms<=1000; }).reduce(function(m, ms){ return Math.max(m, ms); }, 0);   // ohne die Zeitgrenzen der Aufrufe (> 1000)
pruef('Sperre wartet bis mindestens 1000 ms nach dem Tipp', warte>900 && warte<=1000, JSON.stringify((_timer||[]).map(function(t){ return t.ms; })));
timerLaufen(); drain();
pruef('nach der Sperre: Gerät führt, Sperre weg, Klick am selben Punkt ausgeführt', FSLive.ichFuehre()===true && sperre().style.display==='none' && geklickt.length===1 && fokussiert===0, JSON.stringify([FSLive.ichFuehre(), sperre().style.display, geklickt]));
pruef('nach der Übernahme werden die Betriebsschlüssel gespiegelt (Spiegel des neuen führenden Geräts wird aktuell)', aufrufe('PUT', '/api/spiegel/fokus4_karten').length>=1 && aufrufe('PUT', '/api/spiegel/fokus4_tag').length>=1, JSON.stringify(aufrufe('PUT', '/api/spiegel/')));
var feld={ closest:function(){ return null; }, matches:function(s){ return s.indexOf('input')>=0; }, click:function(){ geklickt.push('feld'); }, dispatchEvent:function(){}, focus:function(){ fokussiert++; } };
neuStart({ 'GET /api/app/fuehrung':{ json:{ fuehrend:'GERAET-B', ich:'x', seit:null, stand_nr:12 } }, 'GET /api/app/stand':{ status:204 }, 'POST /api/app/fuehrung':{ json:{ fuehrend:FSLive.geraet(), stand_nr:12 } } });
document.elementFromPoint=function(){ return feld; };
feuern('pointerdown', ereignis(10, 10)); feuern('pointerup', ereignis(10, 10)); drain(); timerLaufen(); drain();
pruef('Eingabefeld: Klick und zusätzlich focus()', geklickt.length===2 && geklickt[1]==='feld' && fokussiert===1, JSON.stringify([geklickt, fokussiert]));

// ══ Wischen > 10 px → keine Übernahme ══
neuStart({ 'GET /api/app/fuehrung':{ json:{ fuehrend:'GERAET-B', ich:'x', seit:null, stand_nr:12 } }, 'GET /api/app/stand':{ status:204 }, 'POST /api/app/fuehrung':{ json:{ fuehrend:FSLive.geraet() } } });
var d2=ereignis(100, 200), u2=ereignis(100, 240);
_aufrufe=[]; feuern('pointerdown', d2); feuern('pointerup', u2); drain();
pruef('Wischen: nichts verschluckt, keine Führung angefordert, Sperre bleibt aus', u2.pd===0 && u2.sip===0 && aufrufe('POST', '/api/app/fuehrung').length===0 && sperre().style.display!=='flex' && FSLive.ichFuehre()===false, JSON.stringify([u2.pd, u2.sip, aufrufe('POST', '/api/app/fuehrung').length, sperre().style.display, FSLive.ichFuehre()]));
var ausgenommen={ closest:function(s){ return s==='[data-fsgeraet]' ? {} : null; } };
feuern('pointerdown', ereignis(5, 5, ausgenommen)); var u3=ereignis(5, 5, ausgenommen); feuern('pointerup', u3); drain();
pruef('Tipp in der Geräte-Karte (data-fsgeraet): keine Übernahme', u3.pd===0 && aufrufe('POST', '/api/app/fuehrung').length===0);

// ══ Dienst nicht erreichbar bei der Übernahme → Gerät bleibt Anzeige ══
neuStart({ 'GET /api/app/fuehrung':{ json:{ fuehrend:'GERAET-B', ich:'x', seit:null, stand_nr:12 } }, 'GET /api/app/stand':{ offline:true }, 'POST /api/app/fuehrung':{ offline:true } });
_aufrufe=[]; feuern('pointerdown', ereignis(50, 50)); feuern('pointerup', ereignis(50, 50)); drain(); timerLaufen(); drain();
pruef('offline: Sperre weg, nicht führend, Tipp verfällt', sperre().style.display==='none' && FSLive.ichFuehre()===false && geklickt.length===2, JSON.stringify([sperre().style.display, FSLive.ichFuehre(), geklickt]));

// ══ Einstellungen „📱 Geräte“ ══
var LISTE=[{ geraet_id:FSLive.geraet(), anzeigename:'iPad', name:'Fokus 4.0 · x', app:'fokus-app-4', gekoppelt_am:'2026-10-22T10:00:00Z', zuletzt_gesehen_am:'2026-10-22T10:05:00Z', aktiv:true, fuehrend:false },
  { geraet_id:'GERAET-B', anzeigename:null, name:'Fokus 4.0 · Mozilla/5.0 (iPhone; CPU iPhone OS 26_0 like Mac OS X)', app:'fokus-app-4', gekoppelt_am:'2026-10-20T10:00:00Z', zuletzt_gesehen_am:null, aktiv:true, fuehrend:true }];
var hl=fsGeraeteListeHtml(LISTE);
pruef('Geräte-Liste: Anzeigename bzw. name gekürzt auf 30, „· dieses Gerät“, grüne Pille „führend“, Knopf „Führend setzen“, Namensfeld vorbefüllt', hl.indexOf('iPad · dieses Gerät')>=0 && hl.indexOf(esc('Fokus 4.0 · Mozilla/5.0 (iPhon'))>=0 && hl.indexOf('(iPhone;')<0 && hl.indexOf('<span class="chip on gruen">führend</span>')>=0 && hl.indexOf('data-fsgeraet-fuehren="'+FSLive.geraet()+'"')>=0 && hl.indexOf('id="fsGeraetName" value="iPad"')>=0 && hl.indexOf('data-fsgeraet-name="1"')>=0, hl);
pruef('Karte „📱 Geräte“ trägt data-fsgeraet="1" und steht vor der Karte „💾 Speicher“', (function(){ var s=readFile('index.html'); var a=s.indexOf('<div class="card" data-fsgeraet="1"><h3>📱 Geräte</h3>'), b=s.indexOf('<h3>💾 Speicher</h3>'); return a>0 && b>a; })());
_aufrufe=[]; _antworten['POST /api/app/geraet']={ json:{ ok:true } }; _antworten['GET /api/app/geraete']={ json:{ geraete:LISTE } };
FSLive.geraetBenennen('  Mein iPad  '); drain();
pruef('Name speichern: POST /api/app/geraet mit eigener Kennung und getrimmtem Namen, danach Liste neu geladen', aufrufe('POST', '/api/app/geraet').length===1 && JSON.parse(aufrufe('POST', '/api/app/geraet')[0].body).anzeigename==='Mein iPad' && JSON.parse(aufrufe('POST', '/api/app/geraet')[0].body).geraet_id===FSLive.geraet() && aufrufe('GET', '/api/app/geraete').length===1, JSON.stringify(_aufrufe));
_aufrufe=[]; _antworten['POST /api/app/fuehrung']={ json:{ fuehrend:'GERAET-B' } }; _antworten['GET /api/app/stand']={ status:204 };
FSLive.fuehrungSetzen('GERAET-B'); drain();
pruef('Führend setzen (anderes Gerät): POST mit geraet_id, ichFuehre false, Stand wird geholt', JSON.parse(aufrufe('POST', '/api/app/fuehrung')[0].body).geraet_id==='GERAET-B' && FSLive.ichFuehre()===false && aufrufe('GET', '/api/app/stand').length>=1);
_aufrufe=[]; _antworten['POST /api/app/fuehrung']={ json:{ fuehrend:FSLive.geraet() } };
FSLive.fuehrungSetzen(FSLive.geraet()); drain();
pruef('Führend setzen (eigenes Gerät): Sperre, Führung angefordert, kein Klick', sperre().style.display==='flex' && aufrufe('POST', '/api/app/fuehrung').length===1 && geklickt.length===2, JSON.stringify([sperre().style.display, aufrufe('POST', '/api/app/fuehrung').length, geklickt]));
timerLaufen(); drain();
pruef('… danach führt dieses Gerät, Sperre weg', FSLive.ichFuehre()===true && sperre().style.display==='none');

// ══ nicht gekoppelt → Verhalten unverändert ══
localStorage.removeItem(PREFIX+'fslive_token');
neuStart({});
localStorage.setItem(PREFIX+'karten', '[]');
_aufrufe=[]; FSLive.vormerken('karten'); FSLive.spiegeln(); drain();
var u4=ereignis(100, 200); feuern('pointerdown', ereignis(100, 200)); feuern('pointerup', u4); drain();
pruef('nicht gekoppelt: kein Aufruf, kein Abfangen, keine Pille, koennteSchreiben true', _aufrufe.length===0 && u4.pd===0 && sperre().style.display!=='flex' && pille().style.display!=='block' && FSLive.koennteSchreiben()===true && FSLive.zustand()==='grau', JSON.stringify([_aufrufe, u4.pd, sperre().style.display, pille().style.display, FSLive.zustand()]));
pruef('Version 4.1.2 · Build 2026-10-22-37', APP_VERSION==='4.1.2' && APP_BUILD==='2026-10-22-37');

suiteEnde('Mehrgeräte 4.2 · Hotfix 14');
