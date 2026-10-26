// ENT-13.1 — Stellantis Sochaux, « une voiture par minute » : les DONNÉES PURES (brief `docs/briefs/ENT-13.1-stellantis-une-voiture-par-minute.md` ; choix de Tristan du 26/10/2026).
// Importé par le contenu (`contenus/stellantis-ent131.js`), les questions, le corrigé et les tests. Univers : `contenus/stellantis.js`. Aucun effet de bord.
//
// VÉRIFIÉ (cadrage du 26/10/2026 ; Le Trois, 13/04/2026, 05/09/2022 et 16/07/2026 ; communiqué Stellantis du 05/09/2022) : l'usine de Sochaux (Doubs), la ligne unique 3008 (environ 70 %) et 5008
// (environ 30 %), environ 1 045 voitures par jour (une par minute), 250 camions et 500 fournisseurs par jour, le stock de quelques heures à une journée et demie, le transstockeur (mis en service le
// 16/08/2022, une palette sortie en environ 6 minutes), les robots autonomes (environ trois quarts des pièces au bord de ligne), la pièce qui parcourt 150 à 200 m (1 km avant), les pièces
// commandées le matin même à un équipementier voisin (SMRC, à Rougegoutte) ou quinze semaines à l'avance à Shanghai, une chaîne à l'arrêt qui immobilise environ 1 200 personnes, 70 % des
// voitures par la route et 30 % par le rail, les voitures garées sur l'ancien aérodrome de Lure-Malbouhans en 2022.
// CONSTRUIT : Karim, la PFMP, la pièce suivie (un rétroviseur : une famille de pièces, jamais une référence du constructeur), les étapes détaillées de son voyage, les questions de calcul.
// NON DIT : ce que SMRC fabrique pour Sochaux (non vérifié) : la séance dit « un équipementier voisin ».
// LE TIRAGE : l'ordre de départ du voyage de la pièce (au moins deux inversions de l'ordre juste, sinon envoyer sans rien toucher rapporterait des points), le nombre de voitures du jour et la
// part de 5008 (la question de calcul se recalcule), l'ordre des phrases de « Usine ou entrepôt ».

import { declarerTirage } from '../core/tirage.js';

export const ID = 'stellantis-une-voiture-par-minute';
export const VUE = 'stellantis-carte';
export const ID_VOLET = 'abc-1-accueil';
// Les fiches (ids JAMAIS modifiés : écrits dans la base des élèves).
export const FICHES = { voyage: 'voyage-131', chiffres: 'chiffres-131', usine: 'usine-131' };
export const JOUR = { iso: '2027-09-13', lib: 'lundi 13 septembre 2027' };

// ─────────────────────────────────────────────────────────────── ② le voyage d'une pièce (8 étapes)
export const VOYAGE = [
  { v: 'commande', lib: 'L’usine commande des rétroviseurs à un fournisseur' },
  { v: 'camion', lib: 'Le camion du fournisseur arrive au quai à l’heure de son rendez-vous' },
  { v: 'controle', lib: 'Les palettes sont déchargées et contrôlées à la réception' },
  { v: 'rangement', lib: 'Une palette est rangée dans le transstockeur' },
  { v: 'sortie', lib: 'La ligne en a besoin : le transstockeur sort la palette (environ 6 minutes)' },
  { v: 'robot', lib: 'Un robot autonome amène les rétroviseurs au bord de ligne' },
  { v: 'montage', lib: 'Le rétroviseur est monté sur la voiture' },
  { v: 'expedition', lib: 'La voiture terminée part par la route ou par le rail' },
];
export const ORDRE_VOYAGE = VOYAGE.map((e) => e.v);
export const libEtape = (v) => (VOYAGE.find((e) => e.v === v) || {}).lib || v;
export const memeOrdre = (a, b) => Array.isArray(a) && a.length === b.length && a.every((x, i) => x === b[i]);
export function inversions(ordre, juste) {
  if (!Array.isArray(ordre) || ordre.length !== juste.length) return Infinity;
  const rang = ordre.map((v) => juste.indexOf(v));
  if (rang.some((r) => r < 0) || new Set(rang).size !== juste.length) return Infinity;
  let n = 0;
  for (let i = 0; i < rang.length; i++) for (let j = i + 1; j < rang.length; j++) if (rang[i] > rang[j]) n++;
  return n;
}

// ─────────────────────────────────────────────────────────────── ③ les chiffres de l'usine
export const CHAMP = { parheure: 'parheure', cinq: 'cinq', stock: 'stock', manque: 'manque' };
export const PAR_HEURE = 60;                                  // une voiture par minute
export const STOCK_RAISONS = [
  { v: 'fournisseurs', lib: 'Elle n’a pas assez de fournisseurs' },
  { v: 'place', lib: 'Il n’y a pas de place pour en garder : l’usine a deux fois moins de surface depuis 2022, et un stock coûte de l’argent' },
  { v: 'ventes', lib: 'Les voitures se vendent mal' },
];
export const MANQUE_EFFETS = [
  { v: 'sans', lib: 'On monte la voiture sans la pièce, on la posera plus tard' },
  { v: 'main', lib: 'Rien : on fabrique la pièce à la main' },
  { v: 'arret', lib: 'La ligne s’arrête : environ 1 200 personnes attendent' },
];
export const JUSTE_STOCK = 'place', JUSTE_MANQUE = 'arret';
// Le calcul de la part de 5008 : le nombre attendu, et ce qu'on accepte (3 % autour, jamais moins de 3 voitures : un arrondi de tête reste juste).
export const cinqCents = (voitures, part) => voitures * part / 100;
export const accepte5008 = (voitures, part, x) => { const e = cinqCents(voitures, part); return Number.isFinite(x) && Math.abs(x - e) <= Math.max(3, 0.03 * e); };

// ─────────────────────────────────────────────────────────────── ④ usine ou entrepôt
export const PHRASES = [
  { id: 'client-ligne', lib: 'Son client, c’est la ligne de montage.', juste: 'usine' },
  { id: 'client-conso', lib: 'Son client, c’est un consommateur qui a commandé sur internet.', juste: 'entrepot' },
  { id: 'stock-heures', lib: 'Son stock couvre quelques heures de production.', juste: 'usine' },
  { id: 'stock-semaines', lib: 'Son stock couvre des semaines de ventes.', juste: 'entrepot' },
  { id: 'piece-montee', lib: 'La pièce reçue part pour être montée sur un produit.', juste: 'usine' },
  { id: 'colis-livre', lib: 'Le colis préparé part pour être livré à un client.', juste: 'entrepot' },
];
export const LIEUX_CHOIX = [{ v: 'usine', lib: 'Plutôt l’usine de Sochaux' }, { v: 'entrepot', lib: 'Plutôt un entrepôt de distribution (comme celui de Cdiscount)' }];
export const CHAMP_PHRASE = (id) => `phrase_${id}`;

// ─────────────────────────────────────────────────────────────── le tirage rangé par élève
const ecarts = (jeu) => {
  const E = [], V = jeu.valeurs || {};
  if (inversions(V.voyage, ORDRE_VOYAGE) < 2) E.push('voyage : l’ordre de départ est juste ou à une inversion près');
  if (!(V.part >= 28 && V.part <= 32)) E.push('part de 5008 hors de 28 à 32 %');
  if (!(V.voitures >= 1030 && V.voitures <= 1070)) E.push('voitures du jour hors de 1 030 à 1 070');
  if (!Array.isArray(V.phrases) || new Set(V.phrases).size !== PHRASES.length) E.push('phrases mal mélangées');
  return E;
};
export const TIRAGE = declarerTirage({
  banques: { usine: { pieces: [{ id: 'sochaux' }], fixes: ['sochaux'], melange: {}, ordre: 'fixe' } },   // une pièce fixe : l'usine de Sochaux
  valeurs: (h) => ({ voyage: h.melanger(ORDRE_VOYAGE), part: h.entier(28, 32), voitures: h.entier(1030, 1070), phrases: h.melanger(PHRASES.map((p) => p.id)) }),
  verifier: ecarts,
});
TIRAGE.lier(ID);
const V = (db) => TIRAGE.valeursTirees(db) || {};
export function ordreDepart(db) {
  const o = V(db).voyage;
  return Array.isArray(o) && o.length === ORDRE_VOYAGE.length ? o : ORDRE_VOYAGE.slice().reverse();
}
export const voituresDuJour = (db) => V(db).voitures || 1045;
export const partCinq = (db) => V(db).part || 30;
export function phrasesDepart(db) {
  const o = V(db).phrases;
  return Array.isArray(o) && o.length === PHRASES.length ? o.map((id) => PHRASES.find((p) => p.id === id)) : PHRASES.slice();
}

// ─────────────────────────────────────────────────────────────── lire la base (sans interface)
export function fiche(db, id) {
  const f = db && db.fiches && db.fiches[id];
  return { envoye: !!(f && f.envoye), valeurs: (f && f.valeurs) || {} };
}
export const envoyee = (db, id) => fiche(db, id).envoye;
export const geste = (db, nom) => !!(db && db.gestes && db.gestes[ID] && db.gestes[ID][nom]);
export const dejaEnvoyee = (id) => (db) => envoyee(db, id) || geste(db, `fiche:${id}:envoyer`);
