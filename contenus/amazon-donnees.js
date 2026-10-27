// Amazon — les DONNÉES des séances ENT-19.1 à 19.10 (CAP OL, entreprise n° 19 : le centre de distribution robotisé de Brétigny-sur-Orge).
// Données pures : aucun effet de bord, aucune dépendance au navigateur (se charge aussi sous Node). Cadrage : `docs/briefs/amazon/CADRAGE-amazon-cap.md`.
//
// RÉEL (recherche du 10/10/2026, `knowledge/claude/prepalog-amazon-recherche.md`) : à Brétigny, la marchandise vient au salarié (des robots
// apportent l'armoire au poste) ; au rangement, l'emplacement où le salarié pose l'article DEVIENT son adresse dans le système, et un même
// produit est éclaté sur plusieurs cases (stockage aléatoire) ; au prélèvement, la case est montrée, l'écran montre la photo du produit, le
// salarié prend l'article et confirme au bouton ; à l'emballage, le système désigne le carton (on peut prendre plus grand, jamais plus petit) ;
// un colis dont le poids ne correspond pas sort de la ligne vers un « problem solver ».
// CONSTRUIT (dit dans les séances) : les armoires, leurs cases et leurs « places », les trois règles de rangement du poste, les articles, les
// commandes, les cartons et leurs dimensions, la tolérance de la pesée, les vendeurs et les camions, les prénoms.
// ⚠ Les jeux des évaluations (19.5, 19.10) sont une fonction de la graine de l'élève ET de ce fichier : ne rien y changer pendant qu'une classe joue.

import { empreinte, graineDeBase } from '../core/tirage.js';

// ─────────────────────────────────────────── les articles (construits ; aucun nom de marque)
// `place` : ce que l'article prend dans une case (petit 1, moyen 2, grand 3) ; `fam` : les articles qui se RESSEMBLENT ont la même famille.
const TAILLE = { petit: 1, moyen: 2, grand: 3 };
const a = (ref, nom, taille, kg, fam, dim) => ({ ref, nom, taille, place: TAILLE[taille], kg, fam, dim });
export const ARTICLES = Object.fromEntries([
  a('coque-noire', 'Coque de téléphone noire', 'petit', 0.1, 'coque', [16, 8, 2]),
  a('coque-transp', 'Coque de téléphone transparente', 'petit', 0.1, 'coque', [16, 8, 2]),
  a('livre-poche', 'Livre de poche', 'petit', 0.3, 'livre', [18, 11, 3]),
  a('livre-cuisine', 'Livre de cuisine', 'moyen', 1.1, 'livre', [28, 22, 3]),
  a('haltere', 'Haltère de 8 kg', 'moyen', 8, 'sport', [30, 12, 12]),
  a('kettlebell', 'Kettlebell de 6 kg', 'moyen', 6, 'sport', [20, 15, 22]),
  a('peluche', 'Peluche lapin', 'moyen', 0.4, 'peluche', [30, 18, 15]),
  a('lampe', 'Lampe de bureau', 'grand', 1.2, 'lampe', [45, 20, 20]),
  a('cable', 'Câble USB-C de 1 m', 'petit', 0.05, 'cable', [15, 10, 2]),
  a('gourde-bleue', 'Gourde isotherme bleue', 'petit', 0.35, 'gourde', [25, 8, 8]),
  a('gourde-verte', 'Gourde isotherme verte', 'petit', 0.35, 'gourde', [25, 8, 8]),
  a('tasse', 'Tasse en céramique', 'petit', 0.3, 'tasse', [12, 9, 10]),
  a('tshirt-m', 'T-shirt blanc, taille M', 'petit', 0.2, 'tshirt', [25, 20, 2]),
  a('tshirt-l', 'T-shirt blanc, taille L', 'petit', 0.2, 'tshirt', [25, 20, 2]),
  a('bougie', 'Bougie parfumée en pot de verre', 'petit', 0.4, 'bougie', [9, 9, 10]),
  a('puzzle', 'Puzzle de 1 000 pièces', 'moyen', 0.9, 'jeu', [38, 27, 6]),
  a('jeu-cartes', 'Jeu de cartes', 'petit', 0.15, 'jeu', [10, 7, 3]),
  a('casque', 'Casque audio', 'moyen', 0.3, 'casque', [22, 19, 9]),
  a('plaid', 'Plaid polaire', 'grand', 0.9, 'linge', [40, 30, 15]),
  a('sac-croquettes', 'Sac de croquettes de 7 kg', 'grand', 7, 'animal', [50, 30, 12]),
  a('ballon', 'Ballon de football', 'moyen', 0.45, 'ballon', [23, 23, 23]),
  a('rouleau-adhesif', 'Lot de 6 rouleaux d’adhésif', 'petit', 0.6, 'bureau', [15, 15, 5]),
  a('cafetiere', 'Cafetière à piston en verre', 'moyen', 0.8, 'cafetiere', [22, 15, 25]),
  a('chargeur', 'Chargeur secteur', 'petit', 0.1, 'cable', [9, 6, 4]),
  a('poele', 'Poêle de 28 cm', 'grand', 1.4, 'cuisine', [48, 29, 6]),
].map((x) => [x.ref, x]));
export const KG_LOURD = 5;     // CONSTRUIT : un article de plus de 5 kg va dans une case du bas (niveau A ou B)
export const NIVEAUX = ['A', 'B', 'C', 'D'];   // A en bas, D en haut
export const CASES = NIVEAUX.flatMap((n) => [1, 2, 3].map((c) => `${n}${c}`));
export const nomDe = (ref) => ARTICLES[ref].nom;

// ─────────────────────────────────────────── l'armoire et les trois règles du poste (construites)
// Une armoire : { no, cases: { A1: { libre, dedans: [refs] } … } } ; `libre` = places libres (0 à 3).
const armoire = (no, def) => ({ no, cases: Object.fromEntries(CASES.map((c) => [c, { libre: def[c][0], dedans: def[c].slice(1) }])) });
const famillesDe = (C) => C.dedans.map((r) => ARTICLES[r].fam);
// Ce que les règles disent d'un article posé dans une case, les articles posés AVANT lui dans la même fiche comptant aussi.
// Rend null si c'est juste, sinon la règle cassée : 'place', 'ressemble', 'lourd', 'case' (case inconnue).
export function regleCassee(A, ref, kase, avant = []) {
  const C = A.cases[kase];
  if (!C) return 'case';
  const art = ARTICLES[ref];
  const deja = avant.filter((x) => x.kase === kase).map((x) => ARTICLES[x.ref]);
  if (art.place + deja.reduce((t, x) => t + x.place, 0) > C.libre) return 'place';
  if ([...famillesDe(C), ...deja.map((x) => x.fam)].includes(art.fam)) return 'ressemble';
  if (art.kg > KG_LOURD && !['A', 'B'].includes(kase[0])) return 'lourd';
  return null;
}
// Les cases justes d'un article (pour le corrigé), les articles d'avant étant ceux de `avant`.
export const casesJustes = (A, ref, avant = []) => CASES.filter((k) => !regleCassee(A, ref, k, avant));
// Une suite de choix : `choix[i]` = la case choisie pour `refs[i]` ('cote' = mis de côté). Rend, pour chaque article, null (juste) ou la règle cassée.
// Un article ABÎMÉ (`abimes`) n'est juste que mis de côté ; un article sain mis de côté est faux ('cote').
export function jugerRangement(A, refs, choix, abimes = []) {
  const poses = [];
  return refs.map((ref, i) => {
    const k = choix[i];
    if (abimes.includes(ref)) return k === 'cote' ? null : 'abime';
    if (k === 'cote') return 'cote';
    const r = regleCassee(A, ref, k, poses);
    if (k && A.cases[k]) poses.push({ ref, kase: k });
    return r;
  });
}
export const adresse = (A, kase) => `${A.no}-${kase}`;

// ─────────────────────────────────────────── les armoires des séances
// ENT-19.3 (guidage) : cinq articles, plusieurs cases justes pour chacun ; l'haltère (8 kg) n'a que A3 et B1.
export const A193 = armoire('P-0418', {
  A1: [0, 'puzzle'], A2: [1, 'livre-poche'], A3: [2, 'coque-noire'],
  B1: [3], B2: [1, 'cable'], B3: [0, 'gourde-verte'],
  C1: [2, 'livre-cuisine'], C2: [1, 'coque-noire'], C3: [3],
  D1: [1, 'peluche'], D2: [2, 'tshirt-m'], D3: [0, 'bougie'],
});
export const R193 = ['coque-transp', 'livre-poche', 'haltere', 'peluche', 'lampe'];

// ENT-19.4 (entraînement) : six articles dont un abîmé (la tasse) ; armoire plus pleine.
export const A194 = armoire('P-1290', {
  A1: [2, 'livre-poche'], A2: [0, 'sac-croquettes'], A3: [1, 'tshirt-l'],
  B1: [2, 'kettlebell'], B2: [3], B3: [1, 'jeu-cartes'],
  C1: [1, 'coque-noire'], C2: [2, 'casque'], C3: [0, 'plaid'],
  D1: [3], D2: [1, 'gourde-bleue'], D3: [2, 'bougie'],
});
export const R194 = ['tshirt-m', 'haltere', 'tasse', 'gourde-verte', 'plaid', 'puzzle'];
export const ABIMES194 = ['tasse'];

// L'inventaire d'un produit éclaté sur plusieurs cases (19.4, 19.5) : le système dit `attendu`, l'élève compte ce que montrent les cases.
export const INV194 = { ref: 'gourde-verte', attendu: 7, cases: [
  { adr: 'P-0418-B3', vu: [['gourde-verte', 2], ['gourde-bleue', 1]] },
  { adr: 'P-0733-A1', vu: [['gourde-verte', 3], ['livre-poche', 1]] },
  { adr: 'P-2207-D2', vu: [['gourde-verte', 1]] }] };
export const compte = (I) => I.cases.reduce((t, c) => t + c.vu.filter(([r]) => r === I.ref).reduce((s, [, q]) => s + q, 0), 0);
export const ecart = (I) => (compte(I) < I.attendu ? 'manque' : compte(I) > I.attendu ? 'trop' : 'juste');

// ─────────────────────────────────────────── ENT-19.5 : trois jeux (un par élève, d'après sa graine)
const JEUX195 = [
  { armoire: armoire('P-3051', {
      A1: [1, 'cable'], A2: [3], A3: [0, 'plaid'],
      B1: [1, 'coque-noire'], B2: [2, 'puzzle'], B3: [1, 'tasse'],
      C1: [3], C2: [0, 'lampe'], C3: [2, 'livre-cuisine'],
      D1: [1, 'tshirt-l'], D2: [2, 'peluche'], D3: [1, 'bougie'] }),
    refs: ['kettlebell', 'coque-transp', 'cafetiere', 'livre-poche', 'chargeur'], abimes: ['cafetiere'],
    inv: { ref: 'cable', attendu: 6, cases: [{ adr: 'P-3051-A1', vu: [['cable', 2]] }, { adr: 'P-0418-B2', vu: [['cable', 2], ['chargeur', 1]] }, { adr: 'P-0733-C3', vu: [['cable', 1]] }] },
    secu: ['zone', 'lourd'] },
  { armoire: armoire('P-3188', {
      A1: [2, 'jeu-cartes'], A2: [0, 'poele'], A3: [1, 'livre-poche'],
      B1: [3], B2: [1, 'gourde-bleue'], B3: [2, 'casque'],
      C1: [1, 'coque-noire'], C2: [3], C3: [0, 'sac-croquettes'],
      D1: [2, 'bougie'], D2: [1, 'cable'], D3: [2, 'tshirt-m'] }),
    refs: ['sac-croquettes', 'gourde-verte', 'tshirt-l', 'tasse', 'puzzle'], abimes: ['tasse'],
    inv: { ref: 'livre-poche', attendu: 4, cases: [{ adr: 'P-3188-A3', vu: [['livre-poche', 1]] }, { adr: 'P-0418-A2', vu: [['livre-poche', 2]] }, { adr: 'P-1290-A1', vu: [['livre-poche', 1]] }] },
    secu: ['tombe', 'bouton'] },
  { armoire: armoire('P-3420', {
      A1: [3], A2: [1, 'chargeur'], A3: [2, 'ballon'],
      B1: [0, 'plaid'], B2: [2, 'tasse'], B3: [1, 'jeu-cartes'],
      C1: [2, 'livre-poche'], C2: [1, 'coque-transp'], C3: [3],
      D1: [0, 'lampe'], D2: [1, 'bougie'], D3: [2, 'casque'] }),
    refs: ['haltere', 'cable', 'peluche', 'bougie', 'poele'], abimes: ['bougie'],
    inv: { ref: 'tasse', attendu: 3, cases: [{ adr: 'P-3420-B2', vu: [['tasse', 1]] }, { adr: 'P-3051-B3', vu: [['tasse', 1]] }, { adr: 'P-2207-C1', vu: [['tasse', 2]] }] },
    secu: ['zone', 'bouton'] },
];
export const indiceJeu = (db, n) => empreinte(`${graineDeBase(db)}|amazon`) % n;
export const jeu195 = (db) => JEUX195[indiceJeu(db, JEUX195.length)];
export const TOUS_JEUX195 = JEUX195;

// ─────────────────────────────────────────── la sécurité au poste (19.2, 19.5) : situations et réponses (construites)
export const SECURITE = {
  zone: { texte: 'Un article tombe de l’armoire, de l’autre côté de la barrière, dans la zone des robots.',
    choix: [{ v: 'aide', lib: 'Je ne passe jamais la barrière : j’appuie sur « Aide » et Théo s’en occupe' }, { v: 'vite', lib: 'Je passe vite la barrière pour le ramasser' },
      { v: 'laisse', lib: 'Je le laisse là, sans rien dire' }], juste: 'aide' },
  lourd: { texte: 'Tu dois poser un carton de 12 kg dans une case du bas.',
    choix: [{ v: 'dos', lib: 'Je plie les jambes, le dos droit, le carton près du corps' }, { v: 'bras', lib: 'Je me penche, jambes tendues, et je tire avec les bras' },
      { v: 'jette', lib: 'Je le fais glisser du haut de l’armoire' }], juste: 'dos' },
  tombe: { texte: 'Une boîte est mal posée en haut de l’armoire et dépasse de sa case.',
    choix: [{ v: 'signale', lib: 'Je ne fais pas partir l’armoire et je préviens Théo' }, { v: 'part', lib: 'Je fais partir l’armoire, le robot l’emportera' },
      { v: 'grimpe', lib: 'Je monte sur le bord du poste pour la pousser' }], juste: 'signale' },
  bouton: { texte: 'Le robot s’arrête et l’écran affiche « Armoire en attente ». Tu ne sais pas pourquoi.',
    choix: [{ v: 'attends', lib: 'J’attends et j’appuie sur « Aide » si ça dure' }, { v: 'pousse', lib: 'Je pousse l’armoire pour l’aider' },
      { v: 'debranche', lib: 'Je débranche l’écran du poste' }], juste: 'attends' },
  epi: { texte: 'Tu arrives au poste avec des baskets, sans tes chaussures de sécurité.',
    choix: [{ v: 'change', lib: 'Je ne commence pas : je vais mettre mes chaussures de sécurité' }, { v: 'tant-pis', lib: 'Tant pis, je fais attention' },
      { v: 'demain', lib: 'Je les mettrai demain' }], juste: 'change' },
};
export const SECU192 = ['epi', 'zone', 'lourd', 'tombe'];

// ─────────────────────────────────────────── l'écran du poste et le planigramme de réception (19.2)
export const POSTE192 = { poste: 214, niveau: 2, mission: 'Rangement', armoire: 'P-0418', bac: 'T-77', articles: 12 };
export const PLANIGRAMME = [
  { heure: '08:00', vendeur: 'Lumi Déco (Lyon)', quai: 12, palettes: 6 },
  { heure: '09:30', vendeur: 'Jouets Maël (Nantes)', quai: 14, palettes: 4 },
  { heure: '10:00', vendeur: 'Sport Ouest (Rennes)', quai: 12, palettes: 8 },
  { heure: '11:30', vendeur: 'Cuisine & Co (Lille)', quai: 15, palettes: 5 },
];
export const RETARD_MAX = 30;   // RÉEL : la procédure publique d'Amazon pour les transporteurs tolère 30 minutes de retard
export const palettesAuQuai = (q) => PLANIGRAMME.filter((x) => x.quai === q).reduce((t, x) => t + x.palettes, 0);

// ─────────────────────────────────────────── le prélèvement (19.6, 19.8, 19.10)
// Une ligne : { n, ref, qte, case, vu: [[ref, qte]…], abime? } ; ce qu'il faut faire : 'prendre' | 'vide' | 'autre' | 'abime'.
export const ACTIONS = [
  { v: 'prendre', lib: 'Je prends l’article et j’appuie sur le bouton vert' },
  { v: 'vide', lib: 'Je signale : la case est vide' },
  { v: 'autre', lib: 'Je signale : ce n’est pas l’article de la photo' },
  { v: 'abime', lib: 'Je signale : l’article est abîmé' },
  { v: 'ressemble', lib: 'Je prends l’article qui ressemble le plus' },
];
export function actionJuste(L) {
  if (L.abime) return 'abime';
  const q = (L.vu.find(([r]) => r === L.ref) || [null, 0])[1];
  if (!L.vu.length) return 'vide';
  if (q < L.qte) return q === 0 ? 'autre' : 'vide';
  return 'prendre';
}
export const P196 = { armoire: 'P-0418', lignes: [
  { n: 1, ref: 'gourde-bleue', qte: 1, case: 'B3', vu: [['gourde-bleue', 2]], bac: 'C-111' },
  { n: 2, ref: 'coque-transp', qte: 1, case: 'C2', vu: [['coque-noire', 3]], bac: 'C-112' },
  { n: 3, ref: 'livre-cuisine', qte: 1, case: 'A2', vu: [], bac: 'C-113' },
  { n: 4, ref: 'cable', qte: 2, case: 'B2', vu: [['cable', 2]], bac: 'C-112' },
] };
export const P198 = { armoire: 'P-1290', lignes: [
  { n: 1, ref: 'casque', qte: 1, case: 'C2', vu: [['casque', 1]], bac: 'C-201' },
  { n: 2, ref: 'tshirt-m', qte: 1, case: 'A3', vu: [['tshirt-l', 2]], bac: 'C-202' },
  { n: 3, ref: 'bougie', qte: 1, case: 'D3', vu: [['bougie', 1]], abime: true, bac: 'C-203' },
  { n: 4, ref: 'jeu-cartes', qte: 1, case: 'B3', vu: [['jeu-cartes', 3]], bac: 'C-201' },
  { n: 5, ref: 'gourde-bleue', qte: 1, case: 'D2', vu: [], bac: 'C-203' },
] };
export const BACS = ['C-111', 'C-112', 'C-113', 'C-201', 'C-202', 'C-203'];

// ─────────────────────────────────────────── l'emballage (19.7, 19.8, 19.10)
// CONSTRUITS : les cartons (dimensions intérieures en cm, poids du carton vide en kg) ; le plus petit qui contient l'article.
export const CARTONS = [
  { id: 'env', nom: 'Enveloppe papier', dim: [30, 20, 3], kg: 0.04 },
  { id: 'S', nom: 'Carton S', dim: [20, 15, 10], kg: 0.12 },
  { id: 'M', nom: 'Carton M', dim: [35, 25, 15], kg: 0.25 },
  { id: 'L', nom: 'Carton L', dim: [50, 40, 30], kg: 0.5 },
];
export const TOLERANCE_G = 50;   // CONSTRUIT : au-delà de 50 g d'écart, le colis sort de la ligne
const tient = (d, c) => { const x = d.slice().sort((p, q) => q - p), y = c.slice().sort((p, q) => q - p); return x.every((v, i) => v <= y[i]); };
// Le carton d'une commande : le plus petit qui contient TOUS ses articles posés l'un sur l'autre (on additionne la plus petite dimension).
export function cartonJuste(refs) {
  const dims = refs.map((r) => ARTICLES[r].dim.slice().sort((p, q) => q - p));
  const tot = [Math.max(...dims.map((d) => d[0])), Math.max(...dims.map((d) => d[1])), dims.reduce((t, d) => t + d[2], 0)];
  const c = CARTONS.find((k) => tient(tot, k.dim));
  return c ? c.id : null;
}
export const FRAGILES = ['tasse', 'bougie', 'cafetiere'];
export const aCaler = (refs) => refs.some((r) => FRAGILES.includes(r));
export const poidsAttendu = (refs, carton) => Math.round((refs.reduce((t, r) => t + ARTICLES[r].kg, 0) + CARTONS.find((k) => k.id === carton).kg) * 1000) / 1000;
export const pesee = (attendu, lu) => (Math.abs(lu - attendu) * 1000 > TOLERANCE_G ? 'sortir' : 'part');
export const E197 = { commandes: [
  { id: '403-1', refs: ['livre-poche'] }, { id: '403-2', refs: ['gourde-bleue'] }, { id: '403-3', refs: ['lampe'] }, { id: '403-4', refs: ['tasse'] }],
  pesees: [{ id: '403-2', lu: 0.61 }, { id: '403-3', lu: 1.25 }] };
export const E198 = { commandes: [
  { id: '512-1', refs: ['casque'] }, { id: '512-2', refs: ['cafetiere'] }, { id: '512-3', refs: ['jeu-cartes', 'cable'] }],
  pesees: [{ id: '512-1', lu: 0.82 }] };
export const ECOGESTES = [
  { v: 'film', lib: 'Je mets le film plastique dans le bac à plastique', juste: true },
  { v: 'chutes', lib: 'Je mets les chutes de carton dans la benne à carton', juste: true },
  { v: 'taille', lib: 'Je prends le carton à la taille : moins de vide, moins de papier, plus de colis par camion', juste: true },
  { v: 'grand', lib: 'Je prends toujours un grand carton, comme ça tout rentre', juste: false },
  { v: 'remplir', lib: 'Je remplis le vide d’un grand carton avec beaucoup de papier', juste: false },
];

// ─────────────────────────────────────────── ENT-19.10 : trois jeux (prélèvement + emballage)
const JEUX1910 = [
  { prelev: { armoire: 'P-4012', lignes: [
      { n: 1, ref: 'ballon', qte: 1, case: 'A3', vu: [['ballon', 1]] },
      { n: 2, ref: 'chargeur', qte: 1, case: 'B1', vu: [] },
      { n: 3, ref: 'coque-noire', qte: 1, case: 'C1', vu: [['coque-transp', 2]] },
      { n: 4, ref: 'tasse', qte: 1, case: 'B2', vu: [['tasse', 1]], abime: true }] },
    emb: { commandes: [{ id: '780-1', refs: ['jeu-cartes'] }, { id: '780-2', refs: ['cafetiere'] }, { id: '780-3', refs: ['plaid'] }],
      pesees: [{ id: '780-1', lu: 0.36 }, { id: '780-3', lu: 1.42 }] } },
  { prelev: { armoire: 'P-4155', lignes: [
      { n: 1, ref: 'livre-poche', qte: 2, case: 'C1', vu: [['livre-poche', 2]] },
      { n: 2, ref: 'gourde-verte', qte: 1, case: 'D2', vu: [['gourde-bleue', 1]] },
      { n: 3, ref: 'bougie', qte: 1, case: 'D3', vu: [['bougie', 2]], abime: true },
      { n: 4, ref: 'casque', qte: 1, case: 'B3', vu: [] }] },
    emb: { commandes: [{ id: '781-1', refs: ['tshirt-m'] }, { id: '781-2', refs: ['tasse'] }, { id: '781-3', refs: ['poele'] }],
      pesees: [{ id: '781-2', lu: 0.42 }, { id: '781-3', lu: 1.66 }] } },
  { prelev: { armoire: 'P-4398', lignes: [
      { n: 1, ref: 'cable', qte: 1, case: 'A2', vu: [['chargeur', 2]] },
      { n: 2, ref: 'puzzle', qte: 1, case: 'B2', vu: [['puzzle', 1]] },
      { n: 3, ref: 'jeu-cartes', qte: 1, case: 'B3', vu: [] },
      { n: 4, ref: 'cafetiere', qte: 1, case: 'C3', vu: [['cafetiere', 1]], abime: true }] },
    emb: { commandes: [{ id: '782-1', refs: ['casque'] }, { id: '782-2', refs: ['bougie'] }, { id: '782-3', refs: ['livre-cuisine'] }],
      pesees: [{ id: '782-1', lu: 0.56 }, { id: '782-3', lu: 1.18 }] } },
];
export const jeu1910 = (db) => JEUX1910[indiceJeu(db, JEUX1910.length)];
export const TOUS_JEUX1910 = JEUX1910;

// ─────────────────────────────────────────── ENT-19.9 : les faits (RÉELS, datés) et leurs conséquences
export const FAITS = {
  saisonniers: 9500, saisonniersHdf: 2700, sites: 40,     // Économie Matin, 01/10/2026 : pic d'octobre à décembre 2026
  robots: 4000, salaries: 4500, colisJour: 500000,         // Brétigny : vidéo « Les coulisses de la conso » et Clubic, 10/07/2025
};
export const nombreFr = (x) => String(Math.round(x * 100) / 100).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
