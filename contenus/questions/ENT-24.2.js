// Les questions d'ENT-24.2 — Kuehne+Nagel (1re, guidage). Décidées par Claude (délégation de Tristan du 26/10/2026). 3 notées au fil (part 4), dont
// une d'éco-droit appliquée au cas, et une réflexion. « Avant de commencer » : non noté.
import { apresFiche, apresPlanning } from '../../core/declencheurs.js';
import { BANQUE, OUVERTURE, PERSONNES } from '../kuehne-nagel.js';

const PL = 'kn-planning-242';
export const QUESTIONS = {
  id: 'kuehne-nagel-planning',
  part: 4,
  personnes: PERSONNES,
  ouverture: OUVERTURE(),
  liste: [
    ...BANQUE,
    { id: 'quart', type: 'fil', de: 'sophie', groupe: 'Les durées', quand: apresFiche('f242-durees'),
      enonce: 'Sur le planning, une réception de 25 minutes occupe le quai…',
      choix: [{ v: '30', lib: '30 minutes : on réserve par quarts d’heure entiers' }, { v: '25', lib: '25 minutes pile' }, { v: '15', lib: '15 minutes' }],
      juste: '30', retour: 'Le planning se fait par quarts d’heure : on arrondit au quart d’heure du dessus.' },
    { id: 'pourquoi-envoyer', type: 'fil', de: 'sophie', groupe: 'Le planning des quais', quand: apresPlanning(PL),
      enonce: 'Pourquoi le planning des quais est-il fait avant l’arrivée des camions ?',
      choix: [{ v: 'pret', lib: 'Pour que le bon quai, la chambre froide et l’équipe soient prêts quand l’envoi arrive' }, { v: 'chef', lib: 'Pour faire plaisir à la cheffe' },
        { v: 'douane', lib: 'Parce que la douane l’exige' }],
      juste: 'pret', retour: 'Un médicament qui attend sur le quai, hors du froid, c’est le risque qu’on veut éviter.' },
    { id: 'droit-aog', type: 'fil', de: 'sophie', groupe: 'Le planning des quais', quand: apresPlanning(PL, 2),
      enonce: 'Un avion de ligne cloué au sol, pour la compagnie, c’est…',
      choix: [{ v: 'cout', lib: 'des vols annulés, des passagers à reloger et à indemniser : chaque heure coûte cher' }, { v: 'rien', lib: 'rien du tout, elle attend' },
        { v: 'aeroport', lib: 'un problème pour l’aéroport seulement' }],
      juste: 'cout', retour: 'D’où la priorité donnée aux pièces AOG : le client paie pour qu’elles passent avant tout le reste.' },
    { id: 'aleas', type: 'fil', de: 'sophie', reflexion: true, quand: apresPlanning(PL, 2),
      enonce: 'Quand le planning change en cours de matinée, qu’est-ce qui t’a aidé le plus ?',
      choix: [{ v: 'libre', lib: 'Repérer l’envoi qui n’a pas d’heure limite, pour le décaler' }, { v: 'bande', lib: 'La bande ambrée qui montre quand l’envoi peut être reçu' },
        { v: 'essai', lib: 'Essayer jusqu’à ce que les messages disparaissent' }],
      retour: 'Merci : c’est ce qu’on fait chaque jour, il y a toujours un vol en retard.' },
  ],
};
