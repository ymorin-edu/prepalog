// ENT-19.10 — évaluation : prélever et emballer (CAP OL, CAP-C3.1, CAP-C3.2, CAP-C3.3, evaluation). Voir `contenus/amazon-ent1910.js`.
// Séance réservée au CAP : `competences: []`, `competencesCap` seules. Jalons pondérés sur 20 (poids en tête du fichier de contenu).
import { seanceEntreprise } from '../core/types/seance-entreprise.js';
import * as AMAZON from '../contenus/amazon.js';
import * as SEANCE from '../contenus/amazon-ent1910.js';
const s = seanceEntreprise(AMAZON, SEANCE, {
  id: 'amazon-evaluation-commandes',
  code: 'ENT-19.10',
  titre: 'Amazon — évaluation : prélever et emballer',
  desc: 'Seul(e) : quatre lignes à prélever, trois commandes à emballer, deux pesées, puis rendre sa copie.',
  niveaux: ['cap'],
  competences: [],
  competencesCap: ['CAP-C3.1', 'CAP-C3.2', 'CAP-C3.3'],
  temps: 'evaluation',
  bareme: 20,
  copie: true,
  questions: 'ENT-19.10',
  pret: true,
  ouverture: 'prof',
}, SEANCE.OPTIONS);
export const meta = s.meta;
export const rendre = s.rendre;
export const noter = s.noter;
