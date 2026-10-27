// ENT-23.6 — évaluation : une commande et une réclamation (2de Bac Pro, C2.2, C2.1, evaluation). Voir `contenus/yves-rocher-ent236.js`.
// Jalons pondérés sur 20 (poids en tête du fichier de contenu).
import { seanceEntreprise } from '../core/types/seance-entreprise.js';
import * as YR from '../contenus/yves-rocher.js';
import * as SEANCE from '../contenus/yves-rocher-ent236.js';
const s = seanceEntreprise(YR, SEANCE, {
  id: 'yves-rocher-evaluation',
  code: 'ENT-23.6',
  titre: 'Yves Rocher — évaluation : une commande et une réclamation',
  desc: 'Seul(e) : préparer une commande, l’ordre de prélèvement, une adresse partagée du chariot et une réclamation, puis rendre sa copie.',
  niveaux: ['2de'],
  competences: ['C2.2', 'C2.1'],
  temps: 'evaluation',
  bareme: 20,
  copie: true,
  questions: 'ENT-23.6',
  pret: true,
  ouverture: 'prof',
}, SEANCE.OPTIONS);
export const meta = s.meta;
export const rendre = s.rendre;
export const noter = s.noter;
