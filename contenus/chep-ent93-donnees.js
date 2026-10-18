// ENT-9.3 — CHEP, « le relevé contesté » : les DONNÉES PURES de la séance (les documents de la semaine, le tirage, les attendus, la
// grille du relevé corrigé). À part de `contenus/chep-ent93.js` parce que ce fichier-ci se charge aussi hors navigateur (corrigé, tests) :
// rien ici n'importe le moteur (sauf `core/tirage.js`, module pur). Brief : `docs/briefs/ENT-9.3-chep-releve-conteste.md` §6 et §6 bis ;
// règles de calcul : `docs/briefs/COORDINATION-chep.md` §4.
//
// Lundi 25/01/2027. Hélène Caron (Endives du Ternois) conteste le relevé de son compte au vendredi 22/01 : il dit S_rel palettes CHEP,
// son inventaire en compte S_parc (moins). Ce qui explique l'écart, document par document :
//   A1 (FIXE, l'erreur induite) : le bon de retour du mardi 19/01, crédité 75 (Grégory a validé « 5 piles × 15 = 75 » sans compter) ; le
//      rapport de la ligne de tri du mercredi 20/01 trouve 75 − k palettes CHEP et k palettes LPR : le crédit était trop haut, on AJOUTE k
//      au solde ; c'est CHEP qui corrige ;
//   A2 ou A3 (banque `client`, une pièce tirée) : A2 = le bordereau du jeudi 21/01 vers Frais du Nord, transfert de T2 palettes ABSENT du
//      relevé (on RETIRE T2) ; A3 = le bordereau du mercredi 20/01 vers Halles d'Artois, déclaré d au lieu de r = d + x (on RETIRE x) ;
//      c'est Endives du Ternois qui corrige, sur le portail ;
//   A4 (FIXE) : son inventaire compte aussi e palettes Europe (bois brut) : rien à corriger sur le compte, l'écart restant vaut e ;
//   deux bordereaux justes (b1, b2), pour que tout ne soit pas faux.
// Un CONFIRMÉ reçoit l'autre pièce de la banque en plus (les deux anomalies client) : la seconde est jugée en bonus.
// Tout ce qui est attendu est CALCULÉ ici, jamais écrit en dur : S_corrige = S_rel + k − (T2 et / ou x), S_parc = S_corrige + e.

import { declarerTirage, hasard, niveauEleve } from '../core/tirage.js';
import { EMETTEURS, DISTRIBUTEURS, solde, date } from './chep.js';

export const ID = 'chep-releve-conteste';
export const ID_VOLET = 'chep-ent93';
// Lundi 25 janvier 2027, 8 h 30.
export const SCENARIO = { date: '2027-01-25', heure: '08:30' };
export const CLIENT = EMETTEURS.ternois;
// La semaine du relevé contesté : du lundi 18 au vendredi 22/01/2027 ; le relevé part du solde au vendredi 15/01.
export const SEMAINE = { avant: '2027-01-15', debut: '2027-01-18', fin: '2027-01-22' };
export const INVENTAIRE_ISO = '2027-01-25';
export const CREDITE = 75;      // le retour crédité par Grégory : 5 piles de 15
export const PILES = 5, PAR_PILE = 15;

// Les écrans (ids JAMAIS modifiés : écrits dans la base de l'élève).
export const FICHES = { enquete: 'enquete', corrige: 'corrige' };
export const BLOC_GRILLE = 'releve';           // le bloc grille du relevé corrigé
export const PHRASES_ID = 'reponse-helene-2';  // la réponse par phrases
// Les cadres de l'enquête, par RÔLE (stables d'un élève à l'autre : les gestes sont publiés sur base vide). `a2` et `a3` : les deux pièces de
// la banque (un standard en a une, un confirmé les deux).
export const ROLES = ['retour', 'b1', 'b2', 'a2', 'a3'];
export const champ = (quoi, role) => `${quoi}-${role}`;   // 'type-retour', 'corr-a3', 'qte-b1', 'qui-a2'

// ─────────────────────────────────────────────────────────────── les choix des listes (valeurs JAMAIS modifiées)
export const TYPES = [
  { v: 'juste', lib: 'enregistré et juste' },
  { v: 'absent', lib: 'absent : transfert non déclaré' },
  { v: 'quantite', lib: 'enregistré avec une quantité fausse' },
  { v: 'credit', lib: 'mal crédité au retour' },
];
export const CORRECTIONS = [
  { v: 'aucune', lib: 'aucune' },
  { v: 'ajouter', lib: 'ajouter' },
  { v: 'retirer', lib: 'retirer' },
];
export const QUI = [
  { v: 'personne', lib: 'personne' },
  { v: 'ternois', lib: 'Endives du Ternois (sur le portail)' },
  { v: 'chep', lib: 'CHEP (service clients)' },
];
export const libDe = (L, v) => (L.find((x) => x.v === v) || {}).lib || '';

// ─────────────────────────────────────────────────────────────── la banque (JAMAIS de pièce supprimée ni renumérotée)
// `client` : le document de la cliente qui explique l'écart (même difficulté : le piège est de « donner raison » au relevé).
export const BANQUE_CLIENT = [
  { id: 'a2-frais-nord', difficulte: 'moyen', role: 'a2', iso: '2027-01-21', a: 'frais-nord', titre: 'Jeudi 21/01, vers Frais du Nord : un transfert absent du relevé' },
  { id: 'a3-halles-artois', difficulte: 'moyen', role: 'a3', iso: '2027-01-20', a: 'halles-artois', titre: 'Mercredi 20/01, vers Halles d’Artois : une quantité déclarée fausse' },
];
const PIECE = Object.fromEntries(BANQUE_CLIENT.map((p) => [p.id, p]));
export const pieceDuRole = (role) => BANQUE_CLIENT.find((p) => p.role === role) || null;

// Les documents fixes (construits, les mêmes pour tous : ce sont les quantités qui changent).
export const NUMEROS = { emission: 'EM-27-01207', retour: 'RET-27-00512', tri: 'TRI-27-0193', b1: 'BL-ET-27-0335', a3: 'BL-ET-27-0338',
  a2: 'BL-ET-27-0341', b2: 'BL-ET-27-0344' };
export const JUSTES = {
  b1: { iso: '2027-01-18', a: 'hainaut-primeurs' },
  b2: { iso: '2027-01-22', a: 'marchelys' },
};
export const DATES = { emission: '2027-01-18', retour: '2027-01-19', tri: '2027-01-20' };

// ─────────────────────────────────────────────────────────────── l'ordre des bordereaux d'Hélène
// Ses trois bordereaux du socle (b1, b2 et sa pièce) dans un ordre tiré par élève ; la pièce en plus du confirmé vient en dernier. Nos
// documents (relevé, bon de retour, rapport de tri) gardent un ordre fixe.
function permutations(L) {
  if (L.length <= 1) return [L];
  return L.flatMap((x, i) => permutations([...L.slice(0, i), ...L.slice(i + 1)]).map((p) => [x, ...p]));
}
export const PERMUTATIONS = permutations(['b1', 'b2', 'client']);
// L'ordre des deux témoins : Bordereau 1 = b1, Bordereau 2 = sa pièce, Bordereau 3 = b2.
export const ORDRE_TEMOIN = PERMUTATIONS.findIndex((p) => p.join() === 'b1,client,b2');

// ─────────────────────────────────────────────────────────────── les valeurs tirées
// DEFAUT = l'élève « témoin ① » du brief (A3) : S_rel 280, k 3, d 12, x 14 (r 26), e 4 → S_corrige 269, S_parc 273.
export const DEFAUT = { sRel: 280, k: 3, e: 4, rep: 6, t2: 23, d: 12, x: 14, b1: 19, b2: 21, em: 160, f: 125, ordre: ORDRE_TEMOIN };
const valeursTirees = (h) => ({
  sRel: 240 + 5 * h.entier(0, 12),     // 240 à 300, pas de 5
  k: h.entier(2, 4),                   // les palettes LPR trouvées au tri
  e: h.entier(3, 5),                   // les palettes Europe de son inventaire
  rep: h.entier(6, 8),                 // les palettes CHEP à réparer (rapport de tri)
  t2: h.entier(22, 26),                // A2 : le transfert absent
  d: h.entier(10, 14),                 // A3 : déclaré
  x: h.entier(12, 16),                 // A3 : l'écart (le bordereau dit d + x)
  b1: h.entier(18, 26),                // les deux bordereaux justes
  b2: h.entier(18, 26),
  em: 120 + 20 * h.entier(0, 4),       // l'émission du lundi 18/01, dans notre relevé : 120 à 200, pas de 20
  f: h.entier(110, 140),               // Frais du Nord : les palettes vides qui encombrent son quai
  ordre: h.entier(0, PERMUTATIONS.length - 1),
});

// Les lignes de marchandise d'un bordereau d'endives (colis de 5 kg, fait vérifié : DRAAF) : calculées sur le nombre de palettes.
const lignesEndives = (n) => {
  const total = n * 80;   // construit : 80 colis de 5 kg par palette (comme ENT-9.1)
  const a = Math.round(total * 0.6);
  return [{ designation: 'Endives de pleine terre, cat. I, colis de 5 kg', colis: a, poids: a * 5 },
    { designation: 'Endives rouges (carmine), cat. I, colis de 5 kg', colis: total - a, poids: (total - a) * 5 }];
};
const AUCUNE = { type: 'juste', corr: 'aucune', qte: 0, qui: 'personne' };

// ─────────────────────────────────────────────────────────────── le jeu d'un élève
// Un bordereau : { role, piece, numero, iso, a, qte (palettes CHEP du bordereau), declare (ce que dit notre relevé, ou null : absent),
// lignes, attendu: { type, corr, qte, qui } }.
function bordereau(role, V) {
  if (role === 'b1' || role === 'b2') {
    const n = V[role];
    return { role, piece: role, numero: NUMEROS[role], iso: JUSTES[role].iso, a: JUSTES[role].a, qte: n, declare: n, lignes: lignesEndives(n), attendu: AUCUNE };
  }
  if (role === 'a2') {
    const p = pieceDuRole('a2');
    return { role, piece: p.id, numero: NUMEROS.a2, iso: p.iso, a: p.a, qte: V.t2, declare: null, lignes: lignesEndives(V.t2),
      attendu: { type: 'absent', corr: 'retirer', qte: V.t2, qui: 'ternois' } };
  }
  const p = pieceDuRole('a3'), r = V.d + V.x;
  return { role, piece: p.id, numero: NUMEROS.a3, iso: p.iso, a: p.a, qte: r, declare: V.d, lignes: lignesEndives(r),
    attendu: { type: 'quantite', corr: 'retirer', qte: V.x, qui: 'ternois' } };
}

// Le jeu complet d'un tirage (ids des pièces + valeurs) : les cadres de l'enquête dans l'ordre de l'élève (le bon de retour d'abord, puis
// ses bordereaux 1, 2, 3 et, pour un confirmé, 4), les mouvements de notre relevé, les soldes.
export function jeuDe({ client = 'a3-halles-artois', bonus = [], valeurs = DEFAUT } = {}) {
  const V = { ...DEFAUT, ...(valeurs || {}) };
  const pc = PIECE[client] || BANQUE_CLIENT[1];
  const pb = bonus.map((id) => PIECE[id]).filter((p) => p && p.id !== pc.id);
  const perm = PERMUTATIONS[Math.min(Math.max(0, V.ordre | 0), PERMUTATIONS.length - 1)];
  const roles = [...perm.map((r) => (r === 'client' ? pc.role : r)), ...pb.map((p) => p.role)];
  const bordereaux = roles.map((r, i) => ({ ...bordereau(r, V), rang: i + 1, docId: `bl-${i + 1}`, bonus: i >= 3 }));
  const retour = { role: 'retour', piece: 'retour', numero: NUMEROS.retour, iso: DATES.retour, credite: CREDITE, chep: CREDITE - V.k, lpr: V.k,
    reparer: V.rep, attendu: { type: 'credit', corr: 'ajouter', qte: V.k, qui: 'chep' } };
  const cadres = [retour, ...bordereaux];
  const parRole = Object.fromEntries(cadres.map((c) => [c.role, c]));
  // Notre relevé : l'émission, les transferts DÉCLARÉS (dans l'ordre des dates), le retour crédité 75.
  const declares = bordereaux.filter((b) => b.declare != null).slice().sort((a, b) => a.iso.localeCompare(b.iso) || a.numero.localeCompare(b.numero));
  const mouvements = [
    { iso: DATES.emission, genre: 'emission', numero: NUMEROS.emission, entree: V.em },
    ...declares.map((b) => ({ iso: b.iso, genre: 'transfert', numero: b.numero, a: b.a, sortie: b.declare })),
    { iso: DATES.retour, genre: 'retour', numero: NUMEROS.retour, sortie: CREDITE },
  ].sort((a, b) => a.iso.localeCompare(b.iso));
  // Le solde au 15/01, calculé À REBOURS depuis S_rel (la séance ne lit pas la base d'ENT-9.1).
  const sAvant = solde({ depart: V.sRel, emissions: declares.map((b) => b.declare).concat(CREDITE), transferts: V.em });
  const anomalies = bordereaux.filter((b) => b.attendu.corr === 'retirer');
  const sCorrige = solde({ depart: V.sRel, corrections: [V.k, ...anomalies.map((b) => -b.attendu.qte)] });
  return {
    valeurs: V, piece: pc.id, role: pc.role, bonus: pb.map((p) => p.id), rolesBonus: pb.map((p) => p.role),
    retour, bordereaux, cadres, parRole, mouvements, declares,
    sAvant, sRel: V.sRel, sCorrige, sParc: sCorrige + V.e, ecart: V.e,
  };
}

// Le contrôle d'équité (brief §6, §8) sur un jeu : la liste des écarts en clair (vide = conforme).
// Retenu : aucune égalité entre les nombres que l'élève lit, écrit ou compare — k, e, les palettes à réparer, T2, d, x, r, B1, B2, 75, l'émission
// et F — TOUS tirés pour tout le monde (un standard A2 ne voit ni d, ni x : on les contrôle quand même, sinon l'exigence dépendrait de la pièce
// et le tirage pencherait vers l'une des deux). S_rel > S_parc (la cliente se plaint de payer trop) ; le solde au 15/01 reste positif.
export function ecartsEquite(J) {
  const E = [];
  const V = J.valeurs;
  if (!(J.sRel > J.sParc)) E.push(`S_rel ${J.sRel} ≤ S_parc ${J.sParc}`);
  if (J.sAvant < 100) E.push(`solde au 15/01 ${J.sAvant} < 100`);
  const q = [V.k, V.e, V.rep, V.t2, V.d, V.x, V.d + V.x, V.b1, V.b2, CREDITE, V.em, V.f];
  if (new Set(q).size !== q.length) E.push(`deux quantités égales : ${q.join(', ')}`);
  if (J.bordereaux.slice(0, 3).filter((b) => b.attendu.corr === 'retirer').length !== 1) E.push('le socle n’a pas une seule anomalie client');
  return E;
}

// Le tirage mémorisé (core/tirage.js) : ses jeux sont contrôlés par `ecartsEquite`.
const jeuDuTirage = (jeu) => jeuDe({ client: jeu.pieces.client[0].id, bonus: ((jeu.bonus && jeu.bonus.client) || []).map((p) => p.id), valeurs: jeu.valeurs });
export const TIRAGE = declarerTirage({
  banques: {
    client: { pieces: BANQUE_CLIENT, melange: { moyen: 1 }, bonus: { confirme: { moyen: 1 } } },
  },
  valeurs: valeursTirees,
  verifier: (jeu) => ecartsEquite(jeuDuTirage(jeu)),
});
TIRAGE.lier(ID);

// Le jeu de l'élève, lu dans sa base. SANS tirage (seulement la base vide du contrôle au chargement : le moteur tire pour chacun, élève et
// enseignant, avant le premier dessin) : le témoin ① AVEC l'autre pièce en plus, pour que la fiche dessinée sur base vide montre les deux
// cadres client et que leurs gestes (`fiche:enquete:qui-a2`, `qui-a3`) soient publiés.
export function jeuEleve(db) {
  const rec = TIRAGE.tirage(db);
  if (!rec) return jeuDe({ client: 'a3-halles-artois', bonus: ['a2-frais-nord'] });
  const p = TIRAGE.piecesTirees(db, 'client')[0];
  return jeuDe({ client: p && p.id, bonus: TIRAGE.piecesBonus(db, 'client').map((x) => x.id), valeurs: TIRAGE.valeursTirees(db) });
}
// L'ordre des choix d'une liste, tiré par élève (rien n'est rangé : recalculé de la graine).
export const graineDe = (db) => (db && db.tirages && db.tirages[ID] && db.tirages[ID].graine) || '';
export const melangeDe = (db, quoi, L) => { const g = graineDe(db); return g ? hasard(`${g}|${quoi}`).melanger(L) : L; };
export const accompagne = (db) => niveauEleve(db) === 'accompagne';

// ─────────────────────────────────────────────────────────────── les fiches de l'élève
// Une saisie de nombre, telle que tapée → un nombre ou NaN. Même lecture que `lireNombre` de la fiche (test du bloc `chep-93`).
export function lireNombre(s) {
  const t = String(s == null ? '' : s).replace(/[\s  ]/g, '').replace(',', '.');
  return /^-?\d+(\.\d+)?$/.test(t) ? Number(t) : NaN;
}
// Une fiche de l'élève : `{ envoye, deja, v }` (v = ses valeurs, même pas encore envoyées ; `deja` = envoyée au moins une fois, même
// rouverte par « Corriger »).
export function fiche(db, id) {
  const f = db && db.fiches && db.fiches[id];
  return { envoye: !!(f && f.envoye), deja: !!(f && (f.envoye || f.envois)), v: (f && f.valeurs) || {} };
}
export const dejaEnvoyee = (id) => (db) => fiche(db, id).deja;

// Ce que l'élève a écrit pour un document (par rôle) : { type, corr, qte (nombre ou NaN), qui }, tel quel, sans corriger.
export function enquete(v, role) {
  return { type: v[champ('type', role)] || null, corr: v[champ('corr', role)] || null, qte: lireNombre(v[champ('qte', role)]),
    qui: v[champ('qui', role)] || null };
}
// Ses corrections, d'après SON enquête (ordre des cadres) : un document dont la correction est « ajouter » ou « retirer » = une ligne du
// relevé corrigé. Une erreur de repérage ne se paie qu'une fois : la grille lit ces lignes.
export function correctionsEleve(db) {
  const J = jeuEleve(db), { v } = fiche(db, FICHES.enquete);
  return J.cadres.map((c) => ({ c, e: enquete(v, c.role) }))
    .filter((x) => x.e.corr === 'ajouter' || x.e.corr === 'retirer')
    .map((x) => ({ role: x.c.role, numero: x.c.numero, corr: x.e.corr, qte: x.e.qte, sens: x.e.corr === 'ajouter' ? 'plus' : 'moins' }));
}
// Le solde corrigé d'après SES corrections (S_rel + ses ajouts − ses retraits), ou null si une quantité est illisible.
export function soldeDeSesCorrections(db) {
  const L = correctionsEleve(db), J = jeuEleve(db);
  if (L.some((l) => !Number.isFinite(l.qte))) return null;
  return solde({ depart: J.sRel, corrections: L.map((l) => (l.sens === 'plus' ? l.qte : -l.qte)) });
}

// ─────────────────────────────────────────────────────────────── ② la grille du relevé corrigé (pure : lue aussi par les questions)
// Ligne 1 l'en-tête ; ligne 2 le solde du relevé (donné) ; une ligne par correction DE L'ÉLÈVE (la quantité dans la bonne colonne, 0 dans
// l'autre) ; puis le solde corrigé (formule), l'inventaire d'Hélène (donné), l'écart restant (formule). Colonne D : les soldes.
export const ligneSoldeCorrige = (n) => n + 3;
export const caseSoldeCorrige = (n) => `D${n + 3}`;
export const caseInventaire = (n) => `D${n + 4}`;
export const caseEcart = (n) => `D${n + 5}`;
export const casePlus = (i) => `B${i + 3}`;
export const caseMoins = (i) => `C${i + 3}`;
const saisie = (attendu, o = {}) => ({ saisie: true, attendu, placeholder: ' ', ...o });
export function lignesCorrige(db) {
  const J = jeuEleve(db), L = correctionsEleve(db), n = L.length;
  const refsB = L.map((_, i) => casePlus(i)), refsC = L.map((_, i) => caseMoins(i));
  // Les attendus se calculent sur LA FEUILLE DE L'ÉLÈVE (ses cases, même fausses) : une erreur ne se paie qu'une fois.
  const attenduSolde = (lire) => {
    const vals = [...refsB, ...refsC].map(lire);
    if (vals.some((x) => x == null || !Number.isFinite(x))) return null;
    return J.sRel + refsB.reduce((s, r) => s + lire(r), 0) - refsC.reduce((s, r) => s + lire(r), 0);
  };
  const attenduEcart = (lire) => { const s = lire(caseSoldeCorrige(n)); return s == null || !Number.isFinite(s) ? null : J.sParc - s; };
  return [
    { A: '', B: 'À ajouter (+)', C: 'À retirer (−)', D: 'Solde', entete: true },
    { A: `Solde du relevé au ${date(SEMAINE.fin)}`, B: '', C: '', D: J.sRel },
    ...L.map((l) => {
      const q = Number.isFinite(l.qte) ? l.qte : 0;
      return { A: `${l.numero} : ${l.corr} ${Number.isFinite(l.qte) ? l.qte : '?'}`,
        B: saisie(l.sens === 'plus' ? q : 0), C: saisie(l.sens === 'moins' ? q : 0) };
    }),
    { A: 'Solde corrigé', B: '', C: '', D: saisie(attenduSolde, { formule: true, placeholder: '=' }) },
    { A: `Inventaire d’Hélène (${date(INVENTAIRE_ISO)})`, B: '', C: '', D: J.sParc },
    { A: 'Écart restant (inventaire − solde corrigé)', B: '', C: '', D: saisie(attenduEcart, { formule: true, placeholder: '=' }) },
  ];
}
export const BLOC_CORRIGE = { type: 'grille', id: BLOC_GRILLE,
  titre: 'Une ligne par correction de ton enquête : la quantité dans la bonne colonne (0 dans l’autre), puis les deux formules',
  lignes: lignesCorrige, manque: 'des cases du relevé corrigé ({n})',
  feuille: { titre: 'Relevé corrigé', colonnes: ['A', 'B', 'C', 'D'], decimales: 0, donneesGrisees: true,
    largeurs: { A: '46%', B: '16%', C: '16%', D: '16%' } } };
// La valeur d'une case de SA feuille (une formule calculée, ou un nombre tapé), ou null. `lireFeuille` est donnée par l'appelant (ce fichier
// n'importe pas le moteur).
export function valeurDeSaFeuille(lireFeuille, db, ref) {
  const F = lireFeuille(FICHES.corrige, BLOC_CORRIGE, db);
  const v = F.valeur(ref);
  if (Number.isFinite(v)) return v;
  const b = lireNombre(F.brut(ref));
  return Number.isFinite(b) ? b : null;
}
