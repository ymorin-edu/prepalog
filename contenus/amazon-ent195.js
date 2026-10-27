// ENT-19.5 — Amazon, « évaluation : mettre en stock » : ÉVALUATION de CAP-C1.5 (mettre en stock, participer à l'inventaire) et CAP-C1.2 (la
// sécurité au poste), CAP OL, copie rendue. Seul(e), sur un jeu NEUF tiré d'après la graine de l'élève (trois jeux : `JEUX195`) : deux situations
// de sécurité, un bac de cinq articles dont un abîmé, l'inventaire d'un article éclaté sur trois cases, une adresse, le compte rendu.
// Univers : `contenus/amazon.js` ; données : `jeu195` de `contenus/amazon-donnees.js` ; questions : `contenus/questions/ENT-19.5.js`.
//
// Poids (décidés par Claude, délégation de Tristan du 27/10/2026) : sécurité 2 (1 × 2) · ranger 8 (1,6 × 5) · inventaire 2,5 (le compte 1,5,
// l'écart 1) · l'adresse 1,5 · compte rendu 3 · « Avant de commencer » noté 3 = 20.

import { seanceFiches, valeursDe } from './fabrique-fiches.js';
import { U, SALUT, FIN } from './amazon-commun.js';
import { DOC_SITE, DOC_SECURITE, DOC_REGLES, docArmoire, docBac, docInventaire, blocsRangement, jalonsRangement, blocsInventaire, jalonsInventaire,
  blocsSecurite, jalonsSecurite } from './amazon.js';
import { jeu195, adresse, ARTICLES, KG_LOURD, compte, ecart } from './amazon-donnees.js';
import { QUESTIONS } from './questions/ENT-19.5.js';

export * from './amazon.js';

const get = (db) => jeu195(db);
const F1 = 'f195-ranger';
const SUIVI = 1;   // l'adresse demandée : celle du 2e article du bac (jamais l'abîmé, dans aucun jeu)
const caseDe = (db) => valeursDe(db, F1)[`case-${SUIVI + 1}`] || 'A1';
const nom = (r) => ARTICLES[r].nom;
const lourdDe = (J) => J.refs.find((r) => ARTICLES[r].kg > KG_LOURD);
const sain = (J) => J.refs.find((r) => !J.abimes.includes(r) && r !== lourdDe(J));

// La phrase d'inventaire, pour un compte n quand le système attend att.
const phraseInv = (I, n) => (n < I.attendu ? `J’ai compté ${n} « ${nom(I.ref)} » au lieu de ${I.attendu} : il en manque, je l’ai signalé.`
  : n > I.attendu ? `J’ai compté ${n} « ${nom(I.ref)} » au lieu de ${I.attendu} : il y en a trop, je l’ai signalé.`
    : `J’ai compté ${n} « ${nom(I.ref)} » : le compte est juste.`);
const lignesInv = (I) => { const c = compte(I); const autres = [I.attendu - 1, I.attendu, I.attendu + 1].filter((n) => n !== c).slice(0, 2);
  return [phraseInv(I, c), ...autres.map((n) => phraseInv(I, n))]; };

const S = seanceFiches(U, {
  id: 'amazon-evaluation-stock', prefixe: '195', titre: 'Évaluation : mettre en stock', exercice: 'Séance 5 : évaluation, mettre en stock',
  documents: [DOC_SITE, DOC_SECURITE, DOC_REGLES, docArmoire((db) => get(db).armoire), docBac(get), docInventaire((db) => get(db).inv)],
  pas: [
    { id: 'securite', libelle: 'La sécurité', titre: 'Deux situations au poste', sousTitre: 'Que fais-tu ? Une réponse par situation.',
      objet: 'Évaluation : à toi seul(e)', pieces: ['securite'], documents: ['securite'],
      message: 'Bonjour {prenom}. Aujourd’hui, c’est une évaluation : je suis en réunion, tu tiens le poste seul(e). Rien n’est corrigé avant que tu rendes ta copie.\n\n'
        + 'D’abord, deux situations de sécurité : dis-moi ce que tu fais.',
      blocs: (db) => blocsSecurite(get(db).secu), jalons: jalonsSecurite((db) => get(db).secu, { poids: 1, groupe: 'La sécurité' }) },
    { id: 'ranger', libelle: 'Ranger mon bac', titre: 'Ranger mon bac', sousTitre: 'Pour chaque article, choisis sa case, ou mets-le de côté s’il est abîmé.',
      objet: 'Ton bac', pieces: ['regles', 'armoire', 'bac'], documents: ['regles', 'armoire', 'bac'], largeurDocs: 1.4,
      message: 'Le robot vient d’apporter l’armoire devant ton poste. Range les cinq articles de ton bac, et regarde bien l’état de chacun.',
      blocs: (db) => blocsRangement(get(db).refs, true), jalons: jalonsRangement(get, { poids: 1.6, groupe: 'Ranger mon bac' }) },
    { id: 'inventaire', libelle: 'L’inventaire', titre: 'Compter un article', sousTitre: 'Le système, et ce que tu vois dans chaque case, sont à gauche.',
      objet: 'Un inventaire', pieces: ['inventaire'], documents: ['inventaire'],
      message: 'Le système me demande un inventaire. Compte l’article dans ses trois cases et dis-moi ce que tu fais.',
      blocs: (db) => blocsInventaire(get(db).inv), jalons: jalonsInventaire((db) => get(db).inv, { compte: 1.5, ecart: 1, groupe: 'L’inventaire' }) },
    { id: 'adresse', libelle: 'L’adresse', titre: 'L’adresse dans le système', sousTitre: 'D’après la case que TU as choisie.',
      objet: 'L’adresse', pieces: ['armoire'], documents: ['armoire'],
      message: 'Dernière chose : quelle adresse le système garde-t-il pour le deuxième article de ton bac ?',
      blocs: (db) => { const J = get(db); const k = caseDe(db);
        return [{ type: 'liste', id: 'adr', lib: `${nom(J.refs[SUIVI])} (rangé en ${k})`, vide: 'Choisir…', manque: 'l’adresse',
          choix: [{ v: 'case', lib: k }, { v: 'armoire', lib: J.armoire.no }, { v: 'adresse', lib: adresse(J.armoire, k) }, { v: 'bac', lib: 'T-77' }] }]; },
      jalons: [{ id: 'adr', titre: 'L’adresse de l’article rangé', groupe: 'L’adresse', poids: 1.5, attendu: 'le numéro de l’armoire et la case (P-…-case)',
        juste: (v) => v.adr === 'adresse' }] },
  ],
  compteRendu: { objet: 'Ton compte rendu', poids: 3, message: 'Merci {prenom}. Écris-moi ton compte rendu, puis rends ta copie : tu ne pourras plus rien modifier.',
    lignes: (prenom, db) => { const J = get(db); const ab = J.abimes[0]; const lo = lourdDe(J);
      return [SALUT,
        { id: 'abime', choix: [`J’ai mis « ${nom(ab)} » de côté pour Théo : l’article est abîmé.`, `J’ai tout rangé, même « ${nom(ab)} », pourtant abîmé.`, `J’ai mis « ${nom(sain(J))} » de côté : l’article ne rentrait pas.`], juste: 0 },
        { id: 'lourd', choix: [`J’ai mis « ${nom(lo)} » dans une case du bas.`, `J’ai mis « ${nom(lo)} » tout en haut, en D.`, `J’ai laissé « ${nom(lo)} » dans le bac.`], juste: 0 },
        { id: 'inventaire', choix: lignesInv(J.inv), juste: 0 },
        FIN(prenom)]; } },
  accueil: ['Deux situations de sécurité.', 'Range chaque article, ou mets-le de côté s’il est abîmé.', 'Compte l’article dans ses trois cases.', 'Lis l’adresse que garde le système.', 'Réponds à Karima, puis rends ta copie.'],
  fin: 'Merci {prenom}. N’oublie pas de rendre ta copie.',
  questions: QUESTIONS,
  tirage: true,
});
export const { ID, FICHES, VOLET, ETAPES, SUITE, ACCUEIL, OPTIONS, fid, corrige } = S;
