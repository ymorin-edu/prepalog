// TAB-3 — génère `contenus/tab3-calculs-commerciaux.js` à partir des jeux de données
// ci-dessous.
//
// Pourquoi un générateur plutôt qu'un fichier écrit à la main : les corrigés sont des
// CALCULS sur les données des classeurs (un montant, une remise, un solde qui court de
// ligne en ligne). Recopier 150 valeurs à la main, c'est 150 occasions de se tromper, et
// surtout aucune garantie que le corrigé suive quand une donnée change. Ici, on change la
// donnée et on relance : les valeurs attendues suivent toutes seules.
//
//   node outils/tab3-exercices.mjs
//
// ⚠️ Les jeux de données ci-dessous doivent rester IDENTIQUES à ceux des classeurs de
// `contenus/tab3/`, qui viennent de la Suite Logistique (module C-3). Modifier un chiffre
// ici ne modifie pas le classeur que l'élève télécharge : il faudrait aussi le refaire.
// Pour changer un libellé, un objectif, un groupe ou un niveau, en revanche, tout est ici.
//
// Les constantes gardent les noms de la Suite (`CALCCOM_CAS1`…) pour que la comparaison
// avec le fichier d'origine reste faisable à l'œil. Les formules et les tolérances sont
// celles de ses fonctions `gradeExc1..10`, reprises sans arrondi intermédiaire : la Suite
// comparait au produit brut, et arrondir ici rendrait des corrigés très légèrement
// différents des siens pour les élèves qui ont déjà travaillé dessus.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const RACINE = fileURLToPath(new URL('..', import.meta.url));
const SORTIE = path.join(RACINE, 'contenus', 'tab3-calculs-commerciaux.js');
const DOSSIER_MODELES = path.join(RACINE, 'contenus', 'tab3');

const TOUS = ['2de', '1re', 'tle', 'cap'];

// ----------------------------------------------------------- jeux de données

// exc01 — [durée en jours, coût journalier]
const CALCCOM_CAS1 = [[3, 750], [4, 450], [14, 450], [2, 430], [9, 390], [8, 390], [5, 400]];

// exc02 — [index kilométrique, litres pris, prix du litre]. Index de départ : 12 200 km.
const CALCCOM_CAS2 = [[12605, 20, 1.35], [12990, 22, 1.35], [13345, 18, 1.35], [13670, 15, 1.3],
  [14200, 29, 1.3], [14366, 12, 1.22], [14700, 20, 1.38], [15109, 28, 1.38], [15490, 22, 1.35],
  [15900, 25, 1.35]];
const CAS2_KM_DEPART = 12200;

// exc03 — [quantité, prix unitaire, taux de remise de la ligne]
const CALCCOM_CAS3 = [[3, 220, 0.035], [10, 180, 0.05], [13, 10, 0.012], [25, 12, 0.04]];
const CAS3_REMISE_GLOBALE = 0.01;
const CAS3_TVA = 0.2;

// exc04 — [quantité, prix unitaire]
const CALCCOM_CAS4 = [[9, 12.39], [6, 10.59]];
const CAS4_REMISE = 0.08;
const CAS4_TVA = 0.2;

// exc05 — [prix d'achat, coefficient multiplicateur, taux de TVA]
const CALCCOM_CAS5 = [[41.4576, 1.2, 0.2], [32.748, 1.2, 0.2], [18.743, 1.2, 0.2],
  [9.4064, 1.2, 0.2], [73.8573, 1.2, 0.2], [41.1491, 1.4, 0.2], [23.8294, 1.4, 0.2],
  [77.0425, 1.4, 0.05], [118.8485, 1.4, 0.05], [23.8294, 1.4, 0.05], [17.3196, 1.4, 0.05],
  [3.8621, 2.1, 0.2]];

// exc06 — [quantité, prix unitaire]. TVA à 19,6 % : c'est l'ancien taux, volontairement
// conservé, l'exercice servant aussi à montrer qu'un taux se change à un seul endroit.
const CALCCOM_CAS6 = [[3, 24.5], [5, 60], [3, 24.5], [5, 33], [5, 49.5], [4, 24]];
const CAS6_REMISE = 0.05;
const CAS6_TVA = 0.196;

// exc07 — [prix d'achat, coefficient multiplicateur]. TVA unique à figer avec F4.
const CALCCOM_CAS7 = [[968.29, 1.4], [30.02, 1.5], [23.4, 2], [52.8, 1.8], [75.3, 1.5],
  [12.5, 2.3]];
const CAS7_TVA = 0.2;

// exc08 — un seul produit, décomposé poste par poste.
const CAS8 = {
  matieres: [3.27, 0.04, 0.64],            // B7  = total matières
  fabrication: { taux: 23.56, part: 0.28 }, // B14
  emballage: { taux: 20.42, part: 0.14 },   // B18
  marge: 1.45,                              // B27 = prix de revient × marge
  tva: 0.2,                                 // B31
};

// exc09 — [débit, crédit], ligne après ligne. Solde de départ : 1 600 €.
const CALCCOM_CAS9 = [[38, 0], [487, 0], [79, 0], [45, 0], [62, 0], [0, 152], [144, 0],
  [335, 0], [91, 0], [0, 68], [45, 0], [150, 0], [0, 19], [69, 0], [38, 0], [0, 7],
  [46, 0], [30, 0], [0, 1258]];
const CAS9_SOLDE_DEPART = 1600;

// exc10 — [stock initial, entrées, sorties, prix unitaire]
const CALCCOM_CAS10 = [[500, 500, 50, 1.2], [1500, 300, 100, 2.5], [2500, 700, 1200, 4.6],
  [500, 500, 50, 1.3], [1800, 400, 900, 2.5], [800, 200, 70, 4.2], [1200, 150, 80, 3.3],
  [1500, 300, 100, 2.1], [2500, 700, 1200, 5.2], [1800, 400, 900, 6]];

const somme = (l) => l.reduce((a, b) => a + b, 0);

// ------------------------------------------------------------ les corrigés
// Une fonction par exercice, qui rend la liste de ses contrôles. Chacune reproduit le
// calcul de la Suite, dans le même ordre et avec la même tolérance.

function exc01() {
  return CALCCOM_CAS1.flatMap(([jours, cout], i) => {
    const r = i + 2;
    return [
      { cellule: `E${r}`, libelle: `Durée en jours, ligne ${r}`, attendu: jours, tolerance: 0.01, formuleAttendue: true },
      { cellule: `G${r}`, libelle: `Coût du chantier, ligne ${r}`, attendu: jours * cout, tolerance: 0.5, formuleAttendue: true },
    ];
  });
}

function exc02() {
  let kmPrecedent = CAS2_KM_DEPART;
  return CALCCOM_CAS2.flatMap(([km, litres, prix], i) => {
    const r = i + 3;
    const distance = km - kmPrecedent;
    kmPrecedent = km;
    return [
      { cellule: `E${r}`, libelle: `Dépense en euros, ligne ${r}`, attendu: litres * prix, tolerance: 0.02, formuleAttendue: true },
      { cellule: `F${r}`, libelle: `Consommation aux 100 km, ligne ${r}`, attendu: (litres / distance) * 100, tolerance: 0.05, formuleAttendue: true },
    ];
  });
}

function exc03() {
  let totalNet = 0;
  const lignes = CALCCOM_CAS3.flatMap(([qte, pu, remise], i) => {
    const r = i + 2;
    const montant = qte * pu;
    const montantRemise = montant * remise;
    const net = montant - montantRemise;
    totalNet += net;
    return [
      { cellule: `D${r}`, libelle: `Montant brut, ligne ${r}`, attendu: montant, tolerance: 0.02, formuleAttendue: true },
      { cellule: `F${r}`, libelle: `Remise de la ligne ${r}`, attendu: montantRemise, tolerance: 0.02, formuleAttendue: true },
      { cellule: `G${r}`, libelle: `Montant net, ligne ${r}`, attendu: net, tolerance: 0.02, formuleAttendue: true },
    ];
  });
  const apresRemise = totalNet * (1 - CAS3_REMISE_GLOBALE);
  return [
    ...lignes,
    { cellule: 'B7', libelle: 'Total HT', attendu: totalNet, tolerance: 0.05, formuleAttendue: true },
    { cellule: 'B9', libelle: 'Total HT après remise globale', attendu: apresRemise, tolerance: 0.05, formuleAttendue: true },
    { cellule: 'B11', libelle: 'Total TTC', attendu: apresRemise * (1 + CAS3_TVA), tolerance: 0.05, formuleAttendue: true },
  ];
}

function exc04() {
  let total = 0;
  const lignes = CALCCOM_CAS4.map(([qte, pu], i) => {
    const r = i + 2;
    const montant = qte * pu;
    total += montant;
    return { cellule: `E${r}`, libelle: `Montant ligne ${r}`, attendu: montant, tolerance: 0.02, formuleAttendue: true };
  });
  const remise = total * CAS4_REMISE;
  return [
    ...lignes,
    { cellule: 'C5', libelle: 'Total HT', attendu: total, tolerance: 0.02, formuleAttendue: true },
    { cellule: 'C6', libelle: 'Remise de 8 %', attendu: remise, tolerance: 0.02, formuleAttendue: true },
    { cellule: 'C7', libelle: 'Total TTC', attendu: (total - remise) * (1 + CAS4_TVA), tolerance: 0.02, formuleAttendue: true },
  ];
}

function exc05() {
  return CALCCOM_CAS5.flatMap(([achat, coef, tva], i) => {
    const r = i + 2;
    const ht = achat * coef;
    return [
      { cellule: `D${r}`, libelle: `Prix de vente HT, ligne ${r}`, attendu: ht, tolerance: 0.02, formuleAttendue: true },
      { cellule: `F${r}`, libelle: `Prix de vente TTC, ligne ${r}`, attendu: ht * (1 + tva), tolerance: 0.02, formuleAttendue: true },
    ];
  });
}

function exc06() {
  let total = 0;
  const lignes = CALCCOM_CAS6.map(([qte, pu], i) => {
    const r = i + 2;
    const montant = qte * pu;
    total += montant;
    return { cellule: `E${r}`, libelle: `Montant ligne ${r}`, attendu: montant, tolerance: 0.02, formuleAttendue: true };
  });
  const remise = total * CAS6_REMISE;
  const totalHT = total - remise;
  const tva = totalHT * CAS6_TVA;
  return [
    ...lignes,
    { cellule: 'C9', libelle: 'Total brut', attendu: total, tolerance: 0.02, formuleAttendue: true },
    { cellule: 'C10', libelle: 'Remise globale de 5 %', attendu: remise, tolerance: 0.02, formuleAttendue: true },
    { cellule: 'C11', libelle: 'Total HT', attendu: totalHT, tolerance: 0.02, formuleAttendue: true },
    { cellule: 'C12', libelle: 'TVA à 19,6 %', attendu: tva, tolerance: 0.02, formuleAttendue: true },
    { cellule: 'C13', libelle: 'Net à payer', attendu: totalHT + tva, tolerance: 0.02, formuleAttendue: true },
  ];
}

function exc07() {
  return CALCCOM_CAS7.flatMap(([achat, coef], i) => {
    const r = i + 2;
    const ht = achat * coef;
    return [
      { cellule: `D${r}`, libelle: `Prix de vente HT, ligne ${r}`, attendu: ht, tolerance: 0.02, formuleAttendue: true },
      { cellule: `E${r}`, libelle: `Prix de vente TTC, ligne ${r}`, attendu: ht * (1 + CAS7_TVA), tolerance: 0.02, formuleAttendue: true },
    ];
  });
}

function exc08() {
  const matieres = somme(CAS8.matieres);
  const fabrication = CAS8.fabrication.taux * CAS8.fabrication.part;
  const emballage = CAS8.emballage.taux * CAS8.emballage.part;
  const mainOeuvre = fabrication + emballage;
  const revient = matieres + mainOeuvre;
  const venteHT = revient * CAS8.marge;
  const t = 0.02;
  return [
    { cellule: 'B7', libelle: 'Total des matières', attendu: matieres, tolerance: t, formuleAttendue: true },
    { cellule: 'B14', libelle: 'Coût de fabrication', attendu: fabrication, tolerance: t, formuleAttendue: true },
    { cellule: 'B18', libelle: "Coût d'emballage", attendu: emballage, tolerance: t, formuleAttendue: true },
    { cellule: 'B21', libelle: "Total main-d'œuvre", attendu: mainOeuvre, tolerance: t, formuleAttendue: true },
    { cellule: 'B23', libelle: 'Prix de revient', attendu: revient, tolerance: t, formuleAttendue: true },
    { cellule: 'B27', libelle: 'Prix de vente HT', attendu: venteHT, tolerance: t, formuleAttendue: true },
    { cellule: 'B31', libelle: 'Prix de vente TTC', attendu: venteHT * (1 + CAS8.tva), tolerance: t, formuleAttendue: true },
  ];
}

function exc09() {
  let solde = CAS9_SOLDE_DEPART;
  const lignes = CALCCOM_CAS9.map(([debit, credit], i) => {
    const r = i + 3;
    solde = solde - debit + credit;
    return { cellule: `D${r}`, libelle: `Solde après la ligne ${r}`, attendu: solde, tolerance: 0.02, formuleAttendue: true };
  });
  return [
    ...lignes,
    { cellule: 'B22', libelle: 'Total des débits', attendu: somme(CALCCOM_CAS9.map(([d]) => d)), tolerance: 0.02, formuleAttendue: true },
    { cellule: 'C22', libelle: 'Total des crédits', attendu: somme(CALCCOM_CAS9.map(([, c]) => c)), tolerance: 0.02, formuleAttendue: true },
  ];
}

function exc10() {
  let valeurTotale = 0;
  const lignes = CALCCOM_CAS10.flatMap(([initial, entrees, sorties, prix], i) => {
    const r = i + 2;
    const final = initial + entrees - sorties;
    const valeur = final * prix;
    valeurTotale += valeur;
    return [
      { cellule: `F${r}`, libelle: `Stock final, ligne ${r}`, attendu: final, tolerance: 0.02, formuleAttendue: true },
      { cellule: `H${r}`, libelle: `Valeur du stock, ligne ${r}`, attendu: valeur, tolerance: 0.05, formuleAttendue: true },
    ];
  });
  return [
    ...lignes,
    { cellule: 'H13', libelle: 'Valeur totale du stock', attendu: valeurTotale, tolerance: 0.1, formuleAttendue: true },
  ];
}

// -------------------------------------------------------------- les exercices
// Pas de champ `niveaux` : les calculs commerciaux servent de la Seconde au CAP, à des
// profondeurs différentes mais sur les mêmes mécanismes. L'enseignant ferme ce qu'il ne
// veut pas ouvrir dans « Conduite de séance ». Pour restreindre un cas plus tard, il
// suffit d'ajouter `niveaux: ['1re', 'tle']` sur sa ligne.

const EXERCICES = [
  {
    id: 'exc01', titre: '1 — Suivi de chantier', groupe: 'DURÉES ET COÛTS',
    objectif: 'Calculer une durée entre deux dates, puis un coût total.',
    fichier: 'exc01-suivi-chantier.xlsx', controles: exc01(),
  },
  {
    id: 'exc02', titre: "2 — Consommation d'essence", groupe: 'DURÉES ET COÛTS',
    objectif: 'Calculer une dépense et une consommation aux 100 km.',
    fichier: 'exc02-consommation-essence.xlsx', controles: exc02(),
  },
  {
    id: 'exc03', titre: '3 — Établir un devis', groupe: 'REMISE ET TVA',
    objectif: 'Calculer un devis complet : remise par ligne, montant net, remise globale, TVA.',
    fichier: 'exc03-devis.xlsx', controles: exc03(),
  },
  {
    id: 'exc04', titre: '4 — Bon de commande : remise et TVA', groupe: 'REMISE ET TVA',
    objectif: 'Calculer un montant de commande, une remise, puis le TTC.',
    fichier: 'exc04-bon-commande.xlsx', controles: exc04(),
  },
  {
    id: 'exc05', titre: '5 — Catalogue de prix : le coefficient', groupe: 'COEFFICIENT MULTIPLICATEUR',
    objectif: "Calculer un prix de vente à partir d'un coefficient multiplicateur.",
    fichier: 'exc05-catalogue-coefficient.xlsx', controles: exc05(),
  },
  {
    id: 'exc06', titre: '6 — Commande : remise globale et TVA à 19,6 %', groupe: 'REMISE ET TVA',
    objectif: 'Calculer un total, une remise globale, puis le net à payer.',
    fichier: 'exc06-commande-remise-globale.xlsx', controles: exc06(),
  },
  {
    id: 'exc07', titre: '7 — Catalogue : figer la TVA avec F4', groupe: 'COEFFICIENT MULTIPLICATEUR',
    objectif: 'Réutiliser le coefficient multiplicateur avec une TVA unique à figer.',
    fichier: 'exc07-catalogue-tva-figee.xlsx', controles: exc07(),
  },
  {
    id: 'exc08', titre: '8 — Du coût de revient au prix de vente', groupe: 'PRIX DE REVIENT',
    objectif: "Calculer, étape par étape, le prix de vente complet d'un produit.",
    fichier: 'exc08-prix-de-revient.xlsx', controles: exc08(),
  },
  {
    id: 'exc09', titre: '9 — Tenir un compte : le solde', groupe: 'COMPTE ET STOCK',
    objectif: 'Calculer un solde qui évolue ligne après ligne (débit, crédit).',
    fichier: 'exc09-solde-bancaire.xlsx', controles: exc09(),
  },
  {
    id: 'exc10', titre: '10 — Tenue des stocks', groupe: 'COMPTE ET STOCK',
    objectif: 'Calculer un stock final et sa valorisation.',
    fichier: 'exc10-tenue-stocks.xlsx', controles: exc10(),
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
    `    controles: [\n${e.controles.map(ecrireControle).join('\n')}\n    ],`,
    '  },',
  ].join('\n');
}

const total = EXERCICES.reduce((n, e) => n + e.controles.length, 0);

const entete = `// TAB-3 — Calculs commerciaux : les ${EXERCICES.length} cas et leurs corrigés.
//
// ⚠️ FICHIER GÉNÉRÉ — ne pas modifier à la main.
// Source : outils/tab3-exercices.mjs, à relancer après toute modification :
//     node outils/tab3-exercices.mjs
//
// Repris de la Suite Logistique (module C-3). ${total} contrôles sur ${EXERCICES.length} cas,
// tous corrigés automatiquement. Les classeurs modèles sont dans contenus/tab3/, l'onglet
// « Correction » de la Suite leur ayant été retiré (voir outils/modeles-sans-corrige.py).
//
// Les valeurs attendues portent toutes leurs décimales : la Suite comparait au produit
// brut, sans arrondi intermédiaire, et les tolérances (0,02 € sur un montant, 0,05 sur
// une consommation, 0,5 sur un coût de chantier) sont les siennes.

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
  console.error('classeur(s) introuvable(s) dans contenus/tab3/ : ' + manquants.join(', '));
  process.exit(1);
}
