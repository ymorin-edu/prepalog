// ENT-22.4 — Schneider Electric, « contrôler la livraison » : GUIDAGE de CAP-C1.4 (contrôler les quantités et l'état de la livraison :
// anomalies et avaries, documents de transport, rendre compte), CAP OL. Le bon de livraison de l'usine du Vaudreuil et le comptage : le statut de
// chaque ligne, les colis manquants et abîmés, la décision, la réserve précise, puis le compte rendu à Nadia.
// Univers : `contenus/schneider.js` ; données : `BL224` de `contenus/schneider-donnees.js` ; questions : `contenus/questions/ENT-22.4.js`.
//
// Poids (décidés par Claude, délégation de Tristan du 26/10/2026) : les lignes 5 (1 × 5) · les quantités 3 (1,5 × 2) · la décision 2 ·
// la réserve 2 · compte rendu 4 · questions au fil 4 = 20.

import { seanceFiches } from './fabrique-fiches.js';
import { U, SALUT, FIN } from './schneider-commun.js';
import { DOC_SITE, DOC_CONTROLE, docBL, blocsLignes, jalonsLignes, blocsQuantites, jalonsQuantites, blocsReserve, jalonsReserve } from './schneider.js';
import { BL224 } from './schneider-donnees.js';
import { QUESTIONS } from './questions/ENT-22.4.js';

export * from './schneider.js';

const get = () => BL224;
const S = seanceFiches(U, {
  id: 'schneider-controle', prefixe: '224', titre: 'Contrôler la livraison', exercice: 'Séance 4 : contrôler la livraison',
  documents: [DOC_SITE, DOC_CONTROLE, docBL(BL224)],
  pas: [
    { id: 'lignes', libelle: 'Les lignes', titre: 'Ligne par ligne', sousTitre: 'Compare le bon de livraison et le comptage, à gauche.',
      objet: 'Le contrôle', pieces: ['controle', 'bl'], documents: ['bl', 'controle'], largeurDocs: 1.3,
      message: 'Bonjour {prenom} ! Le camion du Vaudreuil est déchargé et Mehdi a compté les colis. À toi de contrôler : lis « Contrôler la livraison », puis donne le statut de chaque ligne.',
      blocs: blocsLignes(BL224), jalons: jalonsLignes(get, { poids: 1, groupe: 'Les lignes' }) },
    { id: 'quantites', libelle: 'Les quantités', titre: 'Combien ?', sousTitre: 'En tout, sur toute la livraison.',
      objet: 'Les quantités', pieces: ['bl'], documents: ['bl'],
      message: 'Maintenant, les chiffres : combien de colis manquent, et combien sont abîmés ?',
      blocs: blocsQuantites(), jalons: jalonsQuantites(get, { manque: 1.5, abimes: 1.5, groupe: 'Les quantités' }) },
    { id: 'reserve', libelle: 'La réserve', titre: 'La décision et la réserve', sousTitre: 'Le chauffeur attend pour signer la lettre de voiture.',
      objet: 'La lettre de voiture', pieces: ['controle'], documents: ['controle', 'bl'],
      message: 'Le chauffeur attend pour signer. Que fais-tu de la livraison, et qu’écris-tu sur la lettre de voiture ?',
      blocs: blocsReserve(BL224), jalons: jalonsReserve(get, { decision: 2, reserve: 2, groupe: 'La réserve' }) },
  ],
  compteRendu: { objet: 'Ton compte rendu', poids: 4, message: 'Merci {prenom}. Écris-moi ton compte rendu du contrôle, une phrase par ligne.',
    lignes: (prenom) => [SALUT,
      { id: 'manque', choix: ['Il manque 2 colis d’interrupteurs différentiels.', 'Il manque 1 colis de coffret électrique.', 'Il ne manque rien.'], juste: 0 },
      { id: 'abime', choix: ['Un carton de prises de courant est écrasé.', 'Deux cartons de disjoncteurs sont écrasés.', 'Rien n’est abîmé.'], juste: 0 },
      { id: 'trop', choix: ['Il y a 1 coffret électrique en trop.', 'Il y a 2 contacteurs en trop.', 'Il n’y a rien en trop.'], juste: 0 },
      { id: 'decision', choix: ['J’ai accepté la livraison avec des réserves précises, avant que le chauffeur signe.', 'J’ai écrit « sous réserve de déballage ».', 'J’ai refusé toute la livraison.'], juste: 0 },
      FIN(prenom)] },
  accueil: ['Le statut de chaque ligne.', 'Combien de colis manquent, et combien sont abîmés.', 'La décision et la réserve.', 'Réponds à Nadia, une phrase par ligne.'],
  fin: 'Merci {prenom}. Les réserves partent au transporteur : nous avons trois jours pour les confirmer.',
  questions: QUESTIONS,
});
export const { ID, FICHES, VOLET, ETAPES, SUITE, ACCUEIL, OPTIONS, fid, corrige } = S;
