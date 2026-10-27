// Les questions d'ENT-15.2 — Syngenta, « la cellule pleine » (entraînement). Décidées par Claude (délégation de Tristan du 26/10/2026).
// 3 questions notées au fil (part 4 sur 20) et une réflexion d'éco-droit (la pollution de l'eau). « Avant de commencer » : non noté (banque commune).

import { apresGeste, apresFiche, apresMail } from '../../core/declencheurs.js';
import { BANQUE, OUVERTURE, PERSONNES, MAIL_KARIM } from '../syngenta.js';

const F = 'rangement-152';

export const QUESTIONS = {
  id: 'syngenta-cellule-pleine',
  part: 4,
  personnes: PERSONNES,
  ouverture: OUVERTURE(),
  liste: [
    ...BANQUE,
    { id: 'sante', type: 'fil', de: 'karim', groupe: 'Le rangement', quand: apresGeste(`fiche:${F}:pal11`),
      enonce: 'FC-500 n’a pas la tête de mort. Pourquoi va-t-il quand même en cellule 2 ?',
      choix: [{ v: 'sgh08', lib: 'Il porte ◇ SGH08 (danger pour la santé), qui va en cellule 2' }, { v: 'sgh07', lib: 'À cause du point d’exclamation' },
        { v: 'erreur', lib: 'Il ne va pas en cellule 2' }],
      juste: 'sgh08', retour: 'Danger pour la santé et toxique vont ensemble en cellule 2 ; le point d’exclamation seul irait en cellule 4.' },
    { id: 'pas-ailleurs', type: 'fil', de: 'karim', groupe: 'Le rangement', quand: apresGeste(`fiche:${F}:pal17`),
      enonce: 'La cellule 4 a de la place. Pourquoi ne pas y mettre PAL-17 ?',
      choix: [{ v: 'regle', lib: 'Un inflammable n’y aurait ni la bonne rétention ni les protections contre le feu' },
        { v: 'loin', lib: 'La cellule 4 est trop loin' }, { v: 'possible', lib: 'On peut : c’est mieux que de la laisser au quai' }],
      juste: 'regle', retour: 'La zone d’attente est faite pour ça : la palette attend sa place, elle n’en prend pas une qui ne lui convient pas.' },
    { id: 'retention-courte', type: 'fil', de: 'karim', groupe: 'La rétention', quand: apresFiche(F),
      enonce: 'La rétention de la cellule 1 ne suffit plus. Que proposes-tu ?',
      choix: [{ v: 'stop', lib: 'Ne plus y ajouter de volume tant qu’on n’a pas libéré de la place ou agrandi la rétention, et prévenir Karim' },
        { v: 'rien', lib: 'Rien : il manque seulement 100 litres' }, { v: 'pleine', lib: 'Remplir quand même : une fuite, c’est rare' }],
      juste: 'stop', retour: 'Une règle de sécurité ne se respecte pas « à peu près » : on le signale et on règle le problème avant d’ajouter du produit.' },
    { id: 'nappe', type: 'fil', de: 'karim', reflexion: true, quand: apresMail({ a: MAIL_KARIM }),
      enonce: 'Pourquoi tant de précautions pour quelques litres de pesticide ?',
      choix: [{ v: 'eau', lib: 'Un pesticide qui s’infiltre peut polluer la nappe et l’eau potable pendant des années' },
        { v: 'prix', lib: 'Parce que le produit coûte cher' }, { v: 'rien', lib: 'C’est exagéré' }],
      retour: 'Près d’Aigues-Vives, un herbicide échappé d’une fuite a été retrouvé dans un captage d’eau potable en 1992 (Reporterre, 2020). La rétention protège l’eau de tous.' },
  ],
};
