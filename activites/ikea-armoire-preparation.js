// ENT-12.6 — IKEA, « l'armoire de Mme Benali » (2de, poste C, logistique, découverte de C2.2 et de C2.1). Voir `contenus/ikea-ent126.js`.
import { seanceEntreprise } from '../core/types/seance-entreprise.js';
import * as IKEA from '../contenus/ikea.js';
import * as SEANCE from '../contenus/ikea-ent126.js';
const s = seanceEntreprise(IKEA, SEANCE, {
  id: 'ikea-armoire-preparation',
  code: 'ENT-12.6',
  titre: 'IKEA — l’armoire de Mme Benali',
  desc: 'Employé(e) logistique au centre de Gennevilliers : préparer deux commandes de meubles en colis lourds et longs, dans le bon ordre et sans se blesser, puis vérifier qu’elles tiennent dans la caisse mobile.',
  niveaux: ['2de'],
  competences: ['C2.2', 'C2.1'],
  domaines: ['D4'],
  temps: 'guidage',
  bareme: 20,
  questions: 'ENT-12.6',
  parcours: true,
  correction: true,
  reinitialisable: true,
  pret: true,
  ouverture: 'prof',
}, SEANCE.OPTIONS);
export const meta = s.meta;
export const rendre = s.rendre;
