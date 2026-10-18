// ENT-9.1 — CHEP, « le compte palettes » : les DONNÉES PURES de la séance (le compte, les documents de la semaine, le tirage, les attendus).
// À part de `contenus/chep-ent91.js` parce que ce fichier-ci se charge aussi hors navigateur (corrigé, tests) : rien ici n'importe le
// moteur (sauf `core/tirage.js`, module pur). Brief : `docs/briefs/ENT-9.1-chep-compte-palettes.md` §6 et §6 bis ; règles de calcul :
// `docs/briefs/COORDINATION-chep.md` §4.
//
// La PIÈCE FIXE (la même structure pour tous, quantités tirées) : le bon d'émission du mardi (E), le bordereau du mercredi vers Frais du
// Nord (T), le bon de retour du vendredi (R). TIRÉ par élève : le solde de départ S0 ; UNE pièce de la banque `partiel` (un bordereau qui
// mêle des palettes CHEP à des palettes Europe ou LPR : seules les CHEP se déclarent) ; UNE pièce de la banque `nonMouvement` (un bordereau
// sans aucune palette CHEP, ou une commande à livrer après le relevé) ; l'ORDRE des documents ; pour un confirmé, deux documents de plus
// (banque `bonus` : un duplicata, un bordereau du lundi suivant). Tout ce qui est attendu est CALCULÉ ici, jamais écrit en dur :
// solde = S0 + E − T − C − R (`solde` de l'univers).

import { declarerTirage, hasard, niveauEleve } from '../core/tirage.js';
import { EMETTEURS, DISTRIBUTEURS, CENTRE, solde, date } from './chep.js';

export const ID = 'chep-compte-palettes';
export const ID_VOLET = 'chep-ent91';
// Lundi 18 janvier 2027, 8 h 30 (séance AVANT la validation des déclarations par la cliente).
export const SCENARIO = { date: '2027-01-18', heure: '08:30' };
export const CLIENT = EMETTEURS.ternois;
// La semaine du relevé : du lundi 11 au vendredi 15/01/2027.
export const SEMAINE = { debut: '2027-01-11', fin: '2027-01-15' };

// Les écrans (ids JAMAIS modifiés : écrits dans la base de l'élève).
export const FICHES = { decl: 'decl', releve: 'releve' };
export const BLOC_COMPTE = 'compte';          // le bloc grille du relevé
export const PHRASES_ID = 'reponse-helene';   // la réponse par phrases
// Les blocs de la fiche « déclarations », par RÔLE de document (stables d'un élève à l'autre : les gestes sont publiés sur base vide).
export const ROLES = ['emission', 'transfert', 'retour', 'partiel', 'nonmvt'];
export const ROLES_BONUS = ['bonus1', 'bonus2'];
export const champ = (quoi, role) => `${quoi}-${role}`;   // 'type-partiel', 'part-emission', 'qte-retour'

// ─────────────────────────────────────────────────────────────── les choix des listes (valeurs JAMAIS modifiées)
export const TYPES = [
  { v: 'emission', lib: 'Émission reçue de CHEP' },
  { v: 'transfert', lib: 'Transfert vers un distributeur' },
  { v: 'retour', lib: 'Retour au centre de service' },
  { v: 'aucun', lib: 'Aucun mouvement CHEP' },
];
export const PARTENAIRES = [
  { v: CENTRE.id, lib: CENTRE.lib },
  ...['frais-nord', 'halles-artois', 'hainaut-primeurs', 'marchelys'].map((k) => ({ v: k, lib: DISTRIBUTEURS[k].lib })),
  { v: 'aucun', lib: 'Aucun' },
];
export const libType = (v) => (TYPES.find((t) => t.v === v) || {}).lib || '';
export const libPartenaire = (v) => (PARTENAIRES.find((p) => p.v === v) || {}).lib || '';
// Le partenaire en court (« CHEP Templemars », « Frais du Nord ») : pour les lignes du relevé, qui doivent tenir sur une ligne.
export const libPartenaireCourt = (v) => (v === CENTRE.id ? CENTRE.nom : DISTRIBUTEURS[v] ? DISTRIBUTEURS[v].nom : v === 'aucun' ? 'Aucun' : '');

// ─────────────────────────────────────────────────────────────── les banques (JAMAIS de pièce supprimée ni renumérotée)
// `partiel` : un bordereau qui mêle les palettes CHEP à d'autres (même difficulté : le piège est de déclarer tout le camion).
export const BANQUE_PARTIEL = [
  { id: 'pa-europe', difficulte: 'moyen', iso: '2027-01-14', a: 'halles-artois', autres: 'europe', titre: 'Jeudi, vers Halles d’Artois : des palettes Europe mêlées aux CHEP' },
  { id: 'pa-lpr', difficulte: 'moyen', iso: '2027-01-15', a: 'marchelys', autres: 'lpr', titre: 'Vendredi, vers MarchéLys : des palettes rouges LPR mêlées aux CHEP' },
];
// `nonMouvement` : un document qui n'est PAS un mouvement de palettes CHEP.
export const BANQUE_NON_MOUVEMENT = [
  { id: 'nm-europe', difficulte: 'moyen', iso: '2027-01-14', a: 'hainaut-primeurs', titre: 'Jeudi, vers Hainaut Primeurs : des palettes Europe seulement' },
  { id: 'nm-commande', difficulte: 'moyen', iso: '2027-01-15', livraison: '2027-01-19', titre: 'Vendredi : une commande de palettes à livrer mardi 19/01' },
];
// `bonus` (confirmé seulement : deux documents de plus, en fin de liste). Juste = « Aucun mouvement CHEP ».
export const BANQUE_BONUS = [
  { id: 'bo-doublon', difficulte: 'difficile', titre: 'Le bordereau du mercredi envoyé deux fois (duplicata)' },
  { id: 'bo-lundi', difficulte: 'difficile', iso: '2027-01-18', a: 'frais-nord', titre: 'Un bordereau du lundi 18/01 : après le relevé' },
];

// ─────────────────────────────────────────────────────────────── l'ordre des documents
// L'ordre des cinq documents du socle : une permutation des rôles, tirée par élève. Les trois documents fixes ne sont jamais tous
// les trois en tête (contrôle d'équité : les banques ne sont pas « à la fin », où on les devinerait).
function permutations(L) {
  if (L.length <= 1) return [L];
  return L.flatMap((x, i) => permutations([...L.slice(0, i), ...L.slice(i + 1)]).map((p) => [x, ...p]));
}
export const PERMUTATIONS = permutations(ROLES);
const FIXES = ['emission', 'transfert', 'retour'];
export const ordreValide = (perm) => !perm.slice(0, 3).every((r) => FIXES.includes(r));
// L'ordre du témoin : A émission, B transfert (Frais du Nord), C le document partiel, D retour, E le document sans mouvement.
export const ORDRE_TEMOIN = PERMUTATIONS.findIndex((p) => p.join() === 'emission,transfert,partiel,retour,nonmvt');

// ─────────────────────────────────────────────────────────────── les valeurs tirées
// DEFAUT = l'élève « témoin » du brief (base vide, contrôle au chargement, premier témoin des tests) : solde 180 + 200 − 26 − 18 − 30 = 306.
export const DEFAUT = { s0: 180, e: 200, t: 26, r: 30, n: 22, autres: 4, nmEurope: 20, nmCommande: 240, boLundi: 24, ordre: ORDRE_TEMOIN };
const valeursTirees = (h) => ({
  s0: 150 + 5 * h.entier(0, 12),       // 150 à 210, pas de 5
  e: 160 + 20 * h.entier(0, 4),        // 160 à 240, pas de 20
  t: h.entier(22, 26),
  r: 20 + 2 * h.entier(0, 10),         // 20 à 40, pas de 2
  n: h.entier(20, 24),                 // le total du bordereau partiel
  autres: h.entier(2, 6),              // dont palettes Europe ou LPR
  nmEurope: h.entier(18, 22),          // le bordereau sans CHEP
  nmCommande: 200 + 10 * h.entier(0, 6),   // la commande
  boLundi: h.entier(20, 26),           // le bordereau du lundi (confirmé)
  ordre: h.entier(0, PERMUTATIONS.length - 1),
});

// ─────────────────────────────────────────────────────────────── le jeu d'un élève
// Les numéros de documents (construits, les mêmes pour tous : ce sont les quantités qui changent).
export const NUMEROS = { emission: 'EM-27-01184', transfert: 'BL-ET-27-0312', retour: 'RET-27-00467', 'pa-europe': 'BL-ET-27-0315', 'pa-lpr': 'BL-ET-27-0319',
  'nm-europe': 'BL-ET-27-0316', 'nm-commande': 'CMD-ET-27-0021', 'bo-doublon': 'BL-ET-27-0312', 'bo-lundi': 'BL-ET-27-0321', releve: 'ET-62-0417' };
// Les lignes de marchandise d'un bordereau d'endives (colis de 5 kg, fait vérifié : DRAAF) : calculées sur le nombre de palettes.
const lignesEndives = (palettesTotal) => {
  const colisParPalette = 80;   // construit : 80 colis de 5 kg par palette, 400 kg
  const total = palettesTotal * colisParPalette;
  const a = Math.round(total * 0.6);
  return [{ designation: 'Endives de pleine terre, cat. I, colis de 5 kg', colis: a, poids: a * 5 },
    { designation: 'Endives rouges (carmine), cat. I, colis de 5 kg', colis: total - a, poids: (total - a) * 5 }];
};

// Un document du jeu : { role, piece (id de banque ou rôle fixe), iso, genre, attendu: { type, part, qte }, … pour le gabarit }.
function documentsDe(V, pPartiel, pNonMvt, bonus) {
  const D = [];
  D.push({ role: 'emission', piece: 'emission', genre: 'emission', iso: '2027-01-12', numero: NUMEROS.emission, qte: V.e,
    attendu: { type: 'emission', part: CENTRE.id, qte: V.e } });
  D.push({ role: 'transfert', piece: 'transfert', genre: 'bordereau', iso: '2027-01-13', numero: NUMEROS.transfert, a: 'frais-nord',
    supports: { chep: V.t }, lignes: lignesEndives(V.t), attendu: { type: 'transfert', part: 'frais-nord', qte: V.t } });
  D.push({ role: 'retour', piece: 'retour', genre: 'retour', iso: '2027-01-15', numero: NUMEROS.retour, qte: V.r,
    attendu: { type: 'retour', part: CENTRE.id, qte: V.r } });
  const c = V.n - V.autres;
  D.push({ role: 'partiel', piece: pPartiel.id, genre: 'bordereau', iso: pPartiel.iso, numero: NUMEROS[pPartiel.id], a: pPartiel.a,
    supports: { chep: c, [pPartiel.autres]: V.autres }, total: V.n, autres: pPartiel.autres, lignes: lignesEndives(V.n),
    attendu: { type: 'transfert', part: pPartiel.a, qte: c } });
  if (pNonMvt.id === 'nm-europe') {
    D.push({ role: 'nonmvt', piece: pNonMvt.id, genre: 'bordereau', iso: pNonMvt.iso, numero: NUMEROS[pNonMvt.id], a: pNonMvt.a,
      supports: { europe: V.nmEurope }, total: V.nmEurope, lignes: lignesEndives(V.nmEurope), attendu: { type: 'aucun', part: 'aucun', qte: 0 } });
  } else {
    D.push({ role: 'nonmvt', piece: pNonMvt.id, genre: 'commande', iso: pNonMvt.iso, numero: NUMEROS[pNonMvt.id], qte: V.nmCommande,
      livraison: pNonMvt.livraison, attendu: { type: 'aucun', part: 'aucun', qte: 0 } });
  }
  bonus.forEach((p, k) => {
    const role = ROLES_BONUS[k];
    if (p.id === 'bo-doublon') {
      D.push({ role, piece: p.id, genre: 'bordereau', iso: '2027-01-13', numero: NUMEROS.transfert, a: 'frais-nord', duplicata: true,
        supports: { chep: V.t }, lignes: lignesEndives(V.t), attendu: { type: 'aucun', part: 'aucun', qte: 0 } });
    } else {
      D.push({ role, piece: p.id, genre: 'bordereau', iso: p.iso, numero: NUMEROS[p.id], a: p.a, supports: { chep: V.boLundi },
        lignes: lignesEndives(V.boLundi), attendu: { type: 'aucun', part: 'aucun', qte: 0 } });
    }
  });
  return D;
}

// Le jeu complet d'un tirage (ids des pièces + valeurs) : les documents dans l'ordre de l'élève (lettres A, B, C…), le solde attendu.
export function jeuDe({ partiel = 'pa-europe', nonMouvement = 'nm-europe', bonus = [], valeurs = DEFAUT } = {}) {
  const V = { ...DEFAUT, ...(valeurs || {}) };
  const pp = BANQUE_PARTIEL.find((p) => p.id === partiel) || BANQUE_PARTIEL[0];
  const pn = BANQUE_NON_MOUVEMENT.find((p) => p.id === nonMouvement) || BANQUE_NON_MOUVEMENT[0];
  const pb = bonus.map((id) => BANQUE_BONUS.find((p) => p.id === id)).filter(Boolean);
  const docs = documentsDe(V, pp, pn, pb);
  const perm = PERMUTATIONS[Math.min(Math.max(0, V.ordre | 0), PERMUTATIONS.length - 1)];
  const socle = perm.map((role) => docs.find((d) => d.role === role));
  const plus = docs.filter((d) => ROLES_BONUS.includes(d.role));
  const documents = [...socle, ...plus].map((d, i) => ({ ...d, lettre: 'ABCDEFG'[i], id: `doc-${'abcdefg'[i]}` }));
  const parRole = Object.fromEntries(documents.map((d) => [d.role, d]));
  const mouvements = documents.filter((d) => d.attendu.type !== 'aucun');
  return {
    valeurs: V, piecePartiel: pp.id, pieceNonMvt: pn.id, bonus: pb.map((p) => p.id), documents, parRole, mouvements,
    s0: V.s0,
    solde: solde({ depart: V.s0, emissions: V.e, transferts: [V.t, parRole.partiel.attendu.qte], retours: V.r }),
  };
}

// Le contrôle d'équité (brief §6.2) sur un jeu : la liste des écarts en clair (vide = conforme).
export function ecartsEquite(J) {
  const E = [];
  const V = J.valeurs, P = J.parRole;
  if (J.solde < 150) E.push(`solde ${J.solde} < 150`);
  if (P.partiel.attendu.qte === P.partiel.total) E.push('document partiel : autant de CHEP que de palettes au total');
  if (P.partiel.attendu.qte <= 0) E.push('document partiel : aucune palette CHEP');
  // Aucune quantité déclarée égale à une autre du même jeu (sinon un piège se confond avec la bonne réponse) : les cinq nombres que l'élève
  // écrit (E, T, R, le total du partiel et ses palettes CHEP). Les pièges de type (Europe seules, commande, lundi) n'ont pas à être distincts
  // de tout, seulement de ce qu'ils imitent : une exigence plus large faisait retirer trop souvent la pièce nm-europe (biais du tirage).
  const q = [V.e, V.t, V.r, V.n, P.partiel.attendu.qte];
  if (new Set(q).size !== q.length) E.push(`deux quantités égales : ${q.join(', ')}`);
  if (P.nonmvt.genre === 'commande' && V.nmCommande === V.e) E.push('la commande vaut l’émission');
  if (P.nonmvt.genre !== 'commande' && V.nmEurope === V.n) E.push('les palettes Europe seules valent le total du partiel');
  if (P.bonus2 && V.boLundi === V.t) E.push('le bordereau du lundi vaut le transfert simple');
  // Le document sans mouvement ne porte jamais « CHEP » dans son cadre « Supports ».
  if (P.nonmvt.supports && P.nonmvt.supports.chep) E.push('le document sans mouvement porte des palettes CHEP');
  // L'ordre : les trois documents fixes ne sont jamais tous les trois en tête.
  if (!ordreValide(J.documents.slice(0, 5).map((d) => d.role))) E.push('les trois documents fixes sont en tête');
  return E;
}

// Le tirage mémorisé (core/tirage.js) : ses jeux sont contrôlés par `ecartsEquite`.
const jeuDuTirage = (jeu) => jeuDe({ partiel: jeu.pieces.partiel[0].id, nonMouvement: jeu.pieces.nonMouvement[0].id,
  bonus: ((jeu.bonus && jeu.bonus.bonus) || []).map((p) => p.id), valeurs: jeu.valeurs });
export const TIRAGE = declarerTirage({
  banques: {
    partiel: { pieces: BANQUE_PARTIEL, melange: { moyen: 1 } },
    nonMouvement: { pieces: BANQUE_NON_MOUVEMENT, melange: { moyen: 1 } },
    bonus: { pieces: BANQUE_BONUS, melange: {}, bonus: { confirme: { difficile: 2 } }, ordre: 'fixe' },
  },
  valeurs: valeursTirees,
  verifier: (jeu) => ecartsEquite(jeuDuTirage(jeu)),
});
TIRAGE.lier(ID);

// Le jeu de l'élève, lu dans sa base (sans tirage — base vide, contrôle au chargement — : le jeu « témoin » du brief).
export function jeuEleve(db) {
  const rec = TIRAGE.tirage(db);
  if (!rec) return jeuDe({});
  const p1 = TIRAGE.piecesTirees(db, 'partiel')[0], p2 = TIRAGE.piecesTirees(db, 'nonMouvement')[0];
  return jeuDe({ partiel: p1 && p1.id, nonMouvement: p2 && p2.id, bonus: TIRAGE.piecesBonus(db, 'bonus').map((p) => p.id),
    valeurs: TIRAGE.valeursTirees(db) });
}
// L'ordre des choix d'une liste de phrases, tiré par élève (rien n'est rangé : recalculé de la graine).
export const graineDe = (db) => (db && db.tirages && db.tirages[ID] && db.tirages[ID].graine) || '';
export const melangeDe = (db, quoi, L) => { const g = graineDe(db); return g ? hasard(`${g}|${quoi}`).melanger(L) : L; };

// ─────────────────────────────────────────────────────────────── les fiches de l'élève
// Une saisie de nombre, telle que tapée → un nombre ou NaN. Même lecture que `lireNombre` de la fiche.
export function lireNombre(s) {
  const t = String(s == null ? '' : s).replace(/[\s  ]/g, '').replace(',', '.');
  return /^-?\d+(\.\d+)?$/.test(t) ? Number(t) : NaN;
}
// Une fiche de l'élève : `{ envoye, deja, v }` (v = ses valeurs, même pas encore envoyées ; `deja` = envoyée au moins une fois, même
// rouverte par « Corriger »).
export function fiche(db, id) {
  const f = db && db.fiches && db.fiches[id];
  return { envoye: !!(f && f.envoye), deja: !!(f && (f.envoye || f.envois)), v: (f && f.valeurs) || {} };
}
export const dejaEnvoyee = (id) => (db) => fiche(db, id).deja;

// Ce que l'élève a déclaré pour un document (par rôle) : { type, part, qte (nombre ou NaN) }, tel quel, sans corriger.
export function declaration(v, role) {
  return { type: v[champ('type', role)] || null, part: v[champ('part', role)] || null, qte: lireNombre(v[champ('qte', role)]) };
}
// Les adresses des cases du relevé : ligne 1 = en-tête, ligne 2 = S0 (D2), lignes 3… = ses lignes, dernière ligne = le solde (colonne D).
export const ligneSolde = (nLignes) => nLignes + 3;
export const caseSolde = (nLignes) => `D${ligneSolde(nLignes)}`;
export const caseEntree = (i) => `B${i + 3}`;
export const caseSortie = (i) => `C${i + 3}`;

// ─────────────────────────────────────────────────────────────── ③ la grille du relevé (pure : lue aussi par les questions et le corrigé)
// LA FABRIQUE DU RELEVÉ (18/10/2026, pour ENT-9.4 : l'évaluation reprend ce relevé SANS AIDE, sur son propre jeu). Elle rend les lignes
// déclarées, le solde déclaré, les lignes de la grille, le bloc grille (CONSTANT : la feuille garde son état par objet) et la lecture du solde.
//   o = { jeuEleve(db), ficheDecl, ficheReleve, blocId, semaine: { debut, fin }, depart (« relevé au 11/01 »), titre,
//         evaluation (vrai : ni colonne « Aide », ni note sous une ligne, ni « = » dans la case du solde) }
// ENT-9.1 l'appelle avec ses valeurs : ses lignes, ses notes, son bloc et ses textes ne changent pas d'un caractère.
// Un bloc CONSTANT, ses lignes calculées sur les déclarations de l'élève : ligne 1 l'en-tête, ligne 2 le solde de départ (donné), une ligne
// par document qu'IL a déclaré comme mouvement, dernière ligne le solde (formule). Dans chaque ligne : la quantité dans la bonne colonne, 0
// dans l'autre (une case à remplir ne reste pas vide, comme un compte).
const saisie = (attendu, o = {}) => ({ saisie: true, attendu, placeholder: ' ', ...o });
// Les aides, courtes : la colonne « Aide » est étroite (une ligne longue allonge toute la grille).
const AIDE_SENS = { entree: 'Émission → Entrées (+), 0 en Sorties.', sortie: 'Transfert ou retour → Sorties (−), 0 en Entrées.' };
const AIDE_GUIDAGE = 'Émission : entrée. Transfert, retour : sortie.';
const TYPE_COURT = { emission: 'Émission', transfert: 'Transfert', retour: 'Retour' };
export function fabriqueReleve({ jeuEleve: jeuDeLaBase, ficheDecl, ficheReleve, blocId, semaine, depart, titre, evaluation = false }) {
  // Les lignes du relevé d'après SES déclarations : un document déclaré « mouvement » = une ligne (ordre des onglets). `sens` : 'entree'
  // pour une émission, 'sortie' pour un transfert ou un retour. Une erreur de type ne se paie qu'une fois : la grille lit ces lignes.
  function lignesDeclarees(db) {
    const J = jeuDeLaBase(db), { v } = fiche(db, ficheDecl);
    return J.documents.map((d) => ({ doc: d, decl: declaration(v, d.role) }))
      .filter((x) => x.decl.type && x.decl.type !== 'aucun')
      .map((x) => ({ role: x.doc.role, lettre: x.doc.lettre, type: x.decl.type, part: x.decl.part, qte: x.decl.qte,
        sens: x.decl.type === 'emission' ? 'entree' : 'sortie' }));
  }
  // Le solde attendu d'après SES lignes et S0 (règle « une erreur ne se paie qu'une fois »), ou null si une quantité est illisible.
  function soldeDeclare(db) {
    const L = lignesDeclarees(db), J = jeuDeLaBase(db);
    if (L.some((l) => !Number.isFinite(l.qte))) return null;
    return solde({ depart: J.s0, emissions: L.filter((l) => l.sens === 'entree').map((l) => l.qte), transferts: L.filter((l) => l.sens === 'sortie').map((l) => l.qte) });
  }
  function lignesReleve(db) {
    const J = jeuDeLaBase(db), L = lignesDeclarees(db);
    const accompagne = !evaluation && niveauEleve(db) === 'accompagne';
    const refsB = L.map((_, i) => caseEntree(i)), refsC = L.map((_, i) => caseSortie(i));
    // L'attendu du solde se calcule sur LA FEUILLE DE L'ÉLÈVE (ses cases, même fausses) : une erreur ne se paie qu'une fois.
    const attenduSolde = (lire) => {
      const vals = [...refsB, ...refsC].map(lire);
      if (vals.some((x) => x == null || !Number.isFinite(x))) return null;
      return J.s0 + refsB.reduce((s, r) => s + lire(r), 0) - refsC.reduce((s, r) => s + lire(r), 0);
    };
    const note = (texte) => (evaluation ? {} : { note: texte });
    return [
      { A: '', B: 'Entrées (+)', C: 'Sorties (−)', D: 'Solde', entete: true },
      { A: `Solde au ${date(semaine.debut)}`, B: '', C: '', D: J.s0, ...note(`Donné (${depart}).`) },
      ...L.map((l) => {
        const q = Number.isFinite(l.qte) ? l.qte : 0;
        return { A: `Doc. ${l.lettre} — ${TYPE_COURT[l.type] || libType(l.type)} — ${libPartenaireCourt(l.part) || '?'} — ${Number.isFinite(l.qte) ? l.qte : '?'}`,
          B: saisie(l.sens === 'entree' ? q : 0), C: saisie(l.sens === 'sortie' ? q : 0), ...note(accompagne ? AIDE_SENS[l.sens] : AIDE_GUIDAGE) };
      }),
      { A: `Solde au ${date(semaine.fin)}`, B: '', C: '', D: saisie(attenduSolde, evaluation ? { formule: true } : { formule: true, placeholder: '=' }),
        ...note(L.length ? 'Formule : D2 + entrées − sorties.' : 'Aucune ligne : le solde ne bouge pas (= D2).') },
    ];
  }
  const BLOC = { type: 'grille', id: blocId, titre, lignes: lignesReleve, manque: 'des cases du relevé ({n})',
    feuille: evaluation
      ? { titre: 'Relevé du compte', colonnes: ['A', 'B', 'C', 'D'], decimales: 0, donneesGrisees: true, largeurs: { A: '46%', B: '15%', C: '15%', D: '15%' } }
      : { titre: 'Relevé du compte', colonnes: ['A', 'B', 'C', 'D'], decimales: 0, colonneAide: 'Aide', donneesGrisees: true,
        largeurs: { A: '36%', B: '12%', C: '12%', D: '12%', aide: 'auto' } } };
  // Le solde de l'élève, lu dans sa feuille par `lireFeuille` (donnée par l'appelant : ce fichier n'importe pas le moteur) : la valeur de sa
  // case du solde (une formule calculée, ou un nombre tapé), ou null.
  function soldeDeLaFeuille(lireFeuille, db) {
    const n = lignesDeclarees(db).length;
    const F = lireFeuille(ficheReleve, BLOC, db);
    const v = F.valeur(caseSolde(n));
    if (Number.isFinite(v)) return v;
    const b = lireNombre(F.brut(caseSolde(n)));
    return Number.isFinite(b) ? b : null;
  }
  return { lignesDeclarees, soldeDeclare, lignesReleve, BLOC, soldeDeLaFeuille };
}
const RELEVE_91 = fabriqueReleve({ jeuEleve, ficheDecl: FICHES.decl, ficheReleve: FICHES.releve, blocId: BLOC_COMPTE, semaine: SEMAINE,
  depart: 'relevé au 11/01', titre: 'Mets chaque quantité dans la bonne colonne (0 dans l’autre), puis écris la formule du solde' });
export const lignesDeclarees = RELEVE_91.lignesDeclarees;
export const soldeDeclare = RELEVE_91.soldeDeclare;
export const lignesReleve = RELEVE_91.lignesReleve;
export const BLOC_RELEVE = RELEVE_91.BLOC;
export const soldeDeLaFeuille = RELEVE_91.soldeDeLaFeuille;
