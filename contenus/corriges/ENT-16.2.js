// Corrigé d'ENT-16.2 (Royal Canin, « les indicateurs de novembre », au tableur), onglet « Corrigés » de l'enseignant. Valeurs tirées par élève : `corrigeEleve`.
import { D162 } from '../royal-canin-donnees.js';
import { T162 } from '../royal-canin-tableur.js';
import { ETAPES } from '../royal-canin-ent162.js';
import { corrigeRoyalCanin, corrigeTableurEleve } from '../royal-canin-corrige.js';
export const CORRIGE = corrigeRoyalCanin(D162, { titre: 'Royal Canin — les indicateurs de novembre', K: { ind: true }, tab: T162, jalonsTab: ETAPES,
  poids: { export: 2, 'compte-rendu': 3.5 },
  questions: { texte: 'Trois questions notées au fil (4 points)', rep: 'Cambrai écarté : on calcule sur le périmètre qu’on pilote · la référence à peine au-dessus de son délai n’est pas une rupture · avancer la production de la plus urgente. Réflexion non notée : livrer souvent = plus de camions.', note: '« Avant de commencer » n’est pas noté.' } });
export const corrigeEleve = (base) => corrigeTableurEleve(T162, base);
