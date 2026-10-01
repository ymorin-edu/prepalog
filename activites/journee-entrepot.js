// TAB-4 — Une journée en entrepôt. Module neuf, écrit le 01/10/2026.
//
// Ce module ne reprend PAS le TAB-4 de la Suite Logistique (« Excel CAP OL — les bases »),
// qui a été jugé peu utile aux élèves et refait de fond en comble. Ce que le précédent
// faisait, et qu'on ne refait pas :
//
//   - ses 18 exercices n'étaient que 6 exercices recopiés trois fois, avec d'autres
//     chiffres. « Stock rayon A / B / C » était trois fois la même somme : l'élève
//     répétait sans progresser ;
//   - le travail réel était minuscule. L'exercice « additionner » demandait UNE cellule,
//     et valait 20/20. Pour un CAP, la boucle télécharger / ouvrir / renvoyer coûtait plus
//     cher que ce qu'elle faisait apprendre ;
//   - l'ordre n'était pas une progression : le test logique venait avant la somme ;
//   - le contexte métier était décoratif — des références nues, des rayons A, B, C, aucun
//     document, et six notions étanches là où il n'y a qu'une seule journée de travail.
//
// Ce module-ci suit une journée chez Stockaval, de la réception du matin à l'expédition du
// soir, avec les mêmes références d'un bout à l'autre : le stock du soir de l'exercice 5
// est ce qu'on valorise à l'exercice 6, puis ce qu'on compare au seuil aux exercices 8 à 10.
// Chaque exercice travaille UN geste Excel nommé, et les classeurs sont de vrais documents
// professionnels — bon de livraison, fiche de stock, bon de transport.
//
// La progression des gestes est l'ossature du module, et ne doit pas être réordonnée sans
// y repenser : saisir, soustraire, comparer (VRAI/FAUX), SOMME, formule à trois termes,
// multiplier puis sommer, MIN/MAX/MOYENNE, soustraction réemployée, SI donné, SI écrit par
// l'élève, référence figée (F4), conversions, relecture.
//
// SI arrive en 9e position sur 13, à la demande de Tristan : les élèves ont beaucoup de mal
// avec cette fonction. Trois exercices préparent le terrain sans elle (l'écart parle à la
// place de la condition, puis la comparaison VRAI/FAUX, puis l'écart au seuil), et quand
// elle arrive, la formule est D'ABORD donnée en entier dans la consigne. L'élève ne l'écrit
// lui-même qu'à l'exercice suivant.
//
// Le contenu et les corrigés sont dans contenus/tab4-journee-entrepot.js (fichier généré),
// les classeurs dans contenus/tab4/. Les deux descendent de outils/tab4-donnees.json.

import { creerSerieTableur } from '../core/types/tableur.js';
import { EXERCICES } from '../contenus/tab4-journee-entrepot.js';

export const meta = {
  id: 'journee-entrepot',
  code: 'TAB-4',
  titre: 'Une journée en entrepôt',
  desc: 'Treize étapes d\'une journée de travail : réception, mise en stock, alertes, expédition. Les gestes de base d\'Excel, sur de vrais documents.',
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
  consigne: 'Vous suivez une journée de travail chez Stockaval, du camion du matin à '
    + "l'expédition du soir. Chaque étape a son classeur : téléchargez-le, lisez l'onglet "
    + '« Consignes », complétez les cases beiges de l\'onglet « Exercice », enregistrez, puis '
    + 'déposez votre fichier pour la correction. Le fichier reste sur votre ordinateur : '
    + 'seul le résultat du contrôle est enregistré.',
  feuille: 'Exercice',
  dossier: './contenus/tab4/',
  exercices: EXERCICES,
});

export function rendre(hote, ctx) { moteur.rendre(hote, ctx); }
