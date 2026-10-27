// Les questions d'ENT-20.6 — Leroy Merlin (1re, entraînement C2.1). Décidées par Claude (délégation de Tristan du 26/10/2026). 3 notées au fil (part 4),
// dont une d'éco-droit, et une réflexion. « Avant de commencer » : non noté.
import { apresFiche, apresMail } from '../../core/declencheurs.js';
import { BANQUE_CLIENTS, OUVERTURE_CLIENTS, PERSONNES, MAIL_NADIA } from '../leroy-merlin.js';

export const QUESTIONS = {
  id: 'leroy-merlin-samedi',
  part: 4,
  personnes: PERSONNES,
  ouverture: OUVERTURE_CLIENTS(),
  liste: [
    ...BANQUE_CLIENTS,
    { id: 'manque', type: 'fil', de: 'nadia', groupe: 'Les clients', quand: apresFiche('f206-types'),
      enonce: 'M. Rivière signale un sac de ciment manquant. Que fais-tu d’abord ?',
      choix: [{ v: 'verifier', lib: 'Je vérifie la commande et le bon de livraison signé, puis je propose une solution' }, { v: 'nier', lib: 'Je réponds que c’est impossible' },
        { v: 'renvoyer', lib: 'Je renvoie tout de suite dix sacs' }],
      juste: 'verifier', retour: 'Vérifier d’abord (les réserves sur le bon de livraison), puis répondre avec une solution précise.' },
    { id: 'dimanche', type: 'fil', de: 'nadia', groupe: 'Les commandes', quand: apresFiche('f206-commandes'),
      enonce: 'M. Hamon commande samedi un colis de 29,6 kg. Pourquoi est-il livré lundi et pas dimanche ?',
      choix: [{ v: 'dimanche', lib: 'On ne livre pas le dimanche : le jour suivant est le lundi' }, { v: 'lourd', lib: 'Parce que c’est un encombrant' }, { v: 'oubli', lib: 'Parce qu’on l’a oublié' }],
      juste: 'dimanche', retour: 'Et à 29,6 kg, c’est encore un colis : 400 g de plus, et il partait en trois jours.' },
    { id: 'droit-repos', type: 'fil', de: 'nadia', groupe: 'Le taux de service', quand: apresFiche('f206-service'),
      enonce: 'Pourquoi, en principe, ne livre-t-on pas le dimanche ?',
      choix: [{ v: 'repos', lib: 'La loi donne aux salariés un repos le dimanche, sauf dérogation' }, { v: 'route', lib: 'Les routes sont fermées' }, { v: 'clients', lib: 'Les clients ne sont pas chez eux' }],
      juste: 'repos', retour: 'Le Code du travail prévoit le repos hebdomadaire, donné en principe le dimanche (L3132-3).' },
    { id: 'promettre', type: 'fil', de: 'nadia', reflexion: true, quand: apresMail({ a: MAIL_NADIA }),
      enonce: 'Vaut-il mieux promettre une date rapide, ou une date sûre ?',
      choix: [{ v: 'sure', lib: 'Une date sûre : un client déçu revient moins' }, { v: 'rapide', lib: 'Une date rapide : le client sera content tout de suite' }],
      retour: 'Le taux de service mesure la promesse tenue, pas la vitesse promise.' },
  ],
};
