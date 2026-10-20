// Corrigé d'ENT-10.12 (Transports Pelleau, évaluation « contrôler la réception »), montré dans l'onglet « Corrigés » de l'enseignant.
//
// ÉVALUATION, TOUT EST TIRÉ : chaque élève a SES palettes (`contenus/pelleau-ent112-donnees.js`) : deux à problème (une facile — 2 colis abîmés devant —, une moyenne —
// 1 colis abîmé derrière, 2 manquants, ou, une copie sur trois, la palette de la Ferme de Kervéguen à REFUSER), un piège de comptage, une palette conforme. `CORRIGE` donne
// ce qui est commun ; `corrigeEleve(base, uid)` rend le corrigé d'un élève, CALCULÉ depuis sa graine (jamais recopié). La graine du jeu est l'identifiant de l'élève : le
// corrigé d'un élève qui n'a pas encore ouvert la séance est déjà le bon. Chargé aussi sous Node : aucun import du moteur.

import { graineDeBase } from '../../core/tirage.js';
import { jeuDe, colis, reelDe, quantite, nomClient, CONSERVATION, choixReserves, choixLitiges, choixKerveguen, ligneControle, SALUTATIONS, kerveguenDe,
  decrit } from '../pelleau-ent112-donnees.js';

const NOM_ANOMALIE = {
  'ecrase-face': 'écrasés sur la face avant', 'perce-face': 'percés sur la face avant',
  cache: 'abîmé sur la face arrière (il faut faire le tour)', manquant: 'manquants dans la couche du dessus',
  'couche-normale': 'PIÈGE : couche du dessus à moitié vide, mais la feuille de ramasse dit le même nombre', conforme: 'conforme, pleine',
  froid: `PLANTS DE POMMES DE TERRE : l’étiquette dit « Conservation : ${CONSERVATION} », l’entrepôt est ambiant`,
};
const DECISION = { reserves: 'accepter avec réserves', accepter: 'accepter', refuser: 'REFUSER (Ne se stocke pas ici)' };
const MOTIF = { avarie: 'Colis abîmé', manquant: 'Manquant' };

export const CORRIGE = {
  code: 'ENT-10.12',
  titre: 'Transports Pelleau — évaluation : contrôler la réception',
  trame: '(pas de trame : tout se fait à l’écran ; le corrigé de chaque élève est calculé depuis sa graine)',
  items: [
    { etape: 0, etapeTitre: 'Avant de commencer (4 points)', genre: 'question', texte: 'Quatre questions tirées parmi neuf (3 de préparation sur 7, 1 d’image sur 2)',
      rep: 'Réponses attendues dans `contenus/questions/ENT-10.12.js`. Juste +1, « Je ne sais pas » 0, fausse −1 ÷ (nombre de mauvaises réponses), plancher 0.' },
    { etape: 1, etapeTitre: 'Le quai A : contrôler les palettes (8 points)', genre: 'question', texte: 'Ce qui est attendu pour chaque palette',
      rep: 'Compter par couches, faire le tour, lire l’étiquette, comparer à la feuille de ramasse. Palette à problème : accepter avec réserves (« Colis abîmé » ou '
        + '« Manquant »). Autres palettes : accepter, aucune réserve (le piège : couche du dessus incomplète mais feuille au même nombre). Une copie sur trois : la palette '
        + 'de la Ferme de Kervéguen (plants de pommes de terre, étiquette « Conservation : entre 4 et 8 °C — craint le gel ») est à REFUSER (décision « Refuser », motif '
        + '« Ne se stocke pas ici »), l’entrepôt n’ayant pas de froid.',
      note: 'Deux palettes sans problème : 1,5 point chacune (comptage ET décision). Deux palettes à problème : 2,5 points chacune. Rien n’arrête l’élève et rien ne dit juste ou faux.' },
    { etape: 2, etapeTitre: 'Réserves et signature (4 points)', genre: 'question', texte: 'Réserves précises, pas de déballage, signature',
      rep: 'Une réserve précise (palette, quoi, combien) pour chaque palette à problème ; pour la palette de Kervéguen, la ligne de refus avec la référence lue sur l’étiquette. '
        + 'Pas de « sous réserve de déballage ». Faire signer Loïc.',
      note: 'Réserves justes 1,5 × 2 ; pas de déballage 0,5 ; signature 0,5. Aucun jalon n’est vrai tant que la feuille n’est pas signée.' },
    { etape: 3, etapeTitre: 'Rendre compte à Erwan (4 points)', genre: 'question', texte: 'Les phrases justes',
      rep: 'Salutation / ligne « contrôlé » imposée / ses réserves / la zone litiges / (si la copie a une palette de Kervéguen) la palette non stockée / la fin polie, signée — '
        + 'chacun calculé depuis sa ramasse (voir le corrigé de l’élève).',
      note: 'Contenu 3 (réserves, zone litiges, palette non stockée) ; forme 1 (salutation ET fin). Erwan ne reprend pas ce que l’élève a écrit.' },
    { etape: 4, etapeTitre: 'La note', genre: 'question', texte: 'Comment la note est-elle calculée ?',
      rep: 'Jalons pondérés et ouverture, total 20 : avant de commencer 4 · contrôler les palettes 8 · réserves et signature 4 · rendre compte 4. '
        + 'Rien n’est vrai avant la signature ou l’envoi : inaction 0.',
      note: 'Poids validés par Tristan le 18/10/2026. Évaluation en copie rendue : une seule remise, note figée, ni bonus ni niveau.' },
  ],
};

// Le corrigé d'UN élève : ses palettes, ses réserves, ses phrases (calculés depuis sa graine).
export function corrigeEleve(base, uid) {
  const graine = graineDeBase(base);
  const ouvert = !!graine;
  const jeu = jeuDe(graine || String(uid || 'anonyme'));
  const items = jeu.palettes.map((t) => {
    const m = t.anomalie, n = quantite(t);
    // Avec SON mot (« 2 cartons écrasés… », « 1 sac abîmé… ») : les quantités sont fixes (2, 1, 2), l'accord suit.
    const quoi = n && m !== 'couche-normale' ? `${colis(t, n)} ${NOM_ANOMALIE[m]}` : NOM_ANOMALIE[m];
    const facile = t.role === 'facile', moyen = t.role === 'moyen', kerv = t.client === 'kerveguen';
    const motif = m === 'manquant' ? 'manquant' : 'avarie';
    const decision = kerv ? DECISION.refuser : DECISION[facile || moyen ? 'reserves' : 'accepter'];
    const fin = kerv ? ' · réserve : palette REFUSÉE, produit livré = la référence de l’étiquette' : (facile || moyen)
      ? ` (${MOTIF[motif]}) · réserve : ${n} colis ${motif === 'manquant' ? 'manquant(s)' : 'abîmé(s)'}` : ' · aucune réserve';
    return { genre: 'fait', texte: `${t.id} — ${nomClient(t.client)} — ${decrit(t).nom} (${{ facile: 'à problème, facile', moyen: 'à problème', piege: 'sans problème, piège', conforme: 'sans problème' }[t.role]})`,
      rep: `${quoi} · FR ${t.bl} · réel ${reelDe(t)} · ${decision}${fin}` };
  });
  items.push({ genre: 'fait', texte: 'Compte rendu : la ligne « contrôlé »', rep: ligneControle(jeu) });
  items.push({ genre: 'fait', texte: 'Compte rendu : la ligne des réserves', rep: choixReserves(jeu)[0] });
  items.push({ genre: 'fait', texte: 'Compte rendu : la zone litiges', rep: choixLitiges(jeu)[0] });
  if (kerveguenDe(jeu)) items.push({ genre: 'fait', texte: 'Compte rendu : la palette de Kervéguen', rep: choixKerveguen()[0] });
  items.push({ genre: 'fait', texte: 'Compte rendu : salutation et fin', rep: `${SALUTATIONS[0]} … Je reste au quai. (prénom)` });
  return { texte: ouvert ? '' : 'Cet élève n’a pas encore ouvert la séance : voici les palettes qu’il recevra.', items };
}
