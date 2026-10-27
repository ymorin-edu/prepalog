// ENT-16.1 — lire les indicateurs du stock (Tle, C1.6, guidage, au tableur). Voir `contenus/royal-canin-ent161.js`.
import { seanceEntreprise } from '../core/types/seance-entreprise.js';
import * as ROYAL_CANIN from '../contenus/royal-canin.js';
import * as SEANCE from '../contenus/royal-canin-ent161.js';
const s = seanceEntreprise(ROYAL_CANIN, SEANCE, {
  id: 'royal-canin-indicateurs',
  code: 'ENT-16.1',
  titre: 'Royal Canin — lire les indicateurs du stock',
  desc: 'Adjoint(e) à la responsable de l’entrepôt de produits finis d’une usine de croquettes : exporter l’état du stock, calculer au tableur rotation, couverture, alertes et taux de service, puis dire quoi faire.',
  niveaux: ['tle'],
  competences: ['C1.6'],
  temps: 'guidage',
  bareme: 20,
  reinitialisable: true,
  correction: true,
  questions: 'ENT-16.1',
  pret: true,
  ouverture: 'prof',
}, SEANCE.OPTIONS);
export const meta = s.meta;
export const rendre = s.rendre;
