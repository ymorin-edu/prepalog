// Corrigé d'ENT-17.1 (La Redoute, « emballer juste »), onglet « Corrigés » de l'enseignant. Tout se recalcule depuis les données.
import { D171 } from '../la-redoute-donnees.js';
import { corrigeLaRedoute } from '../la-redoute-corrige.js';
export const CORRIGE = corrigeLaRedoute(D171, { titre: 'La Redoute — emballer juste', K: { emb: true },
  poids: { format: 1.5, vide: 1.5, apres: 1.5, gain: 1, 'compte-rendu': 3 },
  questions: { texte: 'Trois questions notées au fil (4 points)', rep: 'C-1702 : 5 L, plus que la pochette · le vide coûte en camions, carton et calage · réduire avant de recycler. Réflexion non notée : tout le monde gagne à des colis plus petits.', note: '« Avant de commencer » n’est pas noté.' } });
export function corrigeEleve() { return { texte: '', items: [] }; }
