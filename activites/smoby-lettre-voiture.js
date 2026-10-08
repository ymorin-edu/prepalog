// ENT-5.8 — Kuehne+Nagel, « la lettre de voiture et le retard ». Huitième et dernière séance du scénario S1
// de la 2de GATL (brief `docs/briefs/ENT-5.8-smoby-lettre-voiture.md`, coordination
// `docs/briefs/COORDINATION-smoby.md`).
//
// Poste B, agent d'exploitation à l'agence Kuehne+Nagel de Besançon, en guidage : remplir la lettre de
// voiture de l'enlèvement E1 à partir de trois documents joints (fiche « Lettre de voiture », dessinée
// comme le document, envoi possible même incomplète), puis, après l'accident sur l'A40, calculer la
// nouvelle heure d'arrivée (fiche « Suivi », ouverte par le message de Julie) et prévenir le client et
// Smoby par phrases à choisir. Données dans `contenus/smoby-ent58.js`, univers commun dans `contenus/smoby.js`.
//
// L'environnement reste celui de Smoby (logo, charte : pas de logo K+N, brief §2) ; sous-titre et adresse
// de messagerie de l'agence K+N, comme ENT-5.7.
// Pas de `notation` : 26 jalons pondérés, somme des poids = 20 (lot 1 du brief SMOBY-notation-5.3-5.8). Une base par
// séance (pas de `jeuId`).
// Pas encore de trame élève : Cowork l'écrit après la validation à l'écran (brief §9).

import { seanceEntreprise } from '../core/types/seance-entreprise.js';
import * as SMOBY from '../contenus/smoby.js';
import * as SEANCE from '../contenus/smoby-ent58.js';
const s = seanceEntreprise(SMOBY, SEANCE, {
  id: 'smoby-lettre-voiture',
  code: 'ENT-5.8',
  titre: 'Kuehne+Nagel — la lettre de voiture et le retard',
  desc: 'Agent d’exploitation à l’agence Kuehne+Nagel de Besançon : remplir la lettre de voiture d’un enlèvement chez Smoby, '
    + 'puis gérer un retard et prévenir le client et l’expéditeur.',
  niveaux: ['2de'],
  competences: ['OTM-C2.1', 'OTM-C2.3'],
  domaines: ['D3', 'D1'],
  coeur: true,
  temps: 'guidage',
  bareme: 20,           // 26 jalons pondérés, somme des poids = 20
  // Parcours strict : ne s'ouvre qu'à l'élève qui a validé ENT-5.7 (voir core/parcours.js).
  parcours: true,
  // Règle du premier bilan et correction (lot 1 de SMOBY-notation-5.3-5.8) : « Corriger » rouvre la lettre, le suivi
  // et les deux messages, la note est celle du premier bilan (voir core/types/entreprise.js).
  correction: true,
  precedente: 'smoby-enlevements',
  pret: true,
  ouverture: 'prof',
}, {
  // Les écrans de données du menu : aucun ; les deux fiches ajoutent leurs entrées.
  menu: [],
  stockOuvert: true,
  ENTREPRISE: { ...SMOBY.ENTREPRISE, sousTitre: 'Côté transport : Kuehne+Nagel, agence Route de Besançon' },
  VOCAB: { ...SMOBY.VOCAB, mailDomain: SMOBY.KN_AGENCE.mailDomain },
  exercice: 'Séance 8 : la lettre de voiture et le retard',
  lexique: SEANCE.LEXIQUE,
  documents: SEANCE.DOCUMENTS,
  documentsStyle: SEANCE.STYLE_DOCUMENTS,
  fiches: [SEANCE.LETTRE, SEANCE.SUIVI],
  sansTrame: "Tout à l'écran",
});
export const meta = s.meta;
export const rendre = s.rendre;
