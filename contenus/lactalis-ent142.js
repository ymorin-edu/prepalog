// ENT-14.2 — Lactalis, « la règle du 15 février » : ENTRAÎNEMENT de C3.2 (assurer la traçabilité), 1re. Vendredi 22 décembre 2017 : l'avis du 21 décembre
// ne donne plus de liste, mais une RÈGLE (tout ce qui a été fabriqué à Craon depuis le 15 février 2017). L'élève lit la date de chaque lot reçu, trouve les
// lots visés, les magasins livrés, bloque ce qui reste et rend compte. Pièges : un lot fabriqué le 14 février (pas visé), un lot visé parti en entier.
// Univers et fabrique : `contenus/lactalis.js` ; données : `D142` de `contenus/lactalis-donnees.js` ; questions : `contenus/questions/ENT-14.2.js`.
//
// Poids (décidés par Claude, délégation de Tristan du 26/10/2026) : les lots 3 · les magasins 3 · les boîtes parties 1 · les boîtes encore chez nous 2 ·
// quatre lots à bloquer 1 chacun · aucun lot non visé bloqué 1 · le compte rendu 2 · questions au fil 4 = 20.

import { seance } from './lactalis.js';
import { D142 } from './lactalis-donnees.js';
import { QUESTIONS } from './questions/ENT-14.2.js';

export * from './lactalis.js';

const S = seance(D142, {
  id: 'lactalis-regle-15-fevrier',
  poids: { lots: 3, magasins: 3, partis: 1, restant: 2, bloque: 1, 'rien-de-trop': 1, 'compte-rendu': 2 },
  consigne: 'Nouvel avis du service qualité : la mesure est étendue. Il n’y a plus de liste de lots, il y a une règle : tout ce qui a été fabriqué à Craon depuis le '
    + '15 février 2017. Lis la date de fabrication de chaque lot qu’on a reçu (le numéro de lot la donne), et fais comme la dernière fois :\n\n'
    + '1. les lots visés passés chez nous ;\n2. les magasins livrés et les boîtes parties ;\n3. ce qui reste ici.\n\n'
    + 'Ouvre le relevé de traçabilité, puis bloque ce qui reste et réponds au service qualité. Ce soir, c’est Noël dans trois jours : rien ne doit rester en rayon.',
  poste: '<p>Ton travail aujourd’hui : l’avis ne donne plus de numéros, il donne une <b>règle de date</b>. Tu lis la date de fabrication dans chaque numéro de lot reçu, '
    + 'tu gardes ceux que la règle vise, puis tu fais le même chemin : <b>amont</b>, <b>aval</b>, <b>blocage</b>, <b>compte rendu</b>.</p>',
  questions: QUESTIONS,
});
export const { ID, FICHE_ID, PHRASES_ID, VOLET_ID, DOCUMENTS, FICHE, VOLET, ETAPES, PASTILLES, SUITE, ACCUEIL, OPTIONS } = S;
export const BILAN = S.B;
