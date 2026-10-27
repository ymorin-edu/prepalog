// ENT-13.7 — la matinée sans aide, C2.3 (Terminale, entrainement). Voir `contenus/stellantis-ent137.js`.
// Jalons pondérés sur 20 (poids en tête du fichier de contenu, décidés par Claude, délégation de Tristan du 27/10/2026).
import { seanceEntreprise } from '../core/types/seance-entreprise.js';
import * as STELLANTIS from '../contenus/stellantis.js';
import * as SEANCE from '../contenus/stellantis-ent137.js';
const s = seanceEntreprise(STELLANTIS, SEANCE, {
  id: 'stellantis-matinee-sans-aide',
  code: 'ENT-13.7',
  titre: 'Stellantis Sochaux — la matinée sans aide',
  desc: 'Compter ce que consomme la ligne en une heure, puis tenir seul(e) le bord de ligne pendant 90 minutes, à la vraie vitesse.',
  niveaux: ['tle'],
  competences: ['C2.3'],
  temps: 'entrainement',
  bareme: 20,
  parcours: true,
  correction: true,
  bilanDetail: true,
  precedente: 'stellantis-bord-de-ligne',
  niveauxPrevus: ['confirme', 'accompagne'],   // confirmé : un cinquième poste (faisceaux) ; accompagné : la ligne plus lente
  questions: 'ENT-13.7',
  pret: true,
  ouverture: 'prof',
}, SEANCE.OPTIONS);
export const meta = s.meta;
export const rendre = s.rendre;
