// ENT-11.1 — Mondial Relay, le voyage d’un colis : les DONNÉES PURES de la séance (voyage du colis, banque de colis, règle de classement,
// tirage, lectures de la base de l’élève). Aucun effet de bord, aucune interface : importé par le contenu (`contenus/mondial-relay-ent111.js`)
// et le corrigé (`contenus/corriges/ENT-11.1.js`, qui se charge sous Node). Les valeurs attendues du classement sont CALCULÉES depuis `REGLES_COLIS`.
// Objets, poids et dimensions des colis : INVENTÉS (aucune donnée réelle). Voir l’en-tête de `contenus/mondial-relay-ent111.js`.

import { declarerTirage } from '../core/tirage.js';
import { REGLES_COLIS } from './mondial-relay.js';

export const ID = 'mondial-relay-voyage-colis';
export const VUE = 'mondial-relay-carte';
export const ID_VOLET = 'mondial-relay-ent111';
// Les fiches (ids JAMAIS modifiés : écrits dans la base des élèves).
export const FICHES = { voyage: 'voyage', colis: 'colis' };

// ─────────────────────────────────────────────────────────────── ② le voyage du colis d’Inès (7 étapes, DANS L’ORDRE JUSTE)
// Les clés `v` ne portent pas le rang. Le trajet est construit (l’ordre général d’un colis entre deux particuliers est celui d’un réseau
// de messagerie avec hub). L’étape du retrait ne cite pas les cinq jours (la question de Romain les demande).
export const VOYAGE = [
  { v: 'depot', lib: 'Inès dépose son colis dans un Point Relais de Reims' },
  { v: 'ramassage', lib: 'Un camion de l’agence ramasse le colis au Point Relais' },
  { v: 'hub', lib: 'Le colis arrive au hub, où il est trié' },
  { v: 'navette', lib: 'Une navette emmène le colis vers l’agence de destination' },
  { v: 'tournee', lib: 'L’agence charge le colis dans la tournée de livraison' },
  { v: 'relais', lib: 'Le livreur dépose le colis au Point Relais de Bar-sur-Seine' },
  { v: 'retrait', lib: 'L’acheteur vient retirer le colis' },
];
export const ORDRE_JUSTE = VOYAGE.map((e) => e.v);
export const libVoyage = (v) => (VOYAGE.find((e) => e.v === v) || {}).lib || v;
export const memeOrdre = (a, b) => Array.isArray(a) && a.length === b.length && a.every((x, i) => x === b[i]);
// Le nombre de paires dans le désordre (0 = ordre juste, 1 = deux étapes voisines échangées).
export function inversions(ordre, juste = ORDRE_JUSTE) {
  if (!Array.isArray(ordre) || ordre.length !== juste.length) return Infinity;
  const rang = ordre.map((v) => juste.indexOf(v));
  if (rang.some((r) => r < 0) || new Set(rang).size !== juste.length) return Infinity;
  let n = 0;
  for (let i = 0; i < rang.length; i++) for (let j = i + 1; j < rang.length; j++) if (rang[i] > rang[j]) n++;
  return n;
}

// ─────────────────────────────────────────────────────────────── ③ les colis : la règle, calculée depuis REGLES_COLIS
// Longueur = le plus grand côté ; somme = les trois côtés additionnés. Un colis va :
//   - en LOCKER s’il respecte les trois limites du locker ;
//   - sinon au POINT RELAIS s’il respecte les trois limites du Point Relais ;
//   - sinon, ou s’il contient un produit interdit, il est REFUSÉ.
export const longueur = (c) => Math.max(...c.cm);
export const somme = (c) => c.cm.reduce((a, b) => a + b, 0);
const tient = (c, L) => c.kg <= L.poidsMax && longueur(c) <= L.longueurMax && somme(c) <= L.sommeMax;
export function classer(c, R = REGLES_COLIS) {
  if (c.interdit) return 'refuse';
  if (tient(c, R.locker)) return 'locker';
  if (tient(c, R.relais)) return 'relais';
  return 'refuse';
}
export const CLASSES = [
  { v: 'locker', lib: 'Locker' },
  { v: 'relais', lib: 'Point Relais' },
  { v: 'refuse', lib: 'Refusé' },
];
export const libClasse = (v) => (CLASSES.find((x) => x.v === v) || {}).lib || v;

// La banque (ids JAMAIS supprimés ni renumérotés). Objets, poids et dimensions INVENTÉS. `cm` : les trois côtés, du plus grand au plus petit.
// La pièce FIXE est le colis d’Inès (fil rouge : 3,2 kg, Point Relais, car plus long que la limite du locker).
export const COLIS = [
  { id: 'c-ines', objet: 'Une lampe en céramique (le colis d’Inès)', kg: 3.2, cm: [70, 30, 30] },
  // faciles (4)
  { id: 'c-livres', difficulte: 'facile', objet: 'Un carton de livres', kg: 2.1, cm: [30, 22, 15] },
  { id: 'c-pull', difficulte: 'facile', objet: 'Un pull plié dans une pochette', kg: 0.6, cm: [35, 25, 8] },
  { id: 'c-gaz', difficulte: 'facile', objet: 'Une bouteille de gaz', kg: 14, cm: [60, 30, 30], interdit: 'produit dangereux' },
  { id: 'c-fauteuil', difficulte: 'facile', objet: 'Un fauteuil', kg: 18, cm: [100, 60, 60] },
  // moyens (5)
  { id: 'c-tapis', difficulte: 'moyen', objet: 'Un tapis roulé', kg: 8, cm: [110, 20, 20] },
  { id: 'c-miroir', difficulte: 'moyen', objet: 'Un grand miroir', kg: 9, cm: [90, 60, 10] },
  { id: 'c-outils', difficulte: 'moyen', objet: 'Une caisse d’outils', kg: 16, cm: [55, 35, 30] },
  { id: 'c-skis', difficulte: 'moyen', objet: 'Une paire de skis', kg: 6, cm: [160, 20, 15] },
  { id: 'c-ecran', difficulte: 'moyen', objet: 'Un écran d’ordinateur', kg: 7, cm: [70, 50, 15] },
  // difficiles (3) : la somme juste au-dessus de la limite, 26 kg (un kilo de trop pour le locker), une denrée surgelée
  { id: 'c-meuble', difficulte: 'difficile', objet: 'Un meuble en kit', kg: 22, cm: [118, 30, 3] },
  { id: 'c-croquettes', difficulte: 'difficile', objet: 'Un sac de croquettes pour chien', kg: 26, cm: [60, 40, 25] },
  { id: 'c-surgeles', difficulte: 'difficile', objet: 'Des plats surgelés', kg: 4, cm: [35, 25, 20], interdit: 'denrée sous température dirigée' },
];

// L’équité du tirage : le socle (hors pièce fixe) contient au moins un colis « locker » et un colis « refusé », et l’ordre de départ du
// voyage est à DEUX inversions ou plus de l’ordre juste (sinon envoyer sans rien toucher rapporterait des points).
export function ecartsEquite(jeu) {
  const E = [];
  const socle = ((jeu.pieces && jeu.pieces.colis) || []).filter((p) => p.difficulte);
  const classes = socle.map((p) => classer(p));
  if (!classes.includes('locker')) E.push('colis : aucun colis « locker » dans le socle');
  if (!classes.includes('refuse')) E.push('colis : aucun colis « refusé » dans le socle');
  if (!jeu.valeurs || inversions(jeu.valeurs.voyage) < 2) E.push('voyage : l’ordre de départ tiré est juste ou à une inversion près');
  return E;
}
export const TIRAGE = declarerTirage({
  banques: {
    colis: { pieces: COLIS, fixes: ['c-ines'], melange: { facile: 2, moyen: 3, difficile: 1 }, bonus: { confirme: { difficile: 2 } }, ordre: 'melange' },
  },
  // L’ordre de départ du voyage, tiré par élève et RANGÉ.
  valeurs: (h) => ({ voyage: h.melanger(ORDRE_JUSTE) }),
  verifier: ecartsEquite,
});
TIRAGE.lier(ID);

// Les colis de l’élève, dans l’ordre de SA fiche : le socle (pièce fixe comprise, ordre tiré), puis les colis bonus du confirmé.
export const colisSocle = (db) => TIRAGE.piecesTirees(db, 'colis');
export const colisDe = (db) => [...colisSocle(db), ...TIRAGE.piecesBonus(db, 'colis')];
export function ordreDepart(db) {
  const o = TIRAGE.valeursTirees(db).voyage;
  return Array.isArray(o) && o.length === ORDRE_JUSTE.length ? o : ['retrait', 'hub', 'depot', 'relais', 'navette', 'ramassage', 'tournee'];
}
export const champColis = (i) => `colis-${i + 1}`;

// Une fiche envoyée (lecture seule) : { envoye, valeurs }.
export function fiche(db, id) {
  const f = db && db.fiches && db.fiches[id];
  return { envoye: !!(f && f.envoye), valeurs: (f && f.valeurs) || {} };
}
// Une fiche déjà envoyée une fois (même rouverte par « Corriger » ensuite) : la suite ne se referme pas.
export const dejaEnvoyee = (id) => (db) => { const f = db && db.fiches && db.fiches[id]; return !!(f && (f.envoye || f.envois)); };

// ─────────────────────────────────────────────────────────────── les règles montrées sur la fiche (calculées)
const kg = (n) => `${String(n).replace('.', ',')} kg`;
export function texteRegles(R = REGLES_COLIS) {
  const L = (x) => `${kg(x.poidsMax)} au plus, ${x.longueurMax} cm de long au plus, ${x.sommeMax} cm au plus pour les trois côtés additionnés`;
  return `<b>Locker</b> : ${L(R.locker)}.<br><b>Point Relais</b> : ${L(R.relais)}.<br>`
    + 'La longueur, c’est le plus grand côté. Un colis qui contient un produit interdit est refusé, quelle que soit sa taille : '
    + 'produit dangereux, animal, produit à garder au frais ou surgelé.<br>'
    + 'Classe chaque colis : <b>locker</b> s’il respecte toutes les limites du locker ; sinon <b>Point Relais</b> s’il respecte celles du Point Relais ; sinon <b>refusé</b>.';
}
export const decrireColis = (c) => `${c.objet} : ${kg(c.kg)}, ${c.cm.join(' × ')} cm`;

