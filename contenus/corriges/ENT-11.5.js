// Corrigé d'ENT-11.5 (Mondial Relay, évaluation « la tournée Sud et le colis bloqué »), montré dans l'onglet « Corrigés » de l'enseignant SEUL (règle :
// l'outil est formatif, l'évaluation se passe en classe, sous surveillance, sur un jeu neuf).
//
// Chaque élève a reçu SON tirage (`contenus/mondial-relay-ent115-donnees.js`, brief §6 bis) : les heures d'ouverture de ses cinq Points Relais et la
// cause du blocage de son colis. `CORRIGE` donne ce qui est commun (la méthode, le barème) ; `corrigeEleve(base, uid)` rend le corrigé d'un élève,
// calculé depuis sa graine (jamais recopié). Un élève qui n'a pas encore ouvert la séance : son tirage se calcule quand même (graine = son identifiant).

import { graineDeBase } from '../../core/tirage.js';
import { jeuDe, journee, ordresJustes, ordreDe, reportDe, tourneeFaite, libelleFenetre, communeDe, hhmm, hDit, LIEUX, JOUR, CAUSES, COLIS,
  evenementsSuivi } from '../mondial-relay-ent115-donnees.js';

const DIT = {
  ouvert: ['écarté au tri : l’emballage était ouvert', 'reste à l’agence, dans la zone des colis à contrôler'],
  etiquette: ['écarté au tri : l’étiquette n’a pas pu être lue', 'reste à l’agence en attendant une nouvelle étiquette'],
  ferme: ['présenté jeudi au Point Relais de Bar-sur-Seine, fermé : le colis est revenu à l’agence', 'représenté à la prochaine tournée, mardi 22/12'],
};
const min = (m) => `${Math.round(m)} min`;

export const CORRIGE = {
  code: 'ENT-11.5',
  titre: 'Mondial Relay — évaluation : la tournée Sud et le colis bloqué',
  trame: '(pas de trame : évaluation à l’écran, sous surveillance)',
  items: [
    { etape: 1, etapeTitre: 'La tournée Sud', genre: 'question', texte: 'La méthode (les horaires de chaque élève : choisir l’élève ci-dessus)',
      rep: `Pour chaque Point Relais, lire l’ouverture et la fermeture. Le camion part à ${hDit(JOUR.depart)}, roule à ${JOUR.vitesse} km/h et s’arrête ${JOUR.service} min `
        + `par commerce : l’heure d’arrivée = départ + trajet cumulé + arrêts déjà faits + attentes déjà subies. Arrivé avant l’ouverture, on attend ; après la fermeture, `
        + `le colis n’est pas remis. Un commerce qui ferme tôt passe d’abord ; un commerce qui n’ouvre que tard passe plus tard ; le retour doit rester avant ${hDit(JOUR.limite)}. `
        + 'L’ordre « naturel » du nord au sud (Saint-Julien, Bréviandes, Bar-sur-Seine, Chaource, Les Riceys) n’est jamais juste.',
      note: 'Les trois résultats à reporter : temps de conduite (km ÷ 40 × 60), attente (somme des attentes devant les commerces), durée de la journée (conduite + arrêts + attente). '
        + 'Ils sont jugés sur LA tournée de l’élève (une erreur ne se paie qu’une fois). La pause de 45 min n’est jamais due (la conduite reste sous 4 h 30).' },
    { etape: 2, etapeTitre: 'Le colis bloqué', genre: 'question', texte: 'La méthode (la cause de chaque élève : choisir l’élève ci-dessus)',
      rep: 'Lire le suivi événement par événement : le dernier événement avant « Pris en charge » dit ce qui a arrêté le colis (écarté au tri pour emballage ouvert, écarté au tri pour '
        + 'étiquette illisible, ou présenté à un Point Relais fermé puis ramené à l’agence). Répondre aux deux personnes qui ont écrit : la cause, la suite du colis (celle de cette cause), '
        + 'puis au Point Relais le délai de garde (5 jours), à l’expéditrice l’indemnité (25 € au plus par colis si le colis était perdu ou abîmé, frais d’envoi non remboursés).',
      note: 'Question ouverte du brief (§11) : qui prévient le destinataire en cas de retard, l’expéditeur ou Mondial Relay par SMS ? Les courriels ne disent rien du destinataire. '
        + 'Les conditions de vente reprises ne parlent pas du RETARD : la ligne d’indemnité dit « si le colis était perdu ou abîmé ».' },
    { etape: 3, etapeTitre: 'La note', genre: 'question', texte: 'Comment la note est-elle calculée ?',
      rep: '6 jalons pondérés et 4 points d’« Avant de commencer », total 20 : tournée 9 (les cinq Points Relais livrés ouverts 5, conduite et retour 2, heures reportées 2), '
        + 'colis 6 (cause trouvée 3, bonnes personnes prévenues sans rien de faux 3), forme 1 (formule d’appel et politesse), questions 4 (juste +1, « Je ne sais pas » 0, '
        + 'fausse −1 ÷ nombre de mauvaises réponses, plancher 0). Rien n’est vrai avant d’avoir commencé : l’inaction vaut 0.',
      note: 'Poids choisis par Tristan le 26/10/2026 (cadrage S3). Le détail jalon par jalon est dans le Suivi.' },
  ],
};

export function corrigeEleve(base, uid) {
  const db = base || {};
  const ouvert = !!graineDeBase(db);
  const g = ouvert ? graineDeBase(db) : String(uid || 'anonyme');
  const J = jeuDe(g), F = J.fenetres;
  const juste = ordresJustes(J);
  const bj = journee(juste[0], F);
  const cause = CAUSES[J.cause], dit = DIT[cause.id];
  const items = [
    { genre: 'tableau', texte: 'Ses Points Relais et leurs heures d’ouverture (dans l’ordre du plan)', entetes: ['Point Relais', 'Commune', 'Ouverture ce matin'],
      reponses: LIEUX.map((l) => [l.commerce, l.commune, libelleFenetre(F[l.id])]) },
    { genre: 'tableau', texte: `Un ordre juste${juste.length > 1 ? ` (il y en a ${juste.length}, ils ne diffèrent que par l’échange de Saint-Julien et de Bréviandes)` : ' (le seul)'}`,
      entetes: ['Rang', 'Point Relais', 'Arrivée', 'Attente', 'Départ'],
      reponses: juste[0].map((id, k) => [String(k + 1), communeDe(id), hhmm(bj.arrivees[id]), bj.attentes[id] > 0 ? min(bj.attentes[id]) : '—', hhmm(bj.departs[id])]) },
    { genre: 'question', texte: 'Ses trois résultats à reporter (pour cet ordre)',
      rep: `Conduite ${min(bj.conduite)} (${bj.km.toFixed(1).replace('.', ',')} km) ; attente ${min(bj.attente)} ; durée de la journée ${min(bj.minutes)}, soit un retour à ${hhmm(bj.arrivee)} `
        + `(avant ${hDit(JOUR.limite)}).` },
  ];
  if (ouvert && tourneeFaite(db)) {
    const b = journee(ordreDe(db), F), R = reportDe(db);
    items.push({ genre: 'question', texte: 'Les résultats attendus d’après SA tournée (ce que juge la séance)',
      rep: `Ordre : ${ordreDe(db).map(communeDe).join(' → ')}. Conduite ${min(b.conduite)} (±1) ; attente ${min(b.attente)} (±2) ; durée ${min(b.minutes)} (±3). `
        + `Il a reporté : conduite ${R.conduite || '…'} ; attente ${R.attente || '…'} ; durée ${R.duree || '…'}. `
        + `${b.complete ? '' : 'Tournée incomplète. '}${b.creneauxRates.length ? `Fermé à l’arrivée : ${b.creneauxRates.map(communeDe).join(', ')}. ` : ''}${b.enRetard ? 'Retour après l’heure fixée.' : ''}` });
  }
  items.push({ genre: 'question', texte: `Son colis bloqué (${COLIS.numero})`,
    rep: `Cause : ${cause.court}. Le suivi dit : ${evenementsSuivi(cause).slice(2, -1).map((e) => `${e[2]} (${e[0]})`).join(' ; ')}. Au Point Relais et à l’expéditrice : ${dit[0]} ; il ${dit[1]}. `
      + 'Délai de garde annoncé au Point Relais : 5 jours. Indemnité annoncée à l’expéditrice : 25 € au plus par colis, frais d’envoi non remboursés.' });
  if (!ouvert) return { texte: 'Cet élève n’a pas encore ouvert la séance : voici le tirage qu’il recevra.', items };
  return { texte: '', items };
}
