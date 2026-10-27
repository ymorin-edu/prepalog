// ENT-21.1 — bienvenue à Meaux : préparer la réception (2de GATL, C1.3, guidage). Voir `contenus/lidl-ent211.js`.
// Jalons pondérés sur 20 (poids en tête du fichier de contenu, décidés par Claude, délégation de Tristan du 26/10/2026).
import { seanceEntreprise } from '../core/types/seance-entreprise.js';
import * as LIDL from '../contenus/lidl.js';
import * as SEANCE from '../contenus/lidl-ent211.js';
const s = seanceEntreprise(LIDL, SEANCE, {
  id: 'lidl-bienvenue',
  code: 'ENT-21.1',
  titre: 'Lidl — bienvenue à Meaux : préparer la réception',
  desc: 'Stagiaire à la plateforme de Meaux : la zone de température de chaque produit, le quai de chaque camion, les contrôles à l’arrivée, trois relevés de température.',
  niveaux: ['2de'],
  competences: ['C1.3'],
  temps: 'guidage',
  bareme: 20,
  parcours: true,                   // première séance du parcours Lidl (pas de `precedente`)
  correction: true,
  bilanDetail: true,
  reinitialisable: true,
  questions: 'ENT-21.1',
  pret: true,
  ouverture: 'prof',
}, SEANCE.OPTIONS);
export const meta = s.meta;
export const rendre = s.rendre;
