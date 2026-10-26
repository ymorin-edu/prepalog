// Suite de tests de Prepalog — bloc « mr-11.2 » : ENT-11.2 (Mondial Relay, première nuit au tri ; brief docs/briefs/ENT-11.2-mondial-relay-au-tri.md).
// `node outils/test.mjs mr-11.2` ne lance que ce bloc. La vraie séance (`activites/mondial-relay-au-tri.js`) montée dans la page ; la vue Tri
// elle-même est testée au bloc `tri`. Valeurs ÉCRITES À LA MAIN pour la série 1 (brief §4, page d'essai) :
//   T1 · T3 (Saint-Julien, piège) · écart poids (Romilly 31,6 kg) · T2 · T5 (Bar-sur-Aube, piège) · écart carton (Bréviandes) · T4 · T2
//   (Saint-André, piège) · écart taille (Brienne 130 cm) · T3 (Chaource) · T2 · écart étiquette (Les Riceys) · T3 (le colis d'Inès, enfoncé, part).
//   Poids : en règle 5 · pièges 2 · écarts 4 · aucun faux écart 2 · questions 7 (sécurité 3 × 1, au fil 3 × 4/3) = 20.

export default async function bloc({ v, nav, BASE, egal, vrai }) {

const ID = 'mondial-relay-au-tri', TRI = 'mr-tri-112';
const ctxM = await nav.newContext({ viewport: { width: 1366, height: 768 } });
const pg = await ctxM.newPage();
pg.setDefaultTimeout(9000);
const erreurs = [];
pg.on('pageerror', (e) => erreurs.push('PAGEERROR: ' + e.message));
pg.on('console', (m) => { if (m.type() === 'error' && !/\b404\b/.test(m.text())) erreurs.push('CONSOLE: ' + m.text()); });
await pg.goto(BASE);
await pg.waitForSelector('#btnProf', { timeout: 8000 });

const OUVERTURE = { 'etiquette-tournee': 'commune', 'colis-32kg': 'non', 'somme-cotes': 'non', 'bouton-rouge': 'arret', 'interim-contrat': 'agence', chaussures: 'employeur' };
const SECURITE = { 'tapis-bloque': 'arret', tenue: 'epi', soulever: 'jambes' };
const FIL = { 'pourquoi-30kg': 'porter', 'piege-bar': 'cp', 'colis-ines': 'oui', 'travail-nuit': 'oui', 'temps-perdu': 'plan' };
const S1 = ['T1', 'T3', 'ecart:poids', 'T2', 'T5', 'ecart:carton', 'T4', 'T2', 'ecart:taille', 'T3', 'T2', 'ecart:etiquette', 'T3'];
const MOTIF = { poids: 'Trop lourd', taille: 'Trop grand', carton: 'Carton ouvert', etiquette: 'Étiquette illisible' };

// o : { rep (réponses rangées d'avance), uid, aisance, db }.
const monter = (o = {}) => pg.evaluate(async (o) => {
  const A = await import('/activites/mondial-relay-au-tri.js');
  document.querySelector('#mrTest')?.remove();
  const hote = document.createElement('div'); hote.id = 'mrTest'; document.body.prepend(hote);
  const db = o.db ? JSON.parse(JSON.stringify(o.db)) : {};
  if (o.aisance) db.aisance = o.aisance;
  const Q = ((db.questions = db.questions || {})[A.meta.id] = db.questions[A.meta.id] || {});
  for (const [id, x] of Object.entries(o.rep || {})) if (!Q[id]) Q[id] = { arrivee: 1, premiere: x, duree: 1 };
  window.__m = { db };
  A.rendre(hote, {
    meta: A.meta, aisance: o.aisance || 'standard',
    profil: { prenom: 'Lea', nom: 'Test', role: 'eleve', uid: o.uid || 'mr112' },
    jeu: { etat: () => db, sauver: () => {} }, enregistrer: () => {}, quitter: () => {}, codeStock: '',
    lireScore: async () => null, rendreCopie: async () => ({ rendu: Date.now() }),
  });
  return hote.querySelector('.avis-err') ? hote.querySelector('.avis-err').textContent : null;
}, o);
const Z = '#mrTest';
const R = `${Z} [data-t-tri]`;
const texte = (sel) => pg.evaluate((s) => { const e = document.querySelector(s); return e ? e.textContent.replace(/\s+/g, ' ').trim() : null; }, sel);
// La note : le moteur de la séance, relu sur la base (comme le ramassage).
const score = () => pg.evaluate(async () => {
  const S = await import('/contenus/mondial-relay-ent112.js');
  const { seanceEntreprise } = await import('/core/types/seance-entreprise.js');
  const MR = await import('/contenus/mondial-relay.js');
  const s = seanceEntreprise(MR, S, { id: 'mondial-relay-au-tri', code: 'ENT-11.2', bareme: 20, questions: 'ENT-11.2', corrige: false }, S.OPTIONS);
  return s.noter(window.__m.db);
});
const aller = async (vue) => { await pg.click(`${Z} .ent-nav[data-vue="${vue}"]`); };
async function trier(choix) {
  const [s, m] = choix.split(':');
  await pg.click(`${R} button[data-t="sortie"][data-s="${s}"]`);
  if (m) await pg.click(`${R} button[data-t="motif"]:has-text("${MOTIF[m]}")`);
  await pg.click(`${R} button[data-t="envoyer"]`);
}
const jouer = async (L) => { for (const x of L) await trier(x); };
// Le bon tri de la série 2 (tirée) : calculé par la banque, colis par colis, dans l'ordre de l'élève.
const bonS2 = () => pg.evaluate(async (TRI) => {
  const C = await import('/contenus/mondial-relay-colis.js');
  const S = await import('/contenus/mondial-relay-ent112.js');
  const D = S.triDe((window.__m.db.tirage || {}).graine || '', { niveau: window.__m.db.aisance || 'standard' });
  return D.series[1].colis.map((x) => { const b = C.bonTriColis(x); return b.s === 'ecart' ? `ecart:${b.motif}` : b.s; });
}, TRI);
const etatTri = () => pg.evaluate(({ ID, TRI }) => JSON.parse(JSON.stringify(((window.__m.db.tris || {})[ID] || {})[TRI] || null)), { ID, TRI });
const tout = { ...OUVERTURE, ...SECURITE, ...FIL };

await v('ENT-11.2 : la séance s’ouvre ; la ligne de tri reste fermée tant que les trois questions de sécurité n’ont pas de réponse', async () => {
  egal(await monter({ rep: OUVERTURE }), null, 'séance refusée');
  await pg.waitForSelector(`${Z} .ent-nav-ferme[data-vue-fermee="tri"], ${Z} .ent-nav[data-vue="tri"]`);
  vrai(!!(await pg.$(`${Z} .ent-nav-ferme[data-vue-fermee="tri"]`)), 'la ligne de tri est ouverte avant la sécurité');
  egal(await monter({ rep: { ...OUVERTURE, ...SECURITE } }), null, 'séance refusée');
  await aller('tri');
  await pg.waitForSelector(`${R} [data-t-scene]`);
  egal(await texte(`${R} [data-t-compteur]`), 'Colis 1 / 13', 'série 1 : 13 colis');
  egal(await texte(`${R} [data-t-balance]`), '2,4', 'premier colis');
  egal(erreurs, [], 'erreurs de page');
});

await v('ENT-11.2 : tout juste = 20 / 20 ; le carton enfoncé d’Inès part en T3 ; la série 2 (10 colis tirés, 20 s par colis) suit le point d’étape du travail de nuit ; Romain écrit à la fin', async () => {
  await monter({ rep: tout });
  await aller('tri');
  await jouer(S1);
  vrai(/13 colis sur 13 bien triés/.test(await texte(`${R} [data-t-bilan]`)), 'bilan de la série 1');
  await pg.click(`${R} button[data-t="suite"]`);
  egal(await texte(`${R} [data-t-compteur]`), 'Colis 1 / 10', 'série 2 : 10 colis');
  vrai(/chacun reste 20 secondes/.test(await texte(`${R} .tri-consigne`)), 'consigne de la cadence');
  await jouer(await bonS2());
  const n = await score();
  egal(n && Math.round(n.score * 1000) / 1000, 20, `note ${JSON.stringify(n && n.detail)}`);
  const sujets = await pg.evaluate(() => window.__m.db.mails.map((m) => m.subject));
  vrai(sujets.includes('Bonne nuit de travail'), `message de fin : ${sujets}`);
  egal(erreurs, [], 'erreurs de page');
});

await v('ENT-11.2 : le colis d’Inès écarté fait tomber « aucun faux écart » ; une erreur de commune et un piège raté coûtent leur part, pas plus', async () => {
  await monter({ rep: tout });
  await aller('tri');
  const L = S1.slice();
  L[12] = 'ecart:carton';    // Inès écartée : faux écart
  L[4] = 'T3';               // Bar-sur-Aube en T3 : piège raté (2 sur 3)
  await jouer(L);
  await pg.click(`${R} button[data-t="suite"]`);
  await jouer(await bonS2());
  const n = await score();
  egal(n.detail['tri-fauxEcarts'], 'ok', 'la série 2 reste juste (part de la série 2)');
  // en règle : s1 5 sur 6 (Inès écartée), s2 juste → 5 × (2/3 × 5/6 + 1/3 × 1) ; pièges 2 × 2/3 ; écarts 4 ; faux écarts 2 × 1/3 ; questions 7.
  const attendu = 5 * (2 / 3 * 5 / 6 + 1 / 3) + 2 * 2 / 3 + 4 + 2 / 3 + 7;
  egal(Math.round(n.score * 1000) / 1000, Math.round(attendu * 1000) / 1000, 'note');
});

await v('ENT-11.2 : série 2 laissée passer — les jalons de la série 2 ne rapportent rien ; rien ne se gagne sans trier', async () => {
  await monter({ rep: tout });
  await aller('tri');
  await jouer(S1);
  await pg.click(`${R} button[data-t="suite"]`);
  await trier((await bonS2())[0]);
  for (let i = 0; i < 40 && !(await pg.$(`${R} [data-t-bilan]`)); i++) {
    await pg.evaluate((R) => document.querySelector(R).__tri.avancer(25), R);
    await pg.waitForTimeout(250);
  }
  vrai(!!(await pg.$(`${R} [data-t-bilan]`)), 'la série 2 se finit');
  const e = await etatTri();
  egal(Object.values(e.series.s2.res).filter((r) => r.s == null).length, 9, 'neuf colis non triés');
  const n = await score();
  egal(n.detail['tri-fauxEcarts'], 'ok', 'faux écarts : la série 1 seule compte encore (2/3)');
  vrai(n.score < 20 - 2 && n.score > 7, `note ${n.score}`);
});

await v('ENT-11.2 : tirage — deux élèves, deux séries 2 ; chacune a 10 colis, 3 écarts de motifs différents, 2 pièges, toutes les sorties ; confirmé : 12 colis ; accompagné : 40 s', async () => {
  const r = await pg.evaluate(async () => {
    const S = await import('/contenus/mondial-relay-ent112.js');
    const { compositionSerie } = await import('/core/types/tri.js');
    const fautes = [];
    const vus = new Set();
    for (let i = 0; i < 300; i++) {
      const D = S.triDe(`u${i}`), s2 = D.series[1], c = compositionSerie(D, s2);
      vus.add(s2.colis.map((x) => x.n).join());
      if (s2.colis.length !== 10 || c.nbEcarts !== 3 || Object.keys(c.ecarts).length !== 3 || c.pieges !== 2 || c.sorties.length !== 5) fautes.push(`u${i} ${JSON.stringify(c)}`);
    }
    const conf = S.triDe('u1', { niveau: 'confirme' }).series[1], acc = S.triDe('u1', { niveau: 'accompagne' }).series[1];
    return { fautes: fautes.slice(0, 3), differentes: vus.size, conf: conf.colis.length, acc: acc.secondes, std: S.triDe('u1').series[1].secondes,
      meme: S.triDe('u7').series[1].colis.map((x) => x.n).join() === S.triDe('u7').series[1].colis.map((x) => x.n).join() };
  });
  egal(r.fautes, [], 'séries hors des contraintes');
  vrai(r.differentes > 250, `séries différentes : ${r.differentes}`);
  egal([r.conf, r.acc, r.std, r.meme], [12, 40, 20, true], 'niveaux et graine');
});

await v('ENT-11.2 : les colis de la série 1 suivent les règles écrites à la main (calcul du bon tri, sabotage de la banque refusé)', async () => {
  const r = await pg.evaluate(async () => {
    const C = await import('/contenus/mondial-relay-colis.js');
    const { creerTri } = await import('/core/types/tri.js');
    const tri = C.SERIE_GUIDEE.map((x) => { const b = C.bonTriColis(x); return b.s === 'ecart' ? `ecart:${b.motif}` : b.s; });
    const D = { id: 'x', sorties: C.SORTIES, regles: C.REGLES, series: [{ id: 's', temps: 'guidage', colis: [{ ...C.ECARTS[0], kg: 29 }] }] };
    let refus = null; try { creerTri(D); } catch (e) { refus = e.message; }
    return { tri, refus };
  });
  egal(r.tri, S1, 'bon tri de la série 1');
  vrai(/contredit ses mesures/.test(r.refus || ''), `colis « poids » de 29 kg : ${r.refus}`);
});

await ctxM.close();
}
