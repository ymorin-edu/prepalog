// ENT-20.4 — Leroy Merlin, « évaluation : la sécurité à la plateforme » : ÉVALUATION de C1.2, 1re Bac Pro, copie rendue. Seul(e), sur un jeu NEUF
// tiré d'après la graine de l'élève (trois jeux : `JEUX204`) : quatre situations (risque et mesure), le protocole au quai, les deux taux de l'année.
// Univers : `contenus/leroy-merlin.js` ; données : `jeu204` ; questions : `contenus/questions/ENT-20.4.js`.
//
// Poids (décidés par Claude, délégation de Tristan du 26/10/2026) : les situations 8 (risque 1 + mesure 1, × 4) · le protocole 3 (0,5 × 6) ·
// les taux 3 (1,5 × 2) · compte rendu 3 · « Avant de commencer » noté 3 = 20.

import { seanceFiches } from './fabrique-fiches.js';
import { U_SECU, SALUT, FIN } from './leroy-merlin-commun.js';
import { DOC_SITE, DOC_PREVENTION, DOC_QUAI, docAccidents, blocQuai, jalonsQuai, blocsRisques, jalonsRisques, blocsMesures, jalonsMesures,
  blocsTaux, jalonsTaux, SITUATIONS, RISQUES } from './leroy-merlin.js';
import { jeu204, tf, tg, nombreFr } from './leroy-merlin-donnees.js';
import { QUESTIONS } from './questions/ENT-20.4.js';

export * from './leroy-merlin.js';

const sit = (db) => jeu204(db).situations;
const acc = (db) => jeu204(db).acc;
const n = nombreFr;

const S = seanceFiches(U_SECU, {
  id: 'leroy-merlin-evaluation-securite', prefixe: '204', titre: 'Évaluation : la sécurité à la plateforme', exercice: 'Séance 4 : évaluation, la sécurité',
  documents: [DOC_SITE, DOC_PREVENTION, DOC_QUAI, docAccidents(acc)],
  pas: [
    { id: 'situations', libelle: 'Les situations', titre: 'Quatre situations', sousTitre: 'Pour chacune : le risque, puis la meilleure mesure.',
      objet: 'Évaluation : à toi seul(e)', pieces: ['prevention'], documents: ['prevention'], largeurDocs: 1.2,
      message: 'Bonjour {prenom}. Aujourd’hui, c’est une évaluation : je suis en réunion, tu fais seul(e) le tour de la sécurité. Rien n’est corrigé avant que tu rendes ta copie.\n\n'
        + 'D’abord, quatre situations : le risque et la meilleure mesure de chacune.',
      blocs: (db) => [...blocsRisques(sit(db)), ...blocsMesures(sit(db), false)],
      jalons: [...jalonsRisques(sit, { poids: 1, groupe: 'Les situations' }), ...jalonsMesures(sit, { poids: 1, groupe: 'Les situations' })] },
    { id: 'quai', libelle: 'Le protocole', titre: 'Le protocole de sécurité au quai', sousTitre: 'Remets les étapes dans l’ordre.',
      objet: 'Le camion du quai 3', pieces: ['quai'], documents: ['quai'],
      message: 'Un camion arrive au quai 3. Remets les étapes du protocole dans l’ordre.',
      blocs: [blocQuai()], jalons: jalonsQuai({ poids: 0.5, groupe: 'Le protocole' }) },
    { id: 'taux', libelle: 'Les accidents', titre: 'Les accidents de l’année', sousTitre: 'Les chiffres et les formules sont à gauche.',
      objet: 'Les taux', pieces: ['accidents'], documents: ['accidents'],
      message: 'Calcule le taux de fréquence et le taux de gravité de l’équipe.',
      blocs: blocsTaux(), jalons: jalonsTaux(acc, { tf: 1.5, tg: 1.5, groupe: 'Les accidents' }) },
  ],
  compteRendu: { objet: 'Ton compte rendu', poids: 3, message: 'Merci {prenom}. Écris-moi ton compte rendu, puis rends ta copie : tu ne pourras plus rien modifier.',
    lignes: (prenom, db) => { const A = acc(db); const s0 = SITUATIONS[sit(db)[0]]; const autre = RISQUES.find((r) => r.v !== s0.risque);
      return [SALUT('Samir'),
        { id: 'taux', choix: [`Le taux de fréquence est de ${n(tf(A))} et le taux de gravité de ${n(tg(A))}.`, `Le taux de fréquence est de ${A.accidents} et le taux de gravité de ${A.jours}.`,
          `Le taux de fréquence est de ${n(tg(A))} et le taux de gravité de ${n(tf(A))}.`], juste: 0 },
        { id: 'situation', choix: [`Première situation : ${RISQUES.find((r) => r.v === s0.risque).lib.toLowerCase()} ; je propose : ${s0.mesures.find((m) => m.v === s0.juste).lib.toLowerCase()}.`,
          `Première situation : ${autre.lib.toLowerCase()} ; je propose : ${s0.mesures.find((m) => m.v !== s0.juste).lib.toLowerCase()}.`,
          'Première situation : aucun risque, rien à faire.'], juste: 0 },
        { id: 'quai', choix: ['Au quai, personne n’entre dans la remorque avant que le moteur soit coupé et la clé remise.', 'Au quai, le chauffeur aide le cariste dans la remorque pour aller plus vite.', 'Au quai, le protocole ne sert que pour les gros camions.'], juste: 0 },
        FIN(prenom)]; } },
  accueil: ['Le risque et la mesure de quatre situations.', 'Le protocole dans l’ordre.', 'Les taux de l’année.', 'Réponds à Samir, puis rends ta copie.'],
  fin: 'Merci {prenom}. N’oublie pas de rendre ta copie.',
  questions: QUESTIONS,
  tirage: true,
});
export const { ID, FICHES, VOLET, ETAPES, SUITE, ACCUEIL, OPTIONS, fid, corrige } = S;
