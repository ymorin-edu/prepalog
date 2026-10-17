// ENT-8.8 — Action, « on vérifie qu'il ne manque rien » : les DONNÉES PURES de la séance (tirage des anomalies, quai d'un élève, phrases du
// compte rendu calculées sur son tirage). Aucun effet de bord, aucune dépendance au navigateur : le contenu (`contenus/action-ent88.js`), les
// questions (`contenus/questions/ENT-8.8.js`), le corrigé (`contenus/corriges/ENT-8.8.js`) et les tests l'importent.
// Brief : `docs/briefs/ENT-8.8-action-controler.md` §6 et §6 bis ; décisions : `docs/briefs/COORDINATION-action.md` §8.4.
//
// LE CAMION : `CAMION_HAVRE` de `contenus/action.js` (pièce FIXE partagée avec ENT-8.7 : 4 palettes, une sorte de produit par palette), lu ici,
// jamais redéfini. Les dimensions des palettes en cartons (largeur × profondeur × couches) sont DÉDUITES de `parCouche` et `couches` :
// 8 par couche → 4 × 2, 6 → 3 × 2, 5 → 5 × 1 (CONSTRUIT : la disposition dans la couche n'est écrite nulle part).
//
// LE TIRAGE (par élève, graine = son identifiant + « |action-controler » ; `tirerJeu` de `core/tirage.js`, comme le quai d'ENT-4.4) :
//   - une palette `facile` : 2 cartons écrasés sur la face AVANT (vus sans tourner la palette) → accepter avec réserves, avarie ;
//   - une palette `moyen` : `ecrase-cache` (1 carton écrasé sur la face ARRIÈRE : vu seulement en faisant le tour) OU `manquant` (2 cartons
//     absents de la couche du dessus, le BL dit la palette pleine) → accepter avec réserves, avarie / manquant ;
//   - une palette `piege` : `couche-normale` — la couche du dessus est à moitié vide ET le BL dit le même nombre → accepter (piège de comptage) ;
//   - la dernière : `conforme`, pleine → accepter.
// Quantités FIXES (décision du chef de chantier, §8.4) : 2 cartons écrasés devant, 1 derrière, 2 manquants ; la couche « normale » a la moitié
// de sa couche du dessus (arrondie au-dessous) : 4 cartons sur 8, 3 sur 6, 2 sur 5 (CONSTRUIT : le brief ne fixait pas ce nombre).
// `verifier` (§6 bis) : 3 palettes différentes pour les 3 rôles (facile, moyen, piège), au moins une avarie, le piège jamais sur une palette dont
// la couche du dessus est déjà incomplète au départ (aucune ne l'est dans `CAMION_HAVRE` : la garde vaut pour un camion modifié plus tard).
// ⚠ Le jeu d'un élève est une fonction de son identifiant ET de ce fichier : changer le tirage changerait les palettes d'un élève qui a déjà
// commencé (guidage : sans conséquence sur une note déjà figée, mais à éviter pendant une séance).
//
// TOUT EST CONSTRUIT : les anomalies, le n° du bon de livraison, les lots, l'étiquette, les dommages de la question Q1.

import { tirerJeu, graineDeBase, niveauEleve } from '../core/tirage.js';
import { CAMION_HAVRE } from './action.js';

export const ID = 'action-controler';
export const ID_VOLET = 'action-ent88';
export const QUAI_ID = 'action-quai2-controler';          // différent de celui d'ENT-8.7 : `db.quais[<id>]` n'est pas cloisonné par séance
export const PHRASES_ID = 'compte-rendu-controle';
export const DOCUMENT = 'Bon de livraison — lettre de voiture';
export const BL_NUMERO = 'HAV-1109-02';                     // CONSTRUIT
export const QTE = { face: 2, cache: 1, manquant: 2 };      // fixes (§8.4)
export const ROLES = ['facile', 'moyen', 'piege', 'conforme'];
export const MOYENS = ['ecrase-cache', 'manquant'];
const ANOMALIE_DU_ROLE = { facile: 'ecrase-face', piege: 'couche-normale', conforme: 'conforme' };
// Décision et motif attendus de chaque anomalie (ce que la vue juge).
export const ATTENDU = {
  'ecrase-face': ['reserves', 'avarie'], 'ecrase-cache': ['reserves', 'avarie'], manquant: ['reserves', 'manquant'],
  'couche-normale': ['accepter', 'aucun'], conforme: ['accepter', 'aucun'],
};
// Le contenu d'un carton, écrit sur l'étiquette (CONSTRUIT, sans aucun nombre de cartons).
const CONTENU = { P1: 'lots de 3 bougies', P2: 'lots de 6 assiettes', P3: 'boîtes de rangement', P4: 'lots de 3 torchons' };

// ─────────────────────────────────────────────────────────────── les palettes du camion, en cartons
export const dims = (p) => { const D = p.parCouche % 2 === 0 ? 2 : 1; return { W: p.parCouche / D, D, L: p.couches }; };
export const PALETTES = CAMION_HAVRE.palettes.map((p) => ({ ...p, ...dims(p) }));
const palette = (id) => PALETTES.find((p) => p.id === id);
// Une palette « incomplète au départ » : moins de cartons que couches × cartons par couche.
const incompleteAuDepart = (id) => { const p = palette(id); return !p || p.cartons !== p.couches * p.parCouche; };
// Les cellules « i,j,k » (i de gauche à droite, j = 0 au fond, D − 1 devant, k = couche, 0 en bas).
const dessus = ({ W, D, L }) => { const c = []; for (let i = 0; i < W; i++) for (let j = 0; j < D; j++) c.push(`${i},${j},${L - 1}`); return c; };
const avant = ({ W, D, L }) => { const c = []; for (let i = 0; i < W; i++) for (let k = 0; k < L - 1; k++) c.push(`${i},${D - 1},${k}`); return c; };
const arriere = ({ W, L }) => { const c = []; for (let i = 0; i < W; i++) for (let k = 0; k < L - 1; k++) c.push(`${i},0,${k}`); return c; };
export const moitieDessus = (p) => Math.floor((p.W * p.D) / 2);

/* ================================================================== le tirage */
function tirer(h) {
  const ordre = h.melanger(PALETTES.map((p) => p.id));
  const moyen = h.choisir(MOYENS);
  const role = { [ordre[0]]: 'facile', [ordre[1]]: 'moyen', [ordre[2]]: 'piege', [ordre[3]]: 'conforme' };
  return { palettes: PALETTES.map((p) => {
    const r = role[p.id], a = r === 'moyen' ? moyen : ANOMALIE_DU_ROLE[r];
    const plein = p.W * p.D * p.L;
    let manque = [];
    const avarie = {};
    if (a === 'ecrase-face') h.prendre(avant(p), QTE.face).forEach((c) => { avarie[c] = [0, 1]; });
    if (a === 'ecrase-cache') h.prendre(arriere(p), QTE.cache).forEach((c) => { avarie[c] = [0, -1]; });
    if (a === 'manquant') manque = h.prendre(dessus(p), QTE.manquant);
    if (a === 'couche-normale') manque = h.prendre(dessus(p), moitieDessus(p));
    return { id: p.id, role: r, anomalie: a, manque, avarie, bl: a === 'couche-normale' ? plein - manque.length : plein };
  }) };
}

// Les contraintes d'équité, en clair (liste vide = jeu conforme ; sinon il est retiré).
export function verifier(jeu) {
  const f = [];
  const P = jeu && jeu.palettes;
  if (!Array.isArray(P) || P.length !== PALETTES.length) return [`il faut ${PALETTES.length} palettes`];
  if (P.map((p) => p.id).join() !== PALETTES.map((p) => p.id).join()) f.push('palettes mal numérotées');
  if ([...P.map((p) => p.role)].sort().join() !== [...ROLES].sort().join()) f.push(`rôles : ${P.map((p) => p.role)}`);
  // Au moins une avarie (la ligne « zone litiges » du compte rendu en dépend).
  if (!P.some((p) => Object.keys(p.avarie || {}).length > 0)) f.push('aucune avarie : la ligne « zone litiges » n’aurait pas de réponse');
  P.forEach((p) => {
    const d = palette(p.id);
    if (!d) return;
    const plein = d.W * d.D * d.L, reel = plein - p.manque.length, av = Object.keys(p.avarie);
    const attendue = p.role === 'moyen' ? MOYENS : [ANOMALIE_DU_ROLE[p.role]];
    if (!attendue.includes(p.anomalie)) f.push(`${p.id} : anomalie ${p.anomalie} pour le rôle ${p.role}`);
    if (p.anomalie === 'couche-normale' && incompleteAuDepart(p.id)) f.push(`${p.id} : le piège sur une palette déjà incomplète au départ`);
    if (new Set(p.manque).size !== p.manque.length || p.manque.some((c) => !dessus(d).includes(c))) f.push(`${p.id} : manquant hors de la couche du dessus`);
    const face = { 'ecrase-face': [avant(d), 1], 'ecrase-cache': [arriere(d), -1] }[p.anomalie];
    if (av.length && (!face || av.some((c) => !face[0].includes(c) || p.avarie[c][0] !== 0 || p.avarie[c][1] !== face[1]))) f.push(`${p.id} : carton écrasé hors de sa face`);
    const ok = {
      'ecrase-face': !p.manque.length && av.length === QTE.face && p.bl === plein,
      'ecrase-cache': !p.manque.length && av.length === QTE.cache && p.bl === plein,
      manquant: p.manque.length === QTE.manquant && !av.length && p.bl === plein,
      'couche-normale': p.manque.length === moitieDessus(d) && p.manque.length > 0 && !av.length && p.bl === reel,
      conforme: !p.manque.length && !av.length && p.bl === plein,
    }[p.anomalie];
    if (!ok) f.push(`${p.id} : quantités hors règle pour ${p.anomalie}`);
  });
  return f;
}
const DECL = { tirer, verifier, essais: 40 };
DECL.secours = tirerJeu(Object.assign({}, DECL, { secours: null }), 'secours-action-ent88').jeu;
if (!DECL.secours) throw new Error('ENT-8.8 : le tirage des anomalies ne donne aucun jeu conforme (tirer et verifier se contredisent)');
export const TIRAGE = DECL;

const jeux = new Map();
// Le jeu d'une graine (l'identifiant de l'élève ; '' : le jeu de référence, vu par l'enseignant), toujours le même pour la même graine.
export function jeuDe(graine) {
  const g = String(graine == null ? '' : graine);
  if (!jeux.has(g)) jeux.set(g, tirerJeu(TIRAGE, `${g}|${ID}`).jeu);
  return jeux.get(g);
}
export const jeuDeBase = (db) => jeuDe(graineDeBase(db));
export const duRole = (jeu, role) => jeu.palettes.find((p) => p.role === role);
// Les palettes à problème, dans l'ordre des palettes (P1 → P4).
export const aProbleme = (jeu) => jeu.palettes.filter((p) => p.role === 'facile' || p.role === 'moyen');
export const quantite = (p) => (p.anomalie === 'manquant' ? p.manque.length : Object.keys(p.avarie).length);
export const reelDe = (p) => { const d = palette(p.id); return d.W * d.D * d.L - p.manque.length; };

/* ================================================================== le quai d'un élève */
export const DEPOSE = { passage: 3, cases: [
  { id: 'allee-1', sol: 'pieton', peinte: false, nom: 'Allée piétonne' },
  { id: 'R1' }, { id: 'R2' }, { id: 'R3' }, { id: 'R4' },
  { id: 'quai3-1', sol: 'autre-quai', legende: 'Quai 3', peinte: false, nom: 'Devant le quai 3' }] };
export const CONSIGNE_SAMIA = 'Les 4 palettes sont au sol. Pour chacune : compte les cartons, fais le tour, lis l’étiquette, puis décide. '
  + 'S’il y a un problème, écris une réserve précise et fais-la signer par Marc. Samia';
// LE NIVEAU DE L'ÉLÈVE (lot 4, 17/10/2026, brief §6 bis) : le quai reçoit `niveau` du moteur (`quai: (graine, { niveau }) => …`).
//   - standard : aides de guidage allumées (règle des couches, détail du comptage, repère, Samia qui explique), feuille de calcul avec rappel ;
//   - confirmé : aides de COMPTAGE éteintes (ni détail, ni règle des couches, ni repère), brouillon libre comme ENT-6.4 ; Samia explique toujours ;
//   - accompagné : le standard, et la consigne de Samia en tête du quai rappelle de faire le tour avant de décider (texte, aucun indice sur une palette).
export const AIDES_GUIDAGE = { regleCouches: true, detailComptage: true, repere: true, chefDeQuai: true, consignes: true };
export const AIDES_CONFIRME = { chefDeQuai: true, consignes: true };
export const RAPPEL_TOUR = 'Fais le tour de la palette avant de décider.';
export const consigneSamia = (niveau) => (niveau === 'accompagne' ? `${CONSIGNE_SAMIA.replace(/ Samia$/, '')} ${RAPPEL_TOUR} Samia` : CONSIGNE_SAMIA);

export function quaiDuJeu(jeu, niveau = 'standard') {
  const confirme = niveau === 'confirme';
  return {
    id: QUAI_ID,
    libelle: 'Le quai 2',
    rendu: 'iso',
    froid: false,
    titre: 'Entrepôt Action — Geodis, Ensuès-la-Redonne (13) — Quai 2, contrôle',
    destinataire: 'Action — Geodis, Ensuès-la-Redonne',
    avertissement: `<b>Samia :</b> « ${consigneSamia(niveau).replace(/ Samia$/, '')} »<br>`
      + 'Le quai est un <b>dessin construit</b>. Les palettes, leurs défauts, le bon de livraison et la lettre de voiture sont <b>construits pour l’exercice</b>.',
    // Le chauffeur a signé, il est reparti : pas de « Recommencer la réception » (la note est le premier bilan).
    recommencer: false,
    commence: 'controle',
    document: DOCUMENT,
    debut: '07:30',
    motifs: ['avarie', 'manquant'],
    lieu: { nom: 'Quai 2', temp: 15, refrigere: false },
    zone: { nom: 'Zone de réception' },
    dechargement: { ouverture: 0.5, parPalette: 1, par: 'cariste', nom: 'Kevin' },
    // Le même sol qu'en ENT-8.7 (variante A) : les palettes sont dessinées dans R1 à R4, la dépose n'est pas rejouée.
    depose: JSON.parse(JSON.stringify(DEPOSE)),
    // Les aides selon le niveau (lot 4) : voir `AIDES_GUIDAGE` / `AIDES_CONFIRME` ci-dessus.
    calcul: confirme ? { forme: 'brouillon' } : { forme: 'feuille', rappel: true },
    aides: { ...(confirme ? AIDES_CONFIRME : AIDES_GUIDAGE) },
    camions: [{
      transporteur: CAMION_HAVRE.transporteur, fournisseur: CAMION_HAVRE.provenance, bl: BL_NUMERO, arrivee: '07:00',
      parole: 'Bonjour. Voici la lettre de voiture et le bon de livraison. J’attends au local chauffeurs.',
      palettes: jeu.palettes.map((t) => {
        const p = palette(t.id), [attendu, motifAttendu] = ATTENDU[t.anomalie];
        return { id: p.id, ref: p.ref, nom: p.designation, bl: t.bl, W: p.W, D: p.D, L: p.L,
          manque: t.manque.slice(), avarie: JSON.parse(JSON.stringify(t.avarie)), attendu, motifAttendu,
          etiq: { ref: p.ref, nom: p.designation.toUpperCase(), poids: CONTENU[p.id], lot: `HAV-${p.ref.slice(-3)}-1109` } };
      }),
    }],
  };
}
// Le quai d'une graine ET d'un niveau (une déclaration neuve à chaque appel : le moteur garde la sienne en cache, par graine et par niveau).
export const quaiDe = (graine, { niveau = 'standard' } = {}) => quaiDuJeu(jeuDe(graine), niveau);
export const quaiDeBase = (db) => quaiDe(graineDeBase(db), { niveau: niveauEleve(db) });

/* ================================================================== le compte rendu à Samia (§6.3), calculé sur le tirage */
const pl = (n, un, des) => `${n} ${n > 1 ? des : un}`;
const constat = (id, anomalie, n) => (anomalie === 'manquant' ? `${id}, ${pl(n, 'carton manquant', 'cartons manquants')}` : `${id}, ${pl(n, 'carton abîmé', 'cartons abîmés')}`);
const reserves = (L) => `Réserves signées par le chauffeur : ${L.slice().sort((a, b) => a[0].localeCompare(b[0])).map((x) => constat(...x)).join(' ; ')}.`;
export function choixReserves(jeu) {
  const F = duRole(jeu, 'facile'), M = duRole(jeu, 'moyen'), P = duRole(jeu, 'piege');
  const f = [F.id, F.anomalie, quantite(F)], m = [M.id, M.anomalie, quantite(M)];
  return [
    reserves([f, m]),                                    // la juste (rang 0)
    'Tout est conforme, aucune réserve.',
    reserves([f, [P.id, M.anomalie, quantite(M)]]),      // une palette fausse (la palette au piège) à la place d'une juste
    reserves([f, [M.id, M.anomalie, quantite(M) + 1]]),  // une quantité fausse
  ];
}
const abimes = (p) => (quantite(p) === 1 ? `le carton abîmé de ${p.id}` : `les ${quantite(p)} cartons abîmés de ${p.id}`);
export function choixLitiges(jeu) {
  const A = aProbleme(jeu).filter((p) => p.anomalie !== 'manquant');
  return [`J’ai mis ${A.map(abimes).join(' et ')} en zone litiges.`,
    'J’ai rangé les cartons abîmés en stock avec les autres.', 'J’ai rendu les cartons abîmés au chauffeur.'];
}
export const LIGNE_RECU = `J’ai contrôlé les ${PALETTES.length} palettes du camion du Havre.`;
export const SALUTATIONS = ['Bonjour Samia,', 'Salut ma grande,', 'Madame la directrice,'];
export const finsDe = (prenom) => [`Je reste au quai. ${prenom}`, 'Bisous', 'À plus.'];
export const phrasesCompteRendu = (prenom, jeu) => ({ id: PHRASES_ID, melanger: true, lignes: [
  { id: 'salutation', choix: SALUTATIONS.slice(), juste: 0 },
  { id: 'recu', texte: LIGNE_RECU },
  { id: 'reserves', choix: choixReserves(jeu), juste: 0 },
  { id: 'litiges', choix: choixLitiges(jeu), juste: 0 },
  { id: 'fin', choix: finsDe(prenom), juste: 0 },
] });

/* ================================================================== la question Q1 (le délai de protestation) */
// La palette du carton ouvert demain : P2 (les assiettes, texte de Cowork) si l'élève l'a ACCEPTÉE sans réserve, sinon sa palette conforme.
// Les dommages sont CONSTRUITS (une phrase par produit).
export const DOMMAGE = {
  P1: ['de bougies', 'des bougies sont cassées'], P2: ['d’assiettes', 'des assiettes sont cassées'],
  P3: ['de boîtes de rangement', 'des boîtes sont fendues'], P4: ['de torchons', 'des torchons sont déchirés'],
};
export function paletteDeQ1(jeu) {
  const P2 = jeu.palettes.find((p) => p.id === 'P2');
  return P2 && (P2.role === 'piege' || P2.role === 'conforme') ? P2 : duRole(jeu, 'conforme');
}
