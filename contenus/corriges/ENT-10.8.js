// Corrigé d'ENT-10.8 (Transports Pelleau, évaluation « recevoir le camion de ramasse »), montré dans l'onglet « Corrigés » de l'enseignant.
//
// ÉVALUATION, TOUT EST TIRÉ : chaque élève a SON camion (planning, répartition, ordre, défaut du quai, écart), tiré de sa graine (`db.tirage.graine`,
// l'identifiant de l'élève). `CORRIGE` donne ce qui est commun ; `corrigeEleve(base, uid)` rend le corrigé d'un élève, CALCULÉ depuis sa graine (jamais
// recopié). Toutes les valeurs viennent de `contenus/pelleau-ent108-donnees.js`. Chargé aussi sous Node : aucun import du moteur.

import { graineDeBase } from '../../core/tirage.js';
import {
  CLIENTS_108, NOM_DIT, nomClient, DEPOSE_CASES, REPLIQUES, LIGNES_PREPARER, RESULTATS, OBJETS, DEFAUTS, jeuDe, palettesDe, compte, annonce, feuille,
  resultat, casesDe, choixEcart, ligneRecu, SALUTATIONS, nbPalettes, NB_PALETTES, placeDeLoic, CHOIX_FEUILLE, CHOIX_CORRECTION, feuilleJuste, correctionJuste,
} from '../pelleau-ent108-donnees.js';

const libResultat = (v) => (RESULTATS.find((r) => r.v === v) || {}).lib || v;
const REPARTITION = { '2+2': '2 palettes de chaque client', '3+1': '3 palettes d’un client, 1 de l’autre' };
const ECART = { aucun: 'aucun écart : tout est conforme aux annonces et à la feuille',
  moins: 'un client a annoncé une palette de plus que ce que Loïc a chargé (la feuille dit ce que Loïc a chargé)',
  plus: 'un client reçoit une palette de plus que son annonce (l’annonce est en retard)',
  feuille: 'erreur d’écriture de Loïc : une palette est notée chez le mauvais client sur la feuille (+1 chez l’un, −1 chez l’autre) ; les annonces et les étiquettes sont justes' };
const libChoix = (L, v) => (L.find((c) => c.v === v) || {}).lib || v;

export const CORRIGE = {
  code: 'ENT-10.8',
  titre: 'Transports Pelleau — évaluation : recevoir le camion de ramasse',
  trame: '(pas de trame : tout se fait à l’écran ; le corrigé de chaque élève est calculé depuis sa graine)',
  items: [
    { etape: 0, etapeTitre: 'Avant de commencer (4 points)', genre: 'question', texte: 'Quatre questions tirées parmi huit (3 de préparation sur 6, 1 d’image sur 2)',
      rep: 'Réponses attendues dans `contenus/questions/ENT-10.8.js`. Juste +1, « Je ne sais pas » 0, fausse −1 ÷ (nombre de mauvaises réponses), plancher 0.' },
    { etape: 1, etapeTitre: 'Préparer (2 points)', genre: 'tableau', texte: 'L’heure et le quai de Loïc se lisent dans LE planning de l’élève (deux grilles tirées) ; le nombre de palettes annoncées, dans l’annonce d’un client tiré',
      entetes: ['Ligne', 'Réponse'],
      reponses: LIGNES_PREPARER.map((l) => [typeof l.lib === 'function' ? 'Combien de palettes [client tiré] annonce-t-il ?' : l.lib, 'calculée depuis SON jeu (voir le corrigé de l’élève)']),
      note: '2/3 de point par ligne. Rien n’est vrai avant l’envoi.' },
    { etape: 2, etapeTitre: 'Au quai : accueillir Loïc (collègue : tu)', genre: 'tableau', texte: 'Les répliques justes',
      entetes: ['Loïc dit', 'Réponse attendue'],
      reponses: REPLIQUES.map((r) => [r.dit, r.choix.find((c) => c.juste).lib]),
      note: '1 point par réplique, à la PREMIÈRE réponse. Aucune réaction de Loïc (évaluation).' },
    { etape: 3, etapeTitre: 'Le quai : avant de décharger (3 points)', genre: 'question', texte: 'Le défaut de la scène (un seul, tiré par élève), et un point en ordre',
      rep: DEFAUTS.map((o) => OBJETS[o].libKo).join(' · '),
      note: 'Signaler le défaut avant « C’est bon, on peut décharger » : 2 points ; aucun faux signalement : 1 point (faux si rien n’a été signalé). Rien n’arrête l’élève et Yann répond toujours « C’est noté. ».' },
    { etape: 4, etapeTitre: 'Le quai : trier par client (4 points)', genre: 'tableau', texte: 'Chaque palette dans la zone de son client (lue sur l’étiquette)',
      entetes: ['Client', 'Cases justes'],
      reponses: CLIENTS_108.map((c) => [nomClient(c), casesDe(c).join(', ')]),
      note: `1 point par palette (${NB_PALETTES}), au PREMIER clic (le premier clic pose, même chez l’autre client ou sur l’allée : aucune réaction) ; elles sortent dans l’ordre P4, P3, P2, P1. Répartition tirée : 2+2 ou 3+1. Pièges : ${DEPOSE_CASES.filter((c) => c.sol).map((c) => c.nom).join(' et ')}.` },
    { etape: 5, etapeTitre: 'Rapprocher (3 points)', genre: 'question', texte: 'Pour chaque client : les palettes reçues (0,75 chacun), puis le résultat contre l’annonce — ou, quand la feuille se trompe, le sens de l’erreur et la correction (0,75 chacun)',
      rep: 'Calculé depuis SA feuille de ramasse, SES annonces et SES palettes (voir le corrigé de l’élève).',
      note: 'Sans erreur de feuille : « résultat Ar Vag » exige aussi « la feuille de Loïc est… juste », « résultat Agri-Kerlann » exige aussi « Rien, elle est juste ». Avec l’erreur de feuille : « la palette » = le sens de l’erreur ; « la correction » = « Je la fais corriger par Loïc, avec Maëlys ». Les mêmes six lignes pour tous.' },
    { etape: 6, etapeTitre: 'Rendre compte à Maëlys (2 points)', genre: 'question', texte: 'Le message attendu',
      rep: 'Salutation / ligne « reçu » imposée / l’écart (ou « tout est conforme ») / la fin polie, signée — chacun calculé depuis son camion (voir le corrigé de l’élève).',
      note: 'Écart 1,5 ; salutation 0,25 ; fin 0,25. Maëlys ne reprend pas ce que l’élève a écrit.' },
    { etape: 7, etapeTitre: 'La note', genre: 'question', texte: 'Comment la note est-elle calculée ?',
      rep: 'Jalons pondérés et ouverture, total 20 : avant de commencer 4 · préparer 2 · accueillir Loïc 2 · avant de décharger 3 · trier par client 4 · rapprocher 3 · '
        + 'rendre compte 2. Rien n’est vrai avant un envoi ou la fin de l’étape : inaction 0.',
      note: 'Poids validés par Tristan le 18/10/2026. Évaluation en copie rendue : une seule remise, note figée, ni bonus ni niveau.' },
  ],
};

// Le corrigé d'UN élève : son planning, son camion, son défaut, son écart, ses réponses attendues (calculés depuis sa graine).
export function corrigeEleve(base, uid) {
  const graine = graineDeBase(base);
  const ouvert = !!graine;
  const jeu = jeuDe(graine || String(uid || 'anonyme'));
  const place = placeDeLoic(jeu.grille);
  const items = [
    { genre: 'fait', texte: 'Son planning', rep: `Loïc arrive à ${place.heure}, quai ${place.quai} (grille ${jeu.grille + 1} sur 2)` },
    { genre: 'fait', texte: 'Son camion', rep: `${nbPalettes(jeu)} palettes (${REPARTITION[jeu.repartition]}) ; ordre de sortie : ${palettesDe(jeu).slice().reverse().map((p) => `${p.id} ${NOM_DIT[p.client]}`).join(', ')}` },
    { genre: 'fait', texte: 'Son écart', rep: `${ECART[jeu.ecart]}${jeu.clientEcart ? ` (${NOM_DIT[jeu.clientEcart]})` : ''}` },
    { genre: 'fait', texte: 'À quelle heure arrive le camion de Loïc ?', rep: LIGNES_PREPARER[0].juste(jeu) },
    { genre: 'fait', texte: 'À quel quai ?', rep: `Quai ${LIGNES_PREPARER[1].juste(jeu)}` },
    { genre: 'fait', texte: LIGNES_PREPARER[2].lib(jeu), rep: LIGNES_PREPARER[2].juste(jeu) },
    { genre: 'fait', texte: 'Son défaut au quai', rep: `${OBJETS[jeu.defaut].libKo} (en ordre : ${OBJETS[jeu.ok].libOk.toLowerCase()})` },
    ...palettesDe(jeu).map((p) => ({ genre: 'fait', texte: `Palette ${p.id} (${nomClient(p.client)})`, rep: casesDe(p.client).join(' ou ') })),
    ...CLIENTS_108.map((c) => ({ genre: 'fait', texte: `Rapprocher : ${nomClient(c)}`,
      rep: `annoncées ${annonce(jeu, c)}, feuille ${feuille(jeu, c)}, ${compte(jeu, c)} reçues, ${libResultat(resultat(jeu, c))}` })),
    { genre: 'fait', texte: 'La feuille de ramasse est…', rep: libChoix(CHOIX_FEUILLE, feuilleJuste(jeu)) },
    { genre: 'fait', texte: 'Que fais-tu de la feuille ?', rep: libChoix(CHOIX_CORRECTION, correctionJuste(jeu)) },
    { genre: 'fait', texte: 'Rendre compte à Maëlys', rep: `${SALUTATIONS[0]} ${ligneRecu(jeu)} ${choixEcart(jeu)[0]}` },
  ];
  return { texte: ouvert ? '' : 'Cet élève n’a pas encore ouvert la séance : voici le camion que sa graine lui donnera.', items };
}
