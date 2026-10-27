// Corrigé d'ENT-13.9 (Stellantis, « évaluation : le bord de ligne »), onglet « Corrigés » de l'enseignant. Chaque élève a SON jeu (tiré d'après son
// identifiant) : `corrigeEleve(base, uid)` le recalcule depuis les jalons de la séance et sa matinée.
import { corrige } from '../stellantis-ent139.js';
import { BANQUE } from '../stellantis-ligne.js';
const Q = { texte: '« Avant de commencer » noté (3 points) : trois questions tirées, sans aide',
  rep: BANQUE.map((q) => `${q.enonce} → ${q.choix.find((c) => c.v === q.juste).lib}`).join(' · '), note: 'Deux de préparation, une de droit. Une réflexion au fil, non notée.' };
export const CORRIGE = { code: 'ENT-13.9', titre: 'Stellantis Sochaux — évaluation : le bord de ligne', trame: '(pas de trame : tout se fait à l’écran)',
  items: [{ etape: 1, etapeTitre: 'Un jeu par élève', genre: 'question', texte: 'Choisir un élève du groupe pour voir son corrigé', rep: 'Quatre jeux possibles, tirés d’après l’identifiant de l’élève.' }] };
export function corrigeEleve(base, uid) {
  const g = (base && base.tirage && base.tirage.graine) || uid || '';
  return { texte: '', items: corrige({ ...(base || {}), tirage: { ...((base && base.tirage) || {}), graine: g } }, { questions: Q }) };
}
