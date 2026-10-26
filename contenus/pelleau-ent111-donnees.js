// ENT-10.11 — Transports Pelleau, « la palette qui craint la chaleur » : les DONNÉES PURES de la séance (tirage du rang de la palette de
// Kervéguen et de l'anomalie des autres, quai d'un élève, bonne réplique à Loïc, cases de la fiche, phrases du compte rendu calculées sur son
// tirage). Aucun effet de bord, aucune interface, aucun import du moteur (le tirage de `core/tirage.js` est pur) : importé par le contenu
// (`contenus/pelleau-ent111.js`), les questions (`contenus/questions/ENT-10.11.js`) et le corrigé (`contenus/corriges/ENT-10.11.js`, qui se
// charge aussi sous Node). Brief `docs/briefs/ENT-10.11-pelleau-palette-froide.md` ; décisions du chef de chantier :
// `docs/briefs/COORDINATION-pelleau.md` §2 (9 : aucun jour de la semaine ; 10 : ids suffixés ; 13 : aucun chiffre attendu écrit à la main).
// Modèle : ENT-10.9 (`contenus/pelleau-ent109-donnees.js`).
//
// LES QUATRE PALETTES (pièce FIXE, rang tiré) : la palette de la Ferme de Kervéguen (plants de pommes de terre, 4 couches × 8 sacs, étiquette « Conservation :
// entre 4 et 8 °C — craint le gel ») et trois palettes des deux clients habituels, dans cet ordre : Ar Vag (cartons 5 × 8), Agri-Kerlann (SACS 4 × 10),
// Ar Vag. Le RANG de la palette de Kervéguen (P1 à P4) est TIRÉ par élève : les trois autres comblent les rangs restants, dans l'ordre.
// L'entrepôt est AMBIANT SEULEMENT (site Pelleau) : `froid: false` au quai, ce n'est donc pas une marchandise sous température dirigée au sens du
// quai, c'est une palette ambiante dont l'ÉTIQUETTE dit une conservation au frais. Le jugement appartient à la séance : décision « Refuser », motif
// « produit » (voir `DECISIONS`/`ATTENDU`), cases de la fiche, phrases.
//
// LE TIRAGE (par élève, graine = son identifiant + « |pelleau-palette-froide » ; `tirerJeu` de `core/tirage.js`) — brief §6 bis :
//   - la palette de Kervéguen : comptage conforme (32 sacs, la feuille de ramasse dit 32), décision attendue REFUSER (motif « produit ») ;
//   - une palette `probleme`, parmi les trois autres : `ecrase-face` (cartons Ar Vag) ou `perce-face` (sacs Agri-Kerlann) — 2 colis abîmés devant —,
//     `cache` (1 colis abîmé derrière) ou `manquant` (2 colis absents de la couche du dessus) → accepter avec réserves ;
//   - une fois sur deux, un PIÈGE de comptage `couche-normale` sur l'une des deux autres (couche du dessus à moitié vide ET la feuille dit le même
//     nombre → accepter) ; sinon conforme. Les autres : `conforme`, pleine → accepter.
// Quantités FIXES (comme ENT-10.9 / ENT-8.8) : 2 colis abîmés devant, 1 derrière, 2 manquants ; la couche « normale » a la moitié de sa couche du dessus.
// CONSTRUIT : ces nombres, les lots, le n° de la feuille de ramasse, les étiquettes, les phrases.
// ⚠ Le jeu d'un élève est une fonction de son identifiant ET de ce fichier : changer le tirage changerait les palettes d'un élève qui a déjà commencé.
//
// « QUE, JAMAIS DE COMBIEN » : rien de ce que l'élève lit AVANT l'étiquette (Loïc, la consigne d'Erwan, le quai, les documents) ne dit que la palette
// est froide, ni laquelle des quatre est celle de Kervéguen : la mention « Conservation : … » n'est que dans l'étiquette de ce sac, au zoom de l'étape ③.

import { tirerJeu, graineDeBase, niveauEleve, hasard } from '../core/tirage.js';
import { CLIENTS, PALETTE_AR_VAG, PALETTE_AGRI, PALETTE_KERVEGUEN, clientsDepose } from './pelleau.js';

export const ID = 'pelleau-palette-froide';
export const ID_VOLET = 'pelleau-ent111';
export const QUAI_ID = 'pelleau-quai-111';             // un id par séance : `db.quais[<id>]` n'est pas cloisonné par séance
export const DIALOGUE = 'pelleau-loic-111';
export const FICHES = { devient: 'kerveguen-111' };
export const BLOC_DEVIENT = 'devient';
export const PHRASES_ID = 'pelleau-compte-rendu-111';
export const JOUR = 22;                                // 22 mai 2026 (feuille de route §0.7), jamais le jour de la semaine
export const FR_NUMERO = 'RAM-0522';                   // CONSTRUIT
export const DOCUMENT = { nom: 'Feuille de ramasse', court: 'FR', article: 'la' };
export const QTE = { face: 2, cache: 1, manquant: 2 };
export const MOYENS = ['cache', 'manquant'];

// ─────────────────────────────────────────────────────────────── les clients et les palettes
export const CLIENTS_111 = ['ar-vag', 'agri-kerlann', 'kerveguen'];
export const NOM_DIT = { 'ar-vag': 'Ar Vag', 'agri-kerlann': 'Agri-Kerlann', kerveguen: 'Kervéguen' };
export const nomClient = (id) => CLIENTS[id].nom;
const TYPES = { 'ar-vag': PALETTE_AR_VAG, 'agri-kerlann': PALETTE_AGRI, kerveguen: PALETTE_KERVEGUEN };
const DIMS = { 8: [4, 2], 10: [5, 2] };   // colis par couche → largeur × profondeur du quai (couches = hauteur)
// L'anomalie « facile » de chaque client : des cartons écrasés, des sacs percés (sur la face avant).
export const FACILE_DE = { 'ar-vag': 'ecrase-face', 'agri-kerlann': 'perce-face' };
// Les trois palettes habituelles, dans l'ordre où elles prennent les rangs restants.
const AUTRES = ['ar-vag', 'agri-kerlann', 'ar-vag'];
const palette = (id, client) => {
  const t = TYPES[client], [W, D] = DIMS[t.parCouche];
  return { id, client, ref: t.ref, nom: t.designation, W, D, L: t.couches, unite: t.unite, unitePl: t.unitePl, sacs: t.unite === 'sac' };
};
// La disposition d'un rang de Kervéguen (0 à 3) : quatre palettes P1 à P4.
export function disposition(rang) {
  const clients = AUTRES.slice();
  clients.splice(rang, 0, 'kerveguen');
  return clients.map((c, i) => palette(`P${i + 1}`, c));
}
export const pleine = (p) => p.W * p.D * p.L;
// Un nombre de colis d'une palette, avec SON mot : « 2 cartons », « 1 sac ».
export const colis = (jeu, id, n) => { const p = paletteDe(jeu, id); return `${n} ${n > 1 ? p.unitePl : p.unite}`; };
// Les cellules « i,j,k » (i de gauche à droite, j = 0 au fond, D − 1 devant, k = couche, 0 en bas).
const dessus = ({ W, D, L }) => { const c = []; for (let i = 0; i < W; i++) for (let j = 0; j < D; j++) c.push(`${i},${j},${L - 1}`); return c; };
const avant = ({ W, D, L }) => { const c = []; for (let i = 0; i < W; i++) for (let k = 0; k < L - 1; k++) c.push(`${i},${D - 1},${k}`); return c; };
const arriere = ({ W, L }) => { const c = []; for (let i = 0; i < W; i++) for (let k = 0; k < L - 1; k++) c.push(`${i},0,${k}`); return c; };
export const moitieDessus = (p) => Math.floor((p.W * p.D) / 2);
// Décision et motif attendus de chaque anomalie (ce que la vue juge). La palette de Kervéguen : REFUSER, motif « produit » (le motif du quai qui
// dit « ce produit ne se range pas ici »).
export const ATTENDU = {
  'ecrase-face': ['reserves', 'avarie'], 'perce-face': ['reserves', 'avarie'], cache: ['reserves', 'avarie'], manquant: ['reserves', 'manquant'],
  'couche-normale': ['accepter', 'aucun'], conforme: ['accepter', 'aucun'], kerveguen: ['refuser', 'produit'],
};
// Ce que dit l'étiquette du sac de Kervéguen (au zoom, ligne « Conservation : … »), calculé sur l'univers : « entre 4 et 8 °C — craint le gel ».
export const CONSERVATION = `entre ${PALETTE_KERVEGUEN.temperature.min} et ${PALETTE_KERVEGUEN.temperature.max} °C — craint le gel`;
export const FOURCHETTE = `entre ${PALETTE_KERVEGUEN.temperature.min} et ${PALETTE_KERVEGUEN.temperature.max} °C`;

/* ================================================================== le tirage */
function tirer(h) {
  const rang = h.choisir([0, 1, 2, 3]);
  const P = disposition(rang);
  const autres = P.filter((p) => p.client !== 'kerveguen').map((p) => p.id);
  const [pb, ...reste] = h.melanger(autres);
  const clientPb = P.find((p) => p.id === pb).client;
  const moyen = h.choisir([FACILE_DE[clientPb], ...MOYENS]);
  const piege = h.choisir([true, false]) ? reste[0] : null;
  return { rang, palettes: P.map((p) => {
    const r = p.client === 'kerveguen' ? 'kerveguen' : p.id === pb ? 'probleme' : p.id === piege ? 'piege' : 'conforme';
    const a = r === 'kerveguen' ? 'kerveguen' : r === 'probleme' ? moyen : r === 'piege' ? 'couche-normale' : 'conforme';
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
  const T = jeu && jeu.palettes;
  if (!Array.isArray(T) || T.length !== 4) return ['il faut 4 palettes'];
  if (!(jeu.rang >= 0 && jeu.rang <= 3)) return ['rang de Kervéguen hors de 0 à 3'];
  const D = disposition(jeu.rang);
  if (T.map((p) => p.id).join() !== D.map((p) => p.id).join()) f.push('palettes mal numérotées');
  const nb = (r) => T.filter((p) => p.role === r).length;
  if (nb('kerveguen') !== 1 || nb('probleme') !== 1 || nb('piege') > 1 || nb('kerveguen') + nb('probleme') + nb('piege') + nb('conforme') !== 4) {
    f.push(`rôles : ${T.map((p) => p.role)}`);
  }
  // Le rang : la palette de Kervéguen est bien à son rang, et personne d'autre n'est de Kervéguen.
  if (!T[jeu.rang] || T[jeu.rang].client !== 'kerveguen' || T.filter((p) => p.client === 'kerveguen').length !== 1) f.push('rang de Kervéguen incohérent');
  T.forEach((p) => {
    const d = D.find((x) => x.id === p.id);
    if (!d) return;
    if (p.client !== d.client) f.push(`${p.id} : client ${p.client}`);
    const plein = pleine(d), reel = plein - p.manque.length, av = Object.keys(p.avarie);
    const attendue = p.role === 'kerveguen' ? ['kerveguen'] : p.role === 'probleme' ? [FACILE_DE[d.client], ...MOYENS]
      : p.role === 'piege' ? ['couche-normale'] : ['conforme'];
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
      kerveguen: !p.manque.length && !av.length && p.bl === plein,
    }[p.anomalie];
    if (!ok) f.push(`${p.id} : quantités hors règle pour ${p.anomalie}`);
  });
  return f;
}
const DECL = { tirer, verifier, essais: 40 };
DECL.secours = tirerJeu(Object.assign({}, DECL, { secours: null }), 'secours-pelleau-ent111').jeu;
if (!DECL.secours) throw new Error('ENT-10.11 : le tirage des palettes ne donne aucun jeu conforme (tirer et verifier se contredisent)');
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
// Les palettes d'un jeu, avec leur géométrie (W, D, L, unité…) : `{ ...palette, ...tirage }`.
export const palettesDe = (jeu) => { const D = disposition(jeu.rang); return jeu.palettes.map((t) => ({ ...D.find((d) => d.id === t.id), ...t })); };
export const paletteDe = (jeu, id) => palettesDe(jeu).find((p) => p.id === id);
export const duRole = (jeu, role) => jeu.palettes.find((p) => p.role === role);
// La palette de Kervéguen, la palette à problème, et les DEUX autres (dans l'ordre des palettes : P1 → P4).
export const kerveguenDe = (jeu) => duRole(jeu, 'kerveguen');
export const problemeDe = (jeu) => duRole(jeu, 'probleme');
export const autresDe = (jeu) => jeu.palettes.filter((p) => p.role === 'piege' || p.role === 'conforme');
export const quantite = (p) => (p.anomalie === 'manquant' ? p.manque.length : Object.keys(p.avarie).length);
export const reelDe = (jeu, p) => pleine(paletteDe(jeu, p.id)) - p.manque.length;

/* ================================================================== le quai d'un élève */
// Les 7 cases de la dépose : l'allée piétonne, 2 cases Ar Vag, 2 cases Agri-Kerlann, 1 case Kervéguen, devant le quai B. La dépose n'est pas jouée
// (`commence: 'controle'`) : chaque palette est dessinée dans la première case libre de son client.
export const DEPOSE = { passage: 3, cases: [
  { id: 'allee-1', sol: 'pieton', peinte: false, nom: 'Allée piétonne' },
  { id: 'AV1', client: 'ar-vag' }, { id: 'AV2', client: 'ar-vag' },
  { id: 'AK1', client: 'agri-kerlann' }, { id: 'AK2', client: 'agri-kerlann' },
  { id: 'KV1', client: 'kerveguen' },
  { id: 'quaiB-1', sol: 'autre-quai', legende: 'Quai B', peinte: false, nom: 'Devant le quai B' }] };
export const CLIENTS_DEPOSE = clientsDepose(CLIENTS_111);
// La consigne d'Erwan, le nombre de palettes CALCULÉ ; aucune palette nommée, aucun client, rien sur le froid.
export const consigneErwan = () => 'Les 4 palettes de ce matin sont triées. Pour chacune : compte, fais le tour, lis l’étiquette, puis décide. '
  + 'Un problème ? Une réserve précise sur la feuille de ramasse, et Loïc la signe.';
// LE NIVEAU DE L'ÉLÈVE : standard et accompagné = aides de guidage allumées (règle des couches, détail du comptage, repère, explications, feuille de
// calcul avec rappel) ; confirmé = aides de COMPTAGE éteintes (brouillon libre), aucun bonus.
export const AIDES_GUIDAGE = { regleCouches: true, detailComptage: true, repere: true, chefDeQuai: true, consignes: true };
export const AIDES_CONFIRME = { chefDeQuai: true, consignes: true };
// Le motif du refus, tel que l'élève le lit dans le menu : il ne dit rien du froid (le menu est le même pour les quatre palettes).
export const LIBELLE_PRODUIT = 'Ne se stocke pas ici';

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
    recommencer: false,
    commence: 'controle',
    document: { ...DOCUMENT },
    debut: '08:00',
    unite: { un: 'colis', des: 'colis' },   // un quai mêlé de sacs et de cartons (« colis » : le singulier « coli » n'existe pas)
    motifs: ['avarie', 'manquant', 'produit'],
    libelles: { avarie: { nom: 'Colis abîmé', precision: 'écrasé ou percé', adjectif: 'abîmé' }, produit: { nom: LIBELLE_PRODUIT } },
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
      parole: 'La feuille de ramasse, tu l’as. J’attends au local.',
      palettes: palettesDe(jeu).map((t, n) => {
        const [attendu, motifAttendu] = ATTENDU[t.anomalie];
        return { id: t.id, client: t.client, ...(t.sacs ? { forme: 'sacs' } : {}), ref: t.ref, nom: t.nom, bl: t.bl, W: t.W, D: t.D, L: t.L,
          manque: t.manque.slice(), avarie: JSON.parse(JSON.stringify(t.avarie)), attendu, motifAttendu,
          // La conservation : seulement sur l'étiquette du sac de Kervéguen (au zoom, ligne « Conservation : … »), nulle part ailleurs.
          ...(t.client === 'kerveguen' ? { conservation: CONSERVATION } : {}),
          // L'étiquette d'un colis : « 1 carton » / « 1 sac », jamais un total.
          etiq: { ref: t.ref, nom: t.nom.toUpperCase(), poids: `1 ${t.unite}`, lot: `${t.ref}-0522-${n + 1}` } };
      }),
    }],
  };
}
// Le quai d'une graine ET d'un niveau (une déclaration neuve à chaque appel : le moteur garde la sienne en cache, par graine et par niveau).
export const quaiDe = (graine, { niveau = 'standard' } = {}) => quaiDuJeu(jeuDe(graine), niveau);
export const quaiDeBase = (db) => quaiDe(graineDeBase(db || {}), { niveau: niveauEleve(db || {}) });

/* ================================================================== la bonne réplique à Loïc */
// UNE réplique ; les trois réponses maladroites font réagir Loïc (« Comme tu veux. », pas de leçon) ET font avancer (`accepte`) : l'élève qui cède
// continue, et c'est au quai qu'il pourra se rattraper (erreur induite). Les clés ne changent jamais (la réponse rangée est la clé).
export const REPLIQUES = [
  { id: 'kerveguen', dit: 'Salut ! Dans la ramasse, il y a une palette de Kervéguen. Ils veulent qu’on la garde deux jours. Mets-la au rack, c’est pas grave.',
    choix: [
      { v: 'etiquette', juste: true, lib: 'Je lis d’abord l’étiquette, et je demande à Erwan avant de la ranger.' },
      { v: 'rack', lib: 'D’accord, je la mets au rack.', reaction: 'Comme tu veux.', accepte: true },
      { v: 'dehors', lib: 'Je la mets dehors, il fait frais.', reaction: 'Comme tu veux.', accepte: true },
      { v: 'ignorer', lib: 'Je ne la regarde pas, ce n’est pas mon client.', reaction: 'Comme tu veux.', accepte: true },
    ] },
];
export const JUSTE_DIALOGUE = { kerveguen: REPLIQUES[0].choix.find((c) => c.juste).v };
export const FIN_DIALOGUE = 'Moi, je suis au local. À tout à l’heure.';

/* ================================================================== la fiche « Que devient la palette de Kervéguen ? » */
// Les clés sont neutres ; l'ordre affiché est tiré par élève (`melangerPour`). Justes : elle repart (température dirigée) ET Maëlys prévient la ferme.
export const CASES_DEVIENT = [
  { v: 'repart', lib: 'Elle repart avec Loïc, dans un camion à température dirigée (avec du froid)', juste: true },
  { v: 'maelys', lib: 'Maëlys prévient la Ferme de Kervéguen', juste: true },
  { v: 'fond', lib: 'On la range au rack du fond, le plus frais' },
  { v: 'quai', lib: 'On la laisse deux jours sur le quai' },
  { v: 'dehors', lib: 'On la met dehors' },
];
export const JUSTES_DEVIENT = CASES_DEVIENT.filter((c) => c.juste).map((c) => c.v);
// Ce que l'élève a coché est exactement le juste : les deux justes, rien de trop.
export const devientJuste = (coches) => CASES_DEVIENT.every((c) => !!c.juste === (Array.isArray(coches) && coches.includes(c.v)));
// L'ordre des cases, tiré par élève (sans graine : l'ordre déclaré).
export const melangerPour = (db, quoi, L) => { const g = graineDeBase(db || {}); return g ? hasard(`${g}|${ID}|${quoi}`).melanger(L) : L.slice(); };

/* ================================================================== le compte rendu à Erwan, calculé sur le tirage */
const constat = (jeu, id, anomalie, n) => `${id}, ${colis(jeu, id, n)} ${anomalie === 'manquant' ? (n > 1 ? 'manquants' : 'manquant') : (n > 1 ? 'abîmés' : 'abîmé')}`;
const reserves = (jeu, L) => `Réserves signées par Loïc : ${L.slice().sort((a, b) => a[0].localeCompare(b[0])).map((x) => constat(jeu, ...x)).join(' ; ')}.`;
export const TOUT_CONFORME = 'Tout est conforme, aucune réserve.';
// Les choix de la ligne « réserves » (le juste au rang 0) : une seule palette à problème (celle de Kervéguen est refusée, elle a sa ligne à part).
export function choixReserves(jeu) {
  const B = problemeDe(jeu), A = autresDe(jeu)[0];
  const b = [B.id, B.anomalie, quantite(B)];
  return [
    reserves(jeu, [b]),                                    // la juste
    TOUT_CONFORME,
    reserves(jeu, [[A.id, B.anomalie, quantite(B)]]),      // une palette qui n'a rien à la place de la juste
    reserves(jeu, [[B.id, B.anomalie, quantite(B) + 1]]),  // une quantité fausse
  ];
}
// La ligne sur la palette de Kervéguen : la juste dit qu'on ne l'a pas stockée et pourquoi (la fourchette est calculée sur l'univers).
export function choixKerveguen() {
  return [`Je n’ai pas stocké la palette de Kervéguen : des plants à garder ${FOURCHETTE}.`,
    'J’ai rangé la palette de Kervéguen au rack du fond, le plus frais.',
    'La palette de Kervéguen est en ordre : je l’ai stockée.',
    'Je n’ai pas regardé la palette de Kervéguen.'];
}
// La ligne imposée : ce qui a été contrôlé (« J'ai contrôlé les 4 palettes de la ramasse : 2 Ar Vag, 1 Agri-Kerlann, 1 Kervéguen. »).
export const ligneControle = () => {
  const n = (c) => (c === 'kerveguen' ? 1 : AUTRES.filter((x) => x === c).length);
  return `J’ai contrôlé les 4 palettes de la ramasse : ${CLIENTS_111.map((c) => `${n(c)} ${NOM_DIT[c]}`).join(', ')}.`;
};
export const SALUTATIONS = ['Bonjour Erwan,', 'Salut Erwan,', 'Monsieur le directeur,'];
export const finsDe = (prenom) => [`Je reste au quai. ${prenom}`, 'Cordialement', 'À plus.'];
export const phrasesCompteRendu = (prenom, jeu) => ({ id: PHRASES_ID, melanger: true, lignes: [
  { id: 'salutation', choix: SALUTATIONS.slice(), juste: 0 },
  { id: 'controle', texte: ligneControle() },
  { id: 'kerveguen', choix: choixKerveguen(), juste: 0 },
  { id: 'reserves', choix: choixReserves(jeu), juste: 0 },
  { id: 'fin', choix: finsDe(prenom), juste: 0 },
] });
