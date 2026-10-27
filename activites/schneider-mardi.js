// ENT-22.3 — les camions du mardi (CAP OL, CAP-C1.3, entrainement). Voir `contenus/schneider-ent223.js`.
// Séance réservée au CAP : `competences: []`, `competencesCap` seules. Jalons pondérés sur 20 (poids en tête du fichier de contenu).
import { seanceEntreprise } from '../core/types/seance-entreprise.js';
import * as SCHNEIDER from '../contenus/schneider.js';
import * as SEANCE from '../contenus/schneider-ent223.js';
const s = seanceEntreprise(SCHNEIDER, SEANCE, {
  id: 'schneider-mardi',
  code: 'ENT-22.3',
  titre: 'Schneider Electric — les camions du mardi',
  desc: 'Seul(e) au quai : quatre camions, un camion en avance, quatre pré-contrôles et les colis lourds, puis le compte rendu.',
  niveaux: ['cap'],
  competences: [],
  competencesCap: ['CAP-C1.3'],
  temps: 'entrainement',
  bareme: 20,
  parcours: true,
  correction: true,
  bilanDetail: true,
  precedente: 'schneider-accueil',
  questions: 'ENT-22.3',
  pret: true,
  ouverture: 'prof',
}, SEANCE.OPTIONS);
export const meta = s.meta;
export const rendre = s.rendre;
