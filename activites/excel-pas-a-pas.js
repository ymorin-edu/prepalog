// TAB-1 — Apprendre Excel pas à pas. Reprise du module C-1 de la Suite Logistique.
//
// Treize étapes, de la saisie d'une première cellule au tableau de bord complet. C'est la
// série de prise en main : elle s'adresse à tous les niveaux, CAP compris, parce qu'elle
// ne suppose rien d'acquis. Le contenu et les corrigés sont dans contenus/tab1-excel.js
// (fichier généré), les classeurs dans contenus/tab1/.
//
// Deux étapes — mise en forme conditionnelle et graphique — ne portent aucun contrôle :
// le lecteur de classeurs ne sait relire ni une couleur conditionnelle ni un graphique.
// Elles restent proposées et téléchargeables, se vérifient en classe, et ne comptent pas
// dans le score. Le barème est donc celui des étapes corrigeables.

import { creerSerieTableur } from '../core/types/tableur.js';
import { EXERCICES } from '../contenus/tab1-excel.js';

const CORRIGEABLES = EXERCICES.filter((e) => e.controles.length).length;

export const meta = {
  id: 'excel-pas-a-pas',
  code: 'TAB-1',
  titre: 'Apprendre Excel pas à pas',
  desc: 'Treize étapes : saisie, formules, recopie, F4, plages, SOMME, SI, fonctions texte.',
  rubrique: 'tableur',
  // Pas de champ `niveaux` : par défaut, tout est ouvert à tous les niveaux.
  // C'est « Conduite de séance » qui ferme ce qu'on ne veut pas ouvrir ce jour-là.
  competences: [],
  bareme: CORRIGEABLES,
  portee: 'eleve',
  tables: { resultats: {} },
  pret: true,
};

const moteur = creerSerieTableur({
  consigne: "Chaque étape a son classeur : téléchargez-le, lisez l'onglet « Consignes », "
    + "complétez l'onglet « Exercice », enregistrez, puis déposez votre fichier pour la correction. "
    + 'Le fichier reste sur votre ordinateur : seul le résultat du contrôle est enregistré.',
  feuille: 'Exercice',
  dossier: './contenus/tab1/',
  exercices: EXERCICES,
});

export function rendre(hote, ctx) { moteur.rendre(hote, ctx); }
