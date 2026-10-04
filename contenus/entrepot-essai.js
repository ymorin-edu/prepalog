// Contenu d'ESSAI de la vue « Plan d'entrepôt » (core/types/entrepot.js) — 04/10/2026.
//
// Le cas « rangement » de la maquette v2 validée par Tristan (`docs/briefs/plan-entrepot/`), données
// reprises TELLES QUELLES de `donnees-maquette.json` (stock de départ figé : 99 emplacements occupés,
// aucun générateur). Il sert à la page `outils/essai-entrepot.html` et au bloc de tests
// `outils/test/entrepot.mjs`. Les cas « comptage » et « préparation » viendront avec leurs lots.
//
// La plateforme (plan, produits, stock, règles) est celle de `contenus/smoby-entrepot.js`, partagée avec
// les séances ENT-5.5 et ENT-5.6.

export const MENTION = 'Essai du moteur. Réels : Smoby et ses gammes. <b>Construits pour l’exercice</b> : le plan '
  + 'de la zone, le stock, les poids, les références et les palettes.';

import { GAMMES, PRODUITS, PLAN, STOCK, CRITERES, REGLES } from './smoby-entrepot.js';

export { GAMMES, PRODUITS, PLAN, STOCK, CRITERES, REGLES };

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

export const CAS = { rangement: RANGEMENT };
