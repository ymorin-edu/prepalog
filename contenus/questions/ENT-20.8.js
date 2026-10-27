// Les questions d'ENT-20.8 — Leroy Merlin (1re, évaluation C2.1, copie rendue). Décidées par Claude (délégation de Tristan du 26/10/2026).
// « Avant de commencer » NOTÉ (`part: 3` sur 20), sans aide : trois questions tirées (2 de préparation, 1 de droit). Une réflexion au fil, non notée.
import { apresMail } from '../../core/declencheurs.js';
import { BANQUE_CLIENTS, OUVERTURE_CLIENTS, PERSONNES, MAIL_NADIA } from '../leroy-merlin.js';

export const QUESTIONS = {
  id: 'leroy-merlin-evaluation-clients',
  personnes: PERSONNES,
  ouverture: OUVERTURE_CLIENTS({ part: 3, situation: 'Bonjour ! Avant de commencer, lis « La plateforme » et « Les règles » à gauche, et réponds à mes questions, sans aide.' }),
  liste: [
    ...BANQUE_CLIENTS,
    { id: 'apres', type: 'fil', de: 'nadia', reflexion: true, quand: apresMail({ a: MAIL_NADIA }),
      enonce: 'Qu’est-ce qui t’a paru le plus difficile ?',
      choix: [{ v: 'type', lib: 'Reconnaître un client interne ou externe' }, { v: 'poids', lib: 'Peser toute la commande' }, { v: 'date', lib: 'Compter les jours de livraison' },
        { v: 'taux', lib: 'Calculer le taux de service' }],
      retour: 'Merci : on en reparle ensemble à la prochaine séance.' },
  ],
};
