// ENT-14.1 — Lactalis, « douze lots rappelés » : GUIDAGE de C3.2 (assurer la traçabilité), 1re. Lundi 4 décembre 2017 : l'avis du 2 décembre donne une liste
// de douze lots ; l'élève cherche lesquels sont passés par la plateforme (amont), dans quels magasins ils sont partis (aval), bloque ce qui reste et rend compte.
// Univers et fabrique : `contenus/lactalis.js` ; données : `D141` de `contenus/lactalis-donnees.js` ; questions : `contenus/questions/ENT-14.1.js`.
//
// Poids (décidés par Claude, délégation de Tristan du 26/10/2026) : les lots 3 · les magasins 3 · les boîtes parties 1 · les boîtes encore chez nous 2 ·
// deux lots à bloquer 2 chacun · aucun lot non visé bloqué 1 · le compte rendu 2 · questions au fil 4 = 20. Rien n'est vrai avant l'envoi de la fiche
// ou du compte rendu ; « aucun lot non visé bloqué » exige au moins un blocage.

import { seance } from './lactalis.js';
import { D141 } from './lactalis-donnees.js';
import { QUESTIONS } from './questions/ENT-14.1.js';

export * from './lactalis.js';

const S = seance(D141, {
  id: 'lactalis-douze-lots',
  poids: { lots: 3, magasins: 3, partis: 1, restant: 2, bloque: 2, 'rien-de-trop': 1, 'compte-rendu': 2 },
  consigne: 'Le service qualité de l’enseigne nous a transmis un avis de retrait-rappel : douze lots de laits infantiles fabriqués à Craon sont rappelés. '
    + 'Je veux savoir aujourd’hui :\n\n1. lesquels de ces lots sont passés chez nous (le registre des réceptions) ;\n'
    + '2. dans quels magasins ils sont partis, et combien de boîtes (le registre des expéditions) ;\n3. combien de boîtes il en reste ici.\n\n'
    + 'Ouvre le relevé de traçabilité. Ensuite, bloque ce qui reste, lot par lot, dans « Blocage qualité », et réponds au service qualité.',
  poste: '<p>Ton travail aujourd’hui : un <b>avis de rappel</b> donne douze numéros de lot. Tu cherches ceux qui sont <b>entrés</b> chez nous, puis où ils sont <b>sortis</b>, '
    + 'tu <b>bloques</b> ce qui reste et tu <b>rends compte</b>.</p>',
  questions: QUESTIONS,
});
export const { ID, FICHE_ID, PHRASES_ID, VOLET_ID, DOCUMENTS, FICHE, VOLET, ETAPES, PASTILLES, SUITE, ACCUEIL, OPTIONS } = S;
export const BILAN = S.B;
