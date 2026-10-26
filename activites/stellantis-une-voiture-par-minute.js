// ENT-13.1 — Stellantis Sochaux, « une voiture par minute » (Terminale, rentrée, guidage-rappel de C1.1). Voir `contenus/stellantis-ent131.js`.
import { seanceEntreprise } from '../core/types/seance-entreprise.js';
import * as STELLANTIS from '../contenus/stellantis.js';
import * as SEANCE from '../contenus/stellantis-ent131.js';
const s = seanceEntreprise(STELLANTIS, SEANCE, {
  id: 'stellantis-une-voiture-par-minute',
  code: 'ENT-13.1',
  titre: 'Stellantis — une voiture par minute',
  desc: 'Découvrir l’usine Stellantis de Sochaux : la situer sur la carte, suivre le voyage d’une pièce jusqu’à la voiture, lire les chiffres de l’usine '
    + 'et comprendre ce qui distingue une usine d’un entrepôt de distribution.',
  niveaux: ['tle'],
  niveauxPrevus: ['confirme'],
  competences: ['C1.1'],
  domaines: ['D1'],
  temps: 'guidage',
  bareme: 20,
  questions: 'ENT-13.1',
  parcours: true,
  correction: true,
  reinitialisable: true,
  pret: true,
  ouverture: 'prof',
}, SEANCE.OPTIONS);
export const meta = s.meta;
export const rendre = s.rendre;
