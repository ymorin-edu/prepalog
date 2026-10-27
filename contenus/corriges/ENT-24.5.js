// Corrigé d'ENT-24.5 (Kuehne+Nagel, « évaluation : préparer la réception »), onglet « Corrigés » de l'enseignant. Recalculé depuis les jalons de la séance (jamais recopié).
import { corrige } from '../kuehne-nagel-ent245.js';
import { BANQUE } from '../kuehne-nagel.js';
const Q = { texte: '« Avant de commencer » noté (3 points) : trois questions tirées, sans aide',
  rep: BANQUE.map((q) => `${q.enonce} → ${q.choix.find((c) => c.v === q.juste).lib}`).join(' · '), note: 'Une réflexion au fil, non notée.' };
export const CORRIGE = { code: 'ENT-24.5', titre: 'Kuehne+Nagel — évaluation : préparer la réception', trame: '(pas de trame : tout se fait à l’écran)', items: corrige({}, { questions: Q }) };
export function corrigeEleve(base) { return { texte: '', items: corrige(base || {}, { questions: Q }) }; }
