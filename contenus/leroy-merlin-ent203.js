// ENT-20.3 — Leroy Merlin, « le relevé de Kevin » : ERREUR INDUITE de C1.2, 1re Bac Pro. Kevin a rempli le relevé des risques de son allée :
// trois lignes sur cinq sont fausses (deux mesures « EPI » au lieu de supprimer le danger ou de protéger tout le monde, un risque confondu).
// L'élève vérifie chaque ligne, la corrige, trouve la cause, puis rend compte à Samir.
// Univers : `contenus/leroy-merlin.js` ; données : `KEVIN`, `etatKevin` ; questions : `contenus/questions/ENT-20.3.js`.
//
// Poids (décidés par Claude, délégation de Tristan du 26/10/2026) : vérifier 6 (1,2 × 5) · corriger 5 (risque 0,5 + mesure 0,5, × 5) ·
// la cause 2 · compte rendu 3 · questions au fil 4 = 20.

import { seanceFiches } from './fabrique-fiches.js';
import { U_SECU, SALUT, FIN } from './leroy-merlin-commun.js';
import { DOC_SITE, DOC_PREVENTION, docKevin, blocsRisques, jalonsRisques, blocsMesures, jalonsMesures } from './leroy-merlin.js';
import { KEVIN, etatKevin } from './leroy-merlin-donnees.js';
import { QUESTIONS } from './questions/ENT-20.3.js';

export * from './leroy-merlin.js';

const KS = KEVIN.map((x) => x.s);
export const ETATS = [
  { v: 'juste', lib: 'La ligne est juste' },
  { v: 'risque', lib: 'Le risque noté est faux' },
  { v: 'mesure', lib: 'La mesure proposée n’est pas la meilleure' },
];
export const CAUSES = [
  { v: 'epi', lib: 'Kevin pense d’abord à l’EPI, au lieu de supprimer le danger ou de protéger tout le monde' },
  { v: 'vite', lib: 'Kevin a rempli le relevé trop vite, sans regarder les situations' },
  { v: 'loi', lib: 'Kevin ne connaît pas les EPI obligatoires' },
];

const S = seanceFiches(U_SECU, {
  id: 'leroy-merlin-kevin', prefixe: '203', titre: 'Le relevé de Kevin', exercice: 'Séance 3 : le relevé de Kevin',
  documents: [DOC_SITE, DOC_PREVENTION, docKevin(KEVIN)],
  pas: [
    { id: 'verifier', libelle: 'Vérifier', titre: 'Vérifier le relevé de Kevin', sousTitre: 'Pour chaque ligne : juste, risque faux, ou mesure à revoir.',
      objet: 'Le relevé de Kevin', pieces: ['kevin', 'prevention'], documents: ['kevin', 'prevention'], largeurDocs: 1.4,
      message: 'Bonjour {prenom}. Kevin a rempli le relevé des risques de l’allée 12 et du quai 6. Avant que je le signe, vérifie chaque ligne avec « La prévention ».',
      blocs: KEVIN.map((x, i) => ({ type: 'choix', id: `etat-${i + 1}`, lib: `Ligne ${i + 1}`, colonne: true, manque: `la ligne ${i + 1}`, choix: ETATS })),
      jalons: KEVIN.map((x, i) => ({ id: `etat-${i + 1}`, titre: `La ligne n° ${i + 1} du relevé`, groupe: 'Vérifier', poids: 1.2,
        attendu: ETATS.find((e) => e.v === etatKevin(x)).lib, juste: (v) => v[`etat-${i + 1}`] === etatKevin(x) })) },
    { id: 'corriger', libelle: 'Corriger', titre: 'Le relevé corrigé', sousTitre: 'Pour chaque ligne, le bon risque et la meilleure mesure.',
      objet: 'Le relevé corrigé', pieces: ['kevin'], documents: ['kevin', 'prevention'], largeurDocs: 1.2,
      message: 'Merci. Remplis maintenant le relevé corrigé : pour chaque ligne, le bon risque et la meilleure mesure.',
      blocs: [...blocsRisques(KS), ...blocsMesures(KS, false)],
      jalons: [...jalonsRisques(() => KS, { poids: 0.5, groupe: 'Corriger' }), ...jalonsMesures(() => KS, { poids: 0.5, groupe: 'Corriger' })] },
    { id: 'cause', libelle: 'La cause', titre: 'D’où viennent les erreurs ?', sousTitre: 'Une seule cause explique deux des trois erreurs.',
      objet: 'Pourquoi ?', pieces: ['kevin'], documents: ['kevin', 'prevention'],
      message: 'Pour que Kevin ne recommence pas, je dois lui expliquer d’où viennent ses erreurs de mesure. Qu’en penses-tu ?',
      blocs: [{ type: 'choix', id: 'cause', lib: 'La cause des erreurs de mesure', colonne: true, manque: 'la cause', choix: CAUSES }],
      jalons: [{ id: 'cause', titre: 'La cause des erreurs', groupe: 'La cause', poids: 2, attendu: CAUSES[0].lib, juste: (v) => v.cause === 'epi' }] },
  ],
  compteRendu: { objet: 'Ton compte rendu', poids: 3, message: 'Merci {prenom}. Écris-moi ce que je dis à Kevin.',
    lignes: (prenom) => [SALUT('Samir'),
      { id: 'erreurs', choix: ['Trois lignes sont à revoir : les cartons de carrelage, le sable au sol et le camion au quai.', 'Tout le relevé est juste, tu peux le signer.', 'Seule la ligne du sable est à revoir.'], juste: 0 },
      { id: 'quai', choix: ['Au quai, le risque est le départ du camion : moteur coupé, clé remise au quai.', 'Au quai, le risque est un heurt avec un piéton : le gilet suffit.', 'Au quai, il n’y a pas de risque.'], juste: 0 },
      { id: 'conseil', choix: ['Je propose de rappeler à Kevin l’ordre de la prévention : l’EPI vient en dernier.', 'Je propose de refaire le relevé à sa place sans rien lui dire.', 'Je propose de le sanctionner.'], juste: 0 },
      FIN(prenom)] },
  accueil: ['Vérifie chaque ligne du relevé.', 'Remplis le relevé corrigé.', 'Trouve la cause des erreurs.', 'Réponds à Samir, une phrase par ligne.'],
  fin: 'Merci {prenom}. J’en parle avec Kevin cet après-midi. La prochaine fois : l’évaluation.',
  questions: QUESTIONS,
});
export const { ID, FICHES, VOLET, ETAPES, SUITE, ACCUEIL, OPTIONS, fid, corrige } = S;
