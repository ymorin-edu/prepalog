// ENT-5.5 — Smoby, « ranger et saisir l'entrée » : les données de la séance (brief
// `docs/briefs/ENT-5.5-smoby-rangement.md`). Univers commun : `contenus/smoby.js` ; la plateforme (plan,
// produits, stock de départ, règles) : `contenus/smoby-entrepot.js`.
//
// Yanis (l'élève), cariste, mercredi 9 décembre 2026 en fin d'après-midi : ranger sur le plan de
// l'entrepôt les 4 palettes reçues d'Arinthod en ENT-5.4 (vue `core/types/entrepot.js`), saisir l'entrée
// en stock des quantités réellement reçues (écran Réceptions, avec la décision « En litige » pour
// l'établi), lire l'écran Stock, puis répondre à l'exploitation Kuehne+Nagel par phrases à choisir.
//
// Vérifié (brief §2) : la plateforme de stockage de Smoby à Moirans-en-Montagne ; le CACES R489 cat. 5 pour
// le chariot à mât rétractable. Construit : le plan de la zone, le stock, les poids, les classes de rotation
// et les contraintes des palettes, le numéro de lot, le flux Smoby → Kuehne+Nagel tel qu'il est joué.
//
// Les valeurs attendues (cartons réellement reçus, stock de porteurs après l'entrée, réserves des
// palettes) sont CALCULÉES depuis les palettes d'ENT-5.4 et le stock de la plateforme, jamais recopiées.

import { apresMail, tous } from '../core/declencheurs.js';
import { phrasesJustes } from '../core/phrases.js';
import { jalonsEntrepot } from '../core/types/entrepot.js';
import { catalogueSimple } from './entreprise-commun.js';
import { ponderer } from './ponderation.js';
import { LEXIQUE as LEXIQUE_SMOBY, VOCAB as VOCAB_SMOBY } from './smoby.js';
import { BRUNO, PALETTES_ENT54 } from './smoby-ent54.js';
import { GAMMES, PRODUITS, PLAN, STOCK, CRITERES, parPalette } from './smoby-entrepot.js';

export { BRUNO };
export const KN = { nom: 'Exploitation Kuehne+Nagel Besançon', mail: 'exploitation@kn-besancon.example' };

// ─────────────────────────────────────────────────────────────── les palettes d'Arinthod

// Les palettes reçues en ENT-5.4 : cartons annoncés (BL), réellement reçus, cartons écrasés.
const reel = (p) => p.W * p.D * p.L - p.manque.length;
const ecrases = (p) => Object.keys(p.avarie).length;
const pal54 = (id) => PALETTES_ENT54.find((p) => p.id === id);
// Le produit de la plateforme qui correspond à chaque palette (même référence qu'en ENT-5.4).
const CLE = Object.fromEntries(Object.entries(PRODUITS).map(([k, p]) => [p.ref, k]));

// Poids, classe de rotation et contrainte : construits (brief §4). La réserve vient du contrôle d'ENT-5.4.
const FICHE = {
  P1: { kg: 420, rotation: 'A', contrainte: 'lourd' },
  P2: { kg: 270, rotation: 'B', contrainte: 'fragile' },
  P3: { kg: 290, rotation: 'B', contrainte: 'lourd' },
  P4: { kg: 180, rotation: 'C' },
};
const reserveDe = (p) => [
  ecrases(p) && `${ecrases(p)} carton${ecrases(p) > 1 ? 's' : ''} écrasé${ecrases(p) > 1 ? 's' : ''}`,
  p.bl > reel(p) && `${p.bl - reel(p)} cartons manquants`,
].filter(Boolean).join(', ');
export const PALETTES = PALETTES_ENT54.map((p) => Object.assign({ id: p.id, nom: p.nom, produit: CLE[p.ref] }, FICHE[p.id],
  reserveDe(p) ? { reception: reserveDe(p) } : {}, ecrases(p) ? { litige: true } : {}));

// ─────────────────────────────────────────────────────────────── le plan de l'entrepôt

export const REGLES = {
  titre: 'Les règles',
  lignes: [
    '<b>Type de produit</b> : le côté de sa gamme (plan d’implantation).',
    '<b>Parcours</b> : un produit <b>lourd</b> en début de parcours (allée A), un produit <b>fragile</b> en fin de parcours (allée B) : à la préparation, le lourd fait la base de la palette, le fragile va en haut.',
    '<b>Produit fragile</b> : jamais au [[niveau]] N3.',
    '<b>Rotation</b> : A rapide → T01 (près des quais), N1 ou N2 · B moyenne → T02 · C lente → T03-T04, tous niveaux.',
    '<b>Poids</b> : la charge totale du niveau ne dépasse pas la plaque jaune (la [[charge maximale]]).',
    'Un [[emplacement]] <b>libre</b> et <b>en service</b> ; une palette <b>en [[litige]]</b> va en zone litiges.',
  ],
  encadre: 'Monter aux niveaux 2 et 3 demande le [[chariot rétractable]] : il faut le <b>CACES 5</b>. Yanis l’a.',
};

export const ENTREPOT = {
  id: 'smoby-ent55',
  libelle: 'Plan de l’entrepôt',
  mode: 'rangement',
  personnage: {
    nom: BRUNO.nom, role: BRUNO.role, date: 'mer. 9 déc., 17 h',
    texte: {
      guidage: 'Yanis, on range les 4 palettes d’Arinthod. Suis la consigne écrite à gauche du plan pour chaque palette.',
      entrainement: 'Yanis, range les 4 palettes d’Arinthod en appliquant les règles de l’entrepôt.',
      evaluation: 'Yanis, les 4 palettes d’Arinthod sont à ranger.',
    },
  },
  plan: PLAN, gammes: GAMMES, produits: PRODUITS, stock: STOCK,
  criteres: CRITERES, regles: REGLES, palettes: PALETTES,
};

// ─────────────────────────────────────────────────────────────── articles, stock, réception

export const VOCAB = Object.assign({}, VOCAB_SMOBY, { unit: 'carton', unitPl: 'cartons' });
export const FOURNISSEUR = { id: 'ARI', brand: 'Smoby', name: 'Smoby, usine d’Arinthod', adr: 'Usine d’Arinthod', cp: '39240',
  ville: 'Arinthod', contact: 'Expéditions', email: 'expeditions-arinthod@smoby.example' };

// Le stock de départ de l'écran Stock : les palettes déjà rangées sur le plan, en cartons (construit).
const palettesEnStock = (k) => Object.values(STOCK).filter((s) => s.produit === k).length;
export const STOCK_DEPART = Object.fromEntries(Object.entries(PRODUITS).map(([k, p]) => [p.ref, palettesEnStock(k) * parPalette(k)]));

export const CATALOGUE = catalogueSimple(Object.entries(PRODUITS).map(([, p]) => ({
  ref: p.ref, designation: p.nom, marque: 'Smoby', categorie: GAMMES[p.gamme], fournisseur: FOURNISSEUR.id,
})));

export const REC = 'REC-1209-ARI';
export const BL = 'ARI-26-1209';
export const LOT = 'ARI-26-49';
export const COLIS = PALETTES_ENT54.map((p, i) => ({ no: i + 1, sku: p.ref, qty: reel(p), etat: ecrases(p) ? 'abime' : 'ok' }));
export const ANNONCE = PALETTES_ENT54.map((p) => ({ sku: p.ref, qty: p.bl }));

export function baseDeDepart() {
  return {
    v: 1, created: Date.now(), stock: Object.assign({}, STOCK_DEPART), moves: [], mails: [], orders: [], receptions: [],
    customers: [], suppliers: [], seq: 1, _depart: [],
  };
}

// La décision attendue par ligne : P3 en litige (elle attend la réponse de l'usine, elle n'entre pas en
// stock disponible), les autres entrent à la quantité RÉELLEMENT reçue.
export const ATTENDU = PALETTES_ENT54.map((p) => ({ palette: p.id, sku: p.ref, annonce: p.bl, compte: reel(p),
  litige: !!ecrases(p) }));
// Le stock de porteurs Little Smoby après l'entrée : stock de départ + cartons réellement reçus.
const P4 = pal54('P4');
export const PORTEURS_APRES = STOCK_DEPART[P4.ref] + reel(P4);

// ─────────────────────────────────────────────────────────────── les messages

export const PHRASES_STOCK = {
  id: 'stock-porteurs',
  lignes: [
    { id: 'salutation', texte: 'Bruno,' },
    { id: 'stock', choix: [
      `Il y a maintenant ${PORTEURS_APRES} cartons de porteurs Little Smoby en stock.`,
      `Il y a maintenant ${STOCK_DEPART[P4.ref] + P4.bl} cartons de porteurs Little Smoby en stock.`,
      `Il y a maintenant ${STOCK_DEPART[P4.ref]} cartons de porteurs Little Smoby en stock.`,
    ], juste: 0 },
    { id: 'fin', texte: 'Yanis' },
  ],
  melanger: true,
};

export const PHRASES_KN = {
  id: 'message-kn',
  lignes: [
    { id: 'salutation', choix: ['Bonjour,', 'Salut !', 'Coucou'], juste: 0 },
    { id: 'stock', choix: ['La marchandise d’Arinthod est en stock.', 'Tout est parti.', 'La marchandise d’Arinthod n’est pas encore arrivée.'], juste: 0 },
    { id: 'depart', choix: ['La commande de Noël pourra partir jeudi 10 décembre.', 'La commande de Noël pourra partir vendredi 11 décembre.'], juste: 0 },
    { id: 'fin', choix: ['Cordialement, Yanis — Smoby Moirans', 'Bisous', 'À plus'], juste: 0 },
  ],
  melanger: true,
};

const receptionDe = (db) => ((db && db.receptions) || []).find((r) => r.no === REC) || null;
const validee = (db) => { const r = receptionDe(db); return !!(r && r.ctrl && r.ctrl.validated); };

export const VOLET = {
  id: 'smoby-ent55',
  semer: () => {
    const now = Date.now();
    return {
      receptions: [{
        no: REC, supId: FOURNISSEUR.id, ts: now - 3600e3 * 3, transporteur: 'Transports Jurassiens (fictif)',
        bl: { no: BL, date: now - 3600e3 * 6, lot: LOT, lines: ANNONCE.map((l) => ({ ...l })) },
        colis: COLIS.map((c) => ({ ...c })), ctrl: null,
      }],
      mails: [{
        folder: 'in', ts: now - 120000, from: BRUNO.nom, fromMail: BRUNO.mail, to: 'Yanis',
        subject: 'On range les palettes d’Arinthod', kind: 'text',
        text: 'Yanis, on range les 4 palettes d’Arinthod (menu « Plan de l’entrepôt »). Attention : l’établi Black+Decker a un '
          + 'carton écrasé, il va en zone [[litige|litiges]] en attendant la réponse de l’usine.\n\n'
          + 'Ensuite, saisis l’[[entrée en stock]] (menu Réceptions) : les quantités RÉELLEMENT reçues, pas celles du BL. '
          + 'Le BL est dans le message suivant.\n\n'
          + 'Nous sommes mercredi 9 décembre : la commande de Noël part demain matin, tout doit être en stock ce soir.\n\nBruno',
      }, {
        folder: 'in', ts: now - 60000, from: BRUNO.nom, fromMail: BRUNO.mail, to: 'Yanis',
        subject: `BL ${BL} avec tes réserves`, kind: 'bl', rec: REC,
        text: 'Voici le bon de livraison de la navette d’Arinthod, signé avec tes réserves. Il donne les quantités annoncées et le numéro de lot.\n\nBruno',
      }],
    };
  },
  declencheurs: [{
    // L'entrée saisie : Bruno demande de vérifier l'écran Stock, par phrases.
    id: 'stock',
    quand: validee,
    semer: () => ({ mails: [{
      folder: 'in', ts: Date.now() + 1000, from: BRUNO.nom, fromMail: BRUNO.mail, to: 'Yanis',
      subject: 'Le stock de porteurs', kind: 'text',
      text: 'C’est saisi ? Vérifie l’écran Stock : combien de cartons de porteurs Little Smoby avons-nous maintenant ?\n\n'
        + 'Clique sur « Répondre » et choisis la bonne phrase.\n\nBruno',
      phrases: PHRASES_STOCK,
    }] }),
  }, {
    // La réponse à Bruno : l'exploitation Kuehne+Nagel demande où en est la marchandise.
    id: 'kn',
    quand: tous(validee, apresMail({ a: BRUNO.mail })),
    semer: () => ({ mails: [{
      folder: 'in', ts: Date.now() + 2000, from: KN.nom, fromMail: KN.mail, to: 'Smoby Moirans — quai',
      subject: 'Commande de Noël : la marchandise d’Arinthod', kind: 'text',
      text: 'Bonjour,\n\nNous devons confirmer à notre client le départ de la commande de Noël. La marchandise de l’usine '
        + 'd’Arinthod est-elle arrivée et rangée ? Quand la commande pourra-t-elle partir ?\n\n'
        + 'Merci de nous répondre (« Répondre », une phrase par ligne).\n\nL’exploitation Kuehne+Nagel, agence de Besançon',
      phrases: PHRASES_KN,
    }] }),
  }, {
    // Le relais vers ENT-5.6 : la palette mixte d'E1.
    id: 'relais',
    quand: apresMail({ a: KN.mail }),
    semer: () => ({ mails: [{
      folder: 'in', ts: Date.now() + 3000, from: BRUNO.nom, fromMail: BRUNO.mail, to: 'Yanis',
      subject: 'Merci, et la suite', kind: 'text',
      text: 'Merci Yanis, tout est rangé et saisi. À 17 h 30, on prépare ensemble la palette mixte de la commande de Noël.\n\nBruno',
    }] }),
  }],
};

export const LEXIQUE = Object.assign({}, LEXIQUE_SMOBY, {
  emplacement: 'Case du rack où l’on pose une palette ; son adresse (A1-T03-N2-E1) dit où la trouver.',
  'travée': 'Partie du rack entre deux échelles ; vue de dessus, elle cache plusieurs niveaux.',
  niveau: 'Étage du rack : N1 est le sol, N2 et N3 sont en hauteur.',
  'charge maximale': 'Poids total que les palettes d’un même niveau ne doivent pas dépasser (plaque jaune).',
  litige: 'Désaccord avec le fournisseur sur une marchandise abîmée ou manquante : elle attend sa réponse, à part.',
  'chariot rétractable': 'Chariot dont le mât avance et recule pour ranger en hauteur ; il faut le CACES 5.',
  'entrée en stock': 'Saisie qui ajoute au stock les quantités réellement reçues.',
});

// ─────────────────────────────────────────────────────────────── les jalons (9, brief §5)

const etatPlan = (db) => (db && db.entrepots && db.entrepots[ENTREPOT.id]) || null;
const lignePlan = (db, palette) => jalonsEntrepot(db, ENTREPOT).L.find((l) => l.palette === palette);
const ligneRec = (db, sku) => { const r = receptionDe(db); return (r && r.ctrl && r.ctrl.rows && r.ctrl.rows[sku]) || {}; };
const LIB_DEC = { accepte: 'accepté', reserve: 'accepté sous réserve', refuse: 'refusé', litige: 'en litige', '': '—' };
// Une ligne qui entre en stock à la quantité réellement reçue (acceptée, avec ou sans réserve).
const entreJuste = (db, a) => {
  const x = ligneRec(db, a.sku);
  return Number(x.compte) === a.compte && (x.decision === 'accepte' || x.decision === 'reserve');
};
const att = (id) => ATTENDU.find((a) => a.palette === id);
const statutRec = (db, ok, detail) => (!validee(db) ? { status: 'attente' } : ok ? { status: 'ok' } : { status: 'ko', detail });

const jalonsRangement = PALETTES.map((p) => ({
  id: `${p.id}-rangee`,
  titre: `${p.id} (${p.nom}) bien rangée`,
  verifier(db) {
    const l = lignePlan(db, p.id), e = etatPlan(db), ou = e && e.place && e.place[p.id];
    if (l && l.ok) return { status: 'ok' };
    return ou ? { status: 'ko', detail: `posée en ${ou}` } : { status: 'attente' };
  },
}));

const JALONS = [
  ...jalonsRangement,
  {
    id: 'saisie-p1-p2',
    titre: 'Entrée en stock : P1 et P2 saisies justes',
    verifier(db) {
      const L = [att('P1'), att('P2')];
      return statutRec(db, L.every((a) => entreJuste(db, a)),
        L.map((a) => `${a.palette} : ${ligneRec(db, a.sku).compte} (${LIB_DEC[ligneRec(db, a.sku).decision || '']})`).join(' · '));
    },
  },
  {
    id: 'saisie-p4',
    titre: 'Entrée en stock : P4 saisie avec ses cartons manquants',
    verifier(db) {
      const a = att('P4'), x = ligneRec(db, a.sku);
      return statutRec(db, entreJuste(db, a), `saisi ${x.compte} (${LIB_DEC[x.decision || '']}) — reçu ${a.compte}, BL ${a.annonce}`);
    },
  },
  {
    // Vrai seulement si l'entrée a été saisie : rien saisi ne vaut pas « P3 pas en stock ».
    id: 'p3-litige',
    titre: 'P3 en litige : pas en stock disponible',
    verifier(db) {
      const x = ligneRec(db, att('P3').sku);
      return statutRec(db, x.decision === 'litige', `décision : ${LIB_DEC[x.decision || '']}`);
    },
  },
  {
    id: 'stock-lu',
    titre: 'Écran Stock lu juste (porteurs Little Smoby)',
    verifier(db) {
      const r = phrasesJustes(db, PHRASES_STOCK.id);
      if (!r.envoye) return { status: 'attente' };
      return r.justes.includes('stock') ? { status: 'ok' } : { status: 'ko', detail: 'Relis l’écran Stock après la saisie.' };
    },
  },
  {
    id: 'message-kn',
    titre: 'Réponse à Kuehne+Nagel juste',
    verifier(db) {
      const r = phrasesJustes(db, PHRASES_KN.id);
      if (!r.envoye) return { status: 'attente' };
      return !r.faux.length ? { status: 'ok' } : { status: 'ko', detail: `lignes fausses : ${r.faux.join(', ')}` };
    },
  },
];

// NOTE PONDÉRÉE SUR 20 (poids validés par Tristan le 10/10/2026, lot 3 de `docs/briefs/NOTATION-ponderation.md`). Moitié
// rangement (C1.5, les quatre palettes à égalité), moitié entrée en stock (C1.6 : les cartons manquants de P4 et le litige de P3
// pèsent le plus). Le message à Kuehne+Nagel, la partie « forme », vaut 1,5.
export const BAREME = {
  'P1-rangee': [2.5, 'Palette P1 bien rangée'], 'P2-rangee': [2.5, 'Palette P2 bien rangée'],
  'P3-rangee': [2.5, 'Palette P3 bien rangée'], 'P4-rangee': [2.5, 'Palette P4 bien rangée'],
  'saisie-p1-p2': [2, 'Entrée en stock : P1 et P2'],
  'saisie-p4': [3, 'Entrée en stock : P4 et ses cartons manquants'],
  'p3-litige': [2, 'P3 en litige, pas en stock disponible'],
  'stock-lu': [1.5, 'L’écran Stock lu juste'],
  'message-kn': [1.5, 'Réponse à Kuehne+Nagel'],
};
export const ETAPES = ponderer(JALONS, BAREME, 'ENT-5.5');

// ─────────────────────────────────────────────────────────────── l'accueil

export const ACCUEIL = {
  titre: 'Ranger et saisir l’entrée',
  kpis: ['mail', 'receptions', 'stock'],
  etapes: [
    ['Lire les messages de Bruno', 'Menu Messagerie : ce qu’il faut ranger, et le BL de la navette d’Arinthod.'],
    ['Ranger les 4 palettes', 'Menu Plan de l’entrepôt : prends une palette, choisis la [[travée]], puis l’[[emplacement]]. Ouvre « Les règles ».'],
    ['Saisir l’entrée en stock', 'Menu Réceptions : les quantités RÉELLEMENT reçues ; l’établi abîmé est en [[litige]].'],
    ['Vérifier l’écran Stock', 'Menu Stock : réponds à Bruno.'],
    ['Répondre à Kuehne+Nagel', 'Le transporteur demande où en est la marchandise : « Répondre », une phrase par ligne.'],
  ],
};
