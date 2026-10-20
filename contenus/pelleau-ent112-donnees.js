// ENT-10.12 — Transports Pelleau, « évaluation : contrôler la réception » : les DONNÉES PURES de la séance (tirage des anomalies et de la palette de la Ferme
// de Kervéguen, quai d'un élève, phrases du compte rendu calculées sur son tirage). Aucun effet de bord, aucune interface, aucun import du moteur (le tirage de
// `core/tirage.js` est pur) : importé par le contenu (`contenus/pelleau-ent112.js`), les questions (`contenus/questions/ENT-10.12.js`) et le corrigé
// (`contenus/corriges/ENT-10.12.js`, qui se charge aussi sous Node). Brief `docs/briefs/ENT-10.12-pelleau-evaluation-controle.md` ; décisions du chef de chantier :
// `docs/briefs/COORDINATION-pelleau.md` §2 (9 : aucun jour de la semaine ; 10 : ids suffixés ; 13 : aucun chiffre attendu écrit à la main). Modèles : ENT-10.10
// (les rôles facile / moyen / piège / conforme) et ENT-10.11 (la palette de Kervéguen à refuser) — jamais importés : une séance n'importe pas le fichier d'une autre.
//
// LA RAMASSE (tirée) : quatre palettes, P1 à P4, dans l'ordre où Loïc les a posées. Elles sont déjà triées : chacune est dessinée dans la première case libre de
// son client (dépose par client sous `commence: 'controle'`). Palettes types de l'univers (`PALETTE_AR_VAG`, `PALETTE_AGRI`, `PALETTE_KERVEGUEN`) ; disposition dans
// la couche CONSTRUITE : 8 → 4 × 2, 10 → 5 × 2.
//
// LE TIRAGE (par élève, graine = son identifiant + « |pelleau-evaluation-controle » ; `tirerJeu` de `core/tirage.js`) — brief §6 bis. CHAQUE copie a exactement
// DEUX palettes à problème, UN piège et UNE palette conforme :
//   - une palette `facile` : 2 colis abîmés sur la face AVANT : `ecrase-face` (cartons Ar Vag) ou `perce-face` (sacs Agri-Kerlann) → accepter avec réserves ;
//   - une palette `moyen` : `cache` (1 colis abîmé sur la face ARRIÈRE : vu en faisant le tour) ou `manquant` (2 colis absents de la couche du dessus, la feuille de
//     ramasse dit la palette pleine), ou — UNE copie sur TROIS — `froid` : une palette de plants de pommes de terre de la Ferme de Kervéguen qui prend la place
//     d'une palette de la ramasse (son rang est tiré) et que l'entrepôt, ambiant seulement, ne sait pas garder → REFUSER (motif « Ne se stocke pas ici »). Les
//     deux palettes à problème sont de deux clients différents (Kervéguen compte pour un client) ;
//   - une palette `piege` : `couche-normale` — la couche du dessus à moitié vide ET la feuille dit le même nombre → accepter ;
//   - la dernière : `conforme`, pleine → accepter.
//   Au moins une avarie (la facile en est toujours une : la ligne « zone litiges » du compte rendu en dépend). Ni bonus ni niveau (une évaluation).
// Quantités FIXES (construit, reprises d'ENT-10.9 à 10.11) : 2 colis abîmés devant, 1 derrière, 2 manquants ; la couche « normale » a la moitié de sa couche du
// dessus : 4 cartons sur 8 (Ar Vag), 5 sacs sur 10 (Agri-Kerlann), 32 sacs pour Kervéguen.
// ⚠ Le jeu d'un élève est une fonction de son identifiant ET de ce fichier : changer le tirage changerait les palettes d'un élève qui a déjà commencé.
//
// « QUE, JAMAIS DE COMBIEN », et JAMAIS « froid » avant l'étiquette : aucun écran ne dit où est l'anomalie ni combien il manque, ni si une palette est de
// Kervéguen. La feuille de ramasse dit la palette pleine (sauf le piège, où elle dit le nombre réel : c'est le piège) ; l'étiquette d'un colis dit « 1 carton » /
// « 1 sac », jamais un total ; la mention « Conservation : … » n'est que sur l'étiquette du sac de Kervéguen, au zoom de l'étape ③ ; le quai, ses zones (celle de
// Kervéguen est toujours dessinée, vide ou non), son menu de motifs et la consigne d'Erwan sont les mêmes pour toutes les copies ; les phrases du compte rendu
// n'arrivent qu'après la signature.
//
// TOUT EST CONSTRUIT : les anomalies, le n° de la feuille de ramasse, les lots, les étiquettes, les phrases. Réel (site Pelleau, 18/10/2026) : l'entrepôt de
// Gouesnou est ambiant seulement, les plants de pommes de terre se gardent entre 4 et 8 °C (voir `contenus/pelleau.js`).

import { tirerJeu, graineDeBase } from '../core/tirage.js';
import { CLIENTS, PALETTE_AR_VAG, PALETTE_AGRI, PALETTE_KERVEGUEN, clientsDepose } from './pelleau.js';

export const ID = 'pelleau-evaluation-controle';
export const ID_VOLET = 'pelleau-ent112';
export const QUAI_ID = 'pelleau-quai-112';            // un id par séance : `db.quais[<id>]` n'est pas cloisonné par séance
export const PHRASES_ID = 'pelleau-compte-rendu-112';
export const JOUR = 26;                                // 26 mai 2026 (feuille de route §0.7, le 25 est férié), jamais le jour de la semaine
export const FR_NUMERO = 'RAM-0526';                   // CONSTRUIT
export const DOCUMENT = { nom: 'Feuille de ramasse', court: 'FR', article: 'la' };
export const QTE = { face: 2, cache: 1, manquant: 2 };
export const ROLES = ['facile', 'moyen', 'piege', 'conforme'];
export const MOYENS = ['cache', 'manquant', 'froid'];

// ─────────────────────────────────────────────────────────────── les clients et les palettes
// La ramasse de base : deux palettes de chaque client habituel ; quand la palette de Kervéguen est tirée, elle prend la place de l'une d'elles.
const BASE = ['ar-vag', 'ar-vag', 'agri-kerlann', 'agri-kerlann'];
export const CLIENTS_112 = ['ar-vag', 'agri-kerlann', 'kerveguen'];   // ceux dont la zone est dessinée au sol, dans cet ordre
export const NOM_DIT = { 'ar-vag': 'Ar Vag', 'agri-kerlann': 'Agri-Kerlann', kerveguen: 'Kervéguen' };
export const nomClient = (id) => CLIENTS[id].nom;
const TYPES = { 'ar-vag': PALETTE_AR_VAG, 'agri-kerlann': PALETTE_AGRI, kerveguen: PALETTE_KERVEGUEN };
const DIMS = { 8: [4, 2], 10: [5, 2] };   // colis par couche → largeur × profondeur du quai (couches = hauteur)
// L'anomalie « facile » de chaque client habituel : des cartons écrasés, des sacs percés (sur la face avant).
export const FACILE_DE = { 'ar-vag': 'ecrase-face', 'agri-kerlann': 'perce-face' };
// Une palette décrite depuis une ligne du jeu (`{ id, client, … }`) : sa référence, sa désignation, ses dimensions, son unité.
export const decrit = (t) => {
  const ty = TYPES[t.client], [W, D] = DIMS[ty.parCouche];
  return { id: t.id, client: t.client, ref: ty.ref, nom: ty.designation, W, D, L: ty.couches, unite: ty.unite, unitePl: ty.unitePl, sacs: ty.unite === 'sac' };
};
export const pleine = (t) => { const p = decrit(t); return p.W * p.D * p.L; };
// Un nombre de colis d'une palette, avec SON mot : « 2 cartons », « 1 sac ».
export const colis = (t, n) => { const p = decrit(t); return `${n} ${n > 1 ? p.unitePl : p.unite}`; };
// Les cellules « i,j,k » (i de gauche à droite, j = 0 au fond, D − 1 devant, k = couche, 0 en bas).
const dessus = ({ W, D, L }) => { const c = []; for (let i = 0; i < W; i++) for (let j = 0; j < D; j++) c.push(`${i},${j},${L - 1}`); return c; };
const avant = ({ W, D, L }) => { const c = []; for (let i = 0; i < W; i++) for (let k = 0; k < L - 1; k++) c.push(`${i},${D - 1},${k}`); return c; };
const arriere = ({ W, L }) => { const c = []; for (let i = 0; i < W; i++) for (let k = 0; k < L - 1; k++) c.push(`${i},0,${k}`); return c; };
export const moitieDessus = (t) => { const p = decrit(t); return Math.floor((p.W * p.D) / 2); };
// Décision et motif attendus de chaque anomalie (ce que la vue juge). La palette de Kervéguen : REFUSER, motif « produit » (celui du quai qui dit « ce produit
// ne se range pas ici »).
export const ATTENDU = {
  'ecrase-face': ['reserves', 'avarie'], 'perce-face': ['reserves', 'avarie'], cache: ['reserves', 'avarie'], manquant: ['reserves', 'manquant'],
  'couche-normale': ['accepter', 'aucun'], conforme: ['accepter', 'aucun'], froid: ['refuser', 'produit'],
};
// Ce que dit l'étiquette du sac de Kervéguen (au zoom, ligne « Conservation : … »), calculé sur l'univers : « entre 4 et 8 °C — craint le gel ».
export const CONSERVATION = `entre ${PALETTE_KERVEGUEN.temperature.min} et ${PALETTE_KERVEGUEN.temperature.max} °C — craint le gel`;
export const FOURCHETTE = `entre ${PALETTE_KERVEGUEN.temperature.min} et ${PALETTE_KERVEGUEN.temperature.max} °C`;

/* ================================================================== le tirage */
function tirer(h) {
  // L'ordre de la ramasse : le client de P1, P2, P3, P4.
  const ramasse = h.melanger(BASE).map((client, n) => ({ id: `P${n + 1}`, client }));
  const moyen = h.choisir(MOYENS);
  let fa, mo, pi, co;
  if (moyen === 'froid') {
    // La palette de Kervéguen prend la place d'une palette de la ramasse (son rang est tiré) ; la facile, le piège et la conforme sont les trois autres.
    const rang = h.choisir([0, 1, 2, 3]);
    ramasse[rang].client = 'kerveguen';
    mo = ramasse[rang].id;
    [fa, pi, co] = h.melanger(ramasse.filter((p) => p.client !== 'kerveguen').map((p) => p.id));
  } else {
    // Deux palettes à problème de deux clients différents ; le piège et la conforme sont les deux autres.
    const duClient = (c) => ramasse.filter((p) => p.client === c).map((p) => p.id);
    const cF = h.choisir(['ar-vag', 'agri-kerlann']), cM = cF === 'ar-vag' ? 'agri-kerlann' : 'ar-vag';
    const [f, autreF] = h.melanger(duClient(cF));
    const [m, autreM] = h.melanger(duClient(cM));
    fa = f; mo = m;
    [pi, co] = h.melanger([autreF, autreM]);
  }
  const role = { [fa]: 'facile', [mo]: 'moyen', [pi]: 'piege', [co]: 'conforme' };
  return { palettes: ramasse.map((r) => {
    const rl = role[r.id], d = decrit(r);
    const a = rl === 'facile' ? FACILE_DE[r.client] : rl === 'moyen' ? moyen : rl === 'piege' ? 'couche-normale' : 'conforme';
    let manque = [];
    const avarie = {};
    if (a === 'ecrase-face' || a === 'perce-face') h.prendre(avant(d), QTE.face).forEach((c) => { avarie[c] = [0, 1]; });
    if (a === 'cache') h.prendre(arriere(d), QTE.cache).forEach((c) => { avarie[c] = [0, -1]; });
    if (a === 'manquant') manque = h.prendre(dessus(d), QTE.manquant);
    if (a === 'couche-normale') manque = h.prendre(dessus(d), moitieDessus(r));
    return { id: r.id, client: r.client, role: rl, anomalie: a, manque, avarie, bl: a === 'couche-normale' ? d.W * d.D * d.L - manque.length : d.W * d.D * d.L };
  }) };
}

// Les contraintes d'équité, en clair (liste vide = jeu conforme ; sinon il est retiré).
export function verifier(jeu) {
  const f = [];
  const P = jeu && jeu.palettes;
  if (!Array.isArray(P) || P.length !== 4) return ['il faut 4 palettes'];
  if (P.map((p) => p.id).join() !== 'P1,P2,P3,P4') f.push('palettes mal numérotées');
  if ([...P.map((p) => p.role)].sort().join() !== [...ROLES].sort().join()) f.push(`rôles : ${P.map((p) => p.role)}`);
  const de = (r) => P.find((p) => p.role === r) || {};
  const kv = P.filter((p) => p.client === 'kerveguen');
  // Exactement 2 palettes de chaque client habituel, ou — avec la palette de Kervéguen — 3 palettes habituelles (le froid prend la place d'une).
  const n = (c) => P.filter((p) => p.client === c).length;
  if (kv.length > 1) f.push('plusieurs palettes de Kervéguen');
  if (kv.length === 0 && (n('ar-vag') !== 2 || n('agri-kerlann') !== 2)) f.push('il faut 2 palettes par client');
  if (kv.length === 1 && (kv[0].role !== 'moyen' || kv[0].anomalie !== 'froid' || n('ar-vag') + n('agri-kerlann') !== 3)) f.push('palette de Kervéguen mal placée');
  // Les deux palettes à problème : deux clients différents (Kervéguen compte pour un client) — brief §6 bis.
  if (de('facile').client && de('facile').client === de('moyen').client) f.push('les deux palettes à problème sont du même client');
  // Au moins une avarie (la ligne « zone litiges » du compte rendu en dépend).
  if (!P.some((p) => Object.keys(p.avarie || {}).length > 0)) f.push('aucune avarie : la ligne « zone litiges » n’aurait pas de réponse');
  P.forEach((p) => {
    if (!TYPES[p.client]) { f.push(`${p.id} : client ${p.client}`); return; }
    const d = decrit(p);
    const plein = d.W * d.D * d.L, reel = plein - p.manque.length, av = Object.keys(p.avarie);
    const moyens = p.client === 'kerveguen' ? ['froid'] : ['cache', 'manquant'];
    const attendue = p.role === 'facile' ? [FACILE_DE[p.client]].filter(Boolean) : p.role === 'moyen' ? moyens : p.role === 'piege' ? ['couche-normale'] : ['conforme'];
    if (!attendue.includes(p.anomalie)) f.push(`${p.id} : anomalie ${p.anomalie} pour le rôle ${p.role}`);
    if (new Set(p.manque).size !== p.manque.length || p.manque.some((c) => !dessus(d).includes(c))) f.push(`${p.id} : manquant hors de la couche du dessus`);
    const face = { 'ecrase-face': [avant(d), 1], 'perce-face': [avant(d), 1], cache: [arriere(d), -1] }[p.anomalie];
    if (av.length && (!face || av.some((c) => !face[0].includes(c) || p.avarie[c][0] !== 0 || p.avarie[c][1] !== face[1]))) f.push(`${p.id} : colis abîmé hors de sa face`);
    const ok = {
      'ecrase-face': !p.manque.length && av.length === QTE.face && p.bl === plein,
      'perce-face': !p.manque.length && av.length === QTE.face && p.bl === plein,
      cache: !p.manque.length && av.length === QTE.cache && p.bl === plein,
      manquant: p.manque.length === QTE.manquant && !av.length && p.bl === plein,
      'couche-normale': p.manque.length === moitieDessus(p) && p.manque.length > 0 && !av.length && p.bl === reel,
      conforme: !p.manque.length && !av.length && p.bl === plein,
      froid: !p.manque.length && !av.length && p.bl === plein,
    }[p.anomalie];
    if (!ok) f.push(`${p.id} : quantités hors règle pour ${p.anomalie}`);
  });
  return f;
}
const DECL = { tirer, verifier, essais: 40 };
DECL.secours = tirerJeu(Object.assign({}, DECL, { secours: null }), 'secours-pelleau-ent112').jeu;
if (!DECL.secours) throw new Error('ENT-10.12 : le tirage des anomalies ne donne aucun jeu conforme (tirer et verifier se contredisent)');
// Pas un `declarerTirage` (rien à mémoriser dans la base : le jeu se recalcule de la graine) ; le contenu de la séance ne le réexporte pas.
export const TIRAGE = DECL;

const jeux = new Map();
// Le jeu d'une graine (l'identifiant de l'élève ; '' : le jeu de référence, vu par l'enseignant), toujours le même pour la même graine.
export function jeuDe(graine) {
  const g = String(graine == null ? '' : graine);
  if (!jeux.has(g)) jeux.set(g, tirerJeu(TIRAGE, `${g}|${ID}`).jeu);
  return jeux.get(g);
}
export const jeuDeBase = (db) => jeuDe(graineDeBase(db || {}));
export const duRole = (jeu, role) => jeu.palettes.find((p) => p.role === role);
// La palette de Kervéguen (ou `undefined` : la copie n'en a pas), les palettes à problème dans l'ordre de la ramasse (P1 → P4), celles qui ont une avarie.
export const kerveguenDe = (jeu) => jeu.palettes.find((p) => p.client === 'kerveguen');
export const aProbleme = (jeu) => jeu.palettes.filter((p) => p.role === 'facile' || p.role === 'moyen');
export const avaries = (jeu) => jeu.palettes.filter((p) => Object.keys(p.avarie).length > 0);
export const quantite = (p) => (p.anomalie === 'manquant' ? p.manque.length : Object.keys(p.avarie).length);
export const reelDe = (p) => pleine(p) - p.manque.length;

/* ================================================================== le quai d'un élève */
// Les 7 cases de la dépose : l'allée piétonne, 2 cases Ar Vag, 2 cases Agri-Kerlann, 1 case Kervéguen, devant le quai B. La dépose n'est pas jouée
// (`commence: 'controle'`) : chaque palette est dessinée dans la première case libre de son client. La case de Kervéguen est TOUJOURS déclarée (vide quand la
// copie n'a pas de palette de Kervéguen) : le quai ne dit rien du tirage.
export const DEPOSE = { passage: 3, cases: [
  { id: 'allee-1', sol: 'pieton', peinte: false, nom: 'Allée piétonne' },
  { id: 'AV1', client: 'ar-vag' }, { id: 'AV2', client: 'ar-vag' },
  { id: 'AK1', client: 'agri-kerlann' }, { id: 'AK2', client: 'agri-kerlann' },
  { id: 'KV1', client: 'kerveguen' },
  { id: 'quaiB-1', sol: 'autre-quai', legende: 'Quai B', peinte: false, nom: 'Devant le quai B' }] };
export const CLIENTS_DEPOSE = clientsDepose(CLIENTS_112);
// La consigne d'Erwan : il est au bureau, l'élève contrôle seul ; aucune palette nommée, aucune anomalie annoncée, rien sur le froid.
export const consigneErwan = () => 'Je suis au bureau : tu contrôles seul. Pour chaque palette : compte, fais le tour, lis l’étiquette, puis décide. '
  + 'Un problème ? Une réserve précise sur la feuille de ramasse, et Loïc la signe.';
// Le motif du refus, tel que l'élève le lit dans le menu : il ne dit rien du froid (le menu est le même pour les quatre palettes, et pour toutes les copies).
export const LIBELLE_PRODUIT = 'Ne se stocke pas ici';

export function quaiDuJeu(jeu) {
  return {
    id: QUAI_ID,
    libelle: 'Le quai A',
    rendu: 'iso',
    froid: false,
    titre: 'Transports Pelleau — entrepôt de Gouesnou — Quai A, contrôle',
    destinataire: 'Transports Pelleau, entrepôt de Gouesnou',
    avertissement: `<b>Erwan :</b> « ${consigneErwan()} »<br>`
      + 'Réels : les Transports Pelleau et leur entrepôt de Gouesnou. Le quai est un <b>dessin construit</b>. La ramasse, les clients (entreprises fictives), '
      + 'les palettes, leurs défauts et la feuille de ramasse sont <b>construits pour l’exercice</b>.',
    recommencer: false,
    commence: 'controle',
    document: { ...DOCUMENT },
    debut: '08:00',
    unite: { un: 'colis', des: 'colis' },   // un quai mêlé de sacs et de cartons (« colis » : le singulier « coli » n'existe pas)
    motifs: ['avarie', 'manquant', 'produit'],
    libelles: { avarie: { nom: 'Colis abîmé', precision: 'écrasé ou percé', adjectif: 'abîmé' }, produit: { nom: LIBELLE_PRODUIT } },
    lieu: { nom: 'Quai A', temp: 15, refrigere: false },
    zone: { nom: 'Zone de réception' },
    // Évaluation à plusieurs écrans : la clôture du quai ne rend pas la copie ; elle se rend par « Rendre ma copie », après le compte rendu.
    rendCopie: false,
    dechargement: { ouverture: 0.5, parPalette: 1, par: 'cariste', nom: 'Yann' },
    depose: { ...JSON.parse(JSON.stringify(DEPOSE)), clients: JSON.parse(JSON.stringify(CLIENTS_DEPOSE)) },
    calcul: { forme: 'brouillon' },
    aides: {},
    camions: [{
      transporteur: 'Transports Pelleau', fournisseur: 'ramasse de Loïc', bl: FR_NUMERO, arrivee: '07:30',
      // Loïc est un collègue : tutoiement, son prénom plutôt que « le chauffeur » (comme ENT-10.5).
      tutoiement: true, prenomChauffeur: 'Loïc',
      parole: 'La feuille de ramasse, tu l’as. J’attends au local.',
      palettes: jeu.palettes.map((t, n) => {
        const p = decrit(t), [attendu, motifAttendu] = ATTENDU[t.anomalie];
        return { id: p.id, client: p.client, ...(p.sacs ? { forme: 'sacs' } : {}), ref: p.ref, nom: p.nom, bl: t.bl, W: p.W, D: p.D, L: p.L,
          // Une copie : le moteur ne doit jamais modifier les palettes que lisent le corrigé et les tests.
          manque: t.manque.slice(), avarie: JSON.parse(JSON.stringify(t.avarie)), attendu, motifAttendu,
          // La conservation : seulement sur l'étiquette du sac de Kervéguen (au zoom, ligne « Conservation : … »), nulle part ailleurs.
          ...(t.client === 'kerveguen' ? { conservation: CONSERVATION } : {}),
          // L'étiquette d'un colis : « 1 carton » / « 1 sac », jamais un total.
          etiq: { ref: p.ref, nom: p.nom.toUpperCase(), poids: `1 ${p.unite}`, lot: `${p.ref}-0526-${n + 1}` } };
      }),
    }],
  };
}
const cache = new Map();
// Le quai d'une graine (le moteur passe `{ niveau, copie }`, sans effet ici : une évaluation ne lit pas le niveau), toujours le même objet pour la même graine.
export function quaiDe(graine) {
  const g = String(graine == null ? '' : graine);
  if (!cache.has(g)) cache.set(g, quaiDuJeu(jeuDe(g)));
  return cache.get(g);
}
export const quaiDeBase = (db) => quaiDe(graineDeBase(db || {}));

/* ================================================================== le compte rendu à Erwan, calculé sur le tirage */
// Ce que dit la ligne d'une palette dans « Réserves signées par Loïc » : `[id, anomalie, quantité]`, avec le mot de CETTE palette (carton ou sac).
const constat = (jeu, [id, anomalie, n]) => {
  const t = jeu.palettes.find((p) => p.id === id);
  return `${id}, ${colis(t, n)} ${anomalie === 'manquant' ? (n > 1 ? 'manquants' : 'manquant') : (n > 1 ? 'abîmés' : 'abîmé')}`;
};
const reserves = (jeu, L) => `Réserves signées par Loïc : ${L.slice().sort((a, b) => a[0].localeCompare(b[0])).map((x) => constat(jeu, x)).join(' ; ')}.`;
export const TOUT_CONFORME = 'Tout est conforme, aucune réserve.';
// Les palettes qui portent une réserve ÉCRITE dans la ligne « réserves » : la facile, et la moyenne SAUF la palette de Kervéguen (refusée : elle a sa ligne à part).
const aReserve = (jeu) => aProbleme(jeu).filter((p) => p.client !== 'kerveguen');
// Les choix de la ligne « réserves » (le juste au rang 0). La palette qu'on fausse est la dernière des palettes à réserve.
export function choixReserves(jeu) {
  const L = aReserve(jeu).map((p) => [p.id, p.anomalie, quantite(p)]);
  const cible = L[L.length - 1], piege = duRole(jeu, 'piege');
  const remplace = (x) => L.map((l) => (l === cible ? x : l));
  return [
    reserves(jeu, L),                                          // la juste
    TOUT_CONFORME,
    reserves(jeu, remplace([piege.id, cible[1], cible[2]])),   // la palette au piège à la place de la juste
    reserves(jeu, remplace([cible[0], cible[1], cible[2] + 1])),   // une quantité fausse
  ];
}
// La zone litiges : les colis abîmés (les manquants n'y vont pas, la palette de Kervéguen non plus : elle repart avec Loïc).
const abimes = (p) => { const d = decrit(p), n = quantite(p); return n === 1 ? `le ${d.unite} abîmé de ${p.id}` : `les ${n} ${d.unitePl} abîmés de ${p.id}`; };
export function choixLitiges(jeu) {
  return [`J’ai mis ${avaries(jeu).map(abimes).join(' et ')} en zone litiges.`,
    'J’ai rangé les colis abîmés en stock avec les autres.', 'J’ai rendu les colis abîmés à Loïc.'];
}
// La ligne sur la palette de Kervéguen (seulement quand la copie en a une) : la juste dit qu'on ne l'a pas stockée et pourquoi.
export function choixKerveguen() {
  return [`Je n’ai pas stocké la palette de Kervéguen : des plants à garder ${FOURCHETTE}.`,
    'J’ai rangé la palette de Kervéguen au rack du fond, le plus frais.',
    'La palette de Kervéguen est en ordre : je l’ai stockée.',
    'Je n’ai pas regardé la palette de Kervéguen.'];
}
// La ligne imposée : ce qui a été contrôlé, calculé sur la ramasse (« J'ai contrôlé les 4 palettes de la ramasse : 2 Ar Vag, 2 Agri-Kerlann. »).
export const ligneControle = (jeu) => {
  const n = (c) => jeu.palettes.filter((p) => p.client === c).length;
  return `J’ai contrôlé les ${jeu.palettes.length} palettes de la ramasse : ${CLIENTS_112.filter((c) => n(c) > 0).map((c) => `${n(c)} ${NOM_DIT[c]}`).join(', ')}.`;
};
export const SALUTATIONS = ['Bonjour Erwan,', 'Salut mon pote,', 'Monsieur le directeur,'];
export const finsDe = (prenom) => [`Je reste au quai. ${prenom}`, 'Bisous', 'À plus.'];
// Les lignes qui jugent le CONTENU du compte rendu (3 points) : les réserves, la zone litiges et — s'il y en a une — la palette non stockée. La forme : salutation, fin.
export const lignesContenu = (jeu) => ['reserves', 'litiges', ...(kerveguenDe(jeu) ? ['kerveguen'] : [])];
export const phrasesCompteRendu = (prenom, jeu) => ({ id: PHRASES_ID, melanger: true, lignes: [
  { id: 'salutation', choix: SALUTATIONS.slice(), juste: 0 },
  { id: 'controle', texte: ligneControle(jeu) },
  { id: 'reserves', choix: choixReserves(jeu), juste: 0 },
  { id: 'litiges', choix: choixLitiges(jeu), juste: 0 },
  ...(kerveguenDe(jeu) ? [{ id: 'kerveguen', choix: choixKerveguen(), juste: 0 }] : []),
  { id: 'fin', choix: finsDe(prenom), juste: 0 },
] });
