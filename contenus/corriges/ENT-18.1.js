// Corrigé d'ENT-18.1 (Airbus Helicopters, « confier les expéditions »), onglet « Corrigés » de l'enseignant. Tout se recalcule depuis les données.
import { D181 } from '../airbus-donnees.js';
import { corrigeAirbus } from '../airbus-corrige.js';
export const CORRIGE = corrigeAirbus(D181, { titre: 'Airbus Helicopters — confier les expéditions',
  poids: { presta: 1.5, tax: 1.5, cout: 1.5, 'compte-rendu': 4 },
  questions: { texte: 'Trois questions notées au fil (4 points)', rep: 'Le capot prend la place de 144 kg · la messagerie met deux jours · le minimum de 30 €. Réflexion non notée : l’expéditeur répond du poids déclaré.', note: '« Avant de commencer » n’est pas noté.' } });
export function corrigeEleve() { return { texte: '', items: [] }; }
