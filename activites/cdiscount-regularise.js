// ENT-2.4 — Cdiscount, séance « Régularisé à l'aveugle ». Quatrième séance de l'environnement
// Cdiscount (C1.6, suivi des stocks et inventaire, 1L).
//
// Erreur induite : un magasinier de nuit a « régularisé » un écart de mixeurs en le baptisant
// démarque inconnue, sans enquêter. L'élève contrôle les ajustements de la semaine, retrouve
// celui qui ne se justifie par aucun document, remonte à la réception où l'écart est né
// (bon de livraison contre colis), chiffre le manque et dit quoi faire. Il répond par écrit à la
// cheffe d'équipe ; les jalons lisent sa réponse. Détail et données :
// `contenus/cdiscount-regularise.js`. Aucun écran nouveau : Stock, Mouvements, Réceptions,
// messagerie.
//
// **`pret: true`** depuis le 03/10/2026 : Tristan l'a validée à l'écran, elle est ouverte aux
// élèves. Ni trame ni corrigé écrits : aucune trame n'est demandée pour l'instant.

import { creerEntreprise } from '../core/types/entreprise.js';
import * as CDISCOUNT from '../contenus/cdiscount.js';
import * as SEANCE from '../contenus/cdiscount-regularise.js';

export const meta = {
  id: 'cdiscount-regularise',
  code: 'ENT-2.4',
  titre: 'Cdiscount — régularisé à l’aveugle',
  desc: "Contrôler les ajustements de la semaine, retrouver celui qui cache un vrai problème, remonter à la réception et dire quoi faire.",
  rubrique: 'logisim',
  // Compétences et temps pédagogique : voir core/competences.js.
  competences: ['C1.6'],
  temps: 'erreur',
  // Volume déclaré (`claude/prepalog-montee-en-competences.md`) : le volume STANDARD.
  volume: SEANCE.VOLUME,
  bareme: SEANCE.ETAPES.length,
  notation: 'avancement',
  immersif: true,
  portee: 'eleve',
  // PAS de `reinitialisable` : la remise à zéro est réservée aux séances X.1 (décision du
  // 02/10/2026, gardée par un test du bloc « transport »). L'élève peut en revanche renvoyer sa
  // réponse : le meilleur essai est retenu.
  tables: {},
  pret: true,
  // Fermée aux élèves pendant la refonte Cdiscount (brief `CDISCOUNT-renumerotation.md`, 03/10/2026).
  ouverture: 'prof',
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
