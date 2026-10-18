/* Suite 4.0 · Suche (Hotfix 9, Abschnitt 1): „＋ Karte erstellen" ganz unten in der Suche, öffnet die Karteneinstellungen vorbelegt, Speichern hängt die Karte an die Kette.
   Aufruf: jsc tests/v40-suche.js */
fsliveStumm();
var K=testTag();
function klick(attr, wert){ var ds={}; ds[attr.replace(/^data-/,'').replace(/-([a-z0-9])/g, function(m,c){ return c.toUpperCase(); })]=wert||'1';
  return f7Klick({ stopPropagation:function(){}, preventDefault:function(){}, target:{ closest:function(sel){ return sel==='['+attr+']' ? { dataset:ds } : null; } } }); }
// mit Suchtext
S.ui.suFrage='Testkarte'; saveUi(); e1Oeffnen('suche'); renderSuche();
var H=el('suBody').innerHTML;
pruef('mit Suchtext: letztes Element im Suchkörper ist der Knopf „Karte erstellen"', /data-f7neukarte="1">＋ Karte erstellen<\/button>\s*$/.test(H) && H.indexOf('kl-blk su-liste')>=0);
var n0=S.karten.length;
pruef('Klick schließt die Suche und öffnet die Karteneinstellungen vorbelegt', klick('data-f7neukarte')===true && e1Art()===null && entwurfNeu===true && !!entwurf && entwurf.titel==='Testkarte' && _detailMehrAuf===true && entwurfSubs.length===0, JSON.stringify([e1Art(), entwurfNeu, entwurf && entwurf.titel, _detailMehrAuf]));
var id=entwurf.id; detailSpeichern();
var kette=tagesKette();
pruef('Speichern: Karte angelegt und an letzter Stelle der Aktuellen Kette', S.karten.length===n0+1 && kette.length>0 && kette[kette.length-1]===id, JSON.stringify(kette));
// ohne Suchtext: Startseite und geöffnete Gruppe
S.ui.suFrage=''; S.ui.suGruppe=null; saveUi(); e1Oeffnen('suche'); renderSuche(); H=el('suBody').innerHTML;
pruef('ohne Suchtext (Startseite): Knopf ganz unten', /data-f7neukarte="1">＋ Karte erstellen<\/button>\s*$/.test(H));
pruef('Klick ohne Suchtext: Titel leer, Einstellungen offen', klick('data-f7neukarte')===true && entwurfNeu===true && entwurf.titel==='' && _detailMehrAuf===true, JSON.stringify([entwurf && entwurf.titel, _detailMehrAuf]));
closeSheet();
S.ui.suGruppe='kette'; saveUi(); e1Oeffnen('suche'); renderSuche(); H=el('suBody').innerHTML;
pruef('geöffnete Gruppe: Knopf ganz unten', /data-f7neukarte="1">＋ Karte erstellen<\/button>\s*$/.test(H));
// oeffneDetail mit opt: Unteraufgaben und postfachId vorbelegt
oeffneDetail(null, { vorbelegung:{ titel:'Mit Unteraufgaben', domain:'dfm', sollMin:45 }, unteraufgaben:['Eins','Zwei','Drei'], mehrAuf:true, postfachId:'pf-x' });
pruef('oeffneDetail(null, opt): Vorbelegung, drei Unteraufgaben mit parentId, postfachId, mehrAuf', entwurf.titel==='Mit Unteraufgaben' && num(entwurf.sollMin)===45 && entwurfSubs.length===3 && entwurfSubs.every(function(u){ return u.parentId===entwurf.id; }) && entwurf.postfachId==='pf-x' && _detailMehrAuf===true, JSON.stringify([entwurf.titel, entwurf.sollMin, entwurfSubs.length, entwurf.postfachId]));
closeSheet();
oeffneDetail(null);
pruef('oeffneDetail(null) ohne opt: unverändert (leer, Einstellungen eingeklappt)', entwurfNeu===true && entwurf.titel==='' && entwurfSubs.length===0 && _detailMehrAuf===false && entwurf.postfachId===undefined);
closeSheet();
pruef('CSS: .f7-neukarte vorhanden', /\.f7-neukarte\{display:block;width:100%;/.test(readFile('index.html')));
suiteEnde('Suche (Hotfix 9)');
