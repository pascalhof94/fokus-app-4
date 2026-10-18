/* Suite 4.0 · Wochenende (Hotfix 7, Abschnitte 3 und 5): Samstag aus der Tagesbilanz, Sonntag nur heute gegen das Restziel, Tageslog mit Tagesanteil,
   Ziele 4.0 auf dem Gerät. Der App-Tag wird über S.tag.datum auf So 18.10.2026 gesetzt (wie die Harness-Ansicht „uebergang"). Aufruf: jsc tests/v40-wochenende.js */
fsliveStumm();
var K=testTag();
// App-Sonntag 18.10.2026, Tagesstart vor drei Stunden (für Tempo und Prognose)
S.tag.datum='2026-10-18'; S.tag.tagId='2026-10-18-1'; S.tag.startTs=new Date(Date.now()-3*3600000).toISOString(); saveTag();
S.settings.weModus='gemeinsam'; S.settings.zielWeDfm=1000; S.settings.zielWePrivat=4200; DB.set('settings', S.settings);
// Samstag-Snapshot: Tagesbilanz 3.370 / 4.640, Logsumme DFM 7.593 (voller Kartenwert 7.293 + 300 Eck) — der Fehler vom 17.10.
S.historie.push({ datum:'2026-10-17', tagId:'2026-10-17-1', laufindex:1, startTs:'2026-10-17T06:20:00.000Z', endeTs:'2026-10-18T09:17:28.002Z', punkteBilanz:8010, punkteDfm:3370, punktePrivat:4640, akku:70,
  log:[{ ts:'2026-10-17T15:31:29.542Z', art:'eck', karte:'k3-aufstehen', domain:'dfm', itemId:'eck-aufstehen', punkte:150 }, { ts:'2026-10-17T19:53:47.327Z', art:'eck', karte:'k3-tagesuebergang', domain:'dfm', itemId:'eck-uebergang', punkte:150 },
       { ts:'2026-10-17T20:16:31.035Z', art:'Aufgabe', titel:'Fokus App Update', domain:'dfm', itemId:'p-fokusapp', punkte:7293 }, { ts:'2026-10-17T15:31:29.542Z', art:'eck', karte:'k3-aufstehen', domain:'privat', itemId:'eck-aufstehen', punkte:150 }],
  akkuVerlauf:[], zeit:{ dfm:17040, privat:28015, projekte:{} }, erledigtHeute:1, luecke:false });
DB.set('historie', S.historie);
pruef('App-Tag ist Sonntag', heuteApp()==='2026-10-18' && wochentagNr(heuteApp())===7 && istWochenendTag(heuteApp()));
var sn=tagSnapshot('2026-10-17');
pruef('tagSnapshot reicht punkteDfm/punktePrivat durch', !!sn && sn.punkteDfm===3370 && sn.punktePrivat===4640, sn && JSON.stringify([sn.punkteDfm, sn.punktePrivat]));
pruef('weSamstagAnteil: aus der Tagesbilanz, nicht aus der Logsumme (7.593)', weSamstagAnteil('dfm')===3370 && weSamstagAnteil('privat')===4640, JSON.stringify([weSamstagAnteil('dfm'), weSamstagAnteil('privat')]));
pruef('zielTag Sonntag: offene Differenz, nie unter 0', zielTag('dfm')===Math.max(0, 1000-3370) && zielTag('privat')===Math.max(0, 4200-4640), JSON.stringify([zielTag('dfm'), zielTag('privat')]));
S.settings.zielWePrivat=6000;
pruef('zielTag Privat mit Rest: 6.000 − 4.640 = 1.360', zielTag('privat')===1360, zielTag('privat'));
S.settings.zielWePrivat=4200;
S.settings.weModus='getrennt';
pruef('weModus getrennt: volle Wochenendziele, Samstag-Anteil 0', zielTag('dfm')===1000 && zielTag('privat')===4200 && weSamstagAnteil('dfm')===0, JSON.stringify([zielTag('dfm'), zielTag('privat')]));
S.settings.weModus='gemeinsam';
// Heute: zwei Eckpunkte = 300 DFM + 300 Privat
tagesEckpunkteBuchen('aufstehen', K.a); tagesEckpunkteBuchen('uebergang', K.u);
pruef('heute 300 DFM aus zwei Eckpunkten', tagesPunkteDomain('dfm')===300, tagesPunkteDomain('dfm'));
pruef('belIstDfm: nur heute, nicht Sa+So', belIstDfm()===300, belIstDfm());
pruef('weIstDomain bleibt Sa+So (nur für Anzeigen, die das so heißen)', weIstDomain('dfm')===3670, weIstDomain('dfm'));
var zi=zielUndIstHeute('dfm'), zg=zielUndIstHeute();
pruef('zielUndIstHeute: ist heute, Ziel = Restziel (mindestens 1), we gesetzt', zi.ist===300 && zi.ziel===1 && zi.we===true && zg.ist===600, JSON.stringify([zi, zg]));
var g=diaGroessen();
pruef('diaGroessen: dfm 300, Ziel DFM 0, Prognose unter 5.000 (kein Wochenendwert als „heute verdient")', g.dfm===300 && g.zielDfm===0 && g.prognoseHeute<5000, JSON.stringify({ dfm:g.dfm, zielDfm:g.zielDfm, prog:Math.round(g.prognoseHeute), hBis:g.stundenBisher.toFixed(2), hRest:g.stundenRest.toFixed(2) }));
var t=tagesprognoseHeute();
pruef('Tagesprognose DFM: 300 erreicht, Rest über dem Ziel 0 → ✓', t.dfm===300 && (t.dfm+t.restDfm)-0>=0, JSON.stringify({ dfm:t.dfm, rest:Math.round(t.restDfm) }));
var A=f4StatusleisteHtml();
pruef('Statusleiste baut mit Restziel 0 (keine Division durch null, kein NaN)', typeof A==='string' && A.indexOf('NaN')<0 && A.indexOf('Infinity')<0);
// Hotfix 9 · Abschnitt 9: Wächter — alle Statistik-Werte für heute unter 10.000 (Befund 8.000 / 80.000)
(function(){ var g9=diaGroessen(), t9=tagesprognoseHeute(); var ok=g9.prognoseHeute<10000 && g9.tempoSchnitt<10000 && (t9.dfm+t9.restDfm)<10000 && (t9.privat+t9.restPrivat)<10000;
  var html9=''; try{ html9=f4PrognoseHtml(); }catch(e){ html9='FEHLER '+e; }
  var leistung9=''; try{ leistung9=f6Leistung(analyseFenster(), 'alle'); }catch(e){ leistung9='FEHLER '+e; }
  pruef('Wächter: Statistik heute (Prognose, Tempo, Tagesprognose je Familie) unter 10.000, Leistung-Modul baut', ok && html9.indexOf('FEHLER')<0 && leistung9.indexOf('FEHLER')<0 && !/[1-9]\d{2}\.\d{3}/.test(html9), JSON.stringify({ prog:Math.round(g9.prognoseHeute), tempo:Math.round(g9.tempoSchnitt), dfm:Math.round(t9.dfm+t9.restDfm), priv:Math.round(t9.privat+t9.restPrivat) })); })();
// Tageslog beim Abhaken: Tagesanteil statt voller Kartenwert
var k=K.d; k.istSek=879*60; S.tag.istMinutenStart=S.tag.istMinutenStart||{}; S.tag.istMinutenStart[k.id]=595;
var erwartet=Math.round(kartePunkteHeute(k)), voll=Math.round(kartePunkte(k));
logPunktSchreiben(k); var e=S.tag.log[S.tag.log.length-1];
pruef('logPunktSchreiben: punkte = Tagesanteil, kartenwert = voller Kartenwert, Tagesanteil kleiner', e.itemId===k.id && e.punkte===erwartet && e.kartenwert===voll && erwartet<voll && erwartet>0, JSON.stringify({ punkte:e.punkte, kartenwert:e.kartenwert, erwartet:erwartet, voll:voll }));
logPunktEntfernen(k);
pruef('logPunktEntfernen unverändert', !S.tag.log.some(function(x){ return x.itemId===k.id; }));
// Samstag: unverändert das volle Wochenendziel
S.tag.datum='2026-10-17'; S.tag.tagId='2026-10-17-1'; saveTag();
pruef('Samstag: volles Wochenendziel, kein Samstag-Anteil', zielTag('dfm')===1000 && zielTag('privat')===4200 && weSamstagAnteil('dfm')===0, JSON.stringify([zielTag('dfm'), zielTag('privat')]));
S.tag.datum='2026-10-18'; S.tag.tagId='2026-10-18-1'; saveTag();
// Abschnitt 5: Ziele 4.0 auf dem Gerät (Migration ziele400 in ladeAlles)
pruef('Migration ziele400 ist nach dem Start gesetzt', S.meta.ziele400===true);
S.settings.zielWeDfm=3000; S.settings.tagesZielDfm=5500; DB.set('settings', S.settings); S.meta.ziele400=false; S.meta.ziele400Log=null; saveMeta();
ladeAlles();
pruef('alter Stand 3.000 / 5.500 → 1.000 / 4.500, Privat 2.800 / 4.200', num(S.settings.zielWeDfm)===1000 && num(S.settings.tagesZielDfm)===4500 && num(S.settings.tagesZielPrivat)===2800 && num(S.settings.zielWePrivat)===4200, JSON.stringify([S.settings.zielWeDfm, S.settings.tagesZielDfm, S.settings.tagesZielPrivat, S.settings.zielWePrivat]));
pruef('Marker und Sicherung: ziele400 true, settings_bak_ziele400 trägt 3.000', S.meta.ziele400===true && num(DB.get('settings_bak_ziele400', {}).zielWeDfm)===3000 && !!S.meta.ziele400Log && /3000 → 1000/.test(S.meta.ziele400Log.ziele.zielWeDfm), JSON.stringify(S.meta.ziele400Log));
S.settings.zielWeDfm=999; DB.set('settings', S.settings);
ladeAlles();
pruef('zweiter Start ändert nichts (eigener Wert 999 bleibt)', num(S.settings.zielWeDfm)===999, S.settings.zielWeDfm);
suiteEnde('Wochenende und Ziele 4.0 (Hotfix 7)');
