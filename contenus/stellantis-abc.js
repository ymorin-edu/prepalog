// La méthode ABC de Stellantis (ENT-13.3 à 13.5) : le calcul, et le tirage ÉQUITABLE des sorties de la semaine.
// Importable sous Node. Un seul calcul pour toutes les séances : `classer()` donne ce que le tableur de l'élève doit donner (total, part, cumul, classe).
//
// Seuils de la séance (écrits noir sur blanc dans la fiche méthode) : A jusqu'à 80 % des sorties cumulées, B jusqu'à 95 %, C au-delà.
// Le tirage évite tout cas litigieux (brief ENT-13.3 §6 bis) : aucune égalité de sorties ; dernier A ≤ 79 %, premier B ≥ 81 %, dernier B ≤ 94 %,
// premier C ≥ 96 % ; autant de références en A, B et C dans chaque jeu (4 / 5 / 9 pour 18 références, 5 / 6 / 13 pour 24, 3 / 5 / 7 pour 15).

import { REFS } from './stellantis.js';

export const SEUIL_A = 0.8, SEUIL_B = 0.95;
export const REPARTITION = { 15: [3, 5, 7], 18: [4, 5, 9], 24: [5, 6, 13] };

// valeurs : [{ ref, v }] (dans n'importe quel ordre). Rend l'ordre décroissant, le total et, par référence, la part, le cumul et la classe.
export function classer(valeurs) {
  const ordre = valeurs.slice().sort((a, b) => b.v - a.v);
  const total = ordre.reduce((s, x) => s + x.v, 0);
  const part = {}, cumul = {}, classe = {};
  let c = 0;
  ordre.forEach((x) => {
    part[x.ref] = x.v / total;
    c = Math.round((c + part[x.ref]) * 1e12) / 1e12;   // l'arrondi évite 0,8 + 0,15 = 0,9500000000000001 (litige de virgule flottante)
    cumul[x.ref] = c;
    // Même test que la formule du tableur : =SI(cumul<=80%;"A";SI(cumul<=95%;"B";"C")).
    classe[x.ref] = c <= SEUIL_A ? 'A' : c <= SEUIL_B ? 'B' : 'C';
  });
  return { ordre: ordre.map((x) => x.ref), total, part, cumul, classe };
}

// Les écarts d'équité d'un jeu (liste vide = conforme).
export function ecartsEquite(valeurs, repartition) {
  const E = [];
  const vus = new Set();
  valeurs.forEach((x) => { if (vus.has(x.v)) E.push(`égalité de sorties (${x.v})`); vus.add(x.v); });
  if (valeurs.some((x) => !(x.v > 0))) E.push('une référence sans sortie');
  const K = classer(valeurs);
  const n = { A: 0, B: 0, C: 0 };
  K.ordre.forEach((r) => { n[K.classe[r]]++; });
  const [a, b, c] = repartition;
  if (n.A !== a || n.B !== b || n.C !== c) E.push(`répartition ${n.A}/${n.B}/${n.C} au lieu de ${a}/${b}/${c}`);
  const cum = K.ordre.map((r) => K.cumul[r]);
  const dernierA = cum[a - 1], premierB = cum[a], dernierB = cum[a + b - 1], premierC = cum[a + b];
  if (!(dernierA <= 0.79)) E.push('dernier A au-dessus de 79 %');
  if (!(premierB >= 0.81)) E.push('premier B sous 81 %');
  if (!(dernierB <= 0.94)) E.push('dernier B au-dessus de 94 %');
  if (!(premierC >= 0.96)) E.push('premier C sous 96 %');
  return E;
}

// Une liste décroissante de `n` parts dont la somme vaut `somme` (poids décroissants bruités, normalisés).
function parts(h, n, somme, raideur) {
  const w = Array.from({ length: n }, (_, i) => Math.pow(n - i, raideur) * (0.75 + 0.5 * h.reel())).sort((x, y) => y - x);
  const t = w.reduce((s, x) => s + x, 0);
  return w.map((x) => somme * x / t);
}

// Les sorties de la semaine pour `n` références (liste d'entiers décroissants, SANS égalité). Construites groupe par groupe pour tenir l'équité :
// le premier C pèse assez pour franchir 96 % et reste plus petit que le dernier B ; le premier B reste plus petit que le dernier A.
// `h` : le générateur de `core/tirage.js`. Rend la liste décroissante ; l'attribution aux références est faite par `attribuer`.
export function sortiesDecroissantes(h, n, echelle = [14000, 21000]) {
  const [nA, nB, nC] = REPARTITION[n];
  const T = h.entier(echelle[0], echelle[1]);
  const [a0, a1] = [770, 785];
  const cA = h.entier(a0, a1) / 1000;            // part cumulée à la fin des A
  const cB = h.entier(938, 940) / 1000;          // à la fin des B
  const c1 = (0.96 - cB) + h.entier(1, 5) / 1000;  // part du premier C : franchit 96 %
  const b5 = c1 + h.entier(1, 4) / 1000;           // le dernier B pèse un peu plus que le premier C
  const b1 = (0.81 - cA) + h.entier(1, 8) / 1000;  // le premier B franchit 81 %
  const sB = cB - cA;
  const reste = sB - b1 - b5;                      // ce qui reste pour les B du milieu (nB - 2)
  const milieu = nB > 2 ? parts(h, nB - 2, Math.max(reste - (nB - 2) * b5, 0.0005), 1.0).map((x) => x + b5) : [];
  const B = [b1, ...milieu, b5];
  const C = [c1, ...parts(h, nC - 1, Math.max(1 - cB - c1, 0.001), 1.5)];
  const A = parts(h, nA, cA, 1.1);
  const brut = [...A, ...B, ...C].map((p) => Math.max(1, Math.round(p * T)));
  // Rend les valeurs strictement décroissantes (une égalité : on retire 1 à la plus petite).
  for (let i = 1; i < brut.length; i++) if (brut[i] >= brut[i - 1]) brut[i] = brut[i - 1] - 1;
  return brut;
}

// Attribue une liste décroissante de valeurs aux références, dans l'ordre de leur popularité bruitée (les petites pièces peu chères sortent beaucoup).
export function attribuer(h, refs, decroissantes, bruit = 0.35) {
  const cle = refs.map((r) => ({ r, k: r.pop * (1 - bruit / 2 + bruit * h.reel()) + h.reel() * 0.01 })).sort((a, b) => b.k - a.k);
  return cle.map((x, i) => ({ ref: x.r.ref, v: decroissantes[i] }));
}

// Le jeu de sorties d'une semaine pour `n` références : [{ ref, v }] dans l'ordre des références.
export function jeuSorties(h, n, { bruit, echelle } = {}) {
  const refs = REFS.slice(0, n);
  const L = attribuer(h, refs, sortiesDecroissantes(h, n, echelle), bruit);
  const par = Object.fromEntries(L.map((x) => [x.ref, x.v]));
  return refs.map((r) => ({ ref: r.ref, v: par[r.ref] }));
}

// Un jeu écrit à la main (total 10 000, vérifié ligne à ligne : cumuls 31 / 54 / 68 / 76 % → les A ; 81,2 / 85,2 / 88,4 / 91,4 / 93,8 % → les B ; puis 96,05 % et plus → les C).
// Le brief proposait un autre exemple, dont le premier C pesait plus que le dernier B (une fois trié, le B n'aurait pas eu cinq références). Valeurs écrites à la main :
// ne jamais les recalculer. Sert aux tests (valeurs attendues) et à la fiche méthode.
export const EXEMPLE_18 = [3100, 2300, 1400, 800, 520, 400, 320, 300, 240, 225, 120, 90, 60, 45, 35, 20, 15, 10];
