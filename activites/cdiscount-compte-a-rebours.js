// ENT-2.5 — Cdiscount, ÉVALUATION « Le compte à rebours » (C1.6, 1L, coefficient 3). Copie rendue.
//
// Seul, sur l'allée C (jamais vue dans la série) : exporter les lignes de préparation, analyser
// dans le tableur (Écart, SI, NB.SI), déposer son fichier (un dépôt, aucun retour), envoyer sa liste
// à Nadia, faire l'inventaire de cette liste (aucune correction à l'écran), rendre compte, rendre sa
// copie. UN JEU TIRÉ PAR ÉLÈVE (graine = son identifiant) : même structure pour tous (trois écarts,
// un de chaque sorte), chiffres différents. Onze jalons ; note = réussis / 11 × 20, figée à la
// remise. Écrite le 04/10/2026 (brief `docs/briefs/ENT-2.5-compte-a-rebours.md`). Données et
// tirage : `contenus/cdiscount-compte-a-rebours.js` ; corrigé par élève :
// `contenus/corriges/ENT-2.5.js`. Pas de trame (décision de la série).
//
// Livrée fermée (`pret: true, ouverture: 'prof'`) : Tristan l'ouvre le jour de l'évaluation.

import { creerEntreprise } from '../core/types/entreprise.js';
import * as CDISCOUNT from '../contenus/cdiscount.js';
import * as SEANCE from '../contenus/cdiscount-compte-a-rebours.js';

export const meta = {
  id: 'cdiscount-compte-a-rebours',
  code: 'ENT-2.5',
  titre: 'Cdiscount — le compte à rebours',
  desc: 'Seul, sur une allée neuve : exporter, analyser, choisir quoi compter, compter, décider, rendre compte. Tu rends ta copie.',
  rubrique: 'simulog',
  // Compétences et temps pédagogique : voir core/competences.js.
  competences: ['C1.6'],
  temps: 'evaluation',
  bareme: SEANCE.ETAPES.length,
  immersif: true,
  portee: 'eleve',
  copie: true,
  tables: {},
  corrige: './contenus/corriges/ENT-2.5.js',
  pret: true,
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
  // L'inventaire est TIRÉ : une fonction de la graine de l'élève (le moteur la pose à l'ouverture).
  inventaire: SEANCE.inventaireDe,
  tableur: SEANCE.TABLEUR,
  copie: meta.copie,
  THEME: CDISCOUNT.THEME,
});

export function rendre(hote, ctx) { moteur.rendre(hote, ctx); }
export const noter = (db) => moteur.noter(db);
