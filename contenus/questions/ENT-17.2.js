// Les questions d'ENT-17.2 — La Redoute (entraînement). Décidées par Claude (délégation de Tristan du 26/10/2026, fil « Proposer les prochains
// blocs »). Claire et Julien sont CONSTRUITS. 3 questions notées au fil (part 4 sur 20) et une réflexion d'éco-droit (l’emballage réutilisable).
// « Avant de commencer » : non noté, 3 questions tirées (2 de préparation, 1 de droit) parmi 6 (banque commune de `contenus/la-redoute.js`).

import { apresGeste, apresFiche, apresMail } from '../../core/declencheurs.js';
import { BANQUE, OUVERTURE, PERSONNES, MAIL_CLAIRE } from '../la-redoute.js';

const F = 'fiche-172';

export const QUESTIONS = {
  id: 'la-redoute-emballage-fragile',
  part: 4,
  personnes: PERSONNES,
  ouverture: OUVERTURE(),
  liste: [
    ...BANQUE,
    { id: 'calage-vide', type: 'fil', de: 'claire', groupe: 'L’emballage', quand: apresGeste(`fiche:${F}:vide-C-1712`),
      enonce: 'Le vase de C-1712 est bien calé. Pourquoi son calage compte-t-il dans le vide ?',
      choix: [{ v: 'regle', lib: 'Le règlement compte le calage comme du vide : il pousse à ajuster le carton plutôt qu’à le remplir' }, { v: 'erreur', lib: 'C’est une erreur de la règle' }, { v: 'lourd', lib: 'Parce que le calage est lourd' }],
      juste: 'regle', retour: 'Un carton trop grand bourré de papier reste un carton trop grand.' },
    { id: 'trop-grand', type: 'fil', de: 'claire', groupe: 'L’emballage', quand: apresGeste(`fiche:${F}:fmt-C-1711`),
      enonce: 'Une commande ne tient pas dans un carton M. Que fais-tu ?',
      choix: [{ v: 'L', lib: 'Un carton L, le plus petit qui convient' }, { v: 'deux', lib: 'Deux cartons M' }, { v: 'force', lib: 'Je force dans le M' }],
      juste: 'L', retour: 'Une commande, un colis, et le plus petit format où tout tient, calage compris.' },
    { id: 'une-pochette', type: 'fil', de: 'claire', groupe: 'L’emballage', quand: apresFiche(F),
      enonce: 'C-1718 : un T-shirt seul dans une pochette de 4 L, 75 % de vide. Quelle amélioration proposer ?',
      choix: [{ v: 'petite', lib: 'Ajouter une pochette plus petite pour les articles seuls' }, { v: 'carton', lib: 'Le mettre en carton S' }, { v: 'rien', lib: 'Rien : c’est déjà le plus petit format' }],
      juste: 'petite', retour: 'La règle choisit parmi les formats qu’on a : si aucun ne convient, c’est la gamme de formats qu’il faut améliorer.' },
    { id: 'reutilisable', type: 'fil', de: 'claire', reflexion: true, quand: apresMail({ a: MAIL_CLAIRE }),
      enonce: 'Certaines marques essaient des emballages réutilisables, que le client renvoie vides. Quel est l’intérêt ?',
      choix: [{ v: 'dechets', lib: 'Moins de déchets : le même emballage sert plusieurs fois' }, { v: 'rien', lib: 'Aucun' }, { v: 'prix', lib: 'Le client paie moins cher' }],
      retour: 'Réemployer passe avant recycler ; il faut organiser le retour des emballages.' },
  ],
};
