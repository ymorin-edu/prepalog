// Corrigé d'ENT-10.9 (Transports Pelleau, contrôler les palettes des clients), montré dans l'onglet « Corrigés » de l'enseignant.
//
// Chaque élève a reçu SES anomalies (`contenus/pelleau-ent109-donnees.js`) : une palette à 2 colis abîmés devant (cartons écrasés chez Ar Vag, sacs
// percés chez Agri-Kerlann), une palette de L'AUTRE client à 1 colis abîmé derrière OU à 2 colis manquants, une palette au piège (couche du dessus à
// moitié vide, conforme à la feuille de ramasse), une palette conforme. `CORRIGE` donne ce qui est commun ; `corrigeEleve(base, uid)` rend le corrigé
// d'un élève, CALCULÉ depuis son jeu (jamais recopié). La graine du jeu est l'identifiant de l'élève : le corrigé d'un élève qui n'a pas encore ouvert
// la séance est déjà le bon.

import { graineDeBase } from '../../core/tirage.js';
import { PALETTES, paletteDe, pleine, colis, jeuDe, reelDe, quantite, choixReserves, choixLitiges, ligneControle, SALUTATIONS } from '../pelleau-ent109-donnees.js';

const NOM_ANOMALIE = {
  'ecrase-face': 'écrasés sur la face avant', 'perce-face': 'percés sur la face avant',
  cache: 'abîmé sur la face arrière (il faut faire le tour)', manquant: 'manquants dans la couche du dessus',
  'couche-normale': 'PIÈGE : couche du dessus à moitié vide, mais la feuille de ramasse dit le même nombre', conforme: 'conforme, pleine',
};
const DECISION = { reserves: 'accepter avec réserves', accepter: 'accepter' };
const MOTIF = { avarie: 'Colis abîmé', manquant: 'Manquant' };

export const CORRIGE = {
  code: 'ENT-10.9',
  titre: 'Transports Pelleau — contrôler les palettes des clients',
  trame: '(pas de trame pour l’instant : tout se fait à l’écran ; brouillon de comptage de Cowork après validation)',
  items: [
    { etape: 1, etapeTitre: 'La ramasse du matin (la même pour toute la classe)', genre: 'tableau', texte: 'Les 4 palettes, pleines',
      entetes: ['Palette', 'Client', 'Désignation', 'Couches × colis', 'Pleine'],
      reponses: PALETTES.map((p) => [p.id, p.client === 'ar-vag' ? 'Biscuiterie Ar Vag' : 'Agri-Kerlann', p.nom, `${p.L} × ${p.W * p.D}`, colis(p.id, pleine(p))]),
      note: 'Chaque élève reçoit ses anomalies (corrigé par élève) : deux palettes à problème (une de chaque client), une au piège, une conforme.' },
    { etape: 2, etapeTitre: 'Le contrôle', genre: 'question', texte: 'Ce qui est attendu pour chaque palette',
      rep: 'Compter par couches (couche complète × couches − manquants du dessus), faire le tour, lire l’étiquette, comparer à la feuille de ramasse. '
        + 'Avarie ou manquant : accepter avec réserves (motif « Colis abîmé » ou « Manquant »), réserve précise (palette, quoi, combien). Couche du dessus '
        + 'incomplète mais feuille au même nombre : accepter. Pas de « sous réserve de déballage ». Faire signer Loïc.',
      note: 'Palettes : 2,5 chacune pour les deux à problème, 1,5 pour les deux autres (comptage ET décision). Réserves 1,5 × 2, pas de déballage 1, signature 1.' },
    { etape: 3, etapeTitre: 'Rendre compte à Erwan', genre: 'question', texte: 'Les phrases justes',
      rep: `Bonjour Erwan, · ${ligneControle()} · ses réserves (ses deux palettes, ses quantités) · les colis abîmés en zone litiges · Je reste au quai. (prénom)`,
      note: 'Réserves 1 ; zone litiges 1 ; forme (salutation et fin) 1. Les phrases sont calculées sur le tirage de l’élève.' },
    { etape: 4, etapeTitre: 'Les questions', genre: 'question', texte: 'Les réponses',
      rep: 'Q1 (à la 1re palette validée, corrigée au bilan) : on garde la marchandise du client, il doit savoir dans quel état elle est entrée, et on doit '
        + 'pouvoir le prouver (C. civ. 1927, 1932) · Q2 (à une palette d’Agri-Kerlann validée) : en zone litiges, avec une étiquette · Q3 : Maëlys · '
        + 'Q4 (réflexion) : les trois.',
      note: 'Q1 1,5 ; Q2 1 ; Q3 1,5. Total de la séance : 16 + 4 = 20. Rien fait = 0.' },
  ],
};

export function corrigeEleve(base, uid) {
  const g = graineDeBase(base) || uid || '';
  const jeu = jeuDe(g);
  const items = jeu.palettes.map((t) => {
    const p = paletteDe(t.id), m = t.anomalie, n = quantite(t);
    // Avec SON mot (« 2 cartons écrasés… », « 1 sac abîmé… ») : les quantités sont fixes (2, 1, 2), l'accord suit.
    const quoi = n && m !== 'couche-normale' ? `${colis(p.id, n)} ${NOM_ANOMALIE[m]}` : NOM_ANOMALIE[m];
    const reserve = t.role === 'facile' || t.role === 'moyen';
    const motif = m === 'manquant' ? 'manquant' : 'avarie';
    return { genre: 'fait', texte: `${p.id} — ${p.nom}`,
      rep: `${quoi} · FR ${t.bl} · réel ${reelDe(t)} · ${DECISION[reserve ? 'reserves' : 'accepter']}${reserve ? ` (${MOTIF[motif]}) · réserve : ${n} colis ${motif === 'manquant' ? 'manquant(s)' : 'abîmé(s)'}` : ' · aucune réserve'}` };
  });
  items.push({ genre: 'fait', texte: 'Compte rendu : la ligne des réserves', rep: choixReserves(jeu)[0] });
  items.push({ genre: 'fait', texte: 'Compte rendu : la zone litiges', rep: choixLitiges(jeu)[0] });
  items.push({ genre: 'fait', texte: 'Compte rendu : salutation et fin', rep: `${SALUTATIONS[0]} … Je reste au quai. (prénom)` });
  return { texte: graineDeBase(base) ? '' : 'Cet élève n’a pas encore ouvert la séance : voici les palettes qu’il recevra.', items };
}
