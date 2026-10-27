// Corrigé d'ENT-15.1 (Syngenta, « ranger selon le danger »), onglet « Corrigés » de l'enseignant. Tout se recalcule depuis les données.
import { D151 } from '../syngenta-donnees.js';
import { corrigeSyngenta } from '../syngenta-corrige.js';
export const CORRIGE = corrigeSyngenta(D151, { titre: 'Syngenta — ranger selon le danger',
  poids: { palette: 1.5, 'vol-C1': 1.5, 'ret-C1': 2.5, 'compte-rendu': 3 },
  questions: { texte: 'Trois questions notées au fil (4 points)', rep: 'La flamme passe en premier (risque de feu) · 50 % : un inflammable qui s’étale peut s’enflammer · une fuite : s’écarter, prévenir, consigne. Réflexion non notée : l’information du public (Seveso).', note: '« Avant de commencer » n’est pas noté.' } });
export function corrigeEleve() { return { texte: '', items: [] }; }
