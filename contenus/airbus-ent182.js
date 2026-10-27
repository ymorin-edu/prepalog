// ENT-18.2 — Airbus Helicopters, « les expéditions de mardi » : ENTRAÎNEMENT de C2.6, Terminale.
// Mardi 3 novembre : cinq expéditions ; un carénage encombrant tout près (la messagerie bat le coursier de peu), un calculateur pour demain trop loin pour le coursier, un arbre de 2,80 m.
// Univers et fabrique : `contenus/airbus.js` ; données : `D182` de `contenus/airbus-donnees.js` ; questions : `contenus/questions/ENT-18.2.js`.
//
// Poids (décidés par Claude, délégation de Tristan du 26/10/2026) : chaque prestataire 1,2 (× 5) · poids taxable 1,5 (× 2) · coût 1,5 (× 2) · compte rendu 4 · questions au fil 4 = 20.

import { seance } from './airbus.js';
import { D182 } from './airbus-donnees.js';
import { QUESTIONS } from './questions/ENT-18.2.js';

export * from './airbus.js';

const S = seance(D182, {
  id: 'airbus-expeditions-mardi',
  poids: { presta: 1.2, tax: 1.5, cout: 1.5, 'compte-rendu': 4 },
  titre: 'Les expéditions de mardi',
  objet: 'Cinq colis pour aujourd’hui',
  consigne: 'Cinq colis aujourd’hui, à toi de les confier, comme hier. Calcule le poids taxable et le coût d’EXP-1811 et d’EXP-1815.\n\nOuvre la fiche de travail, puis écris-moi ton compte rendu.',
  poste: '<p>Ton travail aujourd’hui : confier cinq colis, avec leur <b>poids taxable</b> et leur <b>coût</b>, seul(e) avec la grille et la méthode.</p>',
  etape: 'Pour chaque colis, les prestataires possibles (longueur, distance, délai), puis le moins cher ; poids taxable et coût de deux colis.',
  questions: QUESTIONS,
});
export const { ID, FICHE_ID, PHRASES_ID, VOLET_ID, DOCUMENTS, FICHE, VOLET, ETAPES, PASTILLES, SUITE, ACCUEIL, OPTIONS } = S;
