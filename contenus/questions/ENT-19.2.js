// Les questions d'ENT-19.2 — Amazon (CAP, guidage). Décidées par Claude (délégation de Tristan du 27/10/2026). 3 notées au fil (part 4) et une
// réflexion (le droit : qui doit protéger la sécurité ?). « Avant de commencer » : non noté (banque de `contenus/amazon.js`).
import { apresFiche, apresGeste, apresMail } from '../../core/declencheurs.js';
import { BANQUE, OUVERTURE, PERSONNES, MAIL_KARIMA } from '../amazon.js';

export const QUESTIONS = {
  id: 'amazon-poste',
  part: 4,
  personnes: PERSONNES,
  ouverture: OUVERTURE(),
  liste: [
    ...BANQUE,
    { id: 'pourquoi-barriere', type: 'fil', de: 'karima', groupe: 'La sécurité', quand: apresFiche('f192-securite'),
      enonce: 'Pourquoi ne faut-il jamais passer la barrière des robots ?',
      choix: [{ v: 'heurte', lib: 'Un robot qui roule avec une armoire peut me heurter' }, { v: 'interdit', lib: 'Parce que c’est sale' }, { v: 'chef', lib: 'Pour ne pas déranger la chef' }],
      juste: 'heurte', retour: 'Les robots roulent seuls et portent jusqu’à des centaines de kilos : Théo fait d’abord arrêter les robots.' },
    { id: 'mission', type: 'fil', de: 'karima', groupe: 'L’écran du poste', quand: apresGeste('fiche:f192-ecran:mission'),
      enonce: 'Si ta mission change en cours de journée, où le vois-tu ?',
      choix: [{ v: 'ecran', lib: 'Sur l’écran de mon poste, et Karima me prévient' }, { v: 'collegue', lib: 'Je demande au hasard à un collègue' }, { v: 'devine', lib: 'Je devine' }],
      juste: 'ecran', retour: 'L’écran du poste dit ta mission : lis-le chaque fois que tu arrives.' },
    { id: 'pourquoi-rdv', type: 'fil', de: 'karima', groupe: 'Le planigramme', quand: apresFiche('f192-plani'),
      enonce: 'Pourquoi chaque camion a-t-il un rendez-vous ?',
      choix: [{ v: 'organiser', lib: 'Pour que le quai et l’équipe soient prêts à son arrivée' }, { v: 'joli', lib: 'Pour faire joli sur le tableau' }, { v: 'payer', lib: 'Pour payer le chauffeur' }],
      juste: 'organiser', retour: 'Sans rendez-vous, plusieurs camions arriveraient au même quai en même temps.' },
    { id: 'loi', type: 'fil', de: 'karima', reflexion: true, quand: apresMail({ a: MAIL_KARIMA }),
      enonce: 'D’après « La sécurité », qui doit faire attention à ta sécurité au travail ?',
      choix: [{ v: 'deux', lib: 'L’employeur, et moi aussi, pour moi et pour les autres' }, { v: 'patron', lib: 'Seulement l’employeur' }, { v: 'moi', lib: 'Seulement moi' }],
      retour: 'Les deux : l’employeur protège ses salariés, et chaque salarié fait attention à lui et aux autres (Code du travail).' },
  ],
};
