// ENT-5.4 — Smoby, « premier déchargement ». Scénario S1 de la 2de GATL, poste C (cariste), guidage
// (brief `docs/briefs/ENT-5.4-smoby-reception.md`, coordination `docs/briefs/COORDINATION-smoby.md`).
//
// Toute la séance se joue sur la vue quai (`core/types/quai.js`) en mode SANS FROID : étape ⓪ « Avant de
// décharger » (la cale), déchargement au chariot sur la photo du quai de Smoby (décor fixe), contrôle de
// 4 palettes de jouets, réserves sur le BL, signature ; puis compte rendu à Bruno par phrases à choisir.
// Données dans `contenus/smoby-ent54.js`, univers commun dans `contenus/smoby.js`.
//
// Pas de `notation` : dix jalons ramenés sur 20. Une base par séance (pas de `jeuId`).
// Pas encore de trame élève : Cowork l'écrit après la validation à l'écran (brief §9).

import { creerEntreprise } from '../core/types/entreprise.js';
import * as SMOBY from '../contenus/smoby.js';
import * as SEANCE from '../contenus/smoby-ent54.js';

export const meta = {
  id: 'smoby-reception',
  code: 'ENT-5.4',
  titre: 'Smoby — premier déchargement',
  desc: 'Cariste au quai de réception de la plateforme de Moirans : vérifier la sécurité avant de décharger, '
    + 'décharger au chariot un camion de l’usine d’Arinthod, contrôler 4 palettes de jouets et porter des réserves précises.',
  rubrique: 'simulog',
  niveaux: ['2de'],
  competences: ['C1.2', 'C1.4'],
  domaines: ['D4', 'D5'],
  coeur: true,
  temps: 'guidage',
  bareme: SEANCE.ETAPES.length,
  immersif: true,
  // Parcours strict : ne s'ouvre qu'à l'élève qui a validé ENT-5.3 (voir core/parcours.js).
  parcours: true,
  // Elle ouvre la suivante dès qu'elle est finie, justes ou faux (lot 0 de SMOBY-notation-5.3-5.8 : aucun élève bloqué).
  suiteAuBilan: true,
  precedente: 'smoby-visite',
  portee: 'eleve',
  tables: {},
  corrige: './contenus/corriges/ENT-5.4.js',
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
  exercice: 'Séance 4 : premier déchargement',
  accueil: SEANCE.ACCUEIL,
  volet: SEANCE.VOLET,
  lexique: SEANCE.LEXIQUE,
  quai: SEANCE.QUAI_ENT54,
  sansTrame: "Tout à l'écran",
});

export function rendre(hote, ctx) { moteur.rendre(hote, ctx); }
