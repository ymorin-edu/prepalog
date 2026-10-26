// ENT-14.1 — Lactalis, « douze lots rappelés » (1re, C3.2, guidage). Voir `contenus/lactalis-ent141.js`.
import { seanceEntreprise } from '../core/types/seance-entreprise.js';
import * as LACTALIS from '../contenus/lactalis.js';
import * as SEANCE from '../contenus/lactalis-ent141.js';
const s = seanceEntreprise(LACTALIS, SEANCE, {
  id: 'lactalis-douze-lots',
  code: 'ENT-14.1',
  titre: 'Lactalis — douze lots rappelés',
  desc: 'Agent(e) logistique d’une plateforme de distribution, décembre 2017 : retrouver les lots de lait infantile rappelés passés par la plateforme, '
    + 'les magasins livrés, bloquer le stock restant et rendre compte au service qualité.',
  niveaux: ['1re'],
  competences: ['C3.2'],
  temps: 'guidage',
  bareme: 20,
  questions: 'ENT-14.1',
  reinitialisable: true,
  correction: true,
  pret: true,
  ouverture: 'prof',
}, SEANCE.OPTIONS);
export const meta = s.meta;
export const rendre = s.rendre;
