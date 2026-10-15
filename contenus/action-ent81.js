// ENT-8.1 — Action, « d’où viennent les produits du magasin de Nîmes ? » : le contenu de la séance (brief
// `docs/briefs/ENT-8.1-action-se-situer.md`, décisions du chef de chantier dans `docs/briefs/COORDINATION-action.md` §3).
// Univers commun : `contenus/action.js` (À LIRE). Activité : `activites/action-se-situer.js`. Questions : `contenus/questions/ENT-8.1.js`.
// Corrigé : `contenus/corriges/ENT-8.1.js`.
//
// Lundi 8 novembre, 8 h (aucune année écrite), premier jour de PFMP chez Geodis à Ensuès-la-Redonne. CAP OL, GUIDAGE de CAP-C1.1 :
//   ① « Qui est qui ? » : Geodis + 3 acteurs tirés, les 7 rôles offerts à chaque ligne ; point d’étape A (ferme la carte) ;
//   ② la carte de France (vue « Localiser ») : magasin → entrepôt → port, région → département → ville ; question C ;
//   ③ « La chaîne » : remettre le chemin d’un produit dans l’ordre (départ mélangé par élève, jamais juste), dire où l’on travaille ; question D ;
//   ④ « Ce que je change » : 3 situations tirées (+ 1 chez un confirmé), ce qui arrive au magasin ; question E (sur SA 1re situation).
// Rien n’est jugé à l’écran ; le bandeau de fin (5 lignes) dit ✓ / ✗ par bloc ; « Corriger » rouvre les fiches fausses, jamais la carte
// ni une question (`finFige`).
//
// VÉRIFIÉ / CONSTRUIT (alerte 9) — voir l’en-tête de `contenus/action.js` et `MENTION` :
//   Vérifié : Action (magasins à petits prix, mêmes produits partout, fonds 3i), l’entrepôt d’Ensuès-la-Redonne exploité par Geodis (Sud-Est),
//   Geodis filiale de la SNCF, le hub d’import de Gonfreville-l’Orcher (port du Havre, titre d’une actualité d’Action), les six entrepôts,
//   le magasin de Nîmes Cap Costières. Positions : OpenStreetMap (le hub : centre de la commune, APPROCHÉ).
//   Construit : Samia, ses messages ; le trajet Le Havre → Ensuès → Nîmes et le fait qu’Ensuès livre ce magasin (dits dans le texte de fin
//   de la carte et à l’accueil) ; les 7 acteurs et leurs rôles (dont le transporteur et la distinction Action / magasin, propositions de
//   Cowork) ; les 8 situations de « Ce que je change ». Textes de Cowork écrits tels quels (liste à relire au compte rendu du brief).

import { FRANCE } from './france-contours.js';
import { etapesLocaliser } from '../core/types/localiser.js';
import { apresFiche, localiserFini } from '../core/declencheurs.js';
import { QUESTIONS } from './questions/ENT-8.1.js';
import { EQUIPE, LEXIQUE, LIEUX, FLUX, RESEAU, MENTION, DOC_ACTION, STYLE_DOCUMENTS, mailDe } from './action.js';

import {
  ID, VUE, ID_VOLET, FICHES, TIRAGE, ORDRE_JUSTE, PLACE_JUSTE, memeOrdre, acteursDe, situationsSocle, situationsDe, ordreDepart, champActeur,
  champSituation, rolesDe, choixSituation, libChaine, fiche, dejaEnvoyee,
} from './action-ent81-donnees.js';

export { ID, VUE, ID_VOLET, FICHES, TIRAGE } from './action-ent81-donnees.js';

// ─────────────────────────────────────────────────────────────── l’heure du scénario (lundi 8 novembre, aucune année écrite)
// Le 8 novembre de l’année scolaire en cours (de septembre à décembre : cette année ; de janvier à août : l’année d’avant), comme ENT-8.2.
// Heure d’ouverture + temps réellement passé + `decalage` (minutes) : les messages déclenchés arrivent toujours après l’accueil.
const anScolaire = () => { const d = new Date(); return d.getMonth() >= 8 ? d.getFullYear() : d.getFullYear() - 1; };
export function tsScenario(hhmm, { db, decalage = 0 } = {}) {
  const [h, mn] = hhmm.split(':').map(Number);
  const ouvert = (db && db.volets && db.volets[ID_VOLET]) || 0;
  const ecoule = ouvert ? Math.max(0, Date.now() - ouvert) : 0;
  return new Date(anScolaire(), 10, 8, h, mn).getTime() + ecoule + decalage * 60000;
}


// ─────────────────────────────────────────────────────────────── la carte de France (vue « Localiser »)
// Les lieux de l’univers (positions relevées dans OSM), dans l’ordre du brief : magasin → entrepôt → port ; Labastide en bonus du confirmé.
// Les couleurs de la carte viennent de `styles/base.css` (bleu client, terre, encre), jamais du THEME (décision n° 8 du chef de chantier).
export const LOCALISER = {
  id: VUE, libelle: 'Carte de France', titre: 'Où sont les lieux ?', contours: FRANCE,
  lieux: LIEUX,
  flux: FLUX,
  reseau: RESEAU,
  fin: { titre: 'Le chemin des produits',
    texte: 'Les produits arrivent d’Asie par bateau au Havre, puis l’entrepôt d’Ensuès prépare les commandes des magasins du Sud-Est. '
      + 'Les ronds creux sont les autres entrepôts Action en France. (Le trajet du Havre à Ensuès, puis à ce magasin de Nîmes, est imaginé pour l’exercice.)' },
};

// ─────────────────────────────────────────────────────────────── les fiches
export const FICHE_QUI = {
  id: FICHES.qui, libelle: 'Qui est qui ?', titre: 'Qui est qui ?',
  sousTitre: 'Pour chaque acteur, choisis ce qu’il fait. Le document est à gauche.',
  documents: ['action'],
  bouton: 'Ouvrir la fiche « Qui est qui ? »',
  blocs: (db) => {
    const roles = rolesDe(db);
    return acteursDe(db).map((p, i) => ({ type: 'liste', id: champActeur(i), lib: p.nom, vide: 'Choisir…', manque: p.nom, choix: roles }));
  },
  envoi: { bouton: 'Envoyer la fiche à Samia', a: 'Samia', suite: 'Samia va te répondre.' },
};
export const FICHE_CHAINE = {
  id: FICHES.chaine, libelle: 'La chaîne', titre: 'La chaîne',
  sousTitre: 'Le chemin d’un produit, de l’usine au client.',
  bouton: 'Ouvrir la fiche « La chaîne »',
  quand: (db) => localiserFini(VUE)(db, ID),
  blocs: (db) => {
    const depart = ordreDepart(db).map((v) => ({ v, lib: libChaine(v) }));
    return [
      { type: 'ordre', id: 'ordre', titre: 'Le chemin d’un produit', consigne: 'Remets le chemin d’un produit dans l’ordre, du début à la fin.', choix: depart },
      { type: 'liste', id: 'place', lib: 'Toi, tu travailles ici :', vide: 'Choisir…', manque: 'où tu travailles', choix: depart },
    ];
  },
  envoi: { bouton: 'Envoyer la fiche à Samia', a: 'Samia', suite: 'Samia va te répondre.' },
};
export const FICHE_CHANGE = {
  id: FICHES.change, libelle: 'Ce que je change', titre: 'Ce que je change',
  sousTitre: 'Pour chaque situation, choisis ce qui arrive au magasin de Nîmes.',
  bouton: 'Ouvrir la fiche « Ce que je change »',
  quand: (db) => dejaEnvoyee(FICHES.chaine)(db),
  blocs: (db) => situationsDe(db).map((p, i) => ({ type: 'liste', id: champSituation(i), lib: p.texte, vide: 'Choisir…',
    manque: `la situation ${i + 1}`, choix: choixSituation(db, p) })),
  envoi: { bouton: 'Envoyer la fiche à Samia', a: 'Samia', suite: 'Samia va te répondre.' },
};

// ─────────────────────────────────────────────────────────────── les jalons (16 ici + 4 de questions = 20)
// Poids validés par Tristan le 15/10/2026 à 19 h 18 (option B, brief §5) : Qui est qui ? 4 (1 par acteur) · La carte de France 4,5
// (0,75 × région et département des 3 lieux) · La chaîne 4 (ordre 2,5 ; place 1,5) · Ce que je change 3,5 (facile 1, moyenne 1,25,
// difficile 1,25) · Les questions de Samia 4 (`part`). Rien n’est vrai avant l’envoi d’une fiche ou le premier essai d’une étape de la
// carte : l’inaction vaut 0. Les lignes se lisent par RANG dans la fiche, jamais par un id d’acteur ou de situation visible dans la page.
export const GROUPES = { qui: 'Qui est qui ?', carte: 'La carte de France', chaine: 'La chaîne', change: 'Ce que je change' };
export const POIDS_SITUATION = { facile: 1, moyen: 1.25, difficile: 1.25 };
const attente = { status: 'attente' };
const ok = { status: 'ok' };
const ko = { status: 'ko' };

// L’acteur de la ligne : la pièce de l’élève qui a cette « place » (fixe = Geodis, sinon sa difficulté).
function jugerActeur(db, quoi) {
  const f = fiche(db, FICHES.qui);
  if (!f.envoye) return attente;
  const L = acteursDe(db);
  const i = L.findIndex((p) => (quoi === 'fixe' ? p.id === 'geodis' : p.difficulte === quoi && p.id !== 'geodis'));
  if (i < 0) throw new Error(`acteur « ${quoi} » absent du tirage de l’élève`);
  return f.valeurs[champActeur(i)] === L[i].role ? ok : ko;
}
function jugerSituation(db, p, i) {
  const f = fiche(db, FICHES.change);
  if (!f.envoye) return attente;
  if (!p) throw new Error('situation absente du tirage de l’élève');
  return f.valeurs[champSituation(i)] === p.juste ? ok : ko;
}
function situationDe(db, d) {
  const L = situationsSocle(db), i = L.findIndex((p) => p.difficulte === d);
  return [L[i], i];
}

const ECRAN = { qui: `fiche:${FICHES.qui}`, chaine: `fiche:${FICHES.chaine}`, change: `fiche:${FICHES.change}` };
// CONTOURNEMENT d’un défaut du moteur (signalé au chef de chantier le 15/10/2026) : le rattrapage des questions au fil (`jalonJuge`,
// `core/types/entreprise.js`) lit `.status` de TOUS les jalons, bonus compris, et écrit une erreur en console sur le `null` d’un cas bonus
// non reçu (chaque élève standard, dès la fin de la carte). Chez un élève qui n’est pas confirmé, le moteur n’appelle un jalon bonus nulle
// part ailleurs (note, bandeau, « fini ») : on y rend « juste » au lieu de `null`. Chez un confirmé, rien ne change (`null` s’il n’a pas
// le cas, ce qui n’arrive pas ici). À retirer quand `jalonJuge` saura lire `null`.
const sansNull = (j) => ({ ...j, verifier: (db) => { const r = j.verifier(db); return r == null && !(db && db.aisance === 'confirme') ? ok : r; } });
export const ETAPES = [
  ...[['geodis', 'fixe'], ['facile', 'facile'], ['moyen', 'moyen'], ['difficile', 'difficile']].map(([id, quoi]) => ({
    id: `qui-${id}`, titre: 'Qui est qui ? : le rôle d’un acteur', groupe: GROUPES.qui, ecran: ECRAN.qui, poids: 1,
    verifier: (db) => jugerActeur(db, quoi) })),
  ...etapesLocaliser(LOCALISER, ID).map((j) => (j.bonus ? sansNull(j) : Object.assign(j, { poids: 0.75, groupe: GROUPES.carte }))),
  { id: 'chaine-ordre', titre: 'La chaîne : le chemin d’un produit dans l’ordre', groupe: GROUPES.chaine, ecran: ECRAN.chaine, poids: 2.5,
    verifier(db) { const f = fiche(db, FICHES.chaine); return !f.envoye ? attente : memeOrdre(f.valeurs.ordre, ORDRE_JUSTE) ? ok : ko; } },
  { id: 'chaine-place', titre: 'La chaîne : où tu travailles', groupe: GROUPES.chaine, ecran: ECRAN.chaine, poids: 1.5,
    verifier(db) { const f = fiche(db, FICHES.chaine); return !f.envoye ? attente : f.valeurs.place === PLACE_JUSTE ? ok : ko; } },
  ...['facile', 'moyen', 'difficile'].map((d) => ({
    id: `change-${d}`, titre: 'Ce que je change : ce qui arrive au magasin', groupe: GROUPES.change, ecran: ECRAN.change, poids: POIDS_SITUATION[d],
    verifier: (db) => { const [p, i] = situationDe(db, d); return jugerSituation(db, p, i); } })),
  // Le cas bonus du confirmé : sans poids ni groupe, `null` quand l’élève ne l’a pas reçu (caché à l’élève). Le lieu bonus de la carte
  // (Labastide) rend ses deux jalons bonus par `etapesLocaliser`.
  sansNull({ id: 'change-bonus', bonus: true, ecran: ECRAN.change, titre: 'Ce que je change : situation en plus',
    verifier: (db) => { const p = TIRAGE.piecesBonus(db, 'situations')[0]; return p ? jugerSituation(db, p, situationsSocle(db).length) : null; } }),
];

// ─────────────────────────────────────────────────────────────── les messages de Samia (au tu ; date du scénario)
const SAMIA = { nom: EQUIPE.samia.nom, mail: mailDe('samia') };
const mail = (prenom, subject, text, o = {}) => ({ folder: 'in', ts: tsScenario(o.heure || '08:00', { db: o.db, decalage: o.decalage || 0 }),
  from: SAMIA.nom, fromMail: SAMIA.mail, to: prenom, subject, kind: 'text', text, ...(o.extra || {}) });
// Le point d’étape répondu (juste ou faux) : la carte s’ouvre, Samia l’annonce.
export const pointDEtapeFait = (db) => { const Q = db && db.questions && db.questions[ID]; return !!(Q && Q['lien-action-geodis'] && Q['lien-action-geodis'].premiere != null); };
const accuse = (sujet) => (prenom, n, db) => ({ mails: [mail(prenom, `RE : ${sujet}`, `Merci, j’ai ta nouvelle fiche.\n\nSamia`, { db, decalage: 1 })] });

export const VOLET = {
  id: ID_VOLET,
  semer: (prenom) => ({ mails: [mail(prenom, 'Bienvenue chez Geodis',
    `Bonjour ${prenom}, bienvenue chez Geodis à Ensuès ! Je suis Samia, cheffe d’équipe à la réception, et ta [[tutrice]] pendant ton stage.\n\n`
      + 'Ici, on travaille pour Action. Lis le document « Action et Geodis en bref ».\n\n'
      + 'Puis complète la fiche « Qui est qui ? » et renvoie-la-moi.\n\nSamia',
    { extra: { pieces: ['action'], ouvreFiche: FICHES.qui } })] }),
  declencheurs: [
    { id: 'carte', quand: pointDEtapeFait, semer: (prenom, db) => ({ mails: [mail(prenom, 'La carte de France',
      'Maintenant, regarde où se trouvent les lieux de la [[chaîne logistique]]. Ouvre la carte de France (menu) et place chaque lieu : '
        + 'sa [[région]], puis son [[département]], puis sa ville.\n\nSamia', { db, decalage: 1 })] }) },
    { id: 'chaine', quand: localiserFini(VUE), semer: (prenom, db) => ({ mails: [mail(prenom, 'La chaîne',
      'Tu as vu les lieux. Maintenant, remets le chemin des produits dans l’ordre, et dis-moi où tu travailles.\n\nSamia',
      { db, decalage: 1, extra: { ouvreFiche: FICHES.chaine } })] }) },
    { id: 'change', quand: apresFiche(FICHES.chaine), semer: (prenom, db) => ({ mails: [mail(prenom, 'Ce que je change',
      'Dernière chose. Ton travail compte pour le magasin. Pour chaque situation, choisis ce qui arrive au magasin de Nîmes.\n\nSamia',
      { db, decalage: 1, extra: { ouvreFiche: FICHES.change } })] }) },
    { id: 'fin', quand: apresFiche(FICHES.change), semer: (prenom, db) => ({ mails: [mail(prenom, 'Merci pour ce premier jour',
      'Merci pour ce premier jour ! Demain, tu prends ton poste à la réception à 6 h : on attend le camion du Havre.\n\nSamia', { db, decalage: 2 })] }) },
  ],
  // Les envois corrigés (séance `correction`) : un accusé, jamais « juste » ni « faux ».
  corrections: { [FICHES.qui]: accuse('Qui est qui ?'), [FICHES.chaine]: accuse('La chaîne'), [FICHES.change]: accuse('Ce que je change') },
};

// ─────────────────────────────────────────────────────────────── lexique, accueil, options
// Les mots du brief (§4) et « tutrice » ; PAS « conteneur » (réponse de la question D).
const MOTS = ['entrepôt', 'prestataire', 'hub d’import', 'chaîne logistique', 'région', 'département', 'filmer', 'enseigne', 'tutrice'];
export const LEXIQUE_81 = Object.fromEntries(MOTS.map((m) => [m, LEXIQUE[m]]));
export const ACCUEIL = {
  titre: 'D’où viennent les produits du magasin de Nîmes ?',
  kpis: ['mail'],
  etapes: [
    ['Lire le message de Samia', 'Menu Messagerie : le document « Action et Geodis en bref » est joint.'],
    ['① Qui est qui ?', 'Pour chaque acteur, choisis ce qu’il fait, puis envoie la fiche à Samia.'],
    ['② La carte de France', 'Place chaque lieu sur la carte : sa [[région]], son [[département]], sa ville.'],
    ['③ La chaîne', 'Remets le chemin d’un produit dans l’ordre, et dis où tu travailles.'],
    ['④ Ce que je change', 'Pour chaque situation, choisis ce qui arrive au magasin.'],
    ['Bon à savoir', MENTION],
  ],
};
export const FIN_FIGE = 'La carte et les questions de Samia se jouent au premier essai : elles ne se rejouent pas.';

export const OPTIONS = {
  menu: [],
  exercice: 'Séance 1 : d’où viennent les produits ?',
  sansTrame: 'Tout se fait à l’écran',
  lexique: LEXIQUE_81,
  equipe: EQUIPE,
  questions: QUESTIONS,
  documents: [DOC_ACTION],
  documentsStyle: STYLE_DOCUMENTS,
  fiches: [FICHE_QUI, FICHE_CHAINE, FICHE_CHANGE],
  localiser: LOCALISER,
  // La carte n’ouvre qu’après la fiche « Qui est qui ? » (puis le point d’étape la garde fermée jusqu’à la réponse : `ferme`).
  fermetures: { localiser: { ouvertSi: (db) => dejaEnvoyee(FICHES.qui)(db), message: 'Après la fiche « Qui est qui ? »' } },
  finFige: FIN_FIGE,
};
