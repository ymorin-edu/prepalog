// ENT-17.5 — La Redoute, « évaluation : emballage et retours » : ÉVALUATION de C2.2 et C3.3, Terminale, copie rendue.
// Jeudi 12 novembre : jeu NEUF, seul(e) ; quatre commandes (dont un vase fragile) et six retours.
// Univers et fabrique : `contenus/la-redoute.js` ; données : `D175` de `contenus/la-redoute-donnees.js` ; questions : `contenus/questions/ENT-17.5.js`.
//
// Poids (décidés par Claude, délégation de Tristan du 26/10/2026) : chaque commande dans son emballage 1 (× 4) · taux de vide 1,5 · poids des emballages 1 · emballage économisé 1 · chaque retour dans sa filière 1 (× 6) · taux de remise en vente 1,5 · compte rendu 2 · « Avant de commencer » noté 3 = 20.

import { seance } from './la-redoute.js';
import { D175 } from './la-redoute-donnees.js';
import { QUESTIONS } from './questions/ENT-17.5.js';

export * from './la-redoute.js';

const S = seance(D175, {
  id: 'la-redoute-evaluation',
  K: { emb: true, ret: true },
  poids: { format: 1, vide: 1.5, apres: 1, gain: 1, filiere: 1, taux: 1.5, 'compte-rendu': 2 },
  titre: 'Évaluation : emballage et retours',
  objet: 'Le poste à toi seul(e)',
  consigne: 'Je suis en réunion toute la matinée. Tu t’occupes seul(e) du poste : l’emballage des quatre commandes (taux de vide de C-1752, poids des emballages, économie), puis le tri des six retours et le taux de remise en vente.\n\nEnsuite, écris-moi ton compte rendu et rends ta copie : tu ne pourras plus rien modifier.',
  poste: '<p>Ton travail aujourd’hui : l’emballage et les retours, <b>seul(e)</b>. C’est une <b>évaluation</b> : rien n’est corrigé avant que tu rendes ta copie.</p>',
  etape: 'Le format de chaque commande, le taux de vide, le poids et l’économie ; puis la filière de chaque retour et le taux de remise en vente.',
  questions: QUESTIONS,
});
export const { ID, FICHE_ID, PHRASES_ID, VOLET_ID, DOCUMENTS, FICHE, VOLET, ETAPES, PASTILLES, SUITE, ACCUEIL, OPTIONS } = S;
