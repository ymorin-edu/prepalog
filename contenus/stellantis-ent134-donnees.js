// ENT-13.4 — Stellantis Sochaux, « ranger et compter selon ABC » : les DONNÉES de la séance (plan du magasin, tirage des sorties de la semaine 38, export, contrôles du dépôt,
// inventaire des références A en valeur). Importable sous Node. Brief : `docs/briefs/ENT-13.4-stellantis-ranger-compter-abc.md`. Séance : `contenus/stellantis-ent134.js`.
//
// Trois gestes : ranger quatre palettes selon leur classe de rotation (vue Plan d'entrepôt, mode rangement) ; classer les références sur leur VALEUR (sorties × prix unitaire)
// au tableur ; compter les références A en valeur (vue Inventaire, relevé de l'équipe) et traiter deux écarts selon leur cause.
// Chaque élève a SES sorties de la semaine 38 (valeurs tirées avec contrôle d'équité : voir `jeuSemaine38` dans `stellantis-abc.js`) ; les prix, le plan et les comptages sont fixes.

import { declarerTirage, hasard } from '../core/tirage.js';
import { REFS, N_STANDARD, refsDe, parRef } from './stellantis.js';
import { classer, jeuSemaine38, ecarts38, valeurDe } from './stellantis-abc.js';
import { resultatDepot } from '../core/types/export-tableur.js';

export const ID = 'stellantis-ranger-compter-abc';
export const ID_VOLET = 'abc-4';
export const ID_EXPORT = 'sorties38';
export const ID_DEPOT = 'abc38';
export const ID_PLAN = 'st-ent134-rangement';
export const ID_INV = 'INV-0916';
export const FICHIER = 'stellantis-sorties-semaine38.xlsx';
export const COLONNES = ['Référence', 'Désignation', 'Famille', 'Sorties', 'Prix unitaire'];

// ─────────────────────────────────────────────────────────────── le plan du magasin (mode rangement)
// Construit (dit dans la séance) : le plan, le stock, les poids. Quatre palettes arrivées cette nuit ; leur classe de rotation est celle que le logiciel a calculée la veille.
export const GAMMES = { PET: 'Petites pièces' };
export const PRODUITS = {
  VIS: { nom: 'Visserie', ref: 'VIS-M6', gamme: 'PET' },
  CLP: { nom: 'Clips de panneau de porte', ref: 'CLP-PAN', gamme: 'PET' },
  AGR: { nom: 'Agrafes de garniture', ref: 'AGR-PLA', gamme: 'PET' },
  JNT: { nom: 'Joints de porte', ref: 'JNT-POR', gamme: 'PET' },
  CAC: { nom: 'Caches de batterie', ref: 'CAC-BAT', gamme: 'PET' },
  POI: { nom: 'Poignées', ref: 'POI-EXT', gamme: 'PET' },
  AMP: { nom: 'Ampoules', ref: 'AMP-H7', gamme: 'PET' },
  FAS: { nom: 'Faisceaux', ref: 'FAS-PLA', gamme: 'PET' },
  RET: { nom: 'Rétroviseurs droits', ref: 'RET-DRO', gamme: 'PET' },
};
const COTES = ['A1', 'A2', 'B1', 'B2'];
// Les emplacements libres (tous les autres sont occupés) et hors service. Écrits à la main : la zone de chaque classe garde des places libres
// (A : travée 1, niveaux 1 et 2 ; B : travée 2 ; C : travées 3 et 4, dont le sol pour la caisse lourde).
export const LIBRES = [
  'A1-T01-N1-E3', 'A1-T01-N2-E3', 'A2-T01-N1-E3', 'A2-T01-N2-E1',
  'A1-T02-N1-E2', 'A2-T02-N2-E3', 'B1-T02-N3-E1', 'B2-T02-N1-E2',
  'A1-T03-N1-E3', 'A2-T04-N1-E2', 'B1-T03-N1-E1', 'B2-T04-N1-E3', 'B1-T04-N3-E2', 'A2-T03-N2-E2',
  'B1-T01-N3-E3', 'A1-T04-N3-E1', 'B2-T01-N2-E1',
];
export const HORS_SERVICE = ['A1-T01-N2-E2', 'B1-T02-N2-E2', 'A2-T03-N1-E2'];
// Le stock de départ : figé, fabriqué sans hasard (un produit et un poids de 140 à 230 kg qui ne dépendent que de l'adresse).
const CLES = Object.keys(PRODUITS);
export const STOCK = (() => {
  const S = {};
  let i = 0;
  COTES.forEach((c) => { for (let t = 1; t <= 4; t++) for (let n = 1; n <= 3; n++) for (let e = 1; e <= 3; e++) {
    const a = `${c}-T0${t}-N${n}-E${e}`;
    i++;
    if (LIBRES.includes(a) || HORS_SERVICE.includes(a)) continue;
    S[a] = { produit: CLES[(i * 5 + t) % CLES.length], kg: 140 + ((i * 7) % 10) * 10 };
  } });
  return S;
})();
export const PALETTES = [
  { id: 'P1', nom: 'Clips de panneau de porte', produit: 'CLP', kg: 220, rotation: 'A' },
  { id: 'P2', nom: 'Joints de porte', produit: 'JNT', kg: 260, rotation: 'B' },
  { id: 'P3', nom: 'Caches de batterie', produit: 'CAC', kg: 180, rotation: 'C' },
  { id: 'P4', nom: 'Rétroviseurs droits (caisses)', produit: 'RET', kg: 520, rotation: 'C', contrainte: 'lourd' },
];
export const REGLES = {
  titre: 'Les règles',
  lignes: [
    '<b>Rotation</b> : la classe de chaque palette est écrite sur sa fiche. <b>A</b> : au plus près des quais, entre le sol et l’épaule (niveaux 1 et 2) · <b>B</b> : à mi-chemin · <b>C</b> : au fond.',
    '<b>Produit lourd</b> : au sol (niveau 1) : on ne monte pas une palette lourde en hauteur.',
    '<b>Poids</b> : la charge totale d’un niveau ne dépasse pas sa plaque jaune.',
    'Un emplacement <b>libre</b> et <b>en service</b>.',
  ],
};
export const PLAN = {
  id: ID_PLAN,
  libelle: 'Plan du magasin',
  mode: 'rangement',
  personnage: { nom: 'Karim', role: 'chef d’équipe logistique', date: 'jeudi 16 sept., 6 h',
    texte: 'Quatre palettes sont arrivées cette nuit. Range-les dans le magasin des petites pièces : la classe de rotation de chacune est sur sa fiche.' },
  plan: {
    allees: [{ id: 'A', cotes: ['A1', 'A2'] }, { id: 'B', cotes: ['B1', 'B2'] }],
    cotes: Object.fromEntries(COTES.map((c) => [c, { gammes: [], charge: { 1: 3000, 2: 1000, 3: 800 } }])),
    travees: 4, niveaux: 3, emplacements: 3,
    horsService: HORS_SERVICE,
    zones: { bureau: 'chef d’équipe', quais: ['QUAI 1', 'QUAI 2'] },
    rotation: {
      A: { lib: 'rapide', travees: [1], niveaux: [1, 2], texte: 'T01, niveau N1 ou N2' },
      B: { lib: 'moyenne', travees: [2], niveaux: [1, 2, 3], texte: 'T02' },
      C: { lib: 'lente', travees: [3, 4], niveaux: [1, 2, 3], texte: 'T03 ou T04' },
    },
  },
  gammes: GAMMES, produits: PRODUITS, stock: STOCK, palettes: PALETTES,
  criteres: [{ type: 'etat' }, { type: 'rotation' }, { type: 'niveauInterdit', si: 'lourd', niveaux: [2, 3], nom: 'produit lourd' }, { type: 'charge' }],
  regles: REGLES,
};

// ─────────────────────────────────────────────────────────────── le tirage (les sorties de la semaine 38)
export const TIRAGE = declarerTirage({
  banques: {
    refs: { pieces: REFS.map((r) => ({ id: r.ref, titre: `${r.ref} — ${r.designation}` })), fixes: REFS.map((r) => r.ref), melange: {}, ordre: 'fixe' },
  },
  valeurs: (h) => ({ s: jeuSemaine38(h).map((x) => x.v) }),
  verifier: (jeu) => ecarts38(refsDe(N_STANDARD).map((r, i) => ({ ref: r.ref, v: jeu.valeurs.s[i] }))).map((e) => `semaine 38 : ${e}`),
  essais: 150,
});

// Les références de CET élève avec leurs sorties (toujours les 18 : pas de variante « confirmé » dans cette séance). Sans tirage rangé (corrigé de la page) : un jeu d'exemple.
export function sorties(db) {
  const V = TIRAGE.valeursTirees(db);
  const L = V && V.s;
  const valeurs = Array.isArray(L) && L.length === N_STANDARD ? L : jeuSemaine38(hasard('exemple-134')).map((x) => x.v);
  return refsDe(N_STANDARD).map((r, i) => ({ ...r, v: valeurs[i] }));
}
export const valeurLigne = (x) => valeurDe(x, x.v);
// Le classement sur la VALEUR : total, part, cumul, classe ; et celui sur les sorties (pour la question « vis A en sorties, C en valeur »).
export const calcul = (db) => classer(sorties(db).map((x) => ({ ref: x.ref, v: valeurLigne(x) })));
export const calculSorties = (db) => classer(sorties(db).map((x) => ({ ref: x.ref, v: x.v })));
export const lignesExport = (db) => sorties(db).map((r) => [r.ref, r.designation, r.famille, r.v, r.prix]);

// ─────────────────────────────────────────────────────────────── le dépôt
export const AIDE = 'SOMME(plage) — SI(test ; si vrai ; si faux) — la valeur d’une ligne, c’est ses sorties × son prix unitaire. Un pourcentage se met au format « % ». Une formule commence par = .';
const valeurDeLigne = (l) => (Number(l['Sorties']) || 0) * (Number(l['Prix unitaire']) || 0);

export function controles(db, propres = null) {
  const L = (propres || sorties(db).map((x) => ({ 'Référence': x.ref, 'Sorties': x.v, 'Prix unitaire': x.prix }))).filter((l) => l['Référence'] != null && String(l['Référence']).trim() !== '');
  const T = L.reduce((s, l) => s + valeurDeLigne(l), 0);
  // Part, cumul et classe se recalculent sur l'export que l'élève a réellement fait.
  const cl = classer(L.map((l) => ({ ref: l['Référence'], v: valeurDeLigne(l) })));
  const cle = ['Référence'];
  const filtre = (l) => l['Référence'] != null && String(l['Référence']).trim() !== '';
  return [
    { type: 'colonne', id: 'valeur', libelle: 'Colonne « Valeur » (formule : sorties × prix unitaire)', feuille: 'Sorties', titre: 'Valeur', cle, filtre,
      attendu: (l) => valeurDeLigne(l), formule: true },
    { type: 'table', id: 'total', libelle: 'Valeur totale (fonction SOMME, ligne « Total »)', feuille: 'Sorties',
      cle: 'Désignation', colonne: 'Valeur', attendu: { Total: T }, fonctions: ['SUM'] },
    { type: 'colonne', id: 'part', libelle: 'Colonne « Part » (au format pourcentage, sans ×100)', feuille: 'Sorties', titre: 'Part', cle, filtre,
      attendu: (l) => valeurDeLigne(l) / T, formule: true },
    { type: 'colonne', id: 'cumul', libelle: 'Colonne « Cumul » (liste triée par valeur décroissante)', feuille: 'Sorties', titre: 'Cumul', cle, filtre,
      attendu: (l) => cl.cumul[l['Référence']], formule: true },
    { type: 'colonne', id: 'classe', libelle: 'Colonne « Classe » (fonction SI)', feuille: 'Sorties', titre: 'Classe', cle, filtre,
      attendu: (l) => cl.classe[l['Référence']], fonctions: ['IF'] },
  ];
}

export const TABLEUR = {
  aide: AIDE,
  exports: [{
    id: ID_EXPORT, liste: 'Sorties de la semaine 38', fichier: FICHIER, indications: 1,
    feuilles: [{ nom: 'Sorties', colonnes: COLONNES, lignes: lignesExport }],
  }],
  depot: { id: ID_DEPOT, export: ID_EXPORT, libelle: 'Déposer mon fichier', retour: 'entrainement', controles },
};

const resultat = (db) => resultatDepot(db, ID_DEPOT);
export const depose = (db) => !!resultat(db).depose;
export const juste = (db, id) => { const c = resultat(db).controles[id]; return !!(c && c.ok); };

// ─────────────────────────────────────────────────────────────── l'inventaire : les références A en valeur
// Stock du logiciel et relevé de l'équipe, construits (fixes). Deux écarts : RET-DRO (une caisse de deux rétroviseurs droits posée à côté : on la remet en place) et FAS-HAB
// (une sortie non saisie la nuit : on régularise, motif « Sortie non saisie »). Les deux autres lignes sont justes.
export const MOTIFS = ['Casse', 'Sortie non saisie', 'Erreur de réception', 'Démarque inconnue'];
export const LIGNES_COMPTAGE = [
  { cle: 'RET-DRO', ref: 'RET-DRO', emplacement: parRef['RET-DRO'].emplacement, designation: 'Rétroviseur droit', systeme: 14, compte: 12, attendu: 'rayon',
    explication: 'Une caisse de 2 rétroviseurs droits a été reposée sur l’emplacement des gauches : on la remet en place, on ne touche pas au stock.' },
  { cle: 'RET-GAU', ref: 'RET-GAU', emplacement: parRef['RET-GAU'].emplacement, designation: 'Rétroviseur gauche', systeme: 9, compte: 9 },
  { cle: 'FAS-HAB', ref: 'FAS-HAB', emplacement: parRef['FAS-HAB'].emplacement, designation: 'Faisceau d’habitacle', systeme: 11, compte: 10, attendu: 'regul', motif: 'Sortie non saisie',
    explication: 'Un faisceau est parti à la ligne sans être scanné : il est vraiment sorti, on régularise −1, motif « Sortie non saisie ».' },
  { cle: 'POI-EXT', ref: 'POI-EXT', emplacement: parRef['POI-EXT'].emplacement, designation: 'Poignée extérieure de porte', systeme: 20, compte: 20 },
];
const questionRepondue = (db, id) => !!(db && db.questions && db.questions[ID] && db.questions[ID][id] && db.questions[ID][id].premiere);
export const INVENTAIRE = {
  id: ID_INV,
  libelle: 'Inventaire',
  titre: 'Inventaire tournant — références A en valeur',
  sousTitre: 'jeudi 16 septembre · 4 lignes',
  source: 'releve',
  ecarts: 'eleve',
  correction: 'aucune',
  taux: false,
  actions: ['regul', 'rayon'],
  libelles: { regul: 'Régulariser le stock du logiciel', rayon: 'Remettre en place' },
  motifs: MOTIFS,
  conseil: '<b>Avant de corriger.</b> Un écart est un signal : cherche d’abord <b>pourquoi</b> (une caisse ailleurs ? une sortie non saisie ?). On ne corrige le stock que si la pièce a vraiment disparu.',
  attentePerimetre: 'Réponds d’abord à la question de Karim : quelles références comptes-tu cette semaine ? L’inventaire s’ouvrira ensuite.',
  // Le périmètre est celui du BON classement (contenu fixe) : un classement faux ne change pas les lignes à compter (la question est notée seule).
  perimetre: (db) => (questionRepondue(db, 'quoi-compter') ? LIGNES_COMPTAGE.map((l) => l.cle) : null),
  lignes: LIGNES_COMPTAGE,
};
