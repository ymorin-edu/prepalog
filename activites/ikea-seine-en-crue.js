// ENT-12.3 — IKEA, « la Seine est en crue » (2de, poste B, transport, entraînement). Voir `contenus/ikea-ent123.js`.
import { seanceEntreprise } from '../core/types/seance-entreprise.js';
import * as IKEA from '../contenus/ikea.js';
import * as SEANCE from '../contenus/ikea-ent123.js';
const s = seanceEntreprise(IKEA, SEANCE, {
  id: 'ikea-seine-en-crue',
  code: 'ENT-12.3',
  titre: 'IKEA — la Seine est en crue',
  desc: 'La péniche ne peut plus passer dans Paris : replanifier les livraisons du jour en camion, tenir les créneaux promis aux clients, prévenir ceux qu’on ne pourra pas livrer '
    + 'et répondre à une cliente qui veut annuler.',
  niveaux: ['2de'],
  competences: ['OTM-C3.1', 'OTM-C1.2'],
  domaines: ['D2'],
  temps: 'entrainement',
  bareme: 20,
  questions: 'ENT-12.3',
  pret: true,
  ouverture: 'prof',
}, SEANCE.OPTIONS);
export const meta = s.meta;
export const rendre = s.rendre;
