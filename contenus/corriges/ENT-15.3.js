// Corrigé d'ENT-15.3 (Syngenta, « le plan de Lucas »), onglet « Corrigés » de l'enseignant. Tout se recalcule depuis les données.
import { D153 } from '../syngenta-donnees.js';
import { corrigeSyngenta } from '../syngenta-corrige.js';
export const CORRIGE = corrigeSyngenta(D153, { titre: 'Syngenta — le plan de Lucas',
  poids: { erreurs: 4, cause: 2, 'vol-C1': 2, 'ret-C1': 3, 'suf-C1': 2, 'compte-rendu': 3 },
  questions: { texte: 'Trois questions notées au fil (4 points)', rep: 'Lucas a oublié que la flamme passe en premier · rétention trop petite : ça déborde · le dire à Lucas règle à l’appui et prévenir Karim. Réflexion non notée : l’exploitant répond des règles.', note: '« Avant de commencer » n’est pas noté.' } });
export function corrigeEleve() { return { texte: '', items: [] }; }
