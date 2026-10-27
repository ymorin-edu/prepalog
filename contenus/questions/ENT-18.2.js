// Les questions d'ENT-18.2 — Airbus Helicopters (entraînement). Décidées par Claude (délégation de Tristan du 26/10/2026, fil « Proposer les
// prochains blocs »). Nathalie et Sofiane sont CONSTRUITS. 3 questions notées au fil (part 4 sur 20) et une réflexion d'éco-droit (le groupage).
// « Avant de commencer » : non noté, 3 questions tirées (2 de préparation, 1 de droit) parmi 6 (banque commune de `contenus/airbus.js`).

import { apresGeste, apresFiche, apresMail } from '../../core/declencheurs.js';
import { BANQUE, OUVERTURE, PERSONNES, MAIL_NATHALIE } from '../airbus.js';

const F = 'fiche-182';

export const QUESTIONS = {
  id: 'airbus-expeditions-mardi',
  part: 4,
  personnes: PERSONNES,
  ouverture: OUVERTURE(),
  liste: [
    ...BANQUE,
    { id: 'longueur', type: 'fil', de: 'nathalie', groupe: 'Les expéditions', quand: apresGeste(`fiche:${F}:presta-EXP-1813`),
      enonce: 'Qu’est-ce qui limite le choix pour l’arbre de transmission de 2,80 m ?',
      choix: [{ v: 'longueur', lib: 'Sa longueur : tous les prestataires ne prennent pas un colis aussi long' }, { v: 'poids', lib: 'Son poids' }, { v: 'rien', lib: 'Rien' }],
      juste: 'longueur', retour: 'On regarde d’abord qui peut prendre le colis (longueur, distance), puis qui livre à temps, puis le prix.' },
    { id: 'coursier-proche', type: 'fil', de: 'nathalie', groupe: 'Les expéditions', quand: apresGeste(`fiche:${F}:cout-EXP-1811`),
      enonce: 'Pour EXP-1811, à 160 km, le coursier coûte 240 €. Faut-il le prendre ?',
      choix: [{ v: 'non', lib: 'Non : un autre prestataire livre à temps pour moins cher' }, { v: 'oui', lib: 'Oui : c’est le plus rapide' }, { v: 'toujours', lib: 'Oui : un coursier, c’est toujours mieux' }],
      juste: 'non', retour: 'Hors hélicoptère au sol, on prend le moins cher parmi ceux qui livrent à temps.' },
    { id: 'trop-loin', type: 'fil', de: 'nathalie', groupe: 'Les expéditions', quand: apresFiche(F),
      enonce: 'EXP-1812 doit arriver demain à Nantes. Pourquoi pas le coursier ?',
      choix: [{ v: 'loin', lib: 'Nantes est à 990 km : au-delà des 800 km du coursier' }, { v: 'cher', lib: 'Il est trop cher' }, { v: 'poids', lib: 'Le colis est trop lourd' }],
      juste: 'loin', retour: 'Le coursier ne va pas au-delà de 800 km : l’express livre demain avant midi.' },
    { id: 'groupage', type: 'fil', de: 'nathalie', reflexion: true, quand: apresMail({ a: MAIL_NATHALIE }),
      enonce: 'La messagerie regroupe les colis de plusieurs clients dans un camion. Quel intérêt pour l’environnement ?',
      choix: [{ v: 'rempli', lib: 'Des camions mieux remplis : moins de trajets pour le même nombre de colis' }, { v: 'aucun', lib: 'Aucun' }, { v: 'vite', lib: 'Les colis arrivent plus vite' }],
      retour: 'Un coursier dédié pour un petit colis, c’est un véhicule presque vide sur la route : on le garde pour l’urgence.' },
  ],
};
