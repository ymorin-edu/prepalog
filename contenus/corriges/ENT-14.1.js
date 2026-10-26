// Corrigé d'ENT-14.1 (Lactalis, « douze lots rappelés »), onglet « Corrigés » de l'enseignant. Tout se recalcule depuis les données.
import { D141 } from '../lactalis-donnees.js';
import { corrigeLactalis } from '../lactalis-corrige.js';
export const CORRIGE = corrigeLactalis(D141, { titre: 'Lactalis — douze lots rappelés',
  poids: { lots: 3, magasins: 3, partis: 1, restant: 2, bloque: 2, 'rien-de-trop': 1, 'compte-rendu': 2 },
  questions: { texte: 'Trois questions notées au fil (4 points)', rep: 'Où chercher un lot : le registre des réceptions · un lot parti en entier : prévenir ses magasins · bloquer par lot : l’autre lot de PIC1-800 reste vendable. Réflexion non notée : le magasin qui attend (art. 19).', note: '« Avant de commencer » n’est pas noté.' } });
export function corrigeEleve() { return { texte: '', items: [] }; }
