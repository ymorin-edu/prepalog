// ENT-18.5 — Évaluation : confier les expéditions (Tle, C2.6 et C3.1, évaluation). Voir `contenus/airbus-ent185.js`.
import { seanceEntreprise } from '../core/types/seance-entreprise.js';
import * as AIRBUS from '../contenus/airbus.js';
import * as SEANCE from '../contenus/airbus-ent185.js';
const s = seanceEntreprise(AIRBUS, SEANCE, {
  id: 'airbus-evaluation',
  code: 'ENT-18.5',
  titre: 'Airbus Helicopters — évaluation : confier les expéditions',
  desc: 'Seul(e) : confier quatre expéditions (encombrant, hélicoptère au sol, batterie lithium-ion), calculer, rendre compte, puis rendre sa copie.',
  niveaux: ['tle'],
  competences: ['C2.6', 'C3.1'],
  temps: 'evaluation',
  bareme: 20,
  copie: true,
  questions: 'ENT-18.5',
  pret: true,
  ouverture: 'prof',
}, SEANCE.OPTIONS);
export const meta = s.meta;
export const rendre = s.rendre;
export const noter = s.noter;
