// Corrigé d'ENT-16.3 (Royal Canin, « implanter la zone de picking »), onglet « Corrigés » de l'enseignant. Tout se recalcule depuis les données.
import { D163 } from '../royal-canin-donnees.js';
import { corrigeRoyalCanin } from '../royal-canin-corrige.js';
export const CORRIGE = corrigeRoyalCanin(D163, { titre: 'Royal Canin — implanter la zone de picking', K: { impl: true },
  poids: { zone: 1.5, reappro: 2, 'compte-rendu': 3 },
  questions: { texte: 'Trois questions notées au fil (4 points)', rep: 'VET-DIG-10 : 4 colis/j, la réserve passe avant le poids · 2,5 → 3, sinon le canal se vide · le lourd au sol pour le dos. Réflexion non notée : l’employeur organise le poste.', note: '« Avant de commencer » n’est pas noté.' } });
export function corrigeEleve() { return { texte: '', items: [] }; }
