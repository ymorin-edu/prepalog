// ENT-6.9 — France Boissons, « la tournée de la côte ». Neuvième séance du scénario S2 de la 2de GATL, poste B (agent d'exploitation),
// GUIDAGE d'OTM-C1.3 (brief `docs/briefs/ENT-6.9-france-boissons-tournee.md`, décision 67 : exception assumée à « S2 = entraînement »,
// C1.3 n'ayant aucun temps en S1 ; chantier moteur D-9, lots 1 à 3).
//
// Vendredi 6 h 30, Lucas roule sur l'A13 : ordonner les six arrêts de la côte sur la carte réelle (horaires d'ouverture, 4 h 30 de
// conduite, retour avant 15 h 30), calculer la feuille de route, envoyer la tournée, puis répondre au SMS de Lucas par phrases à choisir.
// Données dans `contenus/france-boissons-ent69.js` (et `-donnees.js`, pures), questions dans `contenus/questions/ENT-6.9.js`, univers
// dans `contenus/france-boissons.js`.
//
// 12 jalons pondérés (somme 16) + 3 questions notées (`part: 4`), somme = 20 (`bareme: 20`), poids validés par Tristan le 12/10/2026.
// Une base par séance (pas de `jeuId`). Pas de trame pour l'instant (tout à l'écran). Corrigé calculé : `contenus/corriges/ENT-6.9.js`.
// Pas de `correction` : la séance est un guidage, la feuille se vérifie à l'écran avant l'envoi.

import { seanceEntreprise } from '../core/types/seance-entreprise.js';
import * as FB from '../contenus/france-boissons.js';
import * as SEANCE from '../contenus/france-boissons-ent69.js';
const s = seanceEntreprise(FB, SEANCE, {
  id: 'france-boissons-tournee',
  code: 'ENT-6.9',
  titre: 'France Boissons — la tournée de la côte',
  desc: 'Agent d’exploitation à Buchelay : pendant que Lucas roule sur l’A13, ordonner les six arrêts de la côte normande en tenant les '
    + 'horaires d’ouverture et le temps de conduite, calculer la feuille de route, puis envoyer la tournée à Lucas par SMS.',
  niveaux: ['2de'],
  competences: ['OTM-C1.3'],
  domaines: ['D2'],
  temps: 'guidage',
  bareme: 20,           // jalons pondérés (16) + questions notées (4), somme = 20
  // Parcours strict : ne s'ouvre qu'à l'élève dont ENT-6.8 a son premier bilan (même règle que les séances précédentes).
  parcours: true,
  bilanListe: true,       // bandeau de fin ✓/✗ par blocs, sans « Corriger » (26/10/2026, choix de Tristan)
  precedente: 'france-boissons-planning',
  questions: 'ENT-6.9',
  pret: true,
  ouverture: 'prof',
}, SEANCE.OPTIONS);
export const meta = s.meta;
export const rendre = s.rendre;
