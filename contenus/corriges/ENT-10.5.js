// Corrigé d'ENT-10.5 (Transports Pelleau, le camion de ramasse rentre), montré dans l'onglet « Corrigés » de l'enseignant.
//
// Guidage à PIÈCES FIXES : le même camion, les mêmes annonces, le même écart pour tous (brief §6 bis). Toutes les valeurs sont CALCULÉES depuis les
// données de la séance (`contenus/pelleau-ent105-donnees.js`), jamais recopiées. Chargé aussi sous Node : aucun import du moteur.

import {
  CLIENTS_105, NOM_DIT, nomClient, PALETTES, DEPOSE, REPLIQUES, LIGNES_PREPARER, LIGNE_BONUS, RESULTATS, palettesDe, annonce, resultat,
  casesDe, choixEcart, ligneRecu, SALUTATIONS, nbPalettes,
} from '../pelleau-ent105-donnees.js';

const libResultat = (v) => (RESULTATS.find((r) => r.v === v) || {}).lib || v;
const ordreSortie = PALETTES.map((p) => p.id).reverse();

export const CORRIGE = {
  code: 'ENT-10.5',
  titre: 'Transports Pelleau — le camion de ramasse rentre',
  trame: '(pas de trame pour l’instant : tout se fait à l’écran ; trame de Cowork après validation)',
  items: [
    { etape: 1, etapeTitre: 'Préparer la réception', genre: 'tableau', texte: 'Ce qu’on lit dans la feuille de ramasse (pas dans les annonces)',
      entetes: ['Ligne', 'Réponse'],
      reponses: [...LIGNES_PREPARER, LIGNE_BONUS].map((l) => [`${l.lib}${l === LIGNE_BONUS ? ' (confirmé seulement)' : ''}`, l.juste()]),
      note: `Piège : les annonces totalisent ${CLIENTS_105.reduce((t, c) => t + annonce(c), 0)} palettes ; la feuille de ramasse dit ce que Loïc a chargé (${nbPalettes()}). 1 point par ligne.` },
    { etape: 2, etapeTitre: 'Au quai : accueillir Loïc (collègue : tu)', genre: 'tableau', texte: 'Les répliques justes',
      entetes: ['Loïc dit', 'Réponse attendue'],
      reponses: REPLIQUES.map((r) => [r.dit, r.choix.find((c) => c.juste).lib]),
      note: '1 point par réplique, à la PREMIÈRE réponse. Le dialogue ne se rejoue pas (« Corriger » ne le rouvre pas).' },
    { etape: 3, etapeTitre: 'Le quai A : avant de décharger', genre: 'question', texte: 'Le défaut de la scène (le même pour tous)',
      rep: 'Lampe de quai éteinte → « Bien vu : j’allume la lampe de quai. » La cale est posée : c’est un point en ordre (la signaler compte comme faux signalement).',
      note: 'Signaler la lampe avant « C’est bon, on peut décharger » : 2 points ; aucun faux signalement : 1 point (faux si rien n’a été signalé). Yann arrête l’élève qui veut décharger sans rien signaler, sans dire quoi.' },
    { etape: 4, etapeTitre: 'Le quai A : trier par client', genre: 'tableau', texte: 'Chaque palette dans la zone de son client (lue sur l’étiquette)',
      entetes: ['Palette', 'Client (étiquette)', 'Cases justes'],
      reponses: PALETTES.map((p) => [p.id, nomClient(p.client), casesDe(p.client).join(', ')]),
      note: `1 point par palette, au PREMIER choix ; elles sortent dans l’ordre ${ordreSortie.join(', ')}. Pièges : ${DEPOSE.cases.filter((c) => c.sol).map((c) => c.nom).join(' et ')} ; la zone de l’autre client (Yann réagit, la case se grise pour cette palette seulement).` },
    { etape: 5, etapeTitre: 'Rapprocher des annonces', genre: 'tableau', texte: 'Pour chaque client',
      entetes: ['Client', 'Annoncées', 'Reçues', 'Résultat'],
      reponses: CLIENTS_105.map((c) => [nomClient(c), String(annonce(c)), String(palettesDe(c).length), libResultat(resultat(c))]),
      note: '0,75 par case (reçues et résultat de chaque client).' },
    { etape: 6, etapeTitre: 'Rendre compte à Maëlys', genre: 'question', texte: 'Le message attendu',
      rep: `${SALUTATIONS[0]} / ${ligneRecu()} (ligne imposée) / ${choixEcart()[0].texte} / la fin polie, signée.`,
      note: 'Écart 0,5 ; salutation 0,25 ; fin 0,25. Maëlys reprend ce que l’élève a écrit, sans corriger.' },
    { etape: 7, etapeTitre: 'Les questions', genre: 'question', texte: 'Les réponses attendues',
      rep: `A (Yann, à la première palette posée) : chaque client a son stock, on doit lui rendre ses palettes à lui. B (Erwan, au début de « Rapprocher ») : exactement ce `
        + `qu’il nous a confié (Code civil, art. 1932). C (Erwan, après l’accueil de Loïc, corrigée au bilan) : pour reconnaître ce qu’il a remis à Loïc. `
        + 'D (Maëlys, réflexion, non notée) : au client, à Maëlys et à Erwan.' },
    { etape: 8, etapeTitre: 'La note', genre: 'question', texte: 'Comment la note est-elle calculée ?',
      rep: 'Jalons pondérés et questions, total 20 : préparer la réception 2 · accueillir Loïc 3 · avant de décharger 3 · trier par client 4 · rapprocher 3 · '
        + 'rendre compte 1 · questions 4 (A 1, B 1,5, C 1,5 ; D non notée). Rien n’est vrai avant un envoi : inaction 0.',
      note: `Poids validés par Tristan le 18/10/2026. Confirmé : « ${LIGNE_BONUS.lib} » en plus, +0,5 si juste (caché à l’élève). ${NOM_DIT['agri-kerlann']} est le client à l’écart.` },
  ],
};

// Guidage à pièces fixes : le corrigé d'un élève est celui de tous (le confirmé a une ligne de plus).
export function corrigeEleve(base) {
  const confirme = !!(base && base.aisance === 'confirme');
  return { texte: '', items: [
    ...LIGNES_PREPARER.map((l) => ({ genre: 'fait', texte: l.lib, rep: l.juste() })),
    ...(confirme ? [{ genre: 'fait', bonus: true, texte: LIGNE_BONUS.lib, rep: LIGNE_BONUS.juste() }] : []),
    ...PALETTES.map((p) => ({ genre: 'fait', texte: `Palette ${p.id} (${nomClient(p.client)})`, rep: casesDe(p.client).join(' ou ') })),
    ...CLIENTS_105.map((c) => ({ genre: 'fait', texte: `Rapprocher : ${nomClient(c)}`, rep: `${palettesDe(c).length} reçues, ${libResultat(resultat(c))}` })),
  ] };
}
