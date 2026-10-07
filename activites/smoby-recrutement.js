// ENT-5.1 — Smoby, « recruter le cariste de Noël ». Première séance du scénario S1 de la 2de GATL
// (brief `docs/briefs/ENT-5.1-smoby-recrutement.md`, coordination `docs/briefs/COORDINATION-smoby.md`).
//
// Poste A, assistant RH, en guidage : lire une fiche de poste, trier cinq CV joints au message de
// Sophie dans la fiche de sélection, choisir le candidat et le contrat, lui répondre par phrases à
// choisir. Données dans `contenus/smoby-ent51.js`, univers commun dans `contenus/smoby.js`.
//
// Pas de `notation` : 22 jalons pondérés, somme des poids = 20. Une base par séance (pas de `jeuId`).
// Trame élève (format long, 6 étapes, brief `docs/briefs/COWORK-trame-smoby-5.1.md`, relue par Tristan le 06/10/2026) ;
// son corrigé s'ajoute au corrigé calculé (`meta.corrige`).

import { creerEntreprise } from '../core/types/entreprise.js';
import * as SMOBY from '../contenus/smoby.js';
import * as SEANCE from '../contenus/smoby-ent51.js';

export const meta = {
  id: 'smoby-recrutement',
  code: 'ENT-5.1',
  titre: 'Smoby — recruter le cariste de Noël',
  desc: 'Assistant RH à la plateforme Smoby de Moirans-en-Montagne : lire une fiche de poste, trier cinq CV, '
    + 'choisir le bon candidat et le bon contrat, rendre compte à sa tutrice.',
  rubrique: 'simulog',
  niveaux: ['2de'],
  competences: ['AGO-3.1'],
  domaines: ['D1'],
  coeur: true,
  temps: 'guidage',
  bareme: 20,           // 22 jalons pondérés, somme des poids = 20 (lot A bis)
  immersif: true,
  // Parcours strict, base par séance (brief SMOBY-retours-5.1-5.2, lot B) : ENT-5.2 ne s'ouvre qu'à l'élève
  // qui a validé celle-ci (voir core/parcours.js).
  parcours: true,
  // Lots A et A bis du brief SMOBY-retours-classe-5.1 (07/10/2026) : la séance suivante s'ouvre au premier bilan,
  // l'élève peut corriger, la note est la moyenne du premier bilan et de l'état actuel (voir core/types/entreprise.js).
  correction: true,
  portee: 'eleve',
  reinitialisable: true,
  tables: {},
  corrige: './contenus/corriges/ENT-5.1.js',
  pret: true,
  ouverture: 'prof',
};

const moteur = creerEntreprise({
  // Les écrans de données du menu (05/10/2026) : ceux dont la séance se sert, et au moindre doute on les garde.
  menu: [],
  stockOuvert: true,            // pas de code pour le Stock chez Smoby (décision de Tristan, 05/10/2026)
  ENTREPRISE: SMOBY.ENTREPRISE,
  VOCAB: SMOBY.VOCAB,
  CATALOGUE: SMOBY.CATALOGUE,
  SUPPLIERS: SMOBY.SUPPLIERS,
  SUP_BY_ID: SMOBY.SUP_BY_ID,
  CUSTOMERS: SMOBY.CUSTOMERS,
  CM: SMOBY.CM,
  baseDeDepart: SMOBY.baseDeDepart,
  THEME: SMOBY.THEME,
  etapes: SEANCE.ETAPES,
  exercice: 'Séance 1 : recruter le cariste de Noël',
  accueil: SEANCE.ACCUEIL,
  volet: SEANCE.VOLET,
  lexique: SMOBY.LEXIQUE,
  documents: SEANCE.DOCUMENTS,
  documentsStyle: SEANCE.STYLE_DOCUMENTS,
  fiche: SEANCE.FICHE,
  trame: {
    pdf: './contenus/trames/ENT-5.1-smoby-recrutement-trame-eleve.pdf',
    docx: './contenus/trames/ENT-5.1-smoby-recrutement-trame-eleve.docx',
  },
});

export function rendre(hote, ctx) { moteur.rendre(hote, ctx); }
