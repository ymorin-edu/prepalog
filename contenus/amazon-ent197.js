// ENT-19.7 — Amazon, « emballer les commandes » : GUIDAGE de CAP-C3.3 (conditionner) et CAP-C3.7 (écogestes), CAP OL. Le plus petit carton où
// l'article entre, le calage des fragiles, la pesée en fin de ligne (au-delà de la tolérance, le colis sort chez Théo) et les écogestes du poste.
// Univers : `contenus/amazon.js` ; données : `E197` de `contenus/amazon-donnees.js` ; questions : `contenus/questions/ENT-19.7.js`.
//
// Poids (décidés par Claude, délégation de Tristan du 27/10/2026) : les cartons 6 (1,5 × 4) · le calage 1,5 · la pesée 3 (1,5 × 2) ·
// les écogestes 1,5 · compte rendu 4 · questions au fil 4 = 20.

import { seanceFiches } from './fabrique-fiches.js';
import { U, SALUT, FIN } from './amazon-commun.js';
import { DOC_SITE, DOC_CARTONS, docCommandes, docPesees, blocsCartons, jalonsCartons, blocCaler, jalonCaler, blocsPesees, jalonsPesees,
  blocEcogestes, jalonEcogestes } from './amazon.js';
import { E197 } from './amazon-donnees.js';
import { QUESTIONS } from './questions/ENT-19.7.js';

export * from './amazon.js';

const get = () => E197;

const S = seanceFiches(U, {
  id: 'amazon-emballer', prefixe: '197', titre: 'Emballer les commandes', exercice: 'Séance 7 : emballer les commandes',
  documents: [DOC_SITE, DOC_CARTONS, docCommandes(get), docPesees(get)],
  pas: [
    { id: 'cartons', libelle: 'Les cartons', titre: 'Le carton de chaque commande', sousTitre: 'Les cartons et les commandes sont à gauche.',
      objet: 'Au poste d’emballage', pieces: ['cartons', 'commandes'], documents: ['cartons', 'commandes'], largeurDocs: 1.4,
      message: 'Bonjour {prenom} ! Aujourd’hui tu es à l’emballage, avec Inès. Lis « Les cartons » : pour chaque commande, choisis le plus petit carton où '
        + 'l’article entre, et coche les colis où tu mets du papier pour caler.',
      blocs: [...blocsCartons(E197), blocCaler(E197)],
      jalons: [...jalonsCartons(get, { poids: 1.5, groupe: 'Les cartons' }), jalonCaler(get, { poids: 1.5, groupe: 'Les cartons' })] },
    { id: 'pesee', libelle: 'La pesée', titre: 'La pesée en fin de ligne', sousTitre: 'Le poids attendu et le poids lu sont à gauche.',
      objet: 'La pesée', pieces: ['pesees', 'cartons'], documents: ['pesees', 'cartons'],
      message: 'Tes colis arrivent sur la balance au bout de la ligne. Pour chacun, dis-moi s’il part vers le camion ou s’il sort de la ligne.',
      blocs: blocsPesees(E197), jalons: jalonsPesees(get, { poids: 1.5, groupe: 'La pesée' }) },
    { id: 'eco', libelle: 'Les écogestes', titre: 'Les écogestes du poste', sousTitre: 'Coche tout ce que tu fais.',
      objet: 'Les écogestes', pieces: ['cartons'], documents: ['cartons'],
      message: 'Inès te demande : qu’est-ce que tu fais, au poste, pour moins gaspiller ? Coche tout ce qui est juste.',
      blocs: [blocEcogestes()], jalons: [jalonEcogestes({ poids: 1.5, groupe: 'Les écogestes' })] },
  ],
  compteRendu: { objet: 'Ton compte rendu', poids: 4, message: 'Merci {prenom}. Écris-moi ton compte rendu de l’emballage.',
    lignes: (prenom) => [SALUT,
      { id: 'carton', choix: ['J’ai pris pour chaque commande le plus petit carton où l’article entre.', 'J’ai pris des grands cartons, pour être sûr(e).', 'J’ai pris des petits cartons et j’ai forcé.'], juste: 0 },
      { id: 'caler', choix: ['J’ai calé la tasse en céramique avec du papier.', 'J’ai calé tous les colis avec beaucoup de papier.', 'Je n’ai rien calé.'], juste: 0 },
      { id: 'pesee', choix: ['Le colis 403-3 pesait trop peu : il est sorti de la ligne, chez Théo.', 'Le colis 403-2 est sorti de la ligne : 10 g d’écart.', 'Tous les colis sont partis vers le camion.'], juste: 0 },
      FIN(prenom)] },
  accueil: ['Choisis le carton de chaque commande et cale les fragiles.', 'Dis si chaque colis part ou sort de la ligne.', 'Coche les écogestes.', 'Réponds à Karima, une phrase par ligne.'],
  fin: 'Merci {prenom}. Théo ouvre le colis 403-3 : il manque sûrement l’article.',
  questions: QUESTIONS,
});
export const { ID, FICHES, VOLET, ETAPES, SUITE, ACCUEIL, OPTIONS, fid, corrige } = S;
