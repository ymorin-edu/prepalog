// Le GESTE TABLEUR — « Exporter, traiter, Déposer, décider » (04/10/2026, chantier C5 de la
// refonte Cdiscount, brief `docs/briefs/MOTEUR-geste-tableur.md`).
//
// En entrepôt, on exporte une liste du logiciel, on la retravaille dans un tableur, on décide.
// Dans l'environnement d'entreprise (`entreprise.js`) :
//   1. EXTRAIRE : un bouton « Exporter » sur l'écran déclaré fabrique un vrai .xlsx, à partir de
//      la BASE DE L'ÉLÈVE (fonction pure de la base, et d'une graine pour les salissures) ;
//   2. TRAITER : Excel ou LibreOffice, sur le poste — rien côté site ;
//   3. REMONTER : « Déposer mon fichier » (menu Fichiers) ; le classeur est lu DANS LE NAVIGATEUR
//      (SheetJS de `vendor/`), contrôlé sur ses VALEURS (comparées à l'export de l'élève, à la
//      tolérance) et sur les NOMS DE FONCTIONS de ses formules. Le fichier n'est jamais stocké :
//      seul le résultat du contrôle entre dans la base ;
//   4. DÉCIDER : le scénario ; les jalons lisent `resultatDepot(db, id)`.
//
// Règles de construction (essai du 03/10, Excel ET LibreOffice) : export .xlsx, nombres et dates
// vrais ; contrôle de formule = PRÉSENCE DES NOMS de fonctions, jamais le texte exact (Excel écrit
// `FALSE`, LibreOffice `FALSE()`, un .ods `[$Tarifs.$A$2]`) ; .xlsx / .xlsm / .ods acceptés,
// .csv refusé ; tolérance sur les valeurs.
//
// DÉCLARATION (dans `creerEntreprise`, clé `tableur`) :
//
//   tableur: {
//     aide: 'SI(test ; si vrai ; si faux) — NB.SI(plage ; critère)',   // bandeau d'aide, facultatif
//     exports: [{
//       id: 'preparations', ecran: 'commandes', libelle: 'Exporter les lignes de préparation',
//       fichier: 'cdiscount-preparations.xlsx',
//       feuilles: [{
//         nom: 'Préparations',
//         colonnes: ['Date', 'N° bon', …],
//         lignes(db) { return [[ts, 'BP-732101', …], …]; },   // PURE ; une date = un horodatage (ms)
//         types: { Date: 'date' },                            // 'date' | 'dateHeure'
//         aveugle: ['Stock logiciel'],                       // colonnes retirées tant qu'un comptage
//       }, …],                                               //   à l'aveugle n'est pas validé
//       salissures: { vides: 4, doublons: 3, datesTexte: 5 }, // 1re feuille, déterministe
//     }],
//     depot: {
//       id: 'analyse', export: 'preparations', libelle: 'Déposer mon fichier',
//       retour: 'guidage' | 'entrainement' | 'evaluation',     // défaut : déduit du temps de la séance
//       controles(db) { return [ … ]; },                       // voir `controlerDepot`
//     },
//   }
//
// ÉTAT dans la base de l'élève (cloisonné : c'est la base de la séance) :
//   db.tableur.exports[id] = { at, n }                    premier export (un jalon peut le lire)
//   db.tableur.depots[id]  = { essais, dernier: { at, fichier, resultats }, meilleur: { … } }
// En guidage et entraînement, le MEILLEUR dépôt compte (un redépôt moins bon ne fait rien
// perdre) ; en évaluation, un seul dépôt (un fichier refusé pour son format n'en est pas un).

import { hasard } from '../tirage.js';
import { chargerXLSX, ICONE_TELECHARGER, ICONE_DEPOSER, controler as controlerCellules, memeValeur, pliage } from './classeur.js';

const ech = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const pluriel = (n, s, p) => (n > 1 ? p || s + 's' : s);

/* ===================================================================== les fonctions */

// Les noms de fonctions en français, pour l'élève (table du brief, § 5).
export const NOMS_FR = {
  SUM: 'SOMME', AVERAGE: 'MOYENNE', COUNT: 'NB', COUNTA: 'NBVAL', IF: 'SI', AND: 'ET', OR: 'OU',
  COUNTIF: 'NB.SI', SUMIF: 'SOMME.SI', COUNTIFS: 'NB.SI.ENS', SUMIFS: 'SOMME.SI.ENS', VLOOKUP: 'RECHERCHEV',
  IFERROR: 'SIERREUR', ROUND: 'ARRONDI', MAX: 'MAX', MIN: 'MIN',
};
export const nomFr = (n) => NOMS_FR[String(n).toUpperCase()] || String(n).toUpperCase();

// Les fonctions d'une formule, NOM ENTIER, en majuscules : `IF` n'est pas trouvé dans `COUNTIF`,
// ni `COUNTIF` dans `COUNTIFS`. Les préfixes `_xlfn.` / `_xlws.` / `of:` sont ignorés, le texte
// entre guillemets aussi (« "SI(" » n'est pas une fonction).
export function fonctionsDe(formule) {
  const f = String(formule || '').replace(/"[^"]*"/g, '""').toUpperCase().replace(/(_XLFN\.|_XLWS\.|OF:)/g, '');
  const noms = new Set();
  const re = /([A-Z][A-Z0-9._]*)\s*\(/g;
  let m;
  while ((m = re.exec(f))) noms.add(m[1]);
  return noms;
}
const manquantes = (formule, fonctions) => {
  const lues = fonctionsDe(formule);
  return (fonctions || []).map((x) => String(x).toUpperCase()).filter((x) => !lues.has(x));
};

/* ===================================================================== l'export (pur) */

// Une date française « jj/mm/aaaa » (pour une salissure : la date tapée en texte).
const pad = (n) => String(n).padStart(2, '0');
const dateTexte = (t) => { const d = new Date(t); return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`; };

// La graine des salissures : l'élève et la séance. Même élève → même fichier ; deux élèves →
// positions différentes.
export const graineExport = (eleve, seance, exportId) => `${eleve || ''}|${seance || ''}|${exportId || ''}`;

// Les feuilles d'un export, PURES : mêmes base et graine → mêmes lignes. `propres` : les lignes
// de la première feuille avant salissures, en objets (colonne → valeur) — c'est contre elles que
// le dépôt se contrôle. `aveugle` : vrai tant qu'un comptage à l'aveugle n'est pas validé.
export function construireExport(exp, db, { graine = '', aveugle = false } = {}) {
  const feuilles = exp.feuilles.map((F) => {
    const masque = aveugle ? (F.aveugle || []) : [];
    const garde = F.colonnes.map((c, i) => [c, i]).filter(([c]) => !masque.includes(c));
    const brutes = (F.lignes(db) || []).map((l) => garde.map(([, i]) => (l[i] === undefined ? null : l[i])));
    return { nom: F.nom, colonnes: garde.map(([c]) => c), types: F.types || {}, lignes: brutes };
  });
  const premiere = feuilles[0];
  const propres = premiere ? premiere.lignes.map((l) => Object.fromEntries(premiere.colonnes.map((c, i) => [c, l[i]]))) : [];
  const S = exp.salissures;
  if (premiere && S) {
    const h = hasard(graine);
    let L = premiere.lignes.map((l) => l.slice());
    // Dates tapées en texte : `datesTexte` cellules de date tirées au hasard.
    const colsDate = premiere.colonnes.map((c, i) => [c, i]).filter(([c]) => premiere.types[c]).map(([, i]) => i);
    const touchees = new Set();
    if (colsDate.length && S.datesTexte) {
      const cand = [];
      L.forEach((l, r) => colsDate.forEach((i) => { if (typeof l[i] === 'number') cand.push([r, i]); }));
      h.melanger(cand).slice(0, S.datesTexte).forEach(([r, i]) => { L[r][i] = dateTexte(L[r][i]); touchees.add(L[r]); });
    }
    // Doublons exacts : une ligne recopiée (jamais une ligne à date en texte : le nombre de dates
    // en texte reste celui déclaré), posée ailleurs.
    for (let k = 0; k < (S.doublons || 0) && L.length; k++) {
      const sources = L.filter((l) => !touchees.has(l));
      const src = (sources.length ? sources : L)[h.entier(0, (sources.length ? sources : L).length - 1)];
      L.splice(h.entier(0, L.length), 0, src.slice());
    }
    // Lignes vides glissées entre les données.
    for (let k = 0; k < (S.vides || 0); k++) L.splice(h.entier(1, Math.max(1, L.length - 1)), 0, premiere.colonnes.map(() => null));
    premiere.lignes = L;
  }
  return { id: exp.id, fichier: exp.fichier, feuilles, propres };
}

// Le classeur SheetJS d'un export : vraies dates (format jj/mm/aaaa), largeurs lisibles.
export function classeurExport(XLSX, ex) {
  const wb = XLSX.utils.book_new();
  ex.feuilles.forEach((F) => {
    const aoa = [F.colonnes, ...F.lignes.map((l) => l.map((v, i) => {
      const t = F.types[F.colonnes[i]];
      return t && typeof v === 'number' ? new Date(v) : v;
    }))];
    const ws = XLSX.utils.aoa_to_sheet(aoa, { cellDates: true });
    F.colonnes.forEach((c, i) => {
      const t = F.types[c];
      if (!t) return;
      for (let r = 1; r < aoa.length; r++) {
        const cel = ws[XLSX.utils.encode_cell({ r, c: i })];
        if (cel && cel.t === 'd') cel.z = t === 'dateHeure' ? 'dd/mm/yyyy hh:mm' : 'dd/mm/yyyy';
      }
    });
    ws['!cols'] = F.colonnes.map((c, i) => ({ wch: Math.min(40, Math.max(String(c).length,
      ...aoa.slice(1).map((l) => (l[i] instanceof Date ? 10 : String(l[i] == null ? '' : l[i]).length))) + 2) }));
    XLSX.utils.book_append_sheet(wb, ws, F.nom.slice(0, 31));
  });
  return wb;
}

/* ===================================================================== le dépôt (pur) */

// Le format d'un fichier déposé, par son nom. Un .csv perd les formules : refusé avec son motif.
export const MSG_CSV = 'Ce format perd les formules : enregistrez votre fichier en .xlsx.';
export const MSG_PAS_CLASSEUR = "Ce fichier n'est pas un classeur.";
export function formatDepot(nom) {
  const n = String(nom || '').toLowerCase();
  if (/\.csv$/.test(n)) return { ok: false, message: MSG_CSV };
  if (/\.(xlsx|xlsm|ods)$/.test(n)) return { ok: true };
  return { ok: false, message: MSG_PAS_CLASSEUR };
}

// Une feuille lue en grille : en-têtes (ligne 1) et lignes de cellules SheetJS ({ v, f }).
// La feuille se retrouve par son nom plié ; à défaut, si le classeur n'en a qu'une, c'est elle.
function feuilleDe(classeur, nom) {
  const noms = classeur.SheetNames || [];
  const trouve = noms.find((n) => pliage(n) === pliage(nom)) || (noms.length === 1 ? noms[0] : null);
  return trouve ? { nom: trouve, ws: classeur.Sheets[trouve] } : null;
}
const decoder = (ref) => {
  const m = /^([A-Z]+)(\d+)(?::([A-Z]+)(\d+))?$/.exec(String(ref || '').toUpperCase());
  if (!m) return null;
  const col = (s) => s.split('').reduce((n, c) => n * 26 + c.charCodeAt(0) - 64, 0);
  return { c1: col(m[1]), r1: +m[2], c2: col(m[3] || m[1]), r2: +(m[4] || m[2]) };
};
const lettre = (n) => { let s = ''; while (n > 0) { const r = (n - 1) % 26; s = String.fromCharCode(65 + r) + s; n = (n - r - 1) / 26; } return s; };
export function grille(ws) {
  const d = decoder(ws && ws['!ref']);
  if (!d) return { entetes: [], lignes: [] };
  const cel = (r, c) => ws[lettre(c) + r] || null;
  const entetes = [];
  for (let c = 1; c <= d.c2; c++) { const x = cel(1, c); entetes.push(x ? String(x.v == null ? '' : x.v) : ''); }
  const lignes = [];
  for (let r = 2; r <= d.r2; r++) {
    const l = [];
    for (let c = 1; c <= d.c2; c++) l.push(cel(r, c));
    lignes.push({ r, cells: l });
  }
  return { entetes, lignes };
}
// Une colonne par son TITRE en ligne 1 (pliage : casse, accents, espaces), jamais par sa lettre.
const colonneDe = (g, titre) => g.entetes.findIndex((t) => pliage(t) === pliage(titre));
const vide = (c) => !c || c.v === undefined || c.v === null || String(c.v).trim() === '';
// Une clé lue dans le classeur ou dans l'export : nombre en texte, texte plié.
const cleDe = (v) => (v instanceof Date ? dateTexte(v.getTime()) : typeof v === 'number' ? String(v) : pliage(v));

function resultat(ctrl, justes, total, remarques) {
  return { id: ctrl.id, libelle: ctrl.libelle || ctrl.id, ok: total > 0 && justes === total, justes, total,
    remarques: remarques.slice(0, 12).concat(remarques.length > 12 ? [`… et ${remarques.length - 12} autre(s).`] : []) };
}
// Tolérance par défaut : 1e-6 (Excel et LibreOffice n'écrivent pas les mêmes décimales).
// `tolerance: null` = égalité exacte.
const tolDe = (ctrl) => (ctrl.tolerance === undefined ? 1e-6 : ctrl.tolerance);
// Un .xlsx et un .ods sont des archives zip : ils commencent par « PK ». Un fichier texte
// renommé en .xlsx serait lu par SheetJS comme un tableau : on le refuse avant.
export const estArchive = (octets) => !!octets && octets.length > 3 && octets[0] === 0x50 && octets[1] === 0x4b;
// Ce qui cloche dans une cellule, ou null.
function juger(cel, attendu, ctrl) {
  if (!memeValeur(cel ? cel.v : undefined, attendu, tolDe(ctrl))) {
    return vide(cel) ? 'cellule vide' : `valeur lue ${cel.v}${attendu === '' || attendu == null ? ', la cellule devait rester vide' : `, attendu ${attendu}`}`;
  }
  // Une formule est exigée (`formule`, ou des `fonctions` nommées) : même pour un résultat vide.
  if (ctrl.formule || (ctrl.fonctions && ctrl.fonctions.length)) {
    if (!(cel && cel.f)) {
      if (vide(cel)) return 'cellule vide, sans formule';
      return typeof cel.v === 'number' ? 'la cellule contient un nombre tapé, pas une formule' : 'la cellule contient une valeur tapée, pas une formule';
    }
    const m = manquantes(cel.f, ctrl.fonctions);
    if (m.length) return `la formule n'utilise pas ${m.map(nomFr).join(', ')}`;
  }
  return null;
}

// Les contrôles d'un dépôt. `propres` : les lignes de l'export (objets), pour les contrôles
// « colonne ». Résultat d'un contrôle : { id, libelle, ok, justes, total, remarques }.
//
//   { type: 'colonne', id, feuille, titre: 'Écart', cle: ['N° bon', 'Référence'],
//     attendu: (ligne) => …, filtre?: (ligne) => bool, formule: true, fonctions: ['IF'], tolerance }
//       la colonne retrouvée par son titre, chaque ligne de l'export retrouvée par sa clé
//       (l'élève trie, filtre, insère des colonnes : jamais d'adresse fixe) ;
//   { type: 'table', id, feuille, cle: 'Référence', colonne: 'Nb constats', attendu: { clé: valeur },
//     fonctions: ['COUNTIF'], formule: true }      → le résultat porte aussi `lu: { clé: valeur lue }`
//   { type: 'lignes', id, feuille, attendu: 143 }   lignes non vides, aucun doublon exact restant ;
//   { type: 'cellule', id, cellule: 'E8', attendu, fonctions?, … } et { plage, lignes } : ceux de
//     `classeur.js` (`controler`), plus les noms de fonctions.
export function controlerDepot(classeur, controles, propres = []) {
  return controles.map((ctrl) => {
    const type = ctrl.type || (ctrl.plage ? 'liste' : 'cellule');
    if (type === 'cellule' || type === 'liste') {
      const [r] = controlerCellules(classeur, [{ ...ctrl, tolerance: tolDe(ctrl) }]);
      let ok = r.ok;
      const rem = r.remarque ? [r.remarque] : [];
      if (ok && type === 'cellule' && ctrl.fonctions && ctrl.fonctions.length) {
        const m = manquantes(r.lu && r.lu.formule, ctrl.fonctions);
        if (!(r.lu && r.lu.formule)) { ok = false; rem.push('La cellule contient un nombre tapé, pas une formule.'); }
        else if (m.length) { ok = false; rem.push(`La formule n'utilise pas ${m.map(nomFr).join(', ')}.`); }
      }
      if (ok && ctrl.formuleAttendue && type === 'cellule' && !(r.lu && r.lu.formule)) ok = false;
      return resultat(ctrl, ok ? 1 : 0, 1, ok ? [] : rem);
    }
    const F = feuilleDe(classeur, ctrl.feuille);
    if (!F) return resultat(ctrl, 0, 1, [`La feuille « ${ctrl.feuille} » est introuvable.`]);
    const g = grille(F.ws);
    if (type === 'lignes') {
      const pleines = g.lignes.filter((l) => l.cells.some((c) => !vide(c)));
      const vu = new Map();
      let doublons = 0;
      pleines.forEach((l) => {
        const k = l.cells.map((c) => (vide(c) ? '' : cleDe(c.v))).join('|');
        if (vu.has(k)) doublons++; else vu.set(k, l.r);
      });
      const rem = [];
      if (pleines.length !== ctrl.attendu) rem.push(`${pleines.length} ${pluriel(pleines.length, 'ligne')} de données, attendu ${ctrl.attendu}.`);
      if (doublons) rem.push(`${doublons} ${pluriel(doublons, 'doublon')} encore dans la feuille.`);
      return resultat(ctrl, rem.length ? 0 : 1, 1, rem);
    }
    if (type === 'table') {
      const ic = colonneDe(g, ctrl.cle), iv = colonneDe(g, ctrl.colonne);
      const cles = Object.keys(ctrl.attendu || {});
      if (ic < 0 || iv < 0) return resultat(ctrl, 0, cles.length || 1, [`Colonne « ${ic < 0 ? ctrl.cle : ctrl.colonne} » introuvable en ligne 1.`]);
      let justes = 0;
      const rem = [];
      // Ce que l'élève a écrit, clé par clé : un jalon peut en dépendre (« une erreur ne se paie
      // qu'une fois » : la décision suivante se juge sur SES chiffres).
      const lu = {};
      cles.forEach((k) => {
        const l = g.lignes.find((x) => x.cells[ic] && cleDe(x.cells[ic].v) === cleDe(k));
        if (!l) { rem.push(`${k} : ligne absente.`); return; }
        const c = l.cells[iv];
        lu[k] = vide(c) ? null : c.v;
        const pb = juger(c, ctrl.attendu[k], ctrl);
        if (pb) rem.push(`${k} : ${pb}.`); else justes++;
      });
      return { ...resultat(ctrl, justes, cles.length, rem), lu };
    }
    if (type === 'colonne') {
      const cle = [].concat(ctrl.cle);
      const ix = colonneDe(g, ctrl.titre);
      const ik = cle.map((c) => colonneDe(g, c));
      const aVoir = propres.filter((l) => (ctrl.filtre ? ctrl.filtre(l) : true));
      if (ix < 0) return resultat(ctrl, 0, aVoir.length || 1, [`Colonne « ${ctrl.titre} » introuvable en ligne 1.`]);
      if (ik.some((i) => i < 0)) return resultat(ctrl, 0, aVoir.length || 1, [`Colonne « ${cle[ik.findIndex((i) => i < 0)]} » introuvable : ne la supprimez pas.`]);
      const index = new Map();
      g.lignes.forEach((l) => {
        if (ik.some((i) => vide(l.cells[i]))) return;
        const k = ik.map((i) => cleDe(l.cells[i].v)).join('|');
        if (!index.has(k)) index.set(k, l);
      });
      let justes = 0;
      const rem = [];
      aVoir.forEach((ligne) => {
        const k = cle.map((c) => cleDe(ligne[c])).join('|');
        const nom = `ligne ${cle.map((c) => ligne[c]).join(' / ')}`;
        const l = index.get(k);
        if (!l) { rem.push(`${nom} : absente du fichier.`); return; }
        const pb = juger(l.cells[ix], ctrl.attendu(ligne), ctrl);
        if (pb) rem.push(`${nom} : ${pb}.`); else justes++;
      });
      return resultat(ctrl, justes, aVoir.length, rem);
    }
    return resultat(ctrl, 0, 1, [`Contrôle « ${type} » inconnu.`]);
  });
}

/* ===================================================================== l'état et les jalons */

export const totalJustes = (res) => (res || []).reduce((a, r) => a + (r.justes || 0), 0);
export const totalControles = (res) => (res || []).reduce((a, r) => a + (r.total || 0), 0);

// Le temps de la séance → le retour au dépôt (décision 9 de la série Cdiscount).
export const retourDeTemps = (temps) => (temps === 'guidage' ? 'guidage' : temps === 'evaluation' ? 'evaluation' : 'entrainement');

// Range un dépôt contrôlé dans la base. Rend faux si le dépôt est refusé (évaluation déjà déposée).
export function enregistrerDepot(db, idDepot, resultats, { retour = 'entrainement', fichier = '', at = Date.now() } = {}) {
  if (!db.tableur) db.tableur = {};
  if (!db.tableur.depots) db.tableur.depots = {};
  const D = db.tableur.depots[idDepot] || (db.tableur.depots[idDepot] = { essais: 0, dernier: null, meilleur: null });
  if (retour === 'evaluation' && D.essais > 0) return false;
  const depot = { at, fichier, resultats };
  D.essais += 1;
  D.dernier = depot;
  if (!D.meilleur || totalJustes(resultats) >= totalJustes(D.meilleur.resultats)) D.meilleur = depot;
  return true;
}

// Pour les jalons : ce que l'élève a déposé (le MEILLEUR dépôt ; en évaluation, l'unique).
//   → { depose, essais, at, controles: { [id]: { ok, justes, total, remarques } } }
export function resultatDepot(db, idDepot) {
  const D = db && db.tableur && db.tableur.depots && db.tableur.depots[idDepot];
  if (!D || !D.meilleur) return { depose: false, essais: 0, at: null, controles: {} };
  return { depose: true, essais: D.essais, at: D.meilleur.at,
    controles: Object.fromEntries((D.meilleur.resultats || []).map((r) => [r.id, r])) };
}
export const exportFait = (db, idExport) => !!(db && db.tableur && db.tableur.exports && db.tableur.exports[idExport]);

/* ===================================================================== l'écran */

// Le retour montré après un dépôt, selon le temps.
export function retourHtml(resultats, retour) {
  if (retour === 'evaluation') return '<div class="avis avis-ok" data-depot-retour="evaluation">Fichier reçu.</div>';
  const n = totalJustes(resultats), m = totalControles(resultats);
  const tete = `<div class="avis ${n === m ? 'avis-ok' : ''}" data-depot-retour="${ech(retour)}"><strong>${n} ${pluriel(n, 'résultat juste', 'résultats justes')} sur ${m}.</strong>
    ${retour === 'guidage' ? (n === m ? ' Tout est juste.' : ' Lisez ce qui cloche, corrigez votre fichier et déposez-le de nouveau.') : ' Vous pouvez corriger votre fichier et le déposer de nouveau.'}</div>`;
  if (retour !== 'guidage') return tete;
  return tete + `<div class="ent-scroll"><table class="depot-detail"><thead><tr><th></th><th>Contrôle</th><th class="num">Justes</th><th>Ce qui cloche</th></tr></thead><tbody>
    ${resultats.map((r) => `<tr data-depot-ctrl="${ech(r.id)}"><td class="${r.ok ? 'juste' : 'faux'}">${r.ok ? '✓' : '✗'}</td>
      <td>${ech(r.libelle)}</td><td class="num">${r.justes} / ${r.total}</td>
      <td class="note">${r.remarques.length ? r.remarques.map(ech).join('<br>') : '—'}</td></tr>`).join('')}
    </tbody></table></div>`;
}

// Le geste dans l'environnement : boutons « Exporter », écran « Fichiers », aide.
// `api` (fourni par l'environnement à chaque dessin) : { db, sauver, toast, redessiner, graine,
// retour, aveugle(), fige() }.
export function creerGesteTableur(T) {
  const exports = T.exports || [];
  const depot = T.depot || null;
  const ui = { msg: null, lecture: false };

  async function telecharger(exp, api) {
    let XLSX;
    try { XLSX = await chargerXLSX(); } catch (e) { api.toast(e.message); return; }
    const ex = construireExport(exp, api.db, { graine: graineExport(api.graine, api.seance, exp.id), aveugle: api.aveugle() });
    const wb = classeurExport(XLSX, ex);
    const donnees = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const url = URL.createObjectURL(new Blob([donnees], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }));
    const a = document.createElement('a');
    a.href = url; a.download = exp.fichier || `${exp.id}.xlsx`;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
    if (!api.db.tableur) api.db.tableur = {};
    if (!api.db.tableur.exports) api.db.tableur.exports = {};
    if (!api.db.tableur.exports[exp.id]) { api.db.tableur.exports[exp.id] = { at: Date.now(), n: ex.feuilles[0] ? ex.feuilles[0].lignes.length : 0 }; api.sauver(); }
    api.toast(`Fichier exporté : ${a.download}`);
  }

  const bouton = (exp) => `<button class="btn btn-s btn-export" data-exporter="${ech(exp.id)}">
    <span class="btn-fichier-icone">${ICONE_TELECHARGER}</span><span>${ech(exp.libelle || 'Exporter')}</span></button>`;

  async function deposerFichier(fichier, api) {
    const fmt = formatDepot(fichier && fichier.name);
    if (!fmt.ok) { ui.msg = ['err', fmt.message]; api.redessiner(); return; }
    const D = api.db.tableur && api.db.tableur.depots && api.db.tableur.depots[depot.id];
    if (api.retour === 'evaluation' && D && D.essais > 0) { ui.msg = ['err', 'Votre fichier a déjà été reçu : un seul dépôt.']; api.redessiner(); return; }
    ui.lecture = true; ui.msg = null; api.redessiner();
    let classeur;
    try {
      const XLSX = await chargerXLSX();
      const octets = new Uint8Array(await fichier.arrayBuffer());
      if (!estArchive(octets)) throw new Error('pas une archive');
      classeur = XLSX.read(octets, { type: 'array', cellFormula: true });
    } catch (e) {
      ui.lecture = false; ui.msg = ['err', MSG_PAS_CLASSEUR]; api.redessiner(); return;
    }
    const exp = exports.find((x) => x.id === depot.export) || exports[0];
    const ex = exp ? construireExport(exp, api.db, { graine: graineExport(api.graine, api.seance, exp.id), aveugle: false }) : { propres: [] };
    const resultats = controlerDepot(classeur, depot.controles(api.db), ex.propres);
    enregistrerDepot(api.db, depot.id, resultats, { retour: api.retour, fichier: fichier.name });
    ui.lecture = false;
    api.sauver();
    api.redessiner();
  }

  return {
    nav: { id: 'fichiers', libelle: 'Fichiers' },
    aide: T.aide || '',
    aDesExports: (ecran) => exports.some((x) => x.ecran === ecran),

    // Les boutons « Exporter » d'un écran, posés dans son en-tête (à côté du titre).
    poserExports(z, ecran, api) {
      const ici = exports.filter((x) => x.ecran === ecran);
      const tete = z.querySelector('.ent-tete');
      if (!ici.length || !tete) return;
      tete.insertAdjacentHTML('beforeend', `<div class="rangee ent-exports">${ici.map(bouton).join('')}</div>`);
      tete.querySelectorAll('[data-exporter]').forEach((b) => b.addEventListener('click', () => telecharger(exports.find((x) => x.id === b.dataset.exporter), api)));
    },

    html(api) {
      const D = depot && api.db.tableur && api.db.tableur.depots && api.db.tableur.depots[depot.id];
      const evalDeposee = api.retour === 'evaluation' && D && D.essais > 0;
      return `<div class="ent-tete"><h2>Fichiers</h2><p class="note">Vos exports, et le dépôt de votre fichier travaillé.</p></div>
        ${exports.length ? `<section class="panneau"><h3>Exports</h3>
          <p class="note">Un export est fabriqué à partir des données du système, à l'instant où vous cliquez.</p>
          <div class="rangee">${exports.map(bouton).join('')}</div></section>` : ''}
        ${depot ? `<section class="panneau"><h3>${ech(depot.libelle || 'Déposer mon fichier')}</h3>
          ${evalDeposee ? '' : `<div class="depot" id="depotTableur" data-depot-zone>
            <input type="file" id="fichierTableur" accept=".xlsx,.xlsm,.ods" hidden>
            <span class="depot-icone">${ICONE_DEPOSER}</span>
            <p><strong>Déposez votre classeur ici</strong>, ou
              <button class="btn btn-s" data-parcourir>parcourir</button></p>
            <p class="note">Formats acceptés : .xlsx, .ods. Le fichier reste sur votre ordinateur : il est lu dans
              le navigateur, il n'est pas envoyé.${api.retour === 'evaluation' ? ' <strong>Un seul dépôt.</strong>' : ''}</p>
          </div>`}
          ${ui.lecture ? '<div class="avis">Lecture du classeur…</div>' : ''}
          ${ui.msg ? `<div class="avis ${ui.msg[0] === 'ok' ? 'avis-ok' : 'avis-err'}" data-depot-msg>${ech(ui.msg[1])}</div>` : ''}
          ${D && D.dernier ? `<p class="note">Dernier fichier déposé : <span class="mono">${ech(D.dernier.fichier)}</span>${
            api.retour !== 'evaluation' && D.essais > 1 ? ` · ${D.essais} dépôts, le meilleur est retenu` : ''}</p>
            ${retourHtml(D.dernier.resultats, api.retour)}` : ''}
        </section>` : ''}`;
    },

    brancher(z, api) {
      z.querySelectorAll('[data-exporter]').forEach((b) => b.addEventListener('click', () => telecharger(exports.find((x) => x.id === b.dataset.exporter), api)));
      const champ = z.querySelector('#fichierTableur');
      const zone = z.querySelector('#depotTableur');
      if (!champ || !zone) return;
      z.querySelector('[data-parcourir]')?.addEventListener('click', () => champ.click());
      champ.addEventListener('change', () => { if (champ.files[0]) deposerFichier(champ.files[0], api); });
      ['dragenter', 'dragover'].forEach((e) => zone.addEventListener(e, (ev) => { ev.preventDefault(); zone.classList.add('survol'); }));
      ['dragleave', 'drop'].forEach((e) => zone.addEventListener(e, () => zone.classList.remove('survol')));
      zone.addEventListener('drop', (ev) => { ev.preventDefault(); const f = ev.dataTransfer.files[0]; if (f) deposerFichier(f, api); });
    },
  };
}
