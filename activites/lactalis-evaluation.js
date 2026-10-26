// ENT-14.4 — Lactalis, évaluation de la traçabilité (1re, C3.2, copie rendue). Voir `contenus/lactalis-ent144.js`.
import { seanceEntreprise } from '../core/types/seance-entreprise.js';
import * as LACTALIS from '../contenus/lactalis.js';
import * as SEANCE from '../contenus/lactalis-ent144.js';
const s = seanceEntreprise(LACTALIS, SEANCE, {
  id: 'lactalis-evaluation',
  code: 'ENT-14.4',
  titre: 'Lactalis — évaluation de la traçabilité',
  desc: 'Traiter seul(e) un avis de rappel de laits infantiles : lots visés d’après la date de fabrication, magasins livrés (dont après l’avis), '
    + 'blocage du stock restant et compte rendu, puis rendre sa copie.',
  niveaux: ['1re'],
  competences: ['C3.2'],
  temps: 'evaluation',
  bareme: 20,
  copie: true,
  questions: 'ENT-14.4',
  pret: true,
  ouverture: 'prof',
}, SEANCE.OPTIONS);
export const meta = s.meta;
export const rendre = s.rendre;
export const noter = s.noter;
