// ENT-19.3 — ranger dans l’armoire (CAP OL, CAP-C1.5, guidage). Voir `contenus/amazon-ent193.js`.
// Séance réservée au CAP : `competences: []`, `competencesCap` seules. Jalons pondérés sur 20 (poids en tête du fichier de contenu).
import { seanceEntreprise } from '../core/types/seance-entreprise.js';
import * as AMAZON from '../contenus/amazon.js';
import * as SEANCE from '../contenus/amazon-ent193.js';
const s = seanceEntreprise(AMAZON, SEANCE, {
  id: 'amazon-ranger',
  code: 'ENT-19.3',
  titre: 'Amazon — ranger dans l’armoire',
  desc: 'Le stockage aléatoire : choisir la case de chaque article selon trois règles, les gestes dans l’ordre, l’adresse que garde le système.',
  niveaux: ['cap'],
  competences: [],
  competencesCap: ['CAP-C1.5'],
  temps: 'guidage',
  bareme: 20,
  parcours: true,
  correction: true,
  bilanDetail: true,
  precedente: 'amazon-poste',
  questions: 'ENT-19.3',
  pret: true,
  ouverture: 'prof',
}, SEANCE.OPTIONS);
export const meta = s.meta;
export const rendre = s.rendre;
