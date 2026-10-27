// Les questions d'ENT-19.9 — Amazon (CAP, guidage). Décidées par Claude (délégation de Tristan du 27/10/2026). 3 notées au fil (part 4) et une
// réflexion d'éco-droit sur un fait réel (la sanction de la CNIL, fin 2023). « Avant de commencer » : non noté.
import { apresFiche, apresMail } from '../../core/declencheurs.js';
import { BANQUE, OUVERTURE, PERSONNES, MAIL_KARIMA } from '../amazon.js';

export const QUESTIONS = {
  id: 'amazon-robots',
  part: 4,
  personnes: PERSONNES,
  ouverture: OUVERTURE(),
  liste: [
    ...BANQUE,
    { id: 'saisonnier', type: 'fil', de: 'karima', groupe: 'Faits et conséquences', quand: apresFiche('f199-liens'),
      enonce: 'Un saisonnier, c’est…',
      choix: [{ v: 'cdd', lib: 'un salarié embauché pour une période chargée, souvent en CDD ou en intérim' }, { v: 'robot', lib: 'un robot de plus' }, { v: 'client', lib: 'un client de Noël' }],
      juste: 'cdd', retour: 'Le pic de Noël dure quelques semaines : on embauche pour cette période.' },
    { id: 'moyenne', type: 'fil', de: 'karima', groupe: 'Les calculs', quand: apresFiche('f199-calculs'),
      enonce: 'Ta moyenne par site veut-elle dire que chaque site en recrute exactement autant ?',
      choix: [{ v: 'non', lib: 'Non : certains sites en recrutent plus, d’autres moins' }, { v: 'oui', lib: 'Oui, exactement autant' }],
      juste: 'non', retour: 'Une moyenne partage le total à parts égales ; la réalité, elle, varie d’un site à l’autre.' },
    { id: 'zone', type: 'fil', de: 'karima', groupe: 'Ce qui change', quand: apresFiche('f199-change'),
      enonce: 'Pourquoi la zone des robots est-elle fermée aux salariés ?',
      choix: [{ v: 'securite', lib: 'Pour qu’aucun robot ne heurte un salarié' }, { v: 'secret', lib: 'Pour garder un secret' }, { v: 'propre', lib: 'Pour qu’elle reste propre' }],
      juste: 'securite', retour: 'La sécurité d’abord : les robots roulent seuls, sans voir les personnes.' },
    { id: 'cnil', type: 'fil', de: 'karima', reflexion: true, quand: apresMail({ a: MAIL_KARIMA }),
      enonce: 'Fin 2023, la CNIL a sanctionné Amazon France Logistique (32 millions d’euros) pour un suivi trop poussé des salariés par leur scanner. Qu’en penses-tu ?',
      choix: [{ v: 'limite', lib: 'L’employeur peut contrôler le travail, mais pas surveiller chaque minute' }, { v: 'tout', lib: 'L’employeur a le droit de tout surveiller' },
        { v: 'rien', lib: 'L’employeur n’a le droit de rien contrôler' }],
      retour: 'La loi protège la vie privée des salariés : le contrôle doit rester proportionné. La CNIL veille aux données personnelles.' },
  ],
};
