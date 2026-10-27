// ENT-17.3 — trier les retours (Tle, C3.3, guidage). Voir `contenus/la-redoute-ent173.js`.
import { seanceEntreprise } from '../core/types/seance-entreprise.js';
import * as LA_REDOUTE from '../contenus/la-redoute.js';
import * as SEANCE from '../contenus/la-redoute-ent173.js';
const s = seanceEntreprise(LA_REDOUTE, SEANCE, {
  id: 'la-redoute-retours',
  code: 'ENT-17.3',
  titre: 'La Redoute — trier les retours',
  desc: 'Trier les retours clients selon leur état (stock, reconditionnement, don, recyclage, jamais de destruction), calculer le taux de remise en vente et proposer une amélioration.',
  niveaux: ['tle'],
  competences: ['C3.3'],
  temps: 'guidage',
  bareme: 20,
  correction: true,
  questions: 'ENT-17.3',
  pret: true,
  ouverture: 'prof',
}, SEANCE.OPTIONS);
export const meta = s.meta;
export const rendre = s.rendre;
