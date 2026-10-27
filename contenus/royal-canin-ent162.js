// ENT-16.2 — Royal Canin, « les indicateurs de novembre » : ENTRAÎNEMENT de C1.6 (gérer le suivi des stocks), Terminale, AU TABLEUR (décision de Tristan du 27/10/2026).
// Mardi 1er décembre : l'extraction du WMS France mélange Aimargues et Cambrai ; l'élève ne garde qu'Aimargues (critère « Site »), refait seul le calcul du
// mois dernier sur 24 références dont les valeurs sont TIRÉES pour lui, dépose (retour « n justes sur m »), puis rend compte.
// Univers et fabrique : `contenus/royal-canin.js` ; geste tableur et tirage : `T162` de `contenus/royal-canin-tableur.js` ; questions : `contenus/questions/ENT-16.2.js`.
//
// Poids (décidés par Claude, délégation de Tristan du 26/10/2026, refaits le 27/10 pour le tableur) : bon export 2 · stock moyen et rotation 2,5 ·
// consommation et couverture 3 · alerte 3,5 · taux de service 1,5 · compte rendu 3,5 · questions au fil 4 = 20.

import { seance } from './royal-canin.js';
import { D162 } from './royal-canin-donnees.js';
import { T162 } from './royal-canin-tableur.js';
import { QUESTIONS } from './questions/ENT-16.2.js';

export * from './royal-canin.js';

const S = seance(D162, {
  id: 'royal-canin-indicateurs-novembre',
  K: { ind: true },
  tab: T162,
  jalonsTab: [
    { id: 'rotation', titre: 'Le stock moyen et la rotation (formules)', controles: ['moyen', 'rotation'], poids: 2.5 },
    { id: 'couverture', titre: 'La consommation par jour et la couverture (formules)', controles: ['conso', 'couverture'], poids: 3 },
    { id: 'alerte', titre: 'L’alerte de chaque référence (fonction SI)', controles: ['alerte'], poids: 3.5 },
    { id: 'service', titre: 'Le taux de service (formule, en %)', controles: ['service'], poids: 1.5 },
  ],
  poids: { export: 2, 'compte-rendu': 3.5 },
  titre: 'Les indicateurs de novembre',
  objet: 'Les indicateurs de novembre',
  consigne: 'Novembre est clos, et le pic de fin d’année approche. Même travail que le mois dernier, seul(e) cette fois.\n\n'
    + 'Attention : l’extraction « État du stock — novembre » sort du WMS France, qui mélange nos références et celles de l’usine de Cambrai. Je ne veux que celles d’Aimargues.\n\n'
    + 'Exporte, calcule dans ton tableur (tu peux reprendre tes formules d’octobre), dépose ton fichier dans le menu Fichiers, puis écris-moi ton compte rendu.',
  poste: '<p>Ton travail aujourd’hui : les <b>indicateurs du stock</b> de novembre, seul(e) avec la fiche méthode, et ce qu’il faut en <b>décider</b>.</p>',
  etape: '',
  questions: QUESTIONS,
});
export const { ID, FICHE_ID, PHRASES_ID, VOLET_ID, DOCUMENTS, FICHE, VOLET, ETAPES, PASTILLES, SUITE, ACCUEIL, OPTIONS } = S;
export const TIRAGE = S.TIRAGE || undefined;
