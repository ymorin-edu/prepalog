// Les questions d'ENT-14.4 — Lactalis, évaluation (copie rendue). Décidées par Claude (délégation de Tristan du 26/10/2026).
// « Avant de commencer » NOTÉ (`part: 3` sur 20), sans aide : trois questions tirées (2 de préparation, 1 de droit) dans la banque commune des séances
// ENT-14.1 à 14.3 (`contenus/lactalis.js`) ; juste +1, « Je ne sais pas » 0, fausse −1 ÷ (nombre de mauvaises réponses), plancher 0.
// Une réflexion au fil, non notée (« Merci, je note ») : les 20 points sont déjà distribués.

import { apresMail } from '../../core/declencheurs.js';
import { BANQUE, OUVERTURE, PERSONNES, MAIL_QUALITE } from '../lactalis.js';

export const QUESTIONS = {
  id: 'lactalis-evaluation',
  personnes: PERSONNES,
  ouverture: OUVERTURE({ part: 3, situation: 'Bonjour ! Avant de commencer, regarde les documents à gauche et réponds à mes questions, sans aide.' }),
  liste: [
    ...BANQUE,
    { id: 'en-premier', type: 'fil', de: 'julien', reflexion: true, quand: apresMail({ a: MAIL_QUALITE }),
      enonce: 'Tu n’as le temps de passer qu’un seul appel avant ta pause. Qui appelles-tu ?',
      choix: [{ v: 'matin', lib: 'Le magasin livré ce matin : ses boîtes sont peut-être déjà en rayon' }, { v: 'usine', lib: 'L’usine de Craon' },
        { v: 'tous', lib: 'Personne : le compte rendu suffit' }],
      retour: 'Les boîtes livrées après l’avis sont celles que personne ne surveille encore : c’est le premier magasin à prévenir.' },
  ],
};
