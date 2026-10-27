// Corrigé d'ENT-18.4 (Airbus Helicopters, « les réservations de Sofiane »), onglet « Corrigés » de l'enseignant. Tout se recalcule depuis les données.
import { D184 } from '../airbus-donnees.js';
import { corrigeAirbus } from '../airbus-corrige.js';
export const CORRIGE = corrigeAirbus(D184, { titre: 'Airbus Helicopters — les réservations de Sofiane',
  poids: { erreurs: 3, cause: 2, presta: 1, tax: 0.75, cout: 1.5, 'compte-rendu': 2 },
  questions: { texte: 'Trois questions notées au fil (4 points)', rep: 'Le transporteur facture le poids taxable · deux jours au sol coûtent plus que le coursier · le montrer à Sofiane. Réflexion non notée : moins d’AOG.', note: '« Avant de commencer » n’est pas noté.' } });
export function corrigeEleve() { return { texte: '', items: [] }; }
