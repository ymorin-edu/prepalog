// ENT-6.6 — France Boissons, « inventaire tournant ». Sixième séance du scénario S2 de la 2de GATL, poste C (préparateur), guidage de C1.6
// (brief `docs/briefs/ENT-6.6-france-boissons-inventaire.md`, chantier moteur D-6).
//
// En renfort au quai de Buchelay, jeudi 7 h : découvrir le terminal vocal, compter à l'aveugle les 7 lignes de sa liste dans la zone de
// masse (code de contrôle, comptage), puis, sur l'écran Inventaire, calculer les écarts, en chercher la cause et décider (régulariser avec
// un motif, ou remettre en place), enfin rendre compte à Nadia (vides × 40 €, taux de fiabilité). Données dans
// `contenus/france-boissons-ent66.js` (et `-donnees.js`), questions dans `contenus/questions/ENT-6.6.js`, univers dans `contenus/france-boissons.js`.
//
// 10 jalons pondérés (somme 16) + 3 questions notées (`part: 4`), somme = 20 (`bareme: 20`), poids validés par Tristan le 12/10/2026.
// Une base par séance (pas de `jeuId`). Pas de trame pour l'instant (tout à l'écran). Corrigé calculé : `contenus/corriges/ENT-6.6.js`.

import { seanceEntreprise } from '../core/types/seance-entreprise.js';
import * as FB from '../contenus/france-boissons.js';
import * as SEANCE from '../contenus/france-boissons-ent66.js';
const s = seanceEntreprise(FB, SEANCE, {
  id: 'france-boissons-inventaire',
  code: 'ENT-6.6',
  titre: 'France Boissons — inventaire tournant',
  desc: 'Préparateur à la plateforme de Buchelay : compter les fûts à l’aveugle avec le terminal vocal, trouver les écarts et leur cause, '
    + 'décider, puis rendre compte à la cheffe de quai.',
  niveaux: ['2de', 'cap'],
  competences: ['C1.6'],
  competencesCap: ['CAP-C1.5'],   // CAP OL 2026 : lu par un groupe CAP à la place de competences
  domaines: ['D2', 'D3', 'D5'],
  coeur: true,
  temps: 'guidage',
  bareme: 20,           // jalons pondérés (16) + questions notées (4), somme = 20
  // Parcours strict : ne s'ouvre qu'à l'élève dont ENT-6.5 a son premier bilan (voir core/parcours.js).
  parcours: true,
  precedente: 'france-boissons-rangement',
  // Règle du premier bilan : « Corriger » rouvre le compte rendu (le comptage et l'inventaire, eux, sont figés à la validation).
  correction: true,
  questions: 'ENT-6.6',
  pret: true,
  ouverture: 'prof',
}, SEANCE.OPTIONS);
export const meta = s.meta;
export const rendre = s.rendre;
