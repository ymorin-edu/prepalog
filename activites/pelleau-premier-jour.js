// ENT-10.2 — Transports Pelleau, « mon premier jour dans l'entrepôt neuf ». Deuxième séance de l'entreprise n° 10 (CAP OL), stagiaire en PFMP à
// l'entrepôt neuf de Gouesnou : GUIDAGE de CAP-C1.2, prendre son poste (brief `docs/briefs/ENT-10.2-pelleau-premier-jour.md` ; décisions du chef
// de chantier : `docs/briefs/COORDINATION-pelleau.md` §2). Précédente : ENT-10.1. Suite : ENT-10.3 (entraînement, piège tiré).
//
// Visite de l'entrepôt (premier essai), « Mon poste » (vue « Inspection du poste » : défaut du site tiré, avertisseur à essayer ; première séance
// à s'en servir), « En attendant », planning des quais (lectures tirées, une carte à poser), compte rendu à Erwan par phrases.
// Contenu : `contenus/pelleau-ent102.js` (données pures : `contenus/pelleau-ent102-donnees.js`), questions : `contenus/questions/ENT-10.2.js`,
// univers : `contenus/pelleau.js`.
//
// 16 points de jalons pondérés (repérer l'entrepôt 3, mon poste 7, le planning 3, rendre compte 3) + 4 de questions (`part: 4`) = 20 (`bareme: 20`),
// poids validés par Tristan le 18/10/2026 à 22 h 03. `correction: true` : « Corriger » rouvre « En attendant », la fiche de lecture, le planning
// et le compte rendu ; jamais la visite ni l'inspection (`finFige`). Confirmé : une lecture du planning en plus, cachée.
// Une séance réservée au CAP : `competences: []` (elle n'entre dans aucune moyenne Bac Pro), `competencesCap: ['CAP-C1.2']`.

import { seanceEntreprise } from '../core/types/seance-entreprise.js';
import * as PELLEAU from '../contenus/pelleau.js';
import * as SEANCE from '../contenus/pelleau-ent102.js';
const s = seanceEntreprise(PELLEAU, SEANCE, {
  id: 'pelleau-premier-jour',
  code: 'ENT-10.2',
  titre: 'Transports Pelleau — mon premier jour dans l’entrepôt neuf',
  desc: 'Repérer les zones de l’entrepôt, contrôler son poste et son transpalette avant de commencer, lire le planning des quais et rendre compte à son tuteur.',
  niveaux: ['cap'],
  competences: [],
  competencesCap: ['CAP-C1.2'],
  temps: 'guidage',
  bareme: 20,
  parcours: true,
  correction: true,
  bilanDetail: true,                // CAP : le bilan de fin descend à la case, avec « Corriger dans … » par ligne
  precedente: 'pelleau-se-situer',
  niveauxPrevus: ['confirme'],      // bonus du confirmé : une lecture du planning de plus (cachée à l'élève)
  questions: 'ENT-10.2',
  pret: true,
  ouverture: 'prof',
}, SEANCE.OPTIONS);
export const meta = s.meta;
export const rendre = s.rendre;
