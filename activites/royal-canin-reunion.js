// ENT-16.3 — présenter les indicateurs à la réunion (Tle, C1.6 et C3.4, rendre compte à l'oral). Voir `contenus/royal-canin-ent163.js`.
// Notée par l'enseignant (`notation: 'prof'`, décision de Tristan du 27/10/2026) : sa note de l'oral, saisie dans le Suivi, remplace la note de préparation du site.
import { seanceEntreprise } from '../core/types/seance-entreprise.js';
import * as ROYAL_CANIN from '../contenus/royal-canin.js';
import * as SEANCE from '../contenus/royal-canin-ent163.js';
const s = seanceEntreprise(ROYAL_CANIN, SEANCE, {
  id: 'royal-canin-reunion',
  code: 'ENT-16.3',
  titre: 'Royal Canin — présenter les indicateurs à la réunion',
  desc: 'Calculer au tableur les indicateurs de décembre, préparer trois diapos (PowerPoint ou Impress) et les présenter trois minutes à la réunion de production : l’enseignant note l’oral.',
  niveaux: ['tle'],
  competences: ['C1.6', 'C3.4'],
  temps: 'entrainement',
  bareme: 20,
  notation: 'prof',
  questions: 'ENT-16.3',
  pret: true,
  ouverture: 'prof',
}, SEANCE.OPTIONS);
export const meta = s.meta;
export const rendre = s.rendre;
