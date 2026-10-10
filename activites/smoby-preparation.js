// ENT-5.6 — Smoby, « la palette de la commande de Noël ». Scénario S1 de la 2de GATL, poste C (cariste),
// guidage (brief `docs/briefs/ENT-5.6-smoby-preparation.md`, coordination `docs/briefs/COORDINATION-smoby.md`).
//
// Préparer sur le plan de l'entrepôt (vue `core/types/entrepot.js`, mode préparation) la palette mixte qui
// complète l'enlèvement E1 : prélever au picking dans l'ordre du serpentin, réapprovisionner le Trotteur
// depuis la réserve, monter la palette, la filmer et l'étiqueter. Aucun message à rédiger.
// Données dans `contenus/smoby-ent56.js`, plateforme et commande dans `contenus/smoby-entrepot.js`.
//
// Pas de `notation` : neuf jalons pondérés, somme des poids = 20 (`bareme: 20`, règle du 10/10/2026). Une base par séance (pas de `jeuId`).
// Trame élève (brief `docs/briefs/COWORK-trames-smoby-5.3-5.8.md`, relue par Tristan le 09/10/2026) ; son corrigé s'ajoute au corrigé calculé (`meta.corrige`).

import { seanceEntreprise } from '../core/types/seance-entreprise.js';
import { catalogueSimple } from '../contenus/entreprise-commun.js';
import * as SMOBY from '../contenus/smoby.js';
import * as SEANCE from '../contenus/smoby-ent56.js';
const s = seanceEntreprise(SMOBY, SEANCE, {
  id: 'smoby-preparation',
  code: 'ENT-5.6',
  titre: 'Smoby — la palette de la commande de Noël',
  desc: 'Cariste à la plateforme Smoby : préparer la palette mixte qui complète l’enlèvement E1 de la commande de Noël — '
    + 'prélever au picking, réapprovisionner depuis la réserve, monter une palette stable, filmer et étiqueter.',
  niveaux: ['2de'],
  competences: ['C2.1'],
  domaines: ['D4'],
  coeur: true,
  temps: 'guidage',
  bareme: 20,           // jalons pondérés, somme des poids = 20
  // Parcours strict : ne s'ouvre qu'à l'élève qui a validé ENT-5.5 (voir core/parcours.js).
  parcours: true,
  // Elle ouvre la suivante dès qu'elle est finie, justes ou faux (lot 0 de SMOBY-notation-5.3-5.8 : aucun élève bloqué).
  suiteAuBilan: true,
  precedente: 'smoby-rangement',
  trame: 'smoby-preparation',
  pret: true,
  ouverture: 'prof',
}, {
  // Les écrans de données du menu (05/10/2026) : ceux dont la séance se sert, et au moindre doute on les garde.
  menu: [],
  stockOuvert: true,            // pas de code pour le Stock chez Smoby (décision de Tristan, 05/10/2026)
  CATALOGUE: catalogueSimple([]),
  SUPPLIERS: [],
  SUP_BY_ID: {},
  exercice: 'Séance 6 : la palette de la commande de Noël',
  lexique: SEANCE.LEXIQUE,
  entrepot: SEANCE.ENTREPOT,
  // Ses jalons ne sont jamais « faux » : elle est finie quand la préparation est terminée et vérifiée.
  seanceFinie: SEANCE.preparationFinie,
});
export const meta = s.meta;
export const rendre = s.rendre;
