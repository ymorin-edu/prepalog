// ENT-19.10 — Amazon, « évaluation : prélever et emballer » : ÉVALUATION de CAP-C3.1, C3.2 et C3.3, CAP OL, copie rendue. Seul(e), sur un jeu
// NEUF tiré d'après la graine de l'élève (trois jeux : `JEUX1910`) : quatre lignes à prélever (une case vide, un article qui n'est pas celui de la
// photo, un article abîmé), trois commandes à emballer, deux pesées, le compte rendu.
// Univers : `contenus/amazon.js` ; données : `jeu1910` de `contenus/amazon-donnees.js` ; questions : `contenus/questions/ENT-19.10.js`.
//
// Poids (décidés par Claude, délégation de Tristan du 27/10/2026) : prélever 6 (1,5 × 4) · les cartons 4,5 (1,5 × 3) · le calage 1 ·
// la pesée 2,5 (1,25 × 2) · compte rendu 3 · « Avant de commencer » noté 3 = 20.

import { seanceFiches } from './fabrique-fiches.js';
import { U, SALUT, FIN } from './amazon-commun.js';
import { DOC_SITE, DOC_PRELEVER, DOC_CARTONS, docPrelevement, docCommandes, docPesees, blocsPrelevement, jalonsPrelevement, blocsCartons,
  jalonsCartons, blocCaler, jalonCaler, blocsPesees, jalonsPesees, peseeJuste } from './amazon.js';
import { jeu1910, actionJuste, ARTICLES } from './amazon-donnees.js';
import { QUESTIONS } from './questions/ENT-19.10.js';

export * from './amazon.js';

const getP = (db) => jeu1910(db).prelev;
const getE = (db) => jeu1910(db).emb;
const ligne = (db, a) => getP(db).lignes.find((L) => actionJuste(L) === a);
const nom = (L) => `« ${ARTICLES[L.ref].nom} »`;

const S = seanceFiches(U, {
  id: 'amazon-evaluation-commandes', prefixe: '1910', titre: 'Évaluation : prélever et emballer', exercice: 'Séance 10 : évaluation, prélever et emballer',
  documents: [DOC_SITE, DOC_PRELEVER, DOC_CARTONS, docPrelevement(getP), docCommandes(getE), docPesees(getE)],
  pas: [
    { id: 'lignes', libelle: 'Prélever', titre: 'Ce que tu fais à chaque ligne', sousTitre: 'Regarde bien chaque case.',
      objet: 'Évaluation : à toi seul(e)', pieces: ['prelever', 'prelevement'], documents: ['prelever', 'prelevement'], largeurDocs: 1.4,
      message: 'Bonjour {prenom}. Aujourd’hui, c’est une évaluation : je suis en réunion, tu tiens le poste seul(e). Rien n’est corrigé avant que tu rendes ta copie.\n\n'
        + 'D’abord le prélèvement : pour chaque ligne, dis-moi ce que tu fais.',
      blocs: (db) => blocsPrelevement(getP(db)), jalons: jalonsPrelevement(getP, { poids: 1.5, groupe: 'Prélever' }) },
    { id: 'cartons', libelle: 'Emballer', titre: 'Le carton de chaque commande', sousTitre: 'Les cartons et les commandes sont à gauche.',
      objet: 'L’emballage', pieces: ['cartons', 'commandes'], documents: ['cartons', 'commandes'], largeurDocs: 1.4,
      message: 'Maintenant, l’emballage : le carton de chaque commande, et les colis à caler.',
      blocs: (db) => [...blocsCartons(getE(db)), blocCaler(getE(db))],
      jalons: [...jalonsCartons(getE, { poids: 1.5, groupe: 'Emballer' }), jalonCaler(getE, { poids: 1, groupe: 'Emballer' })] },
    { id: 'pesee', libelle: 'La pesée', titre: 'La pesée en fin de ligne', sousTitre: 'Le poids attendu et le poids lu sont à gauche.',
      objet: 'La pesée', pieces: ['pesees', 'cartons'], documents: ['pesees', 'cartons'],
      message: 'Deux de tes colis arrivent sur la balance. Pour chacun, dis-moi s’il part vers le camion ou s’il sort de la ligne.',
      blocs: (db) => blocsPesees(getE(db)), jalons: jalonsPesees(getE, { poids: 1.25, groupe: 'La pesée' }) },
  ],
  compteRendu: { objet: 'Ton compte rendu', poids: 3, message: 'Merci {prenom}. Écris-moi ton compte rendu, puis rends ta copie : tu ne pourras plus rien modifier.',
    lignes: (prenom, db) => { const V = ligne(db, 'vide'), A = ligne(db, 'autre'), B = ligne(db, 'abime'); const E = getE(db);
      const sort = E.pesees.find((p) => peseeJuste(E, p) === 'sortir'), part = E.pesees.find((p) => peseeJuste(E, p) === 'part');
      return [SALUT,
        { id: 'signale', choix: [`J’ai signalé la ligne ${V.n} (case vide) et la ligne ${A.n} (ce n’était pas l’article de la photo).`,
          `J’ai signalé la ligne ${A.n} (case vide) et la ligne ${V.n} (ce n’était pas l’article de la photo).`,
          `À la ligne ${A.n}, j’ai pris l’article qui ressemblait le plus.`], juste: 0 },
        { id: 'abime', choix: [`Ligne ${B.n} : l’article ${nom(B)} était abîmé, je l’ai signalé sans le prendre.`, `Ligne ${B.n} : j’ai pris l’article ${nom(B)}, pourtant abîmé.`,
          `Ligne ${B.n} : j’ai jeté l’article ${nom(B)} à la poubelle.`], juste: 0 },
        { id: 'pesee', choix: [`Le colis ${sort.id} n’avait pas le bon poids : il est sorti de la ligne, chez Théo.`, `Le colis ${part.id} n’avait pas le bon poids : il est sorti de la ligne.`,
          'Tous les colis sont partis vers le camion.'], juste: 0 },
        FIN(prenom)]; } },
  accueil: ['Dis ce que tu fais à chaque ligne.', 'Choisis les cartons et cale les fragiles.', 'Dis si chaque colis part ou sort de la ligne.', 'Réponds à Karima, puis rends ta copie.'],
  fin: 'Merci {prenom}. N’oublie pas de rendre ta copie.',
  questions: QUESTIONS,
  tirage: true,
});
export const { ID, FICHES, VOLET, ETAPES, SUITE, ACCUEIL, OPTIONS, fid, corrige } = S;
