/* Suite 5.6 · Fokus App 4.4 (Auftrag 261104 §6/§8): A Zeitstempel je Feld (feldTs) · B Änderungen aus FocusSystem ohne Freigabe (erstellt, geändert mit vorher/nachher,
   archiviert aus Kette und Fokus, erledigt) · C Konflikt: der jüngere Stand gewinnt · D laufende Uhr: Status wartet bis zum Stopp · E Unteraufgaben neu/geändert/entfernt ·
   F Rückgängig als Gegenbuchung mit Spur (app_rueckgaengig) · G Postfach-Filter „🔄 Automatisch“ mit drei Gruppen · H Ketten-Paket unter Automatisch geändert ·
   I Freigabe im Agenten-Chat = Postfach (nicht mehr unter Offen) · J hf44Holen mit Stand · K Version 4.5.0. Aufruf: jsc tests/v56-zweiwege.js */
var _toasts=[]; toast=function(m){ _toasts.push(String(m)); }; haptik=function(){}; var confirm=function(){ return true; };
fsliveStumm();
var src=readFile('index.html');
uuid=function(){ return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c){ var r=Math.random()*16|0; return (c==='x' ? r : (r&3|8)).toString(16); }); };
function _k(id){ return S.karten.find(function(x){ return x.id===id; }); }
var K=testTag(); S.ui.spezial=null; seiteZeigen('fokus'); var heute=heuteApp(); S.meta.automatisch=[]; S.meta.statusWartend={}; S.meta.aenderungenStand=null;
var _gesendet44=[]; FSLive.senden=function(w,a){ _gesendet44.push({ w:w, a:a }); return Promise.resolve({ ok:true }); };
function A(o){ return Object.assign({ bereich:'dfm', tabelle:'aufgaben', art:'karte', familie:'dfm', neu:false, zeitpunkt:jetztIso(), akteur:'Claude Desktop (FocusSystem)', quelle:'claude_chat', protokollBis:1, felder:[], karte:{} }, o); }
function spaeter(min){ return new Date(Date.now()+min*60000).toISOString(); }
function frueher(min){ return new Date(Date.now()-min*60000).toISOString(); }

// ══ A · Zeitstempel je Feld ══
K.d.letzteBearbeitung=frueher(60); K.d.feldTs=null; entwurf=JSON.parse(JSON.stringify(K.d)); entwurfSubs=[]; entwurfNeu=false; entwurf.titel='Neuer Titel'; entwurf.sollMin=45; closeSheet=closeSheet||function(){}; detailSpeichern();
var kd=_k(K.d.id);
pruef('A1 Bearbeiten-Fenster schreibt feldTs nur für die geänderten Felder (titel, sollMin), andere Felder fallen auf letzteBearbeitung zurück', kd.feldTs && kd.feldTs.titel && kd.feldTs.sollMin && !kd.feldTs.notiz && hf44FeldStand(kd, 'titel')>=hf44FeldStand(kd, 'notiz') && hf44FeldStand(kd, 'notiz')===Date.parse(kd.letzteBearbeitung) && hf44FeldStand(kd, 'titel')===Date.parse(kd.feldTs.titel), JSON.stringify(kd.feldTs));
S.fokus={ laeuft:false }; karteAbhaken(K.p.id); pruef('A2 Abhaken setzt feldTs.status', K.p.status==='erledigt' && !!(K.p.feldTs && K.p.feldTs.status)); karteWiederOeffnen(K.p.id);
toggleFreeze(K.e.id); pruef('A3 Einfrieren setzt feldTs.freeze', K.e.freeze===true && !!(K.e.feldTs && K.e.feldTs.freeze)); toggleFreeze(K.e.id);

// ══ B · Änderungen aus FocusSystem ohne Freigabe ══
var n0=S.karten.length;
hf44Anwenden([A({ neu:true, appId:'neu-44', dbId:'neu-44', karte:{ id:'neu-44', titel:'Aus FocusSystem', status:'offen', domain:'dfm', sollMin:25, matrixFeld:'ziel', art:'aufgabe', prio:4, belastung:1, faelligkeit:heute, projekt:'Projekt Q', kurzfassung:null, infos:[] } })]);
var kn=_k('neu-44');
pruef('B1 neue Karte mit App-ID = id erscheint ohne Freigabe (Felder übernommen, std42), Eintrag „Automatisch erstellt“ mit Quelle Claude Chat', S.karten.length===n0+1 && !!kn && kn.titel==='Aus FocusSystem' && kn.sollMin===25 && kn.matrixFeld==='ziel' && kn.prio===4 && kn.projekt==='Projekt Q' && kn.std42===true && S.meta.automatisch.some(function(e){ return e.art==='erstellt' && e.appId==='neu-44' && e.quelle==='claude_chat'; }));
kd.feldTs={}; kd.letzteBearbeitung=frueher(120);
hf44Anwenden([A({ appId:kd.id, dbId:kd.id, zeitpunkt:spaeter(1), felder:[{ feld:'titel', alt:kd.titel, neu:'Titel aus FS', zeitpunkt:spaeter(1) },{ feld:'faelligkeit', alt:kd.faelligkeit, neu:'2026-11-06', zeitpunkt:spaeter(1) }], karte:{ titel:'Titel aus FS', faelligkeit:'2026-11-06', status:'offen' } })]);
var eG=S.meta.automatisch.filter(function(e){ return e.art==='geaendert' && e.appId===kd.id; }).pop();
pruef('B2 Titel und Deadline aus FocusSystem übernommen, Eintrag „Automatisch geändert“ mit vorher/nachher je Feld', kd.titel==='Titel aus FS' && kd.faelligkeit==='2026-11-06' && !!eG && eG.felder.length===2 && eG.felder[0].feld==='titel' && eG.felder[0].alt==='Neuer Titel' && eG.felder[0].neu==='Titel aus FS');
S.tagesketten=[{ id:k43KetteId('fokus1', heute), name:'Fokus 1', art:'block', datum:heute, block:'fokus1', karten:[K.e.id], plan:{}, quelle:'tagesplan' }]; DB.set('tagesketten', S.tagesketten); if(!ketteHat(K.e.id)) ketteToggle(K.e.id); S.fokus={ karteId:K.e.id, laeuft:false, startMs:0 }; K.e.feldTs={}; K.e.letzteBearbeitung=frueher(120);
hf44Anwenden([A({ appId:K.e.id, dbId:K.e.id, zeitpunkt:spaeter(1), felder:[{ feld:'status', alt:'offen', neu:'archiviert', zeitpunkt:spaeter(1) }], karte:{ status:'archiviert' } })]);
pruef('B3 Status Archiv aus FocusSystem: Karte archiviert (Grund „Archiv aus FocusSystem“), aus Kette und Fokus verschwunden, Eintrag „Automatisch archiviert“', K.e.status==='archiviert' && /Archiv aus FocusSystem/.test(K.e.archivGrund) && !S.tagesketten[0].karten.length && !ketteHat(K.e.id) && !(S.fokus && S.fokus.karteId===K.e.id) && S.meta.automatisch.some(function(e){ return e.art==='archiviert' && e.appId===K.e.id; }));
K.a.feldTs={}; K.a.letzteBearbeitung=frueher(120); var nI=(S.intraday||[]).length;
hf44Anwenden([A({ appId:K.a.id, dbId:K.a.id, zeitpunkt:spaeter(1), felder:[{ feld:'status', alt:'offen', neu:'erledigt', zeitpunkt:spaeter(1) }], karte:{ status:'erledigt' } })]);
pruef('B4 Status Erledigt aus FocusSystem: Karte erledigt (Tag gesetzt), keine Punkte gebucht (❓ im Bericht), Eintrag geändert status offen → erledigt', K.a.status==='erledigt' && K.a.tagId===aktuelleTagId() && (S.intraday||[]).length===nI && S.meta.automatisch.some(function(e){ return e.appId===K.a.id && e.felder.some(function(f){ return f.feld==='status' && f.neu==='erledigt'; }); }));

// ══ C · Konflikt: der jüngere Stand gewinnt ══
kd.titel='App-Titel jünger'; kd.sollMin=45; hf44FeldTs(kd, ['titel','sollMin']);
hf44Anwenden([A({ appId:kd.id, dbId:kd.id, zeitpunkt:frueher(5), felder:[{ feld:'titel', alt:'x', neu:'FS-Titel älter', zeitpunkt:frueher(5) },{ feld:'sollMin', alt:45, neu:60, zeitpunkt:frueher(5) }], karte:{ titel:'FS-Titel älter', sollMin:60 } })]);
pruef('C1 älterer FS-Stand (vor 5 Min) für in der App jüngere Felder (titel, sollMin eben geändert) wird verworfen, kein Eintrag', kd.titel==='App-Titel jünger' && kd.sollMin===45 && !S.meta.automatisch.some(function(e){ return e.appId===kd.id && e.felder.some(function(f){ return f.neu==='FS-Titel älter'; }); }));
kd.feldTs.sollMin=frueher(30);
hf44Anwenden([A({ appId:kd.id, dbId:kd.id, zeitpunkt:frueher(5), felder:[{ feld:'sollMin', alt:45, neu:60, zeitpunkt:frueher(5) }], karte:{ sollMin:60 } })]);
pruef('C2 FS-Stand jünger als die letzte App-Änderung des Felds → übernommen', kd.sollMin===60);
pruef('C3 Dienst-Seite (Code): Status beidseitig, Zeile jünger als feldTs.status → Status wird nicht zurückgeschrieben (abgleich.js feldStand/SPALTE_APP)', /export const feldStand = \(k, spalte, stand\)/.test(readFile('../../../FocusSystem/dienst/buchung/abgleich.js')) && /if \(neu\.status !== undefined && !wertGleich\(z\.status, neu\.status\) && !\(feldStand\(k, 'status', stand\) > geaendertMs\)\) delete neu\.status;/.test(readFile('../../../FocusSystem/dienst/buchung/abgleich.js')));

// ══ D · laufende Uhr ══
var kL=Object.assign(neueKarte({ titel:'Läuft 44', domain:'dfm' }), { id:'kl-44', status:'offen', std42:true, art:'aufgabe', projekt:'P', matrixFeld:'werkzeug' }); S.karten.push(kL); saveKarten(); S.fokus={ karteId:'kl-44', laeuft:true, startMs:Date.now()-5*60000, sessionSek:0 };
hf44Anwenden([A({ appId:'kl-44', dbId:'kl-44', zeitpunkt:spaeter(1), felder:[{ feld:'status', alt:'offen', neu:'archiviert', zeitpunkt:spaeter(1) }], karte:{ status:'archiviert' } })]);
pruef('D1 läuft die Uhr, wartet das Archiv (meta.statusWartend), Karte bleibt offen', kL.status==='offen' && S.meta.statusWartend['kl-44'] && S.meta.statusWartend['kl-44'].status==='archiviert' && S.fokus.laeuft);
fokusZeitEinbuchen();
pruef('D2 nach dem Stopp: Archiv übernommen, Eintrag archiviert, Sitzung bleibt', kL.status==='archiviert' && !S.meta.statusWartend['kl-44'] && (S.intraday||[]).some(function(e){ return e.typ==='timer' && e.kartenId==='kl-44'; }) && S.meta.automatisch.some(function(e){ return e.art==='archiviert' && e.appId==='kl-44'; }));
S.fokus={ laeuft:false };

// ══ E · Unteraufgaben aus FocusSystem ══
var nU=(S.unteraufgaben||[]).length;
hf44Anwenden([A({ tabelle:'unteraufgaben', art:'unteraufgabe', neu:true, appId:'ua-44', dbId:'ua-44', karte:{ id:'ua-44', titel:'Neue UA aus FS', sollMin:10, bonusPunkte:20, optional:false, entfernt:false, eltern:kd.id } })]);
var uN=(S.unteraufgaben||[]).find(function(u){ return u.id==='ua-44'; });
pruef('E1 neue Unteraufgabe aus FocusSystem an der Karte (App-ID = id), Eintrag erstellt', (S.unteraufgaben||[]).length===nU+1 && !!uN && uN.parentId===kd.id && uN.sollMin===10 && uN.bonusPunkte===20 && S.meta.automatisch.some(function(e){ return e.art==='erstellt' && e.appId==='ua-44' && e.unteraufgabe; }));
hf44Anwenden([A({ tabelle:'unteraufgaben', art:'unteraufgabe', appId:'ua-44', dbId:'ua-44', zeitpunkt:spaeter(1), felder:[{ feld:'titel', alt:'Neue UA aus FS', neu:'UA geändert', zeitpunkt:spaeter(1) },{ feld:'sollMin', alt:10, neu:15, zeitpunkt:spaeter(1) }], karte:{ titel:'UA geändert', sollMin:15, bonusPunkte:20, optional:false, entfernt:false, eltern:kd.id } })]);
pruef('E2 Unteraufgabe geändert (Titel, Minuten), Eintrag geändert mit vorher/nachher', uN.titel==='UA geändert' && uN.sollMin===15 && S.meta.automatisch.some(function(e){ return e.art==='geaendert' && e.appId==='ua-44' && e.felder.length===2; }));
hf44Anwenden([A({ tabelle:'unteraufgaben', art:'unteraufgabe', appId:'ua-44', dbId:'ua-44', zeitpunkt:spaeter(2), felder:[{ feld:'entfernt', alt:false, neu:true, zeitpunkt:spaeter(2) }], karte:{ titel:'UA geändert', sollMin:15, bonusPunkte:20, optional:false, entfernt:true, eltern:kd.id } })]);
pruef('E3 Unteraufgabe in FocusSystem entfernt → in der App archiviert (meta.entfernteUnteraufgaben), nichts gelöscht', !(S.unteraufgaben||[]).some(function(u){ return u.id==='ua-44'; }) && (S.meta.entfernteUnteraufgaben||[]).some(function(e){ return e.id==='ua-44'; }));

// ══ F · Rückgängig ══
_gesendet44.length=0; var eR=S.meta.automatisch.filter(function(e){ return e.art==='geaendert' && e.appId===kd.id && e.felder.some(function(f){ return f.feld==='titel'; }); })[0];
hf44Rueckgaengig(eR.id);
pruef('F1 Rückgängig (geändert): voriger Stand in der App, Gegenbuchung nach FocusSystem mit Quelle app_rueckgaengig (Originalnamen), Eintrag bleibt und trägt rückgängig gemacht', kd.titel==='Neuer Titel' && kd.faelligkeit==null && !!eR.rueckgaengigTs && _gesendet44.some(function(g){ return g.w==='datensatz_aendern' && g.a.quelle==='app_rueckgaengig' && g.a.felder.Titel==='Neuer Titel' && ('Deadline' in g.a.felder) && g.a.felder.Deadline===null && g.a.id===kd.id; }) && S.meta.automatisch.some(function(e){ return e.id===eR.id; }), JSON.stringify(_gesendet44));
var eA=S.meta.automatisch.filter(function(e){ return e.art==='archiviert' && e.appId===K.e.id; })[0]; _gesendet44.length=0; hf44Rueckgaengig(eA.id);
pruef('F2 Rückgängig (archiviert): Karte wieder offen, Status Offen nach FocusSystem', K.e.status==='offen' && _gesendet44.some(function(g){ return g.a.felder.Status==='Offen' && g.a.quelle==='app_rueckgaengig'; }) && !!eA.rueckgaengigTs);
var eN=S.meta.automatisch.filter(function(e){ return e.art==='erstellt' && e.appId==='neu-44'; })[0]; _gesendet44.length=0; hf44Rueckgaengig(eN.id);
pruef('F3 Rückgängig (erstellt): Karte archiviert (nicht gelöscht), Status Archiv nach FocusSystem; ein zweites Rückgängig tut nichts', kn.status==='archiviert' && _gesendet44.some(function(g){ return g.a.felder.Status==='Archiv'; }) && hf44Rueckgaengig(eN.id)===false);
pruef('F4 Dienst (Code): quelle app_rueckgaengig → Akteur „Fokus App · Rückgängig“, Protokollzeilen der App gelten nicht als automatisch', /const rueckgaengig = args && args\.quelle === 'app_rueckgaengig'; if \(rueckgaengig\) delete args\.quelle;/.test(readFile('../../../FocusSystem/dienst/server.js')) && /istAutomatisch = \(akteur\) => \{ const a = String\(akteur \?\? ''\); return !\/\^Dienst Buchung\/i\.test\(a\) && !\/\^Fokus App\/i\.test\(a\); \}/.test(readFile('../../../FocusSystem/dienst/aenderungen.js')));

// ══ G · Postfach „🔄 Automatisch“ ══
F16.pfFilter='automatisch'; var hp=f16PostfachHtml();
pruef('G1 vierter Filter „🔄 Automatisch · n“ neben Freigegeben · Offen · Chats; drei Gruppen mit Anzahl, standardmäßig zu', /🔄 Automatisch/.test(hp) && /🗂️ Freigegeben/.test(hp) && /📬 Offen/.test(hp) && /💬 Chats/.test(hp) && /data-hf44grp="erstellt"[^>]*>▸ Automatisch erstellt <span>\d+<\/span>/.test(hp) && /▸ Automatisch geändert <span>\d+/.test(hp) && /▸ Automatisch archiviert <span>\d+/.test(hp) && !/data-hf44rg/.test(hp));
hf44AutoZu().geaendert=false; hp=f16PostfachHtml();
pruef('G2 aufgeklappt: Eintrag mit Titel, Quelle, Uhrzeit, App-ID, vorher (durchgestrichen) → nachher, Knopf ↶ Rückgängig; rückgängig gemachter Eintrag gedimmt ohne Knopf', /▾ Automatisch geändert/.test(hp) && /<div class="hf44-diff"><span>Soll-Minuten<\/span><span><span class="alt">45<\/span> → <span class="neu">60<\/span>/.test(hp) && /data-hf44rg="/.test(hp) && /class="hf44-ae rg"[\s\S]*?rückgängig gemacht/.test(hp) && /Claude Chat · \d\d:\d\d · App-ID /.test(hp));
pruef('G3 Zielbild-13-CSS: Gruppe, Eintrag mit türkisem Rand, archiviert gelb, Diff rot/grün', /\.hf44-ae\{[^}]*border-left:4px solid #5eead4/.test(src) && /\.hf44-ae\.arch\{border-left-color:#f2b84b\}/.test(src) && /\.hf44-diff \.alt\{color:#f87171;text-decoration:line-through\}/.test(src) && /\.hf44-diff \.neu\{color:#3ecf8e\}/.test(src));

// ══ H · Ketten-Paket ohne Freigabe, unter Automatisch geändert ══
var nAuto=S.meta.automatisch.length; var resK=syncImport(JSON.stringify({ appVersion:APP_VERSION, karten:[{ id:'t-priv', titel:'Private Aufgabe' }], tagesketten:[{ id:'tk-fokus1', name:'Fokus 1', karten:[K.d.id] }] }));   /* wie Suite v51/v53: ein reines Ketten-Paket ohne karten weist das Tor „Keine Karten im Paket“ seit v1.x ab (❓ Bericht) */
pruef('H1 Ketten-Paket läuft ohne Freigabe und erscheint als „Ketten-Paket · 1 Kette“ unter Automatisch geändert (ohne Rückgängig)', resK && !resK.fehler && !resK.freigabeNoetig && S.meta.automatisch.length===nAuto+1 && /^Ketten-Paket · 1 Kette$/.test(S.meta.automatisch[nAuto].titel) && S.meta.automatisch[nAuto].keinRueckgaengig===true);

// ══ I · Freigabe im Agenten-Chat = Postfach ══
var pf={ id:'pf-44', Titel:'Neu: Chat-Karte', Agent:'Trainer', Art:'Plan', Dringlichkeit:40, Status:'offen', 'Output/Entwurf':'Aufgabe: Chat-Karte\n- Projekt: P\n- Soll-Minuten: 20' };
F7.laeuft={}; F7.lager.postfach={ ts:Date.now(), daten:[pf], fehler:'' }; HF26.voll={}; HF26.pfLade={}; f12PfRecord=function(id){ return id==='pf-44' ? pf : null; };
var vorher=f15KetteKarten().some(function(r){ return r.id==='pf-44'; }); f12PfFreigeben('pf-44', false); if(HF29.zu && HF29.zu.pfId==='pf-44'){ HF29.zu.ziel={ art:'block', block:'fokus1' }; hf29ZuordnenGo(); }   /* Hotfix 29 §1.3: Kasten → Zuordnung → Freigeben · Fokus 1 */ warten();
pruef('I1 Freigabe im Agenten-Chat (f12PfFreigeben → f7PfEntscheiden): Karte angelegt, Eintrag nicht mehr unter „📬 Offen“ (Lager bereinigt, Status erledigt gesendet)', vorher && !f15KetteKarten().some(function(r){ return r.id==='pf-44'; }) && !!(S.meta.postfachKarten||{})['pf-44'] && _gesendet44.some(function(g){ return g.w==='datensatz_aendern' && g.a.id==='pf-44' && g.a.felder.Status==='erledigt' && g.a.felder.Entscheidung==='freigegeben'; }) && /f7PfEntscheiden\(id, 'freigegeben', \{ datensatz:r, vonChat:true \}\)/.test(src));

// ══ J · Holen mit Stand ══
var _gelesen44=[]; FSLive.appLesen=function(p){ _gelesen44.push(p); if(p==='aenderungen') return Promise.resolve({ fuehrend:true, stand:{ dfm:100, privat:50 }, aenderungen:[] }); return Promise.resolve({ fuehrend:true, stand:{ dfm:101, privat:50 }, aenderungen:[A({ appId:kd.id, dbId:kd.id, zeitpunkt:spaeter(3), felder:[{ feld:'notiz', alt:null, neu:'Notiz aus FS', zeitpunkt:spaeter(3) }], karte:{ notiz:'Notiz aus FS' } })] }); };
FSLive.gekoppelt=function(){ return true; }; FSLive.nichtFuehrend=function(){ return false; }; HF44.laeuft=false; S.meta.aenderungenStand=null;
hf44Holen(); warten(); warten(); var st1=JSON.stringify(hf44Stand()); hf44Holen(); warten(); warten();
pruef('J1 erster Aufruf ohne Stand holt nur die Stände (nichts nachgespielt), zweiter Aufruf mit ?dfm=100&privat=50 übernimmt die Änderung und setzt den Stand fort', _gelesen44[0]==='aenderungen' && st1==='{"dfm":100,"privat":50}' && _gelesen44[1]==='aenderungen?dfm=100&privat=50' && kd.notiz==='Notiz aus FS' && hf44Stand().dfm===101);

// ══ K · Version ══
pruef('K1 App 4.5.0 · Build 2026-11-10-60 · sw.js Cache fokus4-v4.5.0-1', APP_VERSION==='4.5.0' && APP_BUILD==='2026-11-10-60' && /const CACHE = 'fokus4-v4\.5\.0-1'/.test(readFile('sw.js')));
suiteEnde('Fokus App 4.4 · Zwei-Wege-Abgleich Karten ohne Freigabe (4.5.0)');
