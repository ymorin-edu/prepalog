// Corrigé d'ENT-8.9 (Action, la palette de Lucas), montré dans l'onglet « Corrigés » de l'enseignant.
//
// Chaque élève a reçu SON jeu (`contenus/action-ent89-donnees.js`, graine = son identifiant) : deux anomalies de la scène (une facile, une moyenne
// ou difficile), une palette à problème (1 carton écrasé derrière OU 2 cartons manquants), une palette au piège (couche du dessus à moitié vide,
// conforme au BL), deux palettes conformes, et la date de réception de la palette de Lucas (jeudi 17 : on peut protester ; lundi 14 : trop tard).
// `CORRIGE` donne ce qui est commun ; `corrigeEleve(base, uid)` rend le corrigé d'un élève, CALCULÉ depuis son jeu (jamais recopié). La phrase
// « ma réception » du compte rendu est jugée contre CE QUE L'ÉLÈVE A ÉCRIT au quai, la phrase « la palette de Lucas » contre SA ligne 2 : le corrigé
// donne celles d'un parcours juste.

import { graineDeBase } from '../../core/tirage.js';
import { MOTIFS } from '../../core/types/quai.js';
import {
  PALETTES, REPLIQUES, OBJETS, LIGNES_LUCAS, DATES_LUCAS, PHRASES_LUCAS, jeuDe, quaiDuJeu, reelDe, quantite, constatAttendu, phraseReception,
} from '../action-ent89-donnees.js';

const NOM_ANOMALIE = {
  'ecrase-cache': 'un carton écrasé sur la face arrière (il faut faire le tour)', manquant: 'cartons manquants dans la couche du dessus',
  'couche-normale': 'PIÈGE : couche du dessus à moitié vide, mais le BL dit le même nombre', conforme: 'conforme, pleine',
};
const DECISION = { reserves: 'accepter avec réserves', accepter: 'accepter' };
const lib = (L, v) => (L.find((x) => x.v === v) || {}).lib || v;

export const CORRIGE = {
  code: 'ENT-8.9',
  titre: 'Action — la palette de Lucas',
  trame: '(pas de trame pour l’instant : tout se fait à l’écran ; trame de Cowork après validation)',
  items: [
    { etape: 1, etapeTitre: 'Au quai : accueillir Jan (phrases courtes, vouvoiement)', genre: 'tableau', texte: 'Les répliques justes',
      entetes: ['Jan dit', 'Réponse attendue'],
      reponses: REPLIQUES.map((r) => [r.dit, r.choix.find((c) => c.juste).lib.replace('{prenom}', '(prénom)')]),
      note: 'Salutation 0,5 · documents 0,75 · quai 0,5 · attente (moteur, clés, local) 0,75 · fin 0,5 : la PREMIÈRE réponse à chaque réplique compte.' },
    { etape: 2, etapeTitre: 'Le quai 5 : avant de décharger', genre: 'question', texte: 'Les anomalies possibles (deux tirées par élève)',
      rep: Object.values(OBJETS).map((o) => `${o.libKo} (${o.difficulte})`).join(' · '),
      note: 'Chaque anomalie signalée avant « C’est bon, on peut décharger » : 1,25 ; aucun faux signalement : 0,5 (faux si rien n’a été signalé). '
        + 'Entraînement : rien n’arrête l’élève, un défaut oublié est remis en ordre sans un mot.' },
    { etape: 3, etapeTitre: 'Le quai 5 : faire décharger et contrôler', genre: 'tableau', texte: 'Le camion de jouets (le même pour toute la classe)',
      entetes: ['Palette', 'Désignation', 'Couches × cartons', 'Pleine'],
      reponses: PALETTES.map((p) => [p.id, p.designation, `${p.couches} × ${p.parCouche}`, String(p.cartons)]),
      note: 'Dépose : R1 à R4 (jamais l’allée piétonne ni devant le quai 6), 0,25 par palette au premier choix. Contrôle : palette à problème 1,5, sa '
        + 'réserve 1, le piège 0,5, les deux conformes 0,5, pas de « sous réserve de déballage » 0,5, signature de Jan 0,5. Aides de comptage éteintes.' },
    { etape: 4, etapeTitre: 'La palette de Lucas', genre: 'question', texte: 'La fiche',
      rep: `1. ${lib(LIGNES_LUCAS[0].choix, 'tour-reserve')} · 2. selon la date : reçue le ${DATES_LUCAS.recent.jour} → « ${lib(LIGNES_LUCAS[1].choix, 'oui-3j')} » ; `
        + `reçue le ${DATES_LUCAS.ancien.jour} → « ${lib(LIGNES_LUCAS[1].choix, 'non-3j')} » (C. com. L133-3 : trois jours, non compris les jours fériés, `
        + `qui suivent la réception) · 3. ${lib(LIGNES_LUCAS[2].choix, 'litiges')}`,
      note: '1 point par ligne. La ligne 2 est jugée contre la date tirée de l’élève (50 / 50).' },
    { etape: 5, etapeTitre: 'Rendre compte à Romain', genre: 'question', texte: 'Les phrases',
      rep: 'Bonjour Romain, · ma réception (ce que l’élève a écrit au quai : la phrase juste d’un parcours juste est donnée par élève) · la phrase qui suit '
        + 'SA ligne 2 · (prénom)',
      note: 'Ma réception 0,75 ; la palette de Lucas 0,75 (une erreur ne se paie qu’une fois) ; salutation et fin non notées.' },
    { etape: 6, etapeTitre: 'Les questions de Romain', genre: 'question', texte: 'Les réponses',
      rep: 'qui-paie (à la clôture du quai) : le transporteur (C. com. L133-1) · refus-signer (corrigée au bilan) : j’écris qu’il refuse de signer, et je '
        + 'préviens Romain · rappel-lucas (Inès) : lui rappeler de faire le tour de chaque palette avant de signer · se-comprendre (réflexion) : les trois.',
      note: '1,5 + 1,5 + 1 = 4. Total : 16 + 4 = 20. Rien fait = 0.' },
  ],
};

export function corrigeEleve(base, uid) {
  const g = graineDeBase(base) || uid || '';
  const jeu = jeuDe(g);
  const Q = quaiDuJeu(jeu);
  const d = DATES_LUCAS[jeu.lucas];
  const items = [{ genre: 'fait', texte: 'Ses anomalies au quai', rep: jeu.scene.map((o) => OBJETS[o].libKo).join(' · ') }];
  Q.camions[0].palettes.forEach((p, n) => {
    const t = jeu.palettes[n], m = t.anomalie;
    const qte = m === 'manquant' ? `${quantite(t)} ` : '';
    const res = p.attendu === 'reserves' ? ` · réserve : ${quantite(t)} ${m === 'manquant' ? 'carton(s) manquant(s)' : 'carton(s) endommagé(s)'}` : ' · aucune réserve';
    items.push({ genre: 'fait', texte: `${p.id} — ${p.nom}`,
      rep: `${qte}${NOM_ANOMALIE[m]} · BL ${p.bl} · réel ${reelDe(t)} · ${DECISION[p.attendu]}${p.attendu === 'reserves' ? ` (${MOTIFS[p.motifAttendu]})` : ''}${res}` });
  });
  items.push({ genre: 'fait', texte: 'La palette de Lucas : reçue le', rep: `${d.jour} → ${d.dansLesDelais ? 'on est dans les 3 jours : on peut protester' : 'plus de 3 jours : trop tard'}` });
  items.push({ genre: 'fait', texte: 'Compte rendu : ma réception (parcours juste)', rep: phraseReception([constatAttendu(jeu)]) });
  items.push({ genre: 'fait', texte: 'Compte rendu : la palette de Lucas (réponse juste à la ligne 2)', rep: PHRASES_LUCAS[d.dansLesDelais ? 0 : 1] });
  return { texte: graineDeBase(base) ? '' : 'Cet élève n’a pas encore ouvert la séance : voici ce qu’il recevra.', items };
}
