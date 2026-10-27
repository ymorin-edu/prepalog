// ENT-13.8 — le camion en retard, C2.3 et C3.4 (Terminale, erreur). Voir `contenus/stellantis-ent138.js`.
// Jalons pondérés sur 20 (poids en tête du fichier de contenu, décidés par Claude, délégation de Tristan du 27/10/2026).
import { seanceEntreprise } from '../core/types/seance-entreprise.js';
import * as STELLANTIS from '../contenus/stellantis.js';
import * as SEANCE from '../contenus/stellantis-ent138.js';
const s = seanceEntreprise(STELLANTIS, SEANCE, {
  id: 'stellantis-camion-en-retard',
  code: 'ENT-13.8',
  titre: 'Stellantis Sochaux — le camion en retard',
  desc: 'Un camion de planches de bord en retard : calculer l’heure où la ligne s’arrêterait et les voitures perdues, décider (convoi de secours, prévenir l’atelier), puis corriger la note d’un collègue.',
  niveaux: ['tle'],
  competences: ['C2.3', 'C3.4'],
  temps: 'erreur',
  bareme: 20,
  parcours: true,
  correction: true,
  bilanDetail: true,
  precedente: 'stellantis-matinee-sans-aide',
  niveauxPrevus: ['accompagne'],    // accompagné : la ligne plus lente
  questions: 'ENT-13.8',
  pret: true,
  ouverture: 'prof',
}, SEANCE.OPTIONS);
export const meta = s.meta;
export const rendre = s.rendre;
