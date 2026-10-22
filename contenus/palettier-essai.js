// Contenu d'ESSAI du mode « palettier » de la vue Plan d'entrepôt (core/types/entrepot-palettier.js) — chantier E-7, lot 1,
// 21/10/2026 (et le comptage du lot 4, 22/10/2026 : `comptage()`, plus bas). Ce n'est PAS une séance : il sert à la page `outils/essai-palettier.html` et au bloc de tests
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
import { etapesPalettier, paletteCherchee } from '../core/types/entrepot.js';
import { apresGeste } from '../core/declencheurs.js';
import { siteDe } from './action-eval-sites.js';
import { hasard } from '../core/tirage.js';

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

// LOT 3 (22/10/2026, adresse prise / adresse libre) : une 8e palette P8, standard, dont l'adresse donnée est OCCUPÉE (A1-T03-N1-E1 : le
// stock de départ y a des croquettes, CRO 30 ctn) ; le système a une adresse libre à donner (A1-T01-N1-E2, au sol, libre dans le
// stock). Ajoutée par `palettier({ libre: true })` seulement : les 6 palettes du cas ordinaire ne changent pas.
//   « à côté » de l'adresse donnée : A1-T03-N1-E2 (libre, c'est l'adresse de P1) ; une autre adresse libre : A1-T01-N1-E3.
export const P8_LIBRE = { id: 'P8', nom: 'Bougies parfumées', cartons: 24, kg: 3, adresse: 'A1-T03-N1-E1', adresseLibre: 'A1-T01-N1-E2' };   // 97 kg, sol

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
    plan: PLAN, produits: PRODUITS, stock: STOCK, palettes: o.libre ? [...PALETTES, P8_LIBRE] : PALETTES,
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

// Avec P8 (adresse prise, lot 3 ; somme 20 aussi) : la palette P8 pèse comme une palette ordinaire.
export const POIDS_LIBRE = { 'place-P1': 3, 'place-P2': 3, 'place-P3': 3, 'place-P4': 3, 'signale-P5': 3, 'adresseLibre-P8': 3, pasPoseHaut: 1, charge: 1 };
export const POIDS_SCAN_LIBRE = { 'place-P1': 1.5, 'place-P2': 1.5, 'place-P3': 1.5, 'place-P4': 1.5, 'signale-P5': 2.5, 'adresseLibre-P8': 2.5,
  'scan-P1': 1.25, 'scan-P2': 1.25, 'scan-P3': 1.25, 'scan-P4': 1.25, 'scan-P5': 1, 'scan-P8': 1, pasPoseHaut: 1, charge: 1 };

// LE COMPTAGE (lot 4, 22/10/2026) : l'inventaire tournant à l'aveugle, au Terminal, en cartons (imite ENT-8.12). Même allée, même
// stock ; 6 adresses au sol, plus une 7e au confirmé. Écrites À LA MAIN (les tests en dépendent) :
//   1 A1-T03-N1-E2 Lessive 3 × 3 × 4 = 36 pleins, réel 33 (couche du dessus : 6 de 9), système 36 → MANQUE (cle 'manque')
//   2 A2-T02-N1-E2 Boîtes (stock) 2 × 4 × 4 = 32, réel 26 (dessus : 2 de 8), système 26 → conforme
//   3 A2-T04-N1-E3 Cahiers 2 × 3 × 5 = 30, réel 27 (dessus : 3 de 6), système 27 → conforme
//   4 B1-T02-N1-E2 Serviettes 2 × 4 × 4 = 32, réel 34 (2 cartons posés dessus), système 32 → SURPLUS (cle 'surplus')
//   5 B1-T04-N1-E1 Bougies (stock) 3 × 3 × 4 = 36, réel 31 (dessus : 4 de 9), système 31 → conforme
//   6 B2-T04-N1-E3 Peluches (stock) 3 × 3 × 5 = 45, réel 39 (dessus : 3 de 9), système 39 → conforme
//   7 B2-T03-N1-E2 Nettoyant 3 × 2 × 4 = 24, réel 20 (dessus : 2 de 6), système 23 → manque, au confirmé (cle 'bonus', jalons bonus)
// Les adresses absentes du stock (1, 3, 4, 7) sont occupées par la déclaration du comptage.
export const ADRESSES_COMPTAGE = [
  { adresse: 'A1-T03-N1-E2', produit: 'LES', systeme: 36, reel: 33, couche: [3, 3], couches: 4, cle: 'manque' },
  { adresse: 'A2-T02-N1-E2', produit: 'BOI', systeme: 26, reel: 26, couche: [2, 4], couches: 4 },
  { adresse: 'A2-T04-N1-E3', produit: 'CAH', systeme: 27, reel: 27, couche: [2, 3], couches: 5 },
  { adresse: 'B1-T02-N1-E2', produit: 'SER', systeme: 32, reel: 34, couche: [2, 4], couches: 4, cle: 'surplus' },
  { adresse: 'B1-T04-N1-E1', produit: 'BOU', systeme: 31, reel: 31, couche: [3, 3], couches: 4 },
  { adresse: 'B2-T04-N1-E3', produit: 'PEL', systeme: 39, reel: 39, couche: [3, 3], couches: 5 },
  { adresse: 'B2-T03-N1-E2', produit: 'NET', systeme: 23, reel: 20, couche: [3, 2], couches: 4, cle: 'bonus', niveaux: ['confirme'] },
];
export const REGLES_COMPTAGE = {
  titre: 'Compter une palette', entete: 'Compter une palette',
  lignes: [
    'Une <b>couche</b> = les cartons en largeur × les cartons en profondeur.',
    'Multiplie par le nombre de <b>couches pleines</b>, puis ajoute les cartons de la <b>couche du dessus</b>.',
    'Le Terminal dit que ça ne colle pas : <b>recompte</b>. Toujours pareil : <b>confirme</b>.',
  ],
};
// `o` : recompte ('ecart' | 'jamais'), aideCouche, verdict ('critere' | 'adresse').
export function comptage(o = {}) {
  const P = {
    id: 'essai-comptage', libelle: 'Plan de l’entrepôt', mode: 'palettier',
    personnage: { nom: 'Samia', role: 'cheffe d’équipe', date: 'mercredi, 6 h',
      texte: 'Ce matin, on compte les adresses de la liste. Tu ne vois pas ce que dit le système : tu comptes ce que tu vois.' },
    plan: PLAN, produits: PRODUITS, stock: STOCK,
    terminal: { nom: 'Terminal' },
    comptage: { adresses: ADRESSES_COMPTAGE, ...(o.recompte ? { recompte: o.recompte } : {}), ...(o.aideCouche ? { aideCouche: true } : {}) },
    regles: REGLES_COMPTAGE,
  };
  if (o.verdict) P.verdict = o.verdict;
  return P;
}
export const COMPTAGE = comptage({ verdict: 'critere' });
// Les poids du comptage d'essai (somme 20 ; les jalons de l'adresse 7 sont des bonus) : 6 comptes à 5/3, les deux recomptes à écart
// à 3, les quatre autres sans poids, scanAvant 4.
export const POIDS_COMPTAGE = { 'compte-1': 5 / 3, 'compte-2': 5 / 3, 'compte-3': 5 / 3, 'compte-4': 5 / 3, 'compte-5': 5 / 3, 'compte-6': 5 / 3,
  'recompte-manque': 3, 'recompte-2': 0, 'recompte-3': 0, 'recompte-surplus': 3, 'recompte-5': 0, 'recompte-6': 0, scanAvant: 4 };

// LE LENDEMAIN (lot 5, 22/10/2026) : imite ENT-8.13, « la palette d'à côté ». Le soir (jeudi, 20 h 30) : P1 au sol, adresse libre (un
// échauffement) ; P3, dont l'adresse donnée est OCCUPÉE par une palette « à évacuer cette nuit » (Kevin pousse : « Mets-la à côté »).
// Le même soir, Kevin pose sa palette P9 « à côté », sans scan. La nuit, les deux palettes « à évacuer » partent. Le lendemain (6 h),
// on cherche P3 si le système la croit ailleurs, sinon P9. Écrites À LA MAIN (les tests en dépendent) :
//   P1 Cahiers grand format 30 × 9 kg, adresse A1-T03-N1-E2 (libre) ;
//   P3 Bougies parfumées 24 × 3 kg, adresse A1-T02-N1-E3 (stock : Peluches, à évacuer), adresse libre A1-T01-N1-E2 ; « à côté » libre :
//     A1-T02-N1-E1 ; si elle reste en réception, Kevin la pose la nuit en A1-T02-N1-E2 (alleeVers) ;
//   P9 (Kevin) Peluches 40 × 3 kg, adresse B1-T03-N1-E2 (stock : Nettoyant, à évacuer), posée par Kevin en B1-T03-N1-E3 (libre).
//   `haut: true` : B1-T03-N1-E2 n'est PAS évacuée (toujours prise le matin) et P9 a une adresse libre au niveau 2, B1-T03-N2-E1 (Kevin).
export const LENDEMAIN_AD = { p1: 'A1-T03-N1-E2', p3: 'A1-T02-N1-E3', p3Libre: 'A1-T01-N1-E2', p3Cote: 'A1-T02-N1-E1', allee: 'A1-T02-N1-E2',
  p9: 'B1-T03-N1-E2', p9Posee: 'B1-T03-N1-E3', p9Libre: 'B1-T03-N2-E1' };
const A = LENDEMAIN_AD;
// `o` : verdict ('critere' | 'adresse'), haut (voir plus haut), monte (la fonction du cariste), trouveEn.
export function lendemain(o = {}) {
  const P = {
    id: 'essai-lendemain', libelle: 'Plan de l’entrepôt', mode: 'palettier',
    personnage: { nom: 'Samia', role: 'cheffe d’équipe', date: 'jeudi, 20 h 30', texte: 'Dernière demi-heure : deux palettes à ranger. Kevin est là pour la réserve.' },
    plan: PLAN, produits: PRODUITS, stock: STOCK,
    palettes: [
      { id: 'P1', nom: 'Cahiers grand format', cartons: 30, kg: 9, adresse: A.p1 },
      { id: 'P3', nom: 'Bougies parfumées', cartons: 24, kg: 3, adresse: A.p3, adresseLibre: A.p3Libre },
    ],
    cariste: { nom: 'Kevin', niveaux: [2, 3, 4], ...(o.monte ? { monte: o.monte } : {}) },
    terminal: { nom: 'Terminal' },
    phases: [{ id: 'soir' }, { id: 'lendemain', bouton: 'Le lendemain, 6 h', date: 'le lendemain, 6 h', consigne: 'Trouve la palette, puis remets-la en ordre au terminal.' }],
    lendemain: {
      kevin: { palette: { id: 'P9', nom: 'Peluches', cartons: 40, kg: 3, adresse: A.p9, ...(o.haut ? { adresseLibre: A.p9Libre } : {}) }, posee: A.p9Posee },
      nuit: { evacuees: o.haut ? [A.p3] : [A.p3, A.p9], alleeVers: A.allee },
      trouveEn: o.trouveEn || 4,
    },
    regles: REGLES,
  };
  if (o.verdict) P.verdict = o.verdict;
  return P;
}
export const LENDEMAIN = lendemain({ verdict: 'critere' });
// Poids d'essai (somme 20), à la manière d'ENT-8.13 : le bon geste face à Kevin 3, retrouver 3 + 1, remettre en ordre 2 + 3.
export const POIDS_LENDEMAIN = { 'place-P1': 2, 'scan-P1': 2, 'adresseLibre-P3': 3, 'scan-P3': 2, pasPoseHaut: 1, charge: 1,
  retrouvee: 3, trouveeVite: 1, 'transfert-place': 2, 'transfert-scan': 3 };
// L'état du SOIR déjà validé, pour aller droit au lendemain (page d'essai, réglage « Chemin ») : `scanne` = le bon geste (adresse libre
// demandée, P3 rangée là et scannée : on cherchera P9) ; `acote` = P3 posée à côté sans scan ; `allee` = P3 laissée en réception.
export function soirPrerempli(chemin) {
  const posees = { P1: A.p1 }, scan = { P1: A.p1 }, libres = {};
  if (chemin === 'scanne') { posees.P3 = A.p3Libre; scan.P3 = A.p3Libre; libres.P3 = A.p3Libre; }
  if (chemin === 'acote') posees.P3 = A.p3Cote;
  return { enMain: null, posees, confiees: {}, signalees: {}, nouvelles: {}, tentativesHaut: 0, valide: true, at: Date.now(), premierGeste: Date.now(),
    scan, scansRefuses: 0, libres, monteesValidation: [], phase: 'soir' };
}

// L'ÉVALUATION (lot 6, 22/10/2026) : imite ENT-8.14 (« mettre en stock dans un autre site »), en copie. UN entrepôt à deux phases
// (`rangement`, puis `comptage` derrière le bouton « Passer au comptage »), `rendCopie: false` (la copie se rend ailleurs : le bouton
// « Rendre ma copie » du moteur, hors de la vue) et UN PLAN PAR SITE : une fonction de la graine (celle de l'élève ; `siteDe` du module des
// sites des évaluations CAP d'Action, `contenus/action-eval-sites.js`, lu, jamais modifié) donne Onnaing (3 allées de 2 côtés, plaques
// N2 / N3 / N4 = 1 400 / 1 200 / 1 000 kg) ou Belleville-en-Beaujolais (2 allées de 2 côtés, 1 600 / 1 300 / 1 100 kg), 4 travées, 4 niveaux
// et 3 emplacements aux deux. Mêmes palettes et mêmes jalons aux deux sites (ids fixes) ; les adresses et le stock changent.
// CONSTRUIT (essai, pas une séance) : les deux plans, les plaques, les adresses, le stock, le cariste. Écrit À LA MAIN (le test le recopie) :
//   P1 « Cahiers grand format » 30 × 9 kg, au sol · P2 « Serviettes de bain » 40 × 6 kg, au sol · P3 « Bougies parfumées » 60 × 3 kg = 205 kg, en
//   réserve (N3, à confier) · P4 « Lessive liquide 3 L » 40 × 13 + 25 = 545 kg, à SIGNALER sans nouvelle adresse : son niveau N2 porte déjà
//   940 kg à Onnaing (CRO 40 ctn 525 + NET 30 ctn 415 ; 940 + 545 = 1 485 > 1 400) et 1 220 kg à Belleville (LES 50 ctn 675 + NET 40 ctn 545 ;
//   1 220 + 545 = 1 765 > 1 600) · P5 « Bougies parfumées » 24 × 3 kg, adresse donnée PRISE (au sol, croquettes), adresse libre au sol.
//   Onnaing (cariste Léo) : P1 C1-T03-N1-E2 · P2 B2-T02-N1-E3 · P3 A2-T02-N3-E1 · P4 A1-T02-N2-E2 · P5 A1-T03-N1-E1, libre A1-T01-N1-E2 ;
//   à compter B1-T02-N1-E2, C2-T02-N1-E1, C1-T04-N1-E3, B2-T04-N1-E2 (réel 26, 31, 27, 29).
//   Belleville (cariste Hugo) : P1 B1-T03-N1-E2 · P2 A2-T04-N1-E1 · P3 B2-T02-N3-E3 · P4 A1-T03-N2-E2 · P5 B1-T02-N1-E1, libre A2-T01-N1-E3 ;
//   à compter A1-T02-N1-E3, A2-T03-N1-E2, B2-T04-N1-E1, B1-T04-N1-E3 (réel 29, 38, 30, 26).
//   L'écart est au rang 2 : le système croit réel + 3 (il MANQUE) ou réel − 2 (SURPLUS), tiré par la graine (`sensEcartEval`).
const PLAQUES_EVAL = { onnaing: { 2: 1400, 3: 1200, 4: 1000 }, belleville: { 2: 1600, 3: 1300, 4: 1100 } };
const COTES_EVAL = { onnaing: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'], belleville: ['A1', 'A2', 'B1', 'B2'] };
export const SITES_EVAL = {
  onnaing: {
    cariste: 'Léo', p1: 'C1-T03-N1-E2', p2: 'B2-T02-N1-E3', p3: 'A2-T02-N3-E1', p4: 'A1-T02-N2-E2', p5: 'A1-T03-N1-E1', p5Libre: 'A1-T01-N1-E2',
    lots: { 'A1-T02-N2-E1': lot('CRO', 40), 'A1-T02-N2-E3': lot('NET', 30), 'A2-T02-N3-E2': lot('CAH', 30), 'A2-T02-N3-E3': null,
      'A1-T03-N1-E1': lot('CRO', 30), 'A1-T01-N1-E2': null },
    compter: [['B1-T02-N1-E2', 'LES', [2, 4], 4, 26], ['C2-T02-N1-E1', 'BOI', [3, 3], 4, 31], ['C1-T04-N1-E3', 'CAH', [2, 3], 5, 27], ['B2-T04-N1-E2', 'BOU', [3, 3], 4, 29]],
  },
  belleville: {
    cariste: 'Hugo', p1: 'B1-T03-N1-E2', p2: 'A2-T04-N1-E1', p3: 'B2-T02-N3-E3', p4: 'A1-T03-N2-E2', p5: 'B1-T02-N1-E1', p5Libre: 'A2-T01-N1-E3',
    lots: { 'A1-T03-N2-E1': lot('LES', 50), 'A1-T03-N2-E3': lot('NET', 40), 'B2-T02-N3-E1': lot('BOI', 40), 'B2-T02-N3-E2': null,
      'B1-T02-N1-E1': lot('CRO', 30), 'A2-T01-N1-E3': null },
    compter: [['A1-T02-N1-E3', 'SER', [2, 4], 4, 29], ['A2-T03-N1-E2', 'PEL', [3, 3], 5, 38], ['B2-T04-N1-E1', 'BOU', [3, 3], 4, 30], ['B1-T04-N1-E3', 'LES', [2, 3], 5, 26]],
  },
};
export const P4_EVAL = { id: 'P4', nom: 'Lessive liquide 3 L', cartons: 40, kg: 13 };
// Une graine (identifiant d'élève) qui tombe sur le site demandé : la première `u<n>` que `siteDe` y envoie (même fonction que les séances).
const GRAINES_SITES = {};
export function graineDeSite(site) {
  for (let i = 0; i < 200 && !GRAINES_SITES[site]; i++) { const s = siteDe(`u${i}`); if (!GRAINES_SITES[s]) GRAINES_SITES[s] = `u${i}`; }
  return GRAINES_SITES[site];
}
const stockEval = (site) => {
  const S = SITES_EVAL[site], st = {}, salt = site === 'onnaing' ? 3 : 5;
  COTES_EVAL[site].forEach((c, ci) => {
    for (let t = 1; t <= 4; t++) for (let n = 1; n <= 4; n++) for (let e = 1; e <= 3; e++) {
      const k = ci * 48 + t * 12 + n * 3 + e + salt;
      if ((k * 7) % 11 < 5) st[`${c}-T0${t}-N${n}-E${e}`] = lot(CODES[k % 8], 12 + (k * 5) % 13);
    }
  });
  Object.entries(S.lots).forEach(([a, x]) => { if (x) st[a] = x; else delete st[a]; });
  [S.p1, S.p2, S.p3, S.p4].forEach((a) => delete st[a]);
  S.compter.forEach(([a]) => delete st[a]);   // les adresses à compter sont occupées par le comptage lui-même
  return st;
};
const planEval = (site) => ({
  allees: site === 'onnaing' ? [{ id: 'A', cotes: ['A1', 'A2'] }, { id: 'B', cotes: ['B1', 'B2'] }, { id: 'C', cotes: ['C1', 'C2'] }]
    : [{ id: 'A', cotes: ['A1', 'A2'] }, { id: 'B', cotes: ['B1', 'B2'] }],
  cotes: Object.fromEntries(COTES_EVAL[site].map((c) => [c, { charge: PLAQUES_EVAL[site] }])),
  travees: 4, niveaux: 4, emplacements: 3, horsService: [], zones: { quais: ['QUAI 2'] },
});
// L'écart du comptage : le rang 2 de la liste, un manque ou un surplus tiré par la graine ; les trois autres adresses sont conformes.
export const RANG_ECART_EVAL = 2;
export const sensEcartEval = (graine) => (hasard(`${graine || ''}|ecart-evaluation`).reel() < 0.5 ? 'manque' : 'surplus');
// Rend la FONCTION `(graine, { copie }) => déclaration` d'une évaluation. `o.sansRendCopie` : la même sans `rendCopie: false` (l'ancien comportement).
export function evaluation(o = {}) {
  return (graine, { copie = true } = {}) => {
    const site = siteDe(graine), S = SITES_EVAL[site], sens = sensEcartEval(graine);
    const adresses = S.compter.map(([adresse, produit, couche, couches, reel], i) => {
      const x = { adresse, produit, couche, couches, reel, systeme: reel };
      if (i + 1 === RANG_ECART_EVAL) x.systeme = sens === 'manque' ? reel + 3 : reel - 2;
      return x;
    });
    const P = {
      id: 'essai-evaluation', libelle: 'Plan de l’entrepôt', mode: 'palettier',
      personnage: { nom: 'Samia', role: 'cheffe d’équipe', date: 'mardi, 6 h',
        texte: { evaluation: 'La réception d’hier est à ranger, puis quelques adresses à compter. Tu connais le travail.' } },
      plan: planEval(site), produits: PRODUITS, stock: stockEval(site),
      palettes: [
        { id: 'P1', nom: 'Cahiers grand format', cartons: 30, kg: 9, adresse: S.p1 },
        { id: 'P2', nom: 'Serviettes de bain', cartons: 40, kg: 6, adresse: S.p2 },
        { id: 'P3', nom: 'Bougies parfumées', cartons: 60, kg: 3, adresse: S.p3 },
        { ...P4_EVAL, adresse: S.p4, aSignaler: true },
        { id: 'P5', nom: 'Bougies parfumées', cartons: 24, kg: 3, adresse: S.p5, adresseLibre: S.p5Libre },
      ],
      cariste: { nom: S.cariste, niveaux: [2, 3, 4] },
      terminal: { nom: 'Terminal' },
      comptage: { adresses },
      phases: [{ id: 'rangement' }, { id: 'comptage', bouton: 'Passer au comptage', consigne: 'Compte les adresses de la liste « À compter », avec le Terminal.' }],
    };
    if (copie && !o.sansRendCopie) P.rendCopie = false;
    return P;
  };
}
export const EVALUATION = evaluation();
// Poids d'essai (somme 20) à la manière d'ENT-8.14 : ranger P1 à P3 (2 chacune), signaler P4 (3), l'adresse prise P5 (2), scanner (4 × 1), compter
// (4 × 0,75), une garde (1) et scanAvant (1) ; `charge` et les recomptes sans poids (le Terminal propose le recomptage : l'outil, rien de noté).
export const POIDS_EVAL = { 'place-P1': 2, 'place-P2': 2, 'place-P3': 2, 'signale-P4': 3, 'adresseLibre-P5': 2,
  'scan-P1': 1, 'scan-P2': 1, 'scan-P3': 1, 'scan-P5': 1, pasPoseHaut: 1, charge: 0,
  'compte-1': 0.75, 'compte-2': 0.75, 'compte-3': 0.75, 'compte-4': 0.75,
  'recompte-1': 0, 'recompte-2': 0, 'recompte-3': 0, 'recompte-4': 0, scanAvant: 1 };

// DES QUESTIONS AU FIL accrochées à des gestes de la vue (essai, 22/10/2026 : une question sur un geste qui ouvre la fenêtre « Message du système »
// ne doit s'ouvrir qu'APRÈS la fermeture de la fenêtre). `gestes` : les noms des gestes, une question par geste (q0, q1…), non notées.
export const questionsFil = (gestes, part = 4) => ({   // `part` : 20 moins le nombre de jalons sans poids (la somme des poids doit valoir 20)
  id: 'essai-palettier', part,
  personnes: { samia: { nom: 'Samia', role: 'cheffe d’équipe', appel: 'Samia', registre: 'tu' } },
  liste: gestes.map((g, i) => ({ id: `q${i}`, type: 'fil', de: 'samia', quand: apresGeste(g), poids: 1, groupe: 'Les questions de Samia',
    enonce: `Question ${i} ?`, choix: [{ v: 'a', lib: 'Oui' }, { v: 'b', lib: 'Non' }], juste: 'a', retour: 'Oui.' })),
});

// L'univers d'essai : le vrai moteur d'entreprise, dans la charte d'Action. `entrepot` : une déclaration ou une fonction
// (graine, { niveau, copie }) ; `temps` : guidage, entraînement ou évaluation (copie) ; `poids: false` : des jalons sans poids
// (et sans bonus), pour une déclaration d'essai qui ajoute des palettes. Lot 5 : `yanis` (son message arrive au passage au
// lendemain, sur l'adresse que croit le système : `paletteCherchee`), `suite` (la barre « Étape suivante » : deux étapes sur l'écran
// du plan, le soir puis le lendemain).
export function universPalettier({ temps = 'guidage', entrepot = PALETTIER, poids = true, kevinPousse = false, yanis = false, suite = false } = {}) {
  const copie = temps === 'evaluation';
  const etapes = etapesPalettier(entrepot, { copie });
  const idE = typeof entrepot === 'function' ? entrepot('', { niveau: 'standard', copie }).id : entrepot.id;
  const libre = typeof entrepot === 'function' ? null : (entrepot.palettes || []).find((p) => p.adresseLibre);
  const mail = (from, subject, text) => ({ folder: 'in', ts: Date.now(), from, fromMail: `${from.toLowerCase()}@essai.example`, to: 'Essai', subject, kind: 'text', text });
  const declencheurs = [
    // Lot 3 : Kevin écrit au premier « Occupé » sur la palette à adresse libre (ENT-8.13), sans rien proposer : c'est le geste de l'élève qui compte.
    ...(kevinPousse && libre ? [{ id: 'kevin-occupe', quand: apresGeste(`entrepot:${idE}:occupe:${libre.id}`),
      semer: () => ({ mails: [mail('Kevin', 'Elle est prise ?', 'Elle est prise ? Mets-la à côté, on verra demain. Il est tard. Kevin')] }) }] : []),
    // Lot 5 : Yanis, au passage au lendemain, sur l'adresse où le système envoie chercher la palette.
    ...(yanis ? [{ id: 'yanis', quand: apresGeste(`entrepot:${idE}:phase:lendemain`), semer: (prenom, db) => {
      const c = paletteCherchee(db, entrepot);
      return { mails: [mail('Yanis', 'C’est vide', `Bonjour ! Le terminal m’envoie en ${c ? c.adresseSysteme : '…'}. C’est vide. Je ne peux pas préparer le magasin. Tu peux regarder ? Yanis`)] };
    } }] : []),
  ];
  const valide = (db) => !!((db.entrepots || {})[idE] || {}).valide;
  const lValide = (db) => !!(((db.entrepots || {})[idE] || {}).lendemain || {}).valide;
  const cFini = (db) => !!(((db.entrepots || {})[idE] || {}).comptage || {}).fini;
  return {
    ENTREPRISE: { id: 'essai-palettier', nom: 'Action — essai du palettier', sousTitre: 'Entrepôt d’Ensuès-la-Redonne (13) — allées A et B', exercice: 'Essai du palettier à adresse donnée' },
    VOCAB: { unit: 'palette', unitPl: 'palettes', sizeLabel: '', sizeShort: '', configWord: '', icone: 'carton', mailDomain: 'essai.example' },
    CATALOGUE: catalogueSimple([{ ref: 'ESSAI', designation: 'Article d’essai' }]),
    SUPPLIERS: [], SUP_BY_ID: {}, CUSTOMERS: [], CM: {}, THEME,
    baseDeDepart: () => ({ v: 1, created: Date.now(), stock: {}, moves: [], mails: [], orders: [], receptions: [],
      customers: [], suppliers: [], seq: 1, _depart: [] }),
    etapes: poids ? etapes.map((e) => (e.bonus ? e : Object.assign(e, { poids: (etapes.some((x) => x.id === 'adresseLibre-P5') ? POIDS_EVAL
      : etapes.some((x) => x.id === 'retrouvee') ? POIDS_LENDEMAIN
      : etapes.some((x) => x.id === 'compte-1') ? POIDS_COMPTAGE
      : etapes.some((x) => x.id === 'adresseLibre-P8') ? (etapes.some((x) => x.id === 'scan-P1') ? POIDS_SCAN_LIBRE : POIDS_LIBRE)
      : etapes.some((x) => x.id === 'scan-P1') ? POIDS_SCAN : POIDS)[e.id] }))) : etapes.filter((e) => !e.bonus),
    exercice: 'Essai du palettier à adresse donnée',
    entrepot, copie, sansTrame: 'Tout à l’écran',
    menu: ['receptions', 'stock'],
    ...(declencheurs.length ? { volet: { id: 'volet-essai-kevin', semer: () => ({ mails: [] }), declencheurs } } : {}),
    ...(suite === 'evaluation' ? { suite: [{ vue: 'entrepot', libelle: 'Range les palettes', fait: valide },
      { vue: 'entrepot', libelle: 'Compte les adresses', fait: cFini }] }
      : suite ? { suite: [{ vue: 'entrepot', libelle: 'Fin de poste : range les palettes', fait: valide },
        { vue: 'entrepot', libelle: 'Le lendemain : retrouve la palette', fait: lValide }] } : {}),
  };
}
