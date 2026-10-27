// Les questions d'ENT-20.3 — Leroy Merlin (1re, erreur induite C1.2). Décidées par Claude (délégation de Tristan du 26/10/2026). 3 notées au fil
// (part 4), dont une d'éco-droit, et une réflexion. « Avant de commencer » : non noté.
import { apresFiche, apresMail } from '../../core/declencheurs.js';
import { BANQUE_SECU, OUVERTURE_SECU, PERSONNES, MAIL_SAMIR } from '../leroy-merlin.js';

export const QUESTIONS = {
  id: 'leroy-merlin-kevin',
  part: 4,
  personnes: PERSONNES,
  ouverture: OUVERTURE_SECU(),
  liste: [
    ...BANQUE_SECU,
    { id: 'pourquoi-relever', type: 'fil', de: 'samir', groupe: 'Vérifier', quand: apresFiche('f203-verifier'),
      enonce: 'À quoi sert un relevé des risques ?',
      choix: [{ v: 'agir', lib: 'À repérer les risques pour agir avant l’accident' }, { v: 'punir', lib: 'À trouver un coupable après un accident' }, { v: 'papier', lib: 'À remplir un papier pour l’inspection' }],
      juste: 'agir', retour: 'On repère, on agit : c’est la prévention. Le relevé nourrit le document unique de l’entreprise.' },
    { id: 'sable', type: 'fil', de: 'samir', groupe: 'Corriger', quand: apresFiche('f203-corriger'),
      enonce: 'Pour le sable au sol, pourquoi nettoyer vaut mieux que vérifier les chaussures ?',
      choix: [{ v: 'supprime', lib: 'Nettoyer supprime le danger pour tout le monde' }, { v: 'pareil', lib: 'C’est pareil' }, { v: 'vite', lib: 'C’est plus rapide' }],
      juste: 'supprime', retour: 'Supprimer le danger d’abord : les chaussures ne protègent qu’une personne, et mal.' },
    { id: 'droit-unique', type: 'fil', de: 'samir', groupe: 'La cause', quand: apresFiche('f203-cause'),
      enonce: 'Qui est responsable d’évaluer les risques de la plateforme et de les écrire dans le document unique ?',
      choix: [{ v: 'employeur', lib: 'L’employeur, avec l’aide des salariés' }, { v: 'kevin', lib: 'Kevin seul' }, { v: 'transporteur', lib: 'Le transporteur' }],
      juste: 'employeur', retour: 'L’employeur évalue les risques et tient le document unique ; les salariés l’aident en signalant ce qu’ils voient.' },
    { id: 'dire', type: 'fil', de: 'samir', reflexion: true, quand: apresMail({ a: MAIL_SAMIR }),
      enonce: 'Si tu trouves une erreur dans le travail d’un collègue, comment le lui dis-tu ?',
      choix: [{ v: 'calme', lib: 'Calmement, en lui montrant la règle' }, { v: 'chef', lib: 'Je le dis seulement au chef' }, { v: 'rien', lib: 'Je ne dis rien' }],
      retour: 'Montrer la règle, sans juger la personne : c’est comme ça qu’on progresse en équipe.' },
  ],
};
