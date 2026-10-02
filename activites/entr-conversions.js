// QUI-8 — Conversions d'unités. Quiz d'entraînement, portée élève.
//
// Le code suit QUI-5 à QUI-7, les trois quiz déjà en place : c'est lui qui décide du rang
// d'affichage dans la rubrique Quiz. Les neuf autres quiz de la Suite Logistique prendront
// QUI-9 à QUI-17 dans l'ordre où ils seront repris.
//
// Premier module repris des quiz de la Suite Logistique. Il sert de témoin au type
// `entrainement` : il porte des générateurs (donc des valeurs neuves à chaque tentative),
// une calculette et un classement.
//
// Pas de champ `niveaux` : par défaut tout est ouvert à tous les niveaux, c'est
// « Conduite de séance » qui ferme. Les conversions servent de la 2de à la Terminale.

import { creerEntrainement } from '../core/types/entrainement.js';
import { RAPPEL, GENERATEURS, TITRE } from '../contenus/entr-conversions.js';

export const meta = {
  id: 'entr-conversions',
  code: 'QUI-8',
  titre: TITRE,
  desc: 'Longueurs, masses, volumes, durées : convertir sans se tromper. Les nombres changent à chaque tentative.',
  rubrique: 'quiz',
  competences: [],
  // Vingt questions, donc vingt points : la note sur 20 tombe sans conversion.
  bareme: GENERATEURS.length,
  portee: 'eleve',
  pret: true,
};

const moteur = creerEntrainement({
  rappel: RAPPEL,
  generateurs: GENERATEURS,
  calculette: true,
  classement: true,
});

export function rendre(hote, ctx) { moteur.rendre(hote, ctx); }
