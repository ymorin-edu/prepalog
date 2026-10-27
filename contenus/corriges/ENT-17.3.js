// Corrigé d'ENT-17.3 (La Redoute, « trier les retours »), onglet « Corrigés » de l'enseignant. Tout se recalcule depuis les données.
import { D173 } from '../la-redoute-donnees.js';
import { corrigeLaRedoute } from '../la-redoute-corrige.js';
export const CORRIGE = corrigeLaRedoute(D173, { titre: 'La Redoute — trier les retours', K: { ret: true },
  poids: { filiere: 1.25, taux: 3, 'compte-rendu': 3 },
  questions: { texte: 'Trois questions notées au fil (4 points)', rep: 'Essayé : contrôle avant revente · hors d’usage : recyclage, jamais de destruction (AGEC) · un don n’est pas une vente. Réflexion non notée : les retours gratuits.', note: '« Avant de commencer » n’est pas noté.' } });
export function corrigeEleve() { return { texte: '', items: [] }; }
