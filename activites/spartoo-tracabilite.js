// ENT-3 — Spartoo, séance « traçabilité ». Dernière des trois séances de l'environnement.
//
// Même entreprise, même base que la réception (ENT-1) et la préparation (ENT-2) : c'est ce
// que dit `meta.jeuId`. L'élève remonte ici le lot qu'il a lui-même réceptionné, retrouve les
// clients qui ont reçu des paires de ce lot, et bloque ce qu'il en reste.
//
// Les consignes sont dans la trame élève, distribuée à part : contenus/trames/.

import { creerEntreprise } from '../core/types/entreprise.js';
import * as SPARTOO from '../contenus/spartoo.js';
import * as SEANCE from '../contenus/spartoo-tracabilite.js';

export const meta = {
  id: 'spartoo-tracabilite',
  code: 'ENT-3',
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
});

export function rendre(hote, ctx) { moteur.rendre(hote, ctx); }
