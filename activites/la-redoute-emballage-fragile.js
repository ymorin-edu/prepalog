// ENT-17.2 — emballer juste, avec du fragile (Tle, C2.2 et C3.3, entraînement). Voir `contenus/la-redoute-ent172.js`.
import { seanceEntreprise } from '../core/types/seance-entreprise.js';
import * as LA_REDOUTE from '../contenus/la-redoute.js';
import * as SEANCE from '../contenus/la-redoute-ent172.js';
const s = seanceEntreprise(LA_REDOUTE, SEANCE, {
  id: 'la-redoute-emballage-fragile',
  code: 'ENT-17.2',
  titre: 'La Redoute — emballer juste, avec du fragile',
  desc: 'Huit commandes à emballer, dont des articles fragiles : calage, taux de vide, carton économisé et amélioration proposée.',
  niveaux: ['tle'],
  competences: ['C2.2', 'C3.3'],
  temps: 'entrainement',
  bareme: 20,
  correction: true,
  questions: 'ENT-17.2',
  pret: true,
  ouverture: 'prof',
}, SEANCE.OPTIONS);
export const meta = s.meta;
export const rendre = s.rendre;
