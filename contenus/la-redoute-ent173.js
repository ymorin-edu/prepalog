// ENT-17.3 — La Redoute, « trier les retours » : GUIDAGE de C3.3 (axes d’amélioration RSE), Terminale.
// Jeudi 5 novembre : huit retours clients ; l'élève lit l'état de chaque article, l'envoie dans la bonne filière (stock, reconditionnement, don, recyclage : jamais de destruction), calcule le taux de remise en vente et propose une amélioration.
// Univers et fabrique : `contenus/la-redoute.js` ; données : `D173` de `contenus/la-redoute-donnees.js` ; questions : `contenus/questions/ENT-17.3.js`.
//
// Poids (décidés par Claude, délégation de Tristan du 26/10/2026) : chaque retour dans sa filière 1,25 (× 8) · taux de remise en vente 3 · compte rendu 3 · questions au fil 4 = 20.

import { seance } from './la-redoute.js';
import { D173 } from './la-redoute-donnees.js';
import { QUESTIONS } from './questions/ENT-17.3.js';

export * from './la-redoute.js';

const S = seance(D173, {
  id: 'la-redoute-retours',
  K: { ret: true },
  poids: { filiere: 1.25, taux: 3, 'compte-rendu': 3 },
  titre: 'Trier les retours',
  objet: 'Les retours du jour',
  consigne: 'Les retours de la journée sont ouverts. Avec la règle de tri (jointe), dis-moi dans quelle filière va chaque article, puis calcule le taux de remise en vente.\n\nOuvre la fiche de travail, puis écris-moi ton compte rendu.',
  poste: '<p>Ton travail aujourd’hui : <b>trier les retours</b> clients selon leur état, sans rien détruire, et mesurer combien <b>repartent en vente</b>.</p>',
  etape: 'La filière de chaque retour selon son état ; puis le taux de remise en vente.',
  questions: QUESTIONS,
});
export const { ID, FICHE_ID, PHRASES_ID, VOLET_ID, DOCUMENTS, FICHE, VOLET, ETAPES, PASTILLES, SUITE, ACCUEIL, OPTIONS } = S;
