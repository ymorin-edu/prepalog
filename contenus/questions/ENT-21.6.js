// Les questions d'ENT-21.6 — Lidl (2de, évaluation AGO-2.2 et AGO-1.3, copie rendue). Décidées par Claude (délégation de Tristan du 26/10/2026).
// « Avant de commencer » NOTÉ (`part: 3` sur 20), sans aide : trois questions tirées (2 de préparation, 1 de droit). Une réflexion au fil, non notée.
import { apresMail } from '../../core/declencheurs.js';
import { BANQUE_COMPTA, OUVERTURE_COMPTA, PERSONNES, MAIL_CLAIRE } from '../lidl.js';

export const QUESTIONS = {
  id: 'lidl-evaluation-facture',
  personnes: PERSONNES,
  ouverture: OUVERTURE_COMPTA({ part: 3, situation: 'Bonjour ! Avant de commencer, lis « La plateforme » à gauche et réponds à mes questions, sans aide.' }),
  liste: [
    ...BANQUE_COMPTA,
    { id: 'apres', type: 'fil', de: 'claire', reflexion: true, quand: apresMail({ a: MAIL_CLAIRE }),
      enonce: 'Qu’est-ce qui t’a paru le plus difficile ?',
      choix: [{ v: 'rapprochement', lib: 'Comparer les trois documents' }, { v: 'tva', lib: 'Le calcul de la TVA' }, { v: 'decade', lib: 'La date de paiement (la décade)' },
        { v: 'rib', lib: 'Le courriel du RIB' }],
      retour: 'Merci : on en reparle ensemble à la prochaine séance.' },
  ],
};
