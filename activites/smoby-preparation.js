// ENT-5.6 — Smoby, « la palette de la commande de Noël ». Scénario S1 de la 2de GATL, poste C (cariste),
// guidage (brief `docs/briefs/ENT-5.6-smoby-preparation.md`, coordination `docs/briefs/COORDINATION-smoby.md`).
//
// Préparer sur le plan de l'entrepôt (vue `core/types/entrepot.js`, mode préparation) la palette mixte qui
// complète l'enlèvement E1 : prélever au picking dans l'ordre du serpentin, réapprovisionner le Trotteur
// depuis la réserve, monter la palette, la filmer et l'étiqueter. Aucun message à rédiger.
// Données dans `contenus/smoby-ent56.js`, plateforme et commande dans `contenus/smoby-entrepot.js`.
//
// Pas de `notation` : neuf jalons ramenés sur 20. Une base par séance (pas de `jeuId`).
// Pas encore de trame élève : Cowork l'écrit après la validation à l'écran (brief §9).

import { creerEntreprise } from '../core/types/entreprise.js';
import { catalogueSimple } from '../contenus/entreprise-commun.js';
import * as SMOBY from '../contenus/smoby.js';
import * as SEANCE from '../contenus/smoby-ent56.js';

export const meta = {
  id: 'smoby-preparation',
  code: 'ENT-5.6',
  titre: 'Smoby — la palette de la commande de Noël',
  desc: 'Cariste à la plateforme Smoby : préparer la palette mixte qui complète l’enlèvement E1 de la commande de Noël — '
    + 'prélever au picking, réapprovisionner depuis la réserve, monter une palette stable, filmer et étiqueter.',
  rubrique: 'simulog',
  niveaux: ['2de'],
  competences: ['C2.1'],
  domaines: ['D4'],
  coeur: true,
  temps: 'guidage',
  bareme: SEANCE.ETAPES.length,
  immersif: true,
  portee: 'eleve',
  tables: {},
  corrige: './contenus/corriges/ENT-5.6.js',
  pret: true,
  ouverture: 'prof',
};

const moteur = creerEntreprise({
  // Les écrans de données du menu (05/10/2026) : ceux dont la séance se sert, et au moindre doute on les garde.
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
  exercice: 'Séance 6 : la palette de la commande de Noël',
  accueil: SEANCE.ACCUEIL,
  volet: SEANCE.VOLET,
  lexique: SEANCE.LEXIQUE,
  entrepot: SEANCE.ENTREPOT,
  sansTrame: "Tout à l'écran",
});

export function rendre(hote, ctx) { moteur.rendre(hote, ctx); }
