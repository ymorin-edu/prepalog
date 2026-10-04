// Lire et comparer un classeur, SANS ÉCRAN (04/10/2026, chantier C5 « geste tableur »).
//
// Ce qui vivait dans `tableur.js` et `numerique.js` et ne dépend d'aucune interface : le
// chargement de SheetJS, les pictogrammes, la comparaison de valeurs (texte indulgent,
// nombres à la tolérance), le contrôle cellule par cellule et de liste à ordre libre. Sorti
// ici pour que le geste tableur (`export-tableur.js`) et les jalons des séances puissent s'en
// servir hors navigateur (la suite de tests les importe dans Node). `tableur.js` et
// `numerique.js` les réexportent : rien ne change pour les séries TAB ni les questions
// numériques.

export function normaliser(saisie) {
  if (saisie === null || saisie === undefined) return NaN;
  const t = String(saisie)
    .replace(/ | |\s/g, '')   // espaces fines, insécables, ordinaires
    .replace(',', '.');
  if (t === '') return NaN;
  return Number(t);
}

export function estJuste(valeur, attendu, tolerance) {
  if (Number.isNaN(valeur)) return false;
  if (tolerance === undefined || tolerance === null) return valeur === attendu;
  if (typeof tolerance === 'string' && tolerance.trim().endsWith('%')) {
    const p = parseFloat(tolerance) / 100;
    return Math.abs(valeur - attendu) <= Math.abs(attendu * p) + 1e-9;
  }
  return Math.abs(valeur - attendu) <= Number(tolerance) + 1e-9;
}

// SheetJS est servi par le site lui-même, jamais par un CDN : les filtrages académiques
// bloquent régulièrement cdnjs et consorts, et une activité qui tombe en panne en séance
// coûte plus cher que 861 Ko dans le dépôt. Voir vendor/LISEZMOI.md.
// L'adresse est calculée depuis ce module : elle reste juste quelle que soit la page.
const URL_XLSX = new URL('../../vendor/xlsx.full.min.js', import.meta.url).href;

let chargement = null;
export function chargerXLSX() {
  if (window.XLSX) return Promise.resolve(window.XLSX);
  if (chargement) return chargement;
  chargement = new Promise((res, rej) => {
    const s = document.createElement('script');
    s.src = URL_XLSX;
    s.onload = () => res(window.XLSX);
    s.onerror = () => rej(new Error(
      "Le lecteur de classeurs n'a pas pu être chargé (vendor/xlsx.full.min.js)."));
    document.head.appendChild(s);
  });
  return chargement;
}

// Deux pictogrammes de la même famille que ceux de l'accueil : trait de 1,7, sans
// remplissage. La flèche descend dans le bac pour télécharger, elle en sort pour déposer —
// c'est le seul détail qui les distingue, et il se lit d'un coup d'œil.
export const ICONE_TELECHARGER = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
  stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <path d="M12 3v11"/><path d="M7.5 9.5L12 14l4.5-4.5"/><path d="M4 15v3.5a1.5 1.5 0 0 0 1.5 1.5h13a1.5 1.5 0 0 0 1.5-1.5V15"/></svg>`;

export const ICONE_DEPOSER = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
  stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <path d="M12 14V3"/><path d="M7.5 7.5L12 3l4.5 4.5"/><path d="M4 15v3.5a1.5 1.5 0 0 0 1.5 1.5h13a1.5 1.5 0 0 0 1.5-1.5V15"/></svg>`;

export function valeurCellule(classeur, ctrl, feuilleParDefaut) {
  const nom = ctrl.feuille || feuilleParDefaut || classeur.SheetNames[0];
  const f = classeur.Sheets[nom];
  if (!f) return { absente: true, feuille: nom };
  const c = f[ctrl.cellule];
  if (!c) return { vide: true, feuille: nom };
  return { valeur: c.v, formule: c.f || null, feuille: nom };
}

// Comparaison de texte indulgente : la casse, les accents et les espaces en trop ne
// doivent pas coûter un point à un élève qui a compris l'exercice. L'apostrophe non plus :
// Excel garde l'apostrophe droite du clavier (') là où le contenu écrit la typographique (’).
export const pliage = (s) => String(s ?? '')
  .replace(/[\u2018\u2019\u02BC\u00B4`]/g, "'")
  .normalize('NFD').replace(/[̀-ͯ]/g, '')
  .toLowerCase().replace(/\s+/g, ' ').trim();

// ------------------------------------------------- listes à ordre libre
// Une plage « A2:C11 » se décompose en colonnes et en lignes sans passer par SheetJS :
// le lecteur n'est chargé qu'au dépôt d'un fichier, et ces fonctions servent aussi aux
// tests, qui n'ouvrent aucun classeur.
const colVersIndex = (s) => s.toUpperCase().split('')
  .reduce((n, c) => n * 26 + (c.charCodeAt(0) - 64), 0);
const indexVersCol = (n) => {
  let s = '';
  while (n > 0) { const r = (n - 1) % 26; s = String.fromCharCode(65 + r) + s; n = (n - r - 1) / 26; }
  return s;
};

export function decouperPlage(plage) {
  const m = /^([A-Za-z]+)(\d+):([A-Za-z]+)(\d+)$/.exec(String(plage).trim());
  if (!m) return null;
  const c1 = colVersIndex(m[1]), c2 = colVersIndex(m[3]);
  const l1 = Number(m[2]), l2 = Number(m[4]);
  const colonnes = [];
  for (let c = Math.min(c1, c2); c <= Math.max(c1, c2); c++) colonnes.push(indexVersCol(c));
  const lignes = [];
  for (let l = Math.min(l1, l2); l <= Math.max(l1, l2); l++) lignes.push(l);
  return { colonnes, lignes };
}

// VRAI / FAUX. Une formule logique rend un booléen, mais le classeur peut tout aussi bien
// porter le texte « VRAI » selon le tableur et la langue : les deux sont la même réponse.
export function memeBooleen(lue, attendue) {
  if (typeof lue === 'boolean') return lue === attendue;
  const t = pliage(lue);
  return attendue ? (t === 'vrai' || t === 'true') : (t === 'faux' || t === 'false');
}

// Une cellule « égale » une valeur attendue : texte indulgent, nombres à la tolérance.
export function memeValeur(lue, attendue, tolerance) {
  if (attendue === null || attendue === undefined || attendue === '') {
    return lue === undefined || lue === null || String(lue).trim() === '';
  }
  if (typeof attendue === 'boolean') return memeBooleen(lue, attendue);
  if (typeof attendue === 'number') {
    const n = normaliser(lue);
    return n !== null && n !== undefined && estJuste(n, attendue, tolerance);
  }
  return pliage(lue) === pliage(attendue);
}

const libelleLigne = (l) => l.map((v) => (v === null || v === undefined || v === '' ? '—' : v)).join(' / ');

// Appariement : chaque ligne attendue cherche une ligne saisie encore libre. Glouton, ce
// qui suffit ici — les lignes attendues d'un même exercice ne se recouvrent pas.
function controlerListe(classeur, ctrl, feuilleParDefaut) {
  const nom = ctrl.feuille || feuilleParDefaut || classeur.SheetNames[0];
  const f = classeur.Sheets[nom];
  if (!f) return { ok: false, remarque: `La feuille « ${nom} » est introuvable.`, feuille: nom };

  const decoupe = decouperPlage(ctrl.plage);
  if (!decoupe) return { ok: false, remarque: `Plage « ${ctrl.plage} » illisible.`, feuille: nom };

  // Lignes saisies, les vides mises de côté : un élève qui laisse un trou au milieu de sa
  // liste n'a pas commis de faute.
  const saisies = [];
  decoupe.lignes.forEach((l) => {
    const cells = decoupe.colonnes.map((c) => { const cel = f[c + l]; return cel ? cel.v : undefined; });
    if (cells.some((v) => v !== undefined && String(v).trim() !== '')) saisies.push({ l, cells });
  });

  const libres = saisies.slice();
  const oubliees = [];
  (ctrl.lignes || []).forEach((attendue) => {
    const i = libres.findIndex((s) => attendue.every((v, k) => memeValeur(s.cells[k], v, ctrl.tolerance)));
    if (i < 0) oubliees.push(attendue);
    else libres.splice(i, 1);
  });

  const ok = oubliees.length === 0 && libres.length === 0;
  const bouts = [];
  if (!saisies.length) bouts.push('Aucune ligne saisie dans la plage.');
  else {
    if (oubliees.length) {
      bouts.push(`${oubliees.length} ligne${oubliees.length > 1 ? 's' : ''} manquante${oubliees.length > 1 ? 's' : ''}`
        + ` : ${oubliees.slice(0, 4).map(libelleLigne).join(' ; ')}`
        + (oubliees.length > 4 ? ` ; … et ${oubliees.length - 4} autre${oubliees.length - 4 > 1 ? 's' : ''}` : ''));
    }
    if (libres.length) {
      bouts.push(`${libres.length} ligne${libres.length > 1 ? 's' : ''} en trop ou incorrecte${libres.length > 1 ? 's' : ''}`
        + ` : ${libres.slice(0, 4).map((s) => `ligne ${s.l} (${libelleLigne(s.cells)})`).join(' ; ')}`
        + (libres.length > 4 ? ` ; … et ${libres.length - 4} autre${libres.length - 4 > 1 ? 's' : ''}` : ''));
    }
  }
  return {
    ok, feuille: nom,
    remarque: ok ? `${saisies.length} ligne${saisies.length > 1 ? 's' : ''}, ordre libre.` : bouts.join(' '),
  };
}

export function controler(classeur, controles, feuilleParDefaut) {
  return controles.map((ctrl) => {
    // Contrôle de liste : la plage entière, l'ordre indifférent.
    if (ctrl.lignes && ctrl.plage) {
      const r = controlerListe(classeur, ctrl, feuilleParDefaut);
      return { ...ctrl, ok: r.ok, remarque: r.remarque, lu: { feuille: r.feuille } };
    }
    const lu = valeurCellule(classeur, ctrl, feuilleParDefaut);
    let ok = false, remarque = '';
    if (lu.absente) remarque = `La feuille « ${lu.feuille} » est introuvable.`;
    else if (lu.vide) remarque = 'Cellule vide.';
    else if (ctrl.texte) {
      ok = String(lu.valeur).trim().length > 0;
      if (!ok) remarque = 'Rien de saisi.';
    } else if (typeof ctrl.attendu === 'boolean') {
      ok = memeBooleen(lu.valeur, ctrl.attendu);
      if (!ok) remarque = `Lu : « ${lu.valeur} », attendu ${ctrl.attendu ? 'VRAI' : 'FAUX'}.`;
    } else if (typeof ctrl.attendu === 'string') {
      ok = pliage(lu.valeur) === pliage(ctrl.attendu);
      if (!ok) remarque = `Lu : « ${lu.valeur} ».`;
    } else {
      ok = estJuste(normaliser(lu.valeur), ctrl.attendu, ctrl.tolerance);
      if (!ok) remarque = `Valeur lue : ${lu.valeur}.`;
      if (ok && ctrl.formuleAttendue && !lu.formule) {
        remarque = 'Le résultat est bon, mais la cellule ne contient pas de formule.';
      }
    }
    return { ...ctrl, ok, remarque, lu };
  });
}
