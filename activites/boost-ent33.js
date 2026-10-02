// ENT-3.3 — Boost, « la tournée à corriger ». Troisième séance de C2.4 « Organiser une tournée
// de livraison » : l'ERREUR INDUITE, après le guidage d'ENT-3.1 et l'entraînement d'ENT-3.2.
//
// Même journée qu'ENT-3.2, mais la tournée est déjà faite — par Inès, une collègue, avec une
// erreur plausible : la plus petite commande laissée à quai, puis l'ordre le plus court. L'élève la
// contrôle par le calcul (jauges sans verdict), répond à Inès contrainte par contrainte en chiffrant,
// puis la répare. Brief : `docs/briefs/ENT-3.3-boost-tournee-a-corriger.md` ; contenu et jalons :
// `contenus/boost-ent33.js`. Aucun écran nouveau : le moteur a reçu `etatInitial` et `sansVerdict`.
//
// ── `pret: false` ───────────────────────────────────────────────────────────────────────
// Tant que Tristan ne l'a pas validée à l'écran, la séance est cachée aux ÉLÈVES (l'enseignant
// la voit, étiquetée « en préparation »).
//
// ── Pas de `notation` ───────────────────────────────────────────────────────────────────
// Comme ENT-3.1 et ENT-3.2 : jalons ET note sur 20. Pas de trame élève : déclarer une trame,
// c'est la valider.

import { creerEntreprise } from '../core/types/entreprise.js';
import * as BOOST from '../contenus/boost.js';
import * as SEANCE from '../contenus/boost-ent33.js';

export const meta = {
  id: 'boost-ent33',
  code: 'ENT-3.3',
  titre: 'Boost — la tournée à corriger',
  desc: 'La tournée d’une collègue ne tient pas : dire quelles contraintes elle viole, le prouver '
    + 'par le calcul, puis la réparer.',
  rubrique: 'logisim',
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
  pret: false,
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
});

export function rendre(hote, ctx) { moteur.rendre(hote, ctx); }
