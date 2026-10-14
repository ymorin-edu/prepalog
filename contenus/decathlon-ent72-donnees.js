// ENT-7.2 — Decathlon, « passer la commande » : les DONNÉES PURES de la séance (le conteneur de l'élève, le tirage, les attendus de l'ordre).
// À part de `contenus/decathlon-ent72.js` parce que ce fichier-ci se charge aussi hors navigateur (corrigé, tests) : rien ici n'importe le
// moteur (sauf `core/tirage.js`, module pur). Brief : `docs/briefs/ENT-7.2-decathlon-ordre-de-transport.md` §6 et §6 bis.
//
// La PIÈCE FIXE : un conteneur arrivé à Anvers, la barge de Contargo déjà choisie (séance 7.1), un ordre de transport à remplir.
// TIRÉ par élève : le numéro du conteneur (6 séries ; le chiffre de contrôle ISO 6346 est CALCULÉ), le scellé, le poids brut, la référence
// Decathlon, les deux instructions FAUSSES de l'ordre (parmi trois) ; pour un confirmé, une instruction fausse de plus (« hayon élévateur »).
// Tout ce qui est attendu est calculé ici, jamais écrit en dur.

import { declarerTirage, hasard } from '../core/tirage.js';
import { chiffreControle, numeroConteneur, PREFIXE } from './decathlon.js';

export const ID = 'decathlon-ordre-transport';
export const ID_VOLET = 'dk-ent72';
// Mercredi 27 janvier 2027, 9 h.
export const SCENARIO = { date: '2027-01-27', heure: '09:00' };

// Les écrans (ids JAMAIS modifiés : écrits dans la base de l'élève).
export const FICHE = 'ot';
export const B = { presta: 'presta', cont: 'cont', type: 'type', scelle: 'scelle', poids: 'poids', enl: 'enl', dispo: 'dispo', ref: 'ref',
  liv: 'liv', limd: 'limd', limh: 'limh', inst: 'inst' };
export const PLANNING_ID = 'quai-reception';
export const DIALOGUE = 'quai';

// Les pièces fixes du dossier.
export const OT = 'OT-2027-0142';
export const FICHIER = `${OT}.pdf`;
export const DISPO = { iso: '2027-01-28', h: 8 };            // mise à disposition au terminal d'Anvers
export const LIMITE = { iso: '2027-02-02', h: 14 };          // au quai de Rouvignies, au plus tard
export const ARRIVEE = { iso: '2027-02-01', h: 9 };          // arrivée du camion de Contargo (lundi 01/02)
export const PRIX = 740;                                      // € HT, devis Contargo (construit)

// Les listes de la fiche. Les valeurs (`v`) sont écrites dans la base des élèves : JAMAIS modifiées.
export const PRESTAS = [{ v: 'routiers', lib: 'Routiers du Hainaut' }, { v: 'contargo', lib: 'Contargo' }, { v: 'rail', lib: 'Rail Flandres-Artois' }];
export const TYPES = [{ v: '20', lib: '20 pieds' }, { v: '40', lib: '40 pieds' }, { v: '40hc', lib: '40 pieds high cube (40’ HC)' }];
export const LIEUX_ENL = [{ v: 'anvers', lib: 'Terminal à conteneurs, port d’Anvers' }, { v: 'bruay', lib: 'Terminal de Bruay-sur-l’Escaut' },
  { v: 'rouvignies', lib: 'Entrepôt de Rouvignies' }];
export const LIEUX_LIV = [{ v: 'rouvignies', lib: 'Decathlon Rouvignies — quai de réception conteneurs' }, { v: 'dourges', lib: 'Decathlon Dourges — Delta 3' },
  { v: 'bruay', lib: 'Terminal de Bruay-sur-l’Escaut' }];
export const BONNES = { presta: 'contargo', type: '40hc', enl: 'anvers', liv: 'rouvignies' };

// Les instructions de l'ordre : 3 justes (toujours là) ; les fausses sont TIRÉES dans la banque (`instructions`, 2 parmi 3) ;
// pour un confirmé, une 4e fausse (le bonus). Les `v` des justes ne changent jamais.
export const INSTRUCTIONS_JUSTES = [
  { v: 'rdv', lib: 'Livraison sur rendez-vous : prendre le créneau auprès du quai de réception.' },
  { v: 'scelle', lib: 'Ne pas briser le scellé : il est ouvert au quai, à réception.' },
  { v: 'vide', lib: 'Ramener le conteneur vide au terminal après déchargement.' },
];

// Les numéros de conteneur : 6 séries, chacune avec le rang de la paire de chiffres voisins que le chef de quai « lit mal » (le piège de
// la 2e réplique). Contrôle : le vrai chiffre de contrôle de la paire inversée est DIFFÉRENT de celui de l'élève (sinon le piège serait
// un numéro valable). Différentes de la banque d'ENT-7.1.
export const SERIES = [
  { serie: '418270', paire: 3 }, { serie: '530982', paire: 3 }, { serie: '271645', paire: 3 },
  { serie: '904316', paire: 2 }, { serie: '362708', paire: 3 }, { serie: '687153', paire: 3 },
];
export const seriePiege = ({ serie, paire }) => serie.slice(0, paire) + serie[paire + 1] + serie[paire] + serie.slice(paire + 2);

// ─────────────────────────────────────────────────────────────── les banques (JAMAIS de pièce supprimée ni renumérotée)
// `instructions` : 3 fausses (moyen, 2 tirées) + « hayon » (difficile : tirée seulement comme bonus du confirmé).
export const BANQUE_INSTRUCTIONS = [
  { id: 'in-froid', difficulte: 'moyen', v: 'froid', lib: 'Conteneur frigorifique : maintenir à −18 °C.' },
  { id: 'in-adr', difficulte: 'moyen', v: 'adr', lib: 'Marchandises dangereuses : transport ADR.' },
  { id: 'in-douane', difficulte: 'moyen', v: 'douane', lib: 'Livraison en zone sous douane.' },
  { id: 'in-hayon', difficulte: 'difficile', v: 'hayon', lib: 'Hayon élévateur obligatoire.' },
];

// ─────────────────────────────────────────────────────────────── le jeu d'un élève
// Les valeurs tirées ; DEFAUT = l'élève « témoin » du brief (base vide, contrôle au chargement).
export const DEFAUT = { serie: 0, scelle: 771409, poids: 14980, ref: 412 };
const valeursTirees = (h) => ({ serie: h.entier(0, SERIES.length - 1), scelle: h.entier(100000, 9999999), poids: 13500 + 10 * h.entier(0, 230),
  ref: h.entier(1, 9999) });

const z = (n, k) => String(n).padStart(k, '0');
export function jeuDe({ instructions = ['in-froid', 'in-adr'], bonus = [], valeurs = DEFAUT, graine = '' } = {}) {
  const V = { ...DEFAUT, ...(valeurs || {}) };
  const S = SERIES[V.serie] || SERIES[0];
  const conteneur = numeroConteneur(PREFIXE, S.serie);
  const piege = `${PREFIXE} ${seriePiege(S)} ${chiffreControle(PREFIXE + S.serie)}`;
  const fausses = instructions.map((id) => BANQUE_INSTRUCTIONS.find((p) => p.id === id)).filter(Boolean);
  const plus = bonus.map((id) => BANQUE_INSTRUCTIONS.find((p) => p.id === id)).filter(Boolean);
  const liste = [...INSTRUCTIONS_JUSTES.map((x) => ({ ...x, juste: true })), ...fausses.map((p) => ({ v: p.v, lib: p.lib, juste: false })),
    ...plus.map((p) => ({ v: p.v, lib: p.lib, juste: false, bonus: true }))];
  const ordre = graine ? hasard(`${graine}|instructions`).melanger(liste) : liste;
  return {
    valeurs: V, conteneur, piege, sansEspaces: conteneur.replace(/\s/g, ''),
    scelle: `DC ${z(V.scelle, 7).replace(/^(\d)(\d{3})(\d{3})$/, '$1 $2 $3')}`, poids: V.poids,
    reference: `PO-ROU-2027-${z(V.ref, 4)}`,
    instructions: ordre, fausses: fausses.map((p) => p.v), bonusV: plus.map((p) => p.v),
  };
}

// Contrôle d'équité : les écarts en clair (vide = conforme).
export function ecartsEquite(J) {
  const E = [];
  const cc = (s) => chiffreControle(s);
  const num = J.sansEspaces, pieg = J.piege.replace(/\s/g, '');
  if (num === pieg) E.push('le numéro piège est le numéro lui-même');
  if (cc(pieg.slice(0, 10)) === Number(pieg.slice(-1))) E.push('le numéro piège a un chiffre de contrôle valable');
  if (J.fausses.length !== 2) E.push(`${J.fausses.length} instruction(s) fausse(s) au lieu de 2`);
  if (new Set(J.instructions.map((x) => x.v)).size !== J.instructions.length) E.push('deux instructions identiques');
  if (!J.reference.match(/^PO-ROU-2027-\d{4}$/)) E.push('référence mal formée');
  return E;
}

const jeuDuTirage = (jeu) => jeuDe({ instructions: jeu.pieces.instructions.map((p) => p.id), bonus: ((jeu.bonus && jeu.bonus.instructions) || []).map((p) => p.id),
  valeurs: jeu.valeurs });
export const TIRAGE = declarerTirage({
  banques: { instructions: { pieces: BANQUE_INSTRUCTIONS, melange: { moyen: 2 }, bonus: { confirme: { difficile: 1 } }, ordre: 'fixe' } },
  valeurs: valeursTirees,
  verifier: (jeu) => ecartsEquite(jeuDuTirage(jeu)),
});
TIRAGE.lier(ID);

// Le jeu de l'élève, lu dans sa base (sans tirage — base vide, contrôle au chargement — : le jeu « témoin » du brief).
export function jeuEleve(db) {
  const rec = TIRAGE.tirage(db);
  if (!rec) return jeuDe({});
  return jeuDe({ instructions: TIRAGE.piecesTirees(db, 'instructions').map((p) => p.id), bonus: TIRAGE.piecesBonus(db, 'instructions').map((p) => p.id),
    valeurs: TIRAGE.valeursTirees(db), graine: rec.graine });
}

// ─────────────────────────────────────────────────────────────── lectures de la base de l'élève (sans le moteur)
export function lireNombre(s) {
  const t = String(s == null ? '' : s).replace(/[\s  ]/g, '').replace(',', '.');
  return /^-?\d+(\.\d+)?$/.test(t) ? Number(t) : NaN;
}
export function lireHeure(s) {
  const m = String(s == null ? '' : s).trim().toLowerCase().match(/^(\d{1,2})\s*(?:[:h]\s*(\d{2})?)?$/);
  if (!m) return NaN;
  const h = Number(m[1]), mn = m[2] ? Number(m[2]) : 0;
  return h < 24 && mn < 60 ? h * 60 + mn : NaN;
}
// L'ordre de l'élève : `{ envoye (enregistré), v }`.
export function ordre(db) {
  const f = db && db.fiches && db.fiches[FICHE];
  return { envoye: !!(f && f.envoye), v: (f && f.valeurs) || {} };
}
export const sansEspaces = (s) => String(s == null ? '' : s).replace(/[\s  ]/g, '').toUpperCase();
// Les cases cochées de l'ordre (liste de `v`).
export const cochees = (v) => (Array.isArray(v[B.inst]) ? v[B.inst] : []);
// Le prénom de l'élève : celui du premier message reçu (« to »).
export const prenomDe = (db) => { const m = ((db && db.mails) || []).find((x) => x.folder === 'in' && x.to); return m ? String(m.to) : ''; };
// La place du créneau envoyé : { r, s } ou null. Heure = 07:00 + 30 min × s.
export const creneauEnvoye = (db) => { const e = db && db.plannings && db.plannings[PLANNING_ID]; return (e && e.v1 && e.v1.place && e.v1.place.cont) || null; };
export const heureCreneau = (s) => { const m = 7 * 60 + 30 * s; return `${z(Math.floor(m / 60), 2)}:${z(m % 60, 2)}`; };
