// ENT-18.1 — Airbus Helicopters, « confier les expéditions » : GUIDAGE de C2.6 (confier l’expédition à un prestataire externe), Terminale.
// Lundi 2 novembre : quatre expéditions de routine ; l'élève choisit le prestataire avec la grille et la méthode, calcule le poids taxable et le coût de deux colis (dont un capot léger mais encombrant) et rend compte.
// Univers et fabrique : `contenus/airbus.js` ; données : `D181` de `contenus/airbus-donnees.js` ; questions : `contenus/questions/ENT-18.1.js`.
//
// Poids (décidés par Claude, délégation de Tristan du 26/10/2026) : chaque prestataire 1,5 (× 4) · poids taxable 1,5 (× 2) · coût 1,5 (× 2) · compte rendu 4 · questions au fil 4 = 20.

import { seance } from './airbus.js';
import { D181 } from './airbus-donnees.js';
import { QUESTIONS } from './questions/ENT-18.1.js';

export * from './airbus.js';

const S = seance(D181, {
  id: 'airbus-expeditions',
  poids: { presta: 1.5, tax: 1.5, cout: 1.5, 'compte-rendu': 4 },
  titre: 'Confier les expéditions',
  objet: 'Quatre colis à confier ce matin',
  consigne: 'Quatre pièces de rechange partent aujourd’hui. Avec la grille des prestataires et la méthode du service (jointes), choisis à qui confier chaque colis. Pour EXP-1802 et EXP-1804, calcule le poids taxable et le coût.\n\nOuvre la fiche de travail, puis écris-moi ton compte rendu.',
  poste: '<p>Ton travail aujourd’hui : choisir le <b>prestataire</b> de chaque colis, et calculer son <b>poids taxable</b> et son <b>coût</b>.</p>',
  etape: 'Le prestataire possible le moins cher pour chaque colis ; poids taxable et coût de deux colis.',
  questions: QUESTIONS,
});
export const { ID, FICHE_ID, PHRASES_ID, VOLET_ID, DOCUMENTS, FICHE, VOLET, ETAPES, PASTILLES, SUITE, ACCUEIL, OPTIONS } = S;
