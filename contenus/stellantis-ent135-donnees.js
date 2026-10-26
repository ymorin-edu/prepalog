// ENT-13.5 — Stellantis Sochaux, « évaluation de rentrée » : les DONNÉES de la séance (le jeu tiré par élève, le camion, le plan, le classement ABC, l'inventaire).
// Importable sous Node. Brief : `docs/briefs/ENT-13.5-stellantis-evaluation-rentree.md`. Séance : `contenus/stellantis-ent135.js`.
//
// UN JEU PAR ÉLÈVE (graine = son identifiant, `tirerJeu` de `core/tirage.js`, comme ENT-4.4 de Picard) : les sorties des 15 références, le camion (5 palettes, 2 anomalies),
// la ligne de l'inventaire. Tout se lit dans `jeuDe(graine)`, une fonction pure : le quai, le plan et l'inventaire sont des FONCTIONS de la graine (le moteur la pose
// avant d'ouvrir la séance), les contrôles du dépôt et le corrigé la relisent par `graineDeBase(db)`.
// ⚠ Le jeu d'un élève est une fonction de son identifiant ET de ce fichier : ne rien changer au tirage entre l'ouverture de l'évaluation et le ramassage.
//
// ÉQUITÉ (brief §6 bis) : les 15 références sont rangées par groupe de popularité (3 · 5 · 7) ; les sorties tirées sont attribuées groupe par groupe, donc le groupe A du classement
// ABC est toujours celui des trois premières références, le B celui des cinq suivantes, le C celui des sept dernières. Les trois palettes « propres » du camion portent une référence de
// chaque groupe : leurs classes (A, B, C) sont toujours trois classes différentes. Chaque jeu a une anomalie « visible » (cartons écrasés, ou couche incomplète MAIS conforme au bon : le piège
// « tout refuser ») et une anomalie « au bon » (cartons manquants, ou étiquette d'une autre référence). L'inventaire tire une cause : la caisse reposée à côté, ou la sortie non saisie.

import { tirerJeu, hasard, graineDeBase } from '../core/tirage.js';
import { REFS, parRef } from './stellantis.js';
import { classer, ecartsEquite, sortiesDecroissantes, REPARTITION } from './stellantis-abc.js';
import { resultatDepot } from '../core/types/export-tableur.js';
import { GAMMES, STOCK, LIBRES, HORS_SERVICE, REGLES, PLAN as PLAN_134 } from './stellantis-ent134-donnees.js';

export const ID = 'stellantis-evaluation-rentree';
export const ID_VOLET = 'abc-5';
export const ID_QUAI = 'st-quai-135';
export const ID_PLAN = 'st-ent135-rangement';
export const ID_INV = 'INV-0924';
export const ID_EXPORT = 'sorties39';
export const ID_DEPOT = 'abc39';
export const FICHIER = 'stellantis-sorties-semaine39.xlsx';
export const COLONNES = ['Référence', 'Désignation', 'Famille', 'Emplacement', 'Sorties'];
export const N = 15;
export const REFS15 = REFS.slice(0, N);
export const GROUPE_A = REFS15.slice(0, 3).map((r) => r.ref);
export const GROUPE_B = REFS15.slice(3, 8).map((r) => r.ref);
export const GROUPE_C = REFS15.slice(8).map((r) => r.ref);

// ─────────────────────────────────────────────────────────────── le tirage
const cartonDe = (ref) => { const p = parRef[ref].prix; return p < 1 ? 500 : p < 5 ? 100 : 20; };
const dessus = (W, D, L) => { const c = []; for (let i = 0; i < W; i++) for (let j = 0; j < D; j++) c.push(`${i},${j},${L - 1}`); return c; };
const arriere = (W, L) => { const c = []; for (let i = 0; i < W; i++) for (let k = 0; k < L - 1; k++) c.push(`${i},0,${k}`); return c; };

function tirer(h) {
  // Les sorties : décroissantes, attribuées groupe par groupe.
  const V = sortiesDecroissantes(h, N);
  const ordre = [...h.melanger(GROUPE_A), ...h.melanger(GROUPE_B), ...h.melanger(GROUPE_C)];
  const sorties = {};
  ordre.forEach((ref, i) => { sorties[ref] = V[i]; });
  // Le camion : trois palettes propres (une référence de chaque groupe), une anomalie visible, une anomalie « au bon ».
  const refA = h.choisir(GROUPE_A), refB = h.choisir(GROUPE_B), refC = h.choisir(GROUPE_C);
  const reste = REFS15.map((r) => r.ref).filter((r) => ![refA, refB, refC].includes(r));
  const [refVisible, refAuBon, voisin] = h.prendre(reste, 3);
  const visible = h.choisir(['avarie', 'couche']), auBon = h.choisir(['manquant', 'produit']);
  const roles = h.melanger([
    { role: 'propre', ref: refA }, { role: 'propre', ref: refB }, { role: 'propre', ref: refC },
    { role: visible, ref: refVisible }, { role: auBon, ref: refAuBon },
  ]);
  const palettes = roles.map(({ role, ref }, n) => {
    const W = h.entier(3, 4), D = h.entier(2, 3), L = 3, plein = W * D * L;
    let manque = [], avarie = {}, bl = plein, etiq = { ref, nom: parRef[ref].designation.toUpperCase() };
    let attendu = 'accepter', motifAttendu = 'aucun';
    if (role === 'avarie') { h.prendre(arriere(W, L), h.entier(2, 3)).forEach((c) => { avarie[c] = [0, -1]; }); attendu = 'reserves'; motifAttendu = 'avarie'; }
    if (role === 'couche') { manque = h.prendre(dessus(W, D, L), h.entier(2, W * D - 2)); bl = plein - manque.length; }
    if (role === 'manquant') { manque = h.prendre(dessus(W, D, L), h.entier(2, 4)); attendu = 'reserves'; motifAttendu = 'manquant'; }
    if (role === 'produit') { etiq = { ref: voisin, nom: parRef[voisin].designation.toUpperCase() }; attendu = 'refuser'; motifAttendu = 'produit'; }
    return {
      id: `P${n + 1}`, ref, nom: parRef[ref].designation, bl, W, D, L, manque, avarie, attendu, motifAttendu, role,
      etiq: Object.assign(etiq, { poids: `${cartonDe(etiq.ref)} pièces par carton`, lot: `FRN-0924-${n + 1}` }),
    };
  });
  // L'inventaire : une ligne libre ; la cause est tirée.
  const refInv = h.choisir(REFS15.map((r) => r.ref));
  const systeme = h.entier(24, 60), ecart = h.entier(1, 3);
  const cause = h.choisir(['rayon', 'regul']);
  return { sorties, palettes, bl: `FRN-24-${h.entier(1000, 1999)}`, visible, auBon, voisin,
    inventaire: { ref: refInv, systeme, compte: systeme - ecart, ecart, cause } };
}

const classeDe = (jeu) => classer(REFS15.map((r) => ({ ref: r.ref, v: jeu.sorties[r.ref] })));

// Les contraintes d'équité, en clair. Liste vide = jeu conforme (sinon il est retiré).
export function verifier(jeu) {
  const f = [];
  const L = REFS15.map((r) => ({ ref: r.ref, v: jeu.sorties[r.ref] }));
  ecartsEquite(L, REPARTITION[N]).forEach((e) => f.push(`sorties : ${e}`));
  const K = classeDe(jeu);
  const P = jeu.palettes;
  if (P.length !== 5 || P.map((p) => p.id).join() !== 'P1,P2,P3,P4,P5') f.push('palettes mal numérotées');
  const propres = P.filter((p) => p.role === 'propre');
  if (propres.length !== 3) f.push('il faut trois palettes propres');
  if (propres.map((p) => K.classe[p.ref]).sort().join('') !== 'ABC') f.push('les palettes propres ne sont pas de trois classes différentes');
  if (new Set(P.map((p) => p.ref)).size !== 5) f.push('deux palettes de la même référence');
  if (P.some((p) => p.etiq.ref !== p.ref && p.role !== 'produit')) f.push('étiquette autre sur une palette qui n\'est pas « produit »');
  const produit = P.find((p) => p.role === 'produit');
  if (produit && P.some((p) => p.ref === produit.etiq.ref)) f.push('l\'étiquette est celle d\'une autre palette du camion');
  // visible « avarie » + « au bon » = 2 palettes à réserver ; visible « couche » (conforme) + « au bon » = 1.
  if (P.filter((p) => p.attendu !== 'accepter').length !== (jeu.visible === 'avarie' ? 2 : 1)) f.push('nombre de palettes à réserver incohérent');
  P.forEach((p) => {
    const plein = p.W * p.D * p.L, reel = plein - p.manque.length, av = Object.keys(p.avarie);
    const top = new Set(dessus(p.W, p.D, p.L)), dos = new Set(arriere(p.W, p.L));
    if (p.manque.some((c) => !top.has(c))) f.push(`${p.id} : manquant hors de la couche du dessus`);
    if (av.some((c) => !dos.has(c))) f.push(`${p.id} : carton écrasé hors de la face arrière`);
    if (p.role === 'couche' && !(p.manque.length >= 2 && p.bl === reel && !av.length)) f.push(`${p.id} : couche incomplète mal formée`);
    if (p.role === 'manquant' && !(p.manque.length >= 2 && p.bl === plein)) f.push(`${p.id} : manquants mal formés`);
    if (p.role === 'avarie' && !(av.length >= 2 && !p.manque.length && p.bl === plein)) f.push(`${p.id} : écrasés mal formés`);
    if ((p.role === 'propre' || p.role === 'produit') && (p.manque.length || av.length || p.bl !== plein)) f.push(`${p.id} : palette propre mal formée`);
  });
  const I = jeu.inventaire;
  if (!(I.compte >= 20 && I.compte < I.systeme && I.systeme - I.compte <= 3)) f.push('inventaire : écart hors règle');
  return f;
}
const DECL = { tirer, verifier, essais: 60 };
DECL.secours = tirerJeu({ ...DECL, secours: null }, 'secours-stellantis-ent135').jeu;
export const DECL_JEU = DECL;

const cache = new Map();
// Le jeu d'une graine (l'identifiant de l'élève), toujours le même pour la même graine.
export function jeuDe(graine) {
  const g = String(graine == null ? '' : graine);
  if (!cache.has(g)) cache.set(g, tirerJeu(DECL_JEU, `${g}|${ID}`).jeu);
  return cache.get(g);
}
export const jeuDeBase = (db) => jeuDe(graineDeBase(db));

// ─────────────────────────────────────────────────────────────── le camion (le quai)
export const QUAI_AVERTISSEMENT = 'Réels : l’usine Stellantis de Sochaux, ses fournisseurs par camion, la réception des pièces. Le quai est un <b>dessin construit</b> : ce n’est pas un quai de l’usine. '
  + 'Le camion, son bon de livraison, ses palettes et leurs défauts sont <b>construits pour l’exercice</b>.';
export function quaiDe(graine) {
  const jeu = jeuDe(graine);
  return {
    id: ID_QUAI, rendu: 'iso', froid: false,
    titre: 'Usine de Sochaux — Quai 4, camion de petites pièces',
    destinataire: 'Usine Stellantis de Sochaux, magasin des petites pièces',
    avertissement: QUAI_AVERTISSEMENT,
    lieu: { nom: 'Quai 4', temp: 15, refrigere: false },
    zone: { nom: 'Zone de réception' },
    document: { nom: 'Bon de livraison', court: 'BL' },
    motifs: ['avarie', 'manquant', 'produit'],
    recommencer: false,
    rendCopie: false,                  // la clôture du quai ne rend pas la copie : il reste le classement, le rangement et l'inventaire
    dechargement: { ouverture: 0.5, parPalette: 1, par: 'cariste' },
    aides: {},
    calcul: { forme: 'brouillon' },
    camions: [{
      transporteur: 'Transporteur de petites pièces (construit)', fournisseur: 'Fournisseur de visserie et de clips (construit)', fictif: true, bl: jeu.bl, arrivee: '06:00',
      parole: 'Bonjour ! Les petites pièces pour le magasin. Voilà le bon de livraison.',
      palettes: JSON.parse(JSON.stringify(jeu.palettes)),
    }],
  };
}
// Ce que le quai attend à l'écran pour une palette : le nombre à écrire dans la réserve (écrasés, manquants, ou la référence lue sur l'étiquette).
export const reserveAttendue = (p) => (p.motifAttendu === 'avarie' ? String(Object.keys(p.avarie).length)
  : p.motifAttendu === 'manquant' ? String(p.manque.length) : p.motifAttendu === 'produit' ? p.etiq.ref : null);
const etatQuai = (db) => (db && db.quais && db.quais[ID_QUAI]) || null;
export const quaiEcrit = (db) => !!(etatQuai(db) && etatQuai(db).ecrit);
export const quaiSigne = (db) => !!(etatQuai(db) && etatQuai(db).signe);

// ─────────────────────────────────────────────────────────────── le plan du magasin (rangement) : les trois palettes propres
// Plan, stock et poids repris d'ENT-13.4 (même magasin). Les trois palettes rangées sont celles qui ne posent pas de litige ; leur classe de rotation (A, B, C) est sur la fiche :
// le jalon porte sur le RANGEMENT seul (repli du brief §7.2 : « le logiciel a recalculé la classe »). Identifiants R1 à R3 (jamais P1 à P3 : ceux du camion).
export const ZONES_ROTATION = {
  A: { lib: 'rapide', travees: [1], niveaux: [1, 2], texte: 'T01, niveau N1 ou N2' },
  B: { lib: 'moyenne', travees: [2], niveaux: [1, 2, 3], texte: 'T02' },
  C: { lib: 'lente', travees: [3, 4], niveaux: [1, 2, 3], texte: 'T03 ou T04' },
};
const COTES = ['A1', 'A2', 'B1', 'B2'];
const KG = { A: 220, B: 260, C: 180 };
export function planDe(graine) {
  const jeu = jeuDe(graine);
  const K = classeDe(jeu);
  const propres = jeu.palettes.filter((p) => p.role === 'propre').sort((a, b) => K.classe[a.ref].localeCompare(K.classe[b.ref]));
  const produits = { ...PLAN_134.produits };   // les produits du stock de départ (ceux d'ENT-13.4)
  const palettes = propres.map((p, i) => {
    const c = K.classe[p.ref];
    produits[`R${i + 1}`] = { nom: p.nom, ref: p.ref, gamme: 'PET' };
    return { id: `R${i + 1}`, nom: p.nom, produit: `R${i + 1}`, kg: KG[c], rotation: c };
  });
  return {
    id: ID_PLAN, libelle: 'Plan du magasin', mode: 'rangement',
    personnage: { nom: 'Karim', role: 'chef d’équipe logistique', date: 'vendredi 24 sept., 6 h',
      texte: { evaluation: 'Les palettes sans litige sont à ranger dans le magasin des petites pièces. La classe de rotation de chacune est sur sa fiche.' } },
    plan: {
      allees: [{ id: 'A', cotes: ['A1', 'A2'] }, { id: 'B', cotes: ['B1', 'B2'] }],
      cotes: Object.fromEntries(COTES.map((c) => [c, { gammes: [], charge: { 1: 3000, 2: 1000, 3: 800 } }])),
      travees: 4, niveaux: 3, emplacements: 3, horsService: HORS_SERVICE,
      zones: { bureau: 'chef d’équipe', quais: ['QUAI 1', 'QUAI 2'] },
      rotation: ZONES_ROTATION,
    },
    gammes: GAMMES, produits, stock: STOCK, palettes,
    criteres: [{ type: 'etat' }, { type: 'rotation' }, { type: 'charge' }],
    regles: REGLES,
  };
}
export { LIBRES, HORS_SERVICE, STOCK };
// Le rangement juste d'un jeu : { R1, R2, R3 } → un emplacement libre de la zone de sa classe (écrit à la main : travée 1, 2, 3 ; voir les tests).
export const RANGEMENT_JUSTE = { R1: 'A1-T01-N1-E3', R2: 'A1-T02-N1-E2', R3: 'A1-T03-N1-E3' };

// ─────────────────────────────────────────────────────────────── le classement ABC (les sorties de la semaine 39)
export const sortiesDe = (db) => { const j = jeuDeBase(db); return REFS15.map((r) => ({ ...r, v: j.sorties[r.ref] })); };
export const calcul = (db) => classer(sortiesDe(db).map((x) => ({ ref: x.ref, v: x.v })));
export const lignesExport = (db) => sortiesDe(db).slice().sort((a, b) => (a.emplacement < b.emplacement ? -1 : a.emplacement > b.emplacement ? 1 : 0))
  .map((r) => [r.ref, r.designation, r.famille, r.emplacement, r.v]);
// Les A de l'élève : leur nombre et leur part des sorties (la question « tes A »).
export function lesA(db) {
  const K = calcul(db);
  const A = K.ordre.filter((r) => K.classe[r] === 'A');
  return { n: A.length, part: A.reduce((s, r) => s + K.part[r], 0), refs: A, total: K.ordre.length, cumulB: K.cumul[K.ordre[7]] };
}
export const AIDE = 'SOMME(plage) — SI(test ; si vrai ; si faux) — un pourcentage se met au format « % » (la cellule affiche 32 %, elle vaut 0,32). Une formule commence par = .';

export function controles(db, propres = null) {
  const K = calcul(db);
  const L = (propres || []).filter((l) => l['Référence'] != null && String(l['Référence']).trim() !== '');
  const T = propres ? L.reduce((s, l) => s + (Number(l['Sorties']) || 0), 0) : K.total;
  const cl = classer(L.map((l) => ({ ref: l['Référence'], v: Number(l['Sorties']) })));
  const filtre = (l) => l['Référence'] != null && String(l['Référence']).trim() !== '';
  const cle = ['Référence'];
  return [
    { type: 'table', id: 'total', libelle: 'Total des sorties (fonction SOMME, ligne « Total »)', feuille: 'Sorties',
      cle: 'Désignation', colonne: 'Sorties', attendu: { Total: T }, fonctions: ['SUM'] },
    { type: 'colonne', id: 'part', libelle: 'Colonne « Part » (au format pourcentage, sans ×100)', feuille: 'Sorties', titre: 'Part', cle, filtre,
      attendu: (l) => Number(l['Sorties']) / T, formule: true },
    { type: 'colonne', id: 'cumul', libelle: 'Colonne « Cumul » (liste triée par sorties décroissantes)', feuille: 'Sorties', titre: 'Cumul', cle, filtre,
      attendu: (l) => cl.cumul[l['Référence']], formule: true },
    { type: 'colonne', id: 'classe', libelle: 'Colonne « Classe » (fonction SI)', feuille: 'Sorties', titre: 'Classe', cle, filtre,
      attendu: (l) => cl.classe[l['Référence']], fonctions: ['IF'] },
  ];
}
export const TABLEUR = {
  aide: AIDE,
  exports: [{
    id: ID_EXPORT, liste: 'Sorties de la semaine 39', fichier: FICHIER, indications: 4,
    feuilles: [{ nom: 'Sorties', colonnes: COLONNES, lignes: lignesExport }],
  }],
  depot: { id: ID_DEPOT, export: ID_EXPORT, libelle: 'Déposer mon fichier', controles },
};
const resultat = (db) => resultatDepot(db, ID_DEPOT);
export const depose = (db) => !!resultat(db).depose;
export const juste = (db, id) => { const c = resultat(db).controles[id]; return !!(c && c.ok); };

// ─────────────────────────────────────────────────────────────── l'inventaire : une ligne libre, une cause tirée
export const MOTIFS = ['Casse', 'Sortie non saisie', 'Erreur de réception', 'Démarque inconnue'];
export const inventaireDe = (graine) => {
  const I = jeuDe(graine).inventaire;
  const r = parRef[I.ref];
  return {
    id: ID_INV, libelle: 'Inventaire', titre: 'Inventaire tournant — une référence', sousTitre: 'vendredi 24 septembre · 1 ligne',
    source: 'releve', ecarts: 'eleve', correction: 'aucune', taux: false,
    actions: ['regul', 'rayon'], libelles: { regul: 'Régulariser le stock du logiciel', rayon: 'Remettre en place' },
    motifs: MOTIFS,
    conseil: '<b>Avant de corriger.</b> Un écart est un signal : cherche d’abord <b>pourquoi</b>. On ne corrige le stock que si la pièce a vraiment disparu.',
    lignes: [{ cle: I.ref, ref: I.ref, emplacement: r.emplacement, designation: r.designation, systeme: I.systeme, compte: I.compte,
      attendu: I.cause, ...(I.cause === 'regul' ? { motif: 'Sortie non saisie' } : {}),
      explication: I.cause === 'rayon' ? 'Une caisse de pièces a été reposée à côté de son emplacement : on la remet en place, on ne touche pas au stock.'
        : 'Des pièces sont parties à la ligne sans être scannées : elles sont vraiment sorties, on régularise, motif « Sortie non saisie ».' }],
  };
};
export const causeDe = (db) => jeuDeBase(db).inventaire;

// ─────────────────────────────────────────────────────────────── les textes de loi des documents et des questions
// L133-3 : recopié de `contenus/stellantis-ent132.js` (relu sur Légifrance le 17/10/2026 pour ENT-8.8 et 8.10 ; Légifrance n'a pas pu être rejoint le 26/10/2026).
export const TEXTE_L133_3 = 'La réception des objets transportés éteint toute action contre le voiturier pour avarie ou perte partielle si dans les trois '
  + 'jours, non compris les jours fériés, qui suivent celui de cette réception, le destinataire n’a pas notifié au voiturier, par acte extrajudiciaire '
  + 'ou par lettre recommandée, sa protestation motivée.';
// L123-12 (alinéa 2) : recopié de `contenus/stellantis-ent134.js` (relu pour les séances France Boissons le 13/10/2026).
export const TEXTE_L123_12 = 'Elle doit contrôler par inventaire, au moins une fois tous les douze mois, l’existence et la valeur des éléments actifs et passifs du patrimoine de l’entreprise.';
