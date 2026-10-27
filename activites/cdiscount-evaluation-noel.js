// ENT-2.10 — Cdiscount, préparer la semaine de Noël (1re, C2.2, evaluation). Voir `contenus/cdiscount-ent210.js`.
import { seanceEntreprise } from '../core/types/seance-entreprise.js';
import * as CDISCOUNT from '../contenus/cdiscount.js';
import * as SEANCE from '../contenus/cdiscount-ent210.js';
const s = seanceEntreprise(CDISCOUNT, SEANCE, {
  id: 'cdiscount-evaluation-noel',
  code: 'ENT-2.10',
  titre: 'Cdiscount — préparer la semaine de Noël',
  desc: 'Seul(e) : classe A et emplacements, méthode de préparation de la vague, effectif du jour de pic, puis rendre sa copie.',
  niveaux: ['1re'],
  competences: ['C2.2'],
  temps: 'evaluation',
  bareme: 20,
  copie: true,
  questions: 'ENT-2.10',
  pret: true,
  ouverture: 'prof',
}, SEANCE.OPTIONS);
export const meta = s.meta;
export const rendre = s.rendre;
export const noter = s.noter;
