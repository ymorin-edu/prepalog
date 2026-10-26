// ENT-10.9 — Transports Pelleau, « contrôler les palettes des clients » : les DONNÉES PURES de la séance (tirage des anomalies, quai d'un élève,
// phrases du compte rendu calculées sur son tirage). Aucun effet de bord, aucune interface, aucun import du moteur (le tirage de `core/tirage.js` est
// pur) : importé par le contenu (`contenus/pelleau-ent109.js`), les questions (`contenus/questions/ENT-10.9.js`) et le corrigé
// (`contenus/corriges/ENT-10.9.js`, qui se charge aussi sous Node). Brief `docs/briefs/ENT-10.9-pelleau-controler.md` §4, §6, §6 bis ; décisions du
// chef de chantier : `docs/briefs/COORDINATION-pelleau.md` §2 (9 : aucun jour de la semaine ; 10 : ids suffixés ; 12 : les sacs sont DESSINÉS ;
// 13 : aucun chiffre attendu écrit à la main). Modèle : ENT-8.8 (Action, `contenus/action-ent88-donnees.js`), repris en guidage avec des sacs.
//
// LES PALETTES (pièce FIXE, brief §4 étape 1) : P1, P2 Biscuiterie Ar Vag (cartons, 5 couches × 8) ; P3, P4 Agri-Kerlann (SACS, `forme: 'sacs'`,
// 4 couches × 10). Palettes types de l'univers (`PALETTE_AR_VAG`, `PALETTE_AGRI`) ; disposition dans la couche CONSTRUITE : 8 → 4 × 2, 10 → 5 × 2
// (comme ENT-10.5 à 10.8). Elles sont déjà triées : dessinées dans les cases de leur client (dépose par client sous `commence: 'controle'`).
//
// LE TIRAGE (par élève, graine = son identifiant + « |pelleau-controler » ; `tirerJeu` de `core/tirage.js`, comme ENT-8.8) — brief §6.1 et §6 bis :
//   - une palette `facile` : 2 colis abîmés sur la face AVANT (vus sans tourner) : `ecrase-face` (cartons Ar Vag) ou `perce-face` (sacs Agri-Kerlann)
//     → accepter avec réserves, avarie ;
//   - une palette `moyen`, de L'AUTRE CLIENT : `cache` (1 colis abîmé sur la face ARRIÈRE : vu seulement en faisant le tour) OU `manquant` (2 colis
//     absents de la couche du dessus, la feuille de ramasse dit la palette pleine) → accepter avec réserves, avarie / manquant ;
//   - une palette `piege` : `couche-normale` — la couche du dessus à moitié vide ET la feuille dit le même nombre → accepter (piège de comptage) ;
//   - la dernière : `conforme`, pleine → accepter.
//   Le piège et la conforme sont donc une palette de chaque client. Au moins une avarie (la facile en est toujours une).
// Quantités FIXES (comme ENT-8.8) : 2 colis abîmés devant, 1 derrière, 2 manquants ; la couche « normale » a la moitié de sa couche du dessus :
// 4 cartons sur 8 (Ar Vag), 5 sacs sur 10 (Agri-Kerlann). CONSTRUIT : ces nombres (le brief ne les fixait pas, repris d'ENT-8.8).
// ⚠ Le jeu d'un élève est une fonction de son identifiant ET de ce fichier : changer le tirage changerait les palettes d'un élève qui a déjà
// commencé (guidage : sans conséquence sur une note déjà figée, mais à éviter pendant une séance).
//
// « QUE, JAMAIS DE COMBIEN » : aucun écran ne dit où est l'anomalie ni combien il manque. La feuille de ramasse dit la palette pleine (sauf le piège,
// où elle dit le nombre réel : c'est le piège) ; l'étiquette d'un colis dit « 1 carton » / « 1 sac », jamais un total ; les messages et la consigne
// d'Erwan ne nomment aucune palette ; les phrases du compte rendu n'arrivent qu'après la signature (tout est fait).
//
// TOUT EST CONSTRUIT : les anomalies, le n° de la feuille de ramasse, les lots, les étiquettes, les phrases.

import { tirerJeu, graineDeBase, niveauEleve } from '../core/tirage.js';
import { CLIENTS, PALETTE_AR_VAG, PALETTE_AGRI, clientsDepose } from './pelleau.js';

export const ID = 'pelleau-controler';
export const ID_VOLET = 'pelleau-ent109';
export const QUAI_ID = 'pelleau-quai-109';            // un id par séance : `db.quais[<id>]` n'est pas cloisonné par séance
export const PHRASES_ID = 'pelleau-compte-rendu-109';
export const JOUR = 20;                                // 20 mai 2026 (feuille de route §0.7), jamais le jour de la semaine
export const FR_NUMERO = 'RAM-0520';                   // CONSTRUIT
export const DOCUMENT = { nom: 'Feuille de ramasse', court: 'FR', article: 'la' };
export const QTE = { face: 2, cache: 1, manquant: 2 };
export const ROLES = ['facile', 'moyen', 'piege', 'conforme'];
export const MOYENS = ['cache', 'manquant'];

// ─────────────────────────────────────────────────────────────── les clients et les palettes
export const CLIENTS_109 = ['ar-vag', 'agri-kerlann'];
export const NOM_DIT = { 'ar-vag': 'Ar Vag', 'agri-kerlann': 'Agri-Kerlann' };
export const nomClient = (id) => CLIENTS[id].nom;
const TYPES = { 'ar-vag': PALETTE_AR_VAG, 'agri-kerlann': PALETTE_AGRI };
const DIMS = { 8: [4, 2], 10: [5, 2] };   // colis par couche → largeur × profondeur du quai (couches = hauteur)
// L'anomalie « facile » de chaque client : des cartons écrasés, des sacs percés (sur la face avant).
export const FACILE_DE = { 'ar-vag': 'ecrase-face', 'agri-kerlann': 'perce-face' };
const palette = (id, client) => {
  const t = TYPES[client], [W, D] = DIMS[t.parCouche];
  return { id, client, ref: t.ref, nom: t.designation, W, D, L: t.couches, unite: t.unite, unitePl: t.unitePl, sacs: t.unite === 'sac' };
};
export const PALETTES = [palette('P1', 'ar-vag'), palette('P2', 'ar-vag'), palette('P3', 'agri-kerlann'), palette('P4', 'agri-kerlann')];
export const paletteDe = (id) => PALETTES.find((p) => p.id === id);
export const palettesDuClient = (c) => PALETTES.filter((p) => p.client === c);
export const pleine = (p) => p.W * p.D * p.L;
// Un nombre de colis d'une palette, avec SON mot : « 2 cartons », « 1 sac ».
export const colis = (id, n) => { const p = paletteDe(id); return `${n} ${n > 1 ? p.unitePl : p.unite}`; };
// Les cellules « i,j,k » (i de gauche à droite, j = 0 au fond, D − 1 devant, k = couche, 0 en bas).
const dessus = ({ W, D, L }) => { const c = []; for (let i = 0; i < W; i++) for (let j = 0; j < D; j++) c.push(`${i},${j},${L - 1}`); return c; };
const avant = ({ W, D, L }) => { const c = []; for (let i = 0; i < W; i++) for (let k = 0; k < L - 1; k++) c.push(`${i},${D - 1},${k}`); return c; };
const arriere = ({ W, L }) => { const c = []; for (let i = 0; i < W; i++) for (let k = 0; k < L - 1; k++) c.push(`${i},0,${k}`); return c; };
export const moitieDessus = (p) => Math.floor((p.W * p.D) / 2);
// Décision et motif attendus de chaque anomalie (ce que la vue juge).
export const ATTENDU = {
  'ecrase-face': ['reserves', 'avarie'], 'perce-face': ['reserves', 'avarie'], cache: ['reserves', 'avarie'], manquant: ['reserves', 'manquant'],
  'couche-normale': ['accepter', 'aucun'], conforme: ['accepter', 'aucun'],
};

/* ================================================================== le tirage */
function tirer(h) {
  const cF = h.choisir(CLIENTS_109), cM = CLIENTS_109.find((c) => c !== cF);
  const [fa, autreF] = h.melanger(palettesDuClient(cF).map((p) => p.id));
  const [mo, autreM] = h.melanger(palettesDuClient(cM).map((p) => p.id));
  const [pi, co] = h.melanger([autreF, autreM]);
  const moyen = h.choisir(MOYENS);
  const role = { [fa]: 'facile', [mo]: 'moyen', [pi]: 'piege', [co]: 'conforme' };
  return { palettes: PALETTES.map((p) => {
    const r = role[p.id];
    const a = r === 'facile' ? FACILE_DE[p.client] : r === 'moyen' ? moyen : r === 'piege' ? 'couche-normale' : 'conforme';
    let manque = [];
    const avarie = {};
    if (a === 'ecrase-face' || a === 'perce-face') h.prendre(avant(p), QTE.face).forEach((c) => { avarie[c] = [0, 1]; });
    if (a === 'cache') h.prendre(arriere(p), QTE.cache).forEach((c) => { avarie[c] = [0, -1]; });
    if (a === 'manquant') manque = h.prendre(dessus(p), QTE.manquant);
    if (a === 'couche-normale') manque = h.prendre(dessus(p), moitieDessus(p));
    return { id: p.id, client: p.client, role: r, anomalie: a, manque, avarie, bl: a === 'couche-normale' ? pleine(p) - manque.length : pleine(p) };
  }) };
}

// Les contraintes d'équité, en clair (liste vide = jeu conforme ; sinon il est retiré).
export function verifier(jeu) {
  const f = [];
  const P = jeu && jeu.palettes;
  if (!Array.isArray(P) || P.length !== PALETTES.length) return [`il faut ${PALETTES.length} palettes`];
  if (P.map((p) => p.id).join() !== PALETTES.map((p) => p.id).join()) f.push('palettes mal numérotées');
  if ([...P.map((p) => p.role)].sort().join() !== [...ROLES].sort().join()) f.push(`rôles : ${P.map((p) => p.role)}`);
  const de = (r) => P.find((p) => p.role === r) || {};
  // Les deux palettes à problème : une de chaque client (brief §6 bis).
  if (de('facile').client && de('facile').client === de('moyen').client) f.push('les deux palettes à problème sont du même client');
  // Au moins une avarie (la ligne « zone litiges » du compte rendu en dépend).
  if (!P.some((p) => Object.keys(p.avarie || {}).length > 0)) f.push('aucune avarie : la ligne « zone litiges » n’aurait pas de réponse');
  P.forEach((p) => {
    const d = paletteDe(p.id);
    if (!d) return;
    if (p.client !== d.client) f.push(`${p.id} : client ${p.client}`);
    const plein = pleine(d), reel = plein - p.manque.length, av = Object.keys(p.avarie);
    const attendue = p.role === 'facile' ? [FACILE_DE[d.client]] : p.role === 'moyen' ? MOYENS : p.role === 'piege' ? ['couche-normale'] : ['conforme'];
    if (!attendue.includes(p.anomalie)) f.push(`${p.id} : anomalie ${p.anomalie} pour le rôle ${p.role}`);
    if (new Set(p.manque).size !== p.manque.length || p.manque.some((c) => !dessus(d).includes(c))) f.push(`${p.id} : manquant hors de la couche du dessus`);
    const face = { 'ecrase-face': [avant(d), 1], 'perce-face': [avant(d), 1], cache: [arriere(d), -1] }[p.anomalie];
    if (av.length && (!face || av.some((c) => !face[0].includes(c) || p.avarie[c][0] !== 0 || p.avarie[c][1] !== face[1]))) f.push(`${p.id} : colis abîmé hors de sa face`);
    const ok = {
      'ecrase-face': !p.manque.length && av.length === QTE.face && p.bl === plein,
      'perce-face': !p.manque.length && av.length === QTE.face && p.bl === plein,
      cache: !p.manque.length && av.length === QTE.cache && p.bl === plein,
      manquant: p.manque.length === QTE.manquant && !av.length && p.bl === plein,
      'couche-normale': p.manque.length === moitieDessus(d) && p.manque.length > 0 && !av.length && p.bl === reel,
      conforme: !p.manque.length && !av.length && p.bl === plein,
    }[p.anomalie];
    if (!ok) f.push(`${p.id} : quantités hors règle pour ${p.anomalie}`);
  });
  return f;
}
const DECL = { tirer, verifier, essais: 40 };
DECL.secours = tirerJeu(Object.assign({}, DECL, { secours: null }), 'secours-pelleau-ent109').jeu;
if (!DECL.secours) throw new Error('ENT-10.9 : le tirage des anomalies ne donne aucun jeu conforme (tirer et verifier se contredisent)');
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
// Les palettes à problème, dans l'ordre des palettes (P1 → P4).
export const aProbleme = (jeu) => jeu.palettes.filter((p) => p.role === 'facile' || p.role === 'moyen');
export const quantite = (p) => (p.anomalie === 'manquant' ? p.manque.length : Object.keys(p.avarie).length);
export const reelDe = (p) => pleine(paletteDe(p.id)) - p.manque.length;

/* ================================================================== le quai d'un élève */
// Les 6 cases de la dépose (comme ENT-10.5) : l'allée piétonne, 2 cases Ar Vag, 2 cases Agri-Kerlann, devant le quai B. La dépose n'est pas jouée
// (`commence: 'controle'`) : chaque palette est dessinée dans la première case libre de son client.
export const DEPOSE = { passage: 3, cases: [
  { id: 'allee-1', sol: 'pieton', peinte: false, nom: 'Allée piétonne' },
  { id: 'AV1', client: 'ar-vag' }, { id: 'AV2', client: 'ar-vag' },
  { id: 'AK1', client: 'agri-kerlann' }, { id: 'AK2', client: 'agri-kerlann' },
  { id: 'quaiB-1', sol: 'autre-quai', legende: 'Quai B', peinte: false, nom: 'Devant le quai B' }] };
export const CLIENTS_DEPOSE = clientsDepose(CLIENTS_109);
// La consigne d'Erwan (brief §4, étape 1), le nombre de palettes CALCULÉ ; aucune palette nommée.
export const consigneErwan = () => `Les ${PALETTES.length} palettes de ce matin sont triées. Pour chacune : compte, fais le tour, lis l’étiquette, puis décide. `
  + 'Un problème ? Une réserve précise sur la feuille de ramasse, et Loïc la signe.';
// LE NIVEAU DE L'ÉLÈVE (brief §6 bis) : standard et accompagné = aides de guidage allumées (règle des couches, détail du comptage, repère,
// explications, feuille de calcul avec rappel) ; confirmé = aides de COMPTAGE éteintes (brouillon libre), aucun bonus.
export const AIDES_GUIDAGE = { regleCouches: true, detailComptage: true, repere: true, chefDeQuai: true, consignes: true };
export const AIDES_CONFIRME = { chefDeQuai: true, consignes: true };

export function quaiDuJeu(jeu, niveau = 'standard') {
  const confirme = niveau === 'confirme';
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
    // Loïc a signé, il est reparti : pas de « Recommencer la réception » (la note est le premier bilan).
    recommencer: false,
    commence: 'controle',
    document: { ...DOCUMENT },
    debut: '08:00',
    unite: { un: 'colis', des: 'colis' },   // un quai mêlé de sacs et de cartons (« colis » : le singulier « coli » n'existe pas)
    motifs: ['avarie', 'manquant'],
    libelles: { avarie: { nom: 'Colis abîmé', precision: 'écrasé ou percé', adjectif: 'abîmé' } },
    lieu: { nom: 'Quai A', temp: 15, refrigere: false },
    zone: { nom: 'Zone de réception' },
    dechargement: { ouverture: 0.5, parPalette: 1, par: 'cariste', nom: 'Yann' },
    depose: { ...JSON.parse(JSON.stringify(DEPOSE)), clients: JSON.parse(JSON.stringify(CLIENTS_DEPOSE)) },
    calcul: confirme ? { forme: 'brouillon' } : { forme: 'feuille', rappel: true },
    aides: { ...(confirme ? AIDES_CONFIRME : AIDES_GUIDAGE) },
    camions: [{
      transporteur: 'Transports Pelleau', fournisseur: 'ramasse de Loïc', bl: FR_NUMERO, arrivee: '07:30',
      // Loïc est un collègue : tutoiement, son prénom plutôt que « le chauffeur » (comme ENT-10.5).
      tutoiement: true, prenomChauffeur: 'Loïc',
      // 20/10/2026 (brief §4, « Je signe sous tes réserves. ») : la réplique de Loïc après la signature. Le bon jeu signe toujours avec des réserves (deux palettes à problème,
      // aucune à refuser) : la phrase « sous tes réserves » est donc celle de la signature ordinaire ; celle avec refus ne s'entend que sur un mauvais choix.
      paroleSignee: { sansRefus: 'Je signe sous tes réserves. Bonne journée !', avecRefus: 'Je signe sous tes réserves. Je recharge ce que tu refuses et j’y vais. Bonne journée !' },
      parole: 'La feuille de ramasse, tu l’as. J’attends au local.',
      palettes: jeu.palettes.map((t, n) => {
        const p = paletteDe(t.id), [attendu, motifAttendu] = ATTENDU[t.anomalie];
        return { id: p.id, client: p.client, ...(p.sacs ? { forme: 'sacs' } : {}), ref: p.ref, nom: p.nom, bl: t.bl, W: p.W, D: p.D, L: p.L,
          manque: t.manque.slice(), avarie: JSON.parse(JSON.stringify(t.avarie)), attendu, motifAttendu,
          // L'étiquette d'un colis : « 1 carton » / « 1 sac », jamais un total (rien ne dit combien il en manque).
          etiq: { ref: p.ref, nom: p.nom.toUpperCase(), poids: `1 ${p.unite}`, lot: `${p.ref}-0520-${n + 1}` } };
      }),
    }],
  };
}
// Le quai d'une graine ET d'un niveau (une déclaration neuve à chaque appel : le moteur garde la sienne en cache, par graine et par niveau).
export const quaiDe = (graine, { niveau = 'standard' } = {}) => quaiDuJeu(jeuDe(graine), niveau);
export const quaiDeBase = (db) => quaiDe(graineDeBase(db || {}), { niveau: niveauEleve(db || {}) });

/* ================================================================== le compte rendu à Erwan (§6.3), calculé sur le tirage */
const constat = (id, anomalie, n) => `${id}, ${colis(id, n)} ${anomalie === 'manquant' ? (n > 1 ? 'manquants' : 'manquant') : (n > 1 ? 'abîmés' : 'abîmé')}`;
const reserves = (L) => `Réserves signées par Loïc : ${L.slice().sort((a, b) => a[0].localeCompare(b[0])).map((x) => constat(...x)).join(' ; ')}.`;
export const TOUT_CONFORME = 'Tout est conforme, aucune réserve.';
// Les choix de la ligne « réserves » (le juste au rang 0).
export function choixReserves(jeu) {
  const F = duRole(jeu, 'facile'), M = duRole(jeu, 'moyen'), P = duRole(jeu, 'piege');
  const f = [F.id, F.anomalie, quantite(F)], m = [M.id, M.anomalie, quantite(M)];
  return [
    reserves([f, m]),                                    // la juste
    TOUT_CONFORME,
    reserves([f, [P.id, M.anomalie, quantite(M)]]),      // la palette au piège à la place de la juste
    reserves([f, [M.id, M.anomalie, quantite(M) + 1]]),  // une quantité fausse
  ];
}
const abimes = (p) => { const d = paletteDe(p.id), n = quantite(p); return n === 1 ? `le ${d.unite} abîmé de ${p.id}` : `les ${n} ${d.unitePl} abîmés de ${p.id}`; };
export function choixLitiges(jeu) {
  const A = aProbleme(jeu).filter((p) => p.anomalie !== 'manquant');
  return [`J’ai mis ${A.map(abimes).join(' et ')} en zone litiges.`,
    'J’ai rangé les colis abîmés en stock avec les autres.', 'J’ai rendu les colis abîmés à Loïc.'];
}
// La ligne imposée : ce qui a été contrôlé (« J'ai contrôlé les 4 palettes de la ramasse : 2 Ar Vag, 2 Agri-Kerlann. »).
export const ligneControle = () => `J’ai contrôlé les ${PALETTES.length} palettes de la ramasse : ${CLIENTS_109.map((c) => `${palettesDuClient(c).length} ${NOM_DIT[c]}`).join(', ')}.`;
export const SALUTATIONS = ['Bonjour Erwan,', 'Salut Erwan,', 'Monsieur le directeur,'];
export const finsDe = (prenom) => [`Je reste au quai. ${prenom}`, 'Cordialement', 'À plus.'];
export const phrasesCompteRendu = (prenom, jeu) => ({ id: PHRASES_ID, melanger: true, lignes: [
  { id: 'salutation', choix: SALUTATIONS.slice(), juste: 0 },
  { id: 'controle', texte: ligneControle() },
  { id: 'reserves', choix: choixReserves(jeu), juste: 0 },
  { id: 'litiges', choix: choixLitiges(jeu), juste: 0 },
  { id: 'fin', choix: finsDe(prenom), juste: 0 },
] });
