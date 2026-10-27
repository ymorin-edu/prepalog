// Les questions d'ENT-17.5 — La Redoute, évaluation (copie rendue). Décidées par Claude (délégation de Tristan du 26/10/2026).
// « Avant de commencer » NOTÉ (`part: 3` sur 20), sans aide : trois questions tirées (2 de préparation, 1 de droit) dans la banque commune des séances
// ENT-17.1 à 17.4 (`contenus/la-redoute.js`). Une réflexion au fil, non notée.

import { apresMail } from '../../core/declencheurs.js';
import { BANQUE, OUVERTURE, PERSONNES, MAIL_CLAIRE } from '../la-redoute.js';

export const QUESTIONS = {
  id: 'la-redoute-evaluation',
  personnes: PERSONNES,
  ouverture: OUVERTURE({ part: 3, situation: 'Bonjour ! Avant de commencer, regarde les documents à gauche et réponds à mes questions, sans aide.' }),
  liste: [
    ...BANQUE,
    { id: 'priorite', type: 'fil', de: 'claire', reflexion: true, quand: apresMail({ a: MAIL_CLAIRE }),
      enonce: 'Si tu ne devais garder qu’une amélioration pour le poste, laquelle ?',
      choix: [{ v: 'formats', lib: 'Choisir l’emballage à chaque commande' }, { v: 'reparer', lib: 'Réparer les petits défauts des retours' },
        { v: 'tailles', lib: 'Aider les clients à choisir leur taille, pour avoir moins de retours' }],
      retour: 'Les trois se défendent : réduire les retours à la source évite à la fois du transport, de l’emballage et du tri.' },
  ],
};
