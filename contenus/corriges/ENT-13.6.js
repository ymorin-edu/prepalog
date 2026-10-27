// Corrigé d'ENT-13.6 (Stellantis, bord de ligne), onglet « Corrigés » de l'enseignant. Recalculé depuis les jalons de la séance (jamais recopié).
import { corrige } from '../stellantis-ent136.js';
import { QUESTIONS } from '../questions/ENT-13.6.js';
const fil = QUESTIONS.liste.filter((q) => q.type === 'fil' && !q.reflexion);
const Q = { texte: `Questions notées au fil (3 points)`, rep: fil.map((q) => `${q.enonce} → ${q.choix.find((c) => c.v === q.juste).lib}`).join(' · '),
  note: '« Avant de commencer » n’est pas noté ; la réflexion non plus.' };
export const CORRIGE = { code: 'ENT-13.6', titre: 'Stellantis Sochaux — le bord de ligne', trame: '(pas de trame : tout se fait à l’écran)', items: corrige({}, { questions: Q }) };
export function corrigeEleve(base) { return { texte: '', items: corrige(base || {}, { questions: Q }) }; }
