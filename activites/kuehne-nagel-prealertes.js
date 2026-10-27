// ENT-24.1 — les pré-alertes de la nuit (1re Bac Pro, C1.3, guidage). Voir `contenus/kuehne-nagel-ent241.js`.
// Jalons pondérés sur 20 (poids en tête du fichier de contenu).
import { seanceEntreprise } from '../core/types/seance-entreprise.js';
import * as KN from '../contenus/kuehne-nagel.js';
import * as SEANCE from '../contenus/kuehne-nagel-ent241.js';
const s = seanceEntreprise(KN, SEANCE, {
  id: 'kuehne-nagel-prealertes',
  code: 'ENT-24.1',
  titre: 'Kuehne+Nagel — les pré-alertes de la nuit',
  desc: 'Stagiaire au hub aérien de Roissy-CDG : la zone de température de chaque envoi, le temps au quai, ce qu’on prépare avant le premier camion, qui passe en premier.',
  niveaux: ['1re'],
  competences: ['C1.3'],
  temps: 'guidage',
  bareme: 20,
  parcours: true,                   // première séance du parcours Kuehne+Nagel (pas de `precedente`)
  correction: true,
  bilanDetail: true,
  reinitialisable: true,
  questions: 'ENT-24.1',
  pret: true,
  ouverture: 'prof',
}, SEANCE.OPTIONS);
export const meta = s.meta;
export const rendre = s.rendre;
