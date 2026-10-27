// Les questions d'ENT-23.4 — Yves Rocher (2de, guidage C2.1). Décidées par Claude (délégation de Tristan du 26/10/2026). Inès est CONSTRUITE.
// 3 questions notées au fil (part 4 sur 20) et une réflexion non notée. « Avant de commencer » : non noté, 3 questions tirées.
import { apresFiche } from '../../core/declencheurs.js';
import { BANQUE_BOUTIQUES, OUVERTURE_BOUTIQUES, PERSONNES } from '../yves-rocher.js';

export const QUESTIONS = {
  id: 'yves-rocher-reclamation',
  part: 4,
  personnes: PERSONNES,
  ouverture: OUVERTURE_BOUTIQUES(),
  liste: [
    ...BANQUE_BOUTIQUES,
    { id: 'client', type: 'fil', de: 'ines', groupe: 'Vérifier', quand: apresFiche('f234-abord'),
      enonce: 'Pour la plateforme, la boutique de Vannes est…',
      choix: [{ v: 'client', lib: 'un client : on répond à sa demande' }, { v: 'fournisseur', lib: 'un fournisseur' }, { v: 'concurrent', lib: 'un concurrent' }],
      juste: 'client', retour: 'La boutique est un client de la plateforme : sa demande compte.' },
    { id: 'photo', type: 'fil', de: 'ines', groupe: 'Décider', quand: apresFiche('f234-decider'),
      enonce: 'Pourquoi demander une photo des articles cassés ?',
      choix: [{ v: 'preuve', lib: 'C’est la preuve de la casse : on peut remplacer' }, { v: 'souvenir', lib: 'Pour garder un souvenir' }, { v: 'publier', lib: 'Pour la publier' }],
      juste: 'preuve', retour: 'Avec la preuve, on remplace sans discuter.' },
    { id: 'vous', type: 'fil', de: 'ines', groupe: 'Quand ?', quand: apresFiche('f234-quand'),
      enonce: 'Dans la réponse à la boutique, on écrit…',
      choix: [{ v: 'vous', lib: 'en vouvoyant, poliment' }, { v: 'tu', lib: 'en tutoyant, comme entre collègues' }, { v: 'sms', lib: 'en langage SMS' }],
      juste: 'vous', retour: 'Entre collègues on se tutoie ; à une boutique, on vouvoie.' },
    { id: 'colere', type: 'fil', de: 'ines', reflexion: true, quand: apresFiche('f234-quand'),
      enonce: 'Une responsable de boutique t’écrit en colère. Comment te sens-tu ?',
      choix: [{ v: 'calme', lib: 'Je reste calme et je vérifie' }, { v: 'stress', lib: 'Ça me stresse' }, { v: 'colere', lib: 'Ça m’énerve' }],
      retour: 'Merci. Vérifier d’abord aide à rester calme.' },
  ],
};
