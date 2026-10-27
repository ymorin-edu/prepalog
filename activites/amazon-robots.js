// ENT-19.9 — les robots et moi (CAP OL, CAP-C1.1, CAP-C3.6, guidage). Voir `contenus/amazon-ent199.js`.
// Séance réservée au CAP : `competences: []`, `competencesCap` seules. Jalons pondérés sur 20 (poids en tête du fichier de contenu).
import { seanceEntreprise } from '../core/types/seance-entreprise.js';
import * as AMAZON from '../contenus/amazon.js';
import * as SEANCE from '../contenus/amazon-ent199.js';
const s = seanceEntreprise(AMAZON, SEANCE, {
  id: 'amazon-robots',
  code: 'ENT-19.9',
  titre: 'Amazon — les robots et moi',
  desc: 'Des faits réels (saisonniers de Noël, robots, livraison du lendemain) et leurs conséquences sur le centre, deux calculs, ce que les robots changent au poste.',
  niveaux: ['cap'],
  competences: [],
  competencesCap: ['CAP-C1.1', 'CAP-C3.6'],
  temps: 'guidage',
  bareme: 20,
  parcours: true,
  correction: true,
  bilanDetail: true,
  precedente: 'amazon-jeudi',
  questions: 'ENT-19.9',
  pret: true,
  ouverture: 'prof',
}, SEANCE.OPTIONS);
export const meta = s.meta;
export const rendre = s.rendre;
