// ENT-12.5 — IKEA, « les quais du mardi » (2de, poste C, logistique, découverte de C1.3). Voir `contenus/ikea-ent125.js`.
import { seanceEntreprise } from '../core/types/seance-entreprise.js';
import * as IKEA from '../contenus/ikea.js';
import * as SEANCE from '../contenus/ikea-ent125.js';
const s = seanceEntreprise(IKEA, SEANCE, {
  id: 'ikea-quais-du-mardi',
  code: 'ENT-12.5',
  titre: 'IKEA — les quais du mardi',
  desc: 'Employé(e) logistique au centre de Gennevilliers : poser les camions du matin sur les quais de réception, sans qu’ils se gênent, puis replanifier quand l’un d’eux arrive en retard.',
  niveaux: ['2de'],
  competences: ['C1.3'],
  domaines: ['D2'],
  temps: 'guidage',
  bareme: 20,
  questions: 'ENT-12.5',
  parcours: true,
  correction: true,
  reinitialisable: true,
  pret: true,
  ouverture: 'prof',
}, SEANCE.OPTIONS);
export const meta = s.meta;
export const rendre = s.rendre;
