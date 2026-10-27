// ENT-17.1 — La Redoute, « emballer juste » : GUIDAGE de C2.2 (optimiser la préparation : l’emballage) et C3.3 (axes d’amélioration RSE), Terminale.
// Lundi 2 novembre : cinq commandes ; l'élève choisit le plus petit emballage qui convient avec la règle du poste, calcule deux taux de vide, le poids d'emballage avec ses formats et ce qu'on économise par rapport au « carton M pour tout », et propose une amélioration.
// Univers et fabrique : `contenus/la-redoute.js` ; données : `D171` de `contenus/la-redoute-donnees.js` ; questions : `contenus/questions/ENT-17.1.js`.
//
// Poids (décidés par Claude, délégation de Tristan du 26/10/2026) : chaque commande dans son emballage 1,5 (× 5) · taux de vide 1,5 (× 2) · poids des emballages 1,5 · emballage économisé 1 · compte rendu 3 · questions au fil 4 = 20.

import { seance } from './la-redoute.js';
import { D171 } from './la-redoute-donnees.js';
import { QUESTIONS } from './questions/ENT-17.1.js';

export * from './la-redoute.js';

const S = seance(D171, {
  id: 'la-redoute-emballage',
  K: { emb: true },
  poids: { format: 1.5, vide: 1.5, apres: 1.5, gain: 1, 'compte-rendu': 3 },
  titre: 'Emballer juste',
  objet: 'Le carton M pour tout, c’est fini ?',
  consigne: 'Au poste emballage, on met presque tout en carton M depuis des années. Je veux savoir ce qu’on gagnerait à choisir l’emballage à chaque commande.\n\nAvec la règle du poste (jointe), choisis le format des cinq commandes du jour, calcule le taux de vide de C-1702 et de C-1705, le poids total des emballages avec tes formats, et ce qu’on économise par rapport au carton M pour tout.\n\nOuvre la fiche de travail, puis écris-moi ton compte rendu.',
  poste: '<p>Ton travail aujourd’hui : choisir l’<b>emballage juste</b> de chaque commande, mesurer le <b>vide</b> et le <b>carton économisé</b>, et proposer une amélioration.</p>',
  etape: 'Le plus petit format qui convient pour chaque commande ; deux taux de vide ; le poids des emballages et ce qu’on économise.',
  questions: QUESTIONS,
});
export const { ID, FICHE_ID, PHRASES_ID, VOLET_ID, DOCUMENTS, FICHE, VOLET, ETAPES, PASTILLES, SUITE, ACCUEIL, OPTIONS } = S;
