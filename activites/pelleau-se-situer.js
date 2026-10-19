// ENT-10.1 — Transports Pelleau, « de Plabennec à l'entrepôt neuf ». Première séance de l'entreprise n° 10 (CAP OL), stagiaire en PFMP à
// l'entrepôt neuf de Gouesnou : GUIDAGE de CAP-C1.1, se situer dans un environnement professionnel (brief
// `docs/briefs/ENT-10.1-pelleau-se-situer.md` ; décisions du chef de chantier : `docs/briefs/COORDINATION-pelleau.md` §2). Suite : ENT-10.2.
//
// « Qui est qui ? » (tâches tirées), la carte de France (vue « Localiser » : entrepôt, Plabennec, Rungis), « L'histoire de Pelleau » (ordre
// de 4 étapes tirées, départ où aucune n'est à sa place), « Ce que fait Pelleau » (travaux tirés), « Ce que je change » (situations tirées).
// Contenu : `contenus/pelleau-ent101.js` (données pures : `contenus/pelleau-ent101-donnees.js`), questions : `contenus/questions/ENT-10.1.js`,
// univers : `contenus/pelleau.js`.
//
// 18 jalons pondérés, 16 points (Qui est qui ? 3, carte 6, histoire 3, ce que fait Pelleau 2, ce que je change 2) + 3 questions notées (`part: 4`) = 20
// (`bareme: 20`), poids validés par Tristan le 18/10/2026 à 22 h 03. `correction: true` : « Corriger » rouvre les fiches fausses ; la carte et
// les questions se jouent au premier essai (`finFige`). Confirmé : une tâche, un travail, une situation et un lieu (Saint-Pol-de-Léon) en plus,
// cachés. Livrée le 19/10/2026 (`pret: true, ouverture: 'prof'`) : Tristan l'essaie à l'écran et l'ouvre lui-même à son groupe.

import { seanceEntreprise } from '../core/types/seance-entreprise.js';
import * as PELLEAU from '../contenus/pelleau.js';
import * as SEANCE from '../contenus/pelleau-ent101.js';
const s = seanceEntreprise(PELLEAU, SEANCE, {
  id: 'pelleau-se-situer',
  code: 'ENT-10.1',
  titre: 'Transports Pelleau — de Plabennec à l’entrepôt neuf',
  desc: 'Situer l’entreprise sur la carte, reconnaître ses métiers et son histoire, savoir qui fait quoi et ce que change le travail du magasinier.',
  niveaux: ['cap'],
  competences: [],                  // séance réservée au CAP : elle ne compte que dans les compétences CAP (comme ENT-8.1)
  competencesCap: ['CAP-C1.1'],
  temps: 'guidage',
  bareme: 20,                       // jalons pondérés (18 jalons, 16 points) + questions notées (4), somme = 20
  parcours: true,                   // première séance du parcours Pelleau (pas de `precedente`)
  correction: true,
  bilanDetail: true,                // CAP : le bilan de fin descend à la case, avec « Corriger dans … » par ligne
  niveauxPrevus: ['confirme', 'accompagne'],   // confirmé : tâche, travail, situation et lieu en plus ; accompagné : la carte avec les noms
  questions: 'ENT-10.1',
  reinitialisable: true,            // première séance de Pelleau : l'enseignant peut remettre un élève à zéro (règle des X.1)
  pret: true,
  ouverture: 'prof',
}, SEANCE.OPTIONS);
export const meta = s.meta;
export const rendre = s.rendre;
