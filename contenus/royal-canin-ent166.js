// ENT-16.6 — Royal Canin, « évaluation : piloter l’entrepôt » : ÉVALUATION de C1.6, C2.2 et C3.1, Terminale, copie rendue.
// Jeudi 1er avril 2027 : jeu NEUF, seul(e) ; les indicateurs de mars AU TABLEUR (valeurs tirées pour chaque élève, Cambrai à écarter, un seul dépôt, aucune
// indication ; décision de Tristan du 27/10/2026), l'implantation de deux références et une commande export avec exigence de DDM sur la fiche.
// Univers et fabrique : `contenus/royal-canin.js` ; geste tableur et tirage : `T166` de `contenus/royal-canin-tableur.js` ; données : `D166` de
// `contenus/royal-canin-donnees.js` ; questions : `contenus/questions/ENT-16.6.js`.
//
// Poids (décidés par Claude, délégation de Tristan du 26/10/2026, refaits le 27/10 pour le tableur) : bon export 1 · stock moyen et rotation 1,5 ·
// consommation et couverture 2 · alerte 2,5 · taux de service 1 · chaque référence dans sa zone 1,5 (× 2) · lots choisis 2 · palettes par lot 2 ·
// compte rendu 2 · « Avant de commencer » noté 3 = 20.

import { seance } from './royal-canin.js';
import { D166 } from './royal-canin-donnees.js';
import { T166 } from './royal-canin-tableur.js';
import { QUESTIONS } from './questions/ENT-16.6.js';

export * from './royal-canin.js';

const S = seance(D166, {
  id: 'royal-canin-evaluation',
  K: { ind: true, impl: true, export: true },
  tab: T166,
  jalonsTab: [
    { id: 'rotation', titre: 'Le stock moyen et la rotation', controles: ['moyen', 'rotation'], poids: 1.5 },
    { id: 'couverture', titre: 'La consommation par jour et la couverture', controles: ['conso', 'couverture'], poids: 2 },
    { id: 'alerte', titre: 'L’alerte de chaque référence', controles: ['alerte'], poids: 2.5 },
    { id: 'service', titre: 'Le taux de service', controles: ['service'], poids: 1 },
  ],
  poids: { export: 1, zone: 1.5, lots: 2, quantites: 2, 'compte-rendu': 2 },
  titre: 'Évaluation : piloter l’entrepôt',
  objet: 'Le point d’avril : à toi seul(e)',
  consigne: 'Je suis en réunion toute la matinée. Tu t’occupes seul(e) du point d’avril :\n\n'
    + '• les indicateurs de mars, dans ton tableur, à partir de l’extraction « État du stock — mars » (nos références d’Aimargues seulement), puis le dépôt de ton fichier dans le menu Fichiers : tu n’as droit qu’à un dépôt, vérifie avant ;\n'
    + '• sur la fiche de travail : la zone de deux références et la commande export de cet après-midi.\n\n'
    + 'Ensuite, écris-moi ton compte rendu et rends ta copie : tu ne pourras plus rien modifier.',
  poste: '<p>Ton travail aujourd’hui : les trois gestes, <b>seul(e)</b>. C’est une <b>évaluation</b> : rien n’est corrigé avant que tu rendes ta copie.</p>',
  etape: 'La zone des deux références, puis la commande export.',
  questions: QUESTIONS,
});
export const { ID, FICHE_ID, PHRASES_ID, VOLET_ID, DOCUMENTS, FICHE, VOLET, ETAPES, PASTILLES, SUITE, ACCUEIL, OPTIONS } = S;
export const TIRAGE = S.TIRAGE || undefined;
