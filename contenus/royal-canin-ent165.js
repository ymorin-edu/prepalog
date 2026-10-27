// ENT-16.5 — Royal Canin, « évaluation : piloter l’entrepôt » : ÉVALUATION de C1.6, C2.2 et C3.1, Terminale, copie rendue.
// Jeudi 1er avril 2027 : jeu NEUF, seul(e) ; les indicateurs de mars, l'implantation de deux références, une commande export avec exigence de DDM.
// Univers et fabrique : `contenus/royal-canin.js` ; données : `D165` de `contenus/royal-canin-donnees.js` ; questions : `contenus/questions/ENT-16.5.js`.
//
// Poids (décidés par Claude, délégation de Tristan du 26/10/2026) : rotation 1 · couverture 1 · risques de rupture 2 · surstocks 2 · taux de service 2 · chaque référence dans sa zone 1,5 (× 2) · lots choisis 2 · palettes par lot 2 · compte rendu 2 · « Avant de commencer » noté 3 = 20.

import { seance } from './royal-canin.js';
import { D165 } from './royal-canin-donnees.js';
import { QUESTIONS } from './questions/ENT-16.5.js';

export * from './royal-canin.js';

const S = seance(D165, {
  id: 'royal-canin-evaluation',
  K: { ind: true, impl: true, export: true },
  poids: { rotation: 1, couverture: 1, rupture: 2, surstock: 2, service: 2, zone: 1.5, lots: 2, quantites: 2, 'compte-rendu': 2 },
  titre: 'Évaluation : piloter l’entrepôt',
  objet: 'Le point d’avril : à toi seul(e)',
  consigne: 'Je suis en réunion toute la matinée. Tu t’occupes seul(e) du point d’avril : les indicateurs de mars (rotation et couverture de CT-STE-04, ruptures, surstocks, taux de service), la zone de deux références, et la commande export de cet après-midi.\n\nEnsuite, écris-moi ton compte rendu et rends ta copie : tu ne pourras plus rien modifier.',
  poste: '<p>Ton travail aujourd’hui : les trois gestes, <b>seul(e)</b>. C’est une <b>évaluation</b> : rien n’est corrigé avant que tu rendes ta copie.</p>',
  etape: 'Les indicateurs, puis la zone des deux références, puis la commande export.',
  questions: QUESTIONS,
});
export const { ID, FICHE_ID, PHRASES_ID, VOLET_ID, DOCUMENTS, FICHE, VOLET, ETAPES, PASTILLES, SUITE, ACCUEIL, OPTIONS } = S;
