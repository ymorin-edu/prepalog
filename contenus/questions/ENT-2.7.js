// Les questions d'ENT-2.7 — Cdiscount, « les bons articles au bon endroit » (guidage). Décidées par Claude (délégation de Tristan du 26/10/2026, fil
// « Proposer les prochains blocs »). Nadia est CONSTRUITE. 3 questions notées au fil (part 4 sur 20) et une réflexion d'éco-droit (l'intérim, art. L1251-6).
// « Avant de commencer » : non noté, 3 questions tirées (2 de préparation, 1 de droit) parmi 6 (banque commune de `contenus/cdiscount-noel.js`).

import { apresGeste, apresFiche, apresMail } from '../../core/declencheurs.js';
import { BANQUE, OUVERTURE, PERSONNES, MAIL_NADIA } from '../cdiscount-noel.js';

const F = 'fiche-27';

export const QUESTIONS = {
  id: 'cdiscount-bon-endroit',
  part: 4,
  personnes: PERSONNES,
  ouverture: OUVERTURE(),
  liste: [
    ...BANQUE,
    { id: 'trier-dabord', type: 'fil', de: 'nadia', groupe: 'La classe A', quand: apresGeste(`fiche:${F}:classeA`),
      enonce: 'L’export est rangé par emplacement. Que fais-tu d’abord pour trouver la classe A ?',
      choix: [{ v: 'trier', lib: 'Je range les références de la plus demandée à la moins demandée' }, { v: 'haut', lib: 'Je prends les premières lignes de l’export' },
        { v: 'prix', lib: 'Je prends les articles les plus chers' }],
      juste: 'trier', retour: 'L’ordre des emplacements ne dit rien de la demande : il faut d’abord trier par nombre de lignes, puis additionner.' },
    { id: 'pourquoi-pres', type: 'fil', de: 'nadia', groupe: 'L’implantation', quand: apresGeste(`fiche:${F}:m1`),
      enonce: 'Pourquoi mettre la référence la plus demandée au plus près du poste, et pas la deuxième ?',
      choix: [{ v: 'marche', lib: 'Chaque ligne est un aller-retour : plus elle a de lignes, plus chaque mètre gagné compte' },
        { v: 'place', lib: 'Elle prend plus de place' }, { v: 'egal', lib: 'Ça ne change rien, l’important est qu’elles soient toutes près' }],
      juste: 'marche', retour: 'Un mètre de moins sur 700 lignes, c’est 1 400 m gagnés ; sur 380 lignes, 760 m seulement.' },
    { id: 'les-pousses', type: 'fil', de: 'nadia', groupe: 'L’implantation', quand: apresFiche(F),
      enonce: 'Les piles, la veilleuse et la corde à sauter partent au fond de l’allée. On y perd ?',
      choix: [{ v: 'peu', lib: 'Un peu, mais elles ont peu de lignes : on gagne beaucoup plus qu’on ne perd' }, { v: 'beaucoup', lib: 'Oui, autant qu’on gagne' },
        { v: 'rien', lib: 'Rien du tout : elles ne sont jamais commandées' }],
      juste: 'peu', retour: 'Elles font 75 lignes à elles trois dans la semaine, contre 1 600 pour la classe A : le calcul penche nettement d’un côté.' },
    { id: 'interim-motif', type: 'fil', de: 'nadia', reflexion: true, quand: apresMail({ a: MAIL_NADIA }),
      enonce: 'Pour le pic, l’entrepôt prend surtout des intérimaires, pas des CDI. Pourquoi, à ton avis ?',
      choix: [{ v: 'temporaire', lib: 'Le pic passe en quelques semaines : c’est un besoin temporaire' }, { v: 'cher', lib: 'Un CDI coûte toujours plus cher' },
        { v: 'interdit', lib: 'La loi interdit d’embaucher en CDI en décembre' }],
      retour: 'L’intérim répond à un besoin précis et temporaire (Code du travail, art. L1251-6). Une implantation logique aide aussi l’intérimaire qui arrive : il trouve vite les articles qui sortent le plus.' },
  ],
};
