// Les questions d'ENT-18.1 — Airbus Helicopters (guidage). Décidées par Claude (délégation de Tristan du 26/10/2026, fil « Proposer les
// prochains blocs »). Nathalie et Sofiane sont CONSTRUITS. 3 questions notées au fil (part 4 sur 20) et une réflexion d'éco-droit (qui répond d’un poids faux).
// « Avant de commencer » : non noté, 3 questions tirées (2 de préparation, 1 de droit) parmi 6 (banque commune de `contenus/airbus.js`).

import { apresGeste, apresFiche, apresMail } from '../../core/declencheurs.js';
import { BANQUE, OUVERTURE, PERSONNES, MAIL_NATHALIE } from '../airbus.js';

const F = 'fiche-181';

export const QUESTIONS = {
  id: 'airbus-expeditions',
  part: 4,
  personnes: PERSONNES,
  ouverture: OUVERTURE(),
  liste: [
    ...BANQUE,
    { id: 'volumetrique', type: 'fil', de: 'nathalie', groupe: 'Les expéditions', quand: apresGeste(`fiche:${F}:tax-EXP-1802`),
      enonce: 'Le capot d’EXP-1802 pèse 12 kg, mais on le paie comme 144 kg. Pourquoi ?',
      choix: [{ v: 'place', lib: 'Il prend dans le camion la place de 144 kg de marchandise' }, { v: 'erreur', lib: 'C’est une erreur du transporteur' }, { v: 'emballage', lib: 'À cause du poids de l’emballage' }],
      juste: 'place', retour: 'Un camion se remplit en poids et en volume : le transporteur facture la place occupée.' },
    { id: 'demain', type: 'fil', de: 'nathalie', groupe: 'Les expéditions', quand: apresGeste(`fiche:${F}:presta-EXP-1803`),
      enonce: 'EXP-1803 doit arriver demain. Pourquoi la messagerie, moins chère, ne convient-elle pas ?',
      choix: [{ v: 'delai', lib: 'Elle met deux jours : le kit arriverait trop tard' }, { v: 'poids', lib: 'Le colis est trop lourd pour elle' }, { v: 'loin', lib: 'Paris est trop loin pour elle' }],
      juste: 'delai', retour: 'Le moins cher n’est possible que s’il livre à temps.' },
    { id: 'minimum', type: 'fil', de: 'nathalie', groupe: 'Les expéditions', quand: apresFiche(F),
      enonce: 'EXP-1801 : 6 kg × 0,80 € = 4,80 €, mais on paie 30 €. Pourquoi ?',
      choix: [{ v: 'minimum', lib: 'La messagerie facture 30 € au moins par colis' }, { v: 'taxe', lib: 'Il y a une taxe' }, { v: 'erreur', lib: 'La grille est fausse' }],
      juste: 'minimum', retour: 'Un petit colis coûte au moins le minimum du prestataire : on regroupe quand c’est possible.' },
    { id: 'responsabilite', type: 'fil', de: 'nathalie', reflexion: true, quand: apresMail({ a: MAIL_NATHALIE }),
      enonce: 'Si on déclare un poids trop bas au transporteur, qui en répond ?',
      choix: [{ v: 'expediteur', lib: 'Nous, l’expéditeur : nous répondons des informations que nous donnons' }, { v: 'transporteur', lib: 'Le transporteur' }, { v: 'personne', lib: 'Personne' }],
      retour: 'L’expéditeur répond de ce qu’il déclare : le transporteur refacture, et en cas de problème, c’est nous qui sommes en tort.' },
  ],
};
