// ENT-20.6 — Leroy Merlin, « le samedi du service clients » : ENTRAÎNEMENT de C2.1, 1re Bac Pro. Cinq demandes (interne ou externe), quatre
// commandes dont deux passées le samedi (le dimanche ne compte pas), un encombrant de 350 kg et une commande à 29,6 kg ; le taux de service.
// Univers : `contenus/leroy-merlin.js` ; données : `D206` ; questions : `contenus/questions/ENT-20.6.js`.
//
// Poids (décidés par Claude, délégation de Tristan du 26/10/2026) : les clients 3 (0,6 × 5) · les commandes 7 (poids 0,75 + date 1, × 4) ·
// le taux de service 2 · compte rendu 4 · questions au fil 4 = 20.

import { seanceFiches } from './fabrique-fiches.js';
import { U_CLIENTS, SALUT, FIN } from './leroy-merlin-commun.js';
import { DOC_SITE, DOC_LIVRAISON, docDemandes, docCommandes, blocsTypes, jalonsTypes, blocsCommandes, jalonsCommandes, blocTaux, jalonTaux } from './leroy-merlin.js';
import { D206 } from './leroy-merlin-donnees.js';
import { QUESTIONS } from './questions/ENT-20.6.js';

export * from './leroy-merlin.js';

const get = () => D206;

const S = seanceFiches(U_CLIENTS, {
  id: 'leroy-merlin-samedi', prefixe: '206', titre: 'Le samedi du service clients', exercice: 'Séance 6 : le samedi du service clients',
  documents: [DOC_SITE, DOC_LIVRAISON, docDemandes(get), docCommandes(get)],
  pas: [
    { id: 'types', libelle: 'Les clients', titre: 'Client interne ou externe ?', sousTitre: 'Cinq demandes ce samedi.',
      objet: 'Le samedi du service clients', pieces: ['demandes'], documents: ['livraison', 'demandes'], largeurDocs: 1.2,
      message: 'Bonjour {prenom}. Samedi chargé : cinq demandes ce matin. Pour chacune, client interne ou externe ?',
      blocs: blocsTypes(D206), jalons: jalonsTypes(get, { poids: 0.6, groupe: 'Les clients' }) },
    { id: 'commandes', libelle: 'Les commandes', titre: 'Quand seront-elles livrées ?', sousTitre: 'Attention au dimanche, et au poids de toute la commande.',
      objet: 'Quatre commandes', pieces: ['commandes', 'livraison'], documents: ['commandes', 'livraison'], largeurDocs: 1.3,
      message: 'Quatre clients attendent leur date. Le poids de chaque commande, puis sa date de livraison.',
      blocs: blocsCommandes(D206), jalons: jalonsCommandes(get, { poids: 0.75, date: 1, groupe: 'Les commandes' }) },
    { id: 'service', libelle: 'Le taux de service', titre: 'Le taux de service de la semaine', sousTitre: 'La formule est dans « Les règles ».',
      objet: 'Le taux de service', pieces: ['commandes'], documents: ['commandes', 'livraison'],
      message: 'Pour la réunion de lundi : calcule le taux de service de la semaine, au dixième.',
      blocs: [blocTaux()], jalons: [jalonTaux(get, { poids: 2, groupe: 'Le taux de service' })] },
  ],
  compteRendu: { objet: 'Ton compte rendu', poids: 4, message: 'Merci {prenom}. Écris-moi ce que je réponds à M. Rivière et à M. Hamon, et le taux pour lundi.',
    lignes: (prenom) => [SALUT('Nadia'),
      { id: 'riviere', choix: ['M. Rivière : 350 kg de ciment, c’est un encombrant ; commandé samedi, livré mercredi 25 novembre.', 'M. Rivière : livré lundi 23 novembre.', 'M. Rivière : livré mardi 24 novembre, le dimanche compte.'], juste: 0 },
      { id: 'hamon', choix: ['M. Hamon : 29,6 kg, c’est un colis ; commandé samedi, livré lundi 23 novembre.', 'M. Hamon : c’est un encombrant, livré mercredi 25 novembre.', 'M. Hamon : livré dimanche 22 novembre.'], juste: 0 },
      { id: 'taux', choix: ['Le taux de service de la semaine est de 94 %.', 'Le taux de service de la semaine est de 106 %.', 'Le taux de service de la semaine est de 75 %.'], juste: 0 },
      FIN(prenom)] },
  accueil: ['Client interne ou externe ?', 'Le poids et la date de quatre commandes.', 'Le taux de service.', 'Réponds à Nadia, une phrase par ligne.'],
  fin: 'Merci {prenom}. Mardi, tu relis les réponses de Jordan.',
  questions: QUESTIONS,
});
export const { ID, FICHES, VOLET, ETAPES, SUITE, ACCUEIL, OPTIONS, fid, corrige } = S;
