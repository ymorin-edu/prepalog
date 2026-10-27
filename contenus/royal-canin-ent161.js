// ENT-16.1 — Royal Canin, « lire les indicateurs du stock » : GUIDAGE de C1.6 (gérer le suivi des stocks), Terminale, AU TABLEUR (décision de Tristan du 27/10/2026).
// Lundi 2 novembre : l'état du stock d'octobre, vingt références d'Aimargues, le même jeu pour tous. L'élève l'exporte (Extractions), calcule dans son tableur
// le stock moyen, la rotation, la consommation par jour, la couverture, l'alerte (SI) et le taux de service, dépose son fichier (retour détaillé, redépôt
// illimité), puis rend compte à Sandrine (la plus urgente des ruptures, les surstocks).
// Univers et fabrique : `contenus/royal-canin.js` ; geste tableur : `T161` de `contenus/royal-canin-tableur.js` ; données : `D161` de
// `contenus/royal-canin-donnees.js` ; questions : `contenus/questions/ENT-16.1.js`.
//
// Poids (décidés par Claude, délégation de Tristan du 26/10/2026, refaits le 27/10 pour le tableur) : stock moyen 1 · rotation 2,5 · consommation par
// jour 1 · couverture 3 · alerte 3,5 · taux de service 2 · compte rendu 3 · questions au fil 4 = 20.

import { seance } from './royal-canin.js';
import { D161 } from './royal-canin-donnees.js';
import { T161 } from './royal-canin-tableur.js';
import { QUESTIONS } from './questions/ENT-16.1.js';

export * from './royal-canin.js';

const S = seance(D161, {
  id: 'royal-canin-indicateurs',
  K: { ind: true },
  tab: T161,
  jalonsTab: [
    { id: 'moyen', titre: 'Le stock moyen (formule)', controles: ['moyen'], poids: 1 },
    { id: 'rotation', titre: 'La rotation (formule)', controles: ['rotation'], poids: 2.5 },
    { id: 'conso', titre: 'La consommation par jour (formule)', controles: ['conso'], poids: 1 },
    { id: 'couverture', titre: 'La couverture (formule)', controles: ['couverture'], poids: 3 },
    { id: 'alerte', titre: 'L’alerte de chaque référence (fonction SI)', controles: ['alerte'], poids: 3.5 },
    { id: 'service', titre: 'Le taux de service (formule, en %)', controles: ['service'], poids: 2 },
  ],
  poids: { 'compte-rendu': 3 },
  titre: 'Lire les indicateurs du stock',
  objet: 'Les indicateurs d’octobre',
  consigne: 'Le mois d’octobre est clos. J’ai besoin des indicateurs du stock pour la réunion de production de cet après-midi.\n\n'
    + '1. Menu Extractions, liste « État du stock — octobre » : clique sur Exporter. Tu obtiens un fichier Excel : une ligne par référence, et une feuille « Commandes ».\n'
    + '2. Ouvre-le dans Excel ou LibreOffice. Lis la fiche méthode jointe : ajoute les colonnes Stock moyen, Rotation, Conso par jour, Couverture et Alerte, avec des formules recopiées vers le bas.\n'
    + '3. Alerte : avec la fonction SI, « Rupture » si la couverture est plus petite que le délai, sinon « Surstock » si elle dépasse 15 jours, sinon « OK ».\n'
    + '4. Feuille Commandes : le taux de service, au format pourcentage.\n'
    + '5. Enregistre en .xlsx et dépose ton fichier dans le menu Fichiers : le site te dit ce qui est juste et ce qui cloche. Tu peux corriger et redéposer autant de fois que tu veux.\n\n'
    + 'Ensuite, écris-moi ton compte rendu.',
  poste: '<p>Ton travail aujourd’hui : <b>calculer les indicateurs</b> du stock du mois dans le tableur (rotation, couverture, taux de service), repérer les alertes, et dire à Sandrine <b>quoi faire</b> : avancer une production, en retarder une autre.</p>',
  etape: '',
  questions: QUESTIONS,
});
export const { ID, FICHE_ID, PHRASES_ID, VOLET_ID, DOCUMENTS, FICHE, VOLET, ETAPES, PASTILLES, SUITE, ACCUEIL, OPTIONS } = S;
export const TIRAGE = S.TIRAGE || undefined;
