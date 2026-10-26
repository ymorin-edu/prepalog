// Corrigé d'ENT-14.2 (Lactalis, « la règle du 15 février »), onglet « Corrigés » de l'enseignant. Tout se recalcule depuis les données.
import { D142 } from '../lactalis-donnees.js';
import { corrigeLactalis } from '../lactalis-corrige.js';
export const CORRIGE = corrigeLactalis(D142, { titre: 'Lactalis — la règle du 15 février',
  poids: { lots: 3, magasins: 3, partis: 1, restant: 2, bloque: 1, 'rien-de-trop': 1, 'compte-rendu': 2 },
  questions: { texte: 'Trois questions notées au fil (4 points)', rep: 'CR-170214-C pas visé (la veille) · un lot parti en entier : ses magasins retirent · une règle n’oublie aucun lot. Réflexion non notée : prévenir lundi ?', note: '« Avant de commencer » n’est pas noté.' } });
export function corrigeEleve() { return { texte: '', items: [] }; }
