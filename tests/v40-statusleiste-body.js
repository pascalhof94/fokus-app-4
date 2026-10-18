/* Suite 4.0 · Statusleiste v3: Aufbau der vier Fälle, Neuaufbau nur bei Datenänderung; Namen und Titel nie abgeschnitten (CSS). Aufruf: jsc tests/v40-statusleiste.js
   Höhen in Pixeln misst der UI-Harness (tests/ui/run.sh, Ansichten sbA–sbD); hier der Aufbau. */
fsliveStumm();
var K=testTag(); tagesEckpunkteBuchen('aufstehen', K.a);
function leiste(){ return f4StatusleisteHtml(); }
S.meta.postfach={ offen:3, dringend:1, dringendText:'Rückruf bis 17:00', ts:jetztIso() };
var A=leiste();
pruef('Fall A: Dringend-Band, Postfach-Feld mit 3, rot', A.indexOf('f4n-band dr')>=0 && A.indexOf('pfx voll dr')>=0 && /<b>3<\/b>/.test(A));
pruef('Aufbau: Punkteleiste mit Erholungsstreifen, Kartenzeile mit Ring, Viererzeile', A.indexOf('f4n-pl')>=0 && A.indexOf('class="erh"')>=0 && A.indexOf('f4n-kz')>=0 && A.indexOf('<svg width="64"')>=0 && A.indexOf('f4n-r4')>=0 && A.indexOf('f4n-dia')>=0);
pruef('kein Rang, keine Stufenleiste, keine Tempo-Leiste in der Leiste', A.indexOf('class="rang"')<0 && A.indexOf('f4-stufen')<0 && A.indexOf('f4-pace')<0);
S.meta.postfach={ offen:0, dringend:0, ts:jetztIso() }; e4BrueckeSetzen('t-priv', 't-dfm', 'kopffrei');
var B=leiste();
pruef('Fall B: Onramp-Band gold, Akku-Feld grün mit Prozent', B.indexOf('f4n-band on')>=0 && B.indexOf('pfx akku')>=0 && /\d+ %<\/b>/.test(B));
S.tag.bruecke=null; S.meta.postfach={ offen:2, dringend:0, ts:jetztIso() };
var C=leiste();
pruef('Fall C: kein Band, Postfach gelb mit 2', C.indexOf('f4n-band')<0 && C.indexOf('pfx voll')>=0 && C.indexOf('pfx voll dr')<0 && /<b>2<\/b>/.test(C));
fokusStarten('t-dfm'); var D=leiste();
pruef('Fall D: langer Titel steht ganz in der Kartenzeile (kein …)', D.indexOf('nie abgeschnitten wird')>=0 && D.indexOf('…</div>')<0);
pruef('Zeit und Kartenpunkte rechts (sbZeit, sbPkt)', D.indexOf('id="sbZeit"')>=0 && D.indexOf('id="sbPkt"')>=0);
// Neuaufbau nur bei Datenänderung
var host=document.getElementById('f4sb'); var n=0; var _h=f4StatusleisteHtml; f4StatusleisteHtml=function(){ n++; return _h(); };
F4N.key=''; f4StatusleisteRender(); f4StatusleisteRender(); f4StatusleisteRender();
pruef('drei Render-Aufrufe ohne Datenänderung bauen genau einmal', n===1, n);
S.meta.postfach={ offen:5, dringend:0, ts:jetztIso() }; f4StatusleisteRender();
pruef('geänderte Daten (Postfach) bauen neu', n===2, n);
f4StatusleisteHtml=_h;
// Namen nie abgeschnitten: die Sammelregel steht im CSS, die alten Regeln sind umgestellt
var css=readFile('index.html');
pruef('CSS: Sammelregel für Titel und Namen (white-space:normal, kein ellipsis)', css.indexOf('.kl-titel,.f4-kz .ti,.kal-b .kal-t')>=0 && /\.kl-titel\{font-size:14px;white-space:normal/.test(css));
pruef('CSS: Shop- und Ausstellungsnamen ohne ellipsis', !/\.f8-img span\{[^}]*text-overflow:ellipsis/.test(css) && !/\.f8-box \.ob span\{[^}]*text-overflow:ellipsis/.test(css));
// Hotfix 8 · Abschnitt 2: Punkteleiste über dem Ziel — Skala wächst, Familien ungekappt, Überschuss rot umrandet
var T1=punkteleisteTeile({ ziel:1, dfm:771, privat:1500, zielDfm:0, zielPrivat:0 });
pruef('Teile: Restziel 0 → Skala 2271, Familien ungekappt, Rot von 1 bis 2271, Überschuss 2270', T1.skala===2271 && T1.dfm===771 && T1.privat===1500 && T1.rotVon===1 && T1.rotBis===2271 && T1.ueber===2270, JSON.stringify(T1));
var T2=punkteleisteTeile({ ziel:5000, dfm:3000, privat:3000, zielDfm:2500, zielPrivat:2500 });
pruef('Teile: 3000+3000 über 5000 → Skala 6000, Rot 5000–6000, keine Kappung, Mitte 5500', T2.skala===6000 && T2.rotVon===5000 && T2.rotBis===6000 && T2.dfm===3000 && T2.privat===3000 && T2.mitte===5500, JSON.stringify(T2));
var T3=punkteleisteTeile({ ziel:5000, dfm:1000, privat:1000, zielDfm:2500, zielPrivat:2500 });
pruef('Teile: unter dem Ziel unverändert (Skala 5000, kein Rot, Grenze 2500)', T3.skala===5000 && T3.ueber===0 && T3.rotVon===null && T3.dfm===1000 && T3.grenze===2500, JSON.stringify(T3));
S.fokus={ laeuft:false, karteId:null };   // keine laufende Karte: gebucht = gezeigt (Fall D hat t-dfm gestartet)
var g8={ zielHeute:1, dfm:771, privat:1500, zielDfm:0, zielPrivat:0, tempoSchnitt:0, stundenRest:1 };
punkteleisteZeichnen('sBar', g8, 0, 0);
var wD=parseFloat(el('sBarIstD').style.width), wP=parseFloat(el('sBarIstP').style.width), rot=el('sBarRot');
pruef('gezeichnet: IstD ≈ 33,9 %, IstP ≈ 66,1 % (Skala 2271)', nah(wD, 33.9, 0.15) && nah(wP, 66.1, 0.15), JSON.stringify([wD, wP]));
pruef('.rot sichtbar, Rahmen in FARBE.ROT, keine Füllung, über die ganze Leiste', rot.style.display==='block' && rot.style.borderColor===FARBE.ROT && !rot.style.background && nah(parseFloat(rot.style.left), 0, 0.1) && nah(parseFloat(rot.style.width), 100, 0.1), JSON.stringify(rot.style));
pruef('Text: +2.270 als rp mittig auf der Umrandung', el('sPhSoll').textContent==='+'+fmtP(2270) && el('sPhSoll').className==='rp' && nah(parseFloat(el('sBarZS').style.left), 50, 0.2), JSON.stringify([el('sPhSoll').textContent, el('sBarZS').style.left]));
pruef('Viertel-Striche beziehen sich auf das Ziel (bei Ziel 1 nahe 0 %)', /qmark" style="left:0\.0%/.test(el('sBarMarks').innerHTML));
punkteleisteZeichnen('sBar', { zielHeute:5000, dfm:1000, privat:1000, zielDfm:2500, zielPrivat:2500, tempoSchnitt:0, stundenRest:1 }, 0, 0);
pruef('unter dem Ziel: IstD 20 %, kein Rot, Viertel bei 25/50/75 %', nah(parseFloat(el('sBarIstD').style.width), 20, 0.1) && el('sBarRot').style.display==='none' && /left:25\.0%/.test(el('sBarMarks').innerHTML) && /left:75\.0%/.test(el('sBarMarks').innerHTML));
pruef('CSS: .rot ohne Hintergrund, mit Rahmen, über den Familien', /\.sb-bar \.rot\{[^}]*background:transparent;border:2px solid #f66d6d;box-sizing:border-box;border-radius:6px;z-index:4;pointer-events:none/.test(css));
suiteEnde('Statusleiste 4.0');
