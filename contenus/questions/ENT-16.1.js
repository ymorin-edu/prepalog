// Les questions d'ENT-16.1 — Royal Canin, « lire les indicateurs du stock » (guidage, au tableur). Décidées par Claude (délégation de Tristan du 26/10/2026, fil
// « Proposer les prochains blocs ») ; déclenchées par le dépôt du fichier depuis le 27/10/2026. Sandrine est CONSTRUITE. 3 questions notées au fil (part 4
// sur 20) et une réflexion d'éco-droit (le gaspillage).
// « Avant de commencer » : non noté, 3 questions tirées (2 de préparation, 1 de droit) parmi 6 (banque commune de `contenus/royal-canin.js`).

import { apresMail } from '../../core/declencheurs.js';
import { BANQUE, OUVERTURE, PERSONNES, MAIL_SANDRINE } from '../royal-canin.js';
import { T161 as T } from '../royal-canin-tableur.js';

export const QUESTIONS = {
  id: 'royal-canin-indicateurs',
  part: 4,
  personnes: PERSONNES,
  ouverture: OUVERTURE(),
  liste: [
    ...BANQUE,
    { id: 'rotation-moitie', type: 'fil', de: 'sandrine', groupe: 'Les indicateurs', quand: (db) => T.juste(db, 'rotation'),
      enonce: 'Si la rotation de CH-ADU-15 tombait de 4 à 2, avec les mêmes sorties, qu’est-ce que cela voudrait dire ?',
      choix: [{ v: 'double', lib: 'Que le stock moyen aurait doublé : deux fois plus de sacs (et d’argent) immobilisés' },
        { v: 'mieux', lib: 'Que le stock serait mieux géré' }, { v: 'ventes', lib: 'Que les ventes auraient doublé' }],
      juste: 'double', retour: 'Mêmes sorties, rotation divisée par deux : le stock moyen a doublé. Une rotation qui baisse, c’est du stock qui dort.' },
    { id: 'couverture-delai', type: 'fil', de: 'sandrine', groupe: 'Les indicateurs', quand: (db) => T.juste(db, 'alerte'),
      enonce: 'CT-INT-02 tient 2 jours ; sa production met 3 jours à arriver. Que faut-il faire aujourd’hui ?',
      choix: [{ v: 'avancer', lib: 'Demander à l’usine d’avancer sa prochaine production, et prévenir les clients s’il le faut' },
        { v: 'attendre', lib: 'Attendre la prochaine production prévue' }, { v: 'rien', lib: 'Rien : 2 jours, c’est suffisant' }],
      juste: 'avancer', retour: 'Il manquerait un jour : on agit tout de suite sur le lancement, sans attendre la rupture.' },
    { id: 'cout-surstock', type: 'fil', de: 'sandrine', groupe: 'Les indicateurs', quand: T.depose,
      enonce: 'Pourquoi un surstock coûte-t-il de l’argent à l’entreprise ?',
      choix: [{ v: 'immobilise', lib: 'Il immobilise de l’argent et de la place, et les sacs se rapprochent de leur DDM' },
        { v: 'rien', lib: 'Il ne coûte rien : les sacs sont déjà fabriqués' }, { v: 'taxe', lib: 'Parce qu’il est taxé chaque jour' }],
      juste: 'immobilise', retour: 'Un sac qui dort a été payé (matières, fabrication), occupe un emplacement, et vieillit.' },
    { id: 'gaspillage', type: 'fil', de: 'sandrine', reflexion: true, quand: apresMail({ a: MAIL_SANDRINE }),
      enonce: 'Des sacs en surstock approchent de leur DDM. Que vaut-il mieux en faire ?',
      choix: [{ v: 'donner', lib: 'Les vendre moins cher ou les donner (refuges, associations) plutôt que les jeter' },
        { v: 'jeter', lib: 'Les jeter avant la date' }, { v: 'garder', lib: 'Les garder en stock après la date' }],
      retour: 'La loi anti-gaspillage de 2020 (loi AGEC) pousse à ne plus détruire ce qui peut servir : vendre, déstocker ou donner avant de jeter.' },
  ],
};
