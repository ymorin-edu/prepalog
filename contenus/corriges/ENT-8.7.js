// Corrigé d'ENT-8.7 (Action, on décharge ensemble), montré dans l'onglet « Corrigés » de l'enseignant.
//
// Chaque élève a reçu SES situations du protocole (tirage rangé, `contenus/action-ent87-donnees.js`) et SON anomalie au quai (tirée de sa graine,
// `db.tirage.graine`) ; un confirmé reçoit en plus une situation (marquée « bonus »). `CORRIGE` donne ce qui est commun ; `corrigeEleve(base, uid)`
// rend le corrigé d'un élève, CALCULÉ depuis sa base (jamais recopié).

import { graineDeBase } from '../../core/tirage.js';
import {
  ID, TIRAGE, BANQUE_SITUATIONS, CONSIGNES, ENGIN, REPLIQUES, OBJETS, ANOMALIES_SOCLE, DEPOSE, PALETTES,
  situationsDe, situationsBonus, quaiDe, anomalieDe,
} from '../action-ent87-donnees.js';

const lib = (L, v) => (L.find((x) => x.v === v) || {}).lib || v;
const justesCases = DEPOSE.cases.filter((c) => !c.sol).map((c) => c.id);

export const CORRIGE = {
  code: 'ENT-8.7',
  titre: 'Action — on décharge ensemble',
  trame: '(pas de trame pour l’instant : tout se fait à l’écran ; trame de Cowork après validation)',
  items: [
    { etape: 1, etapeTitre: 'Le protocole du quai 2 (situations tirées)', genre: 'tableau', texte: 'Les situations et la consigne qui s’applique',
      entetes: ['Situation', 'Difficulté', 'Ce que dit le protocole'],
      reponses: BANQUE_SITUATIONS.map((s) => [s.texte, s.difficulte, CONSIGNES[s.juste].texte]),
      note: `Chaque élève reçoit 3 situations (facile 1, moyenne 1,5, difficile 1,5). « ${ENGIN.lib} » → ${lib(ENGIN.choix, ENGIN.juste)} (1 point, bloc « Diriger le déchargement »).` },
    { etape: 2, etapeTitre: 'Au quai : accueillir le chauffeur', genre: 'tableau', texte: 'Les répliques justes (Marc, vouvoiement)',
      entetes: ['Marc dit', 'Réponse attendue'],
      reponses: REPLIQUES.map((r) => [r.dit, r.choix.find((c) => c.juste).lib.replace('{prenom}', '(prénom)')]),
      note: 'Salutation 0,5 · documents 1 · quai 1 · attente (moteur, clés, local) 1,5 · fin 0,5 : la PREMIÈRE réponse à chaque réplique compte ; « Revenir le voir » (Corriger) rejoue l’accueil.' },
    { etape: 3, etapeTitre: 'Le quai 2 : avant de décharger', genre: 'question', texte: 'L’anomalie (une seule, tirée par élève)',
      rep: ANOMALIES_SOCLE.map((o) => `${OBJETS[o].libKo} → « ${OBJETS[o].repare} »`).join(' · '),
      note: 'Signaler l’anomalie avant « C’est bon, on peut décharger » : 3 points ; aucun faux signalement : 1 point (faux si rien n’a été signalé). '
        + 'Les butoirs restent en place pour tous (l’anomalie « butoirs » était le bonus du confirmé : non construit).' },
    { etape: 4, etapeTitre: 'Le quai 2 : diriger le déchargement', genre: 'question', texte: 'Les cases de dépose',
      rep: `Les cases justes : ${justesCases.join(', ')} (zone de réception du quai 2). Pièges : l’allée piétonne (à gauche) et la zone du quai 3 (à droite).`,
      note: `0,625 par palette (${PALETTES.map((p) => p.id).join(', ')}), au PREMIER choix ; les palettes sortent dans l’ordre P4, P3, P2, P1.` },
    { etape: 5, etapeTitre: 'La note', genre: 'question', texte: 'Comment la note est-elle calculée ?',
      rep: 'Jalons pondérés et questions, total 20 : accueillir le chauffeur 4,5 · le protocole 4 · avant de décharger 4 · diriger le déchargement 3,5 · '
        + 'questions de Samia 4 (M 1,5, N 1,5, P 1 ; L non notée). Rien n’est vrai avant un envoi : inaction 0.',
      note: 'Poids validés par Tristan le 16/10/2026. Confirmé : une situation de plus, +0,5 si juste (caché à l’élève).' },
  ],
};

export function corrigeEleve(base, uid) {
  let db = base || {};
  const ouvert = !!TIRAGE.tirage(db);
  if (!ouvert) db = { ...db, tirages: { [ID]: { graine: `${uid || 'anonyme'}|${ID}`, ...TIRAGE.tirer(`${uid || 'anonyme'}|${ID}`) } } };
  const graine = graineDeBase(db) || String(uid || 'anonyme');
  const anomalie = graineDeBase(db) ? quaiDe(graine).securite.points.find((p) => !p.ok).objet : anomalieDe(graine);
  const items = [
    ...situationsDe(db).map((s) => ({ genre: 'fait', texte: `Situation (${s.difficulte}) : ${s.texte}`, rep: CONSIGNES[s.juste].texte })),
    ...situationsBonus(db).map((s) => ({ genre: 'fait', bonus: true, texte: `Situation (${s.difficulte}) : ${s.texte}`, rep: CONSIGNES[s.juste].texte })),
    { genre: 'fait', texte: ENGIN.lib, rep: lib(ENGIN.choix, ENGIN.juste) },
    { genre: 'fait', texte: 'Son anomalie au quai', rep: OBJETS[anomalie].libKo },
    { genre: 'fait', texte: 'Les cases justes de la dépose', rep: justesCases.join(', ') },
  ];
  if (!ouvert) return { texte: 'Cet élève n’a pas encore ouvert la séance : voici ce qu’il recevra en niveau standard (un confirmé reçoit en plus une situation).', items };
  return { texte: '', items };
}
