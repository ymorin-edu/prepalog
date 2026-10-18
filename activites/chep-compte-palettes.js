// ENT-9.1 — CHEP, « le compte palettes ». Première séance de l'entreprise n° 9 (1re), service relation clients et flux du centre de
// service de Templemars : GUIDAGE de C2.5, traiter les retours des supports de charge (indicateurs « repérage des informations relatives au
// suivi » et « mise à jour de la base de données »). Brief `docs/briefs/ENT-9.1-chep-compte-palettes.md` ; cadrage commun
// `docs/briefs/COORDINATION-chep.md`. Suite : ENT-9.2 (contrôler un retour, organiser la ramasse), 9.3 (le relevé contesté), 9.4 (évaluation).
//
// Lire les documents d'une semaine d'expéditions, repérer ce qui est un mouvement de palettes CHEP (type, partenaire, nombre de palettes
// CHEP), tenir le compte (relevé en grille, solde par une formule), expliquer à la cliente ce qu'elle paie.
// Contre la copie : le solde de départ, les quantités, le document partiel (Europe ou LPR), le document sans mouvement (Europe seules ou
// commande) et l'ORDRE des documents sont tirés par élève.
// Données dans `contenus/chep-ent91.js` (et `-donnees.js`, pures), questions dans `contenus/questions/ENT-9.1.js`, univers dans `contenus/chep.js`.
//
// 11 jalons pondérés (somme 17) + 3 questions notées (`part: 3`), somme = 20 (`bareme: 20`) : poids fixés par Cowork sur délégation de
// Tristan (17/10/2026), codés tels quels, listés au compte rendu du brief. Une base par séance (pas de `jeuId`). Pas de trame pour l'instant.

import { seanceEntreprise } from '../core/types/seance-entreprise.js';
import * as CHEP from '../contenus/chep.js';
import * as SEANCE from '../contenus/chep-ent91.js';
const s = seanceEntreprise(CHEP, SEANCE, {
  id: 'chep-compte-palettes',
  code: 'ENT-9.1',
  titre: 'CHEP — le compte palettes',
  desc: 'Alternant au service relation clients du centre CHEP de Templemars : repérer les mouvements de palettes bleues dans les documents d’un '
    + 'client, préparer ses déclarations, calculer le solde de son compte et lui expliquer ce qu’il paie.',
  niveaux: ['1re'],
  competences: ['C2.5'],
  temps: 'guidage',
  bareme: 20,           // jalons pondérés (17) + questions notées (3), somme = 20
  // Parcours strict, première séance du scénario (pas de `precedente`) : ENT-9.2 s'ouvrira au premier bilan.
  parcours: true,
  // Règle du premier bilan : « Corriger » rouvre les fiches et la réponse des jalons faux ; la note est la moyenne du premier bilan et de l'état
  // à la première correction.
  correction: true,
  reinitialisable: true,
  niveauxPrevus: ['confirme'],   // cas bonus du confirmé : deux documents de plus à classer « Aucun mouvement CHEP »
  questions: 'ENT-9.1',
  pret: true,
  ouverture: 'prof',   // fermée aux élèves tant que Tristan ne l'a pas cochée dans « Conduite de séance »
}, SEANCE.OPTIONS);
export const meta = s.meta;
export const rendre = s.rendre;
