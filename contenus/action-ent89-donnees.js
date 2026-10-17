// ENT-8.9 — Action, « la palette de Lucas » : les DONNÉES PURES de la séance (protocole du quai 5, tirage par élève — anomalies de la scène,
// anomalies des palettes, date de réception de la palette de Lucas —, quai d'un élève, dialogue avec Jan, fiche « La palette de Lucas », phrases
// du compte rendu calculées sur CE QUE L'ÉLÈVE A FAIT). Aucun effet de bord à l'import, aucune dépendance au navigateur : le contenu
// (`contenus/action-ent89.js`), les questions (`contenus/questions/ENT-8.9.js`), le corrigé (`contenus/corriges/ENT-8.9.js`) et les tests l'importent.
// Brief : `docs/briefs/ENT-8.9-action-labastide-reception.md` ; décisions du chef de chantier : `docs/briefs/COORDINATION-action.md` §8.2 et §8.5.
//
// SÉANCES CLOISONNÉES : rien n'est importé d'`action-ent87*.js` ni d'`action-ent88*.js`. Les banques d'anomalies (les cinq objets de la scène,
// d'après ENT-8.7 §6 bis ; `ecrase-cache`, `manquant`, `couche-normale`, d'après ENT-8.8 §6.2) sont RECOPIÉES ici, avec leurs textes adaptés au
// site (Romain, Jan, Lucas). Le gabarit du protocole (`protocoleSecurite`) vient de l'univers `contenus/action.js` (lu, jamais modifié).
//
// VÉRIFIÉ : l'entrepôt Action de Labastide-Saint-Pierre (Tarn-et-Garonne), exploité par GXO (brief ENT-8.3 §2) ; le Code de commerce, art. L133-1
// (LEGIARTI000006220288, en vigueur depuis le 21/09/2000) et L133-3 (LEGIARTI000021486442, en vigueur depuis le 10/12/2009), recopiés sur Légifrance
// (voir `contenus/action-ent89.js`).
// CONSTRUIT (dit dans la séance, `MENTION`) : Romain, Lucas, Inès, le chauffeur Jan (il parle un peu français ; aucune nationalité nommée), le
// fournisseur (« un fournisseur de jouets »), le transporteur (sans nom), le protocole du quai 5 (consignes et valeurs inventées, même trame
// qu'Ensuès), le chargement du camion (4 palettes, couches et cartons inventés), les défauts, les numéros des documents, l'erreur de Lucas, les dates.
// Les textes du dialogue, des messages, de la fiche et des phrases sont ceux de Cowork (brief §4, §6.2, §6.3), tels quels ; ce qui est ajouté est
// marqué « CONSTRUIT par Claude Code ».
//
// LE TIRAGE (par élève, graine = son identifiant + « |action-palette-lucas », `tirerJeu` de `core/tirage.js`, comme ENT-8.8) :
//   - la scène : 2 anomalies, une `facile` (cabine OU cale) et une `moyen` ou `difficile` (niveleur, lampe OU butoirs) ;
//   - les palettes : 1 palette à problème (`ecrase-cache` : 1 carton écrasé sur la face ARRIÈRE, ou `manquant` : 2 cartons absents de la couche du
//     dessus, BL plein), 1 palette au piège `couche-normale` (couche du dessus à moitié vide, le BL dit le même nombre), 2 conformes ;
//   - la palette de Lucas : reçue `recent` (jeudi 17 décembre : on est dans les 3 jours) ou `ancien` (lundi 14 décembre : plus de 3 jours), 50 / 50.
// Le confirmé n'a PAS de 3e anomalie de scène (le brief la voulait en bonus) : le quai est une fonction de la seule graine, il ne connaît pas le
// niveau de l'élève (même limite qu'ENT-8.7) ; écart dit au compte rendu. ⚠ Le jeu d'un élève est une fonction de son identifiant ET de ce fichier :
// ne pas changer le tirage pendant qu'une classe joue la séance.

import { tirerJeu, graineDeBase, hasard } from '../core/tirage.js';

export const ID = 'action-palette-lucas';
export const ID_VOLET = 'action-ent89';
export const QUAI_ID = 'action-quai5-labastide';      // un id de quai par séance (COORDINATION §8.2 n° 2) : `db.quais` n'est pas cloisonné par séance
export const FICHE_ID = 'lucas';
export const DIALOGUE = 'jan';
export const PHRASES_ID = 'compte-rendu-lucas';
export const DOCUMENT = 'Bon de livraison — lettre de voiture';
export const BL_NUMERO = 'JOU-1812-05';                // CONSTRUIT
export const BL_LUCAS = 'JOU-PEL-0417';                // CONSTRUIT (le document de la palette de Lucas)
export const QTE = { cache: 1, manquant: 2 };           // fixes, comme ENT-8.8 (§8.4)

// ─────────────────────────────────────────────────────────────── le protocole du quai 5 (brief §6.1 : la trame d'Ensuès, consignes de Labastide)
// Une phrase par ligne, comme ENT-8.7 ; tout est CONSTRUIT. « Local chauffeurs à droite du poste de garde » (brief §6.1) n'est pas écrit : le plan de
// la cour du gabarit (`planCour`, `contenus/action.js`) dessine le local en haut à gauche, loin du poste de garde (écart dit au compte rendu).
export const CONSIGNES = {
  'c-epi': { rub: 'securite', texte: 'Gilet haute visibilité et chaussures de sécurité pour toute personne sur le quai, chauffeur compris.' },
  'c-immobile': { rub: 'securite', texte: 'Camion à quai : moteur coupé, clés remises au réceptionnaire, cale posée.' },
  'c-entrer': { rub: 'securite', texte: 'Personne n’entre dans la remorque avant que le niveleur soit posé et la lampe de quai allumée.' },
  'c-gerbage': { rub: 'securite', texte: 'Pas de gerbage en zone de réception.' },
  'c-vitesse': { rub: 'acces', texte: 'Vitesse 10 km/h dans la cour.' },
  'c-butoirs': { rub: 'acces', texte: 'Marche arrière jusqu’aux butoirs.' },
  'c-pietons': { rub: 'acces', texte: 'Les piétons ne passent que par l’allée piétonne.' },
  'c-attente': { rub: 'acces', texte: 'Le chauffeur attend au local chauffeurs pendant le déchargement et le contrôle.' },
  'c-depart': { rub: 'acces', texte: 'Le chauffeur ne repart qu’après la signature des documents.' },
  'c-chariot': { rub: 'engins', texte: 'Chariot élévateur frontal, conduit par un cariste titulaire du CACES R489 catégorie 3 et autorisé par GXO.' },
  'c-chauffeur': { rub: 'engins', texte: 'Le chauffeur ne décharge pas.' },
  'c-sst': { rub: 'secours', texte: 'Accident : prévenir le sauveteur secouriste du travail (SST) de l’équipe et le chef d’équipe.' },
  'c-urgence': { rub: 'secours', texte: 'Numéro d’urgence interne : poste 200.' },
  'c-trousse': { rub: 'secours', texte: 'Trousse de secours au bureau de la réception.' },
  'c-rassemblement': { rub: 'secours', texte: 'Évacuation : point de rassemblement, devant le poste de garde.' },
  'c-responsable': { rub: 'responsable', texte: 'Romain, chef d’équipe réception.' },
  'c-produits': { rub: 'produits', texte: 'Marchandises non alimentaires d’Action : jouets, décoration, maison.' },
};
const ids = (rub) => Object.keys(CONSIGNES).filter((k) => CONSIGNES[k].rub === rub).map((id) => ({ id, texte: CONSIGNES[id].texte }));
export const SPEC_PROTOCOLE = {
  exploitant: 'GXO',
  site: 'entrepôt Action, Labastide-Saint-Pierre',
  quai: 5, quais: 6, vitesse: 10,
  transporteur: 'le transporteur du fournisseur de jouets',
  provenance: 'livraisons répétitives d’un fournisseur de jouets',
  etabli: 'Établi avant la première livraison, entre GXO et le transporteur.',
  consignes: {
    securite: ids('securite'), acces: ids('acces'), engins: ids('engins'), secours: ids('secours'),
    responsable: { id: 'c-responsable', texte: CONSIGNES['c-responsable'].texte }, produits: ids('produits'),
  },
  signatures: [{ pour: 'GXO', qui: 'le responsable du site' }, { pour: 'le transporteur', qui: 'son gérant' }],
};

// ─────────────────────────────────────────────────────────────── la scène du quai 5 (les cinq objets de la vue, recopiés d'ENT-8.7 §6 bis)
export const OBJETS = {
  cabine: { sur: 'vide', danger: 'conduite', difficulte: 'facile', libOk: 'Cabine vide, moteur coupé', libKo: 'Chauffeur au volant, moteur allumé',
    repare: 'Bien vu : je fais couper le moteur, Jan me donne ses clés et va au local.' },
  cale: { sur: 'posee', danger: 'absente', difficulte: 'facile', libOk: 'Cale de roue posée', libKo: 'Cale de roue absente', repare: 'Bien vu : je fais poser la cale.' },
  niveleur: { sur: 'pose', danger: 'releve', difficulte: 'moyen', libOk: 'Niveleur posé', libKo: 'Niveleur relevé, pas posé sur la remorque', repare: 'Bien vu : je pose le niveleur.' },
  lampe: { sur: 'allumee', danger: 'eteinte', difficulte: 'moyen', libOk: 'Lampe de quai allumée', libKo: 'Lampe de quai éteinte', repare: 'Bien vu : j’allume la lampe de quai.' },
  butoirs: { sur: 'enPlace', danger: 'absents', difficulte: 'difficile', libOk: 'Butoirs de quai en place', libKo: 'Butoirs de quai absents',
    repare: 'Bien vu : on ne décharge pas à ce quai sans butoirs, je préviens la maintenance… et je les fais remettre.' },
};
export const SCENE_FACILES = ['cabine', 'cale'];
export const SCENE_AUTRES = ['niveleur', 'lampe', 'butoirs'];

// ─────────────────────────────────────────────────────────────── le camion de jouets (4 palettes, désignations génériques, quantités CONSTRUITES)
// Dimensions en cartons (largeur × profondeur × couches) déduites des cartons par couche, comme ENT-8.8 : 6 → 3 × 2, 8 → 4 × 2, 5 → 5 × 1.
const DIMS = { 6: [3, 2], 8: [4, 2], 5: [5, 1] };
export const CAMION = {
  // Le transporteur n'a pas de nom (brief §2) : la vue l'écrit « Le camion de … », « Le chauffeur (…) » : on y met le prénom du chauffeur.
  fournisseur: 'Fournisseur de jouets',
  transporteur: 'Jan',
  palettes: [
    { id: 'P1', ref: 'ACT-61204', designation: 'Peluches', couches: 4, parCouche: 6, contenu: 'peluches' },
    { id: 'P2', ref: 'ACT-61377', designation: 'Jeux de société', couches: 5, parCouche: 8, contenu: 'jeux de société' },
    { id: 'P3', ref: 'ACT-62015', designation: 'Voitures miniatures, lot de 5', couches: 5, parCouche: 5, contenu: 'lots de 5 voitures' },
    { id: 'P4', ref: 'ACT-62490', designation: 'Pâte à modeler, lot de 8', couches: 6, parCouche: 6, contenu: 'lots de 8 pots' },
  ],
};
export const PALETTES = CAMION.palettes.map((p) => { const [W, D] = DIMS[p.parCouche]; return { ...p, W, D, L: p.couches, cartons: p.couches * p.parCouche }; });
const palette = (id) => PALETTES.find((p) => p.id === id);
const incompleteAuDepart = (id) => { const p = palette(id); return !p || p.cartons !== p.W * p.D * p.L; };
// Les cellules « i,j,k » (i de gauche à droite, j = 0 au fond, D − 1 devant, k = couche, 0 en bas), comme ENT-8.8.
const dessus = ({ W, D, L }) => { const c = []; for (let i = 0; i < W; i++) for (let j = 0; j < D; j++) c.push(`${i},${j},${L - 1}`); return c; };
const arriere = ({ W, L }) => { const c = []; for (let i = 0; i < W; i++) for (let k = 0; k < L - 1; k++) c.push(`${i},0,${k}`); return c; };
export const moitieDessus = (p) => Math.floor((p.W * p.D) / 2);
export const ROLES = ['probleme', 'piege', 'conforme', 'conforme'];
export const PROBLEMES = ['ecrase-cache', 'manquant'];
export const ATTENDU = { 'ecrase-cache': ['reserves', 'avarie'], manquant: ['reserves', 'manquant'], 'couche-normale': ['accepter', 'aucun'], conforme: ['accepter', 'aucun'] };
export const DATES_LUCAS = {
  recent: { jour: 'jeudi 17 décembre', court: 'jeudi 17', n: 17, dansLesDelais: true },
  ancien: { jour: 'lundi 14 décembre', court: 'lundi 14', n: 14, dansLesDelais: false },
};

/* ================================================================== le tirage */
function tirer(h) {
  const scene = [h.choisir(SCENE_FACILES), h.choisir(SCENE_AUTRES)];
  const ordre = h.melanger(PALETTES.map((p) => p.id));
  const probleme = h.choisir(PROBLEMES);
  const role = { [ordre[0]]: 'probleme', [ordre[1]]: 'piege', [ordre[2]]: 'conforme', [ordre[3]]: 'conforme' };
  const palettes = PALETTES.map((p) => {
    const r = role[p.id], a = r === 'probleme' ? probleme : r === 'piege' ? 'couche-normale' : 'conforme';
    const plein = p.W * p.D * p.L;
    let manque = [];
    const avarie = {};
    if (a === 'ecrase-cache') h.prendre(arriere(p), QTE.cache).forEach((c) => { avarie[c] = [0, -1]; });
    if (a === 'manquant') manque = h.prendre(dessus(p), QTE.manquant);
    if (a === 'couche-normale') manque = h.prendre(dessus(p), moitieDessus(p));
    return { id: p.id, role: r, anomalie: a, manque, avarie, bl: a === 'couche-normale' ? plein - manque.length : plein };
  });
  return { scene, palettes, lucas: h.choisir(['recent', 'ancien']) };
}
// Les contraintes d'équité, en clair (liste vide = jeu conforme ; sinon il est retiré).
export function verifier(jeu) {
  const f = [];
  if (!jeu || !Array.isArray(jeu.scene) || jeu.scene.length !== 2) return ['il faut 2 anomalies de scène'];
  if (!SCENE_FACILES.includes(jeu.scene[0]) || !SCENE_AUTRES.includes(jeu.scene[1])) f.push(`scène : ${jeu.scene}`);
  if (!DATES_LUCAS[jeu.lucas]) f.push(`date de Lucas : ${jeu.lucas}`);
  const P = jeu.palettes;
  if (!Array.isArray(P) || P.length !== PALETTES.length) return f.concat([`il faut ${PALETTES.length} palettes`]);
  if (P.map((p) => p.id).join() !== PALETTES.map((p) => p.id).join()) f.push('palettes mal numérotées');
  if (P.map((p) => p.role).sort().join() !== ROLES.slice().sort().join()) f.push(`rôles : ${P.map((p) => p.role)}`);
  P.forEach((p) => {
    const d = palette(p.id);
    if (!d) return;
    const plein = d.W * d.D * d.L, reel = plein - p.manque.length, av = Object.keys(p.avarie);
    const attendue = p.role === 'probleme' ? PROBLEMES : p.role === 'piege' ? ['couche-normale'] : ['conforme'];
    if (!attendue.includes(p.anomalie)) f.push(`${p.id} : anomalie ${p.anomalie} pour le rôle ${p.role}`);
    if (p.anomalie === 'couche-normale' && incompleteAuDepart(p.id)) f.push(`${p.id} : le piège sur une palette déjà incomplète au départ`);
    if (new Set(p.manque).size !== p.manque.length || p.manque.some((c) => !dessus(d).includes(c))) f.push(`${p.id} : manquant hors de la couche du dessus`);
    if (av.some((c) => !arriere(d).includes(c) || p.avarie[c][0] !== 0 || p.avarie[c][1] !== -1)) f.push(`${p.id} : carton écrasé hors de la face arrière`);
    const ok = {
      'ecrase-cache': !p.manque.length && av.length === QTE.cache && p.bl === plein,
      manquant: p.manque.length === QTE.manquant && !av.length && p.bl === plein,
      'couche-normale': p.manque.length === moitieDessus(d) && p.manque.length > 0 && !av.length && p.bl === reel,
      conforme: !p.manque.length && !av.length && p.bl === plein,
    }[p.anomalie];
    if (!ok) f.push(`${p.id} : quantités hors règle pour ${p.anomalie}`);
  });
  return f;
}
const DECL = { tirer, verifier, essais: 40 };
DECL.secours = tirerJeu(Object.assign({}, DECL, { secours: null }), 'secours-action-ent89').jeu;
if (!DECL.secours) throw new Error('ENT-8.9 : le tirage ne donne aucun jeu conforme (tirer et verifier se contredisent)');
export const TIRAGE = DECL;

const jeux = new Map();
// Le jeu d'une graine (l'identifiant de l'élève ; '' : le jeu de référence, vu par l'enseignant), toujours le même pour la même graine.
export function jeuDe(graine) {
  const g = String(graine == null ? '' : graine);
  if (!jeux.has(g)) jeux.set(g, tirerJeu(TIRAGE, `${g}|${ID}`).jeu);
  return jeux.get(g);
}
export const jeuDeBase = (db) => jeuDe(graineDeBase(db));
export const duRole = (jeu, role) => jeu.palettes.find((p) => p.role === role);
export const conformes = (jeu) => jeu.palettes.filter((p) => p.role === 'conforme');
export const quantite = (p) => (p.anomalie === 'manquant' ? p.manque.length : Object.keys(p.avarie).length);
export const reelDe = (p) => { const d = palette(p.id); return d.W * d.D * d.L - p.manque.length; };
export const dateLucas = (db) => DATES_LUCAS[jeuDeBase(db).lucas];

/* ================================================================== le quai d'un élève */
export const DEPOSE = { passage: 3, cases: [
  { id: 'allee-1', sol: 'pieton', peinte: false, nom: 'Allée piétonne', reaction: 'Là, c’est l’allée piétonne : je ne pose pas ici.' },
  { id: 'R1' }, { id: 'R2' }, { id: 'R3' }, { id: 'R4' },
  { id: 'quai6-1', sol: 'autre-quai', legende: 'Quai 6', peinte: false, nom: 'Devant le quai 6', reaction: 'Ça, c’est la zone du quai 6.' }] };
// La consigne de Romain (brief §4, étape 2), aussi en tête du quai.
export const CONSIGNE_ROMAIN = 'Le camion est à quai. Tu sais ce qu’il faut regarder avant que Lucas entre. Puis contrôle les palettes et fais tes réserves.';
export function securiteDe(scene) {
  return {
    mode: 'scene',
    // Entraînement : rien n'arrête l'élève ; un défaut oublié est remis en ordre sans un mot (brief §0, COORDINATION §8.5).
    arret: false,
    consigne: 'Clique sur ce qui ne va pas, puis signale-le à Romain.',
    points: Object.entries(OBJETS).map(([objet, o]) => (scene.includes(objet)
      ? { id: objet, objet, etat: o.danger, ok: false, lib: o.libKo, repare: o.repare }
      : { id: objet, objet, etat: o.sur, ok: true, lib: o.libOk, repare: o.repare })),
    signaler: { qui: 'Romain', rien: 'Là, je ne vois rien qui cloche.' },
  };
}
export function quaiDuJeu(jeu) {
  return {
    id: QUAI_ID,
    libelle: 'Le quai 5',
    rendu: 'iso', froid: false,
    titre: 'Entrepôt Action — GXO, Labastide-Saint-Pierre (82) — Quai 5, réception',
    destinataire: 'Entrepôt Action — GXO, Labastide-Saint-Pierre',
    avertissement: `<b>Romain :</b> « ${CONSIGNE_ROMAIN} »<br>`
      + 'Réels : Action et GXO (qui fait tourner l’entrepôt de Labastide-Saint-Pierre pour Action). Le quai est un <b>dessin construit</b>. Le camion, '
      + 'son chargement, ses défauts, Jan, Lucas et les documents sont <b>construits pour l’exercice</b>.',
    lieu: { nom: 'Quai 5', temp: 15, refrigere: false },
    zone: { nom: 'Zone de réception' },
    document: DOCUMENT,
    recommencer: false,
    motifs: ['avarie', 'manquant'],
    // Entraînement : aides de comptage ÉTEINTES pour tous (COORDINATION §8.5), comme ENT-6.4 ; brouillon de calcul libre.
    calcul: { forme: 'brouillon' },
    aides: {},
    dechargement: { ouverture: 0.5, parPalette: 1, par: 'cariste', nom: 'Lucas' },
    securite: securiteDe(jeu.scene),
    depose: JSON.parse(JSON.stringify(DEPOSE)),
    camions: [{
      transporteur: CAMION.transporteur, fournisseur: CAMION.fournisseur, bl: BL_NUMERO, arrivee: '07:00',
      parole: 'Papiers. Pour vous. J’attends au local.',
      palettes: jeu.palettes.map((t) => {
        const p = palette(t.id), [attendu, motifAttendu] = ATTENDU[t.anomalie];
        return { id: p.id, ref: p.ref, nom: p.designation, bl: t.bl, W: p.W, D: p.D, L: p.L,
          manque: t.manque.slice(), avarie: JSON.parse(JSON.stringify(t.avarie)), attendu, motifAttendu,
          etiq: { ref: p.ref, nom: p.designation.toUpperCase(), poids: p.contenu, lot: `LAB-${p.ref.slice(-3)}-1812` } };
      }),
    }],
  };
}
// Le quai d'une graine (une déclaration neuve à chaque appel : le moteur garde la sienne en cache).
export const quaiDe = (graine) => quaiDuJeu(jeuDe(graine));
export const quaiDeBase = (db) => quaiDe(graineDeBase(db));

/* ================================================================== le dialogue avec Jan (brief §6.2, tel quel ; vouvoiement) */
// Les gestes entre parenthèses (« et la main montre le 5 », « pictogramme montré ») sont écrits comme une indication : CONSTRUIT par Claude Code.
export const REPLIQUES = [
  { id: 'arrivee', dit: 'Bonjour. Livraison. Jouets.', choix: [
    { v: 'bienvenue', juste: true, lib: 'Bonjour ! Bienvenue. Je suis {prenom}.' },
    { v: 'long', lib: 'Salut, c’est pour quoi exactement, votre livraison ?', reaction: 'Pardon ? Pas compris.' },
    { v: 'ouais', lib: 'Ouais.', reaction: '… Bonjour ?' }] },
  { id: 'documents', dit: 'Papiers ?', choix: [
    { v: 'ldv', juste: true, lib: 'Oui : la lettre de voiture et le bon de livraison, s’il vous plaît.' },
    { v: 'rien', lib: 'Non, pas besoin.', reaction: 'Pas besoin ? Sûr ?' },
    { v: 'identite', lib: 'Montrez-moi votre carte d’identité.', reaction: 'Carte ? Pourquoi ?' }] },
  { id: 'quai', dit: 'Quel quai ?', choix: [
    { v: 'quai5', juste: true, lib: 'Quai 5. Marche arrière, jusqu’aux butoirs. (Tu montres le 5 de la main.)' },
    { v: 'long', lib: 'Vous voyez le grand bâtiment au fond à gauche après le rond-point, c’est un peu plus loin.', reaction: 'Pardon ? Trop vite.' },
    { v: 'ou', lib: 'Où vous voulez.', reaction: 'Où ? Quel numéro ?' }] },
  { id: 'attente', dit: 'Moi, attendre où ?', choix: [
    { v: 'local', juste: true, lib: 'Moteur coupé. Les clés, s’il vous plaît. Vous attendez au local chauffeurs, là. (Tu montres le pictogramme.)' },
    { v: 'camion', lib: 'Restez dans votre camion, au chaud.', reaction: 'Dans camion ? Protocole dit non…' },
    { v: 'aider', lib: 'Venez aider Lucas.', reaction: 'Moi décharger ? Non, pas permis.' }] },
  { id: 'fin', dit: 'D’accord. Merci.', choix: [
    { v: 'merci', juste: true, lib: 'Merci à vous. Je viens vous chercher après le contrôle.' },
    { v: 'ciao', lib: 'Ciao !', reaction: '… Ciao.', accepte: true },
    { v: 'bon', lib: 'Bon.', reaction: '…', accepte: true }] },
];
export const JUSTES_DIALOGUE = Object.fromEntries(REPLIQUES.map((r) => [r.id, r.choix.find((c) => c.juste).v]));
export const FIN_DIALOGUE = 'D’accord. J’attends.';   // CONSTRUIT par Claude Code (le brief ne donne pas la dernière bulle)

/* ================================================================== la fiche « La palette de Lucas » (brief §4, étape 3) */
export const LIGNES_LUCAS = [
  { id: 'aurait-du', lib: 'Qu’aurait dû faire Lucas au quai ?', manque: 'ce qu’aurait dû faire Lucas',
    choix: [{ v: 'tour-reserve', lib: 'faire le tour de la palette et écrire une réserve précise, signée par le chauffeur' },
      { v: 'rien', lib: 'rien : le chauffeur est responsable de tout' }, { v: 'refuser', lib: 'refuser tout le camion' },
      { v: 'deballage', lib: 'écrire « sous réserve de déballage »' }] },
  { id: 'protester', lib: 'Peut-on encore protester auprès du transporteur ?', manque: 'si l’on peut encore protester',
    choix: [{ v: 'oui-3j', lib: 'oui : on est dans les 3 jours, par lettre recommandée motivée' }, { v: 'non-3j', lib: 'non : plus de 3 jours sont passés' },
      { v: 'oui-courriel', lib: 'oui, par un simple courriel' }, { v: 'oui-an', lib: 'oui, on a un an' }] },
  { id: 'palette', lib: 'En attendant, la palette va…', manque: 'où va la palette',
    choix: [{ v: 'litiges', lib: 'en zone litiges, avec une étiquette' }, { v: 'stock', lib: 'en stock avec les autres' },
      { v: 'benne', lib: 'à la benne' }, { v: 'magasin', lib: 'au magasin, on verra' }] },
];
// La réponse juste de chaque ligne ; la ligne 2 est jugée contre LA DATE TIRÉE de l'élève.
export const justeLucas = (db, ligne) => (ligne === 'aurait-du' ? 'tour-reserve' : ligne === 'palette' ? 'litiges'
  : dateLucas(db).dansLesDelais ? 'oui-3j' : 'non-3j');
export const melangerPour = (db, quoi, L) => { const g = graineDeBase(db); return g ? hasard(`${g}|${ID}|${quoi}`).melanger(L) : L.slice(); };

/* ================================================================== le compte rendu à Romain (brief §6.3), calculé sur CE QUE L'ÉLÈVE A FAIT */
const etatQuai = (db) => (db && db.quais && db.quais[QUAI_ID]) || null;
const nb = (v) => { const n = Number(String(v == null ? '' : v).replace(',', '.').trim()); return String(v == null ? '' : v).trim() !== '' && Number.isFinite(n) ? n : null; };
const unDes = (n, un, des) => `${n == null ? '…' : n} ${n === 1 ? un : des}`;
// Un constat : [palette, motif ('avarie' | 'manquant' | 'refuser' | 'aucun'), nombre ou null].
const dire = ([id, motif, n]) => (motif === 'refuser' ? `${id} refusée`
  : motif === 'manquant' ? `${id}, ${unDes(n, 'carton manquant', 'cartons manquants')}`
    : motif === 'avarie' ? `${id}, ${unDes(n, 'carton abîmé', 'cartons abîmés')}` : `${id}, réserve sans motif`);
export const TOUT_CONFORME = 'Tout est conforme, aucune réserve.';
export const phraseReception = (C) => (!C.length ? TOUT_CONFORME
  : `Camion de jouets reçu : ${C.length > 1 ? 'réserves signées' : 'réserve signée'} par Jan sur ${C.map(dire).join(' ; ')}.`);
// Les constats que l'élève a ÉCRITS sur le document signé (ses décisions au quai), dans l'ordre des palettes.
export function constatsEleve(db) {
  const e = etatQuai(db);
  if (!e || !e.ecrit) return [];
  return (e.lignes || []).map((l) => {
    const s = (e.palettes && e.palettes[l.id]) || {};
    if (s.decision === 'refuser') return [l.id, 'refuser', null];
    return [l.id, s.motif === 'avarie' || s.motif === 'manquant' ? s.motif : 'aucun', nb(s.res)];
  }).sort((a, b) => a[0].localeCompare(b[0]));
}
// Le constat attendu (le tirage), pour fabriquer les pièges quand l'élève n'a rien écrit.
export const constatAttendu = (jeu) => { const p = duRole(jeu, 'probleme'); return [p.id, p.anomalie === 'manquant' ? 'manquant' : 'avarie', quantite(p)]; };
export function choixReception(db) {
  const jeu = jeuDeBase(db), C = constatsEleve(db);
  const base = C.length ? C : [constatAttendu(jeu)];
  const [id0, m0, n0] = base[0];
  const autre = PALETTES.map((p) => p.id).find((x) => !base.some((c) => c[0] === x))
    || PALETTES[(PALETTES.findIndex((p) => p.id === id0) + 1) % PALETTES.length].id;
  const L = [phraseReception(C), TOUT_CONFORME,
    phraseReception([[autre, m0 === 'refuser' || m0 === 'aucun' ? 'avarie' : m0, n0 == null ? 1 : n0], ...base.slice(1)]),
    phraseReception([[id0, m0 === 'refuser' || m0 === 'aucun' ? 'avarie' : m0, (n0 == null ? 1 : n0) + 1], ...base.slice(1)])];
  if (!C.length) L.splice(1, 1, phraseReception(base));   // rien écrit : la juste est « Tout est conforme » ; les pièges disent le vrai problème
  return [...new Set(L)];
}
export const PHRASES_LUCAS = [
  'On est dans les 3 jours : Inès envoie une lettre recommandée au transporteur. La palette est en zone litiges.',
  'Plus de 3 jours sont passés : on ne peut plus protester. La palette est en zone litiges.',
  'Ce n’est pas grave, je la mets en stock.',
  'J’ai envoyé un courriel au chauffeur.',
];
// « Une erreur ne se paie qu'une fois » (comme ENT-8.6) : la phrase juste suit CE QUE L'ÉLÈVE A RÉPONDU à la ligne 2 de la fiche ; une réponse sans
// phrase (courriel, un an) : la phrase de sa date.
export function justePhraseLucas(db) {
  const r = (((db && db.fiches && db.fiches[FICHE_ID]) || {}).valeurs || {}).protester;
  if (r === 'oui-3j') return 0;
  if (r === 'non-3j') return 1;
  return dateLucas(db).dansLesDelais ? 0 : 1;
}
export const SALUTATIONS = ['Bonjour Romain,', 'Salut chef,', 'Coucou,'];
export const finsDe = (prenom) => [prenom, 'Bisous', 'À plus.'];
export const phrasesCompteRendu = (prenom) => ({ id: PHRASES_ID, melanger: true, lignes: [
  { id: 'salutation', choix: SALUTATIONS.slice(), juste: 0 },
  { id: 'reception', choix: (d) => choixReception(d), juste: 0 },
  { id: 'lucas', choix: PHRASES_LUCAS.slice(), juste: (d) => justePhraseLucas(d) },
  { id: 'fin', choix: finsDe(prenom), juste: 0 },
] });

/* ================================================================== la question `qui-paie` (L133-1 appliqué au cas) */
export function quiPaie(jeu) {
  const p = duRole(jeu, 'probleme');
  return p.anomalie === 'manquant'
    ? { enonce: `Les cartons qui manquent sur ta palette ${p.id} ont été perdus pendant le transport. Qui doit les rembourser ? (Lis le document « Le droit », joint au message de Romain.)`,
      libs: { transporteur: 'le transporteur : il répond des pertes pendant le transport' } }
    : { enonce: `Les cartons abîmés de ta palette ${p.id} l’ont été pendant le transport. Qui doit les rembourser ? (Lis le document « Le droit », joint au message de Romain.)`,
      libs: { transporteur: 'le transporteur : il répond des avaries pendant le transport' } };
}
