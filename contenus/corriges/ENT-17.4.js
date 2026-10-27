// Corrigé d'ENT-17.4 (La Redoute, « le tri de Julien »), onglet « Corrigés » de l'enseignant. Tout se recalcule depuis les données.
import { D174 } from '../la-redoute-donnees.js';
import { corrigeLaRedoute } from '../la-redoute-corrige.js';
export const CORRIGE = corrigeLaRedoute(D174, { titre: 'La Redoute — le tri de Julien', K: { ret: true },
  poids: { erreurs: 5, cause: 3, taux: 4, 'compte-rendu': 4 },
  questions: { texte: 'Trois questions notées au fil (4 points)', rep: 'R-14 remis en stock : un client recevrait un article essayé · un indicateur faux fausse les décisions · le montrer à Julien sur la règle. Réflexion non notée : le réemploi avant le recyclage.', note: '« Avant de commencer » n’est pas noté.' } });
export function corrigeEleve() { return { texte: '', items: [] }; }
