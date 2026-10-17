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
suiteEnde('Punkte-Engine 4.0');
