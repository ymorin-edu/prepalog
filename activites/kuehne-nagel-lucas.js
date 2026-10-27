// ENT-24.4 — le planning de Lucas (1re Bac Pro, C1.3, entrainement). Voir `contenus/kuehne-nagel-ent244.js`.
// Jalons pondérés sur 20 (poids en tête du fichier de contenu).
import { seanceEntreprise } from '../core/types/seance-entreprise.js';
import * as KN from '../contenus/kuehne-nagel.js';
import * as SEANCE from '../contenus/kuehne-nagel-ent244.js';
const s = seanceEntreprise(KN, SEANCE, {
  id: 'kuehne-nagel-lucas',
  code: 'ENT-24.4',
  titre: 'Kuehne+Nagel — le planning de Lucas',
  desc: 'Lucas s’est trompé trois fois dans son planning : trouver le défaut de chaque ligne, corriger, dire quelles règles il a oubliées.',
  niveaux: ['1re'],
  competences: ['C1.3'],
  temps: 'entrainement',
  bareme: 20,
  parcours: true,
  correction: true,
  bilanDetail: true,
  precedente: 'kuehne-nagel-lundi',
  questions: 'ENT-24.4',
  pret: true,
  ouverture: 'prof',
}, SEANCE.OPTIONS);
export const meta = s.meta;
export const rendre = s.rendre;
