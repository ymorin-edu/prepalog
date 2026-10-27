// Les questions d'ENT-16.4 — Royal Canin, « implanter la zone de picking » (guidage). Décidées par Claude (délégation de Tristan du 26/10/2026).
// 3 questions notées au fil (part 4 sur 20) et une réflexion d'éco-droit (l'employeur et le port de charges). « Avant de commencer » : non noté.

import { apresGeste, apresFiche, apresMail } from '../../core/declencheurs.js';
import { BANQUE, OUVERTURE, PERSONNES, MAIL_SANDRINE } from '../royal-canin.js';

const F = 'fiche-164';

export const QUESTIONS = {
  id: 'royal-canin-picking',
  part: 4,
  personnes: PERSONNES,
  ouverture: OUVERTURE(),
  liste: [
    ...BANQUE,
    { id: 'lourd-reserve', type: 'fil', de: 'sandrine', groupe: 'La zone de picking', quand: apresGeste(`fiche:${F}:zone-VET-DIG-10`),
      enonce: 'VET-DIG-10 pèse 10 kg. Pourquoi la règle ne le met-elle pas sur une palette au sol ?',
      choix: [{ v: 'peu', lib: 'Il ne sort que 4 colis par jour : la première ligne de la règle (la réserve) passe avant le poids' },
        { v: 'leger', lib: 'Parce que 10 kg, c’est léger' }, { v: 'place', lib: 'Parce qu’il n’y a plus de palette au sol libre' }],
      juste: 'peu', retour: 'On lit la règle dans l’ordre : une palette au sol pour 4 sacs par jour, c’est un emplacement bas gaspillé.' },
    { id: 'arrondi', type: 'fil', de: 'sandrine', groupe: 'La zone de picking', quand: apresGeste(`fiche:${F}:reappro-CT-KIT-04`),
      enonce: '60 ÷ 24 = 2,5. Pourquoi faut-il 3 réappros par jour, et pas 2 ?',
      choix: [{ v: 'manque', lib: 'Avec 2, le canal serait vide avant la fin de la journée' }, { v: 'marge', lib: 'Pour garder de la marge, c’est tout' },
        { v: 'regle', lib: 'On arrondit toujours au plus proche' }],
      juste: 'manque', retour: 'Deux réappros = 48 cartons pour 60 demandés : il manquerait 12 cartons. On arrondit au-dessus.' },
    { id: 'dos', type: 'fil', de: 'sandrine', groupe: 'La zone de picking', quand: apresFiche(F),
      enonce: 'Pourquoi prend-on les sacs de 15 kg sur une palette au sol plutôt qu’en hauteur ?',
      choix: [{ v: 'dos', lib: 'Pour limiter l’effort et les gestes dangereux pour le dos' }, { v: 'vite', lib: 'Seulement pour aller plus vite' },
        { v: 'joli', lib: 'Pour que la zone soit plus jolie' }],
      juste: 'dos', retour: 'Soulever du lourd au-dessus des épaules ou en se penchant blesse : on place le lourd à hauteur de travail.' },
    { id: 'employeur', type: 'fil', de: 'sandrine', reflexion: true, quand: apresMail({ a: MAIL_SANDRINE }),
      enonce: 'Qui doit organiser les postes pour limiter le port de charges lourdes ?',
      choix: [{ v: 'employeur', lib: 'L’employeur : il évalue les risques et organise le travail' }, { v: 'salarie', lib: 'Chaque salarié, seul' },
        { v: 'client', lib: 'Le client' }],
      retour: 'L’employeur doit évaluer les risques (dont la manutention) et les réduire ; le salarié respecte les consignes et signale ce qui ne va pas.' },
  ],
};
