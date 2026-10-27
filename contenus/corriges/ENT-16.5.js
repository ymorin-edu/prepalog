// Corrigé d'ENT-16.5 (Royal Canin, « évaluation : piloter l’entrepôt »), onglet « Corrigés » de l'enseignant. Tout se recalcule depuis les données.
import { D165 } from '../royal-canin-donnees.js';
import { corrigeRoyalCanin } from '../royal-canin-corrige.js';
export const CORRIGE = corrigeRoyalCanin(D165, { titre: 'Royal Canin — évaluation : piloter l’entrepôt', K: { ind: true, impl: true, export: true },
  poids: { rotation: 1, couverture: 1, rupture: 2, surstock: 2, service: 2, zone: 1.5, lots: 2, quantites: 2, 'compte-rendu': 2 },
  questions: { texte: '« Avant de commencer » noté (3 points)', rep: 'Trois questions tirées dans la banque commune (rotation, couverture, FEFO, sac lourd ; DDM, conformité). Réflexion au fil non notée.', note: '' } });
export function corrigeEleve() { return { texte: '', items: [] }; }
