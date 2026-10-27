// Corrigé d'ENT-16.6 (Royal Canin, évaluation), onglet « Corrigés » de l'enseignant. Indicateurs tirés par élève (au tableur) : `corrigeEleve`.
import { D166 } from '../royal-canin-donnees.js';
import { T166 } from '../royal-canin-tableur.js';
import { ETAPES } from '../royal-canin-ent166.js';
import { corrigeRoyalCanin, corrigeTableurEleve } from '../royal-canin-corrige.js';
export const CORRIGE = corrigeRoyalCanin(D166, { titre: 'Royal Canin — évaluation : piloter l’entrepôt', K: { ind: true, impl: true, export: true }, tab: T166, jalonsTab: ETAPES,
  poids: { export: 1, zone: 1.5, lots: 2, quantites: 2, 'compte-rendu': 2 },
  questions: { texte: '« Avant de commencer » noté (3 points)', rep: 'Trois questions tirées sans aide (2 de préparation, 1 de droit) ; « Je ne sais pas » permis, une réponse fausse retire des points. Réflexion non notée : la rupture d’abord.', note: '' } });
export const corrigeEleve = (base) => corrigeTableurEleve(T166, base);
