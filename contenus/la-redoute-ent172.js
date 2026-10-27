// ENT-17.2 — La Redoute, « emballer juste, avec du fragile » : ENTRAÎNEMENT de C2.2 et C3.3, Terminale.
// Mardi 3 novembre : huit commandes, dont deux avec un article fragile (le calage fait monter le format et compte comme du vide) ; une commande dépasse le carton M.
// Univers et fabrique : `contenus/la-redoute.js` ; données : `D172` de `contenus/la-redoute-donnees.js` ; questions : `contenus/questions/ENT-17.2.js`.
//
// Poids (décidés par Claude, délégation de Tristan du 26/10/2026) : chaque commande dans son emballage 1 (× 8) · taux de vide 1,5 (× 2) · poids des emballages 1 · emballage économisé 1 · compte rendu 3 · questions au fil 4 = 20.

import { seance } from './la-redoute.js';
import { D172 } from './la-redoute-donnees.js';
import { QUESTIONS } from './questions/ENT-17.2.js';

export * from './la-redoute.js';

const S = seance(D172, {
  id: 'la-redoute-emballage-fragile',
  K: { emb: true },
  poids: { format: 1, vide: 1.5, apres: 1, gain: 1, 'compte-rendu': 3 },
  titre: 'Emballer juste, avec du fragile',
  objet: 'Huit commandes, dont du fragile',
  consigne: 'Même travail qu’hier, sur huit commandes cette fois, et deux d’entre elles ont un article fragile : n’oublie pas le calage. Calcule aussi le taux de vide de C-1712 et de C-1717, le poids des emballages et ce qu’on économise.\n\nOuvre la fiche de travail, puis écris-moi ton compte rendu.',
  poste: '<p>Ton travail aujourd’hui : l’<b>emballage juste</b> de huit commandes, <b>fragiles</b> comprises, et ce qu’on y gagne.</p>',
  etape: 'Le volume utile (calage compris), le plus petit format qui convient ; deux taux de vide ; le poids et l’économie.',
  questions: QUESTIONS,
});
export const { ID, FICHE_ID, PHRASES_ID, VOLET_ID, DOCUMENTS, FICHE, VOLET, ETAPES, PASTILLES, SUITE, ACCUEIL, OPTIONS } = S;
