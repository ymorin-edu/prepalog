// ENT-21.5 — évaluation : chiffrer une livraison (2de GATL, OTM-C1.4, évaluation). Voir `contenus/lidl-ent215.js`.
// Jalons pondérés sur 20 (poids en tête du fichier de contenu, décidés par Claude, délégation de Tristan du 26/10/2026).
import { seanceEntreprise } from '../core/types/seance-entreprise.js';
import * as LIDL from '../contenus/lidl.js';
import * as SEANCE from '../contenus/lidl-ent215.js';
const s = seanceEntreprise(LIDL, SEANCE, {
  id: 'lidl-evaluation-transport',
  code: 'ENT-21.5',
  titre: 'Lidl — évaluation : chiffrer une livraison',
  desc: 'Seul(e) : la zone de trois magasins, le prix d’une livraison, le coût de revient et le prix de vente, puis rendre sa copie.',
  niveaux: ['2de'],
  competences: ['OTM-C1.4'],
  temps: 'evaluation',
  bareme: 20,
  copie: true,
  questions: 'ENT-21.5',
  pret: true,
  ouverture: 'prof',
}, SEANCE.OPTIONS);
export const meta = s.meta;
export const rendre = s.rendre;
export const noter = s.noter;
