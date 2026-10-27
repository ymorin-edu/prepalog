// ENT-23.2 — le chariot de quatre commandes (2de Bac Pro, C2.2, entrainement). Voir `contenus/yves-rocher-ent232.js`.
// Jalons pondérés sur 20 (poids en tête du fichier de contenu).
import { seanceEntreprise } from '../core/types/seance-entreprise.js';
import * as YR from '../contenus/yves-rocher.js';
import * as SEANCE from '../contenus/yves-rocher-ent232.js';
const s = seanceEntreprise(YR, SEANCE, {
  id: 'yves-rocher-chariot',
  code: 'ENT-23.2',
  titre: 'Yves Rocher — le chariot de quatre commandes',
  desc: 'Seul(e) avec un chariot de quatre bacs : préparer quatre lignes, l’ordre des arrêts, ce qu’on prend en une fois et le bac de chaque article.',
  niveaux: ['2de'],
  competences: ['C2.2'],
  temps: 'entrainement',
  bareme: 20,
  parcours: true,
  correction: true,
  bilanDetail: true,
  precedente: 'yves-rocher-bienvenue',
  questions: 'ENT-23.2',
  pret: true,
  ouverture: 'prof',
}, SEANCE.OPTIONS);
export const meta = s.meta;
export const rendre = s.rendre;
