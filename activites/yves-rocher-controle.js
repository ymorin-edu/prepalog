// ENT-23.3 — contrôler un carton (2de Bac Pro, C2.2, entrainement). Voir `contenus/yves-rocher-ent233.js`.
// Jalons pondérés sur 20 (poids en tête du fichier de contenu).
import { seanceEntreprise } from '../core/types/seance-entreprise.js';
import * as YR from '../contenus/yves-rocher.js';
import * as SEANCE from '../contenus/yves-rocher-ent233.js';
const s = seanceEntreprise(YR, SEANCE, {
  id: 'yves-rocher-controle',
  code: 'ENT-23.3',
  titre: 'Yves Rocher — contrôler un carton',
  desc: 'Le carton de Lorient au contrôle : ligne par ligne, ce qu’il faut ajouter et retirer, et les gestes qui évitent les erreurs.',
  niveaux: ['2de'],
  competences: ['C2.2'],
  temps: 'entrainement',
  bareme: 20,
  parcours: true,
  correction: true,
  bilanDetail: true,
  precedente: 'yves-rocher-chariot',
  questions: 'ENT-23.3',
  pret: true,
  ouverture: 'prof',
}, SEANCE.OPTIONS);
export const meta = s.meta;
export const rendre = s.rendre;
