// Picard — ENT-4.1 « Le premier camion » (guidage) : le quai de la séance.
//
// Les données de la maquette v8, validée par Tristan (`docs/briefs/picard/maquette-quai-picard.html`) :
// un camion, cinq palettes, un aléa par palette, toutes les aides. Tout est CONSTRUIT (voir
// `contenus/picard.js`). Les valeurs attendues (cartons réels, quantités des réserves) ne sont
// pas écrites ici : la vue les calcule depuis la palette (`core/types/quai.js`).
//
//   P1  couche du dessus incomplète mais conforme au BL     → accepter
//   P2  2 cartons écrasés, visibles de l'arrière seulement   → réserves, cartons endommagés
//   P3  −14,2 °C à cœur                                      → refuser, température
//   P4  2 cartons manquants, dont un dans le coin du fond     → réserves, manquant
//   P5  étiquette EPB-450 au lieu de EPH-450                 → refuser, produit différent

import { LIEU, PHOTOS, DECHARGEMENT, COUTS, SEUIL_HORS_FROID, AVERTISSEMENT, BON_A_SAVOIR, releves } from './picard.js';

// Une palette : W cartons en largeur × D en profondeur × L couches. `manque` : cartons absents,
// « i,j,k » (k = couche, 0 en bas). `avarie` : carton abîmé « i,j,k » → côté abîmé (dx, dy).
export const PALETTES_ENT41 = [
  { id: 'P1', ref: 'HVE-1000', nom: 'Haricots verts extra-fins 1 kg', bl: 57,
    etiq: { ref: 'HVE-1000', nom: 'HARICOTS VERTS EXTRA-FINS', poids: '10 × 1 kg', lot: 'L26-2741', ddm: '09/2028' },
    W: 4, D: 3, L: 5, manque: ['0,0,4', '1,0,4', '2,0,4'], avarie: {}, temp: -21.5, attendu: 'accepter', motifAttendu: 'aucun' },
  { id: 'P2', ref: 'CRB-070', nom: 'Croissants pur beurre à cuire', bl: 36,
    etiq: { ref: 'CRB-070', nom: 'CROISSANTS PUR BEURRE À CUIRE', poids: '6 × 70 g × 10', lot: 'L26-2688', ddm: '03/2028' },
    W: 3, D: 3, L: 4, manque: [], avarie: { '1,0,2': [0, -1], '2,0,1': [0, -1] }, temp: -19.8, attendu: 'reserves', motifAttendu: 'avarie' },
  { id: 'P3', ref: 'GVA-1000', nom: 'Glaces vanille 1 L', bl: 48,
    etiq: { ref: 'GVA-1000', nom: 'CRÈME GLACÉE VANILLE 1 L', poids: '8 × 1 L', lot: 'L26-2702', ddm: '06/2028' },
    W: 4, D: 3, L: 4, manque: [], avarie: {}, temp: -14.2, attendu: 'refuser', motifAttendu: 'temperature' },
  { id: 'P4', ref: 'CAB-400', nom: 'Filets de cabillaud 400 g', bl: 24,
    etiq: { ref: 'CAB-400', nom: 'FILETS DE CABILLAUD', poids: '12 × 400 g', lot: 'L26-2719', ddm: '12/2027' },
    W: 3, D: 2, L: 4, manque: ['2,1,3', '0,0,3'], avarie: {}, temp: -20.4, attendu: 'reserves', motifAttendu: 'manquant' },
  { id: 'P5', ref: 'EPH-450', nom: 'Épinards hachés 450 g', bl: 30,
    etiq: { ref: 'EPB-450', nom: 'ÉPINARDS EN BRANCHES', poids: '12 × 450 g', lot: 'L26-2733', ddm: '10/2028' },
    W: 3, D: 2, L: 5, manque: [], avarie: {}, temp: -20.9, attendu: 'refuser', motifAttendu: 'produit' },
];

export const QUAI_ENT41 = {
  id: 'picard-ent41',
  titre: 'Entrepôt Picard de Sainghin-en-Mélantois (59) — Quai 32, réception',
  destinataire: 'Picard',
  avertissement: AVERTISSEMENT,
  bonASavoir: BON_A_SAVOIR,
  lieu: LIEU,
  seuilHorsFroid: SEUIL_HORS_FROID,
  dechargement: DECHARGEMENT,
  couts: COUTS,
  aides: { regleCouches: true, detailComptage: true, repere: true, chefDeQuai: true, consignes: true },
  photos: PHOTOS,
  camions: [{
    transporteur: 'Transports Givrex', fournisseur: 'Surgelés du Littoral', fictif: true, bl: 'SL-26-1184', arrivee: '06:00',
    // Remontée entre 03:45 et 04:45 : une remontée qui a duré, à signaler.
    ticket: { remorque: 'FR-627', societe: 'Givrex', consigne: -20, depart: '00:00',
      releves: releves({ 225: -16.8, 240: -12.6, 255: -12.1, 270: -13.0, 285: -17.4 }) },
    qcmTicket: { attendu: 'long' },
    palettes: PALETTES_ENT41,
  }],
};
