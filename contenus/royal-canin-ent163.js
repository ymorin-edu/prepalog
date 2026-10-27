// ENT-16.3 — Royal Canin, « implanter la zone de picking » : GUIDAGE de C2.2 (optimiser la préparation) et C3.1 (adapter le processus au produit), Terminale.
// Jeudi 3 décembre : six références à placer dans la zone de picking selon la règle du site (demande, puis poids), et les réappros par jour des deux canaux dynamiques ; un sac lourd peu demandé va en réserve.
// Univers et fabrique : `contenus/royal-canin.js` ; données : `D163` de `contenus/royal-canin-donnees.js` ; questions : `contenus/questions/ENT-16.3.js`.
//
// Poids (décidés par Claude, délégation de Tristan du 26/10/2026) : chaque référence dans sa zone 1,5 (× 6) · réappros de chaque canal 2 (× 2) · compte rendu 3 · questions au fil 4 = 20.

import { seance } from './royal-canin.js';
import { D163 } from './royal-canin-donnees.js';
import { QUESTIONS } from './questions/ENT-16.3.js';

export * from './royal-canin.js';

const S = seance(D163, {
  id: 'royal-canin-picking',
  K: { impl: true },
  poids: { zone: 1.5, reappro: 2, 'compte-rendu': 3 },
  titre: 'Implanter la zone de picking',
  objet: 'La zone de picking avant le pic',
  consigne: 'Avant le pic de décembre, on réorganise la zone de picking. Pour les six références du tableau joint, dis-moi où les prélever : canal dynamique, palette au sol ou réserve, avec la règle du site. Pour les deux références en canal, calcule combien de réappros par jour il faudra.\n\nOuvre la fiche de travail, puis écris-moi ton compte rendu.',
  poste: '<p>Ton travail aujourd’hui : choisir <b>où prélever</b> chaque référence, selon sa <b>demande</b> et son <b>poids</b>, et calculer les <b>réappros</b> des canaux dynamiques.</p>',
  etape: 'Pour chaque référence, la première ligne de la règle qui convient ; puis les réappros des deux canaux.',
  questions: QUESTIONS,
});
export const { ID, FICHE_ID, PHRASES_ID, VOLET_ID, DOCUMENTS, FICHE, VOLET, ETAPES, PASTILLES, SUITE, ACCUEIL, OPTIONS } = S;
