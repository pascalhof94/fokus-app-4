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
suiteEnde('Statusleiste 4.0');
