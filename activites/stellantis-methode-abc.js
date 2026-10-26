// ENT-13.3 — Stellantis Sochaux, « la méthode ABC au tableur » (Terminale, la rentrée, guidage). Voir `contenus/stellantis-ent133.js`.
import { seanceEntreprise } from '../core/types/seance-entreprise.js';
import * as STELLANTIS from '../contenus/stellantis.js';
import * as SEANCE from '../contenus/stellantis-ent133.js';
const s = seanceEntreprise(STELLANTIS, SEANCE, {
  id: 'stellantis-methode-abc',
  code: 'ENT-13.3',
  titre: 'Stellantis Sochaux — la méthode ABC au tableur',
  desc: 'Exporter les sorties de la semaine du magasin des petites pièces, les classer en A, B et C dans le tableur avec des formules, puis décider où ranger chaque référence.',
  niveaux: ['tle'],
  niveauxPrevus: ['confirme'],
  competences: ['C1.5', 'C1.6'],
  temps: 'guidage',
  bareme: 20,
  questions: 'ENT-13.3',
  parcours: true,
  suiteAuBilan: true,
  pret: true,
  ouverture: 'prof',
}, SEANCE.OPTIONS);
export const meta = s.meta;
export const rendre = s.rendre;
