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

import { seanceEntreprise } from '../core/types/seance-entreprise.js';
import * as BOOST from '../contenus/boost.js';
import * as SEANCE from '../contenus/boost-ent33.js';
// Pas de `plan` : tous les clients sont déjà sur la carte, il n'y a rien à situer. La tournée
// porte le plan elle-même.
const s = seanceEntreprise(BOOST, SEANCE, {
  id: 'boost-ent33',
  code: 'ENT-3.3',
  titre: 'Boost — la tournée à corriger',
  desc: 'La tournée d’une collègue ne tient pas : dire quelles contraintes elle viole, le prouver '
    + 'par le calcul, puis la réparer.',
  competences: ['C2.4'],
  temps: 'erreur',
  // Séance X.3 : elle ne remet pas à zéro la base commune de Boost, qui porte aussi ENT-3.1 et
  // ENT-3.2. L'état de sa tournée est cloisonné par `transportId`, son message par son volet.
  reinitialisable: false,
  jeuId: 'boost',
  // Trame élève : la déclarer, c'est la valider (relue par Tristan). Le corrigé se déduit du code.
  trame: 'boost-a-corriger',
  pret: true,
}, {
  // Les écrans de données du menu (05/10/2026) : ceux dont la séance se sert, et au moindre doute on les garde.
  menu: ['clients'],
  exercice: 'Séance 3 : la tournée à corriger',
  transportSection: 'Tournées',
  transportId: SEANCE.TRANSPORT_ID,
  tournee: SEANCE.TOURNEE,
});
export const meta = s.meta;
export const rendre = s.rendre;
