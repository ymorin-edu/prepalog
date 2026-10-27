// ENT-20.3 — la fiche de Kevin (1re Bac Pro, C1.2, erreur induite). Voir `contenus/leroy-merlin-ent203.js`.
// Jalons pondérés sur 20 (poids en tête du fichier de contenu, décidés par Claude, délégation de Tristan du 26/10/2026).
import { seanceEntreprise } from '../core/types/seance-entreprise.js';
import * as LEROY from '../contenus/leroy-merlin.js';
import * as SEANCE from '../contenus/leroy-merlin-ent203.js';
const s = seanceEntreprise(LEROY, SEANCE, {
  id: 'leroy-merlin-kevin',
  code: 'ENT-20.3',
  titre: 'Leroy Merlin — la fiche de Kevin',
  desc: 'Kevin a rempli la fiche de sécurité de la semaine : trouver ses erreurs (risque ou mesure), les corriger et dire pourquoi.',
  niveaux: ['1re'],
  competences: ['C1.2'],
  temps: 'erreur',
  bareme: 20,
  parcours: true,
  correction: true,
  bilanDetail: true,
  precedente: 'leroy-merlin-quai',
  questions: 'ENT-20.3',
  pret: true,
  ouverture: 'prof',
}, SEANCE.OPTIONS);
export const meta = s.meta;
export const rendre = s.rendre;
