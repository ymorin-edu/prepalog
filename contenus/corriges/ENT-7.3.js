// Corrigé d'ENT-7.3 (Decathlon, la barge ne passe plus), montré dans l'onglet « Corrigés » de l'enseignant.
//
// Chaque élève a reçu SON tirage (`contenus/decathlon-ent73-donnees.js`) : son numéro de conteneur (chiffre de contrôle calculé), son scellé, son
// poids brut, sa référence, ses prix et l'ordre de ses offres (et, pour un confirmé, une cinquième offre). `CORRIGE` donne ce qui est commun ;
// `corrigeEleve(base, uid)` rend le corrigé d'un élève, calculé depuis sa base (jamais recopié).

import { ID, TIRAGE, LIMITE, OT_1, OT_2, COMMANDE, jeuEleve } from '../decathlon-ent73-donnees.js';
import { quand, kg, euros } from '../decathlon.js';

export const CORRIGE = {
  code: 'ENT-7.3',
  titre: 'Decathlon — la barge ne passe plus',
  trame: '(pas de trame pour l’instant : tout se fait à l’écran ; trame courte de Cowork après validation)',
  items: [
    { etape: 1, etapeTitre: 'Commander comme d’habitude (non noté)', genre: 'question', texte: 'Le comparateur n° 1, l’ordre n° 1, le premier courriel',
      rep: `Comparateur n° 1 (non noté) → Claire reprend l’offre de l’élève, puis décide : la barge de Contargo, comme d’habitude. Ordre de transport ${OT_1} rempli à partir de l’avis `
        + `et envoyé à Contargo en pièce jointe : Contargo confirme (référence ${COMMANDE}).`,
      note: 'Rien n’est noté avant l’imprévu. Le message de Contargo qui annonce l’arrêt de l’Escaut arrive dès qu’un ordre n° 1 est parti chez un prestataire (jamais sur un courriel à Claire ni sans l’ordre).' },
    { etape: 2, etapeTitre: 'Rechoisir', genre: 'tableau', texte: 'Le nouveau comparateur (le même pour tous, à l’ordre des lignes près)',
      entetes: ['Offre', 'Dans la liste ?', 'Tient la date ?', 'Je retiens'],
      reponses: [['Routiers du Hainaut (route)', 'oui', 'oui', 'non'], ['Contargo (barge)', 'oui', 'NON : l’Escaut est arrêté jusqu’au 05/03', 'non'],
        ['Rail Flandres-Artois (rail + camion)', 'oui', 'oui', 'OUI (la moins émettrice des deux qui tiennent la date)'], ['RailCo Express', 'NON (hors liste)', 'oui', 'non']],
      note: 'Piège : RailCo, moins cher et moins émetteur, n’est pas référencé (erreur induite). La barge garde son ancien devis : l’arrêt n’est que dans le message de Contargo. Confirmé : une cinquième offre à écarter (homonyme hors liste, 2e devis qui arrive jeudi à 16 h, ou rail au départ suivant).' },
    { etape: 3, etapeTitre: 'Commander au nouveau, puis annuler l’ancien', genre: 'question', texte: 'L’ordre dans lequel on envoie les courriels',
      rep: `Ordre ${OT_2} (annule et remplace le n° 1 ; les cases du conteneur sont reprises) : transporteur Rail Flandres-Artois, livraison à Rouvignies, arrivée au plus tard le `
        + `${quand(LIMITE.iso, LIMITE.h, { long: true })}. Courriel au rail avec cet ordre : le rail confirme par écrit. PUIS courriel à Contargo qui annule la commande ${COMMANDE} (ou le conteneur) : `
        + 'Contargo annule sans frais (force majeure).',
      note: 'Le moment est jugé sur l’heure des envois : annuler AVANT la confirmation du nouveau prestataire expose Decathlon à rester sans transport. Contargo répond pareil dans les deux cas : c’est le bilan qui dit que le moment n’était pas le bon. Une erreur ne se paie qu’une fois : qui a commandé la route et annulé Contargo ensuite perd les jalons « offre retenue » et « ordre au rail », garde le moment.' },
    { etape: 4, etapeTitre: 'Prévenir le quai', genre: 'question', texte: 'L’appel au chef de quai (tu poli)',
      rep: 'Se présenter, dire le conteneur concerné, annoncer que la barge est annulée (l’Escaut est fermé) et que le conteneur arrive vendredi 5 février vers 15 h, en camion depuis le terminal de Dourges. '
        + 'Au plus deux reprises (un contact sans dialogue appelé avant le quai compte comme une reprise).',
      note: 'Le chef de quai attendait le conteneur vendredi 9 h (créneau réservé par Claire avec la barge) : il déplace son créneau.' },
    { etape: 5, etapeTitre: 'La note', genre: 'question', texte: 'Comment la note est-elle calculée ?',
      rep: '7 jalons pondérés et 3 questions notées, total 20 : qualifier 3 (la barge ne tient plus la date) ; rechoisir 4 (RailCo hors liste 1,5 ; rail retenu 2,5) ; '
        + 'sécuriser 3 (ordre n° 2 au rail) ; annuler au bon moment 4 ; prévenir le quai 2 ; forme des courriels 1 ; questions de Claire 3 (1 chacune). '
        + 'Rien n’est vrai avant le geste : l’inaction vaut 0, et le comparateur n° 1, l’ordre n° 1 et le premier courriel ne sont pas notés.',
      note: 'Poids validés par Tristan le 15/10/2026. Confirmé : +0,5 si la cinquième offre est bien écartée (caché à l’élève).' },
  ],
};

export function corrigeEleve(base, uid) {
  let db = base || {};
  const ouvert = !!TIRAGE.tirage(db);
  if (!ouvert) db = { tirages: { [ID]: { graine: `${uid || 'anonyme'}|${ID}`, ...TIRAGE.tirer(`${uid || 'anonyme'}|${ID}`) } } };
  const J = jeuEleve(db);
  const ligne = (o) => `${o.lettre} — ${o.nom} : ${euros(o.prix)}, ${kg(o.co2)} de CO₂, arrivée ${quand(o.arrivee.iso, o.arrivee.h)}`
    + ` · liste : ${o.referencee ? 'oui' : 'NON'} · tient la date après l’imprévu : ${o.tient ? 'oui' : 'NON'}`;
  const items = [
    { genre: 'fait', texte: 'Son conteneur (sur l’avis)', rep: `${J.conteneur} · scellé ${J.scelle} · poids brut ${kg(J.poids)} · référence ${J.reference}` },
    { genre: 'fait', texte: 'Ses offres, dans l’ordre de ses devis (A, B, C, D…)', rep: J.offres.filter((o) => !o.ecarte).map(ligne).join(' | ') },
    { genre: 'fait', texte: 'La bonne réponse après l’imprévu', rep: `${J.bonne.nom} (${kg(J.bonne.co2)} de CO₂, ${euros(J.bonne.prix)})` },
    { genre: 'fait', texte: 'À écrire dans l’ordre n° 2 (rail)', rep: `transporteur Rail Flandres-Artois · livraison Decathlon Rouvignies · arrivée au plus tard le ${quand(LIMITE.iso, LIMITE.h, { long: true })}` },
  ];
  J.offres.filter((o) => o.ecarte).forEach((o) => items.push({ genre: 'fait', bonus: true, texte: 'Offre en plus (confirmé)',
    rep: `${ligne(o)} → à écarter : colonne « ${o.ecarte === 'date' ? 'Tient la date ?' : 'Dans la liste référencée ?'} » = non` }));
  if (!ouvert) return { texte: 'Cet élève n’a pas encore ouvert la séance : voici le tirage qu’il recevra en niveau standard (un confirmé reçoit en plus une cinquième offre).', items };
  return { texte: '', items };
}
