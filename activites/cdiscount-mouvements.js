// ENT-2.1 — Cdiscount, séance « Le stock raconte ». Première séance de l'environnement
// Cdiscount (C1.6, suivi des stocks et inventaire, 1L).
//
// Guidage : l'élève lit le stock et ses mouvements, relie chaque mouvement à son document et
// recalcule le stock du dernier inventaire. Il répond par écrit à la cheffe d'équipe ; les
// jalons lisent sa réponse. Détail et données : `contenus/cdiscount-mouvements.js`.
//
// **`pret: false`** tant que Tristan ne l'a pas validée à l'écran (règle 4 du tableau des
// chantiers) : la séance est cachée aux élèves, quel que soit le groupe.
//
// Pas encore de trame élève : elle viendra avec les autres séances ENT-2.x. En attendant, les
// consignes sont dans le message de la cheffe d'équipe et dans la marche à suivre de l'accueil.

import { creerEntreprise } from '../core/types/entreprise.js';
import * as CDISCOUNT from '../contenus/cdiscount.js';
import * as SEANCE from '../contenus/cdiscount-mouvements.js';

export const meta = {
  id: 'cdiscount-mouvements',
  code: 'ENT-2.1',
  titre: 'Cdiscount — le stock raconte',
  desc: "Lire le stock et ses mouvements, relier chaque mouvement à son document, recalculer le stock d'inventaire.",
  rubrique: 'logisim',
  // Compétences et temps pédagogique : voir core/competences.js.
  competences: ['C1.6'],
  temps: 'guidage',
  // Volume déclaré (`claude/prepalog-montee-en-competences.md`) : guidage = peu d'opérations.
  volume: SEANCE.VOLUME,
  bareme: SEANCE.ETAPES.length,
  notation: 'avancement',
  immersif: true,
  portee: 'eleve',
  // Chaque séance Cdiscount a sa propre base (une journée différente à l'entrepôt) : l'élève
  // peut donc repartir de zéro sans rien perdre d'une autre séance.
  reinitialisable: true,
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
  THEME: CDISCOUNT.THEME,
});

export function rendre(hote, ctx) { moteur.rendre(hote, ctx); }
