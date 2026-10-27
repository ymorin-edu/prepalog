// ENT-18.2 — Les expéditions de mardi (Tle, C2.6, entraînement). Voir `contenus/airbus-ent182.js`.
import { seanceEntreprise } from '../core/types/seance-entreprise.js';
import * as AIRBUS from '../contenus/airbus.js';
import * as SEANCE from '../contenus/airbus-ent182.js';
const s = seanceEntreprise(AIRBUS, SEANCE, {
  id: 'airbus-expeditions-mardi',
  code: 'ENT-18.2',
  titre: 'Airbus Helicopters — les expéditions de mardi',
  desc: 'Cinq pièces de rechange à confier aux prestataires : délais, longueurs, distances, poids taxable et coût.',
  niveaux: ['tle'],
  competences: ['C2.6'],
  temps: 'entrainement',
  bareme: 20,
  correction: true,
  questions: 'ENT-18.2',
  pret: true,
  ouverture: 'prof',
}, SEANCE.OPTIONS);
export const meta = s.meta;
export const rendre = s.rendre;
