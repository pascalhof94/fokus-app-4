/* Suite 5.1 · Karten-Standard 4.3 · Ketten (Auftrag 261103 §9.2): A Pflicht Projekt oder Abteilung (App, Postfach, Kartenset; DB-Regel P2 in FocusSystem tests/karten43.test.js) ·
   B Tagesrahmen: Migration karten43, Aufstehen über den Hotfix-24-Weg ohne Dialog (v50 grün), keine Eckpunkte, Morgenketten, Tagesplanung 4 Schritte,
   Tagesplan-Block parsen, Freigabe legt Tagesketten an und meldet die Nummer (Quelle tagesplan), K2 Spezialkarte endet beim Start, K3 Matrix folgt,
   zwischendurch, ADHS Blockade, Schlafen bucht nichts, Wecker, Tagesplanung 50/50 · C Ketten: Arten, drei Felder 5.6 (Rechenregeln mit Testdaten),
   Reihenfolge, T4/T5, K1, K8, K9, K14, Import tk-* → Block-Ketten, Kette neu · D Ketten-Tab: Umschalter, Trainer heute, Postfach-Historie mit Nummern
   aufklappen, Freigabe im Chat (Kasten, Nummer, Quelle chat und postfach), Abteilungen · E Tableiste (Reihenfolge, Fokus ohne Beschriftung), schmale
   Statusleiste · F R13 ▶/⏸ und 💬 in allen Kartenzeilen · G Version 4.3.0, Build 53, sw.js Cache.
   Aufruf: jsc tests/v51-ketten43.js · Die Abschnitte wurden während der Umsetzung als Rauchtests ausgeführt (siehe Bericht); die Suite als Ganzes läuft bei A/C. */
var _toasts=[]; toast=function(m){ _toasts.push(String(m)); }; haptik=function(){}; var confirm=function(){ return true; };
fsliveStumm();
function _k(id){ return S.karten.find(function(x){ return x.id===id; }); }

// ══ A · Pflicht Projekt oder Abteilung (4.3 §3) ══
var K=testTag();
pruef('A1 neue Karte trägt das Feld abteilung', 'abteilung' in neueKarte({ titel:'x', domain:'dfm' }));
pruef('A2 k43PfFehlt: DFM ohne beides fehlt, mit Abteilung nicht, mit Projekt nicht, privat nie', k43PfFehlt({ domain:'dfm', projekt:null, abteilung:null }) && !k43PfFehlt({ domain:'dfm', projekt:null, abteilung:'Automatisierungen' }) && !k43PfFehlt({ domain:'dfm', projekt:'P', abteilung:null }) && !k43PfFehlt({ domain:'privat', projekt:null, abteilung:null }));
var kkA=f7PfKarteLesen({ 'Output/Entwurf':'Aufgabe: Mit Abteilung\n- Familie: DFM\n- Abteilung: Automatisierungen\n- Soll: 20 Min' });
pruef('A3 Postfach-Entwurf: „- Abteilung: <Name>“ wird gelesen', !!kkA && kkA.abteilung==='Automatisierungen' && kkA.domain==='dfm');
var resA=kartensetAnwenden ? (function(){ try{ return syncImport(JSON.stringify({ appVersion:APP_VERSION, art:'kartenset', grund:'Test', karten:[], kartenset:{ eintraege:[], neu:[{ key:'neu-a', aktion:'neu', ziel:{ titel:'Ohne beides', familie:'DFM', projekt:null, abteilung:null, art:'aufgabe', status:'offen', matrix:'werkzeug', belastung:0, prio:3, bewertung:'zeit', soll:10 }, unteraufgaben:[], hinweis:null },{ key:'neu-b', aktion:'neu', ziel:{ titel:'Mit Abteilung', familie:'DFM', projekt:null, abteilung:'Automatisierungen', art:'aufgabe', status:'offen', matrix:'werkzeug', belastung:0, prio:3, bewertung:'zeit', soll:10 }, unteraufgaben:[], hinweis:null }] } }), { freigabe:true }); }catch(e){ return { fehler:String(e) }; } })() : null;
pruef('A4 Kartenset: DFM-Karte ohne Projekt und Abteilung wird nicht angelegt, mit Abteilung schon', !S.karten.some(function(k){ return k.titel==='Ohne beides'; }) && S.karten.some(function(k){ return k.titel==='Mit Abteilung' && k.abteilung==='Automatisierungen'; }), JSON.stringify(resA).slice(0,200));

// ══ B · Tagesrahmen und Systemkarten (4.3 §4) ══
_gesendet.length=0; fsliveStumm();
var K=testTag(); var g=anVorTage(heuteIso(), 1);
S.tag.datum=g; S.tag.tagId=g+'-1'; S.tag.startTs=new Date(Date.now()-26*3600000).toISOString(); S.tag.morgen={ aufstehTs:S.tag.startTs }; S.tag.endeTs=null; saveTag();
['k3-aufstehen','k3-tagesuebergang'].forEach(function(id){ Object.assign(_k(id), { std42:true, art:'system', prio:3, belastung:0, modus:'pflicht' }); });
var B=Object.assign(neueKarte({ titel:'ADHS Blockade', domain:'privat' }), { id:'fb014470-a030-4f07-85c6-782387e0ee6c', std42:true, art:'routine', status:'offen', matrixFeld:'zustand', prio:1, belastung:1, abhakbonus:25 });
var Sl=Object.assign(neueKarte({ titel:'Schlafen', domain:'privat' }), { id:'k3-schlafen', rolle:'schlafen', status:'offen', matrixFeld:'zustand', immerSichtbar:true, rhythmus:{ typ:'taeglich' } });
S.karten.push(B, Sl); saveKarten(); S.meta.karten43=null; S.meta.migrationen=[];
var mig=migrationKarten43();
pruef('B-M1 Migration: Tagesplanung angelegt, Blockade Rolle, Tagesübergang archiviert', !!k43TagesplanungKarte() && _k(B.id).rolle==='blockade' && _k('k3-tagesuebergang').status==='archiviert', JSON.stringify(mig));
// laufende Karte über Nacht
fokusStarten('t-dfm'); S.fokus.startMs=Date.now()-5*3600000;
F11.schritt=1; F11.auf=null; S.meta.f11Protokoll=[]; _gesendet.length=0; _toasts.length=0;
kartenListeCheck('k3-aufstehen');
pruef('B-A1 Aufstehen: neuer Tag heute, Aufstehzeitpunkt, Vortag geschlossen', S.tag && S.tag.datum===heuteIso() && !!(S.tag.morgen && S.tag.morgen.aufstehTs) && S.historie.some(function(h){ return h.datum===g && h.endeTs; }), S.tag && S.tag.datum);
pruef('B-A2 Spezialansicht aufstehen offen', e1Art()==='spezial' && S.ui.spezial.art==='aufstehen', e1Art()+'/'+(S.ui.spezial&&S.ui.spezial.art));
var eck=S.intraday.filter(function(e){ return e.tagId===S.tag.tagId && e.eck; });
pruef('B-A3 keine Eckpunkte mehr', eck.length===0, eck.length);
pruef('B-A4 Protokoll: laufende Zeit gestoppt, Routinen gezählt', S.tag.k43 && S.tag.k43.aufstehen && S.tag.k43.aufstehen.gestoppt.length===1 && S.tag.k43.aufstehen.routinen>=0, JSON.stringify(S.tag.k43 && S.tag.k43.aufstehen));
pruef('B-A5 Morgenketten angelegt (Aufwachen enthält Tagesplanung)', S.tagesketten.some(function(c){ return c.block==='aufwachen' && c.karten.indexOf(k43TagesplanungKarte().id)>=0 && c.quelle==='morgen'; }), JSON.stringify(S.tagesketten));
warten();
pruef('B-A6 Bilanz und Trainer gesendet (Hotfix-24-Weg)', _gesendet.some(function(x){ return x.id==='bilanz-'+g; }) && _gesendet.some(function(x){ return x.id==='chat-uebergang-'+g; }), JSON.stringify(_gesendet.map(function(x){ return x.id; })));
var h1=k43AufstehenHtml(); pruef('B-A7 Aufstehen-HTML enthält Nacht, Hintergrund, Kette', /Deine Nacht/.test(h1) && /Im Hintergrund erledigt/.test(h1) && /Kette Aufstehen/.test(h1));
// Tagesplanung
k43TagesplanungOeffnen();
pruef('B-T1 Tagesplanung läuft als Karte, Ansicht Schritt 1', S.fokus.laeuft && S.fokus.karteId===k43TagesplanungKarte().id && S.ui.spezial.art==='tagesplanung' && S.ui.spezial.schritt===1);
var s1=k43TagesplanungHtml(); pruef('B-T2 Schritt 1: Zustand, Wirkung noch nicht eingestellt, Hinweise', /Zustand/.test(s1) && /noch nicht eingestellt/.test(s1) && /Hinweise/.test(s1));
S.ui.spezial.schritt=2; var s2=k43TagesplanungHtml(); pruef('B-T3 Schritt 2 zeichnet „Blöcke planen“ (Hotfix 29 §3: die alten Schritte 2–4 entfallen)', /Blöcke planen/.test(s2) && /Schritt 2 von 2/.test(s2) && !/Gestern nach Themen/.test(s2), s2.slice(0,200));
S.ui.spezial.schritt=1; var s3=k43TagesplanungHtml(); pruef('B-T4 Schritt 1: Themen-Chips und „Weiter: Blöcke planen“ (Hotfix 29 §3)', /Themen heute/.test(s3) && /data-k43thema/.test(s3) && /data-hf29weiter/.test(s3) && /Schritt 1 von 2/.test(s3));
var sz=k43TagesplanungSaetze(); pruef('B-T5 Sätze 50/50 (Hotfix 26 §4.3): phFest leer, Satz der Karte = Privat-Satz über e42Satz, DFM-Satz > 0', k43TagesplanungKarte().phFest==null && e42Satz(k43TagesplanungKarte())===sz.privat && sz.dfm>0, JSON.stringify(sz)+' phFest='+k43TagesplanungKarte().phFest);   // 4.3: phFest = Privat-Satz/2 und DFM-Bonus — abgelöst durch die Teilung der Sitzung
// Plan aus dem Chat (Trainer-Zeile im Lager)
var kanal={ id:'kan-trainer', Agent:'Trainer', Tabelle:'Trainer_Chat', Bereich:'privat', Kanal:'Trainer' };
f12KanalVon=function(a){ return a==='Trainer' ? kanal : null; };
var plan={ bloecke:[{ block:'fokus1', name:'Fokus 1', von:'09:00', karten:[{ id:'t-dfm', start:'09:00', min:30 },{ id:'t-priv', start:'09:30', min:20, onramp:true }] },{ block:'senke', name:'Senke', von:'12:00', karten:[{ id:'t-erh', start:'12:00', min:15 }] }] };
F7.lager[f12VerlaufKey(kanal, f12TagGespraech())]={ ts:Date.now(), daten:[{ id:'r1', Von:'Trainer', Art:'Antwort', Zeitstempel:jetztIso(), Text:'Hier dein Plan:\n```tagesplan\n'+JSON.stringify(plan)+'\n```' }] };
var R=k43PlanAusChat(); pruef('B-P1 Tagesplan-Block geparst', !!R.plan && R.plan.bloecke.length===2, R.grund);
var pfTP={ id:'pf-tp1', Titel:'Tagesplan '+k43Datum(heuteApp())+' · Fassung 1', Agent:'Trainer', Art:'Tagesplan', Status:'offen', Runde:1, erstellt_am:jetztIso(), Quelle:'Tagesgespräch' }; F7.lager.postfach={ ts:Date.now(), daten:[pfTP], fehler:'' }; HF29.paket['pf-tp1']=JSON.stringify(Object.assign({ datum:heuteApp() }, plan));
F15.karte={ id:'pf-tp1', optionen:[], text:'', datei:null }; var s4=f15KarteHtml(); pruef('B-P2 (Hotfix 29 §1.2) Tagesplan-Karte: Kopf mit ID, Kasten Blöcke, „Was sich gegenüber jetzt ändert“, Prognose ohne Overload, Knöpfe Ablehnen · Anpassen · Freigeben', /Postfach · Plan · Trainer/.test(s4) && /pf-tp1/.test(s4) && /Blöcke/.test(s4) && /Fokus 1 · 09:00/.test(s4) && /Was sich gegenüber jetzt ändert/.test(s4) && /Prognose nach Freigabe \(ohne Overload\)/.test(s4) && /data-hf29pffrei="pf-tp1"/.test(s4) && /data-hf29pfan="pf-tp1"/.test(s4) && /data-hf29pfab="pf-tp1"/.test(s4), s4.slice(0,300));
var plan2={ bloecke:[{ block:'fokus1', karten:[{ id:'gibt-es-nicht', start:'09:00', min:30 }] }] };
F7.lager[f12VerlaufKey(kanal, f12TagGespraech())].daten.push({ id:'r2', Von:'Trainer', Art:'Antwort', Zeitstempel:jetztIso(), Text:'```tagesplan\n'+JSON.stringify(plan2)+'\n```' });
var zs=k43ZeitstrahlHtml(k43PlanAusChat().plan, {}); HF29.paket['pf-tp1']=JSON.stringify(Object.assign({ datum:heuteApp() }, plan2)); var tkVor=JSON.stringify(S.tagesketten); _toasts.length=0; var frei0=hf29PlanFreigeben('pf-tp1');
pruef('B-P3 unbekannte App-ID: Zeitstrahl rot „Karte nicht gefunden“; Freigabe bricht vor dem ersten Schreibschritt ab, Meldung nennt die ID, nichts geändert (Hotfix 29 §1.2)', zs.unbekannt===1 && /Karte nicht gefunden/.test(zs.html) && frei0===false && JSON.stringify(S.tagesketten)===tkVor && _toasts.some(function(t){ return /unbekannte ID/.test(t) && /gibt-es-nic/.test(t); }), JSON.stringify(_toasts));
HF29.paket['pf-tp1']=JSON.stringify(Object.assign({ datum:heuteApp() }, plan));
F7.lager[f12VerlaufKey(kanal, f12TagGespraech())].daten.pop();
_gesendet.length=0; var frei1=hf29PlanFreigeben('pf-tp1');
pruef('B-P4 Freigabe (Hotfix 29 §1.2): Block-Ketten fokus1 und senke gefüllt, quelle tagesplan, Fassung = Postfach-Karte, von aus dem Plan, Datum im Namen; andere Blöcke unverändert', frei1===true && S.tagesketten.filter(function(c){ return c.quelle==='tagesplan'; }).length===2 && (function(){ var f=hf29Block('fokus1'), s=hf29Block('senke'); return f && s && f.karten.join()==='t-dfm,t-priv' && s.karten.join()==='t-erh' && f.von==='09:00' && s.von==='12:00' && f.fassung==='pf-tp1' && f.plan['t-priv'].onramp===true && /Fokus 1 · \d\d\.\d\d\./.test(f.name); })() && S.tagesketten.some(function(c){ return c.block==='fokus2' && c.quelle!=='tagesplan'; }), JSON.stringify(S.tagesketten.map(function(c){ return c.name+':'+c.quelle; })));
pruef('B-P5 Freigabe-Eintrag quelle tagesplan mit pfId gesendet, Postfach-Karte erledigt/freigegeben', _gesendet.some(function(x){ return x.werkzeug==='app:freigaben' && x.args.quelle==='tagesplan' && x.args.karten.length===3; }) && !!(S.meta.freigaben||{})['pf:pf-tp1'] && _gesendet.some(function(x){ return x.werkzeug==='datensatz_aendern' && x.args.id==='pf-tp1' && x.args.felder.Status==='erledigt' && x.args.felder.Entscheidung==='freigegeben'; }), JSON.stringify(_gesendet.map(function(x){ return x.werkzeug; })));
pruef('B-P6 (Hotfix 29 §1.2) die Freigabe startet keine Karte, faelligkeit heute, kein ungeplant; „Fertig · Fokus 1 starten“ startet t-dfm und schließt die Tagesplanung (K2)', !(S.fokus && S.fokus.laeuft && S.fokus.karteId==='t-dfm') && _k('t-dfm').faelligkeit===heuteIso() && !_k('t-dfm').ungeplant && (function(){ hf29Fertig(true); return S.fokus.laeuft && S.fokus.karteId==='t-dfm' && e1Art()!=='spezial'; })(), (S.fokus ? S.fokus.karteId : '-')+' '+e1Art());
pruef('B-P7 K3: Matrix auf dem Feld der laufenden Karte (ziel → 0.5/-0.5)', (function(){ var p=matrixPos(); return p && p.x===0.5 && p.y===-0.5; })(), JSON.stringify(matrixPos()));
// zweites Öffnen = zwischendurch
k43TagesplanungOeffnen(); pruef('B-T6 zweites Öffnen am selben Tag: zwischendurch', S.ui.spezial.art==='zwischendurch'); var zw=k43ZwischendurchHtml(); pruef('B-T7 zwischendurch = „Blöcke planen“ (Hotfix 29 §3): Prognose · Blöcke ohne Overload, Blöcke von heute, Knopf Fertig', /Blöcke planen/.test(zw) && /Prognose · Blöcke ohne Overload/.test(zw) && /data-hf29auf=/.test(zw) && /data-hf29fertig="1"/.test(zw));
// Blockade
k43BlockadeOeffnen(); pruef('B-B1 Blockade läuft als Karte, Ansicht', S.fokus.karteId===B.id && S.ui.spezial.art==='blockade' && S.tag.k43.blockade.startTs);
k43FrageSetzen('q2', 'Ablenkung'); pruef('B-B2 Antwort Ablenkung setzt die Matrix (-0.5/0.5)', matrixPos().x===-0.5 && matrixPos().y===0.5);
var bh=k43BlockadeHtml(); pruef('B-B3 Blockade-HTML: Fragen, Chat, Insights, Nächster Schritt', /Was ist passiert/.test(bh) && /Chat mit dem Trainer/.test(bh) && /Insights/.test(bh) && /Nächster Schritt/.test(bh));
_gesendet.length=0; fokusStarten('t-priv'); pruef('B-B4 K2: Start einer anderen Karte beendet die Blockade, Antworten an den Trainer', !!S.tag.k43.blockade.endeTs && _gesendet.some(function(x){ return x.args && x.args.felder && /ADHS Blockade/.test(x.args.felder.Text||''); }) && e1Art()!=='spezial', JSON.stringify(_gesendet.map(function(x){return x.werkzeug;})));
// Schlafen
schlafUmschalten(); pruef('B-S1 Schlafen (Hotfix 26 §4.5): Start öffnet die Ansicht, Schlafuhr läuft, Schlafen im Fokus', S.ui.spezial.art==='schlafen' && schlafLaeuft() && S.fokus && S.fokus.karteId===schlafKarte().id && !S.fokus.laeuft);   // 4.3: Ansicht ohne Uhr — abgelöst
var sh=k43SchlafenHtml(); pruef('B-S2 Schlafen-HTML: Geschafft heute, Woche, Nachtnotiz, nichts gebucht', /Geschafft heute/.test(sh) && /Diese Woche/.test(sh) && /Nachtnotiz/.test(sh) && /nichts gebucht/.test(sh));
fokusZeitEinbuchen(); S.fokus={laeuft:false}; var pv=tagesPunkteLive(), nI=S.intraday.length, nL=(S.tag.log||[]).length; k43SchlafenStarten(); pruef('B-S3 Schlafen startet, bucht nichts', schlafLaeuft() && tagesPunkteLive()===pv && S.intraday.length===nI && (S.tag.log||[]).length===nL, pv+' → '+tagesPunkteLive()+' intraday '+nI+'→'+S.intraday.length+' log '+nL+'→'+(S.tag.log||[]).length+' '+JSON.stringify(S.intraday.slice(nI)));
// Wecker
k43WeckerUebernehmen('23:59'); pruef('B-W1 Wecker gesetzt', !!S.tag.k43.wecker.bis); S.tag.k43.wecker.bis=new Date(Date.now()-1000).toISOString(); _toasts.length=0; k43WeckerPruefen(); pruef('B-W2 Wecker abgelaufen: Toast, gemeldet', S.tag.k43.wecker.gemeldet && _toasts.some(function(t){ return /Weiter geht es/.test(t); }));
pruef('B-E1 Eckpunkte liefern 0', tagesEckpunkteBuchen('aufstehen', _k('k3-aufstehen'))===0);

// ══ C · Ketten (4.3 §5) ══
f12KanalVon=function(){ return null; }; S.ui.tkWahl=null; S.ui.spezial=null;
var K=testTag(); var heute=heuteApp();
Object.assign(_k('t-dfm'), { std42:true, art:'aufgabe', prio:3, belastung:0, projekt:'Projekt A', faelligkeit:heute });
Object.assign(_k('t-priv'), { std42:true, art:'aufgabe', prio:2, belastung:0, faelligkeit:heute });
var R1=Object.assign(neueKarte({ titel:'Routine DFM', domain:'dfm' }), { id:'r-dfm', std42:true, art:'routine', status:'offen', rhythmus:{ typ:'woechentlich', tage:[0] }, abteilung:'Automatisierungen', matrixFeld:'werkzeug', prio:3, belastung:0, sollMin:10 });
var R2=Object.assign(neueKarte({ titel:'Routine privat', domain:'privat' }), { id:'r-priv', std42:true, art:'routine', status:'offen', rhythmus:{ typ:'taeglich' }, matrixFeld:'werkzeug', prio:3, belastung:0, sollMin:10 });
var N2=Object.assign(neueKarte({ titel:'Nachfolger', domain:'dfm' }), { id:'t-nach', std42:true, art:'aufgabe', status:'offen', projekt:'Projekt A', prio:5, belastung:0, sollMin:20, vorgaengerAppId:'t-dfm', faelligkeit:heute });
S.karten.push(R1, R2, N2); saveKarten();
S.tagesketten=[{ id:'tk-alt', name:'Alte Kette', karten:['t-priv'] }]; k43KettenNormieren();
pruef('C-N1 bestehende Kette → art eigene, quelle pascal', S.tagesketten[0].art==='eigene' && S.tagesketten[0].quelle==='pascal');
hf26KetteSetzen({ id:k43KetteId('fokus1', heute), name:'Fokus 1 · '+anKurzDatum(heute)+'.', art:'block', datum:heute, block:'fokus1', von:'09:45', karten:['t-dfm','t-priv','t-nach'], plan:{}, quelle:'tagesplan' }); DB.set('tagesketten', S.tagesketten); K43K.cache=null;   // Hotfix 29 §6: „Heute gesamt“ nur aus den Blöcken — die fälligen Karten stehen in Fokus 1
var Kb=k43KettenBauen(true);
pruef('C-K1 Gruppen: Tag, Blöcke, Themen, Familie, Sammeln, Eigene', Kb.tag.length===1 && Array.isArray(Kb.block) && Kb.thema.length>=2 && Kb.familie.length===3 && Kb.sammeln.length===3 && Kb.eigene.length===1, JSON.stringify(Object.keys(Kb).map(function(g){ return g+':'+Kb[g].length; })));
pruef('C-K2 Heute gesamt enthält die fälligen Karten, keine Rollenkarten', Kb.tag[0].karten.some(function(k){ return k.id==='t-dfm'; }) && !Kb.tag[0].karten.some(function(k){ return k.rolle; }));
pruef('C-K3 Familie: Routinen DFM (nicht fällig, K14) und Routinen privat', Kb.familie[0].karten.some(function(k){ return k.id==='r-dfm'; }) && Kb.familie[1].karten.some(function(k){ return k.id==='r-priv'; }));
pruef('C-K4 Themen: Projekt A mit Abteilung, Privat', Kb.thema.some(function(c){ return c.name==='Projekt A'; }) && Kb.thema.some(function(c){ return c.themaArt==='privat'; }), JSON.stringify(Kb.thema.map(function(c){ return c.name+'|'+c.abteilung; })));
pruef('C-T5 Prio-Vererbung: t-dfm hat Prio 5 geerbt', _k('t-dfm').prio===5 && k43PrioGeerbt(_k('t-dfm')));
var zh=k43ZeileHtml(_k('t-nach'), Kb.tag[0]); pruef('C-T4 blockierte Karte gestrichelt mit „frei nach“', /k43-blo/.test(zh) && /frei nach/.test(zh));
// Felder
var f=Kb.tag[0].felder, sollSum=Kb.tag[0].offen.reduce(function(a,k){ return a+Math.max(0, num(k.sollMin)-heuteInvestiertMin(k)); },0);
pruef('C-F1 Felder Tag: offene Minuten = Σ max(0, Soll − gebucht) der offenen Karten, 0 % Punkte ohne Buchung, +N geplant = offene Karten', f.zeitMin===Math.round(sollSum) && f.punkteProzent===0 && f.geplant===Kb.tag[0].offen.length && f.zeitAnteil===0, JSON.stringify(f)+' soll '+sollSum);
fokusStarten('t-dfm'); S.fokus.startMs=Date.now()-15*60000; fokusZeitEinbuchen(); S.fokus={ laeuft:false };
var f2=k43KettenBauen(true).tag[0].felder; pruef('C-F2 nach 15 Min an t-dfm: offene Minuten um 15 kleiner, Ring = gebucht ÷ (gebucht + offen) > 0, Punkte > 0 %', f2.zeitMin===f.zeitMin-15 && Math.abs(f2.zeitAnteil-15/(15+f2.zeitMin))<0.01 && f2.punkteProzent>0, JSON.stringify(f2));
var _leerK=k43KetteFertig({ id:'x', name:'x', art:'eigene', karten:[], plan:{} }); var fh=k43FelderHtml(_leerK, 42); pruef('C-F3 leere Kette: 0\' / 0% / +0', /0'/.test(fh) && /0%/.test(fh) && /\+0/.test(fh));
var fh2=k43FelderHtml(Kb.familie[1], 104); pruef('C-F4 Ketten-Tab-Felder: Lila für Privat, Std. offen gesamt, P offen gesamt', fh2.indexOf(FARBE.LILA)>=0 && /offen gesamt/.test(fh2));
// Kettenansicht
var h=k43KettenansichtHtml('fokus'); pruef('C-A1 Fokus-Ansicht: Gruppen Tag und Blöcke, Felder 42 px', /data-k43gruppe="fokus\|tag"/.test(h) && /width:42px/.test(h));
var fn=f4NaechstesHtml(null); pruef('C-A2 Fokus-Block „Ketten heute“ statt Kettenliste', /Ketten heute/.test(fn) && /k43-ketten/.test(fn) && !/kl-liste/.test(fn));
S.ui.k43Auf={ kettentab:Kb.tag[0].id }; var ht=k43KettenansichtHtml('kettentab'); pruef('C-A3 Ketten-Tab aufgeklappt (Hotfix 26 §6.4: Tag-Kette nach Block und Thema): 104 px, Blockabschnitte, Chat der Kette, Kette neu', /width:104px/.test(ht) && /nach Block, darin Thema/.test(ht) && /hf26-bh/.test(ht) && /Chat der Kette/.test(ht) && /Kette neu/.test(ht));   // 4.3: Heute eingeplant / Erledigt — in der Tag-Kette abgelöst durch Abschnitte je Block
// K8 / K9
S.ui.tkWahl='k43:thema:'+Kb.thema[0].id.slice(10); S.ui.tkWahl=Kb.thema.find(function(c){ return c.name==='Projekt A'; }).id;
pruef('C-K8 berechnete Kette als aktuelle: aktiveKetteKarten liefert ihre Karten', aktiveKetteKarten().some(function(k){ return k.id==='t-dfm'; }) && aktiveKetteName()==='Projekt A');
fokusStarten('r-priv'); pruef('C-K9 Start außerhalb → aktuelle Kette = Familie Routinen privat', S.ui.tkWahl==='k43:fam:routinenPrivat', S.ui.tkWahl);
fokusZeitEinbuchen(); S.fokus={ laeuft:false };
// K1
S.ui.tkWahl=Kb.thema.find(function(c){ return c.name==='Projekt A'; }).id; K43.hakenImFokus='t-dfm'; karteAbhaken('t-dfm', false);
pruef('C-K1 ✓ im Fokus startet die nächste offene Karte desselben Blocks (Hotfix 29 §5: Fokus 1 = t-dfm, t-priv, t-nach → t-priv)', _k('t-dfm').status==='erledigt' && S.fokus.laeuft && S.fokus.karteId==='t-priv', S.fokus.karteId);
pruef('C-T4b Nachfolger nach Erledigen nicht mehr blockiert', !k43Blockiert(_k('t-nach')));
var Kc=k43KettenBauen(true); pruef('C-S1 erledigte unten (Erledigt-Liste der Themen-Kette)', Kc.thema.find(function(c){ return c.name==='Projekt A'; }).erledigt.some(function(k){ return k.id==='t-dfm'; }));
// Import mit tk-*
var vorher=S.tagesketten.length;
syncImport(JSON.stringify({ appVersion:APP_VERSION, karten:[{ id:'t-priv', titel:'Private Aufgabe' }], tagesketten:[{ id:'tk-fokus1', name:'Fokus 1', karten:['t-nach'] },{ id:'tk-bad', name:'Bad', karten:['r-priv'] },{ id:'tk-abschluss', name:'Abschluss', karten:['t-priv'] },{ id:'tk-neu', name:'Eigene aus Paket', karten:['t-priv'] }] }));
var bl=S.tagesketten.filter(function(c){ return c.art==='block'; });
pruef('C-I1 Import: tk-fokus1 → Block fokus1, tk-bad → Block aufstehen mit Onramp Bad, tk-abschluss entfällt, andere → Tag-Kette (Hotfix 26 §6.2, vorher Eigene); alte eigene bleibt', bl.some(function(c){ return c.block==='fokus1' && c.karten.indexOf('t-nach')>=0; }) && bl.some(function(c){ return c.block==='aufstehen' && c.plan['r-priv'] && c.plan['r-priv'].onramp; }) && !S.tagesketten.some(function(c){ return c.id==='tk-neu'; }) && S.tagesketten.some(function(c){ return c.id==='tk43-tag-'+heute && c.karten.indexOf('t-priv')>=0; }) && S.tagesketten.some(function(c){ return c.id==='tk-alt'; }) && !S.tagesketten.some(function(c){ return c.id==='tk-abschluss'; }), JSON.stringify(S.tagesketten.map(function(c){ return c.id+'|'+c.art+'|'+c.block; })));
pruef('C-I2 Block-Kette trägt das Datum im Namen', bl.every(function(c){ return /\d\d\.\d\d\./.test(c.name) && c.datum===heute; }));
// Kette neu mit Filter
el('k43KnName').value='Automatisierung'; el('k43KnArt').value='filter'; el('k43KnText').value=''; el('k43KnFam').value='dfm'; el('k43KnAbt').value='Automatisierungen'; k43KetteAnlegen();
var ne=k43KettenBauen(true).eigene.find(function(c){ return c.name==='Automatisierung'; }); pruef('C-E1 Kette neu mit Filter: enthält die DFM-Routine der Abteilung', !!ne && ne.karten.some(function(k){ return k.id==='r-dfm'; }), ne && JSON.stringify(ne.karten.map(function(k){return k.id;})));
pruef('C-R1 Routinen-Knopf aus F7_AKTIONEN entfernt, e1 routinen bleibt', !F7_AKTIONEN.some(function(a){ return a[0]==='routinen'; }) && E1_ARTEN.indexOf('routinen')>=0);

// ══ D · Ketten-Tab, Postfach-Historie, Freigabe im Chat (4.3 §6) ══
var _toasts=[]; toast=function(m){ _toasts.push(String(m)); }; haptik=function(){}; var confirm=function(){ return true; };
fsliveStumm(); FSLive.appLesen=function(p){ return Promise.resolve({ freigaben:[{ id:70, empfangen_am:jetztIso(), uebernommen_am:jetztIso(), status:'uebernommen', quelle:'tagesplan', titel:'Tagesplan 03.11.', karten:[{ id:'t-dfm', aktion:'geändert' },{ id:'weg-1', aktion:'neu' }] },{ id:69, uebernommen_am:anVorTage(heuteApp(),1)+'T10:00:00.000Z', status:'uebernommen', quelle:'postfach', titel:'Alte Karte', karten:[{ id:'t-priv', aktion:'neu' }] }] }); };
var K=testTag();
pruef('D-S1 Seite ketten in SEITEN, F9_SEITE', SEITEN.indexOf('ketten')>=0 && F9_SEITE.ketten==='Ketten');
seiteZeigen('ketten'); pruef('D-S2 seiteZeigen ketten', seiteAktuell()==='ketten' && k43Tab()==='ketten');
var h=el('kettenBody').innerHTML; pruef('D-S3 Umschalter mit vier Tabs, Standard Ketten, Kettenansicht', /data-kt="trainer"/.test(h) && /data-kt="postfach"/.test(h) && /class="an" data-kt="ketten"/.test(h) && /k43-ketten kettentab/.test(h));
var kanal={ id:'kan-trainer', Agent:'Trainer', Tabelle:'Trainer_Chat', Bereich:'privat', Kanal:'Trainer' }; f12KanalVon=function(a){ return a==='Trainer' ? kanal : null; }; f12Kanaele=function(){ return [kanal]; };
F7.lager[f12VerlaufKey(kanal, f12TagGespraech())]={ ts:Date.now(), daten:[{ id:'r1', Von:'Trainer', Art:'Antwort', Zeitstempel:jetztIso(), Text:'Guten Morgen' }] };
k43TabSetzen('trainer'); h=el('kettenBody').innerHTML; pruef('D-S4 Trainer heute (Hotfix 26 §2.2): Umschalter ↗ öffnet den Ebene-1-Chat im Tagesgespräch, nichts eingebettet', e1Art()==='chat' && /Trainer heute ↗/.test(h) && !/id="ktChat"/.test(h), h.slice(0,300)); e1Schliessen();   // 4.3: eingebettet (ktChat) — abgelöst
pruef('D-S5 Chat-Zustand folgt: Kanal Trainer, Gespräch heute', f12Ui().kanal==='kan-trainer' && f12Ui().gespraech===f12TagGespraech());
k43TabSetzen('postfach'); h=el('kettenBody').innerHTML; pruef('D-P1 Postfach-Tab: Filter Freigegeben (Standard), Offen, Chats', /✓ 🗂️ Freigegeben/.test(h) && /📬 Offen/.test(h) && /💬 Chats/.test(h));
warten(); k43TabSetzen('postfach'); h=el('kettenBody').innerHTML;
pruef('D-P2 Historie: Tage „Heute“ und „Gestern“, Nr. 70 Tagesplan, Nr. 69 Postfach, Anzahl Karten', /Heute · /.test(h) && /Gestern · /.test(h) && /Nr\. 70/.test(h) && /Nr\. 69/.test(h) && /Tagesplan/.test(h) && /<b>2<\/b>/.test(h), h.slice(0,200));
S.ui.k43FreiAuf='70'; renderKetten(); h=el('kettenBody').innerHTML; pruef('D-P3 aufgeklappt: Kartenzeile t-dfm, fehlende „nicht mehr vorhanden“ mit App-ID', /data-klkarte="t-dfm"/.test(h) && /nicht mehr vorhanden · App-ID weg-1/.test(h));
pruef('D-P4 unten „Vor 4.3 · ohne Nummer“ mit Archiv-Beschriftung', /Vor 4\.3 · ohne Nummer/.test(h) && /Archiv · Angelegte Karten bis 03\.11\./.test(h));
// Freigabe im Chat: Kasten
var pf={ id:'pf1', Titel:'Neue Karte X', Status:'offen', Entscheidung:'', 'Output/Entwurf':'Aufgabe: Neue Karte X\n- Familie: Privat\n- Soll: 30 Min\n- Prio: 3', Agent:'Trainer' };
F12.pf['pf1']={ ts:Date.now(), r:pf };
var row={ id:'r9', Von:'Trainer', Art:'Antwort', Zeitstempel:jetztIso(), Text:'Hier eine Karte', Postfach:[{ id:'pf1' }] };
var kb=f12KartenBloeckeHtml(kanal, row); pruef('D-C1 Kasten „📬 Neu: Titel“ mit Feldern und ✅ ✏️ ✕', /📬 Neu: <b>Neue Karte X/.test(kb) && /✅ Freigeben/.test(kb) && /✏️ Anpassen/.test(kb) && /✕ Ablehnen/.test(kb), kb.slice(0,400));
_gesendet.length=0; f12Ui().kanal='kan-trainer'; f12Ui().gespraech=f12TagGespraech(); f12PfFreigeben('pf1', false); if(HF29.zu && HF29.zu.pfId==='pf1'){ HF29.zu.ziel={ art:'block', block:'fokus1' }; hf29ZuordnenGo(); }   // Hotfix 29 §1.3: Kasten → Zuordnung → Freigeben · Fokus 1
pruef('D-C2 Freigabe aus dem Chat (über die Zuordnung): Karte angelegt, Freigabe-Eintrag quelle chat mit Gespräch gesendet', !!(S.meta.postfachKarten||{}).pf1 && _gesendet.some(function(x){ return x.werkzeug==='app:freigaben' && x.args.quelle==='chat' && x.args.gespraech===f12TagGespraech() && x.args.karten.length===1 && x.args.karten[0].aktion==='neu'; }), JSON.stringify(_gesendet.map(function(x){ return x.werkzeug+':'+JSON.stringify(x.args).slice(0,120); })));
S.meta.freigaben['pf:pf1'].nummer=71; kb=f12KartenBloeckeHtml(kanal, row); pruef('D-C3 danach „✅ freigegeben <Uhrzeit> · Paket 71“', /✅ freigegeben \d\d:\d\d · Paket 71/.test(kb), kb.slice(-200));
// Badge
S.meta.postfach={ offen:3, dringend:0 }; f7NavBadge(); pruef('D-B1 f7NavBadge läuft ohne Fehler (Tab Ketten und Umschalter)', true);
// Abteilungen-Tab
f7Abteilungen=function(){ return [{ id:'a1', Name:'Trainerstab', Emoji:'🎯' }]; }; kanal.Abteilung=[{ id:'a1' }]; f12Ui().kanal=null; f12Ui().gespraech=null;
k43TabSetzen('abteilungen'); h=el('kettenBody').innerHTML; pruef('D-A1 Abteilungen (Hotfix 26 §2.2): Umschalter ↗ öffnet den Ebene-1-Chat auf der Raum-Stufe, nichts eingebettet', e1Art()==='chat' && f12Stufe()==='raum' && /Abteilungen ↗/.test(h) && !/k43-chatseite abt/.test(h), h.slice(0,300)); e1Schliessen();   // 4.3: Räume eingebettet — abgelöst

// Freigabe im Postfach (nicht aus dem Chat): Quelle postfach
var pf2={ id:'pf2', Titel:'Zweite Karte', Status:'offen', Entscheidung:'', 'Output/Entwurf':'Aufgabe: Zweite Karte\n- Familie: Privat\n- Soll: 15 Min', Agent:'Trainer' };
F7.lager.postfach={ ts:Date.now(), daten:[pf2], fehler:'' }; _gesendet.length=0; f7PfEntscheiden('pf2', 'freigegeben', {});
pruef('D-C4 Freigabe im Postfach meldet die Nummer mit Quelle postfach', _gesendet.some(function(x){ return x.werkzeug==='app:freigaben' && x.args.quelle==='postfach' && x.args.karten.length===1; }), JSON.stringify(_gesendet.map(function(x){ return x.werkzeug; })));

// ══ E · Tableiste und Statusleiste (4.3 §7) ══
var K=testTag();
renderStatusbar(); var sb=el('f4sb').innerHTML;
// Hotfix 25 §1: die schmale Leiste aus 4.3 ist abgelöst — es gilt die Statusleiste 4.2 ohne Ring und Avatar, mit ⚙ rechts
pruef('E-L1 Statusleiste 4.2 (Hotfix 25): Punkteleiste, Kennzeile ohne Ring/Avatar, ⚙, Viererzeile; keine schmale Leiste', /id="sBar"/.test(sb) && /f4n-kz/.test(sb) && !/tbRing/.test(sb) && !/<img/.test(sb) && /data-k43einst/.test(sb) && /f4n-r4/.test(sb) && !/k43-sbbar/.test(sb), sb.slice(0,300));
var r=k43NavRingHtml(); pruef('E-L2 Fokus-Ring: SVG-Kreis 84 und Charakterbild, Fortschritt aus Tagesziel', /viewBox="0 0 84 84"/.test(r) && /<img src=/.test(r));
var src=readFile('index.html'); var nav=src.slice(src.indexOf('<nav id="nav">'), src.indexOf('</nav>'));
pruef('E-L3 Tableiste: Reihenfolge Ketten · Suche · Fokus · Shop · Statistik, Fokus ohne Beschriftung mit aria-label', nav.indexOf('data-seite="ketten"')<nav.indexOf('data-navsuche') && nav.indexOf('data-navsuche')<nav.indexOf('class="fokus" data-seite="fokus" aria-label="Fokus"') && nav.indexOf('aria-label="Fokus"')<nav.indexOf('data-seite="belohnung"') && nav.indexOf('data-seite="belohnung"')<nav.indexOf('data-seite="statistik"') && !/aria-label="Fokus">[^<]*Fokus/.test(nav) && !/data-seite="einst"/.test(nav) && !/data-seite="postfach"/.test(nav));
pruef('E-L4 Suche bleibt Ebene 1 mit sichtbarer Tableiste (CSS), 🔍-FAB abgeschaltet (CSS), Code bleibt', /body\[data-e1="suche"\] #nav\{display:flex\}/.test(src) && /#suchFab\{display:none!important\}/.test(src) && /el\('suchFab'\)\.addEventListener/.test(src));
pruef('E-L5 alte Statusleiste bleibt als f4StatusleisteHtmlAlt', typeof f4StatusleisteHtmlAlt==='function' && /sBar/.test(f4StatusleisteHtmlAlt()));

// ══ F · R13 ▶/⏸ und 💬 (4.3 §8) ══
var K=testTag(); var N=Object.assign(neueKarte({ domain:'dfm', titel:'Normal 4.2' }), { id:'n42', std42:true, art:'aufgabe', status:'offen', matrixFeld:'werkzeug', belastung:0, prio:3, sollMin:30, projekt:'P' }); S.karten.push(N);
var M=Object.assign(neueKarte({ domain:'privat', titel:'Mehrmals' }), { id:'m42', std42:true, art:'routine', status:'offen', ticksAktiv:true, matrixFeld:'werkzeug', belastung:0, prio:3 }); S.karten.push(M);
var I=Object.assign(neueKarte({ domain:'dfm', titel:'Info' }), { id:'i42', std42:true, art:'info', status:'offen', projekt:'P' }); S.karten.push(I); saveKarten();
var z=kartenZeileHtml(N); pruef('F-R1 4.2-Zeile: ▶ data-klplay, ✓ data-klcheck, 💬 data-k43kchat', /data-klplay="n42"/.test(z) && /data-klcheck="n42"/.test(z) && /data-k43kchat="n42"/.test(z) && /▶/.test(z), z.slice(0,300));
fokusStarten('n42'); z=kartenZeileHtml(N); pruef('F-R2 läuft: ⏸ statt ▶', /⏸/.test(z) && /aria-label="Pause"/.test(z));
fokusZeitEinbuchen(); S.fokus={ laeuft:false };
z=kartenZeileHtml(M); pruef('F-R3 Mehrmals-Karte: ➕ (nur Bonus) und ▶ (Tick + Zeit)', /data-kltick="m42"/.test(z) && /data-klplay="m42"/.test(z));
z=kartenZeileHtml(I); pruef('F-R4 Info-Karte: kein ▶, aber 💬', !/data-klplay="i42"/.test(z) && /data-k43kchat="i42"/.test(z));
z=kartenZeileHtml(N, { live:true }); pruef('F-R5 live-Zeile (Statusleiste): keine Knöpfe', !/data-klplay/.test(z) && !/data-k43kchat/.test(z));
z=kartenZeileHtml(_k('k3-aufstehen')); pruef('F-R6 Rollenkarte (4.1-Zeile): ▶, +1, ✓ und 💬', /data-klplay="k3-aufstehen"/.test(z) && /data-k43kchat="k3-aufstehen"/.test(z) && !/kz42/.test(z));

// ══ G · Version ══
pruef('G1 App 4.5.0 · Build 2026-11-10-60 · sw.js Cache fokus4-v4.5.0-1 (seit Hotfix 26)', APP_VERSION==='4.5.0' && APP_BUILD==='2026-11-10-60' && readFile('sw.js').indexOf("const CACHE = 'fokus4-v4.5.0-1'")>=0, APP_VERSION+' / '+APP_BUILD);
suiteEnde('Karten-Standard 4.3 · Ketten (4.3.0)');
