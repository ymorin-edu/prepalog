// Les questions d'ENT-7.4 — Decathlon, évaluation « un conteneur pour Dourges » (brief `docs/briefs/ENT-7.4-decathlon-evaluation-dourges.md`
// §4 bis et §4 ter, choix de Tristan du 15/10/2026). Modifier ce fichier suffit : voir « Modifier les questions d'une séance » dans
// `activites/FICHE-SEANCE.md`. Personnes CONSTRUITES (Claire Vasseur, Yanis Haddad).
//
// ÉVALUATION : AUCUNE question au fil (le moteur les rendrait « Merci, je note » ; rien à déclarer). Seul l'écran « Avant de commencer » est NOTÉ
// (`part: 3`) : 10 questions clés (6 de préparation, 4 de droit), l'élève en reçoit 3 (1 de préparation, 2 de droit) tirées dans sa base. Aucune aide,
// aucun mot cliquable, « Je ne sais pas » ajouté par le moteur ; juste +1, « Je ne sais pas » 0, fausse −1 ÷ (nombre de mauvaises réponses), plancher 0.
// DOCUMENTS À GAUCHE (décision de Tristan, 15/10/2026) : le cahier des charges pour la préparation ; pour le droit, les mêmes textes qu'en 7.3 (L1431-3, art. 1366, art. 1218), lisibles
// pendant les questions : l'évaluation vérifie qu'on comprend un texte, pas qu'on l'a appris par cœur (le brief écartait toute aide ; elle reste écartée pour la méthode).
// Les 10 reprennent les questions ★ de 7.1 à 7.3, réécrites pour Dourges.
//
// ÉCART au brief (dit à Tristan à la livraison) : `k-d1`. Le brief demandait « Qui doit informer qui du CO₂ ? — Le prestataire informe Decathlon ».
// Or le trajet part d'Anvers : le 3e alinéa de l'article L1431-3 du Code des transports renvoie à plus tard les transports qui partent de l'étranger
// (lu sur Légifrance le 13/10/2026, cf. ENT-7.1 et la question d3 d'ENT-7.3). La réponse du brief aurait contredit ce qu'ENT-7.1 et 7.3 enseignent :
// la question est donc celle d'ENT-7.3 (« doit-il te donner le CO₂ ? »), adaptée à Dourges.
// Les articles 1218 (force majeure) et 1366 (écrit électronique) du Code civil : RELUS mot à mot sur Légifrance le 15/10/2026 (comme l'article 1231-1). Ils restent lisibles à gauche pendant « Avant de commencer » (décision de Tristan, option B).

import { EQUIPE } from '../decathlon.js';
import { ID } from '../decathlon-ent74-donnees.js';

const q = (id, rubrique, enonce, choix, juste, retour, doc = 'cahier') => ({ id, type: 'ouverture', de: 'claire', doc, rubrique, cle: true, enonce, choix, juste, retour });

export const QUESTIONS = {
  id: ID,
  part: 3,
  personnes: { claire: EQUIPE.claire, yanis: EQUIPE.yanis },
  ouverture: { id: 'avant-de-commencer', de: 'claire', part: 3, titre: 'Avant de commencer', continuer: 'voir l’accueil',
    situation: 'Bonjour ! Je suis en déplacement toute la semaine : tu t’occupes seul(e) d’un conteneur. Avant de commencer, réponds à mes questions, sans aide.',
    documents: ['cahier', 'droit', 'ecrit', 'forcemajeure'],   // le droit reste lisible à gauche (décision de Tristan, 15/10/2026) : on teste la compréhension, pas la mémoire
    tirage: { preparation: 1, droit: 2 },
    questions: ['k-p1', 'k-p2', 'k-p3', 'k-p4', 'k-p5', 'k-p6', 'k-d1', 'k-d2', 'k-d3', 'k-d4'] },
  liste: [
    // ── préparation (6 : l'élève en reçoit 1)
    q('k-p1', 'preparation', 'Ton conteneur est un « 40’ HC ». C’est…',
      [{ v: 'long', lib: 'une boîte de 12 m de long, plus haute qu’un conteneur standard' }, { v: 'court', lib: 'une boîte de 6 m de long, de hauteur standard' },
        { v: 'froid', lib: 'une boîte de 12 m de long, réfrigérée' }], 'long',
      'Un 40 pieds high cube mesure environ 12 m de long et 2,9 m de haut, contre 2,6 m pour un conteneur standard.'),
    q('k-p2', 'preparation', 'Ton conteneur est dédouané à Anvers. Pour aller à Dourges…',
      [{ v: 'libre', lib: 'il circule librement, sans nouveau passage en douane' }, { v: 'douane', lib: 'il doit repasser en douane à la frontière française' },
        { v: 'pese', lib: 'il doit être pesé à nouveau à la frontière' }], 'libre',
      'Dédouané dans l’Union européenne, il circule librement d’un pays de l’Union à l’autre : la Belgique et la France en font partie.'),
    q('k-p3', 'preparation', 'Une liste de prestataires référencés, c’est…',
      [{ v: 'verifie', lib: 'la liste des transporteurs avec qui l’entreprise a le droit de travailler, après vérification' }, { v: 'prix', lib: 'la liste des transporteurs les moins chers' },
        { v: 'tous', lib: 'la liste de tous les transporteurs qui existent' }], 'verifie',
      'Un prestataire référencé a été vérifié avant (contrat, assurance, sécurité) : un absent de la liste ne reçoit pas de commande, même moins cher.'),
    q('k-p4', 'preparation', 'Un ordre de transport, c’est…',
      [{ v: 'commande', lib: 'le document par lequel le donneur d’ordre commande le transport et donne ses instructions' }, { v: 'facture', lib: 'la facture du transporteur' },
        { v: 'douane', lib: 'le document de la douane qui autorise le transport' }], 'commande',
      'L’ordre de transport est établi par celui qui commande : il dit quoi transporter, où, quand, et à quelles conditions.'),
    q('k-p5', 'preparation', 'Le scellé de ton conteneur sert à…',
      [{ v: 'ferme', lib: 'prouver qu’il n’a pas été ouvert depuis son chargement' }, { v: 'poids', lib: 'indiquer son poids' },
        { v: 'trajet', lib: 'suivre son trajet par satellite' }], 'ferme',
      'Le scellé est un plomb numéroté posé sur les portes : s’il est intact et que son numéro est le bon, personne n’a ouvert le conteneur.'),
    q('k-p6', 'preparation', 'Une confirmation écrite d’un prestataire, c’est…',
      [{ v: 'engage', lib: 'un message où il s’engage à faire le transport demandé' }, { v: 'devis', lib: 'son devis' }, { v: 'facture', lib: 'sa facture' }], 'engage',
      'Le devis propose, la facture réclame : la confirmation dit « c’est entendu, nous le ferons ».'),
    // ── droit (4 : l'élève en reçoit 2)
    q('k-d1', 'droit', 'Le rail te confirme un transport qui part d’Anvers pour Dourges. D’après la loi, doit-il te donner le CO₂ de la prestation ?',
      [{ v: 'cahier', lib: 'Pas encore : la loi renvoie à plus tard les transports qui partent de l’étranger ; ici, c’est le cahier des charges de Decathlon qui l’exige.' },
        { v: 'loi', lib: 'Oui : la loi l’y oblige pour tout transport.' }, { v: 'demande', lib: 'Non, seulement s’il en reçoit la demande.' }], 'cahier',
      'Le Code des transports (L1431-3) oblige à informer du CO₂, mais renvoie à plus tard les transports qui partent ou arrivent hors de France. Anvers est en Belgique : c’est Decathlon qui exige le chiffre.', 'droit'),
    q('k-d2', 'droit', 'Le prestataire dit n’avoir pas reçu ton ordre. Ton courriel peut-il servir de preuve ?',
      [{ v: 'oui', lib: 'Oui, comme un écrit papier, si l’on sait qu’il vient de toi et qu’il n’a pas été modifié.' }, { v: 'recommande', lib: 'Non, seulement un recommandé papier.' },
        { v: 'jamais', lib: 'Non, un courriel n’engage jamais.' }], 'oui',
      'Selon l’article 1366 du Code civil, l’écrit électronique a la même force probante que le papier si la personne est identifiée et si le texte est conservé sans modification.', 'ecrit'),
    q('k-d3', 'droit', 'L’arrêt de l’Escaut avait été annoncé un mois avant ta commande. Le prestataire barge peut-il invoquer la force majeure ?',
      [{ v: 'non', lib: 'Non : l’événement pouvait être prévu.' }, { v: 'toujours', lib: 'Oui : un arrêt de navigation est toujours une force majeure.' },
        { v: 'ecrit', lib: 'Oui, s’il prévient par écrit.' }], 'non',
      'La force majeure (article 1218 du Code civil) suppose un événement imprévisible à la conclusion du contrat. Un arrêt annoncé avant la commande pouvait être prévu.', 'forcemajeure'),
    q('k-d4', 'droit', 'Decathlon vise −20 % d’émissions du transport. C’est…',
      [{ v: 'engagement', lib: 'un engagement que Decathlon a pris lui-même ; la loi n’oblige pas à réduire, seulement à informer' },
        { v: 'loi', lib: 'une obligation fixée par la loi pour toutes les entreprises' }, { v: 'transporteur', lib: 'une obligation imposée par chaque transporteur à ses clients' }], 'engagement',
      'Réduire les émissions, c’est l’engagement que Decathlon a pris lui-même (engagements.decathlon.fr). La loi oblige à informer du CO₂, pas à le réduire.', 'droit'),
  ],
};
