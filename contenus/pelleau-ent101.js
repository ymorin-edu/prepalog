// ENT-10.1 — Transports Pelleau, « de Plabennec à l'entrepôt neuf » : le contenu de la séance (brief `docs/briefs/ENT-10.1-pelleau-se-situer.md`,
// décisions du chef de chantier dans `docs/briefs/COORDINATION-pelleau.md` §2). Univers commun : `contenus/pelleau.js` (À LIRE). Données pures
// (lieux, banques, tirage) : `contenus/pelleau-ent101-donnees.js`. Activité : `activites/pelleau-se-situer.js`. Questions :
// `contenus/questions/ENT-10.1.js`. Corrigé : `contenus/corriges/ENT-10.1.js`.
//
// 4 mai 2026, 8 h (aucun jour de la semaine écrit), premier jour de PFMP de l'élève, la veille de la visite de l'entrepôt (ENT-10.2).
// CAP OL, GUIDAGE de CAP-C1.1 :
//   ① « Qui est qui ? » : 3 tâches tirées (+ 1 chez un confirmé), les 4 personnes offertes à chaque ligne ;
//   ② la carte de France (vue « Localiser ») : entrepôt, Plabennec, Rungis (+ Saint-Pol-de-Léon chez un confirmé) ; question A ;
//   ③ « L'histoire de Pelleau » : 4 étapes tirées (toujours 2026), départ mélangé où aucune étape n'est à sa place ;
//   ④ « Ce que fait Pelleau » : 3 travaux tirés (+ 1), un métier chacun ; question B ;
//   ⑤ « Ce que je change » : 2 situations tirées (+ 1) ; questions D (au premier choix, corrigée au bilan) et C (réflexion, à l'envoi).
// Rien n'est jugé à l'écran ; le bandeau de fin dit ✓ / ✗ par bloc, et la case avec `bilanDetail` ; « Corriger » rouvre les fiches fausses,
// jamais la carte ni une question (`finFige`).
//
// VÉRIFIÉ / CONSTRUIT : voir l'en-tête de `contenus/pelleau.js` et de `contenus/pelleau-ent101-donnees.js`. Messages d'Erwan : textes du brief
// §4 (construits par Cowork), écrits tels quels.

import { FRANCE } from './france-contours.js';
import { etapesLocaliser } from '../core/types/localiser.js';
import { apresFiche, localiserFini } from '../core/declencheurs.js';
import { QUESTIONS } from './questions/ENT-10.1.js';
import { EQUIPE, LEXIQUE, MENTION, DOC_EQUIPE, DOC_PELLEAU, DOC_DROIT_DEPOT, STYLE_DOCUMENTS, mailDe, heureScenario } from './pelleau.js';
import {
  ID, VUE, ID_VOLET, FICHES, TIRAGE, LIEUX_CARTE, FLUX, PERSONNES, METIERS, tachesSocle, tachesDe, etapesDe, etapesJustes, travauxSocle,
  travauxDe, situationsSocle, situationsDe, choixSituation, champTache, champTravail, champSituation, libEtape, fiche, dejaEnvoyee,
} from './pelleau-ent101-donnees.js';

export { ID, VUE, ID_VOLET, FICHES, TIRAGE } from './pelleau-ent101-donnees.js';

// ─────────────────────────────────────────────────────────────── la carte de France (vue « Localiser »)
export const LOCALISER = {
  id: VUE, libelle: 'Carte de France', titre: 'Où sont les lieux ?', contours: FRANCE,
  lieux: LIEUX_CARTE,
  flux: FLUX,
  fin: { titre: 'De Gouesnou à Rungis',
    texte: 'Chaque jour, des camions Pelleau partent du Finistère vers la région parisienne : près de 600 km. '
      + 'Les prénoms et les clients de l’entrepôt sont imaginés pour l’exercice.' },
};

// ─────────────────────────────────────────────────────────────── les fiches (aucune consigne ne compte les lignes)
export const FICHE_QUI = {
  id: FICHES.qui, libelle: 'Qui est qui ?', titre: 'Qui est qui ?',
  sousTitre: 'Pour chaque tâche, choisis qui la fait. Le document est à gauche.',
  documents: ['equipe'],
  bouton: 'Ouvrir la fiche « Qui est qui ? »',
  blocs: (db) => tachesDe(db).map((p, i) => ({ type: 'liste', id: champTache(i), lib: p.texte, vide: 'Choisir…', manque: `la tâche ${i + 1}`,
    choix: PERSONNES })),
  envoi: { bouton: 'Envoyer la fiche à Erwan', a: 'Erwan', suite: 'Erwan va te répondre.' },
};
export const FICHE_HISTOIRE = {
  id: FICHES.histoire, libelle: 'L’histoire de Pelleau', titre: 'L’histoire de Pelleau',
  sousTitre: 'Lis « Pelleau en bref », à gauche.',
  documents: ['pelleau'],
  bouton: 'Ouvrir la fiche « L’histoire de Pelleau »',
  quand: (db) => localiserFini(VUE)(db, ID),
  blocs: (db) => [{ type: 'ordre', id: 'ordre', titre: 'Dans l’ordre', consigne: 'Range les étapes, de la plus ancienne à la plus récente.',
    choix: etapesDe(db).map((p) => ({ v: p.id, lib: p.lib })) }],
  envoi: { bouton: 'Envoyer la fiche à Erwan', a: 'Erwan', suite: 'Erwan va te répondre.' },
};
export const FICHE_METIERS = {
  id: FICHES.metiers, libelle: 'Ce que fait Pelleau', titre: 'Ce que fait Pelleau',
  sousTitre: 'Pour chaque travail, choisis le métier de Pelleau.',
  documents: ['pelleau'],
  bouton: 'Ouvrir la fiche « Ce que fait Pelleau »',
  quand: (db) => dejaEnvoyee(FICHES.histoire)(db),
  blocs: (db) => travauxDe(db).map((p, i) => ({ type: 'liste', id: champTravail(i), lib: p.texte, vide: 'Choisir…', manque: `le travail ${i + 1}`,
    choix: METIERS })),
  envoi: { bouton: 'Envoyer la fiche à Erwan', a: 'Erwan', suite: 'Erwan va te répondre.' },
};
export const FICHE_CHANGER = {
  id: FICHES.changer, libelle: 'Ce que je change', titre: 'Ce que je change',
  sousTitre: 'Pour chaque situation, choisis ce qui se passe si tu fais bien ton travail.',
  documents: ['droit-depot'],
  bouton: 'Ouvrir la fiche « Ce que je change »',
  quand: (db) => dejaEnvoyee(FICHES.metiers)(db),
  blocs: (db) => situationsDe(db).map((p, i) => ({ type: 'liste', id: champSituation(i), lib: p.texte, vide: 'Choisir…',
    manque: `la situation ${i + 1}`, choix: choixSituation(db, p) })),
  envoi: { bouton: 'Envoyer la fiche à Erwan', a: 'Erwan', suite: 'Erwan va te répondre.' },
};

// ─────────────────────────────────────────────────────────────── les jalons (18 jalons, 16 points ici + 4 de questions = 20)
// Poids validés par Tristan le 18/10/2026 à 22 h 03 (brief §5) : Qui est qui ? 3 (1 par tâche) · La carte 6 (1 × région et département
// des 3 lieux) · L'histoire de Pelleau 3 (0,75 par étape à son rang) · Ce que fait Pelleau 2 (2/3 par travail) · Ce que je change 2 (1 par
// situation) · Les questions d'Erwan 4 (`part`). Rien n'est vrai avant l'envoi d'une fiche ou le premier essai d'une étape de la carte :
// l'inaction vaut 0 (et le départ de l'histoire ne place aucune étape à son rang : envoyer sans toucher vaut 0). Les lignes se lisent par
// RANG dans la fiche, jamais par un id de pièce visible dans la page.
export const GROUPES = { qui: 'Qui est qui ?', carte: 'La carte', histoire: 'L’histoire de Pelleau', metiers: 'Ce que fait Pelleau',
  changer: 'Ce que je change' };
const attente = { status: 'attente' };
const ok = { status: 'ok' };
const ko = { status: 'ko' };
const ECRAN = { qui: `fiche:${FICHES.qui}`, histoire: `fiche:${FICHES.histoire}`, metiers: `fiche:${FICHES.metiers}`, changer: `fiche:${FICHES.changer}` };

// La ligne `i` d'une fiche dont les lignes sont les pièces `L` (socle puis bonus) : juste si la valeur choisie est `attendu(pièce)`.
function jugerLigne(db, ficheId, champ, L, i, attendu) {
  const f = fiche(db, ficheId);
  if (!f.envoye) return attente;
  const p = L[i];
  if (!p) throw new Error(`ligne ${i + 1} absente du tirage de l’élève (${ficheId})`);
  return f.valeurs[champ(i)] === attendu(p) ? ok : ko;
}
// L'étape de rang `k` (dans l'ordre juste) : juste si l'élève l'a envoyée à ce rang.
function jugerEtape(db, k) {
  const f = fiche(db, FICHES.histoire);
  if (!f.envoye) return attente;
  const juste = etapesJustes(db);
  const o = f.valeurs.ordre;
  return Array.isArray(o) && o[k] === juste[k] ? ok : ko;
}
const bonusDe = (db, banque) => TIRAGE.piecesBonus(db, banque)[0] || null;

export const ETAPES = [
  ...[0, 1, 2].map((i) => ({
    id: `qui-${i + 1}`, titre: 'Qui est qui ? : la personne d’une tâche', groupe: GROUPES.qui, ecran: ECRAN.qui, poids: 1,
    titreBilan: (db) => { const p = tachesSocle(db)[i]; return p ? `Qui est qui ? : « ${p.texte} »` : null; },
    verifier: (db) => jugerLigne(db, FICHES.qui, champTache, tachesSocle(db), i, (p) => p.qui) })),
  ...etapesLocaliser(LOCALISER, ID).map((j) => (j.bonus ? j : Object.assign(j, { poids: 1, groupe: GROUPES.carte }))),
  ...[0, 1, 2, 3].map((k) => ({
    id: `histoire-${k + 1}`, titre: 'L’histoire de Pelleau : une étape à sa place', groupe: GROUPES.histoire, ecran: ECRAN.histoire, poids: 0.75,
    titreBilan: (db) => { const id = etapesJustes(db)[k]; return id ? `L’histoire de Pelleau : « ${libEtape(id)} »` : null; },
    verifier: (db) => jugerEtape(db, k) })),
  ...[0, 1, 2].map((i) => ({
    id: `metiers-${i + 1}`, titre: 'Ce que fait Pelleau : le métier d’un travail', groupe: GROUPES.metiers, ecran: ECRAN.metiers, poids: 2 / 3,
    titreBilan: (db) => { const p = travauxSocle(db)[i]; return p ? `Ce que fait Pelleau : « ${p.texte} »` : null; },
    verifier: (db) => jugerLigne(db, FICHES.metiers, champTravail, travauxSocle(db), i, (p) => p.metier) })),
  ...[0, 1].map((i) => ({
    id: `changer-${i + 1}`, titre: 'Ce que je change : ce qui se passe', groupe: GROUPES.changer, ecran: ECRAN.changer, poids: 1,
    titreBilan: (db) => { const p = situationsSocle(db)[i]; return p ? `Ce que je change : « ${p.texte} »` : null; },
    verifier: (db) => jugerLigne(db, FICHES.changer, champSituation, situationsSocle(db), i, (p) => p.juste) })),
  // Les cas bonus du confirmé : sans poids ni groupe, `null` quand l'élève ne les a pas reçus (cachés à l'élève). Le lieu bonus de la carte
  // (Saint-Pol-de-Léon) rend ses deux jalons bonus par `etapesLocaliser`. La ligne bonus vient après le socle, dans chaque fiche.
  { id: 'qui-bonus', bonus: true, ecran: ECRAN.qui, titre: 'Qui est qui ? : tâche en plus',
    verifier: (db) => (bonusDe(db, 'taches') ? jugerLigne(db, FICHES.qui, champTache, tachesDe(db), 3, (p) => p.qui) : null) },
  { id: 'metiers-bonus', bonus: true, ecran: ECRAN.metiers, titre: 'Ce que fait Pelleau : travail en plus',
    verifier: (db) => (bonusDe(db, 'travaux') ? jugerLigne(db, FICHES.metiers, champTravail, travauxDe(db), 3, (p) => p.metier) : null) },
  { id: 'changer-bonus', bonus: true, ecran: ECRAN.changer, titre: 'Ce que je change : situation en plus',
    verifier: (db) => (bonusDe(db, 'situations') ? jugerLigne(db, FICHES.changer, champSituation, situationsDe(db), 2, (p) => p.juste) : null) },
];

// ─────────────────────────────────────────────────────────────── les messages d'Erwan (au tu ; 4 mai, aucun jour de la semaine)
const ERWAN = { nom: EQUIPE.erwan.nom, mail: mailDe('erwan') };
const mail = (prenom, subject, text, o = {}) => ({ folder: 'in', ts: heureScenario(4, o.heure || '08:00', { db: o.db, volet: ID_VOLET, decalage: o.decalage || 0 }),
  from: ERWAN.nom, fromMail: ERWAN.mail, to: prenom, subject, kind: 'text', text, ...(o.extra || {}) });
const accuse = (sujet) => (prenom, n, db) => ({ mails: [mail(prenom, `RE : ${sujet}`, 'Merci, j’ai ta nouvelle fiche.\n\nErwan', { db, decalage: 1 })] });

export const VOLET = {
  id: ID_VOLET,
  semer: (prenom) => ({ mails: [mail(prenom, 'Bienvenue chez Pelleau',
    `Bonjour ${prenom}, bienvenue chez Pelleau ! Je suis Erwan, je dirige l’entrepôt et je suis ton [[tuteur]]. L’entrepôt ouvre cette semaine : `
      + 'tu fais partie des premiers. Commence par l’équipe.\n\nLis le document « L’équipe de l’entrepôt », puis remplis la fiche « Qui est qui ? ».\n\nErwan',
    { extra: { pieces: ['equipe'], ouvreFiche: FICHES.qui } })] }),
  declencheurs: [
    { id: 'carte', quand: apresFiche(FICHES.qui), semer: (prenom, db) => ({ mails: [mail(prenom, 'La carte',
      'Pelleau est né à Plabennec, l’entrepôt est à Gouesnou, et les camions roulent jusqu’à Rungis. Place ces lieux sur la carte '
        + '(menu « Carte de France »).\n\nErwan', { db, decalage: 1 })] }) },
    { id: 'histoire', quand: localiserFini(VUE), semer: (prenom, db) => ({ mails: [mail(prenom, 'L’histoire de Pelleau',
      'Pelleau a presque cent ans. Lis le document et remets ces étapes dans l’ordre.\n\nErwan',
      { db, decalage: 1, extra: { pieces: ['pelleau'], ouvreFiche: FICHES.histoire } })] }) },
    { id: 'metiers', quand: apresFiche(FICHES.histoire), semer: (prenom, db) => ({ mails: [mail(prenom, 'Ce que fait Pelleau',
      'Pelleau transporte, et maintenant stocke. Pour chaque travail, dis de quel métier il est.\n\nErwan',
      { db, decalage: 1, extra: { ouvreFiche: FICHES.metiers } })] }) },
    { id: 'changer', quand: apresFiche(FICHES.metiers), semer: (prenom, db) => ({ mails: [mail(prenom, 'Ce que je change',
      'Demain, tu travailles à l’entrepôt. Pour chaque situation, dis ce qui se passe si tu fais bien ton travail.\n\n'
        + 'Je te joins aussi « Le droit » : ce que dit la loi quand on garde la marchandise d’un client.\n\nErwan',
      { db, decalage: 1, extra: { pieces: ['droit-depot'], ouvreFiche: FICHES.changer } })] }) },
    { id: 'fin', quand: apresFiche(FICHES.changer), semer: (prenom, db) => ({ mails: [mail(prenom, 'À demain',
      `Merci ${prenom}. Demain 7 h, je te fais visiter l’entrepôt. Prends tes chaussures de sécurité.\n\nErwan`, { db, decalage: 2 })] }) },
  ],
  // Les envois corrigés (séance `correction`) : un accusé, jamais « juste » ni « faux ».
  corrections: { [FICHES.qui]: accuse('Qui est qui ?'), [FICHES.histoire]: accuse('L’histoire de Pelleau'),
    [FICHES.metiers]: accuse('Ce que fait Pelleau'), [FICHES.changer]: accuse('Ce que je change') },
};

// ─────────────────────────────────────────────────────────────── accueil, options
export const ACCUEIL = {
  titre: 'De Plabennec à l’entrepôt neuf',
  kpis: ['mail'],
  etapes: [
    ['Lire le message d’Erwan', 'Menu Messagerie : le document « L’équipe de l’entrepôt » est joint.'],
    ['① Qui est qui ?', 'Pour chaque tâche, choisis qui la fait, puis envoie la fiche à Erwan.'],
    ['② La carte de France', 'Place chaque lieu : sa région, son département, sa ville.'],
    ['③ L’histoire de Pelleau', 'Range les étapes, de la plus ancienne à la plus récente.'],
    ['④ Ce que fait Pelleau', 'Pour chaque travail, choisis le métier.'],
    ['⑤ Ce que je change', 'Pour chaque situation, choisis ce qui se passe.'],
    ['Bon à savoir', MENTION],
  ],
};
export const FIN_FIGE = 'La carte se joue au premier essai : elle ne se rejoue pas.';

// L'ordre des écrans de travail (barre « Étape suivante » et menu « Mon poste », CAP).
export const SUITE = [
  { vue: 'fiche', libelle: 'Qui est qui ?', fait: dejaEnvoyee(FICHES.qui) },
  { vue: 'localiser', libelle: 'Carte de France', fait: localiserFini(VUE) },
  { vue: `fiche:${FICHES.histoire}`, libelle: 'L’histoire de Pelleau', fait: dejaEnvoyee(FICHES.histoire) },
  { vue: `fiche:${FICHES.metiers}`, libelle: 'Ce que fait Pelleau', fait: dejaEnvoyee(FICHES.metiers) },
  { vue: `fiche:${FICHES.changer}`, libelle: 'Ce que je change', fait: dejaEnvoyee(FICHES.changer) },
];
export const OPTIONS = {
  suite: SUITE,
  menu: [],
  exercice: 'Séance 1 : de Plabennec à l’entrepôt neuf',
  sansTrame: 'Tout se fait à l’écran',
  lexique: LEXIQUE,
  equipe: EQUIPE,
  questions: QUESTIONS,
  documents: [DOC_EQUIPE, DOC_PELLEAU, DOC_DROIT_DEPOT],
  documentsStyle: STYLE_DOCUMENTS,
  fiches: [FICHE_QUI, FICHE_HISTOIRE, FICHE_METIERS, FICHE_CHANGER],
  localiser: LOCALISER,
  // La carte n'ouvre qu'après la fiche « Qui est qui ? ».
  fermetures: { localiser: { ouvertSi: (db) => dejaEnvoyee(FICHES.qui)(db), message: 'Après la fiche « Qui est qui ? »' } },
  finFige: FIN_FIGE,
};
