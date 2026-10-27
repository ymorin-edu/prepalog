// ENT-15.1 — Syngenta, ranger selon le danger (1re, C3.1 et C1.5, guidage). Voir `contenus/syngenta-ent151.js`.
import { seanceEntreprise } from '../core/types/seance-entreprise.js';
import * as SYNGENTA from '../contenus/syngenta.js';
import * as SEANCE from '../contenus/syngenta-ent151.js';
const s = seanceEntreprise(SYNGENTA, SEANCE, {
  id: 'syngenta-ranger',
  code: 'ENT-15.1',
  titre: 'Syngenta — ranger selon le danger',
  desc: 'Magasinier(ère) dans une usine de produits phytosanitaires classée Seveso : lire les pictogrammes, ranger chaque palette dans la cellule de son danger le plus fort et calculer la rétention nécessaire.',
  niveaux: ['1re'],
  competences: ['C3.1', 'C1.5'],
  temps: 'guidage',
  bareme: 20,
  reinitialisable: true,
  correction: true,
  questions: 'ENT-15.1',
  pret: true,
  ouverture: 'prof',
}, SEANCE.OPTIONS);
export const meta = s.meta;
export const rendre = s.rendre;
