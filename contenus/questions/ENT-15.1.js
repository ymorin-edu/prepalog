// Les questions d'ENT-15.1 — Syngenta, « ranger selon le danger » (guidage). Décidées par Claude (délégation de Tristan du 26/10/2026, fil « Proposer les
// prochains blocs »). Karim est CONSTRUIT. 3 questions notées au fil (part 4 sur 20) et une réflexion d'éco-droit (l'information du public, Seveso).
// « Avant de commencer » : non noté, 3 questions tirées (2 de préparation, 1 de droit) parmi 6 (banque commune de `contenus/syngenta.js`).

import { apresGeste, apresFiche, apresMail } from '../../core/declencheurs.js';
import { BANQUE, OUVERTURE, PERSONNES, MAIL_KARIM } from '../syngenta.js';

const F = 'rangement-151';

export const QUESTIONS = {
  id: 'syngenta-ranger',
  part: 4,
  personnes: PERSONNES,
  ouverture: OUVERTURE(),
  liste: [
    ...BANQUE,
    { id: 'flamme-dabord', type: 'fil', de: 'karim', groupe: 'Le rangement', quand: apresGeste(`fiche:${F}:pal5`),
      enonce: 'IN-050 porte la flamme ET la tête de mort. Pourquoi la règle l’envoie-t-elle en cellule 1 ?',
      choix: [{ v: 'feu', lib: 'Un incendie dans la cellule des toxiques serait le pire : le risque de feu passe en premier' },
        { v: 'place', lib: 'Parce qu’il reste plus de place en cellule 1' }, { v: 'hasard', lib: 'C’est au choix du magasinier' }],
      juste: 'feu', retour: 'Un produit inflammable doit être avec les inflammables, là où tout est prévu contre le feu (et où la rétention est plus grande).' },
    { id: 'pourquoi-50', type: 'fil', de: 'karim', groupe: 'La rétention', quand: apresGeste(`fiche:${F}:ret-C1`),
      enonce: 'Pourquoi la cellule 1 demande-t-elle une rétention plus grande (50 %) que les autres (20 %) ?',
      choix: [{ v: 'feu', lib: 'Un liquide inflammable qui s’étale peut s’enflammer : il faut en retenir davantage' },
        { v: 'cher', lib: 'Les inflammables coûtent plus cher' }, { v: 'gros', lib: 'Les bidons sont plus gros' }],
      juste: 'feu', retour: 'Plus le liquide est dangereux s’il s’échappe, plus on prévoit grand pour le retenir.' },
    { id: 'fuite', type: 'fil', de: 'karim', groupe: 'Le rangement', quand: apresFiche(F),
      enonce: 'En rangeant, tu vois un bidon de PAL-3 fendu qui coule. Que fais-tu d’abord ?',
      choix: [{ v: 'alerter', lib: 'Je m’écarte, je préviens et j’applique la consigne de fuite (protections, absorbant)' },
        { v: 'essuyer', lib: 'J’essuie avec un chiffon' }, { v: 'ranger', lib: 'Je range la palette et j’en parle plus tard' }],
      juste: 'alerter', retour: 'IN-200 est toxique : on ne le touche pas sans protection. On se protège, on alerte, puis on suit la consigne.' },
    { id: 'riverains', type: 'fil', de: 'karim', reflexion: true, quand: apresMail({ a: MAIL_KARIM }),
      enonce: 'Des voisins de l’usine veulent savoir quels dangers il y a sur le site. Ont-ils le droit de le savoir ?',
      choix: [{ v: 'oui', lib: 'Oui : un site Seveso seuil haut doit informer le public' }, { v: 'non', lib: 'Non : c’est un secret de l’entreprise' },
        { v: 'police', lib: 'Seulement la police' }],
      retour: 'Le public doit être informé : la fiche d’information de l’usine d’Aigues-Vives se lit sur le site Géorisques.' },
  ],
};
