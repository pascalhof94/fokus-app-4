/* Suite 4.2 · Mehrgeräte-Betrieb (Hotfix 14) — Aufruf aus der Repo-Wurzel: jsc tests/v42-mehrgeraete.js
   Hotfix 19.1 §4.3: zwei Läufe — Lauf 1 (tests/v42-mehrgeraete-body.js) endet mit der ersten Übernahme, die die Seite neu lädt; Lauf 2 lädt die App
   ein zweites Mal (wie das Neuladen, der Speicher bleibt) und führt die übrigen Prüfpunkte aus (tests/v42-mehrgeraete-body2.js). */
load('tests/_kopf40.js'); suite('tests/v42-mehrgeraete-body.js'); suite('tests/v42-mehrgeraete-body2.js');
