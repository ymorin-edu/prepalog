// Les questions d'ENT-20.7 — Leroy Merlin (1re, erreur induite C2.1). Décidées par Claude (délégation de Tristan du 26/10/2026). 3 notées au fil
// (part 4), dont une d'éco-droit, et une réflexion. « Avant de commencer » : non noté.
import { apresFiche, apresMail } from '../../core/declencheurs.js';
import { BANQUE_CLIENTS, OUVERTURE_CLIENTS, PERSONNES, MAIL_NADIA } from '../leroy-merlin.js';

export const QUESTIONS = {
  id: 'leroy-merlin-jordan',
  part: 4,
  personnes: PERSONNES,
  ouverture: OUVERTURE_CLIENTS(),
  liste: [
    ...BANQUE_CLIENTS,
    { id: 'roux', type: 'fil', de: 'nadia', groupe: 'Vérifier', quand: apresFiche('f207-verifier'),
      enonce: 'Mme Roux commande deux pots de peinture (14 kg) et deux boîtes de vis (1,2 kg). Pourquoi est-ce un encombrant ?',
      choix: [{ v: 'total', lib: 'Le total fait 30,4 kg : 30 kg ou plus' }, { v: 'peinture', lib: 'Un pot de peinture pèse plus de 30 kg' }, { v: 'vis', lib: 'Les vis sont encombrantes' }],
      juste: 'total', retour: 'Chaque produit est léger, mais la commande entière dépasse 30 kg.' },
    { id: 'rappeler', type: 'fil', de: 'nadia', groupe: 'Corriger', quand: apresFiche('f207-corriger'),
      enonce: 'Mme Morel attendait son WC mercredi. Que fais-tu ?',
      choix: [{ v: 'appeler', lib: 'Je la préviens tout de suite de la vraie date, en m’excusant' }, { v: 'attendre', lib: 'J’attends qu’elle rappelle' }, { v: 'mentir', lib: 'Je lui dis que le camion est en panne' }],
      juste: 'appeler', retour: 'Prévenir avant que le client ne découvre le retard : c’est ce qui garde sa confiance.' },
    { id: 'droit-promesse', type: 'fil', de: 'nadia', groupe: 'Les causes', quand: apresFiche('f207-causes'),
      enonce: 'Une date de livraison promise par écrit à un particulier…',
      choix: [{ v: 'engage', lib: 'engage l’entreprise : le client peut exiger qu’elle soit tenue' }, { v: 'indicatif', lib: 'n’a aucune valeur' }, { v: 'jordan', lib: 'engage Jordan personnellement' }],
      juste: 'engage', retour: 'C’est l’entreprise, pas le salarié, qui est engagée vis-à-vis du client (Code de la consommation).' },
    { id: 'outil', type: 'fil', de: 'nadia', reflexion: true, quand: apresMail({ a: MAIL_NADIA }),
      enonce: 'Comment éviter que l’erreur revienne ?',
      choix: [{ v: 'outil', lib: 'Une petite fiche « poids total, dimanche » à côté de l’écran' }, { v: 'controle', lib: 'Que quelqu’un relise chaque réponse' }, { v: 'rien', lib: 'Rien, ça arrive' }],
      retour: 'Un aide-mémoire simple évite la plupart des erreurs ; relire les cas difficiles aussi.' },
  ],
};
