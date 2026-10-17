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
suiteEnde('Chat 4.0');
