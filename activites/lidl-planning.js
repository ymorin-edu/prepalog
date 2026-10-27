// ENT-21.2 — le planning du lundi (2de GATL, C1.3, entraînement). Voir `contenus/lidl-ent212.js`.
// Jalons pondérés sur 20 (poids en tête du fichier de contenu, décidés par Claude, délégation de Tristan du 26/10/2026).
import { seanceEntreprise } from '../core/types/seance-entreprise.js';
import * as LIDL from '../contenus/lidl.js';
import * as SEANCE from '../contenus/lidl-ent212.js';
const s = seanceEntreprise(LIDL, SEANCE, {
  id: 'lidl-planning',
  code: 'ENT-21.2',
  titre: 'Lidl — le planning du lundi',
  desc: 'Six demandes de rendez-vous : la zone de chaque camion, son créneau d’après la règle des quais, la durée d’un déchargement, un camion de surgelés en retard.',
  niveaux: ['2de'],
  competences: ['C1.3'],
  temps: 'entrainement',
  bareme: 20,
  parcours: true,
  correction: true,
  bilanDetail: true,
  precedente: 'lidl-bienvenue',
  questions: 'ENT-21.2',
  pret: true,
  ouverture: 'prof',
}, SEANCE.OPTIONS);
export const meta = s.meta;
export const rendre = s.rendre;
