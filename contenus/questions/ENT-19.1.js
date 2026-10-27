// Les questions d'ENT-19.1 — Amazon (CAP, guidage). Décidées par Claude (délégation de Tristan du 27/10/2026). Karima et Théo sont CONSTRUITS.
// 3 questions notées au fil (part 4 sur 20) et une réflexion non notée. « Avant de commencer » : non noté, 3 questions tirées parmi 6 (banque
// commune de `contenus/amazon.js` : les notions du scénario, pas d'éco-droit à part au CAP).
import { apresFiche } from '../../core/declencheurs.js';
import { BANQUE, OUVERTURE, PERSONNES } from '../amazon.js';

export const QUESTIONS = {
  id: 'amazon-bienvenue',
  part: 4,
  personnes: PERSONNES,
  ouverture: OUVERTURE(),
  liste: [
    ...BANQUE,
    { id: 'case-vide', type: 'fil', de: 'karima', groupe: 'Qui fait quoi ?', quand: apresFiche('f191-qui'),
      enonce: 'L’écran te demande un article, mais la case est vide. Qui appelles-tu ?',
      choix: [{ v: 'theo', lib: 'Théo, le problem solver : j’appuie sur « Aide »' }, { v: 'ines', lib: 'Inès, à l’emballage' }, { v: 'client', lib: 'Le client' }],
      juste: 'theo', retour: 'Théo règle les problèmes : toi, tu signales et tu continues.' },
    { id: 'pesee', type: 'fil', de: 'karima', groupe: 'Le voyage d’un article', quand: apresFiche('f191-voyage'),
      enonce: 'Pourquoi le colis est-il pesé à la fin ?',
      choix: [{ v: 'verifier', lib: 'Pour vérifier qu’il ne manque rien et qu’il n’y a rien de trop' }, { v: 'prix', lib: 'Pour calculer le prix de l’article' },
        { v: 'rien', lib: 'Pour rien, c’est une habitude' }],
      juste: 'verifier', retour: 'Le système connaît le poids attendu : un colis trop léger ou trop lourd sort de la ligne.' },
    { id: 'change', type: 'fil', de: 'karima', groupe: 'Les robots', quand: apresFiche('f191-robots'),
      enonce: 'Avec les robots, qu’est-ce qui change pour toi ?',
      choix: [{ v: 'poste', lib: 'Je reste à mon poste : l’armoire vient à moi' }, { v: 'rien', lib: 'Je n’ai plus rien à faire' },
        { v: 'conduis', lib: 'Je conduis les robots' }],
      juste: 'poste', retour: 'Tu marches moins, mais tu fais souvent les mêmes gestes : attention à ton dos et à tes épaules.' },
    { id: 'pres', type: 'fil', de: 'karima', reflexion: true, quand: apresFiche('f191-robots'),
      enonce: 'Amazon livre en un jour. Pourquoi ses centres sont-ils près des grandes villes ?',
      choix: [{ v: 'clients', lib: 'Pour être près de beaucoup de clients, et livrer vite' }, { v: 'joli', lib: 'Parce que c’est plus joli' }, { v: 'hasard', lib: 'Par hasard' }],
      retour: 'Près des clients, le camion roule moins longtemps : la livraison est plus rapide.' },
  ],
};
