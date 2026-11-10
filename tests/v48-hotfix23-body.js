/* Suite 4.8 · Hotfix 23 (Auftrag 02.11.2026, §6.1): §1 Farbe-Startpunkt (ausmalWRoh / farbeReset.basis) · §2 spielResetShop / spielResetKulisse je mit
   oder ohne Währung, Sicherung, Log, Rückgängig und seine Sperren · §3 Karte „🎮 Spiel zurücksetzen“ und Bestätigungs-Sheet · §4 Export additiv ·
   §5 Version 4.1.14, Build 49.
   Aufruf: jsc tests/v48-hotfix23.js · Geschrieben, im Rahmen des Auftrags nicht ausgeführt. */
var _toasts=[]; toast=function(m){ _toasts.push(String(m)); }; haptik=function(){};
fsliveStumm();
testTag();
// etwas Farbe aus einem abgeschlossenen Tag, damit ausmalWRoh() > 0 ist; reset35.ts entsteht beim Laden mit „jetzt“ und würde den Tag sonst herausfiltern
if(S.meta.reset35 && String(S.meta.reset35.ts).slice(0,10)>'2026-10-30') S.meta.reset35.ts='2026-10-01T00:00:00.000Z';
S.historie.push({ datum:'2026-10-30', tagId:'2026-10-30-1', laufindex:1, startTs:'2026-10-30T06:00:00.000Z', endeTs:'2026-10-30T20:00:00.000Z', punkteBilanz:400, punkteDfm:400, punktePrivat:0, aufgabenBonus:0, akku:70, log:[], zeit:{ dfm:3600, privat:0 } });
function summeStufen(){ return KAT_KEYS.reduce(function(a,k){ return a+num(S.belohnung.stufen[k],0); }, 0); }
function alleNull(){ return KAT_KEYS.every(function(k){ return S.belohnung.stufen[k]===0; }); }

// ══ Ausgangslage Shop ══
belohnungInit();
var kA=KAT_KEYS[0], kB=KAT_KEYS[KAT_KEYS.length-1];
S.belohnung.stufen[kA]=3; if(kB!==kA) S.belohnung.stufen[kB]=2;
S.meta.muenzenGesamt=5000; S.meta.muenzenResetOffset=0; S.meta.ausgegebenGesamt=1200; S.meta.ausgabenResetOffset=0; S.meta.rangPunkte=num(S.meta.rangPunkte)+700; S.meta.rangResetOffset=num(S.meta.rangResetOffset);
var stufen0=summeStufen(), konto0=konto(), mO0=num(S.meta.muenzenResetOffset), aO0=num(S.meta.ausgabenResetOffset);
pruef('Vorbereitung: Stufen gekauft > 0, Konto > 0, kein spielReset im Bestand', stufen0>0 && konto0>0 && !S.meta.spielReset && !S.meta.spielResetLog, JSON.stringify([stufen0, konto0]));

// ══ 1 · Shop ohne Währung ══
var r1=spielResetShop(false);
pruef('6.1.1 Shop ohne: Stufen 0, konto() unverändert, beide Offsets unverändert, Sicherung spielreset_bak_shop, spielReset.shop (ohne), eine Log-Zeile, Rückgabe', alleNull() && konto()===konto0 && num(S.meta.muenzenResetOffset)===mO0 && num(S.meta.ausgabenResetOffset)===aO0 && !!DB.get('spielreset_bak_shop') && DB.get('spielreset_bak_shop').vorher.kontoVorher===Math.round(konto0) && !!S.meta.spielReset.shop && S.meta.spielReset.shop.mitWaehrung===false && S.meta.spielResetLog.length===1 && S.meta.spielResetLog[0].bereich==='shop' && S.meta.spielResetLog[0].rueckgaengig===null && r1.kontoVorher===Math.round(konto0) && r1.stufenVorher===stufen0, JSON.stringify([S.belohnung.stufen, konto(), r1, S.meta.spielResetLog]));

// ══ 2 · Shop mit Währung ══
S.belohnung.stufen[kA]=3; if(kB!==kA) S.belohnung.stufen[kB]=2;
var mG0=num(S.meta.muenzenGesamt), aG0=num(S.meta.ausgegebenGesamt), rO0=num(S.meta.rangResetOffset), rang0=rangPunkteAnzeige(), konto2=konto();
var r2=spielResetShop(true);
pruef('6.1.2 Shop mit: Stufen 0, konto()===0, muenzenGesamt/ausgegebenGesamt unverändert, rangResetOffset und rangPunkteAnzeige() unverändert, spielReset.shop (mit), zwei Log-Zeilen', alleNull() && konto()===0 && num(S.meta.muenzenGesamt)===mG0 && num(S.meta.ausgegebenGesamt)===aG0 && num(S.meta.rangResetOffset)===rO0 && rangPunkteAnzeige()===rang0 && S.meta.spielReset.shop.mitWaehrung===true && S.meta.spielResetLog.length===2 && r2.kontoVorher===Math.round(konto2), JSON.stringify([konto(), num(S.meta.muenzenResetOffset), num(S.meta.ausgabenResetOffset), rangPunkteAnzeige(), rang0]));

// ══ 3 · Münzen zählen ab jetzt ══
S.meta.muenzenGesamt=num(S.meta.muenzenGesamt)+100;
pruef('6.1.3 danach muenzenGesamt += 100 → konto()===100', konto()===100, konto());

// ══ 4 · Rückgängig Shop mit ══
var moegl4=spielResetRueckgaengigMoeglich('shop');
var ok4=spielResetRueckgaengig('shop');
var logShop=S.meta.spielResetLog.filter(function(z){ return z.bereich==='shop'; });
pruef('6.1.4 Rückgängig Shop mit: möglich, Stufen und Offsets wie vorher, konto()===kontoVorher+100, spielReset.shop===null, jüngste Log-Zeile mit rueckgaengig', moegl4.ok===true && ok4===true && summeStufen()===stufen0 && S.belohnung.stufen[kA]===3 && num(S.meta.muenzenResetOffset)===mO0 && num(S.meta.ausgabenResetOffset)===aO0 && konto()===konto2+100 && S.meta.spielReset.shop===null && typeof logShop[1].rueckgaengig==='string' && logShop[0].rueckgaengig===null, JSON.stringify([moegl4, konto(), konto2, S.meta.spielResetLog]));

// ══ 5 · Rückgängig gesperrt nach Kauf ══
spielResetShop(false);
var kaufTs=new Date(Date.now()+2000).toISOString();
S.belohnung.kaeufe.push({ kat:kA, stufe:1, name:'Test Hotfix 23', datum:heuteApp(), preis:1, ts:kaufTs });
var moegl5=spielResetRueckgaengigMoeglich('shop'), ok5=spielResetRueckgaengig('shop');
pruef('6.1.5 Kauf mit ts nach dem Reset: grund „seitdem gekauft“, Rückgängig ändert nichts (Stufen bleiben 0, Eintrag bleibt)', moegl5.ok===false && moegl5.grund==='seitdem gekauft' && ok5===false && alleNull() && !!S.meta.spielReset.shop, JSON.stringify([moegl5, ok5, S.belohnung.stufen]));
S.belohnung.kaeufe.pop();
pruef('6.1.5 ohne den Kauf wieder möglich; Rückgängig stellt die Stufen her', spielResetRueckgaengigMoeglich('shop').ok===true && spielResetRueckgaengig('shop')===true && summeStufen()===stufen0 && S.meta.spielReset.shop===null, JSON.stringify([S.belohnung.stufen, S.meta.spielResetLog.length]));
var logVorKulisse=S.meta.spielResetLog.length;

// ══ 6 · Kulisse ohne Währung ══
function kulisseAusgangslage(){
  var A=ausmalState();
  A.kulisse=10; A.gefaerbt=[1,2,3]; A.fertig=[1,2,3,4,5,6,7,8,9]; A.freigeschaltetBis=10;
  A.kulissenFertig=[1,2,3,4,5,6,7,8,9].map(function(n){ return { kulisse:n, ts:'2026-0'+(n<9?n+1:9)+'-01T10:00:00.000Z', tage:3, farbe:1000, fokusMin:60, felder:40 }; });
  A.kulissenStart={ 10:'2026-10-01T00:00:00.000Z' };
  A.toepfe=[{ farbe:2, punkte:500 }, { farbe:null, punkte:0 }, { farbe:null, punkte:0 }, { farbe:null, punkte:0 }, { farbe:null, punkte:0 }];
  A.aktiverTopf=0; A.stationFarbe=2; A.tank=300; A.verteilt=120; A.wohlstandSeitReset=120;
  S.meta.kulisseErreicht={ 1:'2026-01-01', 10:'2026-10-01' };
  return A;
}
var A=kulisseAusgangslage(); var farbe6=farbeGesamt(), vert6=num(A.verteilt);
var r6=spielResetKulisse(false); A=ausmalState();
pruef('6.1.6 Kulisse ohne: kulisse 1, gefaerbt/fertig/kulissenFertig leer, freigeschaltetBis 1, Töpfe leer, tank 800 (300 + Topf 500), ein Durchgang (kulisse 10, 9 fertig), farbeGesamt() und verteilt unverändert, kulisseErreicht {1:heute}, kein farbeReset, kulissenStart {1:ts}', A.kulisse===1 && A.gefaerbt.length===0 && A.fertig.length===0 && A.kulissenFertig.length===0 && A.freigeschaltetBis===1 && A.toepfe.length===5 && A.toepfe.every(function(t){ return t.farbe===null && num(t.punkte)===0; }) && A.aktiverTopf===0 && A.stationFarbe===null && Math.round(num(A.tank))===800 && A.durchgaenge.length===1 && A.durchgaenge[0].kulisse===10 && A.durchgaenge[0].fertig.length===9 && A.durchgaenge[0].kulissenFertig.length===9 && A.durchgaenge[0].gefaerbt===3 && A.durchgaenge[0].tank===300 && A.durchgaenge[0].mitWaehrung===false && farbeGesamt()===farbe6 && num(A.verteilt)===vert6 && JSON.stringify(S.meta.kulisseErreicht)===JSON.stringify({ 1:heuteApp() }) && !S.meta.farbeReset && Object.keys(A.kulissenStart).join(',')==='1' && A.kulissenStart[1]===S.meta.spielReset.kulisse.ts, JSON.stringify([A.kulisse, A.tank, A.durchgaenge, S.meta.kulisseErreicht, A.kulissenStart]));
pruef('6.1.6 Rückgabe, Sicherung spielreset_bak_kulisse, Log-Zeile kulisse', r6.kulisseVorher===10 && r6.galerieVorher===9 && r6.tankVorher===300 && r6.farbeVorher===farbe6 && !!DB.get('spielreset_bak_kulisse') && DB.get('spielreset_bak_kulisse').vorher.ausmalen.kulisse===10 && S.meta.spielResetLog.length===logVorKulisse+1 && S.meta.spielResetLog[logVorKulisse].bereich==='kulisse' && S.meta.spielResetLog[logVorKulisse].mitWaehrung===false, JSON.stringify([r6, S.meta.spielResetLog]));

// ══ 7 · Kulisse mit Währung ══
A=kulisseAusgangslage(); var roh7=ausmalWRoh();
pruef('Vorbereitung 7: ausmalWRoh() > 0 (Farbe aus der Historie), farbeGesamt() > 0', roh7>0 && farbeGesamt()>0, JSON.stringify([roh7, farbeGesamt()]));
var r7=spielResetKulisse(true); A=ausmalState();
pruef('6.1.7 Kulisse mit: tank 0, farbeGesamt()===0, verteilt 0, wohlstandSeitReset 0, farbeReset.basis===ausmalWRoh() im Moment des Resets, zwei Durchgänge, Log mit', Math.round(num(A.tank))===0 && farbeGesamt()===0 && num(A.verteilt)===0 && num(A.wohlstandSeitReset)===0 && !!S.meta.farbeReset && S.meta.farbeReset.basis===roh7 && S.meta.farbeReset.ts===S.meta.spielReset.kulisse.ts && A.durchgaenge.length===2 && A.durchgaenge[1].mitWaehrung===true && r7.tankVorher===300 && r7.farbeVorher===Math.round(roh7), JSON.stringify([A.tank, farbeGesamt(), A.verteilt, S.meta.farbeReset, roh7]));

// ══ 8 · Rückgängig Kulisse ══
var moegl8=spielResetRueckgaengigMoeglich('kulisse'), ok8=spielResetRueckgaengig('kulisse'); A=ausmalState();
pruef('6.1.8 Rückgängig Kulisse: möglich, Stand wie vorher (kulisse 10, gefaerbt [1,2,3], tank 300, verteilt 120, 9 fertig, Topf 0 = 500), farbeReset wieder nicht vorhanden, kulisseErreicht wie vorher, ein Durchgang, spielReset.kulisse null, Log-Zeile mit rueckgaengig', moegl8.ok===true && ok8===true && A.kulisse===10 && JSON.stringify(A.gefaerbt)==='[1,2,3]' && Math.round(num(A.tank))===300 && num(A.verteilt)===120 && A.fertig.length===9 && A.kulissenFertig.length===9 && A.toepfe[0].farbe===2 && num(A.toepfe[0].punkte)===500 && !('farbeReset' in S.meta) && farbeGesamt()===Math.round(roh7) && JSON.stringify(S.meta.kulisseErreicht)===JSON.stringify({ 1:'2026-01-01', 10:'2026-10-01' }) && A.durchgaenge.length===1 && S.meta.spielReset.kulisse===null && typeof S.meta.spielResetLog[S.meta.spielResetLog.length-1].rueckgaengig==='string', JSON.stringify([moegl8, ok8, A.kulisse, A.gefaerbt, A.tank, A.verteilt, S.meta.farbeReset, S.meta.kulisseErreicht]));
// farbeReset vorhanden → kommt genauso zurück
S.meta.farbeReset={ ts:'2026-10-20T10:00:00.000Z', basis:7 };
spielResetKulisse(true); var basisNeu=S.meta.farbeReset.basis; spielResetRueckgaengig('kulisse');
pruef('6.1.8 farbeReset vorhanden: der Reset setzt ihn neu, Rückgängig stellt { ts, basis 7 } wieder her', basisNeu!==7 && !!S.meta.farbeReset && S.meta.farbeReset.basis===7 && S.meta.farbeReset.ts==='2026-10-20T10:00:00.000Z' && ausmalState().kulisse===10, JSON.stringify([basisNeu, S.meta.farbeReset]));
delete S.meta.farbeReset;

// ══ 9 · Rückgängig gesperrt ══
spielResetKulisse(false); A=ausmalState();
A.gefaerbt.push(5);
var m9a=spielResetRueckgaengigMoeglich('kulisse'), ok9a=spielResetRueckgaengig('kulisse');
pruef('6.1.9 nach gefaerbt.push(5): grund „seitdem gemalt“, Rückgängig ändert nichts', m9a.ok===false && m9a.grund==='seitdem gemalt' && ok9a===false && ausmalState().kulisse===1 && !!S.meta.spielReset.kulisse, JSON.stringify([m9a, ok9a]));
A.gefaerbt=[];
if(!Array.isArray(A.tankVerkauf)) A.tankVerkauf=[];
A.tankVerkauf.push({ ts:new Date(Date.now()+2000).toISOString(), farbe:100, muenzen:50 });
var m9b=spielResetRueckgaengigMoeglich('kulisse'), ok9b=spielResetRueckgaengig('kulisse');
pruef('6.1.9 tankVerkauf-Eintrag mit späterem ts: grund „seitdem Tank verkauft“, Rückgängig ändert nichts', m9b.ok===false && m9b.grund==='seitdem Tank verkauft' && ok9b===false && ausmalState().kulisse===1, JSON.stringify([m9b, ok9b]));
A.tankVerkauf.pop();
pruef('6.1.9 ohne den Verkauf wieder möglich (kulisse 1, nichts gemalt)', spielResetRueckgaengigMoeglich('kulisse').ok===true && spielResetRueckgaengig('kulisse')===true && ausmalState().kulisse===10, ausmalState().kulisse);
pruef('6.1.9 kulisse !== 1 ohne Eintrag: grund leer (kein Eintrag) · mit Eintrag und Kulisse 2: „seitdem gemalt“', spielResetRueckgaengigMoeglich('kulisse').grund==='' && (function(){ spielResetKulisse(false); ausmalState().kulisse=2; var m=spielResetRueckgaengigMoeglich('kulisse'); ausmalState().kulisse=1; var ok=spielResetRueckgaengig('kulisse'); return m.grund==='seitdem gemalt' && ok===true; })(), JSON.stringify(S.meta.spielReset));

// ══ 10 · Farbe-Startpunkt ══
var roh10=ausmalWRoh();
S.meta.farbeReset={ ts:jetztIso(), basis:roh10-50 };
var w10=ausmalW(); delete S.meta.farbeReset;
pruef('6.1.10 ausmalW() mit farbeReset.basis = ausmalWRoh()−50 ergibt 50; ohne farbeReset gilt ausmalW()===ausmalWRoh()', w10===50 && ausmalW()===ausmalWRoh() && farbeGesamt()===Math.round(roh10), JSON.stringify([roh10, w10, ausmalW()]));
pruef('6.1.10 Quelltext: ausmalWRoh() trägt den alten Körper (reset35-Datum), ausmalW() ist die Einzeiler-Differenz', (function(){ var s=readFile('index.html'); return s.indexOf("function ausmalWRoh(){\n  const ab=(S.meta && S.meta.reset35 && S.meta.reset35.ts)")>=0 && s.indexOf("function ausmalW(){ return Math.max(0, ausmalWRoh() - num(S.meta && S.meta.farbeReset && S.meta.farbeReset.basis)); }")>=0; })());

// ══ 11 · Einstellungen ══
einstAbschnittUmschalten('spiel-zurücksetzen');   // der Abschnitt ist standardmäßig zu — zum Prüfen des Inhalts öffnen
renderEinst(); var eh=el('einstBody').innerHTML;
pruef('6.1.11 renderEinst(): „🎮 Spiel zurücksetzen“ als Abschnitt spiel-zurücksetzen, data-spielreset shop und kulisse, Zeilen 🛍 Shop und 🖼 Kulisse, Versionszeile zuletzt', eh.indexOf('🎮 Spiel zurücksetzen')>=0 && eh.indexOf('data-einstabschnitt="spiel-zurücksetzen"')>=0 && eh.indexOf('data-spielreset="shop"')>=0 && eh.indexOf('data-spielreset="kulisse"')>=0 && eh.indexOf('🛍 Shop<br>')>=0 && eh.indexOf('🖼 Kulisse<br>')>=0 && eh.indexOf('Kulisse 10 · ')>=0 && eh.lastIndexOf('id="einstVersion"')>eh.lastIndexOf('data-spielreset='), eh.slice(eh.indexOf('🎮 Spiel zurücksetzen')-200, eh.indexOf('🎮 Spiel zurücksetzen')+900));
pruef('6.1.11 keine alten Karten: kein data-panoreset, kein data-shopreset=, kein „Eingriffe mit Tragweite“; panoramaResetJetzt und shopResetJetzt existieren nicht mehr', eh.indexOf('data-panoreset')<0 && eh.indexOf('data-shopreset=')<0 && eh.indexOf('Eingriffe mit Tragweite')<0 && typeof panoramaResetJetzt==='undefined' && typeof shopResetJetzt==='undefined' && typeof panoramaResetUndo==='undefined' && typeof oeffneShopReset==='undefined' && typeof SPIELSTAND_RESET_TEXT==='undefined');
pruef('6.1.11 ohne letzten Reset keine Zeile „Zuletzt“; die anderen Reset-Knöpfe bleiben (🗑 Alle Karten löschen, ↺ DFM auf Standard, ↺ Privat auf Standard, ↺ Tabelle, ↺ Abhakbonus + Tick auf Standard) — Quelltext', eh.indexOf('Zuletzt ')<0 && (function(){ var s=readFile('index.html'); return s.indexOf('🗑 Alle Karten löschen')>=0 && s.indexOf('↺ DFM auf Standard')>=0 && s.indexOf('↺ Privat auf Standard')>=0 && s.indexOf('↺ Tabelle')>=0 && s.indexOf('↺ Abhakbonus + Tick auf Standard')>=0; })(), eh.indexOf('Zuletzt '));
// Zeile „Zuletzt“ mit Rückgängig bzw. Grund
spielResetShop(false); renderEinst(); eh=el('einstBody').innerHTML;
var zuletztOk=eh.indexOf('data-spielresetundo="shop"')>=0 && /Zuletzt \d{2}\.\d{2}\.\d{4} \d{2}:\d{2} · ohne Währung/.test(eh);
S.belohnung.kaeufe.push({ kat:kA, stufe:1, name:'T', datum:heuteApp(), preis:1, ts:new Date(Date.now()+2000).toISOString() }); renderEinst(); eh=el('einstBody').innerHTML;
var gesperrt=eh.indexOf('data-spielresetundo="shop"')<0 && eh.indexOf('Rückgängig nicht mehr möglich (seitdem gekauft)')>=0;
S.belohnung.kaeufe.pop(); spielResetRueckgaengig('shop');
pruef('6.1.11 Zeile „Zuletzt TT.MM.JJJJ HH:MM · ohne Währung“ mit ↩︎ Rückgängig; nach einem Kauf stattdessen „Rückgängig nicht mehr möglich (seitdem gekauft)“', zuletztOk && gesperrt, JSON.stringify([zuletztOk, gesperrt]));

// ══ 12 · Sheet ══
spielResetSheet('kulisse', true); var sb=el('sheetBody').innerHTML, sf=el('sheetFoot').innerHTML, st=el('sheetTitel').textContent;
pruef('6.1.12 spielResetSheet(kulisse, true): Titel, Schalter checked, Body mit „Tank“ und „Töpfe, Tank und Farbe“, Fuß „Kulisse + Farbe zurücksetzen“ mit data-mitwaehrung="1"', st==='🖼 Kulisse zurücksetzen' && sb.indexOf('data-spielresetwaehrung="kulisse" checked')>=0 && sb.indexOf('Tank')>=0 && sb.indexOf('Töpfe, Tank und Farbe')>=0 && sb.indexOf('→ 0 (zählt ab jetzt neu)')>=0 && sb.indexOf('spielreset_bak_kulisse')>=0 && sf.indexOf('Kulisse + Farbe zurücksetzen')>=0 && sf.indexOf('data-spielresetgo="kulisse" data-mitwaehrung="1"')>=0 && sf.indexOf('data-close="1"')>=0, JSON.stringify([st, sb, sf]));
spielResetSheet('kulisse', false); sb=el('sheetBody').innerHTML; sf=el('sheetFoot').innerHTML;
pruef('6.1.12 spielResetSheet(kulisse, false): Schalter ohne checked, „Topfinhalt → in den Tank“, „(+ Topfinhalt)“, Fuß „Kulisse zurücksetzen“ mit data-mitwaehrung="0"', sb.indexOf('data-spielresetwaehrung="kulisse">')>=0 && sb.indexOf(' checked')<0 && sb.indexOf('Topfinhalt → in den Tank')>=0 && sb.indexOf('(+ Topfinhalt)')>=0 && sf.indexOf('>Kulisse zurücksetzen<')>=0 && sf.indexOf('data-mitwaehrung="0"')>=0, JSON.stringify([sb, sf]));
spielResetSheet('shop', true); sb=el('sheetBody').innerHTML; sf=el('sheetFoot').innerHTML;
pruef('6.1.12 spielResetSheet(shop, true): „Münzen-Konto“, „Konto … → 0 (Münzen zählen ab jetzt neu)“, Fuß „Shop + Münzen zurücksetzen“', el('sheetTitel').textContent==='🛍 Shop zurücksetzen' && sb.indexOf('Münzen-Konto')>=0 && sb.indexOf('→ 0 (Münzen zählen ab jetzt neu)')>=0 && sb.indexOf('Kaufliste · App &amp; Avatar')>=0 && sf.indexOf('Shop + Münzen zurücksetzen')>=0 && sf.indexOf('data-spielresetgo="shop" data-mitwaehrung="1"')>=0, JSON.stringify([sb, sf]));
spielResetSheet('shop', false); sb=el('sheetBody').innerHTML; sf=el('sheetFoot').innerHTML;
pruef('6.1.12 spielResetSheet(shop, false): „wieder „???““, Konto bei „Bleibt“, Fuß „Shop zurücksetzen“', sb.indexOf('wieder „???“')>=0 && sb.indexOf('<span>Bleibt</span><b>Konto ')>=0 && sf.indexOf('>Shop zurücksetzen<')>=0 && sf.indexOf('data-mitwaehrung="0"')>=0, JSON.stringify([sb, sf]));
closeSheet();
pruef('6.1.12 Quelltext Handler: data-spielreset / data-spielresetundo im Einstellungs-Handler, data-spielresetwaehrung / data-spielresetgo im Sheet-Handler; die alten Handler sind weg', (function(){ var s=readFile('index.html'); return s.indexOf("const spr=e.target.closest('[data-spielreset]'); if(spr){ spielResetSheet(spr.dataset.spielreset, false); return; }")>=0 && s.indexOf("const spu=e.target.closest('[data-spielresetundo]');")>=0 && s.indexOf("const sprw=t.closest('[data-spielresetwaehrung]'); if(sprw){ spielResetSheet(sprw.dataset.spielresetwaehrung, sprw.checked); return; }")>=0 && s.indexOf("const sprg=t.closest('[data-spielresetgo]');")>=0 && s.indexOf("[data-shopresetgo]")<0 && s.indexOf("[data-panoreset]")<0 && s.indexOf("[data-panoundo]")<0 && s.indexOf("[data-shopreset]")<0; })());

// ══ 13 · Export ══
A=ausmalState(); var ex=ausmalExport(), paket=syncExport('voll');
pruef('6.1.13 ausmalExport().durchgaenge: Anzahl wie im Stand, Kopie (kein gemeinsames Objekt); ausmalKorrektur übernimmt durchgaenge additiv', Array.isArray(ex.durchgaenge) && ex.durchgaenge.length===A.durchgaenge.length && ex.durchgaenge.length>=1 && ex.durchgaenge[0]!==A.durchgaenge[0] && (function(){ var alt=A.durchgaenge.slice(); ausmalKorrektur({ durchgaenge:[{ ts:'2026-10-01T00:00:00.000Z', kulisse:4 }, null, 'x'] }); var n=ausmalState().durchgaenge.length, k=ausmalState().durchgaenge[0].kulisse; ausmalState().durchgaenge=alt; return n===1 && k===4; })(), JSON.stringify([ex.durchgaenge.length, A.durchgaenge.length]));
pruef('6.1.13 Export-Objekt: farbeReset (null ohne Marke) und spielReset (Log, höchstens 50) direkt nach reset35', ('farbeReset' in paket) && paket.farbeReset===null && Array.isArray(paket.spielReset) && paket.spielReset.length===S.meta.spielResetLog.length && paket.spielReset.length<=50 && paket.spielReset[0].bereich==='shop' && (function(){ var k=Object.keys(paket); return k.indexOf('farbeReset')===k.indexOf('reset35')+1 && k.indexOf('spielReset')===k.indexOf('reset35')+2; })(), JSON.stringify([paket.farbeReset, paket.spielReset.length, Object.keys(paket).slice(Object.keys(paket).indexOf('reset35'), Object.keys(paket).indexOf('reset35')+3)]));
S.meta.farbeReset={ ts:'2026-11-02T10:00:00.000Z', basis:123.6 }; paket=syncExport('delta'); delete S.meta.farbeReset;
pruef('6.1.13 Export-Objekt mit Marke: farbeReset { ts, basis gerundet }', !!paket.farbeReset && paket.farbeReset.ts==='2026-11-02T10:00:00.000Z' && paket.farbeReset.basis===124, JSON.stringify(paket.farbeReset));

// ══ 14 · Version ══
pruef('6.1.14 App 4.5.0 · Build 2026-11-10-60 · sw.js Cache 4.3.2-1 (seit Hotfix 26)', APP_VERSION==='4.5.0' && APP_BUILD==='2026-11-10-60' && readFile('sw.js').indexOf("const CACHE = 'fokus4-v4.5.0-1'")>=0, APP_VERSION+' / '+APP_BUILD);
suiteEnde('Hotfix 23 · Spiel zurücksetzen: Shop und Kulisse, je mit oder ohne Währung (4.1.14)');
