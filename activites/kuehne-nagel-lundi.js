// ENT-24.3 — le lundi chargé (1re Bac Pro, C1.3, entrainement). Voir `contenus/kuehne-nagel-ent243.js`.
// Jalons pondérés sur 20 (poids en tête du fichier de contenu).
import { seanceEntreprise } from '../core/types/seance-entreprise.js';
import * as KN from '../contenus/kuehne-nagel.js';
import * as SEANCE from '../contenus/kuehne-nagel-ent243.js';
const s = seanceEntreprise(KN, SEANCE, {
  id: 'kuehne-nagel-lundi',
  code: 'ENT-24.3',
  titre: 'Kuehne+Nagel — le lundi chargé',
  desc: 'Seul(e) : le planning des quais d’un lundi chargé, puis la porte froide du quai 2 se bloque ; reprendre avec un seul quai froid et prévenir les bonnes personnes.',
  niveaux: ['1re'],
  competences: ['C1.3'],
  temps: 'entrainement',
  bareme: 20,
  parcours: true,
  correction: true,
  bilanDetail: true,
  precedente: 'kuehne-nagel-planning',
  questions: 'ENT-24.3',
  pret: true,
  ouverture: 'prof',
}, SEANCE.OPTIONS);
export const meta = s.meta;
export const rendre = s.rendre;
