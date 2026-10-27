// ENT-18.3 — Les flux particuliers (Tle, C3.1 et C2.6, guidage). Voir `contenus/airbus-ent183.js`.
import { seanceEntreprise } from '../core/types/seance-entreprise.js';
import * as AIRBUS from '../contenus/airbus.js';
import * as SEANCE from '../contenus/airbus-ent183.js';
const s = seanceEntreprise(AIRBUS, SEANCE, {
  id: 'airbus-flux-particuliers',
  code: 'ENT-18.3',
  titre: 'Airbus Helicopters — les flux particuliers',
  desc: 'Adapter l’expédition au produit et au flux : hélicoptère immobilisé au sol, pale de rotor hors gabarit, batterie lithium-ion (marchandise dangereuse).',
  niveaux: ['tle'],
  competences: ['C3.1', 'C2.6'],
  temps: 'guidage',
  bareme: 20,
  correction: true,
  questions: 'ENT-18.3',
  pret: true,
  ouverture: 'prof',
}, SEANCE.OPTIONS);
export const meta = s.meta;
export const rendre = s.rendre;
