// ENT-2.9 — Cdiscount, le calcul de Yanis (1re, C2.2, erreur). Voir `contenus/cdiscount-ent29.js`.
import { seanceEntreprise } from '../core/types/seance-entreprise.js';
import * as CDISCOUNT from '../contenus/cdiscount.js';
import * as SEANCE from '../contenus/cdiscount-ent29.js';
const s = seanceEntreprise(CDISCOUNT, SEANCE, {
  id: 'cdiscount-calcul-yanis',
  code: 'ENT-2.9',
  titre: 'Cdiscount — le calcul de Yanis',
  desc: 'Contrôler le calcul de l’effectif du jour de pic fait par un collègue, trouver ses erreurs, refaire le calcul et chiffrer les lignes en retard.',
  niveaux: ['1re'],
  competences: ['C2.2'],
  temps: 'erreur',
  bareme: 20,
  correction: true,
  questions: 'ENT-2.9',
  pret: true,
  ouverture: 'prof',
}, SEANCE.OPTIONS);
export const meta = s.meta;
export const rendre = s.rendre;
