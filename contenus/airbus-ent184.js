// ENT-18.4 — Airbus Helicopters, « les réservations de Sofiane » : ERREUR INDUITE de C2.6 et C3.1, Terminale.
// Lundi 9 novembre : Sofiane a réservé trois colis « au moins cher » sur le poids réel : l'hélicoptère au sol de Clermont-Ferrand part en messagerie (deux jours), le capotage encombrant est chiffré 30 € au lieu de 168 € ; le roulement est juste. L'élève trouve les erreurs, la cause, et refait les trois réservations.
// Univers et fabrique : `contenus/airbus.js` ; données : `D184` de `contenus/airbus-donnees.js` ; questions : `contenus/questions/ENT-18.4.js`.
//
// Poids (décidés par Claude, délégation de Tristan du 26/10/2026) : les réservations à corriger 3 · la cause 2 · chaque prestataire 1 (× 3) · poids taxable 0,75 (× 2) · coût 1,5 (× 3) · compte rendu 2 · questions au fil 4 = 20.

import { seance } from './airbus.js';
import { D184 } from './airbus-donnees.js';
import { QUESTIONS } from './questions/ENT-18.4.js';

export * from './airbus.js';

const S = seance(D184, {
  id: 'airbus-reservations-sofiane',
  poids: { erreurs: 3, cause: 2, presta: 1, tax: 0.75, cout: 1.5, 'compte-rendu': 2 },
  titre: 'Les réservations de Sofiane',
  objet: 'Les réservations de Sofiane : vérifie avant de confirmer',
  consigne: 'Sofiane a saisi les réservations de ce matin, je ne les ai pas encore confirmées aux prestataires : sa fiche est jointe. Vérifie-les avec la méthode. Lesquelles sont à corriger, et pourquoi ses coûts sont-ils si bas ? Refais ensuite les trois réservations, avec poids taxable et coût.\n\nOuvre la fiche de travail, puis écris-moi ton compte rendu.',
  poste: '<p>Ton travail aujourd’hui : <b>contrôler</b> les réservations d’un collègue avant qu’elles partent aux prestataires, et les <b>refaire</b>.</p>',
  etape: 'Les réservations de Sofiane à corriger et la cause ; puis les trois réservations refaites.',
  questions: QUESTIONS,
});
export const { ID, FICHE_ID, PHRASES_ID, VOLET_ID, DOCUMENTS, FICHE, VOLET, ETAPES, PASTILLES, SUITE, ACCUEIL, OPTIONS } = S;
