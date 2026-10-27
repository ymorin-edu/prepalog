// Les questions d'ENT-22.5 — Schneider Electric (CAP, entraînement avec erreur induite). Décidées par Claude (délégation de Tristan du 26/10/2026).
// 3 notées au fil (part 4) et une réflexion. « Avant de commencer » : non noté (banque de `contenus/schneider.js`).
import { apresFiche } from '../../core/declencheurs.js';
import { BANQUE, OUVERTURE, PERSONNES } from '../schneider.js';

export const QUESTIONS = {
  id: 'schneider-mehdi',
  part: 4,
  personnes: PERSONNES,
  ouverture: OUVERTURE(),
  liste: [
    ...BANQUE,
    { id: 'mouille', type: 'fil', de: 'nadia', groupe: 'Les erreurs de Mehdi', quand: apresFiche('f225-erreurs'),
      enonce: 'Deux cartons de disjoncteurs sont mouillés. Que risque-t-on si on ne dit rien ?',
      choix: [{ v: 'payer', lib: 'De payer des produits abîmés, sans pouvoir réclamer au transporteur' }, { v: 'rien', lib: 'Rien du tout' }, { v: 'secher', lib: 'Ils vont sécher, ce n’est pas grave' }],
      juste: 'payer', retour: 'Du matériel électrique mouillé peut être dangereux : il se signale toujours.' },
    { id: 'compter', type: 'fil', de: 'nadia', groupe: 'Le bon contrôle', quand: apresFiche('f225-lignes'),
      enonce: 'Pour ne pas se tromper comme Mehdi, que fais-tu ?',
      choix: [{ v: 'ligne', lib: 'Je compare chaque ligne, une par une, le bon et le comptage' }, { v: 'total', lib: 'Je regarde seulement le total des colis' }, { v: 'vite', lib: 'Je vais vite, le chauffeur attend' }],
      juste: 'ligne', retour: 'Un total juste peut cacher un manque et un excédent qui s’annulent.' },
    { id: 'signer', type: 'fil', de: 'nadia', groupe: 'La réserve', quand: apresFiche('f225-reserve'),
      enonce: 'Le chauffeur est pressé et veut que tu signes vite. Que fais-tu ?',
      choix: [{ v: 'finir', lib: 'Je finis mon contrôle et j’écris mes réserves, puis il signe' }, { v: 'signer', lib: 'Je signe sans réserve pour qu’il parte' }, { v: 'partir', lib: 'Je le laisse partir sans signer' }],
      juste: 'finir', retour: 'Le contrôle passe avant le départ du camion.' },
    { id: 'collegue', type: 'fil', de: 'nadia', reflexion: true, quand: apresFiche('f225-reserve'),
      enonce: 'Comment parler d’une erreur à un collègue ?',
      choix: [{ v: 'calme', lib: 'Calmement, pour comprendre et corriger ensemble' }, { v: 'chef', lib: 'Devant toute l’équipe' }, { v: 'rien', lib: 'Je ne lui dis rien' }],
      retour: 'On corrige l’erreur, pas la personne.' },
  ],
};
