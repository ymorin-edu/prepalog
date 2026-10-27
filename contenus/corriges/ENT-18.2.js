// Corrigé d'ENT-18.2 (Airbus Helicopters, « les expéditions de mardi »), onglet « Corrigés » de l'enseignant. Tout se recalcule depuis les données.
import { D182 } from '../airbus-donnees.js';
import { corrigeAirbus } from '../airbus-corrige.js';
export const CORRIGE = corrigeAirbus(D182, { titre: 'Airbus Helicopters — les expéditions de mardi',
  poids: { presta: 1.2, tax: 1.5, cout: 1.5, 'compte-rendu': 4 },
  questions: { texte: 'Trois questions notées au fil (4 points)', rep: 'La longueur limite le choix · le coursier n’est pas le moins cher · Nantes est trop loin pour le coursier. Réflexion non notée : le groupage.', note: '« Avant de commencer » n’est pas noté.' } });
export function corrigeEleve() { return { texte: '', items: [] }; }
