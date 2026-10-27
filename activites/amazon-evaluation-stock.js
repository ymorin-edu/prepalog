// ENT-19.5 — évaluation : mettre en stock (CAP OL, CAP-C1.5, evaluation). Voir `contenus/amazon-ent195.js`.
// Séance réservée au CAP : `competences: []`, `competencesCap` seules. Jalons pondérés sur 20 (poids en tête du fichier de contenu).
import { seanceEntreprise } from '../core/types/seance-entreprise.js';
import * as AMAZON from '../contenus/amazon.js';
import * as SEANCE from '../contenus/amazon-ent195.js';
const s = seanceEntreprise(AMAZON, SEANCE, {
  id: 'amazon-evaluation-stock',
  code: 'ENT-19.5',
  titre: 'Amazon — évaluation : mettre en stock',
  desc: 'Seul(e) : deux situations de sécurité, un bac à ranger avec un article abîmé, un inventaire, une adresse, puis rendre sa copie.',
  niveaux: ['cap'],
  competences: [],
  competencesCap: ['CAP-C1.5'],
  temps: 'evaluation',
  bareme: 20,
  copie: true,
  questions: 'ENT-19.5',
  pret: true,
  ouverture: 'prof',
}, SEANCE.OPTIONS);
export const meta = s.meta;
export const rendre = s.rendre;
export const noter = s.noter;
