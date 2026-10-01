// TAB-3 — Calculs commerciaux. Reprise du module C-3 de la Suite Logistique.
//
// Dix cas tirés du métier : suivi de chantier, consommation d'un véhicule, devis, bon de
// commande, catalogue au coefficient, prix de revient, tenue d'un compte, tenue des
// stocks. Le contenu et les corrigés sont dans contenus/tab3-calculs-commerciaux.js
// (fichier généré), les classeurs dans contenus/tab3/.
//
// Contrairement à TAB-1, les dix cas se corrigent tous automatiquement : aucun ne repose
// sur un graphique ni sur une mise en forme conditionnelle. Le barème est donc 10.
//
// Pas de champ `niveaux` : ces calculs servent de la Seconde au CAP. L'enseignant ferme
// ce qu'il ne veut pas ouvrir dans « Conduite de séance ».

import { creerSerieTableur } from '../core/types/tableur.js';
import { EXERCICES } from '../contenus/tab3-calculs-commerciaux.js';

export const meta = {
  id: 'calculs-commerciaux',
  code: 'TAB-3',
  titre: 'Calculs commerciaux',
  desc: 'Dix cas : durées et coûts, remises, TVA, coefficient multiplicateur, prix de revient, solde, stocks.',
  rubrique: 'tableur',
  niveaux: ['2de', '1re', 'tle', 'cap'],
  competences: [],
  bareme: EXERCICES.length,
  portee: 'eleve',
  tables: { resultats: {} },
  pret: true,
};

const moteur = creerSerieTableur({
  consigne: "Chaque cas a son classeur : téléchargez-le, lisez l'onglet « Consignes », "
    + "complétez l'onglet « Exercice », enregistrez, puis déposez votre fichier pour la correction. "
    + 'Le fichier reste sur votre ordinateur : seul le résultat du contrôle est enregistré.',
  feuille: 'Exercice',
  dossier: './contenus/tab3/',
  exercices: EXERCICES,
});

export function rendre(hote, ctx) { moteur.rendre(hote, ctx); }
