// ENT-5.7 — Kuehne+Nagel, « les enlèvements de Noël ». Septième séance du scénario S1 de la 2de GATL
// (brief `docs/briefs/ENT-5.7-smoby-enlevements.md`, coordination `docs/briefs/COORDINATION-smoby.md`).
//
// Poste B, agent d'exploitation à l'agence Kuehne+Nagel de Besançon, en guidage : affecter un chauffeur
// et un camion à chacun des 5 enlèvements de la commande de Noël chez Smoby (vue Planning, cas
// « chauffeurs et camions »), puis replanifier après la panne du Semi n° 2. Données dans
// `contenus/smoby-ent57.js`, univers commun (chauffeurs, camions, trajets) dans `contenus/smoby.js`.
//
// L'environnement reste celui de Smoby (logo, charte : pas de logo K+N, brief ENT-5.8 §2) ; le sous-titre
// et l'adresse de messagerie de l'élève sont ceux de l'agence K+N.
// Pas de `notation` : 17 jalons pondérés, somme des poids = 20 (lot 1 du brief SMOBY-notation-5.3-5.8). Une base par
// séance (pas de `jeuId`).
// Pas encore de trame élève : Cowork l'écrit après la validation à l'écran (brief §9).

import { creerEntreprise } from '../core/types/entreprise.js';
import * as SMOBY from '../contenus/smoby.js';
import * as SEANCE from '../contenus/smoby-ent57.js';

export const meta = {
  id: 'smoby-enlevements',
  code: 'ENT-5.7',
  titre: 'Kuehne+Nagel — les enlèvements de Noël',
  desc: 'Agent d’exploitation à l’agence Kuehne+Nagel de Besançon : affecter un chauffeur et un camion à chacun des 5 enlèvements '
    + 'de la commande de Noël chez Smoby, en respectant permis, pauses, temps de conduite et repos, puis replanifier après une panne.',
  rubrique: 'simulog',
  niveaux: ['2de'],
  competences: ['OTM-C2.2', 'OTM-C3.2'],
  domaines: ['D2'],
  coeur: true,
  temps: 'guidage',
  bareme: 20,           // 17 jalons pondérés, somme des poids = 20
  immersif: true,
  // Parcours strict : ne s'ouvre qu'à l'élève qui a validé ENT-5.6 (voir core/parcours.js).
  parcours: true,
  // Règle du premier bilan et correction (lot 1 de SMOBY-notation-5.3-5.8) : la suite s'ouvre dès que la séance est
  // finie, « Corriger » rouvre le planning, la note est celle du premier bilan (voir core/types/entreprise.js).
  correction: true,
  precedente: 'smoby-preparation',
  portee: 'eleve',
  tables: {},
  corrige: './contenus/corriges/ENT-5.7.js',
  pret: true,
  ouverture: 'prof',
};

const moteur = creerEntreprise({
  // Les écrans de données du menu : aucun ; le planning ajoute son entrée.
  menu: [],
  stockOuvert: true,
  ENTREPRISE: { ...SMOBY.ENTREPRISE, sousTitre: 'Côté transport : Kuehne+Nagel, agence Route de Besançon' },
  VOCAB: { ...SMOBY.VOCAB, mailDomain: SMOBY.KN_AGENCE.mailDomain },
  CATALOGUE: SMOBY.CATALOGUE,
  SUPPLIERS: SMOBY.SUPPLIERS,
  SUP_BY_ID: SMOBY.SUP_BY_ID,
  CUSTOMERS: SMOBY.CUSTOMERS,
  CM: SMOBY.CM,
  baseDeDepart: SMOBY.baseDeDepart,
  THEME: SMOBY.THEME,
  etapes: SEANCE.ETAPES,
  exercice: 'Séance 7 : les enlèvements de Noël',
  accueil: SEANCE.ACCUEIL,
  volet: SEANCE.VOLET,
  lexique: SEANCE.LEXIQUE,
  planning: SEANCE.PLANNING,
  sansTrame: "Tout à l'écran",
});

export function rendre(hote, ctx) { moteur.rendre(hote, ctx); }
