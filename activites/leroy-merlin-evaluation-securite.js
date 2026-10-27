// ENT-20.4 — évaluation : la sécurité (1re Bac Pro, C1.2, évaluation). Voir `contenus/leroy-merlin-ent204.js`.
// Jalons pondérés sur 20 (poids en tête du fichier de contenu, décidés par Claude, délégation de Tristan du 26/10/2026).
import { seanceEntreprise } from '../core/types/seance-entreprise.js';
import * as LEROY from '../contenus/leroy-merlin.js';
import * as SEANCE from '../contenus/leroy-merlin-ent204.js';
const s = seanceEntreprise(LEROY, SEANCE, {
  id: 'leroy-merlin-evaluation-securite',
  code: 'ENT-20.4',
  titre: 'Leroy Merlin — évaluation : la sécurité',
  desc: 'Seul(e) : quatre situations, le protocole au quai, les taux de l’année, puis rendre sa copie.',
  niveaux: ['1re'],
  competences: ['C1.2'],
  temps: 'evaluation',
  bareme: 20,
  copie: true,
  questions: 'ENT-20.4',
  pret: true,
  ouverture: 'prof',
}, SEANCE.OPTIONS);
export const meta = s.meta;
export const rendre = s.rendre;
export const noter = s.noter;
