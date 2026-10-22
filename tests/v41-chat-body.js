/* Suite 4.1 · Chat-Räume (Auftrag 22.10.2026, Teil 2, §12.1). Aufruf: jsc tests/v41-chat.js
   Geschrieben, im Rahmen des Auftrags nicht ausgeführt. Läuft gegen Lager-Attrappen (F7.lager, F12.pf), FSLive stumm. */
fsliveStumm(); testTag();
function vorMin(m){ return new Date(Date.now()-m*60000).toISOString(); }
function vorTage(d, h){ var x=new Date(Date.now()-d*86400000); x.setHours(h==null?12:h, 0, 0, 0); return x.toISOString(); }
var src=readFile('index.html');
var ABT=[{ id:'a-ts', Name:'Trainerstab', Emoji:'🎯', Teams:'Trainer · Zeit-Spezialist' },{ id:'a-sales', Name:'Sales', Emoji:'🤝', Teams:'Lead-Recherche, Angebote' },{ id:'a-mkt', Name:'Marketing', Emoji:'📣', Teams:'LinkedIn, Content' },{ id:'a-dev', Name:'DEV', Emoji:'💻', Teams:'Team Projekte' }];
F7.lager.abteilungen={ ts:Date.now(), daten:ABT, fehler:'' };
var KT={ id:'k-tr', Kanal:'Trainer', Agent:'Trainer', Abteilung:[{ id:'a-ts', anzeige:'Trainerstab' }], Projekt:[], Bereich:'privat', Tabelle:'Privat_Chat · Trainer', 'Claude-Raum-Link':'https://claude.ai/project/x', Reihenfolge:1, Rolle:'Tagesplaner und Trainer' };
var KZ={ id:'k-zeit', Kanal:'Zeit-Spezialist', Agent:'Zeit-Spezialist', Abteilung:[{ id:'a-ts', anzeige:'Trainerstab' }], Projekt:[], Bereich:'privat', Tabelle:'Privat_Chat · Zeit-Spezialist', 'Claude-Raum-Link':null, Reihenfolge:2, Rolle:'Prüft Zeiten' };
var KP={ id:'k-pipe', Kanal:'Pipeline-Agent', Agent:'Pipeline-Agent', Abteilung:[{ id:'a-sales', anzeige:'Sales' }], Projekt:[], Bereich:'dfm', Tabelle:'Chat · Pipeline-Agent', 'Claude-Raum-Link':null, Reihenfolge:1, Rolle:'Fach-Agent Salespipeline.' };
var KH={ id:'k-hawk', Kanal:'Projekt-Agent HAWK', Agent:'Projekt-Agent HAWK', Abteilung:[{ id:'a-dev', anzeige:'DEV' }], Projekt:[{ id:'p-hawk', anzeige:'HAWK' }], Bereich:'dfm', Tabelle:'Chat · Projekt-Agent HAWK', 'Claude-Raum-Link':null, Reihenfolge:100, Rolle:'Projektakte' };
F7.lager.chatKanaele={ ts:Date.now(), daten:[KT, KZ, KP, KH], fehler:'' };
F7.lager.postfach={ ts:Date.now(), daten:[], fehler:'' };
F7.lager.postfachNachholen={ ts:Date.now(), daten:[], fehler:'' };
F7.lager.projekte={ ts:Date.now(), daten:[{ id:'p-hawk', Projekt:'HAWK', Status:'Aktiv', Abteilung:[{ id:'a-dev', anzeige:'DEV' }] },{ id:'p9', Projekt:'Sonst', Status:'Aktiv', Abteilung:[{ id:'a-sales', anzeige:'Sales' }] }], fehler:'' };
var R1={ id:'r1', 'Gespräch':'g1', 'Gesprächstitel':'Paket 34 angekommen?', Von:'Pascal', Art:'Nachricht', Anlass:'Chat', Status:'erledigt', Zeitstempel:vorMin(30), Laufstart:vorMin(29), Beantwortet:vorMin(28), Text:'Paket 34 angekommen?', Postfach:[], Karten:null };
var R2={ id:'r2', 'Gespräch':'g1', Von:'Trainer', Art:'Antwort', Anlass:'Chat', Status:'offen', Zeitstempel:vorMin(28), Text:'Ja, Paket 34 ist um 12:13 Uhr angekommen.', Postfach:[] };
var R3={ id:'r3', 'Gespräch':'g2', 'Gesprächstitel':'Doppelbuchungen klären', Von:'Pascal', Art:'Nachricht', Anlass:'Chat', Status:'erledigt', Zeitstempel:vorTage(1), Beantwortet:vorTage(1), Text:'Doppelbuchungen klären', Postfach:[] };
var R4={ id:'r4', 'Gespräch':'bisheriger-verlauf-trainer', 'Gesprächstitel':'🗄️ Bisheriger Verlauf', Von:'Pascal', Art:'Nachricht', Anlass:'Chat', Status:'erledigt', Zeitstempel:vorTage(5), Text:'alt', Postfach:[] };
F7.lager['chatG:k-tr']={ ts:Date.now(), daten:[R4, R3, R1, R2], fehler:'' };
F7.lager['chatV:k-tr|g1']={ ts:Date.now(), daten:[R1, R2], fehler:'' };
F7.lager['chatG:k-pipe']={ ts:Date.now(), daten:[], fehler:'' };
var kd=S.karten.find(function(x){ return x.id==='t-dfm'; }), kp=S.karten.find(function(x){ return x.id==='t-priv'; });

// ══ §3 · Räume ══
var R=f12Raeume();
pruef('Raum-Reihenfolge: Trainerstab zuerst, dann in der Reihenfolge der App', R.map(function(r){ return r.name; }).join(',')==='Trainerstab,Sales,Marketing,DEV', R.map(function(r){ return r.name; }).join(','));
pruef('Kanäle je Raum: Trainerstab 2, Sales 1, Marketing 0, DEV 1', R[0].kanaele.length===2 && R[1].kanaele.length===1 && R[2].kanaele.length===0 && R[3].kanaele.length===1);
f12Ui().raum='Marketing'; f12Ui().kanal=null; f12Ui().gespraech=null;
var hm=f12RaumHtml();
pruef('Raum ohne Kanal: Chip grau, Hinweis „Noch kein Agent", Eingabe gesperrt', /data-f12raum="Marketing"/.test(hm) && /class="on grau" data-f12raum="Marketing"/.test(hm) && hm.indexOf('👥 Noch kein Agent in diesem Raum')>=0 && hm.indexOf('Kein Agent · Eingabe gesperrt')>=0, hm.slice(0,400));
f12Ui().raum='Trainerstab'; var ht=f12RaumHtml();
pruef('Trainerstab: Chip türkis, Rolle Querschnitt, Marke „Chats in Privat", ↗ Claude-Raum, Mitarbeiter · 2', ht.indexOf('class="on tk" data-f12raum="Trainerstab"')>=0 && ht.indexOf('Querschnitt · liest DFM und Privat')>=0 && ht.indexOf('🔒 Chats in Privat')>=0 && ht.indexOf('↗ Claude-Raum')>=0 && ht.indexOf('Mitarbeiter · 2')>=0);
pruef('Mitarbeiterzeile: Avatar 🏋️, letzte Zeile in Anführungszeichen, ungelesen 1; Zeit-Spezialist „noch kein Gespräch"', ht.indexOf('🏋️')>=0 && ht.indexOf('„Ja, Paket 34 ist um 12:13 Uhr angekommen.“')>=0 && /<span class="bd">1<\/span>/.test(ht) && ht.indexOf('Prüft Zeiten · noch kein Gespräch')>=0);
f12RaumWaehlen('Sales');
pruef('ein Kanal im Raum → direkt Stufe Agent', f12Ui().kanal==='k-pipe' && f12Stufe()==='agent', JSON.stringify([f12Ui().kanal, f12Stufe()]));
f12Ui().kanal='k-pipe'; f12Zurueck();
pruef('‹ aus der Stufe Agent eines Ein-Kanal-Raums schließt die Ebene', e1Art()===null);

// ══ §4 · Gesprächsliste ══
var ha=f12AgentHtml(KT);
var i=function(t){ return ha.indexOf(t); };
pruef('Gesprächsliste nach Tagen (Heute · Gestern · Älter), Bisheriger Verlauf ganz unten mit grauem Titel', i('Heute')>=0 && i('Heute')<i('Paket 34 angekommen?') && i('Paket 34 angekommen?')<i('>Gestern<') && i('>Gestern<')<i('Doppelbuchungen klären') && i('Doppelbuchungen klären')<i('>Älter<') && i('>Älter<')<i('Bisheriger Verlauf') && /class="alt"><div class="m"><p>🗄️ Bisheriger Verlauf/.test(ha), [i('Heute'), i('Paket 34 angekommen?'), i('>Gestern<'), i('Doppelbuchungen klären'), i('>Älter<'), i('Bisheriger Verlauf')].join(','));
pruef('Zeile: Unterzeile „Trainer: „…““, ungelesen 1, ＋ Neuer Chat, Kopf mit Raum und ↗', ha.indexOf('Trainer: „Ja, Paket 34 ist um 12:13 Uhr angekommen.“')>=0 && /<span class="bd">1<\/span>/.test(ha) && ha.indexOf('data-f12neu="1"')>=0 && ha.indexOf('🎯 Trainerstab')>=0 && ha.indexOf('data-f12link="1"')>=0);
var GL=f12Gespraeche(KT);
pruef('f12Gespraeche: Titel aus der ältesten Zeile, letzte Zeile, ungelesen, Karten', GL.length===3 && GL[0].gespraech==='g1' && GL[0].titel==='Paket 34 angekommen?' && GL[0].letzte.id==='r2' && GL[0].ungelesen===1 && GL[0].karten===0 && GL[2].verlauf===true);

// ══ §1.5 / §1.6 · Senden, Kennungen, Titel ══
_gesendet.length=0;
f12Senden(KT, 'g-neu', 'Hallo Welt\nzweite Zeile', { karten:[{ id:'t-dfm', titel:'DFM', airtableId:'recX' }], anhaenge:[{ id:'inb-1', name:'a.png' }] });
var g1=_gesendet[0];
pruef('neue Nachricht: Tabelle des Kanals, Von Pascal, Art Nachricht, Anlass Chat, Status offen, Gespräch, Titel = erste Zeile, Karten, Anhänge; keine Aufgaben im Privat-Kanal', g1 && g1.werkzeug==='datensatz_anlegen' && g1.args.tabelle==='Privat_Chat · Trainer' && g1.args.felder.Von==='Pascal' && g1.args.felder.Art==='Nachricht' && g1.args.felder.Anlass==='Chat' && g1.args.felder.Status==='offen' && g1.args.felder['Gespräch']==='g-neu' && g1.args.felder['Gesprächstitel']==='Hallo Welt' && g1.args.felder.Karten==='t-dfm' && g1.args.verknuepfungen['Anhänge'][0]==='inb-1' && !g1.args.verknuepfungen.Aufgaben && !!g1.args.felder.Zeitstempel, JSON.stringify(g1 && g1.args));
f12Senden(KT, 'g-neu', 'zweite Nachricht', {});
pruef('zweite Nachricht im selben Gespräch ohne Gesprächstitel', _gesendet.length===2 && _gesendet[1].args.felder['Gesprächstitel']===undefined);
pruef('lokale Vorab-Zeile im Lager (wartet auf Mac mini)', F7.lager['chatV:k-tr|g-neu'].daten.filter(function(r){ return r.lokal; }).length===2);
_gesendet.length=0; f12Senden(KP, 'g-dfm', 'x', { karten:[{ id:'t-dfm', titel:'DFM', airtableId:'recX' }] });
pruef('dfm-Kanal: Aufgaben = airtableId der Karte', _gesendet[0].args.tabelle==='Chat · Pipeline-Agent' && _gesendet[0].args.verknuepfungen.Aufgaben[0]==='recX');
pruef('Kennungen: Tages-Gespräch tag-<App-Tag>, Karten-Gespräch karte-<App-ID>, neues Gespräch UUID-artig', f12TagGespraech('2026-10-22')==='tag-2026-10-22' && f12KarteGespraech('t-dfm')==='karte-t-dfm' && /^[-a-z0-9]{10,}$/.test(f12NeuesGespraech()));
pruef('feste Titel: 📅 Tag Do 22.10. und 📇 <Kartentitel>', f12TagTitel('2026-10-22')==='📅 Tag Do 22.10.' && f12TitelFuer(KT, 'karte-t-dfm', 'egal')==='📇 '+kd.titel && f12TitelFuer(KT, 'g-x', 'Erste Zeile des Texts\nmehr')==='Erste Zeile des Texts');

// ══ §5.3 · Stand-Texte ══
var T=vorMin(2), L=vorMin(1), B=new Date(Date.parse(T)+92000).toISOString();
pruef('Stand lokal: wartet auf Mac mini', f12StandText(KT, { lokal:true, Status:'offen', Zeitstempel:T })==='wartet auf Mac mini');
pruef('Stand offen: Trainer empfängt · m:ss', /^Trainer empfängt · \d+:\d\d$/.test(f12StandText(KT, { Status:'offen', Zeitstempel:T })), f12StandText(KT, { Status:'offen', Zeitstempel:T }));
pruef('Stand vorgemerkt: Trainer denkt nach · m:ss (ab Laufstart)', /^Trainer denkt nach · \d+:\d\d$/.test(f12StandText(KT, { Status:'vorgemerkt', Zeitstempel:T, Laufstart:L })));
pruef('Stand erledigt: ✓ beantwortet HH:MM · gesamt 1:32', f12StandText(KT, { Status:'erledigt', Zeitstempel:T, Beantwortet:B })==='✓ beantwortet '+f12Uhrzeit(B)+' · gesamt 1:32', f12StandText(KT, { Status:'erledigt', Zeitstempel:T, Beantwortet:B }));
pruef('Stand abgelehnt: ✗ nicht bearbeitet', f12StandText(KT, { Status:'abgelehnt', Zeitstempel:T })==='✗ nicht bearbeitet');
pruef('Projekt-Agent: Name = Projektname', f12StandText(KH, { Status:'offen', Zeitstempel:T }).indexOf('HAWK empfängt')===0);
var hs=f12SchreibtHtml(KT, [{ id:'x', Von:'Pascal', Status:'vorgemerkt', Zeitstempel:T, Laufstart:L }]);
pruef('✍️-Zeile über der Eingabe mit Uhr und „(empfangen nach 1:00)"', hs.indexOf('✍️ Trainer denkt nach ·')>=0 && hs.indexOf('f12-uhr')>=0 && hs.indexOf('(empfangen nach 1:00)')>=0, hs);
pruef('f12Mmss formatiert Minuten:Sekunden', f12Mmss(92000)==='1:32' && f12Mmss(0)==='0:00' && f12Mmss(-5)==='0:00');

// ══ §5.2 · Listenzeilen ohne Knöpfe ══
var hn=f12NachrichtHtml(KT, { id:'a1', Von:'Trainer', Art:'Antwort', Text:'Zwei Wege:\n- A: direkt\n- B: Senke\nSchreib mir A oder B.', Zeitstempel:T, Postfach:[] });
pruef('Antwort: Liste als <ul>, keine Knöpfe (f7-act2) und keine data-f7chatantwort', hn.indexOf('<ul><li>A: direkt</li><li>B: Senke</li></ul>')>=0 && hn.indexOf('f7-act2')<0 && hn.indexOf('data-f7chatantwort')<0 && hn.indexOf('Schreib mir A oder B.')>=0, hn);
var hg=f12GespraechHtml(KT, 'g1');
pruef('Gespräch: Kopf mit Titel und Agent · Raum, eigener Scroller #chatList mit Innenblock, Stand, textarea, ➤', hg.indexOf('Paket 34 angekommen?')>=0 && hg.indexOf('🏋️ Trainer · 🎯 Trainerstab')>=0 && hg.indexOf('id="chatList"')>=0 && hg.indexOf('class="f12-fluss"')>=0 && hg.indexOf('✓ beantwortet')>=0 && hg.indexOf('<textarea id="f12Text"')>=0 && hg.indexOf('data-f12senden="1"')>=0 && hg.indexOf('data-f12plus="1"')>=0);

// ══ §5.5 · Karten im Chat ══
F12.pf['pf1']={ ts:Date.now(), r:{ id:'pf1', Titel:'Neu: Kalendertool-Dublette klären', Agent:'Trainer', Art:'Plan', Status:'offen', 'Output/Entwurf':'Aufgabe: Kalendertool-Dublette klären\n- Soll-Minuten: 20\n\nUnteraufgaben:\n- Dublette suchen\n- Löschen', geaendert_am:T } };
F12.pf['pf2']={ ts:Date.now(), r:{ id:'pf2', Titel:'Änderung: DFM Aufgabe', Agent:'Trainer', Art:'Plan', Status:'offen', 'Output/Entwurf':'Aufgabe: '+kd.titel+'\n- Soll-Minuten: 45\n- Karte-ID: t-dfm\n\nUnteraufgaben:\n- Offene Punkte vorab an Thao', geaendert_am:T } };
F12.pf['pf3']={ ts:Date.now(), r:{ id:'pf3', Titel:'Zielsteuerung: Vorschlag', Agent:'Scoring-Spezialist', Art:'Ziel', Status:'offen', 'Output/Entwurf':'Nur Text, keine Karte', geaendert_am:T } };
var A2={ id:'a2', Von:'Trainer', Art:'Antwort', Text:'Die Karte liegt unten zur Freigabe.', Zeitstempel:T, Postfach:[{ id:'pf1', anzeige:'x' },{ id:'pf2', anzeige:'y' },{ id:'pf3', anzeige:'z' }] };
var hk=f12KartenBloeckeHtml(KT, A2);
pruef('neue Karte: gelbe Zeile „NEUE KARTE · AUCH IM POSTFACH", Kartenzeile mit ▶ Titel ✓, „✗ Ablehnen"', hk.indexOf('📥 NEUE KARTE · AUCH IM POSTFACH')>=0 && hk.indexOf('data-f12pfstart="pf1"')>=0 && hk.indexOf('data-f12pffrei="pf1"')>=0 && hk.indexOf('Kalendertool-Dublette klären')>=0 && hk.indexOf('DFM · 20 Min · 2 Unteraufgaben')>=0 && /data-f12pfablehnen="pf1"><b>✗<\/b> Ablehnen/.test(hk) && hk.indexOf('Besprechen')<0, hk.slice(0,600));
pruef('Änderung: „ÄNDERUNG AN DEINER KARTE", ✏️ im Titel, Diff alt durchgestrichen → neu gelb, neue Unteraufgabe', hk.indexOf('✏️ ÄNDERUNG AN DEINER KARTE')>=0 && hk.indexOf('✏️ '+esc(kd.titel))>=0 && hk.indexOf('Soll <s>30</s> → <em>45 Min</em>')>=0 && hk.indexOf('neu: <em>„Offene Punkte vorab an Thao“</em>')>=0);
pruef('ohne Kartenformat: Zeile 📥 <Titel> im Stil f7-info, öffnet das Postfach', /<div class="f7-info" data-f7pfoeffnen="1">📥 Zielsteuerung: Vorschlag<\/div>/.test(hk));
var nVor=S.karten.length; _gesendet.length=0;
var kNeu=f12PfFreigeben('pf1', false);
pruef('✓ legt die Karte an (Kette), Postfach-Datensatz erledigt/freigegeben, Zeile zeigt „✓ freigegeben … angelegt · Kette Platz"', !!kNeu && S.karten.length===nVor+1 && kNeu.titel==='Kalendertool-Dublette klären' && ketteHat(kNeu.id) && _gesendet.some(function(g){ return g.werkzeug==='datensatz_aendern' && g.args.tabelle==='Postfach' && g.args.id==='pf1' && g.args.felder.Status==='erledigt' && g.args.felder.Entscheidung==='freigegeben'; }) && F12.pf.pf1.r.Status==='erledigt' && /✓ freigegeben .* · angelegt · Kette Platz \d+/.test(f12KartenBloeckeHtml(KT, A2)), f12KartenBloeckeHtml(KT, A2).slice(0,500));
F12.pf['pf2'].r.Status='erledigt'; F12.pf['pf2'].r.Entscheidung='abgelehnt'; F12.pf['pf2'].r.Ablehnungsgrund='30 Min reichen'; F12.pf['pf2'].r.geaendert_am=T;
var hk2=f12KartenBloeckeHtml(KT, A2);
pruef('Entscheidung im Postfach erscheint im Chat: ✗ abgelehnt <Uhrzeit> im Postfach · „Grund", Zeile gedimmt, Überschrift grau', hk2.indexOf('✗ abgelehnt '+f12Uhrzeit(T)+' im Postfach · „30 Min reichen“')>=0 && /kl-z weg/.test(hk2) && /class="lab grau">✏️ ÄNDERUNG</.test(hk2), hk2.slice(0,700));
_gesendet.length=0; f12PfAblehnen('pf3');
pruef('✗ Ablehnen öffnet das Blatt mit Pflicht-Grund (wie im Postfach), auch für Datensätze außerhalb des Lagers', el('sheetBody').innerHTML.indexOf('f7pfGrund')>=0 && el('sheetBody').innerHTML.indexOf('Zielsteuerung: Vorschlag')>=0, el('sheetBody').innerHTML.slice(0,200)); closeSheet();

// ══ §6 · Eingabe ══
_els.f12Text={ style:{}, scrollHeight:35, value:'' };
f12EingabeHoehe(); var h1=_els.f12Text.style.height;
_els.f12Text.scrollHeight=182; f12EingabeHoehe(); var h8=_els.f12Text.style.height, o8=_els.f12Text.style.overflowY;
_els.f12Text.scrollHeight=300; f12EingabeHoehe(); var h9=_els.f12Text.style.height, o9=_els.f12Text.style.overflowY;
pruef('Eingabe: 1 Zeile 35 px · 8 Zeilen 182 px ohne Laufleiste · mehr als 8 Zeilen bleibt 182 px, Text scrollt im Feld', h1==='35px' && h8==='182px' && o8==='hidden' && h9==='182px' && o9==='auto', [h1,h8,o8,h9,o9].join(' '));
pruef('Return = Zeilenumbruch: kein Enter-Handler auf dem Chat-Feld, textarea statt input', src.indexOf("e.target.id==='f7chatText'")<0 && src.indexOf("e.target.id==='f12Text'")<0 && f12EingabeHtml(KT, { text:'', karten:[], anhaenge:[] }).indexOf('<textarea id="f12Text" rows="1"')>=0);
var he=f12EingabeHtml(KT, { text:'', karten:[{ id:'t-dfm', titel:'DFM' }], anhaenge:[{ id:'inb-1', name:'Screenshot.png' }] });
pruef('Marken über dem Feld mit ✕, ➤ aktiv bei Marken ohne Text; grau ohne alles', he.indexOf('📇 DFM<em data-f12markeweg="karte:t-dfm">✕</em>')>=0 && he.indexOf('📎 Screenshot.png<em data-f12markeweg="anhang:inb-1">✕</em>')>=0 && he.indexOf('class="se"')>=0 && f12EingabeHtml(KT, { text:'', karten:[], anhaenge:[] }).indexOf('class="se aus"')>=0);
var hb=f12NachrichtHtml(KT, { id:'p1', Von:'Pascal', Art:'Nachricht', Status:'offen', Zeitstempel:T, Text:'Bitte einplanen', Karten:'t-dfm', 'Anhänge':[{ id:'inb-1', anzeige:'Screenshot.png' }] });
pruef('gesendete Nachricht zeigt ihre Marken in der Blase; 📇 öffnet die Karte', hb.indexOf('<span data-f12karte="t-dfm">📇 '+esc(kd.titel)+'</span>')>=0 && hb.indexOf('<span class="anh">📎 Screenshot.png</span>')>=0);
f12Ui().kanal='k-tr'; f12Ui().gespraech='g1'; var E=f12EntwurfAktuell(); E.text='Entwurf bleibt'; E.karten=[{ id:'t-dfm', titel:'DFM' }];
f12Ui().gespraech='g2'; f12Ui().gespraech='g1';
pruef('Entwurf bleibt je Gespräch erhalten (Text und Marken)', f12EntwurfAktuell().text==='Entwurf bleibt' && f12EntwurfAktuell().karten.length===1);

// ══ §7 · ＋ Kontext ══
f12Ui().kanal='k-tr'; f12Ui().gespraech='g1'; delete f12Ui().entwurf[f12EntwurfKey('k-tr','g1')];
f12KontextOeffnen();
pruef('＋ öffnet die Ebene kontextwahl mit Segment Suche', e1Art()==='kontextwahl' && f12Kw().seg==='suche' && f12Kw().auswahl.length===0);
pruef('Kontext wählen: ＋ nimmt die Karte auf, erneut tippen nimmt sie heraus', f12KwToggle('t-dfm')===true && f12Kw().auswahl.length===1 && f12KwToggle('t-dfm')===true && f12Kw().auswahl.length===0);
if(!ketteHat('t-dfm')) ketteToggle('t-dfm');   // die Kettenliste zeigt aufgeklappt nur die Aktuelle Kette
f12KwToggle('t-dfm'); f12KwSegment('projekte'); var n1=f12Kw().auswahl.length; f12KwSegment('abteilungen'); f12KwSegment('suche');
pruef('Auswahl bleibt beim Wechsel der Segmente erhalten', n1===1 && f12Kw().auswahl.length===1 && f12Kw().seg==='suche');
var hw=f12KontextHtml();
pruef('Kontextwahl: Kopf „＋ Kontext · für 🏋️ Trainer · <Titel>", Fertig (1), Segmente, Treffer mit ＋ bzw. ✓ statt ▶, gewählte Zeile markiert', hw.indexOf('＋ Kontext<small>für 🏋️ Trainer · Paket 34 angekommen?')>=0 && hw.indexOf('Fertig (1)')>=0 && hw.indexOf('data-f12seg="datei"')>=0 && hw.indexOf('data-klplay=')<0 && hw.indexOf('class="kl-add on" data-f12add="t-dfm"')>=0 && hw.indexOf(' gew"')>=0, hw.slice(0,500));
F7.lager['aufg:p9']={ ts:Date.now(), daten:[{ id:'fs-1', Titel:'PENELOPE: Evaluierung', Status:'Offen', Deadline:'2026-10-10', 'Soll-Minuten':480, Matrixfeld:null }], fehler:'' };
f12Kw().suche='penel'; var hw2=f12KontextHtml();
pruef('Freitext: Block „Lager · FocusSystem" mit Aufgaben aus dem Lager, ＋ rechts', hw2.indexOf('Lager · FocusSystem · 1')>=0 && hw2.indexOf('data-f12add="fs-1"')>=0 && hw2.indexOf('PENELOPE: Evaluierung')>=0, hw2.slice(hw2.indexOf('Lager'), hw2.indexOf('Lager')+300));
pruef('Lager-Karte wird als Auswahl mit FocusSystem-id aufgenommen', f12KwToggle('fs-1') && f12Kw().auswahl.some(function(k){ return k.id==='fs-1' && k.fsId==='fs-1'; }));
f12KwFertig();
pruef('Fertig übernimmt die Auswahl als Marken in den Entwurf und kehrt ins Gespräch zurück', e1Art()==='chat' && f12EntwurfAktuell().karten.length===2 && f12Kw().auswahl.length===0);
e1Oeffnen('kontextwahl');
pruef('private Karten erscheinen in der Kontextwahl nur im Privat-Kanal', kartenZeileHtml(kp).length>0 && (function(){ f12Ui().kanal='k-pipe'; var leer=kartenZeileHtml(kp)===''; var dfm=kartenZeileHtml(kd).length>0; f12Ui().kanal='k-tr'; return leer && dfm; })());
e1Schliessen();

// ══ §8 · Datei über Erfassen ══
var _toasts=[], _toastAlt=toast; toast=function(m){ _toasts.push(String(m)); };
f12Ui().kanal='k-tr'; f12Ui().gespraech='g1'; delete f12Ui().entwurf[f12EntwurfKey('k-tr','g1')];
var C={ tabelle:'Privat_Chat · Trainer', gespraech:'g1', agent:'Trainer', name:'Trainer', avatar:'🏋️', titel:'Paket 34 angekommen?' };
f12ErfassenUebernehmen(C, { sofort:true, antwort:{ inbox:'inb-9' } }, 'Daily mit Thao', { name:'Screenshot 12.28.png' });
var E8=f12Entwurf('k-tr','g1');
pruef('Datei mit Inbox-id: Marke „📎 <Dateiname>" im Entwurf, Text angehängt, zurück im Gespräch', E8.anhaenge.length===1 && E8.anhaenge[0].id==='inb-9' && E8.anhaenge[0].name==='Screenshot 12.28.png' && E8.text==='Daily mit Thao' && e1Art()==='chat');
f12ErfassenUebernehmen(C, { wartend:true, id:'q1' }, 'ohne Verbindung', null);
pruef('ohne Inbox-id (Warteschlange): Toast, keine Marke', E8.anhaenge.length===1 && _toasts.some(function(t){ return /Datei wartet auf den Mac mini/.test(t); }), _toasts.join(' | '));
e1Oeffnen('erfassen', { chat:C }); var hf=f7ErfassenHtml();
pruef('Erfassen im Chat-Betrieb: Kopf „📎 Datei", Mail-Weg ausgegraut, fester Bezug, Knopf „In die Nachricht übernehmen", Hinweis', hf.indexOf('📎 Datei<small>für 🏋️ Trainer · Paket 34 angekommen?')>=0 && /data-f7quelle="mail"/.test(hf) && / aus" data-f7quelle="mail"/.test(hf) && hf.indexOf('💬 Gespräch „Paket 34 angekommen?“ mit dem Trainer · Ablage über den Erfassungs-Agenten')>=0 && hf.indexOf('In die Nachricht übernehmen')>=0 && hf.indexOf('data-f7bezug=')<0 && hf.indexOf('darf sie lesen')>=0, hf.slice(0,600));
_gesendet.length=0; F7.erf=null; f7Erf().text='Text aus Erfassen'; f7Erf().datei={ name:'Screenshot.png', typ:'image/png', groesse:1024, base64:'AAAA' };   // das Textfeld ist im jsc-DOM leer, die Datei trägt den Eintrag
f7ErfassenSenden();
var ge=_gesendet.filter(function(g){ return g.werkzeug==='app:erfassen'; })[0];
pruef('Übernehmen sendet app:erfassen mit Bezug chat (Tabelle, Gespräch, Agent)', !!ge && ge.args.bezug.art==='chat' && ge.args.bezug.tabelle==='Privat_Chat · Trainer' && ge.args.bezug.gespraech==='g1' && ge.args.bezug.name==='Trainer', JSON.stringify(ge && ge.args.bezug));
e1Schliessen(); toast=_toastAlt;

// ══ §9 · Einstiege ══
pruef('alte Chat-Funktionen entfernt (f7ChatSenden, f7ChatOeffnen, f7ChatLaden, f7ChatHtml, f3n*)', src.indexOf('f7ChatSenden(')<0 && src.indexOf('f7ChatOeffnen(')<0 && src.indexOf('f7ChatLaden(')<0 && src.indexOf('f7ChatHtml')<0 && !/f3n[A-Z]\w*\(/.test(src));
['Pause','Kommentar','Schiebe-Grund','Feedback','Reflexion','Tagesplan'].forEach(function(a){ pruef('Einstieg mit Anlass '+a+' schreibt über f12TrainerSenden', new RegExp("f12TrainerSenden\\([^;]*anlass:'"+a+"'").test(src)); });
pruef('Trainer-Knopf und „💬 Trainer" öffnen die Stufe Raum Trainerstab', /el\('trainerFab'\)\.addEventListener\('click', \(\)=>\{ haptik\(8\); f12Oeffnen\(\{ raum:'Trainerstab', kanal:null, gespraech:null \}\); \}\);/.test(src) && src.indexOf("else if(a==='chat') f12Oeffnen({ raum:'Trainerstab', kanal:null, gespraech:null });")>=0);
_gesendet.length=0; delete F7.lager['chatV:k-tr|'+f12TagGespraech()];
f12TrainerSenden('☕ Pause (20 Min.): kurz raus', { anlass:'Pause', karte:kd });
var gp=_gesendet[0];
pruef('interne Nachricht: Trainer-Kanal, Tages-Gespräch, Titel 📅 Tag …, Anlass Pause, Karten = App-ID', gp.args.tabelle==='Privat_Chat · Trainer' && gp.args.felder['Gespräch']===f12TagGespraech() && gp.args.felder['Gesprächstitel']===f12TagTitel() && gp.args.felder.Anlass==='Pause' && gp.args.felder.Karten==='t-dfm' && gp.args.felder.Von==='Pascal', JSON.stringify(gp.args.felder));
f12TrainerSenden('✓ Kommentar', { anlass:'Kommentar' });
pruef('zweite interne Nachricht desselben Tags ohne Titel', _gesendet[1].args.felder['Gesprächstitel']===undefined && _gesendet[1].args.felder.Anlass==='Kommentar');
f12TrainerOeffnen('Plan heute ändern: ', { karte:kd });
pruef('Chat mit Vorlage: Stufe Gespräch Trainer, Tages-Gespräch, Vorlage als Entwurf, Karte als Marke', e1Art()==='chat' && f12Stufe()==='gespraech' && f12Ui().kanal==='k-tr' && f12Ui().gespraech===f12TagGespraech() && f12EntwurfAktuell().text==='Plan heute ändern: ' && f12EntwurfAktuell().karten.some(function(k){ return k.id==='t-dfm'; }));
pruef('Karten-Chat-Routing: privat → Trainer · Projekt HAWK → Projekt-Agent HAWK · Projekt Sonst (Sales) → Pipeline-Agent · unbekanntes Projekt → Trainer', f12KartenKanal(kp).id==='k-tr' && f12KartenKanal({ domain:'dfm', projekt:'HAWK' }).id==='k-hawk' && f12KartenKanal({ domain:'dfm', projekt:'Sonst' }).id==='k-pipe' && f12KartenKanal({ domain:'dfm', projekt:'Nix' }).id==='k-tr');
kd.projekt='HAWK'; saveKarten(); f12KartenChat('t-dfm');
pruef('💬 zur Karte öffnet karte-<App-ID> im Kanal des Projekt-Agenten mit der Karte als Marke', e1Art()==='chat' && f12Ui().kanal==='k-hawk' && f12Ui().gespraech==='karte-t-dfm' && f12EntwurfAktuell().karten.some(function(k){ return k.id==='t-dfm'; }));
F7.lager['chatG:k-tr'].daten.push({ id:'r9', 'Gespräch':f12TagGespraech(), Von:'Trainer', Art:'Antwort', Anlass:'Planänderung', Status:'offen', Zeitstempel:jetztIso(), Text:'Senke verschoben' },{ id:'r10', 'Gespräch':f12TagGespraech(), Von:'Trainer', Art:'Antwort', Anlass:'Feedback', Status:'offen', Zeitstempel:jetztIso(), Text:'Gut gemacht' });
pruef('Plan und Tagesübergang lesen aus dem Trainer-Kanal (Anlass Planänderung bzw. Feedback, heute)', f12TrainerZeilenHeute('Planänderung').length===1 && f12TrainerZeilenHeute('Planänderung')[0].Text==='Senke verschoben' && f12TrainerZeilenHeute('Feedback').slice(-1)[0].Text==='Gut gemacht');
e1Schliessen();

// ══ §10 · Badge ══
function fabAttrappe(){ var kinder=[]; return { kinder:kinder, style:{}, classList:{add:function(){},remove:function(){},toggle:function(){},contains:function(){return false;}}, addEventListener:function(){},
  appendChild:function(c){ c.remove=function(){ var i=kinder.indexOf(c); if(i>=0) kinder.splice(i,1); }; kinder.push(c); },
  querySelector:function(sel){ var cls=sel.replace(/^\./,'').split('.'); for(var i=0;i<kinder.length;i++){ var c=String(kinder[i].className||'').split(/\s+/); if(cls.every(function(x){ return c.indexOf(x)>=0; })) return kinder[i]; } return null; } }; }
_els.trainerFab=fabAttrappe();
F12.badge={ 'k-tr':2, 'k-pipe':3, 'k-hawk':0 }; f12BadgeZeigen();
pruef('Badge = Summe über alle Kanäle (5) am Trainer-Knopf', f12BadgeSumme()===5 && el('trainerFab').querySelector('.badge.chat') && el('trainerFab').querySelector('.badge.chat').textContent==='5');
F12.badge={}; f12BadgeZeigen();
pruef('Badge verschwindet bei 0', !el('trainerFab').querySelector('.badge.chat'));
pruef('Benachrichtigung: Titel = Agent, nur außerhalb des Chats und nicht stumm (Quelle)', /new Notification\(String\(kanal\.Agent\|\|'Agent'\)/.test(src) && src.indexOf("if(S.settings.chatStumm || e1Art()==='chat') return;")>=0);

// ══ §11 · Statistik nach Abteilung ══
var heute=heuteApp();
_f6Claude={ ts:Date.now(), laeuft:false, fehler:'', rows:[
  { id:'l1', Lauf:'l1', Zeit:heute+'T08:00:00Z', Start:heute+'T08:00:00Z', Agent:'Trainer', 'Auslöser':'Chat', 'Dauer (s)':60, 'Tokens ein':1000, 'Tokens aus':100, Abteilung:'Trainerstab', Kanal:'Privat_Chat · Trainer' },
  { id:'l2', Lauf:'l2', Zeit:heute+'T08:10:00Z', Start:heute+'T08:10:00Z', Agent:'Pipeline-Agent', 'Auslöser':'Takt', 'Dauer (s)':120, 'Tokens ein':2000, 'Tokens aus':200, Abteilung:'Sales', Kanal:'' },
  { id:'l3', Lauf:'l3', Zeit:heute+'T08:20:00Z', Start:heute+'T08:20:00Z', Agent:'Pipeline-Agent', 'Auslöser':'Auftrag', 'Dauer (s)':30, 'Tokens ein':500, 'Tokens aus':50, Abteilung:'Sales', Kanal:'' },
  { id:'l4', Lauf:'l4', Zeit:heute+'T08:30:00Z', Start:heute+'T08:30:00Z', Agent:'Dienst', 'Auslöser':'live', 'Dauer (s)':5, 'Tokens ein':0, 'Tokens aus':0, Abteilung:null, Kanal:'' } ] };
S.ui.f6Auf=Object.assign({}, S.ui.f6Auf, { claude:true });   // Erklärung aufgeklappt
var hc=f6Claude(analyseFenster(), f6Dom());
pruef('Statistik: Liste je Abteilung (Sales, Trainerstab, ohne Abteilung), gestapelt nach Auslöser mit Legende Takt · Auftrag · Chat · live', hc.indexOf('data-f6auf="claude:Sales"')>=0 && hc.indexOf('data-f6auf="claude:Trainerstab"')>=0 && hc.indexOf('ohne Abteilung')>=0 && hc.indexOf('#2dd4bf')>=0 && hc.indexOf('>Takt<')>=0 && hc.indexOf('>Auftrag<')>=0 && hc.indexOf('>Chat<')>=0 && hc.indexOf('live (alte Zeilen)')>=0, hc.slice(hc.indexOf('f6-ag'), hc.indexOf('f6-ag')+400));
pruef('Statistik: Sales zählt 2 Läufe, 2:30 Laufzeit; Chat-Antwortzeit heute Ø 1:00 · Ø 1:00', /claude:Sales"[^]*?<span>2 · /.test(hc) && hc.indexOf('Chat-Antwortzeit heute')>=0 && hc.indexOf('Ø 1:00 · Ø 1:00')>=0, hc.slice(hc.indexOf('Chat-Antwortzeit')-120, hc.indexOf('Chat-Antwortzeit')+60));
S.ui.f6Auf=Object.assign({}, S.ui.f6Auf, { 'claude:Sales':true }); var hc2=f6Claude(analyseFenster(), f6Dom());
pruef('Tipp klappt die Agenten der Abteilung auf', hc2.indexOf('▾ Sales')>=0 && hc2.indexOf('padding-left:14px">Pipeline-Agent')>=0);
pruef('Verlauf 14 Tage je Abteilung mit Legende; Erklärung nennt Abteilung, Kanal und die vier Auslöser', hc.indexOf('Läufe · 14 Tage · je Abteilung')>=0 && hc.indexOf('<b>Auslöser:</b> Takt')>=0 && hc.indexOf('<b>Kanal</b>')>=0 && src.indexOf("versatz<4900")>=0 && src.indexOf("'Abteilung','Kanal']")>=0);


// ══ Hotfix 13 ══
function klick13(attr, wert){ var ds={}; ds[attr.replace(/^data-/,'').replace(/-([a-z0-9])/g, function(m,c){ return c.toUpperCase(); })]=wert||'1';
  var ziel={ dataset:ds, classList:{ contains:function(){ return false; } } };
  return f7Klick({ stopPropagation:function(){}, stopImmediatePropagation:function(){}, preventDefault:function(){}, target:{ closest:function(sel){ return (sel==='['+attr+']' || sel==='#e1-chat') ? ziel : null; } } }); }
// §2.1 · f7Lager meldet nur neue Daten
var _neuAlt=f7Neu, _neuRufe=[]; f7Neu=function(k){ _neuRufe.push(k||null); };
F7.lager['probe:a']={ ts:0, daten:[{ id:1 }], fehler:'' };
FSLive.lesen=function(){ return Promise.resolve({ datensaetze:[{ id:1 }] }); };
f7Lager('probe:a', 1000, function(){ return f7Alle({ tabelle:'X' }); }); warten(); warten(); warten();
pruef('§2.1 · gleiche Daten → kein f7Neu', _neuRufe.length===0 && F7.lager['probe:a'].ts>0, JSON.stringify(_neuRufe));
F7.lager['probe:a'].ts=0; FSLive.lesen=function(){ return Promise.resolve({ datensaetze:[{ id:2 }] }); };
f7Lager('probe:a', 1000, function(){ return f7Alle({ tabelle:'X' }); }); warten(); warten(); warten();
pruef('§2.1 · neue Daten → f7Neu mit dem Lager-Schlüssel', _neuRufe.length===1 && _neuRufe[0]==='probe:a', JSON.stringify(_neuRufe));
F7.lager['probe:a'].ts=0; FSLive.lesen=function(){ return Promise.reject(new Error('kaputt')); }; _neuRufe.length=0;
f7Lager('probe:a', 1000, function(){ return f7Alle({ tabelle:'X' }); }); warten(); warten(); warten();
f7Lager('probe:a', 0, function(){ return f7Alle({ tabelle:'X' }); }); warten(); warten(); warten();
pruef('§2.1 · Fehler: f7Neu nur beim ersten (neuen) Fehlertext', _neuRufe.length===1 && F7.lager['probe:a'].fehler==='kaputt', JSON.stringify(_neuRufe));
f7Neu=_neuAlt; fsliveStumm();
// §2.2 · Zusammenfassen: höchstens ein Nachlauf je 400 ms
var _stAlt=setTimeout, _timer=[]; setTimeout=function(f, ms){ _timer.push({ f:f, ms:ms }); return _timer.length; };
var _e1Alt=e1Rendern, _e1N=0; e1Rendern=function(){ _e1N++; };
F7.neuT=null; F7.neuSchluessel=null; F7.letzteEingabe=0; F7.letzteEingabeEnde=0; F7.fingerUnten=0;
f12Oeffnen({ raum:'Trainerstab', kanal:'k-tr', gespraech:null }); _e1N=0;
f7Neu('a'); f7Neu('b'); f7Neu('c');
pruef('§2.2 · drei Anforderungen → ein Nachlauf nach 400 ms, Schlüssel gesammelt', _timer.length===1 && _timer[0].ms===400 && F7.neuSchluessel.join(',')==='a,b,c', JSON.stringify([_timer.length, F7.neuSchluessel]));
_timer[0].f(); pruef('§2.2 · der Nachlauf zeichnet genau einmal', _e1N===1 && F7.neuT===null, _e1N);
// §2.3 · Verschieben bei Eingabe
_timer.length=0; _e1N=0; F7.letzteEingabe=Date.now(); f7Neu('x'); _timer[0].f();
pruef('§2.3 · pointerdown vor < 800 ms → kein Neuaufbau, Nachlauf in 300 ms', _e1N===0 && _timer.length===2 && _timer[1].ms===300, JSON.stringify([_e1N, _timer.map(function(t){ return t.ms; })]));
F7.letzteEingabe=0; F7.fingerUnten=1; _timer[1].f(); pruef('§2.3 · Finger unten → weiter warten', _e1N===0 && _timer.length===3);
F7.fingerUnten=0; F7.letzteEingabeEnde=0; _timer[2].f(); pruef('§2.3 · Eingabe vorbei → Neuaufbau', _e1N===1);
// §2.4 · Blatt nur bei angemeldeten Schlüsseln
var _soAlt=sheetOffen; sheetOffen=function(){ return true; }; var _blN=0; F7.blattNeu=function(){ _blN++; }; F7.blattSchluessel=['postfach'];
F7.neuT=null; f7Neu('chatV:k-tr|g1'); _timer[_timer.length-1].f();
pruef('§2.4 · Chat-Lager zeichnet das Blatt nicht', _blN===0);
F7.neuT=null; f7Neu('postfach'); _timer[_timer.length-1].f();
pruef('§2.4 · angemeldeter Schlüssel zeichnet das Blatt', _blN===1);
closeSheet(); pruef('§2.4 · Schließen leert blattNeu und blattSchluessel', F7.blattNeu===null && F7.blattSchluessel.length===0);
sheetOffen=_soAlt; e1Rendern=_e1Alt; setTimeout=_stAlt; F7.neuT=null;
pruef('§2.5 · Badge-Laden ruft kein f7Neu und zeichnet keine Ebene (Quelle)', !/function f12BadgeLaden[\s\S]*?f7Neu\(/.test(src.slice(src.indexOf('function f12BadgeLaden'), src.indexOf('function f12BadgeSumme'))) && src.indexOf("l.outerHTML=f12LeisteHtml(r, f12Ui().raum)")<0);
// §3 · Entscheidung aus dem Postfach im Chat
f12Ui().kanal='k-tr'; f12Ui().gespraech='g1';
F12.pf['pf7']={ ts:Date.now(), r:{ id:'pf7', Titel:'Neu: X', Agent:'Trainer', Art:'Plan', Status:'offen', 'Output/Entwurf':'Aufgabe: X\n- Soll-Minuten: 10' } };
F12.pf['pf8']={ ts:Date.now(), r:{ id:'pf8', Titel:'Neu: Y', Agent:'Trainer', Art:'Plan', Status:'offen', 'Output/Entwurf':'Aufgabe: Y\n- Soll-Minuten: 10' } };
delete F12.entschieden.pf7; delete F12.entschieden.pf8;
f7PfEntscheiden('pf7', 'abgelehnt', { felder:{ Ablehnungsgrund:'nicht heute' } });
var A7={ id:'a7', Von:'Trainer', Art:'Antwort', Text:'x', Zeitstempel:T, Postfach:[{ id:'pf7', anzeige:'x' },{ id:'pf8', anzeige:'y' }] }, h7=f12KartenBloeckeHtml(KT, A7);
pruef('§3.1 · Entscheidung im Postfach: Chat-Lager erledigt/abgelehnt mit Grund und Zeit, Zeile zeigt „im Postfach"', F12.pf.pf7.r.Status==='erledigt' && F12.pf.pf7.r.Entscheidung==='abgelehnt' && F12.pf.pf7.r.Ablehnungsgrund==='nicht heute' && !!F12.pf.pf7.r.geaendert_am && !F12.entschieden.pf7 && h7.indexOf('✗ abgelehnt')>=0 && h7.indexOf('im Postfach · „nicht heute“')>=0, h7.slice(0,400));
f12PfAblehnen('pf8'); closeSheet(); f7PfEntscheiden('pf8', 'abgelehnt', { felder:{ Ablehnungsgrund:'im Chat' } });
pruef('§3.1 · Ablehnen aus dem Chat gilt als im Chat entschieden (kein „im Postfach")', F12.entschieden.pf8===true && f12KartenBloeckeHtml(KT, A7).indexOf('im Postfach · „im Chat“')<0 && f12KartenBloeckeHtml(KT, A7).indexOf('· „im Chat“')>=0);
F12.pf['pf9']={ ts:Date.now(), r:{ id:'pf9', Titel:'Neu: Z', Status:'offen', 'Output/Entwurf':'Aufgabe: Z' } };
F7.lager['chatV:k-tr|g1']={ ts:Date.now(), daten:[R1, R2, { id:'a9', Von:'Trainer', Art:'Antwort', Text:'z', Zeitstempel:T, Postfach:[{ id:'pf9', anzeige:'z' },{ id:'pf7', anzeige:'x' }] }], fehler:'' };
f12PfNachlesen(KT, 'g1');
pruef('§3.2 · Nachlesen liest offene Postfach-Datensätze neu (ts 0), erledigte nicht', F12.pf.pf9.ts===0 && F12.pf.pf7.ts>0 && src.indexOf('if(F12.nachladenTick%2===0) f12PfNachlesen(kanal, g);')>=0);
// §4 · Marken: Ablauf Trainer → Neuer Chat → ＋ → zwei Karten → Fertig → 📎 → Datei → Übernehmen → ➤
f12Ui().kanal='k-tr'; f12Ui().gespraech=null; f12Ui().entwurf={};
klick13('data-f12neu'); var G=f12Ui().gespraech, K0=f12EntwurfKey('k-tr', G);
pruef('§4 · ＋ Neuer Chat vergibt die Gesprächs-Kennung', !!G && f12Stufe()==='gespraech');
klick13('data-f12plus');
pruef('§4 · ＋ öffnet die Kontextwahl, Kennung bleibt, nichts vorausgewählt', e1Art()==='kontextwahl' && f12Ui().gespraech===G && f12Kw().auswahl.length===0);
f12KwToggle('t-dfm'); f12KwToggle('t-priv'); f12KwFertig();
var E4=f12Entwurf('k-tr', G);
pruef('§4 · Fertig: zwei Karten als Marken im Entwurf, zurück im Gespräch, Kennung unverändert', e1Art()==='chat' && f12Ui().gespraech===G && E4.karten.length===2 && f12MarkenHtml(E4).split('📇').length===3, JSON.stringify([e1Art(), E4.karten.length]));
f12KontextOeffnen();
pruef('§4 · erneutes ＋ zeigt die Karten des Entwurfs ausgewählt', f12Kw().auswahl.length===2 && f12KontextHtml().indexOf('Fertig (2)')>=0);
f12KwToggle('t-priv'); f12KwFertig();
pruef('§4 · Fertig übernimmt die Auswahl vollständig (abgewählte Karte weg)', f12Entwurf('k-tr', G).karten.length===1 && f12Entwurf('k-tr', G).karten[0].id==='t-dfm');
f12KontextOeffnen(); f12KwToggle('t-priv'); klick13('data-f12kwzurueck');
pruef('§4 · ‹ ohne Fertig lässt den Entwurf unverändert', e1Art()==='chat' && f12Entwurf('k-tr', G).karten.length===1);
f12ErfassenUebernehmen({ tabelle:'Privat_Chat · Trainer', gespraech:G, agent:'Trainer', name:'Trainer', avatar:'🏋️', titel:'Neu' }, { sofort:true, antwort:{ inbox:'inb-4' } }, 'Dateitext', { name:'Foto.png' });
E4=f12Entwurf('k-tr', G);
pruef('§4 · Datei: Marke 📎 im Entwurf, Text angehängt, Kennung unverändert', E4.anhaenge.length===1 && E4.anhaenge[0].name==='Foto.png' && E4.text==='Dateitext' && f12Ui().gespraech===G && f12MarkenHtml(E4).indexOf('📎 Foto.png')>=0);
_gesendet.length=0; f12Abschicken();
var g4=_gesendet.filter(function(g){ return g.werkzeug==='datensatz_anlegen'; })[0];
pruef('§4 · Senden schreibt Karten (App-IDs) und Anhänge (Inbox-ids), Entwurf danach leer', !!g4 && g4.args.felder.Karten==='t-dfm' && g4.args.verknuepfungen['Anhänge'][0]==='inb-4' && g4.args.felder['Gespräch']===G && !f12Ui().entwurf[K0], JSON.stringify(g4 && g4.args));
var zl=F7.lager[f12VerlaufKey(KT, G)].daten.filter(function(r){ return r.lokal; })[0];
pruef('§4 · die Blase zeigt die Marken (lokal aus dem Entwurf, nach dem Laden aus Karten und Anhänge)', f12NachrichtHtml(KT, zl).indexOf('📇 '+esc(kd.titel))>=0 && f12NachrichtHtml(KT, zl).indexOf('📎 Foto.png')>=0 && f12NachrichtHtml(KT, { id:'s1', Von:'Pascal', Art:'Nachricht', Status:'erledigt', Zeitstempel:T, Text:'x', Karten:'t-dfm', 'Anhänge':[{ id:'inb-4', anzeige:'Foto.png' }] }).indexOf('📎 Foto.png')>=0);
e1Schliessen();
// §5 · Ungelesen auf jeder Stufe
var jetztU=jetztIso();
F12.ungelesen={ 'k-tr':[{ id:'u1', Text:'Neue Antwort vom Trainer, die etwas laenger ist, damit die Unterzeile gekuerzt wird und so weiter', Von:'Trainer', 'Gespräch':'g1', 'Gesprächstitel':null, Zeitstempel:vorMin(5) }], 'k-pipe':[{ id:'u2', Text:'Deal-Info', Von:'Pipeline-Agent', 'Gespräch':'gp', 'Gesprächstitel':'Deal X', Zeitstempel:jetztU },{ id:'u3', Text:'Nachtrag', Von:'Pipeline-Agent', 'Gespräch':'gp', 'Gesprächstitel':null, Zeitstempel:vorMin(1) }] };
F12.badge={ 'k-tr':1, 'k-pipe':2 };
var UL=f12UngelesenListe();
pruef('§5 · Liste je Gespräch, neueste oben, Titel aus Zeile bzw. Gespräche-Lager, Zahl je Gespräch', UL.length===2 && UL[0].gespraech==='gp' && UL[0].n===2 && UL[0].titel==='Deal X' && UL[1].titel==='Paket 34 angekommen?' && f12UngelesenSumme()===3, JSON.stringify(UL.map(function(e){ return [e.gespraech, e.n, e.titel]; })));
f12Ui().raum='Trainerstab'; f12Ui().kanal=null; f12Ui().gespraech=null; var hr=f12RaumHtml();
pruef('§5.1 · Block „🔵 Ungelesen · 3" direkt unter der Raum-Leiste mit Sprungzeilen (Avatar, Agent · Titel, Unterzeile 60 Zeichen, Zeit, Zahl)', hr.indexOf('🔵 Ungelesen · 3')>=0 && hr.indexOf('id="chatRaeume"')<hr.indexOf('id="chatUngelesen"') && hr.indexOf('id="chatUngelesen"')<hr.indexOf('f12-rk') && hr.indexOf('data-f12spring="k-pipe|gp"')>=0 && hr.indexOf('Pipeline-Agent · Deal X')>=0 && hr.indexOf('Trainer · Paket 34 angekommen?')>=0 && hr.indexOf(esc('Neue Antwort vom Trainer, die etwas laenger ist, damit die Unterzeile gekuerzt wird und so weiter'.slice(0,60)))>=0, hr.slice(hr.indexOf('chatUngelesen'), hr.indexOf('chatUngelesen')+500));
F12.ungelesen['k-pipe']=F12.ungelesen['k-pipe'].concat([3,4,5,6].map(function(i){ return { id:'u'+(10+i), Text:'x', Von:'Pipeline-Agent', 'Gespräch':'gq'+i, 'Gesprächstitel':'T'+i, Zeitstempel:vorMin(10+i) }; }));
f12Ui().ungelesenAlle=false; var hr2=f12RaumHtml();
pruef('§5.1 · höchstens 5 Zeilen, darunter „alle n zeigen"', hr2.split('data-f12spring=').length===6 && hr2.indexOf('alle 6 zeigen')>=0 && (function(){ f12Ui().ungelesenAlle=true; var h=f12RaumHtml(); f12Ui().ungelesenAlle=false; return h.split('data-f12spring=').length===7; })());
pruef('§5.1 · Tipp springt direkt ins Gespräch (Raum und Kanal mitgesetzt)', klick13('data-f12spring', 'k-pipe|gp')===true && f12Ui().kanal==='k-pipe' && f12Ui().gespraech==='gp' && f12Ui().raum==='Sales');
pruef('§5.3 · Stufe Gespräch: ‹ trägt die Zahl der anderen Gespräche (ohne das offene) und die Zeile „ungelesen in anderen Chats"', (function(){ var h=f12GespraechHtml(KP, 'gp'); return h.indexOf('data-f12zurueck="1" aria-label="Zurück">‹<i class="bd">5</i>')>=0 && h.indexOf('<b>5</b> ungelesen in anderen Chats')>=0; })());
pruef('§5.3 · Stufe Agent: ‹ trägt alle ungelesenen (7)', (function(){ f12Ui().gespraech=null; var h=f12AgentHtml(KP); return h.indexOf('‹<i class="bd">7</i>')>=0; })());
pruef('§5.3 · Tipp auf die Zeile springt in die Stufe Raum', klick13('data-f12ungelesen')===true && f12Stufe()==='raum');
pruef('§5.2 · Trainer-Knopf öffnet die Stufe Raum Trainerstab (Block oben)', /f12Oeffnen\(\{ raum:'Trainerstab', kanal:null, gespraech:null \}\)/.test(src));
pruef('§5.4 · Badge-Runde liefert Gespräch, Gesprächstitel und Text der ungelesenen Zeilen, limit 20, keine zweite Runde', src.indexOf("felder:['Text','Von','Gespräch','Gesprächstitel','Zeitstempel']")>=0 && /limit:20 \}\)\n\s*\.then\(d=>\{ sum\[k\.id\]=num\(d && d\.gesamt\); zeilen\[k\.id\]=/.test(src));
F12.ungelesen={}; F12.badge={}; e1Schliessen();
// §6 · kurze Entscheidungen als Knöpfe
pruef('§6 · 2 kurze Zeilen am Ende → Knöpfe', JSON.stringify(f12Knoepfe('Zwei Wege.\n- Freigeben\n- Ablehnen'))==='{"body":"Zwei Wege.","optionen":["Freigeben","Ablehnen"]}');
pruef('§6 · 4 kurze Zeilen → Knöpfe, 5 → Liste', f12Knoepfe('x\n- A\n- B\n- C\n- D').optionen.length===4 && f12Knoepfe('x\n- A\n- B\n- C\n- D\n- E')===null);
pruef('§6 · eine Zeile mit 31 Zeichen → Liste; 30 → Knopf', f12Knoepfe('x\n- A\n- '+'b'.repeat(31))===null && f12Knoepfe('x\n- A\n- '+'b'.repeat(30))!==null);
pruef('§6 · Liste mitten im Text (Text danach) bleibt Text; eine Zeile bleibt Liste', f12Knoepfe('x\n- A\n- B\nSchreib mir.')===null && f12Knoepfe('x\n- A')===null);
var AK={ id:'ak1', Von:'Trainer', Art:'Antwort', Text:'Zwei Wege:\n- Option A\n- Option B', Zeitstempel:T, Postfach:[] };
var hk1=f12NachrichtHtml(KT, AK, { letzte:true }), hk0=f12NachrichtHtml(KT, AK, { letzte:false });
pruef('§6.1 · jüngste Antwort: Knöpfe im Stil f7-act2 (erster türkis), Liste nicht im Text; ältere: Knöpfe grau', hk1.indexOf('<div class="f7-act2 f12-act" data-f12act="ak1"><div class="g" data-f12antwort="Option A">Option A</div><div class="" data-f12antwort="Option B">Option B</div></div>')>=0 && hk1.indexOf('<ul>')<0 && hk0.indexOf('f12-act aus')>=0, hk1.slice(0,400));
f12Ui().kanal='k-tr'; f12Ui().gespraech='g1'; _gesendet.length=0; S.meta.chatWahl={};
f12KnopfWahl('ak1', 'Option B');
pruef('§6.2 · Tipp sendet den Knopftext als Nachricht im selben Gespräch (Anlass Chat), Wahl gemerkt, Knöpfe danach grau mit markierter Wahl', _gesendet[0].args.felder.Text==='Option B' && _gesendet[0].args.felder['Gespräch']==='g1' && _gesendet[0].args.felder.Anlass==='Chat' && S.meta.chatWahl.ak1==='Option B' && f12NachrichtHtml(KT, AK, { letzte:true }).indexOf('f12-act aus')>=0 && f12NachrichtHtml(KT, AK, { letzte:true }).indexOf('class=" on" data-f12antwort="Option B"')>=0, JSON.stringify(_gesendet[0] && _gesendet[0].args.felder));
pruef('§6 · Liste bestimmt die Knöpfe nur an der jüngsten Antwort (f12LetzteAntwortId)', f12LetzteAntwortId([R1, R2, { id:'x', Von:'Pascal' }])==='r2');
e1Schliessen();

suiteEnde('Chat-Räume 4.1 · Hotfix 13');
