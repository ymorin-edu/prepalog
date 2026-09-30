// Activité témoin nº 2 — base de données partagée par toute la classe, portée groupe.
// Reprend le principe du module Magasin actuel, mais entièrement porté par le noyau :
// ce fichier ne contient qu'un schéma de tables.
//
// Pour passer cette activité en « chacun sa base », il suffit d'écrire portee: 'eleve'.

import { creerTableau } from '../core/types/tableau.js';

export const meta = {
  id: 'op1',
  code: 'OP-1',
  titre: 'Base du magasin',
  desc: 'Produits, emplacements et stock. Base commune à toute la classe.',
  rubrique: 'magasin',
  portee: 'groupe',
  pret: true,
  tables: {
    produits: {
      label: 'Produits', singulier: 'un produit',
      champs: [
        { cle: 'reference', label: 'Référence', requis: true, placeholder: 'ex : REF-0231' },
        { cle: 'designation', label: 'Désignation', requis: true, placeholder: "ex : Carton d'ampoules LED" },
        { cle: 'categorie', label: 'Catégorie', type: 'select', options: ['Alimentaire', 'Textile', 'Électronique', 'Outillage', 'Fournitures', 'Autre'] },
        { cle: 'unite', label: 'Unité', type: 'select', options: ['Unité', 'Colis', 'Palette'] },
        { cle: 'pcb', label: 'PCB', type: 'number', placeholder: 'ex : 12' },
      ],
    },
    emplacements: {
      label: 'Emplacements', singulier: 'un emplacement',
      champs: [
        { cle: 'code', label: 'Adresse', requis: true, placeholder: 'ex : A-03-2' },
        { cle: 'zone', label: 'Zone', type: 'select', options: ['Réserve', 'Picking', 'Quai réception', 'Quai expédition'] },
        { cle: 'capacite', label: 'Capacité', type: 'number' },
      ],
    },
    stock: {
      label: 'Stock', singulier: 'une ligne de stock',
      // Table à écriture partagée : plusieurs élèves ajustent les mêmes quantités.
      ecriture: 'tous',
      champs: [
        { cle: 'reference', label: 'Produit', type: 'lien', table: 'produits', champCle: 'reference', champLibelle: 'designation', requis: true },
        { cle: 'emplacement', label: 'Emplacement', type: 'lien', table: 'emplacements', champCle: 'code', champLibelle: 'zone', requis: true },
        { cle: 'quantite', label: 'Quantité', type: 'number', requis: true },
      ],
    },
  },
};

const moteur = creerTableau({ tables: meta.tables });

export function rendre(hote, ctx) { moteur.rendre(hote, ctx); }

// Contenu de départ que l'enseignant peut semer en un clic depuis son espace.
export const graines = {
  produits: [
    { reference: 'REF-0101', designation: 'Carton de gants de manutention', categorie: 'Fournitures', unite: 'Colis', pcb: 24 },
    { reference: 'REF-0102', designation: "Palette d'eau minérale 1,5 L", categorie: 'Alimentaire', unite: 'Palette', pcb: 6 },
    { reference: 'REF-0103', designation: 'Ampoules LED E27', categorie: 'Électronique', unite: 'Colis', pcb: 12 },
  ],
  emplacements: [
    { code: 'A-01-1', zone: 'Picking', capacite: 40 },
    { code: 'A-02-1', zone: 'Picking', capacite: 40 },
    { code: 'B-01-3', zone: 'Réserve', capacite: 120 },
  ],
  stock: [],
};
