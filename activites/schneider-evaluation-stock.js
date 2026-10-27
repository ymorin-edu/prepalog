// ENT-22.10 — évaluation : mettre en stock (CAP OL, CAP-C1.5, evaluation). Voir `contenus/schneider-ent2210.js`.
// Séance réservée au CAP : `competences: []`, `competencesCap` seules. Jalons pondérés sur 20 (poids en tête du fichier de contenu).
import { seanceEntreprise } from '../core/types/seance-entreprise.js';
import * as SCHNEIDER from '../contenus/schneider.js';
import * as SEANCE from '../contenus/schneider-ent2210.js';
const s = seanceEntreprise(SCHNEIDER, SEANCE, {
  id: 'schneider-evaluation-stock',
  code: 'ENT-22.10',
  titre: 'Schneider Electric — évaluation : mettre en stock',
  desc: 'Seul(e) : ranger quatre palettes, lire une adresse, une palette trop lourde, l’inventaire du drone, puis rendre sa copie.',
  niveaux: ['cap'],
  competences: [],
  competencesCap: ['CAP-C1.5'],
  temps: 'evaluation',
  bareme: 20,
  copie: true,
  questions: 'ENT-22.10',
  pret: true,
  ouverture: 'prof',
}, SEANCE.OPTIONS);
export const meta = s.meta;
export const rendre = s.rendre;
export const noter = s.noter;
