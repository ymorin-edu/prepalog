// ENT-18.1 — Confier les expéditions (Tle, C2.6, guidage). Voir `contenus/airbus-ent181.js`.
import { seanceEntreprise } from '../core/types/seance-entreprise.js';
import * as AIRBUS from '../contenus/airbus.js';
import * as SEANCE from '../contenus/airbus-ent181.js';
const s = seanceEntreprise(AIRBUS, SEANCE, {
  id: 'airbus-expeditions',
  code: 'ENT-18.1',
  titre: 'Airbus Helicopters — confier les expéditions',
  desc: 'Adjoint(e) au service expéditions d’un constructeur d’hélicoptères : choisir le prestataire de transport de chaque pièce, calculer poids taxable et coût.',
  niveaux: ['tle'],
  competences: ['C2.6'],
  temps: 'guidage',
  bareme: 20,
  reinitialisable: true,
  correction: true,
  questions: 'ENT-18.1',
  pret: true,
  ouverture: 'prof',
}, SEANCE.OPTIONS);
export const meta = s.meta;
export const rendre = s.rendre;
