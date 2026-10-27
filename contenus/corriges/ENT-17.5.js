// Corrigé d'ENT-17.5 (La Redoute, « évaluation : emballage et retours »), onglet « Corrigés » de l'enseignant. Tout se recalcule depuis les données.
import { D175 } from '../la-redoute-donnees.js';
import { corrigeLaRedoute } from '../la-redoute-corrige.js';
export const CORRIGE = corrigeLaRedoute(D175, { titre: 'La Redoute — évaluation : emballage et retours', K: { emb: true, ret: true },
  poids: { format: 1, vide: 1.5, apres: 1, gain: 1, filiere: 1, taux: 1.5, 'compte-rendu': 2 },
  questions: { texte: '« Avant de commencer » noté (3 points)', rep: 'Trois questions tirées dans la banque commune (vide, pochette, retour essayé, RSE ; AGEC, règlement emballages). Réflexion au fil non notée.', note: '' } });
export function corrigeEleve() { return { texte: '', items: [] }; }
