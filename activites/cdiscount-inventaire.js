// ENT-2.3 — Cdiscount, séance « Inventaire tournant ». Troisième séance de l'environnement
// Cdiscount (C1.6, suivi des stocks et inventaire, 1L).
//
// Entraînement : l'élève redonne à Nadia la liste des références qu'il a choisies en ENT-2.2,
// reporte le relevé de comptage pour ces références seulement, calcule les écarts, cherche la
// cause de chacun dans les mouvements et la messagerie, décide (régulariser, remettre en rayon,
// recompter) et calcule le taux d'écart. Une référence à écart oubliée revient par un aléa.
// Piège central : l'article au mauvais emplacement. Correction détaillée (décision de Tristan,
// 02/10/2026). Recadrée le 04/10/2026 (brief `docs/briefs/ENT-2.3-inventaire-recadre.md`).
// Détail et données : `contenus/cdiscount-inventaire.js` ; écran : `core/types/inventaire.js`.
//
// Livrée fermée (`pret: true, ouverture: 'prof'`) : Tristan l'essaie, puis l'ouvre lui-même.
// Trame élève et corrigé : déposés par Cowork, branchés le 04/10/2026 (brief `docs/briefs/CDISCOUNT-trames-eleve.md`).

import { creerEntreprise } from '../core/types/entreprise.js';
import * as CDISCOUNT from '../contenus/cdiscount.js';
import * as SEANCE from '../contenus/cdiscount-inventaire.js';

export const meta = {
  id: 'cdiscount-inventaire',
  code: 'ENT-2.3',
  titre: 'Cdiscount — inventaire tournant',
  desc: "Recompter les références qu'on a choisies, calculer les écarts, retrouver leur cause, décider et valider l'inventaire.",
  rubrique: 'simulog',
  // Compétences et temps pédagogique : voir core/competences.js.
  competences: ['C1.6'],
  temps: 'entrainement',
  // Volume déclaré (`claude/prepalog-montee-en-competences.md`) : toute l'allée A. Un élève
  // confirmé (`db.aisance`) recompte en plus A-05 et A-06 (voir le contenu).
  volume: SEANCE.VOLUME,
  bareme: SEANCE.ETAPES.length,
  notation: 'avancement',
  immersif: true,
  portee: 'eleve',
  // PAS de `reinitialisable` : la remise à zéro est réservée aux séances X.1 (décision du
  // 02/10/2026, gardée par un test du bloc « transport »). L'inventaire validé est définitif :
  // l'élève voit sa correction détaillée, mais ne refait pas la séance de lui-même.
  tables: {},
  corrige: './contenus/corriges/ENT-2.3.js',
  pret: true,
  // Fermée aux élèves pendant la refonte Cdiscount (brief `CDISCOUNT-renumerotation.md`, 03/10/2026).
  ouverture: 'prof',
};

const moteur = creerEntreprise({
  // Les écrans de données du menu (05/10/2026) : ceux dont la séance se sert, et au moindre doute on les garde.
  menu: ['commandes', 'stock', 'catalogue', 'console'],
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
  trame: {
    pdf: './contenus/trames/ENT-2.3-cdiscount-inventaire-trame-eleve.pdf',
    docx: './contenus/trames/ENT-2.3-cdiscount-inventaire-trame-eleve.docx',
  },
});

export function rendre(hote, ctx) { moteur.rendre(hote, ctx); }
