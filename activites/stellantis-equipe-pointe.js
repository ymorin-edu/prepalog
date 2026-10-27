// ENT-13.11 — un absent, une pointe de 5008 (Terminale, C3.4, entrainement). Voir `contenus/stellantis-ent1311.js`.
// Jalons pondérés sur 20 (poids en tête du fichier de contenu, décidés par Claude, délégation de Tristan du 26/10/2026).
import { seanceEntreprise } from '../core/types/seance-entreprise.js';
import * as STELLANTIS from '../contenus/stellantis.js';
import * as SEANCE from '../contenus/stellantis-ent1311.js';
const s = seanceEntreprise(STELLANTIS, SEANCE, {
  id: 'stellantis-equipe-pointe',
  code: 'ENT-13.11',
  titre: 'Stellantis Sochaux — un absent, une pointe de 5008',
  desc: 'Réaffecter l’équipe sans un cariste, calculer la charge des kits et demander un renfort, aménager le poste d’une collègue d’après l’avis du médecin du travail, garder le secret médical.',
  niveaux: ['tle'],
  competences: ['C3.4'],
  temps: 'entrainement',
  bareme: 20,
  parcours: true,
  correction: true,
  bilanDetail: true,
  precedente: 'stellantis-equipe-matin',
  questions: 'ENT-13.11',
  pret: true,
  ouverture: 'prof',
}, SEANCE.OPTIONS);
export const meta = s.meta;
export const rendre = s.rendre;

