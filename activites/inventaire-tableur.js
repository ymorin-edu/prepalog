// TAB-5 — Inventaire tournant sur tableur.
// Activité témoin du type « dépôt de classeur ». L'élève télécharge le modèle,
// complète les cases beiges avec des formules, puis dépose son fichier : le contrôle
// se fait dans son navigateur, rien n'est envoyé sur un serveur.

import { creerTableur } from '../core/types/tableur.js';

export const meta = {
  id: 'inventaire-tableur',
  code: 'TAB-5',
  titre: 'Inventaire tournant sur tableur',
  desc: 'Calculer les écarts et la valorisation du stock, puis déposer le classeur.',
  rubrique: 'tableur',
  // Pas de champ `niveaux` : par défaut, tout est ouvert à tous les niveaux.
  // C'est « Conduite de séance » qui ferme ce qu'on ne veut pas ouvrir ce jour-là.
  // Compétences et temps pédagogique : voir core/competences.js (validé par Tristan, 02/10/2026).
  competences: ['C1.6'],
  temps: 'entrainement',
  bareme: 6,
  portee: 'eleve',
  pret: true,
};

const moteur = creerTableur({
  consigne: "Téléchargez le classeur, complétez les cases beiges, enregistrez, puis déposez votre fichier ci-dessous.",
  aide: "Écart = stock physique − stock théorique. Valeur = stock physique × prix unitaire. "
      + "Les totaux se calculent avec la fonction SOMME. Utilisez des formules, pas des nombres tapés à la main.",
  modele: './contenus/tab5-inventaire.xlsx',
  controles: [
    { cellule: 'B1', libelle: 'Nom et prénom renseignés', texte: true },
    { cellule: 'E4', libelle: 'Écart de la référence REF-0101', attendu: -2, formuleAttendue: true },
    { cellule: 'E8', libelle: 'Écart de la référence REF-0105', attendu: -3, formuleAttendue: true },
    { cellule: 'G4', libelle: 'Valeur de la référence REF-0101', attendu: 495.6, tolerance: 0.01, formuleAttendue: true },
    { cellule: 'E13', libelle: 'Total des écarts', attendu: -10, formuleAttendue: true },
    { cellule: 'G13', libelle: 'Valeur totale du stock', attendu: 5612.95, tolerance: 0.05, formuleAttendue: true },
  ],
});

export function rendre(hote, ctx) { moteur.rendre(hote, ctx); }
