// ENT-14.3 — Lactalis, « le lot oublié » (1re, C3.2, erreur induite). Voir `contenus/lactalis-ent143.js`.
import { seanceEntreprise } from '../core/types/seance-entreprise.js';
import * as LACTALIS from '../contenus/lactalis.js';
import * as SEANCE from '../contenus/lactalis-ent143.js';
const s = seanceEntreprise(LACTALIS, SEANCE, {
  id: 'lactalis-lot-oublie',
  code: 'ENT-14.3',
  titre: 'Lactalis — le lot oublié',
  desc: 'Contrôler le relevé de traçabilité d’un collègue : trouver le lot rappelé oublié et la cause de l’oubli, les magasins non prévenus, '
    + 'bloquer ce qui reste et corriger le compte rendu.',
  niveaux: ['1re'],
  competences: ['C3.2'],
  temps: 'erreur',
  bareme: 20,
  questions: 'ENT-14.3',
  correction: true,
  pret: true,
  ouverture: 'prof',
}, SEANCE.OPTIONS);
export const meta = s.meta;
export const rendre = s.rendre;
