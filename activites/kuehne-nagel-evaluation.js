// ENT-24.5 — évaluation : préparer la réception (1re Bac Pro, C1.3, evaluation). Voir `contenus/kuehne-nagel-ent245.js`.
// Jalons pondérés sur 20 (poids en tête du fichier de contenu).
import { seanceEntreprise } from '../core/types/seance-entreprise.js';
import * as KN from '../contenus/kuehne-nagel.js';
import * as SEANCE from '../contenus/kuehne-nagel-ent245.js';
const s = seanceEntreprise(KN, SEANCE, {
  id: 'kuehne-nagel-evaluation',
  code: 'ENT-24.5',
  titre: 'Kuehne+Nagel — évaluation : préparer la réception',
  desc: 'Seul(e) : la zone et la durée de quatre envois, le planning des quais du mercredi, la reprise après deux changements, puis rendre sa copie.',
  niveaux: ['1re'],
  competences: ['C1.3'],
  temps: 'evaluation',
  bareme: 20,
  copie: true,
  questions: 'ENT-24.5',
  pret: true,
  ouverture: 'prof',
}, SEANCE.OPTIONS);
export const meta = s.meta;
export const rendre = s.rendre;
export const noter = s.noter;
