// ENT-2.8 — Cdiscount, une tournée pour cinq commandes (1re, C2.2, entrainement). Voir `contenus/cdiscount-ent28.js`.
import { seanceEntreprise } from '../core/types/seance-entreprise.js';
import * as CDISCOUNT from '../contenus/cdiscount.js';
import * as SEANCE from '../contenus/cdiscount-ent28.js';
const s = seanceEntreprise(CDISCOUNT, SEANCE, {
  id: 'cdiscount-par-lots',
  code: 'ENT-2.8',
  titre: 'Cdiscount — une tournée pour cinq commandes',
  desc: 'Comparer la préparation commande par commande et par lots sur la vague du matin : marche gagnée, tri ajouté, méthode proposée.',
  niveaux: ['1re'],
  competences: ['C2.2'],
  temps: 'entrainement',
  bareme: 20,
  correction: true,
  questions: 'ENT-2.8',
  pret: true,
  ouverture: 'prof',
}, SEANCE.OPTIONS);
export const meta = s.meta;
export const rendre = s.rendre;
