// ENT-1.3 — Spartoo, séance « traçabilité ». Dernière des trois séances de l'environnement.
//
// Même entreprise, même base que la réception (ENT-1.1) et la préparation (ENT-1.2) : c'est ce
// que dit `meta.jeuId`. L'élève remonte ici le lot qu'il a lui-même réceptionné, retrouve les
// clients qui ont reçu des paires de ce lot, et bloque ce qu'il en reste.
//
// Les consignes sont dans la trame élève : le site porte l'environnement de travail, la
// trame porte le déroulé de la séance. Depuis le 01/10/2026 elle est aussi **téléchargeable
// depuis le menu de l'environnement** (PDF à imprimer, Word à compléter) : l'enseignant
// retrouve le fichier à imprimer, et une séance sans photocopie reste faisable au clavier.
// La déclarer ci-dessous vaut validation — voir core/types/entreprise.js.

import { creerEntreprise } from '../core/types/entreprise.js';
import * as SPARTOO from '../contenus/spartoo.js';
import * as SEANCE from '../contenus/spartoo-tracabilite.js';

export const meta = {
  id: 'spartoo-tracabilite',
  code: 'ENT-1.3',
  titre: 'Spartoo — traçabilité',
  desc: "Remonter un lot défectueux dans les deux sens, bloquer le stock restant et rendre compte.",
  rubrique: 'logisim',
  competences: [],
  bareme: SEANCE.ETAPES.length,
  notation: 'avancement',
  immersif: true,
  portee: 'eleve',
  // La base est celle de Spartoo, partagée avec les deux autres séances. Le score, lui, reste
  // enregistré sur cette activité : le suivi de classe garde une ligne par séance.
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
    pdf: './contenus/trames/spartoo-tracabilite-trame-eleve.pdf',
    docx: './contenus/trames/spartoo-tracabilite-trame-eleve.docx',
  },
});

export function rendre(hote, ctx) { moteur.rendre(hote, ctx); }
