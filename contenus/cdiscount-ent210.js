// ENT-2.10 — Cdiscount, ÉVALUATION de C2.2 (optimiser les préparations de commandes), 1re, copie rendue. Lundi 14 décembre, semaine 50 : jeu NEUF sur les
// trois gestes d'ENT-2.7 à 2.9 — la classe A et ses emplacements, la méthode pour la vague (chariot de quatre), l'effectif du lundi 21 décembre
// (la prévision donne aussi les colis : le piège reste ouvert).
// Fabrique : `contenus/cdiscount-noel.js` ; données : `D210` de `contenus/cdiscount-noel-donnees.js` ; questions : `contenus/questions/ENT-2.10.js`.
//
// Poids (décidés par Claude, délégation de Tristan du 26/10/2026) : la classe A 3 · sa part des lignes 1 · ses emplacements 2 · la marche commande par
// commande 2 · par lots 2 · la méthode 1 · les préparateurs 2 · les intérimaires 2 · la proposition à Nadia 2 · « Avant de commencer » noté 3 = 20.

import { seance } from './cdiscount-noel.js';
import { D210 } from './cdiscount-noel-donnees.js';
import { QUESTIONS } from './questions/ENT-2.10.js';

export { ENTREPRISE, baseDeDepart } from './cdiscount-noel.js';

const S = seance(D210, {
  id: 'cdiscount-evaluation-noel',
  K: { abc: true, emplacements: true, prep: true, eff: true },
  poids: { classeA: 3, pctLignes: 1, emplacements: 2, cmd: 2, lots: 2, methode: 1, besoin: 2, interim: 2, 'compte-rendu': 2 },
  objet: 'La semaine de Noël : à toi de jouer',
  ficheTitre: 'Préparer la semaine de Noël',
  consigne: 'Dernière semaine avant Noël, et je suis en réunion toute la journée. Tu prépares la zone M seul(e), du début à la fin :\n\n'
    + '1. la classe A de la semaine 50 et les emplacements où la ranger ;\n2. la méthode pour la vague de ce matin (le chariot n’a que quatre bacs) ;\n'
    + '3. l’effectif du lundi 21 décembre : préparateurs et intérimaires.\n\nQuand tout est fait, écris-moi ta proposition et rends ta copie : '
    + 'tu ne pourras plus rien modifier.',
  poste: '<p>Ton travail aujourd’hui : les trois calculs de la préparation du pic, <b>seul(e)</b>. C’est une <b>évaluation</b> : rien n’est corrigé avant que tu rendes ta copie.</p>',
  etape: 'La classe A et ses emplacements, puis la marche des deux méthodes et ton choix, puis l’effectif du lundi 21.',
  documents: ['poste', 'lignes', 'allee', 'commandes', 'prevision', 'methode-abc', 'methode-lots', 'methode-effectif', 'droit'],
  questions: QUESTIONS,
});
export const { ID, FICHE_ID, PHRASES_ID, VOLET_ID, DOCUMENTS, FICHE, VOLET, ETAPES, PASTILLES, SUITE, ACCUEIL, OPTIONS, CATALOGUE } = S;
