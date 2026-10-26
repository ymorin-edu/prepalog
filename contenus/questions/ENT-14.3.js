// Les questions d'ENT-14.3 — Lactalis, « le lot oublié » (erreur induite). Décidées par Claude (délégation de Tristan du 26/10/2026).
// 3 questions notées au fil (part 4 sur 20) et une réflexion. « Avant de commencer » : banque commune de `contenus/lactalis.js` (non notée).

import { apresGeste, apresFiche, apresMail } from '../../core/declencheurs.js';
import { BANQUE, OUVERTURE, PERSONNES, MAIL_QUALITE } from '../lactalis.js';

const F = 'releve-143';

export const QUESTIONS = {
  id: 'lactalis-lot-oublie',
  part: 4,
  personnes: PERSONNES,
  ouverture: OUVERTURE(),
  liste: [
    ...BANQUE,
    { id: 'le-15', type: 'fil', de: 'julien', groupe: 'Le relevé contrôlé', quand: apresGeste(`fiche:${F}:oublies`),
      enonce: 'Un lot fabriqué le 15 février 2017 : est-il visé par « fabriqué depuis le 15 février 2017 » ?',
      choix: [{ v: 'oui', lib: 'Oui : « depuis le 15 » comprend le 15' }, { v: 'non', lib: 'Non : seulement à partir du 16' }, { v: 'moitie', lib: 'Seulement s’il a été fabriqué l’après-midi' }],
      juste: 'oui', retour: '« Depuis le 15 février », c’est le 15 compris. Une borne mal lue, et c’est un lot entier qui reste en vente.' },
    { id: 'apres-avis', type: 'fil', de: 'julien', groupe: 'Le relevé contrôlé', quand: apresGeste(`fiche:${F}:apres`),
      enonce: 'Le magasin d’Ernée a reçu des boîtes de ce lot le 26 décembre, après l’avis. Que risque-t-on ?',
      choix: [{ v: 'vendu', lib: 'Que des boîtes rappelées soient vendues à des familles' }, { v: 'rien', lib: 'Rien : l’avis est passé' },
        { v: 'retard', lib: 'Un retard de livraison' }],
      juste: 'vendu', retour: 'C’est exactement ce qui est arrivé en 2017 : des enseignes ont vendu des boîtes après le rappel. Ernée doit être prévenu en premier.' },
    { id: 'double-controle', type: 'fil', de: 'julien', groupe: 'Le relevé contrôlé', quand: apresFiche(F),
      enonce: 'Que mettre en place pour qu’un oubli comme celui de Théo ne se reproduise pas ?',
      choix: [{ v: 'double', lib: 'Faire relire chaque relevé par une deuxième personne avant l’envoi' }, { v: 'seul', lib: 'Que Théo ne traite plus jamais d’avis' },
        { v: 'rien', lib: 'Rien : une erreur arrive à tout le monde' }],
      juste: 'double', retour: 'Le double contrôle attrape l’erreur avant qu’elle parte. Changer de personne ne protège de rien : la borne aurait pu être mal lue par n’importe qui.' },
    { id: 'dire-erreur', type: 'fil', de: 'julien', reflexion: true, quand: apresMail({ a: MAIL_QUALITE }),
      enonce: 'Faut-il dire au service qualité que le premier relevé était faux ?',
      choix: [{ v: 'oui', lib: 'Oui : il doit savoir quels magasins prévenir, l’erreur se corrige ouvertement' },
        { v: 'non', lib: 'Non : on corrige sans rien dire' }, { v: 'theo', lib: 'Oui, et dire que c’est la faute de Théo' }],
      retour: 'On dit l’erreur et sa correction, sans chercher de coupable : le service qualité a besoin de la liste juste, pas d’un nom.' },
  ],
};
