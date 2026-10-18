/* jsc-Suite: ABNAHME Hotfix v3.6.1 „Preis-Faktor entfernt, Farbe-Anzeige, Spielstand zurücksetzen". Begruendung fuer eine eigene
   Datei (Leitplanke „Testdateien mit Begruendung"): die beiden neuen Tests des Auftrags (§4) — Import mit preisFaktor wird
   angenommen und aendert keinen Preis; „Farbe (live)" = wohlstandSeitReset — samt der Reset-Beschriftung, mit verstellbarer Uhr.

   Ausfuehren aus der Repo-Wurzel:
     jsc tests/v361-abnahme.js
   Die Suite laedt die VOLLE App mit DOM-Stubs (wie v360-abnahme). */
var _els={};
function dummyEl(){ var d={ style:{}, classList:{add:function(){},remove:function(){},toggle:function(){},contains:function(){return false;}},
  addEventListener:function(){}, removeEventListener:function(){}, appendChild:function(){}, remove:function(){},
  querySelector:function(){return dummyEl();}, querySelectorAll:function(){return [];}, setAttribute:function(){},
  getAttribute:function(){return null;}, focus:function(){}, select:function(){}, click:function(){}, dataset:{},
  textContent:'', value:'', hidden:false, src:'',
  getContext:function(){ var n=function(){}; return {clearRect:n,fillRect:n,save:n,restore:n,translate:n,rotate:n,beginPath:n,arc:n,fill:n,fillStyle:''}; }, width:0, height:0 };
  Object.defineProperty(d,'innerHTML',{get:function(){return this._h||'';},set:function(v){this._h=v;}});
  d.insertAdjacentHTML=function(pos,h){ this._h=(pos==='afterbegin') ? h+(this._h||'') : (this._h||'')+h; };   // Hotfix 9
  return d; }
var document={ getElementById:function(id){ if(!_els[id]) _els[id]=dummyEl(); return _els[id]; },
  createElement:function(){ return dummyEl(); }, addEventListener:function(){},
  querySelector:function(){ return dummyEl(); }, querySelectorAll:function(){ return []; },
  body:dummyEl(), documentElement:dummyEl(), hidden:false };
var window={ addEventListener:function(){}, matchMedia:function(){ return {matches:false}; },
  location:{reload:function(){}}, navigator:{} };
var navigator={ vibrate:function(){}, clipboard:null };
var _store={};
var localStorage={ getItem:function(k){ return _store.hasOwnProperty(k)?_store[k]:null; },
  setItem:function(k,v){ _store[k]=String(v); }, removeItem:function(k){ delete _store[k]; },
  key:function(i){ return Object.keys(_store)[i]||null; } };
Object.defineProperty(localStorage,'length',{get:function(){ return Object.keys(_store).length; }});
function setInterval(){ return 0; } function clearInterval(){} function setTimeout(f){ return 0; } function clearTimeout(){}
function requestAnimationFrame(){ return 0; }
function confirm(){ return true; } function prompt(){ return null; } function alert(){}
var crypto={};
var console={ warn:function(){}, log:function(){}, error:function(){} };
function getComputedStyle(){ return { getPropertyValue:function(){return '';}, width:'0px', gap:'0px', opacity:'1', textDecorationLine:'none' }; }
var history={replaceState:function(){}};
var screen={};
var innerWidth=375, innerHeight=812, devicePixelRatio=2;
function addEventListener(){} function removeEventListener(){}
var matchMedia=window.matchMedia; var location=window.location;

// verstellbare Uhr: Date.now() und new Date() lesen _jetzt (Europe/Berlin wie auf dem iPhone)
/* ── Gemeinsamer Kopf der 4.0-Suiten (Betriebsbereit, Abschnitt 4.1): DOM-Stubs wie in den 3.x-Suiten, echte Uhr (verstellbar mit uhr()). ──
   Aufruf einer Suite aus der Repo-Wurzel: jsc tests/v40-<name>.js · Ergebnis: OK/FAIL je Prüfpunkt, Exit 3 bei Rot. */
var _ok=0, _rot=0;
function pruef(name, bedingung, info){ if(bedingung){ _ok++; print('OK   '+name); } else { _rot++; print('FAIL '+name+(info!==undefined ? ' — '+info : '')); } }
function nah(a, b, eps){ return Math.abs(Number(a)-Number(b))<=(eps===undefined ? 0.5 : eps); }
/* Die App und der Prüfkörper laufen in EINEM eval: const-Bindungen der App (FSLive, F11, F4N …) sind nur dort sichtbar */
function suite(koerper){ var src=readFile('index.html'); var m=src.match(/<script>([\s\S]*?)<\/script>/); (0,eval)(m[1].replace(/^\s*['"]use strict['"];?/,'') + "\n;\n" + readFile('tests/_helfer40.js') + "\n;\n" + readFile(koerper)); }
function suiteEnde(titel){ print((_rot ? _rot+' FEHLGESCHLAGEN' : 'ALLES GRÜN')+' · '+titel+' · '+_ok+' OK'); if(_rot){ throw new Error('rot'); } }
