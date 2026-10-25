// Corrigé d'ENT-8.15 (Action, prendre en charge une préparation), montré dans l'onglet « Corrigés » de l'enseignant.
//
// Chaque élève a reçu SON jeu (`contenus/action-ent815-donnees.js`, graine = son identifiant) : les deux défauts du poste, la mission et ses 5
// lignes. `CORRIGE` donne ce qui est commun ; `corrigeEleve(base, uid)` rend le corrigé d'un élève, CALCULÉ depuis son jeu (jamais recopié).

import { graineDeBase } from '../../core/tirage.js';
import { defautSiteDe, defautEnginDe, SITE, ENGIN, jeuDe, missionDe, courtDe, phrasePrete } from '../action-ent815-donnees.js';

export const CORRIGE = {
  code: 'ENT-8.15',
  titre: 'Action — prendre en charge une préparation',
  trame: '(pas de trame pour l’instant : tout se fait à l’écran ; cours d’une demi-page après validation)',
  items: [
    { etape: 1, etapeTitre: 'Prendre mon poste (inspection)', genre: 'question', texte: 'Ce qui ne va pas',
      rep: 'Deux défauts tirés par élève : un au quai (extincteur absent ou plan de circulation absent) et un sur le transpalette n° 1 (fourche tordue, '
        + 'roue abîmée, câble de charge débranché, ou avertisseur muet : il ne se trouve qu’en appuyant sur le bouton sous le timon). Les cliquer, '
        + '« Signaler à Samia » (« C’est noté, prends le transpalette 2. »), puis « C’est bon, je prends mon poste ». Le transpalette n° 2 est en ordre.',
      note: 'Chaque défaut signalé : 2 · aucun faux signalement : 1 (seulement une fois le poste pris). Un défaut oublié arrête l’élève, sans le nommer.' },
    { etape: 2, etapeTitre: 'Lire ma mission (fiche)', genre: 'question', texte: 'Les 4 lignes',
      rep: 'Le magasin, le nombre de cartons (pas le nombre de lignes), le quai et l’heure de départ du camion, lus sur l’écran du terminal (voir le '
        + 'corrigé de l’élève).', note: '1 par ligne.' },
    { etape: 3, etapeTitre: 'Préparer (terminal vocal)', genre: 'question', texte: 'Les 5 lignes',
      rep: 'Pour chaque ligne : cliquer la travée puis l’emplacement, lire le code sur l’étiquette de la lisse, le taper ; sélectionner autant de cartons '
        + 'que le terminal le dit, taper la quantité, « Poser sur la palette ». Puis « Vérifier ma préparation ». Les codes faux sont comptés, jamais notés.',
      note: '1 par ligne juste (quantité dite et posée, sans exception).' },
    { etape: 4, etapeTitre: 'Rendre compte à Samia', genre: 'question', texte: 'Les phrases',
      rep: 'Bonjour Samia, · La commande de (son magasin) est prête, quai (son quai). · Bonne journée ! · (prénom)',
      note: 'Salutation et politesse : 1 · la phrase de la commande (magasin et quai de SA mission) : 1.' },
    { etape: 5, etapeTitre: 'Les questions de Samia', genre: 'question', texte: 'Les réponses',
      rep: 'q-caces : formation et autorisation de conduite de l’employeur · q-epi : un carton ou le transpalette peut écraser le pied · q-code : prouver '
        + 'qu’on est devant le bon emplacement · q-circuit (au bilan) : le chemin le plus court · q-nuit : la loi interdit le travail de nuit aux moins de '
        + '18 ans (C. trav. L3163-1 et L3163-2 : de 22 h à 6 h pour les 16-18 ans).',
      note: '0,75 + 0,5 + 0,75 + 1 + 1 = 4. Total : 16 + 4 = 20. Rien fait = 0.' },
  ],
};

export function corrigeEleve(base, uid) {
  const g = graineDeBase(base) || uid || '';
  const j = jeuDe(g), M = missionDe(j);
  const items = [
    { genre: 'fait', texte: 'Le poste', rep: `${SITE[defautSiteDe(g)].lib} · ${ENGIN[defautEnginDe(g)]}` },
    { genre: 'fait', texte: 'La mission', rep: `Mission ${M.num} · ${M.magasin} · ${M.lignes} lignes · ${M.cartons} cartons · quai ${M.quai} · départ ${M.depart}` },
    ...j.lignes.map((l, k) => ({ genre: 'fait', texte: `Ligne ${k + 1}`, rep: `${l.a} (code ${j.codes[l.a]}) : ${l.q} ${courtDe(l.produit)}` })),
    { genre: 'fait', texte: 'La phrase juste', rep: phrasePrete(M.magasin, M.quai) },
  ];
  return { texte: graineDeBase(base) ? '' : 'Cet élève n’a pas encore ouvert la séance : voici ce qu’il recevra.', items };
}
