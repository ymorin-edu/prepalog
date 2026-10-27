// Les questions d'ENT-22.7 — Schneider Electric (CAP, guidage). Décidées par Claude (délégation de Tristan du 26/10/2026). 3 notées au fil (part 4)
// et une réflexion. « Avant de commencer » : non noté (banque de `contenus/schneider.js`).
import { apresFiche } from '../../core/declencheurs.js';
import { BANQUE, OUVERTURE, PERSONNES } from '../schneider.js';

export const QUESTIONS = {
  id: 'schneider-ranger',
  part: 4,
  personnes: PERSONNES,
  ouverture: OUVERTURE(),
  liste: [
    ...BANQUE,
    { id: 'pourquoi-plaque', type: 'fil', de: 'julien', groupe: 'Ranger les palettes', quand: apresFiche('f227-ranger'),
      enonce: 'Que peut-il arriver si on monte une palette plus lourde que la charge du niveau ?',
      choix: [{ v: 'effondre', lib: 'La lisse peut plier et le rayonnage s’effondrer' }, { v: 'rien', lib: 'Rien, le métal est solide' }, { v: 'lent', lib: 'Le chariot va plus lentement' }],
      juste: 'effondre', retour: 'La plaque de charge protège l’équipe : on ne la dépasse jamais.' },
    { id: 'scanner', type: 'fil', de: 'julien', groupe: 'Les gestes', quand: apresFiche('f227-gestes'),
      enonce: 'Julien oublie de scanner l’emplacement. Que se passe-t-il ?',
      choix: [{ v: 'perdue', lib: 'Le système ne sait pas où est la palette : on ne la retrouvera pas pour une commande' }, { v: 'rien', lib: 'Rien' }, { v: 'bip', lib: 'Le chariot s’arrête' }],
      juste: 'perdue', retour: 'Sans le scan, l’information n’est pas à jour : c’est comme si la palette avait disparu.' },
    { id: 'niveau0', type: 'fil', de: 'julien', groupe: 'Lire une adresse', quand: apresFiche('f227-adresse'),
      enonce: 'Le niveau 0, c’est…',
      choix: [{ v: 'sol', lib: 'Au sol' }, { v: 'haut', lib: 'Tout en haut' }, { v: 'vide', lib: 'Un emplacement qui n’existe pas' }],
      juste: 'sol', retour: 'On compte les niveaux à partir du sol.' },
    { id: 'cariste', type: 'fil', de: 'julien', reflexion: true, quand: apresFiche('f227-plaque'),
      enonce: 'Pour conduire le chariot comme Julien, il faut…',
      choix: [{ v: 'caces', lib: 'Une formation et l’autorisation de conduite de l’employeur' }, { v: 'permis', lib: 'Le permis de voiture' }, { v: 'rien', lib: 'Rien de spécial' }],
      retour: 'C’est le bloc 2 de ton CAP : conduire en sécurité, avec une autorisation de conduite.' },
  ],
};
