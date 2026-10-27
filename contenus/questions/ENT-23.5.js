// Les questions d'ENT-23.5 — Yves Rocher (2de, entraînement C2.1 et C2.2). Décidées par Claude (délégation de Tristan du 26/10/2026). Inès est
// CONSTRUITE. 3 questions notées au fil (part 4 sur 20), dont une d'éco-droit appliquée au cas (la loi anti-gaspillage), et une réflexion non notée.
import { apresFiche } from '../../core/declencheurs.js';
import { BANQUE_BOUTIQUES, OUVERTURE_BOUTIQUES, PERSONNES } from '../yves-rocher.js';

export const QUESTIONS = {
  id: 'yves-rocher-black-friday',
  part: 4,
  personnes: PERSONNES,
  ouverture: OUVERTURE_BOUTIQUES(),
  liste: [
    ...BANQUE_BOUTIQUES,
    { id: 'limite', type: 'fil', de: 'ines', groupe: 'Les demandes', quand: apresFiche('f235-demandes'),
      enonce: 'Pourquoi une heure limite pour les demandes ?',
      choix: [{ v: 'camion', lib: 'Pour avoir le temps de préparer avant le départ du camion' }, { v: 'pause', lib: 'Pour la pause de l’équipe' },
        { v: 'rien', lib: 'Pour rien' }],
      juste: 'camion', retour: 'Après l’heure limite, la commande ne serait pas prête au départ du camion.' },
    { id: 'reliquat', type: 'fil', de: 'ines', groupe: 'Préparer', quand: apresFiche('f235-preparer'),
      enonce: 'Un reliquat, c’est…',
      choix: [{ v: 'reste', lib: 'ce qui reste à livrer plus tard d’une commande' }, { v: 'remise', lib: 'une remise sur le prix' }, { v: 'retour', lib: 'un article renvoyé' }],
      juste: 'reste', retour: 'Brest reçoit ce qu’il y a, le reliquat suit.' },
    { id: 'detruire', type: 'fil', de: 'ines', groupe: 'Les retours', quand: apresFiche('f235-retours'),
      enonce: 'Pourquoi la plateforme ne jette-t-elle pas les coffrets de l’an dernier ?',
      choix: [{ v: 'loi', lib: 'La loi anti-gaspillage interdit de détruire des invendus non alimentaires' }, { v: 'place', lib: 'Pour garder de la place' },
        { v: 'vendre', lib: 'Pour les vendre plus cher' }],
      juste: 'loi', retour: 'Depuis 2022, on donne, on réemploie ou on recycle.' },
    { id: 'pic', type: 'fil', de: 'ines', reflexion: true, quand: apresFiche('f235-retours'),
      enonce: 'Le jour du pic, que faudrait-il à l’équipe ?',
      choix: [{ v: 'monde', lib: 'Plus de monde (des intérimaires)' }, { v: 'heures', lib: 'Des heures en plus' }, { v: 'organiser', lib: 'Mieux s’organiser à l’avance' }],
      retour: 'Merci : on en parlera en classe.' },
  ],
};
