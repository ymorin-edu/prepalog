// ENT-21.4 — Lidl, « la facture du fournisseur » : GUIDAGE d'AGO-2.2 et d'AGO-1.3, 2de GATL. Rapprocher commande, réception et facture ligne par
// ligne ; le montant à payer (HT, TVA à 5,5 %, TTC) ; la date limite de paiement (30 jours après la fin de la décade de livraison) ; mettre à jour la
// fiche du fournisseur d'après un courrier signé, et ne pas changer un RIB sur un simple courriel.
// Univers : `contenus/lidl.js` ; données : `F214` ; questions : `contenus/questions/ENT-21.4.js`.
//
// Poids (décidés par Claude, délégation de Tristan du 26/10/2026) : le rapprochement 3 (1 × 3) · les montants 4,5 (1,5 × 3) · l'échéance 2 ·
// la fiche 1,5 · le RIB 1,5 · compte rendu 3,5 · questions au fil 4 = 20.

import { seanceFiches } from './fabrique-fiches.js';
import { U_COMPTA, SALUT, FIN } from './lidl-commun.js';
import { DOC_SITE, DOC_PAIEMENT, docFacture, docCourrier, docFiche, blocsRapprochement, jalonsRapprochement, blocsMontants, jalonsMontants,
  blocEcheance, jalonEcheance, blocsFiche, jalonsFiche, ttcDe, echeance, jourLong, euros } from './lidl.js';
import { F214 } from './lidl-donnees.js';
import { QUESTIONS } from './questions/ENT-21.4.js';

export * from './lidl.js';

const get = () => F214;

const S = seanceFiches(U_COMPTA, {
  id: 'lidl-facture', prefixe: '214', titre: 'La facture du fournisseur', exercice: 'Séance 4 : la facture du fournisseur',
  documents: [DOC_SITE, DOC_PAIEMENT, docFacture(get), docCourrier(get), docFiche(get)],
  pas: [
    { id: 'rapprochement', libelle: 'Le rapprochement', titre: 'Chaque ligne de la facture', sousTitre: 'Compare les trois documents, ligne par ligne.',
      objet: 'Bienvenue à la comptabilité', pieces: ['facture', 'paiement'], documents: ['facture', 'paiement'], largeurDocs: 1.3,
      message: 'Bonjour {prenom}, je suis Claire, comptable fournisseurs à la direction régionale. Avant de payer un fournisseur, on vérifie sa facture.\n\n'
        + 'Lis « Le paiement », puis compare la commande, la réception et la facture de la laiterie : chaque ligne est-elle conforme ?',
      blocs: blocsRapprochement(F214), jalons: jalonsRapprochement(get, { poids: 1, groupe: 'Le rapprochement' }) },
    { id: 'montants', libelle: 'Le montant', titre: 'Ce que nous devons vraiment', sousTitre: 'Quantité reçue × prix commandé ; au centime.',
      objet: 'Le montant à payer', pieces: ['facture', 'paiement'], documents: ['facture', 'paiement'], largeurDocs: 1.3,
      message: 'Calcule ce que nous devons vraiment à la laiterie : le montant HT, la TVA à 5,5 %, le montant TTC.',
      blocs: blocsMontants(), jalons: jalonsMontants(get, { poids: 1.5, groupe: 'Le montant' }) },
    { id: 'echeance', libelle: 'L’échéance', titre: 'Quand payer ?', sousTitre: 'La règle est dans « Le paiement ».',
      objet: 'La date de paiement', pieces: ['paiement'], documents: ['paiement'],
      message: 'Jusqu’à quand avons-nous le droit d’attendre pour payer la laiterie ?',
      blocs: [blocEcheance(F214)], jalons: [jalonEcheance(get, { poids: 2, groupe: 'L’échéance' })] },
    { id: 'fiche', libelle: 'La fiche', titre: 'La fiche du fournisseur', sousTitre: 'Un courrier signé, un courriel inconnu.',
      objet: 'Deux messages', pieces: ['courrier', 'fiche'], documents: ['courrier', 'fiche'], largeurDocs: 1.2,
      message: 'Nous avons reçu deux messages au nom de la laiterie. Mets sa fiche à jour, et dis-moi ce que tu fais du courriel.',
      blocs: blocsFiche(), jalons: jalonsFiche(get, { champs: 1.5, rib: 1.5, groupe: 'La fiche' }) },
  ],
  compteRendu: { objet: 'Ton compte rendu', poids: 3.5, message: 'Merci {prenom}. Écris-moi ce que je dois savoir avant de payer la laiterie.',
    lignes: (prenom) => [SALUT('Claire'),
      { id: 'payer', choix: [`Nous devons ${euros(ttcDe(F214))} TTC, à payer au plus tard le ${jourLong(echeance(F214))}.`, `Nous devons ${euros(988.54)} TTC, comme sur la facture.`,
        `Nous devons ${euros(ttcDe(F214))} TTC, à payer tout de suite.`], juste: 0 },
      { id: 'ecarts', choix: ['La facture compte deux cartons de fromage blanc qui n’ont pas été reçus, et la crème au mauvais prix.', 'La facture est juste.', 'La facture oublie des yaourts.'], juste: 0 },
      { id: 'rib', choix: ['Je n’ai pas changé le RIB : il faut d’abord rappeler la laiterie au numéro déjà connu.', 'J’ai changé le RIB comme demandé dans le courriel.', 'J’ai répondu au courriel avec nos coordonnées.'], juste: 0 },
      FIN(prenom)] },
  accueil: ['Rapprocher commande, réception et facture.', 'Le montant à payer.', 'La date limite de paiement.', 'La fiche du fournisseur.', 'Réponds à Claire, une phrase par ligne.'],
  fin: 'Merci {prenom}. Bientôt, tu contrôleras seul(e) une facture.',
  questions: QUESTIONS,
});
export const { ID, FICHES, VOLET, ETAPES, SUITE, ACCUEIL, OPTIONS, fid, corrige } = S;
