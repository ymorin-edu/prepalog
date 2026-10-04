// ENT-1.2 — Spartoo, séance « préparation ». Deuxième des trois séances de l'environnement,
// porté depuis LogiSim (org « p42 »).
//
// Chaque élève travaille dans sa propre base : messagerie, commandes, préparation, bon de
// préparation, catalogue, stock, tiers et console. Rien n'est partagé — portée `eleve`.
//
// Les consignes sont dans la trame élève : le site porte l'environnement de travail, la
// trame porte le déroulé de la séance. Depuis le 01/10/2026 elle est aussi **téléchargeable
// depuis le menu de l'environnement** (PDF à imprimer, Word à compléter) : l'enseignant
// retrouve le fichier à imprimer, et une séance sans photocopie reste faisable au clavier.
// La déclarer ci-dessous vaut validation — voir core/types/entreprise.js.

import { creerEntreprise } from '../core/types/entreprise.js';
import * as SPARTOO from '../contenus/spartoo.js';

export const meta = {
  id: 'spartoo',
  code: 'ENT-1.2',
  titre: 'Spartoo — préparation',
  desc: "Traiter une commande client : contrôle du stock, bon de préparation et réapprovisionnement.",
  rubrique: 'simulog',
  // Compétences et temps pédagogique : voir core/competences.js (validé par Tristan, 02/10/2026).
  competences: ['C2.2'],
  temps: 'guidage',
  // Le barème, c'est le nombre de jalons de l'exercice : le suivi de classe montre
  // l'avancement réel, pas une note sur 20.
  bareme: SPARTOO.ETAPES.length,
  notation: 'avancement',
  // Prend toute la page : ni bandeau ni titre Prepalog autour. Voir core/app.js.
  immersif: true,
  portee: 'eleve',
  // Remise à zéro de la base par l'élève : seulement en séance X.1, qui ouvre la chaîne. Une
  // séance X.2 ou X.3 reprend le travail de la précédente ; l'effacer ferait perdre les séances d'avant.
  reinitialisable: false,
  // Base commune aux trois séances de Spartoo : l'élève prépare sur le stock qu'il a
  // lui-même réceptionné. Le score reste propre à cette activité.
  jeuId: 'spartoo',
  // Parcours strict : ENT-1.2 ne s'ouvre qu'à l'élève qui a validé ENT-1.1 (voir core/parcours.js).
  parcours: true,
  precedente: 'spartoo-reception',
  tables: {},
  pret: true,
  // Corrigé des QCM d'éco-droit de la trame : affiché dans l'onglet « Corrigés » de l'espace
  // enseignant, jamais côté élève. Fichier généré par le générateur de la trame.
  corrige: './contenus/corriges/ENT-1.2.js',
};

const moteur = creerEntreprise({
  ENTREPRISE: SPARTOO.ENTREPRISE,
  VOCAB: SPARTOO.VOCAB,
  CATALOGUE: SPARTOO.CATALOGUE,
  SUPPLIERS: SPARTOO.SUPPLIERS,
  SUP_BY_ID: SPARTOO.SUP_BY_ID,
  CUSTOMERS: SPARTOO.CUSTOMERS,
  CM: SPARTOO.CM,
  baseDeDepart: SPARTOO.baseDeDepart,
  reponsesFournisseur: SPARTOO.REPONSES_FOURNISSEUR,
  volet: SPARTOO.VOLET,
  etapes: SPARTOO.ETAPES,
  THEME: SPARTOO.THEME,
  trame: {
    pdf: './contenus/trames/ENT-1.2-spartoo-preparation-trame-eleve.pdf',
    docx: './contenus/trames/ENT-1.2-spartoo-preparation-trame-eleve.docx',
  },
});

export function rendre(hote, ctx) { moteur.rendre(hote, ctx); }
