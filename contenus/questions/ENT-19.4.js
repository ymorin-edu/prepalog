// Les questions d'ENT-19.4 — Amazon (CAP, entraînement). Décidées par Claude (délégation de Tristan du 27/10/2026). 3 notées au fil (part 4) et une
// réflexion. « Avant de commencer » : non noté (banque de `contenus/amazon.js`).
import { apresFiche, apresMail } from '../../core/declencheurs.js';
import { BANQUE, OUVERTURE, PERSONNES, MAIL_KARIMA } from '../amazon.js';

export const QUESTIONS = {
  id: 'amazon-bac-mardi',
  part: 4,
  personnes: PERSONNES,
  ouverture: OUVERTURE(),
  liste: [
    ...BANQUE,
    { id: 'abime', type: 'fil', de: 'karima', groupe: 'Ranger mon bac', quand: apresFiche('f194-ranger'),
      enonce: 'Pourquoi ne pas ranger un article à la boîte écrasée ?',
      choix: [{ v: 'client', lib: 'Le client recevrait un article abîmé : Théo décide ce qu’on en fait' }, { v: 'place', lib: 'Il prend trop de place' }, { v: 'rien', lib: 'On peut le ranger, ce n’est pas grave' }],
      juste: 'client', retour: 'Un article abîmé rangé, c’est un client mécontent plus tard. Tu le signales, tu ne le jettes pas.' },
    { id: 'plusieurs', type: 'fil', de: 'karima', groupe: 'L’inventaire', quand: apresFiche('f194-inventaire'),
      enonce: 'Pourquoi les gourdes vertes sont-elles dans trois cases différentes ?',
      choix: [{ v: 'aleatoire', lib: 'Chacune a été rangée dans une case libre : c’est le stockage aléatoire' }, { v: 'erreur', lib: 'C’est une erreur de rangement' }, { v: 'couleur', lib: 'On range par couleur' }],
      juste: 'aleatoire', retour: 'Le système sait où est chacune : c’est pour ça que le scan de la case compte tant.' },
    { id: 'ecart', type: 'fil', de: 'karima', groupe: 'L’inventaire', quand: apresFiche('f194-inventaire'),
      enonce: 'Le système dit 7, tu en comptes 6. Que fais-tu de ton compte ?',
      choix: [{ v: 'vrai', lib: 'Je donne ce que j’ai vraiment compté et je signale l’écart' }, { v: 'systeme', lib: 'J’écris 7, comme le système' }, { v: 'rien', lib: 'Je ne dis rien' }],
      juste: 'vrai', retour: 'L’inventaire sert à trouver les écarts : on donne toujours ce qu’on a vu.' },
    { id: 'pourquoi-inventaire', type: 'fil', de: 'karima', reflexion: true, quand: apresMail({ a: MAIL_KARIMA }),
      enonce: 'Si le système croit qu’il y a 7 gourdes alors qu’il y en a 6, que peut-il arriver ?',
      choix: [{ v: 'client', lib: 'Un client commande la 7e : on ne la trouvera pas, il sera livré en retard' }, { v: 'rien', lib: 'Rien' }, { v: 'gratuit', lib: 'La gourde devient gratuite' }],
      retour: 'Un stock faux, c’est une commande qu’on ne peut pas préparer.' },
  ],
};
