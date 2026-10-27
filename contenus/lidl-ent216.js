// ENT-21.6 — Lidl, « évaluation : la facture du fournisseur » : ÉVALUATION d'AGO-2.2 et d'AGO-1.3, 2de GATL, copie rendue. Seul(e), sur un jeu NEUF
// tiré d'après la graine de l'élève (trois jeux : `JEUX216`) : rapprochement, montant à payer, date limite de paiement, fiche du fournisseur et RIB.
// Règle de la 2de : l'évaluation vient après un temps de travail (ENT-21.4).
// Univers : `contenus/lidl.js` ; données : `jeu216` ; questions : `contenus/questions/ENT-21.6.js`.
//
// Poids (décidés par Claude, délégation de Tristan du 26/10/2026) : le rapprochement 3 (1 × 3) · les montants 4,5 (1,5 × 3) · l'échéance 2,5 ·
// la fiche 2 · le RIB 2 · compte rendu 3 · « Avant de commencer » noté 3 = 20.

import { seanceFiches } from './fabrique-fiches.js';
import { U_COMPTA, SALUT, FIN } from './lidl-commun.js';
import { DOC_SITE, DOC_PAIEMENT, docFacture, docCourrier, docFiche, blocsRapprochement, jalonsRapprochement, blocsMontants, jalonsMontants,
  blocEcheance, jalonEcheance, blocsFiche, jalonsFiche, ttcDe, htCorrige, echeance, jourLong, euros } from './lidl.js';
import { jeu216, plusJ } from './lidl-donnees.js';
import { QUESTIONS } from './questions/ENT-21.6.js';

export * from './lidl.js';

const get = (db) => jeu216(db);

const S = seanceFiches(U_COMPTA, {
  id: 'lidl-evaluation-facture', prefixe: '216', titre: 'Évaluation : la facture du fournisseur', exercice: 'Séance 6 : évaluation, la facture du fournisseur',
  documents: [DOC_SITE, DOC_PAIEMENT, docFacture(get), docCourrier(get), docFiche(get)],
  pas: [
    { id: 'rapprochement', libelle: 'Le rapprochement', titre: 'Chaque ligne de la facture', sousTitre: 'Compare les trois documents, ligne par ligne.',
      objet: 'Évaluation : à toi seul(e)', pieces: ['facture', 'paiement'], documents: ['facture', 'paiement'], largeurDocs: 1.3,
      message: 'Bonjour {prenom}. Aujourd’hui, c’est une évaluation : je suis en réunion, tu contrôles seul(e) une facture. Rien n’est corrigé avant que tu rendes ta copie.\n\n'
        + 'D’abord, chaque ligne de la facture : conforme, ou un écart ?',
      blocs: (db) => blocsRapprochement(get(db)), jalons: jalonsRapprochement(get, { poids: 1, groupe: 'Le rapprochement' }) },
    { id: 'montants', libelle: 'Le montant', titre: 'Ce que nous devons vraiment', sousTitre: 'Au centime.',
      objet: 'Le montant à payer', pieces: ['facture', 'paiement'], documents: ['facture', 'paiement'], largeurDocs: 1.3,
      message: 'Calcule ce que nous devons vraiment : le montant HT, la TVA à 5,5 %, le montant TTC.',
      blocs: blocsMontants(), jalons: jalonsMontants(get, { poids: 1.5, groupe: 'Le montant' }) },
    { id: 'echeance', libelle: 'L’échéance', titre: 'Quand payer ?', sousTitre: 'La règle est dans « Le paiement ».',
      objet: 'La date de paiement', pieces: ['paiement'], documents: ['paiement'],
      message: 'Jusqu’à quand avons-nous le droit d’attendre pour payer ce fournisseur ?',
      blocs: (db) => [blocEcheance(get(db))], jalons: [jalonEcheance(get, { poids: 2.5, groupe: 'L’échéance' })] },
    { id: 'fiche', libelle: 'La fiche', titre: 'La fiche du fournisseur', sousTitre: 'Un courrier signé, un courriel inconnu.',
      objet: 'Deux messages', pieces: ['courrier', 'fiche'], documents: ['courrier', 'fiche'], largeurDocs: 1.2,
      message: 'Deux messages au nom de ce fournisseur. Mets sa fiche à jour, et dis-moi ce que tu fais du courriel.',
      blocs: blocsFiche(), jalons: jalonsFiche(get, { champs: 2, rib: 2, groupe: 'La fiche' }) },
  ],
  compteRendu: { objet: 'Ton compte rendu', poids: 3, message: 'Merci {prenom}. Écris-moi ton compte rendu, puis rends ta copie : tu ne pourras plus rien modifier.',
    lignes: (prenom, db) => { const F = get(db); return [SALUT('Claire'),
      { id: 'payer', choix: [`Nous devons ${euros(ttcDe(F))} TTC, à payer au plus tard le ${jourLong(echeance(F))}.`,
        `Nous devons ${euros(htCorrige(F))} TTC, à payer au plus tard le ${jourLong(plusJ(F.livraison, 30))}.`, `Nous devons ${euros(ttcDe(F))} TTC, à payer tout de suite.`], juste: 0 },
      { id: 'rib', choix: ['Je n’ai pas changé le RIB : il faut d’abord rappeler le fournisseur au numéro déjà connu.', 'J’ai changé le RIB comme demandé dans le courriel.',
        'J’ai répondu au courriel avec nos coordonnées.'], juste: 0 },
      FIN(prenom)]; } },
  accueil: ['Rapprocher commande, réception et facture.', 'Le montant à payer.', 'La date limite de paiement.', 'La fiche du fournisseur.', 'Réponds à Claire, puis rends ta copie.'],
  fin: 'Merci {prenom}. N’oublie pas de rendre ta copie.',
  questions: QUESTIONS,
  tirage: true,
});
export const { ID, FICHES, VOLET, ETAPES, SUITE, ACCUEIL, OPTIONS, fid, corrige } = S;
