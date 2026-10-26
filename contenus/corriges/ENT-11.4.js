// Corrigé d'ENT-11.4 (Mondial Relay, évaluation « le samedi du pic »), montré dans l'onglet « Corrigés » de l'enseignant.
//
// ÉVALUATION, TOUT EST TIRÉ : chaque élève a SON jeu (chauffeurs, fins de service d'hier, durée de T5, imprévu), tiré de sa graine (`db.tirage.graine`, l'identifiant
// de l'élève). `CORRIGE` donne ce qui est commun ; `corrigeEleve(base, uid)` rend le corrigé d'un élève, CALCULÉ depuis sa graine par le solveur de
// `contenus/mondial-relay-ent114-donnees.js` (une solution parmi d'autres, jugée juste par le vrai moteur dans le bloc `mr-11.4`). Chargé aussi sous Node.

import { graineDeBase, jeuDe, resoudre, chauffeursDe, camionsDe, tourneesDe, IDS_CHAUFFEURS, hm, duree, pauseEnRoute } from '../mondial-relay-ent114-donnees.js';

const ALEA = { panne: 'un camion tombe en panne (un porteur de renfort arrive à 08:00)', malade: 'un chauffeur est malade (un chauffeur de renfort arrive à 07:30)',
  doublee: 'T2 est doublée par le volume du pic (T2 bis, avec un chauffeur et un fourgon de renfort dès 07:00)' };

export const CORRIGE = {
  code: 'ENT-11.4',
  titre: 'Mondial Relay — évaluation : le samedi du pic',
  trame: '(pas de trame : tout se fait à l’écran ; le corrigé de chaque élève est calculé depuis sa graine)',
  items: [
    { etape: 0, etapeTitre: 'Avant de commencer (4 points)', genre: 'question', texte: 'Quatre questions tirées parmi huit (2 de préparation sur 4, 2 de droit sur 4)',
      rep: 'Réponses attendues dans `contenus/questions/ENT-11.4.js`. Juste +1, « Je ne sais pas » 0, fausse −1 ÷ (nombre de mauvaises réponses), plancher 0.' },
    { etape: 1, etapeTitre: 'Le planning, premier envoi (12 points)', genre: 'question', texte: 'Chaque tournée a un chauffeur et un camion, à son heure (3) ; le bon permis, le bon type de camion, une tournée par chauffeur et par camion (3) ; le repos de 11 h (3) ; la conduite et la pause (3)',
      rep: 'Calculé depuis SON jeu (voir le corrigé de l’élève).',
      note: 'Un chauffeur a fini si tard hier qu’aucune tournée ne lui convient : il reste sans tournée. Les cinq autres travaillent tous. Un chauffeur au permis B ne conduit qu’un fourgon. Rien n’est vrai avant l’envoi.' },
    { etape: 2, etapeTitre: 'L’imprévu et la reprise (3 points)', genre: 'question', texte: 'Après l’imprévu : planning de nouveau complet et dans les règles',
      rep: 'Un imprévu parmi trois, tiré par élève : une panne de camion, un chauffeur malade, ou T2 doublée. Les cinq camions (ou les cinq chauffeurs) servaient tous : l’imprévu touche toujours le planning.',
      note: 'Le 1er envoi renvoyé tel quel ne rapporte rien (garde d’inaction). Aucun message ne dit « de combien ».' },
    { etape: 3, etapeTitre: 'Rendre compte à Samia (1 point)', genre: 'question', texte: 'Le message attendu (phrases à choisir, au tu)',
      rep: 'Salutation / ce qui change (le fait de SON imprévu, avec la disponibilité du renfort) / la raison (permis, repos, conduite vérifiés) / la fin polie.',
      note: 'Sont jugées « ce qui change » et « la raison » ; la salutation et la fin ne rapportent rien.' },
    { etape: 4, etapeTitre: 'Les questions au fil (non notées)', genre: 'question', texte: 'Le chauffeur au repos, la pause de T5, l’arrêt maladie',
      rep: 'Réponses rangées pour l’enseignant, « Merci, je note » à l’écran. Le texte de l’arrêt maladie n’a pas été relu (voir `contenus/questions/ENT-11.4.js`).' },
    { etape: 5, etapeTitre: 'La note', genre: 'question', texte: 'Comment la note est-elle calculée ?',
      rep: 'Jalons pondérés et ouverture, total 20 : avant de commencer 4 · planning 12 (4 × 3) · après l’imprévu 3 · message à Samia 1. Rien n’est vrai avant un envoi : inaction 0.',
      note: 'Poids du brief §5, acceptés par Tristan le 26/10/2026. Évaluation en copie rendue : une seule remise, note figée, ni bonus ni niveau.' },
  ],
};

const lignes = (jeu, phase, sol) => tourneesDe(jeu, phase).map((t) => {
  const p = sol[t.id], c = chauffeursDe(jeu, phase).find((x) => x.id === p.r), k = camionsDe(jeu, phase).find((x) => x.id === p.k);
  return `${t.court} : ${c.nom} sur ${k.nom} à ${hm(300 + p.s * 15)}`;
});

// Le corrigé d'UN élève : son jeu et une solution avant et après l'imprévu (calculés depuis sa graine).
export function corrigeEleve(base, uid) {
  const graine = graineDeBase(base);
  const jeu = jeuDe(graine || String(uid || 'anonyme'));
  const repos = IDS_CHAUFFEURS.find((id) => jeu.roles[id] === 'repos');
  const s1 = resoudre(jeu, 1), s2 = resoudre(jeu, 2);
  const items = [
    { genre: 'fait', texte: 'Ses chauffeurs', rep: chauffeursDe(jeu, 1).map((c) => `${c.nom} (${c.note})`).join(' ; ') },
    { genre: 'fait', texte: 'Le chauffeur au repos', rep: `${jeu.noms[repos]} (fin de service hier ${jeu.finHier[repos]}) : aucune tournée possible, il n’en a pas` },
    { genre: 'fait', texte: 'La conduite de T5', rep: `${duree(jeu.t5)}${pauseEnRoute(jeu.t5) ? ' : plus de 4 h 30, donc une pause de 45 min en route' : ' : pas de pause obligatoire'}` },
    { genre: 'fait', texte: 'Premier envoi : une solution juste', rep: s1 ? lignes(jeu, 1, s1).join(' ; ') : '(aucune : jeu de secours)' },
    { genre: 'fait', texte: 'Son imprévu', rep: `${ALEA[jeu.alea]}${jeu.alea === 'panne' ? ` : camion ${jeu.cible}` : jeu.alea === 'malade' ? ` : ${jeu.noms[jeu.cible]}` : ''}` },
    { genre: 'fait', texte: 'Après l’imprévu : une solution juste', rep: s2 ? lignes(jeu, 2, s2).join(' ; ') : '(aucune : jeu de secours)' },
  ];
  return { texte: graine ? '' : 'Cet élève n’a pas encore ouvert la séance : voici le jeu que sa graine lui donnera.', items };
}
