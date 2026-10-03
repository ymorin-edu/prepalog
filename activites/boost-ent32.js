// ENT-3.2 — Boost, « la tournée sous contrainte ». Deuxième séance de C2.4 « Organiser une
// tournée de livraison » : l'ENTRAÎNEMENT, après le guidage d'ENT-3.1.
//
// Même geste, autre journée : huit clients dont quatre nouveaux à situer sur la carte réelle de
// Nîmes, un client à laisser à quai qu'on trouve par le calcul (jauges muettes), un créneau de
// livraison que le trajet le plus court rate, et un trajet le plus court qui compte en paliers.
// Les décisions sont dans `claude/prepalog-boost-cadrage-ent32-34.md`, le contenu dans
// `contenus/boost-ent32.js`, la journée dans `contenus/boost-ent32-carte.js` (généré).
//
// L'IMPRÉVU (03/10/2026, brief `docs/briefs/ENT-3.2-imprevu.md`) : une fois la tournée juste et
// la feuille vérifiée, un message du responsable change la journée (un client annule, le créneau
// change de client). L'élève replanifie : dix jalons au lieu de huit. Détails dans le contenu.
//
// ── `pret: true` ────────────────────────────────────────────────────────────────────────
// Validée à l'écran par Tristan le 03/10/2026 (imprévu compris) : ouverte aux élèves.
//
// ── Pas de `notation` ───────────────────────────────────────────────────────────────────
// Comme ENT-3.1 : jalons ET note sur 20 (le suivi ramène le score sur 20), voir l'en-tête de
// `activites/boost-tournee.js`. Pas de trame élève : déclarer une trame, c'est la valider.

import { creerEntreprise } from '../core/types/entreprise.js';
import * as BOOST from '../contenus/boost.js';
import * as SEANCE from '../contenus/boost-ent32.js';

export const meta = {
  id: 'boost-ent32',
  code: 'ENT-3.2',
  titre: 'Boost — la tournée sous contrainte',
  desc: 'Situer quatre nouveaux clients sur la carte de Nîmes, décider ce qui reste à quai, puis '
    + 'ordonner les arrêts pour tenir le train et le créneau d’un client, par le trajet le plus court. '
    + 'Puis un imprévu change la journée : replanifier la tournée.',
  rubrique: 'logisim',
  competences: ['C2.4'],
  temps: 'entrainement',
  bareme: SEANCE.ETAPES.length,
  immersif: true,
  portee: 'eleve',
  // Séance X.2 : elle ne remet pas à zéro la base commune de Boost, qui porte aussi ENT-3.1.
  // L'état de ses deux vues est cloisonné par `transportId`.
  reinitialisable: false,
  jeuId: 'boost',
  tables: {},
  pret: true,
};

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
  exercice: 'Séance 2 : la tournée sous contrainte',
  accueil: SEANCE.ACCUEIL,
  volet: SEANCE.VOLET,
  transportSection: 'Tournées',
  transportId: SEANCE.TRANSPORT_ID,
  plan: SEANCE.PLAN,
  // La tournée AVEC sa phase d'imprévu : seule ENT-3.2 la déclare (ENT-3.3 reprend `TOURNEE`).
  tournee: SEANCE.TOURNEE_IMPREVU,
});

export function rendre(hote, ctx) { moteur.rendre(hote, ctx); }
