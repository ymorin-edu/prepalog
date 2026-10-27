// ENT-23.4 — la réclamation de Vannes (2de Bac Pro, C2.1, guidage). Voir `contenus/yves-rocher-ent234.js`.
// Jalons pondérés sur 20 (poids en tête du fichier de contenu).
import { seanceEntreprise } from '../core/types/seance-entreprise.js';
import * as YR from '../contenus/yves-rocher.js';
import * as SEANCE from '../contenus/yves-rocher-ent234.js';
const s = seanceEntreprise(YR, SEANCE, {
  id: 'yves-rocher-reclamation',
  code: 'ENT-23.4',
  titre: 'Yves Rocher — la réclamation de Vannes',
  desc: 'Avec Inès : vérifier, décider pour chaque article (renvoyer, remplacer, expliquer), le jour de la livraison, puis répondre à la boutique.',
  niveaux: ['2de'],
  competences: ['C2.1'],
  temps: 'guidage',
  bareme: 20,
  parcours: true,
  correction: true,
  bilanDetail: true,
  precedente: 'yves-rocher-controle',
  questions: 'ENT-23.4',
  pret: true,
  ouverture: 'prof',
}, SEANCE.OPTIONS);
export const meta = s.meta;
export const rendre = s.rendre;
