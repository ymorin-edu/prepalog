// ENT-20.2 — Leroy Merlin, « au quai et dans les allées » : ENTRAÎNEMENT de C1.2, 1re Bac Pro. Le protocole de sécurité au quai dans l'ordre ;
// quatre situations (risque et mesure) ; le niveau de trois mesures ; les taux de fréquence et de gravité de l'année et la première cause.
// Univers : `contenus/leroy-merlin.js` ; données : `QUAI`, `SITUATIONS`, `ACC202`, `CAUSES202` ; questions : `contenus/questions/ENT-20.2.js`.
//
// Poids (décidés par Claude, délégation de Tristan du 26/10/2026) : le protocole 3 (0,5 × 6) · les situations 6 (risque 0,75 + mesure 0,75, × 4) ·
// les niveaux 1,5 (0,5 × 3) · les taux 3 (1,5 × 2) · la première cause 1 · compte rendu 1,5 · questions au fil 4 = 20.

import { seanceFiches } from './fabrique-fiches.js';
import { U_SECU, SALUT, FIN } from './leroy-merlin-commun.js';
import { DOC_SITE, DOC_PREVENTION, DOC_QUAI, docAccidents, blocQuai, jalonsQuai, blocsRisques, jalonsRisques, blocsMesures, jalonsMesures,
  blocsNiveaux, jalonsNiveaux, blocsTaux, jalonsTaux } from './leroy-merlin.js';
import { ACC202, CAUSES202 } from './leroy-merlin-donnees.js';
import { QUESTIONS } from './questions/ENT-20.2.js';

export * from './leroy-merlin.js';

const QUATRE = ['agv', 'cartons', 'peinture', 'allee'];
const NIV = ['agv', 'cartons', 'allee'];
const A = { ...ACC202, causes: CAUSES202 };
const CAUSES = CAUSES202.map((c, i) => ({ v: `c${i + 1}`, lib: c.cause }));

const S = seanceFiches(U_SECU, {
  id: 'leroy-merlin-quai', prefixe: '202', titre: 'Au quai et dans les allées', exercice: 'Séance 2 : au quai et dans les allées',
  documents: [DOC_SITE, DOC_PREVENTION, DOC_QUAI, docAccidents(() => A)],
  pas: [
    { id: 'quai', libelle: 'Le protocole', titre: 'Le protocole de sécurité au quai', sousTitre: 'Remets les étapes dans l’ordre.',
      objet: 'Le camion du quai 6', pieces: ['quai'], documents: ['quai'],
      message: 'Bonjour {prenom}. Un camion arrive au quai 6. Lis le protocole de sécurité, puis remets les étapes dans l’ordre, de l’arrivée au départ.',
      blocs: [blocQuai()], jalons: jalonsQuai({ poids: 0.5, groupe: 'Le protocole' }) },
    { id: 'situations', libelle: 'Les situations', titre: 'Quatre situations', sousTitre: 'Pour chacune : le risque, puis la meilleure mesure.',
      objet: 'Dans les allées', pieces: ['prevention'], documents: ['prevention'], largeurDocs: 1.2,
      message: 'Maintenant, les allées. Pour chaque situation, le risque et la meilleure mesure.',
      blocs: [...blocsRisques(QUATRE), ...blocsMesures(QUATRE, false)],
      jalons: [...jalonsRisques(() => QUATRE, { poids: 0.75, groupe: 'Les situations' }), ...jalonsMesures(() => QUATRE, { poids: 0.75, groupe: 'Les situations' })] },
    { id: 'niveaux', libelle: 'Les niveaux', titre: 'Le niveau de chaque mesure', sousTitre: 'Supprimer, protéger tout le monde, ou protéger la personne ?',
      objet: 'Le niveau des mesures', pieces: ['prevention'], documents: ['prevention'],
      message: 'Pour trois de ces mesures, dis-moi leur niveau dans l’ordre de la prévention.',
      blocs: blocsNiveaux(NIV), jalons: jalonsNiveaux(NIV, { poids: 0.5, groupe: 'Les niveaux' }) },
    { id: 'taux', libelle: 'Les accidents', titre: 'Les accidents de l’année', sousTitre: 'Les chiffres et les formules sont à gauche.',
      objet: 'Le tableau de bord', pieces: ['accidents'], documents: ['accidents'],
      message: 'Je prépare la réunion sécurité. Calcule le taux de fréquence et le taux de gravité de l’équipe, et dis-moi la première cause d’accident.',
      blocs: [...blocsTaux(), { type: 'choix', id: 'cause', lib: 'La première cause d’accident', manque: 'la première cause', choix: CAUSES }],
      jalons: [...jalonsTaux(() => A, { tf: 1.5, tg: 1.5, groupe: 'Les accidents' }),
        { id: 'cause', titre: 'La première cause d’accident', groupe: 'Les accidents', poids: 1, attendu: CAUSES202[0].cause, juste: (v) => v.cause === 'c1' }] },
  ],
  compteRendu: { objet: 'Ton compte rendu', poids: 1.5, message: 'Merci {prenom}. Écris-moi ce que je dis à la réunion sécurité.',
    lignes: (prenom) => [SALUT('Samir'),
      { id: 'taux', choix: ['Le taux de fréquence est de 12,5 et le taux de gravité de 0,18.', 'Le taux de fréquence est de 6 et le taux de gravité de 84.', 'Le taux de fréquence est de 1,25 et le taux de gravité de 1,75.'], juste: 0 },
      { id: 'cause', choix: ['La moitié des accidents vient du port de charges : il faut plus d’aides mécaniques.', 'Les accidents viennent surtout des chariots automatiques.', 'Les accidents sont dus à la malchance.'], juste: 0 },
      FIN(prenom)] },
  accueil: ['Le protocole dans l’ordre.', 'Le risque et la mesure de quatre situations.', 'Le niveau de trois mesures.', 'Les taux de l’année.', 'Réponds à Samir, une phrase par ligne.'],
  fin: 'Merci {prenom}. Demain, Kevin te montre son relevé des risques.',
  questions: QUESTIONS,
});
export const { ID, FICHES, VOLET, ETAPES, SUITE, ACCUEIL, OPTIONS, fid, corrige } = S;
