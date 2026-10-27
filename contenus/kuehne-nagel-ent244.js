// ENT-24.4 — Kuehne+Nagel, « le planning de Lucas » : ENTRAÎNEMENT de C1.3 avec ERREUR INDUITE, 1re Bac Pro. Lucas a fait le planning de cinq
// envois et s'est trompé trois fois (une mauvaise zone, un début avant la mise à disposition, une fin après l'heure limite) : l'élève trouve le
// défaut de chaque ligne, choisit les corrections, dit quelles règles Lucas a oubliées, puis le compte rendu.
// Univers : `contenus/kuehne-nagel.js` ; données : `ENVOIS244`, `LUCAS244`, `CORR244` de `contenus/kuehne-nagel-donnees.js` ; questions : `contenus/questions/ENT-24.4.js`.
//
// Poids (décidés par Claude, délégation de Tristan du 26/10/2026) : les défauts 5 (1 × 5) · les corrections 4,5 (1,5 × 3) · les règles oubliées 2 ·
// compte rendu 4,5 · questions au fil 4 = 20.

import { seanceFiches, memes } from './fabrique-fiches.js';
import { U, SALUT, FIN } from './kuehne-nagel-commun.js';
import { DOC_HUB, DOC_REGLES, docPreAlertes, docPlanningFait, blocsDefauts } from './kuehne-nagel.js';
import { ENVOIS244, LUCAS244, CORR244, DEFAUTS, QUAIS, PRODUITS, defautsPlanning, hlib } from './kuehne-nagel-donnees.js';
import { QUESTIONS } from './questions/ENT-24.4.js';

export * from './kuehne-nagel.js';

const DEF = defautsPlanning(ENVOIS244, LUCAS244);
const nomQuai = (id) => QUAIS.find((q) => q.id === id).nom;
const REGLES = [
  { v: 'zone', lib: 'La zone de température', juste: true },
  { v: 'un', lib: 'Un seul envoi à la fois par quai', juste: false },
  { v: 'dispo', lib: 'Pas avant que l’envoi soit disponible', juste: true },
  { v: 'limite', lib: 'Fini avant l’heure limite', juste: true },
];
const S = seanceFiches(U, {
  id: 'kuehne-nagel-lucas', prefixe: '244', titre: 'Le planning de Lucas', exercice: 'Séance 4 : le planning de Lucas',
  documents: [DOC_HUB, DOC_REGLES, docPreAlertes(ENVOIS244, 'Les pré-alertes du mardi', 'Cinq envois annoncés pour ce matin'),
    docPlanningFait(ENVOIS244, LUCAS244, 'Le planning de Lucas', 'Mardi 10 novembre 2026 — fait par Lucas, pas encore vérifié')],
  pas: [
    { id: 'defauts', libelle: 'Les défauts', titre: 'Ligne par ligne', sousTitre: 'Compare le planning de Lucas aux pré-alertes et aux règles.',
      objet: 'Le planning de Lucas', pieces: ['planning-fait', 'prealertes'], documents: ['planning-fait', 'prealertes', 'regles'], largeurDocs: 1.4,
      message: 'Bonjour {prenom}. Lucas a fait le planning de ce matin, tôt, et il était pressé. Avant de le lancer, vérifie-le : pour chaque envoi, dis-moi ce qui ne va pas, ou que tout va bien.',
      blocs: blocsDefauts(ENVOIS244),
      jalons: ENVOIS244.map((x) => ({ id: `defaut-${x.id}`, titre: `Le planning de Lucas : l’envoi ${x.id}`, groupe: 'Les défauts', poids: 1,
        attendu: DEFAUTS.find((d) => d.v === DEF[x.id]).lib, juste: (v) => v[`defaut-${x.id}`] === DEF[x.id] })) },
    { id: 'corriger', libelle: 'Corriger', titre: 'Les corrections', sousTitre: 'Pour chaque ligne fausse, la bonne valeur.',
      objet: 'Corrige-le', pieces: ['regles'], documents: ['planning-fait', 'prealertes', 'regles'], largeurDocs: 1.4,
      message: 'Merci. Maintenant, corrige les trois lignes fausses : il faut que tout respecte les règles, sans déplacer les autres envois.',
      blocs: [
        { type: 'liste', id: 'quai-B', lib: `Envoi B (${PRODUITS.sirops.nom}) : sur quel quai ?`, vide: 'Choisir…', manque: 'le quai de B', choix: CORR244.B.quais.map((q) => ({ v: q, lib: nomQuai(q) })) },
        { type: 'liste', id: 'heure-C', lib: `Envoi C (${PRODUITS.moteur.nom}) : à quelle heure commencer ?`, vide: 'Choisir…', manque: 'l’heure de C', choix: CORR244.C.heures.map((h) => ({ v: h, lib: hlib(h) })) },
        { type: 'liste', id: 'heure-D', lib: `Envoi D (${PRODUITS.insuline.nom}) : à quelle heure commencer ?`, vide: 'Choisir…', manque: 'l’heure de D', choix: CORR244.D.heures.map((h) => ({ v: h, lib: hlib(h) })) },
      ],
      jalons: [
        { id: 'quai-B', titre: 'La correction de B : le quai', groupe: 'Corriger', poids: 1.5, attendu: nomQuai(CORR244.B.juste), juste: (v) => v['quai-B'] === CORR244.B.juste },
        { id: 'heure-C', titre: 'La correction de C : l’heure', groupe: 'Corriger', poids: 1.5, attendu: hlib(CORR244.C.juste), juste: (v) => v['heure-C'] === CORR244.C.juste },
        { id: 'heure-D', titre: 'La correction de D : l’heure', groupe: 'Corriger', poids: 1.5, attendu: hlib(CORR244.D.juste), juste: (v) => v['heure-D'] === CORR244.D.juste }] },
    { id: 'regles', libelle: 'Les règles oubliées', titre: 'Qu’a oublié Lucas ?', sousTitre: 'Coche les règles que Lucas n’a pas respectées.',
      objet: 'Ce qu’il a oublié', pieces: ['regles'], documents: ['regles'],
      message: 'Pour que Lucas ne recommence pas, dis-moi quelles règles il a oubliées.',
      blocs: [{ type: 'cases', id: 'oubli', titre: 'Les règles oubliées', choix: REGLES.map(({ v, lib }) => ({ v, lib })) }],
      jalons: [{ id: 'oubli', titre: 'Les règles oubliées par Lucas', groupe: 'Les règles oubliées', poids: 2, attendu: REGLES.filter((x) => x.juste).map((x) => x.lib).join(' ; '),
        juste: (v) => memes(v.oubli || [], REGLES.filter((x) => x.juste).map((x) => x.v)) }] },
  ],
  compteRendu: { objet: 'Ton compte rendu', poids: 4.5, message: 'Merci {prenom}. Écris-moi ton compte rendu de la vérification, une phrase par ligne.',
    lignes: (prenom) => [SALUT,
      { id: 'zone', choix: ['Les sirops B ne vont pas au quai 1 : ils passent au quai 3, la zone de 15 à 25 °C.', 'Les sirops B restent au quai 1 : le froid ne les abîme pas.',
        'Les sirops B passent au quai 4, en fret général.'], juste: 0 },
      { id: 'heures', choix: ['La pièce d’avion C commence à 7 h 45 pour finir avant 8 h 30, et l’insuline D à 8 h, quand elle est disponible.',
        'La pièce d’avion C commence à 8 h 15, et l’insuline D à 7 h 30.', 'Les heures de Lucas étaient justes.'], juste: 0 },
      { id: 'lucas', choix: ['J’ai expliqué à Lucas les trois règles à revoir, calmement.', 'J’ai dit à Lucas qu’il était nul.', 'Je n’ai rien dit à Lucas.'], juste: 0 },
      FIN(prenom)] },
  accueil: ['Le défaut de chaque ligne du planning de Lucas.', 'Les corrections.', 'Les règles oubliées.', 'Réponds à Sophie, une phrase par ligne.'],
  fin: 'Merci {prenom}. La prochaine séance, c’est l’évaluation : un planning, seul(e), du début à la fin.',
  questions: QUESTIONS,
});
export const { ID, FICHES, VOLET, ETAPES, SUITE, ACCUEIL, OPTIONS, fid, corrige } = S;
