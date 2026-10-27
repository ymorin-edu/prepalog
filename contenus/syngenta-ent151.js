// ENT-15.1 — Syngenta, « ranger selon le danger » : GUIDAGE de C3.1 (adapter le processus au type de produit) et C1.5 (mettre en stock), 1re.
// Lundi 15 mars : six palettes arrivent des lignes ; l'élève lit les pictogrammes, range chaque palette dans sa cellule (une palette a la flamme ET la tête de mort) et calcule la rétention de la cellule 1.
// Univers et fabrique : `contenus/syngenta.js` ; données : `D151` de `contenus/syngenta-donnees.js` ; questions : `contenus/questions/ENT-15.1.js`.
//
// Poids (décidés par Claude, délégation de Tristan du 26/10/2026) : chaque palette à sa place 1,5 (× 6) · le volume de la cellule 1 1,5 · sa rétention 2,5 · le compte rendu à Karim 3 · questions au fil 4 = 20.

import { seance } from './syngenta.js';
import { D151 } from './syngenta-donnees.js';
import { QUESTIONS } from './questions/ENT-15.1.js';

export * from './syngenta.js';

const S = seance(D151, {
  id: 'syngenta-ranger',
  K: { volume: true },
  poids: { palette: 1.5, 'vol-C1': 1.5, 'ret-C1': 2.5, 'compte-rendu': 3 },
  objet: 'Six palettes à ranger ce matin',
  consigne: 'Six palettes arrivent des lignes de conditionnement. Range-les dans la bonne cellule : regarde les pictogrammes de chaque produit et la règle du magasin, qui est jointe. Ensuite, calcule le volume de la cellule 1 (les inflammables) une fois tout rangé, et la rétention qu’il lui faut.\n\nOuvre la fiche de rangement, puis écris-moi ton compte rendu.',
  poste: '<p>Ton travail aujourd’hui : lire le <b>danger</b> de chaque produit, choisir sa <b>cellule</b>, et calculer la <b>rétention</b> de la cellule des inflammables.</p>',
  etape: 'Pour chaque palette, la cellule de son danger le plus fort ; puis le volume et la rétention de la cellule 1.',
  questions: QUESTIONS,
});
export const { ID, FICHE_ID, PHRASES_ID, VOLET_ID, DOCUMENTS, FICHE, VOLET, ETAPES, PASTILLES, SUITE, ACCUEIL, OPTIONS } = S;
export const BILAN = S.B;
