// Données d'ESSAI de l'écran « Quai de réception » (core/types/quai.js) — chantier P1, 03/10/2026.
//
// La page `outils/essai-quai.html` et le bloc de tests `outils/test/picard.mjs` montent le vrai
// moteur d'entreprise sur le quai d'ENT-4.1 (`contenus/picard-ent41.js`, les données de la
// maquette v8), avec des réglages que la séance, elle, fixe une fois pour toutes :
//   - guidage (toutes les aides) ou évaluation (aucune aide, chrono réel, copie rendue, note /20) ;
//   - 5 palettes (ENT-4.1) ou 8 (trois palettes sans aléa en plus, pour voir le quai plein) ;
//   - tiers-temps de l'élève.

import * as P from '../contenus/picard.js';
import { QUAI_ENT41, PALETTES_ENT41, VOLET } from '../contenus/picard-ent41.js';
import { etapesQuai } from '../core/types/quai.js';

// Trois palettes sans aléa, pour l'essai à 8 palettes seulement (construites).
const EN_PLUS = [
  { id: 'P6', ref: 'FRI-2500', nom: 'Frites allumettes 2,5 kg', bl: 40,
    etiq: { ref: 'FRI-2500', nom: 'FRITES ALLUMETTES', poids: '4 × 2,5 kg', lot: 'L26-2750', ddm: '05/2028' },
    W: 4, D: 2, L: 5, manque: [], avarie: {}, temp: -21.2, attendu: 'accepter', motifAttendu: 'aucun' },
  { id: 'P7', ref: 'PIZ-400', nom: 'Pizzas jambon-fromage 400 g', bl: 36,
    etiq: { ref: 'PIZ-400', nom: 'PIZZA JAMBON FROMAGE', poids: '8 × 400 g', lot: 'L26-2761', ddm: '02/2028' },
    W: 3, D: 3, L: 4, manque: [], avarie: {}, temp: -20.6, attendu: 'accepter', motifAttendu: 'aucun' },
  { id: 'P8', ref: 'POE-1000', nom: 'Poêlée de légumes 1 kg', bl: 30,
    etiq: { ref: 'POE-1000', nom: 'POÊLÉE DE LÉGUMES', poids: '10 × 1 kg', lot: 'L26-2772', ddm: '11/2028' },
    W: 3, D: 2, L: 5, manque: [], avarie: {}, temp: -21.0, attendu: 'accepter', motifAttendu: 'aucun' },
];

export const NOTE_PROVISOIRE = { reception: 15, horsFroid: [[20, 3], [25, 2], [30, 1]], reel: [[12, 2], [16, 1]], tiersTemps: 4 / 3 };

export function quaiEssai({ evaluation = false, huit = false } = {}) {
  const palettes = huit ? PALETTES_ENT41.concat(EN_PLUS) : PALETTES_ENT41;
  return Object.assign({}, QUAI_ENT41, {
    id: `essai-quai${evaluation ? '-eval' : ''}${huit ? '-8' : ''}`,
    aides: evaluation ? {} : QUAI_ENT41.aides,
    note: evaluation ? NOTE_PROVISOIRE : undefined,
    camions: [Object.assign({}, QUAI_ENT41.camions[0], { palettes })],
  });
}

// Le mail d'accueil du chef de quai : celui de la séance.
const volet = VOLET;

export function univers(reglages = {}) {
  const quai = quaiEssai(reglages);
  return {
    ENTREPRISE: P.ENTREPRISE, VOCAB: P.VOCAB, CATALOGUE: P.catalogue(quai.camions[0].palettes),
    SUPPLIERS: P.SUPPLIERS, SUP_BY_ID: P.SUP_BY_ID, CUSTOMERS: P.CUSTOMERS, CM: P.CM, THEME: P.THEME,
    baseDeDepart: P.baseDeDepart, etapes: etapesQuai(quai), exercice: "Essai de l'écran Quai de réception",
    volet, quai, copie: !!reglages.evaluation, sansTrame: "Tout à l'écran",
  };
}
