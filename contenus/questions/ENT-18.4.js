// Les questions d'ENT-18.4 — Airbus Helicopters (erreur induite). Décidées par Claude (délégation de Tristan du 26/10/2026, fil « Proposer les
// prochains blocs »). Nathalie et Sofiane sont CONSTRUITS. 3 questions notées au fil (part 4 sur 20) et une réflexion d'éco-droit (moins d’urgences).
// « Avant de commencer » : non noté, 3 questions tirées (2 de préparation, 1 de droit) parmi 6 (banque commune de `contenus/airbus.js`).

import { apresGeste, apresFiche, apresMail } from '../../core/declencheurs.js';
import { BANQUE, OUVERTURE, PERSONNES, MAIL_NATHALIE } from '../airbus.js';

const F = 'fiche-184';

export const QUESTIONS = {
  id: 'airbus-reservations-sofiane',
  part: 4,
  personnes: PERSONNES,
  ouverture: OUVERTURE(),
  liste: [
    ...BANQUE,
    { id: 'reel', type: 'fil', de: 'nathalie', groupe: 'Les réservations', quand: apresGeste(`fiche:${F}:cause`),
      enonce: 'Que se passe-t-il quand on réserve sur le poids réel d’un colis encombrant ?',
      choix: [{ v: 'facture', lib: 'Le transporteur facture le poids taxable : le coût réel dépasse le budget prévu' }, { v: 'rien', lib: 'Rien : le transporteur ne vérifie pas' }, { v: 'refus', lib: 'Le colis est détruit' }],
      juste: 'facture', retour: 'Le transporteur mesure les colis : la facture suit le poids taxable, pas le poids déclaré.' },
    { id: 'aog-messagerie', type: 'fil', de: 'nathalie', groupe: 'Les réservations', quand: apresFiche(F),
      enonce: 'La messagerie coûte 30 € et le coursier 720 € pour l’hélicoptère au sol. Pourquoi payer le coursier ?',
      choix: [{ v: 'au-sol', lib: 'Deux jours de plus au sol coûtent bien plus que la différence, et privent le client de son appareil' }, { v: 'regle', lib: 'Parce que la règle est la règle' }, { v: 'rien', lib: 'Il ne faut pas : 690 € d’économie' }],
      juste: 'au-sol', retour: 'Le moins cher n’est pas le moins coûteux : pour un AOG, c’est le temps au sol qui coûte.' },
    { id: 'dire-sofiane', type: 'fil', de: 'nathalie', groupe: 'Les réservations', quand: apresGeste(`fiche:${F}:cout-EXP-1833`),
      enonce: 'Comment le dire à Sofiane ?',
      choix: [{ v: 'montrer', lib: 'Lui montrer la méthode sur ses deux réservations, calmement, avant de confirmer' }, { v: 'chef', lib: 'Le signaler à Nathalie sans lui en parler' }, { v: 'rien', lib: 'Corriger sans rien dire' }],
      juste: 'montrer', retour: 'Il refera juste la prochaine fois s’il voit où la méthode diffère de « le moins cher ».' },
    { id: 'moins-aog', type: 'fil', de: 'nathalie', reflexion: true, quand: apresMail({ a: MAIL_NATHALIE }),
      enonce: 'Les AOG coûtent cher en transport. Comment en avoir moins ?',
      choix: [{ v: 'stock', lib: 'Placer des pièces critiques en stock près des clients et suivre la maintenance préventive' }, { v: 'rien', lib: 'On ne peut rien faire' }, { v: 'messagerie', lib: 'Tout envoyer en messagerie' }],
      retour: 'Un stock bien placé et une maintenance planifiée évitent beaucoup d’urgences.' },
  ],
};
