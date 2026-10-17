// Corrigé d'ENT-8.8 (Action, on vérifie qu'il ne manque rien), montré dans l'onglet « Corrigés » de l'enseignant.
//
// Chaque élève a reçu SES anomalies (`contenus/action-ent88-donnees.js`) : une palette à 2 cartons écrasés devant, une palette à 1 carton écrasé
// derrière OU à 2 cartons manquants, une palette au piège (couche du dessus à moitié vide, conforme au BL), une palette conforme. `CORRIGE` donne
// ce qui est commun ; `corrigeEleve(base, uid)` rend le corrigé d'un élève, CALCULÉ depuis son jeu (jamais recopié). La graine du jeu est
// l'identifiant de l'élève : le corrigé d'un élève qui n'a pas encore ouvert la séance est déjà le bon.

import { graineDeBase } from '../../core/tirage.js';
import { MOTIFS } from '../../core/types/quai.js';
import { PALETTES, jeuDe, quaiDuJeu, reelDe, quantite, choixReserves, choixLitiges, paletteDeQ1, DOMMAGE, LIGNE_RECU, SALUTATIONS } from '../action-ent88-donnees.js';

const NOM_ANOMALIE = {
  'ecrase-face': 'cartons écrasés sur la face avant', 'ecrase-cache': 'un carton écrasé sur la face arrière (il faut faire le tour)',
  manquant: 'cartons manquants dans la couche du dessus', 'couche-normale': 'PIÈGE : couche du dessus à moitié vide, mais le BL dit le même nombre',
  conforme: 'conforme, pleine',
};
const DECISION = { reserves: 'accepter avec réserves', accepter: 'accepter' };

export const CORRIGE = {
  code: 'ENT-8.8',
  titre: 'Action — on vérifie qu’il ne manque rien',
  trame: '(pas de trame pour l’instant : tout se fait à l’écran ; trame de Cowork après validation)',
  items: [
    { etape: 1, etapeTitre: 'Le camion du Havre (le même pour toute la classe)', genre: 'tableau', texte: 'Les 4 palettes, pleines',
      entetes: ['Palette', 'Désignation', 'Couches × cartons', 'Pleine'],
      reponses: PALETTES.map((p) => [p.id, p.designation, `${p.couches} × ${p.parCouche}`, String(p.cartons)]),
      note: 'Chaque élève reçoit ses anomalies (corrigé par élève) : deux palettes à problème, une au piège, une conforme.' },
    { etape: 2, etapeTitre: 'Le contrôle', genre: 'question', texte: 'Ce qui est attendu pour chaque palette',
      rep: 'Compter par couches (couche complète × couches − manquants du dessus), faire le tour, lire l’étiquette, comparer au BL. Avarie ou '
        + 'manquant : accepter avec réserves (motif « Cartons endommagés » ou « Manquant »), réserve précise (palette, quoi, combien). Couche du dessus '
        + 'incomplète mais BL au même nombre : accepter. Pas de « sous réserve de déballage ». Faire signer Marc.',
      note: 'Palettes : 2,5 chacune pour les deux à problème, 1,5 pour les deux autres (comptage ET décision). Réserves 1,5 × 2, pas de déballage 1, signature 1.' },
    { etape: 3, etapeTitre: 'Rendre compte à Samia', genre: 'question', texte: 'Les phrases justes',
      rep: `Bonjour Samia, · ${LIGNE_RECU} · ses réserves (ses deux palettes, ses quantités) · les cartons abîmés en zone litiges · Je reste au quai. (prénom)`,
      note: 'Réserves 1 ; zone litiges 1 ; salutation 0,5 ; fin 0,5. Les phrases sont calculées sur le tirage de l’élève.' },
    { etape: 4, etapeTitre: 'Les questions de Samia', genre: 'question', texte: 'Les réponses',
      rep: 'Q1 (à la clôture du quai) : 3 jours, sans compter les jours fériés, par lettre recommandée (C. com. L133-3) · Q2 (corrigée au bilan) : pour '
        + 'reconnaître devant toi ce qui a été constaté · Q3 : Julie, l’agent administratif · Q4 (réflexion) : les trois.',
      note: 'Q1 1,5 ; Q2 1,5 ; Q3 1. Total de la séance : 16 + 4 = 20. Rien fait = 0.' },
  ],
};

export function corrigeEleve(base, uid) {
  const g = graineDeBase(base) || uid || '';
  const jeu = jeuDe(g);
  const Q = quaiDuJeu(jeu);
  const items = Q.camions[0].palettes.map((p, n) => {
    const t = jeu.palettes[n], m = t.anomalie;
    const qte = m === 'ecrase-face' || m === 'manquant' ? `${quantite(t)} ` : '';
    const res = p.attendu === 'reserves' ? ` · réserve : ${quantite(t)} ${m === 'manquant' ? 'carton(s) manquant(s)' : 'carton(s) endommagé(s)'}` : ' · aucune réserve';
    return { genre: 'fait', texte: `${p.id} — ${p.nom}`,
      rep: `${qte}${NOM_ANOMALIE[m]} · BL ${p.bl} · réel ${reelDe(t)} · ${DECISION[p.attendu]}${p.attendu === 'reserves' ? ` (${MOTIFS[p.motifAttendu]})` : ''}${res}` };
  });
  const q1 = paletteDeQ1(jeu);
  items.push({ genre: 'fait', texte: 'Compte rendu : la ligne des réserves', rep: choixReserves(jeu)[0] });
  items.push({ genre: 'fait', texte: 'Compte rendu : la zone litiges', rep: choixLitiges(jeu)[0] });
  items.push({ genre: 'fait', texte: 'Compte rendu : salutation et fin', rep: `${SALUTATIONS[0]} … Je reste au quai. (prénom)` });
  items.push({ genre: 'fait', texte: 'Question Q1 : la palette citée', rep: `${q1.id} (un carton ${DOMMAGE[q1.id][0]}, acceptée sans réserve) → 3 jours, par lettre recommandée` });
  return { texte: graineDeBase(base) ? '' : 'Cet élève n’a pas encore ouvert la séance : voici les palettes qu’il recevra.', items };
}
