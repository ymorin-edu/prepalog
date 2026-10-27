// ENT-19.3 — Amazon, « ranger dans l'armoire » : GUIDAGE de CAP-C1.5 (mettre en stock), CAP OL. Le stockage aléatoire : l'élève choisit la case
// de chaque article selon les trois règles du poste (la place, jamais deux articles qui se ressemblent, lourd en bas), remet les gestes dans
// l'ordre, lit l'adresse que garde le système (celle de SA case), puis rend compte à Karima.
// Univers : `contenus/amazon.js` ; données : `A193`, `R193` de `contenus/amazon-donnees.js` ; questions : `contenus/questions/ENT-19.3.js`.
//
// Poids (décidés par Claude, délégation de Tristan du 27/10/2026) : ranger 8 (1,6 × 5 articles) · les gestes 2 · les adresses 2 (1 × 2) ·
// compte rendu 4 · questions au fil 4 = 20. Un article est juste s'il respecte les trois règles, les articles rangés AVANT lui comptant aussi.

import { seanceFiches, valeursDe } from './fabrique-fiches.js';
import { U, SALUT, FIN } from './amazon-commun.js';
import { DOC_SITE, DOC_REGLES, docArmoire, docBac, blocsRangement, jalonsRangement } from './amazon.js';
import { A193, R193, adresse, ARTICLES } from './amazon-donnees.js';
import { QUESTIONS } from './questions/ENT-19.3.js';

export * from './amazon.js';

const J = { armoire: A193, refs: R193, abimes: [] };
const get = () => J;
export const GESTES = [
  { v: 'scan-article', lib: 'Je prends un article dans le bac et je le scanne' },
  { v: 'pose', lib: 'Je le pose dans la case choisie' },
  { v: 'scan-case', lib: 'Je scanne la case' },
  { v: 'adresse', lib: 'Le système enregistre l’adresse de l’article' },
];
const DEPART = ['pose', 'adresse', 'scan-article', 'scan-case'];
const F1 = 'f193-ranger';
// Les deux articles dont on demande l'adresse : la peluche (4e) et la lampe (5e), à LEUR case.
const SUIVIS = [3, 4];
const caseDe = (db, i) => valeursDe(db, F1)[`case-${i + 1}`] || 'C1';
const choixAdresse = (k) => [{ v: 'armoire', lib: A193.no }, { v: 'case', lib: k }, { v: 'adresse', lib: adresse(A193, k) }, { v: 'rayon', lib: 'Le rayon des jouets' }];

const S = seanceFiches(U, {
  id: 'amazon-ranger', prefixe: '193', titre: 'Ranger dans l’armoire', exercice: 'Séance 3 : ranger dans l’armoire',
  documents: [DOC_SITE, DOC_REGLES, docArmoire(A193), docBac(get)],
  pas: [
    { id: 'ranger', libelle: 'Ranger mon bac', titre: 'Ranger mon bac', sousTitre: 'Pour chaque article, choisis sa case. Les règles, l’armoire et le bac sont à gauche.',
      objet: 'Ton premier bac', pieces: ['regles', 'armoire', 'bac'], documents: ['regles', 'armoire', 'bac'], largeurDocs: 1.4,
      message: 'Bonjour {prenom} ! Le robot vient d’apporter l’armoire devant ton poste. Range les cinq articles de ton bac.\n\n'
        + 'Lis d’abord « Les règles » : la place, jamais deux articles qui se ressemblent, et lourd en bas. Choisis une case pour chaque article, dans l’ordre du bac.',
      blocs: blocsRangement(R193, false), jalons: jalonsRangement(get, { poids: 1.6, groupe: 'Ranger mon bac' }) },
    { id: 'gestes', libelle: 'Les gestes', titre: 'Les gestes dans l’ordre', sousTitre: 'Range les gestes, du premier au dernier.',
      objet: 'Les gestes', pieces: ['regles'], documents: ['regles'],
      message: 'Bien. Maintenant, les gestes : remets-les dans l’ordre.',
      blocs: [{ type: 'ordre', id: 'ordre', titre: 'Dans l’ordre', consigne: 'Du premier geste au dernier.', choix: DEPART.map((x) => GESTES.find((g) => g.v === x)) }],
      jalons: [{ id: 'gestes', titre: 'Les gestes dans l’ordre', groupe: 'Les gestes', poids: 2, attendu: GESTES.map((g) => g.lib).join(' → '),
        juste: (v) => Array.isArray(v.ordre) && GESTES.every((g, k) => v.ordre[k] === g.v) }] },
    { id: 'adresse', libelle: 'Les adresses', titre: 'L’adresse dans le système', sousTitre: 'Ce que le système a enregistré, d’après TES cases.',
      objet: 'L’adresse', pieces: ['armoire'], documents: ['armoire'],
      message: 'Dernière chose : quelle adresse le système garde-t-il pour deux de tes articles ? Regarde les cases que TU as choisies.',
      blocs: (db) => SUIVIS.map((i, k) => ({ type: 'liste', id: `adr-${k + 1}`, lib: `${ARTICLES[R193[i]].nom} (rangé en ${caseDe(db, i)})`, vide: 'Choisir…',
        manque: `l’adresse de « ${ARTICLES[R193[i]].nom} »`, choix: choixAdresse(caseDe(db, i)) })),
      jalons: SUIVIS.map((i, k) => ({ id: `adr-${k + 1}`, titre: `L’adresse de « ${ARTICLES[R193[i]].nom} »`, groupe: 'Les adresses', poids: 1,
        attendu: 'le numéro de l’armoire et la case (P-0418-…)', juste: (v) => v[`adr-${k + 1}`] === 'adresse' })) },
  ],
  compteRendu: { objet: 'Ton compte rendu', poids: 4, message: 'Merci {prenom}. Écris-moi en quelques lignes comment tu as rangé ton bac.',
    lignes: (prenom) => [SALUT,
      { id: 'bac', choix: [`J’ai rangé les cinq articles de mon bac dans l’armoire ${A193.no}.`, 'J’ai rangé les cinq articles de mon bac dans l’armoire T-77.', 'J’ai rangé trois articles, les autres ne rentraient pas.'], juste: 0 },
      { id: 'lourd', choix: ['J’ai mis l’haltère de 8 kg dans une case du bas.', 'J’ai mis l’haltère de 8 kg tout en haut, en D.', 'J’ai laissé l’haltère dans le bac.'], juste: 0 },
      { id: 'ressemble', choix: ['Je n’ai jamais mis deux articles qui se ressemblent dans la même case.', 'J’ai mis les deux coques ensemble pour gagner de la place.', 'J’ai mis les articles au hasard.'], juste: 0 },
      FIN(prenom)] },
  accueil: ['Choisis la case de chaque article.', 'Remets les gestes dans l’ordre.', 'Lis l’adresse que garde le système.', 'Réponds à Karima, une phrase par ligne.'],
  fin: 'Merci {prenom}. La prochaine fois, ton bac sera plus gros, et il y aura une surprise.',
  questions: QUESTIONS,
});
export const { ID, FICHES, VOLET, ETAPES, SUITE, ACCUEIL, OPTIONS, fid, corrige } = S;
