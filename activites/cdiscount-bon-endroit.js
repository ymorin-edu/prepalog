// ENT-2.7 — Cdiscount, les bons articles au bon endroit (1re, C2.2, guidage). Voir `contenus/cdiscount-ent27.js`.
import { seanceEntreprise } from '../core/types/seance-entreprise.js';
import * as CDISCOUNT from '../contenus/cdiscount.js';
import * as SEANCE from '../contenus/cdiscount-ent27.js';
const s = seanceEntreprise(CDISCOUNT, SEANCE, {
  id: 'cdiscount-bon-endroit',
  code: 'ENT-2.7',
  titre: 'Cdiscount — les bons articles au bon endroit',
  desc: 'Préparateur(trice) de la zone manuelle, après le Black Friday : trouver la classe A d’après les lignes de la semaine, la rapprocher du poste d’emballage et chiffrer la marche gagnée.',
  niveaux: ['1re'],
  competences: ['C2.2'],
  temps: 'guidage',
  bareme: 20,
  correction: true,
  questions: 'ENT-2.7',
  pret: true,
  ouverture: 'prof',
}, SEANCE.OPTIONS);
export const meta = s.meta;
export const rendre = s.rendre;
