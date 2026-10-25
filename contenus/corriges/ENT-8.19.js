// Corrigé d'ENT-8.19 (Action, évaluation « préparer une commande dans un autre site »), montré dans l'onglet « Corrigés » de l'enseignant.
// `corrigeEleve(base, uid)` rend le corrigé d'un élève, CALCULÉ depuis son jeu (`contenus/action-ent819-donnees.js`), jamais recopié.

import { graineDeBase } from '../../core/tirage.js';
import { bonOrdre } from '../action-prepa-donnees.js';
import { jeuDe, missionDe, anomaliesDe, courtDe, siteDeGraine, equipeDe, defautDe } from '../action-ent819-donnees.js';

export const CORRIGE = {
  code: 'ENT-8.19',
  titre: 'Action — évaluation : préparer une commande dans un autre site',
  trame: '(pas de trame : tout se fait à l’écran)',
  items: [
    { etape: 0, etapeTitre: 'Avant de commencer (noté)', genre: 'question', texte: '4 questions tirées (une par rubrique)',
      rep: 'Circuit : le chemin le plus court · code : prouver l’emplacement · abîmé : invendable · vide : le cariste descend la réserve · lourds en bas : '
        + 'stabilité · film : tenir les cartons · nuit : interdit avant 18 ans (L3163-1, L3163-2) · retour : un transport de plus.',
      note: '1 par question ; « Je ne sais pas » 0 ; fausse −1 ÷ 2 ; plancher 0. Total 4.' },
    { etape: 1, etapeTitre: 'Prendre en charge (C3.1)', genre: 'question', texte: 'Le poste et la mission',
      rep: 'Le défaut tiré (quai ou transpalette n° 1) signalé au tuteur, rien d’autre ; puis le quai et l’heure de la mission.',
      note: 'Défaut 1,5 · aucun faux 0,5 · quai 1 · heure 1.' },
    { etape: 2, etapeTitre: 'Déstocker (C3.2)', genre: 'question', texte: 'Les lignes',
      rep: '5 lignes normales ; l’abîmé : « Abîmé : 1 », puis la quantité entière sur la même pile ; le vide : « Emplacement vide », le cariste descend la '
        + 'réserve, la ligne reprise.',
      note: 'Lignes 0,6 × 5 · abîmé 1,5 · vide dit 0,75 · reprise 0,75.' },
    { etape: 3, etapeTitre: 'Conditionner (C3.3)', genre: 'question', texte: 'La palette',
      rep: 'Lourds en bas, fragiles en haut (« À côté » quand un fragile arrive trop tôt), poids et hauteur, film 3 à 5 tours, étiquettes sur deux faces '
        + 'opposées et le dessus. Jugé SUR CE QUI EST POSÉ, même si une ligne est fausse.',
      note: 'Lourds 1 · fragiles 1 · poids 0,5 · hauteur 0,5 · film 1 · étiquettes 2. Total : 16 + 4 = 20. Rien fait = 0.' },
  ],
};

export function corrigeEleve(base, uid) {
  const g = graineDeBase(base) || uid || '';
  const j = jeuDe(g), M = missionDe(g), A = anomaliesDe(j), S = siteDeGraine(g), Q = equipeDe(S);
  const items = [
    { genre: 'fait', texte: 'Le site', rep: `${S.prestataire}, ${S.site} · tuteur : ${Q.tuteur} · cariste : ${Q.cariste} · défaut du poste : ${defautDe(g)}` },
    { genre: 'fait', texte: 'La mission', rep: `Mission ${M.num} · ${M.magasin} · ${M.lignes} lignes · ${M.cartons} cartons · quai ${M.quai} · départ ${M.depart}` },
    ...j.lignes.map((l, k) => ({ genre: 'fait', texte: `Ligne ${k + 1}`, rep: `${l.a} (code ${j.codes[l.a]}) : ${l.q} ${courtDe(l.produit)}`
      + (k === A.abime.k ? ' — un carton abîmé devant : « Abîmé : 1 », puis reprendre sur la pile' : k === A.vide.k ? ` — VIDE : « Emplacement vide », ${Q.cariste} descend la réserve` : '') })),
    { genre: 'fait', texte: 'Un bon ordre de pose', rep: bonOrdre(j.lignes).map((l) => `${courtDe(l.produit)} ${l.q}`).join(', ') },
  ];
  return { texte: graineDeBase(base) ? '' : 'Cet élève n’a pas encore ouvert la séance : voici ce qu’il recevra.', items };
}
