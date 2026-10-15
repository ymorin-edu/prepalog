// Corrigé d'ENT-7.4 (Decathlon, évaluation « un conteneur pour Dourges »), montré dans l'onglet « Corrigés » de l'enseignant.
//
// Chaque élève a reçu SON tirage (`contenus/decathlon-ent74-donnees.js`) : son numéro de conteneur (chiffre de contrôle calculé), son scellé, son poids brut,
// sa référence, ses prix, l'offre référencée en retard (le rail ou la barge), l'offre hors liste, les deux instructions fausses de l'ordre, l'ordre de ses devis.
// `CORRIGE` donne ce qui est commun ; `corrigeEleve(base, uid)` rend le corrigé d'un élève, calculé depuis sa base (jamais recopié).

import { ID, TIRAGE, LIMITE, OT_NUM, BUDGET, jeuEleve } from '../decathlon-ent74-donnees.js';
import { quand, kg, euros } from '../decathlon.js';

export const CORRIGE = {
  code: 'ENT-7.4',
  titre: 'Decathlon — évaluation : un conteneur pour Dourges',
  trame: '(pas de trame : évaluation, tout se fait à l’écran ; le corrigé de chaque élève est dans cet onglet)',
  items: [
    { etape: 1, etapeTitre: 'Choisir (10 points)', genre: 'tableau', texte: 'Le comparateur : le tri attendu, le même pour tous à l’ordre des lignes près',
      entetes: ['Offre', 'Dans la liste ?', 'Tient la date ?', 'Je retiens'],
      reponses: [['Routiers du Hainaut (route)', 'oui', 'oui (mar. 09/03 à 10 h)', 'non : la moins chère, mais la plus émettrice'],
        ['Contargo (barge)', 'oui', 'selon le tirage : NON si elle arrive vendredi 12/03', 'OUI si le train est en retard'],
        ['Rail Flandres-Artois (rail + camion)', 'oui', 'selon le tirage : NON si le train du 08/03 est supprimé', 'OUI si la barge est en retard'],
        ['Hors liste (E-Flux, Bateliers ou RailCo)', 'NON', 'oui', 'non : moins chère et moins émettrice, mais jamais référencée']],
      note: `Besoin : arrivée au plus tard le ${quand(LIMITE.iso, LIMITE.h, { long: true })}, budget ${euros(BUDGET)}, critère CO₂. Décision : la moins émettrice des référencées à l'heure, calculée : le rail OU la barge selon le tirage. `
        + 'Justification : « la date d’abord, puis le CO₂ ». Pièges : la route (moins chère), la réponse du voisin (son tirage est différent), l’habitude de 7.1 (la barge).' },
    { etape: 2, etapeTitre: 'Transmettre (7 points)', genre: 'question', texte: 'L’ordre de transport, le courriel, l’appel au quai',
      rep: `Ordre ${OT_NUM} : n° de conteneur, scellé, poids et type recopiés de l'avis (2) ; transporteur = celui que l'élève a retenu, enlèvement à Anvers, livraison à Dourges — Delta 3, arrivée `
        + `avant le ${quand(LIMITE.iso, LIMITE.h, { long: true })} (1) ; les trois instructions justes et aucune fausse (1). Courriel au prestataire retenu avec l'ordre en pièce jointe (1,5), vouvoiement (0,5). `
        + 'Appel au chef de quai de Dourges : bonnes références ET arrivée de l’offre commandée, du premier coup (1).',
      note: 'Une erreur ne se paie qu’une fois : l’ordre, le courriel et l’appel sont jugés sur l’offre que l’élève a retenue (ou commandée). Seul le jalon « décision » dit si le choix était le bon. '
        + 'Piège de l’ordre : Rouvignies en livraison (l’habitude de 7.1 à 7.3).' },
    { etape: 3, etapeTitre: 'Avant de commencer (3 points)', genre: 'question', texte: 'Trois questions clés tirées (1 de préparation, 2 de droit), sans aide',
      rep: 'Juste +1, « Je ne sais pas » 0, fausse −1 ÷ (nombre de mauvaises réponses), plancher 0. Le détail (justes, « Je ne sais pas », fausses) est lu dans le Suivi.',
      note: 'La question sur l’information CO₂ (k-d1) est celle d’ENT-7.3 : le trajet part d’Anvers, la loi renvoie à plus tard les transports qui partent de l’étranger.' },
    { etape: 4, etapeTitre: 'La note', genre: 'question', texte: 'Comment la note est-elle calculée ?',
      rep: '14 jalons pondérés et 3 questions clés, total 20 : besoin 2, tri 3, comparaison 3, décision 2 ; ordre 4, courriel 2, appel 1 ; questions 3. Coefficient 3 (modifiable). '
        + 'Rien n’est vrai avant le geste : l’inaction vaut 0. Aucune correction n’est affichée.',
      note: 'Poids validés par Tristan le 13/10/2026 (décision 14), répartis en jalons le 15/10/2026.' },
  ],
};

export function corrigeEleve(base, uid) {
  let db = base || {};
  const ouvert = !!TIRAGE.tirage(db);
  if (!ouvert) db = { tirages: { [ID]: { graine: `${uid || 'anonyme'}|${ID}`, ...TIRAGE.tirer(`${uid || 'anonyme'}|${ID}`) } } };
  const J = jeuEleve(db);
  const ligne = (o) => `${o.lettre} — ${o.nom} : ${euros(o.prix)}, ${kg(o.co2)} de CO₂, arrivée ${quand(o.arrivee.iso, o.arrivee.h)}`
    + ` · liste : ${o.referencee ? 'oui' : 'NON'} · tient la date : ${o.tient ? 'oui' : 'NON'}`;
  const items = [
    { genre: 'fait', texte: 'Son conteneur (sur l’avis)', rep: `${J.conteneur} · scellé ${J.scelle} · poids brut ${kg(J.poids)} · référence ${J.reference} · ${J.contenu}` },
    { genre: 'fait', texte: 'Ses offres, dans l’ordre de ses devis (A, B, C, D)', rep: J.offres.map(ligne).join(' | ') },
    { genre: 'fait', texte: 'L’offre référencée en retard (son tirage)', rep: `${J.enRetard.nom}, arrivée ${quand(J.enRetard.arrivee.iso, J.enRetard.arrivee.h)}` },
    { genre: 'fait', texte: 'La bonne réponse', rep: `${J.bonne.nom} (${kg(J.bonne.co2)} de CO₂, ${euros(J.bonne.prix)})` },
    { genre: 'fait', texte: 'Ses deux instructions fausses (à ne pas cocher)', rep: J.instructions.filter((x) => !x.juste).map((x) => x.lib).join(' | ') },
  ];
  if (!ouvert) return { texte: 'Cet élève n’a pas encore ouvert la séance : voici le tirage qu’il recevra.', items };
  return { texte: '', items };
}
