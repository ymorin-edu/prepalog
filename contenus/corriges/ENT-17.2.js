// Corrigé d'ENT-17.2 (La Redoute, « emballer juste, avec du fragile »), onglet « Corrigés » de l'enseignant. Tout se recalcule depuis les données.
import { D172 } from '../la-redoute-donnees.js';
import { corrigeLaRedoute } from '../la-redoute-corrige.js';
export const CORRIGE = corrigeLaRedoute(D172, { titre: 'La Redoute — emballer juste, avec du fragile', K: { emb: true },
  poids: { format: 1, vide: 1.5, apres: 1, gain: 1, 'compte-rendu': 3 },
  questions: { texte: 'Trois questions notées au fil (4 points)', rep: 'Le calage compte comme du vide · trop grand pour le M : carton L · un article seul : une pochette plus petite. Réflexion non notée : l’emballage réutilisable.', note: '« Avant de commencer » n’est pas noté.' } });
export function corrigeEleve() { return { texte: '', items: [] }; }
