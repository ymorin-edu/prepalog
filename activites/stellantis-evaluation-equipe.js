// ENT-13.12 — évaluation : l’équipe du matin (Terminale, C3.4, evaluation). Voir `contenus/stellantis-ent1312.js`.
// Jalons pondérés sur 20 (poids en tête du fichier de contenu, décidés par Claude, délégation de Tristan du 26/10/2026).
import { seanceEntreprise } from '../core/types/seance-entreprise.js';
import * as STELLANTIS from '../contenus/stellantis.js';
import * as SEANCE from '../contenus/stellantis-ent1312.js';
const s = seanceEntreprise(STELLANTIS, SEANCE, {
  id: 'stellantis-evaluation-equipe',
  code: 'ENT-13.12',
  titre: 'Stellantis Sochaux — évaluation : l’équipe du matin',
  desc: 'Seul(e) : affecter une équipe tirée au sort, calculer la charge des kits, faire face à un imprévu, puis rendre sa copie.',
  niveaux: ['tle'],
  competences: ['C3.4'],
  temps: 'evaluation',
  bareme: 20,
  copie: true,
  questions: 'ENT-13.12',
  pret: true,
  ouverture: 'prof',
}, SEANCE.OPTIONS);
export const meta = s.meta;
export const rendre = s.rendre;
export const noter = s.noter;
