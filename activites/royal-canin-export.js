// ENT-16.4 — la commande export de Mehdi (Tle, C3.1, erreur induite). Voir `contenus/royal-canin-ent164.js`.
import { seanceEntreprise } from '../core/types/seance-entreprise.js';
import * as ROYAL_CANIN from '../contenus/royal-canin.js';
import * as SEANCE from '../contenus/royal-canin-ent164.js';
const s = seanceEntreprise(ROYAL_CANIN, SEANCE, {
  id: 'royal-canin-export',
  code: 'ENT-16.4',
  titre: 'Royal Canin — la commande export de Mehdi',
  desc: 'Un collègue a préparé une commande export en FIFO : trouver les lots dont la durée de vie restante ne respecte pas l’exigence du client, dire pourquoi et refaire la préparation en FEFO.',
  niveaux: ['tle'],
  competences: ['C3.1'],
  temps: 'erreur',
  bareme: 20,
  correction: true,
  questions: 'ENT-16.4',
  pret: true,
  ouverture: 'prof',
}, SEANCE.OPTIONS);
export const meta = s.meta;
export const rendre = s.rendre;
