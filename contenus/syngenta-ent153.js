// ENT-15.3 — Syngenta, « le plan de Lucas » : ERREUR INDUITE de C3.1 (adapter le processus au type de produit) et C1.5 (mettre en stock), 1re.
// Jeudi 18 mars : le plan de rangement de Lucas met un insecticide inflammable ET toxique en cellule 2 et un désherbant corrosif en cellule 4, et prend 20 % pour la rétention de la cellule 1 (il trouve « OK ») : la vraie rétention (1 900 L) dépasse celle installée (1 500 L).
// Univers et fabrique : `contenus/syngenta.js` ; données : `D153` de `contenus/syngenta-donnees.js` ; questions : `contenus/questions/ENT-15.3.js`.
//
// Poids (décidés par Claude, délégation de Tristan du 26/10/2026) : les deux palettes mal rangées 4 · l'erreur de rétention 2 · le volume de la cellule 1 2 · sa rétention 3 · suffit-elle 2 · le compte rendu 3 · questions au fil 4 = 20.

import { seance } from './syngenta.js';
import { D153 } from './syngenta-donnees.js';
import { QUESTIONS } from './questions/ENT-15.3.js';

export * from './syngenta.js';

const S = seance(D153, {
  id: 'syngenta-plan-lucas',
  K: {},
  poids: { erreurs: 4, cause: 2, 'vol-C1': 2, 'ret-C1': 3, 'suf-C1': 2, 'compte-rendu': 3 },
  objet: 'Le plan de Lucas à vérifier avant de ranger',
  consigne: 'Lucas a préparé hier soir le plan de rangement des palettes de ce matin, avec son calcul de rétention pour la cellule 1. Avant qu’on range quoi que ce soit, vérifie son plan : quelles palettes sont mal rangées, et son calcul de rétention est-il juste ? Refais-le avec le bon rangement.\n\nOuvre le contrôle du plan, puis écris-moi ton compte rendu.',
  poste: '<p>Ton travail aujourd’hui : <b>contrôler</b> le plan de rangement d’un collègue avant que l’équipe range. Une erreur ici, c’est un produit inflammable au mauvais endroit.</p>',
  etape: 'Compare chaque palette du plan de Lucas à la règle ; puis refais le volume et la rétention de la cellule 1.',
  questions: QUESTIONS,
});
export const { ID, FICHE_ID, PHRASES_ID, VOLET_ID, DOCUMENTS, FICHE, VOLET, ETAPES, PASTILLES, SUITE, ACCUEIL, OPTIONS } = S;
export const BILAN = S.B;
