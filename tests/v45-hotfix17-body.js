/* Suite 4.5 · Hotfix 17 (Auftrag 23.10.2026, §6.2): §1 nicht führende Geräte rufen nichts ab · §2 Start, Vordergrund, Übernahme, Führung merken ·
   §3 Führung vor dem Tipp bestätigen · §4 Krone und Stand-Hinweis · §6 Version 4.1.6, Build 41.
   Aufruf: jsc tests/v45-hotfix17.js · Geschrieben, im Rahmen des Auftrags nicht ausgeführt.
   Wie Suite 4.2: fetch/AbortController ersetzt (Antworten je „METHODE /pfad“, auch als Funktion), Date.now mit Versatz, setTimeout sammelt Uhren in _timer;
   setInterval ist im Kopf stumm — die Takte werden durch direkte Aufrufe der Takt-Funktionen simuliert. FSLive sonst echt. */
var _aufrufe, _antworten={}, _timer, _versatz=0, _angehaengt=[], _erzeugt=[], _hoerer={}, _toasts=[];
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
function drain(n){ for(var i=0;i<(n||40);i++) warten(); }
function ziel(){ return { closest:function(){ return null; }, matches:function(){ return false; } }; }
function ereignis(x, y, t){ var e={ clientX:x, clientY:y, target:t||ziel(), pd:0, sp:0, sip:0 }; e.preventDefault=function(){ e.pd++; }; e.stopPropagation=function(){ e.sp++; }; e.stopImmediatePropagation=function(){ e.sip++; }; return e; }
function feuern(typ, e){ (_hoerer[typ]||[]).forEach(function(f){ f(e); }); }
function element(id){ var i; for(i=_angehaengt.length-1;i>=0;i--){ if(_angehaengt[i].id===id) return _angehaengt[i]; } for(i=_erzeugt.length-1;i>=0;i--){ if(_erzeugt[i].id===id) return _erzeugt[i]; } return null; }
function sperre(){ return element('fsSperre'); }
function pille(){ return element('fsNurAnzeige'); }
function krone(){ return element('fsKrone'); }
function aufrufe(methode, pfadAnfang){ return _aufrufe.filter(function(a){ return (!methode || a.methode===methode) && a.pfad.indexOf(pfadAnfang)===0; }); }
function tippen(x, y){ feuern('pointerdown', ereignis(x, y)); var u=ereignis(x, y); feuern('pointerup', u); var k=ereignis(x, y); feuern('click', k); return { up:u, klick:k }; }
toast=function(m){ _toasts.push(String(m)); };
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
var geklickt=[];
var knopf={ closest:function(){ return null; }, matches:function(){ return false; }, click:function(){ geklickt.push('knopf'); }, dispatchEvent:function(){}, focus:function(){} };
var ME=null;
testTag();
localStorage.setItem(PREFIX+'fslive_token', 'test-token');   // gekoppelt
// Hotfix 19.1 §4.3: die Marke „erste Übernahme erledigt“ setzt der Aufrufer (tests/v45-hotfix17.js) vor dem Laden der App; die erste Übernahme (Neuladen) ist nicht Gegenstand dieser Suite
var FUEHRUNG_B={ json:{ fuehrend:'GERAET-B', ich:'x', seit:null, stand_nr:5 } };
function fuehrungIch(){ return { json:{ fuehrend:FSLive.geraet(), ich:FSLive.geraet(), seit:null, stand_nr:5 } }; }
var ANTWORT_DB={ json:{ datensaetze:[], gesamt:0 } };
F7.lager.chatKanaele={ ts:Date.now(), daten:[{ id:'k-tr', Kanal:'Trainer', Agent:'Trainer', Abteilung:[], Projekt:[], Bereich:'privat', Tabelle:'Privat_Chat · Trainer', Reihenfolge:1, Rolle:'Trainer' }], fehler:'' };

// ══ §2.1 · Start nicht führend: genau ein GET /api/app/fuehrung, kein /api/app/stand ══
localStorage.removeItem(PREFIX+'fslive_fuehrungZuletzt'); localStorage.removeItem(PREFIX+'fslive_standZeit');
neuStart({ 'GET /api/app/fuehrung':FUEHRUNG_B });
ME=FSLive.geraet();
timerLaufen(); drain();   // Start-Uhren (Badge 9 s, Nachsenden 6 s, …)
pruef('§2.1 Start nicht führend: genau ein Aufruf /api/app/fuehrung, kein /api/app/stand', aufrufe('GET', '/api/app/fuehrung').length===1 && aufrufe('GET', '/api/app/stand').length===0 && FSLive.ichFuehre()===false, JSON.stringify(_aufrufe));
pruef('§2.1 Start nicht führend: keine Uhr, keine Pakete, kein Badge, kein Spiegel', _aufrufe.length===1, JSON.stringify(_aufrufe));
pruef('§1 nichtFuehrend(): gekoppelt und nicht führend → true', FSLive.nichtFuehrend()===true);

// ══ §1 · Nicht führend: 10 Minuten Simulation — null Aufrufe an stand, uhr, Badge, Nachsenden, Spiegel ══
localStorage.setItem(PREFIX+'karten', '[]'); localStorage.setItem(PREFIX+'ui', '{}');
S.meta.f11Ausstehend={ bilanz:{ tag:'2026-10-22', felder:{}, seit:jetztIso() } }; saveMeta();
S.fokus={ laeuft:true, karteId:'t-dfm', startMs:Date.now() }; saveFokus();   // saveFokus → FSLive.uhrMelden()
_aufrufe=[]; FSLive.vormerken('karten'); FSLive.vormerken('ui');
var m10;
for(m10=0;m10<10;m10++){ _versatz+=60000; FSLive.spiegeln(); FSLive.uhrMelden(true); FSLive.paketeHolen(); f12BadgeLaden(); _f11NachTs=0; f11Nachsenden(); timerLaufen(); drain(); }
pruef('§1.2 nicht führend, 10 Min.: null Aufrufe an /api/app/stand, /api/app/uhr, Chat-Badge (/api/db), Nachsenden, Spiegel', _aufrufe.length===0, JSON.stringify(_aufrufe));
pruef('§1.2 vorgemerkte Schlüssel bleiben stehen (karten und ui), Zustand gelb', JSON.parse(localStorage.getItem(PREFIX+'fslive_ausstehend')||'[]').indexOf('karten')>=0 && JSON.parse(localStorage.getItem(PREFIX+'fslive_ausstehend')||'[]').indexOf('ui')>=0 && FSLive.zustand()==='gelb', localStorage.getItem(PREFIX+'fslive_ausstehend'));
var _sendErg=null; FSLive.senden('datensatz_anlegen', { tabelle:'Inbox', felder:{} }, { id:'s-1' }).then(function(r){ _sendErg=r; }); drain();
pruef('§1.2 Warteschlange bleibt stehen (wartend, kein POST)', _sendErg && _sendErg.wartend===true && aufrufe('POST', '/api/db/').length===0 && FSLive.warteschlangeAnzahl()===1, JSON.stringify([_sendErg, _aufrufe]));
S.fokus={ laeuft:false }; saveFokus(); S.meta.f11Ausstehend={}; saveMeta();
pruef('§1.1 STAND_MS und der 3-s-Takt standHolen(false) sind aus dem Quelltext entfernt (Kommentare ausgenommen)', (function(){ var s=readFile('index.html').replace(/\/\/[^\n]*/g, ''); return s.indexOf('STAND_MS=')<0 && s.indexOf('standHolen(false)')<0; })());   // Hotfix 19.1 §4.3: der Kommentar zu Hotfix 17 §1.1 nennt standHolen(false)
pruef('§1.3 Ticker und 20-s-Takt prüfen FSLive.nichtFuehrend()', (function(){ var s=readFile('index.html'); return (s.match(/if\(FSLive\.nichtFuehrend\(\)\) return;/g)||[]).length>=4; })());

// ══ §4 · Krone und Pille auf dem nicht führenden Gerät ══
pruef('§4.1 nicht führend: keine Krone', !!krone() && krone().style.display==='none');
pruef('§4.2 nicht führend ohne Stand: keine Pille', !!pille() && pille().style.display==='none');

// ══ §2.3 · Tipp nicht führend: Sperre ≥ 1 s, stand?ab=0, POST fuehrung, Tipp danach, Takte laufen wieder ══
var STAND={ json:{ fuehrend:'GERAET-B', stand_nr:8, schluessel:{ karten:[Object.assign(neueKarte({ titel:'Vom führenden Gerät', domain:'dfm' }), { id:'t-stand', status:'offen', matrixFeld:'ziel', sollMin:10 })], fokus:{ laeuft:false } } } };
neuStart({ 'GET /api/app/fuehrung':FUEHRUNG_B, 'GET /api/app/stand':STAND, 'POST /api/app/fuehrung':fuehrungIch, 'PUT /api/spiegel/':{ json:{ version:2 } }, 'GET /api/app/pakete':{ json:{ pakete:[] } }, 'PUT /api/app/uhr':{ json:{ ok:true } }, 'POST /api/db/':ANTWORT_DB });
document.elementFromPoint=function(x, y){ return (Math.abs(x-100)<=10 && Math.abs(y-200)<=10) ? knopf : null; };
_aufrufe=[]; geklickt.length=0; var t1=tippen(100, 200); drain();
pruef('§2.3 Tipp nicht führend: pointerup und click verschluckt, Sperre liegt auf, GET stand?ab=0 und POST fuehrung', t1.up.pd===1 && t1.klick.pd===1 && sperre().style.display==='flex' && aufrufe('GET', '/api/app/stand?ab=0').length===1 && aufrufe('POST', '/api/app/fuehrung').length===1 && geklickt.length===0, JSON.stringify(_aufrufe));
var warte=(_timer||[]).map(function(t){ return t.ms; }).filter(function(ms){ return ms<=1000; }).reduce(function(m, ms){ return Math.max(m, ms); }, 0);
pruef('§2.3 Sperre wartet bis mindestens 1000 ms', warte>900 && warte<=1000, JSON.stringify((_timer||[]).map(function(t){ return t.ms; })));
timerLaufen(); drain(); timerLaufen(); drain();
pruef('§2.3 danach: Gerät führt, Sperre weg, Stand übernommen, Tipp an derselben Stelle ausgeführt', FSLive.ichFuehre()===true && sperre().style.display==='none' && S.karten.length===1 && S.karten[0].id==='t-stand' && geklickt.length===1, JSON.stringify([FSLive.ichFuehre(), sperre().style.display, S.karten.map(function(k){ return k.id; }), geklickt]));
pruef('§2.3 nach der Übernahme: Spiegel (PUT), Pakete (GET), Uhr (PUT) und Badge (POST /api/db) laufen wieder', aufrufe('PUT', '/api/spiegel/').length>=1 && aufrufe('GET', '/api/app/pakete').length>=1 && aufrufe('PUT', '/api/app/uhr').length>=1 && aufrufe('POST', '/api/db/').length>=1 && FSLive.nichtFuehrend()===false, JSON.stringify(_aufrufe.map(function(a){ return a.methode+' '+a.pfad; })));
pruef('§4.1 führend: Krone sichtbar', krone().style.display==='block');
pruef('§4.2 standZeit nach der Übernahme gesetzt und gespeichert', !!FSLive.standZeit() && localStorage.getItem(PREFIX+'fslive_standZeit')===FSLive.standZeit());
pruef('§2.4 Führung im Speicher: { fuehrend, ichFuehre, ts }', (function(){ var z=JSON.parse(localStorage.getItem(PREFIX+'fslive_fuehrungZuletzt')||'null'); return !!z && z.ichFuehre===true && z.fuehrend===ME && typeof z.ts==='string'; })(), localStorage.getItem(PREFIX+'fslive_fuehrungZuletzt'));

// ══ §2.1 · Vordergrund führend: fuehrung zuerst, dann Spiegel/Schlange/Pakete/Uhr/Badge ══
_antworten['GET /api/app/fuehrung']=fuehrungIch;   // Hotfix 19.1 §4.3: nach POST fuehrung antwortet der Dienst mit diesem Gerät (der fetch-Ersatz stand noch auf GERAET-B)
localStorage.setItem(PREFIX+'karten', '[]');
_aufrufe=[]; FSLive.vormerken('karten'); feuern('visibilitychange', {}); drain(); timerLaufen(); drain();
var iF=_aufrufe.findIndex(function(a){ return a.methode==='GET' && a.pfad==='/api/app/fuehrung'; });
pruef('§2.1 Vordergrund führend: genau ein GET fuehrung, davor kein anderer Aufruf, danach Spiegel, Pakete, Uhr, Badge', iF===0 && aufrufe('GET', '/api/app/fuehrung').length===1 && aufrufe('PUT', '/api/spiegel/').length>=1 && aufrufe('GET', '/api/app/pakete').length>=1 && aufrufe('PUT', '/api/app/uhr').length>=1 && aufrufe('POST', '/api/db/').length>=1 && aufrufe('GET', '/api/app/stand').length===0, JSON.stringify(_aufrufe.map(function(a){ return a.methode+' '+a.pfad; })));
pruef('§2.2 online nur führend (Quelltext)', readFile('index.html').indexOf("addEventListener('online', ()=>{ if(nichtFuehrend()) return;")>=0);

// ══ §2.1 · Vordergrund nicht führend: nur fuehrung, sonst nichts ══
_antworten['GET /api/app/fuehrung']=FUEHRUNG_B;
_aufrufe=[]; feuern('visibilitychange', {}); drain(); timerLaufen(); drain();
pruef('§2.1 Vordergrund, Dienst meldet anderes Gerät: nur GET fuehrung, kein stand, nicht führend, Krone weg', _aufrufe.length===1 && _aufrufe[0].pfad==='/api/app/fuehrung' && FSLive.ichFuehre()===false && krone().style.display==='none', JSON.stringify(_aufrufe));

// ══ §2.4 · Start mit gespeicherter Führung: Krone ab der ersten Sekunde, fuehrungLesen überschreibt ══
localStorage.setItem(PREFIX+'fslive_fuehrungZuletzt', JSON.stringify({ fuehrend:ME, ichFuehre:true, ts:jetztIso() }));
var _gelesen=false;
neuStart({ 'GET /api/app/fuehrung':function(){ return { json:{ fuehrend:'GERAET-B', ich:'x', seit:null, stand_nr:5 } }; } });
pruef('§2.4 nach fuehrungLesen (anderes Gerät führt): nicht führend, Speicher aktualisiert', FSLive.ichFuehre()===false && JSON.parse(localStorage.getItem(PREFIX+'fslive_fuehrungZuletzt')).ichFuehre===false);
_antworten['GET /api/app/fuehrung']={ offline:true };
localStorage.setItem(PREFIX+'fslive_fuehrungZuletzt', JSON.stringify({ fuehrend:ME, ichFuehre:true, ts:jetztIso() }));
neuStart(_antworten);
pruef('§2.4 Start, Dienst nicht erreichbar: Zustand wie gespeichert (führend), Krone sichtbar', FSLive.ichFuehre()===true && krone().style.display==='block', JSON.stringify([FSLive.ichFuehre(), krone().style.display]));

// ══ §3 · Tipp auf dem führenden Gerät ══
neuStart({ 'GET /api/app/fuehrung':fuehrungIch, 'GET /api/app/stand':{ status:204 }, 'POST /api/app/fuehrung':fuehrungIch, 'PUT /api/spiegel/':{ json:{ version:3 } }, 'GET /api/app/pakete':{ json:{ pakete:[] } }, 'PUT /api/app/uhr':{ json:{ ok:true } }, 'POST /api/db/':ANTWORT_DB });
document.elementFromPoint=function(x, y){ return (Math.abs(x-100)<=10 && Math.abs(y-200)<=10) ? knopf : null; };   // Hotfix 19.1 §4.3: neuStart setzt elementFromPoint auf null zurück — der Knopf muss wieder unter dem Tipp liegen
pruef('§3 Ausgang: dieses Gerät führt (Bestätigung gerade eben)', FSLive.ichFuehre()===true);
// jünger als 30 s → kein Aufruf, Tipp sofort (nichts abgefangen)
_aufrufe=[]; geklickt.length=0; var t2=tippen(100, 200); drain();
pruef('§3.2 Bestätigung jünger 30 s: kein Aufruf, nichts abgefangen (Tipp geht sofort durch)', _aufrufe.length===0 && t2.up.pd===0 && t2.klick.pd===0, JSON.stringify([_aufrufe, t2.up.pd, t2.klick.pd]));
// älter als 30 s, Dienst: führt weiterhin → Tipp, keine Sperre
_versatz+=31000;
_aufrufe=[]; geklickt.length=0; var t3=tippen(100, 200); drain();
pruef('§3.2 Bestätigung älter 30 s, führt weiterhin: GET fuehrung (ohne Sperre), Tipp ausgeführt, kein stand, kein POST', aufrufe('GET', '/api/app/fuehrung').length===1 && sperre().style.display!=='flex' && geklickt.length===1 && t3.up.pd===1 && aufrufe('GET', '/api/app/stand').length===0 && aufrufe('POST', '/api/app/fuehrung').length===0, JSON.stringify([_aufrufe, geklickt, sperre().style.display]));
pruef('§3.2 GET fuehrung mit Zeitgrenze 3000 ms', (_timer||[]).some(function(t){ return t.ms===3000; }), JSON.stringify((_timer||[]).map(function(t){ return t.ms; })));
_aufrufe=[]; geklickt.length=0; var t4=tippen(100, 200); drain();
pruef('§3.2 direkt danach (Bestätigung frisch): kein Aufruf, nichts abgefangen', _aufrufe.length===0 && t4.up.pd===0);
// älter als 30 s, Dienst: anderes Gerät führt → Übernahme mit Sperre, Tipp danach
_versatz+=31000;
_antworten['GET /api/app/fuehrung']=FUEHRUNG_B; _antworten['GET /api/app/stand']=STAND; _antworten['POST /api/app/fuehrung']=fuehrungIch;
_aufrufe=[]; geklickt.length=0; _timer=[]; var t5=tippen(100, 200); drain();
pruef('§3.2 anderes Gerät führt: erst GET fuehrung, dann Übernahme mit Sperre (GET stand?ab=0, POST fuehrung), Tipp noch nicht', _aufrufe.length>=3 && _aufrufe[0].pfad==='/api/app/fuehrung' && aufrufe('GET', '/api/app/stand?ab=0').length===1 && aufrufe('POST', '/api/app/fuehrung').length===1 && sperre().style.display==='flex' && geklickt.length===0 && t5.up.pd===1, JSON.stringify([_aufrufe.map(function(a){ return a.methode+' '+a.pfad; }), sperre().style.display, geklickt]));
timerLaufen(); drain(); timerLaufen(); drain();
pruef('§3.2 … danach führt dieses Gerät wieder, Sperre weg, Tipp ausgeführt', FSLive.ichFuehre()===true && sperre().style.display==='none' && geklickt.length===1 && krone().style.display==='block', JSON.stringify([FSLive.ichFuehre(), sperre().style.display, geklickt]));
// älter als 30 s, Dienst offline → Tipp sofort, Gerät bleibt führend
_versatz+=31000;
_antworten['GET /api/app/fuehrung']={ offline:true };
_aufrufe=[]; geklickt.length=0; var t6=tippen(100, 200); drain();
pruef('§3.2 keine Antwort (offline): Tipp sofort ausgeführt, Gerät bleibt führend, keine Sperre', geklickt.length===1 && FSLive.ichFuehre()===true && sperre().style.display!=='flex' && aufrufe('GET', '/api/app/fuehrung').length===1 && aufrufe('POST', '/api/app/fuehrung').length===0 && t6.up.pd===1, JSON.stringify([geklickt, FSLive.ichFuehre(), _aufrufe]));
// Wischen > 10 px wird nie abgefangen
_antworten['GET /api/app/fuehrung']=fuehrungIch;
_aufrufe=[]; feuern('pointerdown', ereignis(100, 200)); var w1=ereignis(100, 240); feuern('pointerup', w1); drain();
pruef('§3.3 Wischen auf dem führenden Gerät: nichts abgefangen, kein Aufruf', w1.pd===0 && _aufrufe.length===0);

// ══ §3.4 · 409 beim Spiegeln: Krone weg, gemeinsame Schlüssel bleiben in offen, kein standHolen, Toast ══
_antworten['GET /api/app/fuehrung']=fuehrungIch; _antworten['GET /api/app/stand']={ status:204 };
neuStart(_antworten);
pruef('§3.4 Ausgang: führend, Krone sichtbar', FSLive.ichFuehre()===true && krone().style.display==='block');
localStorage.setItem(PREFIX+'karten', '[]');
_antworten['PUT /api/spiegel/']={ status:409, json:{ fehler:'nicht führend', fuehrend:'GERAET-C' } };
_aufrufe=[]; _toasts.length=0; FSLive.vormerken('karten'); FSLive.spiegeln(); drain(); timerLaufen(); drain();
pruef('§3.4 409: nicht führend, Krone weg, kein Fehlerzustand', FSLive.ichFuehre()===false && krone().style.display==='none' && FSLive.zustand()!=='rot', JSON.stringify([FSLive.ichFuehre(), krone().style.display, FSLive.zustand()]));
pruef('§3.4 409: kein standHolen, karten bleibt vorgemerkt (offen), Toast', aufrufe('GET', '/api/app/stand').length===0 && JSON.parse(localStorage.getItem(PREFIX+'fslive_ausstehend')||'[]').indexOf('karten')>=0 && _toasts.indexOf('Ein anderes Gerät führt — Änderungen hier nicht gesendet')>=0, JSON.stringify([_aufrufe, localStorage.getItem(PREFIX+'fslive_ausstehend'), _toasts]));
pruef('§3.4 409: Führung im Speicher aktualisiert (fuehrend GERAET-C, ichFuehre false)', (function(){ var z=JSON.parse(localStorage.getItem(PREFIX+'fslive_fuehrungZuletzt')||'null'); return !!z && z.ichFuehre===false && z.fuehrend==='GERAET-C'; })());

// ══ §4.2 · Pille erst ab 60 Minuten, Text HH:MM bzw. TT.MM. HH:MM ══
function p2(n){ return String(n).padStart(2, '0'); }
pruef('§4.2 Stand jünger als 60 Min.: keine Pille', pille().style.display==='none', pille().textContent);
_versatz+=60*60000; FSLive.hinweisAnzeigen();
var dz=new Date(FSLive.standZeit()), erwartet='Stand '+p2(dz.getHours())+':'+p2(dz.getMinutes())+' · tippen zum Übernehmen';
pruef('§4.2 Stand 60 Min. oder älter: Pille „Stand HH:MM · tippen zum Übernehmen“ (Ortszeit des Stands)', pille().style.display==='block' && pille().textContent===erwartet, pille().textContent+' ≠ '+erwartet);
pruef('§4.2 Pille ruft keinen Dienst auf', _aufrufe.filter(function(a){ return a.pfad.indexOf('/api/app/geraete')===0; }).length===0 && readFile('index.html').indexOf('geraeteLaden().then(hinweisAnzeigen)')<0);
var gestern=new Date(Date.now()-2*24*60*60000); gestern.setHours(19, 12, 0, 0);
localStorage.setItem(PREFIX+'fslive_standZeit', gestern.toISOString());
neuStart({ 'GET /api/app/fuehrung':FUEHRUNG_B });
pruef('§4.2 Stand an einem anderen Kalendertag: „Stand TT.MM. HH:MM · tippen zum Übernehmen“', pille().style.display==='block' && pille().textContent==='Stand '+p2(gestern.getDate())+'.'+p2(gestern.getMonth()+1)+'. 19:12 · tippen zum Übernehmen', pille().textContent);
pruef('§4.2 eigener 60-s-Takt und Prüfung bei visibilitychange im Quelltext', readFile('index.html').indexOf('setInterval(hinweisAnzeigen, 60000)')>=0 && /if\(document\.visibilityState==='visible'\)\{ hinweisAnzeigen\(\); (if\(sperrliste\.size\) sperrlisteAufloesen\(\); )?fuehrungLesen\(\)/.test(readFile('index.html')));   // Hotfix 19 §A5.4 steht dazwischen

// ══ §4.1 · Krone: Element, Stil, Stelle ══
pruef('§4.1 span#fsKrone: Inhalt 👑, Stil nach Auftrag', !!krone() && krone().textContent==='👑' && String(krone().style.cssText||'').indexOf('left:26px')>=0 && String(krone().style.cssText||'').indexOf('font-size:11px')>=0 && String(krone().style.cssText||'').indexOf('pointer-events:none')>=0, krone() && krone().style.cssText);
pruef('§4.1 Krone ist Kind von #fsLiveFlaeche (Quelltext)', (function(){ var s=readFile('index.html'); var a=s.indexOf("krone.id='fsKrone'"), b=s.indexOf('flaeche.appendChild(krone)'); return a>0 && b>a; })());
// ══ §4.4 · Geräte-Liste: 👑 statt Pille „führend“ ══
var hl=fsGeraeteListeHtml([{ geraet_id:ME, anzeigename:'iPad', name:'x', fuehrend:true },{ geraet_id:'GERAET-B', anzeigename:'Mac', name:'y', fuehrend:false }]);
pruef('§4.4 Geräte-Liste: 👑 neben dem führenden Gerät, kein Chip „führend“, Knopf „Führend setzen“ beim anderen', hl.indexOf('<span title="führend">👑</span>')>=0 && hl.indexOf('chip on gruen')<0 && hl.indexOf('data-fsgeraet-fuehren="GERAET-B"')>=0, hl);

// ══ §4.3 · nicht gekoppelt: weder Krone noch Pille, Verhalten wie bisher ══
localStorage.removeItem(PREFIX+'fslive_token');
neuStart({});
_aufrufe=[]; var u4=ereignis(100, 200); feuern('pointerdown', ereignis(100, 200)); feuern('pointerup', u4); drain();
pruef('§4.3 nicht gekoppelt: keine Krone, keine Pille, kein Abfangen, kein Aufruf, nichtFuehrend false', krone().style.display==='none' && pille().style.display==='none' && u4.pd===0 && _aufrufe.length===0 && FSLive.nichtFuehrend()===false && FSLive.zustand()==='grau');

pruef('§6.1 App 4.1.9 · Build 2026-10-27-44 (seit Hotfix 20)', APP_VERSION==='4.1.9' && APP_BUILD==='2026-10-27-44', APP_VERSION+' / '+APP_BUILD);
suiteEnde('Hotfix 17 · Führung ohne Dauerabruf, Krone, Stand-Hinweis (4.1.6)');
