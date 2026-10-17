/* Suite 4.0 · Tagesübergang: Reste, Vortag buchen, Eck-Zeilen im Stunden-Log, Nachsenden von Tagesbilanz und Trainer-Nachricht.
   Aufruf: jsc tests/v40-uebergang.js */
fsliveStumm();
var K=testTag();
// Vortag aufsetzen: Tag von gestern, Aufstehen schon da, eine fällige Aufgabe und eine fällige Routine
var gestern=anVorTage(heuteIso(), 1);
S.tag.datum=gestern; S.tag.tagId=gestern+'-1'; S.tag.startTs=new Date(Date.now()-26*3600000).toISOString(); S.tag.morgen={ aufstehTs:S.tag.startTs }; S.tag.endeTs=null; saveTag();
K.d.faelligkeit=gestern; K.p.rhythmus={ typ:'taeglich' }; K.p.pflicht=true; saveKarten();
pruef('Vortag offen (vortagOffen)', vortagOffen()===true);
var R=f11Reste();
pruef('Reste: die fällige Aufgabe', R.aufg.some(function(k){ return k.id==='t-dfm'; }), R.aufg.map(function(k){ return k.id; }).join(','));
pruef('Reste: die fällige Routine, nicht die festen Karten', R.rout.some(function(k){ return k.id==='t-priv'; }) && !R.rout.some(function(k){ return k.rolle==='tagesuebergang'; }), R.rout.map(function(k){ return k.id; }).join(','));
// Aufstehen mit offenem Vortag → Übergang statt Uhr
fokusStarten('k3-aufstehen');
pruef('Aufstehen öffnet den Dialog (aufstehenTmp gesetzt)', !!aufstehenTmp);
aufstehenBestaetigenUI();
pruef('… und danach den Tagesübergang in Schritt 1', F11.schritt===1 && !!F11.auf, 'Schritt '+F11.schritt);
// Schritt 2 buchen
S.meta.f11Protokoll=[]; S.meta.f11Ausstehend=null; _gesendet.length=0;
f11VortagBuchen();
pruef('neuer Tag ist heute', S.tag && S.tag.datum===heuteIso(), S.tag && S.tag.datum);
pruef('Vortag in der Historie mit Ende', S.historie.some(function(h){ return h.datum===gestern && h.endeTs; }));
var eck=S.intraday.filter(function(e){ return e.tagId===S.tag.tagId && e.eck; });
pruef('Stunden-Log heute: je zwei Eck-Zeilen Aufstehen und Übergang', eck.filter(function(e){ return e.eck==='aufstehen'; }).length===2 && eck.filter(function(e){ return e.eck==='uebergang'; }).length===2, eck.map(function(e){ return e.eck+'/'+e.domaene; }).join(','));
pruef('Protokoll: aufstehen ok, eckpunkte gebucht', S.meta.f11Protokoll.some(function(e){ return e.schritt==='aufstehen' && /ok/.test(e.info); }) && S.meta.f11Protokoll.some(function(e){ return e.schritt==='eckpunkte' && /gebucht/.test(e.info); }), JSON.stringify(S.meta.f11Protokoll).slice(0,300));
warten();
pruef('Tagesbilanz und Trainer-Nachricht sind gesendet (Kennungen bilanz-<Tag>, chat-uebergang-<Tag>)', _gesendet.some(function(g){ return g.id==='bilanz-'+gestern; }) && _gesendet.some(function(g){ return g.id==='chat-uebergang-'+gestern; }), _gesendet.map(function(g){ return g.id||g.werkzeug; }).join(','));
pruef('Ausstehendes gemerkt (bilanz, chat)', !!(S.meta.f11Ausstehend && S.meta.f11Ausstehend.bilanz && S.meta.f11Ausstehend.chat));
// Nachsenden: Dienst bestätigt → ausstehend leer
FSLive.lesen=function(w,a){ if(a.tabelle==='Tagesbilanz') return Promise.resolve({ datensaetze:[{ id:'x', Tag:gestern, 'Tagesübergang':jetztIso() }] }); return Promise.resolve({ datensaetze:[{ id:'y' }] }); };
_f11NachTs=0; var fertig=false; f11Nachsenden().then(function(){ fertig=true; }); warten(); warten();
pruef('Nachsenden bestätigt beim Dienst: nichts mehr ausstehend', fertig && !(S.meta.f11Ausstehend && (S.meta.f11Ausstehend.bilanz || S.meta.f11Ausstehend.chat)), JSON.stringify(S.meta.f11Ausstehend));
// Eckpunkte-Nachtrag per Paket ist idempotent
S.intraday=S.intraday.filter(function(e){ return !(e.tagId===S.tag.tagId && e.eck==='uebergang'); }); S.tag.eckpunkte.uebergang='x';
f11EckpunkteNachtrag(JSON.stringify({ eckpunkte:{ datum:S.tag.datum, anlass:'uebergang' } }));
var n1=S.intraday.filter(function(e){ return e.tagId===S.tag.tagId && e.eck==='uebergang'; }).length;
f11EckpunkteNachtrag(JSON.stringify({ eckpunkte:{ datum:S.tag.datum, anlass:'uebergang' } }));
var n2=S.intraday.filter(function(e){ return e.tagId===S.tag.tagId && e.eck==='uebergang'; }).length;
pruef('Nachtrag per Paket schreibt die zwei Eck-Zeilen genau einmal', n1===2 && n2===2, n1+'/'+n2);
suiteEnde('Tagesübergang 4.0');
