// Les questions d'ENT-22.3 — Schneider Electric (CAP, entraînement). Décidées par Claude (délégation de Tristan du 26/10/2026). 3 notées au fil
// (part 4) et une réflexion. « Avant de commencer » : non noté (banque de `contenus/schneider.js`).
import { apresFiche } from '../../core/declencheurs.js';
import { BANQUE, OUVERTURE, PERSONNES } from '../schneider.js';

export const QUESTIONS = {
  id: 'schneider-mardi',
  part: 4,
  personnes: PERSONNES,
  ouverture: OUVERTURE(),
  liste: [
    ...BANQUE,
    { id: 'pourquoi-nadia', type: 'fil', de: 'nadia', groupe: 'Un camion en avance', quand: apresFiche('f223-avance'),
      enonce: 'Pourquoi n’est-ce pas à toi de changer le quai d’un camion ?',
      choix: [{ v: 'plan', lib: 'Le planigramme organise tous les quais : un changement peut bloquer un autre camion' }, { v: 'loin', lib: 'Parce que les quais sont loin' }, { v: 'rien', lib: 'Ce n’est pas grave de le faire' }],
      juste: 'plan', retour: 'Nadia voit tous les camions de la journée : c’est elle qui décide.' },
    { id: 'manque', type: 'fil', de: 'nadia', groupe: 'Le pré-contrôle', quand: apresFiche('f223-precontrole'),
      enonce: 'Il manque une palette. Pourquoi décharges-tu quand même ?',
      choix: [{ v: 'reserve', lib: 'Les autres palettes sont attendues : je décharge et j’écris une réserve pour la palette qui manque' }, { v: 'vite', lib: 'Pour aller plus vite' },
        { v: 'oubli', lib: 'Pour que personne ne voie qu’il en manque' }],
      juste: 'reserve', retour: 'Une palette en moins ne bloque pas la livraison : la réserve la réclame.' },
    { id: 'transpalette', type: 'fil', de: 'nadia', groupe: 'Les colis lourds', quand: apresFiche('f223-lourds'),
      enonce: 'Pourquoi le chauffeur ne conduit-il pas ton transpalette ?',
      choix: [{ v: 'formation', lib: 'Il ne connaît pas notre quai et nos règles : c’est un risque pour lui et pour l’équipe' }, { v: 'lent', lib: 'Parce qu’il est trop lent' }, { v: 'rien', lib: 'Il pourrait, ce n’est pas grave' }],
      juste: 'formation', retour: 'Le protocole de sécurité dit qui fait quoi au quai.' },
    { id: 'seul', type: 'fil', de: 'nadia', reflexion: true, quand: apresFiche('f223-lourds'),
      enonce: 'Ce matin, sans moi, qu’est-ce qui t’a aidé(e) le plus ?',
      choix: [{ v: 'protocole', lib: 'Le protocole' }, { v: 'planigramme', lib: 'Le planigramme' }, { v: 'mehdi', lib: 'Mehdi' }],
      retour: 'Les documents du quai servent à ça : savoir quoi faire, même seul(e).' },
  ],
};
