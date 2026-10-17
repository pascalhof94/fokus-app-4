/* Helfer der 4.0-Suiten, die App-Bindungen (FSLive, S, …) brauchen — werden mit der App in EINEM eval geladen (tests/_kopf40.js) */
/* FSLive stumm: nichts geht ins Netz, Gesendetes wird gesammelt */
var _gesendet=[];
function fsliveStumm(){ FSLive.senden=function(w,a,o){ _gesendet.push({ werkzeug:w, args:a, id:o&&o.id }); return Promise.resolve({ sofort:true }); }; FSLive.lesen=function(){ return Promise.resolve({ datensaetze:[] }); }; FSLive.gekoppelt=function(){ return true; }; }
/* Mikrotasks (Promises) abarbeiten — jsc-Shell */
function warten(){ if(typeof drainMicrotasks==='function') drainMicrotasks(); }
/* Einen frischen Tag mit Testkarten aufsetzen */
function testTag(){
  S.karten=[]; S.unteraufgaben=[]; S.intraday=[]; S.historie=[]; S.tag=null; S.fokus={ laeuft:false };
  var a=Object.assign(neueKarte({ titel:'Aufstehen und in den Tag starten', domain:'privat' }), { id:'k3-aufstehen', rolle:'aufstehen', status:'offen', matrixFeld:'werkzeug', immerSichtbar:true, rhythmus:{ typ:'taeglich' } });
  var u=Object.assign(neueKarte({ titel:'Tagesübergang', domain:'privat' }), { id:'k3-tagesuebergang', rolle:'tagesuebergang', status:'offen', matrixFeld:'werkzeug', immerSichtbar:true, rhythmus:{ typ:'taeglich' } });
  var d=Object.assign(neueKarte({ titel:'DFM Aufgabe mit einem sehr langen Titel, der in der Statusleiste umbrechen muss und nie abgeschnitten wird', domain:'dfm' }), { id:'t-dfm', status:'offen', matrixFeld:'ziel', sollMin:30, geldImpact:5000 });
  var p=Object.assign(neueKarte({ titel:'Private Aufgabe', domain:'privat' }), { id:'t-priv', status:'offen', matrixFeld:'werkzeug', sollMin:20 });
  var e=Object.assign(neueKarte({ titel:'Erholung', domain:'privat' }), { id:'t-erh', status:'offen', matrixFeld:'zustand', sollMin:15, erholung:true });
  S.karten.push(a,u,d,p,e); saveKarten();
  tagStarten(70); S.tag.startTs=jetztIso(); saveTag();
  return { a:a, u:u, d:d, p:p, e:e };
}
