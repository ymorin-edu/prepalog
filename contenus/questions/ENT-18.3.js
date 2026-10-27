// Les questions d'ENT-18.3 — Airbus Helicopters (guidage). Décidées par Claude (délégation de Tristan du 26/10/2026, fil « Proposer les
// prochains blocs »). Nathalie et Sofiane sont CONSTRUITS. 3 questions notées au fil (part 4 sur 20) et une réflexion d'éco-droit (les batteries en avion).
// « Avant de commencer » : non noté, 3 questions tirées (2 de préparation, 1 de droit) parmi 6 (banque commune de `contenus/airbus.js`).

import { apresGeste, apresMail } from '../../core/declencheurs.js';
import { BANQUE, OUVERTURE, PERSONNES, MAIL_NATHALIE } from '../airbus.js';

const F = 'fiche-183';

export const QUESTIONS = {
  id: 'airbus-flux-particuliers',
  part: 4,
  personnes: PERSONNES,
  ouverture: OUVERTURE(),
  liste: [
    ...BANQUE,
    { id: 'secours-au-sol', type: 'fil', de: 'nathalie', groupe: 'Les flux particuliers', quand: apresGeste(`fiche:${F}:presta-EXP-1821`),
      enonce: 'Un hélicoptère de secours est au sol à Grenoble. Pourquoi ne pas choisir le moins cher ?',
      choix: [{ v: 'immobilise', lib: 'Chaque heure au sol coûte et prive les secours de l’appareil : on prend le plus rapide' }, { v: 'client', lib: 'Parce que le client paie' }, { v: 'regle', lib: 'Parce que le moins cher refuse les pièces d’hélicoptère' }],
      juste: 'immobilise', retour: 'Pour un AOG, le coût du transport pèse peu face à un appareil immobilisé.' },
    { id: 'pale', type: 'fil', de: 'nathalie', groupe: 'Les flux particuliers', quand: apresGeste(`fiche:${F}:presta-EXP-1822`),
      enonce: 'La pale mesure 5,50 m. Quels prestataires peuvent la prendre ?',
      choix: [{ v: 'affretement', lib: 'Seulement l’affrètement : un camion plateau dédié' }, { v: 'tous', lib: 'Tous' }, { v: 'express', lib: 'L’express, parce qu’il est rapide' }],
      juste: 'affretement', retour: 'Hors gabarit : messagerie (3 m), coursier (2,50 m) et express (1,50 m) ne prennent pas un colis aussi long.' },
    { id: 'lithium', type: 'fil', de: 'nathalie', groupe: 'Les flux particuliers', quand: apresGeste(`fiche:${F}:danger`),
      enonce: 'Pourquoi une batterie lithium-ion est-elle une marchandise dangereuse ?',
      choix: [{ v: 'feu', lib: 'Elle peut chauffer et prendre feu si elle est abîmée ou mal emballée' }, { v: 'lourd', lib: 'Elle est lourde' }, { v: 'cher', lib: 'Elle coûte cher' }],
      juste: 'feu', retour: 'Un court-circuit ou un choc peut déclencher un feu difficile à éteindre : emballage, étiquette et déclaration sont obligatoires.' },
    { id: 'avion', type: 'fil', de: 'nathalie', reflexion: true, quand: apresMail({ a: MAIL_NATHALIE }),
      enonce: 'Pourquoi les règles sont-elles encore plus strictes pour une batterie transportée en avion ?',
      choix: [{ v: 'vol', lib: 'Un feu en vol ne peut pas être maîtrisé comme au sol' }, { v: 'poids', lib: 'Les avions ne supportent pas le poids' }, { v: 'douane', lib: 'À cause de la douane' }],
      retour: 'En avion, on ne peut pas s’arrêter sur le bas-côté : certaines batteries sont interdites en soute passagers et limitées en cargo.' },
  ],
};
