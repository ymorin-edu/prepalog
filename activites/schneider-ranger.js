// ENT-22.7 — ranger dans la cellule (CAP OL, CAP-C1.5, guidage). Voir `contenus/schneider-ent227.js`.
// Séance réservée au CAP : `competences: []`, `competencesCap` seules. Jalons pondérés sur 20 (poids en tête du fichier de contenu).
import { seanceEntreprise } from '../core/types/seance-entreprise.js';
import * as SCHNEIDER from '../contenus/schneider.js';
import * as SEANCE from '../contenus/schneider-ent227.js';
const s = seanceEntreprise(SCHNEIDER, SEANCE, {
  id: 'schneider-ranger',
  code: 'ENT-22.7',
  titre: 'Schneider Electric — ranger dans la cellule',
  desc: 'Avec Julien, le cariste : ranger quatre palettes selon la plaque de charge, les gestes du rangement, lire une adresse.',
  niveaux: ['cap'],
  competences: [],
  competencesCap: ['CAP-C1.5'],
  temps: 'guidage',
  bareme: 20,
  parcours: true,
  correction: true,
  bilanDetail: true,
  precedente: 'schneider-mehdi',
  questions: 'ENT-22.7',
  pret: true,
  ouverture: 'prof',
}, SEANCE.OPTIONS);
export const meta = s.meta;
export const rendre = s.rendre;
