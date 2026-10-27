// ENT-19.6 — prélever pour les commandes (CAP OL, CAP-C3.1, CAP-C3.2, guidage). Voir `contenus/amazon-ent196.js`.
// Séance réservée au CAP : `competences: []`, `competencesCap` seules. Jalons pondérés sur 20 (poids en tête du fichier de contenu).
import { seanceEntreprise } from '../core/types/seance-entreprise.js';
import * as AMAZON from '../contenus/amazon.js';
import * as SEANCE from '../contenus/amazon-ent196.js';
const s = seanceEntreprise(AMAZON, SEANCE, {
  id: 'amazon-prelever',
  code: 'ENT-19.6',
  titre: 'Amazon — prélever pour les commandes',
  desc: 'L’écran montre la case et la photo : prendre l’article, ou signaler une case vide ou un article qui n’est pas le bon ; le bac de chaque commande.',
  niveaux: ['cap'],
  competences: [],
  competencesCap: ['CAP-C3.1', 'CAP-C3.2'],
  temps: 'guidage',
  bareme: 20,
  parcours: true,
  correction: true,
  bilanDetail: true,
  precedente: 'amazon-bac-mardi',
  questions: 'ENT-19.6',
  pret: true,
  ouverture: 'prof',
}, SEANCE.OPTIONS);
export const meta = s.meta;
export const rendre = s.rendre;
