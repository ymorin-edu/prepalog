// ENT-3.3 — Boost, « la tournée à corriger ». Troisième séance de C2.4 « Organiser une tournée
// de livraison » : l'ERREUR INDUITE, après le guidage d'ENT-3.1 et l'entraînement d'ENT-3.2.
//
// Même journée qu'ENT-3.2, mais la tournée est déjà faite — par Inès, une collègue, avec une
// erreur plausible : la plus petite commande laissée à quai, puis l'ordre le plus court. L'élève la
// contrôle par le calcul (jauges sans verdict), répond à Inès contrainte par contrainte en chiffrant,
// puis la répare. Brief : `docs/briefs/ENT-3.3-boost-tournee-a-corriger.md` ; contenu et jalons :
// `contenus/boost-ent33.js`. Aucun écran nouveau : le moteur a reçu `etatInitial` et `sansVerdict`.
//
// EN DEUX TEMPS depuis le 03/10/2026 (chantier E, `docs/briefs/ENT-3.3-deux-temps.md`) : contrôler la
// tournée et la feuille d'Inès FIGÉES, lui répondre, puis corriger et cliquer « J'ai terminé ». Le
// moteur a reçu les options `fige`, `etiquettes`, `termine` et la feuille « comme un tableur ».
//
// ── `pret: true` ────────────────────────────────────────────────────────────────────────
// Validée à l'écran par Tristan le 03/10/2026 : la séance est visible des élèves.
//
// ── Pas de `notation` ───────────────────────────────────────────────────────────────────
// Comme ENT-3.1 et ENT-3.2 : jalons ET note sur 20.

import { creerEntreprise } from '../core/types/entreprise.js';
import * as BOOST from '../contenus/boost.js';
import * as SEANCE from '../contenus/boost-ent33.js';

export const meta = {
  id: 'boost-ent33',
  code: 'ENT-3.3',
  titre: 'Boost — la tournée à corriger',
  desc: 'La tournée d’une collègue ne tient pas : dire quelles contraintes elle viole, le prouver '
    + 'par le calcul, puis la réparer.',
  rubrique: 'simulog',
  competences: ['C2.4'],
  temps: 'erreur',
  bareme: SEANCE.ETAPES.length,
  immersif: true,
  portee: 'eleve',
  // Séance X.3 : elle ne remet pas à zéro la base commune de Boost, qui porte aussi ENT-3.1 et
  // ENT-3.2. L'état de sa tournée est cloisonné par `transportId`, son message par son volet.
  reinitialisable: false,
  jeuId: 'boost',
  tables: {},
  pret: true,
  // Trame élève : déclarer, c'est valider (trames validées par Tristan le 04/10/2026). Un test
  // vérifie que les deux fichiers existent dans le dépôt.
  // Corrigé de la trame : affiché dans l'onglet « Corrigés » de l'espace enseignant, jamais côté
  // élève. Fichier généré par le générateur de la trame.
  corrige: './contenus/corriges/ENT-3.3.js',
};

// Pas de `plan` : tous les clients sont déjà sur la carte, il n'y a rien à situer. La tournée
// porte le plan elle-même.
const moteur = creerEntreprise({
  ENTREPRISE: BOOST.ENTREPRISE,
  VOCAB: BOOST.VOCAB,
  CATALOGUE: BOOST.CATALOGUE,
  SUPPLIERS: BOOST.SUPPLIERS,
  SUP_BY_ID: BOOST.SUP_BY_ID,
  CUSTOMERS: BOOST.CUSTOMERS,
  CM: BOOST.CM,
  baseDeDepart: BOOST.baseDeDepart,
  THEME: BOOST.THEME,
  etapes: SEANCE.ETAPES,
  exercice: 'Séance 3 : la tournée à corriger',
  accueil: SEANCE.ACCUEIL,
  volet: SEANCE.VOLET,
  transportSection: 'Tournées',
  transportId: SEANCE.TRANSPORT_ID,
  tournee: SEANCE.TOURNEE,
  trame: {
    pdf: './contenus/trames/ENT-3.3-boost-a-corriger-trame-eleve.pdf',
    docx: './contenus/trames/ENT-3.3-boost-a-corriger-trame-eleve.docx',
  },
});

export function rendre(hote, ctx) { moteur.rendre(hote, ctx); }
