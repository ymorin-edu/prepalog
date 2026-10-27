// Corrigé d'ENT-2.10 (Cdiscount, « préparer la semaine de Noël »), onglet « Corrigés » de l'enseignant. Tout se recalcule depuis les données.
import { D210 } from '../cdiscount-noel-donnees.js';
import { corrigeNoel } from '../cdiscount-noel-corrige.js';
export const CORRIGE = corrigeNoel(D210, { titre: 'Cdiscount — préparer la semaine de Noël',
  K: { abc: true, emplacements: true, prep: true, eff: true },
  poids: { classeA: 3, pctLignes: 1, emplacements: 2, cmd: 2, lots: 2, methode: 1, besoin: 2, interim: 2, 'compte-rendu': 2 },
  questions: { texte: '« Avant de commencer » noté (3 points)', rep: 'Trois questions tirées dans la banque commune (ligne de commande, classe A, implantation, lots, motif de l’intérim, employeur de l’intérimaire). Réflexion au fil non notée.', note: '' } });
export function corrigeEleve() { return { texte: '', items: [] }; }
