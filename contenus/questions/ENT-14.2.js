// Les questions d'ENT-14.2 — Lactalis, « la règle du 15 février » (entraînement). Décidées par Claude (délégation de Tristan du 26/10/2026).
// 3 questions notées au fil (part 4 sur 20) et une réflexion. « Avant de commencer » : banque commune de `contenus/lactalis.js` (non notée).

import { apresGeste, apresFiche, apresMail } from '../../core/declencheurs.js';
import { BANQUE, OUVERTURE, PERSONNES, MAIL_QUALITE } from '../lactalis.js';

const F = 'releve-142';

export const QUESTIONS = {
  id: 'lactalis-regle-15-fevrier',
  part: 4,
  personnes: PERSONNES,
  ouverture: OUVERTURE(),
  liste: [
    ...BANQUE,
    { id: 'la-veille', type: 'fil', de: 'julien', groupe: 'L’amont : les lots', quand: apresGeste(`fiche:${F}:lots`),
      enonce: 'Le lot CR-170214-C : est-il visé par l’avis du 21 décembre ?',
      choix: [{ v: 'non', lib: 'Non : fabriqué le 14/02/2017, la veille du 15 février' }, { v: 'oui', lib: 'Oui : il est de février 2017' },
        { v: 'inconnu', lib: 'On ne peut pas savoir sans appeler l’usine' }],
      juste: 'non', retour: '170214 se lit 2017, février, le 14 : un jour avant la date de l’avis. Il reste vendable ; le bloquer retirerait des boîtes saines.' },
    { id: 'parti-en-entier', type: 'fil', de: 'julien', groupe: 'L’aval : les magasins', quand: apresGeste(`fiche:${F}:magasins`),
      enonce: 'Le lot CR-170622-B est parti en entier, à Laval et à Évron. Qui doit agir ?',
      choix: [{ v: 'magasins', lib: 'Ces deux magasins : ils retirent les boîtes de leurs rayons' }, { v: 'personne', lib: 'Personne : il n’en reste plus chez nous' },
        { v: 'usine', lib: 'L’usine seulement' }],
      juste: 'magasins', retour: 'Le stock vide ici ne veut pas dire que le danger a disparu : il est en rayon. C’est pour ça qu’on remonte l’aval jusqu’au magasin.' },
    { id: 'pourquoi-regle', type: 'fil', de: 'julien', groupe: 'L’amont : les lots', quand: apresFiche(F),
      enonce: 'Pourquoi l’avis du 21 décembre donne-t-il une règle de date plutôt qu’une nouvelle liste de lots ?',
      choix: [{ v: 'tout', lib: 'Le risque peut toucher toute la production depuis février : une règle n’oublie aucun lot' },
        { v: 'court', lib: 'Pour que l’avis soit plus court' }, { v: 'secret', lib: 'Pour ne pas révéler les numéros de lot' }],
      juste: 'tout', retour: 'Une liste peut être incomplète (c’est ce qui s’est passé entre le 2 et le 21 décembre) ; une règle couvre tout ce qui a été fabriqué depuis la date.' },
    { id: 'lundi', type: 'fil', de: 'julien', reflexion: true, quand: apresMail({ a: MAIL_QUALITE }),
      enonce: 'Un collègue propose : « Le stock est bloqué, on préviendra les magasins lundi, après le week-end. » Qu’en penses-tu ?',
      choix: [{ v: 'maintenant', lib: 'Non : les magasins vendent ce week-end, il faut les prévenir aujourd’hui' },
        { v: 'lundi', lib: 'Oui : le principal est bloqué' }, { v: 'mail', lib: 'On envoie un message, ils le liront lundi' }],
      retour: 'Chaque jour de vente, ce sont des boîtes qui partent chez des familles. Le retrait se fait tout de suite, jusqu’au rayon.' },
  ],
};
