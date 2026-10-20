// Corrigé d'ENT-10.11 (Transports Pelleau, la palette qui craint la chaleur), montré dans l'onglet « Corrigés » de l'enseignant.
//
// Chaque élève a reçu SES palettes (`contenus/pelleau-ent111-donnees.js`) : la palette de la Ferme de Kervéguen à un rang tiré (à REFUSER : l'étiquette
// dit « Conservation : entre 4 et 8 °C — craint le gel », l'entrepôt est ambiant), une palette à problème (2 colis abîmés devant, 1 derrière ou 2 manquants),
// une ou deux palettes conformes dont, une fois sur deux, un piège de comptage (couche du dessus à moitié vide, conforme à la feuille de ramasse).
// `CORRIGE` donne ce qui est commun ; `corrigeEleve(base, uid)` rend le corrigé d'un élève, CALCULÉ depuis son jeu (jamais recopié). La graine du jeu est
// l'identifiant de l'élève : le corrigé d'un élève qui n'a pas encore ouvert la séance est déjà le bon.

import { graineDeBase } from '../../core/tirage.js';
import { jeuDe, palettesDe, paletteDe, colis, reelDe, quantite, nomClient, FOURCHETTE, CONSERVATION, CASES_DEVIENT, choixReserves, choixKerveguen,
  ligneControle, SALUTATIONS } from '../pelleau-ent111-donnees.js';

const NOM_ANOMALIE = {
  'ecrase-face': 'écrasés sur la face avant', 'perce-face': 'percés sur la face avant',
  cache: 'abîmé sur la face arrière (il faut faire le tour)', manquant: 'manquants dans la couche du dessus',
  'couche-normale': 'PIÈGE : couche du dessus à moitié vide, mais la feuille de ramasse dit le même nombre', conforme: 'conforme, pleine',
  kerveguen: `PLANTS DE POMMES DE TERRE : l’étiquette dit « Conservation : ${CONSERVATION} », l’entrepôt est ambiant`,
};
const DECISION = { reserves: 'accepter avec réserves', accepter: 'accepter', refuser: 'REFUSER (Ne se stocke pas ici)' };
const MOTIF = { avarie: 'Colis abîmé', manquant: 'Manquant' };

export const CORRIGE = {
  code: 'ENT-10.11',
  titre: 'Transports Pelleau — la palette qui craint la chaleur',
  trame: '(pas de trame pour l’instant : tout se fait à l’écran ; l’étiquette de la palette imprimée en noir et blanc est à fabriquer par Cowork)',
  items: [
    { etape: 1, etapeTitre: 'Ne pas céder (Loïc)', genre: 'question', texte: 'La bonne réponse à Loïc',
      rep: 'Je lis d’abord l’étiquette, et je demande à Erwan avant de la ranger. Les trois autres réponses font dire « Comme tu veux. » à Loïc et la séance continue.',
      note: 'Ne pas céder 2 points (la première réponse compte). Loïc dit « c’est pas grave » : ce qui compte est ce que dit l’étiquette.' },
    { etape: 2, etapeTitre: 'Le quai A : contrôler les 4 palettes', genre: 'question', texte: 'Ce qui est attendu pour chaque palette',
      rep: 'Compter par couches, faire le tour, lire l’étiquette, comparer à la feuille de ramasse. PALETTE DE KERVÉGUEN : la lire au zoom, REFUSER la mise en stock '
        + '(décision « Refuser », motif « Ne se stocke pas ici », écrire la référence lue sur l’étiquette). Palette à problème : accepter avec réserves (« Colis abîmé » ou '
        + '« Manquant »), réserve précise (palette, quoi, combien). Autres palettes : accepter, aucune réserve (le piège : couche du dessus incomplète mais feuille au '
        + 'même nombre). Pas de « sous réserve de déballage ». Faire signer Loïc.',
      note: 'La palette de Kervéguen : décision 3. Palette à problème : 2 ; chacune des deux autres : 1 ; réserves 1 (la palette à problème ET la ligne de refus) ; pas de déballage 0,5 ; signature 0,5.' },
    { etape: 3, etapeTitre: 'Que devient la palette de Kervéguen ?', genre: 'question', texte: 'Les deux cases justes',
      rep: CASES_DEVIENT.filter((c) => c.juste).map((c) => c.lib).join(' · '),
      note: `Faux : ${CASES_DEVIENT.filter((c) => !c.juste).map((c) => c.lib).join(' · ')}. 2 points, rien de trop.` },
    { etape: 4, etapeTitre: 'Rendre compte à Erwan', genre: 'question', texte: 'Les phrases justes',
      rep: `Bonjour Erwan, · ${ligneControle()} · Je n’ai pas stocké la palette de Kervéguen : des plants à garder ${FOURCHETTE}. · ses réserves (sa palette à problème) · Je reste au quai. (prénom)`,
      note: 'Kervéguen 1 ; réserves 1 ; forme (salutation et fin) 1. Les phrases sont calculées sur le tirage de l’élève.' },
    { etape: 5, etapeTitre: 'Les questions', genre: 'question', texte: 'Les réponses',
      rep: 'Q1 (à la première case cochée de la fiche) : Pelleau, qui les gardait et était payé pour ça (C. civ. 1927, 1928) · Q2 (à la fin de l’entretien avec Loïc, corrigée au bilan) : '
        + 'sur son étiquette · Q3 (à la clôture du quai) : le quai n’est pas froid, les plants s’abîmeraient · Q4 (réflexion) : au choix.',
      note: 'Q1 1,5 ; Q2 1 ; Q3 1,5. Total de la séance : 16 + 4 = 20. Rien fait = 0.' },
  ],
};

export function corrigeEleve(base, uid) {
  const g = graineDeBase(base) || uid || '';
  const jeu = jeuDe(g);
  const items = palettesDe(jeu).map((t) => {
    const m = t.anomalie, n = quantite(t);
    // Avec SON mot (« 2 cartons écrasés… », « 1 sac abîmé… ») : les quantités sont fixes (2, 1, 2), l'accord suit.
    const quoi = n && m !== 'couche-normale' ? `${colis(jeu, t.id, n)} ${NOM_ANOMALIE[m]}` : NOM_ANOMALIE[m];
    const probleme = t.role === 'probleme', kerv = t.role === 'kerveguen';
    const motif = m === 'manquant' ? 'manquant' : 'avarie';
    const decision = kerv ? DECISION.refuser : DECISION[probleme ? 'reserves' : 'accepter'];
    const fin = kerv ? ' · réserve : palette REFUSÉE — ne se stocke pas ici' : probleme
      ? ` (${MOTIF[motif]}) · réserve : ${n} colis ${motif === 'manquant' ? 'manquant(s)' : 'abîmé(s)'}` : ' · aucune réserve';
    return { genre: 'fait', texte: `${t.id} — ${nomClient(t.client)} — ${paletteDe(jeu, t.id).nom}`, rep: `${quoi} · FR ${t.bl} · réel ${reelDe(jeu, t)} · ${decision}${fin}` };
  });
  items.push({ genre: 'fait', texte: 'Compte rendu : la palette de Kervéguen', rep: choixKerveguen()[0] });
  items.push({ genre: 'fait', texte: 'Compte rendu : la ligne des réserves', rep: choixReserves(jeu)[0] });
  items.push({ genre: 'fait', texte: 'Compte rendu : salutation et fin', rep: `${SALUTATIONS[0]} … Je reste au quai. (prénom)` });
  return { texte: graineDeBase(base) ? '' : 'Cet élève n’a pas encore ouvert la séance : voici les palettes qu’il recevra.', items };
}
