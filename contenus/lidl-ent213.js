// ENT-21.3 — Lidl, « combien coûte une livraison ? » : GUIDAGE d'OTM-C1.4, 2de GATL. La zone tarifaire de trois magasins, la cotation d'une
// livraison avec la grille du transporteur (transport, supplément froid, prestations annexes), le coût de revient et le prix de vente avec notre camion.
// Univers : `contenus/lidl.js` ; données : `M213`, `L213` ; questions : `contenus/questions/ENT-21.3.js`.
//
// Poids (décidés par Claude, délégation de Tristan du 26/10/2026) : les zones 3 (1 × 3) · la cotation 6 (1,5 × 4) · le coût de revient 2 ·
// le prix de vente 2 · compte rendu 3 · questions au fil 4 = 20.

import { seanceFiches } from './fabrique-fiches.js';
import { U_TRANSPORT, SALUT, FIN } from './lidl-commun.js';
import { DOC_SITE, DOC_GRILLE, DOC_COUTS, docMagasins, docLivraison, blocsZonesKm, jalonsZonesKm, blocsCotation, jalonsCotation, blocsRevient, jalonsRevient,
  cotation, revient, euros } from './lidl.js';
import { M213, L213 } from './lidl-donnees.js';
import { QUESTIONS } from './questions/ENT-21.3.js';

export * from './lidl.js';

const J = { magasins: M213, livraison: L213 };
const get = () => J;

const S = seanceFiches(U_TRANSPORT, {
  id: 'lidl-transport', prefixe: '213', titre: 'Combien coûte une livraison ?', exercice: 'Séance 3 : combien coûte une livraison ?',
  documents: [DOC_SITE, DOC_GRILLE, DOC_COUTS, docMagasins(get), docLivraison(get)],
  pas: [
    { id: 'zones', libelle: 'Les zones', titre: 'La zone de chaque magasin', sousTitre: 'D’après sa distance.',
      objet: 'Bienvenue au service transport', pieces: ['grille', 'magasins'], documents: ['grille', 'magasins'], largeurDocs: 1.2,
      message: 'Bonjour {prenom}, je suis Mehdi, du service transport. Nos magasins sont livrés par un transporteur frigorifique ; son prix dépend de la distance.\n\n'
        + 'Lis « La grille », puis dis-moi dans quelle zone se trouve chacun de ces trois magasins.',
      blocs: blocsZonesKm(M213), jalons: jalonsZonesKm(get, { poids: 1, groupe: 'Les zones' }) },
    { id: 'cotation', libelle: 'La cotation', titre: 'Le prix de la livraison', sousTitre: 'Au centime. Le détail est dans « La livraison ».',
      objet: 'Une livraison à chiffrer', pieces: ['livraison', 'grille'], documents: ['livraison', 'grille'], largeurDocs: 1.2,
      message: 'Voici une livraison faite hier par le transporteur. Calcule ce qu’il va nous facturer : le transport, le supplément froid, les prestations annexes, le total.',
      blocs: blocsCotation(), jalons: jalonsCotation(get, { poids: 1.5, groupe: 'La cotation' }) },
    { id: 'revient', libelle: 'Notre camion', titre: 'Et avec notre propre camion ?', sousTitre: 'Les coûts sont dans « Nos coûts ».',
      objet: 'Notre camion', pieces: ['couts', 'livraison'], documents: ['couts', 'livraison'],
      message: 'La même livraison avec notre propre camion : calcule son coût de revient, puis le prix de vente si nous la faisions payer (coût de revient + 20 %).',
      blocs: blocsRevient(), jalons: jalonsRevient(get, { revient: 2, prix: 2, groupe: 'Notre camion' }) },
  ],
  compteRendu: { objet: 'Ton compte rendu', poids: 3, message: 'Merci {prenom}. Écris-moi ce que je présente au chef de la plateforme.',
    lignes: (prenom) => { const C = cotation(L213); return [SALUT('Mehdi'),
      { id: 'prix', choix: [`Le transporteur nous facture ${euros(C.total)} pour cette livraison, froid et annexes compris.`, `Le transporteur nous facture ${euros(C.transport)} pour cette livraison, tout compris.`,
        `Le transporteur nous facture ${euros(C.total + C.froid)} pour cette livraison.`], juste: 0 },
      { id: 'compare', choix: [`Avec notre camion, le coût de revient serait de ${euros(revient(L213))} : c’est moins cher, s’il est disponible.`,
        `Avec notre camion, ce serait plus cher : ${euros(C.total + 100)}.`, 'On ne peut pas comparer les deux.'], juste: 0 },
      FIN(prenom)]; } },
  accueil: ['La zone de trois magasins.', 'Le prix d’une livraison avec la grille.', 'Le coût de revient et le prix de vente avec notre camion.', 'Réponds à Mehdi, une phrase par ligne.'],
  fin: 'Merci {prenom}. Bientôt, tu chiffreras seul(e) une livraison.',
  questions: QUESTIONS,
});
export const { ID, FICHES, VOLET, ETAPES, SUITE, ACCUEIL, OPTIONS, fid, corrige } = S;
