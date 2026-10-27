// ENT-20.2 — le protocole au quai (1re Bac Pro, C1.2, entraînement). Voir `contenus/leroy-merlin-ent202.js`.
// Jalons pondérés sur 20 (poids en tête du fichier de contenu, décidés par Claude, délégation de Tristan du 26/10/2026).
import { seanceEntreprise } from '../core/types/seance-entreprise.js';
import * as LEROY from '../contenus/leroy-merlin.js';
import * as SEANCE from '../contenus/leroy-merlin-ent202.js';
const s = seanceEntreprise(LEROY, SEANCE, {
  id: 'leroy-merlin-quai',
  code: 'ENT-20.2',
  titre: 'Leroy Merlin — le protocole au quai',
  desc: 'Le protocole de sécurité au quai dans l’ordre, le niveau de chaque mesure de prévention, puis les deux taux d’accidents de l’année.',
  niveaux: ['1re'],
  competences: ['C1.2'],
  temps: 'entrainement',
  bareme: 20,
  parcours: true,
  correction: true,
  bilanDetail: true,
  precedente: 'leroy-merlin-risques',
  questions: 'ENT-20.2',
  pret: true,
  ouverture: 'prof',
}, SEANCE.OPTIONS);
export const meta = s.meta;
export const rendre = s.rendre;
