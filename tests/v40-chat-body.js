/* Suite 4.0 · Chat: Stand je Nachricht, volle Antworten, Badge. Aufruf: jsc tests/v40-chat.js */
fsliveStumm(); testTag();
var rows=[
  { id:'m1', Text:'Frage', Auftraggeber:'Pascal', 'Empfänger':'Trainer', Art:'Chat', Status:'offen', Zeitstempel:jetztIso() },
  { id:'m2', Text:'Frage 2', Auftraggeber:'Pascal', 'Empfänger':'Trainer', Art:'Chat', Status:'vorgemerkt', Zeitstempel:jetztIso() },
  { id:'m3', Text:'Frage 3', Auftraggeber:'Pascal', 'Empfänger':'Trainer', Art:'Chat', Status:'erledigt', Zeitstempel:jetztIso() },
  { id:'a3', Text:'Antwort kurz', Auftraggeber:'Trainer', 'Empfänger':'Pascal', Art:'Antwort', Status:'offen', Zeitstempel:jetztIso() },
  { id:'m4', Text:'Frage 4', Auftraggeber:'Pascal', 'Empfänger':'Trainer', Art:'Chat', Status:'abgelehnt', Zeitstempel:jetztIso() },
  { id:'m5', Text:'lokal', Auftraggeber:'Pascal', 'Empfänger':'Trainer', Art:'Chat', Zeitstempel:jetztIso(), lokal:true },
  { id:'a6', Text:'x'.repeat(300)+'… (642 Zeichen)', Auftraggeber:'Trainer', 'Empfänger':'Pascal', Art:'Antwort', Status:'offen', Zeitstempel:jetztIso() }
];
var st=function(i){ return f3nStand(rows, rows[i], i).t; };
pruef('offen → angekommen', st(0)==='angekommen', st(0));
pruef('vorgemerkt → Trainer arbeitet · seit …', /^Trainer arbeitet · seit /.test(st(1)), st(1));
pruef('erledigt → beantwortet · Uhrzeit der Antwort', /^beantwortet · /.test(st(2)), st(2));
pruef('abgelehnt → nicht bearbeitet', st(4)==='nicht bearbeitet', st(4));
pruef('Warteschlange → gesendet', st(5)==='gesendet', st(5));
// Volle Antwort: gekürzter Text wird über datensatz_lesen geholt
var gelesen=[]; FSLive.lesen=function(w,a){ gelesen.push(w+' '+a.id); return Promise.resolve({ datensatz:{ Text:'VOLL '+'y'.repeat(600) } }); };
var t1=f3nText(rows[6]);
pruef('gekürzter Text erkannt, Nachladen angestoßen', f3nGekuerzt(rows[6].Text) && gelesen.length===1 && /datensatz_lesen a6/.test(gelesen[0]), gelesen.join(','));
F3N.voll.a6='VOLL '+'y'.repeat(600);
pruef('nach dem Nachladen steht der volle Text', f3nText(rows[6]).length>600);
// Badge: neue Antworten (offen, nicht gesehen) zählen
S.meta.chatGesehen={}; f3nHintergrund(rows);
pruef('Badge zählt die zwei offenen Antworten', F7.chatNeu===2, F7.chatNeu);
S.meta.chatGesehen={ a3:jetztIso() }; f3nHintergrund(rows);
pruef('gesehene Antwort zählt nicht mehr', F7.chatNeu===1, F7.chatNeu);
// Liste: eigene Nachricht trägt den Stand, Antwort erscheint vollständig
var html=f3nListeHtml(rows, 'Trainer');
pruef('Liste enthält Stand und Schreibt-Zeile', html.indexOf('f3n-st')>=0 && html.indexOf('chatSchreibt')>=0 && html.indexOf('Trainer schreibt')>=0);
// Hotfix 8 · Abschnitt 1: Trainer-Knopf unten rechts (HTML, Klick, Badge). Die Knöpfe sind im jsc-DOM Attrappen mit echter Kinderliste.
var src8=readFile('index.html');
pruef('#trainerFab existiert im HTML direkt hinter #suchFab, CSS rechts, in Ebene 1 und breit verborgen', /<button id="suchFab"[^>]*>🔍<\/button>\s*<button id="trainerFab" aria-label="Trainer">💬<\/button>/.test(src8) && /#trainerFab\{position:fixed;right:16px;/.test(src8) && src8.indexOf('body[data-e1] #trainerFab')>=0 && src8.indexOf('body.breit #trainerFab')>=0);
pruef('Klick-Handler des Trainer-Knopfs ruft f7ChatOeffnen(\'Trainer\')', /el\('trainerFab'\)\.addEventListener\('click', \(\)=>\{ haptik\(8\); f7ChatOeffnen\('Trainer'\); \}\);/.test(src8));
closeSheet(); e1Schliessen && e1Schliessen(); f7ChatOeffnen('Trainer');
pruef('Klick öffnet Ebene 1 Chat mit Trainer', e1Art()==='chat' && f7Chat().an==='Trainer', JSON.stringify([e1Art(), f7Chat().an]));
function fabAttrappe(){ var kinder=[]; return { kinder:kinder, style:{}, classList:{add:function(){},remove:function(){},toggle:function(){},contains:function(){return false;}}, addEventListener:function(){},
  appendChild:function(c){ c.remove=function(){ var i=kinder.indexOf(c); if(i>=0) kinder.splice(i,1); }; kinder.push(c); },
  querySelector:function(sel){ var cls=sel.replace(/^\./,'').split('.'); for(var i=0;i<kinder.length;i++){ var c=String(kinder[i].className||'').split(/\s+/); if(cls.every(function(x){ return c.indexOf(x)>=0; })) return kinder[i]; } return null; } }; }
_els.trainerFab=fabAttrappe(); _els.suchFab=fabAttrappe();
F7.chatNeu=2; f3nBadge();
var tb=el('trainerFab').querySelector('.badge');
pruef('Badge: #trainerFab .badge zeigt 2 (nur die Zahl), #suchFab ohne .badge.chat', !!tb && tb.textContent==='2' && !el('suchFab').querySelector('.badge.chat'), tb && tb.textContent);
F7.chatNeu=0; f3nBadge();
pruef('Badge verschwindet bei 0', !el('trainerFab').querySelector('.badge'));
// ══ Hotfix 9 · Abschnitt 3: Chat unten starten, eigener Chat je Karte mit Trainer und Fachagent ══
function klickC(attr, wert){ var ds={}; ds[attr.replace(/^data-/,'').replace(/-([a-z0-9])/g, function(m,c){ return c.toUpperCase(); })]=wert||'1';
  return f7Klick({ stopPropagation:function(){}, preventDefault:function(){}, target:{ closest:function(sel){ return sel==='['+attr+']' ? { dataset:ds } : null; } } }); }
var kd=S.karten.find(function(x){ return x.id==='t-dfm'; }); kd.projekt='Fokus App'; saveKarten();
F7.lager.projekte={ ts:Date.now(), daten:[{ id:'proj-1', Projekt:'Fokus App', Status:'aktiv' }], fehler:'' };
var rowsK=[ { id:'k1', Text:'[Karte t-dfm] Wie zerlegen?', Auftraggeber:'Pascal', 'Empfänger':'Trainer', Art:'Chat', Status:'erledigt', Zeitstempel:jetztIso() },
  { id:'k2', Text:'[Karte t-dfm] In drei Schritte.', Auftraggeber:'Trainer', 'Empfänger':'Pascal', Art:'Antwort', Status:'offen', Zeitstempel:jetztIso() },
  { id:'k3', Text:'Zur Sache: erst die Pipeline.', Auftraggeber:'Projekt-Agent Fokus App', 'Empfänger':'Pascal', Art:'Antwort', Status:'offen', Zeitstempel:jetztIso(), 'Antwortet auf':[{ id:'k1', anzeige:'Wie zerlegen?' }] },
  { id:'k4', Text:'[Karte t-dfm] Änderung: 45 Minuten', Auftraggeber:'Trainer', 'Empfänger':'Pascal', Art:'Plan', Status:'offen', Zeitstempel:jetztIso() },
  { id:'g1', Text:'Allgemeine Frage', Auftraggeber:'Pascal', 'Empfänger':'Trainer', Art:'Chat', Status:'offen', Zeitstempel:jetztIso() } ];
F7.lager.chat={ ts:Date.now(), daten:rowsK, fehler:'' };
f7ChatOeffnen('Trainer', 'karte', '', 't-dfm');
var hk=f7ChatHtml();
pruef('Karten-Chat: Kopf mit Kartentitel, Unterzeile Trainer + Projekt-Agent, keine Empfänger-Chips, ‹ zurück', e1Art()==='chat' && f7Chat().karteId==='t-dfm' && hk.indexOf('💬 '+esc(kd.titel))>=0 && hk.indexOf('Trainer + Projekt-Agent Fokus App')>=0 && hk.indexOf('data-f7chatan=')<0 && hk.indexOf('data-f7chatkarteaus="1"')>=0, hk.slice(0,300));
pruef('Karten-Chat: Nachrichten mit Kennung, Antwort darauf (Antwortet auf) mit Absender, Kennung nicht gezeigt, allgemeine Nachricht fehlt', hk.indexOf('Wie zerlegen?')>=0 && hk.indexOf('In drei Schritte.')>=0 && hk.indexOf('Zur Sache')>=0 && hk.indexOf('Projekt-Agent Fokus App ·')>=0 && hk.indexOf('[Karte t-dfm]')<0 && hk.indexOf('Allgemeine Frage')<0);
pruef('Karten-Chat: Planänderung als „Änderung im Postfach", antippbar', hk.indexOf('📥 Änderung im Postfach: Änderung: 45 Minuten')>=0 && hk.indexOf('data-f7pfoeffnen="1"')>=0);
_gesendet.length=0; f7ChatAbschicken('Bitte 20 Minuten mehr');
var ga=_gesendet.filter(function(g){ return g.werkzeug==='datensatz_anlegen'; });
pruef('Senden: zwei datensatz_anlegen mit Kennung an Trainer und Projekt-Agent, Art Chat, Projekt verknüpft', ga.length===2 && ga.every(function(g){ return g.args.felder.Text==='[Karte t-dfm] Bitte 20 Minuten mehr' && g.args.felder.Art==='Chat' && g.args.verknuepfungen && g.args.verknuepfungen.Projekt && g.args.verknuepfungen.Projekt[0]==='proj-1'; }) && ga.map(function(g){ return g.args.felder['Empfänger']; }).sort().join(',')==='Projekt-Agent Fokus App,Trainer', JSON.stringify(ga.map(function(g){ return g.args; })));
pruef('eigene Nachricht erscheint einmal (eine lokale Vorab-Nachricht)', F7.lager.chat.daten.filter(function(r){ return r.lokal; }).length===1);
f7ChatOeffnen('Trainer'); var hg=f7ChatHtml();
pruef('allgemeiner Trainer-Chat: ohne Karten-Nachrichten, mit allgemeiner, mit Chips', hg.indexOf('Wie zerlegen?')<0 && hg.indexOf('In drei Schritte.')<0 && hg.indexOf('Bitte 20 Minuten mehr')<0 && hg.indexOf('Allgemeine Frage')>=0 && hg.indexOf('data-f7chatan=')>=0);
fokusStarten('t-dfm');
pruef('Chip „zur laufenden Karte" setzt karteId der laufenden Karte', klickC('data-f7chatbezug','karte')===true && f7Chat().karteId==='t-dfm' && f7Chat().bezug==='karte');
pruef('‹ zurück: karteId null, allgemeiner Chat', klickC('data-f7chatkarteaus')===true && f7Chat().karteId===null && f7ChatHtml().indexOf('data-f7chatan=')>=0);
pruef('Knopf „Zur Karte schreiben" in der Fokusansicht und in den Karteneinstellungen', f4KartenKernHtml(kd).indexOf('data-fkchat="t-dfm"')>=0 && (function(){ oeffneDetail('t-dfm'); var ok=el('sheetBody').innerHTML.indexOf('data-fkchat="t-dfm"')>=0; closeSheet(); return ok; })());
pruef('Knopf öffnet den Karten-Chat', klickC('data-fkchat','t-dfm')===true && e1Art()==='chat' && f7Chat().karteId==='t-dfm');
pruef('Karte ohne Projekt: nur Trainer, ein Datensatz', (function(){ var kp=S.karten.find(function(x){ return x.id==='t-priv'; }); f7ChatOeffnen('Trainer','karte','',kp.id); _gesendet.length=0; f7ChatAbschicken('Hallo'); var g=_gesendet.filter(function(x){ return x.werkzeug==='datensatz_anlegen'; }); return f7ChatHtml().indexOf('<small>Trainer</small>')>=0 && g.length===1 && g[0].args.felder['Empfänger']==='Trainer' && g[0].args.felder.Text==='[Karte t-priv] Hallo'; })());
pruef('Scroller: f3nScroller liefert ein Element, f3nNachUnten wirft nicht', !!f3nScroller() && (function(){ try{ f3nNachUnten(); return true; }catch(e){ return false; } })());
f7ChatOeffnen('Trainer');
suiteEnde('Chat 4.0');
