// Les questions d'ENT-18.5 — Airbus Helicopters, évaluation (copie rendue). Décidées par Claude (délégation de Tristan du 26/10/2026).
// « Avant de commencer » NOTÉ (`part: 3` sur 20), sans aide : trois questions tirées (2 de préparation, 1 de droit) dans la banque commune des séances
// ENT-18.1 à 18.4 (`contenus/airbus.js`). Une réflexion au fil, non notée.

import { apresMail } from '../../core/declencheurs.js';
import { BANQUE, OUVERTURE, PERSONNES, MAIL_NATHALIE } from '../airbus.js';

export const QUESTIONS = {
  id: 'airbus-evaluation',
  personnes: PERSONNES,
  ouverture: OUVERTURE({ part: 3, situation: 'Bonjour ! Avant de commencer, regarde les documents à gauche et réponds à mes questions, sans aide.' }),
  liste: [
    ...BANQUE,
    { id: 'priorite', type: 'fil', de: 'nathalie', reflexion: true, quand: apresMail({ a: MAIL_NATHALIE }),
      enonce: 'Quel colis faut-il confirmer en premier ce matin ?',
      choix: [{ v: 'aog', lib: 'Celui de l’hélicoptère au sol, à Chambéry' }, { v: 'batterie', lib: 'La batterie' }, { v: 'proche', lib: 'Le plus proche' }],
      retour: 'L’AOG d’abord : le coursier doit partir tout de suite, les autres colis ont un délai.' },
  ],
};
