// Les questions d'ENT-13.12 — Stellantis (Terminale, évaluation C3.4, copie rendue). Décidées par Claude (délégation de Tristan du 26/10/2026).
// « Avant de commencer » NOTÉ (`part: 3` sur 20), sans aide : trois questions tirées (2 de préparation, 1 de droit). Une réflexion au fil, non notée.
import { apresMail } from '../../core/declencheurs.js';
import { BANQUE, OUVERTURE, PERSONNES, MAIL_KARIM } from '../stellantis-equipe.js';

export const QUESTIONS = {
  id: 'stellantis-evaluation-equipe',
  personnes: PERSONNES,
  ouverture: OUVERTURE({ part: 3, situation: 'Bonjour ! Avant de commencer, lis « Les postes » et « L’accueil » à gauche et réponds à mes questions, sans aide.' }),
  liste: [
    ...BANQUE,
    { id: 'ressenti', type: 'fil', de: 'karim', reflexion: true, quand: apresMail({ a: MAIL_KARIM }),
      enonce: 'Qu’est-ce qui t’a paru le plus difficile ?',
      choix: [{ v: 'postes', lib: 'Affecter les postes' }, { v: 'calcul', lib: 'Le calcul des kits' }, { v: 'alea', lib: 'L’imprévu' }],
      retour: 'Merci : on en reparle ensemble à la prochaine séance.' },
  ],
};
