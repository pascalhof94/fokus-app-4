/* Suite 4.4 · Hotfix 16 (Auftrag 23.10.2026, §8.2): §1 Nachsenden prüft die Chat-Tabelle, höchstens 3 Versuche · §4a Karten-Chat als Gruppenchat (Farben, Kopf, ⏸) ·
   §4d Chat rechts folgt der Karte im Fokus · §5 Postfach in drei Filtern (Chats, Kartenfreigaben, Angelegte Karten, 💬 Chat zur Karte).
   Aufruf: jsc tests/v44-hotfix16.js · Geschrieben, im Rahmen des Auftrags nicht ausgeführt.
   Läuft gegen Lager-Attrappen (F7.lager, F12.ungelesen), FSLive stumm (senden/lesen gesammelt); Uhren in _timer (timerLaufen). */
var _timer;
function setTimeout(f, ms){ (_timer||(_timer=[])).push({ f:f, ms:Number(ms)||0 }); return _timer.length; }
function clearTimeout(){}
function timerLaufen(){ var l=_timer||[]; _timer=[]; l.forEach(function(t){ try{ t.f(); }catch(e){} }); }
function drain(n){ for(var i=0;i<(n||40);i++) warten(); }
var _toasts=[]; var _toastAlt=toast; toast=function(m, ms){ _toasts.push({ m:m, ms:ms }); };
fsliveStumm(); testTag();
FSLive.warteschlangeHat=function(){ return false; };
var _gelesen=[], _leseAntwort=function(){ return { datensaetze:[], gesamt:0 }; };
FSLive.lesen=function(w, a){ _gelesen.push({ werkzeug:w, args:a }); return Promise.resolve(_leseAntwort(w, a)); };
var _sendeAntwort={ sofort:true };
FSLive.senden=function(w, a, o){ _gesendet.push({ werkzeug:w, args:a, id:o&&o.id }); return Promise.resolve(_sendeAntwort); };
function gesendet(w){ return _gesendet.filter(function(g){ return g.werkzeug===w; }); }
function vorMin(m){ return new Date(Date.now()-m*60000).toISOString(); }
var src=readFile('index.html');
/* Kanäle, Abteilungen, Projekte */
var ABT=[{ id:'a-ts', Name:'Trainerstab', Emoji:'🎯', Teams:'Trainer' },{ id:'a-sales', Name:'Sales', Emoji:'🤝', Teams:'Pipeline' },{ id:'a-dev', Name:'DEV', Emoji:'💻', Teams:'Projekte' }];
F7.lager.abteilungen={ ts:Date.now(), daten:ABT, fehler:'' };
var KT={ id:'k-tr', Kanal:'Trainer', Agent:'Trainer', Abteilung:[{ id:'a-ts', anzeige:'Trainerstab' }], Projekt:[], Bereich:'privat', Tabelle:'Privat_Chat · Trainer', 'Claude-Raum-Link':null, Reihenfolge:1, Rolle:'Trainer' };
var KP={ id:'k-pipe', Kanal:'Pipeline-Agent', Agent:'Pipeline-Agent', Abteilung:[{ id:'a-sales', anzeige:'Sales' }], Projekt:[], Bereich:'dfm', Tabelle:'Chat · Pipeline-Agent', 'Claude-Raum-Link':null, Reihenfolge:1, Rolle:'Pipeline' };
var KH={ id:'k-hawk', Kanal:'Projekt-Agent HAWK', Agent:'Projekt-Agent HAWK', Abteilung:[{ id:'a-dev', anzeige:'DEV' }], Projekt:[{ id:'p-hawk', anzeige:'HAWK' }], Bereich:'dfm', Tabelle:'Chat · Projekt-Agent HAWK', 'Claude-Raum-Link':null, Reihenfolge:100, Rolle:'Projektakte' };
F7.lager.chatKanaele={ ts:Date.now(), daten:[KT, KP, KH], fehler:'' };
F7.lager.projekte={ ts:Date.now(), daten:[{ id:'p-hawk', Projekt:'HAWK', Status:'Aktiv', Abteilung:[{ id:'a-dev', anzeige:'DEV' }] }], fehler:'' };
F7.lager.postfach={ ts:Date.now(), daten:[], fehler:'' }; F7.lager.postfachNachholen={ ts:Date.now(), daten:[], fehler:'' };
var kd=S.karten.find(function(x){ return x.id==='t-dfm'; }), kp=S.karten.find(function(x){ return x.id==='t-priv'; }); kd.projekt='HAWK'; saveKarten();

// ══ §1 · Nachsenden prüft die Chat-Tabelle, höchstens 3 Versuche ══
pruef('§1.5 Start-Bereinigung für Tag 2026-10-22 ist im Quelltext (ohne Senden, Log „Hotfix 16: Schleife beendet“)', src.indexOf("String(A.chat.tag||'')==='2026-10-22'")>=0 && src.indexOf("f11Log('chat', 'Hotfix 16: Schleife beendet')")>=0 && src.indexOf("tabelle:'Agenten-Aufträge', felder:['Text'], filter:[{ feld:'Text'")<0);
var TXT='Tagesübergang: Vortag Do 22.10. gebucht (10.667 P). Bitte Feedback zum Vortag und den Tagesplan für heute als Paket.';
S.meta.f11Ausstehend={ chat:{ text:TXT, art:'Feedback', tag:'2026-10-22', gespraech:'tag-2026-10-23', versuche:0, seit:jetztIso() } }; saveMeta();
_leseAntwort=function(w, a){ if(a.tabelle==='Privat_Chat · Trainer' && (a.filter||[]).some(function(f){ return f.feld==='Text' && f.wert===TXT; })) return { datensaetze:[{ id:'x1', Text:TXT }], gesamt:1 }; return { datensaetze:[], gesamt:0 }; };
_gelesen.length=0; _gesendet.length=0; _f11NachTs=0; f11Nachsenden(); drain(20);
var q=_gelesen.find(function(g){ return g.werkzeug==='datensaetze_auflisten' && g.args.tabelle==='Privat_Chat · Trainer'; });
pruef('§1.1 Prüfung in der Chat-Tabelle des Trainers: Von Pascal, Art Nachricht, Gespräch tag-2026-10-23, Text', !!q && ['Von','Art','Gespräch','Text'].every(function(f){ return (q.args.filter||[]).some(function(x){ return x.feld===f; }); }) && q.args.filter.some(function(x){ return x.feld==='Gespräch' && x.wert==='tag-2026-10-23'; }), JSON.stringify(q && q.args));
pruef('§1.1 angekommen → f11Ausstehend.chat gelöscht, kein zweites Senden, Log „beim Dienst bestätigt“', !(S.meta.f11Ausstehend||{}).chat && gesendet('datensatz_anlegen').length===0 && (S.meta.f11Protokoll||[]).some(function(p){ return p.schritt==='chat' && p.info==='beim Dienst bestätigt'; }));
// nicht bestätigt: Dienst nimmt die Zeile nicht sofort an → höchstens 3 Nachsendungen, danach Toast und Eintrag weg
S.meta.f11Ausstehend={ chat:{ text:TXT, art:'Feedback', tag:'2026-10-22', gespraech:'tag-2026-10-23', versuche:0, seit:jetztIso() } }; saveMeta();
_leseAntwort=function(){ return { datensaetze:[], gesamt:0 }; }; _sendeAntwort={ wartend:true, id:'chat-uebergang-2026-10-22' };
_gesendet.length=0; _toasts.length=0;
for(var i=0;i<3;i++){ _f11NachTs=0; f11Nachsenden(); drain(20); }
pruef('§1.3 drei Nachsendungen: drei Zeilen gesendet, Zähler 3, Eintrag steht noch', gesendet('datensatz_anlegen').length===3 && (S.meta.f11Ausstehend.chat||{}).versuche===3 && gesendet('datensatz_anlegen').every(function(g){ return g.args.tabelle==='Privat_Chat · Trainer' && g.args.felder.Anlass==='Feedback'; }), JSON.stringify({ n:gesendet('datensatz_anlegen').length, v:(S.meta.f11Ausstehend.chat||{}).versuche }));
_f11NachTs=0; f11Nachsenden(); drain(20);
pruef('§1.3 vierte Prüfung: kein Senden mehr, Eintrag weg, Log „aufgegeben nach 3 Versuchen“, Toast', gesendet('datensatz_anlegen').length===3 && !(S.meta.f11Ausstehend||{}).chat && (S.meta.f11Protokoll||[]).some(function(p){ return p.info==='aufgegeben nach 3 Versuchen'; }) && _toasts.some(function(t){ return t.m==='Feedback-Anfrage an den Trainer nicht bestätigt — bitte im Chat nachfragen'; }), JSON.stringify(_toasts));
// §1.2 Dienst nimmt sofort an → bestätigt ohne Prüfung
S.meta.f11Ausstehend={ chat:{ text:TXT, art:'Feedback', tag:'2026-10-22', gespraech:'tag-2026-10-23', versuche:0, seit:jetztIso() } }; saveMeta();
_sendeAntwort={ sofort:true, antwort:{ id:'neu' } }; _gesendet.length=0; _f11NachTs=0; f11Nachsenden(); drain(20);
pruef('§1.2 Antwort „sofort“ → Eintrag sofort gelöscht (Log „beim Dienst angenommen“)', gesendet('datensatz_anlegen').length===1 && !(S.meta.f11Ausstehend||{}).chat && (S.meta.f11Protokoll||[]).some(function(p){ return p.info==='beim Dienst angenommen'; }));
_sendeAntwort={ sofort:true };

// ══ §4a · Karten-Chat als Gruppenchat ══
_gesendet.length=0;
f12KartenSenden(kd, '✓ „'+kd.titel+'“: lief gut', { anlass:'Kommentar' }); drain();
var ks=gesendet('datensatz_anlegen')[0];
pruef('§4.2 Kommentar beim Abhaken → Gespräch karte-<id> im Kanal des Projekt-Agenten, Anlass Kommentar, Titel 📇, nicht ins Tagesgespräch des Trainers', !!ks && ks.args.tabelle==='Chat · Projekt-Agent HAWK' && ks.args.felder['Gespräch']==='karte-t-dfm' && ks.args.felder.Anlass==='Kommentar' && /^📇 /.test(ks.args.felder['Gesprächstitel']||'') && ks.args.felder.Karten==='t-dfm' && !gesendet('datensatz_anlegen').some(function(g){ return /^tag-/.test(g.args.felder['Gespräch']||''); }), JSON.stringify(ks && ks.args));
_gesendet.length=0; f12KartenSenden(kp, '↷ „'+kp.titel+'“ → morgen: krank', { anlass:'Schiebe-Grund' }); drain();
ks=gesendet('datensatz_anlegen')[0];
pruef('§4.2 private Karte → Trainer-Kanal, Gespräch karte-<id>, Anlass Schiebe-Grund', !!ks && ks.args.tabelle==='Privat_Chat · Trainer' && ks.args.felder['Gespräch']==='karte-t-priv' && ks.args.felder.Anlass==='Schiebe-Grund');
pruef('§4.2 Aufrufstellen Abhaken/Schieben nutzen f12KartenSenden, nicht mehr f12TrainerSenden mit karte', (src.match(/f12KartenSenden\(k, '/g)||[]).length===4 && src.indexOf("f12TrainerSenden('✓ „'")<0 && src.indexOf("{ anlass:'Schiebe-Grund', karte:k }")<0);
pruef('§4.2 Nachrichten ohne Karte bleiben im Tagesgespräch (Pause, Tagesplan)', src.indexOf("f12TrainerSenden('☕ Pause (")>=0 && src.indexOf("f12TrainerSenden('Bitte den Tagesplan für heute als Paket in die App.'")>=0);
// Farben und Kopf
var G='karte-t-dfm';
var M1={ id:'m1', 'Gespräch':G, 'Gesprächstitel':'📇 Daily', Von:'Pascal', Art:'Nachricht', Anlass:'Kommentar', Status:'erledigt', Zeitstempel:vorMin(30), Beantwortet:vorMin(29), Text:'Internet zu langsam', Postfach:[] };
var M2={ id:'m2', 'Gespräch':G, Von:'Projekt-Agent HAWK', Art:'Antwort', Anlass:'Kommentar', Status:'erledigt', Zeitstempel:vorMin(28), Text:'Folgekarte ist vorbereitet.', Postfach:[] };
var M3={ id:'m3', 'Gespräch':G, Von:'Trainer', Art:'Antwort', Anlass:'Kommentar', Status:'erledigt', Zeitstempel:vorMin(27), Text:'Heute ist Steuer bis 12 Uhr gesetzt.', Postfach:[] };
var M4={ id:'m4', 'Gespräch':G, Von:'Pipeline-Agent', Art:'Antwort', Anlass:'Chat', Status:'erledigt', Zeitstempel:vorMin(26), Text:'Kein Handlungsbedarf.', Postfach:[] };
var M5={ id:'m5', 'Gespräch':G, Von:'Dienst', Art:'Hinweis', Anlass:'Chat', Status:'offen', Zeitstempel:vorMin(25), Text:'⏸ 5 Agenten-Nachrichten · wartet auf dich', Postfach:[] };
F7.lager['chatV:k-hawk|'+G]={ ts:Date.now(), daten:[M1, M2, M3, M4, M5], fehler:'' }; F7.lager['chatG:k-hawk']={ ts:Date.now(), daten:[M1, M2, M3, M4, M5], fehler:'' };
var teil=f16Teilnehmer(KH, [M1, M2, M3, M4, M5], G);
pruef('§4.6.1 Teilnehmer: führender Agent BLAU, Trainer GRUEN, weitere Abteilung ORANGE; Pascal und Dienst nicht', teil.length===3 && teil[0].von==='Projekt-Agent HAWK' && teil[0].farbe===FARBE.BLAU && teil[1].von==='Trainer' && teil[1].farbe===FARBE.GRUEN && teil[2].von==='Pipeline-Agent' && teil[2].farbe===FARBE.ORANGE, JSON.stringify(teil));
pruef('§4.6.1 zweite und dritte weitere Abteilung: LILA, GELB', f16Teilnehmer(KH, [{ Von:'Sales' },{ Von:'DEV' },{ Von:'Finanz-Agent' }], G).map(function(t){ return t.farbe; }).join(',')===[FARBE.BLAU, FARBE.GRUEN, FARBE.ORANGE, FARBE.LILA, FARBE.GELB].join(','));
var hl=f12ListeHtml(KH, [M1, M2, M3, M4, M5]);
pruef('§4.6.1 Sprechblasen: Rand und Name in der Absenderfarbe (HAWK blau, Trainer grün, Pipeline orange); Pascal rechts ohne Rand', hl.indexOf('class="f7-m t f16-a" style="--abs:'+FARBE.BLAU+'"><div class="f16-w">HAWK</div>')>=0 && hl.indexOf('style="--abs:'+FARBE.GRUEN+'"><div class="f16-w">Trainer</div>')>=0 && hl.indexOf('style="--abs:'+FARBE.ORANGE+'"><div class="f16-w">Pipeline-Agent</div>')>=0 && hl.indexOf('<div class="f7-m p">')>=0, hl.slice(0, 600));
pruef('§4.6.1 Hinweis des Dienstes grau mittig, ⏸ in ORANGE', hl.indexOf('<div class="f16-hw or"><span>⏸ 5 Agenten-Nachrichten · wartet auf dich</span></div>')>=0);
var hg=f12GespraechHtml(KH, G);
pruef('§4.6.2/3 Kopf: farbige Punkte aller Beteiligten und „⏸ wartet auf dich“', hg.indexOf('class="f16-teil"')>=0 && hg.indexOf('>HAWK</span>')>=0 && hg.indexOf('>Trainer</span>')>=0 && hg.indexOf('>Pipeline-Agent</span>')>=0 && hg.indexOf('<b class="f16-wartet">⏸ wartet auf dich</b>')>=0);
pruef('§4.6.3 nach einer neuen Nachricht von Pascal kein „wartet auf dich“ mehr', !f16WartetAufDich([M1, M2, M5, { Von:'Pascal', Art:'Nachricht', Text:'weiter' }]) && f16WartetAufDich([M1, M2, M5]));
pruef('§4.1.3 Trainer ist in jedem Karten-Chat Teilnehmer (auch ohne eigene Zeile); in anderen Gesprächen nur, wenn er schrieb', f16Teilnehmer(KH, [M1, M2], G).some(function(t){ return t.von==='Trainer'; }) && !f16Teilnehmer(KP, [M1], 'g-1').some(function(t){ return t.von==='Trainer'; }));
pruef('§4.4 Einstellung engine4.chatAgentenMax: Standard 5, Schema-Eintrag', DEFAULT_SETTINGS.chatAgentenMax===5 && !!(EINST_SCHEMA.engine4 && EINST_SCHEMA.engine4.chatAgentenMax) && EINST_SCHEMA.engine4.chatAgentenMax.p==='chatAgentenMax');

// ══ §4d · Chat rechts folgt der Karte im Fokus ══
var _breitAlt=f9Breit; f9Breit=function(){ return true; };
delete F7.lager['chatV:k-hawk|'+G]; delete F7.lager['chatG:k-hawk'];   // leeres Gespräch für §4.7
f12Ui().raum='Trainerstab'; f12Ui().kanal='k-tr'; f12Ui().gespraech='tag-x'; saveUi();
S.fokus={ karteId:'t-dfm', laeuft:true, startMs:Date.now(), sessionSek:0 }; saveFokus();
f9Rendern();
var hc=el('srChat').innerHTML;
pruef('§4.7.1 Karte im Fokus → rechte Spalte zeigt karte-<id> im Kanal der Karte, Kopf „💬 📇 <Titel>“ mit Punkten', f12Ui().kanal==='k-hawk' && f12Ui().gespraech==='karte-t-dfm' && hc.indexOf('💬 📇 '+esc(kd.titel))>=0 && hc.indexOf('class="f16-teil"')>=0 && hc.indexOf('folgt der Karte im Fokus')>=0, hc.slice(0, 300));
pruef('§4.7.1 die Karte hängt als Marke am Entwurf des leeren Gesprächs', f12Entwurf('k-hawk', 'karte-t-dfm').karten.some(function(k){ return k.id==='t-dfm'; }));
f12Entwurf('k-hawk', 'karte-t-dfm').text='Entwurf A'; saveUi();
S.fokus={ karteId:'t-priv', laeuft:true, startMs:Date.now(), sessionSek:0 }; saveFokus(); f9Rendern();
pruef('§4.7.1 Karte wechselt → Gespräch wechselt (private Karte → Trainer)', f12Ui().kanal==='k-tr' && f12Ui().gespraech==='karte-t-priv');
S.fokus={ karteId:'t-dfm', laeuft:true, startMs:Date.now(), sessionSek:0 }; saveFokus(); f9Rendern();
pruef('§4.7.3 ungesendeter Entwurf bleibt je Gespräch erhalten', f12Entwurf('k-hawk', 'karte-t-dfm').text==='Entwurf A' && f12EntwurfAktuell().text==='Entwurf A');
S.fokus=null; saveFokus(); f9Rendern();
pruef('§4.7.2 ohne Karte im Fokus: Verhalten wie heute (zuletzt offenes Gespräch bleibt)', f12Ui().kanal==='k-hawk' && f12Ui().gespraech==='karte-t-dfm' && el('srChat').innerHTML.indexOf('💬 HAWK')>=0);
f9Breit=_breitAlt;

// ══ §5 · Postfach in drei Filtern ══
var PF1={ id:'pf1', Titel:'Neu: Excel reviewen', Agent:'Projekt-Agent HAWK', Art:'Plan', 'Output/Entwurf':'Aufgabe: Excel reviewen\n- Projekt: HAWK\n- Soll-Minuten: 45\n\nUnteraufgaben:\n- a\n\nNotiz: x', Status:'offen', Dringlichkeit:50, Runde:1, 'Sicherheit %':85, erstellt_am:vorMin(20) };
var PF2={ id:'pf2', Titel:'HSI: Update beider Deals', Agent:'Pipeline-Agent', Art:'Korrektur', 'Output/Entwurf':'Text', Status:'offen', Dringlichkeit:40, Runde:1, 'Sicherheit %':70, erstellt_am:vorMin(60) };
F7.lager.postfach={ ts:Date.now(), daten:[PF1, PF2], fehler:'' }; F7.lager.ueberarbeiten={ ts:Date.now(), daten:[], fehler:'' };
var A1={ id:'a1', 'Gespräch':'g-x', 'Gesprächstitel':'📇 Angebot nachfassen', Von:'Pipeline-Agent', Art:'Antwort', Anlass:'Chat', Status:'offen', Zeitstempel:vorMin(10), Text:'Ohne Antwort von Jakob …', Postfach:[] };
var A2={ id:'a2', 'Gespräch':'g-x', Von:'Sales', Art:'Antwort', Anlass:'Chat', Status:'offen', Zeitstempel:vorMin(8), Text:'Zweite Variante ergänzt.', Postfach:[] };
var A3={ id:'a3', 'Gespräch':'tag-heute', 'Gesprächstitel':'📅 Tag Fr 23.10.', Von:'Dienst', Art:'Hinweis', Anlass:'Chat', Status:'offen', Zeitstempel:vorMin(40), Text:'⏸ 5 Agenten-Nachrichten · wartet auf dich', Postfach:[] };
var A4={ id:'a4', 'Gespräch':'karte-t-dfm', 'Gesprächstitel':'📇 Daily', Von:'Projekt-Agent HAWK', Art:'Antwort', Anlass:'Kommentar', Status:'offen', Zeitstempel:vorMin(5), Text:'Folgekarte ist vorbereitet.', Postfach:[{ id:'pf1', anzeige:'Neu: Excel reviewen' }] };
var H2={ id:'h2', 'Gespräch':'ag-pipe', 'Gesprächstitel':'Agenten-Karten', Von:'Pipeline-Agent', Art:'Hinweis', Anlass:'Postfach', Status:'erledigt', Zeitstempel:vorMin(55), Text:'📬 Neue Agenten-Karte: HSI · Korrektur', Postfach:[{ id:'pf2', anzeige:'HSI' }] };
F12.ungelesen={ 'k-pipe':[A1, A2], 'k-tr':[A3], 'k-hawk':[A4] }; F12.badge={ 'k-pipe':2, 'k-tr':1, 'k-hawk':1 };
F7.lager['pfz:k-hawk']={ ts:Date.now(), daten:[A4], fehler:'' }; F7.lager['pfz:k-pipe']={ ts:Date.now(), daten:[H2], fehler:'' };
var ZD=f16PostfachDaten();
pruef('§5.2 Chats: genau eine Zeile je Gespräch, egal wie viele Agenten (g-x mit 2 Absendern = 1 Zeile)', ZD.chats.length===2 && ZD.chats.some(function(c){ return c.gespraech==='g-x' && c.zeilen.length===2; }), JSON.stringify(ZD.chats.map(function(c){ return c.gespraech; })));
pruef('§5.2 Gespräch mit ⏸ steht oben; Gespräch mit offener Postfach-Karte (karte-t-dfm) nicht unter Chats', ZD.chats[0].gespraech==='tag-heute' && ZD.chats[0].wartet && !ZD.chats.some(function(c){ return c.gespraech==='karte-t-dfm'; }));
pruef('§5.3 Kartenfreigaben: zwei Gruppen — Gespräch der Antwort (karte-t-dfm) und „Agenten-Karten“ des Pipeline-Agenten; Zähler 2', ZD.freigaben.karten===2 && ZD.freigaben.gruppen.length===2 && ZD.freigaben.gruppen.some(function(g){ return g.gespraech==='karte-t-dfm' && g.karten[0].id==='pf1' && g.zeilen.length===1; }) && ZD.freigaben.gruppen.some(function(g){ return g.gespraech==='ag-pipe' && g.karten[0].id==='pf2'; }), JSON.stringify(ZD.freigaben.gruppen.map(function(g){ return [g.gespraech, g.titel]; })));
F16.pfFilter=null; seiteZeigen('postfach'); var hp=el('postfachBody').innerHTML;
pruef('§5.1 drei Filter-Chips mit Anzahl; Start-Filter Kartenfreigaben (n > 0), gewählt mit „✓ “', hp.indexOf('data-f16filter="chats"')>=0 && hp.indexOf('data-f16filter="freigaben"')>=0 && hp.indexOf('data-f16filter="angelegt"')>=0 && hp.indexOf('class="f16-chip an" data-f16filter="freigaben">✓ 📬 Kartenfreigaben <span class="n">2</span>')>=0 && hp.indexOf('💬 Chats <span class="n">2</span>')>=0, hp.slice(0, 700));
pruef('§5.3 Kopfzeile je Gespräch („aus Chat“, Punkte) und eingerückte Karte mit Agent · Art · Runde · Sicherheit', hp.indexOf('📇 Daily')>=0 && hp.indexOf('aus Chat · ')>=0 && hp.indexOf('data-f15karte="pf1"')>=0 && hp.indexOf('Projekt-Agent HAWK · Plan · Runde 1 · 85 %')>=0 && hp.indexOf('Pipeline-Agent · „Agenten-Karten“')>=0 && hp.indexOf('data-f15karte="pf2"')>=0);
pruef('§5.6 Gruppe „Agenten-Karten“ mit „n offene Karten in der Kette“ entfällt im Postfach', hp.indexOf('offene Karten in der Kette')<0 && hp.indexOf('data-f15kette')<0);
pruef('§5.7 Badge = ungelesene Chats (2) + offene Kartenfreigaben (2)', num(S.meta.postfach.offen)===4 && num(S.meta.postfach.chats)===2 && num(S.meta.postfach.karten)===2, JSON.stringify(S.meta.postfach));
F16.pfFilter='chats'; renderPostfach(); hp=el('postfachBody').innerHTML;
pruef('§5.2 Zeile: Titel, ⏸-Zeile oben mit orangem Rand, Zahl der ungelesenen, Anfang der neuesten Nachricht, Punkte', hp.indexOf('class="f15-msg f16-gz warte"')>=0 && hp.indexOf('⏸ wartet auf dich')>=0 && hp.indexOf('<span class="u">2</span>')>=0 && hp.indexOf('Sales: Zweite Variante ergänzt.')>=0 && hp.indexOf('class="f16-teil"')>=0 && hp.indexOf('📇 Angebot nachfassen')>=0, hp.slice(0, 900));
f16ChatOeffnen('k-pipe', 'g-x', 'a1'); drain();
pruef('§5.2 Tipp öffnet das Gespräch (an der ältesten ungelesenen Nachricht)', e1Art()==='chat' && f12Ui().kanal==='k-pipe' && f12Ui().gespraech==='g-x');
e1Schliessen();
// Angelegte Karten
F7.lager.postfachFrei=undefined; delete F7.lager.postfachFrei; _gelesen.length=0;
_leseAntwort=function(w, a){ if(a.tabelle==='Postfach' && (a.filter||[]).some(function(f){ return f.feld==='Entscheidung' && f.wert==='freigegeben'; })) return { datensaetze:[{ id:'pf9', Titel:'Steuer nach Michael', Agent:'Trainer', Art:'Plan', Status:'erledigt', Entscheidung:'freigegeben', Runde:1, erstellt_am:vorMin(300), geaendert_am:vorMin(200) },{ id:'pf8', Titel:'Mails nachholen', Agent:'Erfassungs-Agent', Art:'Plan', Status:'erledigt', Entscheidung:'freigegeben', Runde:2, erstellt_am:vorMin(900), geaendert_am:vorMin(800) }], gesamt:2 }; return { datensaetze:[], gesamt:0 }; };
S.meta.postfachKarten={ pf9:{ karteId:'t-dfm', ts:jetztIso() }, pf8:{ karteId:'t-erh', ts:jetztIso() } }; var ke=S.karten.find(function(x){ return x.id==='t-erh'; }); ke.status='erledigt'; saveKarten(); saveMeta();
F16.pfFilter='angelegt'; renderPostfach(); drain(20); renderPostfach(); hp=el('postfachBody').innerHTML;
var qa=_gelesen.find(function(g){ return g.args && g.args.tabelle==='Postfach'; });
pruef('§5.5 Angelegte Karten fragt nur Entscheidung „freigegeben“, neueste zuerst (geaendert_am ab)', !!qa && qa.args.filter.length===1 && qa.args.filter[0].feld==='Entscheidung' && qa.args.filter[0].wert==='freigegeben' && qa.args.sortierung[0].feld==='geaendert_am' && qa.args.sortierung[0].richtung==='ab', JSON.stringify(qa && qa.args));
pruef('§5.5 Zeile: Titel, „freigegeben <Datum Uhrzeit> · <Agent>“, rechts Status der angelegten Karte (offen/erledigt)', hp.indexOf('Steuer nach Michael')>=0 && /freigegeben \d\d\.\d\d \d\d:\d\d · Trainer/.test(hp) && hp.indexOf('<span class="st of">offen</span>')>=0 && hp.indexOf('<span class="st er">erledigt</span>')>=0 && hp.indexOf('data-f16karte="pf9"')>=0, hp.slice(0, 700));
f15KarteOeffnen('pf9', { nurLesen:true }); F15.pf.pf9={ ts:Date.now(), r:{ id:'pf9', Titel:'Steuer nach Michael', Agent:'Trainer', Art:'Plan', 'Output/Entwurf':'Aufgabe: Steuer', Status:'erledigt', Entscheidung:'freigegeben', Runde:1 } };
var hk=f15KarteHtml();
pruef('§5.5 Karten-Ansicht aus dem Archiv nur lesend, mit „💬 Chat zur Karte“', e1Art()==='agentenkarte' && hk.indexOf('data-f16kchat="pf9"')>=0 && hk.indexOf('💬 Chat zur Karte')>=0 && hk.indexOf('id="f15Text"')<0 && hk.indexOf('data-f15ent=')<0, hk.slice(0, 500));
e1Schliessen();
f15KarteOeffnen('pf1', {}); hk=f15KarteHtml();
pruef('§5.4 Karten-Ansicht einer offenen Karte: Knopf „💬 Chat zur Karte“ im Kopf, Freigeben · Senden · Ablehnen bleiben', hk.indexOf('data-f16kchat="pf1"')>=0 && hk.indexOf('data-f15ent="freigegeben"')>=0 && hk.indexOf('data-f15ent="angepasst"')>=0 && hk.indexOf('data-f15ent="abgelehnt"')>=0);
f16ChatZurKarte('pf1'); drain();
pruef('§5.4 „💬 Chat zur Karte“ öffnet das Gespräch, aus dem die Karte kam (Antwort mit Postfach-Verknüpfung)', e1Art()==='chat' && f12Ui().kanal==='k-hawk' && f12Ui().gespraech==='karte-t-dfm');
e1Schliessen();
F15.pf.pf2={ ts:Date.now(), r:PF2 }; f16ChatZurKarte('pf2'); drain();
pruef('§5.4 ohne Antwort-Zeile: Gespräch der Hinweis-Zeile („Agenten-Karten“)', e1Art()==='chat' && f12Ui().kanal==='k-pipe' && f12Ui().gespraech==='ag-pipe');
e1Schliessen();
var hz=f12NachrichtHtml(KH, A4, {});
pruef('§5.4 Antwort mit offener Postfach-Karte im Chat: Link „📬 Karten-Ansicht öffnen ›“ zurück zur Karte', hz.indexOf('data-f15karte="pf1"')>=0 && hz.indexOf('Karten-Ansicht öffnen')>=0);
// Mehrere Agenten im selben Gespräch → eine Zeile; Chat-Antwort mit Postfach-Karte nur unter Kartenfreigaben
F12.ungelesen={ 'k-pipe':[A1, A2], 'k-hawk':[A4] }; ZD=f16PostfachDaten();
pruef('§8.2 mehrere Agenten im selben Gespräch → eine Zeile; Antwort mit Postfach-Karte nur unter Kartenfreigaben', ZD.chats.length===1 && ZD.chats[0].zeilen.length===2 && ZD.freigaben.gruppen.some(function(g){ return g.gespraech==='karte-t-dfm' && g.zeilen.length===1; }));

// ══ Version ══
pruef('App 4.1.5 · Build 2026-10-23-40', APP_VERSION==='4.1.5' && APP_BUILD==='2026-10-23-40', APP_VERSION+' / '+APP_BUILD);
toast=_toastAlt;
suiteEnde('Hotfix 16 · Nachsende-Schleife, Karten-Chat, Postfach in drei Filtern (4.1.5)');
