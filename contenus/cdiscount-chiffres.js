// Cdiscount — ENT-2.2 « Ce que disent les chiffres ». Guidage du GESTE TABLEUR, C1.6.
// Écrite le 04/10/2026 (brief `docs/briefs/ENT-2.2-ce-que-disent-les-chiffres.md`, chantier C6).
//
// À la fin d'ENT-2.1, Nadia a dit : « une erreur sur un article, il y en a peut-être d'autres ».
// Le stock affiché EST la somme des mouvements : le recalculer ne montrerait rien. Le signal, ce
// sont les constats des préparateurs : chaque ligne de bon de préparation porte le stock du
// logiciel et le « stock trouvé » au rayon. L'élève EXPORTE ces lignes (écran Extractions), calcule
// l'écart, isole les références en écart (SI), compte les constats par référence (NB.SI), DÉPOSE
// son fichier (menu Fichiers, retour détaillé : c'est du guidage), puis écrit à Nadia les
// références à recompter. ENT-2.3 recomptera sa liste.
//
// MÊME ALLÉE A QU'ENT-2.3, DEUX JOURS AVANT : commandes, réceptions, réintégration, démarque et
// « stock trouvé » viennent de `contenus/cdiscount-inventaire.js` (`periode`), jamais recopiés. Ce
// qui se passe les deux derniers jours d'ENT-2.3 n'est pas encore arrivé ici. S'y ajoutent dix
// commandes plus anciennes (avant le dernier inventaire), SANS écart : l'export couvre le mois.
//
// Les constats (stock trouvé ≠ stock logiciel), calculés par le code : CHG-20W 3, CAB-USBC-1M 2,
// COQ-UNI-01 2, BAT-10K 1 — quatre références sur huit, la bonne liste.
//
// Niveau (`db.aisance`, jamais montré) : un CONFIRMÉ exporte toute l'allée (A-01 à A-06, 12
// références, 45 lignes) au lieu de A-01 à A-04 (8 références, 30 lignes). Mêmes constats, même
// bonne liste, même mission.
//
// Tout est CONSTRUIT (voir l'en-tête de `contenus/cdiscount.js`) : l'export, les constats, les
// préparateurs. Le geste « exporter, retravailler dans un tableur, décider » est réel (référentiel
// 2025, savoirs « maniement d'un tableur professionnel, d'un WMS »).

import { EQUIPE, mailBienvenue, lignesPreparation, sousCatalogue, preparationsAEcarter, refsAllees, filtreAllee } from './cdiscount.js';
import * as I from './cdiscount-inventaire.js';
import { resultatDepot, statutExport } from '../core/types/export-tableur.js';
import { ligne, nrm } from '../core/declencheurs.js';

export const CATALOGUE = I.CATALOGUE;
export const TYPES = I.TYPES;
const [CAB, CHG, ECO, SOU, BAT, CLE, AMP, COQ, CAS, SUP, CLA, HUB] = I.MODELES;
const A01_A04 = I.MODELES.slice(0, 8);

const JOUR = 3600e3 * 24;
const minuit = (t) => { const d = new Date(t); d.setHours(0, 0, 0, 0); return d.getTime(); };
// Les dates d'ENT-2.3 sont comptées depuis SON jour ; ENT-2.2 a lieu deux jours avant.
const DECALAGE = 2;
const quand = (now, j, h) => minuit(now) - (j - DECALAGE) * JOUR + Math.round(h * 3600e3);

/* ------------------------------------------------------------------ les commandes plus anciennes */

// Dix commandes entre J-19 et J-11 (jours d'ENT-2.3), AVANT le dernier inventaire : préparées sans
// écart (le stock du système était juste). Elles donnent à l'export son mois entier.
export const COMMANDES_ANCIENNES = [
  { no: 'CMD-731905', client: 'C0014', ship: 'COL', j: 19, h: 10, lignes: [[CAB, 2], [SOU, 1]] },
  { no: 'CMD-731918', client: 'C0016', ship: 'REL', j: 18, h: 14, lignes: [[CHG, 1], [CAS, 1]] },
  { no: 'CMD-731924', client: 'C0018', ship: 'COL', j: 17, h: 9.5, lignes: [[ECO, 1], [SUP, 1]] },
  { no: 'CMD-731937', client: 'C0020', ship: 'CHR', j: 16, h: 15, lignes: [[BAT, 1], [CLE, 1]] },
  { no: 'CMD-731942', client: 'C0003', ship: 'REL', j: 15, h: 11, lignes: [[AMP, 2], [HUB, 1]] },
  { no: 'CMD-731956', client: 'C0010', ship: 'COL', j: 14, h: 16, lignes: [[COQ, 1], [CLA, 1]] },
  { no: 'CMD-731963', client: 'C0006', ship: 'COL', j: 13, h: 10, lignes: [[CAB, 1], [SUP, 2]] },
  { no: 'CMD-731971', client: 'C0012', ship: 'REL', j: 12, h: 13, lignes: [[CHG, 2]] },
  { no: 'CMD-731980', client: 'C0001', ship: 'CHR', j: 12, h: 16.5, lignes: [[ECO, 1], [CAS, 1]] },
  { no: 'CMD-731986', client: 'C0009', ship: 'COL', j: 11, h: 11, lignes: [[SOU, 1], [HUB, 1]] },
];

// Le stock en début de mois : celui du dernier inventaire, plus ce que les commandes anciennes
// ont fait sortir avant lui.
export const STOCK_DEBUT_MOIS = (() => {
  const s = { ...I.INVENTAIRE_PRECEDENT };
  COMMANDES_ANCIENNES.forEach((c) => c.lignes.forEach(([sku, q]) => { s[sku] += q; }));
  return s;
})();

export const VOLUME = { references: 12, documents: 28, mouvements: 52 };

/* ------------------------------------------------------------------ la période */

// La période de la séance pour une date d'ouverture : les commandes anciennes, puis celles
// d'ENT-2.3 arrivées avant aujourd'hui (les deux derniers jours d'ENT-2.3 n'ont pas eu lieu).
export function periodeChiffres(now = Date.now()) {
  const P = I.periode(now + DECALAGE * JOUR, I.INVENTAIRE_PRECEDENT);
  const avant = (t) => t < minuit(now);
  const mouvements = [];
  const orders = [];
  const courant = { ...STOCK_DEBUT_MOIS };
  COMMANDES_ANCIENNES.forEach((c, i) => {
    const ts = quand(now, c.j, c.h);
    const rows = {};
    const par = I.PREPARATEURS[(i + 1) % I.PREPARATEURS.length];
    c.lignes.forEach(([s, q]) => {
      // Avant l'inventaire, aucun écart : le préparateur trouve le stock du système.
      rows[s] = { seen: courant[s], loc: CATALOGUE.VM[s].loc, qty: q, status: 'ok' };
      courant[s] -= q;
      mouvements.push({ sku: s, type: TYPES.preparation, delta: -q, ref: I.bp(c.no), ts, by: par });
    });
    orders.push({ no: c.no, date: ts - 3600e3 * 5, customerId: c.client, ship: c.ship,
      lines: c.lignes.map(([s, q]) => ({ sku: s, qty: q })),
      prep: { rows, doc: true, validated: true, complete: true, at: ts, par } });
  });
  P.mouvements.filter((m) => avant(m.ts)).forEach((m) => mouvements.push(m));
  P.orders.filter((o) => avant(o.prep.at)).forEach((o) => orders.push(o));
  mouvements.sort((a, b) => a.ts - b.ts);
  orders.sort((a, b) => a.prep.at - b.prep.at);
  return { receptions: P.receptions.filter((r) => avant(r.ts)), orders, mouvements, tRet: P.tRet, tCas: P.tCas, tRei: P.tRei };
}

/* ------------------------------------------------------------------ l'export et les contrôles */

export const ID_EXPORT = 'preparations';
export const ID_DEPOT = 'analyse';
export const COLONNES = ['Date', 'N° bon', 'Commande', 'Référence', 'Désignation', 'Emplacement',
  'Qté préparée', 'Stock logiciel', 'Stock trouvé', 'Préparateur'];

const estConfirme = (db) => !!db && db.aisance === 'confirme';
// Les références de l'export de CET élève : A-01 à A-04, ou toute l'allée pour un confirmé.
export const refsExport = (db) => (estConfirme(db) ? I.MODELES : A01_A04);
export const lignesExport = (db) => lignesPreparation(db, CATALOGUE, (o, sku) => refsExport(db).includes(sku));
const versLigne = (p) => [p.ts, p.bon, p.commande, p.sku, p.designation, p.emplacement, p.qty, p.logiciel, p.trouve, p.preparateur];

// Les constats de l'export (calculés, jamais en dur) : référence → nombre de lignes en écart. Ceux
// de la demande, ou ceux de l'export que l'élève a réellement fait (`propres`, objets colonne →
// valeur) : une erreur d'export ne se paie qu'une fois.
export function constats(db, propres = null) {
  const L = propres ? propres.map((o) => ({ sku: o['Référence'], trouve: o['Stock trouvé'], logiciel: o['Stock logiciel'] })) : lignesExport(db);
  return Object.fromEntries(refsExport(db).map((r) => [r, L.filter((p) => p.sku === r && p.trouve !== p.logiciel).length]));
}

// Les lignes à écarter de la liste d'extraction : les allées B et C dans le mois, l'allée A avant.
const PREPARATEURS_VOISINS = ['Yanis Cazenave', 'Inès Lagarde', 'Sofiane Brettes'];
export const aujourdhui = (db) => (db && db.created) || Date.now();
export function lignesAEcarter(db) {
  const now = aujourdhui(db);
  return [
    ...preparationsAEcarter('ent22-autres-allees', { refs: refsAllees(['B', 'C']), jours: [1, 20], n: 12, now, numero: 739101, preparateurs: PREPARATEURS_VOISINS }),
    ...preparationsAEcarter('ent22-mois-precedent', { refs: refsExport(db), jours: [32, 45], n: 8, now, numero: 728101, preparateurs: PREPARATEURS_VOISINS }),
  ].map(versLigne);
}
export const refsEnEcart = (db) => Object.entries(constats(db)).filter(([, n]) => n > 0).map(([r]) => r);

export const AIDE = 'SI(test ; si vrai ; si faux) — NB.SI(plage ; ce qu\'on compte). Une formule commence par = .';

export function controles(db, propres = null) {
  return [
    { type: 'colonne', id: 'ecart', libelle: 'Colonne « Écart » (stock trouvé − stock logiciel)', feuille: 'Préparations',
      titre: 'Écart', cle: ['N° bon', 'Référence'], attendu: (l) => l['Stock trouvé'] - l['Stock logiciel'], formule: true },
    { type: 'colonne', id: 'si', libelle: 'Colonne « Réf. en écart » (fonction SI)', feuille: 'Préparations',
      titre: 'Réf. en écart', cle: ['N° bon', 'Référence'],
      attendu: (l) => (l['Stock trouvé'] !== l['Stock logiciel'] ? l['Référence'] : ''), fonctions: ['IF'] },
    { type: 'table', id: 'synthese', libelle: 'Synthèse : nombre de constats par référence (fonction NB.SI)', feuille: 'Synthèse',
      cle: 'Référence', colonne: 'Nb constats', attendu: constats(db, propres), fonctions: ['COUNTIF'] },
  ];
}

export const TABLEUR = {
  aide: AIDE,
  exports: [{
    id: ID_EXPORT, liste: 'Lignes de préparation', fichier: 'cdiscount-lignes-de-preparation.xlsx',
    // Niveau 1 (guidage) : les critères de la demande sont déjà réglés ; la trame dit pourquoi.
    indications: 1, autres: lignesAEcarter, aujourdhui,
    filtres: [filtreAllee('A'), { id: 'periode', libelle: 'Période', periode: 'Date', juste: '30j' }],
    feuilles: [{
      nom: 'Préparations', colonnes: COLONNES, types: { Date: 'date' },
      lignes: (db) => lignesExport(db).map(versLigne),
    }, {
      // L'amorce de la synthèse (guidage) : les références déjà écrites, la colonne à remplir.
      nom: 'Synthèse', colonnes: ['Référence', 'Nb constats'],
      lignes: (db) => refsExport(db).map((r) => [r, null]),
    }],
  }],
  depot: { id: ID_DEPOT, export: ID_EXPORT, libelle: 'Déposer mon fichier', retour: 'guidage', controles },
};

/* ------------------------------------------------------------------ base et volet */

export const EXERCICE = 'Exercice 2 : ce que disent les chiffres';

export const ACCUEIL = {
  titre: 'Des chiffres à la décision',
  kpis: ['mail', 'commandes'],
  etapes: [
    ['Lire la mission de Nadia Ferrand', 'Messagerie. Elle vous dit ce qu’elle attend, étape par étape.'],
    ['Exporter les lignes de préparation', 'Menu Extractions, liste « Lignes de préparation » : les critères sont déjà réglés (allée A, 30 derniers jours). Vérifiez-les, puis « Exporter ».'],
    ['Calculer dans le tableur', 'Colonne « Écart », colonne « Réf. en écart » (SI), feuille Synthèse (NB.SI).'],
    ['Déposer votre fichier', 'Menu Fichiers. Le site vous dit ce qui est juste et ce qui cloche : corrigez et redéposez.'],
    ['Écrire à Nadia les références à recompter', 'Une ligne « À recompter : », seulement ce que les chiffres désignent.'],
  ],
};

export function baseDeDepart() {
  return { v: 1, created: Date.now(), stock: { ...STOCK_DEBUT_MOIS }, moves: [], mails: [], orders: [], seq: 1,
    customers: [], suppliers: [], _depart: [] };
}

const signature = `${EQUIPE.cheffe.nom}, ${EQUIPE.cheffe.role}`;
export const LIGNE_LISTE = I.LIGNE_LISTE;

function mailMission(prenom, now) {
  return { folder: 'in', ts: now - 3600e3, from: signature, fromMail: EQUIPE.cheffe.mail, to: prenom,
    subject: 'Allée A : ce que disent les chiffres', kind: 'text', amorce: `${LIGNE_LISTE} `,
    text: `Bonjour ${prenom},\n\nAprès l'histoire des écouteurs, je veux savoir si d'autres références de l'allée A ont un stock faux. Les préparateurs notent sur chaque bon le stock qu'ils trouvent au rayon : quand il ne correspond pas au logiciel, c'est un signal.\n\n1. Dans Extractions, liste « Lignes de préparation », exportez les lignes de l'allée A sur les 30 derniers jours : les critères sont déjà réglés, vérifiez-les.\n2. Dans le tableur, ajoutez la colonne « Écart » (stock trouvé moins stock logiciel), puis la colonne « Réf. en écart » qui recopie la référence seulement quand l'écart n'est pas nul (fonction SI).\n3. Dans la feuille Synthèse, comptez les constats par référence (fonction NB.SI).\n4. Déposez votre fichier (menu Fichiers).\n5. Écrivez-moi les références à faire recompter, sur une ligne qui commence par « ${LIGNE_LISTE} ».\n\nOn ne recompte pas tout : seulement ce que les chiffres désignent.\n\n${EQUIPE.cheffe.nom}` };
}

export const VOLET = {
  id: 'chiffres-1',
  semer(prenom, db) {
    const now = Date.now();
    const P = periodeChiffres(now);
    const aDejaBienvenue = ((db && db.mails) || []).some((m) => /^Bienvenue à l’entrepôt/.test(m.subject || ''));
    return { receptions: P.receptions, orders: P.orders, mouvements: P.mouvements,
      mails: [...(aDejaBienvenue ? [] : [mailBienvenue(prenom, now - 3600e3 * 30, ['stock', 'commandes', 'extractions'])]), mailMission(prenom, now)] };
  },
  // Nadia accuse réception de la liste, JUSTE OU FAUSSE (neutre : l'arrivée ne révèle rien) ;
  // l'amorce envoyée telle quelle (aucune référence) ne fait rien arriver.
  declencheurs: [{
    id: 'liste',
    quand: (db) => listes(db).length > 0,
    semer(prenom) {
      return { mails: [{ folder: 'in', ts: Date.now() + 1000, from: signature, fromMail: EQUIPE.cheffe.mail, to: prenom,
        subject: 'Vos références à recompter', kind: 'text',
        text: `Bonjour ${prenom},\n\nMerci, c'est noté. Je demande à l'équipe inventaire de passer dans l'allée A : vous ferez le recomptage.\n\n${EQUIPE.cheffe.nom}` }] };
    },
  }],
};

/* ============================ Suivi de l'exercice ============================
 * Cinq jalons. Les jalons 2 à 4 lisent le MEILLEUR dépôt (`resultatDepot`, guidage : redépôt
 * illimité) ; un nombre tapé ne valide pas l'écart, une colonne sans SI ne valide pas la 3,
 * une synthèse sans NB.SI ne valide pas la 4. Le jalon 5 juge la liste écrite à Nadia contre la
 * synthèse DÉPOSÉE PAR L'ÉLÈVE quand il y en a une (une erreur de synthèse ne se paie qu'une
 * fois, au jalon 4) ; sans dépôt, contre les quatre vraies références.
 */

// Les listes envoyées à Nadia (une par message qui en porte une), dans l'ordre.
export function listes(db) {
  return ((db && db.mails) || [])
    .filter((m) => m.folder === 'out' && nrm(m.toMail) === nrm(EQUIPE.cheffe.mail) && ligne(m.text, LIGNE_LISTE) !== null)
    .slice().sort((a, b) => (a.ts || 0) - (b.ts || 0))
    .map((m) => I.extraireRefs(ligne(m.text, LIGNE_LISTE)))
    .filter((refs) => refs.length > 0);
}

// La liste que l'élève DEVAIT écrire, d'après sa propre synthèse déposée.
export function listeAttendue(db) {
  const syn = resultatDepot(db, ID_DEPOT).controles.synthese;
  if (!syn || !syn.lu) return refsEnEcart(db);
  return refsExport(db).filter((r) => Number(syn.lu[r]) > 0);
}

const jalonControle = (id) => (db) => {
  const r = resultatDepot(db, ID_DEPOT);
  if (!r.depose) return { status: 'attente' };
  const c = r.controles[id];
  if (!c) return { status: 'attente' };
  return { status: c.ok ? 'ok' : 'ko', detail: `${c.justes} juste(s) sur ${c.total}.` };
};

export const ETAPES = [
  {
    id: 'export',
    titre: 'Lignes de préparation exportées (bons critères)',
    verifier: (db) => statutExport(db, ID_EXPORT, ID_DEPOT),
  },
  { id: 'ecart', titre: 'Écart calculé en formule', verifier: jalonControle('ecart') },
  { id: 'si', titre: 'Références en écart isolées avec SI', verifier: jalonControle('si') },
  { id: 'synthese', titre: 'Constats comptés par référence avec NB.SI', verifier: jalonControle('synthese') },
  {
    id: 'liste',
    titre: 'Bonne liste à recompter',
    verifier(db) {
      const L = listes(db);
      if (!L.length) return { status: 'attente' };
      const att = listeAttendue(db);
      const juste = (refs) => refs.length === att.length && att.every((r) => refs.includes(r));
      return L.some(juste) ? { status: 'ok' } : { status: 'ko', detail: `Dernière liste : ${L[L.length - 1].join(', ')}.` };
    },
  },
];
