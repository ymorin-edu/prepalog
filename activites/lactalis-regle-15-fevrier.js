// ENT-14.2 — Lactalis, « la règle du 15 février » (1re, C3.2, entraînement). Voir `contenus/lactalis-ent142.js`.
import { seanceEntreprise } from '../core/types/seance-entreprise.js';
import * as LACTALIS from '../contenus/lactalis.js';
import * as SEANCE from '../contenus/lactalis-ent142.js';
const s = seanceEntreprise(LACTALIS, SEANCE, {
  id: 'lactalis-regle-15-fevrier',
  code: 'ENT-14.2',
  titre: 'Lactalis — la règle du 15 février',
  desc: 'Appliquer un avis de rappel donné par une règle de date : lire la date de fabrication dans chaque numéro de lot, retrouver les lots visés, '
    + 'les magasins livrés, bloquer le stock restant et rendre compte.',
  niveaux: ['1re'],
  competences: ['C3.2'],
  temps: 'entrainement',
  bareme: 20,
  questions: 'ENT-14.2',
  correction: true,
  pret: true,
  ouverture: 'prof',
}, SEANCE.OPTIONS);
export const meta = s.meta;
export const rendre = s.rendre;
