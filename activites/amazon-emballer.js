// ENT-19.7 — emballer les commandes (CAP OL, CAP-C3.3, CAP-C3.7, guidage). Voir `contenus/amazon-ent197.js`.
// Séance réservée au CAP : `competences: []`, `competencesCap` seules. Jalons pondérés sur 20 (poids en tête du fichier de contenu).
import { seanceEntreprise } from '../core/types/seance-entreprise.js';
import * as AMAZON from '../contenus/amazon.js';
import * as SEANCE from '../contenus/amazon-ent197.js';
const s = seanceEntreprise(AMAZON, SEANCE, {
  id: 'amazon-emballer',
  code: 'ENT-19.7',
  titre: 'Amazon — emballer les commandes',
  desc: 'Le plus petit carton où l’article entre, caler les fragiles, la pesée en fin de ligne et les écogestes du poste.',
  niveaux: ['cap'],
  competences: [],
  competencesCap: ['CAP-C3.3', 'CAP-C3.7'],
  temps: 'guidage',
  bareme: 20,
  parcours: true,
  correction: true,
  bilanDetail: true,
  precedente: 'amazon-prelever',
  questions: 'ENT-19.7',
  pret: true,
  ouverture: 'prof',
}, SEANCE.OPTIONS);
export const meta = s.meta;
export const rendre = s.rendre;
