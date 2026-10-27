// Les questions d'ENT-15.4 — Syngenta, évaluation (copie rendue). Décidées par Claude (délégation de Tristan du 26/10/2026).
// « Avant de commencer » NOTÉ (`part: 3` sur 20), sans aide : trois questions tirées (2 de préparation, 1 de droit) dans la banque commune des séances
// ENT-15.1 à 15.3 (`contenus/syngenta.js`). Une réflexion au fil, non notée.

import { apresMail } from '../../core/declencheurs.js';
import { BANQUE, OUVERTURE, PERSONNES, MAIL_KARIM } from '../syngenta.js';

export const QUESTIONS = {
  id: 'syngenta-evaluation',
  personnes: PERSONNES,
  ouverture: OUVERTURE({ part: 3, situation: 'Bonjour ! Avant de commencer, regarde les documents à gauche et réponds à mes questions, sans aide.' }),
  liste: [
    ...BANQUE,
    { id: 'attente-longue', type: 'fil', de: 'karim', reflexion: true, quand: apresMail({ a: MAIL_KARIM }),
      enonce: 'PAL-35 attend au quai depuis deux heures. Que faudrait-il prévoir ?',
      choix: [{ v: 'place', lib: 'Libérer une place en cellule 2 (expédier d’abord ses palettes les plus anciennes)' },
        { v: 'c4', lib: 'La mettre en cellule 4 en attendant' }, { v: 'quai', lib: 'La laisser au quai jusqu’à la semaine prochaine' }],
      retour: 'La zone d’attente dépanne, elle ne stocke pas : on libère une place dans la bonne cellule, en commençant par ce qui doit partir en premier.' },
  ],
};
