// Corrigé d'ENT-18.3 (Airbus Helicopters, « les flux particuliers »), onglet « Corrigés » de l'enseignant. Tout se recalcule depuis les données.
import { D183 } from '../airbus-donnees.js';
import { corrigeAirbus } from '../airbus-corrige.js';
export const CORRIGE = corrigeAirbus(D183, { titre: 'Airbus Helicopters — les flux particuliers',
  poids: { presta: 2, tax: 1, cout: 1.5, danger: 2, 'compte-rendu': 2 },
  questions: { texte: 'Trois questions notées au fil (4 points)', rep: 'AOG : le plus rapide · la pale : seulement l’affrètement · la batterie peut prendre feu. Réflexion non notée : les batteries en avion.', note: '« Avant de commencer » n’est pas noté.' } });
export function corrigeEleve() { return { texte: '', items: [] }; }
