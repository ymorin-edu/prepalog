// TAB-2 — génère `contenus/tab2-stocks.js` à partir des jeux de données ci-dessous.
//
// Pourquoi un générateur plutôt qu'un fichier écrit à la main : les corrigés sont des
// LECTURES et des CALCULS sur les données des classeurs (un prix retrouvé dans un catalogue,
// une valeur de stock, un statut selon des seuils, un total par catégorie). Recopier 151
// valeurs à la main, c'est 151 occasions de se tromper, et surtout aucune garantie que le
// corrigé suive quand une donnée change. Ici, on change la donnée et on relance : les valeurs
// attendues suivent toutes seules. Les textes attendus (désignation, catégorie, fournisseur,
// emplacement) sont lus dans le catalogue, pas dans une liste de réponses.
//
//   node outils/tab2-exercices.mjs
//
// ⚠️ Les jeux de données ci-dessous doivent rester IDENTIQUES à ceux des classeurs de
// `contenus/tab2/`, qui viennent de la Suite Logistique (module C-2, « gestion des stocks »).
// Modifier un chiffre ici ne modifie pas le classeur que l'élève télécharge : il faudrait
// aussi le refaire. Pour changer un libellé, un objectif ou un groupe, en revanche, tout est ici.
//
// Les constantes gardent les noms de la Suite (`EXS1_CATALOGUE`…) pour que la comparaison
// avec le fichier d'origine reste faisable à l'œil. Les formules et les tolérances sont
// celles de ses fonctions `gradeExs1..10`, reprises sans arrondi intermédiaire : la Suite
// comparait au produit brut (100 × 5,10 donne 509,99999999999994 en virgule flottante), et
// arrondir ici rendrait des corrigés très légèrement différents des siens.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const RACINE = fileURLToPath(new URL('..', import.meta.url));
const SORTIE = path.join(RACINE, 'contenus', 'tab2-stocks.js');
const DOSSIER_MODELES = path.join(RACINE, 'contenus', 'tab2');

// ----------------------------------------------------------- jeux de données
// exs1 — référence → prix. EXS1_ORDER : l'ordre des références dans le classeur (lignes 2 à 11).
const EXS1_CATALOGUE = { REF001: 12.50, REF002: 4.20, REF003: 45.00, REF004: 8.90, REF005: 6.50,
  REF006: 3.20, REF007: 89.00, REF008: 350.00, REF009: 15.80, REF010: 22.00, REF011: 9.90,
  REF012: 11.40, REF013: 7.60, REF014: 620.00, REF015: 65.00 };
const EXS1_ORDER = ['REF003', 'REF008', 'REF001', 'REF012', 'REF005', 'REF014', 'REF002',
  'REF010', 'REF007', 'REF013'];

// exs2 — référence → [désignation, catégorie, fournisseur]
const EXS2_CATALOGUE = {
  REF101: ['Palette Europe', 'Bois', 'FournisseurPalettes'],
  REF102: ['Carton simple cannelure', 'Emballage', 'CartonPlus'],
  REF103: ['Film étirable', 'Emballage', 'EmballagePro'],
  REF104: ['Casque de chantier', 'EPI', 'SecuEquip'],
  REF105: ['Gants de manutention', 'EPI', 'SecuEquip'],
  REF106: ['Transpalette manuel', 'Matériel', 'LogiMat'],
  REF107: ['Chariot élévateur électrique', 'Matériel', 'LogiMat'],
  REF108: ['Étiquette code-barres', 'Emballage', 'EmballagePro'],
  REF109: ['Chaussures de sécurité', 'EPI', 'SecuEquip'],
  REF110: ["Sangle d'arrimage", 'Accessoire', 'LogiMat'],
  REF111: ['Cadenas de sécurité', 'Accessoire', 'SecuEquip'],
  REF112: ['Extincteur portatif', 'Sécurité', 'SecuEquip'],
};
const EXS2_ORDER = ['REF109', 'REF103', 'REF107', 'REF102', 'REF111', 'REF105', 'REF110', 'REF112'];

// exs3 — référence → prix ; EXS3_QTES : la quantité de chaque ligne, dans l'ordre du classeur.
const EXS3_CATALOGUE = { REF201: 15.00, REF202: 8.50, REF203: 120.00, REF204: 3.40, REF205: 22.90,
  REF206: 60.00, REF207: 5.10, REF208: 200.00, REF209: 9.80, REF210: 45.50, REF211: 2.30,
  REF212: 75.00 };
const EXS3_ORDER = ['REF201', 'REF203', 'REF205', 'REF207', 'REF209', 'REF211', 'REF202',
  'REF204', 'REF206', 'REF208'];
const EXS3_QTES = [50, 4, 20, 100, 60, 300, 80, 150, 10, 3];

// exs4 — référence → prix. Trois références de la liste (REF399, REF320, REF350) n'existent
// pas dans le catalogue : c'est le cas que SIERREUR doit traiter.
const EXS4_CATALOGUE = { REF301: 10.00, REF302: 25.50, REF303: 8.00, REF304: 60.00, REF305: 15.20,
  REF306: 33.00, REF307: 5.50, REF308: 90.00, REF309: 12.75, REF310: 40.00 };
const EXS4_ORDER = ['REF301', 'REF399', 'REF303', 'REF304', 'REF320', 'REF306', 'REF307',
  'REF308', 'REF350', 'REF310'];
const EXS4_INCONNUE = 'Référence inconnue';

// exs5 — [quantité, seuil critique, seuil d'alerte]
const EXS5_DATA = [
  [5, 10, 20], [15, 10, 20], [30, 10, 20], [8, 5, 15], [3, 5, 15], [50, 20, 40],
  [20, 20, 40], [40, 20, 40], [12, 8, 18], [6, 8, 18], [100, 50, 80], [80, 50, 80],
];

// exs6 — [référence, catégorie, quantité]
const EXS6_DATA = [
  ['REF501', 'EPI', 40], ['REF502', 'EPI', 25], ['REF503', 'EPI', 60], ['REF504', 'EPI', 15],
  ['REF505', 'EPI', 30],
  ['REF506', 'Emballage', 200], ['REF507', 'Emballage', 150], ['REF508', 'Emballage', 80],
  ['REF509', 'Emballage', 300], ['REF510', 'Emballage', 120],
  ['REF511', 'Matériel', 5], ['REF512', 'Matériel', 3], ['REF513', 'Matériel', 8],
  ['REF514', 'Matériel', 2], ['REF515', 'Matériel', 4],
  ['REF516', 'Accessoire', 60], ['REF517', 'Accessoire', 45], ['REF518', 'Accessoire', 90],
  ['REF519', 'Accessoire', 35], ['REF520', 'Accessoire', 70],
];
const EXS6_CATS = ['EPI', 'Emballage', 'Matériel', 'Accessoire'];

// exs7 — [référence, fournisseur, valeur de stock]
const EXS7_DATA = [
  ['REF701', 'SecuEquip', 600], ['REF702', 'SecuEquip', 450], ['REF703', 'SecuEquip', 320],
  ['REF704', 'SecuEquip', 780], ['REF705', 'SecuEquip', 210], ['REF706', 'SecuEquip', 540],
  ['REF707', 'SecuEquip', 390],
  ['REF708', 'LogiMat', 1200], ['REF709', 'LogiMat', 850], ['REF710', 'LogiMat', 2200],
  ['REF711', 'LogiMat', 650], ['REF712', 'LogiMat', 980], ['REF713', 'LogiMat', 1500],
  ['REF714', 'LogiMat', 720],
  ['REF715', 'EmballagePro', 150], ['REF716', 'EmballagePro', 280], ['REF717', 'EmballagePro', 95],
  ['REF718', 'EmballagePro', 410], ['REF719', 'EmballagePro', 220], ['REF720', 'EmballagePro', 175],
  ['REF721', 'EmballagePro', 340],
];
const EXS7_FOURN = ['SecuEquip', 'LogiMat', 'EmballagePro'];

// exs8 — [référence, catégorie] : 5 EPI, 7 Emballage, 4 Matériel, 8 Accessoire, REF801 à REF824
const EXS8_CATS = ['EPI', 'Emballage', 'Matériel', 'Accessoire'];
const EXS8_EFFECTIFS = [5, 7, 4, 8];
const EXS8_DATA = EXS8_CATS.flatMap((cat, k) => Array(EXS8_EFFECTIFS[k]).fill(cat))
  .map((cat, i) => [`REF${800 + i + 1}`, cat]);

// exs9 — référence → emplacement de stockage
const EXS9_EMPLACEMENTS = { REF901: 'A01-01', REF902: 'A01-02', REF903: 'A02-01', REF904: 'A02-03',
  REF905: 'B01-01', REF906: 'B01-04', REF907: 'B02-02', REF908: 'C01-01', REF909: 'C01-03',
  REF910: 'C02-01', REF911: 'D01-01', REF912: 'D01-02' };
const EXS9_ORDER = ['REF905', 'REF901', 'REF910', 'REF903', 'REF912', 'REF907', 'REF902',
  'REF909', 'REF906', 'REF911'];

// exs10 — référence → [désignation, catégorie, prix] ; quantités et seuils ligne par ligne.
const EXS10_CATALOGUE = {
  REF401: ['Casque de chantier', 'EPI', 12.50], REF402: ['Gants de manutention', 'EPI', 4.20],
  REF403: ['Chaussures de sécurité', 'EPI', 45.00], REF404: ['Lunettes de protection', 'EPI', 6.50],
  REF405: ['Carton simple cannelure', 'Emballage', 1.80], REF406: ['Film étirable', 'Emballage', 15.80],
  REF407: ['Étiquette code-barres', 'Emballage', 9.90], REF408: ['Palette Europe', 'Emballage', 25.00],
  REF409: ['Transpalette manuel', 'Matériel', 350.00], REF410: ['Diable pliant', 'Matériel', 89.00],
  REF411: ["Sangle d'arrimage", 'Matériel', 11.40], REF412: ['Chariot de manutention', 'Matériel', 620.00],
};
const EXS10_ORDER = ['REF401', 'REF402', 'REF403', 'REF405', 'REF406', 'REF407', 'REF409',
  'REF410', 'REF411', 'REF412'];
const EXS10_QTES = [40, 15, 25, 200, 8, 50, 3, 12, 80, 2];
const EXS10_SEUILS = [20, 30, 10, 100, 15, 20, 5, 6, 40, 4];
const EXS10_CATS = ['EPI', 'Emballage', 'Matériel'];

// ------------------------------------------------------------ les corrigés
// Une fonction par exercice, qui rend la liste de ses contrôles. Chacune reproduit le
// calcul de la Suite, dans le même ordre et avec la même tolérance. Un texte attendu n'a pas
// de tolérance (comparaison indulgente sur la casse et les accents, faite par le lecteur).

function exs1() {
  return EXS1_ORDER.map((ref, i) => {
    const r = i + 2;
    return { cellule: `C${r}`, libelle: `Prix ligne ${r}`, attendu: EXS1_CATALOGUE[ref], tolerance: 0.02 };
  });
}

function exs2() {
  return EXS2_ORDER.flatMap((ref, i) => {
    const r = i + 2;
    const [designation, categorie, fournisseur] = EXS2_CATALOGUE[ref];
    return [
      { cellule: `B${r}`, libelle: `Désignation ${ref}`, attendu: designation },
      { cellule: `C${r}`, libelle: `Catégorie ${ref}`, attendu: categorie },
      { cellule: `D${r}`, libelle: `Fournisseur ${ref}`, attendu: fournisseur },
    ];
  });
}

function exs3() {
  let total = 0;
  const lignes = EXS3_ORDER.flatMap((ref, i) => {
    const r = i + 2;
    const prix = EXS3_CATALOGUE[ref];
    const valeur = EXS3_QTES[i] * prix;
    total += valeur;
    return [
      { cellule: `C${r}`, libelle: `Prix ${ref}`, attendu: prix, tolerance: 0.02 },
      { cellule: `D${r}`, libelle: `Valeur ${ref}`, attendu: valeur, tolerance: 0.05 },
    ];
  });
  return [...lignes, { cellule: 'D13', libelle: 'Total', attendu: total, tolerance: 0.1 }];
}

function exs4() {
  return EXS4_ORDER.map((ref, i) => {
    const r = i + 2;
    const connue = EXS4_CATALOGUE[ref] !== undefined;
    const c = { cellule: `C${r}`, libelle: `Ligne ${r}`, attendu: connue ? EXS4_CATALOGUE[ref] : EXS4_INCONNUE };
    if (connue) c.tolerance = 0.02;
    return c;
  });
}

function exs5() {
  return EXS5_DATA.map(([qte, critique, alerte], i) => {
    const r = i + 2;
    const statut = qte <= critique ? 'Urgent' : (qte <= alerte ? 'À commander' : 'OK');
    return { cellule: `F${r}`, libelle: `Statut ligne ${r}`, attendu: statut };
  });
}

function exs6() {
  const sommes = {};
  EXS6_DATA.forEach(([, cat, qte]) => { sommes[cat] = (sommes[cat] || 0) + qte; });
  return EXS6_CATS.map((cat, i) => (
    { cellule: `B${25 + i}`, libelle: `Total ${cat}`, attendu: sommes[cat], tolerance: 0.5 }));
}

function exs7() {
  const sommes = {};
  EXS7_DATA.forEach(([, fr, val]) => { sommes[fr] = (sommes[fr] || 0) + val; });
  return EXS7_FOURN.map((fr, i) => (
    { cellule: `B${26 + i}`, libelle: `Total ${fr}`, attendu: sommes[fr], tolerance: 0.5 }));
}

function exs8() {
  const nombres = {};
  EXS8_DATA.forEach(([, cat]) => { nombres[cat] = (nombres[cat] || 0) + 1; });
  return EXS8_CATS.map((cat, i) => (
    { cellule: `B${29 + i}`, libelle: `Nombre ${cat}`, attendu: nombres[cat], tolerance: 0.01 }));
}

function exs9() {
  return EXS9_ORDER.map((ref, i) => {
    const r = i + 2;
    return { cellule: `B${r}`, libelle: `Emplacement ${ref}`, attendu: EXS9_EMPLACEMENTS[ref] };
  });
}

function exs10() {
  const totaux = {};
  const lignes = EXS10_ORDER.flatMap((ref, i) => {
    const r = i + 2;
    const [designation, categorie, prix] = EXS10_CATALOGUE[ref];
    const valeur = EXS10_QTES[i] * prix;
    const statut = EXS10_QTES[i] < EXS10_SEUILS[i] ? 'À commander' : 'OK';
    totaux[categorie] = (totaux[categorie] || 0) + valeur;
    return [
      { cellule: `D${r}`, libelle: `Désignation ${ref}`, attendu: designation },
      { cellule: `E${r}`, libelle: `Catégorie ${ref}`, attendu: categorie },
      { cellule: `F${r}`, libelle: `Prix ${ref}`, attendu: prix, tolerance: 0.02 },
      { cellule: `G${r}`, libelle: `Valeur ${ref}`, attendu: valeur, tolerance: 0.05 },
      { cellule: `H${r}`, libelle: `Statut ${ref}`, attendu: statut },
    ];
  });
  return [
    ...lignes,
    ...EXS10_CATS.map((cat, i) => (
      { cellule: `B${15 + i}`, libelle: `Total ${cat}`, attendu: totaux[cat], tolerance: 0.1 })),
  ];
}

// -------------------------------------------------------------- les exercices
// Pas de champ `niveaux` : tous les niveaux voient les dix exercices (voir l'en-tête de
// activites/excel-stock.js). Pour en restreindre un, il suffit d'ajouter
// `niveaux: ['1re', 'tle']` sur sa ligne : l'écriture le reprendra.

const EXERCICES = [
  {
    id: 'exs1', titre: 'Retrouver un prix unitaire', groupe: 'RECHERCHEV',
    objectif: "Utiliser RECHERCHEV pour retrouver le prix d'un article à partir de sa référence.",
    fichier: 'exs1-recherchev-prix.xlsx', controles: exs1(),
  },
  {
    id: 'exs2', titre: 'Compléter une fiche produit', groupe: 'RECHERCHEV',
    objectif: 'Utiliser plusieurs RECHERCHEV pour retrouver désignation, catégorie et fournisseur.',
    fichier: 'exs2-recherchev-fiche-produit.xlsx', controles: exs2(),
  },
  {
    id: 'exs3', titre: 'Valoriser le stock', groupe: 'RECHERCHEV',
    objectif: "Combiner RECHERCHEV et un calcul pour valoriser le stock d'un produit.",
    fichier: 'exs3-recherchev-valorisation.xlsx', controles: exs3(),
  },
  {
    id: 'exs4', titre: 'Gérer les références inconnues', groupe: 'SIERREUR',
    objectif: 'Utiliser SIERREUR avec RECHERCHEV pour traiter les références absentes du catalogue.',
    fichier: 'exs4-sierreur-recherchev.xlsx', controles: exs4(),
  },
  {
    id: 'exs5', titre: 'Statut de réapprovisionnement', groupe: 'SI imbriqués',
    objectif: "Utiliser deux SI imbriqués pour classer un produit selon 3 niveaux d'urgence.",
    fichier: 'exs5-si-imbriques.xlsx', controles: exs5(),
  },
  {
    id: 'exs6', titre: 'Quantité totale par catégorie', groupe: 'TCD',
    objectif: 'Découvrir le tableau croisé dynamique pour regrouper des quantités par catégorie.',
    fichier: 'exs6-tcd-quantite-categorie.xlsx', controles: exs6(),
  },
  {
    id: 'exs7', titre: 'Valeur de stock par fournisseur', groupe: 'TCD',
    objectif: 'Utiliser un TCD pour connaître la valeur de stock immobilisée par fournisseur.',
    fichier: 'exs7-tcd-valeur-fournisseur.xlsx', controles: exs7(),
  },
  {
    id: 'exs8', titre: 'Compter les références par catégorie', groupe: 'TCD',
    objectif: "Utiliser un TCD en mode comptage plutôt qu'en mode somme.",
    fichier: 'exs8-tcd-comptage-categorie.xlsx', controles: exs8(),
  },
  {
    id: 'exs9', titre: 'Retrouver un emplacement de stockage', groupe: 'RECHERCHEV',
    objectif: "Réutiliser RECHERCHEV pour retrouver l'adresse de stockage d'un produit.",
    fichier: 'exs9-recherchev-emplacement.xlsx', controles: exs9(),
  },
  {
    id: 'exs10', titre: 'Tableau de bord de stock complet', groupe: 'Cas combiné',
    objectif: 'Combiner RECHERCHEV, calcul, SI et TCD sur un cas complet de gestion de stock.',
    fichier: 'exs10-cas-combine-tableau-de-bord.xlsx', controles: exs10(),
  },
];

// ------------------------------------------------------------------- écriture
const guillemets = (s) => JSON.stringify(s);

function ecrireControle(c) {
  const bouts = [`cellule: ${guillemets(c.cellule)}`, `libelle: ${guillemets(c.libelle)}`];
  bouts.push(`attendu: ${typeof c.attendu === 'string' ? guillemets(c.attendu) : String(c.attendu)}`);
  if (c.tolerance !== undefined) bouts.push(`tolerance: ${c.tolerance}`);
  return `    { ${bouts.join(', ')} },`;
}

function ecrireExercice(e) {
  return [
    '  {',
    `    id: ${guillemets(e.id)},`,
    `    titre: ${guillemets(e.titre)},`,
    `    groupe: ${guillemets(e.groupe)},`,
    `    objectif: ${guillemets(e.objectif)},`,
    ...(e.niveaux ? [`    niveaux: ${JSON.stringify(e.niveaux)},`] : []),
    `    fichier: ${guillemets(e.fichier)},`,
    `    controles: [\n${e.controles.map(ecrireControle).join('\n')}\n    ],`,
    '  },',
  ].join('\n');
}

const total = EXERCICES.reduce((n, e) => n + e.controles.length, 0);

const entete = `// TAB-2 — Excel, gestion des stocks : les ${EXERCICES.length} exercices et leurs corrigés.
//
// ⚠️ FICHIER GÉNÉRÉ — ne pas modifier à la main.
// Source : outils/tab2-exercices.mjs, à relancer après toute modification :
//     node outils/tab2-exercices.mjs
//
// Repris de la Suite Logistique (module C-2). ${total} contrôles sur ${EXERCICES.length} exercices,
// tous corrigés automatiquement. Les classeurs modèles sont dans contenus/tab2/, l'onglet
// « Correction » de la Suite leur ayant été retiré (voir outils/modeles-sans-corrige.py).
//
// Les valeurs attendues portent toutes leurs décimales : la Suite comparait au produit
// brut, sans arrondi intermédiaire, et les tolérances (0,02 sur un prix, 0,05 sur une valeur,
// 0,1 sur un total, 0,5 sur un total de TCD) sont les siennes.
//
// Le champ \`niveaux\` est propre à chaque exercice : absent, l'exercice est ouvert à tous les
// niveaux (c'est le cas des dix). Ajouter \`niveaux\` à l'exercice dans le générateur suffit à
// le restreindre.

export const EXERCICES = [
`;

const corps = EXERCICES.map(ecrireExercice).join('\n');
fs.writeFileSync(SORTIE, entete + corps + '\n];\n', 'utf8');

// Garde-fou : un exercice qui désigne un classeur absent ne se verrait qu'en séance.
const manquants = EXERCICES
  .filter((e) => !fs.existsSync(path.join(DOSSIER_MODELES, e.fichier)))
  .map((e) => e.fichier);

console.log(`${path.relative(RACINE, SORTIE)} écrit — ${EXERCICES.length} exercices, ${total} contrôles.`);
if (manquants.length) {
  console.error('classeur(s) introuvable(s) dans contenus/tab2/ : ' + manquants.join(', '));
  process.exit(1);
}
