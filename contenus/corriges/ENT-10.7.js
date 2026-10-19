// Corrigé d'ENT-10.7 (Transports Pelleau, la feuille de ramasse se trompe), montré dans l'onglet « Corrigés » de l'enseignant.
//
// Chaque élève a reçu SON jeu : le client de chacune des quatre palettes (donc l'ordre dans le camion), LA palette mal notée sur la feuille (donc le
// sens de l'erreur) et son défaut au quai, tout tiré de sa graine (`db.tirage.graine`, `contenus/pelleau-ent107-donnees.js`). `CORRIGE` donne ce qui est
// commun ; `corrigeEleve(base, uid)` rend le corrigé d'un élève, CALCULÉ depuis sa graine (jamais recopié). Chargé aussi sous Node : aucun import du moteur.

import { graineDeBase } from '../../core/tirage.js';
import {
  CLIENTS_107, NOM_DIT, nomClient, IDS_PALETTES, DEFAUTS, OBJETS, REPLIQUES, LIGNES_PREPARER, RESULTATS, CORRIGER, jeuDe, palettesDe, reellesDe,
  notees, annonce, resultat, casesDe, clientDe, clientNote, choixErreur, choixFeuille, justeFeuille, ligneRecu, SALUTATIONS,
} from '../pelleau-ent107-donnees.js';

const libResultat = (v) => (RESULTATS.find((r) => r.v === v) || {}).lib || v;
const JEU_TYPE = jeuDe('corrige-type');   // un jeu quelconque, pour les tableaux communs (reçues et résultats sont les mêmes pour tous)

export const CORRIGE = {
  code: 'ENT-10.7',
  titre: 'Transports Pelleau — la feuille de ramasse se trompe',
  trame: '(pas de trame pour l’instant : tout se fait à l’écran ; trame de Cowork après validation)',
  items: [
    { etape: 1, etapeTitre: 'Préparer la réception', genre: 'tableau', texte: 'Ce qu’on lit dans les documents (rien n’est faux à ce stade)',
      entetes: ['Ligne', 'Réponse'],
      reponses: LIGNES_PREPARER.map((l) => [l.lib, l.juste()]),
      note: 'À voir tout de suite : la feuille de ramasse ne colle pas aux annonces (un client a une palette de trop, l’autre une de moins). 0,5 point par ligne.' },
    { etape: 2, etapeTitre: 'Au quai : accueillir Loïc (collègue : tu)', genre: 'tableau', texte: 'Les répliques justes',
      entetes: ['Loïc dit', 'Réponse attendue'],
      reponses: REPLIQUES.map((r) => [r.dit, r.choix.find((c) => c.juste).lib]),
      note: 'Demander la feuille : 0,5 point. Refuser de suivre la feuille à l’aveugle (« Je regarde quand même chaque étiquette ») : 1,5 point. La PREMIÈRE réponse compte ; le dialogue ne se rejoue pas.' },
    { etape: 3, etapeTitre: 'Le quai A : avant de décharger', genre: 'question', texte: 'Le défaut de la scène (un seul, tiré par élève)',
      rep: DEFAUTS.map((o) => `${OBJETS[o].libKo} → « ${OBJETS[o].repare} »`).join(' · '),
      note: 'Signaler le défaut avant « C’est bon, on peut décharger » : 2 points ; aucun faux signalement : 1 point (faux si rien n’a été signalé). Yann arrête l’élève qui veut décharger sans rien signaler, sans dire quoi.' },
    { etape: 4, etapeTitre: 'Le quai A : trier par client', genre: 'question', texte: 'Chaque palette dans la zone de son client, lue sur l’ÉTIQUETTE (pas sur la feuille)',
      rep: `Cases d’Ar Vag : ${casesDe('ar-vag').join(', ')}. Cases d’Agri-Kerlann : ${casesDe('agri-kerlann').join(', ')}. Pièges : l’allée piétonne et la zone du quai B.`,
      note: 'La palette mal notée : 2 points, au PREMIER choix (l’élève qui suit la feuille la pose chez l’autre client). Les trois autres : 0,5 point chacune. '
        + 'Les palettes sortent dans l’ordre P4, P3, P2, P1. Qui est la palette mal notée : voir le corrigé de l’élève.' },
    { etape: 5, etapeTitre: 'Rapprocher', genre: 'tableau', texte: 'Ce qui est ARRIVÉ (compté par étiquette), contre les annonces : conforme des deux côtés',
      entetes: ['Client', 'Annoncées', 'Reçues', 'Résultat'],
      reponses: CLIENTS_107.map((c) => [nomClient(c), String(annonce(c)), String(reellesDe(JEU_TYPE, c).length), libResultat(resultat(JEU_TYPE, c))]),
      note: 'Reçues 0,5 et résultat 0,5 par client. « La feuille de ramasse est-elle juste ? » : 2 points, il faut la bonne palette (laquelle : voir le corrigé de l’élève). '
        + 'Pièges : une autre palette notée chez le même client ; « Oui, la feuille est juste ».' },
    { etape: 6, etapeTitre: 'La feuille de ramasse', genre: 'tableau', texte: CORRIGER.lib,
      entetes: ['Choix', 'Verdict'],
      reponses: CORRIGER.choix.map((c) => [c.lib, c.v === CORRIGER.juste ? 'juste' : '']),
      note: '1 point. La feuille est signée par les clients : on la corrige avec celui qui l’a écrite, pour qu’elle reste une preuve.' },
    { etape: 7, etapeTitre: 'Rendre compte à Maëlys', genre: 'question', texte: 'Le message attendu',
      rep: `${SALUTATIONS[0]} / ${ligneRecu(JEU_TYPE)} (ligne imposée) / la phrase de l’erreur, avec LA palette de l’élève (voir son corrigé) / la fin polie, signée.`,
      note: 'Erreur 1 ; salutation 0,25 ; fin 0,25. Maëlys reprend ce que l’élève a écrit, sans corriger. Pièges : une autre palette ; le sens inversé ; « Tout est conforme ».' },
    { etape: 8, etapeTitre: 'Les questions', genre: 'question', texte: 'Les réponses attendues',
      rep: 'A (Erwan, après l’accueil de Loïc, corrigée AU BILAN) : l’étiquette, posée sur la palette par le client. B (Erwan, à l’envoi de « Rapprocher ») : on rendrait au client '
        + 'une palette d’un autre client (Code civil, art. 1932). C (Maëlys, à l’envoi de « La feuille de ramasse ») : elle est signée, on la corrige avec celui qui l’a écrite.',
      note: 'A 1,5 · B 1,5 · C 1.' },
    { etape: 9, etapeTitre: 'La note', genre: 'question', texte: 'Comment la note est-elle calculée ?',
      rep: 'Jalons pondérés et questions, total 20 : préparer 1 · accueillir Loïc 2 · avant de décharger 3 · trier par client 3,5 · rapprocher 4 · faire corriger 1 · '
        + 'rendre compte 1,5 · questions 4. Rien n’est vrai avant un envoi : inaction 0.',
      note: 'Poids validés par Tristan le 18/10/2026. Confirmé : les « Règles du quai » ne sont pas jointes au message, aucun bonus (caché à l’élève).' },
  ],
};

// Le corrigé d'UN élève : son jeu (tiré de sa graine) — la palette mal notée et le sens, l'ordre dans le camion, les cases, son défaut.
export function corrigeEleve(base, uid) {
  const ouvert = !!graineDeBase(base || {});
  const jeu = jeuDe(graineDeBase(base || {}) || String(uid || 'anonyme'));
  const ordre = [...IDS_PALETTES].reverse();
  const items = [
    { genre: 'fait', texte: 'Son défaut au quai', rep: OBJETS[jeu.defaut].libKo },
    { genre: 'fait', texte: 'Ordre de sortie des palettes', rep: ordre.map((id) => `${id} (${NOM_DIT[clientDe(jeu, id)]})`).join(', ') },
    ...palettesDe(jeu).map((p) => ({ genre: 'fait',
      texte: `Palette ${p.id} : étiquette ${nomClient(p.client)}${p.id === jeu.mal ? `, notée chez ${NOM_DIT[clientNote(jeu, p.id)]} sur la feuille (la palette mal notée)` : ''}`,
      rep: casesDe(p.client).join(' ou ') })),
    { genre: 'fait', texte: 'La feuille de ramasse : ce qu’elle dit', rep: CLIENTS_107.map((c) => `${NOM_DIT[c]} : ${notees(jeu, c).join(', ')} (${notees(jeu, c).length})`).join(' · ') },
    { genre: 'fait', texte: 'Ce qui est arrivé (par étiquette)', rep: CLIENTS_107.map((c) => `${NOM_DIT[c]} : ${reellesDe(jeu, c).length} reçues, ${libResultat(resultat(jeu, c))}`).join(' · ') },
    { genre: 'fait', texte: '« La feuille de ramasse est-elle juste ? »', rep: (choixFeuille(jeu).find((c) => c.v === justeFeuille(jeu)) || {}).lib },
    { genre: 'fait', texte: 'La phrase de l’erreur dans le compte rendu', rep: choixErreur(jeu)[0].texte },
  ];
  if (!ouvert) return { texte: 'Cet élève n’a pas encore ouvert la séance : voici un jeu possible (le sien dépend de sa graine, posée à l’ouverture).', items };
  return { texte: '', items };
}
