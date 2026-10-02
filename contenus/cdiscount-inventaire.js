// Cdiscount — ENT-2.2 « Inventaire tournant ». Entraînement, C1.6.
//
// Deuxième séance de l'environnement Cdiscount, et la première qui TOUCHE au stock. Après
// ENT-2.1 (lire les mouvements), l'élève fait un inventaire tournant de l'allée A : il reporte
// un relevé de comptage, calcule les écarts, cherche la cause de chacun dans les mouvements et
// les messages, décide (régulariser avec un motif, remettre en rayon, recompter), puis calcule
// le taux d'écart. Écran : `core/types/inventaire.js` ; format des données :
// `claude/prepalog-inventaire-format.md`.
//
// Réglages décidés par Tristan le 02/10/2026 : correction DÉTAILLÉE (c'est de l'entraînement :
// l'élève voit pourquoi), écarts et taux calculés par l'ÉLÈVE, comptage à l'aveugle, relevé
// papier par la messagerie, motif obligatoire.
//
// Volume : 8 références et 27 mouvements (ENT-2.1 : 5 et 19), « c'est surtout le modificateur de
// niveau qui doit jouer » (Tristan) : la séance déclare son volume STANDARD ; le lot en plus pour
// les élèves à l'aise viendra du niveau d'aisance, qui n'est pas encore construit (demande au
// moteur inscrite dans `claude/prepalog-chantiers-en-cours.md`).
//
// LE PIÈGE : l'ARTICLE AU MAUVAIS EMPLACEMENT (choix de Tristan, 02/10/2026). Il se présente de
// deux façons, pour que l'élève ne retienne pas « tout écart négatif = remettre en rayon » :
//
//   1. UNE PAIRE QUI S'ANNULE. À la mise en stock de la palette Kabeo, trois cartons de
//      chargeurs (CHG-20W) ont été rangés dans le bac des câbles (CAB-USBC-1M) : mêmes
//      boîtes, même marque. L'équipe de comptage a compté ce bac d'un coup. Résultat : câbles
//      +3, chargeurs −3. Le stock du système est JUSTE : aucune marchandise n'a disparu. Il
//      faut voir les deux écarts ensemble — ce sont les mêmes trois cartons.
//        CHG −3 → ne pas régulariser, remettre en rayon (les cartons sont dans le mauvais bac)
//        CAB +3 → recompter : sans les trois cartons de chargeurs, l'écart disparaît
//   2. UN RANGEMENT APRÈS UNE PRÉPARATION ANNULÉE. Une commande annulée en cours de préparation :
//      les deux batteries sont réintégrées au système (le mouvement est juste) mais posées dans
//      un autre bac. BAT −2 → ne pas régulariser, remettre en rayon.
//
// UNE LIGNE TÉMOIN, pour que « mauvais emplacement » ne devienne pas la réponse à tout :
// COQ-UNI-01 −2, bacs voisins vérifiés, aucun mouvement ni message ne l'explique. C'est la seule
// ligne où régulariser est juste (motif « Démarque inconnue »). Sans elle, remettre en rayon
// serait la bonne réponse partout et l'élève n'aurait jamais à passer un ajustement.
//
// Ce que la séance ne sème PAS : casse non déclarée, retour non enregistré, erreur de saisie
// (écartés par Tristan le 02/10/2026 ; ENT-2.1 a déjà montré un retour et une casse DÉCLARÉS).
//
// Tout est CONSTRUIT (voir l'en-tête de `contenus/cdiscount.js`).

import { CUSTOMERS, EQUIPE, mailBienvenue, sousCatalogue } from './cdiscount.js';
import { TYPES as TYPES_21 } from './cdiscount-mouvements.js';
import { bilanInventaire } from '../core/types/inventaire.js';

/* ------------------------------------------------------------------ périmètre */

// Les huit articles de la maquette de l'écran Inventaire (allée A, A-01-1 à A-04-2), dans l'ordre
// des emplacements : c'est l'ordre du relevé de comptage.
export const MODELES = ['CAB-USBC-1M', 'CHG-20W', 'ECO-BT-01', 'SOU-SF-02', 'BAT-10K', 'CLE-64G', 'AMP-LED-E27', 'COQ-UNI-01'];
export const CATALOGUE = sousCatalogue(MODELES);

const [CAB, CHG, ECO, SOU, BAT, CLE, AMP, COQ] = MODELES;

// Le stock compté au dernier inventaire, il y a dix jours : la base de départ de l'élève. Les
// mouvements de la période arrivent par le volet et s'y ajoutent.
export const INVENTAIRE_PRECEDENT = { [CAB]: 30, [CHG]: 18, [ECO]: 25, [SOU]: 20, [BAT]: 12, [CLE]: 20, [AMP]: 40, [COQ]: 30 };
export const JOURS_DEPUIS_INVENTAIRE = 10;

export const VOLUME = { references: 8, documents: 16, mouvements: 27 };

/* ------------------------------------------------------------------ la période */

const RECEPTIONS = [
  { no: 'REC-26-0431', supId: 'F01', j: 9, h: 9.2, bl: 'BL-KB-88415', lot: 'LOT-KB-2701', transporteur: 'Kabeo, livraison directe',
    lignes: [[CAB, 40, [20, 20]], [CHG, 30, [10, 10, 10]]] },
  { no: 'REC-26-0434', supId: 'F03', j: 7, h: 9.8, bl: 'BL-KL-61207', lot: 'LOT-KL-2702', transporteur: 'Geodis, tournée 7',
    lignes: [[SOU, 12, [12]], [CLE, 20, [10, 10]]] },
];

// Onze commandes. CMD-732153 est ANNULÉE par le client pendant la préparation : ses deux
// batteries sortent, puis rentrent (réintégration). C'est le second rangement raté.
const COMMANDES = [
  { no: 'CMD-732101', client: 'C0004', ship: 'COL', j: 9, h: 14, lignes: [[ECO, 2], [CAB, 1]] },
  { no: 'CMD-732118', client: 'C0009', ship: 'REL', j: 8, h: 10.5, lignes: [[CHG, 1], [AMP, 2]] },
  { no: 'CMD-732126', client: 'C0013', ship: 'COL', j: 8, h: 15, lignes: [[COQ, 1]] },
  { no: 'CMD-732140', client: 'C0002', ship: 'CHR', j: 7, h: 13.5, lignes: [[SOU, 1], [CLE, 2]] },
  { no: 'CMD-732153', client: 'C0017', ship: 'COL', j: 6, h: 10, lignes: [[BAT, 2]], annulee: true },
  { no: 'CMD-732167', client: 'C0006', ship: 'REL', j: 6, h: 15.5, lignes: [[ECO, 1], [CHG, 2]] },
  { no: 'CMD-732181', client: 'C0011', ship: 'COL', j: 5, h: 14, lignes: [[CAB, 2], [COQ, 2]] },
  { no: 'CMD-732195', client: 'C0015', ship: 'REL', j: 4, h: 11, lignes: [[BAT, 1], [SOU, 1], [AMP, 1]] },
  { no: 'CMD-732210', client: 'C0001', ship: 'CHR', j: 3, h: 14, lignes: [[ECO, 1], [CHG, 1], [CLE, 1]] },
  { no: 'CMD-732226', client: 'C0019', ship: 'COL', j: 2, h: 10.25, lignes: [[CAB, 3]] },
  { no: 'CMD-732239', client: 'C0008', ship: 'COL', j: 1, h: 13.7, lignes: [[BAT, 1]] },
];

// Un retour client (déclaré, remis en rayon) et une casse (déclarée) : ce sont des mouvements
// NORMAUX de la période, avec leur document, que l'élève a déjà appris à lire en ENT-2.1. Ils ne
// sont pas des pièges ici : ils donnent du volume et des lignes sans écart.
export const RETOUR = { no: 'RET-26-0107', commande: 'CMD-731988', sku: ECO, qty: 1, j: 4, h: 16.75 };
export const CASSE = { no: 'DEM-26-0031', sku: SOU, qty: 1, j: 3, h: 9.5 };
export const REINTEGRATION = { no: 'REI-26-0012', commande: 'CMD-732153', sku: BAT, qty: 2, j: 5, h: 9 };

export const TYPES = {
  ...TYPES_21,
  reintegration: 'Entrée : préparation annulée',
};

// La préparatrice qui a annulé et réintégré : une personne de plus dans l'équipe, propre à cette
// séance (inventée, adresse en .example).
const PREPA = { nom: 'Inès Lagarde', role: 'préparatrice', mail: 'i.lagarde@cdiscount.example' };

/* ------------------------------------------------------------------ outils */

const JOUR = 3600e3 * 24;
const minuit = (t) => { const d = new Date(t); d.setHours(0, 0, 0, 0); return d.getTime(); };
const quand = (now, j, h) => minuit(now) - j * JOUR + Math.round(h * 3600e3);
const bp = (cmd) => 'BP-' + cmd.replace('CMD-', '');
const fdate = (t) => new Date(t).toLocaleDateString('fr-FR');

export function dateInventaire(now = Date.now()) {
  return quand(now, JOURS_DEPUIS_INVENTAIRE, 7);
}

/* ------------------------------------------------------------------ l'inventaire */

// Les quantités relevées par l'équipe, dans l'ordre des emplacements. Stock du SYSTÈME au
// moment du comptage (aujourd'hui, après les 27 mouvements) :
//   CAB 64  CHG 44  ECO 22  SOU 29  BAT 10  CLE 37  AMP 37  COQ 27   (total 270)
// Écarts : CAB +3, CHG −3, BAT −2, COQ −2 → somme sans signe 10, taux 10 ÷ 270 = 3,7 %.
export const ID_INVENTAIRE = 'INV-2026-52';

export const INVENTAIRE = {
  id: ID_INVENTAIRE,
  titre: 'Inventaire tournant — allée A',
  sousTitre: 'Comptage de la semaine · 8 emplacements',
  source: 'releve',
  aveugle: true,
  ecarts: 'eleve',            // l'élève calcule les écarts et le taux : c'est de l'entraînement
  correction: 'detaillee',    // décision de Tristan (02/10/2026) : il voit pourquoi
  motifObligatoire: true,
  // Tous les mouvements depuis le dernier inventaire sont consultables (dix jours).
  depuis: dateInventaire(),
  lignes: [
    { ref: CAB, compte: 67, recompte: 64, attendu: 'recompter',
      explication: "Le bac A-01-1 a été compté d'un coup, sans lire les étiquettes : il contenait trois cartons de chargeurs CHG-20W rangés là par erreur (mêmes boîtes Kabeo). Aucun mouvement n'explique un surplus de 3 câbles, et ces cartons ne sont pas des câbles : le recomptage, chargeurs écartés, redonne 64. Régulariser aurait créé trois câbles qui n'existent pas." },
    { ref: CHG, compte: 41, attendu: 'rayon',
      explication: "Ce sont les trois mêmes cartons : les chargeurs manquants en A-01-2 sont dans le bac des câbles (A-01-1), rangés là lors de la réception REC-26-0431. Le manque de 3 chargeurs et le surplus de 3 câbles s'annulent. Le stock du système est juste : on ne régularise pas, on remet les cartons dans leur bac. Régulariser aurait fait disparaître trois chargeurs bien présents dans l'entrepôt." },
    { ref: ECO, compte: 22 },
    { ref: SOU, compte: 29 },
    { ref: BAT, compte: 8, attendu: 'rayon',
      explication: "La commande CMD-732153 a été annulée pendant la préparation : les deux batteries sont rentrées dans le système (REI-26-0012, c'est juste) mais Inès les a posées dans un autre bac de l'allée. Elles existent : le stock du système est juste, on les remet en A-03-1. Régulariser les ferait sortir du stock alors qu'elles sont à vendre." },
    { ref: CLE, compte: 37 },
    { ref: AMP, compte: 37 },
    { ref: COQ, compte: 25, attendu: 'regul', motif: 'Démarque inconnue',
      explication: "Deux coques manquent, et rien ne l'explique : aucun mouvement, aucun message, et l'équipe a recompté deux fois et vérifié les bacs voisins (aucun article rangé au mauvais endroit). Quand toutes les pistes sont écartées, le stock du système est faux : on le régularise, avec le motif « Démarque inconnue »." },
  ],
};

/* ------------------------------------------------------------------ base et volet */

export const EXERCICE = 'Exercice 2 : faire l’inventaire d’une allée';

export const ACCUEIL = {
  titre: 'Un inventaire tournant, dans l’ordre',
  // Pas de compteur de stock sur l'accueil : il donnerait le total du système avant le comptage.
  kpis: ['mail'],
  etapes: [
    ['Lire le message de Nadia Ferrand', 'Messagerie. Elle vous confie l’inventaire de l’allée A et vous dit ce qu’elle attend.'],
    ['Reporter le comptage', 'Menu Inventaire. Le relevé de l’équipe est dans la Messagerie : recopiez-le emplacement par emplacement.'],
    ['Calculer les écarts', 'Écart = compté − système. Un manque est négatif, un surplus positif.'],
    ['Chercher la cause de chaque écart', 'Ouvrez les mouvements de l’article, lisez vos messages. Un écart n’est pas toujours une perte : regardez aussi les autres lignes.'],
    ['Décider', 'Régulariser (avec un motif), remettre en rayon, ou demander un recomptage.'],
    ['Calculer le taux d’écart et valider', 'La validation est définitive : les régularisations partent dans les Mouvements du Stock.'],
  ],
};

// La base d'un élève qui n'a rien fait : le stock compté au dernier inventaire. La période
// arrive par le volet, avec ses mouvements, ses documents et ses messages.
export function baseDeDepart() {
  return { v: 1, created: Date.now(), stock: { ...INVENTAIRE_PRECEDENT }, moves: [], mails: [], orders: [], seq: 1,
    customers: [], suppliers: [], _depart: [] };
}

const CLIENTS = Object.fromEntries(CUSTOMERS.map((c) => [c.id, c]));

function mailMission(prenom, now) {
  const inv = fdate(dateInventaire(now));
  return { folder: 'in', ts: now - 3600e3 * 3, from: `${EQUIPE.cheffe.nom}, ${EQUIPE.cheffe.role}`,
    fromMail: EQUIPE.cheffe.mail, to: prenom,
    subject: 'Inventaire de l’allée A : c’est pour vous', kind: 'text',
    text: `Bonjour ${prenom},\n\nLe dernier inventaire de l'allée A date du ${inv}. L'équipe de comptage vient de repasser dans les huit emplacements (A-01-1 à A-04-2) : son relevé est dans votre messagerie.\n\nÀ vous de faire l'inventaire dans le système (menu Inventaire) :\n\n1. Reportez le relevé de comptage, emplacement par emplacement.\n2. Calculez l'écart de chaque ligne : compté moins système.\n3. Pour chaque écart, cherchez la cause : les mouvements de l'article depuis le dernier inventaire, et vos messages. Regardez aussi les autres lignes : un écart sur un article peut en cacher un autre.\n4. Décidez : régulariser le stock du système (avec un motif), ne pas régulariser et remettre la marchandise en rayon, ou demander un recomptage.\n5. Calculez le taux d'écart de l'inventaire, puis validez.\n\nAttention : le stock du système reste caché tant que vous n'avez pas validé le comptage. C'est voulu : on compte ce qu'on voit, sans se laisser influencer.\n\nUne régularisation change le stock pour de bon : réfléchissez avant d'en passer une.\n\nMerci,\n${EQUIPE.cheffe.nom}` };
}

export const VOLET = {
  id: 'inventaire-1',
  semer(prenom, db) {
    const now = Date.now();
    const mouvements = [];
    const receptions = [];
    const orders = [];

    RECEPTIONS.forEach((r) => {
      const ts = quand(now, r.j, r.h);
      const rows = {};
      let n = 0;
      const colis = [];
      r.lignes.forEach(([s, q, cartons]) => {
        rows[s] = { annonce: q, compte: q, etat: 'ok', decision: 'accepte' };
        cartons.forEach((c) => colis.push({ no: ++n, sku: s, qty: c, etat: 'ok' }));
        mouvements.push({ sku: s, type: TYPES.reception, delta: q, ref: r.no, lot: r.lot, ts, by: EQUIPE.quai.nom });
      });
      receptions.push({ no: r.no, supId: r.supId, ts, transporteur: r.transporteur,
        bl: { no: r.bl, date: ts - JOUR, lot: r.lot, lines: r.lignes.map(([s, q]) => ({ sku: s, qty: q })) },
        colis, ctrl: { lot: r.lot, rows, validated: true, at: ts + 3600e3 * 0.5 } });
    });

    COMMANDES.forEach((c) => {
      const ts = quand(now, c.j, c.h);
      const rows = {};
      c.lignes.forEach(([s, q]) => {
        const v = CATALOGUE.VM[s];
        rows[s] = { seen: '', loc: v.loc, qty: q, status: 'ok' };
        mouvements.push({ sku: s, type: TYPES.preparation, delta: -q, ref: bp(c.no), ts, by: 'Équipe préparation' });
      });
      orders.push({ no: c.no, date: ts - 3600e3 * 5, customerId: c.client, ship: c.ship,
        lines: c.lignes.map(([s, q]) => ({ sku: s, qty: q })),
        prep: { rows, doc: true, validated: true, complete: true, at: ts, par: 'Équipe préparation' } });
    });

    const tRet = quand(now, RETOUR.j, RETOUR.h);
    mouvements.push({ sku: RETOUR.sku, type: TYPES.retour, delta: RETOUR.qty, ref: RETOUR.no, ts: tRet, by: EQUIPE.retours.nom });
    const tCas = quand(now, CASSE.j, CASSE.h);
    mouvements.push({ sku: CASSE.sku, type: TYPES.casse, delta: -CASSE.qty, ref: CASSE.no, ts: tCas, by: EQUIPE.quai.nom });
    const tRei = quand(now, REINTEGRATION.j, REINTEGRATION.h);
    mouvements.push({ sku: REINTEGRATION.sku, type: TYPES.reintegration, delta: REINTEGRATION.qty, ref: REINTEGRATION.no, ts: tRei, by: PREPA.nom });

    // Le stock « après » de chaque mouvement se calcule dans l'ordre où le moteur les reçoit :
    // il faut donc les lui donner dans l'ordre du temps.
    mouvements.sort((a, b) => a.ts - b.ts);

    // Le « vu en stock » du bon de préparation : ce que le préparateur a lu au moment de
    // préparer, c'est-à-dire le stock juste avant sa sortie.
    const courant = { ...((db && db.stock) || INVENTAIRE_PRECEDENT) };
    mouvements.forEach((m) => {
      if (m.type === TYPES.preparation) {
        const o = orders.find((x) => bp(x.no) === m.ref);
        if (o) o.prep.rows[m.sku].seen = courant[m.sku] || 0;
      }
      courant[m.sku] = (courant[m.sku] || 0) + m.delta;
    });

    const aDejaBienvenue = ((db && db.mails) || []).some((m) => /^Bienvenue à l’entrepôt/.test(m.subject || ''));
    const cRet = CLIENTS[COMMANDES[0].client];
    const mails = [
      ...(aDejaBienvenue ? [] : [mailBienvenue(prenom, now - 3600e3 * 30)]),
      // Le relevé de comptage : les quantités viennent de `INVENTAIRE.lignes` (une seule source).
      // La remarque est celle de l'équipe de comptage ; la dernière phrase écarte une piste.
      { folder: 'in', ts: now - 3600e3 * 2, from: EQUIPE.inventaire.nom, fromMail: EQUIPE.inventaire.mail, to: prenom,
        subject: 'Relevé de comptage — allée A', kind: 'releve', inventaire: ID_INVENTAIRE,
        text: 'Bonjour,\n\nVoici le relevé du comptage de ce matin, allée A.\n\nL\'équipe inventaire',
        remarque: 'A-01-1 : bac compté d\'un coup, boîtes Kabeo en vrac. A-04-2 : recompté deux fois, bacs voisins vérifiés : rien d\'étranger dedans.' },
      { folder: 'in', ts: tRei + 3600e3 * 0.4, from: `${PREPA.nom}, ${PREPA.role}`, fromMail: PREPA.mail, to: prenom,
        subject: `Annulation de ${REINTEGRATION.commande}`, kind: 'text',
        text: `Bonjour,\n\nLe client de ${REINTEGRATION.commande} a annulé alors que j'avais déjà sorti ses articles. J'ai fait la réintégration ${REINTEGRATION.no}.\n\nArticle : ${BAT}, batterie externe 10 000 mAh\nQuantité : ${REINTEGRATION.qty}\nDécision : remise en rayon\n\nLe bac habituel était plein, je les ai posées dans l'allée A-03, sur l'étagère d'en face. Je ne sais plus dans quel bac exactement.\n\n${PREPA.nom}` },
      { folder: 'in', ts: now - 3600e3 * 5, from: `${EQUIPE.quai.nom}, ${EQUIPE.quai.role}`, fromMail: EQUIPE.quai.mail, to: prenom,
        subject: 'Palette Kabeo du 9 : un doute sur le rangement', kind: 'text',
        text: `Bonjour,\n\nEn préparant le passage de l'équipe de comptage, j'ai repensé à la palette Kabeo reçue il y a dix jours (REC-26-0431). Les cartons de câbles et de chargeurs sont de la même marque, de la même taille. Je crois en avoir rangé quelques-uns au mauvais endroit, côté A-01. Je n'ai pas eu le temps de regarder.\n\n${EQUIPE.quai.nom}` },
      { folder: 'in', ts: tRet + 3600e3 * 0.2, from: EQUIPE.retours.nom, fromMail: EQUIPE.retours.mail, to: prenom,
        subject: `Retour client ${RETOUR.no} remis en stock`, kind: 'text',
        text: `Bonjour,\n\nRetour client enregistré.\n\nDocument : ${RETOUR.no}\nCommande d'origine : ${RETOUR.commande} (${cRet.prenom} ${cRet.nom}, ${cRet.ville})\nArticle : ${RETOUR.sku}, écouteurs sans fil Bluetooth\nQuantité : ${RETOUR.qty}\nContrôle : emballage d'origine intact, article neuf\nDécision : remis en stock à l'emplacement ${CATALOGUE.VM[RETOUR.sku].loc}\n\nService retours, Cestas` },
      { folder: 'in', ts: tCas + 3600e3 * 0.3, from: `${EQUIPE.quai.nom}, ${EQUIPE.quai.role}`, fromMail: EQUIPE.quai.mail, to: prenom,
        subject: `Constat de casse ${CASSE.no}`, kind: 'text',
        text: `Bonjour,\n\nConstat de casse.\n\nDocument : ${CASSE.no}\nArticle : ${CASSE.sku}, souris sans fil\nQuantité : ${CASSE.qty}\nCirconstance : une souris dont le blister était éventré, inutilisable.\nDécision : sortie du stock et mise au rebut.\n\n${EQUIPE.quai.nom}` },
      mailMission(prenom, now),
    ];

    return { receptions, orders, mouvements, mails };
  },
};

/* ============================ Suivi de l'exercice ============================
 * Cinq jalons. Ils lisent l'état de l'écran Inventaire, avec **la même fonction que l'écran**
 * (`bilanInventaire`) : l'écran et la note ne peuvent pas diverger.
 *
 *   ok      le travail est fait et juste
 *   ko      il est fait mais à corriger
 *   attente l'élève n'a pas fini : rien n'est acquis (l'inaction ne rapporte rien)
 *   na      l'élève n'en est pas encore là (la période n'est pas semée)
 *
 * Les décisions ne sont jugées qu'à la VALIDATION : tant que l'inventaire n'est pas validé, un
 * choix peut encore changer. Les deux jalons de décisions sont séparés pour que la note dise
 * CE QUI a été compris : les rangements ratés (les trois lignes à ne pas régulariser) d'un côté,
 * l'écart sans cause (la seule régularisation) de l'autre.
 */

const bilan = (db) => bilanInventaire(db, INVENTAIRE, CATALOGUE);
const periodeSemee = (db) => (db.moves || []).length > 0;
const lignesDe = (b, refs) => b.lignes.filter((l) => refs.includes(l.ref));

export const REFS_RANGEMENT = [CAB, CHG, BAT];
export const REF_TEMOIN = COQ;

function jugerDecisions(db, refs) {
  if (!periodeSemee(db)) return { status: 'na' };
  const b = bilan(db);
  if (!b.valide) return { status: 'attente' };
  const ls = lignesDe(b, refs);
  const faux = ls.filter((l) => !l.juste);
  return { status: faux.length ? 'ko' : 'ok',
    detail: `${ls.length - faux.length} décision(s) juste(s) sur ${ls.length}.`
      + (faux.length ? '\nÀ revoir : ' + faux.map((l) => l.ref).join(', ') : '') };
}

export const ETAPES = [
  {
    id: 'comptage',
    titre: 'Comptage reporté sans erreur',
    verifier(db) {
      if (!periodeSemee(db)) return { status: 'na' };
      const b = bilan(db);
      return b.commence && b.saisieOk ? { status: 'ok' } : { status: 'attente' };
    },
  },
  {
    id: 'ecarts',
    titre: 'Écarts calculés (compté − système)',
    verifier(db) {
      if (!periodeSemee(db)) return { status: 'na' };
      const b = bilan(db);
      if (!b.commence || !b.saisieOk) return { status: 'attente' };
      return b.ecartsOk ? { status: 'ok' } : { status: 'attente' };
    },
  },
  {
    id: 'rangements',
    titre: 'Articles mal rangés repérés, sans régulariser à tort',
    verifier(db) { return jugerDecisions(db, REFS_RANGEMENT); },
  },
  {
    id: 'temoin',
    titre: 'Écart sans cause régularisé avec son motif',
    verifier(db) { return jugerDecisions(db, [REF_TEMOIN]); },
  },
  {
    id: 'taux',
    titre: 'Taux d’écart calculé',
    verifier(db) {
      if (!periodeSemee(db)) return { status: 'na' };
      const b = bilan(db);
      if (!b.valide) return { status: 'attente' };
      return { status: b.tauxOk ? 'ok' : 'ko', detail: `Taux attendu : ${String(b.tauxAttendu).replace('.', ',')} %.` };
    },
  },
];

