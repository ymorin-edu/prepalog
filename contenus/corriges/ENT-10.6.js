// Corrigé d'ENT-10.6 (Transports Pelleau, la ramasse du mercredi), montré dans l'onglet « Corrigés » de l'enseignant.
//
// ENTRAÎNEMENT, TOUT EST TIRÉ : chaque élève a SON camion (répartition, ordre, défaut du quai, écart avec les annonces), tiré de sa graine
// (`db.tirage.graine`, l'identifiant de l'élève). `CORRIGE` donne ce qui est commun ; `corrigeEleve(base, uid)` rend le corrigé d'un élève, CALCULÉ depuis sa
// graine (jamais recopié). Toutes les valeurs viennent de `contenus/pelleau-ent106-donnees.js`. Chargé aussi sous Node : aucun import du moteur.

import { graineDeBase } from '../../core/tirage.js';
import {
  CLIENTS_106, NOM_DIT, nomClient, DEPOSE, REPLIQUES, LIGNES_PREPARER, LIGNE_BONUS, RESULTATS, OBJETS, DEFAUTS, jeuDe, palettesDe, compte,
  annonce, resultat, casesDe, choixEcart, ligneRecu, SALUTATIONS, nbPalettes, NB_PALETTES,
} from '../pelleau-ent106-donnees.js';

const libResultat = (v) => (RESULTATS.find((r) => r.v === v) || {}).lib || v;
const REPARTITION = { '2+2': '2 palettes de chaque client', '3+1': '3 palettes d’un client, 1 de l’autre' };
const ECART = { aucun: 'aucun écart : tout est conforme aux annonces', moins: 'un client a annoncé une palette de plus que ce que Loïc a chargé (la feuille le dit)',
  plus: 'un client reçoit une palette de plus que son annonce (l’annonce est en retard)' };

export const CORRIGE = {
  code: 'ENT-10.6',
  titre: 'Transports Pelleau — la ramasse du mercredi',
  trame: '(pas de trame pour l’instant : tout se fait à l’écran ; trame de Cowork après validation)',
  items: [
    { etape: 1, etapeTitre: 'Préparer la réception', genre: 'tableau', texte: 'Ce qu’on lit dans la feuille de ramasse (pas dans les annonces)',
      entetes: ['Ligne', 'Réponse'],
      reponses: [...LIGNES_PREPARER, LIGNE_BONUS].map((l) => [`${l.lib}${l === LIGNE_BONUS ? ' (confirmé seulement)' : ''}`, 'lue sur SA feuille de ramasse']),
      note: 'Les annonces peuvent différer de ce que Loïc a chargé : la feuille de ramasse dit ce qui est vraiment dans le camion. 2/3 de point par ligne.' },
    { etape: 2, etapeTitre: 'Au quai : accueillir Loïc (collègue : tu)', genre: 'tableau', texte: 'Les répliques justes',
      entetes: ['Loïc dit', 'Réponse attendue'],
      reponses: REPLIQUES.map((r) => [r.dit, r.choix.find((c) => c.juste).lib]),
      note: '1 point par réplique, à la PREMIÈRE réponse. Le dialogue ne se rejoue pas (« Corriger » ne le rouvre pas).' },
    { etape: 3, etapeTitre: 'Le quai A : avant de décharger', genre: 'question', texte: 'Le défaut de la scène (un seul, tiré par élève), et un point en ordre',
      rep: DEFAUTS.map((o) => `${OBJETS[o].libKo} → « ${OBJETS[o].repare} »`).join(' · '),
      note: 'Signaler le défaut avant « C’est bon, on peut décharger » : 2,5 points ; aucun faux signalement : 1 point (faux si rien n’a été signalé). '
        + 'Yann n’arrête pas l’élève qui dit « C’est bon » sans rien signaler (entraînement) : le jalon est simplement faux.' },
    { etape: 4, etapeTitre: 'Le quai A : trier par client', genre: 'tableau', texte: 'Chaque palette dans la zone de son client (lue sur l’étiquette)',
      entetes: ['Client', 'Cases justes'],
      reponses: CLIENTS_106.map((c) => [nomClient(c), casesDe(c).join(', ')]),
      note: `1 point par palette (${NB_PALETTES}), au PREMIER choix ; elles sortent dans l’ordre P4, P3, P2, P1. Répartition tirée : 2+2 ou 3+1. Pièges : ${DEPOSE.cases.filter((c) => c.sol).map((c) => c.nom).join(' et ')} ; la zone de l’autre client (Yann réagit, la case se grise pour cette palette seulement).` },
    { etape: 5, etapeTitre: 'Rapprocher des annonces', genre: 'question', texte: 'Pour chaque client : les palettes reçues, puis le résultat contre son annonce',
      rep: 'Calculé depuis SA feuille de ramasse et SES annonces (voir le corrigé de l’élève).',
      note: '0,75 par case (reçues et résultat de chaque client). Au plus un écart par camion : « il en manque » (le client a annoncé une palette de plus) ou « il y en a trop » (l’annonce est en retard).' },
    { etape: 6, etapeTitre: 'Rendre compte à Maëlys', genre: 'question', texte: 'Le message attendu',
      rep: 'Salutation / ligne « reçu » imposée / l’écart (ou « tout est conforme ») / la fin polie, signée — chacun calculé depuis son camion (voir le corrigé de l’élève).',
      note: 'Écart 1 ; salutation 0,25 ; fin 0,25. Maëlys reprend ce que l’élève a écrit, sans corriger.' },
    { etape: 7, etapeTitre: 'Les questions', genre: 'question', texte: 'Les réponses attendues',
      rep: 'A (Yann, au premier signalement, corrigée au bilan) : pour que le camion ne bouge pas pendant que le chariot est dedans. B (Erwan, au début de « Rapprocher », '
        + 'selon son écart) : je le note et je le dis à Maëlys tout de suite. C (Erwan, quand la dernière palette est posée) : non, on lui rend la sienne, celle qu’il nous a confiée '
        + '(Code civil, art. 1932).' },
    { etape: 8, etapeTitre: 'La note', genre: 'question', texte: 'Comment la note est-elle calculée ?',
      rep: 'Jalons pondérés et questions, total 20 : préparer la réception 2 · accueillir Loïc 2 · avant de décharger 3,5 · trier par client 4 · rapprocher 3 · '
        + 'rendre compte 1,5 · questions 4 (A 1,5, B 1, C 1,5). Rien n’est vrai avant un envoi : inaction 0.',
      note: `Poids validés par Tristan le 18/10/2026. Confirmé : « ${LIGNE_BONUS.lib} » en plus, +0,5 si juste (caché à l’élève), « Règles du quai » non jointes, aides du quai éteintes.` },
  ],
};

// Le corrigé d'UN élève : son camion, son défaut, son écart, ses réponses attendues (calculés depuis sa graine).
export function corrigeEleve(base, uid) {
  const graine = graineDeBase(base);
  const ouvert = !!graine;
  const jeu = jeuDe(graine || String(uid || 'anonyme'));
  const confirme = !!(base && base.aisance === 'confirme');
  const items = [
    { genre: 'fait', texte: 'Son camion', rep: `${nbPalettes(jeu)} palettes (${REPARTITION[jeu.repartition]}) ; ordre de sortie : ${palettesDe(jeu).slice().reverse().map((p) => `${p.id} ${NOM_DIT[p.client]}`).join(', ')}` },
    { genre: 'fait', texte: 'Son écart avec les annonces', rep: `${ECART[jeu.ecart]}${jeu.clientEcart ? ` (${NOM_DIT[jeu.clientEcart]})` : ''}` },
    ...LIGNES_PREPARER.map((l) => ({ genre: 'fait', texte: l.lib, rep: l.juste(jeu) })),
    ...(confirme ? [{ genre: 'fait', bonus: true, texte: LIGNE_BONUS.lib, rep: LIGNE_BONUS.juste(jeu) }] : []),
    { genre: 'fait', texte: 'Son défaut au quai', rep: `${OBJETS[jeu.defaut].libKo} (en ordre : ${OBJETS[jeu.ok].libOk.toLowerCase()})` },
    ...palettesDe(jeu).map((p) => ({ genre: 'fait', texte: `Palette ${p.id} (${nomClient(p.client)})`, rep: casesDe(p.client).join(' ou ') })),
    ...CLIENTS_106.map((c) => ({ genre: 'fait', texte: `Rapprocher : ${nomClient(c)}`,
      rep: `annoncées ${annonce(jeu, c)}, ${compte(jeu, c)} reçues, ${libResultat(resultat(jeu, c))}` })),
    { genre: 'fait', texte: 'Rendre compte à Maëlys', rep: `${SALUTATIONS[0]} ${ligneRecu(jeu)} ${choixEcart(jeu)[0].texte}` },
  ];
  return { texte: ouvert ? '' : 'Cet élève n’a pas encore ouvert la séance : voici le camion que sa graine lui donnera (un confirmé reçoit en plus une ligne à « Préparer »).', items };
}
