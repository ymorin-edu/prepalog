// ENT-22.2 — accueillir un camion (CAP OL, CAP-C1.3, guidage). Voir `contenus/schneider-ent222.js`.
// Séance réservée au CAP : `competences: []`, `competencesCap` seules. Jalons pondérés sur 20 (poids en tête du fichier de contenu).
import { seanceEntreprise } from '../core/types/seance-entreprise.js';
import * as SCHNEIDER from '../contenus/schneider.js';
import * as SEANCE from '../contenus/schneider-ent222.js';
const s = seanceEntreprise(SCHNEIDER, SEANCE, {
  id: 'schneider-accueil',
  code: 'ENT-22.2',
  titre: 'Schneider Electric — accueillir un camion',
  desc: 'Au quai avec Nadia : le planigramme, le protocole de sécurité, le pré-contrôle du camion et les colis trop lourds pour une seule personne.',
  niveaux: ['cap'],
  competences: [],
  competencesCap: ['CAP-C1.3'],
  temps: 'guidage',
  bareme: 20,
  parcours: true,
  correction: true,
  bilanDetail: true,
  precedente: 'schneider-bienvenue',
  questions: 'ENT-22.2',
  pret: true,
  ouverture: 'prof',
}, SEANCE.OPTIONS);
export const meta = s.meta;
export const rendre = s.rendre;
