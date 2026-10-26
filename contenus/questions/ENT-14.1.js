// Les questions d'ENT-14.1 — Lactalis, « douze lots rappelés » (guidage). Décidées par Claude (délégation de Tristan du 26/10/2026, fil « Proposer les
// prochains blocs »). Julien est CONSTRUIT. 3 questions notées au fil (part 4 sur 20) et une réflexion d'éco-droit (règlement 178/2002, art. 19).
// « Avant de commencer » : non noté, 3 questions tirées (2 de préparation, 1 de droit) parmi 6 (banque commune de `contenus/lactalis.js`).

import { apresGeste, apresFiche, apresMail } from '../../core/declencheurs.js';
import { BANQUE, OUVERTURE, PERSONNES, MAIL_QUALITE } from '../lactalis.js';

const F = 'releve-141';

export const QUESTIONS = {
  id: 'lactalis-douze-lots',
  part: 4,
  personnes: PERSONNES,
  ouverture: OUVERTURE(),
  liste: [
    ...BANQUE,
    { id: 'ou-chercher', type: 'fil', de: 'julien', groupe: 'L’amont : les lots', quand: apresGeste(`fiche:${F}:lots`),
      enonce: 'Pour savoir si un lot de l’avis est passé chez nous, dans quel document le cherches-tu ?',
      choix: [{ v: 'rec', lib: 'Le registre des réceptions' }, { v: 'exp', lib: 'Le registre des expéditions' }, { v: 'avis', lib: 'L’avis de rappel' }],
      juste: 'rec', retour: 'Un lot passé chez nous est forcément ENTRÉ un jour : la réception est le premier maillon. Un lot absent des réceptions n’est jamais venu ici.' },
    { id: 'parti-en-entier', type: 'fil', de: 'julien', groupe: 'L’aval : les magasins', quand: apresGeste(`fiche:${F}:magasins`),
      enonce: 'Le lot CR-170905-A est parti en entier vers les magasins. Que faut-il faire pour lui ?',
      choix: [{ v: 'prevenir', lib: 'Prévenir les magasins qui l’ont reçu, pour qu’ils retirent les boîtes' }, { v: 'rien', lib: 'Rien : il n’est plus chez nous' },
        { v: 'bloquer', lib: 'Le bloquer dans notre stock' }],
      juste: 'prevenir', retour: 'Plus rien à bloquer ici, mais 120 boîtes sont dans deux magasins : si on ne les prévient pas, elles restent en rayon et des familles les achètent.' },
    { id: 'par-lot', type: 'fil', de: 'julien', groupe: 'Le stock bloqué', quand: apresFiche(F),
      enonce: 'Nous avons deux lots de Picot 1er âge en stock. Pourquoi bloques-tu par lot, et pas toute la référence PIC1-800 ?',
      choix: [{ v: 'lot', lib: 'Le lot CR-171012-B n’est pas dans l’avis : il reste vendable' }, { v: 'vite', lib: 'C’est plus rapide' },
        { v: 'ecran', lib: 'L’écran ne permet pas de bloquer une référence entière' }],
      juste: 'lot', retour: 'Bloquer toute la référence retirerait des boîtes saines des rayons : la traçabilité sert justement à ne retirer que ce qui est en cause.' },
    { id: 'attendre', type: 'fil', de: 'julien', reflexion: true, quand: apresMail({ a: MAIL_QUALITE }),
      enonce: 'Un magasin répond : « On attend que Lactalis nous écrive avant de retirer les boîtes. » Qu’en penses-tu ?',
      choix: [{ v: 'non', lib: 'Il ne doit pas attendre : il distribue ce lait, l’article 19 l’oblige à retirer tout de suite' },
        { v: 'oui', lib: 'Il a raison, c’est le fabricant qui décide' }, { v: 'vendre', lib: 'Il peut finir de vendre ce qui est en rayon' }],
      retour: 'L’article 19 vise aussi celui qui distribue : dès qu’il a des raisons de penser que le produit est dangereux, il retire. Attendre, c’est laisser des boîtes en rayon.' },
  ],
};
