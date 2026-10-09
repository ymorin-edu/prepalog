// ENT-5.5 — Smoby, « ranger et saisir l'entrée ». Scénario S1 de la 2de GATL, poste C (cariste), guidage
// (brief `docs/briefs/ENT-5.5-smoby-rangement.md`, coordination `docs/briefs/COORDINATION-smoby.md`).
//
// Ranger sur le plan de l'entrepôt (vue `core/types/entrepot.js`) les 4 palettes reçues d'Arinthod en
// ENT-5.4, saisir l'entrée en stock des quantités réellement reçues (l'établi abîmé « en litige »), lire
// l'écran Stock, répondre à l'exploitation Kuehne+Nagel par phrases à choisir.
// Données dans `contenus/smoby-ent55.js`, plateforme dans `contenus/smoby-entrepot.js`.
//
// Pas de `notation` : neuf jalons ramenés sur 20. Une base par séance (pas de `jeuId`).
// Trame élève (brief `docs/briefs/COWORK-trames-smoby-5.3-5.8.md`, relue par Tristan le 09/10/2026) ; son corrigé s'ajoute au corrigé calculé (`meta.corrige`).

import { seanceEntreprise } from '../core/types/seance-entreprise.js';
import * as SMOBY from '../contenus/smoby.js';
import * as SEANCE from '../contenus/smoby-ent55.js';
const s = seanceEntreprise(SMOBY, SEANCE, {
  id: 'smoby-rangement',
  code: 'ENT-5.5',
  titre: 'Smoby — ranger et saisir l’entrée',
  desc: 'Cariste : ranger sur le plan de l’entrepôt les palettes reçues d’Arinthod (choisir la travée, puis l’emplacement) '
    + 'en respectant les règles de l’entrepôt, saisir l’entrée en stock des quantités réellement reçues, vérifier le stock '
    + 'et prévenir l’exploitation Kuehne+Nagel.',
  niveaux: ['2de'],
  competences: ['C1.5', 'C1.6'],
  domaines: ['D4'],
  coeur: true,
  temps: 'guidage',
  // Parcours strict : ne s'ouvre qu'à l'élève qui a validé ENT-5.4 (voir core/parcours.js).
  parcours: true,
  // Elle ouvre la suivante dès qu'elle est finie, justes ou faux (lot 0 de SMOBY-notation-5.3-5.8 : aucun élève bloqué).
  suiteAuBilan: true,
  precedente: 'smoby-reception',
  trame: 'smoby-rangement',
  pret: true,
  ouverture: 'prof',
}, {
  // Les écrans de données du menu (05/10/2026) : ceux dont la séance se sert, et au moindre doute on les garde.
  menu: ['receptions', 'stock', 'console'],
  stockOuvert: true,            // pas de code pour le Stock chez Smoby (décision de Tristan, 05/10/2026)
  SUPPLIERS: [SEANCE.FOURNISSEUR],
  SUP_BY_ID: { [SEANCE.FOURNISSEUR.id]: SEANCE.FOURNISSEUR },
  exercice: 'Séance 5 : ranger et saisir l’entrée',
  lexique: SEANCE.LEXIQUE,
  entrepot: SEANCE.ENTREPOT,
  receptionLitige: true,
});
export const meta = s.meta;
export const rendre = s.rendre;
