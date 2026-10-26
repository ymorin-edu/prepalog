// ENT-10.10 — Transports Pelleau, « le contrôle, seul » : les DONNÉES PURES de la séance (tirage des anomalies, quai d'un élève, phrases du compte
// rendu calculées sur son tirage). Aucun effet de bord, aucune interface, aucun import du moteur (le tirage de `core/tirage.js` est pur) : importé par
// le contenu (`contenus/pelleau-ent110.js`), les questions (`contenus/questions/ENT-10.10.js`) et le corrigé (`contenus/corriges/ENT-10.10.js`, qui se
// charge aussi sous Node). Brief `docs/briefs/ENT-10.10-pelleau-controle-seul.md` (« comme ENT-10.9 », seul, avec un niveau de plus) ; décisions du chef
// de chantier : `docs/briefs/COORDINATION-pelleau.md` §2 (9 : aucun jour de la semaine ; 10 : ids suffixés ; 12 : les sacs sont DESSINÉS et la question 2
// ne nomme pas le produit, qui est tiré ; 13 : aucun chiffre attendu écrit à la main). Modèle : `contenus/pelleau-ent109-donnees.js` (jamais importé :
// une séance n'importe pas le fichier d'une autre).
//
// LA RAMASSE (tirée) : 4 palettes, 2 d'Ar Vag (cartons, 5 couches × 8) et 2 d'Agri-Kerlann (SACS, 4 couches × 10), dans un ORDRE tiré par élève
// (P1 → P4 : l'ordre où Loïc les a posées, brief §6 bis « celui de la ramasse tirée »). Elles sont déjà triées : chacune est dessinée dans la première
// case libre de son client (dépose par client sous `commence: 'controle'`). Palettes types de l'univers (`PALETTE_AR_VAG`, `PALETTE_AGRI`) ; disposition
// dans la couche CONSTRUITE : 8 → 4 × 2, 10 → 5 × 2.
//
// LE TIRAGE (par élève, graine = son identifiant + « |pelleau-controle-seul » ; `tirerJeu` de `core/tirage.js`) — brief §6 bis :
//   - une palette `facile` : 2 colis abîmés sur la face AVANT : `ecrase-face` (cartons Ar Vag) ou `perce-face` (sacs Agri-Kerlann) → réserves, avarie ;
//   - une palette de L'AUTRE client, `moyen` ou `difficile` (rôle « moyen » dans le code) : `cache` (1 colis abîmé sur la face ARRIÈRE : vu en faisant le
//     tour) ou `manquant` (2 colis absents de la couche du dessus ; la feuille dit la palette pleine), ou, difficile, `produit` : le niveau de plus de ce
//     temps. L'étiquette des sacs d'une palette d'Agri-Kerlann dit l'ENGRAIS (`ENGRAIS`) alors que la feuille de ramasse dit le terreau → réserves, motif
//     « Article différent », la référence lue sur l'étiquette. `produit` ne tombe que sur Agri-Kerlann (seul client qui range deux articles) ; le difficile
//     sort **une fois sur trois** (2 fois sur 3 quand l'autre client est Agri-Kerlann, soit 1/2 × 2/3) ;
//   - une palette `piege` : `couche-normale` — la couche du dessus à moitié vide ET la feuille dit le même nombre → accepter ;
//   - la dernière : `conforme`, pleine → accepter.
//   Les deux palettes à problème sont donc de deux clients différents. Au moins une avarie (la facile en est toujours une). Pas de bonus au confirmé
//   (même camion), aides de comptage éteintes pour tous (le niveau « accompagné » a un rappel).
// Quantités FIXES (construit, reprises d'ENT-10.9) : 2 colis abîmés devant, 1 derrière, 2 manquants ; la couche « normale » a la moitié de sa couche du
// dessus : 4 cartons sur 8 (Ar Vag), 5 sacs sur 10 (Agri-Kerlann).
// ⚠ Le jeu d'un élève est une fonction de son identifiant ET de ce fichier : changer le tirage changerait les palettes d'un élève qui a déjà commencé.
//
// « QUE, JAMAIS DE COMBIEN » : aucun écran ne dit où est l'anomalie ni combien il manque. La feuille de ramasse dit la palette pleine (sauf le piège, où elle
// dit le nombre réel : c'est le piège) ; l'étiquette d'un colis dit « 1 carton » / « 1 sac », jamais un total ; les messages et la consigne d'Erwan ne
// nomment aucune palette et ne disent pas qu'il y a un article différent ; les phrases du compte rendu n'arrivent qu'après la signature.
//
// TOUT EST CONSTRUIT : les anomalies, le n° de la feuille de ramasse, les lots, les étiquettes, l'engrais (référence et désignation), les phrases.

import { tirerJeu, graineDeBase, niveauEleve } from '../core/tirage.js';
import { CLIENTS, PALETTE_AR_VAG, PALETTE_AGRI, clientsDepose } from './pelleau.js';

export const ID = 'pelleau-controle-seul';
export const ID_VOLET = 'pelleau-ent110';
export const QUAI_ID = 'pelleau-quai-110';            // un id par séance : `db.quais[<id>]` n'est pas cloisonné par séance
export const PHRASES_ID = 'pelleau-compte-rendu-110';
export const JOUR = 21;                                // 21 mai 2026 (feuille de route §0.7), jamais le jour de la semaine
export const FR_NUMERO = 'RAM-0521';                   // CONSTRUIT
export const DOCUMENT = { nom: 'Feuille de ramasse', court: 'FR', article: 'la' };
export const QTE = { face: 2, cache: 1, manquant: 2 };
export const ROLES = ['facile', 'moyen', 'piege', 'conforme'];
export const MOYENS = ['cache', 'manquant', 'produit'];
// Ce que dit l'étiquette des sacs de la palette « produit » (CONSTRUIT : l'engrais d'Agri-Kerlann ; même référence et même désignation que la planche
// d'essai du quai, `outils/test/quai-iso.mjs`). La feuille de ramasse, elle, dit le terreau (`PALETTE_AGRI`).
export const ENGRAIS = { ref: 'AK-40210', nom: 'Engrais granulé, sacs de 25 kg' };

// ─────────────────────────────────────────────────────────────── les clients et les palettes
export const CLIENTS_110 = ['ar-vag', 'agri-kerlann'];
export const NOM_DIT = { 'ar-vag': 'Ar Vag', 'agri-kerlann': 'Agri-Kerlann' };
export const nomClient = (id) => CLIENTS[id].nom;
const TYPES = { 'ar-vag': PALETTE_AR_VAG, 'agri-kerlann': PALETTE_AGRI };
const DIMS = { 8: [4, 2], 10: [5, 2] };   // colis par couche → largeur × profondeur du quai (couches = hauteur)
// L'anomalie « facile » de chaque client : des cartons écrasés, des sacs percés (sur la face avant).
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
// Décision et motif attendus de chaque anomalie (ce que la vue juge).
export const ATTENDU = {
  'ecrase-face': ['reserves', 'avarie'], 'perce-face': ['reserves', 'avarie'], cache: ['reserves', 'avarie'], manquant: ['reserves', 'manquant'],
  produit: ['reserves', 'produit'], 'couche-normale': ['accepter', 'aucun'], conforme: ['accepter', 'aucun'],
};
// Les anomalies possibles de la palette « moyen » selon son client (`produit` : Agri-Kerlann seulement).
export const moyensDe = (client) => MOYENS.filter((a) => a !== 'produit' || client === 'agri-kerlann');

/* ================================================================== le tirage */
function tirer(h) {
  // L'ordre de la ramasse : le client de P1, P2, P3, P4.
  const ramasse = h.melanger(['ar-vag', 'ar-vag', 'agri-kerlann', 'agri-kerlann']).map((client, n) => ({ id: `P${n + 1}`, client }));
  const duClient = (c) => ramasse.filter((p) => p.client === c).map((p) => p.id);
  const cF = h.choisir(CLIENTS_110), cM = CLIENTS_110.find((c) => c !== cF);
  const [fa, autreF] = h.melanger(duClient(cF));
  const [mo, autreM] = h.melanger(duClient(cM));
  const [pi, co] = h.melanger([autreF, autreM]);
  // Le difficile (`produit`) une fois sur trois : quand l'autre client est Agri-Kerlann (une fois sur deux), 2 fois sur 3.
  const moyen = cM === 'agri-kerlann' && h.entier(0, 2) !== 0 ? 'produit' : h.choisir(['cache', 'manquant']);
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
  if (P.filter((p) => p.client === 'ar-vag').length !== 2 || P.filter((p) => p.client === 'agri-kerlann').length !== 2) f.push('il faut 2 palettes par client');
  if ([...P.map((p) => p.role)].sort().join() !== [...ROLES].sort().join()) f.push(`rôles : ${P.map((p) => p.role)}`);
  const de = (r) => P.find((p) => p.role === r) || {};
  // Les deux palettes à problème : une de chaque client (brief §6 bis).
  if (de('facile').client && de('facile').client === de('moyen').client) f.push('les deux palettes à problème sont du même client');
  // Au moins une avarie (la ligne « zone litiges » du compte rendu en dépend).
  if (!P.some((p) => Object.keys(p.avarie || {}).length > 0)) f.push('aucune avarie : la ligne « zone litiges » n’aurait pas de réponse');
  P.forEach((p) => {
    if (!TYPES[p.client]) { f.push(`${p.id} : client ${p.client}`); return; }
    const d = decrit(p);
    const plein = d.W * d.D * d.L, reel = plein - p.manque.length, av = Object.keys(p.avarie);
    const attendue = p.role === 'facile' ? [FACILE_DE[p.client]] : p.role === 'moyen' ? moyensDe(p.client) : p.role === 'piege' ? ['couche-normale'] : ['conforme'];
    if (!attendue.includes(p.anomalie)) f.push(`${p.id} : anomalie ${p.anomalie} pour le rôle ${p.role}`);
    if (new Set(p.manque).size !== p.manque.length || p.manque.some((c) => !dessus(d).includes(c))) f.push(`${p.id} : manquant hors de la couche du dessus`);
    const face = { 'ecrase-face': [avant(d), 1], 'perce-face': [avant(d), 1], cache: [arriere(d), -1] }[p.anomalie];
    if (av.length && (!face || av.some((c) => !face[0].includes(c) || p.avarie[c][0] !== 0 || p.avarie[c][1] !== face[1]))) f.push(`${p.id} : colis abîmé hors de sa face`);
    const ok = {
      'ecrase-face': !p.manque.length && av.length === QTE.face && p.bl === plein,
      'perce-face': !p.manque.length && av.length === QTE.face && p.bl === plein,
      cache: !p.manque.length && av.length === QTE.cache && p.bl === plein,
      manquant: p.manque.length === QTE.manquant && !av.length && p.bl === plein,
      produit: !p.manque.length && !av.length && p.bl === plein,
      'couche-normale': p.manque.length === moitieDessus(p) && p.manque.length > 0 && !av.length && p.bl === reel,
      conforme: !p.manque.length && !av.length && p.bl === plein,
    }[p.anomalie];
    if (!ok) f.push(`${p.id} : quantités hors règle pour ${p.anomalie}`);
  });
  return f;
}
const DECL = { tirer, verifier, essais: 40 };
DECL.secours = tirerJeu(Object.assign({}, DECL, { secours: null }), 'secours-pelleau-ent110').jeu;
if (!DECL.secours) throw new Error('ENT-10.10 : le tirage des anomalies ne donne aucun jeu conforme (tirer et verifier se contredisent)');
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
// Les palettes à problème, dans l'ordre de la ramasse (P1 → P4).
export const aProbleme = (jeu) => jeu.palettes.filter((p) => p.role === 'facile' || p.role === 'moyen');
export const quantite = (p) => (p.anomalie === 'manquant' ? p.manque.length : Object.keys(p.avarie).length);
export const reelDe = (p) => pleine(p) - p.manque.length;
// La référence et la désignation que porte l'ÉTIQUETTE de ses colis (celles de la feuille, sauf la palette « produit » : l'engrais).
export const etiquetteDe = (p) => (p.anomalie === 'produit' ? { ref: ENGRAIS.ref, nom: ENGRAIS.nom } : { ref: decrit(p).ref, nom: decrit(p).nom });

/* ================================================================== le quai d'un élève */
// Les 6 cases de la dépose (comme ENT-10.5) : l'allée piétonne, 2 cases Ar Vag, 2 cases Agri-Kerlann, devant le quai B. La dépose n'est pas jouée
// (`commence: 'controle'`) : chaque palette est dessinée dans la première case libre de son client.
export const DEPOSE = { passage: 3, cases: [
  { id: 'allee-1', sol: 'pieton', peinte: false, nom: 'Allée piétonne' },
  { id: 'AV1', client: 'ar-vag' }, { id: 'AV2', client: 'ar-vag' },
  { id: 'AK1', client: 'agri-kerlann' }, { id: 'AK2', client: 'agri-kerlann' },
  { id: 'quaiB-1', sol: 'autre-quai', legende: 'Quai B', peinte: false, nom: 'Devant le quai B' }] };
export const CLIENTS_DEPOSE = clientsDepose(CLIENTS_110);
// La consigne d'Erwan : il est au bureau, l'élève contrôle seul ; aucune palette nommée, aucune anomalie annoncée.
export const consigneErwan = () => 'Je suis au bureau : tu contrôles seul. Pour chaque palette : compte, fais le tour, lis l’étiquette, puis décide. '
  + 'Un problème ? Une réserve précise sur la feuille de ramasse, et Loïc la signe.';
// LE NIVEAU DE L'ÉLÈVE (brief §0 et §6 bis) : standard ET confirmé = aides ÉTEINTES (brouillon libre, personne à côté : Erwan est au bureau), aucun
// bonus ; accompagné = le rappel « Fais le tour de la palette » (`consignes`), le comptage reste un brouillon libre.
export const AIDES_ACCOMPAGNE = { consignes: true };

export function quaiDuJeu(jeu, niveau = 'standard') {
  const accompagne = niveau === 'accompagne';
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
    motifs: ['avarie', 'manquant', 'produit'],
    libelles: { avarie: { nom: 'Colis abîmé', precision: 'écrasé ou percé', adjectif: 'abîmé' }, produit: { nom: 'Article différent' } },
    lieu: { nom: 'Quai A', temp: 15, refrigere: false },
    zone: { nom: 'Zone de réception' },
    dechargement: { ouverture: 0.5, parPalette: 1, par: 'cariste', nom: 'Yann' },
    depose: { ...JSON.parse(JSON.stringify(DEPOSE)), clients: JSON.parse(JSON.stringify(CLIENTS_DEPOSE)) },
    calcul: { forme: 'brouillon' },
    aides: accompagne ? { ...AIDES_ACCOMPAGNE } : {},
    camions: [{
      transporteur: 'Transports Pelleau', fournisseur: 'ramasse de Loïc', bl: FR_NUMERO, arrivee: '07:30',
      // Loïc est un collègue : tutoiement, son prénom plutôt que « le chauffeur » (comme ENT-10.5).
      tutoiement: true, prenomChauffeur: 'Loïc',
      parole: 'La feuille de ramasse, tu l’as. J’attends au local.',
      palettes: jeu.palettes.map((t, n) => {
        const p = decrit(t), e = etiquetteDe(t), [attendu, motifAttendu] = ATTENDU[t.anomalie];
        return { id: p.id, client: p.client, ...(p.sacs ? { forme: 'sacs' } : {}), ref: p.ref, nom: p.nom, bl: t.bl, W: p.W, D: p.D, L: p.L,
          manque: t.manque.slice(), avarie: JSON.parse(JSON.stringify(t.avarie)), attendu, motifAttendu,
          // L'étiquette d'un colis : « 1 carton » / « 1 sac », jamais un total (rien ne dit combien il en manque).
          etiq: { ref: e.ref, nom: e.nom.toUpperCase(), poids: `1 ${p.unite}`, lot: `${e.ref}-0521-${n + 1}` } };
      }),
    }],
  };
}
// Le quai d'une graine ET d'un niveau (une déclaration neuve à chaque appel : le moteur garde la sienne en cache, par graine et par niveau).
export const quaiDe = (graine, { niveau = 'standard' } = {}) => quaiDuJeu(jeuDe(graine), niveau);
export const quaiDeBase = (db) => quaiDe(graineDeBase(db || {}), { niveau: niveauEleve(db || {}) });

/* ================================================================== le compte rendu à Erwan (comme ENT-10.9 §6.3), calculé sur le tirage */
// Ce que dit la ligne d'une palette dans « Réserves signées par Loïc » : `x` = la palette, `o` pour fausser (autre palette, autre quantité, autre référence).
const constat = (x, o = {}) => {
  const id = o.id || x.id, n = o.n != null ? o.n : quantite(x), base = o.pour || x;
  if (x.anomalie === 'produit') return `${id}, article différent (${o.ref || ENGRAIS.ref})`;
  return `${id}, ${colis(base, n)} ${x.anomalie === 'manquant' ? (n > 1 ? 'manquants' : 'manquant') : (n > 1 ? 'abîmés' : 'abîmé')}`;
};
const reserves = (L) => `Réserves signées par Loïc : ${L.slice().sort((a, b) => a.id.localeCompare(b.id)).map((x) => x.texte).join(' ; ')}.`;
export const TOUT_CONFORME = 'Tout est conforme, aucune réserve.';
// Les choix de la ligne « réserves » (le juste au rang 0).
export function choixReserves(jeu) {
  const F = duRole(jeu, 'facile'), M = duRole(jeu, 'moyen'), P = duRole(jeu, 'piege');
  const l = (p, texte) => ({ id: p.id, texte });
  return [
    reserves([l(F, constat(F)), l(M, constat(M))]),                                              // la juste
    TOUT_CONFORME,
    reserves([l(F, constat(F)), l(P, constat(M, { id: P.id, pour: P }))]),                       // la palette au piège à la place de la juste
    reserves([l(F, constat(F)), l(M, M.anomalie === 'produit' ? constat(M, { ref: decrit(M).ref }) : constat(M, { n: quantite(M) + 1 }))]),   // la mauvaise référence, ou une quantité fausse
  ];
}
const abimes = (p) => { const d = decrit(p), n = quantite(p); return n === 1 ? `le ${d.unite} abîmé de ${p.id}` : `les ${n} ${d.unitePl} abîmés de ${p.id}`; };
// Ce qui part en zone litiges : les colis abîmés, et la palette « article différent » entière (on décide avec le client). Les manquants n'y vont pas.
const enLitiges = (p) => (p.anomalie === 'produit' ? `la palette ${p.id}` : abimes(p));
export function choixLitiges(jeu) {
  const A = aProbleme(jeu).filter((p) => p.anomalie !== 'manquant');
  return [`J’ai mis ${A.map(enLitiges).join(' et ')} en zone litiges.`,
    'J’ai rangé les colis abîmés en stock avec les autres.', 'J’ai rendu les colis abîmés à Loïc.'];
}
// La ligne imposée : ce qui a été contrôlé (« J'ai contrôlé les 4 palettes de la ramasse : 2 Ar Vag, 2 Agri-Kerlann. »).
export const ligneControle = () => `J’ai contrôlé les 4 palettes de la ramasse : ${CLIENTS_110.map((c) => `2 ${NOM_DIT[c]}`).join(', ')}.`;
export const SALUTATIONS = ['Bonjour Erwan,', 'Salut Erwan,', 'Monsieur le directeur,'];
export const finsDe = (prenom) => [`Je reste au quai. ${prenom}`, 'Cordialement', 'À plus.'];
export const phrasesCompteRendu = (prenom, jeu) => ({ id: PHRASES_ID, melanger: true, lignes: [
  { id: 'salutation', choix: SALUTATIONS.slice(), juste: 0 },
  { id: 'controle', texte: ligneControle() },
  { id: 'reserves', choix: choixReserves(jeu), juste: 0 },
  { id: 'litiges', choix: choixLitiges(jeu), juste: 0 },
  { id: 'fin', choix: finsDe(prenom), juste: 0 },
] });
