// ENT-18.4 — Les réservations de Sofiane (Tle, C2.6 et C3.1, erreur induite). Voir `contenus/airbus-ent184.js`.
import { seanceEntreprise } from '../core/types/seance-entreprise.js';
import * as AIRBUS from '../contenus/airbus.js';
import * as SEANCE from '../contenus/airbus-ent184.js';
const s = seanceEntreprise(AIRBUS, SEANCE, {
  id: 'airbus-reservations-sofiane',
  code: 'ENT-18.4',
  titre: 'Airbus Helicopters — les réservations de Sofiane',
  desc: 'Un collègue a réservé au moins cher sur le poids réel : trouver ses erreurs (un hélicoptère au sol en messagerie, un coût sous-estimé), la cause, et refaire les réservations.',
  niveaux: ['tle'],
  competences: ['C2.6', 'C3.1'],
  temps: 'erreur',
  bareme: 20,
  correction: true,
  questions: 'ENT-18.4',
  pret: true,
  ouverture: 'prof',
}, SEANCE.OPTIONS);
export const meta = s.meta;
export const rendre = s.rendre;
