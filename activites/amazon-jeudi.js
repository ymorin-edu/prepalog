// ENT-19.8 — la commande du jeudi (CAP OL, CAP-C3.1, CAP-C3.2, CAP-C3.3, entraînement). Voir `contenus/amazon-ent198.js`.
// Séance réservée au CAP : `competences: []`, `competencesCap` seules. Jalons pondérés sur 20 (poids en tête du fichier de contenu).
import { seanceEntreprise } from '../core/types/seance-entreprise.js';
import * as AMAZON from '../contenus/amazon.js';
import * as SEANCE from '../contenus/amazon-ent198.js';
const s = seanceEntreprise(AMAZON, SEANCE, {
  id: 'amazon-jeudi',
  code: 'ENT-19.8',
  titre: 'Amazon — la commande du jeudi',
  desc: 'Cinq lignes à prélever (une taille fausse, un article abîmé, une case vide), trois commandes à emballer et une pesée.',
  niveaux: ['cap'],
  competences: [],
  competencesCap: ['CAP-C3.1', 'CAP-C3.2', 'CAP-C3.3'],
  temps: 'entrainement',
  bareme: 20,
  parcours: true,
  correction: true,
  bilanDetail: true,
  precedente: 'amazon-emballer',
  questions: 'ENT-19.8',
  pret: true,
  ouverture: 'prof',
}, SEANCE.OPTIONS);
export const meta = s.meta;
export const rendre = s.rendre;
