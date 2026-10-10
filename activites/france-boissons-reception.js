// ENT-6.4 — France Boissons, « le camion de la brasserie ». Quatrième séance du scénario S2 de la 2de GATL, poste C (cariste), entraînement
// (brief `docs/briefs/ENT-6.4-france-boissons-reception.md`, chantier moteur D-4 `docs/briefs/MOTEUR-quai-inspection.md`).
//
// En renfort au quai de réception de la plateforme de Buchelay : repérer seul ce qui empêche de décharger en inspectant le quai iso (deux
// vues, des marques, « Signaler à Nadia »), décharger au chariot frontal quatre palettes de fûts, les contrôler contre le BL (brouillon de
// calcul, aides de guidage éteintes), porter des réserves précises, faire signer le chauffeur, puis rendre compte à Nadia par phrases à
// choisir. Données dans `contenus/france-boissons-ent64.js`, questions dans `contenus/questions/ENT-6.4.js`, univers dans
// `contenus/france-boissons.js`.
//
// 10 jalons pondérés (somme 16) + 3 questions notées (`part: 4`), somme = 20 (`bareme: 20`). Une base par séance (pas de `jeuId`).
// Pas de trame (tout à l'écran). Corrigé calculé : `contenus/corriges/ENT-6.4.js`.

import { seanceEntreprise } from '../core/types/seance-entreprise.js';
import * as FB from '../contenus/france-boissons.js';
import * as SEANCE from '../contenus/france-boissons-ent64.js';
const s = seanceEntreprise(FB, SEANCE, {
  id: 'france-boissons-reception',
  code: 'ENT-6.4',
  titre: 'France Boissons — le camion de la brasserie',
  desc: 'Cariste au quai de la plateforme de Buchelay : repérer seul ce qui ne va pas avant de décharger, contrôler 4 palettes de fûts '
    + 'contre le bon de livraison, porter des réserves précises et mettre un fût qui fuit de côté.',
  niveaux: ['2de'],
  competences: ['C1.2', 'C1.4'],
  domaines: ['D4', 'D5'],
  coeur: true,
  temps: 'entrainement',
  bareme: 20,           // jalons pondérés (16) + questions notées (4), somme = 20
  // Parcours strict : ne s'ouvre qu'à l'élève dont ENT-6.3 a son premier bilan (voir core/parcours.js).
  parcours: true,
  precedente: 'france-boissons-conges',
  // Règle du premier bilan : « Corriger » rouvre le compte rendu à Nadia (le quai, lui, ne se rouvre jamais : le camion est reparti).
  correction: true,
  questions: 'ENT-6.4',
  // Pas de `reinitialisable` : la remise à zéro est réservée aux séances X.1.
  pret: true,
  ouverture: 'prof',
}, SEANCE.OPTIONS);
export const meta = s.meta;
export const rendre = s.rendre;
