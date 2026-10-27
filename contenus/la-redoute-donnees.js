// La Redoute — Quai 30, Wattrelos : les DONNÉES PURES des séances ENT-17.1 à 17.5 (Terminale, C2.2 « optimiser les préparations de commandes » par
// l'emballage, C3.3 « proposer des axes d'amélioration de l'activité logistique dans le cadre d'une démarche RSE »). Importé par la fabrique
// (`contenus/la-redoute.js`), les contenus de séance, les corrigés et les tests. Cadrage : `docs/briefs/la-redoute/CADRAGE-la-redoute-tle.md`.
//
// VÉRIFIÉ (recherche web, 26/10/2026) : Quai 30, l'entrepôt de La Redoute à Wattrelos (Nord), environ 42 000 m², la mode et les petits articles
// (corporate.laredoute.com, 17/10/2022 ; fashionnetwork.com, 20/03/2020) ; site très mécanisé (mini-loads, navettes, tri automatique, postes
// « marchandise vers l'homme »), jusqu'à 3 500 commandes par heure, préparation en moins de deux heures, plus de 300 000 références, livraison le
// lendemain en France ; exploité par ID Logistics, devenu en 2025 un site multi-marques « ID4Fashion » (ecommerce-nation.fr, 07/10/2025). Le règlement
// (UE) 2025/40 sur les emballages, article 24 : un ratio d'espace vide de 50 % au plus pour les emballages de commerce électronique, à partir du
// 1er janvier 2030 ; le calage compte comme du vide (complydex.com, résumé du règlement). La loi AGEC (2020) interdit de détruire les invendus non
// alimentaires.
// CONSTRUIT : les formats d'emballage, leurs volumes et leurs poids, la règle de choix du format, les articles et leurs volumes, les commandes, les
// retours, leur état et la règle de tri des retours, les prénoms (Claire, Julien).

// ─────────────────────────────────────────── les emballages (CONSTRUITS)
export const FORMATS = [
  { id: 'pochette', nom: 'Pochette souple', litres: 4, grammes: 30 },
  { id: 'S', nom: 'Carton S', litres: 8, grammes: 150 },
  { id: 'M', nom: 'Carton M', litres: 16, grammes: 250 },
  { id: 'L', nom: 'Carton L', litres: 30, grammes: 400 },
];
export const FORMAT = Object.fromEntries(FORMATS.map((f) => [f.id, f]));
export const CALAGE = 2;      // litres de calage par article fragile
export const VIDE_MAX = 50;   // règlement (UE) 2025/40, art. 24, à partir de 2030
export const AVANT = 'M';     // l'ancienne habitude : un carton M pour tout (L si M est trop petit)

// ─────────────────────────────────────────── les articles (CONSTRUITS : catégories génériques, pas de produits réels)
export const ARTICLES = {
  TS: { nom: 'T-shirt en coton', litres: 1, souple: true },
  RO: { nom: 'Robe légère', litres: 1.5, souple: true },
  JE: { nom: 'Jean', litres: 2, souple: true },
  PU: { nom: 'Pull en laine', litres: 3, souple: true },
  PL: { nom: 'Plaid', litres: 4, souple: true },
  CO: { nom: 'Coussin', litres: 5, souple: true },
  BA: { nom: 'Baskets (dans leur boîte)', litres: 6, souple: false },
  BO: { nom: 'Bottines (dans leur boîte)', litres: 7, souple: false },
  VA: { nom: 'Vase en céramique', litres: 4, souple: false, fragile: true },
  LA: { nom: 'Lampe à poser', litres: 10, souple: false, fragile: true },
};

// Règle du site : on prend le PLUS PETIT format qui contient le volume utile ; volume utile = volume des articles + 2 L de calage par article fragile ;
// la pochette seulement si TOUS les articles sont souples. Taux de vide = (volume du format − volume des articles) ÷ volume du format × 100 (le calage
// est du vide).
export const volArticles = (cmd) => cmd.reduce((t, a) => t + ARTICLES[a].litres, 0);
export const volUtile = (cmd) => volArticles(cmd) + CALAGE * cmd.filter((a) => ARTICLES[a].fragile).length;
export function formatDe(cmd) {
  const souple = cmd.every((a) => ARTICLES[a].souple), v = volUtile(cmd);
  return FORMATS.find((f) => (f.id !== 'pochette' || souple) && f.litres >= v).id;
}
export const videDe = (cmd, f = formatDe(cmd)) => Math.round(((FORMAT[f].litres - volArticles(cmd)) / FORMAT[f].litres) * 10000) / 100;
export const avantDe = (cmd) => (FORMAT[AVANT].litres >= volUtile(cmd) ? AVANT : formatDe(cmd));
export function emballage(D) {
  const formats = Object.fromEntries(D.commandes.map(([id, c]) => [id, formatDe(c)]));
  const apres = D.commandes.reduce((t, [id]) => t + FORMAT[formats[id]].grammes, 0);
  const avant = D.commandes.reduce((t, [, c]) => t + FORMAT[avantDe(c)].grammes, 0);
  const vides = Object.fromEntries(D.commandes.map(([id, c]) => [id, videDe(c)]));
  return { formats, vides, apres, avant, gain: avant - apres };
}

// ─────────────────────────────────────────── les retours (CONSTRUITS) : la règle de tri
// etat : 'neuf' (étiquette attachée, emballage d'origine) → stock ; 'essaye' (sans étiquette, sans défaut) → reconditionnement (contrôle, repassage,
// nouvel emballage, puis revente) ; 'defaut' (petit défaut : tache légère, couture décousue) → don à une association ; 'hs' (hors d'usage : déchiré,
// brûlé) → recyclage (filière textile). Jamais de destruction. Taux de remise en vente = (stock + reconditionnement) ÷ retours × 100.
export const FILIERES = { stock: 'Remise en stock', recond: 'Reconditionnement', don: 'Don à une association', recyclage: 'Recyclage' };
const FILIERE_DE = { neuf: 'stock', essaye: 'recond', defaut: 'don', hs: 'recyclage' };
export const filiereDe = (etat) => FILIERE_DE[etat];
export function retours(D) {
  const filieres = Object.fromEntries(D.retours.map(([id, , etat]) => [id, filiereDe(etat)]));
  const vendus = D.retours.filter(([id]) => ['stock', 'recond'].includes(filieres[id])).length;
  return { filieres, vendus, taux: Math.round((vendus / D.retours.length) * 1000) / 10 };
}
// Ce qu'a fait le collègue d'ENT-17.4 : son tri, ses erreurs, son taux (il compte les dons comme des ventes).
export function travailDeJulien(D) {
  const R = retours(D);
  const faux = D.retours.map((x) => x[0]).filter((id) => D.triCollegue[id] !== R.filieres[id]);
  const n = D.retours.filter(([id]) => ['stock', 'recond', 'don'].includes(D.triCollegue[id])).length;
  return { faux, taux: Math.round((n / D.retours.length) * 1000) / 10 };
}

// ─────────────────────────────────────────── les jeux
// commandes : [n°, [articles]] ; vide : les commandes dont on demande le taux de vide.
// ENT-17.1 (guidage) : cinq commandes ; formats pochette, S, S, S, M ; vides de C-1702 (37,5 %) et C-1705 (31,25 %) ; 1 250 g → 730 g, gain 520 g.
export const D171 = {
  code: 'ENT-17.1', jour: 'lundi 2 novembre',
  commandes: [['C-1701', ['TS', 'RO']], ['C-1702', ['JE', 'PU']], ['C-1703', ['BA']], ['C-1704', ['PU', 'PL']], ['C-1705', ['LA', 'TS']]],
  vide: ['C-1702', 'C-1705'],
};
// ENT-17.2 (entraînement) : huit commandes ; deux fragiles (le calage fait monter le format : le vase seul en S, la lampe et le coussin en L) ;
// vides de C-1712 (50 %) et C-1717 (43,75 %) ; 2 150 g → 1 410 g, gain 740 g.
export const D172 = {
  code: 'ENT-17.2', jour: 'mardi 3 novembre',
  commandes: [['C-1711', ['RO', 'TS', 'TS']], ['C-1712', ['VA']], ['C-1713', ['JE', 'PL']], ['C-1714', ['BO', 'TS']], ['C-1715', ['LA', 'CO']],
    ['C-1716', ['PU', 'CO', 'PL']], ['C-1717', ['BA', 'JE', 'TS']], ['C-1718', ['TS']]],
  vide: ['C-1712', 'C-1717'],
};
// retours : [n°, article, état, ce que voit l'opérateur].
// ENT-17.3 (guidage) : huit retours ; stock 3, reconditionnement 2, don 2, recyclage 1 ; 5 ÷ 8 = 62,5 %.
export const D173 = {
  code: 'ENT-17.3', jour: 'jeudi 5 novembre',
  retours: [
    ['R-01', 'JE', 'neuf', 'Étiquette attachée, dans son sachet d’origine'],
    ['R-02', 'RO', 'essaye', 'Sans étiquette, propre, pliée par le client'],
    ['R-03', 'PU', 'defaut', 'Petite tache sur la manche'],
    ['R-04', 'TS', 'neuf', 'Étiquette attachée, jamais déplié'],
    ['R-05', 'JE', 'hs', 'Déchiré au genou, tissu usé'],
    ['R-06', 'PL', 'essaye', 'Sans étiquette, aucun défaut'],
    ['R-07', 'RO', 'neuf', 'Étiquette attachée, dans son sachet d’origine'],
    ['R-08', 'PU', 'defaut', 'Couture décousue sous le bras'],
  ],
};
// ENT-17.4 (erreur induite) : le tri de Julien (R-14 essayé mis en stock ; R-16 petite tache envoyée au recyclage), et son taux qui compte les dons :
// 8 ÷ 10 = 80 % ; le vrai : 7 ÷ 10 = 70 %.
export const D174 = {
  code: 'ENT-17.4', jour: 'lundi 9 novembre', collegue: 'Julien',
  retours: [
    ['R-11', 'TS', 'neuf', 'Étiquette attachée, dans son sachet d’origine'],
    ['R-12', 'JE', 'essaye', 'Sans étiquette, propre, plié'],
    ['R-13', 'RO', 'neuf', 'Étiquette attachée'],
    ['R-14', 'PU', 'essaye', 'Sans étiquette, aucun défaut, un peu froissé'],
    ['R-15', 'JE', 'hs', 'Brûlure de fer à repasser sur la jambe'],
    ['R-16', 'TS', 'defaut', 'Petite tache légère sur le devant'],
    ['R-17', 'PL', 'neuf', 'Étiquette attachée, dans sa housse'],
    ['R-18', 'RO', 'essaye', 'Sans étiquette, propre'],
    ['R-19', 'CO', 'defaut', 'Couture de la housse décousue'],
    ['R-20', 'PU', 'neuf', 'Étiquette attachée'],
  ],
  triCollegue: { 'R-11': 'stock', 'R-12': 'recond', 'R-13': 'stock', 'R-14': 'stock', 'R-15': 'recyclage', 'R-16': 'recyclage', 'R-17': 'stock',
    'R-18': 'recond', 'R-19': 'don', 'R-20': 'stock' },
};
// ENT-17.5 (évaluation) : jeu NEUF ; quatre commandes (pochette, S pour le vase, M, S) ; vide de C-1752 (50 %) ; 1 000 g → 580 g, gain 420 g ;
// six retours : stock 2, reconditionnement 2, don 1, recyclage 1 ; 4 ÷ 6 ≈ 66,7 %.
export const D175 = {
  code: 'ENT-17.5', jour: 'jeudi 12 novembre',
  commandes: [['C-1751', ['JE', 'TS']], ['C-1752', ['VA']], ['C-1753', ['BA', 'PU', 'TS']], ['C-1754', ['BO']]],
  vide: ['C-1752'],
  retours: [
    ['R-31', 'RO', 'essaye', 'Sans étiquette, propre'],
    ['R-32', 'JE', 'neuf', 'Étiquette attachée'],
    ['R-33', 'PU', 'hs', 'Troué aux coudes, laine feutrée'],
    ['R-34', 'TS', 'defaut', 'Petite tache au col'],
    ['R-35', 'PL', 'essaye', 'Sans étiquette, aucun défaut'],
    ['R-36', 'TS', 'neuf', 'Étiquette attachée, jamais déplié'],
  ],
};

export const nombreFr = (x) => String(Math.round(x * 100) / 100).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
