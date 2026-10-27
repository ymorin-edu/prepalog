// ENT-13.9 — évaluation : le bord de ligne, C2.3 (Terminale, evaluation). Voir `contenus/stellantis-ent139.js`.
// Jalons pondérés sur 20 (poids en tête du fichier de contenu, décidés par Claude, délégation de Tristan du 27/10/2026).
import { seanceEntreprise } from '../core/types/seance-entreprise.js';
import * as STELLANTIS from '../contenus/stellantis.js';
import * as SEANCE from '../contenus/stellantis-ent139.js';
const s = seanceEntreprise(STELLANTIS, SEANCE, {
  id: 'stellantis-evaluation-ligne',
  code: 'ENT-13.9',
  titre: 'Stellantis Sochaux — évaluation : le bord de ligne',
  desc: 'Seul(e), sur un jeu tiré : ce que tient un poste, une matinée de 90 minutes avec un camion en retard, sans bilan, puis rendre sa copie.',
  niveaux: ['tle'],
  competences: ['C2.3'],
  temps: 'evaluation',
  bareme: 20,
  copie: true,
  questions: 'ENT-13.9',
  pret: true,
  ouverture: 'prof',
}, SEANCE.OPTIONS);
export const meta = s.meta;
export const rendre = s.rendre;
export const noter = s.noter;
