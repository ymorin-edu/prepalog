// ENT-19.1 — bienvenue à Brétigny (CAP OL, CAP-C1.1, guidage). Voir `contenus/amazon-ent191.js`.
// Séance réservée au CAP : `competences: []`, `competencesCap` seules. Jalons pondérés sur 20 (poids en tête du fichier de contenu).
import { seanceEntreprise } from '../core/types/seance-entreprise.js';
import * as AMAZON from '../contenus/amazon.js';
import * as SEANCE from '../contenus/amazon-ent191.js';
const s = seanceEntreprise(AMAZON, SEANCE, {
  id: 'amazon-bienvenue',
  code: 'ENT-19.1',
  titre: 'Amazon — bienvenue à Brétigny',
  desc: 'Stagiaire dans le centre robotisé de Brétigny-sur-Orge : qui fait quoi, trois centres sur la carte, le voyage d’un article et ce que font les robots.',
  niveaux: ['cap'],
  competences: [],
  competencesCap: ['CAP-C1.1'],
  temps: 'guidage',
  bareme: 20,
  parcours: true,                   // première séance du parcours Amazon (pas de `precedente`)
  correction: true,
  bilanDetail: true,
  reinitialisable: true,
  questions: 'ENT-19.1',
  pret: true,
  ouverture: 'prof',
}, SEANCE.OPTIONS);
export const meta = s.meta;
export const rendre = s.rendre;
