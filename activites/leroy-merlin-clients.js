// ENT-20.5 — le service clients (1re Bac Pro, C2.1, guidage). Voir `contenus/leroy-merlin-ent205.js`.
// Jalons pondérés sur 20 (poids en tête du fichier de contenu, décidés par Claude, délégation de Tristan du 26/10/2026).
import { seanceEntreprise } from '../core/types/seance-entreprise.js';
import * as LEROY from '../contenus/leroy-merlin.js';
import * as SEANCE from '../contenus/leroy-merlin-ent205.js';
const s = seanceEntreprise(LEROY, SEANCE, {
  id: 'leroy-merlin-clients',
  code: 'ENT-20.5',
  titre: 'Leroy Merlin — le service clients',
  desc: 'Clients internes (les magasins) et externes (le site internet) : quatre demandes, le poids et la date de livraison de trois commandes.',
  niveaux: ['1re'],
  competences: ['C2.1'],
  temps: 'guidage',
  bareme: 20,
  parcours: true,
  correction: true,
  bilanDetail: true,
  precedente: 'leroy-merlin-kevin',
  questions: 'ENT-20.5',
  pret: true,
  ouverture: 'prof',
}, SEANCE.OPTIONS);
export const meta = s.meta;
export const rendre = s.rendre;
