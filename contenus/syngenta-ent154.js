// ENT-15.4 — Syngenta, « évaluation du rangement » : ÉVALUATION de C3.1 (adapter le processus au type de produit) et C1.5 (mettre en stock), 1re, copie rendue.
// Lundi 22 mars : jeu NEUF, seul(e) ; la cellule 2 n'a qu'une place (la deuxième palette de toxiques reste en attente) ; la rétention de la cellule 2 tombe sur le minimum de 800 L.
// Univers et fabrique : `contenus/syngenta.js` ; données : `D154` de `contenus/syngenta-donnees.js` ; questions : `contenus/questions/ENT-15.4.js`.
//
// Poids (décidés par Claude, délégation de Tristan du 26/10/2026) : chaque palette à sa place 1,5 (× 6) · le volume de la cellule 2 1,5 · sa rétention 2,5 · suffit-elle 1 · le compte rendu 3 · « Avant de commencer » noté 3 = 20.

import { seance } from './syngenta.js';
import { D154 } from './syngenta-donnees.js';
import { QUESTIONS } from './questions/ENT-15.4.js';

export * from './syngenta.js';

const S = seance(D154, {
  id: 'syngenta-evaluation',
  K: { volume: true, suffit: ['C2'] },
  poids: { palette: 1.5, 'vol-C2': 1.5, 'ret-C2': 2.5, 'suf-C2': 1, 'compte-rendu': 3 },
  objet: 'Les palettes de ce matin : à toi seul(e)',
  consigne: 'Je suis en audit toute la matinée. Tu t’occupes seul(e) des palettes de ce matin : le rangement, puis le volume et la rétention de la cellule 2, et si sa rétention suffit. Ensuite, écris-moi ton compte rendu et rends ta copie : tu ne pourras plus rien modifier.',
  poste: '<p>Ton travail aujourd’hui : ranger <b>seul(e)</b> des produits dangereux et vérifier une rétention. C’est une <b>évaluation</b> : rien n’est corrigé avant que tu rendes ta copie.</p>',
  etape: 'Chaque palette dans l’ordre de son numéro ; puis le volume, la rétention de la cellule 2 et si elle suffit.',
  questions: QUESTIONS,
});
export const { ID, FICHE_ID, PHRASES_ID, VOLET_ID, DOCUMENTS, FICHE, VOLET, ETAPES, PASTILLES, SUITE, ACCUEIL, OPTIONS } = S;
export const BILAN = S.B;
