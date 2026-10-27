// ENT-19.4 — Amazon, « le bac du mardi » : ENTRAÎNEMENT de CAP-C1.5 (mettre en stock, participer à l'inventaire), CAP OL. Un bac plus gros, une
// armoire plus pleine, un article abîmé à mettre de côté (rien ne dit lequel : la ligne « de côté » est offerte à tous), puis l'inventaire d'un
// article rangé dans trois cases (le stockage aléatoire), une adresse, et le compte rendu.
// Univers : `contenus/amazon.js` ; données : `A194`, `R194`, `ABIMES194`, `INV194` ; questions : `contenus/questions/ENT-19.4.js`.
//
// Poids (décidés par Claude, délégation de Tristan du 27/10/2026) : ranger 9 (1,5 × 6, l'abîmé compris) · inventaire 3 (le compte 1,5, l'écart 1,5) ·
// l'adresse 1 · compte rendu 3 · questions au fil 4 = 20.

import { seanceFiches, valeursDe } from './fabrique-fiches.js';
import { U, SALUT, FIN } from './amazon-commun.js';
import { DOC_SITE, DOC_REGLES, docArmoire, docBac, docInventaire, blocsRangement, jalonsRangement, blocsInventaire, jalonsInventaire } from './amazon.js';
import { A194, R194, ABIMES194, INV194, adresse, ARTICLES } from './amazon-donnees.js';
import { QUESTIONS } from './questions/ENT-19.4.js';

export * from './amazon.js';

const J = { armoire: A194, refs: R194, abimes: ABIMES194 };
const get = () => J;
const F1 = 'f194-ranger';
const SUIVI = 3;   // la gourde verte
const caseDe = (db) => valeursDe(db, F1)[`case-${SUIVI + 1}`] || 'A1';

const S = seanceFiches(U, {
  id: 'amazon-bac-mardi', prefixe: '194', titre: 'Le bac du mardi', exercice: 'Séance 4 : le bac du mardi',
  documents: [DOC_SITE, DOC_REGLES, docArmoire(A194), docBac(get), docInventaire(() => INV194)],
  pas: [
    { id: 'ranger', libelle: 'Ranger mon bac', titre: 'Ranger mon bac', sousTitre: 'Pour chaque article, choisis sa case, ou mets-le de côté s’il est abîmé.',
      objet: 'Le bac du mardi', pieces: ['regles', 'armoire', 'bac'], documents: ['regles', 'armoire', 'bac'], largeurDocs: 1.4,
      message: 'Bonjour {prenom} ! Gros bac ce matin : six articles, et l’armoire est déjà bien remplie. Regarde bien l’état de chaque article.',
      blocs: blocsRangement(R194, true), jalons: jalonsRangement(get, { poids: 1.5, groupe: 'Ranger mon bac' }) },
    { id: 'inventaire', libelle: 'L’inventaire', titre: 'Compter un article', sousTitre: 'Le système, et ce que tu vois dans chaque case, sont à gauche.',
      objet: 'Un inventaire', pieces: ['inventaire'], documents: ['inventaire'],
      message: 'Le système me demande de compter les gourdes vertes. Elles sont rangées dans trois cases. Compte-les et dis-moi ce que tu fais.',
      blocs: blocsInventaire(INV194), jalons: jalonsInventaire(() => INV194, { compte: 1.5, ecart: 1.5, groupe: 'L’inventaire' }) },
    { id: 'adresse', libelle: 'L’adresse', titre: 'L’adresse dans le système', sousTitre: 'D’après la case que TU as choisie.',
      objet: 'L’adresse', pieces: ['armoire'], documents: ['armoire'],
      message: 'Et la gourde verte que tu viens de ranger : quelle adresse le système garde-t-il ?',
      blocs: (db) => [{ type: 'liste', id: 'adr', lib: `${ARTICLES[R194[SUIVI]].nom} (rangée en ${caseDe(db)})`, vide: 'Choisir…', manque: 'l’adresse',
        choix: [{ v: 'case', lib: caseDe(db) }, { v: 'adresse', lib: adresse(A194, caseDe(db)) }, { v: 'bac', lib: 'T-77' }, { v: 'armoire', lib: A194.no }] }],
      jalons: [{ id: 'adr', titre: 'L’adresse de la gourde verte', groupe: 'L’adresse', poids: 1, attendu: 'le numéro de l’armoire et la case (P-1290-…)', juste: (v) => v.adr === 'adresse' }] },
  ],
  compteRendu: { objet: 'Ton compte rendu', poids: 3, message: 'Merci {prenom}. Écris-moi ton compte rendu : je préviens Théo derrière toi.',
    lignes: (prenom) => [SALUT,
      { id: 'abime', choix: ['J’ai mis la tasse en céramique de côté pour Théo : sa boîte est écrasée.', 'J’ai tout rangé, même la tasse à la boîte écrasée.', 'J’ai mis l’haltère de côté : elle est trop lourde.'], juste: 0 },
      { id: 'inventaire', choix: ['J’ai compté 6 gourdes vertes au lieu de 7 : il en manque une, je l’ai signalé.', 'J’ai compté 7 gourdes vertes : le compte est juste.', 'J’ai compté 8 gourdes vertes : il y en a trop.'], juste: 0 },
      FIN(prenom)] },
  accueil: ['Range chaque article, ou mets-le de côté s’il est abîmé.', 'Compte l’article dans ses trois cases.', 'Lis l’adresse que garde le système.', 'Réponds à Karima, une phrase par ligne.'],
  fin: 'Merci {prenom}. Théo récupère la tasse et vérifie les gourdes.',
  questions: QUESTIONS,
});
export const { ID, FICHES, VOLET, ETAPES, SUITE, ACCUEIL, OPTIONS, fid, corrige } = S;
