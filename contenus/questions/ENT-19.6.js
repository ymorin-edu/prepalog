// Les questions d'ENT-19.6 — Amazon (CAP, guidage). Décidées par Claude (délégation de Tristan du 27/10/2026). 3 notées au fil (part 4) et une
// réflexion. « Avant de commencer » : non noté (banque de `contenus/amazon.js`).
import { apresFiche, apresMail } from '../../core/declencheurs.js';
import { BANQUE, OUVERTURE, PERSONNES, MAIL_KARIMA } from '../amazon.js';

export const QUESTIONS = {
  id: 'amazon-prelever',
  part: 4,
  personnes: PERSONNES,
  ouverture: OUVERTURE(),
  liste: [
    ...BANQUE,
    { id: 'ressemble', type: 'fil', de: 'karima', groupe: 'Les lignes', quand: apresFiche('f196-lignes'),
      enonce: 'La coque est noire, la photo montre une coque transparente. Pourquoi ne pas la prendre quand même ?',
      choix: [{ v: 'client', lib: 'Le client recevrait un article qu’il n’a pas commandé' }, { v: 'pareil', lib: 'On peut la prendre : c’est presque pareil' }, { v: 'lourd', lib: 'Elle est trop lourde' }],
      juste: 'client', retour: 'Un mauvais article, c’est un retour, un client mécontent et un deuxième colis à envoyer.' },
    { id: 'vide', type: 'fil', de: 'karima', groupe: 'Les lignes', quand: apresFiche('f196-lignes'),
      enonce: 'Pourquoi signaler une case vide, au lieu de passer à la ligne suivante ?',
      choix: [{ v: 'stock', lib: 'Le système croit qu’il y a un article : il faut corriger le stock' }, { v: 'rien', lib: 'Ça ne sert à rien' }, { v: 'pause', lib: 'Pour avoir une pause' }],
      juste: 'stock', retour: 'Sinon, le système renverra d’autres préparateurs vers cette case vide.' },
    { id: 'photo', type: 'fil', de: 'karima', groupe: 'Les gestes', quand: apresFiche('f196-gestes'),
      enonce: 'À quoi sert la photo de l’article sur l’écran ?',
      choix: [{ v: 'verifier', lib: 'À vérifier que je prends le bon article' }, { v: 'joli', lib: 'À rendre l’écran plus joli' }, { v: 'prix', lib: 'À voir le prix' }],
      juste: 'verifier', retour: 'La photo et le scan : deux contrôles, pour ne pas se tromper d’article.' },
    { id: 'marche', type: 'fil', de: 'karima', reflexion: true, quand: apresMail({ a: MAIL_KARIMA }),
      enonce: 'Ici, l’armoire vient à toi. Dans un entrepôt sans robots, que ferais-tu en plus ?',
      choix: [{ v: 'marcher', lib: 'Je marcherais dans les allées pour aller chercher chaque article' }, { v: 'rien', lib: 'Rien de plus' }, { v: 'conduire', lib: 'Je conduirais les camions' }],
      retour: 'Dans un entrepôt classique, un préparateur peut marcher plusieurs kilomètres par jour.' },
  ],
};
