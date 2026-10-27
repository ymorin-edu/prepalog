// Les questions d'ENT-19.7 — Amazon (CAP, guidage). Décidées par Claude (délégation de Tristan du 27/10/2026). 3 notées au fil (part 4) et une
// réflexion. « Avant de commencer » : non noté (banque de `contenus/amazon.js`).
import { apresFiche, apresMail } from '../../core/declencheurs.js';
import { BANQUE, OUVERTURE, PERSONNES, MAIL_KARIMA } from '../amazon.js';

export const QUESTIONS = {
  id: 'amazon-emballer',
  part: 4,
  personnes: PERSONNES,
  ouverture: OUVERTURE(),
  liste: [
    ...BANQUE,
    { id: 'petit', type: 'fil', de: 'karima', groupe: 'Les cartons', quand: apresFiche('f197-cartons'),
      enonce: 'Pourquoi le plus petit carton où l’article entre ?',
      choix: [{ v: 'moins', lib: 'Moins de carton, moins de papier, et plus de colis dans chaque camion' }, { v: 'joli', lib: 'C’est plus joli' }, { v: 'vite', lib: 'Il se ferme plus vite' }],
      juste: 'moins', retour: 'Du vide dans un carton, c’est de la place perdue dans le camion.' },
    { id: 'leger', type: 'fil', de: 'karima', groupe: 'La pesée', quand: apresFiche('f197-pesee'),
      enonce: 'Le colis 403-3 pèse beaucoup moins que prévu. Que s’est-il sans doute passé ?',
      choix: [{ v: 'manque', lib: 'Il manque l’article dans le carton' }, { v: 'balance', lib: 'La balance est cassée' }, { v: 'rien', lib: 'Rien, ça arrive' }],
      juste: 'manque', retour: 'La pesée attrape l’erreur avant que le client reçoive un carton vide.' },
    { id: 'caler', type: 'fil', de: 'karima', groupe: 'Les cartons', quand: apresFiche('f197-cartons'),
      enonce: 'Pourquoi caler la tasse, et pas le livre ?',
      choix: [{ v: 'fragile', lib: 'La tasse est en céramique : elle peut casser pendant le transport' }, { v: 'lourd', lib: 'La tasse est plus lourde' }, { v: 'prix', lib: 'La tasse coûte plus cher' }],
      juste: 'fragile', retour: 'On cale ce qui casse : verre, céramique. Pas plus de papier qu’il n’en faut.' },
    { id: 'tri', type: 'fil', de: 'karima', reflexion: true, quand: apresMail({ a: MAIL_KARIMA }),
      enonce: 'À ton avis, que devient le carton que le client reçoit ?',
      choix: [{ v: 'recycle', lib: 'Il le met au tri : le carton se recycle' }, { v: 'jete', lib: 'Il le jette avec les ordures' }, { v: 'garde', lib: 'Il le garde pour un déménagement' }],
      retour: 'Un carton bien choisi, c’est aussi moins de déchets chez le client.' },
  ],
};
