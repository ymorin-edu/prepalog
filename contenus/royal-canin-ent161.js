// ENT-16.1 — Royal Canin, « lire les indicateurs du stock » : GUIDAGE de C1.6 (gérer le suivi des stocks), Terminale.
// Lundi 2 novembre : le stock d'octobre de six références ; l'élève calcule rotation et couverture de deux références avec la fiche méthode, repère les surstocks et les risques de rupture, calcule le taux de service et rend compte à Sandrine.
// Univers et fabrique : `contenus/royal-canin.js` ; données : `D161` de `contenus/royal-canin-donnees.js` ; questions : `contenus/questions/ENT-16.1.js`.
//
// Poids (décidés par Claude, délégation de Tristan du 26/10/2026) : rotation 1,5 et couverture 1,5 (× 2 références) · risques de rupture 3 · surstocks 3 · taux de service 2 · compte rendu 2 · questions au fil 4 = 20.

import { seance } from './royal-canin.js';
import { D161 } from './royal-canin-donnees.js';
import { QUESTIONS } from './questions/ENT-16.1.js';

export * from './royal-canin.js';

const S = seance(D161, {
  id: 'royal-canin-indicateurs',
  K: { ind: true },
  poids: { rotation: 1.5, couverture: 1.5, rupture: 3, surstock: 3, service: 2, 'compte-rendu': 2 },
  titre: 'Lire les indicateurs du stock',
  objet: 'Les indicateurs d’octobre',
  consigne: 'Le mois d’octobre est clos. J’ai besoin des indicateurs du stock pour la réunion de production de cet après-midi.\n\nAvec la fiche méthode jointe : calcule la rotation et la couverture de CH-ADU-15 et de CT-STE-04, repère les références en risque de rupture et celles en surstock, puis calcule le taux de service du mois.\n\nOuvre la fiche de travail, puis écris-moi ton compte rendu.',
  poste: '<p>Ton travail aujourd’hui : <b>lire les indicateurs</b> du stock du mois (rotation, couverture, taux de service) et dire à Sandrine <b>quoi faire</b> : avancer une production, en retarder une autre.</p>',
  etape: 'Rotation et couverture de deux références, puis les risques de rupture, les surstocks et le taux de service.',
  questions: QUESTIONS,
});
export const { ID, FICHE_ID, PHRASES_ID, VOLET_ID, DOCUMENTS, FICHE, VOLET, ETAPES, PASTILLES, SUITE, ACCUEIL, OPTIONS } = S;
