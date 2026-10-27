// ENT-16.6 — évaluation : piloter l’entrepôt (Tle, C1.6, C2.2, C3.1, évaluation). Voir `contenus/royal-canin-ent166.js`.
import { seanceEntreprise } from '../core/types/seance-entreprise.js';
import * as ROYAL_CANIN from '../contenus/royal-canin.js';
import * as SEANCE from '../contenus/royal-canin-ent166.js';
const s = seanceEntreprise(ROYAL_CANIN, SEANCE, {
  id: 'royal-canin-evaluation',
  code: 'ENT-16.6',
  titre: 'Royal Canin — évaluation : piloter l’entrepôt',
  desc: 'Seul(e) : les indicateurs du mois au tableur (un seul dépôt), l’implantation de deux références et une commande export avec exigence de durée de vie, puis rendre sa copie.',
  niveaux: ['tle'],
  competences: ['C1.6', 'C2.2', 'C3.1'],
  temps: 'evaluation',
  bareme: 20,
  copie: true,
  questions: 'ENT-16.6',
  pret: true,
  ouverture: 'prof',
}, SEANCE.OPTIONS);
export const meta = s.meta;
export const rendre = s.rendre;
export const noter = s.noter;
