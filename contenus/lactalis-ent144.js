// ENT-14.4 — Lactalis, ÉVALUATION de C3.2 (assurer la traçabilité), 1re, copie rendue. Vendredi 22 décembre 2017, 14 h : l'avis du 21 décembre (fabriqué à
// Craon depuis le 15 février 2017) est arrivé la veille au soir, personne ne l'a encore traité, et les camions de 6 h sont partis. Jeu NEUF : la borne du
// 15 février des deux côtés (un lot du 14, un lot du 15), un lot visé parti en entier, un magasin livré ce matin même, après l'avis.
// Univers et fabrique : `contenus/lactalis.js` ; données : `D144` de `contenus/lactalis-donnees.js` ; questions : `contenus/questions/ENT-14.4.js`.
//
// Poids (décidés par Claude, délégation de Tristan du 26/10/2026) : les lots 4 · les magasins 3 · le magasin livré après l'avis 1 · les boîtes parties 1,5 ·
// les boîtes encore chez nous 1,5 · quatre lots à bloquer 1 chacun · aucun lot non visé bloqué 1 · le compte rendu 1 · « Avant de commencer » noté 3 = 20.

import { seance } from './lactalis.js';
import { D144 } from './lactalis-donnees.js';
import { QUESTIONS } from './questions/ENT-14.4.js';

export * from './lactalis.js';

const S = seance(D144, {
  id: 'lactalis-evaluation',
  poids: { lots: 4, magasins: 3, apres: 1, partis: 1.5, restant: 1.5, bloque: 1, 'rien-de-trop': 1, 'compte-rendu': 1 },
  consigne: 'L’avis du 21 décembre est arrivé hier soir, et personne ne l’a traité : les camions de ce matin 6 h sont partis comme d’habitude. '
    + 'Tu t’en occupes seul(e), du début à la fin :\n\n1. les lots visés passés chez nous ;\n2. les magasins livrés, celui ou ceux livrés après l’avis, et les boîtes parties ;\n'
    + '3. ce qui reste ici ;\n4. le blocage, lot par lot ;\n5. le compte rendu au service qualité.\n\n'
    + 'Quand tout est fait, rends ta copie : tu ne pourras plus rien modifier.',
  poste: '<p>Ton travail aujourd’hui : traiter <b>seul(e)</b> un avis de rappel donné par une règle de date, de l’amont jusqu’au compte rendu. C’est une <b>évaluation</b> : '
    + 'rien n’est corrigé avant que tu rendes ta copie.</p>',
  questions: QUESTIONS,
});
export const { ID, FICHE_ID, PHRASES_ID, VOLET_ID, DOCUMENTS, FICHE, VOLET, ETAPES, PASTILLES, SUITE, ACCUEIL, OPTIONS } = S;
export const BILAN = S.B;
