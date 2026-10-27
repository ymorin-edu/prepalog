// ENT-22.4 — contrôler la livraison (CAP OL, CAP-C1.4, guidage). Voir `contenus/schneider-ent224.js`.
// Séance réservée au CAP : `competences: []`, `competencesCap` seules. Jalons pondérés sur 20 (poids en tête du fichier de contenu).
import { seanceEntreprise } from '../core/types/seance-entreprise.js';
import * as SCHNEIDER from '../contenus/schneider.js';
import * as SEANCE from '../contenus/schneider-ent224.js';
const s = seanceEntreprise(SCHNEIDER, SEANCE, {
  id: 'schneider-controle',
  code: 'ENT-22.4',
  titre: 'Schneider Electric — contrôler la livraison',
  desc: 'Le bon de livraison et le comptage : le statut de chaque ligne, les quantités, la décision et la réserve sur la lettre de voiture.',
  niveaux: ['cap'],
  competences: [],
  competencesCap: ['CAP-C1.4'],
  temps: 'guidage',
  bareme: 20,
  parcours: true,
  correction: true,
  bilanDetail: true,
  precedente: 'schneider-mardi',
  questions: 'ENT-22.4',
  pret: true,
  ouverture: 'prof',
}, SEANCE.OPTIONS);
export const meta = s.meta;
export const rendre = s.rendre;
