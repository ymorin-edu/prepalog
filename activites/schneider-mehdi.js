// ENT-22.5 — le contrôle de Mehdi (CAP OL, CAP-C1.4, entrainement). Voir `contenus/schneider-ent225.js`.
// Séance réservée au CAP : `competences: []`, `competencesCap` seules. Jalons pondérés sur 20 (poids en tête du fichier de contenu).
import { seanceEntreprise } from '../core/types/seance-entreprise.js';
import * as SCHNEIDER from '../contenus/schneider.js';
import * as SEANCE from '../contenus/schneider-ent225.js';
const s = seanceEntreprise(SCHNEIDER, SEANCE, {
  id: 'schneider-mehdi',
  code: 'ENT-22.5',
  titre: 'Schneider Electric — le contrôle de Mehdi',
  desc: 'Mehdi s’est trompé dans son contrôle : trouver ses erreurs, refaire le contrôle, choisir la bonne décision et la bonne réserve.',
  niveaux: ['cap'],
  competences: [],
  competencesCap: ['CAP-C1.4'],
  temps: 'entrainement',
  bareme: 20,
  parcours: true,
  correction: true,
  bilanDetail: true,
  precedente: 'schneider-controle',
  questions: 'ENT-22.5',
  pret: true,
  ouverture: 'prof',
}, SEANCE.OPTIONS);
export const meta = s.meta;
export const rendre = s.rendre;
