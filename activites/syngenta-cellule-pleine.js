// ENT-15.2 — Syngenta, la cellule pleine (1re, C3.1 et C1.5, entrainement). Voir `contenus/syngenta-ent152.js`.
import { seanceEntreprise } from '../core/types/seance-entreprise.js';
import * as SYNGENTA from '../contenus/syngenta.js';
import * as SEANCE from '../contenus/syngenta-ent152.js';
const s = seanceEntreprise(SYNGENTA, SEANCE, {
  id: 'syngenta-cellule-pleine',
  code: 'ENT-15.2',
  titre: 'Syngenta — la cellule pleine',
  desc: 'Ranger huit palettes de produits dangereux quand une cellule est pleine, et vérifier si les rétentions suffisent encore.',
  niveaux: ['1re'],
  competences: ['C3.1', 'C1.5'],
  temps: 'entrainement',
  bareme: 20,
  correction: true,
  questions: 'ENT-15.2',
  pret: true,
  ouverture: 'prof',
}, SEANCE.OPTIONS);
export const meta = s.meta;
export const rendre = s.rendre;
