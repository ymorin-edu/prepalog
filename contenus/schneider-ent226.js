// ENT-22.6 — Schneider Electric, « évaluation : recevoir un camion » : ÉVALUATION de CAP-C1.3 et CAP-C1.4 (le positionnement EP1 de la
// réception, progression CAP du 18/10/2026), CAP OL, copie rendue. Seul(e), sur un jeu NEUF tiré d'après la graine de l'élève (trois jeux :
// `TOUS_JEUX226`) : le quai et les palettes de son camion, deux pré-contrôles, les colis lourds, le contrôle de cinq lignes, les quantités, la
// décision et la réserve, le compte rendu.
// Univers : `contenus/schneider.js` ; données : `jeu226` de `contenus/schneider-donnees.js` ; questions : `contenus/questions/ENT-22.6.js`.
//
// Poids (décidés par Claude, délégation de Tristan du 26/10/2026) : planigramme 2 (1 × 2) · pré-contrôle 2 (1 × 2) · colis lourds 1,5 · lignes 5
// (1 × 5) · quantités 2 (1 × 2) · décision 1 · réserve 1,5 · compte rendu 2 · « Avant de commencer » noté 3 = 20.

import { seanceFiches } from './fabrique-fiches.js';
import { U, SALUT, FIN } from './schneider-commun.js';
import { DOC_SITE, DOC_PROTOCOLE, DOC_CONTROLE, docPlanigramme, docPrecontrole, docColis, docBL, blocsQuai, jalonsQuai, blocsPrecontrole, jalonsPrecontrole,
  blocLourds, jalonLourds, blocsLignes, jalonsLignes, blocsQuantites, jalonsQuantites, blocsReserve, jalonsReserve } from './schneider.js';
import { jeu226, manque, abimes, enTrop } from './schneider-donnees.js';
import { QUESTIONS } from './questions/ENT-22.6.js';

export * from './schneider.js';

const get = (db) => jeu226(db);
const bl = (db) => get(db).bl;
const phrase = (m, a, t) => `${m} colis manquant${m > 1 ? 's' : ''}, ${a} abîmé${a > 1 ? 's' : ''}, ${t} en trop : j’ai accepté avec des réserves précises.`;

const S = seanceFiches(U, {
  id: 'schneider-evaluation-reception', prefixe: '226', titre: 'Évaluation : recevoir un camion', exercice: 'Séance 6 : évaluation, recevoir un camion',
  documents: [DOC_SITE, DOC_PROTOCOLE, DOC_CONTROLE, docPlanigramme(get), docPrecontrole((db) => get(db).sits), docColis((db) => get(db).lourds), docBL(bl)],
  pas: [
    { id: 'plani', libelle: 'Le planigramme', titre: 'Mon camion sur le planigramme', sousTitre: 'Ton camion est en gras, à gauche.',
      objet: 'Évaluation : à toi seul(e)', pieces: ['planigramme'], documents: ['planigramme'],
      message: 'Bonjour {prenom}. Aujourd’hui, c’est une évaluation : je suis en réunion, tu tiens le quai seul(e). Rien n’est corrigé avant que tu rendes ta copie.\n\n'
        + 'D’abord, ton camion sur le planigramme.',
      blocs: (db) => blocsQuai(get(db)), jalons: jalonsQuai(get, { quai: 1, palettes: 1, groupe: 'Le planigramme' }) },
    { id: 'precontrole', libelle: 'Le pré-contrôle', titre: 'Avant d’ouvrir les portes', sousTitre: 'Deux camions. Pour chacun, que fais-tu ?',
      objet: 'Le pré-contrôle', pieces: ['precontrole'], documents: ['precontrole', 'protocole'],
      message: 'Deux camions sont à quai. Pour chacun, dis-moi ce que tu fais.',
      blocs: (db) => blocsPrecontrole(get(db).sits), jalons: jalonsPrecontrole((db) => get(db).sits, { poids: 1, groupe: 'Le pré-contrôle' }) },
    { id: 'lourds', libelle: 'Les colis lourds', titre: 'Les colis à porter', sousTitre: 'Coche les colis qui se portent avec un exosquelette ou à deux.',
      objet: 'Les colis lourds', pieces: ['colis'], documents: ['colis'],
      message: 'Quelques colis se déchargent à la main. Coche ceux qui demandent une aide.',
      blocs: (db) => [blocLourds(get(db).lourds)], jalons: [jalonLourds((db) => get(db).lourds, { poids: 1.5, groupe: 'Les colis lourds' })] },
    { id: 'lignes', libelle: 'Le contrôle', titre: 'Ligne par ligne', sousTitre: 'Le bon de livraison et le comptage sont à gauche.',
      objet: 'Le contrôle', pieces: ['bl', 'controle'], documents: ['bl', 'controle'], largeurDocs: 1.3,
      message: 'Ton camion est déchargé et compté. Donne le statut de chaque ligne.',
      blocs: (db) => blocsLignes(bl(db)), jalons: jalonsLignes(bl, { poids: 1, groupe: 'Le contrôle' }) },
    { id: 'quantites', libelle: 'Les quantités', titre: 'Combien ?', sousTitre: 'En tout, sur toute la livraison.',
      objet: 'Les quantités', pieces: ['bl'], documents: ['bl'],
      message: 'Combien de colis manquent, et combien sont abîmés ?',
      blocs: blocsQuantites(), jalons: jalonsQuantites(bl, { manque: 1, abimes: 1, groupe: 'Les quantités' }) },
    { id: 'reserve', libelle: 'La réserve', titre: 'La décision et la réserve', sousTitre: 'Le chauffeur attend pour signer.',
      objet: 'La lettre de voiture', pieces: ['controle'], documents: ['controle', 'bl'],
      message: 'Le chauffeur attend pour signer. Que fais-tu de la livraison, et qu’écris-tu ?',
      blocs: (db) => blocsReserve(bl(db)), jalons: jalonsReserve(bl, { decision: 1, reserve: 1.5, groupe: 'La réserve' }) },
  ],
  compteRendu: { objet: 'Ton compte rendu', poids: 2, message: 'Merci {prenom}. Écris-moi ton compte rendu, puis rends ta copie : tu ne pourras plus rien modifier.',
    lignes: (prenom, db) => { const L = bl(db).lignes; const m = manque(L), a = abimes(L), t = enTrop(L);
      return [SALUT, { id: 'bilan', choix: [phrase(m, a, t), phrase(m + 1, a, t), phrase(m, a + 1, t + 1)], juste: 0 }, FIN(prenom)]; } },
  accueil: ['Ton camion sur le planigramme.', 'Deux pré-contrôles.', 'Les colis lourds.', 'Le statut de chaque ligne.', 'Les quantités.', 'La décision et la réserve.', 'Réponds à Nadia, puis rends ta copie.'],
  fin: 'Merci {prenom}. N’oublie pas de rendre ta copie.',
  questions: QUESTIONS,
  tirage: true,
});
export const { ID, FICHES, VOLET, ETAPES, SUITE, ACCUEIL, OPTIONS, fid, corrige } = S;
