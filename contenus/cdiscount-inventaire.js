// Cdiscount — ENT-2.3 « Inventaire tournant ». Entraînement, C1.6.
//
// La séance qui TOUCHE au stock. Après ENT-2.1 (lire les mouvements) et ENT-2.2 (choisir dans le
// tableur les références à recompter), l'élève fait l'inventaire tournant de SA liste : il reporte
// le relevé de comptage pour ces références, calcule les écarts, cherche la cause de chacun dans
// les mouvements et les messages, décide (régulariser avec un motif, remettre en rayon,
// recompter), puis calcule le taux d'écart. Écran : `core/types/inventaire.js` ; format des
// données : `claude/prepalog-inventaire-format.md`.
//
// Réglages décidés par Tristan le 02/10/2026 : correction DÉTAILLÉE (c'est de l'entraînement :
// l'élève voit pourquoi), écarts et taux calculés par l'ÉLÈVE, comptage à l'aveugle, relevé
// papier par la messagerie, motif obligatoire.
//
// RECADRÉE LE 04/10/2026 (brief `docs/briefs/ENT-2.3-inventaire-recadre.md`, C4 de la refonte) :
//   - l'élève ne compte que SA liste. Nadia la lui redemande à l'ouverture (amorce
//     « À recompter : ») ; la première réponse reconnue la fixe ; l'accusé de réception, le relevé
//     et la mission n'arrivent qu'ensuite (déclencheur). Le relevé couvre toute l'allée ; l'écran
//     Inventaire ne montre que le PÉRIMÈTRE (`perimetre`, lot 0 du même chantier) ;
//   - une référence à écart OUBLIÉE revient par un aléa (un préparateur signale le rayon) : elle
//     entre dans le périmètre. Son oubli s'est déjà payé en ENT-2.2 (une erreur ne se paie qu'une
//     fois) ; une référence sans écart dans la liste se compte, écart 0, aucune décision ;
//   - « Absent » (dit par l'enseignant, JAMAIS écrit dans un message) → la liste d'un collègue ;
//   - catalogue étendu à toute l'allée A (12 références) : A-05 / A-06 bougent, sans écart. Un
//     élève CONFIRMÉ (`db.aisance`, jamais montré) les recompte en plus : 4 lignes de plus ;
//   - « Stock trouvé » des bons de préparation = stock RÉEL au rayon (comme ENT-2.1) : il porte les
//     signaux qu'ENT-2.2 exporte. ENT-2.2 importe d'ici commandes, réceptions et stock réel
//     (`periode`) : une seule source pour les deux séances ;
//   - CMD-732153 porte le statut « Annulée » (C1).
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
// ligne où régulariser est juste (motif « Démarque inconnue »).
//
// Ce que la séance ne sème PAS : casse non déclarée, retour non enregistré, erreur de saisie
// (écartés par Tristan le 02/10/2026 ; ENT-2.1 a déjà montré un retour et une casse DÉCLARÉS).
//
// Tout est CONSTRUIT (voir l'en-tête de `contenus/cdiscount.js`), dont les personnes nouvelles :
// Mathis Darrigade (équipe stock, auteur de la liste du collègue), Yanis Cazenave (préparateur,
// auteur des aléas), Inès Lagarde (préparatrice).

import { CUSTOMERS, EQUIPE, mailBienvenue, sousCatalogue } from './cdiscount.js';
import { TYPES as TYPES_21 } from './cdiscount-mouvements.js';
import { bilanInventaire } from '../core/types/inventaire.js';
import { ligne, nrm } from '../core/declencheurs.js';

/* ------------------------------------------------------------------ périmètre */

// Toute l'allée A, dans l'ordre des emplacements : c'est l'ordre du relevé de comptage. Les huit
// premiers (A-01-1 à A-04-2) sont ceux de la maquette de l'écran Inventaire ; A-05 et A-06 bougent
// pendant la période, sans écart (le lot en plus d'un élève confirmé).
export const MODELES = ['CAB-USBC-1M', 'CHG-20W', 'ECO-BT-01', 'SOU-SF-02', 'BAT-10K', 'CLE-64G', 'AMP-LED-E27', 'COQ-UNI-01',
  'CAS-FIL-01', 'SUP-VOIT', 'CLA-SF-01', 'HUB-USB-4'];
export const CATALOGUE = sousCatalogue(MODELES);

const [CAB, CHG, ECO, SOU, BAT, CLE, AMP, COQ, CAS, SUP, CLA, HUB] = MODELES;

// Les quatre références où le stock réel s'écarte du système (ordre des emplacements) : la bonne
// liste à recompter, celle qu'ENT-2.2 fait trouver, et celle du collègue (« Absent »).
export const REFS_A_ECART = [CAB, CHG, BAT, COQ];
// Le lot en plus d'un élève confirmé : A-05 et A-06.
export const REFS_CONFIRME = [CAS, SUP, CLA, HUB];

// Le stock compté au dernier inventaire, il y a dix jours : la base de départ de l'élève. Les
// mouvements de la période arrivent par le volet et s'y ajoutent.
export const INVENTAIRE_PRECEDENT = { [CAB]: 30, [CHG]: 18, [ECO]: 25, [SOU]: 20, [BAT]: 12, [CLE]: 20, [AMP]: 40, [COQ]: 30,
  [CAS]: 15, [SUP]: 25, [CLA]: 12, [HUB]: 18 };
export const JOURS_DEPUIS_INVENTAIRE = 10;

export const VOLUME = { references: 12, documents: 21, mouvements: 36 };

/* ------------------------------------------------------------------ la période */

export const RECEPTIONS = [
  { no: 'REC-26-0431', supId: 'F01', j: 9, h: 9.2, bl: 'BL-KB-88415', lot: 'LOT-KB-2701', transporteur: 'Kabeo, livraison directe',
    lignes: [[CAB, 40, [20, 20]], [CHG, 30, [10, 10, 10]]] },
  { no: 'REC-26-0434', supId: 'F03', j: 7, h: 9.8, bl: 'BL-KL-61207', lot: 'LOT-KL-2702', transporteur: 'Geodis, tournée 7',
    lignes: [[SOU, 12, [12]], [CLE, 20, [10, 10]]] },
];

// Seize commandes (onze sur A-01 à A-04, cinq sur A-05 / A-06). CMD-732153 est ANNULÉE par le
// client pendant la préparation : ses deux batteries sortent, puis rentrent (réintégration).
// C'est le second rangement raté. Exportées pour ENT-2.2 (mêmes commandes, une seule source).
export const COMMANDES = [
  { no: 'CMD-732101', client: 'C0004', ship: 'COL', j: 9, h: 14, lignes: [[ECO, 2], [CAB, 1]] },
  { no: 'CMD-732109', client: 'C0003', ship: 'REL', j: 9, h: 11, lignes: [[CAS, 1], [SUP, 2]] },
  { no: 'CMD-732118', client: 'C0009', ship: 'REL', j: 8, h: 10.5, lignes: [[CHG, 1], [AMP, 2]] },
  { no: 'CMD-732126', client: 'C0013', ship: 'COL', j: 8, h: 15, lignes: [[COQ, 1]] },
  { no: 'CMD-732132', client: 'C0005', ship: 'COL', j: 7, h: 16, lignes: [[HUB, 1], [CLA, 1]] },
  { no: 'CMD-732140', client: 'C0002', ship: 'CHR', j: 7, h: 13.5, lignes: [[SOU, 1], [CLE, 2]] },
  { no: 'CMD-732153', client: 'C0017', ship: 'COL', j: 6, h: 10, lignes: [[BAT, 2]] },
  { no: 'CMD-732167', client: 'C0006', ship: 'REL', j: 6, h: 15.5, lignes: [[ECO, 1], [CHG, 2]] },
  { no: 'CMD-732174', client: 'C0007', ship: 'CHR', j: 5, h: 10.5, lignes: [[SUP, 1], [CAS, 1]] },
  { no: 'CMD-732181', client: 'C0011', ship: 'COL', j: 5, h: 14, lignes: [[CAB, 2], [COQ, 2]] },
  { no: 'CMD-732195', client: 'C0015', ship: 'REL', j: 4, h: 11, lignes: [[BAT, 1], [SOU, 1], [AMP, 1]] },
  { no: 'CMD-732202', client: 'C0010', ship: 'COL', j: 3, h: 16, lignes: [[CLA, 2], [HUB, 1]] },
  { no: 'CMD-732210', client: 'C0001', ship: 'CHR', j: 3, h: 14, lignes: [[ECO, 1], [CHG, 1], [CLE, 1]] },
  { no: 'CMD-732226', client: 'C0019', ship: 'COL', j: 2, h: 10.25, lignes: [[CAB, 3]] },
  { no: 'CMD-732233', client: 'C0012', ship: 'REL', j: 1, h: 10, lignes: [[CAS, 1]] },
  { no: 'CMD-732239', client: 'C0008', ship: 'COL', j: 1, h: 13.7, lignes: [[BAT, 1]] },
];

// Un retour client (déclaré, remis en rayon) et une casse (déclarée) : ce sont des mouvements
// NORMAUX de la période, avec leur document, que l'élève a déjà appris à lire en ENT-2.1. Ils ne
// sont pas des pièges ici : ils donnent du volume et des lignes sans écart.
export const RETOUR = { no: 'RET-26-0107', commande: 'CMD-731988', sku: ECO, qty: 1, j: 4, h: 16.75 };
export const CASSE = { no: 'DEM-26-0031', sku: SOU, qty: 1, j: 3, h: 9.5 };
export const REINTEGRATION = { no: 'REI-26-0012', commande: 'CMD-732153', sku: BAT, qty: 2, j: 5, h: 9 };
// La commande annulée (statut « Annulée », brief MOTEUR-statut-annulee) : celle de la réintégration.
export const ANNULATION = { commande: REINTEGRATION.commande, motif: 'Annulée par le client pendant la préparation' };
// Les deux coques disparues : AUCUN document, aucun mouvement. Le stock réel baisse entre le
// dernier inventaire et la première préparation de coques (CMD-732126, J-8 à 15 h).
export const DEMARQUE = { sku: COQ, qty: 2, j: 9, h: 18 };

export const TYPES = {
  ...TYPES_21,
  reintegration: 'Entrée : préparation annulée',
};

// La préparatrice qui a annulé et réintégré, et le préparateur des aléas : propres à cette
// séance (inventés, adresses en .example).
const PREPA = { nom: 'Inès Lagarde', role: 'préparatrice', mail: 'i.lagarde@cdiscount.example' };
const PREPARATEUR = { nom: 'Yanis Cazenave', role: 'préparateur', mail: 'y.cazenave@cdiscount.example' };
// Qui a préparé chaque commande (la colonne « Préparateur » de l'export d'ENT-2.2) : à tour de
// rôle, et Inès pour la commande qu'elle a annulée. Inventés.
export const PREPARATEURS = [PREPARATEUR.nom, PREPA.nom, 'Sofiane Brettes'];
export const preparateurDe = (no, i) => (no === REINTEGRATION.commande ? PREPA.nom : PREPARATEURS[i % PREPARATEURS.length]);
const COLLEGUE = 'Mathis Darrigade';

/* ------------------------------------------------------------------ outils */

const JOUR = 3600e3 * 24;
const minuit = (t) => { const d = new Date(t); d.setHours(0, 0, 0, 0); return d.getTime(); };
const quand = (now, j, h) => minuit(now) - j * JOUR + Math.round(h * 3600e3);
export const bp = (cmd) => 'BP-' + cmd.replace('CMD-', '');
const fdate = (t) => new Date(t).toLocaleDateString('fr-FR');

export function dateInventaire(now = Date.now()) {
  return quand(now, JOURS_DEPUIS_INVENTAIRE, 7);
}

/* ------------------------------------------------------------------ stock réel
 * Ce qui s'écarte du système, et quand (une seule source pour ENT-2.2 et ENT-2.3) :
 *   - REC-26-0431 : trois chargeurs rangés dans le bac des câbles → au rayon, câbles +3,
 *     chargeurs −3 (le système, lui, est juste) ;
 *   - REI-26-0012 : les deux batteries réintégrées posées ailleurs → au rayon, batteries −2 ;
 *   - la démarque des coques (aucun document) → coques −2 au rayon, le système ne le sait pas.
 * `ecartsReelsApres(m)` : les écarts que le mouvement `m` fait naître au rayon.
 */
export function ecartsReelsApres(m) {
  if (m.ref === 'REC-26-0431' && m.sku === CHG) return { [CAB]: 3, [CHG]: -3 };
  if (m.ref === REINTEGRATION.no) return { [BAT]: -REINTEGRATION.qty };
  return null;
}

// La période, construite pour une date d'ouverture : réceptions, commandes, mouvements (dans
// l'ordre du temps), et pour chaque ligne de préparation le stock du système juste avant la
// sortie (`logiciel`) et le stock réel au rayon (`trouve`, le « Stock trouvé » du bon).
// `depart` : le stock compté au dernier inventaire. Fonction pure : ENT-2.2 l'appelle aussi.
export function periode(now = Date.now(), depart = INVENTAIRE_PRECEDENT) {
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
  COMMANDES.forEach((c, i) => {
    const ts = quand(now, c.j, c.h);
    const rows = {};
    const par = preparateurDe(c.no, i);
    c.lignes.forEach(([s, q]) => {
      rows[s] = { seen: '', loc: CATALOGUE.VM[s].loc, qty: q, status: 'ok' };
      mouvements.push({ sku: s, type: TYPES.preparation, delta: -q, ref: bp(c.no), ts, by: par });
    });
    const o = { no: c.no, date: ts - 3600e3 * 5, customerId: c.client, ship: c.ship,
      lines: c.lignes.map(([s, q]) => ({ sku: s, qty: q })),
      prep: { rows, doc: true, validated: true, complete: true, at: ts, par } };
    // Préparée, puis annulée par le client : la réintégration fait rentrer ses articles. Son bon
    // reste lisible, figé.
    if (c.no === ANNULATION.commande) o.annulee = { motif: ANNULATION.motif, at: quand(now, REINTEGRATION.j, REINTEGRATION.h) - 3600e3 * 0.5 };
    orders.push(o);
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

  // Système et rayon, mouvement après mouvement. Le bon de préparation porte ce que le
  // préparateur a vu au rayon juste avant sa sortie : le stock RÉEL.
  const systeme = { ...depart };
  const reel = { ...depart };
  const tDem = quand(now, DEMARQUE.j, DEMARQUE.h);
  let demarquee = false;
  const demarquer = () => { reel[DEMARQUE.sku] -= DEMARQUE.qty; demarquee = true; };
  const preparations = [];
  mouvements.forEach((m) => {
    if (!demarquee && m.ts > tDem) demarquer();
    if (m.type === TYPES.preparation) {
      const o = orders.find((x) => bp(x.no) === m.ref);
      const trouve = Math.max(0, reel[m.sku] || 0);
      if (o) o.prep.rows[m.sku].seen = trouve;
      preparations.push({ ts: m.ts, bon: m.ref, commande: o ? o.no : '', sku: m.sku, qty: -m.delta,
        logiciel: systeme[m.sku] || 0, trouve });
    }
    systeme[m.sku] = (systeme[m.sku] || 0) + m.delta;
    reel[m.sku] = (reel[m.sku] || 0) + m.delta;
    const ec = ecartsReelsApres(m);
    if (ec) Object.entries(ec).forEach(([s, d]) => { reel[s] += d; });
  });
  if (!demarquee) demarquer();
  orders.sort((a, b) => a.prep.at - b.prep.at);
  return { receptions, orders, mouvements, preparations, systeme, reel, tRet, tCas, tRei };
}

/* ------------------------------------------------------------------ la liste de l'élève
 * Calculée depuis la messagerie (fonction pure de `db.mails`), jamais rangée à part : rien à
 * cloisonner de plus que la base de la séance. La première réponse ENVOYÉE à Nadia qui contient
 * au moins une référence connue de l'allée A — ou le mot « absent » sans aucune référence — fixe
 * la liste ; les suivantes ne changent rien.
 * Extraction : sur la ligne « À recompter » (sinon tout le message) ; casse, espaces, tirets et
 * ponctuation ignorés ; un mot qui n'est aucune référence de l'allée est ignoré sans message.
 */
export const LIGNE_LISTE = 'À recompter :';
const cle = (t) => nrm(t).replace(/[^a-z0-9]/g, '');
const CLES = MODELES.map((r) => [cle(r), r]);

// Les références connues d'un texte, dans l'ordre des emplacements, sans doublon. Les morceaux
// se coupent aux virgules, points-virgules, barres et retours à la ligne : « bat 10k » reste un
// seul morceau, lu « bat10k ».
// `modeles` : les références reconnues (toute l'allée A par défaut ; ENT-2.6 passe les siennes).
export function extraireRefs(texte, modeles = MODELES) {
  const l = ligne(texte, LIGNE_LISTE);
  let t = l !== null ? l : String(texte || '');
  if (l !== null && t.includes(':')) t = t.slice(t.indexOf(':') + 1);
  const morceaux = t.split(/[,;/\n]+/).map(cle).filter(Boolean);
  const vues = new Set();
  const cles = modeles === MODELES ? CLES : modeles.map((r) => [cle(r), r]);
  morceaux.forEach((m) => cles.forEach(([k, r]) => { if (m.includes(k)) vues.add(r); }));
  return modeles.filter((r) => vues.has(r));
}

// La réponse « Absent » : aucune référence, et le mot (casse et accents ignorés).
const ditAbsent = (texte) => {
  const l = ligne(texte, LIGNE_LISTE);
  return /absent/.test(nrm(l !== null ? l : texte));
};

const versNadia = (db) => ((db && db.mails) || [])
  .filter((m) => m.folder === 'out' && nrm(m.toMail) === nrm(EQUIPE.cheffe.mail))
  .slice().sort((a, b) => (a.ts || 0) - (b.ts || 0));

// Ce que l'élève a répondu, ou null : { refs, absent } (absent → la liste du collègue).
export function listeEleve(db) {
  for (const m of versNadia(db)) {
    const refs = extraireRefs(m.text);
    if (refs.length) return { refs, absent: false };
    if (ditAbsent(m.text)) return { refs: REFS_A_ECART.slice(), absent: true };
  }
  return null;
}

const estConfirme = (db) => !!db && db.aisance === 'confirme';
// Les références à écart oubliées : elles reviennent par un aléa.
export const aleasDe = (refs) => REFS_A_ECART.filter((r) => !refs.includes(r));

// Le périmètre de l'écran Inventaire : sa liste, les aléas, et A-05 / A-06 pour un confirmé ;
// null tant qu'aucune réponse n'est reconnue.
export function perimetre(db) {
  const l = listeEleve(db);
  if (!l) return null;
  const p = new Set([...l.refs, ...aleasDe(l.refs), ...(estConfirme(db) ? REFS_CONFIRME : [])]);
  return MODELES.filter((r) => p.has(r));
}

/* ------------------------------------------------------------------ l'inventaire */

// Les quantités relevées par l'équipe, dans l'ordre des emplacements. Stock du SYSTÈME au
// moment du comptage (aujourd'hui, après les 36 mouvements) :
//   CAB 64  CHG 44  ECO 22  SOU 29  BAT 10  CLE 37  AMP 37  COQ 27   CAS 12  SUP 22  CLA 9  HUB 16
// Écarts : CAB +3, CHG −3, BAT −2, COQ −2, rien ailleurs. Le taux se calcule sur le PÉRIMÈTRE de
// l'élève : la bonne liste seule, 10 ÷ 145 = 6,9 % ; avec A-05 / A-06 (confirmé), 10 ÷ 204 = 4,9 %.
export const ID_INVENTAIRE = 'INV-2026-52';

export const INVENTAIRE = {
  id: ID_INVENTAIRE,
  titre: 'Inventaire tournant — allée A',
  sousTitre: 'Comptage de la semaine · les références de votre liste',
  source: 'releve',
  aveugle: true,
  ecarts: 'eleve',            // l'élève calcule les écarts et le taux : c'est de l'entraînement
  correction: 'detaillee',    // décision de Tristan (02/10/2026) : il voit pourquoi
  motifObligatoire: true,
  // L'élève ne compte que sa liste (+ les aléas, + A-05 / A-06 s'il est confirmé).
  perimetre,
  attentePerimetre: 'En attente de votre liste : répondez à Nadia Ferrand (Messagerie).',
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
    { ref: CAS, compte: 12 },
    { ref: SUP, compte: 22 },
    { ref: CLA, compte: 9 },
    { ref: HUB, compte: 16 },
  ],
};

/* ------------------------------------------------------------------ base et volet */

export const EXERCICE = 'Exercice 3 : faire l’inventaire d’une allée';

export const ACCUEIL = {
  titre: 'Un inventaire tournant, dans l’ordre',
  // Pas de compteur de stock sur l'accueil : il donnerait le total du système avant le comptage.
  kpis: ['mail'],
  etapes: [
    ['Redonner votre liste à Nadia Ferrand', 'Messagerie. Répondez-lui « À recompter : » puis les références que vous avez retenues.'],
    ['Reporter le comptage', 'Menu Inventaire. Le relevé de l’équipe est dans la Messagerie : recopiez-le pour les références de votre liste.'],
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
const signature = `${EQUIPE.cheffe.nom}, ${EQUIPE.cheffe.role}`;

// À l'ouverture : Nadia redemande la liste. Le champ « Répondre » s'ouvre sur l'amorce.
function mailDemandeListe(prenom, now) {
  return { folder: 'in', ts: now - 3600e3 * 1.5, from: signature, fromMail: EQUIPE.cheffe.mail, to: prenom,
    subject: 'Inventaire de l’allée A : votre liste', kind: 'text',
    amorce: `${LIGNE_LISTE} `,
    text: `Bonjour ${prenom},\n\nAvant que l'équipe ne vous envoie son relevé, rappelez-moi les références de l'allée A que vous avez retenues après l'analyse des constats. Répondez en commençant par « ${LIGNE_LISTE} », les références séparées par des virgules.\n\nMerci,\n${EQUIPE.cheffe.nom}` };
}

function mailMission(prenom, now) {
  const inv = fdate(dateInventaire(now));
  return { folder: 'in', ts: now, from: signature, fromMail: EQUIPE.cheffe.mail, to: prenom,
    subject: 'Inventaire de l’allée A : c’est pour vous', kind: 'text',
    text: `Bonjour ${prenom},\n\nLe dernier inventaire de l'allée A date du ${inv}. L'équipe de comptage vient de repasser dans l'allée : son relevé est dans votre messagerie. Il couvre toute l'allée ; vous, vous traitez les références de votre liste.\n\nÀ vous de faire l'inventaire dans le système (menu Inventaire) :\n\n1. Reportez le relevé de comptage pour les références de votre liste, emplacement par emplacement.\n2. Calculez l'écart de chaque ligne : compté moins système.\n3. Pour chaque écart, cherchez la cause : les mouvements de l'article depuis le dernier inventaire, et vos messages. Regardez aussi les autres lignes : un écart sur un article peut en cacher un autre.\n4. Décidez : régulariser le stock du système (avec un motif), ne pas régulariser et remettre la marchandise en rayon, ou demander un recomptage.\n5. Calculez le taux d'écart de l'inventaire, puis validez.\n\nAttention : le stock du système reste caché tant que vous n'avez pas validé le comptage. C'est voulu : on compte ce qu'on voit, sans se laisser influencer.\n\nUne régularisation change le stock pour de bon : réfléchissez avant d'en passer une.\n\nMerci,\n${EQUIPE.cheffe.nom}` };
}

// Le relevé de comptage : les quantités viennent de `INVENTAIRE.lignes` (une seule source). La
// remarque est celle de l'équipe de comptage ; la dernière phrase écarte une piste.
function mailReleve(prenom, ts) {
  return { folder: 'in', ts, from: EQUIPE.inventaire.nom, fromMail: EQUIPE.inventaire.mail, to: prenom,
    subject: 'Relevé de comptage — allée A', kind: 'releve', inventaire: ID_INVENTAIRE,
    text: 'Bonjour,\n\nVoici le relevé du comptage de ce matin, allée A.\n\nL\'équipe inventaire',
    remarque: 'A-01-1 : bac compté d\'un coup, boîtes Kabeo en vrac. A-04-2 : recompté deux fois, bacs voisins vérifiés : rien d\'étranger dedans.' };
}

// Les aléas : un préparateur signale le rayon d'une référence à écart que l'élève n'a pas retenue.
const ALEAS = {
  [CHG]: 'En préparant ce matin, j\'ai trouvé moins de chargeurs CHG-20W en A-01-2 que ce que le système affiche. Quelqu\'un peut recompter ?',
  [CAB]: 'Le bac A-01-1 des câbles déborde : il y a plus de boîtes que ce que le système affiche.',
  [BAT]: 'Il manque des batteries BAT-10K en A-03-1 par rapport au système.',
  [COQ]: 'Il manque des coques COQ-UNI-01 en A-04-2 par rapport au système.',
};
export const SUJET_ALEA = 'Rayon à vérifier : ';
const PHRASE_CONFIRME = 'Tant que l\'équipe passe, recomptez aussi A-05 et A-06 : leur comptage tournant tombe cette semaine.';

export const VOLET = {
  id: 'inventaire-1',
  semer(prenom, db) {
    const now = Date.now();
    const P = periode(now, (db && db.stock) || INVENTAIRE_PRECEDENT);
    const aDejaBienvenue = ((db && db.mails) || []).some((m) => /^Bienvenue à l’entrepôt/.test(m.subject || ''));
    const cRet = CLIENTS[COMMANDES[0].client];
    // À l'ouverture : la demande de liste et les messages d'enquête. Le relevé et la mission
    // n'arrivent qu'une fois la liste reconnue (déclencheur « liste » ci-dessous).
    const mails = [
      ...(aDejaBienvenue ? [] : [mailBienvenue(prenom, now - 3600e3 * 30)]),
      { folder: 'in', ts: P.tRei + 3600e3 * 0.4, from: `${PREPA.nom}, ${PREPA.role}`, fromMail: PREPA.mail, to: prenom,
        subject: `Annulation de ${REINTEGRATION.commande}`, kind: 'text',
        text: `Bonjour,\n\nLe client de ${REINTEGRATION.commande} a annulé alors que j'avais déjà sorti ses articles. J'ai fait la réintégration ${REINTEGRATION.no}.\n\nArticle : ${BAT}, batterie externe 10 000 mAh\nQuantité : ${REINTEGRATION.qty}\nDécision : remise en rayon\n\nLe bac habituel était plein, je les ai posées dans l'allée A-03, sur l'étagère d'en face. Je ne sais plus dans quel bac exactement.\n\n${PREPA.nom}` },
      { folder: 'in', ts: now - 3600e3 * 5, from: `${EQUIPE.quai.nom}, ${EQUIPE.quai.role}`, fromMail: EQUIPE.quai.mail, to: prenom,
        subject: 'Palette Kabeo du 9 : un doute sur le rangement', kind: 'text',
        text: `Bonjour,\n\nEn préparant le passage de l'équipe de comptage, j'ai repensé à la palette Kabeo reçue il y a dix jours (REC-26-0431). Les cartons de câbles et de chargeurs sont de la même marque, de la même taille. Je crois en avoir rangé quelques-uns au mauvais endroit, côté A-01. Je n'ai pas eu le temps de regarder.\n\n${EQUIPE.quai.nom}` },
      { folder: 'in', ts: P.tRet + 3600e3 * 0.2, from: EQUIPE.retours.nom, fromMail: EQUIPE.retours.mail, to: prenom,
        subject: `Retour client ${RETOUR.no} remis en stock`, kind: 'text',
        text: `Bonjour,\n\nRetour client enregistré.\n\nDocument : ${RETOUR.no}\nCommande d'origine : ${RETOUR.commande} (${cRet.prenom} ${cRet.nom}, ${cRet.ville})\nArticle : ${RETOUR.sku}, écouteurs sans fil Bluetooth\nQuantité : ${RETOUR.qty}\nContrôle : emballage d'origine intact, article neuf\nDécision : remis en stock à l'emplacement ${CATALOGUE.VM[RETOUR.sku].loc}\n\nService retours, Cestas` },
      { folder: 'in', ts: P.tCas + 3600e3 * 0.3, from: `${EQUIPE.quai.nom}, ${EQUIPE.quai.role}`, fromMail: EQUIPE.quai.mail, to: prenom,
        subject: `Constat de casse ${CASSE.no}`, kind: 'text',
        text: `Bonjour,\n\nConstat de casse.\n\nDocument : ${CASSE.no}\nArticle : ${CASSE.sku}, souris sans fil\nQuantité : ${CASSE.qty}\nCirconstance : une souris dont le blister était éventré, inutilisable.\nDécision : sortie du stock et mise au rebut.\n\n${EQUIPE.quai.nom}` },
      mailDemandeListe(prenom, now),
    ];
    return { receptions: P.receptions, orders: P.orders, mouvements: P.mouvements, mails };
  },
  // La liste reconnue (ou « Absent ») fait arriver, une seule fois : l'accusé de Nadia (neutre :
  // il ne dit jamais si la liste est bonne), le relevé, la mission, puis un aléa par référence à
  // écart oubliée, quelques minutes plus tard dans l'horodatage (avant que l'élève n'ait commencé
  // à saisir : le comptage ne se rouvre pas). Rien de reconnu → un seul rappel.
  declencheurs: [{
    id: 'liste',
    quand: (db) => !!listeEleve(db),
    semer(prenom, db) {
      const l = listeEleve(db);
      if (!l) return { mails: [] };
      const now = Date.now();
      const enPlus = estConfirme(db) ? `\n\n${PHRASE_CONFIRME}` : '';
      const corps = l.absent
        ? `Pas de souci. Voici la liste préparée par ${COLLEGUE}, de l'équipe stock : ${LIGNE_LISTE} ${REFS_A_ECART.join(', ')}. Le relevé arrive.`
        : `C'est noté : vous recomptez ${l.refs.join(', ')}. L'équipe inventaire vous envoie son relevé de l'allée.`;
      const mails = [
        { folder: 'in', ts: now + 1000, from: signature, fromMail: EQUIPE.cheffe.mail, to: prenom,
          subject: 'Votre liste à recompter', kind: 'text',
          text: `Bonjour ${prenom},\n\n${corps}${enPlus}\n\n${EQUIPE.cheffe.nom}` },
        mailReleve(prenom, now + 2000),
        mailMission(prenom, now + 3000),
        ...aleasDe(l.refs).map((r, i) => ({ folder: 'in', ts: now + 3 * 60e3 + i * 60e3,
          from: `${PREPARATEUR.nom}, ${PREPARATEUR.role}`, fromMail: PREPARATEUR.mail, to: prenom,
          subject: SUJET_ALEA + r, kind: 'text', text: `Bonjour,\n\n${ALEAS[r]}\n\n${PREPARATEUR.nom}` })),
      ];
      return { mails };
    },
  }, {
    id: 'rappel',
    quand: (db) => versNadia(db).length > 0 && !listeEleve(db),
    semer(prenom) {
      return { mails: [{ folder: 'in', ts: Date.now() + 1000, from: signature, fromMail: EQUIPE.cheffe.mail, to: prenom,
        subject: 'Votre liste : je n’ai rien reconnu', kind: 'text', amorce: `${LIGNE_LISTE} `,
        text: `Bonjour ${prenom},\n\nJe n'ai reconnu aucune référence de l'allée A dans votre message. Renvoyez-moi la liste, références écrites comme sur l'écran Stock.\n\n${EQUIPE.cheffe.nom}` }] };
    },
  }],
};

/* ============================ Suivi de l'exercice ============================
 * Cinq jalons. Ils lisent l'état de l'écran Inventaire, avec **la même fonction que l'écran**
 * (`bilanInventaire`), donc SUR LE PÉRIMÈTRE de l'élève : l'écran et la note ne peuvent pas
 * diverger. Aucun jalon sur la liste elle-même : elle est jugée en ENT-2.2. Les quatre références
 * à écart sont toujours dans le périmètre (liste ou aléa).
 *
 *   ok      le travail est fait et juste
 *   ko      il est fait mais à corriger
 *   attente l'élève n'a pas fini (ou pas encore donné sa liste) : rien n'est acquis
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
  return { status: faux.length || !ls.length ? 'ko' : 'ok',
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
