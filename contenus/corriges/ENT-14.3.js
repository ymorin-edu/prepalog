// Corrigé d'ENT-14.3 (Lactalis, « le lot oublié »), onglet « Corrigés » de l'enseignant. Tout se recalcule depuis les données.
import { D143 } from '../lactalis-donnees.js';
import { corrigeLactalis } from '../lactalis-corrige.js';
export const CORRIGE = corrigeLactalis(D143, { titre: 'Lactalis — le lot oublié',
  poids: { oublies: 4, pourquoi: 1, magasins: 3, apres: 2, reste: 2, bloque: 2, 'rien-de-trop': 1, 'compte-rendu': 1 },
  questions: { texte: 'Trois questions notées au fil (4 points)', rep: '« Depuis le 15 » comprend le 15 · livré après l’avis : des boîtes vendues · le double contrôle. Réflexion non notée : dire l’erreur sans chercher de coupable.', note: '« Avant de commencer » n’est pas noté.' } });
export function corrigeEleve() { return { texte: '', items: [] }; }
