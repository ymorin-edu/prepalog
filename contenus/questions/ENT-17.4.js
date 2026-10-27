// Les questions d'ENT-17.4 — La Redoute (erreur induite). Décidées par Claude (délégation de Tristan du 26/10/2026, fil « Proposer les prochains
// blocs »). Claire et Julien sont CONSTRUITS. 3 questions notées au fil (part 4 sur 20) et une réflexion d'éco-droit (le réemploi).
// « Avant de commencer » : non noté, 3 questions tirées (2 de préparation, 1 de droit) parmi 6 (banque commune de `contenus/la-redoute.js`).

import { apresGeste, apresFiche, apresMail } from '../../core/declencheurs.js';
import { BANQUE, OUVERTURE, PERSONNES, MAIL_CLAIRE } from '../la-redoute.js';

const F = 'fiche-174';

export const QUESTIONS = {
  id: 'la-redoute-tri-julien',
  part: 4,
  personnes: PERSONNES,
  ouverture: OUVERTURE(),
  liste: [
    ...BANQUE,
    { id: 'r14', type: 'fil', de: 'claire', groupe: 'Les retours', quand: apresFiche(F),
      enonce: 'R-14 n’a aucun défaut. Qu’aurait-on risqué en le remettant en stock tel quel ?',
      choix: [{ v: 'client', lib: 'Un client recevrait comme neuf un article essayé et froissé' }, { v: 'rien', lib: 'Rien' }, { v: 'stock', lib: 'Une erreur de stock' }],
      juste: 'client', retour: 'Un article essayé passe par le contrôle et le repassage avant de repartir.' },
    { id: 'chiffre-faux', type: 'fil', de: 'claire', groupe: 'Les retours', quand: apresGeste(`fiche:${F}:cause`),
      enonce: 'Pourquoi un indicateur faux serait-il gênant au point RSE ?',
      choix: [{ v: 'decision', lib: 'On décide sur un chiffre faux : on croit le poste meilleur qu’il n’est' }, { v: 'rien', lib: 'Ce n’est pas grave, c’est proche' }, { v: 'punir', lib: 'Parce que Julien sera puni' }],
      juste: 'decision', retour: 'Un indicateur sert à décider : il doit compter ce qu’il dit compter.' },
    { id: 'dire-julien', type: 'fil', de: 'claire', groupe: 'Les retours', quand: apresGeste(`fiche:${F}:taux`),
      enonce: 'Comment le dire à Julien ?',
      choix: [{ v: 'montrer', lib: 'Lui montrer la règle sur ses deux retours et sur son calcul, calmement' }, { v: 'chef', lib: 'Le signaler à Claire sans lui en parler' }, { v: 'rien', lib: 'Ne rien dire et corriger' }],
      juste: 'montrer', retour: 'Il refera le tri juste demain s’il comprend où il s’est trompé.' },
    { id: 'reemploi', type: 'fil', de: 'claire', reflexion: true, quand: apresMail({ a: MAIL_CLAIRE }),
      enonce: 'R-16, encore portable, est parti au recyclage au lieu du don. Qu’a-t-on perdu ?',
      choix: [{ v: 'reemploi', lib: 'Un vêtement qui pouvait encore servir : le réemploi passe avant le recyclage' }, { v: 'rien', lib: 'Rien : il est recyclé' }, { v: 'argent', lib: 'De l’argent' }],
      retour: 'Recycler détruit l’objet pour garder la matière ; donner le garde entier.' },
  ],
};
