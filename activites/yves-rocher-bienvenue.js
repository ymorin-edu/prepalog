// ENT-23.1 — bienvenue à La Villouët (2de Bac Pro, C2.2, guidage). Voir `contenus/yves-rocher-ent231.js`.
// Jalons pondérés sur 20 (poids en tête du fichier de contenu).
import { seanceEntreprise } from '../core/types/seance-entreprise.js';
import * as YR from '../contenus/yves-rocher.js';
import * as SEANCE from '../contenus/yves-rocher-ent231.js';
const s = seanceEntreprise(YR, SEANCE, {
  id: 'yves-rocher-bienvenue',
  code: 'ENT-23.1',
  titre: 'Yves Rocher — bienvenue à La Villouët',
  desc: 'Stagiaire à la plateforme de La Gacilly : le voyage d’un gel douche, une commande de boutique en cartons complets ou au détail, et l’ordre de prélèvement.',
  niveaux: ['2de'],
  competences: ['C2.2'],
  temps: 'guidage',
  bareme: 20,
  parcours: true,                   // première séance du parcours Yves Rocher (pas de `precedente`)
  correction: true,
  bilanDetail: true,
  reinitialisable: true,
  questions: 'ENT-23.1',
  pret: true,
  ouverture: 'prof',
}, SEANCE.OPTIONS);
export const meta = s.meta;
export const rendre = s.rendre;
