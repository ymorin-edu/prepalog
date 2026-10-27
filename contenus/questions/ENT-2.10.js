// Les questions d'ENT-2.10 — Cdiscount, évaluation (copie rendue). Décidées par Claude (délégation de Tristan du 26/10/2026).
// « Avant de commencer » NOTÉ (`part: 3` sur 20), sans aide : trois questions tirées (2 de préparation, 1 de droit) dans la banque commune des séances
// ENT-2.7 à 2.9 (`contenus/cdiscount-noel.js`) ; juste +1, « Je ne sais pas » 0, fausse −1 ÷ (nombre de mauvaises réponses), plancher 0.
// Une réflexion au fil, non notée : les 20 points sont déjà distribués.

import { apresMail } from '../../core/declencheurs.js';
import { BANQUE, OUVERTURE, PERSONNES, MAIL_NADIA } from '../cdiscount-noel.js';

export const QUESTIONS = {
  id: 'cdiscount-evaluation-noel',
  personnes: PERSONNES,
  ouverture: OUVERTURE({ part: 3, situation: 'Bonjour ! Avant de commencer, regarde les documents à gauche et réponds à mes questions, sans aide.' }),
  liste: [
    ...BANQUE,
    { id: 'en-premier', type: 'fil', de: 'nadia', reflexion: true, quand: apresMail({ a: MAIL_NADIA }),
      enonce: 'Des trois changements que tu proposes, lequel ferais-tu en premier ?',
      choix: [{ v: 'interim', lib: 'La demande d’intérimaires : l’agence a besoin de temps pour trouver du monde' },
        { v: 'implantation', lib: 'La réimplantation de la classe A' }, { v: 'lots', lib: 'Les lots pour la vague de ce matin' }],
      retour: 'Tout se défend : les lots se décident tout de suite, la réimplantation se fait une nuit, mais l’agence d’intérim demande souvent plusieurs jours.' },
  ],
};
