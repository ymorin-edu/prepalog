// Corrigé d'ENT-15.2 (Syngenta, « la cellule pleine »), onglet « Corrigés » de l'enseignant. Tout se recalcule depuis les données.
import { D152 } from '../syngenta-donnees.js';
import { corrigeSyngenta } from '../syngenta-corrige.js';
export const CORRIGE = corrigeSyngenta(D152, { titre: 'Syngenta — la cellule pleine',
  poids: { palette: 1, 'ret-C1': 2, 'suf-C1': 2, 'ret-C3': 2, 'compte-rendu': 2 },
  questions: { texte: 'Trois questions notées au fil (4 points)', rep: 'FC-500 : SGH08 → cellule 2 · PAL-17 pas en cellule 4 (ni rétention ni protection) · rétention trop courte : ne plus rien ajouter, prévenir. Réflexion non notée : la nappe.', note: '« Avant de commencer » n’est pas noté.' } });
export function corrigeEleve() { return { texte: '', items: [] }; }
