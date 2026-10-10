// Cdiscount — ENT-2.6 « Cinq recomptages, pas un de plus ». BONUS (entraînement, coef. 1), C1.6.
// Écrite le 04/10/2026 (brief `docs/briefs/ENT-2.6-bonus.md`, chantier C9).
//
// Avant le Black Friday, l'équipe inventaire ne peut recompter que CINQ références des allées A et
// B. L'élève exporte un mois de lignes de préparation (écran Extractions, critères à choisir ; ≈ 150 lignes, export BRUT : lignes vides,
// doublons, dates écrites en texte), le nettoie, compte par référence les constats d'écart DEPUIS
// LE DERNIER INVENTAIRE (NB.SI.ENS), chiffre l'écart de chaque référence avec son coût (RECHERCHEV
// vers la feuille Tarifs), et choisit les cinq où l'écart pèse le plus EN EUROS.
//
// Deux pièges, vérifiés par les tests pour chaque niveau :
//   - LA DATE : BAT-10K (la plus chère des références à constats) a eu ses constats AVANT le
//     dernier inventaire, qui les a régularisés ; aucun après. Sans le critère de date, elle entre
//     à tort dans les cinq ;
//   - LA FRÉQUENCE : les piles, les câbles, les supports sont souvent signalés pour 1 ou 2 unités ;
//     les écouteurs deux fois seulement, pour 3 unités. Le top 5 par valeur diffère du top 5 par
//     nombre de constats d'au moins deux références.
//
// Les données sont FABRIQUÉES par un générateur déterministe (graine fixe, `core/tirage.js`) :
// mêmes lignes pour tous les élèves d'un même niveau. Seules les salissures dépendent de l'élève.
// Niveau (`db.aisance`, jamais montré) : un CONFIRMÉ a ≈ 220 lignes (plus de commandes, mêmes
// références, mêmes pièges) et plus de salissures (6 vides, 5 doublons, 8 dates en texte).
//
// Tout est CONSTRUIT (voir l'en-tête de `contenus/cdiscount.js`) : l'export, ses salissures, les
// commandes. Les coûts de la feuille Tarifs sont ceux du catalogue (`cdiscount.js`, une seule source).

import { CATALOGUE as CATALOGUE_COMPLET, EQUIPE, mailBienvenue, lignesPreparation, sousCatalogue } from './cdiscount.js';
import { extraireRefs, LIGNE_LISTE } from './cdiscount-inventaire.js';
import { hasard } from '../core/tirage.js';
import { resultatDepot, statutExport } from '../core/types/export-tableur.js';
import { preparationsAEcarter, filtreAllee } from './cdiscount.js';
import { ligne, nrm } from '../core/declencheurs.js';
import { ponderer } from './ponderation.js';

export const MODELES = ['CAB-USBC-1M', 'CHG-20W', 'ECO-BT-01', 'SOU-SF-02', 'BAT-10K', 'CLE-64G', 'AMP-LED-E27', 'COQ-UNI-01',
  'CAS-FIL-01', 'SUP-VOIT', 'CLA-SF-01', 'HUB-USB-4', 'MUL-4P', 'PIL-AA-8', 'VEI-LED', 'BOU-17L', 'GRP-2F', 'MIX-PLG'];
export const CATALOGUE = sousCatalogue(MODELES);

export const JOURS_DEPUIS_INVENTAIRE = 14;
const JOURS = 30;
const JOUR = 3600e3 * 24;
const minuit = (t) => { const d = new Date(t); d.setHours(0, 0, 0, 0); return d.getTime(); };
const quand = (now, j, h) => minuit(now) - j * JOUR + Math.round(h * 3600e3);
export const dateInventaire = (now = Date.now()) => quand(now, JOURS_DEPUIS_INVENTAIRE, 7);
const fdate = (t) => new Date(t).toLocaleDateString('fr-FR');

/* ------------------------------------------------------------------ le plan des préparations
 * Par référence : nombre de préparations AVANT le dernier inventaire (J-29 à J-15), APRÈS (J-13 à
 * J-1), et pour les huit références à écart, l'écart (constant une fois apparu : un écart dure
 * tant qu'on ne régularise pas) et le nombre de constats après l'inventaire (standard). L'écart
 * apparaît juste avant la n-ième dernière préparation : le standard a exactement ce nombre de
 * constats ; le confirmé, qui a plus de préparations, en a quelques-uns de plus (recalculés).
 *   BAT-10K : écart −2 dès J-27 (avant l'inventaire), RÉGULARISÉ à l'inventaire, aucun après.
 */
export const PLAN = {
  'CAB-USBC-1M': { avant: 4, apres: 8, ecart: 1, constats: 7 },
  'CHG-20W': { avant: 4, apres: 5, ecart: -3, constats: 4 },
  'ECO-BT-01': { avant: 3, apres: 3, ecart: -3, constats: 2 },
  'SOU-SF-02': { avant: 4, apres: 4 },
  'BAT-10K': { avant: 7, apres: 4, ecartAvant: -2 },
  'CLE-64G': { avant: 4, apres: 4 },
  'AMP-LED-E27': { avant: 4, apres: 4 },
  'COQ-UNI-01': { avant: 4, apres: 4 },
  'CAS-FIL-01': { avant: 3, apres: 4 },
  'SUP-VOIT': { avant: 4, apres: 6, ecart: -2, constats: 5 },
  'CLA-SF-01': { avant: 3, apres: 4, ecart: -2, constats: 3 },
  'HUB-USB-4': { avant: 4, apres: 4 },
  'MUL-4P': { avant: 4, apres: 4 },
  'PIL-AA-8': { avant: 5, apres: 9, ecart: -2, constats: 8 },
  'VEI-LED': { avant: 3, apres: 4 },
  'BOU-17L': { avant: 3, apres: 3, ecart: -2, constats: 2 },
  'GRP-2F': { avant: 4, apres: 4 },
  'MIX-PLG': { avant: 3, apres: 3, ecart: 2, constats: 2 },
};
// Un confirmé : deux préparations de plus avant, deux après, pour chaque référence.
const EN_PLUS_CONFIRME = { avant: 2, apres: 2 };
export const STOCK_DEBUT = Object.fromEntries(MODELES.map((r) => [r, 40]));
export const ID_INVENTAIRE = 'INV-2026-49';
const PREPARATEURS = ['Yanis Cazenave', 'Inès Lagarde', 'Sofiane Brettes'];

// La période, PURE (graine fixe + niveau) : commandes, mouvements, et l'ajustement de BAT-10K à
// l'inventaire. Le « Stock trouvé » de chaque bon = le stock RÉEL au rayon.
export function periode(now = Date.now(), confirme = false) {
  const h = hasard('ENT-2.6' + (confirme ? '#confirme' : ''));
  const tInv = dateInventaire(now);
  // 1. Les préparations, référence par référence (jours tirés sans le jour de l'inventaire).
  const picks = [];
  MODELES.forEach((sku) => {
    const P = PLAN[sku];
    const nA = P.avant + (confirme ? EN_PLUS_CONFIRME.avant : 0), nP = P.apres + (confirme ? EN_PLUS_CONFIRME.apres : 0);
    const jA = h.melanger([...Array(JOURS - JOURS_DEPUIS_INVENTAIRE - 1)].map((_, i) => JOURS_DEPUIS_INVENTAIRE + 1 + i)).slice(0, nA);
    const jP = h.melanger([...Array(JOURS_DEPUIS_INVENTAIRE - 1)].map((_, i) => 1 + i)).slice(0, nP);
    [...jA, ...jP].forEach((j) => picks.push({ sku, j, h: 8 + h.entier(0, 18) / 2, qty: h.entier(1, 2) }));
  });
  picks.forEach((p) => { p.ts = quand(now, p.j, p.h); });
  picks.sort((a, b) => a.ts - b.ts || (a.sku < b.sku ? -1 : 1));
  // 2. Le moment où chaque écart apparaît (après l'inventaire) : juste avant la n-ième dernière
  //    préparation du PLAN STANDARD (le confirmé garde le même moment).
  const debut = {};
  const std = confirme ? periode(now, false) : null;
  MODELES.forEach((sku) => {
    const P = PLAN[sku];
    if (!P.ecart) return;
    if (std) { debut[sku] = std.debutEcart[sku]; return; }
    const apres = picks.filter((p) => p.sku === sku && p.ts > tInv);
    const k = apres.length - P.constats;
    const t1 = apres[k].ts, t0 = k > 0 ? apres[k - 1].ts : tInv;
    debut[sku] = Math.max(tInv + 3600e3, Math.round((t0 + t1) / 2));
  });
  // 3. Les commandes : les préparations d'un même jour, groupées par trois au plus.
  const orders = [];
  const mouvements = [];
  const parJour = new Map();
  picks.forEach((p) => { if (!parJour.has(p.j)) parJour.set(p.j, []); parJour.get(p.j).push(p); });
  let no = 733001, client = 0, prep = 0;
  [...parJour.keys()].sort((a, b) => b - a).forEach((j) => {
    const L = parJour.get(j);
    for (let i = 0; i < L.length; i += 3) {
      const groupe = L.slice(i, i + 3);
      // Une commande ne porte qu'une fois une référence.
      const lignes = [];
      groupe.forEach((p) => { const x = lignes.find((l) => l.sku === p.sku); if (x) x.qty += p.qty; else lignes.push({ sku: p.sku, qty: p.qty, ts: p.ts }); });
      const ts = Math.max(...groupe.map((p) => p.ts));
      const cmd = `CMD-${no++}`;
      const par = PREPARATEURS[prep++ % PREPARATEURS.length];
      const rows = {};
      lignes.forEach((l) => {
        rows[l.sku] = { seen: '', loc: CATALOGUE.VM[l.sku].loc, qty: l.qty, status: 'ok' };
        mouvements.push({ sku: l.sku, type: 'Sortie : préparation', delta: -l.qty, ref: 'BP-' + cmd.slice(4), ts, by: par });
      });
      orders.push({ no: cmd, date: ts - 3600e3 * 5, customerId: 'C' + String(1 + (client++ % 20)).padStart(4, '0'), ship: ['COL', 'REL', 'CHR'][client % 3],
        lines: lignes.map((l) => ({ sku: l.sku, qty: l.qty })), prep: { rows, doc: true, validated: true, complete: true, at: ts, par } });
    }
  });
  // 4. L'inventaire : BAT-10K régularisée (le stock du système rejoint le rayon).
  mouvements.push({ sku: 'BAT-10K', type: 'Ajustement inventaire', delta: PLAN['BAT-10K'].ecartAvant,
    ref: `${ID_INVENTAIRE} · Démarque inconnue`, ts: tInv, by: EQUIPE.cheffe.nom });
  mouvements.sort((a, b) => a.ts - b.ts);
  // 5. Système et rayon, mouvement après mouvement : le « Stock trouvé » de chaque bon.
  const systeme = { ...STOCK_DEBUT };
  const tBat = quand(now, 27, 12);
  const ecartDe = (sku, t) => (sku === 'BAT-10K' ? (t > tBat && t < tInv ? PLAN['BAT-10K'].ecartAvant : 0)
    : (debut[sku] && t > debut[sku] ? PLAN[sku].ecart : 0));
  mouvements.forEach((m) => {
    if (m.type === 'Sortie : préparation') {
      const o = orders.find((x) => 'BP-' + x.no.slice(4) === m.ref);
      o.prep.rows[m.sku].seen = Math.max(0, systeme[m.sku] + ecartDe(m.sku, m.ts));
    }
    systeme[m.sku] += m.delta;
  });
  orders.sort((a, b) => a.prep.at - b.prep.at);
  return { orders, mouvements, debutEcart: debut, tInv };
}

/* ------------------------------------------------------------------ l'export et ses calculs */

export const ID_EXPORT = 'preparations';
export const ID_DEPOT = 'analyse';
export const COLONNES = ['Date', 'N° bon', 'Commande', 'Référence', 'Désignation', 'Emplacement',
  'Qté préparée', 'Stock logiciel', 'Stock trouvé', 'Préparateur'];
const versLigne = (p) => [p.ts, p.bon, p.commande, p.sku, p.designation, p.emplacement, p.qty, p.logiciel, p.trouve, p.preparateur];
export const lignes = (db) => lignesPreparation(db, CATALOGUE);
const estConfirme = (db) => !!db && db.aisance === 'confirme';
const coutDe = (sku) => CATALOGUE_COMPLET.VM[sku].model.cost;
// Le dernier inventaire, relu dans la base (l'ajustement de BAT-10K).
const inventaireDe = (db) => { const a = ((db && db.moves) || []).find((m) => m.type === 'Ajustement inventaire' && String(m.ref).startsWith(ID_INVENTAIRE)); return a ? a.ts : dateInventaire(); };

// Les lignes sur lesquelles on calcule : celles de la demande, ou celles de l'export que l'élève a
// réellement fait (`propres`, objets colonne → valeur) — une erreur d'export ne se paie qu'une fois.
const source = (db, propres) => (propres
  ? propres.map((o) => ({ sku: o['Référence'], trouve: o['Stock trouvé'], logiciel: o['Stock logiciel'], ts: o.Date }))
  : lignes(db));

// Constats par référence (trouvé ≠ logiciel), depuis le jour du dernier inventaire — ou tous.
export function constats(db, { depuisInventaire = true, propres = null } = {}) {
  const t = minuit(inventaireDe(db));
  const L = source(db, propres).filter((p) => p.trouve !== p.logiciel && (!depuisInventaire || p.ts >= t));
  return Object.fromEntries(MODELES.map((r) => [r, L.filter((p) => p.sku === r).length]));
}
// L'écart d'une référence : celui de son premier constat (il est constant) — ce que rend la
// RECHERCHEV sur « Réf. en écart » ; 0 sans constat.
export function ecarts(db, { depuisInventaire = true, propres = null } = {}) {
  const t = minuit(inventaireDe(db));
  const L = source(db, propres).filter((p) => p.trouve !== p.logiciel && (!depuisInventaire || p.ts >= t));
  return Object.fromEntries(MODELES.map((r) => { const p = L.find((x) => x.sku === r); return [r, p ? p.trouve - p.logiciel : 0]; }));
}
export const valeurs = (db, o) => { const e = ecarts(db, o); return Object.fromEntries(MODELES.map((r) => [r, Math.round(e[r] * coutDe(r) * 100) / 100])); };
// Les cinq références où l'écart pèse le plus (en valeur absolue), et le top 5 par fréquence.
const top5 = (o) => Object.entries(o).filter(([, v]) => Math.abs(v) > 0).sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]) || (a[0] < b[0] ? -1 : 1)).slice(0, 5).map(([r]) => r);
export const top5Valeur = (db, o) => top5(valeurs(db, o));
export const top5Frequence = (db) => top5(constats(db));

// Les lignes « visées » par les salissures : les constats après l'inventaire (un doublon y fausse
// NB.SI.ENS, une date en texte y échappe au critère de date).
const enEcartApres = (db) => { const t = minuit(inventaireDe(db)); return (l) => l['Stock trouvé'] !== l['Stock logiciel'] && l.Date >= t; };

export const AIDE = 'NB.SI.ENS(plage1 ; critère1 ; plage2 ; critère2 …) — RECHERCHEV(valeur ; table ; n° de colonne ; FAUX).';

// Les lignes à écarter de la liste d'extraction : les allées A et B AVANT le mois (aucune autre
// allée dans cette séance : la demande, c'est « toutes les allées » sur 30 jours).
const PREPARATEURS_VOISINS = ['Yanis Cazenave', 'Inès Lagarde', 'Sofiane Brettes'];
export const aujourdhui = (db) => (db && db.created) || Date.now();
export const lignesAEcarter = (db) => preparationsAEcarter('ent26-mois-precedent',
  { refs: MODELES, jours: [32, 45], n: 14, now: aujourdhui(db), numero: 728601, preparateurs: PREPARATEURS_VOISINS }).map(versLigne);

export function controles(db, propres = null) {
  const n = propres ? propres.length : lignes(db).length;
  return [
    { type: 'lignes', id: 'nettoye', libelle: 'Export nettoyé (lignes vides, doublons, dates en texte)', feuille: 'Préparations',
      attendu: n, colonneDate: 'Date' },
    { type: 'table', id: 'constats', libelle: 'Constats depuis le dernier inventaire (fonction NB.SI.ENS)', feuille: 'Synthèse',
      cle: 'Référence', colonne: 'Constats', attendu: constats(db, { propres }), fonctions: ['COUNTIFS'] },
    { type: 'table', id: 'valeur', libelle: 'Valeur de l’écart (RECHERCHEV)', feuille: 'Synthèse',
      cle: 'Référence', colonne: 'Valeur de l’écart', attendu: valeurs(db, { propres }), tolerance: 0.01, formule: true, fonctionsFeuille: ['VLOOKUP'] },
  ];
}

export const TABLEUR = {
  aide: AIDE,
  exports: [{
    id: ID_EXPORT, liste: 'Lignes de préparation', fichier: 'cdiscount-lignes-de-preparation.xlsx',
    // Niveau 3 (entraînement) : la demande métier seule (« les lignes de préparation du mois »).
    indications: 3, autres: lignesAEcarter, aujourdhui,
    filtres: [filtreAllee('*'), { id: 'periode', libelle: 'Période', periode: 'Date', juste: '30j' }],
    feuilles: [
      { nom: 'Préparations', colonnes: COLONNES, types: { Date: 'date' }, lignes: (db) => lignes(db).map(versLigne) },
      { nom: 'Tarifs', colonnes: ['Référence', 'Désignation', 'Coût unitaire'],
        lignes: () => MODELES.map((r) => { const v = CATALOGUE_COMPLET.VM[r]; return [r, [v.model.brand, v.model.name].filter(Boolean).join(' '), v.model.cost]; }) },
      { nom: 'Synthèse', colonnes: ['Référence'], lignes: () => MODELES.map((r) => [r]) },
    ],
    // Fonction de la base : un confirmé a plus de salissures. Salissures visées : au moins un
    // doublon et trois dates en texte sur des constats d'après l'inventaire.
    salissures: (db) => ({ ...(estConfirme(db) ? { vides: 6, doublons: 5, datesTexte: 8 } : { vides: 4, doublons: 3, datesTexte: 5 }),
      cible: enEcartApres(db), doublonsCible: 1, datesTexteCible: 3 }),
  }],
  depot: { id: ID_DEPOT, export: ID_EXPORT, libelle: 'Déposer mon fichier', retour: 'entrainement', controles },
};

/* ------------------------------------------------------------------ base et volet */

export const EXERCICE = 'Bonus : cinq recomptages, pas un de plus';

export const ACCUEIL = {
  titre: 'Cinq recomptages : les bons',
  kpis: ['mail', 'commandes'],
  etapes: [
    ['Lire le message de Nadia Ferrand', 'Messagerie. Cinq recomptages seulement, dans les allées A et B.'],
    ['Exporter les lignes de préparation', 'Menu Extractions : choisissez les critères qui répondent à la demande de Nadia. L’export sort brut du logiciel : il faut le nettoyer.'],
    ['Nettoyer, compter, chiffrer', 'Lignes vides, doublons, dates en texte ; NB.SI.ENS depuis le dernier inventaire ; RECHERCHEV vers Tarifs.'],
    ['Déposer votre fichier', 'Menu Fichiers. Le site vous dit combien de résultats sont justes.'],
    ['Écrire à Nadia les cinq références', 'Une ligne « À recompter : », les cinq où l’écart pèse le plus en euros.'],
  ],
};

export function baseDeDepart() {
  return { v: 1, created: Date.now(), stock: { ...STOCK_DEBUT }, moves: [], mails: [], orders: [], seq: 1,
    customers: [], suppliers: [], _depart: [] };
}

const signature = `${EQUIPE.cheffe.nom}, ${EQUIPE.cheffe.role}`;

function mailMission(prenom, now) {
  return { folder: 'in', ts: now - 3600e3, from: signature, fromMail: EQUIPE.cheffe.mail, to: prenom,
    subject: 'Bonus : cinq recomptages, pas un de plus', kind: 'text', amorce: `${LIGNE_LISTE} `,
    text: `Bonjour ${prenom},\n\nBonus, pour ceux qui ont fini : le Black Friday approche et l'équipe inventaire ne peut recompter que cinq références dans les allées A et B. Exportez les lignes de préparation du mois (attention : l'export sort brut du logiciel, il faut le nettoyer). Comptez, par référence, les constats d'écart depuis le dernier inventaire du ${fdate(dateInventaire(now))} (NB.SI.ENS), puis chiffrez l'écart de chaque référence avec son coût, que vous trouverez dans la feuille Tarifs (RECHERCHEV). Une erreur coûte plus cher sur une batterie que sur une pile : choisissez les cinq références où l'écart pèse le plus en euros, et écrivez-les-moi sur une ligne « ${LIGNE_LISTE} ».\n\n${EQUIPE.cheffe.nom}` };
}

export const VOLET = {
  id: 'priorites-1',
  semer(prenom, db) {
    const now = Date.now();
    const P = periode(now, estConfirme(db));
    const aDejaBienvenue = ((db && db.mails) || []).some((m) => /^Bienvenue à l’entrepôt/.test(m.subject || ''));
    return { orders: P.orders, mouvements: P.mouvements,
      mails: [...(aDejaBienvenue ? [] : [mailBienvenue(prenom, now - 3600e3 * 30, ['commandes', 'extractions'])]), mailMission(prenom, now)] };
  },
  // Nadia accuse réception, NEUTRE, dès qu'une liste porte au moins une référence connue.
  declencheurs: [{
    id: 'liste',
    quand: (db) => listes(db).length > 0,
    semer(prenom) {
      return { mails: [{ folder: 'in', ts: Date.now() + 1000, from: signature, fromMail: EQUIPE.cheffe.mail, to: prenom,
        subject: 'Les cinq recomptages', kind: 'text', text: `Bonjour ${prenom},\n\nMerci. Je lance les cinq recomptages.\n\n${EQUIPE.cheffe.nom}` }] };
    },
  }],
};

/* ============================ Suivi de l'exercice ============================
 * Quatre jalons. Les trois premiers lisent le MEILLEUR dépôt (entraînement) ; le quatrième juge la
 * liste écrite à Nadia contre la synthèse DÉPOSÉE quand il y en a une (une erreur de synthèse ne se
 * paie qu'une fois) : exactement cinq références, les plus grandes valeurs d'écart en valeur absolue
 * (à égalité au cinquième rang, l'une ou l'autre). Sans dépôt : contre les vraies valeurs.
 */

export function listes(db) {
  return ((db && db.mails) || [])
    .filter((m) => m.folder === 'out' && nrm(m.toMail) === nrm(EQUIPE.cheffe.mail) && ligne(m.text, LIGNE_LISTE) !== null)
    .slice().sort((a, b) => (a.ts || 0) - (b.ts || 0))
    .map((m) => extraireRefs(ligne(m.text, LIGNE_LISTE), MODELES))
    .filter((refs) => refs.length > 0);
}

// Les valeurs que l'élève a déposées (synthèse), ou les vraies.
export function valeursDeReference(db) {
  const v = resultatDepot(db, ID_DEPOT).controles.valeur;
  if (!v || !v.lu) return valeurs(db);
  return Object.fromEntries(MODELES.map((r) => [r, Number(v.lu[r]) || 0]));
}

// Une liste est-elle « les cinq plus grandes valeurs » de `vals` ? (égalités au 5e rang tolérées)
export function cinqBonnes(refs, vals) {
  if (refs.length !== 5) return false;
  const tri = MODELES.map((r) => Math.abs(vals[r] || 0)).sort((a, b) => b - a);
  const seuil = tri[4];
  if (!(seuil > 0)) return false;
  const dessus = MODELES.filter((r) => Math.abs(vals[r] || 0) > seuil);
  return dessus.every((r) => refs.includes(r)) && refs.every((r) => Math.abs(vals[r] || 0) >= seuil);
}

const jalonControle = (id) => (db) => {
  const r = resultatDepot(db, ID_DEPOT);
  const c = r.depose ? r.controles[id] : null;
  if (!c) return { status: 'attente' };
  return { status: c.ok ? 'ok' : 'ko', detail: `${c.justes} juste(s) sur ${c.total}.` };
};

const JALONS = [
  { id: 'export', titre: 'Les lignes du mois exportées (bons critères)', verifier: (db) => statutExport(db, ID_EXPORT, ID_DEPOT) },
  { id: 'nettoye', titre: 'Export nettoyé', verifier: jalonControle('nettoye') },
  { id: 'constats', titre: 'Constats comptés depuis le dernier inventaire (NB.SI.ENS)', verifier: jalonControle('constats') },
  { id: 'valeur', titre: 'Écarts chiffrés en euros (RECHERCHEV)', verifier: jalonControle('valeur') },
  {
    id: 'cinq',
    titre: 'Les cinq bonnes priorités',
    verifier(db) {
      const L = listes(db);
      if (!L.length) return { status: 'attente' };
      const vals = valeursDeReference(db);
      return L.some((refs) => cinqBonnes(refs, vals)) ? { status: 'ok' } : { status: 'ko', detail: `Dernière liste : ${L[L.length - 1].join(', ')}.` };
    },
  },
];

// NOTE PONDÉRÉE SUR 20 (poids validés par Tristan le 10/10/2026, lot 4 de `docs/briefs/NOTATION-ponderation.md`). Le cœur : les cinq bonnes priorités (7,5) ; le nettoyage de l'export, NB.SI.ENS et RECHERCHEV sont les outils qui y mènent.
export const BAREME = {
  export: [1.5],
  nettoye: [3],
  constats: [4],
  valeur: [4],
  cinq: [7.5],
};
export const ETAPES = ponderer(JALONS, BAREME, 'ENT-2.6');
