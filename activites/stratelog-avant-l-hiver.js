// Stratelog, épisode 1 : « Avant l'Hiver » (2de, Moyen Âge). Jeu de stratégie logistique en classe entière : 3 à 5 villes
// de 1 à 4 élèves, un tour d'essai puis 7 saisons ; l'enseignant mène la partie (« le Seigneur ») depuis son poste, un
// tableau se projette au mur. Toute la partie vit dans la base de classe (portée 'groupe'), voir stratelog/avant-l-hiver/.
// Règles et équilibre : stratelog/avant-l-hiver/regles.js (moteur testé à part, `node --test stratelog/`).

import { monter } from '../stratelog/avant-l-hiver/jeu.js';

export const meta = {
  id: 'stratelog-avant-l-hiver',   // clé technique : écrite dans les chemins de la base, ne jamais la changer
  code: 'STR-1',
  titre: 'Avant l’Hiver',
  desc: 'Jeu de stratégie en classe entière : chaque ville doit passer l’hiver. Stocker, acheter, bâtir, tenir le registre.',
  rubrique: 'stratelog',
  niveaux: ['2de'],
  // Proposition (24/11/2026), à confirmer par Tristan : réceptionner et contrôler (C1.4), stocker (C1.5),
  // suivre l'état des stocks (C1.6). Un temps d'entraînement : coefficient 1.
  competences: ['C1.4', 'C1.5', 'C1.6'],
  temps: 'entrainement',
  // La note de fin de partie (14 points de score + 6 de classement, regles.js) est posée par le poste de l'enseignant.
  bareme: 20,
  notation: 'prof',
  portee: 'groupe',
  tables: {},
  pret: false,
};

export function rendre(hote, ctx) { monter(hote, ctx); }
