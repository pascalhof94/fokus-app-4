/* Suite 4.0 · Postfach (Hotfix 7, Abschnitte 1 und 2): Kartenformat lesen, Plan-Einträge aufklappen, Karte beim Freigeben anlegen, nie doppelt.
   Aufruf: jsc tests/v40-postfach.js */
fsliveStumm();
var K=testTag();
var TEXT='Aufgabe: Fokus App Hotfix\n- Projekt: Fokus App\n- Owner: Pascal Hof\n- Status: In Arbeit\n- Matrixfeld: Werkzeug\n- Deadline: 18.10.2026\n- Geld-Impact Wert: 0\n- Soll-Minuten: 30 (Pascal: „30 Minuten maximal plane ich dafür")\n\nUnteraufgaben:\n- Anforderungen\n- CC (Prompt in Claude Code ausgeben lassen)\n- Merge\n\nNotiz: Anforderungen laut Pascal bereits eingegeben.\nZweite Zeile der Notiz.';
var kk=f7PfKarteLesen({ 'Output/Entwurf':TEXT });
pruef('Kartenformat: Titel', !!kk && kk.titel==='Fokus App Hotfix', kk && kk.titel);
pruef('Kartenformat: 30 Min trotz Klammertext', !!kk && kk.sollMin===30, kk && kk.sollMin);
pruef('Kartenformat: 3 Unteraufgaben in Reihenfolge', !!kk && kk.unteraufgaben.length===3 && kk.unteraufgaben[0]==='Anforderungen' && kk.unteraufgaben[2]==='Merge', kk && JSON.stringify(kk.unteraufgaben));
pruef('Kartenformat: Notiz (zwei Zeilen), Projekt, Matrixfeld, Deadline, Familie DFM', !!kk && kk.notiz.indexOf('Anforderungen laut Pascal')===0 && kk.notiz.indexOf('Zweite Zeile')>0 && kk.projekt==='Fokus App' && kk.matrixFeld==='werkzeug' && kk.deadline==='2026-10-18' && kk.domain==='dfm', kk && JSON.stringify(kk));
pruef('ohne Aufgabe:-Zeile → null', f7PfKarteLesen({ 'Output/Entwurf':'Plan heute: erst Mentoring, dann Pipeline\n- Soll-Minuten: 30' })===null);
pruef('„Karte:" und Familie Privat', (f7PfKarteLesen(null, 'Karte: Katzenklo\n- Familie: Privat')||{}).domain==='privat');
pruef('Standard: 30 Min, keine Unteraufgaben, Notiz leer', (function(){ var x=f7PfKarteLesen(null, 'Aufgabe: Nur Titel'); return !!x && x.sollMin===30 && x.unteraufgaben.length===0 && x.notiz===''; })());
// Freigeben eines plan-Eintrags
var r={ id:'pf-1', Titel:'Neu: Fokus App Hotfix', Agent:'Trainer', Art:'Plan', Dringlichkeit:40, Status:'offen', 'Output/Entwurf':TEXT };
F7.lager.postfach={ ts:Date.now(), daten:[r], fehler:'' };
var n0=S.karten.length, u0=S.unteraufgaben.length; _gesendet.length=0;
f7PfEntscheiden('pf-1', 'freigegeben'); warten();
pruef('Freigeben: genau eine Karte mehr', S.karten.length===n0+1, S.karten.length-n0);
var k=S.karten[S.karten.length-1];
pruef('Karte: Titel, DFM, 30 Min, offen, postfachId, fällig heute, Projekt, Notiz', k.titel==='Fokus App Hotfix' && k.domain==='dfm' && num(k.sollMin)===30 && k.status==='offen' && k.postfachId==='pf-1' && k.faelligkeit===heuteApp() && k.projekt==='Fokus App' && String(k.notiz).indexOf('Anforderungen')===0, JSON.stringify({ t:k.titel, d:k.domain, s:k.sollMin, st:k.status, pf:k.postfachId, f:k.faelligkeit }));
pruef('drei Unteraufgaben an der Karte', S.unteraufgaben.filter(function(u){ return u.parentId===k.id; }).length===3 && S.unteraufgaben.length===u0+3);
pruef('S.meta.postfachKarten hat den Eintrag', !!(S.meta.postfachKarten && S.meta.postfachKarten['pf-1'] && S.meta.postfachKarten['pf-1'].karteId===k.id));
var ge=_gesendet.filter(function(g){ return g.werkzeug==='datensatz_aendern'; });
pruef('genau ein datensatz_aendern: erledigt, freigegeben, Pascals Anpassung mit Karten-ID', ge.length===1 && !!ge[0].args && !!ge[0].args.felder && ge[0].args.felder.Status==='erledigt' && ge[0].args.felder.Entscheidung==='freigegeben' && String(ge[0].args.felder['Pascals Anpassung'])==='Karte in der App angelegt: '+k.id, JSON.stringify(ge.map(function(g){ return g.args && g.args.felder; })));
pruef('Block „Aus dem Postfach angelegt" liefert die Karte', f7PfAngelegteKarten().length===1 && f7PfAngelegteKarten()[0].id===k.id);
// zweites Freigeben legt keine zweite Karte an
F7.lager.postfach={ ts:Date.now(), daten:[r], fehler:'' }; _gesendet.length=0;
f7PfEntscheiden('pf-1', 'freigegeben'); warten();
pruef('zweites Freigeben: keine zweite Karte, keine weiteren Unteraufgaben', S.karten.length===n0+1 && S.unteraufgaben.length===u0+3);
// Freigeben mit Anpassung (geänderter Text) legt die Karte aus dem geänderten Text an
var r2={ id:'pf-3', Titel:'Neu: Katzenklo', Agent:'Trainer', Art:'Plan', Dringlichkeit:40, Status:'offen', 'Output/Entwurf':'Aufgabe: Katzenklo\n- Familie: Privat\n- Soll-Minuten: 10' };
F7.lager.postfach={ ts:Date.now(), daten:[r2], fehler:'' }; _gesendet.length=0;
f7PfEntscheiden('pf-3', 'angepasst', { felder:{ 'Pascals Anpassung':'Aufgabe: Katzenklo sauber machen\n- Familie: Privat\n- Soll-Minuten: 12' } }); warten();
var k3=S.karten[S.karten.length-1];
pruef('Anpassung: Karte aus dem geänderten Text (Titel, Privat, 12 Min)', S.karten.length===n0+2 && k3.titel==='Katzenklo sauber machen' && k3.domain==='privat' && num(k3.sollMin)===12, JSON.stringify({ t:k3.titel, d:k3.domain, s:k3.sollMin }));
var ge3=_gesendet.filter(function(g){ return g.werkzeug==='datensatz_aendern'; });
pruef('Anpassung: Pascals Anpassung trägt Text und Karten-ID', ge3.length===1 && String(ge3[0].args.felder['Pascals Anpassung']).indexOf('Aufgabe: Katzenklo sauber machen')===0 && String(ge3[0].args.felder['Pascals Anpassung']).indexOf('Karte in der App angelegt: '+k3.id)>0);
// Klärung mit Antwort legt keine Karte an
var r4={ id:'pf-4', Titel:'Welche Option?', Agent:'Pipeline-Agent', Art:'Klärung', Dringlichkeit:55, Status:'offen', 'Output/Entwurf':'- Option A\n- Option B' };
F7.lager.postfach={ ts:Date.now(), daten:[r4], fehler:'' }; _gesendet.length=0;
f7PfEntscheiden('pf-4', 'freigegeben', { felder:{ 'Pascals Anpassung':'Option A' } }); warten();
pruef('Klärung: keine Karte, Antwort unverändert', S.karten.length===n0+2 && _gesendet[0].args.felder['Pascals Anpassung']==='Option A');
// Postfach-Seite (Abschnitt 1): plan-Zeile mit „öffnen", aufgeklappt fünf Knöpfe, Kartenhinweis, Kartenzeile
F7.lager.postfach={ ts:Date.now(), daten:[Object.assign({}, r, { id:'pf-2' })], fehler:'' }; S.ui.f7pfAuf={};
var host=document.getElementById('postfachBody'); renderPostfach(); var H=host.innerHTML;
pruef('Plan-Zeile zeigt „öffnen", nicht „gesehen"', H.indexOf('data-f7pfauf="1"')>=0 && H.indexOf('data-f7pfent="gesehen"')<0);
pruef('Kartenzeile der angelegten Karte im Block „Aus dem Postfach angelegt"', H.indexOf('Aus dem Postfach angelegt')>=0 && H.indexOf('data-klkarte="'+k.id+'"')>=0 && H.indexOf('data-klplay="'+k.id+'"')>=0 && H.indexOf('data-klfokus="'+k.id+'"')>=0 && H.indexOf('data-klcheck="'+k.id+'"')>=0);
S.ui.f7pfAuf={ 'pf-2':true }; renderPostfach(); H=host.innerHTML;
pruef('aufgeklappt: fünf Knöpfe inkl. „gesehen", Entwurf, Begründung-Platz und Kartenhinweis', (H.match(/data-f7pfent="/g)||[]).length===5 && H.indexOf('data-f7pfent="gesehen"')>=0 && H.indexOf('class="dr"')>=0 && H.indexOf('📇 Karte: Fokus App Hotfix · 30 Min · 3 Unteraufgaben')>=0, (H.match(/data-f7pfent="/g)||[]).length);
// Klick auf die Kartenzeile im Postfach läuft über f7Klick → kettenListeKlick (Hotfix 6)
var klick=f7Klick({ stopPropagation:function(){}, preventDefault:function(){}, target:{ closest:function(sel){ if(sel==='[data-klkarte]' || sel==='[data-klplay]') return { dataset:{ klplay:k.id } }; return null; } } });
pruef('▶ in der Postfach-Kartenzeile startet die Karte', klick===true && !!(S.fokus && S.fokus.laeuft && S.fokus.karteId===k.id), JSON.stringify(S.fokus));
suiteEnde('Postfach (Hotfix 7)');
