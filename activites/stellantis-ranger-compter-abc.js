// ENT-13.4 — Stellantis Sochaux, « ranger et compter selon ABC » (Terminale, la rentrée, entraînement). Voir `contenus/stellantis-ent134.js`.
import { seanceEntreprise } from '../core/types/seance-entreprise.js';
import * as STELLANTIS from '../contenus/stellantis.js';
import * as SEANCE from '../contenus/stellantis-ent134.js';
const s = seanceEntreprise(STELLANTIS, SEANCE, {
  id: 'stellantis-ranger-compter-abc',
  code: 'ENT-13.4',
  titre: 'Stellantis Sochaux — ranger et compter selon ABC',
  desc: 'Ranger les palettes reçues selon leur classe de rotation, refaire seul le classement ABC sur la valeur, puis compter les références A et expliquer les écarts.',
  niveaux: ['tle'],
  niveauxPrevus: ['confirme'],
  competences: ['C1.5', 'C1.6'],
  temps: 'entrainement',
  bareme: 20,
  questions: 'ENT-13.4',
  parcours: true,
  suiteAuBilan: true,
  pret: true,
  ouverture: 'prof',
}, SEANCE.OPTIONS);
export const meta = s.meta;
export const rendre = s.rendre;
