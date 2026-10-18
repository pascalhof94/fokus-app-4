/* Suite 4.0 · Punkte-Engine (Punkt 5): Stundenleiter, Ticks, Boni, Eckpunkte 600 am Tag, Abzüge nur in Münzen, Outfit in Punkten, Ziele, Rang-Schwellen, Preise.
   Aufruf: jsc tests/v40-engine.js */
fsliveStumm();
var K=testTag();
// Stundenleiter nach 5.1
var L=e4Leiter();
pruef('Leiter: geldnah 600 · kommunikation 400 · ohneGeld 300 · privatWerkzeug 200 · erholung 200 · ablenkung 0', L.geldnah===600 && L.kommunikation===400 && L.ohneGeld===300 && L.privatWerkzeug===200 && L.erholung===200 && L.ablenkung===0, JSON.stringify(L));
pruef('leiterSatz der DFM-Karte (geldnah) = 600', leiterSatz(K.d)===600, leiterSatz(K.d));
pruef('leiterSatz der Erholungskarte = 200', leiterSatz(K.e)===200, leiterSatz(K.e));
// Eckpunkte: Aufstehen 150+150 und Tagesübergang 150+150 = 600 am Tag (Pascal 17.10.)
var vorher=tagesPunkteDomain('dfm')+tagesPunkteDomain('privat');
var eA=tagesEckpunkteBuchen('aufstehen', K.a), eU=tagesEckpunkteBuchen('uebergang', K.u);
pruef('Aufstehen bucht 300 (150 DFM + 150 Privat)', eA===300, eA);
pruef('Tagesübergang bucht zusätzlich 300', eU===300, eU);
pruef('zusammen 600 am Tag', nah(tagesPunkteDomain('dfm')+tagesPunkteDomain('privat')-vorher, 600), tagesPunkteDomain('dfm')+tagesPunkteDomain('privat')-vorher);
pruef('Eckpunkte stehen im Stunden-Log mit eck = aufstehen/uebergang, je DFM und Privat', S.intraday.filter(function(e){ return e.eck==='aufstehen'; }).length===2 && S.intraday.filter(function(e){ return e.eck==='uebergang'; }).length===2);
pruef('zweites Buchen desselben Anlasses bucht nichts', tagesEckpunkteBuchen('uebergang', K.u)===0);
// Boni: Startbonus 25
pruef('Startbonus-Einstellung 25', num(S.settings.startBonus)===25, S.settings.startBonus);
pruef('Abhakbonus ab 15 Min Soll: Tabelle 200/150', num(S.settings.abhakbonusAbSollMin)===15 && S.settings.abhakbonusTabelle && Object.keys(S.settings.abhakbonusTabelle).length>0, JSON.stringify(S.settings.abhakbonusTabelle).slice(0,80));
// Abzüge nur in Münzen: ein Abzug ändert die Tagespunkte nicht
var pVor=tagesPunkteLive(), abz=tagesAbzuege();
S.tag.log.push({ itemId:'t-priv', art:'abzug', domain:'privat', punkte:-50, ts:jetztIso() }); logIntraday({ id:null, domain:'privat' }, { punkte:-50, typ:'abzug' });
pruef('Abzug −50 lässt tagesPunkteLive unverändert', nah(tagesPunkteLive(), pVor), tagesPunkteLive()+' vs '+pVor);
pruef('tagesAbzuege zählt ihn (Münzen)', tagesAbzuege()===abz+50, tagesAbzuege());
// Outfit in Punkten (Betriebsbereit 3)
pruef('Einstellungen outfitLeistungPunkte 900 · outfitErholungPunkte 50', e4OutfitLeistungPunkte()===900 && e4OutfitErholungPunkte()===50);
var o=e4Outfit(); o.stufe=3; o.max=3; o.decke=6; o.naechste=null; var basis=tagesPunkteDomain('dfm');
[[0,0],[450,50],[900,100],[1350,100]].forEach(function(f){ o.stufe=3; o.naechste=null; o.dfmPunkteBeiStufe=basis-f[0]; var ring=Math.round(f4nOutfitFortschritt()*100); var auf=e4OutfitPruefen();
  pruef('DFM-Punkte seit Stufe '+f[0]+' → Ring '+f[1]+' %'+(f[0]>=900?' und Aufstieg':' ohne Aufstieg'), ring===f[1] && auf===(f[0]>=900) && o.stufe===(f[0]>=900?4:3), 'Ring '+ring+' Stufe '+o.stufe); });
[[25,false],[50,true]].forEach(function(f){ o.stufe=3; o.naechste='erholung'; e4NachSitzung(K.e, 20, f[0]); pruef('Erholungs-Sitzung mit '+f[0]+' P → '+(f[1]?'Erholungsstufe':'keine Stufe'), (o.stufe===4)===f[1], 'Stufe '+o.stufe); });
// Ziele (5.3): Werktag 4.500/2.800, Wochenende 1.000/4.200
pruef('Tagesziele Werktag 4.500 DFM · 2.800 Privat', num(S.settings.tagesZielDfm)===4500 && num(S.settings.tagesZielPrivat)===2800, S.settings.tagesZielDfm+'/'+S.settings.tagesZielPrivat);
pruef('Tagesziele Wochenende 1.000 DFM · 4.200 Privat', num(S.settings.zielWeDfm)===1000 && num(S.settings.zielWePrivat)===4200, S.settings.zielWeDfm+'/'+S.settings.zielWePrivat);
// Rang-Schwellen (5.9) und Preise (5.10)
pruef('Rang aus Dauerlast: 0 → R1, 5.700 → R2, 10.600 → R10', e4RangVon(0)===1 && e4RangVon(5700)===2 && e4RangVon(10600)===10, e4RangVon(0)+'/'+e4RangVon(5700)+'/'+e4RangVon(10600));
pruef('Preis Stufe 1 der ersten Kategorie = 3.000 × Faktor, auf 5 gerundet', e4Preis(Object.keys(KAT_PREISFAKTOR)[0], 1)%5===0 && e4Preis(Object.keys(KAT_PREISFAKTOR)[0], 1)>0, e4Preis(Object.keys(KAT_PREISFAKTOR)[0], 1));
pruef('Rang-Sperre: Stufe 5 frei ab R3', (e4ShopSperre(5)||'').indexOf('R3')>=0 || e4Rang().rang>=3, e4ShopSperre(5));
// ══ Hotfix 9 · Abschnitt 5: Münzen statt Wohlstand, Kaufen im Shop wieder frei ══
pruef('Migration shopFrei400: rangSperre aus, Sicherung vorhanden', S.settings.rangSperre===false && !!(S.meta.shopFrei400 && S.meta.shopFrei400.ts) && DB.get('settings_bak_shopfrei400', null)!==null);
pruef('e4ShopSperre greift nicht mehr (Rang 1)', e4ShopSperre(1)===null && e4ShopSperre(5)===null);
(function(){ var kk=KAT_KEYS.find(function(x){ return stufenGekauft(x)===0 && stufeVon(x, 1) && !(stufeVon(x, 1).braucht||[]).length && !gleichgewichtSperre(x); });
  pruef('kaufSperre: Kategorie mit Stufe 1 offen → null bei Rang 1 (keine Rang-Sperre)', !!kk && kaufSperre(kk)===null && e4Rang().rang===1, JSON.stringify([kk, kk && kaufSperre(kk), e4Rang().rang])); })();
pruef('Statusleiste zeigt Münzen (🪙 + Konto), Shop-Kacheln sagen „Punkte gesamt" und „Münzen"', f4nFeld1Html(1234, { offen:0, dringend:0 }, 50, 'gruen').indexOf('🪙</span> '+fmtP(1234))>=0 && readFile('index.html').indexOf("'Punkte gesamt'")>=0);
pruef('kein sichtbarer Text „Wohlstand" im Quelltext (Strings)', !/['"][^'"\n]*Wohlstand[^'"\n]*['"]/.test(readFile('index.html').replace(/\/\*[\s\S]*?\*\//g,'').replace(/\/\/[^\n]*/g,'')));
// ══ Hotfix 9 · Abschnitt 6: Rang aus allen Punkten, Zustand Unterlast/optimal/Überlast ══
var h6={ datum:'2026-10-10', tagId:'2026-10-10-1', punkteBilanz:5000, erholungPunkte:600 };
pruef('Rang-Last: optimal → 5000 (Arbeit 4400 + Erholung 600)', e4RangLast(h6, 'optimal')===5000, e4RangLast(h6, 'optimal'));
pruef('Rang-Last: Unterlast → 4400 (Erholung zählt nicht)', e4RangLast(h6, 'Unterlast')===4400, e4RangLast(h6, 'Unterlast'));
pruef('Rang-Last: Überlast → 5000 (DFM und Erholung voll)', e4RangLast(h6, 'Überlast')===5000);
// Pausen-Punkte (Einträge mit erholung:true aus der Pausen-Karte) fließen in die Erholung ein
S.intraday.push({ ts:jetztIso(), kartenId:'t-erh', domaene:'privat', punkte:400, minuten:20, typ:'timer', tagId:S.tag.tagId, erholung:true });
S.intraday.push({ ts:jetztIso(), kartenId:'pause-x', domaene:'privat', punkte:200, minuten:10, typ:'timer', tagId:S.tag.tagId, erholung:true });
pruef('Erholungspunkte heute: Erholungskarte 400 + Pause 200 = 600', e4ErholungPunkteTag(S.tag.tagId)===600, e4ErholungPunkteTag(S.tag.tagId));
pruef('Zustand aus ACWR: 0,6 Unterlast gelb · 1,0 optimal grün · 1,6 Überlast rot · ohne Wert optimal', e4ZustandVonAcwr(0.6)==='Unterlast' && e4ZustandFarbe('Unterlast')===FARBE.GELB && e4ZustandVonAcwr(1.0)==='optimal' && e4ZustandFarbe('optimal')===FARBE.GRUEN && e4ZustandVonAcwr(1.6)==='Überlast' && e4ZustandFarbe('Überlast')===FARBE.ROT && e4ZustandVonAcwr(null)==='optimal');
pruef('e4RangZustand liefert Zustand, Farbe und Titel „Rang n · Zustand"', (function(){ var z=e4RangZustand(); return /^Rang \d+ · (Unterlast|optimal|Überlast)$/.test(z.titel) && !!z.farbe; })(), JSON.stringify(e4RangZustand()));
// Migration hält den Rang
var r0=e4Rang().rang; S.meta.rangLast400=null; saveMeta(); ladeAlles();
pruef('Migration rangLast400: Marker, Sicherung, Schwellen auf 50 gerundet, Rang unverändert', !!(S.meta.rangLast400 && S.meta.rangLast400.ts) && DB.get('settings_bak_ranglast400', null)!==null && S.settings.rangSchwellen.every(function(x){ return x%50===0; }) && e4Rang().rang===r0, JSON.stringify([S.meta.rangLast400 && S.meta.rangLast400.faktor, e4Rang().rang, r0]));
// Aufstieg nur bei gesunder Last: in Überlast bleibt tageUeber stehen
(function(){ var _z=e4LastZustand, _dl=e4RangDauerlast; e4RangDauerlast=function(){ return 10000; }; var r=e4Rang(); r.rang=1; r.tageUeber=2; r.gerechnet=null;
  e4LastZustand=function(){ return 'Überlast'; }; e4RangMorgens('2026-10-19');
  var bleibt=r.tageUeber===2 && r.rang===1;
  r.gerechnet=null; e4LastZustand=function(){ return 'optimal'; }; e4RangMorgens('2026-10-20');
  var steigt=r.tageUeber===3;
  e4LastZustand=_z; e4RangDauerlast=_dl; r.rang=r0; r.tageUeber=0; r.gerechnet=null; saveMeta();
  pruef('Überlast: tageUeber bleibt bei 2 (kein Hochzählen, kein Reset); optimal: 3', bleibt && steigt, JSON.stringify([bleibt, steigt])); })();
pruef('Rang-Anzeige trägt Farbe und Titel', /class="rang-z" style="color:#[0-9a-f]{6}" title="Rang 1 · /.test(e4RangHtml(1)));
suiteEnde('Punkte-Engine 4.0');
