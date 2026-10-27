// ENT-17.1 — emballer juste (Tle, C2.2 et C3.3, guidage). Voir `contenus/la-redoute-ent171.js`.
import { seanceEntreprise } from '../core/types/seance-entreprise.js';
import * as LA_REDOUTE from '../contenus/la-redoute.js';
import * as SEANCE from '../contenus/la-redoute-ent171.js';
const s = seanceEntreprise(LA_REDOUTE, SEANCE, {
  id: 'la-redoute-emballage',
  code: 'ENT-17.1',
  titre: 'La Redoute — emballer juste',
  desc: 'Adjoint(e) au poste emballage d’un grand entrepôt du e-commerce : choisir le plus petit emballage qui convient, mesurer le vide et le carton économisé, proposer une amélioration.',
  niveaux: ['tle'],
  competences: ['C2.2', 'C3.3'],
  temps: 'guidage',
  bareme: 20,
  reinitialisable: true,
  correction: true,
  questions: 'ENT-17.1',
  pret: true,
  ouverture: 'prof',
}, SEANCE.OPTIONS);
export const meta = s.meta;
export const rendre = s.rendre;
