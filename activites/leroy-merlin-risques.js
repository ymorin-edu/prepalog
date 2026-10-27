// ENT-20.1 — les risques de la plateforme (1re Bac Pro, C1.2, guidage). Voir `contenus/leroy-merlin-ent201.js`.
// Jalons pondérés sur 20 (poids en tête du fichier de contenu, décidés par Claude, délégation de Tristan du 26/10/2026).
import { seanceEntreprise } from '../core/types/seance-entreprise.js';
import * as LEROY from '../contenus/leroy-merlin.js';
import * as SEANCE from '../contenus/leroy-merlin-ent201.js';
const s = seanceEntreprise(LEROY, SEANCE, {
  id: 'leroy-merlin-risques',
  code: 'ENT-20.1',
  titre: 'Leroy Merlin — les risques de la plateforme',
  desc: 'Nouveau à Réau, plateforme nationale : repérer les risques de six situations, choisir la meilleure mesure, les EPI et la carte des trois plateformes.',
  niveaux: ['1re'],
  competences: ['C1.2'],
  temps: 'guidage',
  bareme: 20,
  parcours: true,                   // première séance du parcours Leroy Merlin (pas de `precedente`)
  correction: true,
  bilanDetail: true,
  reinitialisable: true,
  questions: 'ENT-20.1',
  pret: true,
  ouverture: 'prof',
}, SEANCE.OPTIONS);
export const meta = s.meta;
export const rendre = s.rendre;
