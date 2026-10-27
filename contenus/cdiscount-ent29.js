// ENT-2.9 — Cdiscount, « le calcul de Yanis » : ERREUR INDUITE de C2.2 (optimiser les préparations de commandes), 1re. Mercredi 2 décembre : Yanis a
// calculé l'effectif de la zone M pour le lundi du pic, sur les COLIS au lieu des LIGNES et en arrondissant vers le bas. L'élève trouve les deux
// erreurs, refait le calcul, chiffre les lignes qui resteraient en retard et l'écrit à Nadia avant que la demande parte à l'agence d'intérim.
// Fabrique : `contenus/cdiscount-noel.js` ; données : `D29` de `contenus/cdiscount-noel-donnees.js` ; questions : `contenus/questions/ENT-2.9.js`.
//
// Poids (décidés par Claude, délégation de Tristan du 26/10/2026) : les deux erreurs 4 · les préparateurs nécessaires 3,5 · les intérimaires 3,5 ·
// les lignes en retard 2 · la proposition à Nadia 3 · questions au fil 4 = 20.

import { seance } from './cdiscount-noel.js';
import { D29 } from './cdiscount-noel-donnees.js';
import { QUESTIONS } from './questions/ENT-2.9.js';

export { ENTREPRISE, baseDeDepart } from './cdiscount-noel.js';

const S = seance(D29, {
  id: 'cdiscount-calcul-yanis',
  K: { eff: true, erreurs: true, retard: true },
  poids: { erreurs: 4, besoin: 3.5, interim: 3.5, retard: 2, 'compte-rendu': 3 },
  objet: 'L’effectif du lundi 7 : à vérifier avant vendredi',
  ficheTitre: 'Contrôler le calcul de l’effectif',
  consigne: 'Yanis a calculé combien de préparateurs il nous faut dans la zone M le lundi 7 décembre, le jour le plus chargé avant Noël. Sa demande part à '
    + 'l’agence d’intérim vendredi. Avant, je veux que quelqu’un d’autre le vérifie :\n\n1. trouve ce qui ne va pas dans son calcul (la fiche méthode et '
    + 'la prévision sont jointes) ;\n2. refais le calcul : préparateurs et intérimaires ;\n3. dis-moi combien de lignes resteraient en retard lundi soir '
    + 'si on gardait son effectif.\n\nOuvre la fiche de calcul, puis écris-moi ta proposition.',
  poste: '<p>Ton travail aujourd’hui : <b>contrôler</b> le calcul d’un collègue avant qu’il parte à l’agence d’intérim. Une erreur ici, c’est des colis en retard le jour du pic.</p>',
  etape: 'Compare le calcul de Yanis à la fiche méthode, coche ses erreurs, refais le calcul, puis les lignes en retard avec son effectif.',
  documents: ['poste', 'prevision', 'calcul-yanis', 'methode-effectif', 'droit'],
  questions: QUESTIONS,
});
export const { ID, FICHE_ID, PHRASES_ID, VOLET_ID, DOCUMENTS, FICHE, VOLET, ETAPES, PASTILLES, SUITE, ACCUEIL, OPTIONS, CATALOGUE } = S;
