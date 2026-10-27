// Les questions d'ENT-16.2 — Royal Canin, « les indicateurs de novembre » (entraînement). Décidées par Claude (délégation de Tristan du 26/10/2026).
// 3 questions notées au fil (part 4 sur 20) et une réflexion d'éco-droit (la fréquence des transports). « Avant de commencer » : non noté.

import { apresGeste, apresFiche, apresMail } from '../../core/declencheurs.js';
import { BANQUE, OUVERTURE, PERSONNES, MAIL_SANDRINE } from '../royal-canin.js';

const F = 'fiche-162';

export const QUESTIONS = {
  id: 'royal-canin-indicateurs-novembre',
  part: 4,
  personnes: PERSONNES,
  ouverture: OUVERTURE(),
  liste: [
    ...BANQUE,
    { id: 'pas-rupture', type: 'fil', de: 'sandrine', groupe: 'Les indicateurs', quand: apresGeste(`fiche:${F}:rupture`),
      enonce: 'CT-INT-02 a 4 jours de couverture pour 3 jours de délai. Est-ce un risque de rupture ?',
      choix: [{ v: 'non', lib: 'Non : le stock tient plus longtemps que le délai, la prochaine production arrive avant' },
        { v: 'oui', lib: 'Oui : 4 jours, c’est très peu' }, { v: 'egal', lib: 'Oui, dès que la couverture est sous 5 jours' }],
      juste: 'non', retour: 'On compare la couverture au délai de la référence, pas à un chiffre fixe : 4 jours de stock pour 3 jours de délai, ça passe.' },
    { id: 'lent', type: 'fil', de: 'sandrine', groupe: 'Les indicateurs', quand: apresGeste(`fiche:${F}:surstock`),
      enonce: 'VET-DIG-10 a 20 jours de couverture. Pourquoi un aliment vétérinaire tourne-t-il souvent lentement ?',
      choix: [{ v: 'specialise', lib: 'Il se vend sur conseil du vétérinaire, à peu d’animaux : la demande est faible' },
        { v: 'lourd', lib: 'Parce que le sac est lourd' }, { v: 'cher', lib: 'Parce qu’il est rangé en hauteur' }],
      juste: 'specialise', retour: 'Peu de demande, donc peu de sorties : il faut produire de petites quantités, moins souvent.' },
    { id: 'usine', type: 'fil', de: 'sandrine', groupe: 'Les indicateurs', quand: apresFiche(F),
      enonce: 'CH-MIN-08 n’a plus que 2 jours de stock pour 4 jours de délai. Que demandes-tu à l’usine ?',
      choix: [{ v: 'avancer', lib: 'D’avancer sa production, en priorité' }, { v: 'retarder', lib: 'De retarder sa production' },
        { v: 'rien', lib: 'Rien : la production viendra' }],
      juste: 'avancer', retour: 'Deux jours sans sacs à livrer sinon : on avance, et on prévient les clients si on n’y arrive pas.' },
    { id: 'camions', type: 'fil', de: 'sandrine', reflexion: true, quand: apresMail({ a: MAIL_SANDRINE }),
      enonce: 'Un client veut être livré tous les jours en petites quantités pour avoir moins de stock. Quel est le revers ?',
      choix: [{ v: 'camions', lib: 'Plus de camions à moitié vides sur la route : plus de coûts et plus d’émissions' },
        { v: 'aucun', lib: 'Aucun' }, { v: 'qualite', lib: 'Les croquettes s’abîment' }],
      retour: 'Moins de stock chez le client, plus de transport : on cherche l’équilibre (regrouper, remplir les camions).' },
  ],
};
