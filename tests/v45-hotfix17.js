/* Suite 4.5 · Hotfix 17 (Führung ohne Dauerabruf, Krone, Stand-Hinweis) — Aufruf aus der Repo-Wurzel: jsc tests/v45-hotfix17.js · Prüfpunkte in tests/v45-hotfix17-body.js (läuft im Geltungsbereich der App)
   Hotfix 19.1 §4.3: die Marke „erste Übernahme erledigt“ muss VOR dem Laden der App im Speicher stehen (die Modulvariable liest die App nur beim Laden);
   sonst läuft die erste Übernahme mit Kopie an den Dienst und Neuladen, und der Modul-Zustand bleibt in der Sperre hängen. */
load('tests/_kopf40.js'); localStorage.setItem('fokus4_fslive_ersteUebernahme', '1'); suite('tests/v45-hotfix17-body.js');
