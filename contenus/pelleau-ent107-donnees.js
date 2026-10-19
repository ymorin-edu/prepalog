// ENT-10.7 — Transports Pelleau, « la feuille de ramasse se trompe » : les DONNÉES PURES de la séance (le camion, la feuille de ramasse FAUSSE,
// les annonces, le quai, le dialogue avec Loïc, le jeu tiré par élève et tout ce qui s'en CALCULE). Aucun effet de bord, aucune interface, aucun
// import du moteur : importé par le contenu (`contenus/pelleau-ent107.js`), les questions (`contenus/questions/ENT-10.7.js`) et le corrigé
// (`contenus/corriges/ENT-10.7.js`, qui se charge aussi sous Node). Brief `docs/briefs/ENT-10.7-pelleau-feuille-de-ramasse.md` ; décisions du chef de
// chantier : `docs/briefs/COORDINATION-pelleau.md` §2 (9 : aucun jour de la semaine ; 10 : ids suffixés ; 13 : aucun chiffre attendu écrit à la
// main ; 14 : le sens de l'erreur est TIRÉ par la graine, le texte du brief n'est qu'un exemple).
//
// ERREUR INDUITE (entraînement) : Loïc, pressé, a rempli sa feuille de ramasse trop vite. UNE palette y est notée chez le mauvais client (un client
// +1, l'autre −1). L'étiquette de la palette dit vrai. L'élève doit suivre l'étiquette, voir que l'écart avec les annonces vient d'une erreur d'écriture,
// et le dire.
//
// CE QUI EST TIRÉ (fonction pure de la graine = l'identifiant de l'élève, `db.tirage.graine`, rien n'est rangé : comme l'anomalie d'ENT-8.7) :
//   - `clients` : le client de chaque palette P1 à P4 (deux Ar Vag et deux Agri-Kerlann, dans un ordre tiré : c'est l'ordre dans le camion ; les
//     palettes sortent P4, P3, P2, P1) ;
//   - `mal` : la palette mal notée sur la feuille (P1 à P4, uniforme), donc le SENS de l'erreur (Ar Vag → Agri-Kerlann ou l'inverse : il suit le client
//     de cette palette) ;
//   - `autre` : une autre palette de la feuille notée chez le même client (le piège des choix « laquelle ? ») ;
//   - `defaut` : le défaut de la scène du quai (la lampe éteinte, le niveleur relevé ou la cale absente) ;
//   - `ordreChoix` : l'ordre des trois choix de « La feuille est-elle juste ? ».
//   ⚠ Ne pas changer la formule ni les listes pendant qu'une classe joue la séance (le jeu des élèves changerait) : un cas de test le rappelle.
//
// RÈGLE « QUE, JAMAIS DE COMBIEN » : la feuille donne, pour chaque expéditeur, les palettes qu'il a (selon Loïc) et le nombre de colis qui s'en suit
// (le nombre de palettes notées × les colis d'une palette de ce client) : jamais le colis réellement posé sur la palette mal notée (des sacs chez
// Ar Vag, par exemple), jamais d'observation, jamais de total. Quelle palette se trompe : seule l'étiquette, lue au quai, le dit.
//
// CONSTRUIT (dit dans la séance : pied des documents) : les clients (fictifs), la feuille de ramasse de Loïc et son erreur, les annonces (courriels
// des clients), le quai A et ses cases, le dialogue (textes du brief §4, étape 2 ; réactions de Loïc écrites par Claude Code).

import { hasard, graineDeBase } from '../core/tirage.js';
import { CLIENTS, PALETTE_AR_VAG, PALETTE_AGRI, clientsDepose } from './pelleau.js';

export const ID = 'pelleau-feuille-de-ramasse';
export const ID_VOLET = 'pelleau-ent107';
export const QUAI_ID = 'pelleau-quai-107';
export const DIALOGUE = 'pelleau-loic-107';
export const FICHES = { preparer: 'preparer-107', rapprocher: 'rapprocher-107', corriger: 'corriger-107' };
export const PHRASES_ID = 'pelleau-compte-rendu-107';
export const JOUR = 18;   // 18 mai 2026 (feuille de route §0.7), jamais le jour de la semaine
export const BL = 'RAM-0518';   // le numéro de la feuille de ramasse (affiché en tête du document et au quai)

// ─────────────────────────────────────────────────────────────── les clients de CE camion (univers : `CLIENTS`, tous fictifs)
export const CLIENTS_107 = ['ar-vag', 'agri-kerlann'];
export const NOM_DIT = { 'ar-vag': 'Ar Vag', 'agri-kerlann': 'Agri-Kerlann' };
export const nomClient = (id) => CLIENTS[id].nom;
const AUTRE = { 'ar-vag': 'agri-kerlann', 'agri-kerlann': 'ar-vag' };
export const autreClient = (c) => AUTRE[c];

// ─────────────────────────────────────────────────────────────── le jeu tiré par élève
export const IDS_PALETTES = ['P1', 'P2', 'P3', 'P4'];
// Les défauts possibles de la scène du quai (un seul par élève, tiré ; même valeur au bilan). La vue où on les voit : cale dehors, niveleur et lampe dedans.
export const DEFAUTS = ['lampe', 'niveleur', 'cale'];
export const ORDRES_CHOIX = [[0, 1, 2], [0, 2, 1], [1, 0, 2], [1, 2, 0], [2, 0, 1], [2, 1, 0]];
const MEMO = new Map();
// Le jeu d'une graine (l'identifiant de l'élève). Une graine vide (enseignant, base vide) donne un jeu, toujours le même.
export function jeuDe(graine) {
  const g = String(graine == null ? '' : graine);
  if (MEMO.has(g)) return MEMO.get(g);
  const flux = (nom) => hasard(`${g}|${ID}|${nom}`);
  const clients = flux('clients').melanger(['ar-vag', 'ar-vag', 'agri-kerlann', 'agri-kerlann']);   // le client de P1, P2, P3, P4
  const mal = IDS_PALETTES[flux('mal').entier(0, 3)];
  const vrai = clients[IDS_PALETTES.indexOf(mal)];            // ce que dit l'étiquette
  const note = AUTRE[vrai];                                    // ce que dit la feuille
  const memeGroupe = IDS_PALETTES.filter((id) => id !== mal && clients[IDS_PALETTES.indexOf(id)] === note);   // les palettes VRAIMENT de `note`
  const autre = flux('autre').choisir(memeGroupe);
  const jeu = Object.freeze({ graine: g, clients: Object.freeze(clients), mal, vrai, note, autre,
    defaut: flux('defaut').choisir(DEFAUTS), ordreChoix: flux('ordre-choix').choisir(ORDRES_CHOIX) });
  MEMO.set(g, jeu);
  return jeu;
}
export const clientDe = (jeu, id) => jeu.clients[IDS_PALETTES.indexOf(id)];                       // ce que dit l'étiquette
export const clientNote = (jeu, id) => (id === jeu.mal ? jeu.note : clientDe(jeu, id));         // ce que dit la feuille de Loïc

// ─────────────────────────────────────────────────────────────── les palettes du camion (d'après les palettes types de l'univers)
// Cartons du quai : couches × colis par couche = W × D × L. Les sacs de terreau sont dessinés en cartons (« sacs » dans le texte seulement).
const DIMS = { 8: [4, 2], 10: [5, 2] };
const TYPES = { 'ar-vag': PALETTE_AR_VAG, 'agri-kerlann': PALETTE_AGRI };
export const typeDe = (client) => TYPES[client];
export const uniteDe = (client, n) => (n > 1 ? TYPES[client].unitePl : TYPES[client].unite);
export function palettesDe(jeu) {
  const rang = {};
  return IDS_PALETTES.map((id, i) => {
    const client = jeu.clients[i], t = TYPES[client], [W, D] = DIMS[t.parCouche];
    rang[client] = (rang[client] || 0) + 1;
    return { id, client, ref: t.ref, nom: t.designation, bl: t.colis, W, D, L: t.couches, manque: [], avarie: {}, attendu: 'accepter', motifAttendu: 'aucun',
      etiq: { ref: t.ref, nom: t.designation.toUpperCase(), poids: `1 ${t.unite}`, lot: `${t.ref}-0518-${rang[client]}` } };
  });
}
export const nbPalettes = () => IDS_PALETTES.length;
export const nbClients = () => CLIENTS_107.length;
export const pal = (n) => `${n} palette${n > 1 ? 's' : ''}`;

// Ce que chaque client a ANNONCÉ (courriel du client, construit) : des palettes complètes de sa palette type. Les annonces sont JUSTES : elles
// correspondent à ce que le camion rapporte vraiment.
export const ANNONCES = { 'ar-vag': { palettes: 2 }, 'agri-kerlann': { palettes: 2 } };
export const annonce = (client) => ANNONCES[client].palettes;
export const colisAnnonces = (client) => annonce(client) * TYPES[client].colis;

// ─────────────────────────────────────────────────────────────── ce qui s'en calcule : la réalité (étiquettes) et la feuille de Loïc
export const reellesDe = (jeu, client) => IDS_PALETTES.filter((id) => clientDe(jeu, id) === client);       // les palettes dont l'étiquette dit `client`
export const notees = (jeu, client) => IDS_PALETTES.filter((id) => clientNote(jeu, id) === client);        // les palettes que la feuille met chez `client`
export const colisNotes = (jeu, client) => notees(jeu, client).length * TYPES[client].colis;               // ce que la feuille en déduit, jamais le contenu réel
// Le résultat du rapprochement d'un client (ce qui est ARRIVÉ, compté par étiquette, contre son annonce) : 'conforme', 'manque' ou 'trop'.
export const resultat = (jeu, client) => { const r = reellesDe(jeu, client).length, a = annonce(client); return r === a ? 'conforme' : r < a ? 'manque' : 'trop'; };
// Ce que dit la feuille, contre l'annonce (le premier regard de l'élève, à « Préparer » : elle ne colle pas aux annonces).
export const ecartFeuille = (jeu, client) => notees(jeu, client).length - annonce(client);

// Les phrases de l'erreur, CALCULÉES (jamais écrites avec un numéro de palette ou un nom de client en dur).
const dit = (c) => NOM_DIT[c];
export const phraseErreur = (jeu, id = jeu.mal, sens = true) => (sens
  ? `La palette ${id} est notée chez ${dit(jeu.note)} sur la feuille, mais son étiquette dit ${dit(jeu.vrai)}.`
  : `La palette ${id} est notée chez ${dit(jeu.vrai)} sur la feuille, mais son étiquette dit ${dit(jeu.note)}.`);
export const phraseNon = (jeu, id) => `Non : la palette ${id} est notée chez ${dit(jeu.note)}, son étiquette dit ${dit(jeu.vrai)}.`;
export const OUI_JUSTE = 'Oui, la feuille est juste.';
// Les trois choix de « La feuille de ramasse est-elle juste ? » (fiche « Rapprocher »), dans l'ordre tiré de l'élève. Le juste : `non-<mal>`.
export function choixFeuille(jeu) {
  const L = [{ v: `non-${jeu.mal}`, lib: phraseNon(jeu, jeu.mal) }, { v: `non-${jeu.autre}`, lib: phraseNon(jeu, jeu.autre) }, { v: 'oui', lib: OUI_JUSTE }];
  return jeu.ordreChoix.map((i) => L[i]);
}
export const justeFeuille = (jeu) => `non-${jeu.mal}`;
// Les quatre phrases de la ligne « l'erreur » du compte rendu (ordre déclaré : la juste d'abord ; le moteur les mélange). Chacune dit ce que Maëlys en
// retient (`reponse`) : elle reprend ce que l'élève lui a écrit, sans corriger (règle de Tristan du 10/10/2026).
export function choixErreur(jeu) {
  return [
    { texte: phraseErreur(jeu), reponse: 'Merci, je vois ça avec Loïc.' },
    { texte: phraseErreur(jeu, jeu.autre), reponse: `Merci, je note : c’est la palette ${jeu.autre}.` },
    { texte: phraseErreur(jeu, jeu.mal, false), reponse: `Merci, je note : la palette ${jeu.mal} est chez ${dit(jeu.vrai)} sur la feuille.` },
    { texte: 'Tout est conforme, la feuille est juste.', reponse: 'Merci, je note : la feuille est juste.' },
  ];
}
// La ligne imposée « reçu » (« 4 palettes : 2 Ar Vag, 2 Agri-Kerlann, conformes aux annonces. »), calculée sur ce qui est ARRIVÉ.
export const ligneRecu = (jeu) => {
  const tout = CLIENTS_107.every((c) => resultat(jeu, c) === 'conforme');
  return `${pal(nbPalettes())} : ${CLIENTS_107.map((c) => `${reellesDe(jeu, c).length} ${NOM_DIT[c]}`).join(', ')}${tout ? ', conformes aux annonces' : ''}.`;
};
export const SALUTATIONS = ['Salut Maëlys,', 'Madame,', 'Yo !'];
export const fins = (prenom) => [`Je reste à la réception si besoin. ${prenom}`, 'Bisous', 'Ciao.'];

// ─────────────────────────────────────────────────────────────── l'inspection sur la scène (un défaut tiré parmi trois)
export const OBJETS = {
  cale: { sur: 'posee', danger: 'absente', libOk: 'Cale de roue posée', libKo: 'Cale de roue absente', repare: 'Bien vu : je fais poser la cale.' },
  niveleur: { sur: 'pose', danger: 'releve', libOk: 'Niveleur posé', libKo: 'Niveleur relevé, pas posé sur la remorque', repare: 'Bien vu : je pose le niveleur.' },
  lampe: { sur: 'allumee', danger: 'eteinte', libOk: 'Lampe de quai allumée', libKo: 'Lampe de quai éteinte', repare: 'Bien vu : j’allume la lampe de quai.' },
};
export const SECURITE_CONSIGNE = 'Avant que Yann entre dans le camion, regarde le quai et le camion. Clique sur ce qui ne va pas, puis signale-le à Yann.';
export const SECURITE_ARRET = 'Attends ! Je n’entre pas tout de suite. Regarde encore le quai, et signale-moi ce qui ne va pas.';
export function securiteDe(defaut) {
  return {
    mode: 'scene',
    consigne: SECURITE_CONSIGNE,
    points: DEFAUTS.map((objet) => { const o = OBJETS[objet];
      return objet === defaut ? { id: objet, objet, etat: o.danger, ok: false, lib: o.libKo, repare: o.repare } : { id: objet, objet, etat: o.sur, ok: true, lib: o.libOk, repare: o.repare }; }),
    signaler: { qui: 'Yann', rien: 'Là, je ne vois rien qui cloche.' },
    arret: SECURITE_ARRET,
  };
}

// ─────────────────────────────────────────────────────────────── le quai A (vue quai iso : inspection sur la scène, dépose par client)
// Trois cases par client pour deux palettes chacun : il reste toujours une case libre de chaque client, la dernière palette ne se pose pas par
// élimination ; plus l'allée piétonne et la zone du quai B (les pièges). Huit cases : le plafond du moteur.
export const DEPOSE = { passage: 4, cases: [
  { id: 'allee-1', sol: 'pieton', peinte: false, nom: 'Allée piétonne', reaction: 'Là, c’est l’allée piétonne : je ne pose pas ici.' },
  { id: 'AV1', client: 'ar-vag' }, { id: 'AV2', client: 'ar-vag' }, { id: 'AV3', client: 'ar-vag' },
  { id: 'AK1', client: 'agri-kerlann' }, { id: 'AK2', client: 'agri-kerlann' }, { id: 'AK3', client: 'agri-kerlann' },
  { id: 'quaiB-1', sol: 'autre-quai', legende: 'Quai B', peinte: false, nom: 'Devant le quai B', reaction: 'Ça, c’est la zone du quai B.' }] };
// Les clients au format du moteur ({ nom, court } seulement), tirés de l'univers ; le nom au sol d'Agri-Kerlann est « AGRI » (`AU_SOL`).
export const CLIENTS_DEPOSE = clientsDepose(CLIENTS_107);
export const casesDe = (client) => DEPOSE.cases.filter((c) => c.client === client).map((c) => c.id);
export const texteArret = () => `Les ${nbPalettes()} palettes sont triées par client. Reste à les rapprocher des annonces.`;

export function quaiDuJeu(jeu) {
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
    aides: { consignes: true },
    dechargement: { ouverture: 0.5, parPalette: 1, par: 'cariste', nom: 'Yann' },
    securite: securiteDe(jeu.defaut),
    depose: { ...JSON.parse(JSON.stringify(DEPOSE)), clients: JSON.parse(JSON.stringify(CLIENTS_DEPOSE)) },
    arret: { etape: 'dechargement', texte: texteArret() },
    camions: [{
      transporteur: 'Transports Pelleau', fournisseur: 'ramasse de Loïc', bl: BL, arrivee: '07:30',
      // Loïc est un collègue : tutoiement (« Oui, tu peux décharger »), et son prénom plutôt que « le chauffeur ».
      tutoiement: true, prenomChauffeur: 'Loïc',
      parole: 'La feuille de ramasse, tu l’as. Je vais au local.',
      // Une copie : le moteur ne doit jamais modifier les palettes que lisent le corrigé et les tests.
      palettes: JSON.parse(JSON.stringify(palettesDe(jeu))),
    }],
  };
}
const CACHE = new Map();
// Le quai d'une graine (l'identifiant de l'élève) ET d'un niveau (le moteur passe `{ niveau, copie }`) : toujours le même pour la même graine. Le niveau
// ne change rien au quai (confirmé : seul le document « Règles du quai » n'est pas joint ; accompagné = standard).
export function quaiDe(graine) {
  const g = String(graine == null ? '' : graine);
  if (!CACHE.has(g)) CACHE.set(g, quaiDuJeu(jeuDe(g)));
  return CACHE.get(g);
}

// Le quai de CET élève (sa graine : l'identifiant de l'élève, rangé dans sa base). Lu par les jalons et par les tests (`aidesQuai`, option `parBase`).
export const quaiDeBase = (db) => quaiDe(graineDeBase(db));

// ─────────────────────────────────────────────────────────────── l'accueil de Loïc (dialogue face à face, collègue : tutoiement)
// Textes du brief §4, étape 2 (la deuxième réplique : Loïc presse l'élève de suivre la feuille). Les réactions de Loïc sont écrites par Claude
// Code, à relire ; elles ne disent ni juste ni faux. La première réponse compte (jalon).
export const REPLIQUES = [
  { id: 'feuille', dit: 'Salut ! J’ai la ramasse : Ar Vag et Agri-Kerlann.', choix: [
    { v: 'feuille', juste: true, lib: 'Salut Loïc, tu me donnes ta feuille de ramasse ?' },
    { v: 'decharge', lib: 'Vas-y, décharge.', reaction: 'Euh… c’est Yann qui décharge, pas moi. Et ma feuille, tu ne la veux pas ?' },
    { v: 'magasin', lib: 'C’est pour quel magasin ?', reaction: 'Un magasin ? Non, c’est la ramasse : les clients nous confient leurs palettes.' }] },
  { id: 'etiquette', dit: 'Tiens, la voilà. Pose comme c’est écrit sur la feuille, j’ai tout noté, on gagne du temps.', choix: [
    { v: 'etiquette', juste: true, lib: 'Je regarde quand même chaque étiquette avant de poser.' },
    { v: 'suivre', lib: 'D’accord, je suis la feuille.', reaction: 'Tu es sûr ? Erwan, lui, dit toujours de regarder les étiquettes…' },
    { v: 'rien', lib: 'Alors je ne regarde rien.', reaction: 'Rien du tout ? Tu ne vas quand même pas poser les yeux fermés.' }] },
];
export const JUSTES_DIALOGUE = Object.fromEntries(REPLIQUES.map((r) => [r.id, r.choix.find((c) => c.juste).v]));
export const FIN_DIALOGUE = 'D’accord, fais comme tu le sens. Je file au local.';

// ─────────────────────────────────────────────────────────────── ① la fiche « Préparer la réception » (valeurs LUES dans les documents)
// Les choix d'une liste « combien » : de 1 à `max`.
export const nombres = (max) => Array.from({ length: max }, (_, i) => ({ v: String(i + 1), lib: String(i + 1) }));
export const LIGNES_PREPARER = [
  { id: 'palettes', lib: 'Combien de palettes arrivent ?', max: 6, juste: () => String(nbPalettes()), manque: 'le nombre de palettes' },
  { id: 'clients', lib: 'Pour combien de clients ?', max: 4, juste: () => String(nbClients()), manque: 'le nombre de clients' },
];

// ─────────────────────────────────────────────────────────────── ④ la fiche « Rapprocher » (un cadre par client, puis « la feuille est-elle juste ? »)
export const RESULTATS = [{ v: 'conforme', lib: 'conforme' }, { v: 'manque', lib: 'il en manque' }, { v: 'trop', lib: 'il y en a trop' }];
export const champRecues = (client) => `recues-${client}`;
export const champResultat = (client) => `resultat-${client}`;
export const CHAMP_FEUILLE = 'feuille-juste';

// ─────────────────────────────────────────────────────────────── ⑤ la feuille corrigée (fiche d'une ligne)
export const CORRIGER = { id: 'qui', lib: 'Qui corrige la feuille de ramasse ?', juste: 'loic-maelys',
  choix: [{ v: 'loic-maelys', lib: 'Loïc, qui l’a écrite, avec Maëlys' }, { v: 'seul', lib: 'Moi, je raye et je réécris seul' },
    { v: 'personne', lib: 'Personne, c’est trop tard' }] };
