// Corrigé d'ENT-14.4 (Lactalis, évaluation de la traçabilité), onglet « Corrigés » de l'enseignant. Tout se recalcule depuis les données.
import { D144 } from '../lactalis-donnees.js';
import { corrigeLactalis } from '../lactalis-corrige.js';
export const CORRIGE = corrigeLactalis(D144, { titre: 'Lactalis — évaluation de la traçabilité',
  poids: { lots: 4, magasins: 3, apres: 1, partis: 1.5, restant: 1.5, bloque: 1, 'rien-de-trop': 1, 'compte-rendu': 1 },
  questions: { texte: '« Avant de commencer » noté (3 points)', rep: 'Trois questions tirées dans la banque commune (traçabilité, aval, numéro de lot, date d’un lot, retrait, article 19).', note: 'Juste +1, « Je ne sais pas » 0, fausse −1 ÷ nombre de mauvaises réponses, plancher 0. Une réflexion au fil, non notée.' } });
export function corrigeEleve() { return { texte: '', items: [] }; }
