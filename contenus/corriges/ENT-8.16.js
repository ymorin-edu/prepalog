// Corrigé d'ENT-8.16 (Action, déstocker et signaler), montré dans l'onglet « Corrigés » de l'enseignant. `corrigeEleve(base, uid)` rend le corrigé
// d'un élève, CALCULÉ depuis son jeu (`contenus/action-ent816-donnees.js`), jamais recopié.

import { graineDeBase } from '../../core/tirage.js';
import { jeuDe, missionDe, anomaliesDe, courtDe } from '../action-ent816-donnees.js';

export const CORRIGE = {
  code: 'ENT-8.16',
  titre: 'Action — déstocker et signaler',
  trame: '(pas de trame pour l’instant : tout se fait à l’écran ; cours d’une demi-page après validation)',
  items: [
    { etape: 1, etapeTitre: 'Préparer (terminal vocal, 7 lignes)', genre: 'question', texte: 'Les gestes attendus',
      rep: 'Les 5 lignes normales : code, cartons sélectionnés, quantité, « Poser sur la palette ». Le carton abîmé (coin enfoncé, ruban déchiré, vu de '
        + 'près) : le sélectionner, « Abîmé », 1 ; il est mis de côté ; reprendre la quantité entière de bons cartons sur la même pile. L’emplacement '
        + 'vide : « Emplacement vide » ; Kevin descend la réserve ; la ligne est redite : la prendre. Puis « Vérifier ma préparation ».',
      note: 'Lignes normales 1 × 5 · abîmé signalé et quantité prise 3 · « Emplacement vide » dit 1,5 · ligne reprise 1,5 · aucun carton abîmé sur la '
        + 'palette 1 (seulement si tout est posé).' },
    { etape: 2, etapeTitre: 'Ce que sait le système (fiche)', genre: 'question', texte: 'Les 3 lignes',
      rep: 'Jugées sur CE QUE L’ÉLÈVE A DIT : abîmé dit → « Oui » (sinon « Non ») ; « Emplacement vide » dit → « Qu’il était vide » (« Manquant » dit → '
        + '« Qu’il manquait des cartons » ; rien → « Il croit qu’il reste des cartons ») ; le prochain préparateur trouvera l’emplacement vide lui aussi.',
      note: '1 par ligne.' },
    { etape: 3, etapeTitre: 'Rendre compte à Samia', genre: 'question', texte: 'Les phrases',
      rep: 'Bonjour Samia, · (ce qu’il a fait pour le carton abîmé) · (ce qu’il a fait pour l’emplacement vide) · Bonne journée ! · (prénom)',
      note: 'Seule la forme est notée (salutation et politesse : 1) : une erreur ne se paie qu’une fois.' },
    { etape: 4, etapeTitre: 'Les questions de Samia', genre: 'question', texte: 'Les réponses',
      rep: 'q-abime (au bilan) : le magasin ne pourra pas le vendre · q-vide : Kevin, le cariste · q-reappro : réapprovisionner · q-tomber : non, '
        + 'l’employeur supporte ce risque sauf faute lourde (C. trav. L1331-2 : pas de sanction pécuniaire).',
      note: '1 + 0,75 + 0,75 + 1,5 = 4. Total : 16 + 4 = 20. Rien fait = 0.' },
  ],
};

export function corrigeEleve(base, uid) {
  const g = graineDeBase(base) || uid || '';
  const j = jeuDe(g), M = missionDe(j), A = anomaliesDe(j);
  const items = [
    { genre: 'fait', texte: 'La mission', rep: `Mission ${M.num} · ${M.magasin} · ${M.lignes} lignes · ${M.cartons} cartons · quai ${M.quai} · départ ${M.depart}` },
    ...j.lignes.map((l, k) => ({ genre: 'fait', texte: `Ligne ${k + 1}`, rep: `${l.a} (code ${j.codes[l.a]}) : ${l.q} ${courtDe(l.produit)}`
      + (k === A.abime.k ? ' — un carton abîmé devant : « Abîmé : 1 », puis reprendre sur la pile' : k === A.vide.k ? ' — VIDE : « Emplacement vide », Kevin descend la réserve' : '') })),
  ];
  return { texte: graineDeBase(base) ? '' : 'Cet élève n’a pas encore ouvert la séance : voici ce qu’il recevra.', items };
}
