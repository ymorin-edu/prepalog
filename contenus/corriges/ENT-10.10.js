// Corrigé d'ENT-10.10 (Transports Pelleau, le contrôle, seul), montré dans l'onglet « Corrigés » de l'enseignant.
//
// Chaque élève a reçu SA ramasse (`contenus/pelleau-ent110-donnees.js`) : quatre palettes, deux d'Ar Vag (cartons) et deux d'Agri-Kerlann (sacs), dans un ordre
// tiré ; une palette à 2 colis abîmés devant (cartons écrasés chez Ar Vag, sacs percés chez Agri-Kerlann), une palette de L'AUTRE client à 1 colis abîmé derrière,
// à 2 colis manquants, ou, un tirage sur trois, à ÉTIQUETTE DIFFÉRENTE (l'engrais au lieu du terreau), une palette au piège (couche du dessus à moitié vide,
// conforme à la feuille de ramasse), une palette conforme. `CORRIGE` donne ce qui est commun ; `corrigeEleve(base, uid)` rend le corrigé d'un élève, CALCULÉ
// depuis son jeu (jamais recopié). La graine du jeu est l'identifiant de l'élève : le corrigé d'un élève qui n'a pas encore ouvert la séance est déjà le bon.

import { graineDeBase } from '../../core/tirage.js';
import { CLIENTS_110, NOM_DIT, ENGRAIS, decrit, pleine, colis, jeuDe, reelDe, quantite, etiquetteDe, choixReserves, choixLitiges, ligneControle,
  SALUTATIONS } from '../pelleau-ent110-donnees.js';

const NOM_ANOMALIE = {
  'ecrase-face': 'écrasés sur la face avant', 'perce-face': 'percés sur la face avant',
  cache: 'abîmé sur la face arrière (il faut faire le tour)', manquant: 'manquants dans la couche du dessus',
  'couche-normale': 'PIÈGE : couche du dessus à moitié vide, mais la feuille de ramasse dit le même nombre', conforme: 'conforme, pleine',
};
const DECISION = { reserves: 'accepter avec réserves', accepter: 'accepter' };
const MOTIF = { avarie: 'Colis abîmé', manquant: 'Manquant', produit: 'Article différent' };

export const CORRIGE = {
  code: 'ENT-10.10',
  titre: 'Transports Pelleau — le contrôle, seul',
  trame: '(pas de trame : tout se fait à l’écran ; le brouillon de comptage d’ENT-10.9 sert aussi ici)',
  items: [
    { etape: 1, etapeTitre: 'La ramasse du matin (les mêmes quatre palettes pour toute la classe, dans un ordre tiré)', genre: 'tableau', texte: 'Les palettes, pleines',
      entetes: ['Client', 'Palettes', 'Désignation', 'Couches × colis', 'Pleine'],
      reponses: CLIENTS_110.map((c) => { const d = decrit({ id: '', client: c }); return [NOM_DIT[c], '2', d.nom, `${d.L} × ${d.W * d.D}`, colis({ client: c }, pleine({ client: c }))]; }),
      note: 'Chaque élève reçoit sa ramasse et ses anomalies (corrigé par élève) : deux palettes à problème (une de chaque client), une au piège, une conforme.' },
    { etape: 2, etapeTitre: 'Le contrôle', genre: 'question', texte: 'Ce qui est attendu pour chaque palette',
      rep: 'Compter par couches (couche complète × couches − manquants du dessus), faire le tour, lire l’étiquette, comparer à la feuille de ramasse. '
        + 'Avarie, manquant ou article différent : accepter avec réserves (motif « Colis abîmé », « Manquant » ou « Article différent »), réserve précise (palette, '
        + 'quoi, combien ; pour un article différent, la référence lue sur l’étiquette). Couche du dessus incomplète mais feuille au même nombre : accepter. '
        + 'Pas de « sous réserve de déballage ». Faire signer Loïc.',
      note: 'Palettes : 2,5 chacune pour les deux à problème, 1,5 pour les deux autres (comptage ET décision). Réserves 1,5 × 2, pas de déballage 1, signature 1.' },
    { etape: 3, etapeTitre: 'Rendre compte à Erwan', genre: 'question', texte: 'Les phrases justes',
      rep: `Bonjour Erwan, · ${ligneControle()} · ses réserves (ses deux palettes) · les colis abîmés (ou la palette « article différent ») en zone litiges · Je reste au quai. (prénom)`,
      note: 'Réserves 1 ; zone litiges 1 ; forme (salutation et fin) 1. Les phrases sont calculées sur le tirage de l’élève.' },
    { etape: 4, etapeTitre: 'Les questions', genre: 'question', texte: 'Les réponses',
      rep: 'Q1 (à la clôture du quai) : la réserve de SA palette « facile » (palette, quoi, combien) · Q2 (à la première palette validée, corrigée au bilan) : '
        + 'je l’écris en réserve : article différent, et on prévient le client · Q3 : pour qu’on ne nous reproche pas, au départ, un colis abîmé dans nos racks '
        + '(C. civ. 1932).',
      note: 'Q1 1,5 ; Q2 1,5 ; Q3 1. Total de la séance : 16 + 4 = 20. Rien fait = 0.' },
  ],
};

export function corrigeEleve(base, uid) {
  const g = graineDeBase(base) || uid || '';
  const jeu = jeuDe(g);
  const items = jeu.palettes.map((t) => {
    const d = decrit(t), m = t.anomalie, n = quantite(t), e = etiquetteDe(t);
    // Avec SON mot (« 2 cartons écrasés… », « 1 sac abîmé… ») : les quantités sont fixes (2, 1, 2), l'accord suit.
    const quoi = m === 'produit' ? `ARTICLE DIFFÉRENT : l’étiquette dit ${e.nom} (${e.ref}), la feuille de ramasse dit ${d.nom} (${d.ref})`
      : n && m !== 'couche-normale' ? `${colis(t, n)} ${NOM_ANOMALIE[m]}` : NOM_ANOMALIE[m];
    const reserve = t.role === 'facile' || t.role === 'moyen';
    const motif = m === 'manquant' ? 'manquant' : m === 'produit' ? 'produit' : 'avarie';
    const ecrit = motif === 'produit' ? `référence livrée ${ENGRAIS.ref}` : `${n} colis ${motif === 'manquant' ? 'manquant(s)' : 'abîmé(s)'}`;
    return { genre: 'fait', texte: `${t.id} — ${NOM_DIT[t.client]} — ${d.nom}`,
      rep: `${quoi} · FR ${t.bl} · réel ${reelDe(t)} · ${DECISION[reserve ? 'reserves' : 'accepter']}${reserve ? ` (${MOTIF[motif]}) · réserve : ${ecrit}` : ' · aucune réserve'}` };
  });
  items.push({ genre: 'fait', texte: 'Compte rendu : la ligne des réserves', rep: choixReserves(jeu)[0] });
  items.push({ genre: 'fait', texte: 'Compte rendu : la zone litiges', rep: choixLitiges(jeu)[0] });
  items.push({ genre: 'fait', texte: 'Compte rendu : salutation et fin', rep: `${SALUTATIONS[0]} … Je reste au quai. (prénom)` });
  return { texte: graineDeBase(base) ? '' : 'Cet élève n’a pas encore ouvert la séance : voici les palettes qu’il recevra.', items };
}
