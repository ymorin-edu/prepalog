// Corrigé d'ENT-19.2 (Amazon, « prendre mon poste »), onglet « Corrigés » de l'enseignant. Recalculé depuis les jalons de la séance (jamais recopié).
import { corrige } from '../amazon-ent192.js';
import { QUESTIONS } from '../questions/ENT-19.2.js';
const fil = QUESTIONS.liste.filter((q) => q.type === 'fil' && !q.reflexion);
const Q = { texte: `Questions notées au fil (4 points)`, rep: fil.map((q) => `${q.enonce} → ${q.choix.find((c) => c.v === q.juste).lib}`).join(' · '),
  note: '« Avant de commencer » n’est pas noté ; la réflexion non plus.' };
export const CORRIGE = { code: 'ENT-19.2', titre: 'Amazon — prendre mon poste', trame: '(pas de trame : tout se fait à l’écran)', items: corrige({}, { questions: Q }) };
export function corrigeEleve(base) { return { texte: '', items: corrige(base || {}, { questions: Q }) }; }
