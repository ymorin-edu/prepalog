// ENT-7.1 — Decathlon, « ton premier conteneur ». Première séance de l'entreprise n° 7 (1re), service transport amont de l'entrepôt de
// Rouvignies : GUIDAGE de C2.6.1, choisir un transporteur correspondant au cahier des charges dans une liste référencée
// (brief `docs/briefs/ENT-7.1-decathlon-choisir-transporteur.md`). Suite : ENT-7.2 (transmettre l'ordre), 7.3 (aléa), 7.4 (évaluation).
//
// Lire le besoin, trier les offres (hors liste, hors délai), comparer prix et CO₂, choisir et justifier (« la date d'abord, puis le CO₂ »).
// Contre la copie : l'offre en retard est TIRÉE par élève (le rail ou la barge), donc la bonne réponse aussi.
// Données dans `contenus/decathlon-ent71.js` (et `-donnees.js`, pures), questions dans `contenus/questions/ENT-7.1.js`, univers dans
// `contenus/decathlon.js`, carte des itinéraires dans `contenus/decathlon-carte.js` (générée).
//
// 7 jalons pondérés (somme 17) + 3 questions notées (`part: 3`), somme = 20 (`bareme: 20`), poids validés par Tristan le 13/10/2026.
// Une base par séance (pas de `jeuId`). Pas de trame pour l'instant (tout à l'écran ; trame courte de Cowork après validation à l'écran).
// Livrée le 13/10/2026 (`pret: true, ouverture: 'prof'`) : Tristan l'essaie à l'écran et l'ouvre lui-même à son groupe.

import { seanceEntreprise } from '../core/types/seance-entreprise.js';
import * as DECATHLON from '../contenus/decathlon.js';
import * as SEANCE from '../contenus/decathlon-ent71.js';
const s = seanceEntreprise(DECATHLON, SEANCE, {
  id: 'decathlon-choix-transporteur',
  code: 'ENT-7.1',   // provisoire : Decathlon revient en 2de et en Tle, renumérotation possible avant que les élèves jouent la série
  titre: 'Decathlon — ton premier conteneur',
  desc: 'Alternant au service transport amont de l’entrepôt de Rouvignies : lire le cahier des charges d’un conteneur arrivé à Anvers, écarter '
    + 'les offres qui ne conviennent pas, comparer coût et CO₂, choisir le transporteur et justifier son choix.',
  niveaux: ['1re'],
  competences: ['C2.6'],
  temps: 'guidage',
  bareme: 20,           // jalons pondérés (17) + questions notées (3), somme = 20
  // Parcours strict, première séance du scénario (pas de `precedente`) : ENT-7.2 s'ouvrira au premier bilan.
  parcours: true,
  // Règle du premier bilan : « Corriger » rouvre le comparateur ; la note est la moyenne du premier bilan et de l'état à la première correction.
  correction: true,
  reinitialisable: true,
  niveauxPrevus: ['confirme'],   // cas bonus du confirmé : deux offres de plus à écarter
  questions: 'ENT-7.1',
  pret: true,
  ouverture: 'prof',
}, SEANCE.OPTIONS);
export const meta = s.meta;
export const rendre = s.rendre;
