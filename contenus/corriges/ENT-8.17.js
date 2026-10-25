// Corrigé d'ENT-8.17 (Action, monter et conditionner sa palette), montré dans l'onglet « Corrigés » de l'enseignant. `corrigeEleve(base, uid)`
// rend le corrigé d'un élève, CALCULÉ depuis son jeu (`contenus/action-ent817-donnees.js`), jamais recopié.

import { graineDeBase } from '../../core/tirage.js';
import { bonOrdre } from '../action-prepa-donnees.js';
import { jeuDe, missionDe, courtDe, classeDe, cartonsDe, LIB_SORTE } from '../action-ent817-donnees.js';

export const CORRIGE = {
  code: 'ENT-8.17',
  titre: 'Action — monter et conditionner sa palette',
  trame: '(pas de trame pour l’instant : tout se fait à l’écran ; cours d’une demi-page après validation)',
  items: [
    { etape: 1, etapeTitre: 'Lire un carton (fiche)', genre: 'question', texte: 'Les 3 cartons',
      rep: 'Le verre à pied : fragile. Les deux flèches : doit rester debout. Plus de 10 kg écrits : lourd. (L’ordre des cartons est tiré par élève.)',
      note: '1 par carton.' },
    { etape: 2, etapeTitre: 'Préparer et monter (terminal vocal, 6 lignes)', genre: 'question', texte: 'Les gestes attendus',
      rep: 'Chaque ligne : code, cartons sélectionnés, quantité, puis la pose. Lourds sur la palette ; un normal ou un fragile qui arrive avant un '
        + 'lourd : « À côté ». Commande terminée : poser ce qui est à côté (normaux, puis fragiles). Film 3 à 5 tours ; étiquettes sur deux faces '
        + 'opposées et le dessus. « Vérifier ma préparation ».',
      note: 'Lignes 0,5 × 6 · lourds en bas 2 · fragiles en haut 2 · poids 1 · hauteur 1 · film 2 · étiquettes 2. Les critères ne sont jugés que si '
        + 'les lignes sont justes et que rien ne reste à côté.' },
    { etape: 3, etapeTitre: 'Les questions de Samia', genre: 'question', texte: 'Les réponses',
      rep: 'q-lourd (au bilan) : la palette tient et rien n’écrase le dessous · q-a-cote : le mettre sur la palette au bon moment · q-film : tenir '
        + 'les cartons pendant le transport · q-tours : plastique gaspillé, un déchet · q-etiquette : la lire de partout.',
      note: '1 + 0,75 × 4 = 4. Total : 16 + 4 = 20. Rien fait = 0.' },
  ],
};

const CLASSE = { lourd: 'lourd', normal: 'normal', fragile: 'fragile' };
export function corrigeEleve(base, uid) {
  const g = graineDeBase(base) || uid || '';
  const j = jeuDe(g), M = missionDe(j);
  const items = [
    { genre: 'fait', texte: 'La mission', rep: `Mission ${M.num} · ${M.magasin} · ${M.lignes} lignes · ${M.cartons} cartons · quai ${M.quai} · départ ${M.depart}` },
    ...cartonsDe(g).map((c) => ({ genre: 'fait', texte: `Carton ${c.n}`, rep: `${c.kg} kg : ${LIB_SORTE[c.sorte]}` })),
    ...j.lignes.map((l, k) => ({ genre: 'fait', texte: `Ligne ${k + 1}`, rep: `${l.a} (code ${j.codes[l.a]}) : ${l.q} ${courtDe(l.produit)} (${CLASSE[classeDe(l.produit)]})` })),
    { genre: 'fait', texte: 'Un bon ordre de pose', rep: bonOrdre(j.lignes).map((l) => `${courtDe(l.produit)} ${l.q}`).join(', ') },
  ];
  return { texte: graineDeBase(base) ? '' : 'Cet élève n’a pas encore ouvert la séance : voici ce qu’il recevra.', items };
}
