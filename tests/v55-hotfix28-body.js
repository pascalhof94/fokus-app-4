/* Suite 5.5 · Hotfix 28 (Auftrag 261104 §5): A Themen-Kette mit Strich in der Kennung klappt auf (Fokus, Tab), gemeinsame Trennfunktion an allen Stellen aus 1.2 ·
   B jeder Block in „Heute gesamt“ klappbar inkl. laufendem, zugeklappt mit Startzeit der ersten Karte · C Archiv aus FocusSystem übernommen (Paket archivAusFocussystem),
   nicht zurückgeschrieben, bei laufender Uhr erst nach dem Stopp · D @Trainer nicht still (Code Dienst nicht in der App; Antwortzeile als Kurzansicht) ·
   E Kartenformat mit Kurzfassung/Infos · F Tastatur-CSS · G Version 4.3.4, Build 57. Aufruf: jsc tests/v55-hotfix28.js */
var _toasts=[]; toast=function(m){ _toasts.push(String(m)); }; haptik=function(){}; var confirm=function(){ return true; };
fsliveStumm();
var src=readFile('index.html');
uuid=function(){ return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c){ var r=Math.random()*16|0; return (c==='x' ? r : (r&3|8)).toString(16); }); };
function _k(id){ return S.karten.find(function(x){ return x.id===id; }); }
var K=testTag(); S.ui.spezial=null; seiteZeigen('fokus'); var heute=heuteApp();
S.settings.engine43=Object.assign({}, S.settings.engine43, { tagesbloecke:[{ block:'fokus1', von:'09:45', bis:'12:45' },{ block:'fokus2', von:'14:30', bis:'17:00' }] });

// ══ A · Themen-Ketten mit Strich in der Kennung (§1) ══
pruef('A1 hf28Teilen trennt nur am ersten Strich', JSON.stringify(hf28Teilen('kettentab|k43:thema:Sales|Gemeinsamer Vertrieb'))==='["kettentab","k43:thema:Sales|Gemeinsamer Vertrieb"]' && JSON.stringify(hf28Teilen('fokus|tk43-fokus1-2026-11-05'))==='["fokus","tk43-fokus1-2026-11-05"]' && JSON.stringify(hf28Teilen('nurort'))==='["nurort",""]');
K.d.projekt='Gemeinsamer Vertrieb AIC'; K.d.std42=true; K.d.art='aufgabe'; K.d.faelligkeit=heute; saveKarten(); S.tagesketten=[{ id:k43KetteId('fokus1', heute), name:'Fokus 1 · x', art:'block', datum:heute, block:'fokus1', von:'09:45', karten:['t-dfm'], plan:{}, quelle:'tagesplan' }]; DB.set('tagesketten', S.tagesketten); K43K.cache=null;   // Themen-Ketten entstehen aus den Karten von heute
var Kb=k43KettenBauen(true); var th=(Kb.thema||[]).find(function(c){ return /Gemeinsamer Vertrieb/.test(c.id); });
pruef('A2 Themen-Kette trägt die Abteilung|Thema-Kennung (k43:thema:<Abteilung>|<Thema>)', !!th && th.id.indexOf('|')>0 && th.id.indexOf('k43:thema:')===0, th && th.id);
(function(){ S.ui.k43Auf={}; S.ui.tkWahl=null; var ev={ target:{ closest:function(sel){ if(sel==='[data-k43auf]') return { dataset:{ k43auf:'kettentab|'+th.id } }; return null; } }, stopPropagation:function(){} };
  var zOk=false; try{ k43AufSetzen.apply(null, hf28Teilen('kettentab|'+th.id)); zOk=S.ui.k43Auf.kettentab===th.id; }catch(e){}
  pruef('A3 k43AufSetzen mit der getrennten Kennung klappt die Themen-Kette auf (S.ui.k43Auf)', zOk && !!k43KetteFinden(th.id));
  var ht=k43KettenansichtHtml('kettentab'); pruef('A4 aufgeklappte Themen-Kette zeigt ihre Karten (k43KetteHtml) im Ketten-Tab', new RegExp('data-k43kette="'+th.id.replace(/[|.:]/g, function(c){ return '\\'+c; })+'"[^>]*>[\\s\\S]*?data-klkarte="t-dfm"').test(ht));
  S.ui.k43Auf.fokus=th.id; k43Klapp('fokus').thema=true; var hf=k43KettenansichtHtml('fokus'); pruef('A5 dieselbe Kette auf der Fokusseite aufgeklappt mit Karten', /data-klkarte="t-dfm"/.test(hf)); })();
pruef('A6 Handler data-k43auf, data-hf26bc, data-hf26block, data-k43gruppe trennen über hf28Teilen (kein split am Strich mehr)', /hf28Teilen\(z\.dataset\.k43auf\)/.test(src) && /hf28Teilen\(z\.dataset\.hf26bc\)/.test(src) && /hf28Teilen\(z\.dataset\.hf26block\)/.test(src) && /hf28Teilen\(z\.dataset\.k43gruppe\)/.test(src) && !/String\(z\.dataset\.k43auf\)\.split\('\|'\)/.test(src));

// ══ B · „Heute gesamt“: Blöcke klappbar, zugeklappt mit Startzeit (§2) ══
S.tagesketten=[{ id:k43KetteId('fokus1', heute), name:'Fokus 1 · x', art:'block', datum:heute, block:'fokus1', von:'05:00', karten:['t-dfm','t-priv'], plan:{ 't-priv':{ start:'05:10', min:20 }, 't-dfm':{ start:'05:00', min:30 } }, quelle:'tagesplan' },{ id:k43KetteId('fokus2', heute), name:'Fokus 2 · x', art:'block', datum:heute, block:'fokus2', von:'28:50', karten:['t-erh'], plan:{ 't-erh':{ start:'28:55', min:15 } }, quelle:'tagesplan' },{ id:'tk43-tag-'+heute, name:'Heute gesamt · x', art:'tag', datum:heute, karten:['t-dfm','t-priv','t-erh'], plan:{ 't-dfm':{ start:'05:00', min:30 }, 't-priv':{ start:'05:10', min:20 }, 't-erh':{ start:'28:55', min:15 } }, quelle:'tagesplan' }];
DB.set('tagesketten', S.tagesketten); K43K.cache=null; S.ui.hf26BlockAuf={}; S.ui.k43Auf={ kettentab:'tk43-tag-'+heute, fokus:'tk43-tag-'+heute }; S.fokus={ laeuft:false };
var tagK=k43KetteFinden('tk43-tag-'+heute); var h1=hf26TagKetteInhaltHtml(tagK, 'kettentab');
pruef('B1 Standard: laufender Block offen (▾, Karten mit Themen-Unterköpfen), alle anderen zu (▸, nur Kopf); zugeklappt Startzeit der ersten offenen Karte in Blockreihenfolge (Plan-Start), keine Zeile „▸ n Karten“', /<div class="hf26-bh jetzt" data-hf26block="kettentab\|tk43-fokus1-[^"]+" role="button" aria-expanded="true"><b>▾ Fokus 1 · jetzt<\/b><span>ab 05:00 · 2 offen<\/span><\/div><div class="k43-abt">/.test(h1) && /<div class="hf26-bh zu" data-hf26block="kettentab\|tk43-fokus2-[^"]+" role="button" aria-expanded="false"><b>▸ Fokus 2<\/b><span>ab 28:55 · 1 offen<\/span><\/div>/.test(h1) && !/▸ 1 Karte/.test(h1) && !/data-klkarte="t-erh"/.test(h1), h1.slice(0,600));
hf26BlockAuf('kettentab')[k43KetteId('fokus1', heute)]=false; hf26BlockAuf('kettentab')[k43KetteId('fokus2', heute)]=true; var h2=hf26TagKetteInhaltHtml(tagK, 'kettentab');
pruef('B2 auch der laufende Block lässt sich zuklappen; ein künftiger aufklappen (Zustand in S.ui.hf26BlockAuf je Ort)', /<b>▸ Fokus 1 · jetzt<\/b>/.test(h2) && !/data-klkarte="t-dfm"/.test(h2) && /<b>▾ Fokus 2<\/b>/.test(h2) && /data-klkarte="t-erh"/.test(h2));
pruef('B3 Startzeit: ohne Plan-Start das von des Blocks, sonst „—“ (Ohne Block); eine Funktion für Fokusseite und Ketten-Tab (hf26TagKetteHtml → hf26TagKetteInhaltHtml = hf28TagKetteInhaltHtml)', (function(){ var A=hf26TagAbschnitte(tagK), Kx=k43KettenBauen(); var a1=A.find(function(a){ return a.block==='fokus1'; }); var c2=Object.assign({}, tagK, { plan:{} }); return hf28BlockStart(a1, c2, Kx)==='05:00' && hf28BlockStart({ id:'ohne', karten:[], von:null }, tagK, Kx)==='—' && /hf26TagKetteInhaltHtml\(c, ort\)/.test(String(hf26TagKetteHtml)) && hf26TagKetteInhaltHtml===hf26TagKetteInhaltHtml && typeof hf26TagKetteInhaltHtml26==='function'; })());
(function(){ var ev={ target:{ closest:function(sel){ if(sel==='[data-hf26block]') return { dataset:{ hf26block:'fokus|'+k43KetteId('fokus1', heute) }, getAttribute:function(){ return 'true'; }, classList:{ contains:function(){ return false; } } }; return null; }, stopPropagation:function(){} } };
  S.ui.hf26BlockAuf={}; var vorher=hf26BlockAuf('fokus')[k43KetteId('fokus1', heute)]; hf26BlockAuf('fokus')[k43KetteId('fokus1', heute)]=false;
  pruef('B4 Tipp auf den Blockkopf (data-hf26block) schaltet den Block um (Handler bleibt, 28429)', hf26BlockAuf('fokus')[k43KetteId('fokus1', heute)]===false && vorher===undefined && /hf28Teilen\(z\.dataset\.hf26block\); const a=hf26BlockAuf\(ort\);/.test(src)); })();

// ══ C · Archiv aus FocusSystem (§3) ══
var kA=Object.assign(neueKarte({ titel:'Archiv-Karte', domain:'dfm' }), { id:'ka-28', status:'offen', std42:true, art:'aufgabe', projekt:'P' }); S.karten.push(kA); S.tagesketten[0].karten.push('ka-28'); S.tagesketten[2].karten.push('ka-28'); if(!ketteHat('ka-28')) ketteToggle('ka-28'); saveKarten(); DB.set('tagesketten', S.tagesketten);
var nK=S.karten.length; var resA=syncImport(JSON.stringify({ appVersion:'4.3.4', karten:[{ id:'ka-28', archivAusFocussystem:'2026-11-04T12:30:00.000Z' },{ id:'gibt-es-nicht', archivAusFocussystem:'2026-11-04T12:30:00.000Z' }] }));
pruef('C1 Paket archivAusFocussystem: Karte archiviert (status, archiviertTs, archivGrund „Archiv aus FocusSystem (<Zeitpunkt>)“), aus allen Ketten entfernt, keine neue Karte für unbekannte ids, Zeiten bleiben', kA.status==='archiviert' && !!kA.archiviertTs && kA.archivGrund==='Archiv aus FocusSystem (2026-11-04T12:30:00.000Z)' && !S.tagesketten.some(function(c){ return c.karten.indexOf('ka-28')>=0; }) && !ketteHat('ka-28') && S.karten.length===nK && resA && !resA.fehler && JSON.stringify(resA.archivAusFocussystem)==='["archiviert","unbekannt"]' && S.meta.archivAusFs.some(function(e){ return e.id==='ka-28'; }), JSON.stringify(resA));
var kL=Object.assign(neueKarte({ titel:'Läuft', domain:'dfm' }), { id:'kl-28', status:'offen', std42:true, art:'aufgabe', projekt:'P', matrixFeld:'werkzeug' }); S.karten.push(kL); saveKarten(); S.fokus={ karteId:'kl-28', laeuft:true, startMs:Date.now()-5*60000, sessionSek:0 };
syncImport(JSON.stringify({ appVersion:'4.3.4', karten:[{ id:'kl-28', archivAusFocussystem:'2026-11-04T12:40:00.000Z' }] }));
pruef('C2 läuft die Uhr der Karte, wartet das Archiv (meta.archivWartend), Karte bleibt offen', kL.status==='offen' && S.meta.archivWartend && S.meta.archivWartend['kl-28']==='2026-11-04T12:40:00.000Z' && S.fokus.laeuft);
fokusZeitEinbuchen();
pruef('C3 nach dem Stopp der Uhr wird das Archiv übernommen; die Sitzung bleibt im Stunden-Log', kL.status==='archiviert' && /Archiv aus FocusSystem/.test(kL.archivGrund) && !(S.meta.archivWartend && S.meta.archivWartend['kl-28']) && (S.intraday||[]).some(function(e){ return e.typ==='timer' && e.kartenId==='kl-28'; }));
pruef('C0 meta.appVersion wird beim Start gesetzt (Spiegel; der Dienst schickt Archiv-Pakete nur an eine App ab 4.3.4)', (function(){ S.meta.appVersion=null; migrationKarten43b(); return S.meta.appVersion===APP_VERSION; })());
pruef('C4 Archiv bleibt Archiv: ein zweites Paket ändert nichts (schon)', (function(){ var r=syncImport(JSON.stringify({ appVersion:'4.3.4', karten:[{ id:'ka-28', archivAusFocussystem:'2026-11-04T12:30:00.000Z' }] })); return r && JSON.stringify(r.archivAusFocussystem)==='["schon"]' && kA.status==='archiviert'; })());
S.fokus={ laeuft:false };

// ══ D · Antwortzeile als Kurzansicht (§4.4) ══
var kanal={ id:'kan-trainer', Agent:'Trainer', Tabelle:'Trainer_Chat', Bereich:'privat', Kanal:'Trainer' }; f12KanalVon=function(a){ return a==='Trainer' ? kanal : null; }; f12Kanaele=function(){ return [kanal]; };
F7.lager[f12VerlaufKey(kanal, f12TagGespraech())]={ ts:Date.now(), daten:[{ id:'r1', Von:'Trainer', Art:'Antwort', Zeitstempel:jetztIso(), Text:'Plan steht' }], fehler:'' };
var ah=k43ChatAntwortHtml('egal', 'Antworten …');
pruef('D1 k43ChatAntwortHtml = Kurzansicht des Ketten-Chats für das Tagesgespräch (k43ChatKurzHtml: letzte Nachrichten, Eingabezeile, jeder Tipp öffnet den Ebene-1-Chat), alte Fassung bleibt als k43ChatAntwortHtml27', /hf26-chat/.test(ah) && /Plan steht/.test(ah) && /data-hf26chat="kan-trainer\|tag-[0-9-]+\|fokus"/.test(ah) && /Chat · Trainer heute/.test(ah) && typeof k43ChatAntwortHtml27==='function' && !/Trainer: egal/.test(ah));

// ══ E · Kartenformat Kurzfassung/Infos (§4.5) ══
var i1=Object.assign(neueKarte({ titel:'Info Eins', domain:'dfm' }), { id:'i1-28', status:'offen', std42:true, art:'info', projekt:'P' }); var i2=Object.assign(neueKarte({ titel:'Info privat', domain:'privat' }), { id:'i2-28', status:'offen', std42:true, art:'info' }); S.karten.push(i1, i2); saveKarten();
var kk=f7PfKarteLesen({ 'Output/Entwurf':'Aufgabe: Neue Karte\n- Projekt: P\n- Kurzfassung: Kurz und knapp.\n- Infos: i1-28, i2-28, fehlt-28\n- Soll-Minuten: 20\n\nUnteraufgaben:\n- Eins (Soll 20, Bonus 10)' });
pruef('E1 f7PfKarteLesen liest Kurzfassung und Infos', kk.kurzfassung==='Kurz und knapp.' && kk.gesetzt.kurzfassung===true && JSON.stringify(kk.infos)==='["i1-28","i2-28","fehlt-28"]' && kk.gesetzt.infos===true);
var kN=f7PfKarteAnlegen({ id:'pf-28' }, kk);
pruef('E2 Anlage: kurzfassung gesetzt, infos nur Infokarten derselben Familie, die es gibt', !!kN && kN.kurzfassung==='Kurz und knapp.' && JSON.stringify(kN.infos)==='["i1-28"]');
var kk2=f7PfKarteLesen({ 'Output/Entwurf':'Aufgabe: Neue Karte\n- Karte-ID: '+kN.id+'\n- Kurzfassung: Geändert.\n- Infos: i1-28' }); f7PfEntwurfAnwenden(kN, null, kk2);
pruef('E3 Änderung: Kurzfassung ersetzt, Infos ersetzt; ohne Zeile bleibt alles', kN.kurzfassung==='Geändert.' && JSON.stringify(kN.infos)==='["i1-28"]' && (function(){ var kk3=f7PfKarteLesen({ 'Output/Entwurf':'Aufgabe: Neue Karte\n- Karte-ID: '+kN.id+'\n- Soll-Minuten: 25' }); f7PfEntwurfAnwenden(kN, null, kk3); return kN.kurzfassung==='Geändert.' && kN.infos.length===1; })());

// ══ F · Tastatur-CSS (§4.7) ══
pruef('F1 body.hf27-tastatur #nav{visibility:hidden} (zusätzlich zur translateY-Regel)', /body\.hf27-tastatur #nav\{visibility:hidden\}/.test(src) && /#nav\{transform:translateY\(var\(--vvTop,0px\)\)\}/.test(src));

// ══ G · Version ══
pruef('G1 App 4.3.4 · Build 2026-11-04-58 · sw.js Cache fokus4-v4.3.4-2', APP_VERSION==='4.3.4' && APP_BUILD==='2026-11-04-58' && /const CACHE = 'fokus4-v4.3.4-2'/.test(readFile('sw.js')));
suiteEnde('Hotfix 28 · Themen-Ketten aufklappen, Blöcke in Heute gesamt, Archiv aus FocusSystem, Restpunkte (4.3.4)');
