// ENT-12.6 — IKEA, « l'armoire de Mme Benali » : les DONNÉES PURES (brief `docs/briefs/ENT-12.6-ikea-larmoire-de-mme-benali.md` ; choix de Tristan du 26/10/2026).
// Importé par le contenu (`contenus/ikea-ent126.js`), les questions, le corrigé et les tests. Univers : `contenus/ikea.js`. Aucun effet de bord.
//
// LE JOUR : mardi 9 mars 2027, 14 h, zone de préparation du centre de Gennevilliers. L'élève (employé(e) logistique) prépare deux commandes de meubles en colis lourds et longs : celle de Mme Benali
// (l'armoire en trois colis et le canapé en deux colis, de la séance ENT-12.1) et celle d'un second client (trois colis, tirée par élève dans une banque de quatre).
// VÉRIFIÉ (26/10/2026, voir `contenus/ikea.js`) : le centre prépare surtout des produits lourds et volumineux, les commandes partent en caisses mobiles vers Bercy ; une SEULE source (L'Info durable,
// décembre 2022) donne 18 m³ et 13 commandes au plus par caisse mobile ; le port de charges (au-delà de 55 kg portés de façon habituelle, l'aptitude reconnue par le médecin du travail, Code du travail,
// art. R4541-9 : reformulé, non cité, à relire sur Légifrance). CONSTRUIT : le plan de la zone (les positions en mètres), les colis (poids, dimensions), la règle de site « à deux au-delà de 25 kg ou de
// 2 m » (consigne PLUS PRUDENTE que la loi, dite comme telle), le collègue Moussa, le second client, le volume déjà chargé dans la caisse.
//
// LE TIRAGE : le second client (1 sur 4), la marge de la caisse (la commande tient ou ne tient pas, une fois sur deux), l'ordre de départ des colis dans la fiche du prélèvement.

import { declarerTirage } from '../core/tirage.js';

export const ID = 'ikea-armoire-preparation';
export const ID_VOLET = 'ik-ent126';
export const FICHES = { bon: 'bon-126', ordre: 'ordre-126', deux: 'deux-126', caisse: 'caisse-126' };
export const JOUR = { iso: '2027-03-09', lib: 'mardi 9 mars 2027' };

// ─────────────────────────────────────────────────────────────── les règles de la zone (consigne de site CONSTRUITE)
export const SEUIL_KG = 25;            // à deux au-delà de 25 kg…
export const SEUIL_M = 2;              // … ou de 2 m de long
export const CAISSE_M3 = 18;           // caisse mobile (une source, L'Info durable, 12/2022)
export const MARGE_TOLERANCE = 0.1;    // m³ : la tolérance sur le volume saisi
export const NUM_BENALI = 'FR-2703-4418';
export const NUM_AUTRE = 'FR-2703-4390';   // la commande des deux colis posés là par erreur (ne se prélèvent pas)

// ─────────────────────────────────────────────────────────────── les colis (poids en kg, dimensions en m, position en m depuis le quai le long de l'allée)
// classe : « normal » ou « fragile » (un colis à deux se déduit du poids et de la longueur : `aDeux`).
const C = (id, cmd, lib, kg, L, l, h, pos, classe = 'normal') => ({ id, cmd, lib, kg, L, l, h, pos, classe });
export const BENALI = [
  C('arm1', 'benali', 'Armoire ALDA — colis 1/3 (portes)', 40, 2.01, 0.60, 0.22, 38),
  C('arm2', 'benali', 'Armoire ALDA — colis 2/3 (cadre)', 38, 1.95, 0.58, 0.22, 38),
  C('arm3', 'benali', 'Armoire ALDA — colis 3/3 (tiroirs)', 34, 1.00, 0.55, 0.30, 40),
  C('can1', 'benali', 'Canapé LINN — colis 1/2 (assise)', 42, 2.20, 0.90, 0.35, 20),
  C('can2', 'benali', 'Canapé LINN — colis 2/2 (dossier)', 31, 1.00, 0.90, 0.30, 20),
];
export const LEURRES = [
  C('leu1', 'autre', 'Étagère VEGA — colis 1/1', 14, 1.10, 0.30, 0.30, 26),
  C('leu2', 'autre', 'Table basse NORA — colis 1/1', 17, 1.00, 0.60, 0.15, 32),
];
export const CLIENTS2 = [
  { id: 'lambert', client: 'M. Lambert', num: 'FR-2703-4502', colis: [
    C('l1', 'lambert', 'Commode MARA — colis 1/1', 27, 1.10, 0.50, 0.40, 12),
    C('l2', 'lambert', 'Chaises BRIS (lot de 4) — colis 1/1', 12, 0.90, 0.50, 0.40, 28),
    C('l3', 'lambert', 'Miroir SOLA — colis 1/1', 8, 1.60, 0.12, 0.50, 50, 'fragile')] },
  { id: 'moreau', client: 'Mme Moreau', num: 'FR-2703-4511', colis: [
    C('m1', 'moreau', 'Table KAVA — colis 1/1', 22, 2.10, 0.80, 0.12, 30),
    C('m2', 'moreau', 'Étagère DOLA — colis 1/1', 24, 1.10, 0.30, 0.30, 14),
    C('m3', 'moreau', 'Vitrine ELSA — colis 1/1', 15, 1.80, 0.40, 0.35, 55, 'fragile')] },
  { id: 'fabre', client: 'M. Fabre', num: 'FR-2703-4523', colis: [
    C('f1', 'fabre', 'Lit TORA — colis 1/1', 38, 2.05, 0.45, 0.20, 16),
    C('f2', 'fabre', 'Bureau LIVA — colis 1/1', 19, 1.20, 0.60, 0.15, 34),
    C('f3', 'fabre', 'Lampadaire ORIA — colis 1/1', 6, 1.75, 0.30, 0.30, 52, 'fragile')] },
  { id: 'roche', client: 'Mme Roche', num: 'FR-2703-4530', colis: [
    C('r1', 'roche', 'Bibliothèque NESA — colis 1/1', 26, 1.80, 0.35, 0.30, 24),
    C('r2', 'roche', 'Tabouret PIKA — colis 1/1', 4, 0.45, 0.45, 0.45, 36),
    C('r3', 'roche', 'Plateau de verre VERA — colis 1/1', 14, 1.20, 0.80, 0.08, 54, 'fragile')] },
];
export const MARGES = [1.2, 0.6, -0.6, -1.2];   // m³ libres dans la caisse une fois les deux commandes chargées (négatif : elles ne tiennent pas)

export const aDeux = (c) => c.kg > SEUIL_KG || c.L > SEUIL_M;
export const rang = (c) => (aDeux(c) ? 0 : c.classe === 'fragile' ? 2 : 1);   // 0 : lourd ou long, d'abord · 1 : normal · 2 : fragile, à la fin
export const volume = (c) => Math.round(c.L * c.l * c.h * 10000) / 10000;
export const arr2 = (x) => Math.round(x * 100) / 100;
export const dimLib = (c) => `${String(c.L).replace('.', ',')} × ${String(c.l).replace('.', ',')} × ${String(c.h).replace('.', ',')} m`;
export const mLib = (x) => String(arr2(x)).replace('.', ',');

// ─────────────────────────────────────────────────────────────── le parcours : on part du quai (0 m), on revient au quai
export function longueurParcours(ordre, colis) {
  const pos = Object.fromEntries(colis.map((c) => [c.id, c.pos]));
  let m = 0, ici = 0;
  for (const id of ordre) { m += Math.abs(pos[id] - ici); ici = pos[id]; }
  return m + ici;
}
export const ordreValide = (ordre, colis) => {
  if (!Array.isArray(ordre) || ordre.length !== colis.length) return false;
  const r = Object.fromEntries(colis.map((c) => [c.id, rang(c)]));
  return ordre.every((id, i) => r[id] != null && (i === 0 || r[ordre[i - 1]] <= r[id]));
};
// Le plus court des ordres VALIDES (lourds et longs d'abord, fragiles à la fin) : essai de toutes les permutations à l'intérieur de chaque rang.
export function meilleurParcours(colis) {
  const perm = (L) => (L.length <= 1 ? [L] : L.flatMap((x, i) => perm([...L.slice(0, i), ...L.slice(i + 1)]).map((p) => [x, ...p])));
  const groupes = [0, 1, 2].map((r) => colis.filter((c) => rang(c) === r).map((c) => c.id));
  let best = Infinity, ordre = null;
  for (const a of perm(groupes[0])) for (const b of perm(groupes[1])) for (const f of perm(groupes[2])) {
    const o = [...a, ...b, ...f], m = longueurParcours(o, colis);
    if (m < best) { best = m; ordre = o; }
  }
  return { m: best, ordre };
}
export const MARGE_PARCOURS = 24;   // m au-delà du plus court des ordres valides : le seuil du jalon « parcours »

// ─────────────────────────────────────────────────────────────── le tirage
export const jeuDeVal = (V) => {
  const client = CLIENTS2[V.client2];
  const colis = [...BENALI, ...client.colis];
  const total = arr2(colis.reduce((s, c) => s + volume(c), 0));
  return { client, colis, total, marge: V.marge, deja: arr2(CAISSE_M3 - total - V.marge), depart: V.depart };
};
const ecarts = (jeu) => {
  const E = [], V = (jeu && jeu.valeurs) || {};
  if (!CLIENTS2[V.client2] || !MARGES.includes(V.marge)) return ['le tirage n’est pas dans la banque'];
  const J = jeuDeVal(V);
  const ids = J.colis.map((c) => c.id).sort().join();
  if ((V.depart || []).slice().sort().join() !== ids) E.push('le départ ne contient pas les huit colis');
  else {
    if (ordreValide(V.depart, J.colis)) E.push('l’ordre de départ est déjà juste');
    if (longueurParcours(V.depart, J.colis) <= meilleurParcours(J.colis).m + MARGE_PARCOURS) E.push('le parcours de départ passe déjà le seuil');
  }
  return E;
};
export const TIRAGE = declarerTirage({
  banques: { commande: { pieces: [{ id: 'commande-benali' }], fixes: ['commande-benali'], melange: {}, ordre: 'fixe' } },   // une pièce fixe : la commande de Mme Benali
  valeurs: (h) => {
    const client2 = h.choisir([0, 1, 2, 3]);
    return { client2, marge: h.choisir(MARGES), depart: h.melanger([...BENALI, ...CLIENTS2[client2].colis].map((c) => c.id)) };
  },
  verifier: ecarts,
});
TIRAGE.lier(ID);
const valeursDe0 = (db) => {
  const V = TIRAGE.valeursTirees(db);
  return V && CLIENTS2[V.client2] && Array.isArray(V.depart) ? V : { client2: 0, marge: MARGES[0], depart: [...BENALI, ...CLIENTS2[0].colis].map((c) => c.id).reverse() };
};
export const jeuDe = (db) => jeuDeVal(valeursDe0(db));
export const colisDe = (db) => jeuDe(db).colis;
export const colisParId = (db) => Object.fromEntries(colisDe(db).map((c) => [c.id, c]));
export const ordreDepart = (db) => jeuDe(db).depart;
export const seuilParcours = (db) => meilleurParcours(colisDe(db)).m + MARGE_PARCOURS;
// Les colis du bon : l'élève coche ceux des deux commandes parmi ces dix (les huit + les deux leurres), dans un ordre tiré.
export const candidats = (db) => {
  const J = jeuDe(db), tous = [...J.colis, ...LEURRES];
  const n = tous.length, d = (J.depart.join('').length + J.client.id.length) % n;
  return tous.slice(d).concat(tous.slice(0, d));
};

// ─────────────────────────────────────────────────────────────── lire la base (sans interface)
export function fiche(db, id) {
  const f = db && db.fiches && db.fiches[id];
  return { envoye: !!(f && f.envoye), valeurs: (f && f.valeurs) || {} };
}
export const envoyee = (db, id) => fiche(db, id).envoye;
export const geste = (db, nom) => !!(db && db.gestes && db.gestes[ID] && db.gestes[ID][nom]);
export const dejaEnvoyee = (id) => (db) => envoyee(db, id) || geste(db, `fiche:${id}:envoyer`);
export const champDeux = (id) => `p-${id}`;
export const ouGeste = (...noms) => {
  const f = (db, seance) => !!(db && db.gestes && db.gestes[seance] && noms.some((n) => db.gestes[seance][n]));
  f.gestes = noms;
  return f;
};
