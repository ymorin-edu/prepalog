// Les questions d'ENT-16.6 — Royal Canin, évaluation (copie rendue). Décidées par Claude (délégation de Tristan du 26/10/2026).
// « Avant de commencer » NOTÉ (`part: 3` sur 20), sans aide : trois questions tirées (2 de préparation, 1 de droit) dans la banque commune des séances
// ENT-16.1 à 16.5 (`contenus/royal-canin.js`). Une réflexion au fil, non notée.

import { apresMail } from '../../core/declencheurs.js';
import { BANQUE, OUVERTURE, PERSONNES, MAIL_SANDRINE } from '../royal-canin.js';

export const QUESTIONS = {
  id: 'royal-canin-evaluation',
  personnes: PERSONNES,
  ouverture: OUVERTURE({ part: 3, situation: 'Bonjour ! Avant de commencer, regarde les documents à gauche et réponds à mes questions, sans aide.' }),
  liste: [
    ...BANQUE,
    { id: 'priorite', type: 'fil', de: 'sandrine', reflexion: true, quand: apresMail({ a: MAIL_SANDRINE }),
      enonce: 'Dans ton compte rendu, qu’est-ce que je dois traiter en premier à la réunion ?',
      choix: [{ v: 'rupture', lib: 'La rupture la plus urgente : des clients risquent de ne pas être livrés' },
        { v: 'surstock', lib: 'Les surstocks' }, { v: 'zone', lib: 'La zone de picking' }],
      retour: 'Une rupture touche le client tout de suite ; un surstock coûte, mais il attend quelques jours.' },
  ],
};
