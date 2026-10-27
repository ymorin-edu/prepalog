// Les questions d'ENT-15.3 — Syngenta, « le plan de Lucas » (erreur induite). Décidées par Claude (délégation de Tristan du 26/10/2026).
// 3 questions notées au fil (part 4 sur 20) et une réflexion d'éco-droit (qui est responsable). « Avant de commencer » : non noté.

import { apresGeste, apresFiche, apresMail } from '../../core/declencheurs.js';
import { BANQUE, OUVERTURE, PERSONNES, MAIL_KARIM } from '../syngenta.js';

const F = 'rangement-153';

export const QUESTIONS = {
  id: 'syngenta-plan-lucas',
  part: 4,
  personnes: PERSONNES,
  ouverture: OUVERTURE(),
  liste: [
    ...BANQUE,
    { id: 'oubli-lucas', type: 'fil', de: 'karim', groupe: 'Le plan de Lucas', quand: apresGeste(`fiche:${F}:erreurs`),
      enonce: 'Lucas a mis PAL-21 en cellule 2 parce qu’elle porte la tête de mort. Qu’a-t-il oublié ?',
      choix: [{ v: 'ordre', lib: 'Qu’elle porte aussi la flamme, qui passe en premier' }, { v: 'place', lib: 'De regarder les places libres' },
        { v: 'rien', lib: 'Rien : la tête de mort passe en premier' }],
      juste: 'ordre', retour: 'La règle se lit dans l’ordre : flamme d’abord. Un pictogramme vu ne dispense pas de lire les autres.' },
    { id: 'debordement', type: 'fil', de: 'karim', groupe: 'La rétention', quand: apresGeste(`fiche:${F}:ret-C1`),
      enonce: 'Avec une rétention trop petite, que se passe-t-il si plusieurs bidons fuient en même temps ?',
      choix: [{ v: 'deborde', lib: 'Le liquide déborde du bac et part vers le sol ou les égouts' }, { v: 'rien', lib: 'Rien, le bac s’adapte' },
        { v: 'evapore', lib: 'Le liquide s’évapore' }],
      juste: 'deborde', retour: 'C’est tout l’intérêt du calcul : la rétention doit pouvoir tout garder.' },
    { id: 'dire-lucas', type: 'fil', de: 'karim', groupe: 'Le plan de Lucas', quand: apresFiche(F),
      enonce: 'Comment le dis-tu à Lucas ?',
      choix: [{ v: 'montrer', lib: 'Je lui montre la règle et le bon calcul, et je préviens Karim' }, { v: 'corriger', lib: 'Je corrige son plan sans rien dire' },
        { v: 'equipe', lib: 'Je le dis à toute l’équipe' }],
      juste: 'montrer', retour: 'Sans reproche, règle à l’appui : Lucas comprend, et Karim sait que la rétention de la cellule 1 pose problème.' },
    { id: 'responsable', type: 'fil', de: 'karim', reflexion: true, quand: apresMail({ a: MAIL_KARIM }),
      enonce: 'Si une fuite déborde un jour parce que la rétention est trop petite, qui en répond devant la loi ?',
      choix: [{ v: 'exploitant', lib: 'L’entreprise qui exploite le site : elle doit respecter les règles des installations classées' },
        { v: 'lucas', lib: 'Lucas seul' }, { v: 'personne', lib: 'Personne, c’est un accident' }],
      retour: 'C’est l’exploitant qui répond du respect des règles ; chaque salarié, lui, doit appliquer les consignes et signaler ce qui ne va pas.' },
  ],
};
