// ENT-12.2 — IKEA, « la demande de Mme Benali » (2de, poste B, transport, guidage). Voir `contenus/ikea-ent122.js`.
import { seanceEntreprise } from '../core/types/seance-entreprise.js';
import * as IKEA from '../contenus/ikea.js';
import * as SEANCE from '../contenus/ikea-ent122.js';
const s = seanceEntreprise(IKEA, SEANCE, {
  id: 'ikea-demande-cliente',
  code: 'ENT-12.2',
  titre: 'IKEA — la demande de Mme Benali',
  desc: 'Agent(e) du service livraison au centre de Gennevilliers : appeler une cliente pour préparer sa livraison, puis choisir le bon mode de livraison pour chaque article '
    + 'et dire ce qu’elle paiera.',
  niveaux: ['2de'],
  competences: ['OTM-C1.1', 'OTM-C1.2'],
  domaines: ['D1'],
  temps: 'guidage',
  bareme: 20,
  questions: 'ENT-12.2',
  pret: true,
  ouverture: 'prof',
}, SEANCE.OPTIONS);
export const meta = s.meta;
export const rendre = s.rendre;
