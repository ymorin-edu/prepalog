// Les questions d'ENT-21.1 — Lidl (2de, guidage C1.3). Décidées par Claude (délégation de Tristan du 26/10/2026). 3 notées au fil (part 4),
// dont une d'éco-droit appliquée au cas, et une réflexion. « Avant de commencer » : non noté (banque de `contenus/lidl.js`).
import { apresFiche, apresMail } from '../../core/declencheurs.js';
import { BANQUE_RECEPTION, OUVERTURE_RECEPTION, PERSONNES, MAIL_FATOU } from '../lidl.js';

export const QUESTIONS = {
  id: 'lidl-bienvenue',
  part: 4,
  personnes: PERSONNES,
  ouverture: OUVERTURE_RECEPTION(),
  liste: [
    ...BANQUE_RECEPTION,
    { id: 'chaine', type: 'fil', de: 'fatou', groupe: 'Les zones', quand: apresFiche('f211-zones'),
      enonce: 'Pourquoi les glaces ne doivent-elles jamais attendre sur un quai de produits secs ?',
      choix: [{ v: 'froid', lib: 'Pour ne pas rompre la chaîne du froid' }, { v: 'place', lib: 'Pour gagner de la place' }, { v: 'joli', lib: 'Pour que le quai soit rangé' }],
      juste: 'froid', retour: 'Une glace qui a dégelé puis regelé n’est plus sûre : on ne peut plus la vendre.' },
    { id: 'rdv', type: 'fil', de: 'fatou', groupe: 'Les quais', quand: apresFiche('f211-quais'),
      enonce: 'Pourquoi chaque fournisseur prend-il rendez-vous avant de venir ?',
      choix: [{ v: 'pret', lib: 'Pour que le quai, le chariot et la place en zone soient prêts à son arrivée' }, { v: 'politesse', lib: 'Par politesse' },
        { v: 'payer', lib: 'Pour être payé plus vite' }],
      juste: 'pret', retour: 'Un camion attendu est déchargé vite : moins d’attente, et le froid n’est pas coupé.' },
    { id: 'droit-reserve', type: 'fil', de: 'fatou', groupe: 'Les contrôles', quand: apresFiche('f211-controles'),
      enonce: 'Une palette arrive écrasée. Que fais-tu avant de signer le bon de livraison ?',
      choix: [{ v: 'reserve', lib: 'J’écris une réserve précise sur le bon (quelle palette, quel dégât)' }, { v: 'signe', lib: 'Je signe, on verra plus tard' },
        { v: 'oral', lib: 'Je le dis au chauffeur, sans rien écrire' }],
      juste: 'reserve', retour: 'Sans réserve écrite et précise, il devient très difficile de se faire rembourser : la signature vaut « reçu en bon état ».' },
    { id: 'metier', type: 'fil', de: 'fatou', reflexion: true, quand: apresMail({ a: MAIL_FATOU }),
      enonce: 'Qu’est-ce qui t’a le plus surpris(e) à la réception ?',
      choix: [{ v: 'froid', lib: 'Le froid : des zones jusqu’à -28 °C' }, { v: 'organisation', lib: 'Tout est préparé avant l’arrivée du camion' },
        { v: 'controles', lib: 'Le nombre de contrôles' }],
      retour: 'Merci : on en reparle lundi.' },
  ],
};
