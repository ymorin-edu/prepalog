// Les questions d'ENT-19.3 — Amazon (CAP, guidage). Décidées par Claude (délégation de Tristan du 27/10/2026). 3 notées au fil (part 4) et une
// réflexion. « Avant de commencer » : non noté (banque de `contenus/amazon.js`).
import { apresFiche, apresGeste, apresMail } from '../../core/declencheurs.js';
import { BANQUE, OUVERTURE, PERSONNES, MAIL_KARIMA } from '../amazon.js';

export const QUESTIONS = {
  id: 'amazon-ranger',
  part: 4,
  personnes: PERSONNES,
  ouverture: OUVERTURE(),
  liste: [
    ...BANQUE,
    { id: 'haltere', type: 'fil', de: 'karima', groupe: 'Ranger mon bac', quand: apresGeste('fiche:f193-ranger:case-3'),
      enonce: 'Pourquoi l’haltère de 8 kg va-t-elle dans une case du bas ?',
      choix: [{ v: 'dos', lib: 'Pour ne pas porter lourd en hauteur : mon dos, et rien ne tombe' }, { v: 'joli', lib: 'Parce que c’est plus joli' }, { v: 'vite', lib: 'Pour aller plus vite' }],
      juste: 'dos', retour: 'Lourd en bas : moins d’effort pour toi et pour ton collègue au prélèvement, et moins de risque qu’il tombe.' },
    { id: 'coques', type: 'fil', de: 'karima', groupe: 'Ranger mon bac', quand: apresFiche('f193-ranger'),
      enonce: 'Pourquoi ne pas mettre la coque transparente avec une coque noire ?',
      choix: [{ v: 'erreur', lib: 'Au prélèvement, mon collègue pourrait prendre la mauvaise' }, { v: 'casse', lib: 'Elles se cassent' }, { v: 'place', lib: 'Elles prennent trop de place' }],
      juste: 'erreur', retour: 'Deux articles qui se ressemblent dans une case, c’est une erreur de commande qui attend.' },
    { id: 'scan', type: 'fil', de: 'karima', groupe: 'Les gestes', quand: apresFiche('f193-gestes'),
      enonce: 'Tu poses l’article, mais tu oublies de scanner la case. Que se passe-t-il ?',
      choix: [{ v: 'perdu', lib: 'Le système ne sait pas où est l’article : personne ne le retrouvera' }, { v: 'rien', lib: 'Rien du tout' }, { v: 'robot', lib: 'Le robot le scanne à ma place' }],
      juste: 'perdu', retour: 'C’est le scan de la case qui donne l’adresse : sans lui, l’article est perdu dans le stock.' },
    { id: 'pourquoi-aleatoire', type: 'fil', de: 'karima', reflexion: true, quand: apresMail({ a: MAIL_KARIMA }),
      enonce: 'À ton avis, pourquoi Amazon range un même article dans plusieurs cases ?',
      choix: [{ v: 'place', lib: 'Pour remplir chaque place libre, et que l’article soit dans plusieurs armoires à la fois' }, { v: 'oubli', lib: 'Parce qu’on oublie où on l’a mis' }, { v: 'hasard', lib: 'Pour faire comme on veut' }],
      retour: 'Aucune place ne reste vide, et plusieurs postes peuvent prélever le même article en même temps.' },
  ],
};
