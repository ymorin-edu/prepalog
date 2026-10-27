// Corrigé d'ENT-16.1 (Royal Canin, « lire les indicateurs du stock »), onglet « Corrigés » de l'enseignant. Tout se recalcule depuis les données.
import { D161 } from '../royal-canin-donnees.js';
import { corrigeRoyalCanin } from '../royal-canin-corrige.js';
export const CORRIGE = corrigeRoyalCanin(D161, { titre: 'Royal Canin — lire les indicateurs du stock', K: { ind: true },
  poids: { rotation: 1.5, couverture: 1.5, rupture: 3, surstock: 3, service: 2, 'compte-rendu': 2 },
  questions: { texte: 'Trois questions notées au fil (4 points)', rep: 'Rotation divisée par deux = stock moyen doublé · avancer la production de CT-INT-02 · un surstock immobilise argent et place. Réflexion non notée : vendre ou donner plutôt que jeter (loi AGEC).', note: '« Avant de commencer » n’est pas noté.' } });
export function corrigeEleve() { return { texte: '', items: [] }; }
