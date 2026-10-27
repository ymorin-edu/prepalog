// ENT-22.9 — le centre circulaire (CAP OL, CAP-C3.7 et CAP-C3.6, entrainement). Voir `contenus/schneider-ent229.js`.
// Séance réservée au CAP : `competences: []`, `competencesCap` seules. Jalons pondérés sur 20 (poids en tête du fichier de contenu).
import { seanceEntreprise } from '../core/types/seance-entreprise.js';
import * as SCHNEIDER from '../contenus/schneider.js';
import * as SEANCE from '../contenus/schneider-ent229.js';
const s = seanceEntreprise(SCHNEIDER, SEANCE, {
  id: 'schneider-circulaire',
  code: 'ENT-22.9',
  titre: 'Schneider Electric — le centre circulaire',
  desc: 'Le premier centre de distribution circulaire du groupe : trier les déchets du quai, les faits et leurs conséquences, les écogestes.',
  niveaux: ['cap'],
  competences: [],
  competencesCap: ['CAP-C3.7', 'CAP-C3.6'],
  temps: 'entrainement',
  bareme: 20,
  parcours: true,
  correction: true,
  bilanDetail: true,
  precedente: 'schneider-drone',
  questions: 'ENT-22.9',
  pret: true,
  ouverture: 'prof',
}, SEANCE.OPTIONS);
export const meta = s.meta;
export const rendre = s.rendre;
