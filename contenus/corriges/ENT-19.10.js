// Corrigé d'ENT-19.10 (Amazon, « évaluation : prélever et emballer »), onglet « Corrigés » de l'enseignant. Chaque élève a SON jeu (tiré d'après son identifiant) :
// `corrigeEleve(base, uid)` le recalcule depuis les jalons de la séance ; `CORRIGE` montre les trois jeux.
import { corrige } from '../amazon-ent1910.js';
const Q = { texte: '« Avant de commencer » noté (3 points) : trois questions tirées, sans aide', rep: 'Voir la banque de « Le centre de Brétigny » : l’armoire vient au poste ; plusieurs cases ; numéro de l’armoire et case ; jamais dans la zone des robots ; le collègue qui règle les problèmes ; plus grand, jamais plus petit.', note: 'Une réflexion au fil, non notée.' };
const jeu = (g) => corrige({ tirage: { graine: g } }, { questions: Q });
export const CORRIGE = { code: 'ENT-19.10', titre: 'Amazon — évaluation : prélever et emballer', trame: '(pas de trame : tout se fait à l’écran)',
  items: [{ etape: 1, etapeTitre: 'Un jeu par élève', genre: 'question', texte: 'Choisir un élève du groupe pour voir son corrigé', rep: 'Trois jeux possibles, tirés d’après l’identifiant de l’élève.' }] };
export function corrigeEleve(base, uid) {
  const g = (base && base.tirage && base.tirage.graine) || uid || '';
  return { texte: '', items: jeu(g) };
}
