// QUI-6 — Zones et opérations de l'entrepôt.
// Activité témoin du type « association » : chaque opération se range dans sa zone.

import { creerAssoc } from '../core/types/assoc.js';

export const meta = {
  id: 'zones-entrepot',
  code: 'QUI-6',
  titre: "Zones et opérations de l'entrepôt",
  desc: 'Ranger chaque opération dans la zone où elle se déroule.',
  rubrique: 'quiz',
  // Pas de champ `niveaux` : par défaut, tout est ouvert à tous les niveaux.
  // C'est « Conduite de séance » qui ferme ce qu'on ne veut pas ouvrir ce jour-là.
  // Compétences et temps pédagogique : voir core/competences.js (validé par Tristan, 02/10/2026).
  competences: ['C1.1'],
  temps: 'entrainement',
  bareme: 12,
  portee: 'eleve',
  pret: true,
};

const moteur = creerAssoc({
  consigne: "Chaque opération se déroule dans une zone précise de l'entrepôt. Rangez les douze étiquettes.",
  categories: [
    { id: 'reception', label: 'Quai de réception', aide: "Ce qui entre dans l'entrepôt." },
    { id: 'stockage', label: 'Zone de stockage', aide: 'Là où la marchandise attend.' },
    { id: 'preparation', label: 'Zone de préparation', aide: 'Là où les commandes se constituent.' },
    { id: 'expedition', label: "Quai d'expédition", aide: "Ce qui sort de l'entrepôt." },
  ],
  etiquettes: [
    { id: 'e1', texte: 'Déchargement du camion', categorie: 'reception' },
    { id: 'e2', texte: 'Contrôle du bon de livraison', categorie: 'reception' },
    { id: 'e3', texte: 'Contrôle de la température', categorie: 'reception' },
    { id: 'e4', texte: 'Mise en stock à l\'adresse', categorie: 'stockage' },
    { id: 'e5', texte: 'Inventaire tournant', categorie: 'stockage' },
    { id: 'e6', texte: 'Réapprovisionnement du picking', categorie: 'stockage' },
    { id: 'e7', texte: 'Prélèvement des articles', categorie: 'preparation' },
    { id: 'e8', texte: 'Colisage et emballage', categorie: 'preparation' },
    { id: 'e9', texte: 'Édition du bon de préparation', categorie: 'preparation' },
    { id: 'e10', texte: 'Filmage de la palette', categorie: 'expedition' },
    { id: 'e11', texte: 'Édition de la lettre de voiture', categorie: 'expedition' },
    { id: 'e12', texte: 'Chargement du camion', categorie: 'expedition' },
  ],
});

export function rendre(hote, ctx) { moteur.rendre(hote, ctx); }
