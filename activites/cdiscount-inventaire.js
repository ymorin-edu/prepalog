// ENT-2.2 — Cdiscount, séance « Inventaire tournant ». Deuxième séance de l'environnement
// Cdiscount (C1.6, suivi des stocks et inventaire, 1L).
//
// Entraînement : l'élève reporte un relevé de comptage, calcule les écarts, cherche la cause de
// chacun dans les mouvements et la messagerie, décide (régulariser, remettre en rayon, recompter)
// et calcule le taux d'écart. Piège central : l'article au mauvais emplacement. Correction
// détaillée (décision de Tristan, 02/10/2026). Détail et données :
// `contenus/cdiscount-inventaire.js` ; écran : `core/types/inventaire.js`.
//
// **`pret: false`** tant que Tristan ne l'a pas validée à l'écran (règle 4 du tableau des
// chantiers) : la séance est cachée aux élèves, quel que soit le groupe. Ni trame ni corrigé
// écrits : ils viendront après sa validation.

import { creerEntreprise } from '../core/types/entreprise.js';
import * as CDISCOUNT from '../contenus/cdiscount.js';
import * as SEANCE from '../contenus/cdiscount-inventaire.js';

export const meta = {
  id: 'cdiscount-inventaire',
  code: 'ENT-2.2',
  titre: 'Cdiscount — inventaire tournant',
  desc: "Reporter un comptage, calculer les écarts, retrouver leur cause (dont l'article mal rangé), décider et valider l'inventaire.",
  rubrique: 'logisim',
  // Compétences et temps pédagogique : voir core/competences.js.
  competences: ['C1.6'],
  temps: 'entrainement',
  // Volume déclaré (`claude/prepalog-montee-en-competences.md`) : le volume STANDARD. Le lot en
  // plus des élèves à l'aise viendra du niveau d'aisance, pas encore construit.
  volume: SEANCE.VOLUME,
  bareme: SEANCE.ETAPES.length,
  notation: 'avancement',
  immersif: true,
  portee: 'eleve',
  // PAS de `reinitialisable` : la remise à zéro est réservée aux séances X.1 (décision du
  // 02/10/2026, gardée par un test du bloc « transport »). L'inventaire validé est définitif :
  // l'élève voit sa correction détaillée, mais ne refait pas la séance de lui-même.
  tables: {},
  pret: false,
};

const moteur = creerEntreprise({
  ENTREPRISE: CDISCOUNT.ENTREPRISE,
  VOCAB: CDISCOUNT.VOCAB,
  CATALOGUE: SEANCE.CATALOGUE,
  SUPPLIERS: CDISCOUNT.SUPPLIERS,
  SUP_BY_ID: CDISCOUNT.SUP_BY_ID,
  CUSTOMERS: CDISCOUNT.CUSTOMERS,
  CM: CDISCOUNT.CM,
  baseDeDepart: SEANCE.baseDeDepart,
  exercice: SEANCE.EXERCICE,
  accueil: SEANCE.ACCUEIL,
  volet: SEANCE.VOLET,
  etapes: SEANCE.ETAPES,
  inventaire: SEANCE.INVENTAIRE,
  THEME: CDISCOUNT.THEME,
});

export function rendre(hote, ctx) { moteur.rendre(hote, ctx); }
