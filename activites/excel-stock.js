// TAB-2 — Excel, gestion des stocks. Reprise du module C-2 de la Suite Logistique.
//
// Dix exercices, du RECHERCHEV simple au tableau de bord complet. Chacun porte son
// propre niveau : l'élève ne voit que ce qui correspond à sa classe. Le contenu et les
// corrigés sont dans contenus/tab2-stocks.js, les classeurs dans contenus/tab2/.

import { creerSerieTableur } from '../core/types/tableur.js';
import { EXERCICES } from '../contenus/tab2-stocks.js';

export const meta = {
  id: 'excel-stock',
  code: 'TAB-2',
  titre: 'Excel — Gestion des stocks',
  desc: 'Dix exercices : RECHERCHEV, SIERREUR, SI imbriqués, tableaux croisés dynamiques.',
  rubrique: 'tableur',
  // Pas de champ `niveaux` : par défaut, tout est ouvert à tous les niveaux.
  // C'est « Conduite de séance » qui ferme ce qu'on ne veut pas ouvrir ce jour-là.
  competences: [],
  bareme: EXERCICES.length,
  portee: 'eleve',
  tables: { resultats: {} },
  pret: true,
};

const moteur = creerSerieTableur({
  consigne: "Téléchargez le classeur, complétez-le, puis déposez-le pour obtenir la correction. "
    + 'Le fichier reste sur votre ordinateur : seul le résultat du contrôle est enregistré.',
  feuille: 'Exercice',
  dossier: './contenus/tab2/',
  exercices: EXERCICES,
});

export function rendre(hote, ctx) { moteur.rendre(hote, ctx); }
