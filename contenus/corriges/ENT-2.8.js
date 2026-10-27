// Corrigé d'ENT-2.8 (Cdiscount, « une tournée pour cinq commandes »), onglet « Corrigés » de l'enseignant. Tout se recalcule depuis les données.
import { D28 } from '../cdiscount-noel-donnees.js';
import { corrigeNoel } from '../cdiscount-noel-corrige.js';
export const CORRIGE = corrigeNoel(D28, { titre: 'Cdiscount — une tournée pour cinq commandes',
  K: { prep: true, minutes: true },
  poids: { cmd: 3.5, lots: 3.5, marche: 2.5, tri: 2.5, methode: 2, 'compte-rendu': 2 },
  questions: { texte: 'Trois questions notées au fil (4 points)', rep: 'C-4808 : 72 m · le tri répartit les articles mélangés · la commande express se prépare seule. Réflexion non notée : la santé des préparateurs.', note: '« Avant de commencer » n’est pas noté.' } });
export function corrigeEleve() { return { texte: '', items: [] }; }
