// ENT-17.4 — La Redoute, « le tri de Julien » : ERREUR INDUITE de C3.3 (axes d’amélioration RSE), Terminale.
// Lundi 9 novembre : Julien a trié dix retours ; il a remis en stock un article essayé et envoyé au recyclage un article à petite tache, et son taux de remise en vente compte les dons comme des ventes ; l'élève trouve les erreurs et refait le taux.
// Univers et fabrique : `contenus/la-redoute.js` ; données : `D174` de `contenus/la-redoute-donnees.js` ; questions : `contenus/questions/ENT-17.4.js`.
//
// Poids (décidés par Claude, délégation de Tristan du 26/10/2026) : les erreurs de tri 5 · ce qui ne va pas dans son taux 3 · le vrai taux 4 · compte rendu 4 · questions au fil 4 = 20.

import { seance } from './la-redoute.js';
import { D174 } from './la-redoute-donnees.js';
import { QUESTIONS } from './questions/ENT-17.4.js';

export * from './la-redoute.js';

const S = seance(D174, {
  id: 'la-redoute-tri-julien',
  K: { ret: true },
  poids: { erreurs: 5, cause: 3, taux: 4, 'compte-rendu': 4 },
  titre: 'Le tri de Julien',
  objet: 'Le tri de Julien : vérifie avant le point RSE',
  consigne: 'Julien a trié les retours de ce matin et calculé le taux de remise en vente : sa fiche est jointe. Je le présente vendredi au point RSE, alors vérifie-la avec la règle de tri : quels retours sont dans la mauvaise filière, et son taux est-il juste ?\n\nOuvre la fiche de travail, puis écris-moi ton compte rendu.',
  poste: '<p>Ton travail aujourd’hui : vérifier le <b>tri des retours</b> fait par Julien, et son <b>taux de remise en vente</b>, avant qu’il soit présenté.</p>',
  etape: 'Les retours mal triés par Julien, ce qui ne va pas dans son taux, puis le vrai taux.',
  questions: QUESTIONS,
});
export const { ID, FICHE_ID, PHRASES_ID, VOLET_ID, DOCUMENTS, FICHE, VOLET, ETAPES, PASTILLES, SUITE, ACCUEIL, OPTIONS } = S;
