// Les questions d'ENT-19.5 — Amazon (CAP, évaluation, copie rendue). Décidées par Claude (délégation de Tristan du 27/10/2026).
// « Avant de commencer » NOTÉ (`part: 3` sur 20), sans aide : trois questions tirées dans la banque commune d'ENT-19.1 à 19.4 (`contenus/amazon.js`).
// Une réflexion au fil, non notée.
import { apresMail } from '../../core/declencheurs.js';
import { BANQUE, OUVERTURE, PERSONNES, MAIL_KARIMA } from '../amazon.js';

export const QUESTIONS = {
  id: 'amazon-evaluation-stock',
  personnes: PERSONNES,
  ouverture: OUVERTURE({ part: 3, situation: 'Bonjour ! Avant de commencer, lis « Le centre de Brétigny » à gauche et réponds à mes questions, sans aide.' }),
  liste: [
    ...BANQUE,
    { id: 'apres', type: 'fil', de: 'karima', reflexion: true, quand: apresMail({ a: MAIL_KARIMA }),
      enonce: 'Qu’est-ce qui t’a paru le plus difficile aujourd’hui ?',
      choix: [{ v: 'regles', lib: 'Respecter les trois règles en même temps' }, { v: 'abime', lib: 'Voir l’article abîmé' }, { v: 'compte', lib: 'Compter dans trois cases' }, { v: 'securite', lib: 'Les situations de sécurité' }],
      retour: 'Merci : on en reparle ensemble à la prochaine séance.' },
  ],
};
