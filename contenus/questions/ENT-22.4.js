// Les questions d'ENT-22.4 — Schneider Electric (CAP, guidage). Décidées par Claude (délégation de Tristan du 26/10/2026). 3 notées au fil (part 4)
// et une réflexion. « Avant de commencer » : non noté (banque de `contenus/schneider.js`).
import { apresFiche } from '../../core/declencheurs.js';
import { BANQUE, OUVERTURE, PERSONNES } from '../schneider.js';

export const QUESTIONS = {
  id: 'schneider-controle',
  part: 4,
  personnes: PERSONNES,
  ouverture: OUVERTURE(),
  liste: [
    ...BANQUE,
    { id: 'trop', type: 'fil', de: 'nadia', groupe: 'Les lignes', quand: apresFiche('f224-lignes'),
      enonce: 'Un colis en trop, ce n’est pas grave : on le garde ?',
      choix: [{ v: 'non', lib: 'Non : il n’est pas à nous, je le note pour qu’on le rende ou qu’on le paie' }, { v: 'oui', lib: 'Oui, c’est un cadeau' }, { v: 'jeter', lib: 'Je le jette' }],
      juste: 'non', retour: 'Un écart, en plus ou en moins, se signale toujours.' },
    { id: 'avant', type: 'fil', de: 'nadia', groupe: 'Les quantités', quand: apresFiche('f224-quantites'),
      enonce: 'Quand écris-tu les réserves ?',
      choix: [{ v: 'avant', lib: 'Avant que le chauffeur signe et parte' }, { v: 'demain', lib: 'Le lendemain, au calme' }, { v: 'jamais', lib: 'Jamais, Nadia s’en charge' }],
      juste: 'avant', retour: 'Après le départ du chauffeur, c’est trop tard pour écrire sur sa lettre de voiture.' },
    { id: 'trois-jours', type: 'fil', de: 'nadia', groupe: 'La réserve', quand: apresFiche('f224-reserve'),
      enonce: 'D’après le Code de commerce, combien de temps a-t-on pour confirmer les réserves au transporteur ?',
      choix: [{ v: '3', lib: 'Trois jours, hors jours fériés' }, { v: '30', lib: 'Trente jours' }, { v: '1an', lib: 'Un an' }],
      juste: '3', retour: 'Trois jours, par lettre recommandée : c’est l’article L133-3 du Code de commerce.' },
    { id: 'deballage', type: 'fil', de: 'nadia', reflexion: true, quand: apresFiche('f224-reserve'),
      enonce: 'Pourquoi « sous réserve de déballage » ne vaut rien, à ton avis ?',
      choix: [{ v: 'precis', lib: 'Elle ne dit ni combien, ni quoi, ni quel problème' }, { v: 'court', lib: 'Elle est trop courte' }, { v: 'sais', lib: 'Je ne sais pas' }],
      retour: 'Une réserve sert de preuve : sans chiffre ni produit, elle ne prouve rien.' },
  ],
};
