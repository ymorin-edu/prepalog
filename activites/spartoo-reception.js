// ENT-1.1 — Spartoo, séance « réception ». Première des trois séances de l'environnement.
//
// Même entreprise, même base que la préparation (ENT-1.2) et la traçabilité (ENT-1.3) : c'est
// ce que dit
// `meta.jeuId`. L'élève réceptionne ici la livraison qu'il préparera ensuite et dont il
// remontera la trace plus tard, sur son propre stock.
//
// Les consignes sont dans la trame élève : le site porte l'environnement de travail, la
// trame porte le déroulé de la séance. Depuis le 01/10/2026 elle est aussi **téléchargeable
// depuis le menu de l'environnement** (PDF à imprimer, Word à compléter) : l'enseignant
// retrouve le fichier à imprimer, et une séance sans photocopie reste faisable au clavier.
// La déclarer ci-dessous vaut validation — voir core/types/entreprise.js.

import { seanceEntreprise } from '../core/types/seance-entreprise.js';
import * as SPARTOO from '../contenus/spartoo.js';
import * as SEANCE from '../contenus/spartoo-reception.js';
const s = seanceEntreprise(SPARTOO, SEANCE, {
  id: 'spartoo-reception',
  code: 'ENT-1.1',
  titre: 'Spartoo — réception',
  desc: "Contrôle d'une livraison fournisseur, réserves et entrée en stock avec numéro de lot, du quai à l'entrée en stock.",
  // Compétences et temps pédagogique : voir core/competences.js (validé par Tristan, 02/10/2026).
  competences: ['C1.4'],
  temps: 'guidage',
  notation: 'avancement',
  // Remise à zéro de la base par l'élève : seulement en séance X.1, qui ouvre la chaîne. Une
  // séance X.2 ou X.3 reprend le travail de la précédente ; l'effacer ferait perdre les séances d'avant.
  reinitialisable: true,
  // La base est celle de Spartoo, partagée avec les autres séances de l'entreprise. Le score,
  // lui, reste enregistré sur cette activité : le suivi de classe garde une ligne par séance.
  jeuId: 'spartoo',
  // Début du parcours : jamais verrouillée ; sa validation (8/8) ouvre ENT-1.2 (voir core/parcours.js).
  parcours: true,
  // Plus d'élève bloqué en fin de séance (08/10/2026, décision de Tristan après la classe) : le bon de réception
  // ne se modifie plus une fois validé, mais le bandeau disait « à corriger » et ENT-1.2 restait fermée. Comme
  // pour Smoby 5.3 à 5.6, la suite s'ouvre dès que les 8 jalons sont jugés, justes ou faux ; le bandeau nomme
  // ce qui est faux, le détail reste à l'enseignant (Suivi). ENT-1.2 s'adapte au stock réel de l'élève.
  suiteAuBilan: true,
  // Refonte du 06/10/2026 (brief ENT-1.1-spartoo-quai §7.4, décision de Tristan) : toute base Spartoo d'une
  // version antérieure repart de zéro à sa prochaine ouverture, scores 1.1 à 1.3 effacés (core/app.js).
  versionBase: 2,
  // Trame élève : la déclarer, c'est la valider (relue par Tristan). Le corrigé se déduit du code.
  trame: 'spartoo-reception',
  pret: true,
}, {
  // Les écrans de données du menu (05/10/2026) : ceux dont la séance se sert. Plus de Stock (décision de
  // Tristan, 06/10 : il demandait un code, impasse pour l'élève) : on vérifie à la console.
  menu: ['receptions', 'fournisseurs', 'console'],
  reponsesFournisseur: SPARTOO.REPONSES_FOURNISSEUR,
  exercice: SEANCE.EXERCICE,
  quai: SEANCE.QUAI,
  documents: SEANCE.DOCUMENTS,
  fiche: SEANCE.FICHE,
  fermetures: SEANCE.FERMETURES,
});
export const meta = s.meta;
export const rendre = s.rendre;
