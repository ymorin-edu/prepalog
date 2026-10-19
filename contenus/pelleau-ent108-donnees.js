// ENT-10.8 — Transports Pelleau, « évaluation : recevoir le camion de ramasse » : les DONNÉES PURES de la séance (le jeu tiré de chaque élève : planning,
// répartition des palettes, ordre dans le camion, défaut du quai, écart ; la feuille de ramasse et les annonces qui s'en CALCULENT ; le quai, le dialogue
// avec Loïc). Aucun effet de bord, aucune interface, aucun import du moteur (le tirage de `core/tirage.js` est pur) : importé par le contenu
// (`contenus/pelleau-ent108.js`), les questions (`contenus/questions/ENT-10.8.js`) et le corrigé (`contenus/corriges/ENT-10.8.js`, qui se charge aussi
// sous Node). Brief `docs/briefs/ENT-10.8-pelleau-evaluation-reception.md` ; décisions du chef de chantier : `docs/briefs/COORDINATION-pelleau.md` §2
// (9 : aucun jour de la semaine dans un document ; 10 : ids suffixés ; 13 : aucun chiffre attendu écrit à la main).
//
// ÉVALUATION (copie rendue) : la structure d'ENT-10.6 (quai tiré par élève, dépose par client) et le modèle d'ENT-8.10 (copie, rien ne dit juste ou faux,
// une seule remise). Le jeu d'une graine (`jeuDe`) se tire avec `tirerJeu` (core/tirage.js) : un tirage qui ne passe pas `ecartsJeu` est retiré (jusqu'à
// 40 fois), puis le jeu de secours. Ce qui est TIRÉ (brief §4, §6 bis) :
//   - le planning : l'une de DEUX grilles (Loïc à 7 h 30 au quai A, ou à 7 h 00 au quai B) ; l'heure et le quai se LISENT dans la grille ;
//   - la répartition `2+2` ou `3+1`, l'ordre de sortie, UN défaut du quai (cabine, cale, niveleur, lampe) et UN autre objet en ordre ;
//   - l'écart, QUATRE valeurs à un quart chacune : `aucun` · `moins` (un client a annoncé une palette de plus que ce que Loïc a chargé) · `plus` (un client
//     a annoncé une palette de moins) · `feuille` (l'ERREUR D'ÉCRITURE d'ENT-10.7 : Loïc a noté une palette chez le mauvais client, la feuille dit +1 chez
//     l'un et −1 chez l'autre ; les annonces et les étiquettes disent vrai). Au plus UN écart par camion ;
//   - le client dont la fiche « Préparer » demande le nombre de palettes annoncées.
//
// CE QUI SE CALCULE (jamais écrit à la main) : l'heure et le quai du planning, le nombre de palettes, les palettes de chaque client, les colis, la feuille
// de ramasse, les annonces, le résultat du rapprochement, les phrases du compte rendu, la réponse attendue de chaque ligne.
//
// RÈGLE « QUE, JAMAIS DE COMBIEN » : AUCUN écran ne dit l'écart. La feuille de ramasse ne porte aucune observation (« 2e palette pas prête » d'ENT-10.6 est
// retirée) ni total ; les annonces disent ce que le client prévoit ; le quai ne dit pas où poser ; l'arrêt du quai dit « 4 palettes triées » (toujours 4) ;
// aucune réaction du cariste ni de Loïc en copie ; Maëlys ne reprend pas ce que l'élève a écrit. Les nombres de chaque client se lisent dans les trois
// documents (feuille, annonces) et se COMPTENT au quai : seul le comptage dans les zones dit si la feuille ou l'annonce se trompe.
//
// CONSTRUIT (dit dans la séance : pied des documents) : les clients (fictifs), le planning des quais, la feuille de ramasse de Loïc, les annonces (courriels
// des clients), le quai et ses cases, le dialogue.

import { tirerJeu, graineDeBase } from '../core/tirage.js';
import { CLIENTS, PALETTE_AR_VAG, PALETTE_AGRI, clientsDepose } from './pelleau.js';

export const ID = 'pelleau-evaluation-reception';
export const ID_VOLET = 'pelleau-ent108';
export const QUAI_ID = 'pelleau-quai-108';
export const DIALOGUE = 'pelleau-loic-108';
export const FICHES = { preparer: 'preparer-108', rapprocher: 'rapprocher-108' };
export const PHRASES_ID = 'pelleau-compte-rendu-108';
export const JOUR = 19;   // 19 mai 2026 (feuille de route §0.7), jamais le jour de la semaine
export const BL = 'RAM-0519';

// ─────────────────────────────────────────────────────────────── les clients de CE camion (univers : `CLIENTS`, tous fictifs)
export const CLIENTS_108 = ['ar-vag', 'agri-kerlann'];
export const NOM_DIT = { 'ar-vag': 'Ar Vag', 'agri-kerlann': 'Agri-Kerlann' };
export const nomClient = (id) => CLIENTS[id].nom;
export const autreClient = (c) => CLIENTS_108.find((x) => x !== c);
const TYPES = { 'ar-vag': PALETTE_AR_VAG, 'agri-kerlann': PALETTE_AGRI };
const DIMS = { 8: [4, 2], 10: [5, 2] };   // colis par couche → largeur × profondeur du quai (couches = longueur)

// ─────────────────────────────────────────────────────────────── le planning des quais (deux grilles ; construit)
// Une seule case contient « Loïc » : l'heure et le quai du camion de ramasse se LISENT là (`placeDeLoic`), jamais écrits ailleurs.
export const HEURES = ['6 h 30', '7 h 00', '7 h 30', '8 h 00', '8 h 30'];
export const QUAIS = ['A', 'B'];
const DEPART = 'Départ vers Rungis', LIVRAISON = 'Livraison (transporteur extérieur)', RAMASSE = 'Ramasse de Loïc (retour)';
export const GRILLES = [
  [['6 h 30', DEPART, ''], ['7 h 00', '', LIVRAISON], ['7 h 30', RAMASSE, ''], ['8 h 00', DEPART, LIVRAISON], ['8 h 30', '', DEPART]],
  [['6 h 30', LIVRAISON, ''], ['7 h 00', '', RAMASSE], ['7 h 30', DEPART, ''], ['8 h 00', '', LIVRAISON], ['8 h 30', DEPART, '']],
];
// Où et quand se trouve Loïc dans une grille : { heure: '7 h 30', quai: 'A', arrivee: '07:30' }.
export function placeDeLoic(grille) {
  for (const [heure, a, b] of GRILLES[grille]) {
    for (const [i, cellule] of [a, b].entries()) {
      if (/Loïc/.test(cellule)) return { heure, quai: QUAIS[i], arrivee: heure.replace(' h ', ':').replace(/^(\d):/, '0$1:') };
    }
  }
  throw new Error(`grille ${grille} : Loïc n’y est pas`);
}

// ─────────────────────────────────────────────────────────────── le jeu tiré d'une graine
export const DEFAUTS = ['cabine', 'cale', 'niveleur', 'lampe'];
export const ECARTS = ['aucun', 'moins', 'plus', 'feuille'];
export const REPARTITIONS = ['2+2', '3+1'];
export const NB_PALETTES = 4;
// Les cases de dépose : 3 par client (une palette par case, jamais de gerbage) ; la plus grande part est de 3 palettes.
export const CASES_PAR_CLIENT = 3;
const PREFIXE = { 'ar-vag': 'AV', 'agri-kerlann': 'AK' };

// Le jeu de secours (donné si 40 tirages de suite ne passent pas `ecartsJeu` : jamais d'élève sans jeu).
const SECOURS = { grille: 0, repartition: '2+2', majoritaire: null, sortie: ['agri-kerlann', 'ar-vag', 'ar-vag', 'agri-kerlann'], defaut: 'lampe', ok: 'cale',
  ecart: 'moins', clientEcart: 'agri-kerlann', clientPrep: 'ar-vag' };

export const comptesDe = (jeu) => Object.fromEntries(CLIENTS_108.map((c) => [c, jeu.sortie.filter((x) => x === c).length]));
// Ce que chaque client a ANNONCÉ (courriel du client, construit) : ce qu'il a donné au conducteur, ± 1 pour le client à l'écart.
export const annoncesDe = (jeu) => {
  const n = comptesDe(jeu);
  return Object.fromEntries(CLIENTS_108.map((c) => [c, n[c] + (c !== jeu.clientEcart ? 0 : jeu.ecart === 'moins' ? 1 : jeu.ecart === 'plus' ? -1 : 0)]));
};
// Ce que Loïc a ÉCRIT sur la feuille de ramasse : ce qu'il a chargé, sauf l'erreur d'écriture (`feuille`) où une palette du client `clientEcart` est notée
// chez l'autre client (−1 chez le premier, +1 chez le second).
export const feuilleDe = (jeu) => {
  const n = comptesDe(jeu);
  return Object.fromEntries(CLIENTS_108.map((c) => [c, n[c] + (jeu.ecart !== 'feuille' ? 0 : c === jeu.clientEcart ? -1 : 1)]));
};

// LE CONTRÔLE d'un jeu (rend les écarts en clair ; [] = conforme). Il porte sur le jeu seul : le quai qui en sort passe en plus `verifierQuai`
// (le moteur le refuse sinon ; le bloc de tests le joue sur 300 graines).
export function ecartsJeu(jeu) {
  const E = [];
  if (!jeu || typeof jeu !== 'object') return ['pas de jeu'];
  if (!Array.isArray(jeu.sortie) || jeu.sortie.length !== NB_PALETTES) return [`il faut ${NB_PALETTES} palettes`];
  if (![0, 1].includes(jeu.grille)) E.push(`grille « ${jeu.grille} » inconnue`);
  if (jeu.sortie.some((c) => !CLIENTS_108.includes(c))) E.push('un client inconnu dans le camion');
  const n = comptesDe(jeu), a = annoncesDe(jeu), f = feuilleDe(jeu);
  const forme = CLIENTS_108.map((c) => n[c]).sort().join('+');
  if (!['2+2', '1+3'].includes(forme)) E.push(`répartition ${forme} (2+2 ou 3+1 attendue)`);
  if ((jeu.repartition === '2+2') !== (forme === '2+2')) E.push(`la répartition annoncée (${jeu.repartition}) n’est pas celle du camion (${forme})`);
  if (CLIENTS_108.some((c) => n[c] < 1)) E.push('un client n’a aucune palette');
  CLIENTS_108.forEach((c) => { if (n[c] > CASES_PAR_CLIENT) E.push(`${c} : ${n[c]} palettes pour ${CASES_PAR_CLIENT} cases`); });
  if (!DEFAUTS.includes(jeu.defaut) || !DEFAUTS.includes(jeu.ok) || jeu.defaut === jeu.ok) E.push(`défaut « ${jeu.defaut} » et point en ordre « ${jeu.ok} » : deux objets différents attendus`);
  if (!ECARTS.includes(jeu.ecart)) E.push(`écart « ${jeu.ecart} » inconnu`);
  if (!CLIENTS_108.includes(jeu.clientPrep)) E.push('client de « Préparer » inconnu');
  const ecartsAnnonce = CLIENTS_108.filter((c) => a[c] !== n[c]), ecartsFeuille = CLIENTS_108.filter((c) => f[c] !== n[c]);
  if (jeu.ecart === 'moins' || jeu.ecart === 'plus') {
    if (ecartsAnnonce.length !== 1 || ecartsAnnonce[0] !== jeu.clientEcart) E.push('l’écart déclaré n’est pas celui des annonces');
    if (ecartsFeuille.length) E.push('la feuille de ramasse se trompe alors que l’écart est avec les annonces');
  } else if (jeu.ecart === 'feuille') {
    if (ecartsAnnonce.length) E.push('une erreur de feuille avec des annonces qui ne correspondent pas au camion');
    if (ecartsFeuille.length !== 2) E.push('une erreur d’écriture touche exactement les deux clients (+1 et −1)');
    if (!CLIENTS_108.includes(jeu.clientEcart) || n[jeu.clientEcart] < 2) E.push('le client dont une palette est mal notée doit en avoir au moins 2');
  } else if (jeu.ecart === 'aucun') {
    if (ecartsAnnonce.length || ecartsFeuille.length) E.push('un écart déclaré « aucun » alors que des documents se trompent');
  }
  if (CLIENTS_108.some((c) => a[c] < 1 || f[c] < 1)) E.push('une annonce ou une ligne de la feuille de moins d’une palette');
  return E;
}
const declTirage = {
  tirer(h) {
    for (let i = 0; i < 4; i++) h.reel();   // les premiers tirages de deux graines voisines (« eleve-1 », « eleve-2 ») se ressemblent : on les laisse passer
    const grille = h.choisir([0, 1]);
    const repartition = h.choisir(REPARTITIONS);
    const majoritaire = repartition === '3+1' ? h.choisir(CLIENTS_108) : null;
    const autre = CLIENTS_108.find((c) => c !== majoritaire);
    const clients = repartition === '2+2' ? ['ar-vag', 'ar-vag', 'agri-kerlann', 'agri-kerlann'] : [majoritaire, majoritaire, majoritaire, autre];
    const sortie = h.melanger(clients);
    const defaut = h.choisir(DEFAUTS);
    const ok = h.choisir(DEFAUTS.filter((d) => d !== defaut));
    const ecart = h.choisir(ECARTS);
    const n = Object.fromEntries(CLIENTS_108.map((c) => [c, sortie.filter((x) => x === c).length]));
    const clientEcart = ecart === 'aucun' ? null : h.choisir(CLIENTS_108.filter((c) => ecart === 'moins' || n[c] >= 2));
    const clientPrep = h.choisir(CLIENTS_108);
    return { grille, repartition, majoritaire, sortie, defaut, ok, ecart, clientEcart, clientPrep };
  },
  verifier: ecartsJeu,
  secours: SECOURS,
};
const memo = new Map();
// Le jeu d'une graine (l'identifiant de l'élève) : le même à chaque appel. Une graine vide (base vide au chargement) a son jeu aussi.
export function jeuDe(graine) {
  const g = String(graine == null ? '' : graine);
  if (!memo.has(g)) memo.set(g, tirerJeu(declTirage, `${g}|${ID}|jeu`));
  return memo.get(g).jeu;
}
// Le jeu est-il le jeu de secours (aucun tirage conforme) ? Pour les tests : zéro secours sur 300 graines.
export const jeuDeSecours = (graine) => { jeuDe(graine); return memo.get(String(graine == null ? '' : graine)).secours; };
export const jeuDeBase = (db) => jeuDe(graineDeBase(db));

// ─────────────────────────────────────────────────────────────── le camion de ramasse (ids P1 à P4 ; elles sortent P4, P3, P2, P1)
// La palette qui sort en premier est la dernière chargée (P4) : `jeu.sortie[0]` est donc le client de P4. Chaque palette est la palette type de son client.
export function palettesDe(jeu) {
  const vus = {};
  return jeu.sortie.map((client, k) => {
    vus[client] = (vus[client] || 0) + 1;
    const t = TYPES[client], [W, D] = DIMS[t.parCouche];
    return { id: `P${NB_PALETTES - k}`, client, ref: t.ref, nom: t.designation, bl: t.colis, W, D, L: t.couches, manque: [], avarie: {}, attendu: 'accepter',
      motifAttendu: 'aucun', etiq: { ref: t.ref, nom: t.designation.toUpperCase(), poids: `1 ${t.unite}`, lot: `${t.ref}-0519-${vus[client]}` } };
  }).reverse();
}
export const palettesClient = (jeu, client) => palettesDe(jeu).filter((p) => p.client === client);
export const nbPalettes = (jeu) => palettesDe(jeu).length;
export const nbClients = (jeu) => new Set(jeu.sortie).size;
export const compte = (jeu, client) => jeu.sortie.filter((c) => c === client).length;
export const annonce = (jeu, client) => annoncesDe(jeu)[client];
export const feuille = (jeu, client) => feuilleDe(jeu)[client];
export const uniteDe = (client, n) => (n > 1 ? TYPES[client].unitePl : TYPES[client].unite);
export const produitDe = (client) => TYPES[client].designation;
export const colisAnnonces = (jeu, client) => annonce(jeu, client) * TYPES[client].colis;
export const colisFeuille = (jeu, client) => feuille(jeu, client) * TYPES[client].colis;
// Le résultat du rapprochement d'un client contre SON ANNONCE : 'conforme', 'manque' (il en manque) ou 'trop' (il y en a trop).
export const resultat = (jeu, client) => { const r = compte(jeu, client), a = annonce(jeu, client); return r === a ? 'conforme' : r < a ? 'manque' : 'trop'; };
export const pal = (n) => `${n} palette${n > 1 ? 's' : ''}`;
// Le client dont une palette est mal notée sur la feuille (`de`) et celui chez qui elle est notée (`chez`) ; `null` hors du cas `feuille`.
export const sensFeuille = (jeu) => (jeu.ecart === 'feuille' ? { de: jeu.clientEcart, chez: autreClient(jeu.clientEcart) } : null);

// ─────────────────────────────────────────────────────────────── le quai (vue quai iso : inspection sur la scène, dépose par client, 8 cases)
export const NOTE = 'C’est noté.';
export const SECURITE_CONSIGNE = 'Avant que Yann entre dans le camion, regarde le quai et le camion. Si quelque chose ne va pas, signale-le à Yann.';
// Les quatre objets que la scène sait montrer ici : l'état sûr, l'état dangereux, les `lib` du bilan. En copie, le cariste répond toujours « C'est noté. ».
export const OBJETS = {
  cabine: { sur: 'vide', danger: 'conduite', libOk: 'Cabine vide, moteur coupé', libKo: 'Loïc au volant, moteur allumé' },
  cale: { sur: 'posee', danger: 'absente', libOk: 'Cale de roue posée', libKo: 'Cale de roue absente' },
  niveleur: { sur: 'pose', danger: 'releve', libOk: 'Niveleur posé', libKo: 'Niveleur relevé, pas posé sur la remorque' },
  lampe: { sur: 'allumee', danger: 'eteinte', libOk: 'Lampe de quai allumée', libKo: 'Lampe de quai éteinte' },
};
export function securiteDe(jeu) {
  const pt = (objet, ok) => ({ id: objet, objet, etat: ok ? OBJETS[objet].sur : OBJETS[objet].danger, ok, lib: ok ? OBJETS[objet].libOk : OBJETS[objet].libKo, repare: NOTE });
  return {
    mode: 'scene',
    consigne: SECURITE_CONSIGNE,
    points: DEFAUTS.filter((o) => o === jeu.defaut || o === jeu.ok).map((o) => pt(o, o !== jeu.defaut)),
    signaler: { qui: 'Yann', rien: NOTE, fin: 'Dis-moi quand on peut décharger.' },
  };
}
// Les 8 cases : l'allée piétonne, 3 cases Ar Vag, 3 cases Agri-Kerlann, devant l'AUTRE quai (celui où Loïc n'est pas). La porte tombe entre les deux zones.
export const depose = (quai) => ({ passage: 4, cases: [
  { id: 'allee-1', sol: 'pieton', peinte: false, nom: 'Allée piétonne' },
  ...CLIENTS_108.flatMap((c) => Array.from({ length: CASES_PAR_CLIENT }, (_, i) => ({ id: `${PREFIXE[c]}${i + 1}`, client: c }))),
  { id: 'autre-quai-1', sol: 'autre-quai', legende: `Quai ${autreQuai(quai)}`, peinte: false, nom: `Devant le quai ${autreQuai(quai)}` }] });
const autreQuai = (q) => QUAIS.find((x) => x !== q);
export const CLIENTS_DEPOSE = clientsDepose(CLIENTS_108);
export const DEPOSE_CASES = depose('A').cases;   // les huit cases (seul le nom du « devant l'autre quai » change avec le quai de Loïc)
export const casesDe = (client) => DEPOSE_CASES.filter((c) => c.client === client).map((c) => c.id);
export const texteArret = (jeu) => `Les ${nbPalettes(jeu)} palettes sont triées par client.`;

export function quaiDuJeu(jeu) {
  const place = placeDeLoic(jeu.grille);
  return {
    id: QUAI_ID, libelle: 'Le quai', rendu: 'iso', froid: false,
    titre: `Transports Pelleau — entrepôt de Gouesnou — Quai ${place.quai}, réception`,
    destinataire: 'Transports Pelleau, entrepôt de Gouesnou',
    avertissement: 'Réels : les Transports Pelleau et leur entrepôt de Gouesnou. Le quai est un <b>dessin construit</b> : ce n’est pas le vrai quai. '
      + 'La ramasse, les clients (entreprises fictives), Loïc, Yann et les cases de dépose sont <b>construits pour l’exercice</b>.',
    lieu: { nom: `Quai ${place.quai}`, temp: 15, refrigere: false },
    zone: { nom: 'Zone de réception' },
    unite: { un: 'colis', des: 'colis' },
    document: { nom: 'Feuille de ramasse', court: 'FR', article: 'la' },
    recommencer: false,
    // Évaluation à plusieurs écrans : le quai s'arrête au déchargement (`arret`) et ne rend jamais la copie ; la copie se rend par « Rendre ma copie ».
    rendCopie: false,
    aides: {},
    dechargement: { ouverture: 0.5, parPalette: 1, par: 'cariste', nom: 'Yann' },
    securite: securiteDe(jeu),
    depose: { ...JSON.parse(JSON.stringify(depose(place.quai))), clients: JSON.parse(JSON.stringify(CLIENTS_DEPOSE)) },
    arret: { etape: 'dechargement', texte: texteArret(jeu) },
    camions: [{
      transporteur: 'Transports Pelleau', fournisseur: 'ramasse de Loïc', bl: BL, arrivee: place.arrivee,
      // Loïc est un collègue : tutoiement (« Oui, tu peux décharger »), son prénom plutôt que « le chauffeur » ; « la » feuille de ramasse.
      tutoiement: true, prenomChauffeur: 'Loïc',
      parole: 'La feuille de ramasse, tu l’as. Je vais au local.',
      // Une copie : le moteur ne doit jamais modifier les palettes que lisent le corrigé et les tests.
      palettes: JSON.parse(JSON.stringify(palettesDe(jeu))),
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
export const quaiDeBase = (db) => quaiDe(graineDeBase(db));

// ─────────────────────────────────────────────────────────────── l'accueil de Loïc (dialogue face à face, collègue : tutoiement, DEUX tours)
// Textes du brief §4, étape 2 (les deux premiers tours d'ENT-10.5). En copie : aucune réaction, la première réponse compte.
export const REPLIQUES = [
  { id: 'feuille', dit: 'Salut ! J’ai la ramasse : Ar Vag et Agri-Kerlann.', choix: [
    { v: 'feuille', juste: true, lib: 'Salut Loïc, tu me donnes ta feuille de ramasse ?' },
    { v: 'decharge', lib: 'Vas-y, décharge.' },
    { v: 'magasin', lib: 'C’est pour quel magasin ?' }] },
  { id: 'regles', dit: 'Tiens. Je reste dans la cabine ?', choix: [
    { v: 'local', juste: true, lib: 'Tu coupes le moteur, tu mets la cale, et tu attends au local pendant qu’on décharge.' },
    { v: 'volant', lib: 'Oui, reste au volant, on fait vite.' },
    { v: 'aider', lib: 'Aide Yann à décharger.' }] },
];
export const JUSTES_DIALOGUE = Object.fromEntries(REPLIQUES.map((r) => [r.id, r.choix.find((c) => c.juste).v]));
export const FIN_DIALOGUE = 'Ça marche. Je file au local.';

// ─────────────────────────────────────────────────────────────── ① la fiche « Préparer » (3 lignes : l'heure, le quai, un client)
export const nombres = (max) => Array.from({ length: max }, (_, i) => ({ v: String(i + 1), lib: String(i + 1) }));
export const CHOIX_HEURES = HEURES.map((h) => ({ v: h, lib: h }));
export const CHOIX_QUAIS = QUAIS.map((q) => ({ v: q, lib: `Quai ${q}` }));
export const LIGNES_PREPARER = [
  { id: 'heure', lib: 'À quelle heure arrive le camion de Loïc ?', choix: CHOIX_HEURES, juste: (jeu) => placeDeLoic(jeu.grille).heure, manque: 'l’heure du camion de Loïc' },
  { id: 'quai', lib: 'À quel quai ?', choix: CHOIX_QUAIS, juste: (jeu) => placeDeLoic(jeu.grille).quai, manque: 'le quai' },
  { id: 'palettes', lib: (jeu) => `Combien de palettes ${NOM_DIT[jeu.clientPrep]} annonce-t-il ?`, max: 5, juste: (jeu) => String(annonce(jeu, jeu.clientPrep)),
    manque: 'le nombre de palettes annoncées' },
];

// ─────────────────────────────────────────────────────────────── ④ la fiche « Rapprocher » (un cadre par client, un cadre pour la feuille)
export const RESULTATS = [{ v: 'conforme', lib: 'conforme' }, { v: 'manque', lib: 'il en manque' }, { v: 'trop', lib: 'il y en a trop' }];
export const champRecues = (client) => `recues-${client}`;
export const champResultat = (client) => `resultat-${client}`;
export const CHAMP_FEUILLE = 'feuille-juste';
export const CHAMP_CORRECTION = 'feuille-corriger';
const deNom = (c) => `d’${NOM_DIT[c]}`;
export const valeurSens = (de, chez) => `${de}>${chez}`;
// Les mêmes trois choix pour TOUS les élèves (la présence d'un choix ne dit rien du jeu) : « juste », ou l'erreur d'écriture dans l'un ou l'autre sens.
export const CHOIX_FEUILLE = [{ v: 'juste', lib: 'juste' },
  ...CLIENTS_108.map((de) => ({ v: valeurSens(de, autreClient(de)), lib: `fausse : une palette ${deNom(de)} est notée chez ${NOM_DIT[autreClient(de)]}` }))];
export const CHOIX_CORRECTION = [{ v: 'rien', lib: 'Rien, elle est juste' }, { v: 'loic', lib: 'Je la fais corriger par Loïc, avec Maëlys' },
  { v: 'rature', lib: 'Je rature la feuille moi-même' }];
// Les réponses attendues de ces deux lignes.
export const feuilleJuste = (jeu) => { const s = sensFeuille(jeu); return s ? valeurSens(s.de, s.chez) : 'juste'; };
export const correctionJuste = (jeu) => (jeu.ecart === 'feuille' ? 'loic' : 'rien');

// ─────────────────────────────────────────────────────────────── ⑤ rendre compte à Maëlys (phrases à choisir)
const CONFORME = 'Tout est conforme aux annonces.';
const MOINS = (c) => `${NOM_DIT[c]} : 1 palette de moins que l’annonce.`;
const PLUS = (c) => `${NOM_DIT[c]} : 1 palette de plus que l’annonce.`;
const FEUILLE = (de) => `La feuille de ramasse se trompe : une palette ${deNom(de)} est notée chez ${NOM_DIT[autreClient(de)]}.`;
// Les choix de la ligne « écart » (ordre déclaré : le juste d'abord). TOUJOURS les quatre mêmes sortes de phrases (conforme, moins, plus, feuille) : la sorte
// des choix ne dit rien du jeu. Le juste suit l'écart tiré ; les trois autres sont des pièges (un seul jamais deux fois la même phrase).
export function choixEcart(jeu) {
  const c = jeu.clientEcart, autre = c ? autreClient(c) : null;
  if (jeu.ecart === 'aucun') return [CONFORME, MOINS('ar-vag'), PLUS('agri-kerlann'), FEUILLE('ar-vag')];
  if (jeu.ecart === 'moins') return [MOINS(c), CONFORME, PLUS(autre), FEUILLE(c)];
  if (jeu.ecart === 'plus') return [PLUS(c), CONFORME, MOINS(autre), FEUILLE(c)];
  return [FEUILLE(c), CONFORME, MOINS(c), PLUS(autre)];
}
// La ligne imposée « reçu » (« 4 palettes : 3 Ar Vag, 1 Agri-Kerlann, triées en zone de réception. ») : ce qui est arrivé, compté au quai.
export const ligneRecu = (jeu) => `${pal(nbPalettes(jeu))} : ${CLIENTS_108.map((c) => `${compte(jeu, c)} ${NOM_DIT[c]}`).join(', ')}, triées en zone de réception.`;
export const SALUTATIONS = ['Salut Maëlys,', 'Madame,', 'Yo !'];
export const fins = (prenom) => [`Je reste à la réception si besoin. ${prenom}`, 'Bisous', 'Ciao.'];
