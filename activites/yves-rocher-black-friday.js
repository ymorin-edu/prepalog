// ENT-23.5 — le pic de fin novembre (2de Bac Pro, C2.1, C2.2, entrainement). Voir `contenus/yves-rocher-ent235.js`.
// Jalons pondérés sur 20 (poids en tête du fichier de contenu).
import { seanceEntreprise } from '../core/types/seance-entreprise.js';
import * as YR from '../contenus/yves-rocher.js';
import * as SEANCE from '../contenus/yves-rocher-ent235.js';
const s = seanceEntreprise(YR, SEANCE, {
  id: 'yves-rocher-black-friday',
  code: 'ENT-23.5',
  titre: 'Yves Rocher — le pic de fin novembre',
  desc: 'Le jour du « Black Friday » : trois demandes urgentes, le reliquat, ce qui part ce soir et ce que deviennent les retours (loi anti-gaspillage).',
  niveaux: ['2de'],
  competences: ['C2.1', 'C2.2'],
  temps: 'entrainement',
  bareme: 20,
  parcours: true,
  correction: true,
  bilanDetail: true,
  precedente: 'yves-rocher-reclamation',
  questions: 'ENT-23.5',
  pret: true,
  ouverture: 'prof',
}, SEANCE.OPTIONS);
export const meta = s.meta;
export const rendre = s.rendre;
