// Cdiscount — ENT-2.5 « Le compte à rebours ». ÉVALUATION (coef. 3), C1.6. Copie rendue.
// Écrite le 04/10/2026 (brief `docs/briefs/ENT-2.5-compte-a-rebours.md`, chantier C8).
//
// L'élève mène SEUL la boucle complète, sur une allée neuve (l'allée C, jamais vue dans la série) :
// exporter les lignes de préparation (écran Extractions, critères à choisir), analyser dans le tableur (Écart, SI, NB.SI), déposer son
// fichier (UN dépôt, aucun retour), envoyer à Nadia sa liste « À recompter : », faire l'inventaire
// de cette liste (écran Inventaire, aveugle, AUCUNE correction), rendre compte (« Régularisé : »,
// « Valeur régularisée : »), rendre sa copie. Aucune notion nouvelle, aucun retour à l'écran.
//
// UN JEU TIRÉ PAR ÉLÈVE (décision de Tristan du 03/10/2026, `docs/briefs/DECISION-jeu-unique-
// evaluations.md`) : graine = l'identifiant de l'élève (`core/tirage.js`, posée dans sa base à la
// première ouverture). STRUCTURE COMMUNE, toujours respectée (contrainte d'équité, vérifiée par
// `verifier` — un jeu qui la viole est retiré) : 6 références, 3 écarts — UN DE CHAQUE SORTE —
// et 3 références sans écart.
//   rayon      après une commande annulée en préparation, les articles réintégrés ont été posés
//              dans un autre bac (message de la préparatrice) → ne pas régulariser, remettre en rayon ;
//   regul      manque sans cause (aucun mouvement, aucun message, « recompté deux fois, bacs voisins
//              vérifiés ») → régulariser, motif « Démarque inconnue » ;
//   recompter  le surplus de la dernière réception a été monté en réserve, au-dessus de
//              l'emplacement (message du cariste) ; le relevé n'a compté que le prélèvement →
//              demander un recomptage (il redonne le stock du système).
// TIRÉS : quelle référence porte quelle sorte, les stocks de départ, les écarts (rayon 2-4,
// régulariser 1-3, recompter 3-6, en manque), les commandes (36 à 44 lignes, au moins 2 constats
// par référence à écart, aucun sur les trois autres), les dates et les numéros de documents.
// VÉRIFIÉ : stocks jamais négatifs, taux d'écart du périmètre exact entre 2 % et 8 %, une casse et
// un retour normaux sur des références sans écart. Le niveau de l'élève n'entre PAS dans le tirage :
// l'évaluation est la même pour tous.
//
// ⚠ Le jeu est une fonction pure de la graine : NE RIEN CHANGER au tirage entre l'ouverture de
// l'évaluation et le ramassage (le jeu de chaque élève changerait).
//
// Tout est CONSTRUIT (voir l'en-tête de `contenus/cdiscount.js`) : l'allée C, tous les chiffres
// tirés, les personnages (Lucie Barrère, préparatrice ; Yanis Cazenave, préparateur — inventés).

import { CATALOGUE as CATALOGUE_COMPLET, EQUIPE, mailBienvenue, lignesPreparation, sousCatalogue } from './cdiscount.js';
import { extraireRefs, LIGNE_LISTE } from './cdiscount-inventaire.js';
import { tirerJeu, hasard, graineDeBase } from '../core/tirage.js';
import { bilanInventaire } from '../core/types/inventaire.js';
import { resultatDepot, statutExport } from '../core/types/export-tableur.js';
import { preparationsAEcarter, refsAllees, filtreAllee } from './cdiscount.js';
import { ligne, nombres, nrm } from '../core/declencheurs.js';

export const MODELES = ['GOU-ISO-75', 'COR-SAU', 'TAP-YOG', 'BAL-FOOT', 'LAM-FRO', 'ELA-FIT-3'];
export const CATALOGUE = sousCatalogue(MODELES);
export const SORTES = ['rayon', 'regul', 'recompter'];
export const PLAGES = { rayon: [2, 4], regul: [1, 3], recompter: [3, 6] };
export const LIGNES_MIN = 36, LIGNES_MAX = 44;
export const TAUX_MIN = 2, TAUX_MAX = 8;
export const JOURS_DEPUIS_INVENTAIRE = 10;
export const ID_INVENTAIRE = 'INV-2026-58';
export const MOTIF_REGUL = 'Démarque inconnue';

const PREPARATEURS = ['Yanis Cazenave', 'Lucie Barrère', 'Sofiane Brettes'];
const LUCIE = { nom: 'Lucie Barrère', role: 'préparatrice', mail: 'l.barrere@cdiscount.example' };
const YANIS = { nom: 'Yanis Cazenave', role: 'préparateur', mail: 'y.cazenave@cdiscount.example' };
const coutDe = (sku) => CATALOGUE_COMPLET.VM[sku].model.cost;
const nomDe = (sku) => { const v = CATALOGUE_COMPLET.VM[sku]; return [v.model.brand, v.model.name].filter(Boolean).join(' '); };
const nomCourt = (sku) => CATALOGUE_COMPLET.VM[sku].model.name.toLowerCase();

/* ================================================================== le tirage */

// Un jeu : la répartition des sortes, les stocks de départ, les écarts, les événements, les
// préparations (jour, heure, quantité), et tout ce qui s'en déduit (système, rayon, relevé).
// Les dates sont des JOURS AVANT la séance (j) et des heures : elles se posent sur le calendrier
// à l'ouverture.
function tirer(h) {
  const tri = h.prendre(MODELES, 6);
  const sorte = { rayon: tri[0], regul: tri[1], recompter: tri[2] };
  const sans = tri.slice(3);
  const ecart = { rayon: h.entier(...PLAGES.rayon), regul: h.entier(...PLAGES.regul), recompter: h.entier(...PLAGES.recompter) };
  const depart = Object.fromEntries(MODELES.map((r) => { const m = CATALOGUE_COMPLET.VM[r].model; return [r, h.entier(Math.ceil((m.min + m.max) / 2), m.max)]; }));
  // Les événements, entre J-8 et J-5 : ce qui crée chaque écart.
  const ev = {
    reception: { j: 9, h: 9.5, no: `REC-26-05${h.entier(10, 49)}`, lignes: [[sorte.rayon, h.entier(24, 36)], [sorte.regul, h.entier(24, 36)]] },
    surplus: { j: h.entier(6, 8), h: 10, no: `REC-26-05${h.entier(50, 89)}`, sku: sorte.recompter, qty: h.entier(36, 48) },
    annulation: { j: h.entier(5, 7), h: 11, no: `CMD-7342${h.entier(10, 99)}`, rei: `REI-26-00${h.entier(20, 59)}`, sku: sorte.rayon, qty: ecart.rayon },
    demarque: { j: h.entier(6, 8), h: 18.5, sku: sorte.regul },
    retour: { j: h.entier(3, 7), h: 15.5, no: `RET-26-01${h.entier(20, 59)}`, sku: sans[0], qty: 1, commande: `CMD-7339${h.entier(10, 99)}` },
    casse: { j: h.entier(2, 6), h: 9.25, no: `DEM-26-00${h.entier(40, 79)}`, sku: sans[1], qty: 1 },
  };
  const debutEcart = { [sorte.rayon]: ev.annulation.j, [sorte.regul]: ev.demarque.j, [sorte.recompter]: ev.surplus.j };
  // Les préparations : 2 à 3 avant l'événement et 3 à 4 après pour une référence à écart, 7 à 9
  // réparties pour les autres. Jamais le jour même de l'événement (pas d'ambiguïté d'heure).
  const picks = [];
  MODELES.forEach((r) => {
    const jours = [];
    if (debutEcart[r]) {
      const e = debutEcart[r];
      const avant = h.prendre([...Array(9 - e)].map((_, i) => e + 1 + i), h.entier(2, 3));
      const apres = h.prendre([...Array(e - 1)].map((_, i) => 1 + i), h.entier(3, 4));
      jours.push(...avant, ...apres);
    } else {
      jours.push(...h.prendre([1, 2, 3, 4, 5, 6, 7, 8, 9], h.entier(7, 9)));
    }
    jours.forEach((j) => picks.push({ sku: r, j, h: 8 + h.entier(0, 16) / 2, qty: h.entier(1, 2) }));
  });
  return { sorte, sans, ecart, depart, ev, picks, debutEcart };
}

// La simulation d'un jeu (pure) : les mouvements dans l'ordre, le stock du système, le stock au
// rayon, le « Stock trouvé » de chaque préparation, le relevé. `t(j, h)` pose les dates.
export function simuler(jeu, t = (j, hh) => -j * 864e5 + hh * 3600e3) {
  const { sorte, ecart, depart, ev, picks } = jeu;
  const mv = [];
  ev.reception.lignes.forEach(([s, q]) => mv.push({ ts: t(ev.reception.j, ev.reception.h), sku: s, type: 'Entrée : réception', delta: q, ref: ev.reception.no }));
  mv.push({ ts: t(ev.surplus.j, ev.surplus.h), sku: ev.surplus.sku, type: 'Entrée : réception', delta: ev.surplus.qty, ref: ev.surplus.no });
  mv.push({ ts: t(ev.annulation.j, ev.annulation.h), sku: ev.annulation.sku, type: 'Sortie : préparation', delta: -ev.annulation.qty, ref: 'BP-' + ev.annulation.no.slice(4), annulee: true });
  mv.push({ ts: t(ev.annulation.j, ev.annulation.h + 2), sku: ev.annulation.sku, type: 'Entrée : préparation annulée', delta: ev.annulation.qty, ref: ev.annulation.rei });
  mv.push({ ts: t(ev.retour.j, ev.retour.h), sku: ev.retour.sku, type: 'Entrée : retour client', delta: ev.retour.qty, ref: ev.retour.no });
  mv.push({ ts: t(ev.casse.j, ev.casse.h), sku: ev.casse.sku, type: 'Sortie : casse', delta: -ev.casse.qty, ref: ev.casse.no });
  picks.forEach((p) => mv.push({ ts: t(p.j, p.h), sku: p.sku, type: 'Sortie : préparation', delta: -p.qty, pick: p }));
  mv.sort((a, b) => a.ts - b.ts);
  const systeme = { ...depart }, reel = { ...depart };
  const tDem = t(ev.demarque.j, ev.demarque.h);
  let demarquee = false;
  const preparations = [];
  let negatif = false;
  mv.forEach((m) => {
    if (!demarquee && m.ts > tDem) { reel[sorte.regul] -= ecart.regul; demarquee = true; }
    if (m.pick || m.annulee) preparations.push({ m, logiciel: systeme[m.sku], trouve: Math.max(0, reel[m.sku]) });
    systeme[m.sku] += m.delta;
    reel[m.sku] += m.delta;
    // Ce que l'événement fait naître au rayon : la réintégration posée ailleurs, le surplus monté.
    if (m.ref === ev.annulation.rei) reel[m.sku] -= ecart.rayon;
    if (m.ref === ev.surplus.no) reel[m.sku] -= ecart.recompter;
    if (systeme[m.sku] < 0 || reel[m.sku] < 0) negatif = true;
  });
  if (!demarquee) reel[sorte.regul] -= ecart.regul;
  return { mouvements: mv, systeme, reel, preparations, negatif };
}

// Les écarts du jeu : relevé − système (le recompte des « recompter » redonne le système).
export function attendus(jeu) {
  const S = simuler(jeu);
  const releve = Object.fromEntries(MODELES.map((r) => [r, S.reel[r]]));
  const refs = SORTES.map((s) => jeu.sorte[s]);
  const sumAbs = refs.reduce((a, r) => a + Math.abs(releve[r] - S.systeme[r]), 0);
  const sumSys = refs.reduce((a, r) => a + S.systeme[r], 0);
  const constats = Object.fromEntries(MODELES.map((r) => [r, S.preparations.filter((p) => p.m.sku === r && p.trouve !== p.logiciel).length]));
  return { systeme: S.systeme, releve, constats, taux: Math.round(sumAbs / sumSys * 1000) / 10, sumAbs, sumSys,
    lignes: S.preparations.length, negatif: S.negatif };
}

// La contrainte d'équité, en clair : liste vide = jeu conforme.
export function verifier(jeu) {
  const pb = [];
  const refs = SORTES.map((s) => jeu.sorte[s]);
  if (new Set(refs).size !== 3) pb.push('trois sortes sur trois références distinctes');
  if (jeu.sans.length !== 3 || jeu.sans.some((r) => refs.includes(r))) pb.push('trois références sans écart');
  SORTES.forEach((s) => { const [a, b] = PLAGES[s]; if (jeu.ecart[s] < a || jeu.ecart[s] > b) pb.push(`écart ${s} hors plage`); });
  const A = attendus(jeu);
  if (A.negatif) pb.push('stock négatif');
  refs.forEach((r) => { if (A.constats[r] < 2) pb.push(`${r} : moins de 2 constats`); });
  jeu.sans.forEach((r) => { if (A.constats[r] !== 0) pb.push(`${r} : constat sans écart`); });
  if (A.lignes < LIGNES_MIN || A.lignes > LIGNES_MAX) pb.push(`${A.lignes} lignes`);
  if (A.taux < TAUX_MIN || A.taux > TAUX_MAX) pb.push(`taux ${A.taux} %`);
  if (refs.includes(jeu.ev.retour.sku) || refs.includes(jeu.ev.casse.sku) || jeu.ev.retour.sku === jeu.ev.casse.sku) pb.push('retour ou casse sur une référence à écart');
  return pb;
}

// Le jeu de secours : le premier jeu conforme d'une graine fixe (n'est donné que si 40 tirages de
// suite échouent — la suite de tests exige que ça n'arrive jamais).
const SECOURS = (() => { for (let n = 0; n < 500; n++) { const j = tirer(hasard(`secours-ENT-2.5#${n}`)); if (!verifier(j).length) return j; } return null; })();
export const DECL_TIRAGE = { tirer: (h) => tirer(h), verifier, secours: SECOURS, essais: 40 };

const jeux = new Map();
export function jeuDe(graine) {
  const g = String(graine || '');
  if (!jeux.has(g)) jeux.set(g, tirerJeu(DECL_TIRAGE, g));
  return jeux.get(g).jeu;
}
export const jeuDeBase = (db) => jeuDe(graineDeBase(db));

/* ================================================================== l'inventaire (par graine) */

const JOUR = 864e5;
const minuit = (t) => { const d = new Date(t); d.setHours(0, 0, 0, 0); return d.getTime(); };
const quand = (now, j, h) => minuit(now) - j * JOUR + Math.round(h * 3600e3);
export const dateInventaire = (now = Date.now()) => quand(now, JOURS_DEPUIS_INVENTAIRE, 7);

// La liste de l'élève (première réponse reconnue à Nadia), ses aléas, son périmètre — comme ENT-2.3.
const versNadia = (db) => ((db && db.mails) || []).filter((m) => m.folder === 'out' && nrm(m.toMail) === nrm(EQUIPE.cheffe.mail))
  .slice().sort((a, b) => (a.ts || 0) - (b.ts || 0));
export function listeEleve(db) {
  for (const m of versNadia(db)) {
    const l = ligne(m.text, LIGNE_LISTE);
    if (l === null) continue;
    const refs = extraireRefs(l, MODELES);
    if (refs.length) return refs;
  }
  return null;
}
const refsAEcart = (jeu) => MODELES.filter((r) => SORTES.some((s) => jeu.sorte[s] === r));
export const aleasDe = (jeu, refs) => refsAEcart(jeu).filter((r) => !refs.includes(r));
export function perimetre(db) {
  const l = listeEleve(db);
  if (!l) return null;
  const jeu = jeuDeBase(db);
  const p = new Set([...l, ...aleasDe(jeu, l)]);
  return MODELES.filter((r) => p.has(r));
}

export function inventaireDe(graine) {
  const jeu = jeuDe(graine);
  const A = attendus(jeu);
  const lignesInv = MODELES.map((r) => {
    const l = { ref: r, compte: A.releve[r] };
    if (r === jeu.sorte.rayon) Object.assign(l, { attendu: 'rayon', explication: `Les ${jeu.ecart.rayon} articles réintégrés après l'annulation (${jeu.ev.annulation.rei}) ont été posés dans un autre bac : ils existent, on les remet en rayon sans régulariser.` });
    if (r === jeu.sorte.regul) Object.assign(l, { attendu: 'regul', motif: MOTIF_REGUL, explication: 'Aucun mouvement, aucun message, recompté deux fois et bacs voisins vérifiés : le système est faux, on régularise (Démarque inconnue).' });
    if (r === jeu.sorte.recompter) Object.assign(l, { attendu: 'recompter', recompte: A.systeme[r], explication: `Le surplus de ${jeu.ev.surplus.no} a été monté en réserve au-dessus de l'emplacement : le recomptage, réserve comprise, redonne le stock du système.` });
    return l;
  });
  return {
    id: ID_INVENTAIRE, titre: 'Inventaire tournant — allée C', sousTitre: 'Les références de votre liste',
    source: 'releve', aveugle: true, ecarts: 'eleve', correction: 'aucune', motifObligatoire: true,
    perimetre, attentePerimetre: 'En attente de votre liste : répondez à Nadia Ferrand (Messagerie).',
    depuis: dateInventaire(), lignes: lignesInv,
  };
}
export const inventaireDeBase = (db) => inventaireDe(graineDeBase(db));

/* ================================================================== l'export */

export const ID_EXPORT = 'preparations';
export const ID_DEPOT = 'analyse';
export const COLONNES = ['Date', 'N° bon', 'Commande', 'Référence', 'Désignation', 'Emplacement',
  'Qté préparée', 'Stock logiciel', 'Stock trouvé', 'Préparateur'];
const versLigne = (p) => [p.ts, p.bon, p.commande, p.sku, p.designation, p.emplacement, p.qty, p.logiciel, p.trouve, p.preparateur];
export const lignesExport = (db) => lignesPreparation(db, CATALOGUE);
// Ceux de la demande, ou ceux de l'export que l'élève a réellement fait (`propres`) : une erreur
// d'export ne se paie qu'une fois.
export function constats(db, propres = null) {
  const L = propres ? propres.map((o) => ({ sku: o['Référence'], trouve: o['Stock trouvé'], logiciel: o['Stock logiciel'] })) : lignesExport(db);
  return Object.fromEntries(MODELES.map((r) => [r, L.filter((p) => p.sku === r && p.trouve !== p.logiciel).length]));
}
// Les lignes à écarter de la liste d'extraction : les allées A et B dans le mois, l'allée C avant.
const PREPARATEURS_VOISINS = ['Yanis Cazenave', 'Inès Lagarde', 'Sofiane Brettes'];
export const aujourdhui = (db) => (db && db.created) || Date.now();
export function lignesAEcarter(db) {
  const now = aujourdhui(db);
  return [
    ...preparationsAEcarter('ent25-autres-allees', { refs: refsAllees(['A', 'B']), jours: [1, 20], n: 14, now, numero: 739501, preparateurs: PREPARATEURS_VOISINS }),
    ...preparationsAEcarter('ent25-mois-precedent', { refs: MODELES, jours: [32, 45], n: 8, now, numero: 728501, preparateurs: PREPARATEURS_VOISINS }),
  ].map(versLigne);
}

export function controles(db, propres = null) {
  return [
    { type: 'colonne', id: 'ecart', libelle: 'Colonne « Écart »', feuille: 'Préparations', titre: 'Écart',
      cle: ['N° bon', 'Référence'], attendu: (l) => l['Stock trouvé'] - l['Stock logiciel'], formule: true },
    { type: 'colonne', id: 'si', libelle: 'Colonne « Réf. en écart » (SI)', feuille: 'Préparations', titre: 'Réf. en écart',
      cle: ['N° bon', 'Référence'], attendu: (l) => (l['Stock trouvé'] !== l['Stock logiciel'] ? l['Référence'] : ''), fonctions: ['IF'] },
    { type: 'table', id: 'synthese', libelle: 'Synthèse (NB.SI)', feuille: 'Synthèse', cle: 'Référence', colonne: 'Nb constats',
      attendu: constats(db, propres), fonctions: ['COUNTIF'] },
  ];
}
export const TABLEUR = {
  exports: [{
    id: ID_EXPORT, liste: 'Lignes de préparation', fichier: 'cdiscount-lignes-de-preparation.xlsx',
    // Niveau 4 (évaluation) : la demande métier seule, aucun retour sur l'export.
    indications: 4, autres: lignesAEcarter, aujourdhui,
    filtres: [filtreAllee('C'), { id: 'periode', libelle: 'Période', periode: 'Date', juste: '30j' }],
    feuilles: [{ nom: 'Préparations', colonnes: COLONNES, types: { Date: 'date' }, lignes: (db) => lignesExport(db).map(versLigne) },
      { nom: 'Synthèse', colonnes: ['Référence', 'Nb constats'], lignes: () => [] }],
  }],
  depot: { id: ID_DEPOT, export: ID_EXPORT, libelle: 'Déposer mon fichier', retour: 'evaluation', controles },
};

/* ================================================================== base et volet */

export const EXERCICE = 'Évaluation : le compte à rebours';
export const ACCUEIL = {
  titre: 'Le compte à rebours',
  kpis: ['mail'],
  etapes: [
    ['Lire la mission de Nadia Ferrand', 'Messagerie.'],
    ['Exporter, analyser, déposer', 'Extractions, puis le tableur, puis le menu Fichiers. Un seul dépôt.'],
    ['Envoyer votre liste', 'À Nadia : « À recompter : ».'],
    ['Faire l’inventaire de votre liste', 'Menu Inventaire.'],
    ['Rendre compte, puis rendre votre copie', 'À Nadia : « Régularisé : » et « Valeur régularisée : ».'],
  ],
};
export function baseDeDepart() {
  return { v: 1, created: Date.now(), stock: Object.fromEntries(MODELES.map((r) => [r, 0])), moves: [], mails: [], orders: [], seq: 1,
    customers: [], suppliers: [], _depart: [] };
}
const signature = `${EQUIPE.cheffe.nom}, ${EQUIPE.cheffe.role}`;
export const LIGNES_CR = ['Régularisé :', 'Valeur régularisée :'];
const ALEAS_TEXTE = {
  manque: (r) => `Il manque des ${nomCourt(r)} (${r}) en ${CATALOGUE.VM[r].loc} par rapport au système.`,
};

// La période posée sur le calendrier : commandes (et la commande annulée), réceptions, mouvements.
export function periode(jeu, now = Date.now()) {
  const t = (j, hh) => quand(now, j, hh);
  const S = simuler(jeu, t);
  const { ev } = jeu;
  const orders = [];
  const mouvements = [];
  let no = 734001, prep = 0, client = 0;
  // Une commande par préparation tirée, plus la commande annulée (préparée, puis annulée).
  S.preparations.forEach((p) => {
    const m = p.m;
    const cmd = m.annulee ? ev.annulation.no : `CMD-${no++}`;
    const par = m.annulee ? LUCIE.nom : PREPARATEURS[prep++ % PREPARATEURS.length];
    const o = { no: cmd, date: m.ts - 3600e3 * 5, customerId: 'C' + String(1 + (client++ % 20)).padStart(4, '0'), ship: ['COL', 'REL', 'CHR'][client % 3],
      lines: [{ sku: m.sku, qty: -m.delta }],
      prep: { rows: { [m.sku]: { seen: p.trouve, loc: CATALOGUE.VM[m.sku].loc, qty: -m.delta, status: 'ok' } }, doc: true, validated: true, complete: true, at: m.ts, par } };
    if (m.annulee) o.annulee = { motif: 'Annulée par le client pendant la préparation', at: m.ts + 3600e3 };
    orders.push(o);
    mouvements.push({ sku: m.sku, type: m.type, delta: m.delta, ref: 'BP-' + cmd.slice(4), ts: m.ts, by: par });
  });
  S.mouvements.filter((m) => !(m.pick || m.annulee)).forEach((m) => mouvements.push({ sku: m.sku, type: m.type, delta: m.delta, ref: m.ref, ts: m.ts,
    lot: m.type === 'Entrée : réception' ? `LOT-${m.ref.slice(4)}` : '', by: m.type === 'Entrée : réception' ? EQUIPE.quai.nom : m.ref === ev.annulation.rei ? LUCIE.nom : m.type === 'Entrée : retour client' ? EQUIPE.retours.nom : EQUIPE.quai.nom }));
  mouvements.sort((a, b) => a.ts - b.ts);
  const recs = [{ no: ev.reception.no, j: ev.reception.j, h: ev.reception.h, lignes: ev.reception.lignes },
    { no: ev.surplus.no, j: ev.surplus.j, h: ev.surplus.h, lignes: [[ev.surplus.sku, ev.surplus.qty]] }];
  const receptions = recs.map((r) => {
    const ts = t(r.j, r.h), lot = `LOT-${r.no.slice(4)}`, rows = {};
    let n = 0;
    const colis = [];
    r.lignes.forEach(([s, q]) => { rows[s] = { annonce: q, compte: q, etat: 'ok', decision: 'accepte' }; colis.push({ no: ++n, sku: s, qty: q, etat: 'ok' }); });
    return { no: r.no, supId: 'F08', ts, transporteur: 'Geodis, tournée 4', bl: { no: `BL-${r.no.slice(4)}`, date: ts - JOUR, lot, lines: r.lignes.map(([s, q]) => ({ sku: s, qty: q })) },
      colis, ctrl: { lot, rows, validated: true, at: ts + 1800e3 } };
  });
  return { orders, mouvements, receptions, t };
}

export const VOLET = {
  id: 'compte-a-rebours-1',
  semer(prenom, db) {
    const now = Date.now();
    const jeu = jeuDeBase(db);
    // Le stock de départ du jeu tiré : posé ici (la base de départ ne connaît pas la graine).
    Object.assign(db.stock, jeu.depart);
    const P = periode(jeu, now);
    const { ev } = jeu;
    const aDejaBienvenue = ((db && db.mails) || []).some((m) => /^Bienvenue à l’entrepôt/.test(m.subject || ''));
    const mails = [
      ...(aDejaBienvenue ? [] : [mailBienvenue(prenom, now - 3600e3 * 30)]),
      { folder: 'in', ts: P.t(ev.annulation.j, ev.annulation.h + 2.3), from: `${LUCIE.nom}, ${LUCIE.role}`, fromMail: LUCIE.mail, to: prenom,
        subject: `Annulation de ${ev.annulation.no}`, kind: 'text',
        text: `Bonjour,\n\nLe client de ${ev.annulation.no} a annulé alors que j'avais déjà sorti ses articles. J'ai fait la réintégration ${ev.annulation.rei} : j'ai réintégré ${ev.annulation.qty} ${nomCourt(ev.annulation.sku)} (${ev.annulation.sku}).\n\nLe bac était plein, je les ai posés sur l'étagère d'en face, je ne sais plus où.\n\n${LUCIE.nom}` },
      { folder: 'in', ts: P.t(ev.surplus.j, ev.surplus.h + 1.5), from: `${EQUIPE.quai.nom}, ${EQUIPE.quai.role}`, fromMail: EQUIPE.quai.mail, to: prenom,
        subject: `Réception ${ev.surplus.no} : le surplus`, kind: 'text',
        text: `Bonjour,\n\nRéception ${ev.surplus.no} : le surplus de ${nomCourt(ev.surplus.sku)} (${ev.surplus.sku}) ne tenait pas dans l'emplacement, je l'ai monté en réserve, juste au-dessus.\n\n${EQUIPE.quai.nom}` },
      { folder: 'in', ts: P.t(ev.retour.j, ev.retour.h + 0.2), from: EQUIPE.retours.nom, fromMail: EQUIPE.retours.mail, to: prenom,
        subject: `Retour client ${ev.retour.no} remis en stock`, kind: 'text',
        text: `Bonjour,\n\nRetour client enregistré.\n\nDocument : ${ev.retour.no}\nCommande d'origine : ${ev.retour.commande}\nArticle : ${ev.retour.sku}, ${nomCourt(ev.retour.sku)}\nQuantité : ${ev.retour.qty}\nContrôle : emballage d'origine intact, article neuf\nDécision : remis en stock à l'emplacement ${CATALOGUE.VM[ev.retour.sku].loc}\n\nService retours, Cestas` },
      { folder: 'in', ts: P.t(ev.casse.j, ev.casse.h + 0.3), from: `${EQUIPE.quai.nom}, ${EQUIPE.quai.role}`, fromMail: EQUIPE.quai.mail, to: prenom,
        subject: `Constat de casse ${ev.casse.no}`, kind: 'text',
        text: `Bonjour,\n\nConstat de casse.\n\nDocument : ${ev.casse.no}\nArticle : ${ev.casse.sku}, ${nomCourt(ev.casse.sku)}\nQuantité : ${ev.casse.qty}\nDécision : sorti du stock et mis au rebut.\n\n${EQUIPE.quai.nom}` },
      { folder: 'in', ts: now - 3600e3, from: signature, fromMail: EQUIPE.cheffe.mail, to: prenom,
        subject: 'Allée C : le compte à rebours', kind: 'text', amorce: `${LIGNE_LISTE} `,
        text: `Bonjour ${prenom},\n\nLe Black Friday approche : l'allée C doit être juste. Exportez les lignes de préparation de l'allée C sur le mois, analysez les constats des préparateurs, envoyez-moi votre liste (« ${LIGNE_LISTE} »), faites l'inventaire de cette liste, puis rendez-moi compte (« ${LIGNES_CR[0]} », « ${LIGNES_CR[1]} »). Quand tout est fait, rendez votre copie.\n\n${EQUIPE.cheffe.nom}` },
    ];
    return { receptions: P.receptions, orders: P.orders, mouvements: P.mouvements, mails };
  },
  // La liste reconnue fait arriver l'accusé neutre (avec l'amorce du compte rendu), le relevé de
  // toute l'allée, et un aléa par référence à écart oubliée. Rien de reconnu : un seul rappel.
  declencheurs: [{
    id: 'liste',
    quand: (db) => !!listeEleve(db),
    semer(prenom, db) {
      const l = listeEleve(db);
      if (!l) return { mails: [] };
      const now = Date.now();
      const jeu = jeuDeBase(db);
      return { mails: [
        { folder: 'in', ts: now + 1000, from: signature, fromMail: EQUIPE.cheffe.mail, to: prenom, subject: 'Votre liste à recompter', kind: 'text',
          amorce: LIGNES_CR.map((x) => `${x} `).join('\n'),
          text: `Bonjour ${prenom},\n\nC'est noté : vous recomptez ${l.join(', ')}. L'équipe inventaire vous envoie son relevé de l'allée. Quand l'inventaire est validé, rendez-moi compte en répondant à ce message.\n\n${EQUIPE.cheffe.nom}` },
        { folder: 'in', ts: now + 2000, from: EQUIPE.inventaire.nom, fromMail: EQUIPE.inventaire.mail, to: prenom,
          subject: 'Relevé de comptage — allée C', kind: 'releve', inventaire: ID_INVENTAIRE,
          text: 'Bonjour,\n\nVoici le relevé du comptage de ce matin, allée C. Comptage aux emplacements de prélèvement.\n\nL\'équipe inventaire',
          remarque: `${CATALOGUE.VM[jeu.sorte.regul].loc} : recompté deux fois, bacs voisins vérifiés : rien d'étranger dedans.` },
        ...aleasDe(jeu, l).map((r, i) => ({ folder: 'in', ts: now + 3 * 60e3 + i * 60e3, from: `${YANIS.nom}, ${YANIS.role}`, fromMail: YANIS.mail, to: prenom,
          subject: `Rayon à vérifier : ${r}`, kind: 'text', text: `Bonjour,\n\n${ALEAS_TEXTE.manque(r)}\n\n${YANIS.nom}` })),
      ] };
    },
  }, {
    id: 'rappel',
    quand: (db) => versNadia(db).length > 0 && !listeEleve(db),
    semer(prenom) {
      return { mails: [{ folder: 'in', ts: Date.now() + 1000, from: signature, fromMail: EQUIPE.cheffe.mail, to: prenom,
        subject: 'Votre liste : je n’ai rien reconnu', kind: 'text', amorce: `${LIGNE_LISTE} `,
        text: `Bonjour ${prenom},\n\nJe n'ai reconnu aucune référence de l'allée C dans votre message. Renvoyez-moi la liste, sur une ligne « ${LIGNE_LISTE} », références écrites comme sur l'écran Stock.\n\n${EQUIPE.cheffe.nom}` }] };
    },
  }],
};

/* ================================================================== les onze jalons
 * Calculés sur le jeu de l'élève, jamais écrits en dur. Aucun verdict avant la remise (copie) ;
 * rien n'est acquis sans action (`attente`). Note = jalons réussis / 12 × 20, figée à la remise.
 */
const bilan = (db) => bilanInventaire(db, inventaireDeBase(db), CATALOGUE);
const jalonControle = (id) => (db) => {
  const r = resultatDepot(db, ID_DEPOT);
  const c = r.depose ? r.controles[id] : null;
  if (!c) return { status: 'attente' };
  return { status: c.ok ? 'ok' : 'ko', detail: `${c.justes} juste(s) sur ${c.total}.` };
};
// La liste attendue : d'après la synthèse DÉPOSÉE (une erreur ne se paie qu'une fois), sinon les 3 vraies.
export function listeAttendue(db) {
  const syn = resultatDepot(db, ID_DEPOT).controles.synthese;
  if (syn && syn.lu) return MODELES.filter((r) => Number(syn.lu[r]) > 0);
  return refsAEcart(jeuDeBase(db));
}
const decision = (sorte) => (db) => {
  const b = bilan(db);
  if (!b.valide) return { status: 'attente' };
  const ref = jeuDeBase(db).sorte[sorte];
  const l = b.lignes.find((x) => x.ref === ref);
  return { status: l && l.juste ? 'ok' : 'ko', detail: `${ref} : ${l ? (l.action || 'aucune décision') : 'hors périmètre'}.` };
};
// Le compte rendu, jugé sur ce que l'élève a RÉELLEMENT régularisé (erreur payée une fois, jalon 8).
export function regularisees(db) {
  const e = db && db.inventaires && db.inventaires[ID_INVENTAIRE];
  return (e && e.valide ? e.ajustements || [] : []).map((a) => ({ ref: a.ref, delta: a.delta }));
}
// La ligne qui COMMENCE par un intitulé (« Régularisé : » ne doit pas lire « Valeur régularisée : »,
// qui contient le même mot). La dernière, si l'élève se corrige en bas de message.
const ligneDebut = (texte, intitule) => {
  const cle = nrm(intitule).replace(/\s*:$/, '');
  const l = String(texte || '').split(/\r?\n/).filter((x) => nrm(x).startsWith(cle));
  return l.length ? l[l.length - 1] : null;
};
function compteRendu(db) {
  const msgs = versNadia(db).filter((m) => ligneDebut(m.text, LIGNES_CR[0]) !== null);
  if (!msgs.length) return { status: 'attente' };
  const regs = regularisees(db);
  const attenduRefs = regs.map((r) => r.ref).sort();
  const attenduVal = Math.round(regs.reduce((a, r) => a + Math.abs(r.delta) * coutDe(r.ref), 0) * 100) / 100;
  const juste = (m) => {
    const refs = extraireRefs(ligneDebut(m.text, LIGNES_CR[0]), MODELES).slice().sort();
    const lv = ligneDebut(m.text, LIGNES_CR[1]);
    const n = lv === null ? [] : String(lv).replace(/\b[A-Z]{2,}[A-Z0-9]*(?:-[A-Z0-9]+)+\b/gi, ' ').replace(/(\d),(\d)/g, '$1.$2').match(/\d+(?:\.\d+)?/g) || [];
    const val = n.length ? parseFloat(n[n.length - 1]) : (attenduVal === 0 ? 0 : null);
    return refs.join() === attenduRefs.join() && val !== null && Math.abs(val - attenduVal) <= 0.01 + 1e-9;
  };
  return msgs.some(juste) ? { status: 'ok' } : { status: 'ko', detail: `Attendu : ${attenduRefs.join(', ') || 'aucune'} — ${String(attenduVal).replace('.', ',')} €.` };
}

export const ETAPES = [
  { id: 'export', titre: 'Lignes de préparation de l’allée C exportées (bons critères)', verifier: (db) => statutExport(db, ID_EXPORT, ID_DEPOT) },
  { id: 'ecart', titre: 'Écart calculé en formule', verifier: jalonControle('ecart') },
  { id: 'si', titre: 'Références en écart isolées avec SI', verifier: jalonControle('si') },
  { id: 'synthese', titre: 'Constats comptés par référence avec NB.SI', verifier: jalonControle('synthese') },
  {
    id: 'liste', titre: 'Bonne liste à recompter',
    verifier(db) {
      const l = listeEleve(db);
      if (!l) return { status: 'attente' };
      const att = listeAttendue(db);
      return { status: l.length === att.length && att.every((r) => l.includes(r)) ? 'ok' : 'ko', detail: `Liste : ${l.join(', ')}.` };
    },
  },
  {
    id: 'comptage', titre: 'Comptage reporté sans erreur',
    verifier(db) { const b = bilan(db); if (!b.commence) return { status: 'attente' }; return b.saisieOk ? { status: 'ok' } : { status: b.valide ? 'ko' : 'attente' }; },
  },
  {
    id: 'ecarts', titre: 'Écarts calculés',
    verifier(db) { const b = bilan(db); if (!b.commence || !b.saisieOk) return { status: b.valide ? 'ko' : 'attente' }; return b.ecartsOk ? { status: 'ok' } : { status: b.valide ? 'ko' : 'attente' }; },
  },
  { id: 'rayon', titre: 'Remise en rayon décidée', verifier: decision('rayon') },
  { id: 'regul', titre: 'Régularisation avec le bon motif', verifier: decision('regul') },
  { id: 'recompter', titre: 'Recomptage demandé', verifier: decision('recompter') },
  {
    id: 'taux', titre: 'Taux d’écart calculé',
    verifier(db) { const b = bilan(db); if (!b.valide) return { status: 'attente' }; return { status: b.tauxOk ? 'ok' : 'ko' }; },
  },
  { id: 'compteRendu', titre: 'Compte rendu juste', verifier: compteRendu },
];

// Pour le corrigé de l'élève et les tests : la réponse juste d'un jeu.
export function corrige(jeu) {
  const A = attendus(jeu);
  const refs = refsAEcart(jeu);
  const sumSys = refs.reduce((a, r) => a + A.systeme[r], 0);
  return { liste: refs, constats: A.constats, systeme: A.systeme, releve: A.releve, taux: Math.round(A.sumAbs / sumSys * 1000) / 10,
    regularise: jeu.sorte.regul, valeur: Math.round(jeu.ecart.regul * coutDe(jeu.sorte.regul) * 100) / 100 };
}
