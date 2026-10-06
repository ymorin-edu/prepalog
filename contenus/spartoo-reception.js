// Spartoo — séance « réception » (ENT-1.1), refondue le 06/10/2026 (brief `docs/briefs/ENT-1.1-spartoo-quai.md`).
//
// L'univers (catalogue, fournisseurs, clients, thème) est celui de `spartoo.js` : on ne le duplique pas. Ce
// fichier porte ce qui appartient à la séance : ses messages, le questionnaire de la procédure, le quai (le
// camion, la palette), les réceptions de la liste, la marche à suivre de l'accueil, et ses huit jalons.
//
// Le déroulé, dans l'ordre réel : lire la procédure (questionnaire : le quai s'ouvre à l'envoi) ; au quai, le
// chauffeur remet le BL, l'élève compte la palette, écrit ses réserves AU TRANSPORTEUR sur le BL et fait
// signer ; dans le logiciel, il retrouve SA réception par son n° de BL parmi dix, et saisit le bon de
// réception EN PAIRES (cartons × 6) ; console ; puis les réserves AU FOURNISSEUR, par message.
//
// La vérité est sur la palette, nulle part ailleurs : la réception n'a plus de tableau des colis. Tout ce
// qui est attendu est CALCULÉ depuis la palette (`PALETTE` → `COLIS` → `attendu()`), jamais recopié ; ENT-1.3
// (traçabilité) lit les mêmes exports.
//
// Réels (vérifiés le 06/10/2026, brief §2) : Spartoo, son entrepôt Toolog de Saint-Quentin-Fallavier (38),
// Puma, Geodis. Construits : le quai 7, l'horaire, le chauffeur, les références, quantités et défauts, les
// numéros (BL, REC, commande, lot) et les réceptions des autres fournisseurs.

import { mailBienvenue } from './spartoo.js';
import { jalonsQuai } from '../core/types/quai.js';

/* ------------------------------------------------------------------ constantes */

export const REC = 'REC-04127';
export const LOT = 'LOT-PM-2609';
export const BL = 'BL-77421';
export const COMMANDE = 'CF-20261003';
export const PAIRES_PAR_CARTON = 6;
// Le piège (brief §6.4) : même fournisseur, BL aux chiffres inversés, saisissable. Rien sur le quai pour lui.
export const REC_PIEGE = 'REC-04129';
export const BL_PIEGE = 'BL-77412';

/* ------------------------------------------------------------ le quai (2D iso) */
// La palette mixte (brief §6.1) : 2 × 2 cartons × 3 couches, une couche par référence, 6 paires par carton
// (choix de Tristan). Ce qui manque et ce qui est abîmé est écrit ici, une fois ; le reste se calcule.
const etiquette = (ref, article, couleur, taille) => ({
  marque: 'PUMA', ref, nom: `${article} · ${couleur}`, poids: `Taille ${taille} · ${PAIRES_PAR_CARTON} paires par carton`,
  court: `T.${taille} · ${PAIRES_PAR_CARTON} paires`, lot: LOT, commande: COMMANDE,
});
const parCarton = `${PAIRES_PAR_CARTON} paires`;
export const PALETTE = {
  id: 'P1', W: 2, D: 2, L: 3,
  refs: [
    { ref: 'PM-SUE-RG-39', nom: 'Puma Suede Classic XXI Rouge T.39', bl: 4, couches: [0], parCarton, etiq: etiquette('PM-SUE-RG-39', 'Puma Suede Classic XXI', 'Rouge', 39) },
    { ref: 'PM-RSX-BL-42', nom: 'Puma RS-X Blanc T.42', bl: 4, couches: [1], parCarton, etiq: etiquette('PM-RSX-BL-42', 'Puma RS-X', 'Blanc', 42) },
    { ref: 'PM-SUE-MA-41', nom: 'Puma Suede Classic XXI Bleu marine T.41', bl: 4, couches: [2], parCarton, etiq: etiquette('PM-SUE-MA-41', 'Puma Suede Classic XXI', 'Bleu marine', 41) },
  ],
  // « i,j,k » : i de gauche à droite, j = 0 au fond (1 devant), k = couche (0 en bas).
  manque: ['0,0,2'],                 // couche du haut, au fond : invisible de face (carton n° 9)
  avarie: { '1,0,1': [0, -1] },      // couche du milieu, enfoncé sur la face ARRIÈRE (carton n° 6) : il faut faire le tour
  attendu: 'reserves', motifAttendu: 'avarie', motif2Attendu: 'manquant',
};

// Les cartons réellement livrés (11), numérotés comme leur étiquette au quai (couche par couche, du fond vers
// l'avant, de gauche à droite) : la source du bon de réception attendu et de l'aval d'ENT-1.3.
export const COLIS = (() => {
  const P = PALETTE, manque = new Set(P.manque), L = [];
  for (let k = 0; k < P.L; k++) for (let j = 0; j < P.D; j++) for (let i = 0; i < P.W; i++) {
    if (manque.has(`${i},${j},${k}`)) continue;
    const r = P.refs.find((x) => x.couches.includes(k));
    L.push({ no: 1 + k * P.W * P.D + j * P.W + i, sku: r.ref, qty: PAIRES_PAR_CARTON, etat: P.avarie[`${i},${j},${k}`] ? 'abime' : 'ok' });
  }
  return L;
})();
// Ce que le BL annonce, en paires (cartons × 6).
export const ANNONCE = PALETTE.refs.map((r) => ({ sku: r.ref, qty: r.bl * PAIRES_PAR_CARTON }));

export const QUAI = {
  id: 'spartoo-reception',
  rendu: 'iso',
  titre: 'Toolog (Spartoo), Saint-Quentin-Fallavier (38) — Quai 7, réception',
  destinataire: 'Spartoo · Toolog, Saint-Quentin-Fallavier',
  avertissement: 'Réels : Spartoo, son entrepôt Toolog de Saint-Quentin-Fallavier, Puma, Geodis. Le quai 7, l’horaire, le '
    + 'chauffeur, les références, quantités et défauts sont <b>construits pour l’exercice</b>.',
  froid: false,
  motifs: ['avarie', 'manquant'],
  deuxMotifs: true,
  lieu: { nom: 'Quai 7', temp: 15, refrigere: false },
  zone: { nom: 'Zone de réception' },
  dechargement: { ouverture: 0.5, parPalette: 1, par: 'chauffeur' },
  aides: { regleCouches: true, repere: false, chefDeQuai: true, consignes: true },
  noteBL: 'Note sur ta trame : le n° du BL, le lot, et le nombre de cartons annoncés.',
  camions: [{
    transporteur: 'Geodis, tournée 14', fournisseur: 'Puma France, B2B', bl: BL, arrivee: '10:30',
    commande: COMMANDE, lot: LOT, expedie: -1,
    parole: 'Bonjour ! Geodis, une palette de chez Puma pour Spartoo. Voilà le bon de livraison : vous me signez quand c’est bon ?',
    palettes: [PALETTE],
  }],
};

/* ------------------------------------------------- la procédure et son questionnaire */
// La procédure de M. Morin (brief §6.3) : cinq règles, une question par règle (§6.3 bis). Elle est à la fois
// le message de M. Morin et le document affiché à gauche du questionnaire.
const REGLES = [
  'On ne signe jamais le bon de livraison du chauffeur sans avoir compté. Le BL annonce ce que le fournisseur a voulu envoyer, pas ce qui est arrivé.',
  'On compte carton par carton sur la palette, référence par référence, en faisant le tour. Sur l’étiquette : le nombre de paires par carton.',
  'Dès qu’il manque quelque chose OU qu’un carton est endommagé, la ligne est « acceptée sous réserve » : on la rentre en stock. On ne refuse une ligne que si la marchandise est inutilisable.',
  'Avant de signer le BL du chauffeur, on y écrit les réserves précises : quoi, combien. Puis on prévient le fournisseur le jour même.',
  'Dans le logiciel, retrouve ta réception par son n° de BL et remplis le bon de réception en paires, avec le numéro de lot du BL. C’est le lot qui permet, plus tard, de retrouver d’où vient une paire et chez qui elle est partie.',
];
export const DOCUMENTS = [{
  id: 'procedure', titre: 'Procédure de réception — M. Morin', court: 'Procédure', html: `
  <article class="doc-procedure" aria-label="Procédure de réception">
    <h2>Procédure de réception</h2>
    <p class="note">M. Morin, responsable logistique · Toolog, Saint-Quentin-Fallavier</p>
    <ol>${REGLES.map((r) => `<li>${r}</li>`).join('')}</ol>
  </article>` }];

// Le questionnaire : les choix sont MÉLANGÉS ici (le moteur ne mélange rien) ; `JUSTES` dit la bonne réponse.
export const QUESTIONS = [
  { id: 'q1', lib: '1. Le chauffeur te tend le BL : tu signes…', choix: ['tout de suite, il est pressé', 'après avoir compté', 'quand le chef de quai arrive'] },
  { id: 'q2', lib: '2. Une ligne où il manque des paires :', choix: ['refusée', 'acceptée', 'acceptée sous réserve'] },
  { id: 'q3', lib: '3. Un carton est enfoncé, les chaussures sont intactes :', choix: ['accepté sous réserve', 'refusé', 'accepté sans rien dire'] },
  { id: 'q4', lib: '4. On refuse une ligne seulement si…', choix: ['il manque une paire', 'le carton est sale', 'la marchandise est inutilisable'] },
  { id: 'q5', lib: '5. Le numéro de lot sert à…', choix: ['calculer le prix', 'retrouver d’où vient une paire et chez qui elle est partie', 'compter les cartons'] },
];
export const JUSTES = { q1: 'après avoir compté', q2: 'acceptée sous réserve', q3: 'accepté sous réserve', q4: 'la marchandise est inutilisable',
  q5: 'retrouver d’où vient une paire et chez qui elle est partie' };
export const FICHE = {
  id: 'procedure', libelle: 'Questionnaire procédure', titre: 'Questionnaire : la procédure de réception',
  sousTitre: 'Une réponse par question. Le quai s’ouvre quand tu l’as envoyé.',
  documents: ['procedure'], bouton: 'Répondre au questionnaire',
  blocs: QUESTIONS.map((q) => ({ type: 'choix', id: q.id, lib: q.lib, manque: `la question ${q.id.slice(1)}`, choix: q.choix, colonne: true })),
  envoi: { bouton: 'Envoyer à M. Morin', a: 'M. Morin', suite: 'Le quai est ouvert : va recevoir le camion (menu « Quai de réception »).' },
};
const ficheProcedure = (db) => {
  const f = db && db.fiches && db.fiches[FICHE.id];
  return { envoye: !!(f && f.envoye), valeurs: (f && f.valeurs) || {}, at: (f && f.envoye && f.envoye.at) || null };
};
// Le quai reste fermé tant que le questionnaire n'est pas envoyé (décision de Tristan, 06/10), même faux.
export const FERMETURES = {
  quai: { ouvertSi: (db) => ficheProcedure(db).envoye, message: 'Réponds d’abord au questionnaire de la procédure (Messagerie).' },
};

export const EXERCICE = 'Exercice 1 : réception d’une livraison fournisseur';

export const ACCUEIL = {
  titre: 'Réceptionner une livraison, dans l’ordre',
  kpis: ['mail', 'receptions', 'stock', 'rupture'],
  etapes: [
    ['Lire la procédure et l’avis d’expédition', 'Messagerie. Réponds au questionnaire de la procédure : le quai s’ouvre quand tu l’as envoyé.'],
    ['Recevoir le camion', 'Quai de réception : le chauffeur te remet le bon de livraison.'],
    ['Compter la palette', 'Fais le tour, compte chaque référence, écris tes réserves sur le BL, fais signer le chauffeur.'],
    ['Retrouver ta réception', 'Données > Réceptions : cherche ton numéro de BL.'],
    ['Saisir le bon de réception, en paires', 'Puis Console pour vérifier : .help, .movements, .getstock, .getlot.'],
    ['Prévenir Puma', 'Un message avec le numéro de lot, ce qui manque, ce qui est abîmé.'],
  ],
};

/* ------------------------------------------------------- le volet de la séance */
// Les réceptions de la liste (brief §6.4) : la vraie, le piège, une annoncée et sept déjà réceptionnées. Les
// réceptionnées n'ont AUCUN mouvement : elles ne changent ni le stock ni les lots. REC-04118 est réservée à
// ENT-1.3 (la réception du collègue) : jamais ici.
const RECUES = [
  ['REC-04109', 'F001', 'BL-N-55120', 'NK-AF1-BL-42', 12],
  ['REC-04111', 'F002', 'BL-AD-30871', 'AD-SST-BL-41', 12],
  ['REC-04114', 'F006', 'BL-V-1188', 'VN-OLD-NR-40', 6],
  ['REC-04116', 'F004', 'BL-NB-90412', 'NB-574-GR-42', 12],
  ['REC-04120', 'F003', 'BL-77398', 'PM-RSX-GR-43', 6],
  ['REC-04122', 'F005', 'BL-C-44107', 'CV-CTAS-NR-39', 12],
  ['REC-04125', 'F007', 'BL-AS-7730', 'AS-KAY-NR-42', 6],
];
const SANS_COLIS = {
  colisVisibles: false, colisLibelle: '1 palette',
  consigneQuai: 'Les cartons ont été comptés au quai : reprends ta fiche de contrôle. Sur le bon de réception, on écrit des <b>paires</b>.',
};

export const VOLET = {
  // `reception-2` : la séance refondue (06/10/2026). Les bases d'avant repartent de zéro (`versionBase`).
  id: 'reception-2',
  semer(prenom, db) {
    const now = Date.now(), jour = 3600e3 * 24;
    const aDejaBienvenue = ((db && db.mails) || []).some((m) => /^Bienvenue chez Spartoo/.test(m.subject || ''));
    const rec = (no, supId, bl, lignes, ts, plus) => Object.assign({
      no, supId, ts, transporteur: 'Geodis',
      bl: { no: bl, date: ts - jour, lot: plus.lot || '', lines: lignes.map((l) => ({ ...l })) },
      colis: [], ctrl: null,
    }, SANS_COLIS, plus);
    const recues = RECUES.map(([no, supId, bl, sku, qty], n) => {
      const ts = now - jour * (9 - n);
      const lot = `LOT-${bl.replace(/^BL-/, '')}`;
      return rec(no, supId, bl, [{ sku, qty }], ts, {
        lot, colis: [{ no: 1, sku, qty, etat: 'ok' }],
        ctrl: { lot, rows: { [sku]: { annonce: qty, compte: qty, etat: 'ok', decision: 'accepte' } }, validated: true, at: ts + 3600e3 },
      });
    });
    const receptions = [
      ...recues,
      rec(REC, 'F003', BL, ANNONCE, now - 3600e3 * 2, { transporteur: 'Geodis, tournée 14', lot: LOT, colis: COLIS.map((c) => ({ ...c })) }),
      rec(REC_PIEGE, 'F003', BL_PIEGE, [{ sku: 'PM-SUE-NR-40', qty: 12 }, { sku: 'PM-RSX-GR-44', qty: 12 }], now - 3600e3 * 1.5, {
        transporteur: 'Geodis, tournée 9', lot: 'LOT-PM-2614',
        colis: [1, 2].map((no) => ({ no, sku: 'PM-SUE-NR-40', qty: 6, etat: 'ok' })).concat([3, 4].map((no) => ({ no, sku: 'PM-RSX-GR-44', qty: 6, etat: 'ok' }))) }),
      rec('REC-04131', 'F008', 'BL-RB-2266', [{ sku: 'RB-CL-BL-41', qty: 12 }], now + 3600e3 * 3, { annoncee: true, lot: 'LOT-RB-2266' }),
    ];
    return {
      receptions,
      mails: [
        ...(aDejaBienvenue ? [] : [mailBienvenue(prenom)]),
        { folder: 'in', ts: now - 3600e3 * 20, from: 'M. Morin, responsable logistique',
          fromMail: 'direction@spartoo.example', to: prenom,
          subject: 'Procédure de réception : à lire avant le quai', kind: 'text', ouvreFiche: FICHE.id,
          text: `Bonjour ${prenom},\n\nTu prends le quai de réception aujourd'hui. Voici notre procédure, elle n'a rien d'optionnel :\n\n`
            + REGLES.map((r, k) => `${k + 1}. ${r}`).join('\n')
            + '\n\nUne fois la réception validée, vérifie ta saisie dans la console : .help pour voir les commandes, puis .movements, .getstock suivi d\'une référence, .getlot suivi du numéro de lot.\n\n'
            + 'Avant d\'aller au quai, réponds au questionnaire (bouton ci-dessous) : le quai s\'ouvre quand tu me l\'as envoyé.\n\nBon courage,\nM. Morin' },
        { folder: 'in', ts: now - 3600e3 * 18, from: 'Puma France, B2B — expéditions',
          fromMail: 'b2b@puma-pro.example', to: prenom,
          subject: `Avis d'expédition — commande ${COMMANDE}`, kind: 'text',
          text: `Bonjour,\n\nVotre commande ${COMMANDE} est partie aujourd'hui avec Geodis (tournée 14) : bon de livraison ${BL}, 1 palette, livraison demain matin.\n\nVos réserves éventuelles sous 48 heures, en rappelant le numéro de lot.\n\nCordialement,\nMarc Oberlé\nPuma France, B2B` },
      ],
    };
  },
};

/* ============================ Suivi de l'exercice ============================
 * Huit jalons, dans l'ordre du déroulé (brief §5). Aucun retour pendant l'exercice. Les titres se lisent par
 * un élève sans trahir la réponse (bandeau de fin de séance) ; le détail est pour l'enseignant.
 *
 *   ok      le travail est fait et juste
 *   ko      il est fait mais à corriger
 *   attente il est commencé, la validation manque
 *   na      l'élève n'en est pas encore là
 */

const nrm = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
const majLot = (s) => String(s || '').toUpperCase().replace(/\s+/g, '');

// Ce que le contrôle aurait dû donner, en PAIRES, déduit des colis réellement livrés — jamais écrit en dur.
export function attendu() {
  const refs = [];
  ANNONCE.forEach((l) => { if (!refs.includes(l.sku)) refs.push(l.sku); });
  COLIS.forEach((c) => { if (!refs.includes(c.sku)) refs.push(c.sku); });
  return refs.map((sku) => {
    const annonce = ANNONCE.filter((l) => l.sku === sku).reduce((n, l) => n + l.qty, 0);
    const compte = COLIS.filter((c) => c.sku === sku).reduce((n, c) => n + c.qty, 0);
    const abime = COLIS.some((c) => c.sku === sku && c.etat === 'abime');
    const etat = abime ? 'abime' : 'ok';
    const decision = (compte !== annonce || abime) ? 'reserve' : 'accepte';
    return { sku, annonce, compte, etat, decision, entre: decision === 'refuse' ? 0 : compte };
  });
}

const LIB_ETAT = { ok: 'conforme', abime: 'colis endommagé' };
const LIB_DEC = { accepte: 'accepté', reserve: 'accepté sous réserve', refuse: 'refusé' };

// Les lignes de la vue quai, et l'état du quai dans la base.
const ligneQuai = (db, id) => jalonsQuai(db, QUAI).L.find((l) => l.id === id) || {};
const etatQuai = (db) => (db && db.quais && db.quais[QUAI.id]) || null;
const palQuai = (db) => { const e = etatQuai(db); return (e && e.palettes && e.palettes[PALETTE.id]) || {}; };
const statut = (ok, essaye, detail) => (ok ? { status: 'ok' } : essaye ? { status: 'ko', detail } : { status: 'attente' });
const piegeValide = (db) => { const r = (db.receptions || []).find((x) => x.no === REC_PIEGE); return !!(r && r.ctrl && r.ctrl.validated); };

export const ETAPES = [
  {
    id: 'procedure',
    titre: 'Procédure lue : questionnaire juste',
    verifier(db) {
      const f = ficheProcedure(db);
      if (!f.envoye) return { status: 'attente' };
      const fausses = QUESTIONS.filter((q) => f.valeurs[q.id] !== JUSTES[q.id]).map((q) => q.id.slice(1));
      return fausses.length ? { status: 'ko', detail: `Questions fausses : ${fausses.join(', ')}`, ts: f.at } : { status: 'ok', ts: f.at };
    },
  },
  {
    id: 'comptage',
    titre: 'Palette comptée, référence par référence',
    verifier(db) {
      const l = ligneQuai(db, `${PALETTE.id}-comptage`), s = palQuai(db);
      return statut(l.ok, !!s.valide, `compté : ${l.fait} — attendu : ${l.attendu}`);
    },
  },
  {
    id: 'decision',
    titre: 'Décision pour la palette',
    verifier(db) {
      const l = ligneQuai(db, `${PALETTE.id}-decision`), s = palQuai(db);
      return statut(l.ok, !!s.valide, `décidé : ${l.fait} — attendu : ${l.attendu}`);
    },
  },
  {
    id: 'reserves-bl',
    titre: 'Réserves précises écrites sur le BL',
    verifier(db) {
      const l = ligneQuai(db, `${PALETTE.id}-reserve`), e = etatQuai(db);
      return statut(l.ok, !!(e && e.ecrit), `écrit : ${l.fait} — attendu : ${l.attendu}`);
    },
  },
  {
    id: 'signature',
    titre: 'BL signé par le chauffeur',
    verifier(db) { const e = etatQuai(db); return e && e.signe ? { status: 'ok' } : { status: e && e.ecrit ? 'attente' : 'na' }; },
  },
  {
    id: 'controle',
    titre: 'Contrôle à réception du bon ' + BL,
    verifier(db) {
      // La réception piège validée : faux, même si la vraie est juste (et dès qu'elle l'est, avant la vraie).
      const piege = piegeValide(db) ? `Réception ${REC_PIEGE} saisie : ce n'est pas votre BL (${BL_PIEGE} au lieu de ${BL}).` : '';
      const r = (db.receptions || []).find((x) => x.no === REC);
      if (!r || !r.ctrl || !r.ctrl.validated) return piege ? { status: 'ko', detail: piege } : (r && r.ctrl ? { status: 'attente' } : { status: 'na' });
      const c = r.ctrl, att = attendu();
      const lotOk = majLot(c.lot) === LOT;
      const lignes = att.map((a) => {
        const x = c.rows[a.sku] || {};
        const ok = x.annonce === a.annonce && x.compte === a.compte && x.etat === a.etat && x.decision === a.decision;
        return { ...a, ok, x };
      });
      const tout = lotOk && lignes.every((l) => l.ok) && !piege;
      const detail = (piege ? piege + '\n' : '') + `Réception validée le ${new Date(c.at).toLocaleString('fr-FR')}.\n`
        + `Numéro de lot saisi : ${c.lot || '(vide)'} ${lotOk ? '— correct' : '— attendu ' + LOT}\n`
        + lignes.map((l) => `${l.sku} : ${l.ok ? 'correct' : 'à corriger'} — annoncé `
          + `${l.x.annonce === '' || l.x.annonce == null ? '(vide)' : l.x.annonce} (attendu ${l.annonce}), `
          + `compté ${l.x.compte === '' || l.x.compte == null ? '(vide)' : l.x.compte} (attendu ${l.compte}), `
          + `état ${LIB_ETAT[l.x.etat] || '(vide)'} (attendu ${LIB_ETAT[l.etat]}), `
          + `décision ${LIB_DEC[l.x.decision] || '(vide)'} (attendu ${LIB_DEC[l.decision]})`).join('\n');
      return { status: tout ? 'ok' : 'ko', detail, ts: c.at };
    },
  },
  {
    id: 'entree',
    titre: 'Entrée en stock des quantités acceptées, avec le lot',
    verifier(db) {
      const r = (db.receptions || []).find((x) => x.no === REC);
      // Les entrées du piège sont des entrées en trop, quelle que soit la vraie réception.
      const intrusPiege = (db.moves || []).filter((m) => m.ref === REC_PIEGE && m.delta > 0);
      if (!r || !r.ctrl || !r.ctrl.validated) return intrusPiege.length ? { status: 'ko', detail: `Entrées inattendues (${REC_PIEGE}) : ${intrusPiege.map((m) => m.sku).join(', ')}` } : (r && r.ctrl ? { status: 'attente' } : { status: 'na' });
      const mv = (db.moves || []).filter((m) => m.ref === REC && m.delta > 0);
      const att = attendu();
      const lignes = att.map((a) => {
        const pour = mv.filter((m) => m.sku === a.sku);
        const entre = pour.reduce((n, m) => n + m.delta, 0);
        const lotOk = pour.length > 0 && pour.every((m) => majLot(m.lot) === LOT);
        return { ...a, entreReel: entre, lotOk, ok: entre === a.entre && (a.entre === 0 || lotOk) };
      });
      const intrus = mv.filter((m) => !att.some((a) => a.sku === m.sku)).concat(intrusPiege);
      const tout = lignes.every((l) => l.ok) && !intrus.length;
      const detail = lignes.map((l) => `${l.sku} : ${l.ok ? 'correct' : 'à corriger'} — `
        + `${l.entreReel} entrée(s) en stock (attendu ${l.entre})`
        + (l.entre > 0 && !l.lotOk ? `, lot absent ou différent de ${LOT}` : '')).join('\n')
        + (intrus.length ? `\nEntrées inattendues : ${intrus.map((m) => `${m.sku} (${m.ref})`).join(', ')}` : '');
      return { status: tout ? 'ok' : 'ko', detail, ts: r.ctrl.at };
    },
  },
  {
    id: 'reserve',
    titre: 'Réserves signalées à Puma',
    verifier(db, U) {
      const sup = U.SUP_BY_ID.F003;
      if (!sup) return { status: 'na' };
      const mails = (db.mails || []).filter((m) => m.folder === 'out' && nrm(m.toMail) === nrm(sup.email))
        .sort((a, b) => a.ts - b.ts);
      if (!mails.length) return { status: 'attente' };
      const att = attendu();
      const manque = att.filter((a) => a.compte < a.annonce);
      const casse = att.filter((a) => a.etat === 'abime');

      const juger = (msg) => {
        const t = String(msg.text || '').toUpperCase();
        const aLot = t.includes(LOT);
        // Le manquant écrit en chiffres (la trame le dit) : en paires (« 6 ») ou en cartons (« 1 carton »).
        const aManque = manque.every((a) => {
          const paires = a.annonce - a.compte, cartons = paires / PAIRES_PAR_CARTON;
          return t.includes(a.sku) && (new RegExp(`\\b${paires}\\b`).test(t) || new RegExp(`\\b${cartons}\\s*CARTON`).test(t));
        });
        const aCasse = casse.every((a) => t.includes(a.sku));
        const ok = aLot && aManque && aCasse;
        const detail = `Message envoyé le ${new Date(msg.ts).toLocaleString('fr-FR')} à ${sup.brand}.\n`
          + `Numéro de lot ${LOT} : ${aLot ? 'présent' : 'absent'}\n`
          + `Manquant ${manque.map((a) => `${a.sku} (${a.annonce - a.compte} paires, ${(a.annonce - a.compte) / PAIRES_PAR_CARTON} carton)`).join(', ') || '—'} : ${aManque ? 'signalé' : 'incomplet'}\n`
          + `Colis endommagé ${casse.map((a) => a.sku).join(', ') || '—'} : ${aCasse ? 'signalé' : 'non signalé'}`;
        return { ok, detail, ts: msg.ts };
      };
      const evals = mails.map(juger);
      const best = evals.find((e) => e.ok) || evals[evals.length - 1];
      return { status: best.ok ? 'ok' : 'ko', detail: best.detail, ts: best.ts };
    },
  },
];
