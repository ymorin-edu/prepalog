// ENT-15.4 — Syngenta, évaluation du rangement (1re, C3.1 et C1.5, evaluation). Voir `contenus/syngenta-ent154.js`.
import { seanceEntreprise } from '../core/types/seance-entreprise.js';
import * as SYNGENTA from '../contenus/syngenta.js';
import * as SEANCE from '../contenus/syngenta-ent154.js';
const s = seanceEntreprise(SYNGENTA, SEANCE, {
  id: 'syngenta-evaluation',
  code: 'ENT-15.4',
  titre: 'Syngenta — évaluation du rangement',
  desc: 'Seul(e) : ranger des palettes de produits dangereux selon leurs pictogrammes, calculer une rétention, rendre compte, puis rendre sa copie.',
  niveaux: ['1re'],
  competences: ['C3.1', 'C1.5'],
  temps: 'evaluation',
  bareme: 20,
  copie: true,
  questions: 'ENT-15.4',
  pret: true,
  ouverture: 'prof',
}, SEANCE.OPTIONS);
export const meta = s.meta;
export const rendre = s.rendre;
export const noter = s.noter;
