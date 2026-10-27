// ENT-19.4 — le bac du mardi (CAP OL, CAP-C1.5, entraînement). Voir `contenus/amazon-ent194.js`.
// Séance réservée au CAP : `competences: []`, `competencesCap` seules. Jalons pondérés sur 20 (poids en tête du fichier de contenu).
import { seanceEntreprise } from '../core/types/seance-entreprise.js';
import * as AMAZON from '../contenus/amazon.js';
import * as SEANCE from '../contenus/amazon-ent194.js';
const s = seanceEntreprise(AMAZON, SEANCE, {
  id: 'amazon-bac-mardi',
  code: 'ENT-19.4',
  titre: 'Amazon — le bac du mardi',
  desc: 'Un bac plus gros, un article abîmé à mettre de côté, l’inventaire d’un article rangé dans trois cases.',
  niveaux: ['cap'],
  competences: [],
  competencesCap: ['CAP-C1.5'],
  temps: 'entrainement',
  bareme: 20,
  parcours: true,
  correction: true,
  bilanDetail: true,
  precedente: 'amazon-ranger',
  questions: 'ENT-19.4',
  pret: true,
  ouverture: 'prof',
}, SEANCE.OPTIONS);
export const meta = s.meta;
export const rendre = s.rendre;
