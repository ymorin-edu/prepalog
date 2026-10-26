// ENT-12.1 — IKEA, « une commande, deux chemins » : les DONNÉES PURES (brief `docs/briefs/ENT-12.1-ikea-une-commande-deux-chemins.md` ; choix de Tristan du 26/10/2026).
// Importé par le contenu (`contenus/ikea-ent121.js`), les questions, le corrigé et les tests. Univers : `contenus/ikea.js`. Aucun effet de bord.
//
// VÉRIFIÉ (26/10/2026, voir `contenus/ikea.js`) : le centre de distribution clients de Gennevilliers (Hauts-de-Seine), la livraison par la Seine depuis le 14/12/2022 (péniche jusqu'à Bercy, puis
// utilitaires électriques), le Point Relais Mondial Relay (cinq jours de garde), les modes de livraison. CONSTRUIT : Mme Benali, sa commande, les étapes détaillées de chaque parcours (le CHEMIN réel
// d'une armoire dans le centre n'est pas connu dans le détail : les étapes sont celles d'un centre de distribution), les noms des salariés.
// LE TIRAGE : l'ordre de départ des deux parcours est tiré par élève et rangé (au moins deux inversions de l'ordre juste, sinon envoyer sans rien toucher rapporterait des points).

import { declarerTirage } from '../core/tirage.js';

export const ID = 'ikea-deux-chemins';
export const VUE = 'ikea-carte';
export const ID_VOLET = 'ik-ent121';
// Les fiches (ids JAMAIS modifiés : écrits dans la base des élèves).
export const FICHES = { armoire: 'armoire-121', lampe: 'lampe-121', chemins: 'chemins-121' };
export const JOUR = { iso: '2027-03-08', lib: 'lundi 8 mars 2027' };

// ─────────────────────────────────────────────────────────────── ② le chemin de l'armoire (7 étapes)
export const ARMOIRE = [
  { v: 'fournisseur', lib: 'Un fournisseur envoie les armoires au centre de distribution clients' },
  { v: 'reception', lib: 'Le centre de Gennevilliers reçoit les armoires et les range en stock' },
  { v: 'preparation', lib: 'Les trois colis de l’armoire de Mme Benali sont préparés et chargés' },
  { v: 'peniche', lib: 'La péniche emmène la commande de Gennevilliers jusqu’au port de Bercy' },
  { v: 'bercy', lib: 'La péniche arrive à Bercy, la commande est déchargée' },
  { v: 'utilitaire', lib: 'Un utilitaire électrique prend les colis à Bercy' },
  { v: 'livraison', lib: 'Le livreur monte l’armoire chez Mme Benali' },
];
// ─────────────────────────────────────────────────────────────── ③ le chemin de la lampe (6 étapes)
export const LAMPE = [
  { v: 'preparation', lib: 'Le centre prépare la lampe et la remet à Mondial Relay' },
  { v: 'agence', lib: 'Une agence Mondial Relay ramasse le colis' },
  { v: 'hub', lib: 'Le colis passe par un hub, où il est trié' },
  { v: 'agence-arrivee', lib: 'Une agence de la région de Mme Benali reçoit le colis' },
  { v: 'relais', lib: 'Le colis est déposé au Point Relais, où il attend Mme Benali cinq jours' },
  { v: 'retrait', lib: 'Mme Benali vient retirer sa lampe' },
];
export const ORDRE_ARMOIRE = ARMOIRE.map((e) => e.v);
export const ORDRE_LAMPE = LAMPE.map((e) => e.v);
export const libEtape = (L, v) => (L.find((e) => e.v === v) || {}).lib || v;
export const memeOrdre = (a, b) => Array.isArray(a) && a.length === b.length && a.every((x, i) => x === b[i]);
export function inversions(ordre, juste) {
  if (!Array.isArray(ordre) || ordre.length !== juste.length) return Infinity;
  const rang = ordre.map((v) => juste.indexOf(v));
  if (rang.some((r) => r < 0) || new Set(rang).size !== juste.length) return Infinity;
  let n = 0;
  for (let i = 0; i < rang.length; i++) for (let j = i + 1; j < rang.length; j++) if (rang[i] > rang[j]) n++;
  return n;
}

// ─────────────────────────────────────────────────────────────── ④ les trois articles et leur chemin
export const MODES = [
  { v: 'relais', lib: 'Point Relais' },
  { v: 'colis', lib: 'Colis à domicile' },
  { v: 'meubles', lib: 'Livraison de meubles' },
];
export const ARTICLES = [
  { id: 'lampe', lib: 'La lampe', detail: '1 colis de 1,8 kg, 42 cm', mode: 'relais' },
  { id: 'armoire', lib: 'L’armoire', detail: '3 colis de 40, 38 et 34 kg, jusqu’à 201 cm', mode: 'meubles' },
  { id: 'canape', lib: 'Le canapé', detail: '2 colis de 42 et 31 kg, jusqu’à 220 cm', mode: 'meubles' },
];
export const CHAMP = (art) => `mode_${art}`;

// ─────────────────────────────────────────────────────────────── le tirage : l'ordre de départ des deux parcours, rangé par élève
const ecarts = (jeu) => {
  const E = [], V = jeu.valeurs || {};
  if (inversions(V.armoire, ORDRE_ARMOIRE) < 2) E.push('armoire : l’ordre de départ est juste ou à une inversion près');
  if (inversions(V.lampe, ORDRE_LAMPE) < 2) E.push('lampe : l’ordre de départ est juste ou à une inversion près');
  return E;
};
export const TIRAGE = declarerTirage({
  banques: { commande: { pieces: [{ id: 'commande-benali' }], fixes: ['commande-benali'], melange: {}, ordre: 'fixe' } },   // une pièce fixe : la commande de Mme Benali
  valeurs: (h) => ({ armoire: h.melanger(ORDRE_ARMOIRE), lampe: h.melanger(ORDRE_LAMPE) }),
  verifier: ecarts,
});
TIRAGE.lier(ID);
export function ordreDepart(db, quoi) {
  const juste = quoi === 'armoire' ? ORDRE_ARMOIRE : ORDRE_LAMPE;
  const V = TIRAGE.valeursTirees(db)[quoi];
  return Array.isArray(V) && V.length === juste.length ? V : juste.slice().reverse();
}

// ─────────────────────────────────────────────────────────────── lire la base (sans interface)
export function fiche(db, id) {
  const f = db && db.fiches && db.fiches[id];
  return { envoye: !!(f && f.envoye), valeurs: (f && f.valeurs) || {} };
}
export const envoyee = (db, id) => fiche(db, id).envoye;
export const geste = (db, nom) => !!(db && db.gestes && db.gestes[ID] && db.gestes[ID][nom]);
export const dejaEnvoyee = (id) => (db) => envoyee(db, id) || geste(db, `fiche:${id}:envoyer`);
