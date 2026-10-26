// ENT-13.2 — Stellantis Sochaux, « les camions du matin » (Terminale, la rentrée, entraînement). Voir `contenus/stellantis-ent132.js`.
import { seanceEntreprise } from '../core/types/seance-entreprise.js';
import * as STELLANTIS from '../contenus/stellantis.js';
import * as SEANCE from '../contenus/stellantis-ent132.js';
const s = seanceEntreprise(STELLANTIS, SEANCE, {
  id: 'stellantis-camions-du-matin',
  code: 'ENT-13.2',
  titre: 'Stellantis Sochaux — les camions du matin',
  desc: 'Poser les camions des fournisseurs sur les quais de l’usine en servant d’abord la pièce qui va manquer à la ligne, puis recevoir un camion de pièces et écrire des réserves précises.',
  niveaux: ['tle'],
  niveauxPrevus: ['confirme'],
  competences: ['C1.3', 'C1.4'],
  temps: 'entrainement',
  bareme: 20,
  questions: 'ENT-13.2',
  parcours: true,
  suiteAuBilan: true,
  pret: true,
  ouverture: 'prof',
}, SEANCE.OPTIONS);
export const meta = s.meta;
export const rendre = s.rendre;
