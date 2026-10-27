// ENT-20.8 — Leroy Merlin, « évaluation : le service clients » : ÉVALUATION de C2.1, 1re Bac Pro, copie rendue. Seul(e), sur un jeu NEUF
// tiré d'après la graine de l'élève (trois jeux : `JEUX208`) : trois demandes (interne ou externe), trois commandes (poids, date), le taux de service.
// Univers : `contenus/leroy-merlin.js` ; données : `jeu208` ; questions : `contenus/questions/ENT-20.8.js`.
//
// Poids (décidés par Claude, délégation de Tristan du 26/10/2026) : les clients 3 (1 × 3) · les commandes 9 (poids 1 + date 2, × 3) ·
// le taux de service 2 · compte rendu 3 · « Avant de commencer » noté 3 = 20.

import { seanceFiches } from './fabrique-fiches.js';
import { U_CLIENTS, SALUT, FIN } from './leroy-merlin-commun.js';
import { DOC_SITE, DOC_LIVRAISON, docDemandes, docCommandes, blocsTypes, jalonsTypes, blocsCommandes, jalonsCommandes, blocTaux, jalonTaux,
  jourLong, livraison, encombrant, poidsCommande, tauxService } from './leroy-merlin.js';
import { jeu208, nombreFr, plusJours } from './leroy-merlin-donnees.js';
import { QUESTIONS } from './questions/ENT-20.8.js';

export * from './leroy-merlin.js';

const get = (db) => jeu208(db);
const n = nombreFr;

const S = seanceFiches(U_CLIENTS, {
  id: 'leroy-merlin-evaluation-clients', prefixe: '208', titre: 'Évaluation : le service clients', exercice: 'Séance 8 : évaluation, le service clients',
  documents: [DOC_SITE, DOC_LIVRAISON, docDemandes(get), docCommandes(get)],
  pas: [
    { id: 'types', libelle: 'Les clients', titre: 'Client interne ou externe ?', sousTitre: 'Trois demandes.',
      objet: 'Évaluation : à toi seul(e)', pieces: ['demandes'], documents: ['livraison', 'demandes'], largeurDocs: 1.2,
      message: 'Bonjour {prenom}. Aujourd’hui, c’est une évaluation : je suis en réunion, tu tiens seul(e) le service clients. Rien n’est corrigé avant que tu rendes ta copie.\n\n'
        + 'D’abord, trois demandes : client interne ou externe ?',
      blocs: (db) => blocsTypes(get(db)), jalons: jalonsTypes(get, { poids: 1, groupe: 'Les clients' }) },
    { id: 'commandes', libelle: 'Les commandes', titre: 'Quand seront-elles livrées ?', sousTitre: 'Le poids de toute la commande, puis sa date.',
      objet: 'Trois commandes', pieces: ['commandes', 'livraison'], documents: ['commandes', 'livraison'], largeurDocs: 1.3,
      message: 'Trois clients attendent leur date. Le poids de chaque commande, puis sa date de livraison.',
      blocs: (db) => blocsCommandes(get(db)), jalons: jalonsCommandes(get, { poids: 1, date: 2, groupe: 'Les commandes' }) },
    { id: 'service', libelle: 'Le taux de service', titre: 'Le taux de service de la semaine', sousTitre: 'La formule est dans « Les règles ».',
      objet: 'Le taux de service', pieces: ['commandes'], documents: ['commandes', 'livraison'],
      message: 'Calcule le taux de service de la semaine, au dixième.',
      blocs: [blocTaux()], jalons: [jalonTaux(get, { poids: 2, groupe: 'Le taux de service' })] },
  ],
  compteRendu: { objet: 'Ton compte rendu', poids: 3, message: 'Merci {prenom}. Écris-moi ton compte rendu, puis rends ta copie : tu ne pourras plus rien modifier.',
    lignes: (prenom, db) => { const J = get(db); const c = J.commandes[0]; const ok = livraison(c);
      const faux = plusJours(c.jour, encombrant(c) ? 1 : 3);
      return [SALUT('Nadia'),
        { id: 'commande', choix: [`${c.client} : ${n(poidsCommande(c))} kg, ${encombrant(c) ? 'c’est un encombrant' : 'c’est un colis'} ; livraison le ${jourLong(ok)}.`,
          `${c.client} : ${n(poidsCommande(c))} kg, ${encombrant(c) ? 'c’est un colis' : 'c’est un encombrant'} ; livraison le ${jourLong(faux)}.`,
          `${c.client} : livraison le jour même.`], juste: 0 },
        { id: 'taux', choix: [`Le taux de service de la semaine est de ${n(tauxService(J.service))} %.`, `Le taux de service de la semaine est de ${n(J.service.livrees - J.service.aTemps)} %.`,
          `Le taux de service de la semaine est de ${n(Math.round(J.service.livrees / J.service.aTemps * 1000) / 10)} %.`], juste: 0 },
        { id: 'promesse', choix: ['Je ne promets une date qu’après avoir pesé toute la commande et compté les jours de livraison.', 'Je promets toujours le lendemain : le client est plus content.',
          'Je laisse le client choisir sa date.'], juste: 0 },
        FIN(prenom)]; } },
  accueil: ['Client interne ou externe ?', 'Le poids et la date de trois commandes.', 'Le taux de service.', 'Réponds à Nadia, puis rends ta copie.'],
  fin: 'Merci {prenom}. N’oublie pas de rendre ta copie.',
  questions: QUESTIONS,
  tirage: true,
});
export const { ID, FICHES, VOLET, ETAPES, SUITE, ACCUEIL, OPTIONS, fid, corrige } = S;
