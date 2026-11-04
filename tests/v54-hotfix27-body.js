/* Suite 5.4 · Hotfix 27 (Auftrag 261104 §9): A Tableiste bleibt bei offener Tastatur an ihrem Platz (CSS translateY(--vvTop), #nav nie in #ebene1) · B fsVolltext an jeder Stelle,
   gekürzter Text wird nie gespeichert (Postfach-Freigabe, Paket) · C volltext27 mit Quelle (a) Postfach, (b) Agenten-Auftrag, (c) keine Quelle · D Infokarten-Block nur zwischen
   Unteraufgaben und Nächstes, Gruppen, Auf-/Zuklappen, Kurzfassung fehlt, Felder infos/kurzfassung in Modell, Kartenset und Paket · E Unteraufgabe ohne Punkte nicht anlegbar, automatische
   mit Vorschlag und ungeprueft, Migration ua27 · F Postfach-Zeit bucht nichts · G bonusAusgleich auf offenem und abgeschlossenem Tag, Münzen unverändert · H Abweisungsgründe je Schritt
   gespeichert und an die Rückmeldung gehängt · I Nachtrag teilt die laufende Sitzung, Start beendet die vorige exakt · J stille Chat-Zeile ohne Badge · K Standard-Tagesblöcke inkl. Erholung ·
   L Archiv der Ketten beim Aufstehen, Karten bleiben · M Antwortzeile öffnet den Chat · N Version 4.3.3, Build 56, sw.js Cache. Aufruf: jsc tests/v54-hotfix27.js */
var _toasts=[]; toast=function(m){ _toasts.push(String(m)); }; haptik=function(){}; var confirm=function(){ return true; };
fsliveStumm();
var src=readFile('index.html');
uuid=function(){ return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c){ var r=Math.random()*16|0; return (c==='x' ? r : (r&3|8)).toString(16); }); };
function _k(id){ return S.karten.find(function(x){ return x.id===id; }); }
var K=testTag(); S.ui.spezial=null; seiteZeigen('fokus');
var KURZ='Aufgabe: Karte aus der Liste\n- Soll-Minuten: 30\n\nUnteraufgaben:\n- Erste Unteraufgabe und… (1153 Zeichen)';
var VOLL='Aufgabe: Karte aus der Liste\n- Soll-Minuten: 30\n\nUnteraufgaben:\n- Erste Unteraufgabe (Soll 10, Bonus 20)\n- Zweite Unteraufgabe\n- Dritte Unteraufgabe\n\nNotiz: Die ganze Notiz aus dem vollen Datensatz.';

// ══ A · Tastatur (§1) ══
pruef('A1 CSS: #nav folgt --vvTop nach unten (bleibt hinter der Tastatur), Suche mit fester Leiste (z-index 210, 110 px Polster)', /#nav\{transform:translateY\(var\(--vvTop,0px\)\)\}/.test(src) && /body\[data-e1="suche"\] #nav\{z-index:210\}/.test(src) && /Hotfix 27 §1\.3: Platz für die feste Leiste/.test(src));
pruef('A2 hf26NavInSuche hängt #nav nie mehr in #ebene1 (abgelöst, Code bleibt als hf26NavInSuche26)', typeof hf26NavInSuche26==='function' && !/eb\.appendChild\(nav\)/.test(String(hf26NavInSuche)) && /eb\.appendChild\(nav\)/.test(String(hf26NavInSuche26)));
(function(){ e1Oeffnen('suche'); try{ ebeneDarstellen(); }catch(e){} var nav=el('nav'), eb=el('ebene1'); pruef('A3 Suche offen: #nav bleibt außerhalb von #ebene1 an seinem Platz', !!nav && (!eb || nav.parentNode!==eb)); e1Schliessen(); })();
pruef('A4 vvSync setzt --vvKb und body.hf27-tastatur (Kennzeichen; die Leiste folgt allein --vvTop)', /HF27\.tastatur=kb>100/.test(String(vvSync)) && /--vvKb/.test(String(vvSync)));

// ══ B · fsVolltext (§2.3) ══
var _gelesen=[]; FSLive.gekoppelt=function(){ return true; };
FSLive.lesen=function(w, a){ _gelesen.push({ w:w, a:a }); if(w==='datensatz_lesen' && a.tabelle==='Postfach' && a.id==='pf-voll') return Promise.resolve({ datensatz:{ id:'pf-voll', 'Output/Entwurf':VOLL } });
  if(w==='datensatz_lesen' && a.tabelle==='Postfach' && a.id==='pf-kurz') return Promise.resolve({ datensatz:{ id:'pf-kurz', 'Output/Entwurf':KURZ } });
  if(w==='datensatz_lesen' && a.tabelle==='Trainer_Chat' && a.id==='r-lang') return Promise.resolve({ datensatz:{ id:'r-lang', Text:'Ein langer Text, vollständig.' } });
  return Promise.resolve({ datensaetze:[], gesamt:0 }); };
var _r1=null, _r2=null, _f=null; HF27.voll={};
fsVolltext('Postfach', 'pf-voll', ['Output/Entwurf']).then(function(r){ _r1=r; }); warten();
fsVolltext('Postfach', 'pf-voll', ['Output/Entwurf']).then(function(r){ _r2=r; }); warten();
pruef('B1 fsVolltext liest einmal (datensatz_lesen), zweiter Aufruf aus dem Lager mit Zeitstempel', !!_r1 && _r1['Output/Entwurf']===VOLL && _r2===_r1 && _gelesen.filter(function(g){ return g.w==='datensatz_lesen' && g.a.id==='pf-voll'; }).length===1 && HF27.voll['Postfach|pf-voll'] && HF27.voll['Postfach|pf-voll'].ts>0);
fsVolltext('Postfach', 'pf-kurz', ['Output/Entwurf']).catch(function(e){ _f=String(e.message); }); warten(); warten();
pruef('B2 bleibt der Text nach dem Einzel-Lesen gekürzt → Fehler „Text unvollständig, bitte neu laden“, nichts im Lager', _f==='Text unvollständig, bitte neu laden' && !HF27.voll['Postfach|pf-kurz']);
pruef('B3 hf26PfVollLesen und f15PfLaden laufen über fsVolltext (alte Fassungen bleiben als …26)', /return fsVolltext\('Postfach', id, \['Output\/Entwurf'\]\)/.test(String(hf26PfVollLesen)) && /fsVolltext\('Postfach', id, \[\]\)/.test(String(f15PfLaden)) && typeof hf26PfVollLesen26==='function' && typeof f15PfLaden26==='function');
var kanal={ id:'kan-trainer', Agent:'Trainer', Tabelle:'Trainer_Chat', Bereich:'privat', Kanal:'Trainer' }; F12.voll={}; F12.lade={};
var _t0=f12Text(kanal, { id:'r-lang', Text:'Ein langer… (300 Zeichen)' }); warten(); warten();
pruef('B4 Chat: gekürzter Text wird über fsVolltext nachgeladen (F12.voll)', _t0==='Ein langer… (300 Zeichen)' && F12.voll['r-lang']==='Ein langer Text, vollständig.' && _gelesen.some(function(g){ return g.w==='datensatz_lesen' && g.a.tabelle==='Trainer_Chat'; }));
var n0=S.karten.length; _toasts.length=0; var kkKurz=f7PfKarteLesen({ 'Output/Entwurf':KURZ });
pruef('B5 Postfach-Freigabe mit gekürztem Text legt keine Karte an (f7PfKarteAnlegen → null, Meldung)', f7PfKarteAnlegen({ id:'pf-kurz' }, kkKurz)===null && S.karten.length===n0 && _toasts.some(function(t){ return /Text unvollständig, bitte neu laden/.test(t); }));
var resK=syncImport(JSON.stringify({ appVersion:APP_VERSION, karten:[{ id:'t-dfm', notiz:'Gekürzte Notiz… (900 Zeichen)' }] }));
pruef('B6 Paket mit gekürztem Text wird abgelehnt (nichts übernommen)', !!(resK && resK.fehler && /Text unvollständig, bitte neu laden/.test(resK.fehler)) && !hf27Gekuerzt(_k('t-dfm').notiz));

// ══ C · volltext27 (§2.5) ══
var kA=Object.assign(neueKarte({ titel:'Karte A', domain:'dfm' }), { id:'ka-27', status:'offen', std42:true, art:'aufgabe', projekt:'Fokus App', notiz:'Gekürzt… (500 Zeichen)' }); S.karten.push(kA);
var kB=Object.assign(neueKarte({ titel:'Karte B', domain:'dfm' }), { id:'kb-27', status:'erledigt', std42:true, art:'aufgabe', projekt:'Fokus App', notiz:'' }); S.karten.push(kB); S.unteraufgaben.push(neueUnteraufgabe(kB.id, { titel:'Alte UA… (700 Zeichen)' }));
var kC=Object.assign(neueKarte({ titel:'Karte C', domain:'privat' }), { id:'kc-27', status:'offen', std42:true, art:'aufgabe', notiz:'Auch gekürzt… (400 Zeichen)' }); S.karten.push(kC); saveKarten();
S.meta.postfachKarten={ 'pf-a':{ karteId:kA.id, ts:jetztIso(), titel:'A' } }; S.meta.volltext27=null; S.meta.entfernteUnteraufgaben=[]; HF27.migLaeuft=false; HF27.voll={};
FSLive.lesen=function(w, a){ if(w==='datensatz_lesen' && a.tabelle==='Postfach' && a.id==='pf-a') return Promise.resolve({ datensatz:{ id:'pf-a', 'Output/Entwurf':VOLL.replace('Karte aus der Liste', 'Karte A') } });
  if(w==='datensaetze_auflisten' && a.tabelle==='Postfach') return Promise.resolve({ datensaetze:[], gesamt:0 });
  if(w==='datensaetze_auflisten' && a.tabelle==='Agenten-Aufträge') return Promise.resolve({ datensaetze: a.filter[0].wert==='kb-27' ? [{ id:'auf-b', Text:'…' }] : [], gesamt:0 });
  if(w==='datensatz_lesen' && a.tabelle==='Agenten-Aufträge' && a.id==='auf-b') return Promise.resolve({ datensatz:{ id:'auf-b', Text:'Aufgabe: Karte B\n\nUnteraufgaben:\n- Alte UA vollständig\n- Neue UA\n\nNotiz: Notiz aus dem Auftrag.' } });
  return Promise.resolve({ datensaetze:[], gesamt:0 }); };
var kand=hf27Kandidaten(); pruef('C1 Kandidaten: alle Karten beider Familien mit gekürzter Notiz, gekürztem Titel oder gekürzter Unteraufgabe (auch erledigt)', kand.indexOf('ka-27')>=0 && kand.indexOf('kb-27')>=0 && kand.indexOf('kc-27')>=0 && kand.indexOf('t-dfm')<0);
hf27VolltextMigration(); for(var i=0;i<12;i++) warten();
var V=S.meta.volltext27; var uB=untermenge(kB.id), entB=(S.meta.entfernteUnteraufgaben||[]).find(function(e){ return e.parentId===kB.id; });
pruef('C2 Quelle (a) Postfach über meta.postfachKarten: Notiz der Karte A vollständig, Unteraufgaben aus der Quelle mit Vorschlag', kA.notiz==='Die ganze Notiz aus dem vollen Datensatz.' && kA.notizVorher27==='Gekürzt… (500 Zeichen)' && untermenge(kA.id).length===3 && untermenge(kA.id).every(function(u){ return num(u.sollMin)>0 && u.bonusPunkte!=null; }) && V.karten.some(function(e){ return e.karteId==='ka-27' && e.quelle==='postfach:pf-a'; }), JSON.stringify(V));
pruef('C3 Quelle (b) Agenten-Auftrag mit Bezug Aufgabe: gekürzte Unteraufgabe archiviert (ersetzt durch), richtige angelegt, Notiz aus dem Auftrag', uB.length===2 && uB.every(function(u){ return !hf27Gekuerzt(u.titel); }) && !!entB && Array.isArray(entB.ersetztDurch) && entB.ersetztDurch.length===2 && kB.notiz==='Notiz aus dem Auftrag.' && V.karten.some(function(e){ return e.karteId==='kb-27' && e.quelle==='auftrag:auf-b'; }));
pruef('C4 Quelle (c) keine: Karte C bleibt, steht in meta.volltext27.fehler (❓), Lauf fertig in meta.migrationen', hf27Gekuerzt(kC.notiz) && V.fehler.some(function(f){ return f.karteId==='kc-27' && /keine Quelle/.test(f.grund); }) && V.fertig && S.meta.migrationen.some(function(m){ return m.name==='volltext27'; }));
pruef('C5 pfVoll26 läuft nicht mehr (abgelöst), volltext27 läuft kein zweites Mal', String(hf26PfVollMigration).replace(/\s/g,'')==='function(){}' && (function(){ var n=S.unteraufgaben.length; hf27VolltextMigration(); warten(); return S.unteraufgaben.length===n; })());

// ══ D · Infokarten (§3) ══
var kF=Object.assign(neueKarte({ titel:'Fokus-Karte', domain:'dfm' }), { id:'kf-27', status:'offen', std42:true, art:'aufgabe', projekt:'Projekt X', matrixFeld:'werkzeug', sollMin:30, belastung:0, prio:3 }); S.karten.push(kF);
var i1=Object.assign(neueKarte({ titel:'Info verlinkt', domain:'dfm' }), { id:'i1-27', status:'offen', std42:true, art:'info', projekt:'Projekt Y', notiz:'Absatz eins.\n\nAbsatz zwei\nmit Umbruch.', kurzfassung:'Die Kurzfassung.' });
var i2=Object.assign(neueKarte({ titel:'Info gleiches Thema', domain:'dfm' }), { id:'i2-27', status:'offen', std42:true, art:'info', projekt:'Projekt X', notiz:'Inhalt zwei.' });
var i3=Object.assign(neueKarte({ titel:'Info anderes Thema', domain:'dfm' }), { id:'i3-27', status:'offen', std42:true, art:'info', projekt:'Projekt Z', notiz:'x' });
var i4=Object.assign(neueKarte({ titel:'Info privat gleiches Thema', domain:'privat' }), { id:'i4-27', status:'offen', std42:true, art:'info', notiz:'y' });
S.karten.push(i1, i2, i3, i4); kF.infos=['i1-27']; saveKarten(); S.ui.hf27Info=null;
pruef('D1 Modell: neue Karte trägt infos [] und kurzfassung null', Array.isArray(neueKarte({ titel:'x', domain:'dfm' }).infos) && neueKarte({ titel:'x', domain:'dfm' }).kurzfassung===null);
var G=hf27InfoGruppen(kF);
pruef('D2 Gruppen: Verlinkt = infos der Karte (gleiche Familie, Infokarte); Gleiches Thema = offene Infokarten mit gleichem Thema (k43Thema) ohne die verlinkten', G.verlinkt.length===1 && G.verlinkt[0].id==='i1-27' && G.thema.length===1 && G.thema[0].id==='i2-27' && G.themaName==='Projekt X');
S.fokus={ karteId:kF.id, laeuft:false, startMs:0 }; S.ui.fokusSubsZu=false; renderFokus(); var hv=el('fokusView').innerHTML;
var iS=hv.indexOf('class="blk tacc schritte'), iI=hv.indexOf('id="hf27Info"'), iN=hv.indexOf('class="blk kl-blk f4-next"'); if(iN<0) iN=hv.indexOf('k43-ketten');
pruef('D3 Block „Infokarten“ steht direkt nach den Unteraufgaben und vor „Was als Nächstes kommt“; sonst nichts verändert', iS>=0 && iI>iS && (iN<0 || iI<iN) && /<div class="blk-h">Infokarten<\/div>/.test(hv), [iS, iI, iN].join(','));
pruef('D4 Zugeklappt: Gruppe „Verlinkt 1“ offen (Standard), „Gleiches Thema · Projekt X 1“ zu; Kachel mit ℹ️, Metazeile (Thema), Kurzfassung, ▸; kein ▶, kein ✓, keine Punkte', /▾ Verlinkt <span>1<\/span>/.test(hv) && /▸ Gleiches Thema · Projekt X <span>1<\/span>/.test(hv) && /<div class="hf27-ik" data-hf27ik="i1-27" role="button"><div class="hf27-z"><b>ℹ️ Info verlinkt<\/b><span class="hf27-pf">▸<\/span><\/div><span class="hf27-m">Projekt Y<\/span><span class="hf27-k1">Die Kurzfassung\.<\/span><\/div>/.test(hv) && !/data-hf27ik="i2-27"/.test(hv) && !/<button class="kl-play"[^>]*data-klplay="i1-27"/.test(hv));
hf27InfoUi().thema=true; hf27InfoUi().auf['i1-27']=true; renderFokus(); hv=el('fokusView').innerHTML;
pruef('D5 Aufgeklappt (infoKarteVollHtml): Rahmen türkis, Kopf ▾, Chips (Projekt, Abteilung/Art, Kartenart, geändert …), Kurzfassung, Inhalt vollständig mit Absätzen; Gruppe Thema aufgeklappt zeigt i2 mit „Kurzfassung fehlt“', /<div class="hf27-ik auf" data-hf27ik="i1-27">/.test(hv) && /<span class="hf27-pf">▾<\/span>/.test(hv) && /<div class="hf27-chips"><span>Projekt Y<\/span>/.test(hv) && /<span>Info<\/span>/.test(hv) && /<div class="hf27-kurz">Die Kurzfassung\.<\/div>/.test(hv) && /<div class="hf27-voll"><p>Absatz eins\.<\/p><p>Absatz zwei<br>mit Umbruch\.<\/p><\/div>/.test(hv) && /data-hf27ik="i2-27"/.test(hv) && /<span class="hf27-fehlt">Kurzfassung fehlt<\/span>/.test(hv));
pruef('D6 CSS Kachel: Fläche #1a2638, Rahmen #2f4260, linker Rand 4 px türkis #5eead4, Radius 12 px, Schatten, 12 px Abstand, 2-px-Linie zwischen den Gruppen, aufgeklappt Rahmen türkis', /\.hf27-ik\{background:#1a2638;border:1px solid #2f4260;border-left:4px solid #5eead4;border-radius:12px;[^}]*box-shadow/.test(src) && /\.hf27-liste\{[^}]*gap:12px/.test(src) && /\.hf27-grp\{[^}]*border-top:2px solid/.test(src) && /\.hf27-ik\.auf\{border-color:#5eead4/.test(src));
S.fokus={ karteId:K.d.id, laeuft:false, startMs:0 }; renderFokus(); pruef('D7 Karte ohne Infokarten: eine Zeile „Keine Infokarten“', /id="hf27Info"[\s\S]*?Keine Infokarten/.test(el('fokusView').innerHTML));
var kT=Object.assign(neueKarte({ titel:'Set', domain:'dfm' }), { id:'ks-27', status:'offen' }); ks42ZielAnwenden(kT, { infos:['i2-27'], kurzfassung:'Aus dem Kartenset' });
syncImport(JSON.stringify({ appVersion:APP_VERSION, karten:[{ id:'kf-27', infos:['i2-27','i3-27'], kurzfassung:'Aus dem Paket' }] }));
pruef('D8 Felder im Kartenset (ks42ZielAnwenden) und im Paket (Datenvertrag infos, kurzfassung); Export über kartenAbbildVoll (alle persistierten Felder)', kT.infos.length===1 && kT.kurzfassung==='Aus dem Kartenset' && _k('kf-27').infos.join(',')==='i2-27,i3-27' && _k('kf-27').kurzfassung==='Aus dem Paket' && kartenAbbildVoll(_k('kf-27'), []).kurzfassung==='Aus dem Paket');
entwurf=JSON.parse(JSON.stringify(_k('kf-27'))); entwurfSubs=[]; entwurfNeu=false; var hf=hf27InfosFeldHtml(entwurf, 'thema');
pruef('D9 Bearbeiten: Feld „Infos“ mit Chips der verlinkten Karten und Suche über die Infokarten der Familie (ohne schon verlinkte, ohne andere Familie)', /data-hf27infodel="i2-27"/.test(hf) && /data-hf27infodel="i3-27"/.test(hf) && !/data-hf27infoadd="i2-27"/.test(hf) && !/i4-27/.test(hf) && /renderDetail42/.test(src) && /h\+=hf27InfosFeldHtml\(k, ''\);   \/\/ Hotfix 27 §3\.7/.test(src)); entwurf=null; entwurfSubs=null;

// ══ E · Unteraufgaben (§4) ══
S.fokus={ karteId:kF.id, laeuft:false, startMs:0 }; S.unteraufgaben=S.unteraufgaben.filter(function(u){ return u.parentId!==kF.id; }); renderFokus();
pruef('E1 Anlagezeile: Felder Min und P, Hinweis „Minuten und Punkte sind Pflicht. Ohne beide kein Speichern.“', /id="fkUaMin"/.test(el('fokusView').innerHTML) && /id="fkUaP"/.test(el('fokusView').innerHTML) && /Minuten und Punkte sind Pflicht\. Ohne beide kein Speichern\./.test(el('fokusView').innerHTML));
el('fkUaNeu').value='Neue Unteraufgabe'; el('fkUaMin').value='20'; el('fkUaP').value=''; var nU=untermenge(kF.id).length; _toasts.length=0; fokusSubAnlegen(kF.id);
pruef('E2 ohne Punkte kein Anlegen, Meldung, Feld gelb (Klasse leer; CSS .uaneu input.leer)', untermenge(kF.id).length===nU && _toasts.some(function(t){ return /Minuten und Punkte sind Pflicht/.test(t); }) && /if\(mi\) mi\.classList\.toggle\('leer', !\(min>0\)\); if\(pi\) pi\.classList\.toggle\('leer', !pOk\);/.test(src) && /\.uaneu input\.leer,\.uareihe input\.uamin\.leer\{border-color:#f2b84b\}/.test(src));
el('fkUaNeu').value='Neue Unteraufgabe'; el('fkUaMin').value='20'; el('fkUaP').value='40'; fokusSubAnlegen(kF.id); var uNeu=untermenge(kF.id)[untermenge(kF.id).length-1];
pruef('E3 mit beiden Werten angelegt: 20 Min, 40 P, nicht ungeprüft', untermenge(kF.id).length===nU+1 && num(uNeu.sollMin)===20 && num(uNeu.bonusPunkte)===40 && !uNeu.ungeprueft);
var kV=Object.assign(neueKarte({ titel:'Verteilen', domain:'dfm' }), { id:'kv-27', status:'offen', std42:true, art:'aufgabe', prio:4, sollMin:50 }); S.karten.push(kV);
['a','b','c'].forEach(function(t){ S.unteraufgaben.push(neueUnteraufgabe(kV.id, { titel:'UA '+t, sollMin:0, bonusPunkte:null })); });
var nV=hf27UaVerteilen(kV); var subsV=untermenge(kV.id);
pruef('E4 Vorschlag der Punkte-Engine: offene Kartenzeit exakt verteilt (50 → 17+17+16), Punkte = e42Bonus der Karte (Prio 4 × 25 = 100), ungeprueft, Karten-Soll bleibt 50', nV===6 && subsV.map(function(u){ return num(u.sollMin); }).join(',')==='17,17,16' && subsV.every(function(u){ return num(u.bonusPunkte)===e42Bonus(kV) && u.ungeprueft===true; }) && num(kV.sollMin)===50 && e42Bonus(kV)===100, JSON.stringify(subsV.map(function(u){ return [u.sollMin, u.bonusPunkte]; })));
S.fokus={ karteId:kV.id, laeuft:false, startMs:0 }; renderFokus(); var hv2=el('fokusView').innerHTML;
pruef('E5 Anzeige: „ungeprüft · Vorschlag der Punkte-Engine“ gelb, Felder leer-markiert; Änderung eines Werts hebt ungeprüft auf', /<small class="hf27-ung">ungeprüft · Vorschlag der Punkte-Engine<\/small>/.test(hv2) && /class="uamin leer"/.test(hv2) && /u\.sollMin=num\(e\.target\.value\); u\.ungeprueft=false;/.test(src) && /u\.bonusPunkte = e\.target\.value===''\?null:num\(e\.target\.value\); u\.ungeprueft=false;/.test(src));
var kP=Object.assign(neueKarte({ titel:'Postfach-Karte', domain:'dfm' }), { id:'kp-27', status:'offen', std42:true, art:'aufgabe', prio:3, sollMin:30 }); S.karten.push(kP);
var kkP=f7PfKarteLesen({ 'Output/Entwurf':'Aufgabe: Postfach-Karte\n- Karte-ID: kp-27\n\nUnteraufgaben:\n- Eins\n- Zwei (Soll 10, Bonus 5)' }); f7PfEntwurfAnwenden(kP, null, kkP); var sP=untermenge(kP.id);
pruef('E6 automatisch (Postfach-Änderung): fehlende Werte ergänzt und ungeprüft, gesetzte Werte bleiben geprüft', sP.length===2 && sP.find(function(u){ return u.titel==='Eins'; }).sollMin===20 && sP.find(function(u){ return u.titel==='Eins'; }).ungeprueft===true && sP.find(function(u){ return u.titel==='Zwei'; }).sollMin===10 && num(sP.find(function(u){ return u.titel==='Zwei'; }).bonusPunkte)===5 && !sP.find(function(u){ return u.titel==='Zwei'; }).ungeprueft);
S.meta.ua27=null; var kM=Object.assign(neueKarte({ titel:'Bestand', domain:'privat' }), { id:'km-27', status:'offen', sollMin:40 }); S.karten.push(kM); S.unteraufgaben.push(neueUnteraufgabe(kM.id, { titel:'alt', sollMin:0, bonusPunkte:null })); var mig=migrationUa27();
pruef('E7 Migration ua27 (einmalig): Unteraufgaben offener Karten mit 0 Minuten oder ohne Punkte bekommen den Vorschlag, Liste in meta.ua27, in meta.migrationen', !!mig && mig.unteraufgaben>0 && untermenge(kM.id)[0].sollMin===40 && untermenge(kM.id)[0].ungeprueft===true && S.meta.ua27.ts && S.meta.migrationen.some(function(m){ return m.name==='ua27'; }) && migrationUa27()===null);

// ══ F · Postfach-Zeit entfällt (§5.1) ══
F7.pfSeit=Date.now()-30*60000; var nLog=(S.tag.log||[]).length; f7PostfachVerlassen();
pruef('F1 f7PostfachVerlassen bucht keinen Bonus mehr (400 P/h abgelöst, pfSeit zurückgesetzt)', (S.tag.log||[]).length===nLog && F7.pfSeit===null && typeof f7PostfachVerlassen26==='function');

// ══ G · bonusAusgleich (§5.2) ══
var heute=heuteApp(); var bTs=jetztIso(); (S.tag.log=S.tag.log||[]).push({ itemId:null, titel:'Postfach-Zeit 426 Min', domain:'dfm', art:'bonus', punkte:2837, ts:bTs, grund:'Postfach-Zeit 426 Min' });
var dfmVor=tagesPunkteDomain('dfm'); HF27.korrSchritte=[];
var resG=syncImport(JSON.stringify({ appVersion:APP_VERSION, karten:[], korrekturen:[{ datum:heute, grund:'Hotfix 27 §5.5 Probe', bonusAusgleich:[{ tag:heute, ts:bTs, grund:'Postfach-Zeit 426 Min', punkte:-2837, familie:'dfm' },{ tag:heute, ts:bTs, grund:'Gibt es nicht', punkte:-5, familie:'dfm' }] }] }));
var ausg=(S.tag.log||[]).find(function(l){ return l.art==='korrektur' && l.bonusTs===bTs; }), ivK=(S.intraday||[]).find(function(e){ return e.typ==='korrektur-tag' && e.bonusTs===bTs; });
pruef('G1 offener Tag: Ausgleich mit Spur (Tages-Log art korrektur mit Verweis auf den Bonus, Stunden-Log typ korrektur-tag), Punkte −2.837, Bonus markiert', !!ausg && ausg.punkte===-2837 && !!ivK && ivK.punkte===-2837 && ivK.domaene==='dfm' && nah(tagesPunkteDomain('dfm'), dfmVor-2837, 0.5) && (S.tag.log||[]).some(function(l){ return l.art==='bonus' && l.ausgeglichen27; }), JSON.stringify([resG, dfmVor, tagesPunkteDomain('dfm')]));
pruef('G2 Schritte: 1 angewendet, 2 abgewiesen (Bonus nicht im Tages-Log); Rückmeldung an den Dienst (hf27KorrErgebnis) und danach leer', HF27.korrSchritte.length===2 && HF27.korrSchritte[0].status==='angewendet' && HF27.korrSchritte[0].aktion==='bonusAusgleich' && HF27.korrSchritte[1].status==='abgewiesen' && /nicht im Tages-Log/.test(HF27.korrSchritte[1].grund) && (function(){ var r=hf27KorrErgebnis(); return r.ergebnis && r.ergebnis.schritte.length===2 && HF27.korrSchritte.length===0 && JSON.stringify(hf27KorrErgebnis())==='{}'; })());
var gestern=(function(){ var d=new Date(heute+'T12:00:00'); d.setDate(d.getDate()-1); return d.toISOString().slice(0,10); })();
var h=Object.assign(neuerTag(gestern, 1), { startTs:gestern+'T06:00:00.000Z', endeTs:gestern+'T21:00:00.000Z', punkteBilanz:5000, spielZufluss:5000, luecke:false, log:[{ itemId:null, titel:'Postfach-Zeit 99 Min', domain:'dfm', art:'bonus', punkte:663, ts:gestern+'T00:34:53.000Z', grund:'Postfach-Zeit 99 Min' }] }); S.historie.push(h); saveHistorie();
var wohl=num(S.meta.wohlstand), muenz=num(S.meta.muenzenGesamt);
syncImport(JSON.stringify({ appVersion:APP_VERSION, karten:[], korrekturen:[{ datum:gestern, grund:'Probe Vortag', bonusAusgleich:[{ tag:gestern, ts:gestern+'T00:34:53.000Z', grund:'Postfach-Zeit 99 Min', punkte:-663, familie:'dfm' }] }] }));
pruef('G3 abgeschlossener Tag: Tagesbilanz des Snapshots −663, Log-Eintrag art korrektur, Stunden-Log korrektur-tag mit tagId; Münzen und Konto unverändert (§5.5)', h.punkteBilanz===4337 && h.log.some(function(l){ return l.art==='korrektur' && l.punkte===-663; }) && (S.intraday||[]).some(function(e){ return e.typ==='korrektur-tag' && e.tagId===h.tagId && e.punkte===-663; }) && num(S.meta.wohlstand)===wohl && num(S.meta.muenzenGesamt)===muenz);
pruef('G4 Dienst zählt korrektur-tag (DFM) wie einen Bonus (0.9.1) — Paket-Form bonusAusgleich { tag, ts, grund, punkte, familie } im Datenvertrag (neueForm)', /kx\.bonusAusgleich!==undefined;   \/\/ §3 \(v3\.2\.0\): \+ schlaf · Hotfix 27 §5\.2/.test(src));

// ══ H · Abweisungsgründe je Schritt (§5.3) ══
S.fokus={ laeuft:false }; var vonA=new Date(Date.now()-120*60000), bisA=new Date(Date.now()-90*60000);
var sA=logIntraday(K.d, { minuten:30, typ:'timer' }); sA.von=vonA.toISOString(); sA.ts=bisA.toISOString(); var sB=logIntraday(K.p, { minuten:20, typ:'timer' }); sB.von=new Date(Date.now()-80*60000).toISOString(); sB.ts=new Date(Date.now()-60*60000).toISOString(); DB.set('intraday', S.intraday);
HF27.korrSchritte=[];
syncImport(JSON.stringify({ appVersion:APP_VERSION, karten:[], korrekturen:[{ datum:heute, grund:'Probe Schritte', sitzungen:[{ aktion:'aendern', id:sA.id, karteId:K.d.id, von:vonA.toISOString(), bis:new Date(Date.now()-70*60000).toISOString() },{ aktion:'hinzu', karteId:K.e.id, von:new Date(Date.now()-50*60000).toISOString(), bis:new Date(Date.now()-40*60000).toISOString() }] }] }));
var sch=HF27.korrSchritte.slice(); hf27KorrErgebnis();
pruef('H1 je Schritt angewendet oder abgewiesen mit Grund („überlappt …“), Protokoll in meta.korrekturProtokoll (schritte)', sch.length===2 && sch[0].status==='abgewiesen' && /überlappt/.test(sch[0].grund) && sch[0].aktion==='aendern' && sch[1].status==='angewendet' && (S.meta.korrekturProtokoll||[]).slice(-1)[0].schritte.length===2);
pruef('H2 paketMelden hängt ergebnis.schritte an die Rückmeldung (Code)', /Object\.assign\(\{ status:'uebernommen' \}, \(typeof hf27KorrErgebnis==='function' \? hf27KorrErgebnis\(\) : \{\}\)\)/.test(src));

// ══ I · Nachtrag teilt die laufende Sitzung, Start beendet die vorige exakt (§5.4) ══
var jetzt=Date.now(); S.fokus={ karteId:K.d.id, laeuft:true, startMs:jetzt-30*60000, sessionSek:0 }; var nI=(S.intraday||[]).length;
var eN=nachtragBuchen(K.e, jetzt-20*60000, jetzt-15*60000); var neu=(S.intraday||[]).slice(nI); var tA=neu.find(function(e){ return e.typ==='timer' && e.kartenId===K.d.id; });
pruef('I1 Nachtrag in die laufende Sitzung: laufende Sitzung endet beim Beginn des Nachtrags (von exakt), läuft nach seinem Ende weiter (zweite Sitzung ab bis)', !!tA && tA.ts===new Date(jetzt-20*60000).toISOString() && tA.von===new Date(jetzt-30*60000).toISOString() && eN.typ==='nachtrag' && S.fokus.laeuft && S.fokus.karteId===K.d.id && S.fokus.startMs===jetzt-15*60000);
fokusZeitEinbuchen(); S.fokus={ laeuft:false }; fokusStarten(K.p.id); var st1=S.fokus.startMs; fokusStarten(K.e.id); var ePrev=(S.intraday||[]).slice().reverse().find(function(e){ return e.typ==='timer' && e.kartenId===K.p.id; });
pruef('I2 Start einer Karte: die vorige Sitzung endet genau zum Startzeitpunkt (ts = startMs der neuen, von = startMs der vorigen)', !!ePrev && ePrev.ts===new Date(S.fokus.startMs).toISOString() && ePrev.von===new Date(st1).toISOString() && sitzungVonMs(ePrev)===st1); fokusZeitEinbuchen(); S.fokus={ laeuft:false };

// ══ J · stille Chat-Zeile (§6) ══
pruef('J1 f12Ungelesen ignoriert Still; F12_FELDER und Badge-Runde lesen Still; keine Mitteilung für stille Zeilen', !f12Ungelesen({ Von:'Scoring-Spezialist', Status:'offen', Still:true }) && f12Ungelesen({ Von:'Scoring-Spezialist', Status:'offen', Still:false }) && F12_FELDER.indexOf('Still')>=0 && /'Status','Postfach','Still'\], filter/.test(src) && /zeilen\[k\.id\]=alle\.filter\(r=>!hf27Still\(r\)\)/.test(src) && /if\(hf27Still\(r\)\) return; return _alt\(kanal, r\);/.test(src));

// ══ K · Standard-Tagesblöcke (§7.1) ══
S.settings.engine43=Object.assign({}, S.settings.engine43, { tagesbloecke:null }); S.meta.tagesBloecke=null; S.meta.tagesRahmen=null;
var E=k43Einst(); var tb=tagesBloecke(heute);
pruef('K1 engine43.tagesbloecke (Standard): acht Blöcke, Aufstehen 08:15–08:45 … Abendroutine 21:30–22:30, Overload ohne Zeit; Einstellungs-Paket kennt den Pfad', E.tagesbloecke.length===8 && E.tagesbloecke[0].block==='aufstehen' && E.tagesbloecke[0].von==='08:15' && E.tagesbloecke[6].block==='erholung' && E.tagesbloecke[6].von==='17:00' && E.tagesbloecke[5].block==='overload' && E.tagesbloecke[5].von===null && /tagesbloecke:\{p:'engine43\.tagesbloecke', t:'liste'\}/.test(src));
pruef('K2 tagesBloecke() fällt auf die Standard-Blöcke zurück (ohne Overload), von/bis als Stunden; hf26StandardBloecke liefert sie mit Startzeit', !!tb && tb.length===7 && tb[0].von===8.25 && tb[0].bis===8.75 && tb.every(function(b){ return b.standard27; }) && hf26StandardBloecke().some(function(b){ return b.block==='erholung' && b.von==='17:00'; }) && hf26StandardBloecke().some(function(b){ return b.block==='fokus2' && b.von==='14:30'; }));
pruef('K3 Block-Kette Erholung in K43_BLOECKE, k43BlockNorm: „Erholung“ → erholung (nicht mehr senke), Senke bleibt', K43_BLOECKE.some(function(b){ return b[0]==='erholung'; }) && k43BlockNorm('Erholung')==='erholung' && k43BlockNorm('Senke')==='senke' && k43BlockNorm('Mittag')==='senke');
pruef('K4 Werktag ohne Plan: Standard-Ketten für alle acht Blöcke außer Overload (sieben) plus Fokus 1 und Fokus 2', (function(){ S.tagesketten=[]; hf26StandardKetten('2026-11-05'); var b=S.tagesketten.map(function(c){ return c.block; }); return b.length===7 && b.indexOf('erholung')>=0 && b.indexOf('aufstehen')>=0 && b.indexOf('overload')<0; })());

// ══ L · Ketten vergangener Tage beim Aufstehen archivieren (§7.3) ══
S.tagesketten=[{ id:'tk43-fokus1-'+gestern, name:'Fokus 1 · gestern', art:'block', datum:gestern, block:'fokus1', karten:[K.d.id], quelle:'tagesplan' },{ id:'tk43-tag-'+gestern, name:'Heute gesamt · gestern', art:'tag', datum:gestern, karten:[K.d.id], quelle:'tagesplan' },{ id:'tk43-fokus1-'+heute, name:'Fokus 1 · heute', art:'block', datum:heute, block:'fokus1', karten:[], quelle:'standard' },{ id:'tk-pascal', name:'Meine', art:'eigene', datum:null, karten:[K.e.id], quelle:'pascal' }]; S.meta.ketten43Archiv=[];
var nArch=hf27KettenArchivieren();
pruef('L1 beim Aufstehen (k43Morgenketten) wandern Block- und Tag-Ketten vergangener Tage ins Archiv (meta.ketten43Archiv mit Grund); heutige und Pascals Kette bleiben; die Karten bleiben offen', nArch===2 && S.tagesketten.length===2 && S.meta.ketten43Archiv.length===2 && S.meta.ketten43Archiv.every(function(c){ return /Hotfix 27 §7\.3/.test(c.grund) && c.archiviertTs; }) && _k(K.d.id).status==='offen' && /hf27KettenArchivieren\(\); \}catch\(e\)\{\} return _alt\(\); \}; \}   \/\/ §7\.3/.test(src));

// ══ M · Antwortzeile der Tagesplanung öffnet den Chat (§7.4) ══
f12KanalVon=function(a){ return a==='Trainer' ? kanal : null; }; f12Kanaele=function(){ return [kanal]; };
var ah=k43ChatAntwortHtml('Plan steht', 'Antworten …');
pruef('M1 Antwortzeile: Hotfix 27 (readonly, data-hf26chat) bleibt als k43ChatAntwortHtml27; seit Hotfix 28 §4.4 die Kurzansicht des Ketten-Chats (k43ChatKurzHtml), Tipp öffnet den Ebene-1-Chat, kein data-k43senden', /Trainer: Plan steht/.test(k43ChatAntwortHtml27('Plan steht', 'Antworten …')) && /<input id="k43Antwort" readonly/.test(k43ChatAntwortHtml27('x', 'y')) && /data-hf26chat="kan-trainer\|tag-[0-9-]+\|fokus"/.test(ah) && /hf26-chat/.test(ah) && !/data-k43senden/.test(ah) && typeof k43ChatAntwortHtml43==='function');

// ══ N · Version ══
pruef('N1 App 4.3.4 · Build 2026-11-04-58 · sw.js Cache fokus4-v4.3.4-2', APP_VERSION==='4.3.4' && APP_BUILD==='2026-11-04-58' && /const CACHE = 'fokus4-v4.3.4-2'/.test(readFile('sw.js')));
suiteEnde('Hotfix 27 · Volltext überall, Infokarten, Unteraufgaben mit Punkten, Korrektur, Tastatur, stille Benachrichtigung, Standard-Tagesblöcke (4.3.3)');
