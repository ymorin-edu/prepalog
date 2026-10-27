// Corrigé d'ENT-18.5 (Airbus Helicopters, « évaluation : confier les expéditions »), onglet « Corrigés » de l'enseignant. Tout se recalcule depuis les données.
import { D185 } from '../airbus-donnees.js';
import { corrigeAirbus } from '../airbus-corrige.js';
export const CORRIGE = corrigeAirbus(D185, { titre: 'Airbus Helicopters — évaluation : confier les expéditions',
  poids: { presta: 1.5, tax: 1, cout: 1.5, danger: 2, 'compte-rendu': 4 },
  questions: { texte: '« Avant de commencer » noté (3 points)', rep: 'Trois questions tirées dans la banque commune (poids taxable, AOG, hors gabarit, messagerie ; marchandise dangereuse, lettre de voiture). Réflexion au fil non notée.', note: '' } });
export function corrigeEleve() { return { texte: '', items: [] }; }
