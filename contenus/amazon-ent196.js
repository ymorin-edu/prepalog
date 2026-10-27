// ENT-19.6 — Amazon, « prélever pour les commandes » : GUIDAGE de CAP-C3.1 (prendre en charge la préparation de commandes) et CAP-C3.2
// (déstocker), CAP OL. L'armoire vient au poste, l'écran montre la case et la photo : l'élève dit ce qu'il fait à chaque ligne (prendre, ou
// signaler une case vide, un article qui n'est pas celui de la photo), pose les articles pris dans le bac de leur commande, remet les gestes
// dans l'ordre et rend compte à Karima.
// Univers : `contenus/amazon.js` ; données : `P196` de `contenus/amazon-donnees.js` ; questions : `contenus/questions/ENT-19.6.js`.
//
// Poids (décidés par Claude, délégation de Tristan du 27/10/2026) : les lignes 8 (2 × 4) · les bacs 3 (1,5 × 2) · les gestes 2 ·
// compte rendu 3 · questions au fil 4 = 20.

import { seanceFiches } from './fabrique-fiches.js';
import { U, SALUT, FIN } from './amazon-commun.js';
import { DOC_SITE, DOC_PRELEVER, docPrelevement, blocsPrelevement, jalonsPrelevement } from './amazon.js';
import { P196, BACS, ARTICLES } from './amazon-donnees.js';
import { QUESTIONS } from './questions/ENT-19.6.js';

export * from './amazon.js';

const get = () => P196;
export const GESTES = [
  { v: 'regarde', lib: 'Je regarde la case montrée et la photo de l’article' },
  { v: 'compare', lib: 'Je prends l’article et je le compare à la photo' },
  { v: 'scan', lib: 'Je scanne l’article' },
  { v: 'bac', lib: 'Je le pose dans le bac de sa commande et j’appuie sur le bouton vert' },
];
const DEPART = ['bac', 'scan', 'regarde', 'compare'];
// Les deux lignes prises (1 et 4) : dans quel bac ?
const PRISES = P196.lignes.filter((L) => L.n === 1 || L.n === 4);

const S = seanceFiches(U, {
  id: 'amazon-prelever', prefixe: '196', titre: 'Prélever pour les commandes', exercice: 'Séance 6 : prélever pour les commandes',
  documents: [DOC_SITE, DOC_PRELEVER, docPrelevement(get)],
  pas: [
    { id: 'lignes', libelle: 'Les lignes', titre: 'Ce que tu fais à chaque ligne', sousTitre: 'Les règles et l’écran sont à gauche.',
      objet: 'Ton premier prélèvement', pieces: ['prelever', 'prelevement'], documents: ['prelever', 'prelevement'], largeurDocs: 1.4,
      message: 'Bonjour {prenom} ! Aujourd’hui tu prélèves : le robot apporte l’armoire, l’écran te montre la case et la photo de l’article.\n\n'
        + 'Lis d’abord « Prélever ». Puis, pour chaque ligne, dis-moi ce que tu fais en regardant bien ce qu’il y a dans la case.',
      blocs: blocsPrelevement(P196), jalons: jalonsPrelevement(get, { poids: 2, groupe: 'Les lignes' }) },
    { id: 'bacs', libelle: 'Les bacs', titre: 'Le bac de chaque commande', sousTitre: 'Où poses-tu les articles que tu as pris ?',
      objet: 'Les bacs', pieces: ['prelevement'], documents: ['prelevement'],
      message: 'Les articles que tu prends partent chacun dans le bac de leur commande. Dans quel bac poses-tu ceux des lignes 1 et 4 ?',
      blocs: PRISES.map((L) => ({ type: 'liste', id: `bac-${L.n}`, lib: `Ligne ${L.n} : ${ARTICLES[L.ref].nom}`, vide: 'Choisir…', manque: `le bac de la ligne ${L.n}`,
        choix: BACS.slice(0, 3).map((b) => ({ v: b, lib: `Bac ${b}` })) })),
      jalons: PRISES.map((L, k) => ({ id: `bac-${k + 1}`, titre: `Le bac de la ligne ${L.n}`, groupe: 'Les bacs', poids: 1.5, attendu: `Bac ${L.bac}`,
        juste: (v) => v[`bac-${L.n}`] === L.bac })) },
    { id: 'gestes', libelle: 'Les gestes', titre: 'Les gestes dans l’ordre', sousTitre: 'Range les gestes, du premier au dernier.',
      objet: 'Les gestes', pieces: ['prelever'], documents: ['prelever'],
      message: 'Bien. Remets maintenant les gestes du prélèvement dans l’ordre.',
      blocs: [{ type: 'ordre', id: 'ordre', titre: 'Dans l’ordre', consigne: 'Du premier geste au dernier.', choix: DEPART.map((x) => GESTES.find((g) => g.v === x)) }],
      jalons: [{ id: 'gestes', titre: 'Les gestes dans l’ordre', groupe: 'Les gestes', poids: 2, attendu: GESTES.map((g) => g.lib).join(' → '),
        juste: (v) => Array.isArray(v.ordre) && GESTES.every((g, k) => v.ordre[k] === g.v) }] },
  ],
  compteRendu: { objet: 'Ton compte rendu', poids: 3, message: 'Merci {prenom}. Écris-moi ton compte rendu : Théo passe derrière toi pour les problèmes.',
    lignes: (prenom) => [SALUT,
      { id: 'autre', choix: ['Ligne 2 : la case contenait des coques noires, pas la transparente de la photo. Je l’ai signalé.', 'Ligne 2 : j’ai pris une coque noire, elle ressemble à la transparente.', 'Ligne 2 : j’ai pris deux coques noires.'], juste: 0 },
      { id: 'vide', choix: ['Ligne 3 : la case était vide, je l’ai signalé.', 'Ligne 3 : la case était vide, je suis passé(e) à la suite sans rien dire.', 'Ligne 3 : j’ai pris un autre livre.'], juste: 0 },
      { id: 'pris', choix: ['J’ai pris la gourde bleue et les deux câbles, et je les ai posés dans le bac de leur commande.', 'J’ai posé tous les articles dans le même bac.', 'J’ai laissé les articles dans l’armoire.'], juste: 0 },
      FIN(prenom)] },
  accueil: ['Dis ce que tu fais à chaque ligne.', 'Choisis le bac de chaque article pris.', 'Remets les gestes dans l’ordre.', 'Réponds à Karima, une phrase par ligne.'],
  fin: 'Merci {prenom}. Théo va voir la case vide et les coques. La prochaine fois : l’emballage.',
  questions: QUESTIONS,
});
export const { ID, FICHES, VOLET, ETAPES, SUITE, ACCUEIL, OPTIONS, fid, corrige } = S;
