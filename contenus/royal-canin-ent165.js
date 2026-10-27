// ENT-16.5 — Royal Canin, « la commande export de Mehdi » : ERREUR INDUITE de C3.1 (adapter le processus au produit et au flux), Terminale.
// Lundi 1er mars 2027 : Mehdi a préparé une commande export en FIFO ; le client exige 9 mois de DDM restante ; deux de ses lots sont trop courts (dont un à quelques jours près) ; l'élève les trouve, dit pourquoi et refait la préparation en FEFO parmi les lots conformes.
// Univers et fabrique : `contenus/royal-canin.js` ; données : `D165` de `contenus/royal-canin-donnees.js` ; questions : `contenus/questions/ENT-16.5.js`.
//
// Poids (décidés par Claude, délégation de Tristan du 26/10/2026) : lots non conformes 4 · la cause 2 · les lots choisis 4 · les palettes par lot 2 · compte rendu 4 · questions au fil 4 = 20.

import { seance } from './royal-canin.js';
import { D165 } from './royal-canin-donnees.js';
import { QUESTIONS } from './questions/ENT-16.5.js';

export * from './royal-canin.js';

const S = seance(D165, {
  id: 'royal-canin-export',
  K: { export: true },
  poids: { nonconformes: 4, cause: 2, lots: 4, quantites: 2, 'compte-rendu': 4 },
  titre: 'La commande export de Mehdi',
  objet: 'La commande export : vérifie avant le départ',
  consigne: 'Le camion pour l’export part cet après-midi. Mehdi a préparé la commande ce matin, son bon est joint. Le client exige une durée de vie restante : vérifie sa préparation avec la fiche méthode, dis-moi quels lots ne vont pas et pourquoi, puis refais la préparation.\n\nOuvre la fiche de travail, puis écris-moi ton compte rendu.',
  poste: '<p>Ton travail aujourd’hui : vérifier une <b>commande export</b> préparée par Mehdi, avec l’exigence de <b>durée de vie restante</b> du client, et la refaire si elle ne va pas.</p>',
  etape: 'Les lots de Mehdi trop courts pour ce client, la cause, puis ta préparation en FEFO parmi les lots conformes.',
  questions: QUESTIONS,
});
export const { ID, FICHE_ID, PHRASES_ID, VOLET_ID, DOCUMENTS, FICHE, VOLET, ETAPES, PASTILLES, SUITE, ACCUEIL, OPTIONS } = S;
