// ENT-13.10 — l’équipe du matin (Terminale, C3.4, guidage). Voir `contenus/stellantis-ent1310.js`.
// Jalons pondérés sur 20 (poids en tête du fichier de contenu, décidés par Claude, délégation de Tristan du 26/10/2026).
import { seanceEntreprise } from '../core/types/seance-entreprise.js';
import * as STELLANTIS from '../contenus/stellantis.js';
import * as SEANCE from '../contenus/stellantis-ent1310.js';
const s = seanceEntreprise(STELLANTIS, SEANCE, {
  id: 'stellantis-equipe-matin',
  code: 'ENT-13.10',
  titre: 'Stellantis Sochaux — l’équipe du matin',
  desc: 'Chef d’équipe remplaçant : affecter quatre personnes à quatre postes selon leurs CACES, accueillir un intérimaire, écrire la consigne du jour, dire ce qui est vrai de ses droits.',
  niveaux: ['tle'],
  competences: ['C3.4'],
  temps: 'guidage',
  bareme: 20,
  parcours: true,                   // première séance de l’équipe (temps 2) : pas de `precedente` ; pas de remise à zéro (réservée aux séances X.1)
  correction: true,
  bilanDetail: true,
  questions: 'ENT-13.10',
  pret: true,
  ouverture: 'prof',
}, SEANCE.OPTIONS);
export const meta = s.meta;
export const rendre = s.rendre;

