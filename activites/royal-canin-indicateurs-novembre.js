// ENT-16.2 — les indicateurs de novembre (Tle, C1.6, entraînement). Voir `contenus/royal-canin-ent162.js`.
import { seanceEntreprise } from '../core/types/seance-entreprise.js';
import * as ROYAL_CANIN from '../contenus/royal-canin.js';
import * as SEANCE from '../contenus/royal-canin-ent162.js';
const s = seanceEntreprise(ROYAL_CANIN, SEANCE, {
  id: 'royal-canin-indicateurs-novembre',
  code: 'ENT-16.2',
  titre: 'Royal Canin — les indicateurs de novembre',
  desc: 'Les indicateurs du stock de huit références avant le pic de fin d’année : rotation, couverture, ruptures, surstocks, taux de service, et les décisions qui en découlent.',
  niveaux: ['tle'],
  competences: ['C1.6'],
  temps: 'entrainement',
  bareme: 20,
  correction: true,
  questions: 'ENT-16.2',
  pret: true,
  ouverture: 'prof',
}, SEANCE.OPTIONS);
export const meta = s.meta;
export const rendre = s.rendre;
