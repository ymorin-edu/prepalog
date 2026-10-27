// ENT-17.4 — le tri de Julien (Tle, C3.3, erreur induite). Voir `contenus/la-redoute-ent174.js`.
import { seanceEntreprise } from '../core/types/seance-entreprise.js';
import * as LA_REDOUTE from '../contenus/la-redoute.js';
import * as SEANCE from '../contenus/la-redoute-ent174.js';
const s = seanceEntreprise(LA_REDOUTE, SEANCE, {
  id: 'la-redoute-tri-julien',
  code: 'ENT-17.4',
  titre: 'La Redoute — le tri de Julien',
  desc: 'Un collègue a trié des retours et calculé un taux de remise en vente : trouver ses erreurs de tri, ce qui fausse son taux, et le refaire.',
  niveaux: ['tle'],
  competences: ['C3.3'],
  temps: 'erreur',
  bareme: 20,
  correction: true,
  questions: 'ENT-17.4',
  pret: true,
  ouverture: 'prof',
}, SEANCE.OPTIONS);
export const meta = s.meta;
export const rendre = s.rendre;
