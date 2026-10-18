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
// ══ Hotfix 9 · Abschnitt 2: Trainer-Karten als Kartenzeile — anklicken, starten, freigeben, anpassen ══
function klick9(attr, wert){ var ds={}; ds[attr.replace(/^data-/,'').replace(/-([a-z0-9])/g, function(m,c){ return c.toUpperCase(); })]=wert||'1';
  return f7Klick({ stopPropagation:function(){}, preventDefault:function(){}, target:{ closest:function(sel){ return sel==='['+attr+']' ? { dataset:ds } : null; } } }); }
var TEXT9='Aufgabe: Karte vom Trainer\n- Projekt: Fokus App\n- Soll-Minuten: 20\n\nUnteraufgaben:\n- A\n- B\n- C\n\nNotiz: aus dem Postfach';
var r9a={ id:'pf-9a', Titel:'Neu: Karte vom Trainer', Agent:'Trainer', Art:'Plan', Dringlichkeit:40, Status:'offen', 'Output/Entwurf':TEXT9 };
F7.lager.postfach={ ts:Date.now(), daten:[r9a], fehler:'' }; F7.lager.postfachNachholen={ ts:Date.now(), daten:[], fehler:'' }; S.ui.f7pfAuf={};
renderPostfach(); H=host.innerHTML;
pruef('Kartenzeile [data-f7pfkarte] mit ▶, Titel, ✓ im Block „Karten vom Trainer", nicht unter „Weitere"', H.indexOf('Karten vom Trainer')>=0 && H.indexOf('data-f7pfkarte="pf-9a"')>=0 && H.indexOf('data-f7pfstart="pf-9a"')>=0 && H.indexOf('data-f7pfdetail="pf-9a"')>=0 && H.indexOf('data-f7pffrei="pf-9a"')>=0 && H.indexOf('<div class="f7-row" data-f7pfid="pf-9a"')<0 && (H.indexOf('<span>Weitere</span>')<0 || H.indexOf('Karten vom Trainer')<H.indexOf('<span>Weitere</span>')), H.length);
pruef('Block „Karten vom Trainer" steht direkt hinter den Chips, vor allen Gruppen', H.indexOf('Karten vom Trainer')>H.indexOf('data-f7pffilter="plan"') && H.indexOf('Karten vom Trainer')<(H.indexOf('<span class="red">🔴 Dringend</span>')<0 ? H.length : H.indexOf('<span class="red">🔴 Dringend</span>')));
var n9=S.karten.length; _gesendet.length=0;
pruef('▶: Karte angelegt, in der Kette, läuft', klick9('data-f7pfstart','pf-9a')===true && S.karten.length===n9+1 && (function(){ var k=S.karten[S.karten.length-1]; return k.titel==='Karte vom Trainer' && tagesKette().indexOf(k.id)>=0 && !!S.fokus && S.fokus.laeuft && S.fokus.karteId===k.id; })(), JSON.stringify(S.fokus));
pruef('▶: Postfach-Eintrag erledigt/freigegeben gesendet', _gesendet.some(function(g){ return g.werkzeug==='datensatz_aendern' && g.args.id==='pf-9a' && g.args.felder.Entscheidung==='freigegeben' && g.args.felder.Status==='erledigt'; }));
fokusZeitEinbuchen(); S.fokus={ laeuft:false, karteId:null };
// Titel → Karteneinstellungen vorausgefüllt, Speichern = Freigabe mit Anpassung
var r9b=Object.assign({}, r9a, { id:'pf-9b', Titel:'Neu: Karte zum Anpassen', 'Output/Entwurf':TEXT9.replace('Karte vom Trainer','Karte zum Anpassen') });
F7.lager.postfach={ ts:Date.now(), daten:[r9b], fehler:'' }; renderPostfach();
pruef('Titel: Karteneinstellungen vorausgefüllt (Titel, 3 Unteraufgaben, postfachId, Projekt, Soll 20)', klick9('data-f7pfdetail','pf-9b')===true && entwurfNeu===true && entwurf.titel==='Karte zum Anpassen' && entwurfSubs.length===3 && entwurf.postfachId==='pf-9b' && entwurf.projekt==='Fokus App' && num(entwurf.sollMin)===20 && _detailMehrAuf===true, JSON.stringify([entwurf && entwurf.titel, entwurfSubs && entwurfSubs.length, entwurf && entwurf.postfachId]));
n9=S.karten.length; _gesendet.length=0; entwurf.sollMin=35; var id9b=entwurf.id; detailSpeichern();
var ge9=_gesendet.filter(function(g){ return g.werkzeug==='datensatz_aendern' && g.args.id==='pf-9b'; });
pruef('Speichern: Karte angelegt (35 Min), postfachKarten gesetzt, ein datensatz_aendern angepasst/erledigt/10 Punkte', S.karten.length===n9+1 && S.meta.postfachKarten['pf-9b'] && S.meta.postfachKarten['pf-9b'].karteId===id9b && num(S.karten.find(function(x){ return x.id===id9b; }).sollMin)===35 && ge9.length===1 && ge9[0].args.felder.Entscheidung==='angepasst' && ge9[0].args.felder.Status==='erledigt' && ge9[0].args.felder['Punkte gebucht']===10, JSON.stringify(ge9.map(function(g){ return g.args.felder; })));
pruef('Speichern: Eintrag aus dem Lager, nicht mehr als Vorschlag', !(F7.lager.postfach.daten||[]).some(function(x){ return x.id==='pf-9b'; }) && !f7PfVorschlaege(f7Postfach()||[]).some(function(o){ return o.r.id==='pf-9b'; }));
// Nachholen: zwei „gesehen"-Einträge mit demselben Kartentitel → eine Zeile, ✓ → eine Karte, ohne Status
var TEXTH='Aufgabe: Mail-Zugang bauen\n- Soll-Minuten: 30\n\nUnteraufgaben:\n- Anforderungen\n- CC\n- Merge';   // anderer Titel als die Karte aus pf-1 (gleicher Titel würde als schon angelegt gelten)
F7.lager.postfach={ ts:Date.now(), daten:[], fehler:'' };
F7.lager.postfachNachholen={ ts:Date.now(), daten:[{ id:'pf-g1', Titel:'Neue Aufgabe anlegen: Mail-Zugang bauen', Agent:'Trainer', Art:'Plan', Status:'erledigt', Entscheidung:'gesehen', 'Output/Entwurf':TEXTH }, { id:'pf-g2', Titel:'Neu: Aufgabe anlegen Mail-Zugang bauen', Agent:'Trainer', Art:'Plan', Status:'erledigt', Entscheidung:'gesehen', 'Output/Entwurf':TEXTH }], fehler:'' };
renderPostfach(); H=host.innerHTML;
pruef('Nachholen: genau eine Zeile für zwei gesehen-Einträge gleichen Titels', (H.match(/data-f7pfkarte="pf-g/g)||[]).length===1 && H.indexOf('data-f7pfkarte="pf-g1"')>=0, (H.match(/data-f7pfkarte="pf-g/g)||[]).length);
n9=S.karten.length; var u9=S.unteraufgaben.length; _gesendet.length=0;
klick9('data-f7pffrei','pf-g1');
var kh=S.karten[S.karten.length-1], geh=_gesendet.filter(function(g){ return g.werkzeug==='datensatz_aendern'; });
pruef('✓ Nachholen: eine Karte mit 3 Unteraufgaben, in der Kette, datensatz_aendern ohne Status und ohne Punkte', S.karten.length===n9+1 && kh.titel==='Mail-Zugang bauen' && S.unteraufgaben.length===u9+3 && tagesKette().indexOf(kh.id)>=0 && geh.length===1 && geh[0].args.id==='pf-g1' && geh[0].args.felder.Entscheidung==='freigegeben' && geh[0].args.felder.Status===undefined && geh[0].args.felder['Punkte gebucht']===undefined, JSON.stringify(geh.map(function(g){ return g.args; })));
renderPostfach(); H=host.innerHTML;
pruef('Nachholen: danach keine Zeile mehr (auch pf-g2 nicht, gleicher Titel schon angelegt)', (H.match(/data-f7pfkarte="pf-g/g)||[]).length===0);
// Änderung an einer bestehenden Karte: Karte-ID → keine neue Karte, Felder gesetzt, Unteraufgabe angehängt
var kd=K.d; S.unteraufgaben.push(neueUnteraufgabe(kd.id, { titel:'Alte Unteraufgabe' })); saveKarten();
var r9c={ id:'pf-9c', Titel:'Änderung: '+kd.titel, Agent:'Trainer', Art:'Plan', Dringlichkeit:40, Status:'offen', 'Output/Entwurf':'Aufgabe: '+kd.titel+'\n- Karte-ID: '+kd.id+'\n- Soll-Minuten: 45\n\nUnteraufgaben:\n- Alte Unteraufgabe\n- Neu dazu\n\nNotiz: Trainer schlägt 45 Minuten vor' };
F7.lager.postfach={ ts:Date.now(), daten:[r9c], fehler:'' }; F7.lager.postfachNachholen={ ts:Date.now(), daten:[], fehler:'' }; renderPostfach(); H=host.innerHTML;
pruef('Änderung: Zeile mit „✏️ Änderung" vor dem Titel', H.indexOf('data-f7pfkarte="pf-9c"')>=0 && H.indexOf('✏️ Änderung · '+kd.titel)>=0);
n9=S.karten.length; u9=S.unteraufgaben.length; _gesendet.length=0;
klick9('data-f7pffrei','pf-9c');
var subsD=S.unteraufgaben.filter(function(u){ return u.parentId===kd.id; });
pruef('Änderung ✓: keine neue Karte, sollMin 45, Notiz angehängt, eine neue Unteraufgabe, alte bleibt', S.karten.length===n9 && num(kd.sollMin)===45 && String(kd.notiz).indexOf('Trainer schlägt 45 Minuten vor')>0 && S.unteraufgaben.length===u9+1 && subsD.length===2 && subsD.some(function(u){ return u.titel==='Neu dazu'; }) && subsD.some(function(u){ return u.titel==='Alte Unteraufgabe'; }), JSON.stringify([S.karten.length-n9, kd.sollMin, subsD.map(function(u){ return u.titel; })]));
pruef('Änderung ✓: postfachKarten zeigt auf die bestehende Karte, Postfach-Eintrag freigegeben', S.meta.postfachKarten['pf-9c'] && S.meta.postfachKarten['pf-9c'].karteId===kd.id && _gesendet.some(function(g){ return g.werkzeug==='datensatz_aendern' && g.args.id==='pf-9c' && g.args.felder.Entscheidung==='freigegeben'; }));
// Änderung über den Titel: bestehende Karte geöffnet, Werte eingesetzt, noch nicht gespeichert
var r9d=Object.assign({}, r9c, { id:'pf-9d', 'Output/Entwurf':'Aufgabe: '+kd.titel+'\n- Karte-ID: '+kd.id+'\n- Soll-Minuten: 50\n\nUnteraufgaben:\n- Noch eine' });
F7.lager.postfach={ ts:Date.now(), daten:[r9d], fehler:'' }; renderPostfach();
klick9('data-f7pfdetail','pf-9d');
pruef('Änderung Titel: Karteneinstellungen der bestehenden Karte mit Entwurfswerten (50 Min, neue Unteraufgabe), Karte selbst noch unverändert', entwurfNeu===false && entwurf.id===kd.id && num(entwurf.sollMin)===50 && entwurf.postfachId==='pf-9d' && entwurfSubs.some(function(u){ return u.titel==='Noch eine'; }) && num(kd.sollMin)===45, JSON.stringify([entwurf && entwurf.sollMin, kd.sollMin]));
_gesendet.length=0; detailSpeichern();
pruef('Änderung Speichern: Karte 50 Min, drei Unteraufgaben, Freigabe angepasst gesendet', num(S.karten.find(function(x){ return x.id===kd.id; }).sollMin)===50 && S.unteraufgaben.filter(function(u){ return u.parentId===kd.id; }).length===3 && _gesendet.some(function(g){ return g.werkzeug==='datensatz_aendern' && g.args.id==='pf-9d' && g.args.felder.Entscheidung==='angepasst'; }));
suiteEnde('Postfach (Hotfix 7)');
