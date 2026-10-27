// ENT-18.5 — Airbus Helicopters, « évaluation : confier les expéditions » : ÉVALUATION de C2.6 et C3.1, Terminale, copie rendue.
// Jeudi 12 novembre : jeu NEUF, seul(e) ; un encombrant, un hélicoptère au sol, une batterie lithium-ion, une routine tout près.
// Univers et fabrique : `contenus/airbus.js` ; données : `D185` de `contenus/airbus-donnees.js` ; questions : `contenus/questions/ENT-18.5.js`.
//
// Poids (décidés par Claude, délégation de Tristan du 26/10/2026) : chaque prestataire 1,5 (× 4) · poids taxable 1 (× 2) · coût 1,5 (× 2) · la marchandise dangereuse 2 · compte rendu 4 · « Avant de commencer » noté 3 = 20.

import { seance } from './airbus.js';
import { D185 } from './airbus-donnees.js';
import { QUESTIONS } from './questions/ENT-18.5.js';

export * from './airbus.js';

const S = seance(D185, {
  id: 'airbus-evaluation',
  poids: { presta: 1.5, tax: 1, cout: 1.5, danger: 2, 'compte-rendu': 4 },
  titre: 'Évaluation : confier les expéditions',
  objet: 'Les expéditions du jour : à toi seul(e)',
  consigne: 'Je suis en réunion toute la matinée. Tu t’occupes seul(e) des quatre expéditions : le prestataire de chacune, le poids taxable et le coût d’EXP-1841 et d’EXP-1843, et la marchandise dangereuse.\n\nEnsuite, écris-moi ton compte rendu et rends ta copie : tu ne pourras plus rien modifier.',
  poste: '<p>Ton travail aujourd’hui : confier les expéditions <b>seul(e)</b>. C’est une <b>évaluation</b> : rien n’est corrigé avant que tu rendes ta copie.</p>',
  etape: 'Le prestataire de chaque colis selon la méthode ; poids taxable et coût de deux colis ; la marchandise dangereuse.',
  questions: QUESTIONS,
});
export const { ID, FICHE_ID, PHRASES_ID, VOLET_ID, DOCUMENTS, FICHE, VOLET, ETAPES, PASTILLES, SUITE, ACCUEIL, OPTIONS } = S;
