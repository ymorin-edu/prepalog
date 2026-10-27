// ENT-20.6 — le samedi du service clients (1re Bac Pro, C2.1, entraînement). Voir `contenus/leroy-merlin-ent206.js`.
// Jalons pondérés sur 20 (poids en tête du fichier de contenu, décidés par Claude, délégation de Tristan du 26/10/2026).
import { seanceEntreprise } from '../core/types/seance-entreprise.js';
import * as LEROY from '../contenus/leroy-merlin.js';
import * as SEANCE from '../contenus/leroy-merlin-ent206.js';
const s = seanceEntreprise(LEROY, SEANCE, {
  id: 'leroy-merlin-samedi',
  code: 'ENT-20.6',
  titre: 'Leroy Merlin — le samedi du service clients',
  desc: 'Cinq demandes, quatre commandes passées en fin de semaine (le dimanche ne compte pas), le taux de service de la semaine.',
  niveaux: ['1re'],
  competences: ['C2.1'],
  temps: 'entrainement',
  bareme: 20,
  parcours: true,
  correction: true,
  bilanDetail: true,
  precedente: 'leroy-merlin-clients',
  questions: 'ENT-20.6',
  pret: true,
  ouverture: 'prof',
}, SEANCE.OPTIONS);
export const meta = s.meta;
export const rendre = s.rendre;
