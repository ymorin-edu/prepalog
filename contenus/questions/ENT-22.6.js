// Les questions d'ENT-22.6 — Schneider Electric (CAP, évaluation, copie rendue). Décidées par Claude (délégation de Tristan du 26/10/2026).
// « Avant de commencer » NOTÉ (`part: 3` sur 20), sans aide : trois questions tirées dans la banque commune (`contenus/schneider.js`).
// Une réflexion au fil, non notée.
import { apresMail } from '../../core/declencheurs.js';
import { BANQUE, OUVERTURE, PERSONNES, MAIL_NADIA } from '../schneider.js';

export const QUESTIONS = {
  id: 'schneider-evaluation-reception',
  personnes: PERSONNES,
  ouverture: OUVERTURE({ part: 3, situation: 'Bonjour ! Avant de commencer, lis « Le centre d’Évreux » à gauche et réponds à mes questions, sans aide.' }),
  liste: [
    ...BANQUE,
    { id: 'apres', type: 'fil', de: 'nadia', reflexion: true, quand: apresMail({ a: MAIL_NADIA }),
      enonce: 'Qu’est-ce qui t’a paru le plus difficile aujourd’hui ?',
      choix: [{ v: 'precontrole', lib: 'Le pré-contrôle' }, { v: 'lignes', lib: 'Le contrôle ligne par ligne' }, { v: 'reserve', lib: 'Écrire la bonne réserve' }, { v: 'lourds', lib: 'Les colis lourds' }],
      retour: 'Merci : on en reparle ensemble à la prochaine séance.' },
  ],
};
