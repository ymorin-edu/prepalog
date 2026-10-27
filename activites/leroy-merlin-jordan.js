// ENT-20.7 — les réponses de Jordan (1re Bac Pro, C2.1, erreur induite). Voir `contenus/leroy-merlin-ent207.js`.
// Jalons pondérés sur 20 (poids en tête du fichier de contenu, décidés par Claude, délégation de Tristan du 26/10/2026).
import { seanceEntreprise } from '../core/types/seance-entreprise.js';
import * as LEROY from '../contenus/leroy-merlin.js';
import * as SEANCE from '../contenus/leroy-merlin-ent207.js';
const s = seanceEntreprise(LEROY, SEANCE, {
  id: 'leroy-merlin-jordan',
  code: 'ENT-20.7',
  titre: 'Leroy Merlin — les réponses de Jordan',
  desc: 'Jordan a promis des dates de livraison à cinq clients : vérifier chaque promesse, corriger les fausses et en trouver la cause.',
  niveaux: ['1re'],
  competences: ['C2.1'],
  temps: 'erreur',
  bareme: 20,
  parcours: true,
  correction: true,
  bilanDetail: true,
  precedente: 'leroy-merlin-samedi',
  questions: 'ENT-20.7',
  pret: true,
  ouverture: 'prof',
}, SEANCE.OPTIONS);
export const meta = s.meta;
export const rendre = s.rendre;
