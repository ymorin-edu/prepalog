// ENT-10.6 — Transports Pelleau, « la ramasse du mercredi » : les DONNÉES PURES de la séance (le jeu tiré de chaque élève : répartition des palettes, ordre
// dans le camion, défaut du quai, écart avec les annonces ; la feuille de ramasse et les annonces qui s'en CALCULENT ; le quai, le dialogue avec Loïc).
// Aucun effet de bord, aucune interface, aucun import du moteur (le tirage de `core/tirage.js` est pur) : importé par le contenu
// (`contenus/pelleau-ent106.js`), les questions (`contenus/questions/ENT-10.6.js`) et le corrigé (`contenus/corriges/ENT-10.6.js`, qui se charge aussi
// sous Node). Brief `docs/briefs/ENT-10.6-pelleau-ramasse-du-mercredi.md` §4, §6 bis ; décisions du chef de chantier :
// `docs/briefs/COORDINATION-pelleau.md` §2 (9 : aucun jour de la semaine dans un document ; 10 : ids suffixés ; 13 : aucun chiffre attendu écrit à la main).
//
// ENTRAÎNEMENT, TOUT EST TIRÉ (brief §6 bis) : le même déroulé qu'ENT-10.5, mais chaque élève a SON camion. Le quai est une FONCTION DE LA GRAINE
// (`quai: quaiDe`, comme ENT-8.7) : la graine est l'identifiant de l'élève, posée une fois par le moteur dans `db.tirage.graine`. Le jeu d'une graine
// (`jeuDe`) se tire avec `tirerJeu` (core/tirage.js) : un tirage qui ne passe pas `ecartsJeu` est retiré (jusqu'à 40 fois), puis le jeu de secours.
//   - répartition : `2+2` ou `3+1` (client majoritaire tiré) ;
//   - ordre : la suite des clients dans l'ordre de SORTIE du camion (les palettes d'un même client ne sont pas forcément à la suite) ; jamais les deux
//     clients rangés en blocs « Ar Vag d'abord », l'ordre d'ENT-10.5 ;
//   - défaut du quai : un parmi `cabine` · `cale` · `niveleur` · `lampe`, et UN autre objet en ordre ;
//   - écart avec les annonces : `aucun` · `moins` (un client a annoncé une palette de plus : la feuille le dit) · `plus` (un client a annoncé une palette
//     de moins : l'annonce est en retard, la feuille et l'étiquette disent ce client). Au plus UN écart par camion.
//
// CE QUI SE CALCULE (jamais écrit à la main) : le nombre de palettes, de clients, les palettes de chaque client, les colis, l'observation de la feuille,
// les annonces, le résultat du rapprochement, les phrases du compte rendu, la réponse attendue de chaque ligne de « Préparer ».
//
// CONSTRUIT (dit dans la séance : pied des documents) : les clients (fictifs), la feuille de ramasse de Loïc, les annonces (courriels des clients), le quai
// A et ses cases, le dialogue (textes du brief, réactions de Loïc écrites par Claude Code), les réponses de Yann devant chaque défaut.

import { hasard, tirerJeu, graineDeBase } from '../core/tirage.js';
import { CLIENTS, PALETTE_AR_VAG, PALETTE_AGRI, clientsDepose } from './pelleau.js';

export const ID = 'pelleau-ramasse-du-mercredi';
export const ID_VOLET = 'pelleau-ent106';
export const QUAI_ID = 'pelleau-quai-106';
export const DIALOGUE = 'pelleau-loic-106';
export const FICHES = { preparer: 'preparer-106', rapprocher: 'rapprocher-106' };
export const PHRASES_ID = 'pelleau-compte-rendu-106';
export const JOUR = 13;   // 13 mai 2026 (feuille de route §0.7), jamais le jour de la semaine

// ─────────────────────────────────────────────────────────────── les clients de CE camion (univers : `CLIENTS`, tous fictifs)
export const CLIENTS_106 = ['ar-vag', 'agri-kerlann'];
export const NOM_DIT = { 'ar-vag': 'Ar Vag', 'agri-kerlann': 'Agri-Kerlann' };
export const nomClient = (id) => CLIENTS[id].nom;
const TYPES = { 'ar-vag': PALETTE_AR_VAG, 'agri-kerlann': PALETTE_AGRI };
const DIMS = { 8: [4, 2], 10: [5, 2] };   // colis par couche → largeur × profondeur du quai (couches = longueur)

// ─────────────────────────────────────────────────────────────── le jeu tiré d'une graine
export const DEFAUTS = ['cabine', 'cale', 'niveleur', 'lampe'];
export const ECARTS = ['aucun', 'moins', 'plus'];
export const REPARTITIONS = ['2+2', '3+1'];
export const NB_PALETTES = 4;
// Les cases de dépose : 3 par client (une palette par case, jamais de gerbage) ; la plus grande part est de 3 palettes.
export const CASES_PAR_CLIENT = 3;
const PREFIXE = { 'ar-vag': 'AV', 'agri-kerlann': 'AK' };

// Le jeu de secours (donné si 40 tirages de suite ne passent pas `ecartsJeu` : jamais d'élève sans jeu).
const SECOURS = { repartition: '2+2', majoritaire: null, sortie: ['ar-vag', 'agri-kerlann', 'ar-vag', 'agri-kerlann'], defaut: 'lampe', ok: 'cale',
  ecart: 'moins', clientEcart: 'agri-kerlann' };

export const comptesDe = (jeu) => Object.fromEntries(CLIENTS_106.map((c) => [c, jeu.sortie.filter((x) => x === c).length]));
// Ce que chaque client a ANNONCÉ (courriel du client, construit) : ce qu'il a donné au conducteur, ± 1 pour le client à l'écart.
export const annoncesDe = (jeu) => {
  const n = comptesDe(jeu);
  return Object.fromEntries(CLIENTS_106.map((c) => [c, n[c] + (c !== jeu.clientEcart ? 0 : jeu.ecart === 'moins' ? 1 : jeu.ecart === 'plus' ? -1 : 0)]));
};
// L'ordre de sortie qu'ENT-10.5 a déjà montré : tous les palettes Ar Vag, puis toutes celles d'Agri-Kerlann.
const enBlocsArVagD = (sortie) => { const a = sortie.filter((c) => c === 'ar-vag').length; return sortie.every((c, i) => c === (i < a ? 'ar-vag' : 'agri-kerlann')); };

// LE CONTRÔLE d'un jeu (rend les écarts en clair ; [] = conforme). Il porte sur le jeu seul : le quai qui en sort passe en plus `verifierQuai`
// (le moteur le refuse sinon ; le bloc de tests le joue sur 300 graines).
export function ecartsJeu(jeu) {
  const E = [];
  if (!jeu || typeof jeu !== 'object') return ['pas de jeu'];
  if (!Array.isArray(jeu.sortie) || jeu.sortie.length !== NB_PALETTES) return [`il faut ${NB_PALETTES} palettes`];
  if (jeu.sortie.some((c) => !CLIENTS_106.includes(c))) E.push('un client inconnu dans le camion');
  const n = comptesDe(jeu), a = annoncesDe(jeu);
  const forme = CLIENTS_106.map((c) => n[c]).sort().join('+');
  if (!['2+2', '1+3'].includes(forme)) E.push(`répartition ${forme} (2+2 ou 3+1 attendue)`);
  if ((jeu.repartition === '2+2') !== (forme === '2+2')) E.push(`la répartition annoncée (${jeu.repartition}) n’est pas celle du camion (${forme})`);
  if (CLIENTS_106.some((c) => n[c] < 1)) E.push('un client n’a aucune palette');
  CLIENTS_106.forEach((c) => { if (n[c] > CASES_PAR_CLIENT) E.push(`${c} : ${n[c]} palettes pour ${CASES_PAR_CLIENT} cases`); });
  if (enBlocsArVagD(jeu.sortie)) E.push('clients rangés en blocs, Ar Vag d’abord (l’ordre d’ENT-10.5)');
  if (!DEFAUTS.includes(jeu.defaut) || !DEFAUTS.includes(jeu.ok) || jeu.defaut === jeu.ok) E.push(`défaut « ${jeu.defaut} » et point en ordre « ${jeu.ok} » : deux objets différents attendus`);
  if (!ECARTS.includes(jeu.ecart)) E.push(`écart « ${jeu.ecart} » inconnu`);
  const ecarts = CLIENTS_106.filter((c) => a[c] !== n[c]);
  if (ecarts.length > 1) E.push(`${ecarts.length} clients à l’écart (au plus un)`);
  if (jeu.ecart === 'aucun' ? ecarts.length !== 0 : ecarts.length !== 1 || ecarts[0] !== jeu.clientEcart) E.push('l’écart déclaré n’est pas celui des annonces');
  if (CLIENTS_106.some((c) => a[c] < 1)) E.push('une annonce de moins d’une palette');
  if (jeu.ecart === 'plus' && jeu.clientEcart && n[jeu.clientEcart] < 2) E.push('un écart « en trop » sur un client qui n’a qu’une palette');
  return E;
}
const declTirage = {
  tirer(h) {
    for (let i = 0; i < 4; i++) h.reel();   // les premiers tirages de deux graines voisines (« eleve-1 », « eleve-2 ») se ressemblent : on les laisse passer
    const repartition = h.choisir(REPARTITIONS);
    const majoritaire = repartition === '3+1' ? h.choisir(CLIENTS_106) : null;
    const autre = CLIENTS_106.find((c) => c !== majoritaire);
    const clients = repartition === '2+2' ? ['ar-vag', 'ar-vag', 'agri-kerlann', 'agri-kerlann'] : [majoritaire, majoritaire, majoritaire, autre];
    const sortie = h.melanger(clients);
    const defaut = h.choisir(DEFAUTS);
    const ok = h.choisir(DEFAUTS.filter((d) => d !== defaut));
    const ecart = h.choisir(ECARTS);
    const n = Object.fromEntries(CLIENTS_106.map((c) => [c, sortie.filter((x) => x === c).length]));
    const clientEcart = ecart === 'aucun' ? null : h.choisir(CLIENTS_106.filter((c) => ecart !== 'plus' || n[c] >= 2));
    return { repartition, majoritaire, sortie, defaut, ok, ecart, clientEcart };
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
      motifAttendu: 'aucun', etiq: { ref: t.ref, nom: t.designation.toUpperCase(), poids: `1 ${t.unite}`, lot: `${t.ref}-0513-${vus[client]}` } };
  }).reverse();
}
export const palettesClient = (jeu, client) => palettesDe(jeu).filter((p) => p.client === client);
export const nbPalettes = (jeu) => palettesDe(jeu).length;
export const nbClients = (jeu) => new Set(jeu.sortie).size;
export const compte = (jeu, client) => jeu.sortie.filter((c) => c === client).length;
export const colisDe = (jeu, client) => palettesClient(jeu, client).reduce((t, p) => t + p.bl, 0);
export const annonce = (jeu, client) => annoncesDe(jeu)[client];
export const colisAnnonces = (jeu, client) => annonce(jeu, client) * TYPES[client].colis;
export const uniteDe = (client, n) => (n > 1 ? TYPES[client].unitePl : TYPES[client].unite);
export const produitDe = (client) => TYPES[client].designation;
// Le résultat du rapprochement d'un client : 'conforme', 'manque' (il en manque) ou 'trop' (il y en a trop).
export const resultat = (jeu, client) => { const r = compte(jeu, client), a = annonce(jeu, client); return r === a ? 'conforme' : r < a ? 'manque' : 'trop'; };
// L'observation de Loïc sur la feuille de ramasse, quand il a chargé moins que l'annonce (« 3e palette pas prête »).
export const observation = (jeu, client) => {
  const r = compte(jeu, client), a = annonce(jeu, client);
  if (r >= a) return '';
  return a - r === 1 ? `${r + 1}e palette pas prête` : `${a - r} palettes pas prêtes`;
};
export const pal = (n) => `${n} palette${n > 1 ? 's' : ''}`;

// ─────────────────────────────────────────────────────────────── le quai A (vue quai iso : inspection sur la scène, dépose par client, 8 cases)
export const SECURITE_CONSIGNE = 'Avant que Yann entre dans le camion, regarde le quai et le camion. Clique sur ce qui ne va pas, puis signale-le à Yann.';
export const SECURITE_CONSIGNE_CONFIRME = 'Avant que Yann entre dans le camion, regarde le quai et le camion.';
// Les quatre objets que la scène sait montrer ici : l'état sûr, l'état dangereux, les `lib` du bilan et la réponse de Yann devant le défaut.
export const OBJETS = {
  cabine: { sur: 'vide', danger: 'conduite', libOk: 'Cabine vide, moteur coupé', libKo: 'Loïc au volant, moteur allumé',
    repare: 'Bien vu : je dis à Loïc de couper le moteur, de me laisser ses clés et d’aller au local.' },
  cale: { sur: 'posee', danger: 'absente', libOk: 'Cale de roue posée', libKo: 'Cale de roue absente', repare: 'Bien vu : je pose la cale.' },
  niveleur: { sur: 'pose', danger: 'releve', libOk: 'Niveleur posé', libKo: 'Niveleur relevé, pas posé sur la remorque', repare: 'Bien vu : je pose le niveleur.' },
  lampe: { sur: 'allumee', danger: 'eteinte', libOk: 'Lampe de quai allumée', libKo: 'Lampe de quai éteinte', repare: 'Bien vu : j’allume la lampe de quai.' },
};
export function securiteDe(jeu, { niveau = 'standard' } = {}) {
  const pt = (objet, ok) => (ok
    ? { id: objet, objet, etat: OBJETS[objet].sur, ok: true, lib: OBJETS[objet].libOk, repare: OBJETS[objet].repare }
    : { id: objet, objet, etat: OBJETS[objet].danger, ok: false, lib: OBJETS[objet].libKo, repare: OBJETS[objet].repare });
  return {
    mode: 'scene',
    consigne: niveau === 'confirme' ? SECURITE_CONSIGNE_CONFIRME : SECURITE_CONSIGNE,
    points: DEFAUTS.filter((o) => o === jeu.defaut || o === jeu.ok).map((o) => pt(o, o !== jeu.defaut)),
    signaler: { qui: 'Yann', rien: 'Là, je ne vois rien qui cloche.' },
    arret: false,   // entraînement : Yann n'arrête pas l'élève qui dit « C'est bon » sans rien signaler, le jalon est ✗ (brief §8, §11)
  };
}
// Les 8 cases : l'allée piétonne, 3 cases Ar Vag, 3 cases Agri-Kerlann, devant le quai B. La porte tombe entre les deux zones (passage 4).
export const DEPOSE = { passage: 4, cases: [
  { id: 'allee-1', sol: 'pieton', peinte: false, nom: 'Allée piétonne', reaction: 'Là, c’est l’allée piétonne : je ne pose pas ici.' },
  ...CLIENTS_106.flatMap((c) => Array.from({ length: CASES_PAR_CLIENT }, (_, i) => ({ id: `${PREFIXE[c]}${i + 1}`, client: c }))),
  { id: 'quaiB-1', sol: 'autre-quai', legende: 'Quai B', peinte: false, nom: 'Devant le quai B', reaction: 'Ça, c’est la zone du quai B.' }] };
export const CLIENTS_DEPOSE = clientsDepose(CLIENTS_106);
export const casesDe = (client) => DEPOSE.cases.filter((c) => c.client === client).map((c) => c.id);
export const texteArret = (jeu) => `Les ${nbPalettes(jeu)} palettes sont triées par client. Le contrôle des colis, ce sera la semaine prochaine.`;

export function quaiDuJeu(jeu, { niveau = 'standard' } = {}) {
  return {
    id: QUAI_ID, libelle: 'Le quai A', rendu: 'iso', froid: false,
    titre: 'Transports Pelleau — entrepôt de Gouesnou — Quai A, réception',
    destinataire: 'Transports Pelleau, entrepôt de Gouesnou',
    avertissement: 'Réels : les Transports Pelleau et leur entrepôt de Gouesnou. Le quai est un <b>dessin construit</b> : ce n’est pas le vrai quai. '
      + 'La ramasse, les clients (entreprises fictives), Loïc, Yann et les cases de dépose sont <b>construits pour l’exercice</b>.',
    lieu: { nom: 'Quai A', temp: 15, refrigere: false },
    zone: { nom: 'Zone de réception' },
    unite: { un: 'colis', des: 'colis' },
    document: { nom: 'Feuille de ramasse', court: 'FR', article: 'la' },
    recommencer: false,
    // Aides éteintes chez le confirmé (brief §0) ; l'accompagné a le contenu standard.
    aides: niveau === 'confirme' ? {} : { consignes: true },
    dechargement: { ouverture: 0.5, parPalette: 1, par: 'cariste', nom: 'Yann' },
    securite: securiteDe(jeu, { niveau }),
    depose: { ...JSON.parse(JSON.stringify(DEPOSE)), clients: JSON.parse(JSON.stringify(CLIENTS_DEPOSE)) },
    arret: { etape: 'dechargement', texte: texteArret(jeu) },
    camions: [{
      transporteur: 'Transports Pelleau', fournisseur: 'ramasse de Loïc', bl: 'RAM-0513', arrivee: '07:30',
      // Loïc est un collègue : tutoiement (« Oui, tu peux décharger »), son prénom plutôt que « le chauffeur » ; « la » feuille de ramasse (comme ENT-10.5).
      tutoiement: true, prenomChauffeur: 'Loïc',
      parole: 'La feuille de ramasse, tu l’as. Je vais au local.',
      // Une copie : le moteur ne doit jamais modifier les palettes que lisent le corrigé et les tests.
      palettes: JSON.parse(JSON.stringify(palettesDe(jeu))),
    }],
  };
}
const cache = new Map();
// Le quai d'une graine ET d'un niveau (le moteur passe `{ niveau, copie }`), toujours le même objet pour la même graine et le même niveau.
export function quaiDe(graine, { niveau = 'standard' } = {}) {
  const g = String(graine == null ? '' : graine), k = `${g}|${niveau}`;
  if (!cache.has(k)) cache.set(k, quaiDuJeu(jeuDe(g), { niveau }));
  return cache.get(k);
}
export const quaiDeBase = (db, niveau = 'standard') => quaiDe(graineDeBase(db), { niveau });

// ─────────────────────────────────────────────────────────────── l'accueil de Loïc (dialogue face à face, collègue : tutoiement, DEUX tours)
// Textes du brief §4, étape 2 (les deux premiers tours d'ENT-10.5 ; Loïc ne dit plus de quel client est la palette du fond). La première réponse compte.
export const REPLIQUES = [
  { id: 'feuille', dit: 'Salut ! J’ai la ramasse : Ar Vag et Agri-Kerlann.', choix: [
    { v: 'feuille', juste: true, lib: 'Salut Loïc, tu me donnes ta feuille de ramasse ?' },
    { v: 'decharge', lib: 'Vas-y, décharge.', reaction: 'Euh… c’est Yann qui décharge, pas moi. Et ma feuille, tu ne la veux pas ?' },
    { v: 'magasin', lib: 'C’est pour quel magasin ?', reaction: 'Un magasin ? Non, c’est la ramasse : les clients nous confient leurs palettes.' }] },
  { id: 'regles', dit: 'Tiens. Je reste dans la cabine ?', choix: [
    { v: 'local', juste: true, lib: 'Tu coupes le moteur, tu mets la cale, et tu attends au local pendant qu’on décharge.' },
    { v: 'volant', lib: 'Oui, reste au volant, on fait vite.', reaction: 'Au volant, moteur allumé ? Erwan ne serait pas d’accord.' },
    { v: 'aider', lib: 'Aide Yann à décharger.', reaction: 'Moi ? Je n’ai pas à toucher au chariot de Yann.' }] },
];
export const JUSTES_DIALOGUE = Object.fromEntries(REPLIQUES.map((r) => [r.id, r.choix.find((c) => c.juste).v]));
export const FIN_DIALOGUE = 'Ça marche. Je file au local.';

// ─────────────────────────────────────────────────────────────── ① la fiche « Préparer la réception » (3 lignes, valeurs LUES dans SES documents)
export const nombres = (max) => Array.from({ length: max }, (_, i) => ({ v: String(i + 1), lib: String(i + 1) }));
export const LIGNES_PREPARER = [
  { id: 'palettes', lib: 'Combien de palettes arrivent ?', max: 6, juste: (jeu) => String(nbPalettes(jeu)), manque: 'le nombre de palettes' },
  { id: 'clients', lib: 'Pour combien de clients ?', max: 4, juste: (jeu) => String(nbClients(jeu)), manque: 'le nombre de clients' },
  { id: 'palettes-ar-vag', lib: 'Combien de palettes Ar Vag ?', max: 4, juste: (jeu) => String(compte(jeu, 'ar-vag')), manque: 'le nombre de palettes Ar Vag' },
];
// La ligne en plus du confirmé (brief §6 bis : « Combien de sacs Agri-Kerlann ? », lue sur la feuille), cachée aux autres. Des multiples du sac type.
const SAC = TYPES['agri-kerlann'].colis;
export const LIGNE_BONUS = { id: 'sacs-agri-kerlann', lib: 'Combien de sacs Agri-Kerlann ?', manque: 'le nombre de sacs Agri-Kerlann',
  choix: Array.from({ length: 5 }, (_, i) => ({ v: String((i + 1) * SAC), lib: String((i + 1) * SAC) })), juste: (jeu) => String(colisDe(jeu, 'agri-kerlann')) };

// ─────────────────────────────────────────────────────────────── ④ la fiche « Rapprocher » (un cadre par client : reçues, résultat)
export const RESULTATS = [{ v: 'conforme', lib: 'conforme' }, { v: 'manque', lib: 'il en manque' }, { v: 'trop', lib: 'il y en a trop' }];
export const champRecues = (client) => `recues-${client}`;
export const champResultat = (client) => `resultat-${client}`;

// ─────────────────────────────────────────────────────────────── ⑤ rendre compte à Maëlys (phrases à choisir)
// L'écart, en phrase (« Agri-Kerlann : 1 palette de moins que l'annonce, pas prête à la ramasse. »), calculé ; `null` si le client est conforme.
export const phraseEcart = (jeu, client) => {
  const r = compte(jeu, client), a = annonce(jeu, client);
  if (r === a) return null;
  return r < a ? `${NOM_DIT[client]} : ${pal(a - r)} de moins que l’annonce, pas prête${a - r > 1 ? 's' : ''} à la ramasse.`
    : `${NOM_DIT[client]} : ${pal(r - a)} de plus que l’annonce.`;
};
const CONFORME = 'Tout est conforme aux annonces.';
const MOINS = (c) => `${NOM_DIT[c]} : 1 palette de moins que l’annonce, pas prête à la ramasse.`;
const PLUS = (c) => `${NOM_DIT[c]} : 1 palette de plus que l’annonce.`;
// Les choix de la ligne « écart » (ordre déclaré : le juste d'abord). Chacun dit ce que Maëlys en retient (`reponse`) : elle reprend ce que l'élève lui
// a écrit, sans corriger (règle de Tristan du 10/10/2026). Quatre choix distincts pour chaque écart, jamais deux fois la même phrase.
export function choixEcart(jeu) {
  const c = jeu.clientEcart, autre = CLIENTS_106.find((x) => x !== c) || 'ar-vag';
  const je = (client) => ({ reponse: `Merci, je préviens ${NOM_DIT[client]}.` });
  const conforme = { texte: CONFORME, reponse: 'Merci, je note : tout est conforme.' };
  if (jeu.ecart === 'aucun') {
    return [conforme, { texte: MOINS('ar-vag'), ...je('ar-vag') }, { texte: PLUS('agri-kerlann'), ...je('agri-kerlann') }, { texte: MOINS('agri-kerlann'), ...je('agri-kerlann') }];
  }
  if (jeu.ecart === 'moins') {
    return [{ texte: phraseEcart(jeu, c), ...je(c) }, { texte: MOINS(autre), ...je(autre) }, conforme, { texte: PLUS(c), ...je(c) }];
  }
  return [{ texte: phraseEcart(jeu, c), ...je(c) }, { texte: PLUS(autre), ...je(autre) }, conforme, { texte: MOINS(c), ...je(c) }];
}
// La ligne imposée « reçu » (« 4 palettes : 3 Ar Vag, 1 Agri-Kerlann, triées en zone de réception. »).
export const ligneRecu = (jeu) => `${pal(nbPalettes(jeu))} : ${CLIENTS_106.map((c) => `${compte(jeu, c)} ${NOM_DIT[c]}`).join(', ')}, triées en zone de réception.`;
export const SALUTATIONS = ['Salut Maëlys,', 'Madame,', 'Bonjour à tous,'];
export const fins = (prenom) => [`Je reste à la réception si besoin. ${prenom}`, 'Cordialement', 'Merci.'];
