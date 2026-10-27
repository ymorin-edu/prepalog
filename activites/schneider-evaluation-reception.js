// ENT-22.6 — évaluation : recevoir un camion (CAP OL, CAP-C1.3 et CAP-C1.4, evaluation). Voir `contenus/schneider-ent226.js`.
// Séance réservée au CAP : `competences: []`, `competencesCap` seules. Jalons pondérés sur 20 (poids en tête du fichier de contenu).
import { seanceEntreprise } from '../core/types/seance-entreprise.js';
import * as SCHNEIDER from '../contenus/schneider.js';
import * as SEANCE from '../contenus/schneider-ent226.js';
const s = seanceEntreprise(SCHNEIDER, SEANCE, {
  id: 'schneider-evaluation-reception',
  code: 'ENT-22.6',
  titre: 'Schneider Electric — évaluation : recevoir un camion',
  desc: 'Seul(e) : le planigramme, deux pré-contrôles, les colis lourds, le contrôle ligne par ligne et la réserve, puis rendre sa copie.',
  niveaux: ['cap'],
  competences: [],
  competencesCap: ['CAP-C1.3', 'CAP-C1.4'],
  temps: 'evaluation',
  bareme: 20,
  copie: true,
  questions: 'ENT-22.6',
  pret: true,
  ouverture: 'prof',
}, SEANCE.OPTIONS);
export const meta = s.meta;
export const rendre = s.rendre;
export const noter = s.noter;
