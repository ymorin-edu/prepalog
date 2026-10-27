// ENT-22.1 — bienvenue à Évreux (CAP OL, CAP-C1.1, entrainement). Voir `contenus/schneider-ent221.js`.
// Séance réservée au CAP : `competences: []`, `competencesCap` seules. Jalons pondérés sur 20 (poids en tête du fichier de contenu).
import { seanceEntreprise } from '../core/types/seance-entreprise.js';
import * as SCHNEIDER from '../contenus/schneider.js';
import * as SEANCE from '../contenus/schneider-ent221.js';
const s = seanceEntreprise(SCHNEIDER, SEANCE, {
  id: 'schneider-bienvenue',
  code: 'ENT-22.1',
  titre: 'Schneider Electric — bienvenue à Évreux',
  desc: 'Stagiaire au centre de distribution d’Évreux : qui fait quoi, trois lieux du groupe sur la carte, le voyage d’un produit et les outils du centre.',
  niveaux: ['cap'],
  competences: [],
  competencesCap: ['CAP-C1.1'],
  temps: 'entrainement',
  bareme: 20,
  parcours: true,                   // première séance du parcours Schneider Electric (pas de `precedente`)
  correction: true,
  bilanDetail: true,
  reinitialisable: true,
  questions: 'ENT-22.1',
  pret: true,
  ouverture: 'prof',
}, SEANCE.OPTIONS);
export const meta = s.meta;
export const rendre = s.rendre;
