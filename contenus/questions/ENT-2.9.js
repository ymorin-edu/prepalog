// Les questions d'ENT-2.9 — Cdiscount, « le calcul de Yanis » (erreur induite). Décidées par Claude (délégation de Tristan du 26/10/2026).
// 3 questions notées au fil (part 4 sur 20) et une réflexion d'éco-droit (l'intérim, la durée du travail). « Avant de commencer » : non noté.

import { apresGeste, apresFiche, apresMail } from '../../core/declencheurs.js';
import { BANQUE, OUVERTURE, PERSONNES, MAIL_NADIA } from '../cdiscount-noel.js';

const F = 'fiche-29';

export const QUESTIONS = {
  id: 'cdiscount-calcul-yanis',
  part: 4,
  personnes: PERSONNES,
  ouverture: OUVERTURE(),
  liste: [
    ...BANQUE,
    { id: 'lignes-pas-colis', type: 'fil', de: 'nadia', groupe: 'Le calcul de Yanis', quand: apresGeste(`fiche:${F}:erreurs`),
      enonce: 'Pourquoi compter en lignes et pas en colis ?',
      choix: [{ v: 'marche', lib: 'Chaque ligne demande d’aller chercher un article ; un colis peut en contenir plusieurs' },
        { v: 'pareil', lib: 'C’est pareil, un colis = une ligne' }, { v: 'moins', lib: 'Parce qu’il y a moins de lignes que de colis' }],
      juste: 'marche', retour: '9 600 lignes pour 6 000 colis : 1,6 ligne par colis. La productivité de la zone est mesurée en lignes, le calcul doit l’être aussi.' },
    { id: 'arrondi', type: 'fil', de: 'nadia', groupe: 'Le bon calcul', quand: apresGeste(`fiche:${F}:besoin`),
      enonce: 'Le calcul donne 22,86 préparateurs. Pourquoi en prévoir 23 et pas 22 ?',
      choix: [{ v: 'reste', lib: 'Avec 22, une partie des lignes ne serait pas préparée' }, { v: 'pair', lib: 'Pour avoir un nombre impair' },
        { v: 'marge', lib: 'Pour avoir quelqu’un en plus au cas où' }],
      juste: 'reste', retour: '22 préparateurs font 9 240 lignes : il en manquerait 360. On arrondit toujours au-dessus quand on calcule un effectif.' },
    { id: 'dire-erreur', type: 'fil', de: 'nadia', groupe: 'Le bon calcul', quand: apresFiche(F),
      enonce: 'Tu as trouvé une erreur dans le calcul d’un collègue. Que fais-tu ?',
      choix: [{ v: 'dire', lib: 'Je le dis à Nadia et à Yanis, avec le calcul juste' }, { v: 'corriger', lib: 'Je corrige sa feuille sans rien dire' },
        { v: 'rien', lib: 'Rien : c’est son travail' }],
      juste: 'dire', retour: 'Une erreur se dit, calcul à l’appui, sans reproche : Yanis comprend, et la demande à l’agence part juste.' },
    { id: 'pas-assez', type: 'fil', de: 'nadia', reflexion: true, quand: apresMail({ a: MAIL_NADIA }),
      enonce: 'L’agence d’intérim ne trouve que 10 intérimaires sur 14. Que proposerais-tu ?',
      choix: [{ v: 'heures', lib: 'Des heures supplémentaires aux permanents, dans les limites de la durée du travail, et décaler des commandes non urgentes' },
        { v: '14h', lib: 'Faire travailler les intérimaires 14 heures' }, { v: 'rien', lib: 'Rien : les clients attendront' }],
      retour: 'La durée du travail a des limites (en général 10 heures par jour au plus). On combine : heures supplémentaires raisonnables, priorités entre commandes, et on prévient les clients si un délai glisse.' },
  ],
};
