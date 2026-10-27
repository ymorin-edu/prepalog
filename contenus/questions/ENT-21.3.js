// Les questions d'ENT-21.3 — Lidl (2de, guidage OTM-C1.4). Décidées par Claude (délégation de Tristan du 26/10/2026). 3 notées au fil (part 4),
// dont une d'éco-droit, et une réflexion. « Avant de commencer » : non noté.
import { apresFiche, apresMail } from '../../core/declencheurs.js';
import { BANQUE_TRANSPORT, OUVERTURE_TRANSPORT, PERSONNES, MAIL_MEHDI } from '../lidl.js';

export const QUESTIONS = {
  id: 'lidl-transport',
  part: 4,
  personnes: PERSONNES,
  ouverture: OUVERTURE_TRANSPORT(),
  liste: [
    ...BANQUE_TRANSPORT,
    { id: 'distance', type: 'fil', de: 'mehdi', groupe: 'Les zones', quand: apresFiche('f213-zones'),
      enonce: 'Pourquoi le prix par palette augmente-t-il avec la distance ?',
      choix: [{ v: 'couts', lib: 'Plus de kilomètres, c’est plus de carburant et plus d’heures de conducteur' }, { v: 'poids', lib: 'Les palettes sont plus lourdes' },
        { v: 'hasard', lib: 'Le transporteur choisit au hasard' }],
      juste: 'couts', retour: 'La grille traduit les coûts du transporteur : carburant, conducteur, usure du camion.' },
    { id: 'cout-froid', type: 'fil', de: 'mehdi', groupe: 'La cotation', quand: apresFiche('f213-cotation'),
      enonce: 'Pourquoi un transport frigorifique coûte-t-il plus cher ?',
      choix: [{ v: 'groupe', lib: 'Le groupe froid consomme, et le camion coûte plus cher à l’achat' }, { v: 'luxe', lib: 'Parce que c’est un service de luxe' },
        { v: 'vitesse', lib: 'Parce qu’il roule plus vite' }],
      juste: 'groupe', retour: 'D’où le supplément froid de la grille.' },
    { id: 'droit-eco', type: 'fil', de: 'mehdi', groupe: 'Notre camion', quand: apresFiche('f213-revient'),
      enonce: 'Quand on livre un magasin, comment réduire aussi la pollution ?',
      choix: [{ v: 'plein', lib: 'Remplir les camions et regrouper les livraisons' }, { v: 'vide', lib: 'Envoyer plus de camions à moitié vides' },
        { v: 'rien', lib: 'On ne peut rien y faire' }],
      juste: 'plein', retour: 'Un camion plein, c’est moins de trajets : moins de CO₂ et moins de coûts. Les transporteurs déclarent le CO₂ de chaque transport.' },
    { id: 'choisir', type: 'fil', de: 'mehdi', reflexion: true, quand: apresMail({ a: MAIL_MEHDI }),
      enonce: 'Pour choisir un transport, qu’est-ce qui compte le plus, d’après toi ?',
      choix: [{ v: 'prix', lib: 'Le prix' }, { v: 'fiabilite', lib: 'L’heure de livraison tenue' }, { v: 'froid', lib: 'Le froid respecté' }],
      retour: 'Les trois comptent : on en reparle en classe.' },
  ],
};
