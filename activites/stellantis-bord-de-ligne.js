// ENT-13.6 — le bord de ligne, C2.3 (Terminale, guidage). Voir `contenus/stellantis-ent136.js`.
// Jalons pondérés sur 20 (poids en tête du fichier de contenu, décidés par Claude, délégation de Tristan du 27/10/2026).
import { seanceEntreprise } from '../core/types/seance-entreprise.js';
import * as STELLANTIS from '../contenus/stellantis.js';
import * as SEANCE from '../contenus/stellantis-ent136.js';
const s = seanceEntreprise(STELLANTIS, SEANCE, {
  id: 'stellantis-bord-de-ligne',
  code: 'ENT-13.6',
  titre: 'Stellantis Sochaux — le bord de ligne',
  desc: 'Approvisionner la ligne 3008 / 5008 : le kanban à deux contenants, une matinée guidée au bord de ligne (envoyer les robots à temps, grouper les cartes), ce que tient un poste.',
  niveaux: ['tle'],
  competences: ['C2.3'],
  temps: 'guidage',
  bareme: 20,
  parcours: true,                   // première séance du bord de ligne : pas de `precedente`
  correction: true,
  bilanDetail: true,
  niveauxPrevus: ['accompagne'],    // accompagné : la ligne tourne une fois et demie plus lentement
  questions: 'ENT-13.6',
  pret: true,
  ouverture: 'prof',
}, SEANCE.OPTIONS);
export const meta = s.meta;
export const rendre = s.rendre;
