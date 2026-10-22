// ENT-8.12 — Action, « l'inventaire tournant du matin » : le contenu de la séance (brief `docs/briefs/ENT-8.12-action-inventaire-tournant.md` ; décisions
// du chef de chantier : `docs/briefs/COORDINATION-palettier.md` §3, qui passent avant le brief là où elles diffèrent). CAP OL, ENTRAÎNEMENT de CAP-C1.5
// (participer à l'inventaire, C1.5.4). Univers commun : `contenus/action.js` (lu, jamais modifié ici). Données pures (banque des adresses, tirage, entrepôt
// d'un élève, choix de la fiche, phrases) : `contenus/action-ent812-donnees.js`. Activité : `activites/action-inventaire-tournant.js`. Questions :
// `contenus/questions/ENT-8.12.js`. Corrigé : `contenus/corriges/ENT-8.12.js`.
//
// Le lendemain d'ENT-8.11, 6 h (AUCUNE date écrite, décision de Tristan du 21/10/2026), dans la MÊME allée (plan et stock redéclarés, RIEN lu dans la
// base d'ENT-8.11). UN ÉCRAN PAR ÉTAPE (§0 bis d'ENT-8.3) :
//   ① le Plan de l'entrepôt, mode `palettier`, comptage (lot 4 du chantier E-7) : la liste « À compter » (6 adresses, 7 au confirmé), le Terminal qui
//      scanne ; on ouvre l'adresse, on clique son étiquette (le scan), on tape le nombre de cartons, À L'AVEUGLE (le système n'est jamais à l'écran) ;
//      quand le compte ne colle pas, le Terminal propose « Recompter ou confirmer ? » sans dire combien ni dans quel sens ; « Terminer le comptage » ;
//   ② Samia écrit au geste « Terminer le comptage » : la fiche « Mes écarts » s'ouvre. UNE LIGNE PAR ÉCART CONFIRMÉ de l'élève (`ecartsConfirmes`), avec
//      son compte ET le nombre du système, et deux listes : « Que fais-tu ? » et « Ce qui a pu se passer » (deux réponses justes par sens) ;
//   ③ Samia écrit à l'envoi de la fiche ; l'élève répond par PHRASES calculées sur SES comptes (adresses comptées, écarts signalés).
// Après « Terminer le comptage », chaque ligne de la liste dit « ✓ » ou « ✗ compte » (verdict `'critere'`, jamais le nombre réel) ; rien n'est jugé sur la fiche ; le bilan détaillé dit juste / à corriger. « Corriger » rouvre la fiche et les
// phrases, jamais le comptage (figé à « Terminer », `finFige`).
//
// LA FICHE ET SES JALONS (décision du chef de chantier, 22/10/2026) : la fiche est une fonction de la base (`blocs(db)`), donc calculée sur une base VIDE
// au chargement (zéro ligne) : les jalons ne peuvent pas être dérivés de ses blocs. La séance les DÉCLARE elle-même, à ids fixes (comme ENT-8.11 pour sa
// fiche, ENT-5.5 pour les siens) : `fiche-signaler` (3 points : TOUTES les lignes de SA fiche disent « je le signale à Samia ») et `fiche-cause` (2 points :
// toutes les lignes ont une cause juste POUR LEUR SENS). Une fiche sans ligne (aucun écart confirmé) : les deux faux. Une ligne de trop (un compte faux
// confirmé sur une adresse conforme) est jugée comme les autres : son erreur est déjà payée au jalon `compte-`. La ligne de la 7e adresse du confirmé n'est PAS jugée
// (bonus : il ne retire rien au socle). Les valeurs sont rangées par rang de la
// liste de comptage : `faire-<rang>` et `cause-<rang>` dans `db.fiches.ecarts.valeurs`.
//
// VÉRIFIÉ : voir l'en-tête de `contenus/action-ent812-donnees.js`. CONSTRUIT : `MENTION` (dit dans la séance), Samia, le Terminal, les adresses, les stocks
// du système, les écarts et leurs causes.

import { apresFiche, apresGeste, apresMail } from '../core/declencheurs.js';
import { etapesPalettier, ecartsConfirmes, etatComptage, pileCartons } from '../core/types/entrepot.js';
import { phrasesJustes } from '../core/phrases.js';
import { QUESTIONS } from './questions/ENT-8.12.js';
import { ENTREPRISE as ENT_ACTION, EQUIPE, LEXIQUE, STYLE_DOCUMENTS, PIED, ech } from './action.js';
import { svgEtiquette } from './action-ent811.js';
import {
  ID, ID_VOLET, ENTREPOT_ID, FICHE_ID, PHRASES_ID, SUJETS, SAMIA_MAIL, GESTE, jeuDeBase, entrepotDe, FAIRE, FAIRE_JUSTE, CAUSES, causesJustes, melangerPour,
  SALUTATIONS, finsDe, choixBilan, MENTION_ALLEE, PRODUITS,
} from './action-ent812-donnees.js';

export { ID, ENTREPOT_ID, FICHE_ID, PHRASES_ID };

export const ENTREPRISE = { ...ENT_ACTION, exercice: 'Bienvenue chez Geodis' };

// ─────────────────────────────────────────────────────────────── l'heure du scénario : « le lendemain, 6 h », sans date
// Aucune date n'est écrite (ni dans les textes, ni dans un document) ; la Messagerie affiche pourtant l'horodatage de chaque message : on prend le DERNIER
// MERCREDI (le lendemain du mardi d'ENT-8.11 ; aujourd'hui si on est mercredi) à l'heure du scénario, plus le temps réellement passé depuis l'ouverture.
// (Même compromis qu'ENT-8.11, dit à Tristan.)
export function tsScenario(hhmm, { db, decalage = 0 } = {}) {
  const [h, mn] = hhmm.split(':').map(Number);
  const d = new Date();
  d.setDate(d.getDate() - ((d.getDay() + 7 - 3) % 7));
  d.setHours(h, mn, 0, 0);
  const ouvert = (db && db.volets && db.volets[ID_VOLET]) || 0;
  const ecoule = ouvert ? Math.max(0, Date.now() - ouvert) : 0;
  return d.getTime() + ecoule + decalage * 60000;
}

// ─────────────────────────────────────────────────────────────── lectures de la base
const fiche = (db, id) => (db && db.fiches && db.fiches[id]) || null;
export const envoyee = (db, id) => !!(fiche(db, id) && fiche(db, id).envoye);
export const valeurDe = (db, id, bloc) => ((fiche(db, id) || {}).valeurs || {})[bloc];
export const dejaEnvoyee = (id) => (db) => envoyee(db, id);
export const ecartsDe = (db) => ecartsConfirmes(db, entrepotDe);
export const comptageFini = (db) => !!etatComptage(db, entrepotDe).fini;
export const nbComptees = (db) => Object.keys(etatComptage(db, entrepotDe).comptes).length;
const reponduSamia = (db) => phrasesJustes(db, PHRASES_ID).envoye;
const ok = { status: 'ok' }, ko = { status: 'ko' }, attente = { status: 'attente' };
const court = (k) => PRODUITS[k].court;

// ─────────────────────────────────────────────────────────────── les documents (dessins en traits, construits ; aucune image nouvelle)
const PIED_DESSIN = `Dessin construit pour l’exercice. ${MENTION_ALLEE}`;
const T = 'fill="none" stroke="#2b2824" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"';
const TXT = 'stroke="none" fill="#2b2824"';
// Une palette de cartons dessinée comme à l'écran de comptage (`pileCartons`) ; le texte de remplacement ne dit aucun nombre.
const pile = (dims, ecart) => `<div class="ac812-pile">${pileCartons(dims, ecart, 'Une palette de cartons empilés, vue en perspective')}</div>`;
// Une étiquette de carton : le nom du produit et « Carton de 12 » (le produit d'ENT-8.11 qui a 12 articles par carton : les bougies).
const SVG_CARTON = `<svg class="ac811-fig" viewBox="0 0 380 210" role="img" aria-label="Une face de carton portant une étiquette : Bougies parfumées, carton de 12, et un code-barres">
  <g ${T}><rect x="14" y="14" width="352" height="182" rx="4"/><path d="M14 56 H366" stroke-width="1.4"/>
    <rect x="48" y="76" width="284" height="108" rx="3" fill="#fdfbf7"/></g>
  <text x="190" y="42" font-size="14" text-anchor="middle" ${TXT}>Haut de carton</text>
  <text x="190" y="108" font-size="22" font-weight="800" text-anchor="middle" ${TXT}>Bougies parfumées</text>
  <text x="190" y="138" font-size="18" font-weight="700" text-anchor="middle" ${TXT}>Carton de 12</text>
  <g fill="#2b2824" stroke="none">${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13].map((i) => `<rect x="${108 + i * 12}" y="150" width="${i % 3 === 0 ? 7 : 4}" height="22"/>`).join('')}</g></svg>`;
const dessin = (id, titre, corps, pied = PIED_DESSIN) => ({ id, titre, court: titre, html: `<article class="ac-doc" aria-label="${ech(titre)}">${corps}${PIED(pied)}</article>` });
const DOC_COUCHES = dessin('couches', 'Une palette de cartons', pile([3, 3, 3], 0));
const DOC_COUCHE_DESSUS = dessin('couche-dessus', 'Le haut d’une palette', pile([2, 3, 4], -3));
const DOC_CARTON = dessin('carton', 'Un carton', SVG_CARTON, 'Dessin construit pour l’exercice.');
const DOC_ETIQUETTE = dessin('etiquette', 'Une étiquette', svgEtiquette('A1-T02-N3-E1'));
const DOC_MATIN = { id: 'matin', titre: 'Ton matin à l’inventaire', court: 'Ton matin',
  html: `<article class="ac-doc" aria-label="Ton matin à l’inventaire">
    <p class="ac-t">Ton matin à l’inventaire</p>
    <p class="ac-st">Le lendemain, 6 h</p>
    <p>Tu es toujours en stage chez <b>Geodis</b>, à l’entrepôt Action d’Ensuès-la-Redonne. Hier, tu as rangé le camion dans l’allée.</p>
    <p>Ce matin, avant les préparateurs, l’équipe compte quelques adresses de l’allée : c’est l’<b>[[inventaire tournant]]</b>.</p>
    <p>Ta [[tutrice]] : <b>Samia</b>, cheffe d’équipe. Tu comptes avec le <b>Terminal</b>.</p>
    ${PIED('Samia est construite pour l’exercice.')}
  </article>` };
// À gauche de la fiche : SES écarts confirmés, avec son compte et — maintenant seulement — le nombre du système. Calculé à chaque dessin.
const DOC_ECARTS = { id: 'ecarts-doc', titre: 'Mes comptes et le système', court: 'Mes écarts',
  html: (db) => {
    const E = ecartsDe(db);
    return `<article class="ac-doc" aria-label="Mes comptes et le système">
      <p class="ac-t">Mes comptes et le système</p>
      <p class="ac-st">Les adresses où ton compte ne colle pas avec le système.</p>
      ${E.length ? `<table class="ac812-tab"><thead><tr><th>Adresse</th><th>Produit</th><th>Ton compte</th><th>Le système</th></tr></thead><tbody>${E.map((e) => `<tr>
        <td><b>${ech(e.adresse)}</b></td><td>${ech(e.produit)}</td><td>${e.compte}</td><td>${e.systeme}</td></tr>`).join('')}</tbody></table>`
        : '<p>Sur toutes les adresses que tu as comptées, ton compte est le même que celui du système.</p>'}
      ${PIED('Les nombres du système et les écarts sont construits pour l’exercice.')}
    </article>`;
  } };

export const STYLE = `${STYLE_DOCUMENTS}
.ac811-fig{display:block; width:100%; max-width:440px; height:auto; margin:4px auto 10px; color:#2b2824}
.ac811-fig text{font-family:inherit}
.ac812-pile{margin:6px auto 4px; max-width:300px}
.ac812-pile svg{display:block; width:100%; height:auto; max-height:260px}
.ac812-tab{width:100%; border-collapse:collapse; margin:4px 0 8px; font-size:.92rem}
.ac812-tab th,.ac812-tab td{border:1px solid #cdc7b9; padding:4px 8px; text-align:left}
.ac812-tab td:first-child{white-space:nowrap}
.ac812-tab th{font-size:.8rem; color:var(--douce); font-weight:700}
`;
export const DOCUMENTS = [DOC_MATIN, DOC_COUCHES, DOC_COUCHE_DESSUS, DOC_CARTON, DOC_ETIQUETTE, DOC_ECARTS];

// ─────────────────────────────────────────────────────────────── ② la fiche « Mes écarts » : une ligne par écart confirmé de l'élève
const titreLigne = (e) => `${e.adresse} · ${e.produit} : tu as compté ${e.compte}, le système dit ${e.systeme}`;
export const FICHE = {
  id: FICHE_ID, libelle: 'Mes écarts', titre: 'Mes écarts',
  sousTitre: 'À gauche : tes comptes et ceux du système. Pour chaque [[écart]], dis ce que tu fais et ce qui a pu se passer.',
  documents: ['ecarts-doc'], largeurDocs: 0.9,
  bouton: 'Ouvrir la fiche « Mes écarts »',
  quand: comptageFini,
  blocs: (db) => {
    const E = ecartsDe(db);
    if (!E.length) return [{ type: 'encadre', titre: 'Aucun écart', texte: 'Sur les adresses que tu as comptées, aucun écart avec le système : il n’y a rien à ajouter. Envoie la fiche à Samia.' }];
    return E.map((e) => ({ type: 'cadre', titre: titreLigne(e), blocs: [
      { type: 'liste', id: `faire-${e.rang}`, lib: 'Que fais-tu ?', vide: 'Choisir…', manque: `ce que tu fais pour ${e.adresse}`,
        choix: melangerPour(db, `faire-${e.rang}`, FAIRE) },
      { type: 'liste', id: `cause-${e.rang}`, lib: 'Ce qui a pu se passer', vide: 'Choisir…', manque: `ce qui a pu se passer à ${e.adresse}`,
        choix: melangerPour(db, `cause-${e.rang}`, CAUSES[e.sens].map((c) => ({ v: c.v, lib: c.lib }))) },
    ] }));
  },
  envoi: { bouton: 'Envoyer à Samia', a: 'Samia', suite: 'Regarde tes messages.' },
};

// ─────────────────────────────────────────────────────────────── ③ les phrases du compte rendu, calculées UNE FOIS, à l'arrivée du message de Samia
export const phrasesSamia = (prenom) => ({ id: PHRASES_ID, melanger: true, lignes: [
  { id: 'salutation', choix: SALUTATIONS.slice(), juste: 0 },
  { id: 'bilan', choix: (d) => choixBilan(nbComptees(d), ecartsDe(d).length), juste: 0 },
  { id: 'fin', choix: finsDe(prenom), juste: 0 },
] });

// ─────────────────────────────────────────────────────────────── les messages (au tu ; jamais juste ni faux ; aucune date)
const SAMIA = { nom: EQUIPE.samia.nom, mail: SAMIA_MAIL };
const mail = (qui, prenom, subject, text, o = {}) => ({ folder: 'in', ts: tsScenario(o.heure || '06:00', { db: o.db, decalage: o.decalage || 0 }),
  from: qui.nom, fromMail: qui.mail, to: prenom, subject, kind: 'text', text, ...(o.extra || {}) });
export const ACCUEIL_SAMIA = 'Hier, tu as rangé le camion dans cette allée. Ce matin, avant les préparateurs, on compte quelques adresses de l’allée avec le Terminal. '
  + 'Tu ne verras pas ce que dit le système : tu comptes ce que tu vois.';
export const ECARTS_SAMIA = 'Pour chaque écart, dis-moi ce que tu fais, et ce qui a pu se passer.';
export const BILAN_SAMIA = 'Merci. Un mot pour finir : combien d’adresses comptées, combien d’écarts ?';
export const FIN_SAMIA = 'Je fais vérifier.';
export const VOLET = {
  id: ID_VOLET,
  semer: (prenom) => ({ mails: [mail(SAMIA, prenom, SUJETS.accueil,
    `Bonjour ${prenom} ! ${ACCUEIL_SAMIA.replace('on compte', 'on fait l’[[inventaire tournant]] : on compte')}\n\n`
      + 'Ouvre le Plan de l’entrepôt, la liste « À compter » est à droite : ouvre chaque adresse, clique son étiquette pour la scanner, puis compte les cartons de la [[couche]] et tape le nombre au Terminal.\n\nSamia',
    { heure: '06:00' })] }),
  corrections: {
    [FICHE_ID]: (prenom, n, db) => ({ mails: [mail(SAMIA, prenom, 'Bien reçu', 'Bien reçu, merci.\n\nSamia', { db, heure: '06:40' })] }),
    [PHRASES_ID]: (prenom, n, db) => ({ mails: [mail(SAMIA, prenom, 'Bien reçu', 'Bien reçu.\n\nSamia', { db, heure: '06:40' })] }),
  },
  declencheurs: [
    // « Terminer le comptage » (au geste, quel que soit ce qui a été compté) : la fiche des écarts s'ouvre.
    { id: 'ecarts', quand: apresGeste(GESTE('compte:fin')),
      semer: (prenom, db) => ({ mails: [mail(SAMIA, prenom, SUJETS.ecarts, `${ECARTS_SAMIA}\n\nLes [[écart|écarts]] sont dans la fiche « Mes écarts » : ton compte, et maintenant le nombre du système.\n\nSamia`,
        { db, heure: '06:20', extra: { ouvreFiche: FICHE_ID } })] }) },
    // La fiche envoyée (juste ou non) : un mot pour finir, par phrases calculées sur ses comptes.
    { id: 'bilan', quand: apresFiche(FICHE_ID),
      semer: (prenom, db) => ({ mails: [mail(SAMIA, prenom, SUJETS.bilan, `${BILAN_SAMIA}\n\nClique sur « Répondre » et choisis une phrase par ligne.\n\nSamia`,
        { db, heure: '06:30', extra: { phrases: phrasesSamia(prenom) } })] }) },
    { id: 'fin', quand: apresMail({ a: SAMIA_MAIL }),
      semer: (prenom, db) => ({ mails: [mail(SAMIA, prenom, SUJETS.fin, `Merci ${prenom}. ${FIN_SAMIA}\n\nSamia`, { db, heure: '06:35' })] }) },
  ],
};

// ─────────────────────────────────────────────────────────────── les jalons (poids validés par Tristan le 21/10/2026, brief §5)
// 16 points de jalons + 4 de questions (`part: 4`) = 20. Rien n'est vrai avant « Terminer le comptage » (comptes) ni avant l'envoi (fiche, phrases) : l'inaction
// vaut 0. Les comptes valent 5/6 de point chacun (option (a) de Tristan, 21/10, 18 h 08 : 6 × 5/6 = 5) ; les `recompte-ok-*` (adresses conformes) et ceux du
// confirmé n'ont pas de poids (la règle du recomptage ne pèse que les deux adresses à écart, par rôle).
export const GROUPES = { scan: 'Scanner avant de compter', compter: 'Compter les cartons', recompter: 'Recompter quand ça ne colle pas',
  signaler: 'Signaler sans corriger soi-même', cause: 'Une cause possible', forme: 'Le compte rendu à Samia' };
export const POIDS = { scanAvant: 2, ...Object.fromEntries([1, 2, 3, 4, 5, 6].map((r) => [`compte-${r}`, 5 / 6])), 'recompte-manque': 1.5, 'recompte-surplus': 1.5,
  'fiche-signaler': 3, 'fiche-cause': 2, 'samia-forme': 1 };
const OK_IDS = ['ok1', 'ok2', 'ok3', 'ok4'];
const ORDRE = ['scanAvant', ...[1, 2, 3, 4, 5, 6].map((r) => `compte-${r}`), 'recompte-manque', 'recompte-surplus', ...OK_IDS.map((c) => `recompte-${c}`)];
const ORDRE_BONUS = ['compte-7', 'recompte-bonus'];
// La ligne de la liste de l'élève (son adresse et son produit) : pour les titres du bilan, jamais pour le titre commun.
const ligneDe = (db, rang) => (rang === 7 ? jeuDeBase(db).bonus : jeuDeBase(db).liste[rang - 1]);
const ligneRole = (db, role) => jeuDeBase(db).liste.find((x) => x.role === role);
const nom = (x) => `${x.adresse} (${court(x.produit)})`;
function jalonsComptage() {
  const L = etapesPalettier(entrepotDe);
  const socle = L.filter((e) => !e.bonus), bonus = L.filter((e) => e.bonus);
  const ids = socle.map((e) => e.id), idsB = bonus.map((e) => e.id);
  const manque = ORDRE.filter((id) => !ids.includes(id)), deTrop = ids.filter((id) => !ORDRE.includes(id));
  const manqueB = ORDRE_BONUS.filter((id) => !idsB.includes(id)), deTropB = idsB.filter((id) => !ORDRE_BONUS.includes(id));
  if (manque.length || deTrop.length || manqueB.length || deTropB.length) {
    throw new Error(`ENT-8.12 : les jalons du comptage ne sont pas ceux attendus (manquent : ${[...manque, ...manqueB].join(', ') || '—'} ; en trop : ${[...deTrop, ...deTropB].join(', ') || '—'})`
      + ' — le comptage (lot 4 du chantier E-7) est-il livré ?');
  }
  const S = ORDRE.map((id) => {
    const e = socle.find((x) => x.id === id);
    if (id === 'scanAvant') return Object.assign(e, { titre: 'Scanner l’adresse avant de compter', titreBilan: 'Scanner l’adresse avant de compter', groupe: GROUPES.scan, poids: POIDS[id] });
    const m = /^compte-(\d)$/.exec(id);
    if (m) {
      const r = Number(m[1]);
      return Object.assign(e, { titre: `Compter l’adresse n° ${r}`, titreBilan: (db) => `Compter ${nom(ligneDe(db, r))}`, groupe: GROUPES.compter, poids: POIDS[id] });
    }
    if (id === 'recompte-manque' || id === 'recompte-surplus') {
      const role = id.slice(9);
      return Object.assign(e, { titre: `Recompter l’adresse ${role === 'manque' ? 'au manque' : 'au surplus'} quand le Terminal le propose`,
        titreBilan: (db) => `Recompter ${nom(ligneRole(db, role))} quand le Terminal le propose`, groupe: GROUPES.recompter, poids: POIDS[id] });
    }
    // Les recomptes des adresses conformes : jugés (la séance est finie quand tout est jugé), sans point ni ligne au bandeau.
    return Object.assign(e, { titre: `Recompter l’adresse conforme n° ${id.slice(-1)} (sans point)`, poids: 0, compte: false });
  });
  const B = bonus.map((e) => Object.assign(e, { titre: e.id === 'compte-7' ? 'Compter la 7e adresse (bonus)' : 'Recompter la 7e adresse (bonus)' }));
  return { S, B };
}
const COMPTAGE = jalonsComptage();
// Les lignes de la fiche que les jalons du SOCLE jugent : celles des six adresses de tous. La ligne de la 7e adresse du confirmé (un second manque) est dans
// sa fiche mais n'est jamais jugée : un bonus ne retire rien à la note du socle.
const jugees = (db) => ecartsDe(db).filter((e) => e.rang <= 6);
const aucune = (db) => !jugees(db).length;
export const ETAPES = [
  ...COMPTAGE.S,
  // Les jalons de la fiche, déclarés ICI (la fiche est une fonction de la base : voir l'en-tête) ; jugés sur SES écarts confirmés, jamais sur les écarts réels.
  { id: 'fiche-signaler', titre: 'Signaler chaque écart à Samia', groupe: GROUPES.signaler, poids: POIDS['fiche-signaler'], ecran: `fiche:${FICHE_ID}`,
    titreBilan: 'Signaler à Samia chaque écart de ta fiche, sans corriger le stock toi-même',
    verifier(db) {
      if (!envoyee(db, FICHE_ID)) return attente;
      if (aucune(db)) return ko;
      return jugees(db).every((e) => valeurDe(db, FICHE_ID, `faire-${e.rang}`) === FAIRE_JUSTE) ? ok : ko;
    } },
  { id: 'fiche-cause', titre: 'Une cause possible pour chaque écart', groupe: GROUPES.cause, poids: POIDS['fiche-cause'], ecran: `fiche:${FICHE_ID}`,
    titreBilan: 'Une cause possible pour chaque écart de ta fiche, selon le sens de l’écart',
    verifier(db) {
      if (!envoyee(db, FICHE_ID)) return attente;
      if (aucune(db)) return ko;
      return jugees(db).every((e) => causesJustes(e.sens).includes(valeurDe(db, FICHE_ID, `cause-${e.rang}`))) ? ok : ko;
    } },
  { id: 'samia-forme', titre: 'Le compte rendu à Samia : la salutation et la fin', groupe: GROUPES.forme, poids: POIDS['samia-forme'], ecran: `phrases:${PHRASES_ID}`,
    verifier(db) { const r = phrasesJustes(db, PHRASES_ID); if (!r.envoye) return attente; return ['salutation', 'fin'].every((l) => r.justes.includes(l)) ? ok : ko; } },
  ...COMPTAGE.B,
];

// ─────────────────────────────────────────────────────────────── l'ordre des écrans, lexique, accueil, options
export const SUITE = [
  { vue: 'entrepot', libelle: 'Compter les adresses', fait: comptageFini },
  { vue: 'fiche', libelle: 'Signaler les écarts à Samia', fait: dejaEnvoyee(FICHE_ID) },
  { vue: 'mail', mail: PHRASES_ID, libelle: 'Rendre compte à Samia', fait: reponduSamia },
];
// Les mots du brief (§4, « Mots cliquables ») ; définitions neutres CONSTRUITES par Claude Code (à relire).
export const LEXIQUE_812 = {
  ...LEXIQUE,
  'inventaire tournant': 'Compter chaque jour une petite partie du stock, au lieu de tout compter une seule fois dans l’année.',
  'à l’aveugle': 'Compter sans voir le nombre que le système attend, pour ne pas être influencé.',
  écart: 'La différence entre ce que tu comptes et ce que dit le système.',
  recompter: 'Compter une deuxième fois quand le nombre ne colle pas, avant de dire que c’est vraiment différent.',
  couche: 'Une rangée de cartons posés à plat sur la palette. Une palette en a plusieurs, les unes sur les autres.',
  carton: 'La boîte en carton qui contient les articles. Une palette porte plusieurs cartons.',
  inventoriste: 'Personne dont le métier est de compter le stock.',
};
export const MENTION = 'Réels : Action, Geodis (qui fait tourner l’entrepôt d’Ensuès-la-Redonne pour Action), les catégories de produits d’Action, le principe de '
  + 'l’inventaire tournant. Construits pour l’exercice : comment Geodis compte à Ensuès (rien n’est publié), l’allée, les adresses, le stock du système et les '
  + 'écarts, Samia, le Terminal et ses messages.';
export const ACCUEIL = {
  titre: 'L’inventaire tournant',
  kpis: ['mail'],
  etapes: [
    ['Lire le message de Samia', 'Menu Messagerie.'],
    ['① Compter les adresses', 'Plan de l’entrepôt : ouvre chaque adresse de la liste, clique son étiquette pour la scanner, compte les cartons et tape le nombre au Terminal.'],
    ['② Signaler les écarts à Samia', 'La fiche « Mes écarts » : ce que tu fais, et ce qui a pu se passer.'],
    ['③ Rendre compte', 'Samia t’écrit quand ta fiche est envoyée. Une phrase par ligne.'],
    ['Bon à savoir', MENTION],
  ],
};
export const FIN_FIGE = 'Ton comptage est terminé : il ne se refait pas.';

export const OPTIONS = {
  menu: [],
  exercice: 'Séance 12 : l’inventaire tournant, le lendemain du rangement, dans la même allée',
  sansTrame: 'Tout se fait à l’écran',
  lexique: LEXIQUE_812,
  documents: DOCUMENTS,
  documentsStyle: STYLE,
  fiche: FICHE,
  entrepot: entrepotDe,
  suite: SUITE,
  equipe: EQUIPE,
  questions: QUESTIONS,
  finFige: FIN_FIGE,
};
