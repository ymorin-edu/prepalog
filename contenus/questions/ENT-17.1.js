// Les questions d'ENT-17.1 — La Redoute (guidage). Décidées par Claude (délégation de Tristan du 26/10/2026, fil « Proposer les prochains
// blocs »). Claire et Julien sont CONSTRUITS. 3 questions notées au fil (part 4 sur 20) et une réflexion d'éco-droit (la réduction à la source).
// « Avant de commencer » : non noté, 3 questions tirées (2 de préparation, 1 de droit) parmi 6 (banque commune de `contenus/la-redoute.js`).

import { apresGeste, apresFiche, apresMail } from '../../core/declencheurs.js';
import { BANQUE, OUVERTURE, PERSONNES, MAIL_CLAIRE } from '../la-redoute.js';

const F = 'fiche-171';

export const QUESTIONS = {
  id: 'la-redoute-emballage',
  part: 4,
  personnes: PERSONNES,
  ouverture: OUVERTURE(),
  liste: [
    ...BANQUE,
    { id: 'pochette-ou-carton', type: 'fil', de: 'claire', groupe: 'L’emballage', quand: apresGeste(`fiche:${F}:fmt-C-1702`),
      enonce: 'C-1702 (un jean et un pull) n’a que du textile. Pourquoi pas la pochette ?',
      choix: [{ v: 'volume', lib: 'Jean et pull font 5 L : plus que les 4 L de la pochette' }, { v: 'fragile', lib: 'Parce que le jean est fragile' }, { v: 'poids', lib: 'Parce que la pochette ne supporte pas le poids' }],
      juste: 'volume', retour: 'Tout souple ne suffit pas : il faut aussi que le volume tienne. On passe au plus petit carton, le S.' },
    { id: 'vide-cout', type: 'fil', de: 'claire', groupe: 'L’emballage', quand: apresGeste(`fiche:${F}:vide-C-1705`),
      enonce: 'Le vide ne pèse rien. Pourquoi coûte-t-il quand même ?',
      choix: [{ v: 'camion', lib: 'Moins de colis tiennent dans un camion, et il faut plus de carton et de calage' }, { v: 'rien', lib: 'Il ne coûte rien' }, { v: 'client', lib: 'Le client paie le vide' }],
      juste: 'camion', retour: 'On transporte de l’air : plus de camions pour le même nombre de commandes.' },
    { id: 'reduire', type: 'fil', de: 'claire', groupe: 'L’emballage', quand: apresFiche(F),
      enonce: 'Le carton se recycle. Faut-il quand même en utiliser moins ?',
      choix: [{ v: 'reduire', lib: 'Oui : le meilleur déchet est celui qu’on ne produit pas, on réduit avant de recycler' }, { v: 'non', lib: 'Non : puisqu’il se recycle, peu importe' }, { v: 'plus', lib: 'Non : plus de carton protège mieux' }],
      juste: 'reduire', retour: 'Réduire, puis réemployer, puis recycler : dans cet ordre.' },
    { id: 'qui-gagne', type: 'fil', de: 'claire', reflexion: true, quand: apresMail({ a: MAIL_CLAIRE }),
      enonce: 'À qui profitent des colis plus petits ?',
      choix: [{ v: 'tous', lib: 'À l’entreprise, au transporteur, au client et à l’environnement' }, { v: 'personne', lib: 'À personne' }, { v: 'client', lib: 'Seulement au client' }],
      retour: 'Moins de carton à acheter, plus de colis par camion, moins de déchets chez le client : tout le monde y gagne.' },
  ],
};
