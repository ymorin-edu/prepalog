// ENT-14.3 — Lactalis, « le lot oublié » : ERREUR INDUITE de C3.2 (assurer la traçabilité), 1re. Mercredi 27 décembre 2017 : Théo a traité l'avis du
// 21 décembre le 22 ; il a lu « depuis le 15 février » comme « après le 15 février » et oublié le lot fabriqué le 15. Ce lot est parti à Laval en octobre,
// et à Ernée le 26 décembre, APRÈS l'avis. L'élève contrôle le relevé, trouve l'oubli et sa cause, les magasins pas prévenus, bloque le reste et corrige.
// Univers et fabrique : `contenus/lactalis.js` ; données : `D143` de `contenus/lactalis-donnees.js` ; questions : `contenus/questions/ENT-14.3.js`.
//
// Poids (décidés par Claude, délégation de Tristan du 26/10/2026) : le lot oublié 4 · la cause 1 · les magasins pas prévenus 3 · le magasin livré après
// l'avis 2 · ce qui reste du lot 2 · le lot bloqué 2 · aucun autre lot bloqué 1 · le compte rendu 1 · questions au fil 4 = 20.

import { seance } from './lactalis.js';
import { D143 } from './lactalis-donnees.js';
import { QUESTIONS } from './questions/ENT-14.3.js';

export * from './lactalis.js';

const S = seance(D143, {
  id: 'lactalis-lot-oublie',
  poids: { oublies: 4, pourquoi: 1, magasins: 3, apres: 2, reste: 2, bloque: 2, 'rien-de-trop': 1, 'compte-rendu': 1 },
  consigne: 'Théo a traité l’avis du 21 décembre vendredi dernier, avant de partir en congé. Le service qualité a un doute : un lot aurait pu lui échapper. '
    + 'Contrôle son relevé (il est joint) contre l’avis et nos deux registres :\n\n1. y a-t-il un lot visé qu’il a oublié, et pourquoi ;\n'
    + '2. quels magasins ont reçu ce lot sans être prévenus, et lequel a été livré après l’avis ;\n3. ce qui reste de ce lot ici.\n\n'
    + 'Ouvre le contrôle du relevé. Ses blocages à lui sont faits : bloque seulement ce qu’il a oublié, puis réponds au service qualité.',
  poste: '<p>Ton travail aujourd’hui : <b>contrôler le travail d’un collègue</b>. Théo a fait le relevé de l’avis du 21 décembre ; tu compares son relevé à la règle '
    + 'et aux registres, tu trouves ce qui manque, tu le <b>bloques</b> et tu <b>corriges</b> le compte rendu.</p>',
  questions: QUESTIONS,
});
export const { ID, FICHE_ID, PHRASES_ID, VOLET_ID, DOCUMENTS, FICHE, VOLET, ETAPES, PASTILLES, SUITE, ACCUEIL, OPTIONS } = S;
export const BILAN = S.B;
export const THEO = S.T;
