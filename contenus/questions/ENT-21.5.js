// Les questions d'ENT-21.5 — Lidl (2de, évaluation OTM-C1.4, copie rendue). Décidées par Claude (délégation de Tristan du 26/10/2026).
// « Avant de commencer » NOTÉ (`part: 3` sur 20), sans aide : trois questions tirées (2 de préparation, 1 de droit). Une réflexion au fil, non notée.
import { apresMail } from '../../core/declencheurs.js';
import { BANQUE_TRANSPORT, OUVERTURE_TRANSPORT, PERSONNES, MAIL_MEHDI } from '../lidl.js';

export const QUESTIONS = {
  id: 'lidl-evaluation-transport',
  personnes: PERSONNES,
  ouverture: OUVERTURE_TRANSPORT({ part: 3, situation: 'Bonjour ! Avant de commencer, lis « La plateforme » à gauche et réponds à mes questions, sans aide.' }),
  liste: [
    ...BANQUE_TRANSPORT,
    { id: 'apres', type: 'fil', de: 'mehdi', reflexion: true, quand: apresMail({ a: MAIL_MEHDI }),
      enonce: 'Qu’est-ce qui t’a paru le plus difficile ?',
      choix: [{ v: 'zone', lib: 'Trouver la zone' }, { v: 'annexes', lib: 'Les prestations annexes (l’attente)' }, { v: 'pourcent', lib: 'Les pourcentages' },
        { v: 'revient', lib: 'Le coût de revient' }],
      retour: 'Merci : on en reparle ensemble à la prochaine séance.' },
  ],
};
