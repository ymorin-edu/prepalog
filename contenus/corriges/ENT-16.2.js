// Corrigé d'ENT-16.2 (Royal Canin, « les indicateurs de novembre »), onglet « Corrigés » de l'enseignant. Tout se recalcule depuis les données.
import { D162 } from '../royal-canin-donnees.js';
import { corrigeRoyalCanin } from '../royal-canin-corrige.js';
export const CORRIGE = corrigeRoyalCanin(D162, { titre: 'Royal Canin — les indicateurs de novembre', K: { ind: true },
  poids: { rotation: 1.5, couverture: 1.5, rupture: 2.5, surstock: 2.5, service: 2, 'compte-rendu': 3 },
  questions: { texte: 'Trois questions notées au fil (4 points)', rep: 'CT-INT-02 : 4 j pour 3 j de délai, pas de rupture · aliment vétérinaire : faible demande · CH-MIN-08 : avancer la production. Réflexion non notée : livrer souvent = plus de camions.', note: '« Avant de commencer » n’est pas noté.' } });
export function corrigeEleve() { return { texte: '', items: [] }; }
