// Corrigé d'ENT-2.9 (Cdiscount, « le calcul de Yanis »), onglet « Corrigés » de l'enseignant. Tout se recalcule depuis les données.
import { D29 } from '../cdiscount-noel-donnees.js';
import { corrigeNoel } from '../cdiscount-noel-corrige.js';
export const CORRIGE = corrigeNoel(D29, { titre: 'Cdiscount — le calcul de Yanis',
  K: { eff: true, erreurs: true, retard: true },
  poids: { erreurs: 4, besoin: 3.5, interim: 3.5, retard: 2, 'compte-rendu': 3 },
  questions: { texte: 'Trois questions notées au fil (4 points)', rep: 'Compter en lignes : chaque ligne fait marcher · 23 et pas 22 : sinon 360 lignes restent · dire l’erreur à Nadia et à Yanis. Réflexion non notée : l’agence ne trouve pas assez de monde.', note: '« Avant de commencer » n’est pas noté.' } });
export function corrigeEleve() { return { texte: '', items: [] }; }
