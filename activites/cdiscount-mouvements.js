// ENT-2.1 — Cdiscount, séance « Le stock raconte ». Première séance de l'environnement
// Cdiscount (C1.6, suivi des stocks et inventaire, 1L).
//
// Guidage : l'élève lit le stock et ses mouvements, relie chaque mouvement à son document et
// recalcule le stock du dernier inventaire. Il répond par écrit à la cheffe d'équipe ; les
// jalons lisent sa réponse. Détail et données : `contenus/cdiscount-mouvements.js`.
//
// **`pret: true`** depuis le 03/10/2026 : Tristan l'a validée à l'écran, elle est ouverte aux élèves.
// Le même jour (option B) : le retour client et la casse n'arrivent plus à l'ouverture, mais quand
// l'élève a envoyé à Nadia son « Stock actuel : … » (`volet.declencheurs`). Laissée ouverte pendant
// la validation, sur décision de Tristan.
//
// Trame élève écrite (`outils/trame-cdiscount-mouvements.py`, `contenus/trames/ENT-2.1-…`), PAS
// déclarée tant que Tristan ne l'a pas relue ; seul son corrigé est déclaré (`meta.corrige`).

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
  // Corrigé de la trame (espace enseignant). La trame elle-même n'est PAS déclarée (`trame:`) :
  // déclarer, c'est valider, et elle n'est pas encore relue.
  corrige: './contenus/corriges/ENT-2.1.js',
  pret: true,
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
