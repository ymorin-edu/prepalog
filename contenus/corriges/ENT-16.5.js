// Corrigé d'ENT-16.5 (Royal Canin, « la commande export de Mehdi »), onglet « Corrigés » de l'enseignant. Tout se recalcule depuis les données.
import { D165 } from '../royal-canin-donnees.js';
import { corrigeRoyalCanin } from '../royal-canin-corrige.js';
export const CORRIGE = corrigeRoyalCanin(D165, { titre: 'Royal Canin — la commande export de Mehdi', K: { export: true },
  poids: { nonconformes: 4, cause: 2, lots: 4, quantites: 2, 'compte-rendu': 4 },
  questions: { texte: 'Trois questions notées au fil (4 points)', rep: 'L7203 : limite au 01/12/2027, il manque quelques jours · FEFO : c’est la DDM qui compte · les lots écartés partent vers des clients moins exigeants. Réflexion non notée : le vendeur supporte la non-conformité.', note: '« Avant de commencer » n’est pas noté.' } });
export function corrigeEleve() { return { texte: '', items: [] }; }
