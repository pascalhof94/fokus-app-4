/* Suite 6.1 · Hotfix 31 (Auftrag 261119): §1 Tagesplanung startet keinen Timer beim Öffnen (nur ▶/Kettenstart mit starten:true) · §2 ein Trainer-Tageschat je Tag (Systemkarten → tag-<heute>,
   Trainer-Kanal ohne Zufalls-Gespräch) · §3 rechte Spalte nur mit Karte im Fokus · §4 geöffnet heißt gelesen (alle Zeilen, sofort, ohne lokalen Merker) · §5 keine Nachricht abgeschnitten,
   Volltext kopieren · §6 Farbe aus Zeitpunkten nur führend · §7 Tageswahl, Infokarten nie in der Planung, Zeilen wie in allen Listen, nur Karten von heute, Projekt oder Abteilung · §8 Version.
   Aufruf: jsc tests/v61-hotfix31.js */
var _toasts=[]; toast=function(m){ _toasts.push(String(m)); }; haptik=function(){}; var confirm=function(){ return true; };
fsliveStumm(); var _gesO=[]; FSLive.senden=function(w,a,o){ _gesendet.push({ werkzeug:w, args:a, id:o&&o.id, sofort:!!(o&&o.sofort) }); return Promise.resolve({ sofort:true }); };
var src=readFile('index.html');
uuid=function(){ return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c){ var r=Math.random()*16|0; return (c==='x' ? r : (r&3|8)).toString(16); }); };
function _k(id){ return S.karten.find(function(x){ return x.id===id; }); }
var K=testTag(); S.ui.spezial=null; S.ui.tkWahl=null; seiteZeigen('fokus'); var heute=heuteApp(), morgen=anVorTage(heute, -1), ueberm=anVorTage(heute, -2), in3=anVorTage(heute, -3), gestern=anVorTage(heute, 1);
S.meta.karten43=null; S.meta.migrationen=[]; migrationKarten43(); var tp=k43TagesplanungKarte(); var P=k43TP(); P.morgenTs=null; P.freigabeTs=null; k43Ui().schritt=1;
// Chat-Kanäle (wie Suite 4.4)
var KT={ id:'k-tr', Kanal:'Trainer', Agent:'Trainer', Abteilung:[{ id:'a-ts', anzeige:'Trainerstab' }], Projekt:[], Bereich:'privat', Tabelle:'Privat_Chat · Trainer', 'Claude-Raum-Link':null, Reihenfolge:1, Rolle:'Trainer' };
var KP={ id:'k-pipe', Kanal:'Pipeline-Agent', Agent:'Pipeline-Agent', Abteilung:[{ id:'a-sales', anzeige:'Sales' }], Projekt:[], Bereich:'dfm', Tabelle:'Chat · Pipeline-Agent', 'Claude-Raum-Link':null, Reihenfolge:1, Rolle:'Pipeline' };
F7.lager.chatKanaele={ ts:Date.now(), daten:[KT, KP], fehler:'' }; F7.lager.abteilungen={ ts:Date.now(), daten:[{ id:'a-ts', Name:'Trainerstab' },{ id:'a-sales', Name:'Sales' },{ id:'a-dev', Name:'DEV' }], fehler:'' }; F7.lager.projekte={ ts:Date.now(), daten:[{ id:'p-1', Projekt:'Projekt P', Abteilung:[{ id:'a-dev', anzeige:'DEV' }] }], fehler:'' };
var tag=f12TagGespraech();

// ══ §1 · Tagesplanung startet keinen Timer mehr beim Öffnen ══
S.fokus={ laeuft:false }; k43TagesplanungOeffnen();
pruef('1a Öffnen ohne Parameter: Ansicht Tagesplanung offen, S.fokus unverändert, keine Uhr auf der Tagesplanung', e1Art()==='spezial' && k43Ui().art==='tagesplanung' && !S.fokus.laeuft && S.fokus.karteId!==tp.id, JSON.stringify([e1Art(), k43Ui().art, S.fokus]));
e1Schliessen(); fokusStarten('t-dfm'); var fkVor=S.fokus.karteId; k43TagesplanungOeffnen();
pruef('1b läuft vorher eine andere Karte, läuft sie weiter (Zur Tagesplanung, rollenWegAusloesen, Block vorbei)', S.fokus.laeuft && S.fokus.karteId==='t-dfm' && fkVor==='t-dfm' && k43Ui().art==='tagesplanung');
e1Schliessen(); rollenWegAusloesen(tp.id); pruef('1c rollenWegAusloesen öffnet ohne Uhr', k43Ui().art==='tagesplanung' && S.fokus.laeuft && S.fokus.karteId==='t-dfm');
e1Schliessen(); fokusStarten(tp.id);
pruef('1d ▶ auf der Karte Tagesplanung (fokusStarten-Wrapper → starten:true): Uhr läuft auf der Tagesplanung, Ansicht offen', S.fokus.laeuft && S.fokus.karteId===tp.id && e1Art()==='spezial' && k43Ui().art==='tagesplanung', JSON.stringify([S.fokus, e1Art(), k43Ui().art]));
var dfmK=S.karten.find(function(x){ return x.rolle==='tagesplanungDfm'; });
pruef('1e Quelle: die Zeile mit fokusStarten(k.id, null, { k43:true }) läuft nur bei opt.starten===true; beide Wrapper übergeben { starten:true }, die vier Öffnen-Wege nicht', /if\(opt && opt\.starten===true && !\(S\.fokus && S\.fokus\.laeuft && S\.fokus\.karteId===k\.id\)\) fokusStarten\(k\.id, null, \{ k43:true \}\)/.test(src) && (src.match(/k43TagesplanungOeffnen\(\{ starten:true \}\)/g)||[]).length===2 && /if\(k\.rolle==='tagesplanung'\)\{ k43TagesplanungOeffnen\(\); return true; \}/.test(src) && /data-k43tagesplanung'\)\)\{ e\.stopPropagation\(\); k43TagesplanungOeffnen\(\); return; \}/.test(src) && /else k43TagesplanungOeffnen\(\); \};/.test(src));
e1Schliessen(); S.fokus={ laeuft:false }; saveFokus();

// ══ §2 · Genau ein Trainer-Tageschat je Tag ══
pruef('2a f12KarteGespraech: Systemkarte (rolle) → tag-<heute>, normale Karte → karte-<id>', f12KarteGespraech(tp.id)===tag && f12KarteGespraech('t-dfm')==='karte-t-dfm' && f12KarteGespraech(dfmK ? dfmK.id : tp.id)===tag && /^tag-\d{4}-\d{2}-\d{2}$/.test(tag));
pruef('2b f12NeuesGespraechIm: Trainer-Kanal → Tagesgespräch, anderer Kanal → neue Kennung (weder tag- noch karte-)', f12NeuesGespraechIm(KT)===tag && !/^(tag|karte)-/.test(f12NeuesGespraechIm(KP)) && f12IstTrainerKanal(KT) && !f12IstTrainerKanal(KP));
F7.lager['chatG:k-tr']={ ts:Date.now(), daten:[], fehler:'' }; F7.lager['chatG:k-pipe']={ ts:Date.now(), daten:[], fehler:'' };
var hT=f12AgentHtml(KT), hP=f12AgentHtml(KP);
pruef('2c Knopf „＋ Neuer Chat“ (data-f12neu) im Trainer-Kanal ausgeblendet, in anderen Kanälen vorhanden', !/data-f12neu/.test(hT) && /data-f12neu/.test(hP));
f12Ui().raum='Trainerstab'; f12Ui().kanal='k-tr'; f12Ui().gespraech='egal'; e1Oeffnen('chat');
var ev={ target:{ closest:function(sel){ return sel==='[data-f12neu]' || sel==='#e1-chat' ? this : null; }, dataset:{} } };
f12Klick(ev); pruef('2d Klick auf data-f12neu im Trainer-Kanal führt ins Tagesgespräch', f12Ui().gespraech===tag, f12Ui().gespraech);
f12Ui().kanal='k-pipe'; f12Ui().gespraech=null; var ev2={ target:{ closest:function(sel){ return sel==='[data-f12plus]' || sel==='#e1-chat' ? this : null; }, dataset:{} } }; try{ f12Klick(ev2); }catch(e){}
pruef('2e data-f12plus ohne Gespräch im Pipeline-Kanal legt eine Zufalls-Kennung an, keine tag-/karte-', !!f12Ui().gespraech && !/^(tag|karte)-/.test(f12Ui().gespraech), f12Ui().gespraech);
e1Schliessen(); var posK=Object.assign(neueKarte({ titel:'Position', domain:'privat' }), { id:'k3-position', rolle:'position', status:'offen' }); S.karten.push(posK); k43KarteOeffnen(posK.id);
pruef('2f 💬 an einer Systemkarte ohne eigene Ansicht öffnet das Tagesgespräch im Trainer-Kanal, ohne Karten-Marke', e1Art()==='chat' && f12Ui().kanal==='k-tr' && f12Ui().gespraech===tag && !f12Entwurf('k-tr', tag).karten.some(function(x){ return x.id===posK.id; }), JSON.stringify([e1Art(), f12Ui().kanal, f12Ui().gespraech]));
e1Schliessen(); k43KarteOeffnen('t-dfm'); pruef('2g 💬 an einer normalen Karte öffnet karte-<id> mit Karten-Marke', e1Art()==='chat' && f12Ui().gespraech==='karte-t-dfm' && f12Entwurf(f12Ui().kanal, 'karte-t-dfm').karten.some(function(x){ return x.id==='t-dfm'; })); e1Schliessen();
var fT=f16Teilnehmer(KT, [], tag); pruef('2h Titel des Tagesgesprächs ist der Tagestitel, Teilnehmer Trainer', f12TitelFuer(KT, tag, 'x')===f12TagTitel() && fT.length===1 && fT[0].von==='Trainer');

// ══ §3 · Wo Chats erscheinen (rechte Spalte f9Rendern) ══
F9_MQ.matches=true; document.body={ classList:{ toggle:function(){}, contains:function(){ return true; }, add:function(){}, remove:function(){} } };
var C=document.getElementById('srChat'), E=document.getElementById('srErf'), L=document.getElementById('slBody'); C.innerHTML='alt'; C.hidden=false;
S.fokus={ laeuft:false }; f9Rendern();
pruef('3a keine Aufgabe aktiv: #srChat hidden und leer, #srErf gerendert', C.hidden===true && C.innerHTML==='' && /Erfassen/.test(E.innerHTML), JSON.stringify([C.hidden, C.innerHTML.slice(0,60)]));
fokusStarten('t-priv'); f9Rendern();
pruef('3b normale Karte aktiv: #srChat sichtbar mit ihrem Karten-Chat karte-t-priv im Trainer-Kanal, Kopf „📇 Private Aufgabe“', C.hidden===false && f12Ui().kanal==='k-tr' && f12Ui().gespraech==='karte-t-priv' && /📇 Private Aufgabe/.test(C.innerHTML) && /folgt der Karte im Fokus/.test(C.innerHTML), C.innerHTML.slice(0,200));
fokusStarten(tp.id); f9Rendern();
pruef('3c Systemkarte aktiv (Tagesplanung läuft): rechte Spalte zeigt tag-<heute> mit Tagestitel', C.hidden===false && f12Ui().gespraech===tag && C.innerHTML.indexOf(f12TagTitel())>=0 && !/📇/.test(C.innerHTML), C.innerHTML.slice(0,200));
pruef('3d eingebetteter Chat der Tagesplanung und der Blockade zeigt tag-<heute>; k43ChatAntwortHtml → k43ChatKurzHtml(Trainer, tag)', (function(){ var h=k43ChatAntwortHtml('x', 'y'); return h.indexOf('data-hf26chat="k-tr|'+tag)>=0 && /Chat · Trainer heute/.test(h); })());
pruef('3e schwebender 💬 (trainerFab → hf26TrainerHeuteOeffnen) öffnet tag-<heute> im Trainer-Kanal', (function(){ e1Schliessen(); hf26TrainerHeuteOeffnen(); return e1Art()==='chat' && f12Ui().kanal==='k-tr' && f12Ui().gespraech===tag; })()); e1Schliessen();
pruef('3f Quelle: body.breit #srChat[hidden]{display:none}; der Rückfall f12KanalAktuell()||f12TrainerKanal() im Kopf entfällt', /body\.breit #srChat\[hidden\]\{display:none\}/.test(src) && !/f12Name\(f12KanalAktuell\(\)\|\|f12TrainerKanal\(\)/.test(src));
S.fokus={ laeuft:false }; saveFokus(); F9_MQ.matches=false;

// ══ §4 · Geöffnet heißt gelesen ══
function zeile(id, von, status, ts, text){ return { id:id, Von:von, Status:status, Zeitstempel:ts, Text:text||('Text '+id), 'Gespräch':tag, Art:'Nachricht' }; }
var t0=Date.parse(heute+'T08:00:00'); function tsN(n){ return new Date(t0+n*60000).toISOString(); }
var rows=[zeile('m1','Trainer','offen',tsN(1)), zeile('m2','Pascal','erledigt',tsN(2)), zeile('m3','Trainer','offen',tsN(3)), zeile('m4','Trainer','erledigt',tsN(4)), zeile('m5','Trainer','offen',tsN(5)), zeile('m6','Pascal','offen',tsN(6))];
F7.lager[f12VerlaufKey(KT, tag)]={ ts:Date.now(), daten:rows, fehler:'' }; F12.badge={ 'k-tr':5 }; F12.ungelesen={ 'k-tr':[rows[0], rows[2], rows[4], zeile('m9','Trainer','offen',tsN(9))] }; S.meta.chatGesehen={ m1:'x' };
_gesendet.length=0; document.visibilityState='visible'; f12GesehenMelden(KT, rows);
var g4=_gesendet.filter(function(x){ return x.werkzeug==='datensatz_aendern'; });
pruef('4a drei offene Trainer-Zeilen (auch m1 trotz altem Merker S.meta.chatGesehen) → drei Sendungen chat-gesehen-<id> mit Status erledigt, sofort:true; Pascal-Zeile und erledigte Zeile nicht', g4.length===3 && g4.every(function(x){ return x.sofort===true && /^chat-gesehen-m[135]$/.test(x.id) && x.args.felder.Status==='erledigt' && x.args.tabelle===KT.Tabelle; }), JSON.stringify(g4));
pruef('4b Zeilen lokal erledigt, Badge um 3 gesenkt, F12.ungelesen um die drei Zeilen gekürzt (m9 bleibt)', rows[0].Status==='erledigt' && rows[2].Status==='erledigt' && rows[4].Status==='erledigt' && rows[5].Status==='offen' && F12.badge['k-tr']===2 && F12.ungelesen['k-tr'].length===1 && F12.ungelesen['k-tr'][0].id==='m9', JSON.stringify([F12.badge, F12.ungelesen['k-tr'].map(function(r){ return r.id; })]));
_gesendet.length=0; f12GesehenMelden(KT, rows); pruef('4c zweiter Aufruf sendet nichts mehr (Wahrheit ist das Feld Status)', _gesendet.length===0);
rows[0].Status='offen'; rows[2].Status='offen'; rows[4].Status='offen'; F12.badge={ 'k-tr':3 }; _gesendet.length=0;
var hK=k43ChatKurzHtml(KT, tag, 'Antwort …', 'Chat · Trainer heute');
pruef('4d eingebetteter Chat (k43ChatKurzHtml, zeigt die letzten 4) meldet ALLE Zeilen: auch m1 (älter als die letzten 4) erledigt, drei Sendungen, Badge 0', _gesendet.length===3 && rows[0].Status==='erledigt' && rows[2].Status==='erledigt' && rows[4].Status==='erledigt' && F12.badge['k-tr']===0 && /k43-msgs/.test(hK), JSON.stringify(_gesendet.map(function(x){ return x.id; })));
rows[0].Status='offen'; _gesendet.length=0; f12Ui().kanal='k-tr'; f12Ui().gespraech=tag; var hS=f12SeiteHtml();
pruef('4e rechte Spalte (f12SeiteHtml) meldet gesehen', _gesendet.length===1 && _gesendet[0].id==='chat-gesehen-m1' && rows[0].Status==='erledigt' && /f12-seite/.test(hS));
var fnG=src.slice(src.indexOf('function f12GesehenMelden('), src.indexOf('function f12UhrTick('));
pruef('4f Quelle: f12GesehenMelden ohne S.meta.chatGesehen; FSLive-Warteschlange sendet sofort-Einträge auch nicht führend (nurSofort), f12BadgeLaden nach fuehrungUebernehmen vorhanden', !/S\.meta\.chatGesehen\[/.test(fnG) && /const nurSofort=nichtFuehrend\(\);/.test(src) && /if\(nurSofort && !warteschlange\.some\(x=>x && x\.sofort\)\)\{ anzeigen\(\); return null; \}/.test(src) && /if\(opt\.sofort\) eintrag\.sofort=true;/.test(src) && /try\{ f12BadgeLaden\(\); \}catch\(e\)\{\}\n    paketeHolen\(\); uhrMelden\(true\);/.test(src));
pruef('4g f15ZeileGelesen sendet ebenfalls sofort', (function(){ _gesendet.length=0; var r=zeile('h1','Pipeline-Agent','offen',tsN(7)); r.Art='Hinweis'; S.meta.chatGesehen={}; F12.ungelesen['k-pipe']=[r]; var ok=f15ZeileGelesen(KP, r); return ok && _gesendet.length===1 && _gesendet[0].sofort===true && _gesendet[0].id==='chat-gesehen-h1'; })());

// ══ §5 · Keine Nachricht wird abgeschnitten ══
var lang=''; for(var i=0;i<70;i++) lang+='Zeile '+i+' der langen Trainer-Nachricht mit   drei Leerzeichen und Inhalt.\n'; lang+='```tagesplan\nBlock\n```\nSCHLUSSWORT';
var rL=zeile('m7','Trainer','erledigt',tsN(7), lang); F7.lager[f12VerlaufKey(KT, tag)].daten=[rL]; F12.voll={}; F12.lade={};
var h5=k43ChatKurzHtml(KT, tag, 'x', 'y');
pruef('5a eingebetteter Chat zeigt den ganzen Text ('+lang.length+' Zeichen): letzte Zeile „SCHLUSSWORT“ da, Zeile 69 da, kein „[Tagesplan]“, Zeilen als <br>/<pre> statt zusammengezogen', /SCHLUSSWORT/.test(h5) && /Zeile 69 der langen/.test(h5) && !/\[Tagesplan\]/.test(h5) && (/<br>/.test(h5) || /<pre/.test(h5)) && h5===k43ChatKurzHtml43 ? false : true, h5.length);
pruef('5b Darstellung = f12TextHtml(f12Text(kanal, r)) wie im großen Chat; keine Kürzung (slice) in k43ChatKurzHtml, k43ChatAntwortHtml27/43', (function(){ var a=src.indexOf('function k43ChatKurzHtml('), b=src.indexOf('/* Klicks und Eingaben der Spezialansichten */'); var f1=src.slice(a,b); var c=src.indexOf('k43ChatKurzHtml=function(kanal, g, platzhalter, titel)'); var f2=src.slice(c, src.indexOf('function hf26ChatOeffnen(')); return /f12TextHtml\(f12Text\(kanal, r\)\)/.test(f1) && /f12TextHtml\(f12Text\(kanal, r\)\)/.test(f2) && !/slice\(0,280\)/.test(src) && !/slice\(0,300\)\)\+'<\/div>'/.test(src) && /'<div class="k43-msg">Trainer: '\+f12TextHtml\(text\)\+'<\/div>'/.test(src); })());
pruef('5c abgelöste Fassungen: k43ChatAntwortHtml27 zeigt den vollen Text', /SCHLUSSWORT/.test(k43ChatAntwortHtml27(lang, 'x')) && /Zeile 69/.test(k43ChatAntwortHtml27(lang, 'x')));
pruef('5d CSS .k43-msgs scrollt (overflow-y:auto), k43MsgsUnten setzt scrollTop auf scrollHeight', /\.k43-msgs\{[^}]*overflow-y:auto/.test(src) && /m\.scrollTop=m\.scrollHeight/.test(src) && typeof k43MsgsUnten==='function');
var kurz='Anfang der Nachricht … (6800 Zeichen)'; var rK=zeile('m8','Trainer','erledigt',tsN(8), kurz); var _kop=[]; kopieren=function(t){ _kop.push(String(t)); };
var kn=f12KopieGanzKnopf(kurz, KT, rK); pruef('5e f12KopieGanzKnopf trägt bei gekürztem Text Tabelle und id; bei vollem Text nicht', /data-f12kopieid="m8"/.test(kn) && kn.indexOf('data-f12kopietab="'+KT.Tabelle)>=0 && !/data-f12kopieid/.test(f12KopieGanzKnopf('kurzer Text', KT, rK)) && /f12KopieGanzKnopf\(text, kanal, r\)/.test(src));
FSLive.lesen=function(w, a){ return Promise.resolve({ datensatz:{ id:a.id, Text:'VOLLTEXT '+a.id+' '+a.tabelle } }); };
f12KopieAusfuehren({ dataset:{ f12kopie:kurz, f12kopietab:KT.Tabelle, f12kopieid:'m8' } }); warten();
pruef('5f Kopieren lädt den Volltext über datensatz_lesen nach und kopiert ihn; F12.voll gefüllt', _kop.length===1 && _kop[0]==='VOLLTEXT m8 '+KT.Tabelle && F12.voll.m8===_kop[0], JSON.stringify(_kop));
_kop.length=0; f12KopieAusfuehren({ dataset:{ f12kopie:kurz, f12kopietab:KT.Tabelle, f12kopieid:'m8' } }); pruef('5g zweiter Klick kopiert aus F12.voll ohne Nachladen', _kop.length===1 && _kop[0]==='VOLLTEXT m8 '+KT.Tabelle);
_kop.length=0; f12KopieAusfuehren({ dataset:{ f12kopie:'voller Text' } }); pruef('5h voller Text wird direkt kopiert', _kop.length===1 && _kop[0]==='voller Text');
pruef('5i Quelle: FSLive.lesen kennt keine Führungsregel (Volltext lädt auch nicht führend)', (function(){ var a=src.indexOf('async function lesen(werkzeug, args){'); var f=src.slice(a, src.indexOf('async function appLesen(')); return !/nichtFuehrend|ichFuehre/.test(f); })());
FSLive.lesen=function(){ return Promise.resolve({ datensaetze:[] }); };

// ══ §6 · Farbe auf allen Geräten ══
pruef('6a Quelle: ausmalVerteilen kehrt auf einem nicht führenden Gerät vor jeder Änderung an S.meta.ausmalen um; Tipps laufen über den Tipp-Abfang', (function(){ var a=src.indexOf('function ausmalVerteilen(){'); var f=src.slice(a, src.indexOf('let _kwTimer=null;')); var g=f.indexOf('FSLive.nichtFuehrend()) return;'); return g>0 && g<f.indexOf('const A=ausmalState(), T=topfFassung();'); })());
pruef('6b nicht führend: ausmalVerteilen ändert S.meta.ausmalen nicht', (function(){ var vor=JSON.stringify(ausmalState()); var alt=FSLive.nichtFuehrend; FSLive.nichtFuehrend=function(){ return true; }; ausmalVerteilen(); var nach=JSON.stringify(S.meta.ausmalen); FSLive.nichtFuehrend=alt; return vor===nach; })());

// ══ §7 · Karten in „Blöcke planen“ und „Karte zuordnen“ ══
function karte(id, titel, extra){ var k=Object.assign(neueKarte({ titel:titel, domain:'dfm' }), { id:id, status:'offen', std42:true, art:'aufgabe', sollMin:30, matrixFeld:'ziel', projekt:'Projekt P', prio:3, belastung:0 }, extra||{}); S.karten.push(k); return k; }
var kHeute=karte('h-1', 'Heute Karte', { faelligkeit:heute }), kUeber=karte('u-1', 'Überfällig Karte', { faelligkeit:gestern }), kZuk=karte('z-1', 'Zukunft Karte', { faelligkeit:ueberm }), kOhne=karte('o-1', 'Ohne Datum Karte', {});
var kInfo=karte('i-1', 'Info Karte', { art:'info', faelligkeit:heute }), kRout=karte('r-1', 'Routine ohne Datum', { art:'routine', rhythmus:{ typ:'taeglich' }, projekt:null, domain:'privat' }), kPaFehlt=karte('p-1', 'DFM ohne Projekt', { projekt:null, abteilung:null, faelligkeit:heute });
saveKarten(); k43KettenNormieren(); hf26StandardKetten(heute); S.fokus={ laeuft:false };
pruef('7.4a hf31Einplanbar: heute ✓, überfällig ✓, Routine ohne Datum ✓, Systemkarte ✓, Zukunft ✗, ohne Datum ✗', hf31Einplanbar(kHeute) && hf31Einplanbar(kUeber) && hf31Einplanbar(kRout) && hf31Einplanbar(tp) && !hf31Einplanbar(kZuk) && !hf31Einplanbar(kOhne));
_toasts.length=0; var e1=hf29KarteEinordnen('z-1', { art:'block', block:'fokus1' }); var e2=hf29KarteEinordnen('o-1', { art:'block', block:'fokus1' });
pruef('7.4b Zukunft und ohne Datum werden abgelehnt mit „Nur Karten von heute — erst Datum ändern (✎)“; Datum unverändert, nicht im Block', e1===false && e2===false && _toasts.filter(function(t){ return t==='Nur Karten von heute — erst Datum ändern (✎)'; }).length===2 && kZuk.faelligkeit===ueberm && !kOhne.faelligkeit && !hf29BlockVon('z-1') && !hf29BlockVon('o-1'), JSON.stringify(_toasts));
var e3=hf29KarteEinordnen('u-1', { art:'block', block:'fokus1' }); pruef('7.4c überfällige Karte ＋: Datum wird heute, Karte steht im Block', e3===true && kUeber.faelligkeit===heute && hf29BlockVon('u-1') && hf29BlockVon('u-1').block==='fokus1');
var e4=hf29KarteEinordnen('r-1', { art:'block', block:'fokus1' }); pruef('7.4d Routine ohne Datum ＋: steht im Block', e4===true && hf29BlockVon('r-1') && hf29BlockVon('r-1').block==='fokus1');
var e5=hf29KarteEinordnen('h-1', { art:'block', block:'fokus1' }); pruef('7.4e Karte von heute ＋: steht im Block', e5===true && hf29BlockVon('h-1'));
_toasts.length=0; var e6=hf29KarteEinordnen('i-1', { art:'block', block:'fokus1' }); var eig=hf26KetteSetzen({ id:'tk-eig', name:'Eigene', art:'eigene', datum:heute, karten:[], quelle:'pascal' }); var e7=hf29KarteEinordnen('i-1', { art:'kette', id:'tk-eig' });
pruef('7.2b Infokarte für Block und Kette abgelehnt: „Infokarte hängt am Thema, nicht im Block“', e6===false && e7===false && _toasts.filter(function(t){ return t==='Infokarte hängt am Thema, nicht im Block'; }).length===2 && !hf29BlockVon('i-1') && eig.karten.length===0);
hf29AufSetzen(hf29Block('fokus1').id); HF29.such='karte'; var bl=hf29Bloecke(heute); var hB=hf29BlockOffenHtml(hf29Block('fokus1'), bl);
pruef('7.2a/7.4f Treffer der Suche „karte“: Zukunft, ohne Datum und Infokarte fehlen; Infokarte nicht in Von gestern / heute ohne Block', !/data-klkarte="z-1"/.test(hB) && !/data-klkarte="o-1"/.test(hB) && !/data-klkarte="i-1"/.test(hB) && !hf29Gestern().some(function(k){ return k.id==='i-1'; }) && !hf29HeuteOhneBlock().some(function(k){ return k.id==='i-1'; }) && hf29HeuteOhneBlock().some(function(k){ return k.id==='p-1'; }));
var f1=hf29Block('fokus1'); f1.karten.push('i-1'); var hB2=hf29BlockOffenHtml(f1, bl), hKopf=hf29BlockKopfHtml(f1, false, bl);
pruef('7.2d Infokarte schon im Block: nicht angezeigt, zählt nicht (Kopf „3 Karten“), bleibt im Block', !/data-klkarte="i-1"/.test(hB2) && /3 Karten/.test(hKopf) && f1.karten.indexOf('i-1')>=0 && hf29KarteEinordnen('h-1', { art:'block', block:'fokus1' }) && f1.karten.indexOf('i-1')>=0, hKopf);
pruef('7.3a aufgeklappter Block und rote Listen sind data-klliste-Container; jede Zeile hat ↷ (data-hf31schieb), ✎ (data-detail) und 💬 (data-k43kchat), kein data-hf29schieb mehr', /class="hf29-auf" data-hf29block="fokus1" data-klliste="1"/.test(hB2) && /data-hf31schieb="h-1"/.test(hB2) && /data-detail="h-1"/.test(hB2) && /data-k43kchat="h-1"/.test(hB2) && !/data-hf29schieb/.test(hB2) && /'<div class="hf29-rotliste" data-klliste="1">'/.test(src) && !/data-hf29schieb="'\+esc\(k\.id\)/.test(src));
HF29.rot='gestern'; var kG=karte('g-1', 'Gestern Karte', { faelligkeit:gestern }); saveKarten(); var hP=hf29PlanenHtml();
pruef('7.3b rote Liste „Von gestern“ in Blöcke planen: Zeile mit ↷ und ✎ im data-klliste-Container', /hf29-rotliste" data-klliste="1"/.test(hP) && /data-hf31schieb="g-1"/.test(hP) && /data-detail="g-1"/.test(hP)); HF29.rot=null;
// 7.1 Tageswahl
var hW=hf31TagWahlHtml('ziel', null); var lab=function(d){ return AN_WT[anWochentag(d)]+' '+anKurzDatum(d)+'.'; };
pruef('7.1a Tageswahl: drei Knöpfe morgen/übermorgen/in 3 Tagen mit Wochentag und Datum („'+lab(morgen)+'“), 📅 Datumsfeld min=morgen', hW.indexOf('data-hf31tag="ziel|'+morgen+'">'+lab(morgen))>=0 && hW.indexOf('data-hf31tag="ziel|'+ueberm+'">'+lab(ueberm))>=0 && hW.indexOf('data-hf31tag="ziel|'+in3+'">'+lab(in3))>=0 && hW.indexOf('data-hf31datum="ziel"')>=0 && hW.indexOf('min="'+morgen+'"')>=0 && /📅 Datum wählen/.test(hW) && (hW.match(/data-hf31tag=/g)||[]).length===3, hW);
hf29Zuordnen('h-1', { modus:'verschieben' }); var hz=hf29ZuordnenHtml();
pruef('7.1b/7.3c/7.5a Karte zuordnen: Tageswahl statt „📅 anderer Tag“, Karte ohne live im data-klliste-Container mit 💬 und ✎ (ohne ↷), Feld Projekt oder Abteilung mit data-hf31pa', /data-hf31tag="ziel\|/.test(hz) && !/data-hf29tag/.test(hz) && !/data-hf29datum/.test(hz) && /class="hf29-karte" data-klliste="1"/.test(hz) && /data-k43kchat="h-1"/.test(hz) && /data-detail="h-1"/.test(hz) && !/data-hf31schieb/.test(hz) && /Projekt oder Abteilung/.test(hz) && /data-hf31pa="h-1"/.test(hz), hz.slice(0,300));
hf31TagWaehlen('ziel', ueberm); pruef('7.1c Tageswahl in Karte zuordnen setzt das Ziel { art:tag, datum }', HF29.zu && HF29.zu.ziel && HF29.zu.ziel.art==='tag' && HF29.zu.ziel.datum===ueberm && hf29ZuordnenHtml().indexOf('class="hf29-chip an" data-hf31tag="ziel|'+ueberm+'"')>=0);
var hzF=hf29ZuordnenFussHtml(); pruef('7.1d Fuß „Verschieben · anderer Tag TT.MM.“', hzF.indexOf('Verschieben · anderer Tag '+anKurzDatum(ueberm)+'.')>=0, hzF);
HF29.zu=null; closeSheet();
// 7.1e ↷ in Blöcke planen: Karte in Block, eigener Kette und angeheftet
eig.karten.push('h-1'); hf29AnheftenSetzen('h-1', 'fokus1', true); var sz0=num(kHeute.schiebeZaehler); _toasts.length=0;
hf31Schieben('h-1'); pruef('7.1e ↷ öffnet das Blatt mit der Tageswahl für die Karte', HF31.schieb==='h-1' && document.getElementById('sheetBody').innerHTML.indexOf('data-hf31tag="h-1|'+morgen)>=0);
var ok71=hf31TagWaehlen('h-1', morgen);
pruef('7.1f „morgen“: Karte hat morgen als Datum, schiebeZaehler +1, aus Block, eigener Kette und Tag-Kette von heute raus, 📌 weg', ok71===true && kHeute.faelligkeit===morgen && num(kHeute.schiebeZaehler)===sz0+1 && !hf29BlockVon('h-1', heute) && eig.karten.indexOf('h-1')<0 && !(S.tagesketten||[]).some(function(c){ return c.datum===heute && (c.karten||[]).indexOf('h-1')>=0; }) && !hf29Angeheftet('h-1') && HF31.schieb===null && _toasts.some(function(t){ return /^↷ anderer Tag /.test(t); }), JSON.stringify([kHeute.faelligkeit, kHeute.schiebeZaehler, _toasts]));
_toasts.length=0; var vor71=kUeber.faelligkeit; pruef('7.1g heute oder früher wird abgelehnt („Frühestens morgen“)', hf31TagWaehlen('u-1', heute)===false && hf31TagWaehlen('u-1', gestern)===false && _toasts.filter(function(t){ return t==='Frühestens morgen'; }).length===2 && kUeber.faelligkeit===vor71);
pruef('7.4g Karte mit Datum morgen ist nicht einplanbar und bleibt auf ihrem Tag', !hf31Einplanbar(kHeute) && hf29KarteEinordnen('h-1', { art:'block', block:'fokus1' })===false && kHeute.faelligkeit===morgen);
// 7.3d kettenListeKlick: abhaken in der Planungszeile → Ansicht zeichnet neu
var _e1n=0; var e1Alt=e1Rendern; e1Rendern=function(){ _e1n++; }; k43Ui().art='tagesplanung'; k43Ui().schritt=2; saveUi(); e1Oeffnen('spezial');
var zr={ dataset:{ klcheck:'r-1' } }; zr.closest=function(sel){ return (sel==='[data-klcheck]' || sel==='.hf29-zr' || sel==='[data-klliste]') ? zr : null; };
var evK={ target:zr, stopPropagation:function(){}, preventDefault:function(){} }; _e1n=0; var rK7=kettenListeKlick(evK);
pruef('7.3d ✓ in der Planungszeile (kettenListeKlick, Routine r-1): Karte heute erledigt, Ansicht neu gezeichnet (e1Rendern)', rK7===true && kartenStatusHeute(kRout)==='erledigt' && _e1n>=1, JSON.stringify([rK7, kartenStatusHeute(kRout), _e1n]));
var zm={ dataset:{ hf29zuordnen:'p-1', klfokus:'p-1' } }; zm.closest=function(sel){ return (sel==='[data-hf29zuordnen]' || sel==='[data-klfokus]' || sel==='.hf29-zr') ? zm : null; };
pruef('7.5d Marke „Projekt/Abteilung fehlt“ (data-hf29zuordnen) geht nicht an die Fokusseite (kettenListeKlick → false)', kettenListeKlick({ target:zm, stopPropagation:function(){} })===false);
e1Rendern=e1Alt; e1Schliessen();
// 7.5 Projekt oder Abteilung
var zP=hf29ZeileMit(kPaFehlt, null, {}, ''); pruef('7.5b DFM-Karte ohne Projekt und Abteilung trägt die rote Marke mit data-hf29zuordnen; mit Projekt nicht', /class="hf29-rot hf31-pa" data-hf29zuordnen="p-1">Projekt\/Abteilung fehlt/.test(zP) && !/Projekt\/Abteilung fehlt/.test(hf29ZeileMit(kUeber, null, {}, '')) && !/Projekt\/Abteilung fehlt/.test(hf29ZeileMit(kRout, null, {}, '')));
var hPA=k43ProjektOderAbteilungHtml(kPaFehlt, { karteId:'p-1' }); pruef('7.5c Feld mit karteId: Projekt-Eingabe und Abteilungs-Auswahl tragen data-hf31pa; ohne karteId nicht', (hPA.match(/data-hf31pa="p-1"/g)||[]).length===2 && !/data-hf31pa/.test(k43ProjektOderAbteilungHtml(kPaFehlt)) && /<option value="Sales"/.test(hPA));
_gesendet.length=0; var ok75=hf31PaSetzen(kPaFehlt, 'abteilung', 'Sales', null);
pruef('7.5e Abteilung wählen: k.abteilung gesetzt, feldTs für projekt/abteilung, Karte berührt und gespeichert', ok75===true && kPaFehlt.abteilung==='Sales' && kPaFehlt.projekt==null && kPaFehlt.feldTs && kPaFehlt.feldTs.abteilung && kPaFehlt.feldTs.projekt && !hf31PaFehlt(kPaFehlt));
hf31PaSetzen(kPaFehlt, 'projekt', 'Projekt P', null); pruef('7.5f Projekt eintragen: Projekt gesetzt, Abteilung leer (es gilt die Abteilung des Projekts)', kPaFehlt.projekt==='Projekt P' && kPaFehlt.abteilung===null && /Abteilung des Projekts|DEV/.test(k43ProjektOderAbteilungHtml(kPaFehlt, { karteId:'p-1' })));
pruef('7.5g mit Projekt wird eine direkte Abteilung abgewiesen; Projekt leeren macht die Abteilung wieder wählbar', hf31PaSetzen(kPaFehlt, 'abteilung', 'Sales', null)===false && kPaFehlt.abteilung===null && hf31PaSetzen(kPaFehlt, 'projekt', '', null)===true && kPaFehlt.projekt===null && hf31PaFehlt(kPaFehlt));
// 7.2c/7.4h Ketten-Paket
var kI2=karte('i-2', 'Info im Paket', { art:'info', faelligkeit:heute }), kZ2=karte('z-2', 'Zukunft im Paket', { faelligkeit:in3 }), kH2=karte('h-2', 'Heute im Paket', { faelligkeit:heute }); saveKarten(); _toasts.length=0;
var rP=k43KettenAusPaket([{ id:'tk-fokus1', name:'Fokus 1', karten:['h-2','i-2','z-2','r-1'] }], function(id){ return _k(id) ? id : null; });
var f1b=hf29Block('fokus1');
pruef('7.2c/7.4h Ketten-Paket: Infokarte und Zukunfts-Karte übersprungen und in der Meldung genannt, Karte von heute und Routine im Block', f1b.karten.indexOf('h-2')>=0 && f1b.karten.indexOf('r-1')>=0 && f1b.karten.indexOf('i-2')<0 && f1b.karten.indexOf('z-2')<0 && rP.uebersprungen && rP.uebersprungen.length===2 && /Infokarte „Info im Paket“/.test(rP.uebersprungen[0].was) && /Datum/.test(rP.uebersprungen[1].grund) && _toasts.some(function(t){ return /^2 Karten nicht eingeplant: Infokarte „Info im Paket“, Karte „Zukunft im Paket“/.test(t); }), JSON.stringify([rP, _toasts]));
pruef('7.4i Import-Weg: uebersprungen des Ketten-Pakets landet in der Import-Liste', /if\(Array\.isArray\(kettenErg\.uebersprungen\)\) kettenErg\.uebersprungen\.forEach\(u=>uebersprungen\.push\(u\)\);/.test(src));
pruef('7.x Planung der Blöcke selbst unverändert: hf29Bloecke liefert die Standard-Blöcke von heute, Block fokus1 trägt die eingeplanten Karten', hf26Wochenende(heute) || (hf29Bloecke(heute).length>=5 && f1b.art==='block' && f1b.datum===heute));

// ══ §8 · Version ══
pruef('8 App 4.5.7 · Build 2026-11-26-67 · sw.js Cache fokus4-v4.5.7-1', APP_VERSION==='4.5.7' && APP_BUILD==='2026-11-26-67' && /const CACHE = 'fokus4-v4\.5\.7-1'/.test(readFile('sw.js')));
suiteEnde('Hotfix 31 · Tagesplanung ohne Autostart, ein Trainer-Tageschat, Chats gelesen und vollständig, Farbe auf allen Geräten, Karten in der Planung (4.5.5)');
