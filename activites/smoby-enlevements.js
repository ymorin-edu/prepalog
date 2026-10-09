// ENT-5.7 — Kuehne+Nagel, « les enlèvements de Noël ». Septième séance du scénario S1 de la 2de GATL
// (brief `docs/briefs/ENT-5.7-smoby-enlevements.md`, coordination `docs/briefs/COORDINATION-smoby.md`).
//
// Poste B, agent d'exploitation à l'agence Kuehne+Nagel de Besançon, en guidage : affecter un chauffeur
// et un camion à chacun des 5 enlèvements de la commande de Noël chez Smoby (vue Planning, cas
// « chauffeurs et camions »), puis replanifier après la panne du Semi n° 2. Données dans
// `contenus/smoby-ent57.js`, univers commun (chauffeurs, camions, trajets) dans `contenus/smoby.js`.
//
// L'environnement reste celui de Smoby (logo, charte : pas de logo K+N, brief ENT-5.8 §2) ; le sous-titre
// et l'adresse de messagerie de l'élève sont ceux de l'agence K+N.
// Pas de `notation` : 17 jalons pondérés, somme des poids = 20 (lot 1 du brief SMOBY-notation-5.3-5.8). Une base par
// séance (pas de `jeuId`).
// Trame élève (brief `docs/briefs/COWORK-trames-smoby-5.3-5.8.md`, relue par Tristan le 09/10/2026) ; son corrigé s'ajoute au corrigé calculé (`meta.corrige`).

import { seanceEntreprise } from '../core/types/seance-entreprise.js';
import * as SMOBY from '../contenus/smoby.js';
import * as SEANCE from '../contenus/smoby-ent57.js';
const s = seanceEntreprise(SMOBY, SEANCE, {
  id: 'smoby-enlevements',
  code: 'ENT-5.7',
  titre: 'Kuehne+Nagel — les enlèvements de Noël',
  desc: 'Agent d’exploitation à l’agence Kuehne+Nagel de Besançon : affecter un chauffeur et un camion à chacun des 5 enlèvements '
    + 'de la commande de Noël chez Smoby, en respectant permis, pauses, temps de conduite et repos, puis replanifier après une panne.',
  niveaux: ['2de'],
  competences: ['OTM-C2.2', 'OTM-C3.2'],
  domaines: ['D2'],
  coeur: true,
  temps: 'guidage',
  bareme: 20,           // 17 jalons pondérés, somme des poids = 20
  // Parcours strict : ne s'ouvre qu'à l'élève qui a validé ENT-5.6 (voir core/parcours.js).
  parcours: true,
  // Règle du premier bilan et correction (lot 1 de SMOBY-notation-5.3-5.8) : la suite s'ouvre dès que la séance est
  // finie, « Corriger » rouvre le planning, la note est celle du premier bilan (voir core/types/entreprise.js).
  correction: true,
  precedente: 'smoby-preparation',
  trame: 'smoby-enlevements',
  pret: true,
  ouverture: 'prof',
}, {
  // Les écrans de données du menu : aucun ; le planning ajoute son entrée.
  menu: [],
  stockOuvert: true,
  ENTREPRISE: { ...SMOBY.ENTREPRISE, sousTitre: 'Côté transport : Kuehne+Nagel, agence Route de Besançon' },
  VOCAB: { ...SMOBY.VOCAB, mailDomain: SMOBY.KN_AGENCE.mailDomain },
  exercice: 'Séance 7 : les enlèvements de Noël',
  lexique: SEANCE.LEXIQUE,
  planning: SEANCE.PLANNING,
});
export const meta = s.meta;
export const rendre = s.rendre;
