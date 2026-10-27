// ENT-17.5 — évaluation : emballage et retours (Tle, C2.2 et C3.3, évaluation). Voir `contenus/la-redoute-ent175.js`.
import { seanceEntreprise } from '../core/types/seance-entreprise.js';
import * as LA_REDOUTE from '../contenus/la-redoute.js';
import * as SEANCE from '../contenus/la-redoute-ent175.js';
const s = seanceEntreprise(LA_REDOUTE, SEANCE, {
  id: 'la-redoute-evaluation',
  code: 'ENT-17.5',
  titre: 'La Redoute — évaluation : emballage et retours',
  desc: 'Seul(e) : emballer quatre commandes au plus juste et trier six retours, mesurer, proposer, puis rendre sa copie.',
  niveaux: ['tle'],
  competences: ['C2.2', 'C3.3'],
  temps: 'evaluation',
  bareme: 20,
  copie: true,
  questions: 'ENT-17.5',
  pret: true,
  ouverture: 'prof',
}, SEANCE.OPTIONS);
export const meta = s.meta;
export const rendre = s.rendre;
export const noter = s.noter;
