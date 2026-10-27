// ENT-20.5 — Leroy Merlin, « qui demande quoi ? » : GUIDAGE de C2.1 (répondre à la demande des clients internes et externes), 1re Bac Pro.
// Quatre demandes du lundi : client interne (un magasin) ou externe (un particulier, un artisan) ; trois commandes du site : le poids, colis ou
// encombrant, la date de livraison ; le compte rendu à Nadia.
// Univers : `contenus/leroy-merlin.js` ; données : `D205` ; questions : `contenus/questions/ENT-20.5.js`.
//
// Poids (décidés par Claude, délégation de Tristan du 26/10/2026) : les clients 4 (1 × 4) · les commandes 7,5 (poids 1 + date 1,5, × 3) ·
// compte rendu 4,5 · questions au fil 4 = 20.

import { seanceFiches } from './fabrique-fiches.js';
import { U_CLIENTS, SALUT, FIN } from './leroy-merlin-commun.js';
import { DOC_SITE, DOC_EQUIPE, DOC_LIVRAISON, docDemandes, docCommandes, blocsTypes, jalonsTypes, blocsCommandes, jalonsCommandes } from './leroy-merlin.js';
import { D205 } from './leroy-merlin-donnees.js';
import { QUESTIONS } from './questions/ENT-20.5.js';

export * from './leroy-merlin.js';

const get = () => D205;

const S = seanceFiches(U_CLIENTS, {
  id: 'leroy-merlin-clients', prefixe: '205', titre: 'Qui demande quoi ?', exercice: 'Séance 5 : qui demande quoi ?',
  documents: [DOC_SITE, DOC_EQUIPE, DOC_LIVRAISON, docDemandes(get), docCommandes(get)],
  pas: [
    { id: 'types', libelle: 'Les clients', titre: 'Client interne ou externe ?', sousTitre: 'Les demandes du jour et les règles sont à gauche.',
      objet: 'Bienvenue au service clients', pieces: ['livraison', 'demandes'], documents: ['livraison', 'demandes'], largeurDocs: 1.2,
      message: 'Bonjour {prenom} ! Je suis Nadia, je m’occupe du service clients logistique : je réponds aux magasins et aux clients du site.\n\n'
        + 'Lis « Les règles », puis dis-moi pour chaque demande de ce matin si elle vient d’un client interne ou externe.',
      blocs: blocsTypes(D205), jalons: jalonsTypes(get, { poids: 1, groupe: 'Les clients' }) },
    { id: 'commandes', libelle: 'Les commandes', titre: 'Quand seront-elles livrées ?', sousTitre: 'Le poids de chaque commande, puis sa date de livraison.',
      objet: 'Trois commandes du site', pieces: ['commandes', 'livraison'], documents: ['commandes', 'livraison'], largeurDocs: 1.3,
      message: 'Trois clients du site attendent leur date de livraison. Calcule le poids de chaque commande, puis trouve la date de livraison.',
      blocs: blocsCommandes(D205), jalons: jalonsCommandes(get, { poids: 1, date: 1.5, groupe: 'Les commandes' }) },
  ],
  compteRendu: { objet: 'Ton compte rendu', poids: 4.5, message: 'Merci {prenom}. Écris-moi ce que je réponds à Mme Dias et à M. Garnier.',
    lignes: (prenom) => [SALUT('Nadia'),
      { id: 'dias', choix: ['Mme Dias : 242 kg, c’est un encombrant ; commandé dimanche, livré mercredi 18 novembre.', 'Mme Dias : sa commande est un colis, livrée lundi 16 novembre.',
        'Mme Dias : livrée mardi 17 novembre, comme toutes les commandes.'], juste: 0 },
      { id: 'garnier', choix: ['M. Garnier : 2,9 kg, c’est un colis : livré demain, mardi 17 novembre.', 'M. Garnier : livré jeudi 19 novembre, en trois jours.', 'M. Garnier : livré aujourd’hui.'], juste: 0 },
      { id: 'magasins', choix: ['Les demandes de Melun et de Créteil viennent de clients internes : je les transmets à l’équipe des magasins.', 'Melun et Créteil sont des particuliers.', 'Je ne réponds pas aux magasins.'], juste: 0 },
      FIN(prenom)] },
  accueil: ['Client interne ou externe ?', 'Le poids et la date de livraison de trois commandes.', 'Réponds à Nadia, une phrase par ligne.'],
  fin: 'Merci {prenom}. Je réponds aux clients avec tes dates. Samedi, tu tiens le service avec moi.',
  questions: QUESTIONS,
});
export const { ID, FICHES, VOLET, ETAPES, SUITE, ACCUEIL, OPTIONS, fid, corrige } = S;
