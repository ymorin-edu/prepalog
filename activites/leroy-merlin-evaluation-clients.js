// ENT-20.8 — évaluation : le service clients (1re Bac Pro, C2.1, évaluation). Voir `contenus/leroy-merlin-ent208.js`.
// Jalons pondérés sur 20 (poids en tête du fichier de contenu, décidés par Claude, délégation de Tristan du 26/10/2026).
import { seanceEntreprise } from '../core/types/seance-entreprise.js';
import * as LEROY from '../contenus/leroy-merlin.js';
import * as SEANCE from '../contenus/leroy-merlin-ent208.js';
const s = seanceEntreprise(LEROY, SEANCE, {
  id: 'leroy-merlin-evaluation-clients',
  code: 'ENT-20.8',
  titre: 'Leroy Merlin — évaluation : le service clients',
  desc: 'Seul(e) : trois demandes, trois commandes (poids et date), le taux de service, puis rendre sa copie.',
  niveaux: ['1re'],
  competences: ['C2.1'],
  temps: 'evaluation',
  bareme: 20,
  copie: true,
  questions: 'ENT-20.8',
  pret: true,
  ouverture: 'prof',
}, SEANCE.OPTIONS);
export const meta = s.meta;
export const rendre = s.rendre;
export const noter = s.noter;
