// ENT-13.5 — Stellantis Sochaux, « évaluation de rentrée » (Terminale, la rentrée, évaluation). Voir `contenus/stellantis-ent135.js`.
import { seanceEntreprise } from '../core/types/seance-entreprise.js';
import * as STELLANTIS from '../contenus/stellantis.js';
import * as SEANCE from '../contenus/stellantis-ent135.js';
const s = seanceEntreprise(STELLANTIS, SEANCE, {
  id: 'stellantis-evaluation-rentree',
  code: 'ENT-13.5',
  titre: 'Stellantis Sochaux — évaluation de rentrée',
  desc: 'Sans aide : recevoir un camion de pièces et écrire les réserves, classer les références en A, B et C au tableur, ranger les palettes reçues et expliquer un écart d’inventaire.',
  niveaux: ['tle'],
  competences: ['C1.4', 'C1.5', 'C1.6'],
  temps: 'evaluation',
  bareme: 20,
  copie: true,
  questions: 'ENT-13.5',
  pret: true,
  ouverture: 'prof',
}, SEANCE.OPTIONS);
export const meta = s.meta;
export const rendre = s.rendre;
export const noter = s.noter;
