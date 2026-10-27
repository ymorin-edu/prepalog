// Corrigé d'ENT-2.7 (Cdiscount, « les bons articles au bon endroit »), onglet « Corrigés » de l'enseignant. Tout se recalcule depuis les données.
import { D27 } from '../cdiscount-noel-donnees.js';
import { corrigeNoel } from '../cdiscount-noel-corrige.js';
export const CORRIGE = corrigeNoel(D27, { titre: 'Cdiscount — les bons articles au bon endroit',
  K: { abc: true, pctRefs: true, places: true, marche: true },
  poids: { classeA: 4, pctLignes: 2, pctRefs: 1, m1: 1.5, m2: 1.5, m3: 1.5, avant: 1.5, apres: 1.5, 'compte-rendu': 1.5 },
  questions: { texte: 'Trois questions notées au fil (4 points)', rep: 'Trier d’abord par lignes · la plus demandée au plus près : chaque mètre compte sur plus de lignes · les références repoussées ont peu de lignes. Réflexion non notée : pourquoi l’intérim (art. L1251-6).', note: '« Avant de commencer » n’est pas noté.' } });
export function corrigeEleve() { return { texte: '', items: [] }; }
