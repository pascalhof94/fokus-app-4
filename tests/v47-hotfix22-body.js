/* Suite 4.7 · Hotfix 22 (Auftrag 28.10.2026, §7.2): §1 fester Punktesatz je Sitzung (punkteJeStd, vermerk Pflicht, manuell, vorher bei aendern),
   Überlappung abgewiesen, ✍︎ in den Ansichten · §3.4 Kartenansicht Korrektur · §4 Nachtrag mit Punkten und Lücken-Vorschlag ·
   §5 Kopier-Knopf an Zitat- und Codeblock, Text markierbar · Version 4.1.13, Build 48.
   Aufruf: jsc tests/v47-hotfix22.js · Geschrieben, im Rahmen des Auftrags nicht ausgeführt. */
var _toasts=[]; toast=function(m){ _toasts.push(String(m)); }; haptik=function(){};
testTag();
var KA=neueKarte({ id:'k-h22-a', titel:'Karte A Hotfix 22', domain:'dfm', status:'offen', istSek:0, sollMin:60, projekt:'P' });
var KB=neueKarte({ id:'k-h22-b', titel:'Karte B Hotfix 22', domain:'dfm', status:'offen', istSek:0, sollMin:60, projekt:'P' });
S.karten.push(KA, KB);
var TAG='2026-10-20';   // ein Tag vor heute, ohne Snapshot
var mG0=num(S.meta.muenzenGesamt), ws0=num(S.meta.wohlstand), n0=(S.intraday||[]).length;

// ══ §1.1/§1.2 · hinzu mit festem Satz ══
var abg=[];
korrekturAnwenden({ datum:TAG, grund:'Test Hotfix 22', sitzungen:[{ aktion:'hinzu', karteId:'k-h22-a', von:'10:00', bis:'11:30', punkteJeStd:1000, vermerk:'Von Pascal gesetzt' }] }, abg);
var e1=(S.intraday||[]).find(function(x){ return x.kartenId==='k-h22-a' && x.typ==='korrektur'; });
pruef('§1.2 hinzu mit punkteJeStd 1000: 90 Min → 1.500 P statt Stundenleiter, Eintrag manuell/punkteJeStd/vermerk, typ korrektur mit von/bis', abg.length===0 && !!e1 && e1.punkte===1500 && e1.minuten===90 && e1.manuell===true && e1.punkteJeStd===1000 && e1.vermerk==='Von Pascal gesetzt' && !!e1.von && !!e1.ts, JSON.stringify([abg, e1]));
var h=(S.historie||[]).find(function(x){ return x.datum===TAG; });
pruef('§1.3/§3.4a vergangener Tag: Snapshot angelegt, Tagesbilanz +1.500, Zeit dfm +5.400 s, Konto (Münzen, Wohlstand) über kontoNachziehen gestiegen, Log-Zeile art korrektur', !!h && num(h.punkteBilanz)===1500 && num(h.zeit.dfm)===5400 && num(S.meta.muenzenGesamt)===mG0+1500 && num(S.meta.wohlstand)===ws0+1500 && (h.log||[]).some(function(l){ return l.art==='korrektur' && l.punkte===1500; }), JSON.stringify([h && h.punkteBilanz, h && h.zeit, num(S.meta.muenzenGesamt)-mG0, num(S.meta.wohlstand)-ws0]));
pruef('§1.2 Karte: istSek +5.400', num(KA.istSek)===5400, KA.istSek);
// vermerk Pflicht, Satz-Grenze
abg=[]; korrekturAnwenden({ datum:TAG, grund:'T', sitzungen:[{ aktion:'hinzu', karteId:'k-h22-b', von:'12:00', bis:'12:30', punkteJeStd:500 }] }, abg);
pruef('§1.1 punkteJeStd ohne vermerk → abgewiesen „vermerk fehlt“, nichts gebucht', abg.length===1 && abg[0].grund==='vermerk fehlt' && !(S.intraday||[]).some(function(x){ return x.kartenId==='k-h22-b'; }), JSON.stringify(abg));
abg=[]; korrekturAnwenden({ datum:TAG, grund:'T', sitzungen:[{ aktion:'hinzu', karteId:'k-h22-b', von:'12:00', bis:'12:30', punkteJeStd:6000, vermerk:'x' }] }, abg);
pruef('§1.1 punkteJeStd 6.000 → abgewiesen (0 … 5.000)', abg.length===1 && /0 … 5\.000/.test(abg[0].grund), JSON.stringify(abg));
// ══ §1.2 · aendern mit vorher ══
abg=[]; korrekturAnwenden({ datum:TAG, grund:'T2', sitzungen:[{ aktion:'aendern', id:e1.id, karteId:'k-h22-a', von:'10:00', bis:'12:00', punkteJeStd:1000, vermerk:'geändert' }] }, abg);
var e2=(S.intraday||[]).find(function(x){ return x.kartenId==='k-h22-a' && x.typ==='korrektur' && sitzungIdVon(x)===e1.id; });
pruef('§1.2 aendern: gleiche id, 120 Min → 2.000 P, vorher { von, bis, minuten 90, punkte 1500 }, vermerk neu, Bilanz 2.000, Münzen +2.000 gesamt', abg.length===0 && !!e2 && e2.punkte===2000 && e2.minuten===120 && !!e2.vorher && e2.vorher.minuten===90 && e2.vorher.punkte===1500 && e2.vermerk==='geändert' && num(h.punkteBilanz)===2000 && num(S.meta.muenzenGesamt)===mG0+2000 && num(KA.istSek)===7200, JSON.stringify([abg, e2 && e2.vorher, h.punkteBilanz, num(S.meta.muenzenGesamt)-mG0, KA.istSek]));
abg=[]; var nVor=(S.intraday||[]).length;
korrekturAnwenden({ datum:TAG, grund:'T2', sitzungen:[{ aktion:'aendern', id:e1.id, karteId:'k-h22-a', von:'10:00', bis:'12:00', punkteJeStd:1000, vermerk:'geändert' }] }, abg);
pruef('§1.2 zweites Einspielen derselben Änderung: „schon so“, nichts abgewiesen, nichts verändert', abg.length===0 && (S.intraday||[]).length===nVor && num(h.punkteBilanz)===2000, JSON.stringify([abg, (S.intraday||[]).length-nVor]));
// ══ §1.4 · Überlappung ══
abg=[]; korrekturAnwenden({ datum:TAG, grund:'T3', sitzungen:[{ aktion:'hinzu', karteId:'k-h22-b', von:'11:00', bis:'11:30', punkteJeStd:1000, vermerk:'x' }] }, abg);
pruef('§1.4 hinzu überlappt eine Uhr-Sitzung desselben Tages → abgewiesen „überlappt Karte A … 10:00–12:00“, nichts gebucht', abg.length===1 && /^überlappt Karte A Hotfix 22 10:00–12:00$/.test(abg[0].grund) && !(S.intraday||[]).some(function(x){ return x.kartenId==='k-h22-b'; }), JSON.stringify(abg));
abg=[]; korrekturAnwenden({ datum:TAG, grund:'T3', sitzungen:[{ aktion:'hinzu', karteId:'k-h22-b', von:'12:00', bis:'12:30', punkteJeStd:1000, vermerk:'x' }] }, abg);
var eB=(S.intraday||[]).find(function(x){ return x.kartenId==='k-h22-b' && x.typ==='korrektur'; });
pruef('§1.4 Berührung an der Grenze (12:00) ist keine Überlappung: gebucht, 500 P', abg.length===0 && !!eB && eB.punkte===500, JSON.stringify(abg));
abg=[]; korrekturAnwenden({ datum:TAG, grund:'T3', sitzungen:[{ aktion:'aendern', id:eB.id, karteId:'k-h22-b', von:'11:30', bis:'12:30', punkteJeStd:1000, vermerk:'x' }] }, abg);
pruef('§1.4 aendern in eine andere Sitzung hinein → abgewiesen; die geänderte Sitzung selbst zählt nicht', abg.length===1 && /^überlappt Karte A/.test(abg[0].grund) && eB.minuten===30, JSON.stringify(abg));
abg=[]; korrekturAnwenden({ datum:TAG, grund:'T3', sitzungen:[{ aktion:'aendern', id:eB.id, karteId:'k-h22-b', von:'12:00', bis:'13:00', punkteJeStd:1000, vermerk:'x' }] }, abg);
var eB2=(S.intraday||[]).find(function(x){ return x.kartenId==='k-h22-b' && x.typ==='korrektur'; });
pruef('§1.4 aendern ohne Überlappung mit sich selbst: 60 Min, 1.000 P', abg.length===0 && !!eB2 && eB2.minuten===60 && eB2.punkte===1000, JSON.stringify(abg));
// ohne Satz: Stundenleiter wie bisher
abg=[]; korrekturAnwenden({ datum:TAG, grund:'T4', sitzungen:[{ aktion:'hinzu', karteId:'k-h22-b', von:'14:00', bis:'15:00' }] }, abg);
var eS=(S.intraday||[]).filter(function(x){ return x.kartenId==='k-h22-b' && x.typ==='korrektur'; }).pop();
pruef('§1 ohne punkteJeStd: Punkte nach sitzungPunkteFuer, kein manuell', abg.length===0 && !!eS && !eS.manuell && eS.punkte===Math.round(sitzungPunkteFuer(KB, 60, TAG)*10)/10, JSON.stringify([abg, eS && eS.punkte]));
// ══ §1.5 · ✍︎ in den Ansichten ══
var jetzt=Date.now(), vonH=new Date(jetzt-120*60000).toISOString(), bisH=new Date(jetzt-90*60000).toISOString();
abg=[]; korrekturAnwenden({ datum:belFensterDatum(jetztIso()), grund:'heute', sitzungen:[{ aktion:'hinzu', karteId:'k-h22-a', von:vonH, bis:bisH, punkteJeStd:800, vermerk:'heute gesetzt' }] }, abg);
var strahl=tagesBloeckeStrahl(), strahl4=f4BloeckeStrahl();
pruef('§1.5 Zeitstrahl und Ist-Streifen tragen manuell/vermerk', abg.length===0 && strahl.ist.some(function(b){ return b.manuell===true && b.vermerk==='heute gesetzt'; }) && strahl4.ist.some(function(b){ return b.manuell===true && b.vermerk==='heute gesetzt'; }), JSON.stringify([abg, strahl.ist.filter(function(b){ return b.manuell; })]));
pruef('§1.5 SVG: ✍︎ und <title> mit Vermerk; die drei Zeichner rufen manuellTitelSvg/manuellMarkeSvg', manuellMarkeSvg({ manuell:true, vermerk:'v' }, 10, 20, 12).indexOf('✍︎')>0 && manuellTitelSvg({ manuell:true, vermerk:'Mein <Vermerk>' })==='<title>✍︎ Mein &lt;Vermerk&gt;</title>' && manuellMarkeSvg({ manuell:false }, 0, 0, 10)==='' && (function(){ var s=readFile('index.html'); return (s.match(/manuellTitelSvg\(b\)\+'<\/rect>'\+manuellMarkeSvg\(b, xa, /g)||[]).length===3; })());
var sitzA=kartenSitzungenHeute('k-h22-a');
pruef('§1.5 Sitzungsliste je Karte (Export): manuell, punkteJeStd, vermerk', sitzA.some(function(s){ return s.manuell===true && s.punkteJeStd===800 && s.vermerk==='heute gesetzt'; }), JSON.stringify(sitzA));
// ══ §3.4 · Kartenansicht Korrektur ══
var tb=f15TabelleHtml('| Karte | von | bis |\n|---|---|---|\n| A <x> | 10:00 | 11:30 |\nHinweis');
pruef('§3.4 f15TabelleHtml: Kopf als th, Trennzeile weg, Zellen escaped, übrige Zeilen wie sonst', tb==='<table class="f15-tab"><tr><th>Karte</th><th>von</th><th>bis</th></tr><tr><td>A &lt;x&gt;</td><td>10:00</td><td>11:30</td></tr></table>Hinweis', tb);
pruef('§3.4 Quelltext: Art „Korrektur“ zeigt die Tabelle; Freigeben legt für Art Korrektur keine Karte an', (function(){ var s=readFile('index.html'); return s.indexOf("const korrektur=String(r.Art||'')==='Korrektur';")>=0 && s.indexOf("(korrektur ? f15TabelleHtml(f15OutputOhneOptionen(r['Output/Entwurf'])) : f12TextHtml(")>=0 && s.indexOf("if(String(r.Art||'')==='Korrektur') extra.keineKarte=true;")>=0; })());
// ══ §4 · Nachträge ══
if(!tagOffen()){ tagStarten(70); S.tag.startTs=jetztIso(); }
var vs=nachtragVorschlag(30);
pruef('§4.2 Vorschlag: jüngste Lücke vor jetzt (nach der Sitzung bis jetzt−90 Min), gekürzt auf 30 Min, Ende jetzt', Math.abs(vs.bis-Date.now())<3000 && Math.abs((vs.bis-vs.von)/60000-30)<0.1, JSON.stringify([vs, Date.now()]));
S.fokus={ karteId:'k-h22-b', laeuft:true, startMs:Date.now()-10*60000 };
var vs2=nachtragVorschlag(30);
pruef('§4.2 Vorschlag bei laufender Uhr: Lücke endet mit ihrem Start (jetzt−10 Min), 30 Min davor', Math.abs(vs2.bis-(Date.now()-10*60000))<3000 && Math.abs((vs2.bis-vs2.von)/60000-30)<0.1, JSON.stringify(vs2));
var vs3=nachtragVorschlag(200);
pruef('§4.2 Vorschlag gekürzt auf die Lücke: Anfang = Ende der vorigen Sitzung (jetzt−90 Min), nie in sie hinein', Math.abs(vs3.von-(Date.now()-90*60000))<3000, JSON.stringify(vs3));
S.fokus=null;
var ue=nachtragUeberlappt(Date.now()-100*60000, Date.now()-95*60000, null), ue2=nachtragUeberlappt(Date.now()-80*60000, Date.now()-70*60000, null);
pruef('§4.2 Überlappung erkannt (Karte A, jetzt−120…−90) · Lücke frei', !!ue && /^Karte A/.test(ue.karte) && ue2===null, JSON.stringify([ue, ue2]));
var z1=nachtragZeiten('', '', 30), z2=nachtragZeiten('10:00', '', 30), z3=nachtragZeiten('12:00', '11:00', 30);
pruef('§4.2 nachtragZeiten: leer → Vorschlag · nur Von → Fehler · Bis vor Von → Fehler', !z1.fehler && z1.bis>z1.von && z2.fehler==='Von und Bis zusammen angeben' && z3.fehler==='Bis liegt vor Von', JSON.stringify([z1.fehler, z2, z3]));
var istVor=num(KB.istSek), nVorN=(S.intraday||[]).length;
var ne=nachtragBuchen(KB, Date.now()-80*60000, Date.now()-50*60000);
pruef('§4.1 Nachtrag bucht 30 Min mit von/bis und Punkte nach der Stundenleiter (> 0), istSek +1.800', !!ne && ne.typ==='nachtrag' && ne.minuten===30 && !!ne.von && num(ne.punkte)>0 && num(KB.istSek)===istVor+1800 && (S.intraday||[]).length===nVorN+1, JSON.stringify([ne && ne.punkte, num(KB.istSek)-istVor]));
pruef('§4.1 Quelltext: Abhaken-Nachtrag mit Punkten (buchungAbgleich), Detail-Dialog mit Von/Bis, Überlappung sperrt das Speichern', (function(){ var s=readFile('index.html'); return s.indexOf("if(deltaMin>0){ ne.von=new Date(Date.now()-deltaMin*60000).toISOString(); buchungAbgleich(k, ne); }")>=0 && s.indexOf('data-bind="_nachtragVon" id="nachtragVon"')>=0 && s.indexOf("— Nachtrag nicht gespeichert'); return; }")>=0 && s.indexOf("_nachtragE=nachtragBuchen(entwurf, z.von, z.bis);")>=0; })());
// ══ §5 · Kopieren ══
var th=f12TextHtml('Hallo\n> Zeile a\n> Zeile b\nText\n```\ncode1\ncode2\n```\n- l1\n- l2');
pruef('§5.2 Zitatblock: 📋 mit genau „Zeile a\\nZeile b“ (ohne „> “), Codeblock als <pre class="f12-code"> mit „code1\\ncode2“', th.indexOf('<div class="f12-zit"><button type="button" class="f12-kopie" data-f12kopie="Zeile a\nZeile b"')>=0 && th.indexOf('Zeile a<br>Zeile b</div>')>=0 && th.indexOf('<pre class="f12-code"><button type="button" class="f12-kopie" data-f12kopie="code1\ncode2"')>=0 && th.indexOf('code1\ncode2</pre>')>=0 && th.indexOf('<ul><li>l1</li><li>l2</li></ul>')>=0 && th.indexOf('Hallo')===0, th);
pruef('§5.2 Text ohne Zitat/Code unverändert wie bisher', f12TextHtml('a\nb\n- c')==='a<br>b<ul><li>c</li></ul>', f12TextHtml('a\nb\n- c'));
pruef('§5.3 Ganze Nachricht: Knopf am Fuß in beiden Nachrichtenzweigen; Kopier-Tipp vom Tipp-Abfang ausgenommen', f12KopieGanzKnopf('x "y"').indexOf('data-f12kopie="x &quot;y&quot;"')>=0 && (function(){ var s=readFile('index.html'); return (s.match(/\+f12KopieGanzKnopf\(text\)\+/g)||[]).length===2 && s.indexOf("t.closest('[data-f12kopie]')")>=0; })());
pruef('§5.1/§5.4 Quelltext: Text in .f7-m und .f15-block .out markierbar; kopieren() mit navigator.clipboard und Rückfall execCommand', (function(){ var s=readFile('index.html'); return s.indexOf('.f7-m,.f15-block .out{user-select:text;-webkit-user-select:text}')>=0 && s.indexOf('navigator.clipboard.writeText(text).then(ok, rueckfall)')>=0 && s.indexOf("document.execCommand('copy')")>=0; })());
// ══ Version ══
pruef('§7.1 App 4.1.13 · Build 2026-10-28-48 · sw.js Cache -9', APP_VERSION==='4.1.13' && APP_BUILD==='2026-10-28-48' && readFile('sw.js').indexOf("const CACHE = 'fokus4-v4.0.0-9'")>=0, APP_VERSION+' / '+APP_BUILD);
suiteEnde('Hotfix 22 · Punkte-Korrektur je Sitzung, Nachträge, Kopieren, Kartenansicht Korrektur (4.1.13)');
