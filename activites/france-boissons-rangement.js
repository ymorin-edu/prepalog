// ENT-6.5 — France Boissons, « ranger les fûts ». Cinquième séance du scénario S2 de la 2de GATL, poste C (cariste), entraînement
// (brief `docs/briefs/ENT-6.5-france-boissons-rangement.md`, chantier moteur D-5).
//
// En renfort au quai de Buchelay : découvrir le matériel du poste (chariot frontal, palette de rétention), comprendre le FIFO par une
// animation à deux questions, ranger en stockage de masse les 4 palettes reçues en ENT-6.4 sans bloquer un lot plus ancien, puis saisir
// l'entrée en stock (stock avant + entrée = stock après). Données dans `contenus/france-boissons-ent65.js`, questions dans
// `contenus/questions/ENT-6.5.js`, univers dans `contenus/france-boissons.js`.
//
// 10 jalons pondérés (somme 17) + 2 questions notées (`part: 3`), somme = 20 (`bareme: 20`), poids validés par Tristan le 11/10/2026.
// Une base par séance (pas de `jeuId`). Pas de trame pour l'instant (tout à l'écran). Corrigé calculé : `contenus/corriges/ENT-6.5.js`.

import { seanceEntreprise } from '../core/types/seance-entreprise.js';
import * as FB from '../contenus/france-boissons.js';
import * as SEANCE from '../contenus/france-boissons-ent65.js';
const s = seanceEntreprise(FB, SEANCE, {
  id: 'france-boissons-rangement',
  code: 'ENT-6.5',
  titre: 'France Boissons — ranger les fûts',
  desc: 'Cariste à la plateforme de Buchelay : comprendre le FIFO, ranger les palettes de fûts reçues en stockage de masse sans bloquer '
    + 'un lot plus ancien, puis saisir l’entrée en stock.',
  niveaux: ['2de', 'cap'],
  competences: ['C1.5', 'C1.6'],
  competencesCap: ['CAP-C1.5'],   // CAP OL 2026 : lu par un groupe CAP à la place de competences
  domaines: ['D4', 'D5'],
  coeur: true,
  temps: 'entrainement',
  bareme: 20,           // jalons pondérés (17) + questions notées (3), somme = 20
  // Parcours strict : ne s'ouvre qu'à l'élève dont ENT-6.4 a son premier bilan (voir core/parcours.js).
  parcours: true,
  precedente: 'france-boissons-reception',
  // Règle du premier bilan : « Corriger » rouvre la fiche d'entrée en stock (le rangement, lui, est figé à la validation).
  correction: true,
  questions: 'ENT-6.5',
  pret: true,
  ouverture: 'prof',
}, SEANCE.OPTIONS);
export const meta = s.meta;
export const rendre = s.rendre;
