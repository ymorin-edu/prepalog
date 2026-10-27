// ENT-2.8 — Cdiscount, « une tournée pour cinq commandes » : ENTRAÎNEMENT de C2.2 (optimiser les préparations de commandes), 1re. La vague de 8 h de la
// zone M : dix commandes. L'élève compare la marche commande par commande et par lots de cinq, chiffre le temps gagné et le temps de tri ajouté, et
// propose une méthode à Nadia.
// Fabrique : `contenus/cdiscount-noel.js` ; données : `D28` de `contenus/cdiscount-noel-donnees.js` ; questions : `contenus/questions/ENT-2.8.js`.
//
// Poids (décidés par Claude, délégation de Tristan du 26/10/2026) : la marche commande par commande 3,5 · par lots 3,5 · les minutes de marche
// gagnées 2,5 · les minutes de tri ajoutées 2,5 · la méthode choisie 2 · la proposition à Nadia 2 · questions au fil 4 = 20.

import { seance } from './cdiscount-noel.js';
import { D28 } from './cdiscount-noel-donnees.js';
import { QUESTIONS } from './questions/ENT-2.8.js';

export { ENTREPRISE, baseDeDepart } from './cdiscount-noel.js';

const S = seance(D28, {
  id: 'cdiscount-par-lots',
  K: { prep: true, minutes: true },
  poids: { cmd: 3.5, lots: 3.5, marche: 2.5, tri: 2.5, methode: 2, 'compte-rendu': 2 },
  objet: 'La vague de 8 h : commande par commande ?',
  ficheTitre: 'Une tournée pour cinq commandes',
  consigne: 'Ce matin, on prépare encore la vague de 8 h commande par commande : une tournée pour chaque commande. Le chariot a cinq bacs, on pourrait '
    + 'prendre cinq commandes à la fois. Avec la liste des commandes, le plan de l’allée et la fiche méthode :\n\n1. calcule la marche de toute la vague, '
    + 'commande par commande, puis par lots de cinq ;\n2. dis-moi combien de minutes de marche on gagne, et combien de minutes de tri on ajoute ;\n'
    + '3. propose-moi une méthode.\n\nOuvre la fiche de calcul, puis écris-moi ta proposition.',
  poste: '<p>Ton travail aujourd’hui : comparer deux <b>méthodes de préparation</b> sur une vraie vague, et proposer la plus rapide, tri compris.</p>',
  etape: 'La marche commande par commande, puis par lots, puis les minutes gagnées et ajoutées, puis la méthode.',
  documents: ['poste', 'commandes', 'allee', 'methode-lots', 'droit'],
  questions: QUESTIONS,
});
export const { ID, FICHE_ID, PHRASES_ID, VOLET_ID, DOCUMENTS, FICHE, VOLET, ETAPES, PASTILLES, SUITE, ACCUEIL, OPTIONS, CATALOGUE } = S;
