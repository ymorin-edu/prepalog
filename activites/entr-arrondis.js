// QUI-10 — Arrondis et pourcentages. Quiz d'entraînement, portée élève.
//
// Troisième quiz d'entraînement repris de la Suite Logistique.
// Même moteur que QUI-8 (`entr-conversions`) : rappel, une question à la fois, correction
// immédiate, chronomètre, bilan et classement anonyme. Les vingt générateurs ont été
// extraits par programme de la Suite Logistique ; voir `contenus/entr-arrondis.js`.
//
// Pas de champ `niveaux` : par défaut tout est ouvert à tous les niveaux, c'est
// « Conduite de séance » qui ferme.

import { creerEntrainement } from '../core/types/entrainement.js';
import { RAPPEL, GENERATEURS, TITRE } from '../contenus/entr-arrondis.js';

export const meta = {
  id: 'entr-arrondis',
  code: 'QUI-10',
  titre: TITRE,
  desc: 'Arrondir correctement et calculer des taux (remplissage, casse, remise…). Les nombres changent à chaque tentative.',
  rubrique: 'quiz',
  competences: [],
  // Vingt questions, donc vingt points : la note sur 20 tombe sans conversion.
  bareme: GENERATEURS.length,
  portee: 'eleve',
  pret: true,
};

const moteur = creerEntrainement({
  rappel: RAPPEL,
  generateurs: GENERATEURS,
  calculette: true,
  classement: true,
});

export function rendre(hote, ctx) { moteur.rendre(hote, ctx); }
