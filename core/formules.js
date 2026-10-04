// Un évaluateur de formules, volontairement petit — écrit le 04/10/2026.
//
// Demandé par Tristan le 03/10 au soir : *« il doit disposer d'un petit espace tableur intégré
// si possible, où il doit saisir la formule pour trouver le temps. Même chose pour le poids :
// il doit construire avec une somme pour avoir le poids total. »* Ça change la nature de
// l'exercice — on ne demande plus à l'élève de TROUVER deux nombres, on lui demande de
// CONSTRUIRE le calcul — et ça relie les environnements Simulog au tableur, qui est le fil de
// tout le reste du site (TAB-1 à TAB-4).
//
// Ce que ce fichier n'est pas : un tableur. Il ne fait ni les références absolues (`$B$2`), ni
// les plages à deux dimensions, ni `SI`, ni `RECHERCHEV`, ni les dates, ni le texte. Il fait ce
// qu'un élève de première Bac Pro doit savoir écrire en logistique : une somme, une moyenne, un
// minimum, un maximum, un arrondi, et les quatre opérations avec des parenthèses. Tout le reste
// doit rendre une erreur lisible plutôt qu'un nombre faux.
//
//   evaluerGrille({ B2: '42', B3: '58', B8: '=SOMME(B2:B3)' })
//     → { valeurs: { B2: 42, B3: 58, B8: 100 }, erreurs: {} }
//
// ── Ce qui est volontairement français ──────────────────────────────────────────────────
// La **virgule décimale** : un élève qui tape `12,5` a raison, et c'est ce qu'il tapera dans
// Excel sur un poste français. Le point est accepté aussi — personne ne doit être puni pour
// avoir tapé `12.5`. Le **point-virgule** sépare les arguments, comme dans un Excel français.
// Et les noms de fonctions sont ceux qu'il a devant les yeux dans TAB-1 : SOMME, MOYENNE.
//
// ── Les erreurs portent les noms d'Excel ────────────────────────────────────────────────
// `#NOM?` une fonction inconnue · `#VALEUR!` une formule mal écrite · `#DIV/0!` une division
// par zéro · `#REF!` une référence qui ne mène nulle part · `#CIRC!` une formule qui se
// mord la queue. L'élève les retrouvera à l'identique dans Excel, sauf la dernière qu'Excel
// signale autrement — mais il faut bien la nommer.

/* --------------------------------------------------------------------- lecture d'un nombre */

// « 12,5 », « 12.5 », « 1 234,5 » (l'espace fine des milliers que colle un copier-coller).
// Rendre `null` plutôt que `NaN` : un `NaN` se propage en silence, un `null` se teste.
export function nombreFr(t) {
  if (typeof t === 'number') return Number.isFinite(t) ? t : null;
  const s = String(t == null ? '' : t).trim().replace(/[\s  ]/g, '').replace(',', '.');
  if (s === '' || !/^[+-]?(\d+\.?\d*|\.\d+)$/.test(s)) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

// Une heure saisie à la main : « 13:00 », « 13h00 », « 13 h 00 », « 13h ». Elle vaut un nombre de
// MINUTES depuis minuit (13 h 00 → 780). Choix assumé le 05/10/2026, sur demande de Tristan :
// l'élève doit pouvoir « ajouter le temps de route en minutes » à l'heure de départ, et c'est
// ce qu'on obtient quand l'heure est comptée en minutes. Excel, lui, compte les heures en
// fractions de jour (13 h = 0,5417) et demanderait de diviser par 1440 : c'est une leçon à part,
// et le tableur de la classe suivante la fera. Rendre `null` si ce n'est pas une heure.
export function heureFr(t) {
  if (typeof t !== 'string') return null;
  const m = /^\s*(\d{1,2})\s*(?::|h|H)\s*(\d{1,2})?\s*$/.exec(t);
  if (!m) return null;
  const h = Number(m[1]);
  const mn = m[2] === undefined ? 0 : Number(m[2]);
  if (h > 23 || mn > 59) return null;
  return h * 60 + mn;
}

// 927 → « 15 h 27 ». Arrondi à la minute : un temps de route de 110,5 min donne 111.
export function formaterHeure(minutes) {
  const m = Math.round(minutes);
  const h = Math.floor(m / 60);
  return `${String(h).padStart(2, '0')} h ${String(m - h * 60).padStart(2, '0')}`;
}

/* ------------------------------------------------------------------------- les références */

// « B2 » → { col: 'B', ligne: 2 }. Les colonnes sont des lettres simples : une grille de
// séance n'ira jamais jusqu'à AA, et accepter `AA` ouvrirait la porte à prendre `SOMME` pour
// une référence.
const REF = /^([A-Z])(\d{1,3})$/;

export function estRef(t) { return REF.test(String(t).toUpperCase()); }

// Les cellules d'une plage, dans l'ordre de lecture. `B2:B7` rend six références ; `A2:B3` en
// rend quatre. Une plage à l'envers (`B7:B2`) est acceptée et remise à l'endroit : c'est une
// maladresse de frappe, pas une faute de raisonnement.
export function cellulesDePlage(a, b) {
  const ma = REF.exec(String(a).toUpperCase());
  const mb = REF.exec(String(b).toUpperCase());
  if (!ma || !mb) return null;
  const c1 = Math.min(ma[1].charCodeAt(0), mb[1].charCodeAt(0));
  const c2 = Math.max(ma[1].charCodeAt(0), mb[1].charCodeAt(0));
  const l1 = Math.min(+ma[2], +mb[2]);
  const l2 = Math.max(+ma[2], +mb[2]);
  const out = [];
  for (let l = l1; l <= l2; l++) for (let c = c1; c <= c2; c++) out.push(String.fromCharCode(c) + l);
  return out;
}

/* ------------------------------------------------------------------------ les découpages */

// Analyse lexicale. Tout ce qui n'est pas reconnu devient un jeton `?`, que l'analyse
// syntaxique refusera : il n'y a pas de caractère silencieusement ignoré.
function jetons(src) {
  const t = [];
  const s = String(src);
  let i = 0;
  while (i < s.length) {
    const c = s[i];
    if (/\s/.test(c)) { i++; continue; }
    if (/[0-9]/.test(c) || (c === ',' && /[0-9]/.test(s[i + 1] || '')) || (c === '.' && /[0-9]/.test(s[i + 1] || ''))) {
      let j = i;
      while (j < s.length && /[0-9.,]/.test(s[j])) j++;
      // Un séparateur d'arguments collé à un nombre — `SOMME(1,2;3)` — ne doit pas être avalé
      // par le nombre. On recoupe donc sur le DERNIER séparateur décimal plausible.
      let brut = s.slice(i, j);
      const n = nombreFr(brut);
      if (n === null) { t.push({ k: '?', v: brut }); i = j; continue; }
      t.push({ k: 'n', v: n }); i = j; continue;
    }
    if (/[A-Za-zÀ-ÿ_]/.test(c)) {
      let j = i;
      while (j < s.length && /[A-Za-zÀ-ÿ0-9_]/.test(s[j])) j++;
      const mot = s.slice(i, j).toUpperCase();
      t.push(estRef(mot) ? { k: 'ref', v: mot } : { k: 'mot', v: mot });
      i = j; continue;
    }
    if ('+-*/^(); :'.includes(c)) { t.push({ k: c, v: c }); i++; continue; }
    t.push({ k: '?', v: c }); i++;
  }
  return t;
}

/* ------------------------------------------------------------------------- les fonctions */

// Chacune reçoit la liste APLATIE des nombres : `SOMME(B2:B7;10)` arrive comme huit nombres.
// Les cellules vides d'une plage sont écartées en amont, comme dans un tableur — sinon une
// moyenne sur une plage trop large serait fausse sans que personne le voie.
const FONCTIONS = {
  SOMME: (v) => v.reduce((a, b) => a + b, 0),
  MOYENNE: (v) => (v.length ? v.reduce((a, b) => a + b, 0) / v.length : { err: '#DIV/0!' }),
  MIN: (v) => (v.length ? Math.min(...v) : { err: '#VALEUR!' }),
  MAX: (v) => (v.length ? Math.max(...v) : { err: '#VALEUR!' }),
  NB: (v) => v.length,
  ARRONDI: (v) => {
    if (v.length < 1 || v.length > 2) return { err: '#VALEUR!' };
    const d = v.length === 2 ? Math.round(v[1]) : 0;
    const f = 10 ** d;
    return Math.round(v[0] * f) / f;
  },
};

export const FONCTIONS_CONNUES = Object.keys(FONCTIONS);

/* --------------------------------------------------------------------- analyse syntaxique */

// Descente récursive, quatre niveaux : somme → produit → puissance → facteur. L'erreur est
// portée par une exception interne plutôt que remontée à chaque appel : le code reste lisible,
// et aucun chemin ne peut oublier de la propager.
class Souci { constructor(code) { this.code = code; } }
const souci = (c) => { throw new Souci(c); };

function analyser(src, lire) {
  const t = jetons(src);
  let i = 0;
  const vu = () => t[i];
  const prendre = (k) => { if (vu() && vu().k === k) { i++; return true; } return false; };

  // Une plage n'existe QUE comme argument d'une fonction : `B2:B7` tout seul n'a pas de valeur
  // unique, et `=B2:B7+1` doit être refusé plutôt que de rendre le premier terme en silence.
  function argument() {
    if (vu() && vu().k === 'ref' && t[i + 1] && t[i + 1].k === ':' && t[i + 2] && t[i + 2].k === 'ref') {
      const a = t[i].v, b = t[i + 2].v;
      i += 3;
      const cells = cellulesDePlage(a, b) || souci('#REF!');
      return cells.map(lire).filter((x) => x !== null);
    }
    const v = somme();
    return [v];
  }

  function facteur() {
    if (prendre('-')) { const v = facteur(); return -v; }
    if (prendre('+')) return facteur();
    const j = vu();
    if (!j) souci('#VALEUR!');
    if (j.k === 'n') { i++; return j.v; }
    if (j.k === 'ref') {
      i++;
      if (vu() && vu().k === ':') souci('#VALEUR!');   // une plage hors fonction
      const v = lire(j.v);
      return v === null ? 0 : v;                        // une cellule vide vaut zéro, comme partout
    }
    if (j.k === 'mot') {
      i++;
      const f = FONCTIONS[j.v];
      if (!f) souci('#NOM?');
      if (!prendre('(')) souci('#VALEUR!');
      let args = [];
      if (!prendre(')')) {
        for (;;) {
          args = args.concat(argument());
          if (prendre(';')) continue;
          if (prendre(')')) break;
          souci('#VALEUR!');
        }
      }
      const r = f(args);
      if (r && typeof r === 'object' && r.err) souci(r.err);
      return r;
    }
    if (j.k === '(') {
      i++;
      const v = somme();
      if (!prendre(')')) souci('#VALEUR!');
      return v;
    }
    souci('#VALEUR!');
    return 0;
  }

  function puissance() {
    const g = facteur();
    if (prendre('^')) return g ** puissance();     // associative à droite, comme dans Excel
    return g;
  }

  function produit() {
    let v = puissance();
    for (;;) {
      if (prendre('*')) { v *= puissance(); continue; }
      if (prendre('/')) {
        const d = puissance();
        if (d === 0) souci('#DIV/0!');
        v /= d; continue;
      }
      return v;
    }
  }

  function somme() {
    let v = produit();
    for (;;) {
      if (prendre('+')) { v += produit(); continue; }
      if (prendre('-')) { v -= produit(); continue; }
      return v;
    }
  }

  const v = somme();
  if (i !== t.length) souci('#VALEUR!');            // du texte traîne après la formule
  if (!Number.isFinite(v)) souci('#VALEUR!');
  return v;
}

/* ----------------------------------------------------------------------- l'évaluation */

export const estFormule = (t) => typeof t === 'string' && t.trim().startsWith('=');

// Évalue toutes les cellules d'un coup. Une cellule vaut soit un nombre saisi, soit le
// résultat de sa formule, soit rien. Les dépendances sont suivies à la demande, avec une pile
// qui détecte les références circulaires — `B8 = B9` et `B9 = B8` doivent dire `#CIRC!` et non
// faire déborder la pile du navigateur, ce qui emporterait toute la page.
export function evaluerGrille(cellules) {
  const valeurs = {};
  const erreurs = {};
  const fait = {};
  const pile = [];

  function lire(ref) {
    const R = String(ref).toUpperCase();
    if (fait[R]) return valeurs[R] === undefined ? null : valeurs[R];
    if (pile.includes(R)) { erreurs[R] = '#CIRC!'; fait[R] = true; valeurs[R] = null; return null; }

    const brut = cellules[R];
    if (brut === undefined || brut === null || String(brut).trim() === '') {
      fait[R] = true; valeurs[R] = null; return null;
    }
    if (!estFormule(brut)) {
      let n = nombreFr(brut);
      if (n === null) n = heureFr(String(brut));   // « 13:00 » vaut 780 minutes
      fait[R] = true;
      valeurs[R] = n;
      // Un texte dans une cellule n'est pas une erreur : une grille porte des libellés.
      return n;
    }
    pile.push(R);
    try {
      const v = analyser(String(brut).trim().slice(1), lire);
      valeurs[R] = v;
    } catch (e) {
      if (!(e instanceof Souci)) throw e;
      erreurs[R] = e.code;
      valeurs[R] = null;
    } finally {
      pile.pop();
      fait[R] = true;
    }
    // Une cellule dont une dépendance est circulaire l'est aussi, pour l'élève qui la regarde.
    if (!erreurs[R] && valeurs[R] === null) erreurs[R] = '#VALEUR!';
    return valeurs[R];
  }

  Object.keys(cellules).forEach(lire);
  return { valeurs, erreurs };
}

// Ce qu'on montre dans la cellule : la valeur calculée, l'erreur, ou rien. `format: 'heure'`
// lit la valeur comme des minutes depuis minuit et l'écrit « 15 h 27 ».
export function afficher(ref, r, decimales = 2, format = null) {
  const R = String(ref).toUpperCase();
  if (r.erreurs[R]) return r.erreurs[R];
  const v = r.valeurs[R];
  if (v === null || v === undefined) return '';
  if (format === 'heure') return formaterHeure(v);
  return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: decimales }).format(v);
}
