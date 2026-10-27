// ENT-16.2 — Royal Canin, « les indicateurs de novembre » : ENTRAÎNEMENT de C1.6 (gérer le suivi des stocks), Terminale.
// Mardi 1er décembre : huit références ; deux références à calculer (dont une rotation décimale), une couverture égale à un jour près au délai qui n'est pas une rupture.
// Univers et fabrique : `contenus/royal-canin.js` ; données : `D162` de `contenus/royal-canin-donnees.js` ; questions : `contenus/questions/ENT-16.2.js`.
//
// Poids (décidés par Claude, délégation de Tristan du 26/10/2026) : rotation 1,5 et couverture 1,5 (× 2 références) · risques de rupture 2,5 · surstocks 2,5 · taux de service 2 · compte rendu 3 · questions au fil 4 = 20.

import { seance } from './royal-canin.js';
import { D162 } from './royal-canin-donnees.js';
import { QUESTIONS } from './questions/ENT-16.2.js';

export * from './royal-canin.js';

const S = seance(D162, {
  id: 'royal-canin-indicateurs-novembre',
  K: { ind: true },
  poids: { rotation: 1.5, couverture: 1.5, rupture: 2.5, surstock: 2.5, service: 2, 'compte-rendu': 3 },
  titre: 'Les indicateurs de novembre',
  objet: 'Les indicateurs de novembre',
  consigne: 'Novembre est clos, et le pic de fin d’année approche. Même travail que le mois dernier, avec huit références cette fois : rotation et couverture de CH-ADU-15 et de CT-KIT-04, les risques de rupture, les surstocks, le taux de service.\n\nOuvre la fiche de travail, puis écris-moi ton compte rendu.',
  poste: '<p>Ton travail aujourd’hui : les <b>indicateurs du stock</b> de novembre, seul(e) avec la fiche méthode, et ce qu’il faut en <b>décider</b>.</p>',
  etape: 'Rotation et couverture de deux références, puis les risques de rupture, les surstocks et le taux de service.',
  questions: QUESTIONS,
});
export const { ID, FICHE_ID, PHRASES_ID, VOLET_ID, DOCUMENTS, FICHE, VOLET, ETAPES, PASTILLES, SUITE, ACCUEIL, OPTIONS } = S;
