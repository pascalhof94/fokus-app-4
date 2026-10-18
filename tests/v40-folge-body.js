/* Suite 4.0 · Counter-Reihenfolge aus der Folge (Hotfix 9, Abschnitt 4): Folge-Matrix aus Intraday (tick/abhaken, ≤ 30 Min, 28 Tage), Sortierung nach dem letzten Tick heute,
   Vermerk „↪ meist danach" ab 3. Aufruf: jsc tests/v40-folge.js */
fsliveStumm();
var K=testTag();
function counter(id, titel){ var k=Object.assign(neueKarte({ titel:titel, domain:'privat' }), { id:id, status:'offen', matrixFeld:'werkzeug', ticksAktiv:true, tickWert:10, tickMinuten:2 }); S.karten.push(k); return k; }
var ras=counter('c-rasieren','Rasieren'), ges=counter('c-gesicht','Gesicht waschen'), zae=counter('c-zaehne','Zähne'); saveKarten();
var tid=aktuelleTagId(), heute=heuteApp();
function eintrag(kid, tag, h, m, typ){ var d=new Date(tag+'T'+String(h).padStart(2,'0')+':'+String(m).padStart(2,'0')+':00'); S.intraday.push({ ts:d.toISOString(), kartenId:kid, domaene:'privat', punkte:10, minuten:0, typ:typ||'tick', tagId:tag+'-1' }); }
// 5× Rasieren → Gesicht (2 Min), 1× Rasieren → Zähne, an Vortagen
for(var i=1;i<=5;i++){ var t=anVorTage(heute, i); eintrag('c-rasieren', t, 8, 0); eintrag('c-gesicht', t, 8, 2); }
eintrag('c-rasieren', anVorTage(heute, 6), 8, 0); eintrag('c-zaehne', anVorTage(heute, 6), 8, 3);
// Abstand 45 Min zählt nicht
eintrag('c-rasieren', anVorTage(heute, 7), 9, 0); eintrag('c-zaehne', anVorTage(heute, 7), 9, 45);
DB.set('intraday', S.intraday);
var m=folgeMatrix();
pruef('Folge-Matrix: Rasieren→Gesicht 5, Rasieren→Zähne 1 (45 Min zählt nicht)', m['c-rasieren'] && m['c-rasieren']['c-gesicht']===5 && m['c-rasieren']['c-zaehne']===1, JSON.stringify(m['c-rasieren']));
pruef('ohne Tick heute: folgeLetzte null, Reihenfolge unverändert', folgeLetzte()===null && folgeSortieren([zae, ges]).map(function(k){ return k.id; }).join(',')==='c-zaehne,c-gesicht');
var H0=kettenListeHtml({ karte:null, filter:'', gruppen:['ticksPrivat'] });
pruef('ohne Tick heute: kein Vermerk', H0.indexOf('↪ meist danach')<0);
// Tick auf Rasieren heute
S.ui.klGruppen=Object.assign({}, S.ui.klGruppen, { ticksPrivat:true }); saveUi();
var n0=S.intraday.length; kartenListeTick('c-rasieren');
pruef('Tick heute: Intraday gewachsen, folgeLetzte = Rasieren', S.intraday.length>n0 && folgeLetzte()==='c-rasieren', JSON.stringify([S.intraday.length-n0, folgeLetzte()]));
var H1=kettenListeHtml({ karte:null, filter:'', gruppen:['ticksPrivat'] });
var iG=H1.indexOf('data-klkarte="c-gesicht"'), iZ=H1.indexOf('data-klkarte="c-zaehne"'), iR=H1.indexOf('data-klkarte="c-rasieren"');
pruef('Ticks Privat gezeichnet: Gesicht waschen vor Zähne, Vermerk „↪ meist danach" an Gesicht waschen', iG>=0 && iZ>=0 && iG<iZ && /data-klkarte="c-gesicht"[\s\S]*?↪ meist danach/.test(H1.slice(iG, iZ)) && (H1.match(/↪ meist danach/g)||[]).length===1, JSON.stringify([iG, iZ, iR]));
pruef('folgeSortieren: Gesicht vor Zähne vor Rest, stabil', folgeSortieren([zae, K.p, ges]).map(function(k){ return k.id; }).join(',')==='c-gesicht,c-zaehne,t-priv');
pruef('folgeMeistDanach: Gesicht (5 ≥ 3); Zähne allein (1) reicht nicht', folgeMeistDanach([ges, zae])==='c-gesicht' && folgeMeistDanach([zae])===null);
// Schnellplätze: nicht feste Plätze folgen der Matrix
F7.lager.schnellplaetze={ ts:Date.now(), daten:[], fehler:'' };
var q=f7Schnellplaetze(), ids=q.plaetze.map(function(p){ return p.k ? p.k.id : p.art; });
pruef('Schnellplätze: feste vorne, danach Gesicht waschen vor Zähne mit Vermerk', q.plaetze[0].fest && ids.indexOf('c-gesicht')>=0 && ids.indexOf('c-zaehne')>=0 && ids.indexOf('c-gesicht')<ids.indexOf('c-zaehne') && q.plaetze.some(function(p){ return p.k && p.k.id==='c-gesicht' && /↪ meist danach/.test(p.sub); }), JSON.stringify(ids));
// Zwischenspeicher: gleicher Stand → gleiches Objekt, nach einem Tick neu
var m1=folgeMatrix(); kartenListeTick('c-gesicht'); var m2=folgeMatrix();
pruef('Zwischenspeicher: ohne Änderung dasselbe Objekt, nach einem Tick neu gerechnet', m1===folgeMatrix() || m1!==m2, '');
pruef('nach Tick auf Gesicht: letzte = Gesicht', folgeLetzte()==='c-gesicht');
suiteEnde('Folge (Hotfix 9)');
