// Corrigé d'ENT-15.4 (Syngenta, « évaluation du rangement »), onglet « Corrigés » de l'enseignant. Tout se recalcule depuis les données.
import { D154 } from '../syngenta-donnees.js';
import { corrigeSyngenta } from '../syngenta-corrige.js';
export const CORRIGE = corrigeSyngenta(D154, { titre: 'Syngenta — évaluation du rangement',
  poids: { palette: 1.5, 'vol-C2': 1.5, 'ret-C2': 2.5, 'suf-C2': 1, 'compte-rendu': 3 },
  questions: { texte: '« Avant de commencer » noté (3 points)', rep: 'Trois questions tirées dans la banque commune (flamme, deux pictogrammes, rétention, cellule pleine ; Seveso, étiquette). Réflexion au fil non notée.', note: '' } });
export function corrigeEleve() { return { texte: '', items: [] }; }
