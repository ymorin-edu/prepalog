// TAB-1 — génère `contenus/tab1-excel.js` à partir des jeux de données ci-dessous.
//
// Pourquoi un générateur plutôt qu'un fichier écrit à la main : les corrigés sont des
// CALCULS sur les données des classeurs (un montant, un total, un statut selon un seuil).
// Recopier 137 valeurs à la main, c'est 137 occasions de se tromper, et surtout aucune
// garantie que le corrigé suive quand une donnée change. Ici, on change la donnée et on
// relance : les valeurs attendues suivent toutes seules.
//
//   node outils/tab1-exercices.mjs
//
// ⚠️ Les jeux de données ci-dessous doivent rester IDENTIQUES à ceux des classeurs de
// `contenus/tab1/`, qui viennent de la Suite Logistique (module C-1). Modifier un chiffre
// ici ne modifie pas le classeur que l'élève télécharge : il faudrait aussi le refaire.
// Pour changer un libellé, un objectif ou un niveau, en revanche, tout est ici.
//
// Ce qui se modifie sans rien casser : `titre`, `objectif`, `groupe`, `niveaux`, l'ordre
// des exercices, et le retrait d'un exercice. Un exercice dont la liste `controles` est
// vide reste proposé mais ne compte pas dans le score — c'est le cas des étapes 9 et 10,
// que le lecteur de classeurs ne sait pas relire (mise en forme conditionnelle, graphique).

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const RACINE = fileURLToPath(new URL('..', import.meta.url));
const SORTIE = path.join(RACINE, 'contenus', 'tab1-excel.js');
const DOSSIER_MODELES = path.join(RACINE, 'contenus', 'tab1');

const TOUS = ['2de', '1re', 'tle', 'cap'];

// ----------------------------------------------------------- jeux de données
// Repris tels quels de la Suite Logistique : ce sont les valeurs imprimées dans les
// classeurs. Les noms de constantes sont les siens, pour que la comparaison reste facile.

const ET01_DESIGNATIONS = ['Carton de conserves', 'Lot de T-shirts', "Carton d'ampoules LED",
  'Caisse à outils', 'Ramettes de papier A4', "Pack de bouteilles d'eau", 'Casque de chantier',
  'Rouleau de film étirable', 'Gants de manutention', 'Palette bois', "Carton d'emballage",
  'Étiquettes code-barres'];

const ET02_DATA = [[3.50, 8], [4.20, 12], [2.80, 15], [1.60, 20], [0.90, 30], [6.50, 5]]; // [prix, quantité]

const ET03_VERTICAL = [[10, 3.50], [5, 12.00], [20, 1.80], [8, 6.25], [15, 4.40], [3, 25.00]]; // [quantité, prix]
const ET03_HT = [50, 80, 120, 200];
const ET03_TVA = 1.2;

const ET04_TRAJETS = [120, 55, 45, 250, 240, 160];   // distances en km
const ET04_PRIX_KM = 0.80;

const ET05_QTES = [14, 42, 8, 25, 31, 60];
const ET05_LIGNES = { total: 9, min: 10, max: 11 };

const ET06_QTES = [24, 10, 5, 18, 40, 12, 7, 15, 22, 6, 55, 9, 30, 3, 17];
const ET06_LIGNE_TOTAL = 18;
const ET06_LIGNE_MOYENNE = 19;

const ET07_DATA = [[25, 10], [4, 8], [18, 15], [3, 6], [12, 5]];   // [quantité, seuil]

const ET08_DATA = [[24, 10], [10, 15], [5, 8], [18, 5], [40, 20], [3, 10], [7, 5], [2, 6],
  [22, 10], [6, 8], [55, 25], [9, 15], [30, 20], [14, 14], [8, 9]]; // [quantité, seuil]

const ET11_DATA = [
  [24, 10, 1.20], [10, 15, 8.50], [5, 8, 14.90], [18, 5, 32.00], [40, 20, 4.30], [3, 10, 3.10],
  [7, 5, 11.00], [2, 6, 6.75], [22, 10, 2.40], [6, 8, 9.00], [55, 25, 0.85], [9, 15, 5.60],
  [30, 20, 2.20], [14, 14, 7.30], [8, 9, 19.90], [45, 15, 1.10], [12, 10, 6.40], [3, 5, 25.00],
  [60, 30, 0.95], [17, 12, 4.75]];  // [quantité, seuil, prix unitaire]
const ET11_LIGNE_TOTAL = 23;

const ET12_DATA = [
  ['NIM', '24', '015'], ['LYO', '23', '102'], ['MAR', '24', '047'], ['PAR', '22', '089'],
  ['LIL', '24', '003'], ['NIM', '23', '156'], ['MAR', '24', '012'], ['PAR', '24', '198'],
  ['LYO', '22', '067'], ['LIL', '23', '041'], ['NIM', '24', '229'], ['PAR', '23', '075']];

// `À commander` dès que la quantité passe SOUS le seuil — c'est la règle logistique, et
// c'est celle qu'énoncent les classeurs. Un `<=` ici changerait silencieusement 2 corrigés.
const statut = (qte, seuil) => (qte < seuil ? 'À commander' : 'OK');
const somme = (l) => l.reduce((a, b) => a + b, 0);
const arrondi = (n) => Math.round(n * 100) / 100;

// -------------------------------------------------------------- les exercices
const EXERCICES = [
  {
    id: 'et01', titre: '1 — Découvrir Excel et saisir des données', groupe: 'PREMIERS PAS',
    objectif: 'Se repérer dans une feuille et saisir des informations sans erreur.',
    fichier: 'et01-decouvrir-excel.xlsx',
    controles: ET01_DESIGNATIONS.map((d, i) => ({
      cellule: `B${i + 2}`, libelle: `Désignation ligne ${i + 2}`, attendu: d,
    })),
  },
  {
    id: 'et02', titre: '2 — Écrire sa première formule', groupe: 'FORMULES',
    objectif: "Comprendre ce qu'est une formule et utiliser une référence de cellule.",
    fichier: 'et02-premiere-formule.xlsx',
    controles: ET02_DATA.map(([prix, qte], i) => ({
      cellule: `E${i + 2}`, libelle: `Montant ligne ${i + 2}`,
      attendu: arrondi(prix * qte), tolerance: 0.02, formuleAttendue: true,
    })),
  },
  {
    id: 'et03', titre: '3 — Tirer une formule (la recopier)', groupe: 'FORMULES',
    objectif: 'Recopier une formule vers le bas et vers la droite sans la retaper.',
    fichier: 'et03-tirer-formule.xlsx',
    controles: [
      ...ET03_VERTICAL.map(([qte, prix], i) => ({
        cellule: `D${i + 3}`, libelle: `Montant ligne ${i + 3}`,
        attendu: arrondi(qte * prix), tolerance: 0.02, formuleAttendue: true,
      })),
      ...ET03_HT.map((ht, i) => ({
        cellule: `${String.fromCharCode(66 + i)}13`,
        libelle: `Prix TTC produit ${i + 1}`,
        attendu: arrondi(ht * ET03_TVA), tolerance: 0.02, formuleAttendue: true,
      })),
    ],
  },
  {
    id: 'et04', titre: '4 — Figer une cellule avec F4', groupe: 'FORMULES',
    objectif: "Empêcher une référence de bouger quand on recopie une formule.",
    fichier: 'et04-figer-cellule.xlsx',
    controles: ET04_TRAJETS.map((d, i) => ({
      cellule: `C${i + 7}`, libelle: `Coût du trajet ligne ${i + 7}`,
      attendu: arrondi(d * ET04_PRIX_KM), tolerance: 0.02, formuleAttendue: true,
    })),
  },
  {
    id: 'et05', titre: '5 — Comprendre et utiliser une plage', groupe: 'FORMULES',
    objectif: 'Découvrir la notion de plage (C2:C7) à travers SOMME, MIN et MAX.',
    fichier: 'et05-comprendre-plage.xlsx',
    controles: [
      { cellule: `C${ET05_LIGNES.total}`, libelle: 'Total des quantités', attendu: somme(ET05_QTES), formuleAttendue: true },
      { cellule: `C${ET05_LIGNES.min}`, libelle: 'Quantité minimale', attendu: Math.min(...ET05_QTES), formuleAttendue: true },
      { cellule: `C${ET05_LIGNES.max}`, libelle: 'Quantité maximale', attendu: Math.max(...ET05_QTES), formuleAttendue: true },
    ],
  },
  {
    id: 'et06', titre: '6 — Additionner et calculer une moyenne', groupe: 'FONCTIONS',
    objectif: 'Utiliser SOMME et MOYENNE sur des quantités en stock.',
    fichier: 'et06-somme-moyenne.xlsx',
    controles: [
      { cellule: `C${ET06_LIGNE_TOTAL}`, libelle: 'Total des quantités', attendu: somme(ET06_QTES), formuleAttendue: true },
      { cellule: `C${ET06_LIGNE_MOYENNE}`, libelle: 'Moyenne des quantités', attendu: arrondi(somme(ET06_QTES) / ET06_QTES.length), tolerance: 0.02, formuleAttendue: true },
    ],
  },
  {
    id: 'et07', titre: '7 — La fonction SI, premiers pas', groupe: 'FONCTIONS',
    objectif: 'Découvrir SI sur un cas simple à 5 lignes, une seule condition.',
    fichier: 'et07-si-premiers-pas.xlsx',
    // Une formule logique rend VRAI ou FAUX ; le moteur accepte le booléen comme le texte.
    controles: ET07_DATA.map(([qte, seuil], i) => ({
      cellule: `E${i + 7}`, libelle: `Faut-il commander ? ligne ${i + 7}`,
      attendu: qte < seuil, formuleAttendue: true,
    })),
  },
  {
    id: 'et08', titre: '8 — La fonction SI', groupe: 'FONCTIONS',
    objectif: "Faire prendre une décision automatique à Excel selon une condition.",
    fichier: 'et08-fonction-si.xlsx',
    controles: ET08_DATA.map(([qte, seuil], i) => ({
      cellule: `E${i + 2}`, libelle: `Statut ligne ${i + 2}`, attendu: statut(qte, seuil),
    })),
  },
  {
    id: 'et09', titre: '9 — Mise en forme conditionnelle', groupe: 'MISE EN FORME',
    objectif: 'Colorer automatiquement les lignes à recommander.',
    fichier: 'et09-mise-en-forme-conditionnelle.xlsx',
    controles: [],     // se vérifie en classe : la couleur conditionnelle n'est pas relisible
  },
  {
    id: 'et10', titre: '10 — Créer un graphique', groupe: 'MISE EN FORME',
    objectif: 'Représenter le stock sous forme de graphique en barres.',
    fichier: 'et10-graphique.xlsx',
    controles: [],     // se vérifie en classe : un graphique n'est pas relisible
  },
  {
    id: 'et11', titre: '11 — Cas concret : tableau de bord de stock', groupe: 'CAS COMPLET',
    objectif: 'Combiner toutes les compétences sur un cas complet de gestion de stock.',
    fichier: 'et11-tableau-de-bord.xlsx',
    controles: [
      ...ET11_DATA.flatMap(([qte, seuil, prix], i) => [
        { cellule: `F${i + 2}`, libelle: `Valeur du stock ligne ${i + 2}`, attendu: arrondi(qte * prix), tolerance: 0.05, formuleAttendue: true },
        { cellule: `G${i + 2}`, libelle: `Statut ligne ${i + 2}`, attendu: statut(qte, seuil) },
      ]),
      { cellule: `C${ET11_LIGNE_TOTAL}`, libelle: 'Total des quantités', attendu: somme(ET11_DATA.map((d) => d[0])), formuleAttendue: true },
      { cellule: `F${ET11_LIGNE_TOTAL}`, libelle: 'Valeur totale du stock', attendu: arrondi(somme(ET11_DATA.map(([q, , p]) => q * p))), tolerance: 0.1, formuleAttendue: true },
    ],
  },
  {
    id: 'et12', titre: "12 — Extraire une partie d'une référence", groupe: 'TEXTE',
    objectif: 'Découvrir GAUCHE et DROITE pour décoder une référence produit.',
    fichier: 'et12-gauche-droite.xlsx',
    controles: ET12_DATA.flatMap(([ent, , num], i) => [
      { cellule: `B${i + 2}`, libelle: `Code entrepôt ligne ${i + 2}`, attendu: ent },
      { cellule: `C${i + 2}`, libelle: `Numéro de séquence ligne ${i + 2}`, attendu: num },
    ]),
  },
  {
    id: 'et13', titre: '13 — Construire une référence avec CONCATENER', groupe: 'TEXTE',
    objectif: 'Assembler plusieurs informations séparées en une seule référence.',
    fichier: 'et13-concatener.xlsx',
    controles: ET12_DATA.map(([ent, an, num], i) => ({
      cellule: `D${i + 2}`, libelle: `Référence construite ligne ${i + 2}`,
      attendu: `${ent}-${an}-${num}`,
    })),
  },
];

// ------------------------------------------------------------------- écriture
const guillemets = (s) => JSON.stringify(s);

function ecrireControle(c) {
  const bouts = [`cellule: ${guillemets(c.cellule)}`, `libelle: ${guillemets(c.libelle)}`];
  bouts.push(`attendu: ${typeof c.attendu === 'string' ? guillemets(c.attendu) : String(c.attendu)}`);
  if (c.tolerance !== undefined) bouts.push(`tolerance: ${c.tolerance}`);
  if (c.formuleAttendue) bouts.push('formuleAttendue: true');
  return `    { ${bouts.join(', ')} },`;
}

function ecrireExercice(e) {
  return [
    '  {',
    `    id: ${guillemets(e.id)},`,
    `    titre: ${guillemets(e.titre)},`,
    `    groupe: ${guillemets(e.groupe)},`,
    `    objectif: ${guillemets(e.objectif)},`,
    `    niveaux: ${JSON.stringify(e.niveaux || TOUS)},`,
    `    fichier: ${guillemets(e.fichier)},`,
    e.controles.length
      ? `    controles: [\n${e.controles.map(ecrireControle).join('\n')}\n    ],`
      : '    // Pas de contrôle : se vérifie en classe, et ne compte pas dans le score.\n    controles: [],',
    '  },',
  ].join('\n');
}

const total = EXERCICES.reduce((n, e) => n + e.controles.length, 0);
const sansNote = EXERCICES.filter((e) => !e.controles.length).length;

const entete = `// TAB-1 — Apprendre Excel pas à pas : les ${EXERCICES.length} étapes et leurs corrigés.
//
// ⚠️ FICHIER GÉNÉRÉ — ne pas modifier à la main.
// Source : outils/tab1-exercices.mjs, à relancer après toute modification :
//     node outils/tab1-exercices.mjs
//
// Repris de la Suite Logistique (module C-1). ${total} contrôles répartis sur
// ${EXERCICES.length - sansNote} étapes corrigées automatiquement ; ${sansNote} étapes
// (mise en forme conditionnelle, graphique) se vérifient en classe et ne comptent pas
// dans le score. Les classeurs modèles sont dans contenus/tab1/, l'onglet « Correction »
// de la Suite leur ayant été retiré (voir outils/modeles-sans-corrige.py).
//
// Le champ \`niveaux\` est propre à chaque étape : un élève ne voit que celles de son
// niveau de classe. Modifier une ligne du générateur suffit à en déplacer une.

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
  console.error('classeur(s) introuvable(s) dans contenus/tab1/ : ' + manquants.join(', '));
  process.exit(1);
}
