// ENT-5.4 — Smoby, « premier déchargement ». Scénario S1 de la 2de GATL, poste C (cariste), guidage
// (brief `docs/briefs/ENT-5.4-smoby-reception.md`, coordination `docs/briefs/COORDINATION-smoby.md`).
//
// Toute la séance se joue sur la vue quai (`core/types/quai.js`) en mode SANS FROID : étape ⓪ « Avant de
// décharger » (la cale), déchargement au chariot sur la photo du quai de Smoby (décor fixe), contrôle de
// 4 palettes de jouets, réserves sur le BL, signature ; puis compte rendu à Bruno par phrases à choisir.
// Données dans `contenus/smoby-ent54.js`, univers commun dans `contenus/smoby.js`.
//
// Notation (lot 2 de SMOBY-notation-5.3-5.8, 07/10/2026) : 16 jalons pondérés sur 20, premier bilan et « Corriger »
// (seul le compte rendu à Bruno se rouvre). Une base par séance (pas de `jeuId`).
// Pas encore de trame élève : Cowork l'écrit après la validation à l'écran (brief §9).

import { seanceEntreprise } from '../core/types/seance-entreprise.js';
import * as SMOBY from '../contenus/smoby.js';
import * as SEANCE from '../contenus/smoby-ent54.js';
const s = seanceEntreprise(SMOBY, SEANCE, {
  id: 'smoby-reception',
  code: 'ENT-5.4',
  titre: 'Smoby — premier déchargement',
  desc: 'Cariste au quai de réception de la plateforme de Moirans : vérifier la sécurité avant de décharger, '
    + 'décharger au chariot un camion de l’usine d’Arinthod, contrôler 4 palettes de jouets et porter des réserves précises.',
  niveaux: ['2de'],
  competences: ['C1.2', 'C1.4'],
  domaines: ['D4', 'D5'],
  coeur: true,
  temps: 'guidage',
  bareme: 20,           // 15 jalons pondérés (somme = 20) + la signature, non notée
  // Parcours strict : ne s'ouvre qu'à l'élève qui a validé ENT-5.3 (voir core/parcours.js).
  parcours: true,
  // Premier bilan : la suivante s'ouvre dès que tout est jugé, justes ou faux ; l'élève peut corriger son compte rendu.
  correction: true,
  precedente: 'smoby-visite',
  pret: true,
  ouverture: 'prof',
}, {
  // Les écrans de données du menu (05/10/2026) : ceux dont la séance se sert, et au moindre doute on les garde.
  menu: [],
  stockOuvert: true,            // pas de code pour le Stock chez Smoby (décision de Tristan, 05/10/2026)
  exercice: 'Séance 4 : premier déchargement',
  lexique: SEANCE.LEXIQUE,
  quai: SEANCE.QUAI_ENT54,
  finFige: SEANCE.FIN_FIGE,
  sansTrame: "Tout à l'écran",
});
export const meta = s.meta;
export const rendre = s.rendre;
