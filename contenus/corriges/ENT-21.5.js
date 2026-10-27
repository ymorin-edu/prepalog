// Corrigé d'ENT-21.5 (Lidl, « évaluation : chiffrer une livraison »), onglet « Corrigés » de l'enseignant. Chaque élève a SON jeu (tiré d'après son identifiant) :
// `corrigeEleve(base, uid)` le recalcule depuis les jalons de la séance.
import { corrige } from '../lidl-ent215.js';
import { BANQUE_TRANSPORT } from '../lidl.js';
const Q = { texte: '« Avant de commencer » noté (3 points) : trois questions tirées, sans aide',
  rep: BANQUE_TRANSPORT.map((q) => `${q.enonce} → ${q.choix.find((c) => c.v === q.juste).lib}`).join(' · '), note: 'Une réflexion au fil, non notée.' };
const jeu = (g) => corrige({ tirage: { graine: g } }, { questions: Q });
export const CORRIGE = { code: 'ENT-21.5', titre: 'Lidl — évaluation : chiffrer une livraison', trame: '(pas de trame : tout se fait à l’écran)',
  items: [{ etape: 1, etapeTitre: 'Un jeu par élève', genre: 'question', texte: 'Choisir un élève du groupe pour voir son corrigé', rep: 'Trois jeux possibles, tirés d’après l’identifiant de l’élève.' }] };
export function corrigeEleve(base, uid) {
  const g = (base && base.tirage && base.tirage.graine) || uid || '';
  return { texte: '', items: jeu(g) };
}
