// Contenu d'ESSAI de la vue « Plan d'entrepôt » (core/types/entrepot.js) — 04/10/2026.
//
// Le cas « rangement » de la maquette v2 validée par Tristan (`docs/briefs/plan-entrepot/`), données
// reprises TELLES QUELLES de `donnees-maquette.json` (stock de départ figé : 99 emplacements occupés,
// aucun générateur). Il sert à la page `outils/essai-entrepot.html` et au bloc de tests
// `outils/test/entrepot.mjs`. Le cas « préparation » (lot 4) suit la maquette (cas ③), sauf l'heure de
// l'enlèvement : jeudi 6 h 00 (décision de Tristan, brief ENT-5.6). Le cas « visite » (second chantier, 05/10)
// est la déclaration de la séance ENT-5.3 elle-même. Le cas « comptage » viendra avec son lot.
//
// La plateforme (plan, produits, stock, règles) est celle de `contenus/smoby-entrepot.js`, partagée avec
// les séances ENT-5.5 et ENT-5.6.

export const MENTION = 'Essai du moteur. Réels : Smoby et ses gammes. <b>Construits pour l’exercice</b> : le plan '
  + 'de la zone, le stock, les poids, les références et les palettes.';

import { GAMMES, PRODUITS, PLAN, STOCK, CRITERES, REGLES, COMMANDE, PICKING } from './smoby-entrepot.js';

export { GAMMES, PRODUITS, PLAN, STOCK, CRITERES, REGLES, COMMANDE, PICKING };

// Les 4 palettes reçues d'Arinthod (ENT-5.4), avec leur fiche produit.
export const PALETTES = [
  { id: 'P1', produit: 'MAI', kg: 420, rotation: 'A', contrainte: 'lourd' },
  { id: 'P2', produit: 'CUI', kg: 270, rotation: 'B', contrainte: 'fragile' },
  { id: 'P3', produit: 'ETA', kg: 290, rotation: 'B', contrainte: 'lourd', reception: '1 carton écrasé', litige: true },
  { id: 'P4', produit: 'POR', kg: 180, rotation: 'C', reception: '2 cartons manquants' },
];

export const RANGEMENT = {
  id: 'essai-rangement',
  libelle: 'Plan de l’entrepôt',
  mode: 'rangement',
  personnage: {
    nom: 'Bruno', role: 'chef de quai', date: 'mer. 9 déc., 17 h',
    texte: {
      guidage: 'Yanis, on range les 4 palettes d’Arinthod. Suis la consigne écrite sur chaque palette.',
      entrainement: 'Yanis, range les 4 palettes d’Arinthod en appliquant les règles de l’entrepôt.',
      evaluation: 'Yanis, les 4 palettes d’Arinthod sont à ranger.',
    },
  },
  plan: PLAN, gammes: GAMMES, produits: PRODUITS, stock: STOCK,
  criteres: CRITERES, regles: REGLES, palettes: PALETTES,
};

// Le cas ③ de la maquette : la palette mixte de la commande de Noël (BP-1210-JDR), ENT-5.6.
export const REGLES_PREP = {
  titre: 'Les règles',
  entete: 'Les règles de la préparation',
  lignes: [
    '<b>Parcours</b> à sens unique : on monte l’allée A, on redescend l’allée B. Revenir en arrière = refaire un tour.',
    'On prélève au <b>picking (N1)</b> ; N2-N3 = <b>réserve</b>.',
    'Picking <b>sous son minimum</b> : demander la descente d’une palette de réserve de la même référence.',
    '<b>Palette</b> : lourds en bas (prélevés en premier), fragiles en haut (prélevés en dernier) ; 800 kg et 1,80 m au plus.',
    'Avant l’enlèvement : <b>film</b> 3 à 5 tours ; <b>étiquette</b> sur 2 côtés opposés et sur le dessus.',
  ],
  encadre: 'Carton lourd : 15 kg et plus. L’implantation prépare l’ordre : lourds en début de parcours, fragiles à la fin. '
    + 'Valeurs Kuehne+Nagel (800 kg, 1,80 m) : construites pour la séance.',
};
export const PREPARATION = {
  id: 'essai-preparation',
  libelle: 'Préparer la commande',
  mode: 'preparation',
  personnage: {
    nom: 'Bruno', role: 'chef de quai', date: 'mer. 9 déc., 17 h 30',
    texte: {
      guidage: 'Yanis, la palette de complément de la commande de Noël pour Jouets du Rhône part demain à 6 h (E1). La liste est triée dans l’ordre du parcours : suis-la ligne par ligne.',
      entrainement: 'Yanis, prépare la palette de Jouets du Rhône pour l’enlèvement E1. La liste n’est pas triée : à toi de choisir l’ordre. Les allées sont à sens unique.',
      evaluation: 'Yanis, la palette de Jouets du Rhône part demain à 6 h (E1). Aujourd’hui les allées sont à double sens : choisis ton parcours.',
    },
  },
  plan: PLAN, gammes: GAMMES, produits: PRODUITS, stock: STOCK,
  regles: REGLES_PREP, commande: COMMANDE, picking: PICKING,
  jalons: [
    { type: 'lignesJustes' }, { type: 'reappro' }, { type: 'lourds' }, { type: 'fragiles' }, { type: 'poids' },
    { type: 'hauteur' }, { type: 'film' }, { type: 'etiquettes' }, { type: 'parcours', garde: 'lignesJustes' },
  ],
};

// La visite de la plateforme (ENT-5.3), mode `visite` (brief MOTEUR-modes-visite).
export { VISITE } from './smoby-ent53.js';
import { VISITE } from './smoby-ent53.js';

export const CAS = { rangement: RANGEMENT, preparation: PREPARATION, visite: VISITE };
