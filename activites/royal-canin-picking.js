// ENT-16.3 — implanter la zone de picking (Tle, C2.2, C3.1, guidage). Voir `contenus/royal-canin-ent163.js`.
import { seanceEntreprise } from '../core/types/seance-entreprise.js';
import * as ROYAL_CANIN from '../contenus/royal-canin.js';
import * as SEANCE from '../contenus/royal-canin-ent163.js';
const s = seanceEntreprise(ROYAL_CANIN, SEANCE, {
  id: 'royal-canin-picking',
  code: 'ENT-16.3',
  titre: 'Royal Canin — implanter la zone de picking',
  desc: 'Choisir où prélever chaque référence (canal dynamique, palette au sol, réserve) selon sa demande et son poids, et calculer les réappros des canaux.',
  niveaux: ['tle'],
  competences: ['C2.2', 'C3.1'],
  temps: 'guidage',
  bareme: 20,
  correction: true,
  questions: 'ENT-16.3',
  pret: true,
  ouverture: 'prof',
}, SEANCE.OPTIONS);
export const meta = s.meta;
export const rendre = s.rendre;
