// Contenu d'ESSAI du mode « palettier » de la vue Plan d'entrepôt (core/types/entrepot-palettier.js) — chantier E-7, lot 1,
// 21/10/2026. Ce n'est PAS une séance : il sert à la page `outils/essai-palettier.html` et au bloc de tests
// `outils/test/palettier.mjs`. Il imite ENT-8.11 (Action, Ensuès) : 5 palettes, 2 au sol, 2 à confier à Kevin, 1 dont l'adresse
// ferait dépasser la plaque de charge (à signaler, nouvelle adresse donnée par le système), et une 6e au confirmé (bonus).
//
// Réel : Action et ses catégories de produits (brief ENT-8.11 §6.2). Construit : le plan de l'allée, les plaques, le stock, les
// poids, les palettes, Samia et Kevin. Le stock se calcule (une règle fixe, aucun tirage) ; les niveaux où vont les palettes sont
// écrits À LA MAIN, pour que les tests sachent ce qui dépasse :
//   A1-T02-N3 (P5) : NET 28 ctn (389 kg) + CRO 30 ctn (400 kg) = 789 kg ; + P5 493 kg = 1 282 kg > 1 200 → à signaler (charge).
//   A1-T04-N2 (nouvelle adresse de P5) : CAH 20 ctn (205 kg) + SER 30 ctn (205 kg) = 410 kg ; + 493 = 903 ≤ 1 500.
//   A2-T02-N3 (P3, 205 kg) : CAH 30 (295) + BOI 50 (225) = 520 ; + 205 = 725 ≤ 1 200.
//   B1-T04-N2 (P4, 145 kg) : LES 24 (337) ; + 145 = 482 ≤ 1 500.     B2-T03-N4 (P6, 225 kg) : BOU 40 (145) ; + 225 = 370 ≤ 1 000.
//   A1-T03-N1 (P1) et B2-T02-N1 (P2) : au sol, pas de plaque.        B1-T01-N2-E1 : hors service.

import { catalogueSimple } from './entreprise-commun.js';
import { THEME } from './action.js';
import { etapesPalettier } from '../core/types/entrepot.js';

export const MENTION = 'Essai du moteur (palettier à adresse donnée). Réels : Action et ses catégories de produits. <b>Construits pour l’exercice</b> : '
  + 'le plan de l’allée, les plaques de charge, le stock, les poids, les palettes, Samia et Kevin.';

// Les produits (brief ENT-8.11 §6.2) : désignation générique, kg d'UN carton.
export const PRODUITS = {
  LES: { nom: 'Lessive liquide 3 L', court: 'Lessive', kg: 13 },
  NET: { nom: 'Nettoyant multi-usages 1 L', court: 'Nettoyant', kg: 13 },
  CRO: { nom: 'Croquettes pour chien 4 kg', court: 'Croquettes', kg: 12.5 },
  CAH: { nom: 'Cahiers grand format', court: 'Cahiers', kg: 9 },
  BOU: { nom: 'Bougies parfumées', court: 'Bougies', kg: 3 },
  BOI: { nom: 'Boîtes de rangement 10 L', court: 'Boîtes', kg: 4 },
  PEL: { nom: 'Peluches', court: 'Peluches', kg: 3 },
  SER: { nom: 'Serviettes de bain', court: 'Serviettes', kg: 6 },
};
const poids = (k, cartons) => Math.round(cartons * PRODUITS[k].kg + 25);
const lot = (k, cartons) => ({ produit: k, kg: poids(k, cartons) });

export const PLAN = {
  allees: [{ id: 'A', cotes: ['A1', 'A2'] }, { id: 'B', cotes: ['B1', 'B2'] }],
  // Plaques de charge (charge max d'UN niveau) ; le sol (N1) n'en a pas.
  cotes: Object.fromEntries(['A1', 'A2', 'B1', 'B2'].map((c) => [c, { charge: { 2: 1500, 3: 1200, 4: 1000 } }])),
  travees: 4, niveaux: 4, emplacements: 3,
  horsService: ['B1-T01-N2-E1'],
  zones: { quais: ['QUAI 2'] },
};

// Le stock de départ : une règle fixe remplit à peu près la moitié des emplacements, puis les niveaux des palettes sont écrits.
const CODES = Object.keys(PRODUITS);
const STOCK = {};
['A1', 'A2', 'B1', 'B2'].forEach((c, ci) => {
  for (let t = 1; t <= 4; t++) for (let n = 1; n <= 4; n++) for (let e = 1; e <= 3; e++) {
    const k = ci * 48 + t * 12 + n * 3 + e;
    if ((k * 7) % 11 < 5) STOCK[`${c}-T0${t}-N${n}-E${e}`] = lot(CODES[k % 8], 12 + (k * 5) % 13);
  }
});
const NIVEAUX_ECRITS = {
  'A1-T03-N1': [lot('CRO', 30), null, lot('NET', 24)],
  'B2-T02-N1': [lot('SER', 40), lot('BOU', 30), null],
  'A2-T02-N3': [null, lot('CAH', 30), lot('BOI', 50)],
  'B1-T04-N2': [lot('LES', 24), null, null],
  'A1-T02-N3': [lot('NET', 28), null, lot('CRO', 30)],
  'A1-T04-N2': [lot('CAH', 20), lot('SER', 30), null],
  'B2-T03-N4': [null, lot('BOU', 40), null],
};
Object.entries(NIVEAUX_ECRITS).forEach(([niv, L]) => L.forEach((s, i) => {
  const a = `${niv}-E${i + 1}`;
  if (s) STOCK[a] = s; else delete STOCK[a];
}));
delete STOCK['B1-T01-N2-E1'];   // hors service
export { STOCK };

// Les palettes du camion (kg : UN carton ; le poids de la palette est calculé par la vue : cartons × kg + 25).
export const PALETTES = [
  { id: 'P1', nom: 'Cahiers grand format', cartons: 30, kg: 9, adresse: 'A1-T03-N1-E2' },                 // 295 kg, sol
  { id: 'P2', nom: 'Serviettes de bain', cartons: 40, kg: 6, adresse: 'B2-T02-N1-E3' },                    // 265 kg, sol
  { id: 'P3', nom: 'Bougies parfumées', cartons: 60, kg: 3, adresse: 'A2-T02-N3-E1' },                     // 205 kg, Kevin
  { id: 'P4', nom: 'Peluches', cartons: 40, kg: 3, adresse: 'B1-T04-N2-E2' },                              // 145 kg, Kevin
  { id: 'P5', nom: 'Lessive liquide 3 L', cartons: 36, kg: 13, adresse: 'A1-T02-N3-E2', nouvelleAdresse: 'A1-T04-N2-E3' },  // 493 kg
  { id: 'P6', nom: 'Boîtes de rangement 10 L', cartons: 50, kg: 4, adresse: 'B2-T03-N4-E1', niveaux: ['confirme'] },         // 225 kg
];

export const REGLES = {
  titre: 'Les règles',
  lignes: [
    'L’<b>adresse</b> est sur l’étiquette de la palette : allée et côté, travée, niveau, emplacement.',
    '<b>Niveau 1 = le sol</b> (picking) : tu poses toi-même.',
    '<b>Au-dessus du sol</b> (réserve) : tu vérifies la plaque de charge, puis tu <b>confies</b> la palette à Kevin.',
    'Tu ne peux pas ranger à l’adresse (occupée, charge dépassée, emplacement abîmé) : tu <b>signales</b>.',
  ],
};

// La déclaration. `o` règle ce que la page d'essai fait varier : aideCharge, verdict, monte (la fonction du cariste).
export function palettier(o = {}) {
  const P = {
    id: 'essai-palettier', libelle: 'Plan de l’entrepôt', mode: 'palettier',
    personnage: { nom: 'Samia', role: 'cheffe d’équipe', date: 'mardi, 14 h',
      texte: 'Prends une palette, va à son adresse. Niveau 1 : tu poses. Plus haut : tu vérifies la plaque, puis tu confies à Kevin.' },
    plan: PLAN, produits: PRODUITS, stock: STOCK, palettes: PALETTES,
    cariste: { nom: 'Kevin', niveaux: [2, 3, 4], ...(o.monte ? { monte: o.monte } : {}) },
    regles: REGLES,
  };
  if (o.reglesOuvertes) P.regles = { ...REGLES, ouvertes: true };   // « Les règles ▾ » dépliées au chargement (guidage)
  if (o.aideCharge) P.aideCharge = o.aideCharge;
  if (o.verdict) P.verdict = o.verdict;
  // Lot 2 : `o.terminal` active le Terminal et le scan ; `o.scan: 'emplacement'` = un seul clic (l'emplacement confirme la palette).
  // Absent = le lot 1 tel quel (le bloc de tests `palettier` en dépend : aucun jalon `scan-`).
  if (o.terminal) P.terminal = { nom: 'Terminal', ...(o.scan === 'emplacement' ? { scan: 'emplacement' } : {}) };
  return P;
}
export const PALETTIER = palettier({ aideCharge: 'pose', verdict: 'critere' });
// Le même cas avec le Terminal (deux scans : la palette, puis l'emplacement) : celui de la page d'essai.
export const PALETTIER_SCAN = palettier({ aideCharge: 'pose', verdict: 'critere', terminal: true });

// Les poids des jalons du socle (somme 20, comme une séance d'entreprise : les jalons de P6 sont des bonus, sans poids).
export const POIDS = { 'place-P1': 3, 'place-P2': 3, 'place-P3': 3, 'place-P4': 3, 'signale-P5': 4, pasPoseHaut: 2, charge: 2 };
// Avec le Terminal (somme 20 aussi) : 4 × 2 (poser) + 3 (signaler P5) + 4 × 1,5 + 1 (scanner) + 1 + 1 (les deux gardes).
export const POIDS_SCAN = { 'place-P1': 2, 'place-P2': 2, 'place-P3': 2, 'place-P4': 2, 'signale-P5': 3,
  'scan-P1': 1.5, 'scan-P2': 1.5, 'scan-P3': 1.5, 'scan-P4': 1.5, 'scan-P5': 1, pasPoseHaut: 1, charge: 1 };

// L'univers d'essai : le vrai moteur d'entreprise, dans la charte d'Action. `entrepot` : une déclaration ou une fonction
// (graine, { niveau, copie }) ; `temps` : guidage, entraînement ou évaluation (copie) ; `poids: false` : des jalons sans poids
// (et sans bonus), pour une déclaration d'essai qui ajoute des palettes.
export function universPalettier({ temps = 'guidage', entrepot = PALETTIER, poids = true } = {}) {
  const copie = temps === 'evaluation';
  const etapes = etapesPalettier(entrepot, { copie });
  return {
    ENTREPRISE: { id: 'essai-palettier', nom: 'Action — essai du palettier', sousTitre: 'Entrepôt d’Ensuès-la-Redonne (13) — allées A et B', exercice: 'Essai du palettier à adresse donnée' },
    VOCAB: { unit: 'palette', unitPl: 'palettes', sizeLabel: '', sizeShort: '', configWord: '', icone: 'carton', mailDomain: 'essai.example' },
    CATALOGUE: catalogueSimple([{ ref: 'ESSAI', designation: 'Article d’essai' }]),
    SUPPLIERS: [], SUP_BY_ID: {}, CUSTOMERS: [], CM: {}, THEME,
    baseDeDepart: () => ({ v: 1, created: Date.now(), stock: {}, moves: [], mails: [], orders: [], receptions: [],
      customers: [], suppliers: [], seq: 1, _depart: [] }),
    etapes: poids ? etapes.map((e) => (e.bonus ? e : Object.assign(e, { poids: (etapes.some((x) => x.id === 'scan-P1') ? POIDS_SCAN : POIDS)[e.id] }))) : etapes.filter((e) => !e.bonus),
    exercice: 'Essai du palettier à adresse donnée',
    entrepot, copie, sansTrame: 'Tout à l’écran',
    menu: ['receptions', 'stock'],
  };
}
