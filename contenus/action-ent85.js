// ENT-8.5 — Action, évaluation « se situer dans un nouveau site » : le contenu de la séance (brief
// `docs/briefs/ENT-8.5-action-evaluation-se-situer.md`, décisions du chef de chantier dans `docs/briefs/COORDINATION-action.md` §7). Univers
// commun : `contenus/action.js` (lu ; seuls les lieux de Belleville, Villefranche et La Sentinelle y ont été ajoutés). Les deux sites :
// `contenus/action-eval-sites.js` (partagé avec ENT-8.6). Données pures : `contenus/action-ent85-donnees.js`. Activité :
// `activites/action-evaluation-se-situer.js`. Questions : `contenus/questions/ENT-8.5.js`. Corrigé : `contenus/corriges/ENT-8.5.js`.
//
// Lundi 11 janvier, 8 h (aucune année écrite). Troisième stage de l’élève, dans un site TIRÉ (Onnaing / GXO / La Sentinelle, ou
// Belleville-en-Beaujolais / Kuehne+Nagel / Villefranche-sur-Saône) ; tuteur : Karim ou Sandrine (construits). CAP OL, ÉVALUATION de
// CAP-C1.1, en copie rendue (`copie: true`) : rien ne remonte pendant le travail, une seule remise, note figée ; aucun bilan, aucun
// « Corriger », aucun mot cliquable, rien à l’écran ne dit juste ou faux ; les pastilles d’étape disent « fait », jamais « juste ».
//   Avant de commencer (noté, 4 points) → ① la carte de France (entrepôt, magasin, port ; niveau standard pour tous) → ② « Qui est qui ? »
//   (Action + 3 acteurs tirés, les 8 rôles à chaque ligne, sans document) → ③ « La chaîne » (6 étapes du site, départ mélangé, puis « Toi,
//   tu travailles ici ») → ④ « Ce que je change » (3 situations tirées) → « Rendre ma copie ». Chaque écran s’ouvre à l’envoi du précédent
//   (le tuteur écrit à chaque étape, son message ouvre la fiche). Toute fiche peut partir incomplète (`envoi.incomplet`).
//
// VÉRIFIÉ / CONSTRUIT (alerte 9) — voir aussi l’en-tête de `contenus/action-eval-sites.js` et `MENTION` ci-dessous. Textes de Cowork écrits
// tels quels ; textes du constructeur (messages d’étape, consignes des fiches, indices de la carte) listés au compte rendu, à relire à l’écran.

import { FRANCE } from './france-contours.js';
import { etapesLocaliser } from '../core/types/localiser.js';
import { apresFiche, localiserFini } from '../core/declencheurs.js';
import { QUESTIONS, TUTEUR } from './questions/ENT-8.5.js';
import * as ACTION from './action.js';
import { STYLE_DOCUMENTS, PIED, ech } from './action.js';
import { FLUX } from './action-eval-sites.js';
import {
  ID, VUE, ID_VOLET, FICHES, TIRAGE, ROLES, siteEleve, remplir, nomActeur, acteursDe, situationsDe, ordreDepart, libChaine, ORDRE_JUSTE,
  PLACE_JUSTE, debutJuste, finJuste, texteSituation, choixSituation, champActeur, champSituation, fiche, envoyee,
} from './action-ent85-donnees.js';

export { ID, VUE, ID_VOLET, FICHES, TIRAGE } from './action-ent85-donnees.js';

// ─────────────────────────────────────────────────────────────── l’entreprise de CETTE séance (le site est tiré : bandeau neutre)
export const ENTREPRISE = { ...ACTION.ENTREPRISE,
  sousTitre: 'Un nouvel entrepôt d’Action — commerce à petits prix', exercice: 'Évaluation : se situer dans un nouveau site' };
export const VOCAB = { ...ACTION.VOCAB, mailDomain: 'action-stage.example' };
export const EQUIPE_85 = { tuteur: TUTEUR };

// ─────────────────────────────────────────────────────────────── l’heure du scénario (lundi 11 janvier, aucune année écrite)
// Le 11 janvier de l’année scolaire en cours (de septembre à décembre : l’année d’après ; de janvier à août : cette année).
const anJanvier = () => { const d = new Date(); return d.getMonth() >= 8 ? d.getFullYear() + 1 : d.getFullYear(); };
export function tsScenario(hhmm, { db, decalage = 0 } = {}) {
  const [h, mn] = hhmm.split(':').map(Number);
  const ouvert = (db && db.volets && db.volets[ID_VOLET]) || 0;
  const ecoule = ouvert ? Math.max(0, Date.now() - ouvert) : 0;
  return new Date(anJanvier(), 0, 11, h, mn).getTime() + ecoule + decalage * 60000;
}

// ─────────────────────────────────────────────────────────────── ① la carte de France (vue « Localiser », en évaluation)
// Les lieux du SITE de l’élève (mêmes ids pour les deux sites : `entrepot`, `magasin`, `port`), dans l’ordre du brief ; aucun lieu bonus.
// Seule la base vide (Onnaing) est contrôlée au chargement : le bloc de tests contrôle aussi Belleville (`controlerLocaliser`).
export const LOCALISER = {
  id: VUE, libelle: 'Carte de France', titre: 'Retrouve où tu es, où va la marchandise et d’où elle arrive.', contours: FRANCE,
  lieux: (db) => siteEleve(db).lieux,
  flux: FLUX,
  fin: (db) => { const S = siteEleve(db);
    return { titre: `Le chemin des produits vers ${S.ville}`,
      texte: `(Le trajet du Havre à ${S.site}, puis au magasin de ${S.ville}, est imaginé pour l’exercice.) ${S.position}` }; },
};

// ─────────────────────────────────────────────────────────────── le document d’« Avant de commencer » (aucune réponse d’un jalon)
// Il ne dit ni ce que fait le prestataire, ni le rôle d’Action (ce serait une ligne de « Qui est qui ? ») : le site, la date, le tuteur.
const docStage = (db) => { const S = siteEleve(db);
  return `<article class="ac-doc" aria-label="Ton stage">
    <p class="ac-t">Ton stage chez ${ech(S.prestataire)}</p>
    <p class="ac-st">Lundi 11 janvier, 8 h</p>
    <p>Tu commences ton troisième stage (PFMP) chez <b>${ech(S.prestataire)}</b>, à l’entrepôt <b>${ech(S.deSite)}</b>, dans ${ech(S.departement)}.</p>
    <p>${ech(S.tuteur.mot.replace(/^t/, 'T'))} : <b>${ech(S.tuteur.prenom)}</b>, ${ech(S.tuteur.fonction)}.</p>
    ${PIED(`${ech(S.tuteur.prenom)} est construit${S.tuteur.mot === 'ta tutrice' ? 'e' : ''} pour l’exercice.`)}
  </article>`; };
const DOC_STAGE = { id: 'stage', titre: 'Ton stage', court: 'Ton stage', html: docStage };
export const STYLE = STYLE_DOCUMENTS;

// ─────────────────────────────────────────────────────────────── les fiches (consigne du tuteur dans la fiche ; sans document)
// Les textes fixes du moteur (sous-titre, bouton d’envoi) ne connaissent pas le site : ils disent « ton tuteur ». Le site, le magasin et
// le prestataire sont écrits dans les blocs (calculés sur la base de l’élève).
const ENVOI = { bouton: 'Envoyer la fiche à ton tuteur', a: 'ton tuteur', suite: 'Merci, c’est noté.', incomplet: true };
export const FICHE_QUI = {
  id: FICHES.qui, libelle: 'Qui est qui ?', titre: 'Qui est qui ?',
  sousTitre: 'Pour chaque acteur, choisis son rôle.',
  bouton: 'Ouvrir la fiche « Qui est qui ? »',
  quand: (db) => localiserFini(VUE)(db, ID) || envoyee(FICHES.qui)(db),
  blocs: (db) => { const S = siteEleve(db);
    return [{ type: 'cadre', titre: 'Quel est son rôle ?', blocs: acteursDe(db).map((p, i) => ({ type: 'liste', id: champActeur(i), lib: nomActeur(p, S),
      vide: 'Choisir…', manque: nomActeur(p, S), choix: ROLES })) }]; },
  envoi: ENVOI,
};
export const FICHE_CHAINE = {
  id: FICHES.chaine, libelle: 'La chaîne', titre: 'La chaîne',
  sousTitre: 'Remets dans l’ordre le chemin d’un produit, de l’usine au client. Puis dis où tu travailles.',
  bouton: 'Ouvrir la fiche « La chaîne »',
  blocs: (db) => {
    const S = siteEleve(db);
    const depart = ordreDepart(db).map((v) => ({ v, lib: libChaine(v, S) }));
    return [
      { type: 'ordre', id: 'ordre', titre: 'Le chemin d’un produit', consigne: 'Remets les étapes dans l’ordre, du début à la fin.', choix: depart },
      { type: 'liste', id: 'place', lib: 'Toi, tu travailles ici :', vide: 'Choisir…', manque: 'où tu travailles', choix: depart },
    ];
  },
  envoi: ENVOI,
};
export const FICHE_CHANGE = {
  id: FICHES.change, libelle: 'Ce que je change', titre: 'Ce que je change',
  sousTitre: 'Ce que tu fais à l’entrepôt se voit au magasin. Pour chaque situation, choisis ce qui arrive là-bas.',
  bouton: 'Ouvrir la fiche « Ce que je change »',
  blocs: (db) => { const S = siteEleve(db);
    return situationsDe(db).map((p, i) => ({ type: 'liste', id: champSituation(i), lib: texteSituation(p, S), vide: `Au magasin de ${S.ville}…`,
      manque: `la situation ${i + 1}`, choix: choixSituation(db, p) })); },
  envoi: ENVOI,
};

// ─────────────────────────────────────────────────────────────── les jalons (16 ici + 4 de l’ouverture = 20)
// Poids du brief §5 (décidés par Cowork sur délégation de Tristan, repris tels quels par le chef de chantier) : La carte de France 4,5
// (0,75 × région et département des 3 lieux, premier essai) · Qui est qui ? 4 (1 par ligne) · La chaîne 3,5 (les 3 premières dans l’ordre
// 1,25 ; les 3 dernières dans l’ordre 1,25 ; sa place 1) · Ce que je change 4 (facile 1, moyenne 1,5, difficile 1,5) · Avant de commencer 4
// (`part`, le moteur). Rien n’est vrai avant l’envoi d’une fiche ou le premier essai d’une étape de la carte : l’inaction vaut 0. Une fiche
// envoyée incomplète : ses lignes vides sont fausses. Les lignes se lisent par RANG dans la fiche, jamais par un id visible dans la page.
export const GROUPES = { carte: 'La carte de France', qui: 'Qui est qui ?', chaine: 'La chaîne', change: 'Ce que je change' };
export const POIDS_SITUATION = { facile: 1, moyen: 1.5, difficile: 1.5 };
const attente = { status: 'attente' };
const ok = { status: 'ok' };
const ko = { status: 'ko' };
const ECRAN = { qui: `fiche:${FICHES.qui}`, chaine: `fiche:${FICHES.chaine}`, change: `fiche:${FICHES.change}` };
const NOM_LIEU = { entrepot: 'L’entrepôt', magasin: 'Le magasin', port: 'Le port' };

// La ligne de « Qui est qui ? » : `fixe` = Action ; sinon l’acteur tiré de cette difficulté. Rend [acteur, rang].
function acteurDe(db, quoi) {
  const L = acteursDe(db);
  const i = L.findIndex((p) => (quoi === 'fixe' ? p.id === 'action' : p.difficulte === quoi));
  return [L[i], i];
}
function jugerActeur(db, quoi) {
  const f = fiche(db, FICHES.qui);
  if (!f.envoye) return attente;
  const [p, i] = acteurDe(db, quoi);
  if (!p) throw new Error(`acteur « ${quoi} » absent du tirage de l’élève`);
  return f.valeurs[champActeur(i)] === p.role ? ok : ko;
}
function jugerChaine(db, juge) {
  const f = fiche(db, FICHES.chaine);
  if (!f.envoye) return attente;
  return juge(f.valeurs) ? ok : ko;
}
function situationDe(db, d) {
  const L = situationsDe(db), i = L.findIndex((p) => p.difficulte === d);
  return [L[i], i];
}
function jugerSituation(db, d) {
  const f = fiche(db, FICHES.change);
  if (!f.envoye) return attente;
  const [p, i] = situationDe(db, d);
  if (!p) throw new Error(`situation « ${d} » absente du tirage de l’élève`);
  return f.valeurs[champSituation(i)] === p.juste ? ok : ko;
}

export const ETAPES = [
  // La carte, en évaluation (niveau standard, aucun lieu bonus) ; titres sans nom de site (le Suivi est le même pour les deux sites).
  ...etapesLocaliser(LOCALISER, ID, { copie: true }).map((j) => {
    const [, lieu, et] = j.id.split(':');
    return Object.assign(j, { poids: 0.75, groupe: GROUPES.carte,
      titre: `La carte : ${NOM_LIEU[lieu]} — ${et === 'region' ? 'la région' : 'le département'}, du premier coup` });
  }),
  ...[['action', 'fixe'], ['facile', 'facile'], ['moyen', 'moyen'], ['difficile', 'difficile']].map(([id, quoi]) => ({
    id: `qui-${id}`, titre: 'Qui est qui ? : le rôle d’un acteur', groupe: GROUPES.qui, ecran: ECRAN.qui, poids: 1,
    // Le nom de l’acteur, tel qu’écrit sur la fiche (jamais son rôle).
    titreBilan: (db) => { const [p] = acteurDe(db, quoi); return p ? `Qui est qui ? : ${nomActeur(p, siteEleve(db))}` : null; },
    verifier: (db) => jugerActeur(db, quoi) })),
  { id: 'chaine-debut', titre: 'La chaîne : les 3 premières étapes dans l’ordre', groupe: GROUPES.chaine, ecran: ECRAN.chaine, poids: 1.25,
    verifier: (db) => jugerChaine(db, (v) => debutJuste(v.ordre)) },
  { id: 'chaine-fin', titre: 'La chaîne : les 3 dernières étapes dans l’ordre', groupe: GROUPES.chaine, ecran: ECRAN.chaine, poids: 1.25,
    verifier: (db) => jugerChaine(db, (v) => finJuste(v.ordre)) },
  { id: 'chaine-place', titre: 'La chaîne : où tu travailles', groupe: GROUPES.chaine, ecran: ECRAN.chaine, poids: 1,
    verifier: (db) => jugerChaine(db, (v) => v.place === PLACE_JUSTE) },
  ...['facile', 'moyen', 'difficile'].map((d) => ({
    id: `change-${d}`, titre: 'Ce que je change : ce qui arrive au magasin', groupe: GROUPES.change, ecran: ECRAN.change, poids: POIDS_SITUATION[d],
    // Le rang de la situation sur la fiche de l’élève (l’ordre y est tiré).
    titreBilan: (db) => { const i = situationDe(db, d)[1]; return i >= 0 ? `Ce que je change : la situation n° ${i + 1}` : null; },
    verifier: (db) => jugerSituation(db, d) })),
];
// Pour les tests : l’ordre juste de la chaîne (les clés), sans passer par la page.
export { ORDRE_JUSTE };

// ─────────────────────────────────────────────────────────────── les pastilles d’étape (« fait », jamais « juste »)
export const PASTILLES = [
  { libelle: 'Carte de France', fait: (db) => localiserFini(VUE)(db, ID) },
  { libelle: 'Qui est qui ?', fait: envoyee(FICHES.qui) },
  { libelle: 'La chaîne', fait: envoyee(FICHES.chaine) },
  { libelle: 'Ce que je change', fait: envoyee(FICHES.change) },
];

// ─────────────────────────────────────────────────────────────── les messages du tuteur (au tu ; date du scénario ; jamais juste ni faux)
const mail = (prenom, db, subject, text, o = {}) => { const T = siteEleve(db).tuteur;
  return { folder: 'in', ts: tsScenario(o.heure || '08:00', { db, decalage: o.decalage || 0 }),
    from: T.prenom, fromMail: T.mail, to: prenom, subject, kind: 'text', text, ...(o.extra || {}) }; };

export const VOLET = {
  id: ID_VOLET,
  // L’accueil : texte du brief (§4), proposé par Cowork.
  semer: (prenom, db) => { const S = siteEleve(db), T = S.tuteur;
    return { mails: [mail(prenom, db, `Bienvenue chez ${S.prestataire}`,
      `Bonjour ${prenom}, bienvenue chez ${S.prestataire} à ${S.site} ! Je suis ${T.prenom}, ${T.fonction}, ${T.mot} pour ce stage. `
        + `Ici aussi, on travaille pour Action. Aujourd’hui, montre-moi que tu sais où tu es.\n\n${T.prenom}`)] }; },
  declencheurs: [
    { id: 'qui', quand: localiserFini(VUE), semer: (prenom, db) => ({ mails: [mail(prenom, db, 'Qui est qui ?',
      `Merci, c’est noté. Maintenant, dis-moi le rôle de chaque acteur.\n\n${siteEleve(db).tuteur.prenom}`,
      { decalage: 1, extra: { ouvreFiche: FICHES.qui } })] }) },
    { id: 'chaine', quand: apresFiche(FICHES.qui), semer: (prenom, db) => ({ mails: [mail(prenom, db, 'La chaîne',
      `Merci, c’est noté. Maintenant, remets dans l’ordre le chemin d’un produit, et dis-moi où tu travailles.\n\n${siteEleve(db).tuteur.prenom}`,
      { decalage: 1, extra: { ouvreFiche: FICHES.chaine } })] }) },
    { id: 'change', quand: apresFiche(FICHES.chaine), semer: (prenom, db) => { const S = siteEleve(db);
      return { mails: [mail(prenom, db, 'Ce que je change',
        `Merci, c’est noté. Dernière chose : ce que tu fais ici se voit au magasin de ${S.ville}. Pour chaque situation, choisis ce qui arrive là-bas.\n\n${S.tuteur.prenom}`,
        { decalage: 1, extra: { ouvreFiche: FICHES.change } })] }; } },
    // La fin : texte du brief (§4, étape 4), neutre.
    { id: 'fin', quand: apresFiche(FICHES.change), semer: (prenom, db) => ({ mails: [mail(prenom, db, 'Merci',
      `Merci ${prenom}. Demain, 6 h, à la réception.\n\n${siteEleve(db).tuteur.prenom}`, { decalage: 2 })] }) },
  ],
};

// ─────────────────────────────────────────────────────────────── accueil, options
export const MENTION = 'Réels : Action ; GXO, qui fait tourner l’entrepôt Action d’Onnaing ; Kuehne+Nagel, qui fait tourner celui de '
  + 'Belleville-en-Beaujolais ; les magasins Action de La Sentinelle et de Villefranche-sur-Saône ; le port du Havre. Construit : ton tuteur '
  + 'ou ta tutrice, le trajet du Havre à l’entrepôt puis au magasin, le fait que cet entrepôt livre ce magasin, tous les documents. '
  + 'Les points d’Onnaing, de Belleville et du port sont au centre de la commune ; celui de La Sentinelle, sur la zone du Vignoble.';
export const ACCUEIL = {
  titre: 'Évaluation : se situer dans un nouveau site',
  kpis: ['mail'],
  etapes: [
    ['Lire le message de ton tuteur', 'Menu Messagerie.'],
    ['① La carte de France', 'Place chaque lieu sur la carte : sa région, son département, sa ville.'],
    ['② Qui est qui ?', 'Pour chaque acteur, choisis son rôle.'],
    ['③ La chaîne', 'Remets le chemin d’un produit dans l’ordre, et dis où tu travailles.'],
    ['④ Ce que je change', 'Pour chaque situation, choisis ce qui arrive au magasin.'],
    ['Rendre ma copie', 'Quand tu as fini, clique sur « Rendre ma copie » en haut de l’écran. Une seule remise.'],
    ['Bon à savoir', MENTION],
  ],
};

// L’ordre des écrans de travail (menu « Mon poste » ; le moteur ne montre pas la barre « Étape suivante » en évaluation).
export const SUITE = [
  { vue: 'localiser', libelle: 'Carte de France', fait: localiserFini(VUE) },
  { vue: 'fiche', libelle: 'Qui est qui ?', fait: envoyee(FICHES.qui) },
  { vue: `fiche:${FICHES.chaine}`, libelle: 'La chaîne', fait: envoyee(FICHES.chaine) },
  { vue: `fiche:${FICHES.change}`, libelle: 'Ce que je change', fait: envoyee(FICHES.change) },
];
// Chaque fiche s’ouvre à l’envoi de l’étape d’avant (un écran par étape) : grisée au menu jusque-là, avec la raison. « Qui est qui ? »
// passe par `quand` (comme ENT-8.3 : le menu n’est pas redessiné à la fin de la carte).
export const FERMETURES = {
  [`fiche:${FICHES.chaine}`]: { ouvertSi: envoyee(FICHES.qui), message: 'Après « Qui est qui ? »' },
  [`fiche:${FICHES.change}`]: { ouvertSi: envoyee(FICHES.chaine), message: 'Après « La chaîne »' },
};
export const OPTIONS = {
  suite: SUITE,
  menu: [],
  exercice: 'Évaluation : se situer dans un nouveau site',
  sansTrame: 'Tout se fait à l’écran',
  lexique: {},
  equipe: EQUIPE_85,
  questions: QUESTIONS,
  documents: [DOC_STAGE],
  documentsStyle: STYLE,
  fiches: [FICHE_QUI, FICHE_CHAINE, FICHE_CHANGE],
  localiser: LOCALISER,
  fermetures: FERMETURES,
  pastilles: PASTILLES,
};
