/* Suite 4.3 · Hotfix 15 (Auftrag 22.10.2026, §9.2): §1 Datei kommt sicher an · §2 Erfassung · §4b Kette Agenten-Karten · §5 Karten-Ansicht · §6b Senden · §7 Postfach.
   Aufruf: jsc tests/v43-hotfix15.js · Geschrieben, im Rahmen des Auftrags nicht ausgeführt.
   Läuft gegen Lager-Attrappen (F7.lager, F12.ungelesen), FSLive stumm (senden/lesen gesammelt), FSLive.hochladen als Attrappe; Uhren in _timer (timerLaufen). */
var _timer=[];
function setTimeout(f, ms){ _timer.push({ f:f, ms:Number(ms)||0 }); return _timer.length; }
function clearTimeout(){}
function timerLaufen(){ var l=_timer; _timer=[]; l.forEach(function(t){ try{ t.f(); }catch(e){} }); }
function drain(n){ for(var i=0;i<(n||40);i++) warten(); }
var _bestaetigt=[]; function confirm(frage){ _bestaetigt.push(frage); return _confirmAntwort; } var _confirmAntwort=true;
var _toasts=[]; var _toastAlt=toast; toast=function(m, ms){ _toasts.push({ m:m, ms:ms }); };
/* FileReader-Attrappe: liefert ein kleines PNG als Data-URL */
function FileReader(){ this.onload=null; this.onerror=null; this.result=null; }
FileReader.prototype.readAsDataURL=function(f){ this.result='data:'+(f.type||'application/octet-stream')+';base64,QUJD'; var self=this; _timer.push({ f:function(){ if(self.onload) self.onload(); }, ms:0 }); };
function datei(name, typ, groesse){ return { name:name, type:typ, size:groesse||10 }; }
fsliveStumm(); testTag();
/* Textfeld der Erfassung und der Karten-Ansicht: die App liest beim Senden den Feldwert (DOM-Attrappe) */
var _taWert=''; var _qsAlt=document.querySelector; document.querySelector=function(sel){ if(sel==='[data-f7erftext]') return { value:_taWert }; return _qsAlt(sel); };
var _hochgeladen=[], _hochladenFehler=null;
FSLive.hochladen=function(d){ _hochgeladen.push(d); if(_hochladenFehler) return Promise.reject(new Error(_hochladenFehler)); return Promise.resolve({ ok:true, pfad:'/Users/kalle/FocusSystem-lokal/erfassung/2026-10-22/21-57-00_'+d.name, name:d.name, groesse:d.base64.length }); };
FSLive.ichFuehre=function(){ return false; };   // §1.1: vom nicht führenden Gerät
FSLive.warteschlangeHat=function(){ return false; };
function gesendet(w){ return _gesendet.filter(function(g){ return g.werkzeug===w; }); }

// ══ §1 · Datei kommt sicher an ══
pruef('§1.6 Dateiname aus der Zwischenablage: YYMMDD_HHMM_Einfuegen.<endung>', f15EinfuegenName('image/png', '', new Date(2026, 9, 22, 21, 57))==='261022_2157_Einfuegen.png' && f15EinfuegenName('', 'foto.JPG', new Date(2026, 9, 22, 9, 5))==='261022_0905_Einfuegen.jpg' && f15EinfuegenName('application/pdf', '', new Date(2026, 0, 1, 0, 0))==='260101_0000_Einfuegen.pdf', f15EinfuegenName('image/png', '', new Date(2026, 9, 22, 21, 57)));
e1Oeffnen('erfassen'); F7.erf=null; var E=f7Erf(); E.text='Termin mit Christian verschoben'; E.quelle='screenshot';
f15DateiUebernehmen(E, datei('Bild.png', 'image/png', 2000), { quelle:'screenshot' }); timerLaufen(); drain();
pruef('Datei angehängt: Name, Typ, base64, Stand angehaengt', !!E.datei && E.datei.name==='Bild.png' && E.datei.typ==='image/png' && E.datei.base64==='QUJD' && E.datei.status==='angehaengt', JSON.stringify(E.datei));
var hk=f15DateiKachelHtml(E.datei);
pruef('§2.3 Datei-Kachel: Vorschaubild, Name, „✓ angehängt · wird mit dem Eintrag übertragen“, ✕', hk.indexOf('background-image:url(data:image/png;base64,QUJD)')>=0 && hk.indexOf('Bild.png')>=0 && hk.indexOf('✓ angehängt · wird mit dem Eintrag übertragen')>=0 && hk.indexOf('data-f15dateiweg')>=0, hk);
_gesendet.length=0; _hochgeladen.length=0; _toasts.length=0; _taWert=E.text;
f7ErfassenSenden(); drain(10);
var es=gesendet('app:erfassen');
pruef('§1.3 Reihenfolge: erst Upload (1×), dann genau ein Inbox-Eintrag mit pfad und ohne datei', _hochgeladen.length===1 && _hochgeladen[0].name==='Bild.png' && es.length===1 && /21-57-00_Bild\.png$/.test(String(es[0].args.pfad)) && es[0].args.datei===undefined, JSON.stringify({ up:_hochgeladen.length, es:es.map(function(g){ return g.args; }) }));
pruef('§1.1 Erfassen vom nicht führenden Gerät geht durch (kein Führungs-Abbruch)', es.length===1 && FSLive.ichFuehre()===false);
pruef('§1.2 eine Erfassung = ein Eintrag: Kanal und Bezug sind Felder dieses einen Eintrags', es.length===1 && es[0].args.quelle==='screenshot' && es[0].args.bezug && es[0].args.text==='Termin mit Christian verschoben');
pruef('§2.5 Erfolg: Toast „✓ Erfasst · Datei übertragen“ 1,5 s, Felder leer', _toasts.some(function(t){ return t.m==='✓ Erfasst · Datei übertragen' && t.ms===1500; }) && F7.erf===null && !F7.erfLaeuft, JSON.stringify(_toasts));
pruef('Zuletzt erfasst: Eintrag mit Pfad', f7ErfasstListe().slice(-1)[0] && /Bild\.png$/.test(String(f7ErfasstListe().slice(-1)[0].pfad)));
// Upload-Fehler → kein Eintrag, Datei-Kachel rot, Eintrag bleibt
F7.erf=null; E=f7Erf(); E.text='Noch ein Versuch'; f15DateiUebernehmen(E, datei('Scan.pdf', 'application/pdf', 500), {}); timerLaufen(); drain();
_gesendet.length=0; _hochgeladen.length=0; _toasts.length=0; _hochladenFehler='Mac mini nicht erreichbar'; _taWert=E.text;
f7ErfassenSenden(); drain(10);
pruef('§1.4 Upload-Fehler: kein Inbox-Eintrag, Kachel rot, Text und Datei bleiben stehen', gesendet('app:erfassen').length===0 && F7.erf===E && E.text==='Noch ein Versuch' && E.datei && E.datei.status==='fehler' && f15DateiKachelHtml(E.datei).indexOf('Datei nicht übertragen · erneut senden')>=0 && f15DateiKachelHtml(E.datei).indexOf('f15-datei fehler')>=0 && !F7.erfLaeuft, JSON.stringify({ es:gesendet('app:erfassen').length, st:E.datei && E.datei.status }));
pruef('§1.4 Toast nennt den Fehler', _toasts.some(function(t){ return t.m==='Datei nicht übertragen · erneut senden'; }));
_hochladenFehler=null; _gesendet.length=0; _hochgeladen.length=0;
f7ErfassenSenden(); drain(10);
pruef('§1.4 „Erfassen“ versucht beides erneut: Upload und Eintrag', _hochgeladen.length===1 && gesendet('app:erfassen').length===1 && F7.erf===null);
// Eine Datei je Erfassung: zweite Datei fragt „Datei ersetzen?“
F7.erf=null; E=f7Erf(); f15DateiUebernehmen(E, datei('a.png', 'image/png'), {}); timerLaufen(); drain();
_bestaetigt.length=0; _confirmAntwort=false; f15DateiUebernehmen(E, datei('b.png', 'image/png'), {}); timerLaufen(); drain();
pruef('§1.5 zweite Datei: Frage „Datei ersetzen?“, Nein behält die erste', _bestaetigt[0]==='Datei ersetzen?' && E.datei.name==='a.png');
_confirmAntwort=true; f15DateiUebernehmen(E, datei('b.png', 'image/png'), {}); timerLaufen(); drain();
pruef('§1.5 Ja ersetzt die Datei', E.datei.name==='b.png');
// Ohne Datei: wie bisher ein Eintrag, Toast „✓ Erfasst“
F7.erf=null; E=f7Erf(); E.text='nur Text'; _taWert='nur Text'; _gesendet.length=0; _hochgeladen.length=0; _toasts.length=0; f7ErfassenSenden(); drain(10);
pruef('ohne Datei: kein Upload, ein Eintrag, Toast „✓ Erfasst“', _hochgeladen.length===0 && gesendet('app:erfassen').length===1 && gesendet('app:erfassen')[0].args.pfad===undefined && _toasts.some(function(t){ return t.m==='✓ Erfasst'; }));

// ══ §2 · Erfassung: Rückmeldung, Bezug, Einfügen ══
F7.erf=null; E=f7Erf(); E.quelle='screenshot'; E.bezug='agent';
var he=f7ErfassenHtml();
pruef('§2.1 gewählter Kanal: Klasse on und „✓ Screenshot“, andere ohne ✓', /class="on" data-f7quelle="screenshot"><b>🖼️<\/b>✓ Screenshot/.test(he) && he.indexOf('✓ Foto / Scan')<0 && he.indexOf('class="f7-erf"')>=0, he.slice(0, 600));
pruef('§2.1 gewählter Bezug-Chip mit ✓', he.indexOf('✓ 🤖 Agent entscheidet')>=0);
pruef('§2.2 Eingabefeld für den Bezug und Knopf „Erfassen“', he.indexOf('data-f15bezug="1"')>=0 && he.indexOf('>Erfassen</div>')>=0 && he.indexOf('Abschicken')<0);
pruef('§2.3 Drop-Fläche mit Text vorhanden (versteckt)', he.indexOf('⬇︎ Datei loslassen zum Anhängen')>=0 && /class="f15-drop" data-f15drop="1" hidden/.test(he));
F7.lager.projekte={ ts:Date.now(), daten:[{ id:'p-fa', Projekt:'Fokus App', Status:'Aktiv', Abteilung:[{ id:'a1', anzeige:'DEV' }] }], fehler:'' };
var _gelesen=[]; FSLive.lesen=function(w, a){ _gelesen.push({ w:w, a:a }); if(a && a.tabelle==='Personen') return Promise.resolve({ datensaetze:[{ id:'pe1', Name:'Christian Sauer', Organisation:[{ id:'o1', anzeige:'Steuerberater' }] },{ id:'pe2', Name:'Christian Koch', Organisation:[] }] }); if(a && a.tabelle==='Organisationen') return Promise.resolve({ datensaetze:[] }); return Promise.resolve({ datensaetze:[] }); };
f15BezugSuchen('C'); drain();
pruef('§2.2 unter 2 Zeichen keine Treffer, keine Abfrage', (F7.erfTreffer||[]).length===0 && f15TrefferHtml()==='' && _gelesen.length===0);
f15BezugSuchen('Chr'); drain(10);
var ht=f15TrefferHtml();
pruef('§2.2 ab 2 Zeichen: Personen (mit Organisation) aus FocusSystem, Projekte und Karten lokal; Zeile „Name · Art · Zusatz“', _gelesen.length===2 && ht.indexOf('Christian Sauer<small>· Person · Steuerberater</small>')>=0 && ht.indexOf('Christian Koch<small>· Person</small>')>=0, ht);
f15BezugSuchen('Fokus'); drain(10);
pruef('§2.2 Projekt aus dem Lager als Treffer', f15TrefferHtml().indexOf('Fokus App<small>· Projekt · DEV</small>')>=0, f15TrefferHtml());
f15BezugSuchen('DFM Aufgabe'); drain(10);
pruef('§2.2 Karte vom Gerät als Treffer', (F7.erfTreffer||[]).some(function(t){ return t.art==='karte' && t.id==='t-dfm'; }), JSON.stringify(F7.erfTreffer));
FSLive.lesen=function(){ return Promise.resolve({ datensaetze:[] }); }; F7.erfSucheCache={};
f15BezugSuchen('Niemand'); drain(10);
pruef('§2.2 ohne Treffer: „Kein Treffer · wird als Text übernommen“', f15TrefferHtml().indexOf('Kein Treffer · wird als Text übernommen')>=0, f15TrefferHtml());
F7.erfSuche='Chr'; F7.erfTreffer=[{ art:'person', artName:'Person', id:'pe1', name:'Christian Sauer', zusatz:'Steuerberater' }];
f15TrefferWaehlen('person|pe1', 'Christian Sauer', '');
pruef('§2.2 Tipp: Zeile kurz BLAU mit ✓', f15TrefferHtml().indexOf('class="an" data-f15treffer="person|pe1"')>=0 && f15TrefferHtml().indexOf('✓ Christian Sauer')>=0);
timerLaufen(); drain();
E=f7Erf(); he=f7ErfassenHtml();
pruef('§2.2 danach Bezug als Chip „👤 Christian Sauer ✕“, Suche leer', E.bezug==='person' && E.bezugId==='pe1' && E.bezugName==='Christian Sauer' && he.indexOf('👤 Christian Sauer ✕')>=0 && he.indexOf('data-f15bezugweg="1"')>=0, he.slice(he.indexOf('f15-bezug'), he.indexOf('f15-bezug')+400));
_gesendet.length=0; E.text='Bezug prüfen'; _taWert='Bezug prüfen'; f7ErfassenSenden(); drain(10);
pruef('§2.2 Senden: Bezug person mit id aus der Trefferliste', gesendet('app:erfassen')[0].args.bezug.art==='person' && gesendet('app:erfassen')[0].args.bezug.id==='pe1' && gesendet('app:erfassen')[0].args.bezug.name==='Christian Sauer');
F7.erf=null; E=f7Erf(); E.bezug='person'; E.bezugId='pe1'; E.bezugName='Christian Sauer'; f15BezugWeg();
pruef('§2.2 ✕ entfernt den Bezug', f7Erf().bezug==='agent' && !f7Erf().bezugId);
// Einfügen im Textfeld: Bild aus der Zwischenablage → Datei-Kachel mit Einfügen-Namen
F7.erf=null; E=f7Erf();
var ok=f15DateiAusEreignis({ clipboardData:{ files:[datei('image.png', 'image/png', 300)], items:[] } }, true); timerLaufen(); drain();
pruef('§2.4 Einfügen: Datei-Kachel mit Namen YYMMDD_HHMM_Einfuegen.png', ok===true && !!E.datei && /^\d{6}_\d{4}_Einfuegen\.png$/.test(E.datei.name), E.datei && E.datei.name);
var ok2=f15DateiAusEreignis({ clipboardData:{ files:[], items:[] } }, true);
pruef('§2.4 Einfügen ohne Datei: Text läuft wie bisher (kein Eingriff)', ok2===false);
E.datei=null; var ok3=f15DateiAusEreignis({ dataTransfer:{ files:[datei('Scan.pdf', 'application/pdf', 300)] } }, false); timerLaufen(); drain();
pruef('§2.3 Ziehen: Datei behält ihren Namen', ok3===true && E.datei && E.datei.name==='Scan.pdf');
F7.erfLaeuft=true; he=f7ErfassenHtml(); F7.erfLaeuft=false;
pruef('§2.5 „Wird übertragen …“ mit Ladekreis, Knopf gesperrt', he.indexOf('Wird übertragen …')>=0 && he.indexOf('f15-kreis')>=0 && /class="f7-send aus" data-f7erfsenden="1"/.test(he));
e1Schliessen();

// ══ §4b · Kette „📬 Agenten-Karten“ ══
var PF1={ id:'pf1', Titel:'Termin mit Christian verschoben – welcher Christian?', Agent:'Erfassungs-Agent', Art:'Klärung', 'Output/Entwurf':'Es hängt keine Datei am Eintrag. „Christian“ ist nicht eindeutig.\n\nOptionen:\n- Screenshot erneut hochladen und Christian nennen\n- Nur als Notiz zur Person ablegen\n- Verwerfen\n\nDanach geht es weiter.', 'Begründung':'Datei fehlt, Person mehrdeutig.', 'Sicherheit %':30, Dringlichkeit:35, Status:'offen', Runde:1, 'Vorgänger':[], erstellt_am:'2026-10-22T19:57:48.000Z' };
var PF2={ id:'pf2', Titel:'RiSe-Termin abgesagt: zwei Karten schieben?', Agent:'Pipeline-Agent', Art:'Plan', 'Output/Entwurf':'Vorschlag.', 'Sicherheit %':70, Dringlichkeit:35, Status:'offen', Runde:1, 'Vorgänger':[], erstellt_am:'2026-10-22T18:00:00.000Z' };
var PF3={ id:'pf3', Titel:'Zielsteuerung: DFM-Tagesziel anheben', Agent:'Trainer', Art:'Ziel', 'Output/Entwurf':'Vorschlag Ziel.', 'Sicherheit %':80, Dringlichkeit:20, Status:'offen', Runde:2, 'Vorgänger':[{ id:'pf0', anzeige:'alt' }], erstellt_am:'2026-10-22T10:00:00.000Z' };
F7.lager.postfach={ ts:Date.now(), daten:[PF1, PF2, PF3], fehler:'' };
F7.lager.ueberarbeiten={ ts:Date.now(), daten:[{ id:'au1', Art:'Überarbeiten', Status:'offen', 'Empfänger':'Pipeline-Agent', 'Postfach-Karte':[{ id:'pf2', anzeige:'RiSe' }] }], fehler:'' };
F7.lager.postfachNachholen={ ts:Date.now(), daten:[], fehler:'' };
var kk=f15KetteKarten();
pruef('§4.1 Reihenfolge: Dringlichkeit absteigend, dann erstellt_am aufsteigend', kk.map(function(r){ return r.id; }).join(',')==='pf2,pf1,pf3', kk.map(function(r){ return r.id; }).join(','));
var ch=tageskettenChipsHtml();
pruef('§4.1 Chip „📬 Agenten-Karten · 3“ in der Gruppe Aktuelle Kette, auch ohne eigene Tagesketten', ch.indexOf('data-tkwahl="agentenkarten"')>=0 && ch.indexOf('📬 Agenten-Karten · 3')>=0, ch);
S.ui.tkWahl='agentenkarten'; saveUi();
pruef('Kette gewählt: tageskettenWahl, Name, keine App-Karten', tageskettenWahl()==='agentenkarten' && aktiveKetteName()==='📬 Agenten-Karten' && aktiveKetteKarten().length===0);
var kz=f15KetteZeilenHtml();
pruef('§4.2 Kartenzeile: BLAU 18 %, Rand ORANGE, „Agent · Art · Runde n · Sicherheit %“, Tipp öffnet die Karte', kz.indexOf('data-f15karte="pf1" data-f15auskette="1"')>=0 && kz.indexOf('--famb:'+farbeAlpha(FARBE.BLAU, .18))>=0 && kz.indexOf('--rand:'+FARBE.ORANGE)>=0 && kz.indexOf('Erfassungs-Agent · Klärung · Runde 1 · 30 %')>=0 && kz.indexOf('Trainer · Ziel · Runde 2 · 80 %')>=0, kz);
pruef('§4.3 laufende Überarbeitung: gestrichelte Zeile mit Ladekreis „Pipeline-Agent arbeitet an Runde 2 …“, nicht antippbar', kz.indexOf('class="f15-lauf" data-f15laeuft="pf2"')>=0 && kz.indexOf('Pipeline-Agent arbeitet an Runde 2 …')>=0 && kz.indexOf('data-f15karte="pf2"')<0 && kz.indexOf('f15-kreis')>=0);
var kl=kettenListeHtml({ karte:null, kontext:'plus' });
pruef('Kettenliste: Gruppe Aktuelle Kette zeigt die Agenten-Karten (Anzahl 3, keine Sortierauswahl)', kl.indexOf('data-f15karte="pf1"')>=0 && /<span class="anz">3<\/span>/.test(kl) && kl.indexOf('data-klsort="kette"')<0, kl.slice(0, 400));
S.ui.tkWahl=null; saveUi();
pruef('Ganzer Tag: Kettenliste wieder mit App-Karten, Chip-Zahl bleibt', kettenListeHtml({ karte:null }).indexOf('data-f15karte=')<0 && tageskettenChipsHtml().indexOf('📬 Agenten-Karten · 3')>=0);

// ══ §5 · Karten-Ansicht ══
var KT={ id:'k-erf', Kanal:'Erfassungs-Agent', Agent:'Erfassungs-Agent', Abteilung:[{ id:'a-off', anzeige:'Office' }], Projekt:[], Bereich:'dfm', Tabelle:'Chat · Erfassungs-Agent', Reihenfolge:1, Rolle:'Eingangstür' };
var KP={ id:'k-pipe', Kanal:'Pipeline-Agent', Agent:'Pipeline-Agent', Abteilung:[{ id:'a-sales', anzeige:'Sales' }], Projekt:[], Bereich:'dfm', Tabelle:'Chat · Pipeline-Agent', Reihenfolge:1, Rolle:'Pipeline' };
F7.lager.abteilungen={ ts:Date.now(), daten:[{ id:'a-off', Name:'Office', Emoji:'🗄️' },{ id:'a-sales', Name:'Sales', Emoji:'🤝' }], fehler:'' };
F7.lager.chatKanaele={ ts:Date.now(), daten:[KT, KP], fehler:'' };
var H1={ id:'h1', 'Gespräch':'g-ak', 'Gesprächstitel':'Agenten-Karten', Von:'Erfassungs-Agent', Art:'Hinweis', Anlass:'Postfach', Status:'offen', Zeitstempel:'2026-10-22T19:57:50.000Z', Text:'📬 Neue Agenten-Karte: Termin mit Christian verschoben – welcher Christian? · Klärung', Postfach:[{ id:'pf1', anzeige:'Termin' }] };
var A1={ id:'a1', 'Gespräch':'g-x', 'Gesprächstitel':'Mails morgen', Von:'Pipeline-Agent', Art:'Antwort', Anlass:'Chat', Status:'offen', Zeitstempel:'2026-10-22T19:48:00.000Z', Text:'Alles klar, ich lege mich nicht fest …', Postfach:[] };
F12.ungelesen={ 'k-erf':[H1], 'k-pipe':[A1] }; F12.badge={ 'k-erf':1, 'k-pipe':1 }; S.meta.chatGesehen={};
pruef('§5.5 Optionen: Zeilen unter „Optionen:“ bis zur Leerzeile', f15Optionen(PF1['Output/Entwurf']).join('|')==='Screenshot erneut hochladen und Christian nennen|Nur als Notiz zur Person ablegen|Verwerfen' && f15Optionen('ohne Optionen\n- a\n- b').length===0 && f15Optionen('Optionen:\n- A\n- B\n\n- C').length===2, JSON.stringify(f15Optionen(PF1['Output/Entwurf'])));
pruef('§5.4 Output ohne den Optionen-Block', f15OutputOhneOptionen(PF1['Output/Entwurf']).indexOf('Optionen:')<0 && f15OutputOhneOptionen(PF1['Output/Entwurf']).indexOf('Danach geht es weiter.')>=0);
_gesendet.length=0;
f15KarteOeffnen('pf1', { ausKette:true }); drain();
pruef('§5.1 Vollbild-Ebene agentenkarte offen', e1Art()==='agentenkarte' && E1_ARTEN.indexOf('agentenkarte')>=0 && F15.karte && F15.karte.id==='pf1');
var hb=el('akBody').innerHTML;
pruef('§5.2 Kopf: Art als Titel, „Agent · Sicherheit %“, Schließen', hb.indexOf('<b>Klärung</b>')>=0 && hb.indexOf('Erfassungs-Agent · 30 %')>=0 && hb.indexOf('>Schließen</button>')>=0 && hb.indexOf('data-e1zu="1"')>=0, hb.slice(0, 300));
pruef('§5.3 ohne frühere Runde: „Runde 1 · <Uhrzeit> · keine frühere Runde“', /Runde 1 · \d\d:\d\d · keine frühere Runde/.test(hb), hb.slice(hb.indexOf('f15-verlauf'), hb.indexOf('f15-verlauf')+120));
pruef('§5.4 Block Karte: Titel, Output, Begründung grau', hb.indexOf('Termin mit Christian verschoben – welcher Christian?')>=0 && hb.indexOf('Begründung: Datei fehlt, Person mehrdeutig.')>=0);
pruef('§5.5 drei Options-Knöpfe über volle Breite, keiner gewählt', (hb.match(/class="f15-opt"/g)||[]).length===3 && hb.indexOf('f15-opt an')<0);
pruef('§5.6 Antwortfeld 16 px (Klasse f15-text) und Datei-Hinweis', hb.indexOf('<textarea class="f15-text" id="f15Text" data-f15text="1"')>=0 && hb.indexOf('Datei per Ziehen oder Einfügen')>=0);
pruef('§5.7 Knopfleiste: ✅ Freigeben · ↻ Senden (gesperrt) · ✕ Ablehnen; kein „gesehen“', hb.indexOf('data-f15ent="freigegeben">✅ Freigeben')>=0 && /class="k s aus" data-f15ent="angepasst">↻ Senden/.test(hb) && hb.indexOf('data-f15ent="abgelehnt">✕ Ablehnen')>=0 && hb.indexOf('gesehen')<0);
pruef('§4.7 Öffnen markiert die Hinweis-Zeile gelesen (Status erledigt, aus der Badge-Runde entfernt)', gesendet('datensatz_aendern').some(function(g){ return g.args.tabelle==='Chat · Erfassungs-Agent' && g.args.id==='h1' && g.args.felder.Status==='erledigt'; }) && (F12.ungelesen['k-erf']||[]).length===0 && F12.badge['k-erf']===0, JSON.stringify(_gesendet));
f15OptionToggle(0); f15OptionToggle(2); hb=el('akBody').innerHTML;
pruef('§5.5 Mehrfachwahl: gewählte Optionen BLAU mit ✓, Senden aktiv', F15.karte.optionen.length===2 && (hb.match(/class="f15-opt an"/g)||[]).length===2 && hb.indexOf('✓ Screenshot erneut hochladen und Christian nennen')>=0 && /class="k s" data-f15ent="angepasst">↻ Senden/.test(hb));
f15OptionToggle(2);
pruef('§5.5 Tipp schaltet aus', F15.karte.optionen.length===1 && F15.karte.optionen[0]==='Screenshot erneut hochladen und Christian nennen');
// Verlauf über Vorgänger
F15.pf.pf0={ ts:Date.now(), r:{ id:'pf0', Titel:'Zielsteuerung (alt)', Agent:'Trainer', Art:'Ziel', 'Output/Entwurf':'Erster Vorschlag.', 'Pascals Anpassung':'bitte 10 % mehr', Runde:1, 'Vorgänger':[], Status:'erledigt', Entscheidung:'angepasst', erstellt_am:'2026-10-21T10:00:00.000Z' } };
f15KarteOeffnen('pf3', {}); drain(); hb=el('akBody').innerHTML;
pruef('§5.3 Verlauf eingeklappt: „Runde 2 · HH:MM · 1 frühere Runde ▾“', /Runde 2 · \d\d:\d\d · 1 frühere Runde ▾/.test(hb) && f15VorgaengerKette(PF3).length===1 && f15VorgaengerKette(PF3)[0].id==='pf0', hb.slice(hb.indexOf('f15-verlauf'), hb.indexOf('f15-verlauf')+160));
F15.verlaufAuf.pf3=true; f15KarteRendern(); hb=el('akBody').innerHTML;
pruef('§5.3 aufgeklappt: Runde 1 mit Zeitpunkt, Output gekürzt und Pascals Anpassung', hb.indexOf('Runde 1 · 21.10. ')>=0 && hb.indexOf('Erster Vorschlag.')>=0 && hb.indexOf('✏️ bitte 10 % mehr')>=0, hb.slice(hb.indexOf('f15-verlauf'), hb.indexOf('f15-verlauf')+400));

// ══ §6b · ↻ Senden ══
var PF4={ id:'pf4', Titel:'Neu: Karte aus Entwurf', Agent:'Trainer', Art:'Plan', 'Output/Entwurf':'Aufgabe: Testkarte aus Anpassung\n- Soll-Minuten: 20\n\nOptionen:\n- A\n- B', 'Sicherheit %':60, Dringlichkeit:10, Status:'offen', Runde:1, 'Vorgänger':[], erstellt_am:'2026-10-22T09:00:00.000Z' };
F7.lager.postfach={ ts:Date.now(), daten:[PF1, PF2, PF3, PF4], fehler:'' }; S.ui.tkWahl='agentenkarten'; saveUi();
f15KarteOeffnen('pf4', { ausKette:true }); drain();
var K=F15.karte; K.optionen=['A']; K.text='Bitte Soll auf 25 Minuten.'; el('f15Text').value=K.text; K.datei={ name:'261022_2157_Einfuegen.png', typ:'image/png', groesse:10, base64:'QUJD', status:'angehaengt' };
var n0=S.karten.length; _gesendet.length=0; _hochgeladen.length=0; _toasts.length=0;
pruef('§6.1 Pascals Anpassung = „✓ Option“-Zeilen + Leerzeile + Freitext', f15Anpassung(K)==='✓ A\n\nBitte Soll auf 25 Minuten.');
f15Entscheiden('angepasst'); drain(10);
var inb=gesendet('app:erfassen'), ae=gesendet('datensatz_aendern').filter(function(g){ return g.args.tabelle==='Postfach'; });
pruef('§6.1 Datei zuerst hochgeladen, dann Inbox-Eintrag mit pfad, anpassung = Karte', _hochgeladen.length===1 && inb.length===1 && /_Einfuegen\.png$/.test(String(inb[0].args.pfad)) && inb[0].args.anpassung==='pf4', JSON.stringify(inb.map(function(g){ return g.args; })));
pruef('§6.1 Karte: Entscheidung angepasst, Status erledigt, Pascals Anpassung; genau eine Änderung', ae.length===1 && ae[0].args.id==='pf4' && ae[0].args.felder.Entscheidung==='angepasst' && ae[0].args.felder.Status==='erledigt' && ae[0].args.felder['Pascals Anpassung']==='✓ A\n\nBitte Soll auf 25 Minuten.', JSON.stringify(ae.map(function(g){ return g.args.felder; })));
pruef('§6.1 Senden legt keine App-Karte aus dem Entwurf an', S.karten.length===n0);
pruef('Reihenfolge: Upload vor dem Eintrag vor der Entscheidung', _gesendet.findIndex(function(g){ return g.werkzeug==='app:erfassen'; }) < _gesendet.findIndex(function(g){ return g.werkzeug==='datensatz_aendern' && g.args.tabelle==='Postfach'; }));
pruef('§4.4 nach der Entscheidung aus der Kette: nächste offene Karte (pf2 läuft → pf1)', e1Art()==='agentenkarte' && F15.karte && F15.karte.id==='pf1' && F15.karte.ausKette===true, F15.karte && F15.karte.id);
pruef('Toast „↻ Gesendet · Datei übertragen · neue Runde“', _toasts.some(function(t){ return t.m==='↻ Gesendet · Datei übertragen · neue Runde'; }));
// Upload-Fehler beim Senden: keine Entscheidung, Karte bleibt offen
K=F15.karte; K.text='x'; el('f15Text').value='x'; K.datei={ name:'a.png', typ:'image/png', groesse:10, base64:'QUJD', status:'angehaengt' }; _gesendet.length=0; _hochladenFehler='weg';
f15Entscheiden('angepasst'); drain(10);
pruef('§6.1 Upload-Fehler: keine Entscheidung, Kachel rot, Ansicht bleibt', gesendet('datensatz_aendern').length===0 && gesendet('app:erfassen').length===0 && K.datei.status==='fehler' && e1Art()==='agentenkarte' && F15.karte.id==='pf1');
_hochladenFehler=null;
// Freigeben mit Optionen und Freitext → zusätzlich in Pascals Anpassung
K=F15.karte; K.datei=null; K.optionen=['Verwerfen']; K.text=''; el('f15Text').value=''; _gesendet.length=0;
f15Entscheiden('freigegeben'); drain(10);
ae=gesendet('datensatz_aendern').filter(function(g){ return g.args.tabelle==='Postfach'; });
pruef('§5.7 Freigeben: Entscheidung freigegeben, Pascals Anpassung = „✓ Verwerfen“', ae.length===1 && ae[0].args.felder.Entscheidung==='freigegeben' && ae[0].args.felder['Pascals Anpassung']==='✓ Verwerfen' && gesendet('app:erfassen').length===0, JSON.stringify(ae.map(function(g){ return g.args.felder; })));
pruef('§4.4 danach weiter zur nächsten Karte (pf3)', F15.karte && F15.karte.id==='pf3', F15.karte && F15.karte.id);
F15.karte.ausKette=false; _gesendet.length=0;
f15Entscheiden('freigegeben'); drain(10);
pruef('nicht aus der Kette: Ebene schließt', e1Art()===null && F15.karte===null);

// ══ §7 · Postfach = ungelesene Nachrichten ══
var N1={ id:'n1', 'Gespräch':'g-x', Von:'Pascal', Art:'Nachricht', Anlass:'Chat', Status:'offen', Zeitstempel:'2026-10-22T19:49:00.000Z', Text:'eigene Nachricht', Postfach:[] };
F12.ungelesen={ 'k-erf':[H1], 'k-pipe':[A1, N1] }; F12.badge={ 'k-erf':1, 'k-pipe':1 }; H1.Status='offen'; S.meta.chatGesehen={};
F7.lager.postfach={ ts:Date.now(), daten:[PF1, PF2, PF3], fehler:'' };
var uz=f15UngelesenZeilen();
pruef('§7.1 nur Antwort/Hinweis mit Status offen, neueste zuerst', uz.length===2 && uz[0].r.id==='h1' && uz[1].r.id==='a1' && uz[0].karte==='pf1' && uz[1].karte===null, JSON.stringify(uz.map(function(e){ return e.r.id; })));
seiteZeigen('postfach'); var hp=el('postfachBody').innerHTML;
pruef('§7.1 Gruppe „Ungelesen · aus deinen Chats“ mit zwei Zeilen', hp.indexOf('Ungelesen · aus deinen Chats')>=0 && (hp.match(/class="f15-msg/g)||[]).length===2);
pruef('§7.2 Zeile: Punkt, „Pipeline-Agent · „Mails morgen““, Text, Uhrzeit', hp.indexOf('Pipeline-Agent · „Mails morgen“')>=0 && hp.indexOf('Alles klar, ich lege mich nicht fest …')>=0 && hp.indexOf('<span class="p"></span>')>=0 && /class="z">\d\d:\d\d</.test(hp), hp.slice(0, 900));
pruef('§7.2 Hinweis zu einer Agenten-Karte: Rand ORANGE (Klasse h), Kopf „Erfassungs-Agent · Neue Agenten-Karte“', hp.indexOf('class="f15-msg h" data-f15msg="k-erf|h1" data-f15msgkarte="pf1"')>=0 && hp.indexOf('Erfassungs-Agent · Neue Agenten-Karte')>=0);
pruef('§7.4 Gruppe Agenten-Karten: „📬 3 offene Karten in der Kette“', hp.indexOf('📬 3 offene Karten in der Kette')>=0 && hp.indexOf('data-f15kette="1"')>=0);
pruef('§7.1 keine Postfach-Karten mehr als Liste', hp.indexOf('data-f7pfent')<0 && hp.indexOf('Karten vom Trainer')<0);
pruef('§7.5 Badge des Postfachs = 2 (ungelesene Zeilen), Karten getrennt gezählt', num(S.meta.postfach.offen)===2 && num(S.meta.postfach.karten)===3, JSON.stringify(S.meta.postfach));
f15MsgOeffnen('k-pipe', 'a1', null); drain();
pruef('§7.3 Tipp auf eine Antwort öffnet das Gespräch an dieser Nachricht', e1Art()==='chat' && f12Ui().kanal==='k-pipe' && f12Ui().gespraech==='g-x');
e1Schliessen(); _gesendet.length=0;
f15MsgOeffnen('k-erf', 'h1', 'pf1'); drain();
pruef('§7.3 Tipp auf die Hinweis-Zeile öffnet die Karten-Ansicht und markiert gelesen', e1Art()==='agentenkarte' && F15.karte.id==='pf1' && gesendet('datensatz_aendern').some(function(g){ return g.args.id==='h1' && g.args.felder.Status==='erledigt'; }));
e1Schliessen();
F12.ungelesen={}; F12.badge={}; seiteZeigen('postfach'); hp=el('postfachBody').innerHTML;
pruef('§7.6 leer: „Keine ungelesenen Nachrichten.“', hp.indexOf('Keine ungelesenen Nachrichten.')>=0);
f15KetteOeffnen();
pruef('§7.4 Tipp setzt die Kette „Agenten-Karten“ und öffnet die Karten-Ebene', S.ui.tkWahl==='agentenkarten' && e1Art()==='plus' && seiteAktuell()==='fokus');
e1Schliessen(); S.ui.tkWahl=null; saveUi();

// ══ Version ══
pruef('App 4.1.4 · Build 2026-10-22-39', APP_VERSION==='4.1.4' && APP_BUILD==='2026-10-22-39', APP_VERSION+' / '+APP_BUILD);
toast=_toastAlt;
suiteEnde('Hotfix 15 · Postfach, Agenten-Karten, Erfassung (4.1.4)');
