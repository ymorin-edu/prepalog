// ENT-15.2 — Syngenta, « la cellule pleine » : ENTRAÎNEMENT de C3.1 (adapter le processus au type de produit) et C1.5 (mettre en stock), 1re.
// Mardi 16 mars : huit palettes ; la cellule 1 n'a que deux places (la troisième palette d'inflammables reste en zone d'attente) ; la rétention de la cellule 1 ne suffit plus ; celle de la cellule 3 tombe sur le minimum de 800 L.
// Univers et fabrique : `contenus/syngenta.js` ; données : `D152` de `contenus/syngenta-donnees.js` ; questions : `contenus/questions/ENT-15.2.js`.
//
// Poids (décidés par Claude, délégation de Tristan du 26/10/2026) : chaque palette à sa place 1 (× 8) · la rétention de la cellule 1 2 · suffit-elle 2 · la rétention de la cellule 3 2 · le compte rendu 2 · questions au fil 4 = 20.

import { seance } from './syngenta.js';
import { D152 } from './syngenta-donnees.js';
import { QUESTIONS } from './questions/ENT-15.2.js';

export * from './syngenta.js';

const S = seance(D152, {
  id: 'syngenta-cellule-pleine',
  K: { suffit: ['C1'] },
  poids: { palette: 1, 'ret-C1': 2, 'suf-C1': 2, 'ret-C3': 2, 'compte-rendu': 2 },
  objet: 'Huit palettes, et la cellule 1 presque pleine',
  consigne: 'Grosse journée : huit palettes arrivent des lignes. Attention, la cellule 1 est presque pleine ce matin (regarde l’état des cellules). Range chaque palette, dans l’ordre de leur numéro, puis calcule la rétention nécessaire pour la cellule 1 et pour la cellule 3, et dis-moi si celle de la cellule 1 suffit encore.\n\nOuvre la fiche de rangement, puis écris-moi ton compte rendu.',
  poste: '<p>Ton travail aujourd’hui : ranger huit palettes <b>quand une cellule est presque pleine</b>, et vérifier si les <b>rétentions</b> suffisent encore.</p>',
  etape: 'Chaque palette dans l’ordre de son numéro (cellule pleine : zone d’attente) ; puis les rétentions des cellules 1 et 3.',
  questions: QUESTIONS,
});
export const { ID, FICHE_ID, PHRASES_ID, VOLET_ID, DOCUMENTS, FICHE, VOLET, ETAPES, PASTILLES, SUITE, ACCUEIL, OPTIONS } = S;
export const BILAN = S.B;
