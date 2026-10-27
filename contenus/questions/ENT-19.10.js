// Les questions d'ENT-19.10 — Amazon (CAP, évaluation, copie rendue). Décidées par Claude (délégation de Tristan du 27/10/2026).
// « Avant de commencer » NOTÉ (`part: 3` sur 20), sans aide : trois questions tirées dans la banque commune (`contenus/amazon.js`).
// Une réflexion au fil, non notée.
import { apresMail } from '../../core/declencheurs.js';
import { BANQUE, OUVERTURE, PERSONNES, MAIL_KARIMA } from '../amazon.js';

export const QUESTIONS = {
  id: 'amazon-evaluation-commandes',
  personnes: PERSONNES,
  ouverture: OUVERTURE({ part: 3, situation: 'Bonjour ! Avant de commencer, lis « Le centre de Brétigny » à gauche et réponds à mes questions, sans aide.' }),
  liste: [
    ...BANQUE,
    { id: 'apres', type: 'fil', de: 'karima', reflexion: true, quand: apresMail({ a: MAIL_KARIMA }),
      enonce: 'Après ces dix séances, quel poste préfères-tu ?',
      choix: [{ v: 'ranger', lib: 'Le rangement' }, { v: 'prelever', lib: 'Le prélèvement' }, { v: 'emballer', lib: 'L’emballage' }],
      retour: 'Merci ! Chaque poste compte : sans rangement juste, pas de prélèvement juste, et sans emballage soigné, pas de client content.' },
  ],
};
