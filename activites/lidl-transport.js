// ENT-21.3 — combien coûte une livraison ? (2de GATL, OTM-C1.4, guidage). Voir `contenus/lidl-ent213.js`.
// Jalons pondérés sur 20 (poids en tête du fichier de contenu, décidés par Claude, délégation de Tristan du 26/10/2026).
import { seanceEntreprise } from '../core/types/seance-entreprise.js';
import * as LIDL from '../contenus/lidl.js';
import * as SEANCE from '../contenus/lidl-ent213.js';
const s = seanceEntreprise(LIDL, SEANCE, {
  id: 'lidl-transport',
  code: 'ENT-21.3',
  titre: 'Lidl — combien coûte une livraison ?',
  desc: 'Au service transport : la zone tarifaire de trois magasins, le prix d’une livraison avec la grille du transporteur, le coût de revient et le prix de vente avec notre camion.',
  niveaux: ['2de'],
  competences: ['OTM-C1.4'],
  temps: 'guidage',
  bareme: 20,
  parcours: true,
  correction: true,
  bilanDetail: true,
  precedente: 'lidl-planning',
  questions: 'ENT-21.3',
  pret: true,
  ouverture: 'prof',
}, SEANCE.OPTIONS);
export const meta = s.meta;
export const rendre = s.rendre;
