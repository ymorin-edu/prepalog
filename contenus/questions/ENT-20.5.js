// Les questions d'ENT-20.5 — Leroy Merlin (1re, guidage C2.1). Décidées par Claude (délégation de Tristan du 26/10/2026). 3 notées au fil (part 4),
// dont une d'éco-droit, et une réflexion. « Avant de commencer » : non noté.
import { apresFiche, apresMail } from '../../core/declencheurs.js';
import { BANQUE_CLIENTS, OUVERTURE_CLIENTS, PERSONNES, MAIL_NADIA } from '../leroy-merlin.js';

export const QUESTIONS = {
  id: 'leroy-merlin-clients',
  part: 4,
  personnes: PERSONNES,
  ouverture: OUVERTURE_CLIENTS(),
  liste: [
    ...BANQUE_CLIENTS,
    { id: 'interne', type: 'fil', de: 'nadia', groupe: 'Les clients', quand: apresFiche('f205-types'),
      enonce: 'Un magasin Leroy Merlin est un client « interne » parce que…',
      choix: [{ v: 'meme', lib: 'il fait partie de la même entreprise que la plateforme' }, { v: 'dedans', lib: 'il est à l’intérieur de la plateforme' }, { v: 'gratuit', lib: 'il ne paie jamais rien' }],
      juste: 'meme', retour: 'Interne : même entreprise ; externe : celui qui achète. Les deux attendent un service fiable.' },
    { id: 'total', type: 'fil', de: 'nadia', groupe: 'Les commandes', quand: apresFiche('f205-commandes'),
      enonce: 'Pourquoi additionner le poids de toute la commande, et pas seulement celui du produit le plus lourd ?',
      choix: [{ v: 'camion', lib: 'Parce que c’est toute la commande qui part ensemble : c’est elle qui est un colis ou un encombrant' }, { v: 'prix', lib: 'Pour calculer le prix' },
        { v: 'rien', lib: 'Ça ne change rien' }],
      juste: 'camion', retour: 'Une commande de plusieurs produits légers peut devenir un encombrant.' },
    { id: 'droit-delai', type: 'fil', de: 'nadia', groupe: 'Les commandes', quand: apresFiche('f205-commandes'),
      enonce: 'Le site a promis une date de livraison à un particulier. Si elle n’est pas tenue, il peut…',
      choix: [{ v: 'annuler', lib: 'demander une nouvelle date, puis annuler et être remboursé si elle n’est toujours pas tenue' }, { v: 'rien', lib: 'rien du tout' },
        { v: 'garder', lib: 'garder le produit sans le payer' }],
      juste: 'annuler', retour: 'Le Code de la consommation protège l’acheteur : la date promise engage le vendeur.' },
    { id: 'ton', type: 'fil', de: 'nadia', reflexion: true, quand: apresMail({ a: MAIL_NADIA }),
      enonce: 'Un client mécontent t’écrit sur un ton agressif. Que fais-tu d’abord ?',
      choix: [{ v: 'calme', lib: 'Je réponds calmement, avec une date précise' }, { v: 'meme', lib: 'Je lui réponds sur le même ton' }, { v: 'ignorer', lib: 'Je ne réponds pas' }],
      retour: 'Une réponse calme et précise, c’est ce qui apaise le plus vite.' },
  ],
};
