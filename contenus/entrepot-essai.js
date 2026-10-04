// Contenu d'ESSAI de la vue « Plan d'entrepôt » (core/types/entrepot.js) — 04/10/2026.
//
// Le cas « rangement » de la maquette v2 validée par Tristan (`docs/briefs/plan-entrepot/`), données
// reprises TELLES QUELLES de `donnees-maquette.json` (stock de départ figé : 99 emplacements occupés,
// aucun générateur). Il sert à la page `outils/essai-entrepot.html` et au bloc de tests
// `outils/test/entrepot.mjs`. Les cas « comptage » et « préparation » viendront avec leurs lots.
//
// Vérifié : la plateforme de stockage de Smoby à Moirans-en-Montagne, les gammes (maisons, cuisines,
// véhicules, plein air), le CACES R489 cat. 5 pour le chariot à mât rétractable. Construit : le plan
// (allées, travées, charges, hors service), le stock, les poids, les références, la zone litiges.

export const MENTION = 'Essai du moteur. Réels : Smoby et ses gammes. <b>Construits pour l’exercice</b> : le plan '
  + 'de la zone, le stock, les poids, les références et les palettes.';

export const GAMMES = { MAT: 'Maisons et ateliers', CUI: 'Cuisines', VEH: 'Véhicules', PLA: 'Plein air' };

export const PRODUITS = {
  MAI: { nom: 'Maison Neo Jura Lodge', ref: 'SM-810405', gamme: 'MAT' },
  ETA: { nom: 'Établi Black+Decker', ref: 'SM-360701', gamme: 'MAT' },
  CUI: { nom: 'Cuisine Tefal', ref: 'SM-311054', gamme: 'CUI' },
  POR: { nom: 'Porteur Little Smoby', ref: 'SM-140501', gamme: 'VEH' },
  TRO: { nom: 'Trotteur Cotoons', ref: 'SM-110403', gamme: 'VEH' },
  TRI: { nom: 'Tricycle Be Fun', ref: 'SM-740327', gamme: 'VEH' },
  TOB: { nom: 'Toboggan XL', ref: 'SM-310261', gamme: 'PLA' },
  BAC: { nom: 'Bac à sable', ref: 'SM-310060', gamme: 'PLA' },
};

// Le plan de la zone : côtés A1 | allée A | A2 · B1 | allée B | B2, 4 travées × 3 niveaux × 3 emplacements.
export const PLAN = {
  allees: [{ id: 'A', cotes: ['A1', 'A2'] }, { id: 'B', cotes: ['B1', 'B2'] }],
  cotes: {
    A1: { gammes: ['MAT'], charge: { 1: 3000, 2: 1200, 3: 1200 } },
    A2: { gammes: ['PLA'], charge: { 1: 3000, 2: 800, 3: 800 } },
    B1: { gammes: ['VEH'], charge: { 1: 3000, 2: 1000, 3: 1000 } },
    B2: { gammes: ['CUI', 'MAT'], charge: { 1: 3000, 2: 800, 3: 800 }, note: 'ancien rack' },
  },
  travees: 4, niveaux: 3, emplacements: 3,
  horsService: ['A1-T02-N2-E2', 'A2-T02-N3-E2', 'B1-T04-N2-E3', 'B2-T03-N2-E1'],
  zones: { litiges: ['L1', 'L2'], bureau: 'chef de quai', quais: ['QUAI 1', 'QUAI 2', 'QUAI 3'] },
  // Le parcours de prélèvement, à sens unique : on monte l'allée A, on redescend l'allée B.
  parcours: { debut: 'A', fin: 'B' },
  // Rotation (sources : rackdestockage.eu, mecalux.fr) : A près des quais et en bas, C au fond.
  rotation: {
    A: { lib: 'rapide', travees: [1], niveaux: [1, 2], texte: 'T01, niveau N1 ou N2' },
    B: { lib: 'moyenne', travees: [2], niveaux: [1, 2, 3], texte: 'T02' },
    C: { lib: 'lente', travees: [3, 4], niveaux: [1, 2, 3], texte: 'T03 ou T04' },
  },
};

const S = (produit, kg) => ({ produit, kg });
// Le stock de départ, figé (donnees-maquette.json).
export const STOCK = {
  // A1
  'A1-T01-N1-E1': S('MAI', 420), 'A1-T01-N1-E2': S('MAI', 410), 'A1-T01-N2-E1': S('MAI', 430),
  'A1-T01-N2-E2': S('MAI', 410), 'A1-T01-N3-E1': S('MAI', 410), 'A1-T01-N3-E2': S('MAI', 410),
  'A1-T01-N3-E3': S('ETA', 290), 'A1-T02-N1-E1': S('ETA', 290), 'A1-T02-N1-E3': S('MAI', 400),
  'A1-T02-N2-E1': S('ETA', 300), 'A1-T02-N2-E3': S('MAI', 420), 'A1-T02-N3-E3': S('ETA', 310),
  'A1-T03-N1-E2': S('MAI', 410), 'A1-T03-N1-E3': S('ETA', 290), 'A1-T03-N2-E1': S('MAI', 420),
  'A1-T03-N2-E3': S('ETA', 300), 'A1-T04-N1-E1': S('ETA', 300), 'A1-T04-N1-E2': S('ETA', 290),
  'A1-T04-N1-E3': S('ETA', 290), 'A1-T04-N2-E1': S('MAI', 400), 'A1-T04-N2-E2': S('ETA', 280),
  'A1-T04-N2-E3': S('ETA', 300), 'A1-T04-N3-E1': S('ETA', 290), 'A1-T04-N3-E2': S('MAI', 420),
  // A2
  'A2-T01-N1-E1': S('TOB', 220), 'A2-T01-N1-E2': S('TOB', 220), 'A2-T01-N1-E3': S('TOB', 240),
  'A2-T01-N2-E2': S('BAC', 220), 'A2-T01-N2-E3': S('TOB', 250), 'A2-T01-N3-E2': S('TOB', 270),
  'A2-T01-N3-E3': S('TOB', 240), 'A2-T02-N1-E1': S('TOB', 230), 'A2-T02-N1-E2': S('BAC', 250),
  'A2-T02-N1-E3': S('BAC', 230), 'A2-T02-N2-E1': S('TOB', 250), 'A2-T02-N2-E2': S('TOB', 250),
  'A2-T02-N3-E1': S('BAC', 240), 'A2-T02-N3-E3': S('BAC', 240), 'A2-T03-N1-E1': S('BAC', 230),
  'A2-T03-N1-E2': S('TOB', 240), 'A2-T03-N1-E3': S('TOB', 250), 'A2-T03-N2-E1': S('TOB', 230),
  'A2-T03-N3-E2': S('BAC', 210), 'A2-T03-N3-E3': S('TOB', 230), 'A2-T04-N1-E1': S('BAC', 230),
  'A2-T04-N1-E2': S('BAC', 240), 'A2-T04-N1-E3': S('TOB', 250), 'A2-T04-N2-E1': S('BAC', 250),
  'A2-T04-N2-E3': S('TOB', 260), 'A2-T04-N3-E2': S('BAC', 230), 'A2-T04-N3-E3': S('TOB', 240),
  // B1
  'B1-T01-N1-E1': S('TRO', 130), 'B1-T01-N1-E2': S('POR', 170), 'B1-T01-N1-E3': S('POR', 170),
  'B1-T01-N2-E1': S('POR', 180), 'B1-T01-N2-E2': S('TRO', 150), 'B1-T01-N3-E1': S('TRO', 150),
  'B1-T01-N3-E2': S('TRO', 160), 'B1-T01-N3-E3': S('TRO', 150), 'B1-T02-N1-E1': S('TRO', 140),
  'B1-T02-N1-E2': S('POR', 190), 'B1-T02-N1-E3': S('TRI', 190), 'B1-T02-N2-E1': S('POR', 170),
  'B1-T02-N2-E2': S('TRO', 130), 'B1-T02-N3-E2': S('POR', 170), 'B1-T02-N3-E3': S('TRO', 150),
  'B1-T03-N1-E1': S('TRI', 220), 'B1-T03-N1-E2': S('TRO', 170), 'B1-T03-N1-E3': S('TRO', 150),
  'B1-T03-N2-E1': S('POR', 170), 'B1-T03-N2-E2': S('POR', 180), 'B1-T03-N2-E3': S('TRI', 190),
  'B1-T03-N3-E2': S('POR', 190), 'B1-T03-N3-E3': S('TRO', 140), 'B1-T04-N1-E1': S('TRI', 200),
  'B1-T04-N1-E3': S('TRO', 140), 'B1-T04-N2-E1': S('TRI', 200), 'B1-T04-N2-E2': S('TRO', 150),
  'B1-T04-N3-E1': S('TRO', 150), 'B1-T04-N3-E3': S('POR', 180),
  // B2
  'B2-T01-N1-E1': S('CUI', 280), 'B2-T01-N1-E2': S('MAI', 400), 'B2-T01-N2-E2': S('ETA', 280),
  'B2-T01-N3-E2': S('ETA', 290), 'B2-T02-N1-E1': S('CUI', 280), 'B2-T02-N2-E1': S('CUI', 290),
  'B2-T02-N2-E3': S('CUI', 270), 'B2-T02-N3-E1': S('ETA', 270), 'B2-T02-N3-E3': S('ETA', 250),
  'B2-T03-N1-E1': S('CUI', 300), 'B2-T03-N1-E2': S('CUI', 260), 'B2-T03-N2-E3': S('MAI', 380),
  'B2-T03-N3-E2': S('ETA', 290), 'B2-T04-N1-E1': S('ETA', 290), 'B2-T04-N1-E2': S('ETA', 270),
  'B2-T04-N1-E3': S('MAI', 410), 'B2-T04-N2-E2': S('CUI', 270), 'B2-T04-N2-E3': S('CUI', 280),
  'B2-T04-N3-E3': S('MAI', 390),
};

export const CRITERES = [
  { type: 'etat' }, { type: 'litige' }, { type: 'gamme' }, { type: 'parcours' }, { type: 'rotation' },
  { type: 'niveauInterdit', si: 'fragile', niveaux: [3] }, { type: 'charge' },
];

export const REGLES = {
  titre: 'Les règles',
  lignes: [
    '<b>Type de produit</b> : le côté de sa gamme (plan d’implantation).',
    '<b>Parcours</b> : un produit <b>lourd</b> en début de parcours (allée A), un produit <b>fragile</b> en fin de parcours (allée B) : à la préparation, le lourd fait la base de la palette, le fragile va en haut.',
    '<b>Produit fragile</b> : jamais au niveau N3.',
    '<b>Rotation</b> : A rapide → T01 (près des quais), N1 ou N2 · B moyenne → T02 · C lente → T03-T04, tous niveaux.',
    '<b>Poids</b> : la charge totale du niveau ne dépasse pas la plaque jaune.',
    'Un emplacement <b>libre</b> et <b>en service</b> ; une palette <b>en litige</b> va en zone litiges.',
  ],
  encadre: 'Monter aux niveaux 2 et 3 demande le chariot rétractable : il faut le <b>CACES 5</b>. Yanis l’a.',
};

// Les 4 palettes reçues d'Arinthod (ENT-5.4), avec leur fiche produit.
export const PALETTES = [
  { id: 'P1', produit: 'MAI', kg: 420, rotation: 'A', contrainte: 'lourd' },
  { id: 'P2', produit: 'CUI', kg: 270, rotation: 'B', contrainte: 'fragile' },
  { id: 'P3', produit: 'ETA', kg: 290, rotation: 'B', contrainte: 'lourd', reception: '1 carton écrasé', litige: true },
  { id: 'P4', produit: 'POR', kg: 180, rotation: 'C', reception: '2 cartons manquants' },
];

export const RANGEMENT = {
  id: 'essai-rangement',
  libelle: 'Plan de l’entrepôt',
  mode: 'rangement',
  personnage: {
    nom: 'Bruno', role: 'chef de quai', date: 'mer. 9 déc., 17 h',
    texte: {
      guidage: 'Yanis, on range les 4 palettes d’Arinthod. Suis la consigne écrite sur chaque palette.',
      entrainement: 'Yanis, range les 4 palettes d’Arinthod en appliquant les règles de l’entrepôt.',
      evaluation: 'Yanis, les 4 palettes d’Arinthod sont à ranger.',
    },
  },
  plan: PLAN, gammes: GAMMES, produits: PRODUITS, stock: STOCK,
  criteres: CRITERES, regles: REGLES, palettes: PALETTES,
};

export const CAS = { rangement: RANGEMENT };
