/* Suite 4.0 · Import (Hotfix 12 §B4, 21.10.2026): Matrixfeld aus einem Paket des Paket-Eingangs ohne Groß-/Kleinschreibung,
   neue Karte ohne matrixFeld → werkzeug, unbekannter Wert lässt eine bestehende Karte unverändert. Eigene Suite, weil keine
   4.0-Suite den Sync-Import (syncImport) prüft. Geschrieben, nicht ausgeführt. Aufruf: jsc tests/v40-import.js */
fsliveStumm();
var K=testTag();
var ID=['0b7e5f1a-1111-4111-8111-00000000b401','0b7e5f1a-2222-4222-8222-00000000b402','0b7e5f1a-3333-4333-8333-00000000b403','0b7e5f1a-4444-4444-8444-00000000b404','0b7e5f1a-5555-4555-8555-00000000b405'];
function paket(karten){ return JSON.stringify({ appVersion:APP_VERSION, karten:karten }); }
function feld(id){ var k=S.karten.find(function(x){ return x.id===id; }); return k ? k.matrixFeld : '(keine Karte)'; }
// matrixFeldNorm an einer Stelle
pruef('matrixFeldNorm: Werkzeug/werkzeug/ ZIEL /Zustand/Ablenkung', matrixFeldNorm('Werkzeug')==='werkzeug' && matrixFeldNorm('werkzeug')==='werkzeug' && matrixFeldNorm(' ZIEL ')==='ziel' && matrixFeldNorm('Zustand')==='zustand' && matrixFeldNorm('Ablenkung')==='ablenkung');
pruef('matrixFeldNorm: Zahlen 1–4 wie matrixFeldVon, sonst null', matrixFeldNorm(3)==='werkzeug' && matrixFeldNorm('4')==='ziel' && matrixFeldNorm('quatsch')===null && matrixFeldNorm('')===null && matrixFeldNorm(null)===null && matrixFeldNorm(undefined)===null && matrixFeldNorm(7)===null);
// Paket mit vier Schreibweisen → neue Karten
var r1=syncImport(paket([
  { id:ID[0], titel:'Karte Werkzeug groß', domain:'dfm', matrixFeld:'Werkzeug' },
  { id:ID[1], titel:'Karte werkzeug klein', domain:'dfm', matrixFeld:'werkzeug' },
  { id:ID[2], titel:'Karte ZIEL mit Leerzeichen', domain:'privat', matrixFeld:' ZIEL ' },
  { id:ID[3], titel:'Karte Zustand', domain:'privat', matrixFeld:'Zustand' } ]));
pruef('Paket angenommen', !!r1 && !r1.fehler, r1 && r1.fehler);
pruef('"Werkzeug" → werkzeug', feld(ID[0])==='werkzeug', feld(ID[0]));
pruef('"werkzeug" → werkzeug', feld(ID[1])==='werkzeug', feld(ID[1]));
pruef('" ZIEL " → ziel', feld(ID[2])==='ziel', feld(ID[2]));
pruef('"Zustand" → zustand', feld(ID[3])==='zustand', feld(ID[3]));
// Paket ohne matrixFeld für eine neue Karte → werkzeug (vorher Pflichtfeld, Karte abgewiesen)
var n0=S.karten.length;
var r2=syncImport(paket([ { id:ID[4], titel:'Karte ohne Matrixfeld', domain:'dfm' } ]));
pruef('neue Karte ohne matrixFeld angelegt', !!r2 && !r2.fehler && S.karten.length===n0+1, JSON.stringify({ fehler:r2 && r2.fehler, n:S.karten.length-n0 }));
pruef('neue Karte ohne matrixFeld → werkzeug', feld(ID[4])==='werkzeug', feld(ID[4]));
// Paket mit "quatsch" für eine bestehende Karte mit zustand → zustand bleibt
var r3=syncImport(paket([ { id:ID[3], matrixFeld:'quatsch' } ]));
pruef('unbekannter Wert: bestehende Karte behält zustand', !!r3 && !r3.fehler && feld(ID[3])==='zustand', feld(ID[3]));
// Paket ohne matrixFeld für eine bestehende Karte → Wert bleibt
var r4=syncImport(paket([ { id:ID[2], titel:'Karte ZIEL umbenannt' } ]));
pruef('fehlender Wert: bestehende Karte behält ziel', !!r4 && !r4.fehler && feld(ID[2])==='ziel', feld(ID[2]));
// Postfach-Kartenformat liest über dieselbe Funktion
var kk=f7PfKarteLesen(null, 'Aufgabe: Postfach-Karte\n- Matrixfeld: WERKZEUG');
pruef('Postfach: „WERKZEUG" → werkzeug', !!kk && kk.matrixFeld==='werkzeug' && kk.gesetzt.matrixFeld===true, kk && kk.matrixFeld);
var kk2=f7PfKarteLesen(null, 'Aufgabe: Postfach-Karte ohne Feld');
pruef('Postfach: ohne Matrixfeld → null im Entwurf', !!kk2 && kk2.matrixFeld===null, kk2 && kk2.matrixFeld);
var pf=f7PfKarteAnlegen({ id:'pf-h12' }, kk2);
pruef('Postfach: neue Karte ohne Matrixfeld → werkzeug', !!pf && pf.matrixFeld==='werkzeug', pf && pf.matrixFeld);
suiteEnde('Import Hotfix 12');
