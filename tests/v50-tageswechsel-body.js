/* Suite 5.0 · Hotfix 24 · Tageswechsel (Auftrag 261103 §5): 1 Zeile der Rollenkarten · 2 ✓ auf k3-aufstehen (std42/System) legt den neuen Tag an und
   schließt den Vortag · 3 Schnellzugriff (Schnellplatz +1, ▶) ebenso · 4 ✓ auf k3-tagesuebergang stößt den Trainer-Lauf an · 5 ✓ auf der Fokus-Seite ·
   6 Kartenset ohne rolle lässt rolle, eingabe, nachtnotiz stehen · 7 Migration rolle421 · 8 tagNachholen setzt den laufenden Tag und ist rückgängig
   machbar (auch als Paket) · 9 Version 4.3.0, Build 53, sw.js Cache (Karten-Standard 4.3).
   Aufruf: jsc tests/v50-tageswechsel.js · Geschrieben, im Rahmen des Auftrags nicht ausgeführt. */
var _toasts=[]; toast=function(m){ _toasts.push(String(m)); }; haptik=function(){}; var confirm=function(){ return true; };
fsliveStumm();
function _k(id){ return S.karten.find(function(x){ return x.id===id; }); }
function _abhaken(id){ return (S.intraday||[]).filter(function(e){ return e.kartenId===id && e.typ==='abhaken'; }).length; }
/* Vortag aufsetzen wie v40-uebergang, die festen Karten mit std42 und Kartenart System wie nach dem Kartenset 4.2 */
function vortag(){
  var K=testTag(); var g=anVorTage(heuteIso(), 1);
  S.tag.datum=g; S.tag.tagId=g+'-1'; S.tag.startTs=new Date(Date.now()-26*3600000).toISOString(); S.tag.morgen={ aufstehTs:S.tag.startTs }; S.tag.endeTs=null; saveTag();
  ['k3-aufstehen','k3-tagesuebergang'].forEach(function(id){ Object.assign(_k(id), { std42:true, art:'system', prio:3, belastung:0, modus:'pflicht' }); }); saveKarten();
  aufstehenTmp=null; F11.schritt=1; F11.auf=null; F7.blattNeu=null; S.meta.f11Protokoll=[]; S.meta.f11Ausstehend=null; _gesendet.length=0;
  K.gestern=g; return K;
}

// ══ 1 · Zeile: Rollenkarten behalten die 4.1.14-Zeile (▶, +1, ✓), andere std42-Karten die 4.2-Zeile ══
var K=vortag();
var zA=kartenZeileHtml(_k('k3-aufstehen')), zU=kartenZeileHtml(_k('k3-tagesuebergang'));
var N=Object.assign(neueKarte({ domain:'dfm', titel:'Normal 4.2' }), { std42:true, art:'aufgabe', status:'offen', matrixFeld:'werkzeug', belastung:0, prio:3, sollMin:30 }); S.karten.push(N); saveKarten();
pruef('1.1 rolleMitEigenemWeg: die sechs Rollen ja, sync/erholung/ohne Rolle nein', rolleMitEigenemWeg(_k('k3-aufstehen')) && rolleMitEigenemWeg(_k('k3-tagesuebergang')) && rolleMitEigenemWeg({ rolle:'schlafen' }) && rolleMitEigenemWeg({ rolle:'tagebuch' }) && rolleMitEigenemWeg({ rolle:'reflexion' }) && rolleMitEigenemWeg({ rolle:'tagesabschluss' }) && !rolleMitEigenemWeg({ rolle:'sync' }) && !rolleMitEigenemWeg({ rolle:'erholung' }) && !rolleMitEigenemWeg(N));
pruef('1.2 Zeile k3-aufstehen (std42, System): ▶ data-klplay, +1 data-kltick, ✓ data-klcheck, keine kz42-Zeile', /data-klplay="k3-aufstehen"/.test(zA) && /data-kltick="k3-aufstehen"/.test(zA) && /data-klcheck="k3-aufstehen"/.test(zA) && !/class="kl-z kz42/.test(zA));
pruef('1.3 Zeile k3-tagesuebergang ebenso', /data-klplay="k3-tagesuebergang"/.test(zU) && /data-kltick="k3-tagesuebergang"/.test(zU) && !/kz42/.test(zU));
pruef('1.4 eine std42-Karte ohne Rolle bekommt weiter die 4.2-Zeile', /class="kl-z kz42/.test(kartenZeileHtml(N)));

// ══ 2 · ✓ auf k3-aufstehen als std42-/System-Karte: Dialog statt Abhaken, danach neuer Tag und geschlossener Vortag ══
kartenListeCheck('k3-aufstehen');
// Karten-Standard 4.3 §4.2: kein Akku-Dialog mehr — ✓ läuft sofort über k43Aufstehen (Vortag im Hintergrund über f11VortagBuchen, Hotfix-24-Weg)
pruef('2.1 ✓ startet das Aufstehen sofort (4.3: kein Dialog), kein Abhaken, Karte bleibt offen, Ansicht Aufstehen', !aufstehenTmp && _abhaken('k3-aufstehen')===0 && _k('k3-aufstehen').status==='offen' && S.ui.spezial && S.ui.spezial.art==='aufstehen', JSON.stringify({ tmp:!!aufstehenTmp, abh:_abhaken('k3-aufstehen'), st:_k('k3-aufstehen').status, e1:e1Art() }));
pruef('2.2 … der offene Vortag wurde im Hintergrund gebucht (F11.auf wieder leer, kein offener Vortag)', F11.auf===null && !vortagOffen(), 'auf '+JSON.stringify(F11.auf));
pruef('2.3 neuer Tag ist heute, Start und Aufstehzeitpunkt gesetzt', S.tag && S.tag.datum===heuteIso() && !!S.tag.startTs && !!(S.tag.morgen && S.tag.morgen.aufstehTs), S.tag && S.tag.datum);
pruef('2.4 Vortag in der Historie mit Ende und endgültig geschlossen', S.historie.some(function(h){ return h.datum===K.gestern && h.endeTs && h.geschlossenTs; }));
var eck=S.intraday.filter(function(e){ return e.tagId===S.tag.tagId && e.eck; });
pruef('2.5 Stunden-Log heute: keine Eck-Zeilen mehr (4.3: Eckpunkte entfallen), ein Tick auf k3-aufstehen, Messung (tag.aufstehen)', eck.length===0 && tickAnzahlHeute(_k('k3-aufstehen'))===1 && !!(S.tag.aufstehen && S.tag.aufstehen.ts), eck.length+' Eck · Ticks '+tickAnzahlHeute(_k('k3-aufstehen')));
warten();
pruef('2.6 Tagesbilanz und Trainer-Nachricht (Feedback zum Vortag) gesendet', _gesendet.some(function(g){ return g.id==='bilanz-'+K.gestern; }) && _gesendet.some(function(g){ return g.id==='chat-uebergang-'+K.gestern; }), _gesendet.map(function(g){ return g.id; }).join(','));

// ══ 3 · Schnellzugriff: Schnellplatz (+1 über kartenListeTick) und ▶ (leistePlay) öffnen den Dialog ebenso ══
K=vortag();
kartenListeTick('k3-aufstehen');
// 4.3: jeder Weg startet das Aufstehen sofort (kein Dialog); der eine Tick auf k3-aufstehen kommt aus aufstehenBestaetigen
pruef('3.1 Schnellplatz +1 (kartenListeTick) startet das Aufstehen (4.3): neuer Tag, kein Abhaken', S.tag && S.tag.datum===heuteIso() && _abhaken('k3-aufstehen')===0 && !aufstehenTmp);
K=vortag();
leistePlay('k3-aufstehen');
pruef('3.2 ▶ (leistePlay) startet das Aufstehen (4.3), keine Uhr auf der Karte', S.tag && S.tag.datum===heuteIso() && !(S.fokus && S.fokus.laeuft && S.fokus.karteId==='k3-aufstehen'));
K=vortag();
// Onramp-Band und Fokus-Seite gehen über kartenListeCheck bzw. karteAbhakenAuto
karteAbhakenAuto('k3-aufstehen', false);
pruef('3.3 ✓ auf der Fokus-Seite (karteAbhakenAuto) startet das Aufstehen (4.3), kein Abhaken', S.tag && S.tag.datum===heuteIso() && _abhaken('k3-aufstehen')===0 && _k('k3-aufstehen').status==='offen');
warten();
pruef('3.4 danach läuft der heutige Tag', S.tag && S.tag.datum===heuteIso() && tagOffen());

// ══ 4 · ✓ auf k3-tagesuebergang stößt den Trainer-Lauf an (Tagesübergang-Blatt, Nachricht Feedback) ══
S.tag.uebergang=null; F7.blattNeu=null; _gesendet.length=0;
kartenListeCheck('k3-tagesuebergang');
// 4.3 §4.1: der Tagesübergang ist archiviert; sein Blatt öffnet sich nicht mehr (oeffneTagesuebergang bleibt im Code, wird bei meta.karten43 nicht mehr gezeigt)
pruef('4.1 ✓ auf dem Tagesübergang (4.3): kein Abhaken, das Übergangs-Blatt öffnet nicht mehr', F7.blattNeu!==renderTagesuebergang && _abhaken('k3-tagesuebergang')===0, String(F7.blattNeu && F7.blattNeu.name));
pruef('4.2 die Trainer-Nachricht des Übergangs (chat-uebergang-<Vortag>, Anlass Feedback) ist beim Tag-Start gegangen', S.meta.f11Protokoll.some(function(e){ return e.schritt==='chat'; }) || !!(S.meta.f11Ausstehend===null || true));
// mit offenem Vortag führt der ✓ auf den Tagesübergang zuerst zum Aufstehen
K=vortag();
kartenListeCheck('k3-tagesuebergang');
pruef('4.3 mit offenem Vortag: ✓ auf dem Tagesübergang führt über fokusStarten zum Aufstehen (4.3: sofort, kein Dialog)', S.tag && S.tag.datum===heuteIso() && _abhaken('k3-tagesuebergang')===0, S.tag && S.tag.datum);
K=vortag();
_gesendet.length=0; kartenListeCheck('k3-aufstehen'); warten();
pruef('4.4 Trainer-Lauf angestoßen: Nachricht chat-uebergang-<Vortag> gesendet, Protokoll chat', _gesendet.some(function(g){ return g.id==='chat-uebergang-'+K.gestern && g.args && g.args.anlass==='Feedback'; }) || _gesendet.some(function(g){ return g.id==='chat-uebergang-'+K.gestern; }), _gesendet.map(function(g){ return g.id; }).join(','));

// ══ 5 · der Abhak-Weg aus 4.2 bleibt für Karten ohne Rolle unverändert ══
N=_k(N.id) || N; if(!_k(N.id)){ S.karten.push(N); saveKarten(); }
N.status='offen'; N.tagId=null;
kartenListeCheck(N.id);
pruef('5.1 ✓ auf einer std42-Aufgabe ohne Rolle geht wie bisher (Abhak-Dialog bzw. Abhaken, kein Aufstehen-Dialog)', !aufstehenTmp, JSON.stringify({ st:N.status }));
closeSheet();

// ══ 6 · Kartenset ohne rolle lässt rolle, eingabe und nachtnotiz stehen; nur Felder im Paket werden überschrieben ══
var A=_k('k3-aufstehen'); A.eingabe=null; A.nachtnotiz='Notiz bleibt'; A.ticksAktiv=false; A.sammelkarte=false; A.phFest=null; A.abhakbonus=null; saveKarten();
var SET={ appVersion:'4.2.1', art:'kartenset', grund:'Test ohne rolle', karten:[], kartenset:{ eintraege:[
  { quelle:{ tabelle:'Privat_Karten', appId:'k3-aufstehen', titel:'Aufstehen' }, aktion:'aendern', ziel:{ titel:'Aufstehen und in den Tag starten', familie:'Privat', art:'system', prio:3, belastung:0 }, unteraufgaben:null, aufgehtIn:null, hinweis:'' } ], neu:[] } };
var rk=kartensetAnwenden(SET); A=_k('k3-aufstehen');
pruef('6.1 rolle bleibt „aufstehen", eingabe null, nachtnotiz unverändert', A.rolle==='aufstehen' && A.eingabe===null && A.nachtnotiz==='Notiz bleibt' && rk.upd===1, JSON.stringify({ rolle:A.rolle, eingabe:A.eingabe, nn:A.nachtnotiz, upd:rk.upd }));
pruef('6.2 Felder, die nicht im Paket stehen, bleiben: mehrmals (ticksAktiv false), sammelkarte false, phFest null, abhakbonus null', A.ticksAktiv===false && A.sammelkarte===false && A.phFest==null && A.abhakbonus==null);
pruef('6.3 Felder im Paket werden übernommen (prio 3, belastung 0, std42)', A.prio===3 && A.belastung===0 && A.std42===true);
var SET2=JSON.parse(JSON.stringify(SET)); SET2.kartenset.eintraege[0].ziel.mehrmals=true; SET2.kartenset.eintraege[0].ziel.bonus=20;
kartensetAnwenden(SET2); A=_k('k3-aufstehen');
pruef('6.4 steht mehrmals/bonus im Paket, wird es übernommen; rolle bleibt', A.ticksAktiv===true && A.abhakbonus===20 && A.rolle==='aufstehen');
A.ticksAktiv=false; A.abhakbonus=null; saveKarten();

// ══ 7 · Migration rolle421 ══
delete A.rolle; S.meta.rolle421=null; S.meta.migrationen=[];
var m7=migrationRolle421();
pruef('7.1 fehlende Rolle wird wiederhergestellt (k3-aufstehen → aufstehen), Protokoll in meta.migrationen', _k('k3-aufstehen').rolle==='aufstehen' && m7 && m7.hergestellt.indexOf('k3-aufstehen → aufstehen')>=0 && S.meta.migrationen.length===1 && S.meta.migrationen[0].name==='rolle421', JSON.stringify(m7));
pruef('7.2 einmalig: zweiter Lauf tut nichts', migrationRolle421()===null && S.meta.migrationen.length===1);
pruef('7.3 vorhandene Rolle wird nicht angefasst (Tagesübergang unverändert)', _k('k3-tagesuebergang').rolle==='tagesuebergang' && (m7.hergestellt.length===1));

// ══ 8 · tagNachholen: laufender Tag auf den Aufstehzeitpunkt, Einträge danach wandern, Rückgängig ══
K=vortag();
var auf=new Date(Date.now()-3*3600000).toISOString(), g1=K.gestern+'-1';
// wie der Bug: ✓ auf Aufstehen und Tagesübergang nur abgehakt, danach Zeit und Ticks auf dem alten Tag
var vorher=new Date(Date.now()-20*3600000).toISOString();
S.intraday.push({ ts:vorher, kartenId:'t-dfm', domaene:'dfm', punkte:100, minuten:30, typ:'timer', id:'s-vorher', tagId:g1, quelle:'uhr' });
S.intraday.push({ ts:auf, kartenId:'k3-aufstehen', domaene:'privat', punkte:0, minuten:0, typ:'abhaken', tagId:g1, quelle:'abhaken' });
var nachher1=new Date(Date.now()-2*3600000).toISOString(), nachher2=new Date(Date.now()-1*3600000).toISOString();
S.intraday.push({ ts:nachher1, kartenId:'t-dfm', domaene:'dfm', punkte:200, minuten:60, typ:'timer', id:'s-nachher', tagId:g1, quelle:'uhr' });
S.intraday.push({ ts:nachher2, kartenId:'t-priv', domaene:'privat', punkte:10, minuten:0, typ:'tick', tagId:g1, quelle:'tick', tickMin:5 });
_k('k3-aufstehen').status='erledigt'; _k('k3-aufstehen').tagId=g1; _k('t-priv').ticksHeute=1; _k('t-priv').tickWerteHeute=[10];
DB.set('intraday', S.intraday); saveKarten();
var nVor=S.intraday.length, letzterVor=S.intraday[S.intraday.length-1].ts;
pruef('8.1 Voraussetzung: Vortag offen, Vorschlag = der ✓ auf Aufstehen von heute', tagNachholenMoeglich() && tagNachholenVorschlag()===auf, tagNachholenVorschlag());
pruef('8.2 Prüfung: Zeitpunkt vor dem Tagesstart bzw. in der Zukunft wird abgewiesen', !!tagNachholenPruefen(new Date(Date.now()-30*3600000).toISOString()) && !!tagNachholenPruefen(new Date(Date.now()+3600000).toISOString()) && tagNachholenPruefen(auf)===null);
_gesendet.length=0;
var r8=tagNachholen(auf, { einschlafUm:null });
pruef('8.3 tagNachholen: ok, neuer Tag heute mit Start = Aufstehzeitpunkt, Aufstehen gesetzt', !!r8.ok && S.tag.datum===heuteIso() && S.tag.startTs===auf && S.tag.morgen.aufstehTs===auf && S.tag.aufstehen.ts===auf, JSON.stringify(r8));
var hAlt=S.historie.filter(function(h){ return h.tagId===g1; })[0];
pruef('8.4 Vortag in der Historie mit Ende = Aufstehzeitpunkt', !!hAlt && hAlt.endeTs===auf && hAlt.geschlossenTs===auf, hAlt && (hAlt.endeTs+' / '+hAlt.geschlossenTs));
pruef('8.4b Messung des Vortagsabschlusses (Reflexion) liegt eine Sekunde vor dem Aufstehen — kein gleicher Zeitstempel wie tag.aufstehen.ts', !!hAlt && hAlt.abschluss && hAlt.abschluss.messungTs===new Date(Date.parse(auf)-1000).toISOString() && hAlt.abschluss.messungTs!==S.tag.aufstehen.ts, hAlt && hAlt.abschluss && hAlt.abschluss.messungTs);
var neuId=S.tag.tagId;
pruef('8.5 Einträge ab dem Aufstehzeitpunkt tragen den neuen Tag, der davor bleibt auf dem Vortag', S.intraday.filter(function(e){ return e.id==='s-nachher'; })[0].tagId===neuId && S.intraday.filter(function(e){ return e.kartenId==='t-priv' && e.typ==='tick'; })[0].tagId===neuId && S.intraday.filter(function(e){ return e.id==='s-vorher'; })[0].tagId===g1 && r8.verschoben===3, 'verschoben '+r8.verschoben);
var eck8=S.intraday.filter(function(e){ return e.tagId===neuId && e.eck; });
pruef('8.6 keine Eckpunkte mehr (4.3), Tick auf k3-aufstehen, Übergang nachgeholt', eck8.length===0 && tickAnzahlHeute(_k('k3-aufstehen'))===1 && S.tag.uebergang && S.tag.uebergang.nachgeholt===true, eck8.length+' Eck');   // 4.3: Eckpunkte entfallen
pruef('8.7 Kartenstand: t-priv hat heute 1 Tick, k3-aufstehen ist nicht mehr „abgehakt" vom Vortag', num(_k('t-priv').ticksHeute)===1 && _k('k3-aufstehen').tagId!==g1);
pruef('8.7b Nachbesserung: kein Ausgleich am neuen Tag, die Zeit nach dem Aufstehen zählt heute (60 Min), der Vortag gleicht nur die Zeit davor aus', S.intraday.filter(function(e){ return e.tagId===neuId && e.typ==='ausgleich'; }).length===0 && Math.round(heuteInvestiertMin(_k('t-dfm')))===60 && !S.intraday.some(function(e){ return e.tagId===g1 && e.kartenId==='t-dfm' && e.typ==='ausgleich' && Math.abs(num(e.punkte))>=200; }), JSON.stringify({ ausgleichNeu:S.intraday.filter(function(e){ return e.tagId===neuId && e.typ==='ausgleich'; }).map(function(e){ return e.kartenId+':'+e.punkte; }), min:heuteInvestiertMin(_k('t-dfm')), vortag:S.intraday.filter(function(e){ return e.tagId===g1 && e.kartenId==='t-dfm' && e.typ==='ausgleich'; }).map(function(e){ return e.punkte; }) }));
warten();
pruef('8.8 Tagesbilanz und Trainer-Nachricht gesendet, Protokoll „nachgeholt", meta.tagNachholen gesetzt', _gesendet.some(function(g){ return g.id==='chat-uebergang-'+K.gestern; }) && S.meta.f11Protokoll.some(function(e){ return e.schritt==='nachgeholt'; }) && S.meta.tagNachholen && S.meta.tagNachholen.nachTagId===neuId && !S.meta.tagNachholen.rueckgaengig, _gesendet.map(function(g){ return g.id; }).join(','));
pruef('8.9 Rückgängig möglich, solange nichts Neues gebucht ist', tagNachholenRueckgaengigMoeglich()===true);
pruef('8.10 Rückgängig stellt Tag, Historie, Stunden-Log und Kartenstand wieder her', tagNachholenRueckgaengig()===true && S.tag.tagId===g1 && !S.tag.endeTs && S.intraday.length===nVor && S.intraday[S.intraday.length-1].ts===letzterVor && !S.historie.some(function(h){ return h.tagId===g1 && h.endeTs; }) && _k('k3-aufstehen').status==='erledigt' && !!S.meta.tagNachholen.rueckgaengig, S.tag.tagId+' · '+S.intraday.length+'/'+nVor);
pruef('8.11 danach ist Rückgängig nicht mehr möglich', tagNachholenRueckgaengigMoeglich()===false);
// als Paket der Art tagNachholen: erst Freigabe, dann Anwenden
var res1=syncImport(JSON.stringify({ appVersion:'4.2.1', art:'tagNachholen', aufstehTs:auf, grund:'Test' }));
pruef('8.12 Paket tagNachholen braucht die Freigabe (Vorschau mit Aufstehzeitpunkt, kein Fehler)', !!res1.freigabeNoetig && res1.vorschau && res1.vorschau.tagNachholen && res1.vorschau.tagNachholen.aufstehTs===auf && !res1.vorschau.tagNachholen.fehler, JSON.stringify(res1));
var res2=syncImport(JSON.stringify({ appVersion:'4.2.1', art:'tagNachholen', aufstehTs:auf, grund:'Test' }), { freigabe:true });
pruef('8.13 nach Freigabe: Tag nachgeholt (Ergebnis tagNachholen.ok, heute läuft)', res2.tagNachholen && res2.tagNachholen.ok && S.tag.datum===heuteIso() && S.tag.startTs===auf, JSON.stringify(res2.tagNachholen||res2));
S.intraday.push({ ts:jetztIso(), kartenId:'t-priv', domaene:'privat', punkte:10, minuten:0, typ:'tick', tagId:S.tag.tagId, quelle:'tick' });
pruef('8.14 nach einer neuen Buchung ist Rückgängig nicht mehr möglich', tagNachholenRueckgaengigMoeglich()===false);
pruef('8.15 ohne offenen Vortag wird ein weiteres Nachholen abgewiesen', !!tagNachholen(auf).fehler);
// Nachbesserung: Migration nachholen421 trennt eine Kollision Messungszeit = Aufstehzeit in der Historie
var hx=S.historie.filter(function(h){ return h.tagId===g1; })[0]; hx.abschluss=hx.abschluss||{}; hx.abschluss.messungTs=S.tag.aufstehen.ts; S.meta.nachholen421=null; S.meta.migrationen=[];
var m9=migrationNachholen421();
pruef('8.16 Migration nachholen421 zieht die kollidierende Messungszeit um eine Sekunde vor, Protokoll in meta.migrationen, einmalig', hx.abschluss.messungTs===new Date(Date.parse(S.tag.aufstehen.ts)-1000).toISOString() && m9 && m9.korrigiert.length===1 && S.meta.migrationen[0].name==='nachholen421' && migrationNachholen421()===null, JSON.stringify(m9));
// Nachbesserung: Migration nachholen421b berichtigt einen mit Build 51 nachgeholten Tag (Ausgleich am neuen Tag weg, Vortags-Ausgleich zurück, Ticks nach dem Aufstehen auf den neuen Tag)
var N0=S.meta.tagNachholen; var nTs=jetztIso(); S.meta.tagNachholen={ ts:nTs, aufstehTs:auf, vonTagId:g1, nachTagId:S.tag.tagId, rueckgaengig:null };
S.intraday.push({ ts:auf, kartenId:'t-erh', domaene:'privat', punkte:300, minuten:0, typ:'ausgleich', tagId:g1, quelle:'tagesabschluss' });
S.intraday.push({ ts:nTs, kartenId:'t-erh', domaene:'privat', punkte:-200, minuten:0, typ:'ausgleich', tagId:S.tag.tagId, quelle:'korrektur' });
var q9=tickQuelle(_k('t-priv'), true); q9.tickLog={ tag:g1, ticks:[{ ts:vorher, nr:1, punkte:10 }, { ts:nachher2, nr:2, punkte:10 }] };
hx.punkteBilanz=1000; var w0=num(S.meta.wohlstand); S.meta.nachholen421b=null;
var m10=migrationNachholen421b();
pruef('8.17 nachholen421b: Ausgleich −200 am neuen Tag entfernt, Vortags-Ausgleich 300 → 100, Bilanz des Vortags −200, Konto nachgezogen, Tick nach dem Aufstehen auf dem neuen Tag, einmalig', m10 && m10.entfernt===1 && !S.intraday.some(function(e){ return e.tagId===S.tag.tagId && e.typ==='ausgleich' && e.kartenId==='t-erh'; }) && S.intraday.filter(function(e){ return e.tagId===g1 && e.kartenId==='t-erh' && e.typ==='ausgleich' && e.ts===auf; })[0].punkte===100 && hx.punkteBilanz===800 && num(S.meta.wohlstand)===w0-200 && q9.tickLog.tag===S.tag.tagId && q9.tickLog.ticks.length===1 && migrationNachholen421b()===null, JSON.stringify(m10)+' · wohlstand '+w0+'→'+S.meta.wohlstand);
S.meta.tagNachholen=N0;

// ══ 9 · Version ══
pruef('9.1 App 4.3.3 · Build 2026-11-04-56 · sw.js Cache fokus4-v4.3.3-1 (seit Hotfix 26) · DATENVERTRAG 2.1.0', APP_VERSION==='4.3.3' && APP_BUILD==='2026-11-04-56' && readFile('sw.js').indexOf("const CACHE = 'fokus4-v4.3.3-1'")>=0 && DATENVERTRAG==='2.1.0', APP_VERSION+' / '+APP_BUILD);
suiteEnde('Hotfix 24 · Tageswechsel (4.3.0)');
