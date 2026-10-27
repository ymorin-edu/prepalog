// Les questions d'ENT-19.8 — Amazon (CAP, entraînement). Décidées par Claude (délégation de Tristan du 27/10/2026). 3 notées au fil (part 4) et
// une réflexion. « Avant de commencer » : non noté (banque de `contenus/amazon.js`).
import { apresFiche, apresMail } from '../../core/declencheurs.js';
import { BANQUE, OUVERTURE, PERSONNES, MAIL_KARIMA } from '../amazon.js';

export const QUESTIONS = {
  id: 'amazon-jeudi',
  part: 4,
  personnes: PERSONNES,
  ouverture: OUVERTURE(),
  liste: [
    ...BANQUE,
    { id: 'taille', type: 'fil', de: 'karima', groupe: 'Prélever', quand: apresFiche('f198-lignes'),
      enonce: 'L’écran demande un t-shirt M, la case n’a que des L. Que se passe-t-il si tu prends un L ?',
      choix: [{ v: 'retour', lib: 'Le client reçoit la mauvaise taille : il le renvoie, la commande est à refaire' }, { v: 'rien', lib: 'Rien, un L va à tout le monde' }, { v: 'merci', lib: 'Le client est content' }],
      juste: 'retour', retour: 'Une erreur de préparation coûte un retour, un nouvel envoi, et la confiance du client.' },
    { id: 'deux', type: 'fil', de: 'karima', groupe: 'Emballer', quand: apresFiche('f198-cartons'),
      enonce: 'La commande 512-3 a deux articles. Comment choisis-tu le carton ?',
      choix: [{ v: 'ensemble', lib: 'Les deux articles posés l’un sur l’autre doivent entrer dans le carton' }, { v: 'deux', lib: 'Un carton par article' }, { v: 'grand', lib: 'Toujours le plus grand' }],
      juste: 'ensemble', retour: 'Une commande, un colis : on pose les articles à plat, l’un sur l’autre.' },
    { id: 'lourd', type: 'fil', de: 'karima', groupe: 'La pesée', quand: apresFiche('f198-pesee'),
      enonce: 'Le colis 512-1 pèse beaucoup plus que prévu. Que s’est-il sans doute passé ?',
      choix: [{ v: 'trop', lib: 'Il y a un article de trop dans le carton' }, { v: 'eau', lib: 'Le carton a pris l’eau' }, { v: 'rien', lib: 'Rien, il part quand même' }],
      juste: 'trop', retour: 'Trop lourd ou trop léger : dans les deux cas, le colis sort de la ligne.' },
    { id: 'rythme', type: 'fil', de: 'karima', reflexion: true, quand: apresMail({ a: MAIL_KARIMA }),
      enonce: 'Qu’est-ce qui compte le plus pour toi au poste : aller vite ou ne pas se tromper ?',
      choix: [{ v: 'juste', lib: 'Ne pas me tromper : une erreur fait perdre plus de temps' }, { v: 'vite', lib: 'Aller vite' }, { v: 'deux', lib: 'Les deux, l’un après l’autre' }],
      retour: 'On apprend d’abord à faire juste ; la vitesse vient avec l’habitude.' },
  ],
};
