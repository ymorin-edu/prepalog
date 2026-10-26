// ENT-12.8 — IKEA, « évaluation : la facture de mars » : les DONNÉES PURES (brief `docs/briefs/ENT-12.8-ikea-evaluation-gestion.md` ; choix de Tristan du 26/10/2026).
// Importé par le contenu (`contenus/ikea-ent128.js`), les questions, le corrigé et les tests. Mécanique de la facture : `contenus/ikea-facture.js` ; écrans :
// `contenus/ikea-facture-ecrans.js` ; univers : `contenus/ikea.js`.
//
// TIRAGE (un jeu par élève, graine = son identifiant) : TROIS erreurs parmi six, UNE de chaque niveau (équité du brief §6 bis) :
//   facile    : doublon, calcul (le total HT ne correspond pas à la somme des lignes)
//   moyen     : tarif (« dans la pièce » facturé, le bon dit « devant chez vous »), qte (un colis de plus que sur le bon)
//   difficile : nonfaite (livraison manquée facturée comme faite), supp (supplément d'étage facturé, l'immeuble a un ascenseur)
// et les VALEURS : l'ordre des douze livraisons, les noms des clients, les étages de trois immeubles, la ligne recopiée par le doublon, l'écart du faux total, les numéros de bon.
// La douzième livraison (qui disparaît quand il y a un doublon) et la ligne recopiée ne portent jamais d'erreur : les trois erreurs sont toujours présentes.

import { declarerTirage } from '../core/tirage.js';
import { SLOTS, NOMS_CLIENTS, ERREURS, construire } from './ikea-facture.js';

export const ID = 'ikea-evaluation-gestion';
export const ID_VOLET = 'ik-ent128';
export const FICHE_ID = 'controle-facture-128';
export const PHRASES_ID = 'reclamation-128';
export const MAIL_PRESTA = 'facturation@prestataire-livraison.example';
export const JOUR = { iso: '2027-04-06', lib: 'mardi 6 avril 2027' };
export const NUMERO = 'F-2027-0378';
export const PERIODE = 'livraisons de mars 2027';
export const ARTICLE_1302 = 'Tout paiement suppose une dette ; ce qui a été reçu sans être dû est sujet à restitution.';

// ─────────────────────────────────────────────────────────────── le tirage
export const PIECES = Object.entries(ERREURS).map(([id, e]) => ({ id, difficulte: e.niveau }));
const SANS_ROLE = SLOTS.filter((s) => !s.role && !s.issue && !s.reserve).map((s) => s.id);   // livraisons sans erreur possible ni piège

export function valeurs128(h) {
  // L'ordre des douze livraisons : la dernière (celle qui saute quand il y a un doublon) est sans rôle ; le doublon recopie une livraison sans rôle des onze premières.
  const derniere = h.choisir(SANS_ROLE);
  const reste = h.melanger(SLOTS.map((s) => s.id).filter((id) => id !== derniere));
  const ordre = [...reste, derniere];
  const doublonDe = h.choisir(reste.filter((id) => SANS_ROLE.includes(id)));
  return {
    ordre, doublonDe,
    clients: h.prendre(NOMS_CLIENTS, 12),
    etages: { b: h.entier(2, 4), h: h.entier(1, 3), j: h.entier(4, 6) },
    delta: 6 * h.entier(2, 8),
    base: h.entier(300, 390) * 100,
  };
}
export function ecartsJeu(jeu) {
  const E = [], P = (jeu.pieces && jeu.pieces.erreurs) || [], V = jeu.valeurs || {};
  const niveaux = P.map((p) => p.difficulte).sort().join(',');
  if (P.length !== 3 || niveaux !== 'difficile,facile,moyen') E.push(`les trois erreurs ne sont pas une par niveau : ${niveaux}`);
  if (!(V.ordre && V.ordre.length === 12 && new Set(V.ordre).size === 12)) E.push('ordre des livraisons invalide');
  else {
    const role = (id) => { const s = SLOTS.find((x) => x.id === id); return !!(s.role || s.issue || s.reserve); };
    if (role(V.ordre[11])) E.push('la douzième livraison porte un rôle');
    if (role(V.doublonDe) || V.ordre.indexOf(V.doublonDe) > 10) E.push('le doublon recopie une livraison à rôle ou la douzième');
  }
  return E;
}
export const TIRAGE = declarerTirage({
  banques: { erreurs: { pieces: PIECES, melange: { facile: 1, moyen: 1, difficile: 1 }, ordre: 'melange' } },
  valeurs: valeurs128, verifier: ecartsJeu, essais: 200,
});
TIRAGE.lier(ID);

// ─────────────────────────────────────────────────────────────── le dossier de l'élève (CALCULÉ depuis son tirage)
// Base sans tirage (contrôle au chargement) : le jeu d'une graine fixe, pour que les écrans aient leurs lignes. Il ne sert qu'au dessin.
let MODELE = null;
const baseModele = () => (MODELE || (MODELE = { tirages: { [ID]: { graine: 'modele', ...TIRAGE.tirer('modele') } } }));
const jeu = (db) => (TIRAGE.tirage(db) ? db : baseModele());
export const erreursDe = (db) => TIRAGE.piecesTirees(jeu(db), 'erreurs').map((p) => p.id);
export const niveauDe = (type) => ERREURS[type].niveau;
const CACHE = new Map();
export function dossier(db) {
  const d = jeu(db), rec = TIRAGE.tirage(d), E = erreursDe(d);
  const cle = `${rec.graine}|${E.join(',')}`;
  if (!CACHE.has(cle)) {
    const V = TIRAGE.valeursTirees(d);
    CACHE.set(cle, construire({ mois: 'mars', annee: 2027, ordre: V.ordre, clients: V.clients, etages: V.etages, erreurs: E, doublonDe: V.doublonDe, delta: V.delta, base: V.base }));
    if (CACHE.size > 400) CACHE.delete(CACHE.keys().next().value);
  }
  return CACHE.get(cle);
}
// La graine rangée, ou le jeu d'un uid donné (tests, corrigé) sans toucher à la base.
export const dossierDe = (graine) => dossier({ tirages: { [ID]: { graine, ...TIRAGE.tirer(graine) } } });

// ─────────────────────────────────────────────────────────────── lectures de la base de l'élève
const fiche = (db, id) => (db && db.fiches && db.fiches[id]) || null;
export const envoyee = (db, id) => !!(fiche(db, id) && fiche(db, id).envoye);
export const valeursDe = (db, id) => (fiche(db, id) || {}).valeurs || {};
export const geste = (db, nom) => !!(db && db.gestes && db.gestes[ID] && db.gestes[ID][nom]);
export const dejaEnvoyee = (id) => (db) => envoyee(db, id) || geste(db, `fiche:${id}:envoyer`);
// Une condition vraie dès que l'un des gestes a eu lieu (les noms sont contrôlés par le moteur).
export function ouGeste(...noms) {
  const f = (db, seance) => !!(db && db.gestes && db.gestes[seance] && noms.some((n) => db.gestes[seance][n]));
  f.gestes = noms;
  return f;
}
