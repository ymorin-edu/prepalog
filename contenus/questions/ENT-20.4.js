// Les questions d'ENT-20.4 — Leroy Merlin (1re, évaluation C1.2, copie rendue). Décidées par Claude (délégation de Tristan du 26/10/2026).
// « Avant de commencer » NOTÉ (`part: 3` sur 20), sans aide : trois questions tirées (2 de préparation, 1 de droit). Une réflexion au fil, non notée.
import { apresMail } from '../../core/declencheurs.js';
import { BANQUE_SECU, OUVERTURE_SECU, PERSONNES, MAIL_SAMIR } from '../leroy-merlin.js';

export const QUESTIONS = {
  id: 'leroy-merlin-evaluation-securite',
  personnes: PERSONNES,
  ouverture: OUVERTURE_SECU({ part: 3, situation: 'Bonjour ! Avant de commencer, lis « La plateforme » à gauche et réponds à mes questions, sans aide.' }),
  liste: [
    ...BANQUE_SECU,
    { id: 'apres', type: 'fil', de: 'samir', reflexion: true, quand: apresMail({ a: MAIL_SAMIR }),
      enonce: 'Qu’est-ce qui t’a paru le plus difficile ?',
      choix: [{ v: 'risque', lib: 'Trouver le risque' }, { v: 'mesure', lib: 'Choisir la meilleure mesure' }, { v: 'taux', lib: 'Calculer les taux' }, { v: 'quai', lib: 'Le protocole au quai' }],
      retour: 'Merci : on en reparle ensemble à la prochaine séance.' },
  ],
};
