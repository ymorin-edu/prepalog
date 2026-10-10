// ENT-5.6 — Smoby, « la palette de la commande de Noël » : les données de la séance (brief
// `docs/briefs/ENT-5.6-smoby-preparation.md`). Univers commun : `contenus/smoby.js` ; la plateforme (plan,
// produits, stock de départ) et la commande E1 : `contenus/smoby-entrepot.js`.
//
// Yanis (l'élève), cariste, mercredi 9 décembre 2026 vers 17 h 30 : préparer la palette mixte qui complète
// l'enlèvement E1 de la commande de Noël (vue `core/types/entrepot.js`, mode préparation, guidage) —
// prélever au picking dans l'ordre du serpentin, faire descendre la réserve du Trotteur en rupture, monter
// une palette stable, la filmer et l'étiqueter. Aucun message à rédiger (décision de Tristan).
//
// Vérifié (brief §2) : la plateforme de stockage de Smoby à Moirans-en-Montagne, les gammes des produits.
// Construit : le plan, le stock, le picking et la réserve, la commande BP-1210-JDR pour Jouets du Rhône
// (fictif, Corbas), les références, poids et cartons, les règles de montage, la hauteur et le poids
// maximaux du transporteur, l'enlèvement E1 par Kuehne+Nagel (flux annoncé comme construit).
//
// Les valeurs attendues (47 m, 331 kg, 1,74 m) sont CALCULÉES par le moteur (`attendusPreparation`),
// jamais recopiées ici.

import { jalonsEntrepot } from '../core/types/entrepot.js';
import { ponderer } from './ponderation.js';
import { LEXIQUE as LEXIQUE_SMOBY, VOCAB as VOCAB_SMOBY } from './smoby.js';
import { BRUNO } from './smoby-ent54.js';
import { GAMMES, PRODUITS, PLAN, STOCK, COMMANDE, PICKING } from './smoby-entrepot.js';

export { BRUNO, COMMANDE };

// ─────────────────────────────────────────────────────────────── la vue « Préparer la commande »

export const REGLES = {
  titre: 'Les règles',
  entete: 'Les règles de la préparation',
  lignes: [
    '<b>Parcours</b> en [[serpentin]], à sens unique : on monte l’allée A, on redescend l’allée B. Revenir en arrière = refaire un tour.',
    'On prélève au <b>[[picking]] (N1)</b> ; N2-N3 = <b>[[réserve]]</b>.',
    'Picking <b>sous son minimum</b> : demander la descente d’une palette de réserve de la même référence (le [[réapprovisionnement]]).',
    '<b>[[palette mixte|Palette]]</b> : lourds en bas (prélevés en premier), fragiles en haut (prélevés en dernier) ; 800 kg et 1,80 m au plus.',
    'Avant l’enlèvement : <b>[[film étirable|film]]</b> 3 à 5 tours ; <b>[[étiquette d’expédition|étiquette]]</b> sur 2 côtés opposés et sur le dessus.',
  ],
  encadre: 'Carton lourd : 15 kg et plus. L’implantation prépare l’ordre : lourds en début de parcours, fragiles à la fin. '
    + 'Valeurs Kuehne+Nagel (800 kg, 1,80 m) : construites pour la séance.',
};

export const ENTREPOT = {
  id: 'smoby-ent56',
  libelle: 'Préparer la commande',
  mode: 'preparation',
  personnage: {
    nom: BRUNO.nom, role: BRUNO.role, date: 'mer. 9 déc., 17 h 30',
    texte: {
      guidage: 'Yanis, la palette de complément de la commande de Noël pour Jouets du Rhône part demain à 6 h (E1). '
        + 'Le [[bon de préparation]] est trié dans l’ordre du parcours : suis-le ligne par ligne.',
      entrainement: 'Yanis, prépare la palette de Jouets du Rhône pour l’enlèvement E1. La liste n’est pas triée : à toi de choisir l’ordre. Les allées sont à sens unique.',
      evaluation: 'Yanis, la palette de Jouets du Rhône part demain à 6 h (E1). Aujourd’hui les allées sont à double sens : choisis ton parcours.',
    },
  },
  plan: PLAN, gammes: GAMMES, produits: PRODUITS, stock: STOCK,
  regles: REGLES, commande: COMMANDE, picking: PICKING,
  // Les 9 jalons du brief (§5). Les critères de la palette ne comptent que si toutes les lignes sont justes
  // (moteur) ; le parcours aussi, ici (un tour d'une ligne ne doit rien rapporter).
  jalons: [
    { type: 'lignesJustes' }, { type: 'reappro' }, { type: 'lourds' }, { type: 'fragiles' }, { type: 'poids' },
    { type: 'hauteur' }, { type: 'film' }, { type: 'etiquettes' }, { type: 'parcours', garde: 'lignesJustes' },
  ],
};

// Les jalons, dans l'ordre du suivi : un jalon de la vue = une étape.
const JALONS = jalonsEntrepot({}, ENTREPOT).L.map(({ id, lib }) => ({
  id, titre: lib,
  verifier(db) {
    const l = jalonsEntrepot(db, ENTREPOT).L.find((x) => x.id === id);
    return { status: l && l.ok ? 'ok' : 'attente' };
  },
}));

// NOTE PONDÉRÉE SUR 20 (poids validés par Tristan le 10/10/2026, lot 3 de `docs/briefs/NOTATION-ponderation.md`). Le cœur :
// les bonnes lignes et le réapprovisionnement de la rupture, puis la palette stable (lourds en bas, fragiles en haut, poids,
// hauteur). Film et étiquettes sont des gestes courts (2,5 sur 20). Le parcours en serpentin, sans marge, vaut 3.
export const BAREME = {
  lignesJustes: [4, 'Les lignes prélevées'],
  reappro: [3, 'Le réapprovisionnement'],
  lourds: [2, 'Lourds en bas, fragiles en haut'], fragiles: [2, 'Lourds en bas, fragiles en haut'],
  poids: [2, 'Poids et hauteur de la palette'], hauteur: [1.5, 'Poids et hauteur de la palette'],
  film: [1, 'Film et étiquettes'], etiquettes: [1.5, 'Film et étiquettes'],
  parcours: [3, 'Le parcours le plus court'],
};
export const ETAPES = ponderer(JALONS, BAREME, 'ENT-5.6');

// ─────────────────────────────────────────────────────────────── les messages

const etatPrep = (db) => (db && db.entrepots && db.entrepots[ENTREPOT.id]) || null;
// La préparation terminée, vérifiée, et juste sur les lignes et toute la palette (jalons 1 à 8). Le
// parcours n'y entre pas : un détour ne se rattrape pas en reprenant la préparation, et Bruno doit
// pouvoir conclure.
// La préparation terminée et vérifiée, juste ou non : la séance est finie, la suivante s'ouvre (lot 0 de
// SMOBY-notation-5.3-5.8). « Reprendre la préparation » ne la referme pas : la photo est déjà rangée.
export const preparationFinie = (db) => { const e = etatPrep(db); return !!(e && e.fin && e.verifie); };
export const preparationConforme = (db) => {
  const e = etatPrep(db);
  if (!e || !e.fin || !e.verifie) return false;
  return jalonsEntrepot(db, ENTREPOT).L.filter((l) => l.id !== 'parcours').every((l) => l.ok);
};

export const VOLET = {
  id: 'smoby-ent56',
  semer: () => ({
    mails: [{
      folder: 'in', ts: Date.now() - 60000, from: BRUNO.nom, fromMail: BRUNO.mail, to: 'Yanis',
      subject: 'La palette de la commande de Noël', kind: 'text',
      text: 'Dernière mission de la journée, Yanis : la [[palette mixte]] de complément de la commande de Noël pour Jouets '
        + 'du Rhône. Les 32 palettes complètes sont prêtes ; il manque celle-ci, avec six produits différents.\n\n'
        + 'Elle part demain à 6 h avec les autres, enlèvement E1 par Kuehne+Nagel, quai n° 1.\n\n'
        + 'Menu « Préparer la commande » : suis le parcours, prélève au [[picking]], et monte-la proprement : lourds en bas, '
        + 'fragiles en haut.\n\nBruno',
    }],
  }),
  declencheurs: [{
    // La préparation vérifiée et conforme : Bruno conclut la journée (texte fixe, rien à répondre).
    id: 'fin',
    quand: preparationConforme,
    semer: () => ({ mails: [{
      folder: 'in', ts: Date.now() + 1000, from: BRUNO.nom, fromMail: BRUNO.mail, to: 'Yanis',
      subject: 'La palette est prête', kind: 'text',
      text: 'Parfait. Je la mets en zone d’expédition avec les 32 autres. Demain 6 h, Kuehne+Nagel charge le tout. '
        + 'Bonne soirée, Yanis.\n\nBruno',
    }] }),
  }],
};

export const VOCAB = Object.assign({}, VOCAB_SMOBY, { unit: 'carton', unitPl: 'cartons' });

export const LEXIQUE = Object.assign({}, LEXIQUE_SMOBY, {
  picking: 'Emplacement au sol (niveau N1) où l’on prélève les cartons à la main pour préparer les commandes.',
  'réserve': 'Palettes stockées en hauteur (N2, N3) : on n’y prélève pas, elles servent à remplir le picking.',
  'réapprovisionnement': 'Descente d’une palette de réserve pour remplir un picking qui n’a plus assez de cartons.',
  'bon de préparation': 'Liste des produits d’une commande à prélever, avec l’adresse et la quantité de chaque ligne.',
  'palette mixte': 'Palette qui porte plusieurs produits différents d’une même commande.',
  'film étirable': 'Film plastique enroulé autour de la palette pour tenir les cartons pendant le transport.',
  'étiquette d’expédition': 'Étiquette qui dit à qui va la palette et par quel enlèvement ; elle doit se lire de chaque côté du camion.',
  serpentin: 'Parcours qui monte une allée et redescend la suivante, sans revenir en arrière.',
});

// ─────────────────────────────────────────────────────────────── l'accueil

export const ACCUEIL = {
  titre: 'Préparer la palette de la commande de Noël',
  kpis: ['mail'],
  etapes: [
    ['Lire le message de Bruno', 'Menu Messagerie : la palette qui manque à l’enlèvement E1.'],
    ['Prélever les 6 lignes', 'Menu Préparer la commande : suis le [[bon de préparation]] dans l’ordre du [[serpentin]], au [[picking]] (N1).'],
    ['Traiter la rupture', 'Le Trotteur n’a plus assez de cartons : [[réapprovisionnement]] depuis la [[réserve]], par une palette de la même référence.'],
    ['Terminer, filmer, étiqueter', '[[film étirable|Film]] et [[étiquette d’expédition|étiquettes]], puis « Vérifier ma préparation » et lire le bilan.'],
  ],
};
