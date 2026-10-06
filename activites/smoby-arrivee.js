// ENT-5.2 — Smoby, « l'arrivée de Yanis ». Deuxième séance du scénario S1 de la 2de GATL
// (brief `docs/briefs/ENT-5.2-smoby-arrivee.md`, coordination `docs/briefs/COORDINATION-smoby.md`).
//
// Poste A, assistant RH, en guidage : préparer l'arrivée du cariste recruté en ENT-5.1 (fiche d'arrivée :
// pièces à demander, premier jour dans l'ordre), planifier les présences de l'équipe pour le pic (vue
// Planning, cas « personnel »), reprendre le planning après un imprévu, faire le point avec Sophie par
// phrases à choisir. Données dans `contenus/smoby-ent52.js`, univers commun dans `contenus/smoby.js`.
//
// Pas de `notation` : quatorze jalons ramenés sur 20. Une base par séance (pas de `jeuId`) : un élève qui
// n'a pas fini reprend où il en était à la séance suivante.
// Pas encore de trame élève : Cowork l'écrit après la validation à l'écran (brief §9).

import { creerEntreprise } from '../core/types/entreprise.js';
import * as SMOBY from '../contenus/smoby.js';
import * as SEANCE from '../contenus/smoby-ent52.js';

export const meta = {
  id: 'smoby-arrivee',
  code: 'ENT-5.2',
  titre: 'Smoby — l’arrivée de Yanis',
  desc: 'Assistant RH : préparer l’arrivée du cariste recruté (pièces à demander, programme du premier jour), puis planifier '
    + 'les présences et les congés de l’équipe avant le pic, et replanifier après un imprévu.',
  rubrique: 'simulog',
  niveaux: ['2de'],
  competences: ['AGO-3.1', 'AGO-3.2'],
  domaines: ['D2', 'D3'],
  coeur: true,
  temps: 'guidage',
  bareme: SEANCE.ETAPES.length,
  immersif: true,
  // Parcours strict : ne s'ouvre qu'à l'élève qui a validé ENT-5.1 (voir core/parcours.js).
  parcours: true,
  precedente: 'smoby-recrutement',
  portee: 'eleve',
  tables: {},
  corrige: './contenus/corriges/ENT-5.2.js',
  pret: true,
  ouverture: 'prof',
};

const moteur = creerEntreprise({
  // Les écrans de données du menu (05/10/2026) : aucun ; la fiche et le planning ajoutent leurs entrées.
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
  exercice: 'Séance 2 : l’arrivée de Yanis',
  accueil: SEANCE.ACCUEIL,
  volet: SEANCE.VOLET,
  lexique: SEANCE.LEXIQUE,
  fiche: SEANCE.FICHE,
  planning: SEANCE.PLANNING,
  sansTrame: "Tout à l'écran",
});

export function rendre(hote, ctx) { moteur.rendre(hote, ctx); }
