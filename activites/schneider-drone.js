// ENT-22.8 — l’inventaire du drone (CAP OL, CAP-C1.5, entrainement). Voir `contenus/schneider-ent228.js`.
// Séance réservée au CAP : `competences: []`, `competencesCap` seules. Jalons pondérés sur 20 (poids en tête du fichier de contenu).
import { seanceEntreprise } from '../core/types/seance-entreprise.js';
import * as SCHNEIDER from '../contenus/schneider.js';
import * as SEANCE from '../contenus/schneider-ent228.js';
const s = seanceEntreprise(SCHNEIDER, SEANCE, {
  id: 'schneider-drone',
  code: 'ENT-22.8',
  titre: 'Schneider Electric — l’inventaire du drone',
  desc: 'Le drone d’inventaire a compté cinq adresses : repérer celles à recompter, dire qui a raison, ranger deux palettes.',
  niveaux: ['cap'],
  competences: [],
  competencesCap: ['CAP-C1.5'],
  temps: 'entrainement',
  bareme: 20,
  parcours: true,
  correction: true,
  bilanDetail: true,
  precedente: 'schneider-ranger',
  questions: 'ENT-22.8',
  pret: true,
  ouverture: 'prof',
}, SEANCE.OPTIONS);
export const meta = s.meta;
export const rendre = s.rendre;
