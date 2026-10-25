// Corrigé d'ENT-8.18 (Action, deux magasins, deux palettes), montré dans l'onglet « Corrigés » de l'enseignant. `corrigeEleve(base, uid)` rend le
// corrigé d'un élève, CALCULÉ depuis son jeu (`contenus/action-ent818-donnees.js`), jamais recopié.

import { graineDeBase } from '../../core/tirage.js';
import { bonOrdre } from '../action-prepa-donnees.js';
import { jeuDe, missionDe, magasinsDe, abimeDe, courtDe, classeDe } from '../action-ent818-donnees.js';

export const CORRIGE = {
  code: 'ENT-8.18',
  titre: 'Action — deux magasins, deux palettes',
  trame: '(pas de trame pour l’instant : tout se fait à l’écran ; cours d’une demi-page après validation)',
  items: [
    { etape: 1, etapeTitre: 'Préparer deux commandes (terminal vocal, 8 lignes)', genre: 'question', texte: 'Les gestes attendus',
      rep: 'Chaque ligne sur la palette de SON magasin (le terminal dit « Pour … »), lourds d’abord, le reste « À côté » si besoin. Le carton abîmé : '
        + '« Abîmé », 1, puis la quantité reprise sur la même pile. Le conseil de Yanis ne se suit pas. « Contrôler mes palettes » : comparer chaque '
        + 'palette à sa liste de colisage, déplacer ce qui est mal placé. Film 3 à 5 tours et 3 étiquettes du bon magasin sur chaque palette.',
      note: 'Lignes 0,25 × 7 + aucun abîmé sur une palette 0,25 · abîmé 2 · grouper 2,5 × 2 · calage 0,5 × 4 · poids, hauteur 0,5 × 4 · film 0,5 × 2 '
        + '· étiquettes 1 × 2. Jugé sur l’état FINAL des palettes.' },
    { etape: 2, etapeTitre: 'Répondre à Yanis', genre: 'question', texte: 'Les phrases',
      rep: 'Salut Yanis, · Je fais une palette par magasin, sinon on se trompe au quai. · Bon courage ! · (prénom)',
      note: 'Aucun jalon : la ligne du fond est dans q-yanis.' },
    { etape: 3, etapeTitre: 'Les questions de Samia', genre: 'question', texte: 'Les réponses',
      rep: 'q-pour-qui : chaque carton va sur la palette de son magasin · q-colisage : la liste de ce qui doit être sur la palette · q-melange (au '
        + 'bilan) : l’un en manque, l’autre en a trop · q-retour : un transport en plus · q-yanis : une palette par magasin, et lui expliquer.',
      note: '0,75 + 1 + 1 + 0,75 + 0,5 = 4. Total : 16 + 4 = 20. Rien fait = 0.' },
  ],
};

export function corrigeEleve(base, uid) {
  const g = graineDeBase(base) || uid || '';
  const j = jeuDe(g), M = missionDe(j), A = abimeDe(j), MG = magasinsDe(j);
  const items = [
    { genre: 'fait', texte: 'Les deux commandes', rep: `${MG.map((m) => `${m.nom} (commande ${m.num})`).join(' et ')} · ${M.lignes} lignes · quai ${M.quai} · départ ${M.depart}` },
    ...j.lignes.map((l, k) => ({ genre: 'fait', texte: `Ligne ${k + 1}`, rep: `Pour ${MG[l.pour].court} : ${l.a} (code ${j.codes[l.a]}) : ${l.q} ${courtDe(l.produit)} (${classeDe(l.produit)})`
      + (k === A.k ? ' — un carton abîmé devant : « Abîmé : 1 », puis reprendre sur la pile' : '') })),
    ...MG.map((m) => ({ genre: 'fait', texte: `Palette ${m.court}`, rep: bonOrdre(j.lignes.filter((l) => l.pour === m.p)).map((l) => `${courtDe(l.produit)} ${l.q}`).join(', ') })),
  ];
  return { texte: graineDeBase(base) ? '' : 'Cet élève n’a pas encore ouvert la séance : voici ce qu’il recevra.', items };
}
