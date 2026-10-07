// ENT-5.3 — Smoby, « la visite de la plateforme ». Scénario S1 de la 2de GATL, poste C (cariste), guidage
// (brief `docs/briefs/ENT-5.3-smoby-visite.md`, coordination `docs/briefs/COORDINATION-smoby.md`).
//
// Premier jour de Yanis : la plateforme vue du ciel, le parcours de visite dans l'entrepôt, chaque photo à
// replacer sur le plan, les mots du rack, une travée à délimiter, une adresse d'emplacement à lire puis à
// retrouver. Mode `visite` de la vue Plan d'entrepôt (`core/types/entrepot-visite.js`).
// Données dans `contenus/smoby-ent53.js`, plateforme dans `contenus/smoby-entrepot.js`.
//
// Pas de `notation` : dix-sept jalons ramenés sur 20. Une base par séance (pas de `jeuId`).
// Pas encore de trame élève : Cowork l'écrit après la validation à l'écran (brief §9).

import { creerEntreprise } from '../core/types/entreprise.js';
import { catalogueSimple } from '../contenus/entreprise-commun.js';
import * as SMOBY from '../contenus/smoby.js';
import * as SEANCE from '../contenus/smoby-ent53.js';

export const meta = {
  id: 'smoby-visite',
  code: 'ENT-5.3',
  titre: 'Smoby — la visite de la plateforme',
  desc: 'Premier jour du cariste : découvrir la plateforme vue du ciel, suivre le parcours de visite dans l’entrepôt, '
    + 'apprendre les mots du rack, délimiter une travée, lire et retrouver une adresse d’emplacement.',
  rubrique: 'simulog',
  niveaux: ['2de'],
  competences: ['C1.2', 'C1.5'],
  domaines: ['D4'],
  coeur: true,
  temps: 'guidage',
  bareme: SEANCE.ETAPES.length,
  immersif: true,
  // Parcours strict : ne s'ouvre qu'à l'élève qui a validé ENT-5.2 (voir core/parcours.js).
  parcours: true,
  // Elle ouvre la suivante dès qu'elle est finie, justes ou faux (lot 0 de SMOBY-notation-5.3-5.8 : aucun élève bloqué).
  suiteAuBilan: true,
  precedente: 'smoby-arrivee',
  portee: 'eleve',
  tables: {},
  pret: true,
  ouverture: 'prof',
};

const moteur = creerEntreprise({
  // Les écrans de données du menu (05/10/2026) : la visite n'en utilise aucun.
  menu: [],
  stockOuvert: true,            // pas de code pour le Stock chez Smoby (décision de Tristan, 05/10/2026)
  ENTREPRISE: SMOBY.ENTREPRISE,
  VOCAB: SEANCE.VOCAB,
  CATALOGUE: catalogueSimple([]),
  SUPPLIERS: [],
  SUP_BY_ID: {},
  CUSTOMERS: SMOBY.CUSTOMERS,
  CM: SMOBY.CM,
  baseDeDepart: SMOBY.baseDeDepart,
  THEME: SMOBY.THEME,
  etapes: SEANCE.ETAPES,
  exercice: 'Séance 3 : la visite de la plateforme',
  accueil: SEANCE.ACCUEIL,
  volet: SEANCE.VOLET,
  lexique: SEANCE.LEXIQUE,
  entrepot: SEANCE.VISITE,
  sansTrame: "Tout à l'écran",
});

export function rendre(hote, ctx) { moteur.rendre(hote, ctx); }
