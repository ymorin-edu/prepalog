// ENT-20.1 — Leroy Merlin, « bienvenue à Réau : les risques du site » : GUIDAGE de C1.2 (mettre en œuvre les règles de sécurité), 1re Bac Pro.
// Six situations du site : le risque de chacune ; les trois plateformes nationales sur la carte ; les EPI ; la meilleure mesure de trois
// situations ; le compte rendu à Samir.
// Univers : `contenus/leroy-merlin.js` ; données : `SITUATIONS` ; questions : `contenus/questions/ENT-20.1.js`.
//
// Poids (décidés par Claude, délégation de Tristan du 26/10/2026) : les risques 4,5 (0,75 × 6) · la carte 3 (0,5 × 6) · les EPI 2 ·
// les mesures 4,5 (1,5 × 3) · compte rendu 2 · questions au fil 4 = 20.

import { seanceFiches } from './fabrique-fiches.js';
import { U_SECU, SALUT, FIN } from './leroy-merlin-commun.js';
import { DOC_SITE, DOC_EQUIPE, DOC_PREVENTION, LOCALISER, blocsRisques, jalonsRisques, blocsMesures, jalonsMesures, blocEpi, jalonEpi } from './leroy-merlin.js';
import { QUESTIONS } from './questions/ENT-20.1.js';

export * from './leroy-merlin.js';

const SIX = ['carrelage', 'allee', 'film', 'quai', 'sable', 'cartons'];
const TROIS = ['carrelage', 'film', 'sable'];

const S = seanceFiches(U_SECU, {
  id: 'leroy-merlin-risques', prefixe: '201', titre: 'Bienvenue à Réau : les risques du site', exercice: 'Séance 1 : les risques du site',
  documents: [DOC_SITE, DOC_EQUIPE, DOC_PREVENTION],
  pas: [
    { id: 'risques', libelle: 'Les risques', titre: 'Le risque de chaque situation', sousTitre: 'Six situations vues ce matin dans les allées et au quai.',
      objet: 'Bienvenue à Réau', pieces: ['site', 'equipe', 'prevention'], documents: ['site', 'prevention'], largeurDocs: 1.2,
      message: 'Bonjour {prenom}, bienvenue à Réau ! Je suis Samir, ton tuteur. Avant de travailler dans les allées, tu dois savoir repérer les risques.\n\n'
        + 'Lis « La prévention », puis dis-moi le risque de chacune des six situations que j’ai vues ce matin.',
      blocs: blocsRisques(SIX), jalons: jalonsRisques(() => SIX, { poids: 0.75, groupe: 'Les risques' }) },
    { id: 'epi', libelle: 'Les EPI', titre: 'Ce que tu portes', sousTitre: 'Coche tout ce qui est obligatoire.',
      objet: 'Tes équipements', pieces: ['prevention'], documents: ['prevention'],
      message: 'Demain tu commences dans les allées. Coche ce que tu dois porter.',
      blocs: [blocEpi()], jalons: [jalonEpi({ poids: 2, groupe: 'Les EPI' })] },
    { id: 'mesures', libelle: 'Les mesures', titre: 'La meilleure mesure', sousTitre: 'Pour chaque situation, la mesure qui protège le mieux.',
      objet: 'Que faire ?', pieces: ['prevention'], documents: ['prevention'],
      message: 'Pour trois de ces situations, que faut-il faire ? Choisis la meilleure mesure : souviens-toi de l’ordre de la prévention.',
      blocs: blocsMesures(TROIS), jalons: jalonsMesures(() => TROIS, { poids: 1.5, groupe: 'Les mesures' }) },
  ],
  localiser: { ...LOCALISER, apres: 0 },
  compteRendu: { objet: 'Ton compte rendu', poids: 2, message: 'Merci {prenom}. Écris-moi en quelques lignes ce que tu retiens de ce matin.',
    lignes: (prenom) => [SALUT('Samir'),
      { id: 'ordre', choix: ['Je supprime le danger quand je peux, sinon je protège tout le monde, et l’EPI vient en dernier.', 'Je mets mes EPI : ça suffit pour être protégé(e).', 'Je vais vite pour rester moins longtemps exposé(e).'], juste: 0 },
      { id: 'charges', choix: ['Au-delà de 25 kg, je prends une aide mécanique.', 'Je porte les cartons de carrelage seul(e), même lourds.', 'Je jette les charges lourdes du haut du rack.'], juste: 0 },
      FIN(prenom)] },
  accueil: ['Le risque de chaque situation.', 'Les trois plateformes sur la carte.', 'Les EPI.', 'La meilleure mesure.', 'Réponds à Samir, une phrase par ligne.'],
  fin: 'Merci {prenom}. Demain, on passe au quai : le protocole de sécurité.',
  questions: QUESTIONS,
});
export const { ID, FICHES, VOLET, ETAPES, SUITE, ACCUEIL, OPTIONS, fid, corrige } = S;
