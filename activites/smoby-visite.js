// ENT-5.3 — Smoby, « la visite de la plateforme ». Scénario S1 de la 2de GATL, poste C (cariste), guidage
// (brief `docs/briefs/ENT-5.3-smoby-visite.md`, coordination `docs/briefs/COORDINATION-smoby.md`).
//
// Premier jour de Yanis : la plateforme vue du ciel, le parcours de visite dans l'entrepôt, chaque photo à
// replacer sur le plan, les mots du rack, une travée à délimiter, une adresse d'emplacement à lire puis à
// retrouver. Mode `visite` de la vue Plan d'entrepôt (`core/types/entrepot-visite.js`).
// Données dans `contenus/smoby-ent53.js`, plateforme dans `contenus/smoby-entrepot.js`.
//
// Pas de `notation` : 23 cases notées au premier essai, pondérées sur 20 (lot 3 du brief SMOBY-notation-5.3-5.8 ;
// la note au premier essai est déclarée par la visite, `premierEssai: true`). Une base par séance (pas de `jeuId`).
// Pas encore de trame élève : Cowork l'écrit après la validation à l'écran (brief §9).

import { seanceEntreprise } from '../core/types/seance-entreprise.js';
import { catalogueSimple } from '../contenus/entreprise-commun.js';
import * as SMOBY from '../contenus/smoby.js';
import * as SEANCE from '../contenus/smoby-ent53.js';
const s = seanceEntreprise(SMOBY, SEANCE, {
  id: 'smoby-visite',
  code: 'ENT-5.3',
  titre: 'Smoby — la visite de la plateforme',
  desc: 'Premier jour du cariste : découvrir la plateforme vue du ciel, suivre le parcours de visite dans l’entrepôt, '
    + 'apprendre les mots du rack, délimiter une travée, lire et retrouver une adresse d’emplacement.',
  niveaux: ['2de'],
  competences: ['C1.2', 'C1.5'],
  domaines: ['D4'],
  coeur: true,
  temps: 'guidage',
  bareme: 20,
  // Parcours strict : ne s'ouvre qu'à l'élève qui a validé ENT-5.2 (voir core/parcours.js).
  parcours: true,
  // Elle ouvre la suivante dès qu'elle est finie, justes ou faux (lot 0 de SMOBY-notation-5.3-5.8 : aucun élève bloqué).
  // La note au premier essai (lot 3) l'implique aussi.
  suiteAuBilan: true,
  precedente: 'smoby-arrivee',
  pret: true,
  ouverture: 'prof',
  corrige: false,
}, {
  // Les écrans de données du menu (05/10/2026) : la visite n'en utilise aucun.
  menu: [],
  stockOuvert: true,            // pas de code pour le Stock chez Smoby (décision de Tristan, 05/10/2026)
  CATALOGUE: catalogueSimple([]),
  SUPPLIERS: [],
  SUP_BY_ID: {},
  exercice: 'Séance 3 : la visite de la plateforme',
  lexique: SEANCE.LEXIQUE,
  entrepot: SEANCE.VISITE,
  sansTrame: "Tout à l'écran",
});
export const meta = s.meta;
export const rendre = s.rendre;
