// ENT-1 — Spartoo. Premier environnement d'entreprise, porté depuis LogiSim (org « p42 »).
//
// Chaque élève travaille dans sa propre base : messagerie, commandes, préparation, bon de
// préparation, catalogue, stock, tiers et console. Rien n'est partagé — portée `eleve`.
//
// Le travail se fait avec la trame élève, distribuée à part (Word ou imprimée) :
// contenus/trames/. Le site porte l'environnement, la trame porte les consignes.

import { creerEntreprise } from '../core/types/entreprise.js';
import * as SPARTOO from '../contenus/spartoo.js';

export const meta = {
  id: 'spartoo',
  code: 'ENT-1',
  titre: 'Spartoo',
  desc: "Vente de chaussures en ligne — réception d'une commande et bon de préparation.",
  rubrique: 'logisim',
  competences: [],
  // Le barème, c'est le nombre de jalons de l'exercice : le suivi de classe montre
  // l'avancement réel, pas une note sur 20.
  bareme: SPARTOO.ETAPES.length,
  notation: 'avancement',
  portee: 'eleve',
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
  etapes: SPARTOO.ETAPES,
});

export function rendre(hote, ctx) { moteur.rendre(hote, ctx); }
