// ENT-1 — Spartoo, séance « réception ». Première des trois séances de l'environnement.
//
// Même entreprise, même base que la préparation (ENT-2) et la traçabilité : c'est ce que dit
// `meta.jeuId`. L'élève réceptionne ici la livraison qu'il préparera ensuite et dont il
// remontera la trace plus tard, sur son propre stock.
//
// Les consignes sont dans la trame élève, distribuée à part : contenus/trames/.

import { creerEntreprise } from '../core/types/entreprise.js';
import * as SPARTOO from '../contenus/spartoo.js';
import * as SEANCE from '../contenus/spartoo-reception.js';

export const meta = {
  id: 'spartoo-reception',
  code: 'ENT-1',
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
});

export function rendre(hote, ctx) { moteur.rendre(hote, ctx); }
