// ENT-21.5 — Lidl, « évaluation : chiffrer une livraison » : ÉVALUATION d'OTM-C1.4, 2de GATL, copie rendue. Seul(e), sur un jeu NEUF tiré
// d'après la graine de l'élève (trois jeux : `JEUX215`) : la zone de trois magasins, la cotation d'une livraison, le coût de revient et le prix de vente.
// Règle de la 2de : l'évaluation vient après un temps de travail (ENT-21.3).
// Univers : `contenus/lidl.js` ; données : `jeu215` ; questions : `contenus/questions/ENT-21.5.js`.
//
// Poids (décidés par Claude, délégation de Tristan du 26/10/2026) : les zones 3 (1 × 3) · la cotation 6 (1,5 × 4) · le coût de revient 2,5 ·
// le prix de vente 2,5 · compte rendu 3 · « Avant de commencer » noté 3 = 20.

import { seanceFiches } from './fabrique-fiches.js';
import { U_TRANSPORT, SALUT, FIN } from './lidl-commun.js';
import { DOC_SITE, DOC_GRILLE, DOC_COUTS, docMagasins, docLivraison, blocsZonesKm, jalonsZonesKm, blocsCotation, jalonsCotation, blocsRevient, jalonsRevient,
  cotation, revient, euros } from './lidl.js';
import { jeu215 } from './lidl-donnees.js';
import { QUESTIONS } from './questions/ENT-21.5.js';

export * from './lidl.js';

const get = (db) => jeu215(db);

const S = seanceFiches(U_TRANSPORT, {
  id: 'lidl-evaluation-transport', prefixe: '215', titre: 'Évaluation : chiffrer une livraison', exercice: 'Séance 5 : évaluation, chiffrer une livraison',
  documents: [DOC_SITE, DOC_GRILLE, DOC_COUTS, docMagasins(get), docLivraison(get)],
  pas: [
    { id: 'zones', libelle: 'Les zones', titre: 'La zone de chaque magasin', sousTitre: 'D’après sa distance.',
      objet: 'Évaluation : à toi seul(e)', pieces: ['grille', 'magasins'], documents: ['grille', 'magasins'], largeurDocs: 1.2,
      message: 'Bonjour {prenom}. Aujourd’hui, c’est une évaluation : je suis en réunion, tu chiffres seul(e). Rien n’est corrigé avant que tu rendes ta copie.\n\n'
        + 'D’abord, la zone de chacun de ces trois magasins.',
      blocs: (db) => blocsZonesKm(get(db).magasins), jalons: jalonsZonesKm(get, { poids: 1, groupe: 'Les zones' }) },
    { id: 'cotation', libelle: 'La cotation', titre: 'Le prix de la livraison', sousTitre: 'Au centime.',
      objet: 'Une livraison à chiffrer', pieces: ['livraison', 'grille'], documents: ['livraison', 'grille'], largeurDocs: 1.2,
      message: 'Calcule ce que le transporteur va nous facturer pour cette livraison : le transport, le supplément froid, les prestations annexes, le total.',
      blocs: blocsCotation(), jalons: jalonsCotation(get, { poids: 1.5, groupe: 'La cotation' }) },
    { id: 'revient', libelle: 'Notre camion', titre: 'Et avec notre propre camion ?', sousTitre: 'Les coûts sont dans « Nos coûts ».',
      objet: 'Notre camion', pieces: ['couts', 'livraison'], documents: ['couts', 'livraison'],
      message: 'La même livraison avec notre camion : son coût de revient, puis le prix de vente (coût de revient + 20 %).',
      blocs: blocsRevient(), jalons: jalonsRevient(get, { revient: 2.5, prix: 2.5, groupe: 'Notre camion' }) },
  ],
  compteRendu: { objet: 'Ton compte rendu', poids: 3, message: 'Merci {prenom}. Écris-moi ton compte rendu, puis rends ta copie : tu ne pourras plus rien modifier.',
    lignes: (prenom, db) => { const L = get(db).livraison; const C = cotation(L); return [SALUT('Mehdi'),
      { id: 'prix', choix: [`Le transporteur nous facture ${euros(C.total)}, froid et annexes compris.`, `Le transporteur nous facture ${euros(C.transport)}, tout compris.`,
        `Le transporteur nous facture ${euros(C.total + C.froid)}.`], juste: 0 },
      { id: 'compare', choix: [`Avec notre camion, le coût de revient serait de ${euros(revient(L))}.`, `Avec notre camion, le coût de revient serait de ${euros(C.total)}.`,
        'Avec notre camion, la livraison ne coûterait rien.'], juste: 0 },
      FIN(prenom)]; } },
  accueil: ['La zone de trois magasins.', 'Le prix d’une livraison.', 'Le coût de revient et le prix de vente.', 'Réponds à Mehdi, puis rends ta copie.'],
  fin: 'Merci {prenom}. N’oublie pas de rendre ta copie.',
  questions: QUESTIONS,
  tirage: true,
});
export const { ID, FICHES, VOLET, ETAPES, SUITE, ACCUEIL, OPTIONS, fid, corrige } = S;
