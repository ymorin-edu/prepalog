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

import { creerEntreprise } from '../core/types/entreprise.js';
import * as SPARTOO from '../contenus/spartoo.js';
import * as SEANCE from '../contenus/spartoo-reception.js';

export const meta = {
  id: 'spartoo-reception',
  code: 'ENT-1.1',
  titre: 'Spartoo — réception',
  desc: "Contrôle d'une livraison fournisseur, réserves et entrée en stock avec numéro de lot.",
  rubrique: 'logisim',
  competences: [],
  bareme: SEANCE.ETAPES.length,
  notation: 'avancement',
  immersif: true,
  portee: 'eleve',
  // La base est celle de Spartoo, partagée avec les autres séances de l'entreprise. Le score,
  // lui, reste enregistré sur cette activité : le suivi de classe garde une ligne par séance.
  jeuId: 'spartoo',
  tables: {},
  pret: true,
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
  exercice: SEANCE.EXERCICE,
  accueil: SEANCE.ACCUEIL,
  volet: SEANCE.VOLET,
  etapes: SEANCE.ETAPES,
  THEME: SPARTOO.THEME,
  trame: {
    pdf: './contenus/trames/spartoo-reception-trame-eleve.pdf',
    docx: './contenus/trames/spartoo-reception-trame-eleve.docx',
  },
});

export function rendre(hote, ctx) { moteur.rendre(hote, ctx); }
