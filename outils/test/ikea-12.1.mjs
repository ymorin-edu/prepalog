// Suite de tests de Prepalog — bloc « ikea-12.1 » : IKEA ENT-12.1, « une commande, deux chemins » (2de, tous les postes, découverte de C1.1, guidage).
// `node outils/test.mjs ikea-12.1` ne lance que ce bloc. Brief : `docs/briefs/ENT-12.1-ikea-une-commande-deux-chemins.md` §4 à §8.
//
// La séance est montée dans une page à elle (1366 × 768), avec la fabrique et le moteur réels, de vrais clics à la SOURIS (carte, flèches des ordres), les listes par `selectOption`.
// Les valeurs attendues sont ÉCRITES À LA MAIN (relues le 26/10/2026) :
//
//   Le chemin de l'armoire (7 étapes) : fournisseur → réception au centre → préparation → péniche → Bercy → utilitaire → livraison.
//   Le chemin de la lampe (6 étapes) : préparation → agence → hub → agence d'arrivée → Point Relais → retrait.
//   Les modes : la lampe (1,8 kg, 42 cm) → Point Relais ; l'armoire (colis de 40, 38 et 34 kg) → livraison de meubles ; le canapé (colis de 42 et 31 kg) → livraison de meubles.
//   Graine « ik121 » (écrite à la main d'après le tirage relevé le 26/10/2026) : armoire au départ = utilitaire, péniche, livraison, Bercy, préparation, fournisseur, réception (17 inversions) ;
//   lampe au départ = Point Relais, retrait, préparation, agence d'arrivée, hub, agence (11 inversions).
//
// Barème : situer le centre 4 (région 2, département 2) · l'armoire 4 (ordre exact) · la lampe 3 (ordre exact) · les modes 5 (lampe 1, armoire 2, canapé 2) · questions notées 4 (1,5 + 1,5 + 1) = 20.

import { ouvrirIkea, proche } from './ikea/commun.mjs';

export default async function bloc({ v, nav, BASE, egal, vrai }) {

const ID = 'ikea-deux-chemins';
const ACT = '/activites/ikea-deux-chemins.js';
const P = await ouvrirIkea({ nav, BASE, vrai, activite: ACT, id: ID });
const { pg, Z, R: RC, pause, base, present, texte, bandeau, entrants, menu, clic, noter, jouerCarte, carteJuste, carteFaux, boutonCarte, ouvrirParMessage, immobile, lire, aller } = P;

const OUV = { cdc: 'entrepot', vad: 'distance', relais: 'commerce', peniche: 'fleuve', retract: '14', gratuit: 'obligation' };
const OUV_FAUX = { cdc: 'magasin', vad: 'directe', relais: 'poste', peniche: 'mer', retract: '7', gratuit: 'cadeau' };
const QJ = { 'pourquoi-port': 'seine', 'peniche-km': 'camions', 'lampe-six-jours': 'retour', 'devant-chez-vous': 'elle', limay: 'fleuve' };
const QF = { 'pourquoi-port': 'vue', 'peniche-km': 'rien', 'lampe-six-jours': 'jete', 'devant-chez-vous': 'personne', limay: 'pas-pense' };
let Q = QJ;
const mont = (o = {}) => P.monter({ rep: OUV, uid: 'ik121', ...o });

// Plusieurs questions peuvent se suivre : on ferme les cartes « Nouveau message » (elles couvrent les boutons), on répond, on reprend.
async function qFil() {
  for (let i = 0; i < 8; i++) {
    await pg.waitForSelector(`${Z} [data-q-panneau]`, { timeout: 600 }).catch(() => null);
    const q = await pg.$eval(`${Z} [data-q-panneau]`, (e) => e.dataset.qPanneau).catch(() => null);
    if (!q) return;
    vrai(Q[q], `question au fil « ${q} » sans réponse prévue`);
    await pg.evaluate(() => document.querySelectorAll('[aria-label="Fermer la notification"]').forEach((b) => b.click())); await pause(80);
    if (await pg.$(`${Z} [data-q-repondre="${q}"]`)) { await clic(`[data-q-choix="${Q[q]}"][data-q="${q}"]`); await clic(`[data-q-repondre="${q}"]`); await pause(); }
    if (await pg.$(`${Z} [data-q-reprendre]`)) { await clic('[data-q-reprendre]'); await pause(); }
  }
}
const fermerCartes = async () => { await pg.evaluate(() => document.querySelectorAll('[aria-label="Fermer la notification"]').forEach((b) => b.click())); await pause(80); };

const ARM = ['fournisseur', 'reception', 'preparation', 'peniche', 'bercy', 'utilitaire', 'livraison'];
const LAM = ['preparation', 'agence', 'hub', 'agence-arrivee', 'relais', 'retrait'];
const ARM_UNE_INV = ['fournisseur', 'reception', 'preparation', 'bercy', 'peniche', 'utilitaire', 'livraison'];
const LAM_UNE_INV = ['preparation', 'agence', 'agence-arrivee', 'hub', 'relais', 'retrait'];
const MODES_JUSTES = ['relais', 'meubles', 'meubles'];       // lampe, armoire, canapé
const CHAMPS = ['mode_lampe', 'mode_armoire', 'mode_canape'];

async function ordonner(bloc, ordre) {
  if (ordre) {
    for (let k = 0; k < ordre.length; k++) {
      for (let s = 0; s < 8; s++) {
        const cur = await pg.$$eval(`${Z} [data-fiche-ordre="${bloc}"] li`, (L) => L.map((x) => x.dataset.v));
        const j = cur.indexOf(ordre[k]);
        if (j <= k) break;
        await fermerCartes();
        await clic(`[data-fiche-ordre="${bloc}"] li[data-v="${ordre[k]}"] [data-ordre-sens="-1"]`);
        await pause(30);
        await qFil();
      }
    }
  }
  await fermerCartes();
  await clic('[data-fiche-envoyer]');
  await clic('[data-confirme-oui]');
  await pause();
  await qFil();
}
async function jouerCarteIkea(fautes = {}) {
  await aller('localiser');
  for (const et of ['region', 'departement', 'ville']) {
    const x = await lire();
    for (let f = 0; f < (fautes[`${x.lieu}:${et}`] || 0); f++) await carteFaux();
    await carteJuste();
    await qFil();
  }
  const n = await pg.$eval(`${RC} [data-lc-bouton]`, (b) => b.dataset.lcBouton);
  await boutonCarte(n);
  await qFil();
}
async function envoyerArmoire(ordre = ARM) { await fermerCartes(); await ouvrirParMessage('Le chemin de l’armoire', 'fiche'); await ordonner('armoire', ordre); }
async function envoyerLampe(ordre = LAM) { await fermerCartes(); await ouvrirParMessage('Le chemin de la lampe', 'fiche:lampe-121'); await ordonner('lampe', ordre); }
async function envoyerModes(vals = MODES_JUSTES) {
  await fermerCartes();
  await ouvrirParMessage('Pourquoi deux chemins ?', 'fiche:chemins-121');
  for (let i = 0; i < vals.length; i++) { await pg.selectOption(`${Z} [data-fiche-champ="${CHAMPS[i]}"]`, vals[i]); await pause(40); await qFil(); }
  await fermerCartes();
  await clic('[data-fiche-envoyer]');
  await clic('[data-confirme-oui]');
  await pause();
  await qFil();
}
async function jouer(o = {}) {
  Q = o.q || QJ;
  await jouerCarteIkea(o.carte || {});
  await envoyerArmoire(o.armoire === undefined ? ARM : o.armoire);
  await envoyerLampe(o.lampe === undefined ? LAM : o.lampe);
  await envoyerModes(o.modes || MODES_JUSTES);
  await qFil();
}
const LIGNES = ['localiser:cdc:region', 'armoire-ordre', 'lampe-ordre', 'mode-lampe', 'question:pourquoi-port'];
const tout = (etat) => LIGNES.map((l) => [l, etat]);

// ─────────────────────────────────────────────────────────── la déclaration et les données
await v('ENT-12.1 : la séance se charge (2de, C1.1, guidage, correction) ; 16 de poids de jalons + part 4 des questions = 20 ; 3 questions notées, 2 réflexions ; inscrite au registre', async () => {
  const r = await pg.evaluate(async () => {
    const A = await import('/activites/ikea-deux-chemins.js');
    const S = await import('/contenus/ikea-ent121.js');
    const QQ = await import('/contenus/questions/ENT-12.1.js');
    const I = await import('/activites/index.js');
    const L = QQ.QUESTIONS.liste;
    return { meta: A.meta, poids: S.ETAPES.map((e) => [e.id, e.poids]), total: S.ETAPES.reduce((s, e) => s + e.poids, 0), part: QQ.QUESTIONS.part,
      notees: L.filter((q) => q.type === 'fil' && !q.reflexion).map((q) => [q.id, q.poids]), reflexions: L.filter((q) => q.reflexion).map((q) => q.id),
      ouv: QQ.QUESTIONS.ouverture.tirage, auRegistre: (await I.chargerActivites()).some((a) => a.meta.id === 'ikea-deux-chemins'), entreprise: (I.ENTREPRISES.find((e) => e.n === 12) || {}).nom };
  });
  const m = r.meta;
  egal([m.code, m.niveaux, m.competences, m.temps, m.bareme, m.copie, m.questions, m.correction, m.pret, m.ouverture], ['ENT-12.1', ['2de'], ['C1.1'], 'guidage', 20, undefined, 'ENT-12.1', true, true, 'prof'], 'meta');
  egal(r.poids, [['localiser:cdc:region', 2], ['localiser:cdc:departement', 2], ['armoire-ordre', 4], ['lampe-ordre', 3], ['mode-lampe', 1], ['mode-armoire', 2], ['mode-canape', 2]], 'jalons et poids');
  proche(r.total, 16, 'somme des poids des jalons');
  proche(r.total + r.part, 20, 'jalons + part des questions');
  egal(r.notees, [['pourquoi-port', 1.5], ['lampe-six-jours', 1.5], ['devant-chez-vous', 1]], 'questions notées');
  egal(r.reflexions, ['peniche-km', 'limay'], 'réflexions non notées');
  egal(r.ouv, { preparation: 2, droit: 1 }, 'ouverture tirée');
  egal([r.auRegistre, r.entreprise], [true, 'IKEA'], 'registre');
});

await v('ENT-12.1 : le tirage — 300 graines, l’ordre de départ des deux chemins est toujours à au moins 2 inversions de l’ordre juste, chaque graine donne une permutation, et les départs varient', async () => {
  const r = await pg.evaluate(async () => {
    const D = await import('/contenus/ikea-ent121-donnees.js');
    let min = 99, bad = 0; const A = new Set(), L = new Set();
    for (let i = 0; i < 300; i++) {
      const t = D.TIRAGE.tirer(`u${i}|${D.ID}`).valeurs;
      min = Math.min(min, D.inversions(t.armoire, D.ORDRE_ARMOIRE), D.inversions(t.lampe, D.ORDRE_LAMPE));
      if (t.armoire.length !== 7 || new Set(t.armoire).size !== 7 || t.lampe.length !== 6 || new Set(t.lampe).size !== 6) bad++;
      A.add(t.armoire.join()); L.add(t.lampe.join());
    }
    return { min, bad, a: A.size, l: L.size };
  });
  vrai(r.min >= 2, 'un départ à moins de 2 inversions : ' + r.min);
  egal(r.bad, 0, 'permutations fautives');
  vrai(r.a > 100 && r.l > 50, `trop peu de variété : ${r.a} / ${r.l}`);
});

// ─────────────────────────────────────────────────────────── l'ouverture
await v('ENT-12.1 : à l’ouverture — le tirage est rangé (graine élève|séance), le départ de ik121 est celui écrit à la main, un seul message de Claire (document joint), la carte seule ouverte, un lundi de mars', async () => {
  const db = await mont();
  egal(db.tirages[ID].graine, `ik121|${ID}`, 'graine');
  egal(db.tirages[ID].valeurs.armoire, ['utilitaire', 'peniche', 'livraison', 'bercy', 'preparation', 'fournisseur', 'reception'], 'départ de l’armoire');
  egal(db.tirages[ID].valeurs.lampe, ['relais', 'retrait', 'preparation', 'agence-arrivee', 'hub', 'agence'], 'départ de la lampe');
  const E = await entrants();
  egal(E.map((m) => [m.from, m.subject, m.pieces]), [['Claire', 'Bienvenue à Gennevilliers', ['cdc-121']]], 'messages à l’ouverture');
  const d = new Date(E[0].ts);
  egal([d.getFullYear(), d.getMonth(), d.getDate()], [2027, 2, 8], 'daté du lundi 8 mars 2027');
  const M = await menu();
  vrai(M.includes('localiser') && !M.includes('fiche') && !M.includes('fiche:lampe-121') && !M.includes('fiche:chemins-121'), 'menu au départ : ' + M.join(', '));
  vrai(M.some((m) => m.startsWith('fermee:')), 'les fiches sont fermées : ' + M.join(', '));
});

await v('ENT-12.1 : Avant de commencer — 3 questions tirées (2 de préparation, 1 de droit), corrigées, jamais notées', async () => {
  const db = await P.monter({ uid: 'ik121', sansOuverture: true });
  const ids = db.questions[ID]['@tirage'].ids;
  egal(ids.length, 3, 'nombre');
  egal([ids.filter((x) => ['cdc', 'vad', 'relais', 'peniche'].includes(x)).length, ids.filter((x) => ['retract', 'gratuit'].includes(x)).length], [2, 1], 'deux de préparation, une de droit');
  for (let k = 0; k < 3; k++) {
    const id = await pg.$eval(`${Z} [data-q-repondre]`, (b) => b.dataset.qRepondre);
    await clic(`[data-q-choix="${OUV_FAUX[id]}"][data-q="${id}"]`);
    await clic(`[data-q-repondre="${id}"]`);
    await pause();
    if (k < 2) await clic('[data-cle="suivante"]');
  }
  await clic('[data-ouv-continuer]');
  const n = await noter(ACT);
  egal([n.score, n.max], [0, 20], 'note après l’ouverture seule (même toute fausse, rien ne change)');
});

await v('ENT-12.1 : inaction — rien fait → 0/20, rien de jugé « juste », pas de bandeau de fin', async () => {
  await mont({ uid: 'ik121-rien' });
  const n = await noter(ACT);
  egal([n.score, n.max], [0, 20], 'note');
  vrai(!Object.values(n.detail).includes('ok'), 'un jalon juste sans rien faire : ' + JSON.stringify(n.detail));
  vrai(!(await present('[data-fin-jalon]')), 'bandeau de fin');
});

// ─────────────────────────────────────────────────────────── le parcours
await v('ENT-12.1 : parcours juste, ouverture toute fausse — 20/20, bandeau ✓, messages de Claire dans l’ordre, réflexions rangées et non notées', async () => {
  await mont({ rep: OUV_FAUX });
  let port = null;
  await jouer();
  const n = await noter(ACT);
  proche(n.score, 20, 'note');
  egal(await bandeau(), tout('ok'), 'bandeau');
  egal((await entrants()).map((m) => m.subject), ['Bienvenue à Gennevilliers', 'Le chemin de l’armoire', 'Le chemin de la lampe', 'Pourquoi deux chemins ?', 'Merci pour cette matinée'], 'messages');
  const b = await base();
  vrai(!!b.points[ID], 'photo de fin rangée');
  egal([b.questions[ID]['peniche-km'].premiere, b.questions[ID].limay.premiere], ['camions', 'fleuve'], 'réflexions rangées');
  vrai(!Object.keys(n.detail).some((k) => /peniche-km|limay/.test(k)), 'une réflexion est notée');
  egal(port, null, 'sans objet');
});

await v('ENT-12.1 : pire cas — tout faux (région fausse, ordres jamais touchés, mauvais modes, questions fausses) → 0/20, bandeau ✗, « Corriger » proposé, la carte ne se rejoue pas', async () => {
  await mont();
  await jouer({ carte: { 'cdc:region': 1, 'cdc:departement': 1 }, armoire: null, lampe: null, modes: ['meubles', 'relais', 'relais'], q: QF });
  const n = await noter(ACT);
  egal(n.score, 0, 'note');
  egal(await bandeau(), tout('ko'), 'bandeau');
  vrai(await present('[data-fin-corriger]'), '« Corriger » proposé');
  vrai(/ne se rejouent pas/.test(await pg.textContent(`${Z} [data-fin-fige]`)), 'phrase `finFige`');
  Q = QJ;
});

// ─────────────────────────────────────────────────────────── la carte
await v('ENT-12.1 : carte juste = 4 points ; une erreur à la région → 18/20 ; erreurs à la ville seulement → rien perdu, texte de fin avec la position approchée', async () => {
  await mont();
  await jouerCarteIkea();
  let d = (await noter(ACT)).detail;
  egal([d['localiser:cdc:region'], d['localiser:cdc:departement']], ['ok', 'ok'], 'jalons de la carte (juste)');
  proche((await noter(ACT)).score, 5.5, 'note après la carte seule (4 + la question « pourquoi-port » juste, 1,5)');
  vrai(/Hauts-de-Seine/.test(await pg.textContent(`${RC} [data-lc-fin]`)) && /approchée/.test(await pg.textContent(`${RC} [data-lc-fin]`)), 'texte de fin de la carte');
  await mont();
  await jouer({ carte: { 'cdc:region': 1 } });
  d = (await noter(ACT)).detail;
  egal([d['localiser:cdc:region'], d['localiser:cdc:departement']], ['ko', 'ok'], 'jalons (région fausse)');
  proche((await noter(ACT)).score, 18, 'note');
  await mont();
  await jouer({ carte: { 'cdc:ville': 2 } });
  proche((await noter(ACT)).score, 20, 'erreurs à la ville seulement');
});

// ─────────────────────────────────────────────────────────── les deux chemins
await v('ENT-12.1 : chemins — ordre exact = 4 et 3 points ; une seule inversion ne rapporte rien (16 et 17) ; jamais touché = 0 et l’ordre envoyé est l’ordre de départ (inaction)', async () => {
  const essai = async (o) => { await mont(); await jouer(o); const n = await noter(ACT); return { d: n.detail, s: n.score }; };
  let r = await essai({});
  egal([r.d['armoire-ordre'], r.d['lampe-ordre']], ['ok', 'ok'], 'ordres justes');
  r = await essai({ armoire: ARM_UNE_INV });
  egal([r.d['armoire-ordre'], r.d['lampe-ordre']], ['ko', 'ok'], 'armoire à une inversion');
  proche(r.s, 16, 'note (armoire à une inversion)');
  r = await essai({ lampe: LAM_UNE_INV });
  egal([r.d['armoire-ordre'], r.d['lampe-ordre']], ['ok', 'ko'], 'lampe à une inversion');
  proche(r.s, 17, 'note (lampe à une inversion)');
  r = await essai({ armoire: null, lampe: null });
  proche(r.s, 13, 'note (ordres jamais touchés : rien ne récompense l’inaction)');
  const b = await base();
  egal(b.fiches['armoire-121'].valeurs.armoire, ['utilitaire', 'peniche', 'livraison', 'bercy', 'preparation', 'fournisseur', 'reception'], 'ordre envoyé = ordre de départ (armoire)');
  egal(b.fiches['lampe-121'].valeurs.lampe, ['relais', 'retrait', 'preparation', 'agence-arrivee', 'hub', 'agence'], 'ordre envoyé = ordre de départ (lampe)');
});

await v('ENT-12.1 : chaque fiche reste fermée tant que la précédente n’est pas envoyée (la lampe après l’armoire, les modes après la lampe)', async () => {
  await mont();
  await jouerCarteIkea();
  let M = await menu();
  vrai(M.includes('fiche') && !M.includes('fiche:lampe-121') && !M.includes('fiche:chemins-121'), 'après la carte : ' + M.join(', '));
  await envoyerArmoire();
  await fermerCartes();
  M = await menu();
  vrai(M.includes('fiche:lampe-121') && !M.includes('fiche:chemins-121'), 'après l’armoire : ' + M.join(', '));
  await envoyerLampe();
  await fermerCartes();
  M = await menu();
  vrai(M.includes('fiche:chemins-121'), 'après la lampe : ' + M.join(', '));
});

// ─────────────────────────────────────────────────────────── les modes
await v('ENT-12.1 : modes — juste = 5 points ; la lampe en livraison de meubles → seul son jalon tombe (19) ; l’armoire en Point Relais → 18 ; le canapé en colis → 18 ; tous faux → 15 ; la fiche liste le document des modes', async () => {
  const essai = async (modes) => { await mont(); await jouer({ modes }); const n = await noter(ACT); return { d: n.detail, s: n.score }; };
  let r = await essai(MODES_JUSTES);
  egal([r.d['mode-lampe'], r.d['mode-armoire'], r.d['mode-canape']], ['ok', 'ok', 'ok'], 'modes justes');
  proche(r.s, 20, 'note (modes justes)');
  r = await essai(['meubles', 'meubles', 'meubles']);
  egal([r.d['mode-lampe'], r.d['mode-armoire'], r.d['mode-canape']], ['ko', 'ok', 'ok'], 'lampe fausse seulement');
  proche(r.s, 19, 'note (lampe fausse)');
  r = await essai(['relais', 'relais', 'meubles']);
  egal([r.d['mode-lampe'], r.d['mode-armoire'], r.d['mode-canape']], ['ok', 'ko', 'ok'], 'armoire fausse seulement');
  proche(r.s, 18, 'note (armoire fausse)');
  r = await essai(['relais', 'meubles', 'colis']);
  egal([r.d['mode-lampe'], r.d['mode-armoire'], r.d['mode-canape']], ['ok', 'ok', 'ko'], 'canapé faux seulement');
  proche(r.s, 18, 'note (canapé faux)');
  r = await essai(['colis', 'relais', 'relais']);
  proche(r.s, 15, 'note (tous les modes faux)');
  vrai(/Point Relais/.test(await texte()), 'la fiche est affichée');
  const pieces = (await entrants()).find((m) => m.subject === 'Pourquoi deux chemins ?').pieces;
  egal(pieces, ['tarifs-121'], 'document joint au message');
});

await v('ENT-12.1 : modes — un mode non choisi : l’envoi est refusé et nomme l’article ; les modes ne s’accusent pas avant l’envoi', async () => {
  await mont();
  await jouerCarteIkea();
  await envoyerArmoire();
  await envoyerLampe();
  await fermerCartes();
  await ouvrirParMessage('Pourquoi deux chemins ?', 'fiche:chemins-121');
  await pg.selectOption(`${Z} [data-fiche-champ="mode_lampe"]`, 'relais');
  await pause(40); await qFil(); await fermerCartes();
  const avant = (await noter(ACT)).detail;
  egal([avant['mode-lampe'], avant['mode-armoire'], avant['mode-canape']].map((x) => x || 'attente').every((x) => x !== 'ko'), true, 'aucun mode « faux » avant l’envoi');
  await clic('[data-fiche-envoyer]');
  await pause();
  vrai(!(await present('[data-confirme-oui]')), 'une fiche incomplète ne se confirme pas');
  vrai(/armoire|canapé/i.test(await texte()), 'l’article manquant est nommé');
  egal((await base()).fiches['chemins-121'].envoye, undefined, 'la fiche n’est pas envoyée');
});

// ─────────────────────────────────────────────────────────── les questions au fil
await v('ENT-12.1 : questions au fil — « pourquoi-port » arrive au département posé, « lampe-six-jours » au choix du mode de la lampe (corrigée au bilan), « devant-chez-vous » au choix du mode de l’armoire, « limay » à l’envoi ; les trois notées valent 4 points', async () => {
  await mont();
  Q = QJ;
  await aller('localiser');
  await carteJuste(); await pause(100);
  vrai(!(await present('[data-q-panneau]')), 'une question avant le département');
  await immobile();
  await carteJuste(); await pause(300);
  await pg.waitForSelector(`${Z} [data-q-panneau]`, { timeout: 2000 });
  egal(await pg.$eval(`${Z} [data-q-panneau]`, (e) => e.dataset.qPanneau), 'pourquoi-port', 'question au département posé');
  await qFil();
  await carteJuste(); await qFil();
  const n0 = await pg.$eval(`${RC} [data-lc-bouton]`, (b) => b.dataset.lcBouton);
  await boutonCarte(n0); await qFil();
  await envoyerArmoire();
  await envoyerLampe();
  await fermerCartes();
  await ouvrirParMessage('Pourquoi deux chemins ?', 'fiche:chemins-121');
  await pg.selectOption(`${Z} [data-fiche-champ="mode_lampe"]`, 'relais');
  await pg.waitForSelector(`${Z} [data-q-panneau]`, { timeout: 2000 });
  egal(await pg.$eval(`${Z} [data-q-panneau]`, (e) => e.dataset.qPanneau), 'lampe-six-jours', 'question au mode de la lampe');
  await fermerCartes();
  await clic('[data-q-choix="retour"][data-q="lampe-six-jours"]');
  await clic('[data-q-repondre="lampe-six-jours"]'); await pause();
  vrai(!(await present('[data-q-verdict]')), 'lampe-six-jours : corrigée au bilan, pas de verdict tout de suite');
  await clic('[data-q-reprendre]'); await pause();
  await pg.selectOption(`${Z} [data-fiche-champ="mode_armoire"]`, 'meubles');
  await pg.waitForSelector(`${Z} [data-q-panneau]`, { timeout: 2000 });
  egal(await pg.$eval(`${Z} [data-q-panneau]`, (e) => e.dataset.qPanneau), 'devant-chez-vous', 'question au mode de l’armoire');
  await fermerCartes();
  await clic('[data-q-choix="elle"][data-q="devant-chez-vous"]');
  await clic('[data-q-repondre="devant-chez-vous"]'); await pause();
  vrai(await present('[data-q-verdict]'), 'devant-chez-vous : verdict tout de suite');
  await clic('[data-q-reprendre]'); await pause();
});

await v('ENT-12.1 : questions au fil — une fausse ôte son poids (1,5 → 18,5 ; 1 → 19) ; toutes fausses ôtent 4 (16) ; les réflexions ne comptent pas', async () => {
  const joue = async (RR) => { await mont(); await jouer({ q: { ...QJ, ...RR } }); const s = (await noter(ACT)).score; Q = QJ; return s; };
  proche(await joue({ 'pourquoi-port': 'vue' }), 18.5, 'pourquoi-port faux');
  proche(await joue({ 'lampe-six-jours': 'jete' }), 18.5, 'lampe-six-jours faux');
  proche(await joue({ 'devant-chez-vous': 'personne' }), 19, 'devant-chez-vous faux');
  proche(await joue(QF), 16, 'toutes fausses (les réflexions ne comptent pas)');
});

// ─────────────────────────────────────────────────────────── le corrigé et la fin
await v('ENT-12.1 : le fichier de corrigé est servi, dit la région et le département, les deux chemins et les trois modes ; `corrigeEleve` rend le départ tiré', async () => {
  const r = await pg.evaluate(async () => {
    const C = await import('/contenus/corriges/ENT-12.1.js');
    const D = await import('/contenus/ikea-ent121-donnees.js');
    const e = C.corrigeEleve({}, 'ik121');
    return { n: C.CORRIGE.items.length, carte: C.CORRIGE.items[0].rep, modes: C.CORRIGE.items[3].reponses, status: (await fetch('/contenus/corriges/ENT-12.1.js')).status, eleve: e.items[0].rep, tire: D.TIRAGE.tirer('ik121|' + D.ID).valeurs.armoire.length };
  });
  egal(r.status, 200, 'servi'); egal(r.n, 5, 'étapes');
  vrai(/Île-de-France/.test(r.carte) && /Hauts-de-Seine/.test(r.carte), 'corrigé de la carte : ' + r.carte);
  egal(r.modes.map((x) => x[1]), ['Point Relais', 'Livraison de meubles', 'Livraison de meubles'], 'modes attendus');
  vrai(r.eleve.startsWith('Un utilitaire électrique prend les colis à Bercy'), 'départ de l’élève : ' + r.eleve);
});

await v('ENT-12.1 : le mot « bonus » n’apparaît pas à l’écran, aucune requête hors du site pendant tout le bloc, aucune erreur de page ni de console', async () => {
  vrai(!/\bbonus\b/i.test(await texte()), 'le mot « bonus » à l’écran');
  egal([...P.hotes], [], 'hôtes externes contactés');
  egal(P.erreurs, [], 'erreurs de page ou de console');
});

await P.fermer?.();
}
