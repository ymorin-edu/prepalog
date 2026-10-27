// ENT-19.2 — prendre mon poste (CAP OL, CAP-C1.2, guidage). Voir `contenus/amazon-ent192.js`.
// Séance réservée au CAP : `competences: []`, `competencesCap` seules. Jalons pondérés sur 20 (poids en tête du fichier de contenu).
import { seanceEntreprise } from '../core/types/seance-entreprise.js';
import * as AMAZON from '../contenus/amazon.js';
import * as SEANCE from '../contenus/amazon-ent192.js';
const s = seanceEntreprise(AMAZON, SEANCE, {
  id: 'amazon-poste',
  code: 'ENT-19.2',
  titre: 'Amazon — prendre mon poste',
  desc: 'Les règles de sécurité du poste, l’écran de la mission, le planigramme de réception, puis le compte rendu à la manageuse.',
  niveaux: ['cap'],
  competences: [],
  competencesCap: ['CAP-C1.2'],
  temps: 'guidage',
  bareme: 20,
  parcours: true,
  correction: true,
  bilanDetail: true,
  precedente: 'amazon-bienvenue',
  questions: 'ENT-19.2',
  pret: true,
  ouverture: 'prof',
}, SEANCE.OPTIONS);
export const meta = s.meta;
export const rendre = s.rendre;
