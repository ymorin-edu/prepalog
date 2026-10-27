// Les questions d'ENT-24.5 — Kuehne+Nagel (1re, évaluation, copie rendue). Décidées par Claude (délégation de Tristan du 26/10/2026).
// « Avant de commencer » NOTÉ (`part: 3` sur 20), sans aide : trois questions tirées dans la banque commune (`contenus/kuehne-nagel.js`).
// Une réflexion au fil, non notée.
import { apresMail } from '../../core/declencheurs.js';
import { BANQUE, OUVERTURE, PERSONNES, MAIL_SOPHIE } from '../kuehne-nagel.js';

export const QUESTIONS = {
  id: 'kuehne-nagel-evaluation',
  personnes: PERSONNES,
  ouverture: OUVERTURE({ part: 3, situation: 'Bonjour ! Avant de commencer, lis « Le hub de Roissy » à gauche et réponds à mes questions, sans aide.' }),
  liste: [
    ...BANQUE,
    { id: 'apres', type: 'fil', de: 'sophie', reflexion: true, quand: apresMail({ a: MAIL_SOPHIE }),
      enonce: 'Qu’est-ce qui t’a paru le plus difficile aujourd’hui ?',
      choix: [{ v: 'zones', lib: 'Les zones de température' }, { v: 'durees', lib: 'Les durées' }, { v: 'planning', lib: 'Le planning des quais' }, { v: 'reprise', lib: 'La reprise après les changements' }],
      retour: 'Merci : on en reparle ensemble à la prochaine séance.' },
  ],
};
