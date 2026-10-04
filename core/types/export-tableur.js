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
//       // Viser des lignes (04/10, ENT-2.6) : `cible(ligne)` (objet colonne → valeur) ; au moins
//       // `doublonsCible` doublons et `datesTexteCible` dates en texte tombent sur ces lignes-là.
//
//       // L'ÉLÈVE CHOISIT CE QU'IL EXPORTE (04/10/2026, brief `MOTEUR-export-filtre.md`) : écran
//       // « Extractions », critères AU-DESSUS du tableau, « Exporter » sort ce qu'on voit (toutes
//       // les colonnes). La 1re feuille montre `lignes(db)` (= la demande, exactement l'export d'avant)
//       // PLUS `autres(db)` (lignes à écarter, même format) ; les autres feuilles ne bougent pas.
//       liste: 'Mouvements de stock',                       // nom de la liste dans Extractions
//       autres: (db) => [[…], …],                           // PURE ; aucune ne doit passer la demande
//       aujourdhui: (db) => ts,                             // le jour de la séance (défaut : aujourd'hui)
//       filtres: [
//         { id: 'type', libelle: 'Type de mouvement', colonne: 'Type', tous: 'Tous', juste: 'Ajustement inventaire' },
//         { id: 'allee', libelle: 'Allée', valeur: (l) => l.Emplacement[0], tous: 'Toutes', juste: '*' },
//         { id: 'periode', libelle: 'Période', periode: 'Date', juste: '30j', defaut: '7j' },
//       ],                                                  // `juste` peut être une fonction de la base
//       indications: 1 | 2 | 3 | 4,  // 1 : critères de la demande déjà réglés, retour qui dit quel critère
//                                    // changer ; 2 : retour qui dit ce qui cloche ; 3 : « relisez la
//                                    // demande » ; 4 : aucun retour sur l'export (évaluation)
//     }],
//     depot: {
//       id: 'analyse', export: 'preparations', libelle: 'Déposer mon fichier',
//       retour: 'guidage' | 'entrainement' | 'evaluation',     // défaut : déduit du temps de la séance
//       controles(db, propres) { return [ … ]; },              // voir `controlerDepot` ; `propres` :
//     },                                                       // les lignes de l'export DE L'ÉLÈVE
//   }
//
// Une erreur ne se paie qu'une fois : le dépôt est contrôlé contre le fichier que l'élève a
// RÉELLEMENT exporté (le meilleur de ses exports), et le bon choix des lignes est un jalon à part
// (`exportJuste`).
//
// ÉTAT dans la base de l'élève (cloisonné : c'est la base de la séance) :
//   db.tableur.criteres[id] = { [filtre]: valeur, du, au }   les critères à l'écran
//   db.tableur.exports[id] = { at, n, essais, criteres, juste, faits: [critères…] }
//                                                         `at`, `n` : premier export ; le reste : le dernier
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

/* ---------------------------------------------------------- les critères d'extraction (purs) */

const JOUR = 864e5;
const minuitDe = (t) => { const d = new Date(t); d.setHours(0, 0, 0, 0); return d.getTime(); };
export const TOUS = '*';
// Les périodes proposées, comptées depuis le jour de la séance (aujourd'hui compris).
export const PERIODES = [
  ['jour', "Aujourd'hui"], ['7j', '7 derniers jours'], ['30j', '30 derniers jours'],
  ['tout', "Tout l'historique"], ['perso', 'Personnalisée'],
];
const libellePeriode = (k) => (PERIODES.find(([x]) => x === k) || [k, k])[1];
const isoJour = (t) => { const d = new Date(t); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; };
const deIso = (s) => { const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(s || '')); return m ? new Date(+m[1], +m[2] - 1, +m[3]).getTime() : null; };

const aFiltres = (exp) => !!(exp && exp.filtres && exp.filtres.length);
const aujourdhuiDe = (exp, db) => minuitDe(exp.aujourdhui ? exp.aujourdhui(db) : Date.now());
const valeurJuste = (f, db) => (typeof f.juste === 'function' ? f.juste(db) : f.juste === undefined ? TOUS : f.juste);

// Les critères de la demande (ceux qui redonnent exactement l'export déclaré).
export function criteresJustes(exp, db) {
  return Object.fromEntries((exp.filtres || []).map((f) => [f.id, valeurJuste(f, db)]));
}
// Les critères à l'ouverture : ceux de la demande au niveau 1, ceux du logiciel sinon.
export function criteresDepart(exp, db) {
  if ((exp.indications || 1) <= 1) return criteresJustes(exp, db);
  return Object.fromEntries((exp.filtres || []).map((f) => [f.id, f.defaut !== undefined ? f.defaut : f.periode ? '7j' : TOUS]));
}
// La valeur d'une ligne (objet colonne → valeur) pour un filtre.
const valeurDe = (f, o) => (f.valeur ? f.valeur(o) : o[f.colonne]);
// Une ligne passe-t-elle un filtre ?
function passe(f, o, c, auj) {
  const v = c[f.id];
  if (f.periode) {
    const t = o[f.periode];
    if (typeof t !== 'number' || v === 'tout') return true;
    let du, au;
    if (v === 'perso') { du = deIso(c.du); au = deIso(c.au); au = au == null ? null : au + JOUR; }
    else { const n = v === 'jour' ? 1 : v === '7j' ? 7 : 30; du = auj - (n - 1) * JOUR; au = auj + JOUR; }
    return (du == null || t >= du) && (au == null || t < au);
  }
  return v === undefined || v === TOUS || String(valeurDe(f, o)) === String(v);
}
// Les lignes de la 1re feuille : la demande (`lignes`) et les lignes à écarter (`autres`), triées
// par date si la feuille en a une (tri stable : l'ordre de la demande est gardé). `demande` : vrai
// pour une ligne de la demande.
function univers(exp, db) {
  const F = exp.feuilles[0];
  const L = (F.lignes(db) || []).map((l) => ({ l, demande: true }))
    .concat(((exp.autres && exp.autres(db)) || []).map((l) => ({ l, demande: false })));
  const iDate = F.colonnes.findIndex((c) => F.types && F.types[c]);
  if (iDate >= 0 && exp.autres) L.sort((a, b) => (a.l[iDate] || 0) - (b.l[iDate] || 0));
  return L.map((x) => ({ ...x, o: Object.fromEntries(F.colonnes.map((c, i) => [c, x.l[i] === undefined ? null : x.l[i]])) }));
}
// Les lignes que les critères laissent voir (sans critère : la demande, exactement).
function retenues(exp, db, criteres) {
  const U = univers(exp, db);
  if (!aFiltres(exp) || !criteres) return U.filter((x) => x.demande);
  const auj = aujourdhuiDe(exp, db);
  return U.filter((x) => exp.filtres.every((f) => passe(f, x.o, criteres, auj)));
}
// Ce que les critères de l'élève donnent, comparé à la demande : lignes en trop (par filtre
// qu'elles ne passent pas dans la demande), lignes manquantes, critères qui diffèrent.
export function comparerExport(exp, db, criteres) {
  if (!aFiltres(exp)) return { juste: true, enTrop: {}, nEnTrop: 0, manque: 0, ecarts: [] };
  const U = univers(exp, db);
  const auj = aujourdhuiDe(exp, db);
  const J = criteresJustes(exp, db);
  const vu = U.filter((x) => exp.filtres.every((f) => passe(f, x.o, criteres, auj)));
  const enTrop = {};
  let nEnTrop = 0;
  vu.filter((x) => !x.demande).forEach((x) => {
    nEnTrop++;
    exp.filtres.filter((f) => !passe(f, x.o, J, auj)).forEach((f) => { enTrop[f.id] = (enTrop[f.id] || 0) + 1; });
  });
  const manque = U.filter((x) => x.demande).length - vu.filter((x) => x.demande).length;
  // Les lignes demandées que les critères de l'élève cachent, comptées par critère qui les cache
  // (retour de Tristan du 04/10 : au niveau 2, dire quel critère vérifier, sans donner la valeur).
  const manquePar = {};
  U.filter((x) => x.demande && !vu.includes(x)).forEach((x) => {
    exp.filtres.filter((f) => !passe(f, x.o, criteres, auj)).forEach((f) => { manquePar[f.id] = (manquePar[f.id] || 0) + 1; });
  });
  const ecarts = exp.filtres.filter((f) => String(criteres[f.id]) !== String(J[f.id])).map((f) => f.id);
  return { juste: !nEnTrop && !manque, enTrop, nEnTrop, manque, manquePar, ecarts };
}
// Les options d'un filtre (hors période) : « Tous », puis les valeurs rencontrées, triées.
export function optionsFiltre(exp, db, f) {
  const vals = [...new Set(univers(exp, db).map((x) => valeurDe(f, x.o)).filter((v) => v != null && v !== ''))]
    .map(String).sort((a, b) => a.localeCompare(b, 'fr'));
  return [[TOUS, f.tous || 'Tous'], ...vals.map((v) => [v, v])];
}
// Le libellé d'une valeur de critère, pour un retour à l'élève.
const libelleValeur = (f, v) => (f.periode ? libellePeriode(v) : v === TOUS ? (f.tous || 'Tous') : v);

// Les feuilles d'un export, PURES : mêmes base, critères et graine → mêmes lignes. `propres` : les
// lignes de la première feuille avant salissures, en objets (colonne → valeur) — c'est contre elles
// que le dépôt se contrôle. `aveugle` : vrai tant qu'un comptage à l'aveugle n'est pas validé.
// `criteres` : ceux de l'élève (absents : la demande, exactement). `salissures: false` : ce que
// montre l'écran Extractions (le fichier exporté, lui, est sale).
export function construireExport(exp, db, { graine = '', aveugle = false, criteres = null, salissures = true } = {}) {
  const feuilles = exp.feuilles.map((F, k) => {
    const masque = aveugle ? (F.aveugle || []) : [];
    const garde = F.colonnes.map((c, i) => [c, i]).filter(([c]) => !masque.includes(c));
    const source = k === 0 ? retenues(exp, db, criteres).map((x) => x.l) : (F.lignes(db) || []);
    const brutes = source.map((l) => garde.map(([, i]) => (l[i] === undefined ? null : l[i])));
    return { nom: F.nom, colonnes: garde.map(([c]) => c), types: F.types || {}, lignes: brutes };
  });
  const premiere = feuilles[0];
  const propres = premiere ? premiere.lignes.map((l) => Object.fromEntries(premiere.colonnes.map((c, i) => [c, l[i]]))) : [];
  // Les salissures peuvent dépendre de la base (le niveau de l'élève) : `salissures(db)`.
  const S = typeof exp.salissures === 'function' ? exp.salissures(db) : exp.salissures;
  if (premiere && S && salissures) {
    const h = hasard(graine);
    let L = premiere.lignes.map((l) => l.slice());
    // Dates tapées en texte : `datesTexte` cellules de date tirées au hasard.
    const colsDate = premiere.colonnes.map((c, i) => [c, i]).filter(([c]) => premiere.types[c]).map(([, i]) => i);
    const touchees = new Set();
    // Les lignes visées par la séance (`cible`), lues sur la ligne propre en objet.
    const vise = (l) => !!(S.cible && S.cible(Object.fromEntries(premiere.colonnes.map((c, i) => [c, l[i]]))));
    // Tirer `n` éléments dont au moins `min` parmi ceux qui sont visés.
    const tirer = (liste, n, min, estVise) => {
      const m = h.melanger(liste);
      const v = m.filter(estVise).slice(0, Math.min(min || 0, n));
      return v.concat(m.filter((x) => !v.includes(x)).slice(0, n - v.length));
    };
    if (colsDate.length && S.datesTexte) {
      const cand = [];
      L.forEach((l, r) => colsDate.forEach((i) => { if (typeof l[i] === 'number') cand.push([r, i]); }));
      tirer(cand, S.datesTexte, S.datesTexteCible, ([r]) => vise(L[r])).forEach(([r, i]) => { touchees.add(L[r]); L[r][i] = dateTexte(L[r][i]); });
    }
    // Doublons exacts : une ligne recopiée (jamais une ligne à date en texte : le nombre de dates
    // en texte reste celui déclaré), posée ailleurs.
    const sources = tirer(L.filter((l) => !touchees.has(l)), S.doublons || 0, S.doublonsCible, vise);
    sources.forEach((src) => L.splice(h.entier(0, L.length), 0, src.slice()));
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
//     fonctions: ['COUNTIF'], formule: true,
//     fonctionsFeuille?: ['VLOOKUP'] }   → ces fonctions doivent figurer QUELQUE PART dans la feuille
//                                         (une valeur calculée à partir d'une colonne de RECHERCHEV) ;
//     le résultat porte aussi `lu: { clé: valeur lue }`
//   { type: 'lignes', id, feuille, attendu: 143, colonneDate?: 'Date' }   lignes non vides, aucun
//     doublon exact restant, et (colonneDate) plus aucune date écrite en texte dans cette colonne ;
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
      if (ctrl.colonneDate) {
        const id = colonneDe(g, ctrl.colonneDate);
        if (id < 0) rem.push(`Colonne « ${ctrl.colonneDate} » introuvable en ligne 1.`);
        else {
          const texte = pleines.filter((l) => l.cells[id] && l.cells[id].t === 's' && String(l.cells[id].v).trim() !== '').length;
          if (texte) rem.push(`${texte} ${pluriel(texte, 'date écrite', 'dates écrites')} en texte dans la colonne « ${ctrl.colonneDate} ».`);
        }
      }
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
      // Des fonctions exigées n'importe où dans la feuille : sans elles, rien n'est juste.
      const absentes = (ctrl.fonctionsFeuille || []).map((x) => String(x).toUpperCase()).filter((x) =>
        !Object.keys(F.ws).some((a) => a[0] !== '!' && F.ws[a] && F.ws[a].f && fonctionsDe(F.ws[a].f).has(x)));
      if (absentes.length) return { ...resultat(ctrl, 0, cles.length, [`La feuille « ${F.nom} » n'utilise pas ${absentes.map(nomFr).join(', ')}.`, ...rem]), lu };
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
// `exporte` : l'export contre lequel le fichier a été contrôlé ({ juste, criteres, comparaison }).
// Le meilleur dépôt : le plus de résultats justes ; à égalité, celui dont l'export est juste.
export function enregistrerDepot(db, idDepot, resultats, { retour = 'entrainement', fichier = '', at = Date.now(), exporte = null } = {}) {
  if (!db.tableur) db.tableur = {};
  if (!db.tableur.depots) db.tableur.depots = {};
  const D = db.tableur.depots[idDepot] || (db.tableur.depots[idDepot] = { essais: 0, dernier: null, meilleur: null });
  if (retour === 'evaluation' && D.essais > 0) return false;
  const depot = { at, fichier, resultats };
  if (exporte) depot.exporte = exporte;
  D.essais += 1;
  D.dernier = depot;
  const n = totalJustes(resultats), m = D.meilleur ? totalJustes(D.meilleur.resultats) : -1;
  const exJuste = (d) => !!(d && d.exporte && d.exporte.juste);
  if (!D.meilleur || n > m || (n === m && (exJuste(depot) || !exJuste(D.meilleur)))) D.meilleur = depot;
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

// Le jalon « bon export » : l'export contre lequel le meilleur dépôt a été contrôlé ; sans dépôt,
// le dernier export. Faux tant que rien n'est exporté.
export function exportJuste(db, idExport, idDepot) {
  const T = (db && db.tableur) || {};
  const D = idDepot && T.depots && T.depots[idDepot];
  if (D && D.meilleur && D.meilleur.exporte) return !!D.meilleur.exporte.juste;
  const E = T.exports && T.exports[idExport];
  return !!(E && E.juste);
}

// Le statut du jalon « bon export » : en attente tant que rien n'est déposé (l'élève n'a aucun
// retour sur son export avant le dépôt), puis juste ou faux.
export function statutExport(db, idExport, idDepot) {
  if (!resultatDepot(db, idDepot).depose) return { status: 'attente' };
  return exportJuste(db, idExport, idDepot) ? { status: 'ok' } : { status: 'ko', detail: 'Les lignes exportées ne sont pas celles demandées.' };
}

// Les critères à l'écran (rangés dans la base), à défaut ceux de départ.
export function criteresEleve(exp, db) {
  const C = db && db.tableur && db.tableur.criteres && db.tableur.criteres[exp.id];
  return C ? { ...criteresDepart(exp, db), ...C } : criteresDepart(exp, db);
}
// Range un export fait par l'élève : premier export (`at`, `n`), dernier (`criteres`, `juste`),
// et les critères DIFFÉRENTS déjà exportés (`faits`, les huit derniers) : au dépôt, le fichier est
// contrôlé contre celui qui lui ressemble le plus.
export function enregistrerExport(db, exp, criteres, n, at = Date.now()) {
  if (!db.tableur) db.tableur = {};
  if (!db.tableur.exports) db.tableur.exports = {};
  const E = db.tableur.exports[exp.id] || (db.tableur.exports[exp.id] = { at, n, essais: 0 });
  E.essais = (E.essais || 0) + 1;
  if (aFiltres(exp)) {
    const c = { ...criteres };
    E.criteres = c;
    E.juste = comparerExport(exp, db, c).juste;
    const cle = JSON.stringify(c);
    E.faits = (E.faits || []).filter((x) => JSON.stringify(x) !== cle).concat([c]).slice(-8);
  } else E.juste = true;
  return E;
}
// Contrôle un classeur déposé contre CHACUN des exports de l'élève (critères différents) et garde
// le meilleur : ses formules sont jugées sur SON fichier. Sans export filtré : l'export déclaré.
export function controlerContreExports(classeur, exp, depot, db, { graine = '' } = {}) {
  const E = db.tableur && db.tableur.exports && db.tableur.exports[exp.id];
  const faits = aFiltres(exp) ? ((E && E.faits && E.faits.length) ? E.faits.slice().reverse() : [criteresEleve(exp, db)]) : [null];
  let mieux = null;
  faits.forEach((c) => {
    const ex = construireExport(exp, db, { graine, criteres: c });
    const resultats = controlerDepot(classeur, depot.controles(db, ex.propres), ex.propres);
    if (!mieux || totalJustes(resultats) > totalJustes(mieux.resultats)) mieux = { resultats, criteres: c };
  });
  const comparaison = mieux.criteres ? comparerExport(exp, db, mieux.criteres) : null;
  return { resultats: mieux.resultats,
    exporte: comparaison ? { juste: comparaison.juste, criteres: mieux.criteres, comparaison } : null };
}

/* ===================================================================== l'écran */

// Ce que l'élève lit sur son export au dépôt, selon le niveau d'indication (1 à 4).
export function retourExportHtml(exp, exporte) {
  const niv = exp.indications || 1;
  if (!exporte || !aFiltres(exp) || niv >= 4) return '';
  const C = exporte.comparaison;
  if (C.juste) return '<p class="juste" data-depot-export="ok">✓ Export : vos critères donnent bien les lignes demandées.</p>';
  if (niv === 3) return '<p class="faux" data-depot-export="ko">✗ Export : votre fichier ne correspond pas à la demande. Relisez-la, puis refaites l\'export (Extractions).</p>';
  const nom = (id) => (exp.filtres.find((f) => f.id === id) || { libelle: id }).libelle;
  const pb = [];
  if (niv === 1) {
    const J = exporte.justes || {};
    C.ecarts.forEach((id) => {
      const f = exp.filtres.find((x) => x.id === id);
      if (f && J[id] !== undefined) pb.push(`« ${f.libelle} » : choisissez « ${libelleValeur(f, J[id])} ».`);
    });
  }
  if (niv === 2 || !pb.length) {
    Object.entries(C.enTrop).forEach(([id, n]) => pb.push(`${n} ${pluriel(n, 'ligne')} en trop : leur « ${nom(id)} » ne correspond pas à la demande.`));
    if (C.manque) {
      const ids = Object.keys(C.manquePar || {});
      pb.push(`Il manque ${C.manque} ${pluriel(C.manque, 'ligne demandée', 'lignes demandées')}${ids.length ? ` : vérifiez ${ids.map((id) => `« ${nom(id)} »`).join(' et ')}` : ''}.`);
    }
  }
  return `<div class="faux" data-depot-export="ko"><p>✗ Export à refaire (Extractions) :</p><ul>${pb.map((p) => `<li>${ech(p)}</li>`).join('')}</ul></div>`;
}

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

// Le rappel commun à toute séance qui déclare une aide (retour de Tristan du 04/10/2026) : les
// guillemets, la cellule A1, le format texte.
export const RAPPEL_TEXTE = 'Un texte s’écrit entre guillemets : =NB.SI(G:G;"Casse"). Une cellule s’écrit sans guillemets : =NB.SI(G:G;A1) — avec des guillemets, "A1" chercherait le texte A1. '
  + 'Un nombre au format texte (calé à gauche dans la cellule) n’est pas compté comme un nombre : passez la colonne au format Nombre.';

// Une cellule de l'écran Extractions : une date lisible, le reste tel quel.
function celluleHtml(v, type) {
  if (v == null) return '';
  if (type && typeof v === 'number') {
    const d = new Date(v);
    return dateTexte(v) + (type === 'dateHeure' ? ` ${pad(d.getHours())}:${pad(d.getMinutes())}` : '');
  }
  return ech(v);
}

// Le geste dans l'environnement : écran « Extractions » (critères, tableau, « Exporter »), écran
// « Fichiers » (le dépôt), aide.
// `api` (fourni par l'environnement à chaque dessin) : { db, sauver, toast, redessiner, graine,
// retour, aveugle(), fige() }.
export function creerGesteTableur(T) {
  const exports = T.exports || [];
  const depot = T.depot || null;
  const ui = { msg: null, lecture: false, liste: exports[0] ? exports[0].id : null };
  const expDe = (id) => exports.find((x) => x.id === id) || exports[0];

  async function telecharger(exp, api) {
    let XLSX;
    try { XLSX = await chargerXLSX(); } catch (e) { api.toast(e.message); return; }
    const criteres = aFiltres(exp) ? criteresEleve(exp, api.db) : null;
    const ex = construireExport(exp, api.db, { graine: graineExport(api.graine, api.seance, exp.id), aveugle: api.aveugle(), criteres });
    const wb = classeurExport(XLSX, ex);
    const donnees = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const url = URL.createObjectURL(new Blob([donnees], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }));
    const a = document.createElement('a');
    a.href = url; a.download = exp.fichier || `${exp.id}.xlsx`;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
    if (!api.fige()) { enregistrerExport(api.db, exp, criteres, ex.feuilles[0] ? ex.feuilles[0].lignes.length : 0); api.sauver(); }
    api.toast(`Fichier exporté : ${a.download}`);
  }

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
    let resultats, exporte = null;
    if (exp) {
      ({ resultats, exporte } = controlerContreExports(classeur, exp, depot, api.db, { graine: graineExport(api.graine, api.seance, exp.id) }));
      if (exporte) exporte.justes = criteresJustes(exp, api.db);
    } else resultats = controlerDepot(classeur, depot.controles(api.db, []), []);
    enregistrerDepot(api.db, depot.id, resultats, { retour: api.retour, fichier: fichier.name, exporte });
    ui.lecture = false;
    api.sauver();
    api.redessiner();
  }

  // L'écran Extractions : la liste, ses critères au-dessus, le tableau de ce qui sera exporté.
  function htmlExtractions(api) {
    const exp = expDe(ui.liste);
    if (!exp) return '<div class="ent-tete"><h2>Extractions</h2></div>';
    const c = aFiltres(exp) ? criteresEleve(exp, api.db) : null;
    const ex = construireExport(exp, api.db, { aveugle: api.aveugle(), criteres: c, salissures: false });
    const F = ex.feuilles[0];
    const n = F.lignes.length;
    const champ = (f) => {
      if (f.periode) {
        return `<label class="ext-champ"><span>${ech(f.libelle)}</span><select data-filtre="${ech(f.id)}">${PERIODES.map(([k, l]) =>
          `<option value="${k}" ${c[f.id] === k ? 'selected' : ''}>${ech(l)}</option>`).join('')}</select></label>
          ${c[f.id] === 'perso' ? `<label class="ext-champ"><span>Du</span><input type="date" data-filtre-date="du" value="${ech(c.du || '')}"></label>
            <label class="ext-champ"><span>Au</span><input type="date" data-filtre-date="au" value="${ech(c.au || '')}"></label>` : ''}`;
      }
      return `<label class="ext-champ"><span>${ech(f.libelle)}</span><select data-filtre="${ech(f.id)}">${optionsFiltre(exp, api.db, f).map(([v, l]) =>
        `<option value="${ech(v)}" ${String(c[f.id]) === v ? 'selected' : ''}>${ech(l)}</option>`).join('')}</select></label>`;
    };
    return `<div class="ent-tete"><h2>Extractions</h2><p class="note">Choisissez une liste et réglez les critères : le tableau montre ce que contiendra le fichier.</p></div>
      ${exports.length > 1 ? `<div class="rangee ext-filtres"><label class="ext-champ"><span>Liste</span><select data-liste>${exports.map((x) =>
        `<option value="${ech(x.id)}" ${x.id === exp.id ? 'selected' : ''}>${ech(x.liste || x.feuilles[0].nom)}</option>`).join('')}</select></label></div>` : ''}
      <section class="panneau" data-extraction="${ech(exp.id)}">
        <h3>${ech(exp.liste || F.nom)}</h3>
        ${aFiltres(exp) ? `<div class="rangee ext-filtres">${exp.filtres.map(champ).join('')}</div>` : ''}
        <div class="rangee ext-bas"><span class="note" data-ext-compte>${n} ${pluriel(n, 'ligne')}</span>
          <button class="btn btn-s btn-export" data-exporter="${ech(exp.id)}" ${n ? '' : 'disabled'}>
            <span class="btn-fichier-icone">${ICONE_TELECHARGER}</span><span>Exporter</span></button></div>
        <div class="ent-scroll ext-table"><table><thead><tr>${F.colonnes.map((col) => `<th>${ech(col)}</th>`).join('')}</tr></thead><tbody>
          ${F.lignes.map((l) => `<tr>${l.map((v, i) => `<td class="${typeof v === 'number' && !F.types[F.colonnes[i]] ? 'num' : ''}">${celluleHtml(v, F.types[F.colonnes[i]])}</td>`).join('')}</tr>`).join('')}
        </tbody></table></div>
      </section>`;
  }

  function brancherExtractions(z, api) {
    const exp = expDe(ui.liste);
    if (!exp) return;
    z.querySelector('[data-liste]')?.addEventListener('change', (e) => { ui.liste = e.target.value; api.redessiner(); });
    z.querySelectorAll('[data-exporter]').forEach((b) => b.addEventListener('click', () => telecharger(exp, api)));
    // Un critère change : rangé dans la base (l'élève le retrouve), le tableau se redessine, le
    // focus revient sur le même champ (clavier).
    const poser = (cle, valeur, sel) => {
      const db = api.db;
      if (!db.tableur) db.tableur = {};
      if (!db.tableur.criteres) db.tableur.criteres = {};
      const c = criteresEleve(exp, db);
      c[cle] = valeur;
      // Période personnalisée choisie : le mois en cours, prérempli (l'élève ajuste).
      if (cle !== 'du' && cle !== 'au' && valeur === 'perso' && !c.du) {
        const auj = aujourdhuiDe(exp, db), d = new Date(auj);
        c.du = isoJour(new Date(d.getFullYear(), d.getMonth(), 1).getTime()); c.au = isoJour(auj);
      }
      db.tableur.criteres[exp.id] = c;
      if (!api.fige()) api.sauver();
      api.redessiner();
      document.querySelector(sel)?.focus();
    };
    z.querySelectorAll('[data-filtre]').forEach((s) => s.addEventListener('change', () => poser(s.dataset.filtre, s.value, `[data-filtre="${s.dataset.filtre}"]`)));
    z.querySelectorAll('[data-filtre-date]').forEach((s) => s.addEventListener('change', () => poser(s.dataset.filtreDate, s.value, `[data-filtre-date="${s.dataset.filtreDate}"]`)));
  }

  return {
    nav: { id: 'fichiers', libelle: 'Fichiers' },
    navExtractions: exports.length ? { id: 'extractions', libelle: 'Extractions' } : null,
    aide: T.aide ? `${T.aide}\n${RAPPEL_TEXTE}` : '',
    htmlExtractions,
    brancherExtractions,

    html(api) {
      const D = depot && api.db.tableur && api.db.tableur.depots && api.db.tableur.depots[depot.id];
      const evalDeposee = api.retour === 'evaluation' && D && D.essais > 0;
      const exp = depot && (exports.find((x) => x.id === depot.export) || exports[0]);
      return `<div class="ent-tete"><h2>Fichiers</h2><p class="note">Le dépôt de votre fichier travaillé.${exports.length ? ' Les exports se font dans <b>Extractions</b>.' : ''}</p></div>
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
            ${api.retour !== 'evaluation' && exp ? retourExportHtml(exp, D.dernier.exporte) : ''}
            ${retourHtml(D.dernier.resultats, api.retour)}` : ''}
        </section>` : ''}`;
    },

    brancher(z, api) {
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
