// ENT-15.3 — Syngenta, le plan de Lucas (1re, C3.1 et C1.5, erreur). Voir `contenus/syngenta-ent153.js`.
import { seanceEntreprise } from '../core/types/seance-entreprise.js';
import * as SYNGENTA from '../contenus/syngenta.js';
import * as SEANCE from '../contenus/syngenta-ent153.js';
const s = seanceEntreprise(SYNGENTA, SEANCE, {
  id: 'syngenta-plan-lucas',
  code: 'ENT-15.3',
  titre: 'Syngenta — le plan de Lucas',
  desc: 'Contrôler le plan de rangement d’un collègue : trouver les palettes mal rangées et l’erreur de rétention, refaire le calcul.',
  niveaux: ['1re'],
  competences: ['C3.1', 'C1.5'],
  temps: 'erreur',
  bareme: 20,
  correction: true,
  questions: 'ENT-15.3',
  pret: true,
  ouverture: 'prof',
}, SEANCE.OPTIONS);
export const meta = s.meta;
export const rendre = s.rendre;
