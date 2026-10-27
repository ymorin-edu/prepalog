// ENT-24.2 — le planning des quais (1re Bac Pro, C1.3, guidage). Voir `contenus/kuehne-nagel-ent242.js`.
// Jalons pondérés sur 20 (poids en tête du fichier de contenu).
import { seanceEntreprise } from '../core/types/seance-entreprise.js';
import * as KN from '../contenus/kuehne-nagel.js';
import * as SEANCE from '../contenus/kuehne-nagel-ent242.js';
const s = seanceEntreprise(KN, SEANCE, {
  id: 'kuehne-nagel-planning',
  code: 'ENT-24.2',
  titre: 'Kuehne+Nagel — le planning des quais',
  desc: 'Le jeudi matin : poser neuf envois sur quatre quais selon leur zone, leur heure de mise à disposition et leur heure limite, puis reprendre quand un vol a du retard et qu’une pièce d’avion urgente arrive.',
  niveaux: ['1re'],
  competences: ['C1.3'],
  temps: 'guidage',
  bareme: 20,
  parcours: true,
  correction: true,
  bilanDetail: true,
  precedente: 'kuehne-nagel-prealertes',
  questions: 'ENT-24.2',
  pret: true,
  ouverture: 'prof',
}, SEANCE.OPTIONS);
export const meta = s.meta;
export const rendre = s.rendre;
