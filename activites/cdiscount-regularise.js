// ENT-2.4 — Cdiscount, séance « Régularisé à l'aveugle ». Quatrième séance de l'environnement
// Cdiscount (C1.6, suivi des stocks et inventaire, 1L).
//
// Erreur induite : un magasinier de nuit a « régularisé » un écart de mixeurs en le baptisant
// démarque inconnue, sans enquêter. L'élève contrôle les ajustements de la semaine, retrouve
// celui qui ne se justifie par aucun document, remonte à la réception où l'écart est né
// (bon de livraison contre colis), chiffre le manque et dit quoi faire. Il répond par écrit à la
// cheffe d'équipe ; les jalons lisent sa réponse. Détail et données :
// `contenus/cdiscount-regularise.js`.
//
// Recadrée le 04/10/2026 (brief `docs/briefs/ENT-2.4-regularise-export.md`) : l'élève commence par
// le TABLEUR (export des ajustements du mois depuis Stock, SI, NB.SI, dépôt dans Fichiers, retour
// « n résultats justes sur m »), et un vendeur de la place de marché (fictif) se plaint de la même
// réception. Neuf jalons : le bon export, deux pour le tableur, les six d'avant pour l'enquête.
//
// Livrée fermée (`ouverture: 'prof'`) : Tristan l'essaie, puis l'ouvre lui-même.
// Trame élève et corrigé : déposés par Cowork, branchés le 04/10/2026 (brief `docs/briefs/CDISCOUNT-trames-eleve.md`).

import { creerEntreprise } from '../core/types/entreprise.js';
import * as CDISCOUNT from '../contenus/cdiscount.js';
import * as SEANCE from '../contenus/cdiscount-regularise.js';

export const meta = {
  id: 'cdiscount-regularise',
  code: 'ENT-2.4',
  titre: 'Cdiscount — régularisé à l’aveugle',
  desc: "Exporter les ajustements du mois, repérer celui qui n'a pas de justificatif, remonter à la réception et dire quoi faire.",
  rubrique: 'simulog',
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
  corrige: './contenus/corriges/ENT-2.4.js',
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
  tableur: SEANCE.TABLEUR,
  THEME: CDISCOUNT.THEME,
  trame: {
    pdf: './contenus/trames/ENT-2.4-cdiscount-regularise-trame-eleve.pdf',
    docx: './contenus/trames/ENT-2.4-cdiscount-regularise-trame-eleve.docx',
  },
});

export function rendre(hote, ctx) { moteur.rendre(hote, ctx); }
