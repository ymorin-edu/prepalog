// ENT-10.5 — Transports Pelleau, « le camion de ramasse rentre » : les DONNÉES PURES de la séance (le camion, la feuille de ramasse, les annonces
// des clients, le quai, le dialogue avec Loïc, et tout ce qui s'en CALCULE). Aucun effet de bord, aucune interface, aucun import du moteur :
// importé par le contenu (`contenus/pelleau-ent105.js`), les questions (`contenus/questions/ENT-10.5.js`) et le corrigé
// (`contenus/corriges/ENT-10.5.js`, qui se charge aussi sous Node). Brief `docs/briefs/ENT-10.5-pelleau-camion-de-ramasse.md` §4, §6 ; décisions
// du chef de chantier : `docs/briefs/COORDINATION-pelleau.md` §2 (9 : aucun jour de la semaine ; 10 : ids suffixés ; 13 : aucun chiffre attendu
// écrit à la main).
//
// GUIDAGE, PIÈCES FIXES (brief §6 bis) : le même camion, le même écart pour tous. Rien n'est tiré ici (pas de `declarerTirage`) ; l'ordre des
// répliques du dialogue est mélangé par le moteur, les questions d'« Avant de commencer » sont tirées par le moteur.
//
// CE QUI SE CALCULE (jamais écrit à la main) : le nombre de palettes qui arrivent (les palettes du camion), le nombre de clients, les palettes
// de chaque client, les colis, la ligne « observation » de la feuille de ramasse, le résultat du rapprochement (conforme / il en manque / il y en
// a trop) et l'écart dit à Maëlys. LES DONNÉES : les palettes du camion (`PALETTES`, d'après les palettes types de l'univers) et ce que chaque
// client a annoncé (`ANNONCES`). Annonces et camion se correspondent par construction : la feuille de ramasse EST la liste du camion.
//
// CONSTRUIT (dit dans la séance : pied des documents, `MENTION`) : les clients (fictifs), la feuille de ramasse de Loïc, les annonces (courriels
// des clients), le quai A et ses cases, le dialogue (textes du brief §4, étape 2, tels quels ; réactions de Loïc écrites par Claude Code).

import { CLIENTS, PALETTE_AR_VAG, PALETTE_AGRI, clientsDepose } from './pelleau.js';

export const ID = 'pelleau-camion-de-ramasse';
export const ID_VOLET = 'pelleau-ent105';
export const QUAI_ID = 'pelleau-quai-105';
export const DIALOGUE = 'pelleau-loic-105';
export const FICHES = { preparer: 'preparer-105', rapprocher: 'rapprocher-105' };
export const PHRASES_ID = 'pelleau-compte-rendu-105';
export const JOUR = 12;   // 12 mai 2026 (feuille de route §0.7), jamais le jour de la semaine

// ─────────────────────────────────────────────────────────────── les clients de CE camion (univers : `CLIENTS`, tous fictifs)
// Ordre d'affichage (fiches, documents, phrases) : celui de la feuille de ramasse.
export const CLIENTS_105 = ['ar-vag', 'agri-kerlann'];
// Le nom qu'on dit entre collègues (phrases, feuille) : sans « Biscuiterie ».
export const NOM_DIT = { 'ar-vag': 'Ar Vag', 'agri-kerlann': 'Agri-Kerlann' };
export const nomClient = (id) => CLIENTS[id].nom;

// ─────────────────────────────────────────────────────────────── le camion de ramasse (P1, P2 Agri-Kerlann ; P3, P4 Ar Vag : brief §4 étape 3)
// Une palette = la palette type de son client (univers) ; cartons du quai : couches × colis par couche = W × D × L. Les sacs de terreau sont
// dessinés en cartons (décision 12 du chef : « sacs » dans le texte seulement, tant que Tristan n'a pas choisi).
const DIMS = { 8: [4, 2], 10: [5, 2] };
const TYPES = { 'ar-vag': PALETTE_AR_VAG, 'agri-kerlann': PALETTE_AGRI };
const palette = (id, client, n) => {
  const t = TYPES[client], [W, D] = DIMS[t.parCouche];
  return { id, client, ref: t.ref, nom: t.designation, bl: t.colis, W, D, L: t.couches, manque: [], avarie: {}, attendu: 'accepter', motifAttendu: 'aucun',
    etiq: { ref: t.ref, nom: t.designation.toUpperCase(), poids: `1 ${t.unite}`, lot: `${t.ref}-0512-${n}` } };
};
export const PALETTES = [palette('P1', 'agri-kerlann', 1), palette('P2', 'agri-kerlann', 2), palette('P3', 'ar-vag', 1), palette('P4', 'ar-vag', 2)];
// Ce que chaque client a ANNONCÉ (courriel du client, construit) : des palettes complètes de sa palette type. Agri-Kerlann a annoncé une
// palette de plus que ce que Loïc a chargé (brief §4 étape 4 : « 3e palette pas prête »).
export const ANNONCES = { 'ar-vag': { palettes: 2 }, 'agri-kerlann': { palettes: 3 } };

// ─────────────────────────────────────────────────────────────── ce qui s'en calcule
export const palettesDe = (client) => PALETTES.filter((p) => p.client === client);
export const nbPalettes = () => PALETTES.length;
export const nbClients = () => new Set(PALETTES.map((p) => p.client)).size;
export const colisDe = (client) => palettesDe(client).reduce((t, p) => t + p.bl, 0);
export const annonce = (client) => ANNONCES[client].palettes;
export const colisAnnonces = (client) => annonce(client) * TYPES[client].colis;
export const uniteDe = (client, n) => (n > 1 ? TYPES[client].unitePl : TYPES[client].unite);
// Le résultat du rapprochement d'un client : 'conforme', 'manque' (il en manque) ou 'trop' (il y en a trop).
export const resultat = (client) => { const r = palettesDe(client).length, a = annonce(client); return r === a ? 'conforme' : r < a ? 'manque' : 'trop'; };
// L'observation de Loïc sur la feuille de ramasse, quand il a chargé moins que l'annonce (« 3e palette pas prête »).
export const observation = (client) => {
  const r = palettesDe(client).length, a = annonce(client);
  if (r >= a) return '';
  return a - r === 1 ? `${r + 1}e palette pas prête` : `${a - r} palettes pas prêtes`;
};
export const pal = (n) => `${n} palette${n > 1 ? 's' : ''}`;

// ─────────────────────────────────────────────────────────────── le quai A (vue quai iso : inspection sur la scène, dépose par client)
export const SECURITE_CONSIGNE = 'Avant que Yann entre dans le camion, regarde le quai et le camion. Clique sur ce qui ne va pas, puis signale-le à Yann.';
export const SECURITE_ARRET = 'Attends ! Je n’entre pas tout de suite. Regarde encore le quai, et signale-moi ce qui ne va pas.';
export const DEPOSE = { passage: 3, cases: [
  { id: 'allee-1', sol: 'pieton', peinte: false, nom: 'Allée piétonne', reaction: 'Là, c’est l’allée piétonne : je ne pose pas ici.' },
  { id: 'AV1', client: 'ar-vag' }, { id: 'AV2', client: 'ar-vag' },
  { id: 'AK1', client: 'agri-kerlann' }, { id: 'AK2', client: 'agri-kerlann' },
  { id: 'quaiB-1', sol: 'autre-quai', legende: 'Quai B', peinte: false, nom: 'Devant le quai B', reaction: 'Ça, c’est la zone du quai B.' }] };
// Les clients au format du moteur ({ nom, court } seulement : toute autre clé est refusée), tirés de l'univers ; le nom au sol d'Agri-Kerlann est
// « AGRI » (`AU_SOL` de l'univers : « AGRI-KERLANN » ne se lisait pas au sol).
export const CLIENTS_DEPOSE = clientsDepose(CLIENTS_105);
export const texteArret = () => `Les ${nbPalettes()} palettes sont triées par client. Le contrôle des colis, ce sera la semaine prochaine.`;
export const casesDe = (client) => DEPOSE.cases.filter((c) => c.client === client).map((c) => c.id);

export function quaiDeclare() {
  return {
    id: QUAI_ID, libelle: 'Le quai A', rendu: 'iso', froid: false,
    titre: 'Transports Pelleau — entrepôt de Gouesnou — Quai A, réception',
    destinataire: 'Transports Pelleau, entrepôt de Gouesnou',
    avertissement: 'Réels : les Transports Pelleau et leur entrepôt de Gouesnou. Le quai est un <b>dessin construit</b> : ce n’est pas le vrai quai. '
      + 'La ramasse, les clients (entreprises fictives), Loïc, Yann et les cases de dépose sont <b>construits pour l’exercice</b>.',
    lieu: { nom: 'Quai A', temp: 15, refrigere: false },
    zone: { nom: 'Zone de réception' },
    unite: { un: 'colis', des: 'colis' },
    document: { nom: 'Feuille de ramasse', court: 'FR' },
    recommencer: false,
    aides: { consignes: true },
    dechargement: { ouverture: 0.5, parPalette: 1, par: 'cariste', nom: 'Yann' },
    securite: {
      mode: 'scene',
      consigne: SECURITE_CONSIGNE,
      points: [
        { id: 'lampe', objet: 'lampe', etat: 'eteinte', ok: false, lib: 'Lampe de quai éteinte', repare: 'Bien vu : j’allume la lampe de quai.' },
        { id: 'cale', objet: 'cale', etat: 'posee', ok: true, lib: 'Cale posée' },
      ],
      signaler: { qui: 'Yann', rien: 'Là, je ne vois rien qui cloche.' },
      arret: SECURITE_ARRET,
    },
    depose: { ...JSON.parse(JSON.stringify(DEPOSE)), clients: JSON.parse(JSON.stringify(CLIENTS_DEPOSE)) },
    arret: { etape: 'dechargement', texte: texteArret() },
    camions: [{
      transporteur: 'Transports Pelleau', fournisseur: 'ramasse de Loïc', bl: 'RAM-0512', arrivee: '07:30',
      parole: 'La feuille de ramasse, tu l’as. Je vais au local.',
      // Une copie : le moteur ne doit jamais modifier les palettes que lisent le corrigé et les tests.
      palettes: JSON.parse(JSON.stringify(PALETTES)),
    }],
  };
}
// Le même objet à chaque appel (le moteur et les jalons lisent la même déclaration).
let QUAI_MEMO = null;
export const QUAI = () => (QUAI_MEMO || (QUAI_MEMO = quaiDeclare()));

// ─────────────────────────────────────────────────────────────── l'accueil de Loïc (dialogue face à face, collègue : tutoiement)
// Textes du brief §4, étape 2, tels quels (les réactions de Loïc sont écrites par Claude Code, à relire). La première réponse compte (jalon).
export const REPLIQUES = [
  { id: 'feuille', dit: 'Salut ! J’ai la ramasse : Ar Vag et Agri-Kerlann.', choix: [
    { v: 'feuille', juste: true, lib: 'Salut Loïc, tu me donnes ta feuille de ramasse ?' },
    { v: 'decharge', lib: 'Vas-y, décharge.', reaction: 'Euh… c’est Yann qui décharge, pas moi. Et ma feuille, tu ne la veux pas ?' },
    { v: 'magasin', lib: 'C’est pour quel magasin ?', reaction: 'Un magasin ? Non, c’est la ramasse : les clients nous confient leurs palettes.' }] },
  { id: 'regles', dit: 'Tiens. Je reste dans la cabine ?', choix: [
    { v: 'local', juste: true, lib: 'Tu coupes le moteur, tu mets la cale, et tu attends au local pendant qu’on décharge.' },
    { v: 'volant', lib: 'Oui, reste au volant, on fait vite.', reaction: 'Au volant, moteur allumé ? Erwan ne serait pas d’accord.' },
    { v: 'aider', lib: 'Aide Yann à décharger.', reaction: 'Moi ? Je n’ai pas à toucher au chariot de Yann.' }] },
  { id: 'etiquette', dit: 'La palette du fond, c’est celle d’Agri-Kerlann.', choix: [
    { v: 'etiquette', juste: true, lib: 'Merci. On regarde chaque étiquette avant de poser.' },
    { v: 'croire', lib: 'OK, je te crois, on pose tout ensemble.', reaction: 'Tout ensemble ? Il y a deux clients dans le camion…' },
    { v: 'meme', lib: 'Pas besoin, on met tout au même endroit.', reaction: 'Au même endroit ? On ne saura plus à qui est quoi.' }] },
];
export const JUSTES_DIALOGUE = Object.fromEntries(REPLIQUES.map((r) => [r.id, r.choix.find((c) => c.juste).v]));
export const FIN_DIALOGUE = 'Ça marche. Je file au local.';

// ─────────────────────────────────────────────────────────────── ① la fiche « Préparer la réception » (valeurs LUES dans les documents)
// Les choix d'une liste « combien » : de 1 à `max`.
export const nombres = (max) => Array.from({ length: max }, (_, i) => ({ v: String(i + 1), lib: String(i + 1) }));
export const LIGNES_PREPARER = [
  { id: 'palettes', lib: 'Combien de palettes arrivent ?', max: 6, juste: () => String(nbPalettes()), manque: 'le nombre de palettes' },
  { id: 'clients', lib: 'Pour combien de clients ?', max: 4, juste: () => String(nbClients()), manque: 'le nombre de clients' },
];
// La ligne en plus du confirmé (brief §5 : « Combien de palettes Ar Vag ? »), cachée aux autres.
export const LIGNE_BONUS = { id: 'palettes-ar-vag', lib: 'Combien de palettes Ar Vag ?', max: 4, juste: () => String(palettesDe('ar-vag').length),
  manque: 'le nombre de palettes Ar Vag' };

// ─────────────────────────────────────────────────────────────── ④ la fiche « Rapprocher » (un cadre par client : reçues, résultat)
export const RESULTATS = [{ v: 'conforme', lib: 'conforme' }, { v: 'manque', lib: 'il en manque' }, { v: 'trop', lib: 'il y en a trop' }];
export const champRecues = (client) => `recues-${client}`;
export const champResultat = (client) => `resultat-${client}`;

// ─────────────────────────────────────────────────────────────── ⑤ rendre compte à Maëlys (phrases à choisir)
// L'écart, en phrase (« Agri-Kerlann : 1 palette de moins que l'annonce, pas prête à la ramasse. »), calculé ; `null` si le client est conforme.
export const phraseEcart = (client) => {
  const r = palettesDe(client).length, a = annonce(client);
  if (r === a) return null;
  return r < a ? `${NOM_DIT[client]} : ${pal(a - r)} de moins que l’annonce, pas prête${a - r > 1 ? 's' : ''} à la ramasse.`
    : `${NOM_DIT[client]} : ${pal(r - a)} de plus que l’annonce.`;
};
// Les choix de la ligne « écart » (ordre déclaré : le juste d'abord). Chacun dit ce que Maëlys en retient (`reponse`) : elle reprend ce que
// l'élève lui a écrit, sans corriger (règle de Tristan du 10/10/2026).
export function choixEcart() {
  const avecEcart = CLIENTS_105.filter((c) => resultat(c) !== 'conforme');
  const sans = CLIENTS_105.filter((c) => resultat(c) === 'conforme');
  const cible = avecEcart[0], autre = sans[0] || CLIENTS_105.find((c) => c !== cible);
  const a = annonce(cible), r = palettesDe(cible).length;
  return [
    { texte: phraseEcart(cible), reponse: `Merci, je préviens ${NOM_DIT[cible]}.` },
    { texte: `${NOM_DIT[autre]} : ${pal(Math.abs(a - r))} de moins que l’annonce, pas prête à la ramasse.`, reponse: `Merci, je préviens ${NOM_DIT[autre]}.` },
    { texte: 'Tout est conforme aux annonces.', reponse: 'Merci, je note : tout est conforme.' },
    { texte: `${NOM_DIT[cible]} : ${pal(Math.abs(a - r))} de plus que l’annonce.`, reponse: `Merci, je préviens ${NOM_DIT[cible]}.` },
  ];
}
// La ligne imposée « reçu » (« 4 palettes : 2 Ar Vag, 2 Agri-Kerlann, triées en zone de réception. »).
export const ligneRecu = () => `${pal(nbPalettes())} : ${CLIENTS_105.map((c) => `${palettesDe(c).length} ${NOM_DIT[c]}`).join(', ')}, triées en zone de réception.`;
export const SALUTATIONS = ['Salut Maëlys,', 'Madame,', 'Yo !'];
export const fins = (prenom) => [`Je reste à la réception si besoin. ${prenom}`, 'Bisous', 'Ciao.'];
