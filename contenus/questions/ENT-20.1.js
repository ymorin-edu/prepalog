// Les questions d'ENT-20.1 — Leroy Merlin (1re, guidage C1.2). Décidées par Claude (délégation de Tristan du 26/10/2026). 3 notées au fil (part 4),
// dont une d'éco-droit appliquée au cas, et une réflexion. « Avant de commencer » : non noté (banque de `contenus/leroy-merlin.js`).
import { apresFiche, apresMail } from '../../core/declencheurs.js';
import { BANQUE_SECU, OUVERTURE_SECU, PERSONNES, MAIL_SAMIR } from '../leroy-merlin.js';

export const QUESTIONS = {
  id: 'leroy-merlin-risques',
  part: 4,
  personnes: PERSONNES,
  ouverture: OUVERTURE_SECU(),
  liste: [
    ...BANQUE_SECU,
    { id: 'danger-risque', type: 'fil', de: 'samir', groupe: 'Les risques', quand: apresFiche('f201-risques'),
      enonce: 'Une palette de 800 kg en haut du rack, c’est…',
      choix: [{ v: 'danger', lib: 'un danger : elle devient un risque quand quelqu’un passe dessous' }, { v: 'accident', lib: 'un accident' }, { v: 'rien', lib: 'rien, tant qu’elle ne tombe pas' }],
      juste: 'danger', retour: 'Le danger est là ; le risque, c’est la personne exposée. On agit avant l’accident.' },
    { id: 'gilet', type: 'fil', de: 'samir', groupe: 'Les EPI', quand: apresFiche('f201-epi'),
      enonce: 'Pourquoi le gilet haute visibilité dans les allées ?',
      choix: [{ v: 'voir', lib: 'Pour que les caristes me voient de loin' }, { v: 'chaud', lib: 'Pour avoir chaud' }, { v: 'joli', lib: 'Pour l’uniforme' }],
      juste: 'voir', retour: 'Un cariste qui te voit tôt a le temps de freiner.' },
    { id: 'droit-epi', type: 'fil', de: 'samir', groupe: 'Les mesures', quand: apresFiche('f201-mesures'),
      enonce: 'L’entreprise peut-elle se contenter de donner des gants pour les cartons de carrelage de 32 kg ?',
      choix: [{ v: 'non', lib: 'Non : la loi demande d’abord de combattre le risque à la source (aide mécanique)' }, { v: 'oui', lib: 'Oui, les gants suffisent' },
        { v: 'salarie', lib: 'Oui, c’est au salarié de se débrouiller' }],
      juste: 'non', retour: 'L4121-2 : la protection collective passe avant l’EPI. Les gants protègent les mains, pas le dos.' },
    { id: 'zero', type: 'fil', de: 'samir', reflexion: true, quand: apresMail({ a: MAIL_SAMIR }),
      enonce: 'Le site vise « zéro accident ». Qu’est-ce qui compte le plus pour y arriver, d’après toi ?',
      choix: [{ v: 'tous', lib: 'Que chacun signale ce qu’il voit, tout de suite' }, { v: 'chef', lib: 'Que le chef surveille tout' }, { v: 'chance', lib: 'La chance' }],
      retour: 'Zéro accident, c’est l’affaire de tous : un sac au sol signalé, c’est une chute évitée.' },
  ],
};
