// ENT-5.2 — Smoby, « l'arrivée de Yanis ». Deuxième séance du scénario S1 de la 2de GATL
// (brief `docs/briefs/ENT-5.2-smoby-arrivee.md`, coordination `docs/briefs/COORDINATION-smoby.md`).
//
// Poste A, assistant RH, en guidage : préparer l'arrivée du cariste recruté en ENT-5.1 (fiche d'arrivée :
// pièces à demander, premier jour dans l'ordre), planifier les présences de l'équipe pour le pic (vue
// Planning, cas « personnel »), reprendre le planning après un imprévu, faire le point avec Sophie par
// phrases à choisir. Données dans `contenus/smoby-ent52.js`, univers commun dans `contenus/smoby.js`.
//
// Pas de `notation` : 22 jalons pondérés, somme des poids = 20 (barème validé par Tristan le 07/10/2026). Une base par séance (pas de `jeuId`) : un élève qui
// n'a pas fini reprend où il en était à la séance suivante.
// Trame élève (format long, 7 étapes, brief `docs/briefs/COWORK-trame-smoby-5.2.md`, relue par Tristan le 06/10/2026) ;
// son corrigé s'ajoute au corrigé calculé (`meta.corrige`).

import { seanceEntreprise } from '../core/types/seance-entreprise.js';
import * as SMOBY from '../contenus/smoby.js';
import * as SEANCE from '../contenus/smoby-ent52.js';
const s = seanceEntreprise(SMOBY, SEANCE, {
  id: 'smoby-arrivee',
  code: 'ENT-5.2',
  titre: 'Smoby — l’arrivée du cariste',
  desc: 'Assistant RH : préparer l’arrivée du cariste recruté (pièces à demander, programme du premier jour), puis planifier '
    + 'les présences et les congés de l’équipe avant le pic, et replanifier après un imprévu.',
  niveaux: ['2de'],
  competences: ['AGO-3.1', 'AGO-3.2'],
  domaines: ['D2', 'D3'],
  coeur: true,
  temps: 'guidage',
  bareme: 20,           // 22 jalons pondérés, somme des poids = 20
  // Parcours strict : ne s'ouvre qu'à l'élève qui a validé ENT-5.1 (voir core/parcours.js).
  parcours: true,
  // Règle du premier bilan et correction (brief SMOBY-retours-classe-5.1, 07/10/2026) : voir core/types/entreprise.js.
  correction: true,
  precedente: 'smoby-recrutement',
  trame: 'smoby-arrivee',
  pret: true,
  ouverture: 'prof',
}, {
  // Les écrans de données du menu (05/10/2026) : aucun ; la fiche et le planning ajoutent leurs entrées.
  menu: [],
  stockOuvert: true,            // pas de code pour le Stock chez Smoby (décision de Tristan, 05/10/2026)
  exercice: 'Séance 2 : l’arrivée de Yanis',
  lexique: SEANCE.LEXIQUE,
  fiche: SEANCE.FICHE,
  planning: SEANCE.PLANNING,
});
export const meta = s.meta;
export const rendre = s.rendre;
