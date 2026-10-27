// Les questions d'ENT-24.3 — Kuehne+Nagel (1re, entraînement). Décidées par Claude (délégation de Tristan du 26/10/2026). 3 notées au fil (part 4),
// dont une d'éco-droit appliquée au cas, et une réflexion. « Avant de commencer » : non noté.
import { apresFiche, apresPlanning } from '../../core/declencheurs.js';
import { BANQUE, OUVERTURE, PERSONNES } from '../kuehne-nagel.js';

const PL = 'kn-planning-243';
export const QUESTIONS = {
  id: 'kuehne-nagel-lundi',
  part: 4,
  personnes: PERSONNES,
  ouverture: OUVERTURE(),
  liste: [
    ...BANQUE,
    { id: 'limite-avant', type: 'fil', de: 'sophie', groupe: 'Le planning des quais', quand: apresPlanning(PL),
      enonce: 'Deux envois froids sont disponibles en même temps. Lequel reçois-tu d’abord ?',
      choix: [{ v: 'limite', lib: 'Celui dont l’heure limite est la plus proche' }, { v: 'gros', lib: 'Celui qui a le plus de palettes' }, { v: 'hasard', lib: 'N’importe lequel' }],
      juste: 'limite', retour: 'L’heure limite d’abord : c’est elle qui ne se rattrape pas.' },
    { id: 'energie', type: 'fil', de: 'karim', groupe: 'Le planning des quais', quand: apresPlanning(PL, 2),
      enonce: 'Une porte de chambre froide bloquée ouverte, c’est aussi…',
      choix: [{ v: 'energie', lib: 'de l’électricité gaspillée : le froid s’en va et les machines tournent pour rien' }, { v: 'rien', lib: 'rien de grave, il fait froid dehors' },
        { v: 'mieux', lib: 'mieux : l’air circule' }],
      juste: 'energie', retour: 'Le hub a 1 332 panneaux solaires sur le toit : chaque kilowattheure de froid compte.' },
    { id: 'droit-panne', type: 'fil', de: 'sophie', groupe: 'Qui prévenir ?', quand: apresFiche('f243-prevenir'),
      enonce: 'Si l’insuline attend une heure sur le quai, hors du froid, que dit la règle ?',
      choix: [{ v: 'part', lib: 'On la met à part et on vérifie qu’elle est encore bonne avant de la livrer' }, { v: 'livre', lib: 'On la livre quand même, personne ne le saura' },
        { v: 'congele', lib: 'On la congèle pour rattraper' }],
      juste: 'part', retour: 'C’est ce que demandent les bonnes pratiques de distribution : la température est surveillée et prouvée.' },
    { id: 'seul', type: 'fil', de: 'sophie', reflexion: true, quand: apresFiche('f243-prevenir'),
      enonce: 'Seul(e) devant le planning, qu’est-ce qui était le plus difficile ?',
      choix: [{ v: 'ordre', lib: 'Trouver l’ordre au quai froid' }, { v: 'durees', lib: 'Tenir compte des durées' }, { v: 'reprise', lib: 'Tout reprendre après la panne' }],
      retour: 'Merci : on en reparle à la prochaine séance.' },
  ],
};
