// ENT-23.6 — Yves Rocher, « évaluation : une commande et une réclamation » : ÉVALUATION de C2.2 et C2.1, 2de Bac Pro, copie rendue. Seul(e), sur un
// jeu NEUF tiré d'après la graine de l'élève (trois jeux : `TOUS_JEUX236`) : la façon de préparer les cinq lignes d'une commande, l'ordre de
// prélèvement, ce qu'on prend en une fois à une adresse partagée du chariot, une décision par article d'une réclamation, puis le compte rendu.
// Univers : `contenus/yves-rocher.js` ; données : `jeu236` de `contenus/yves-rocher-donnees.js` ; questions : `contenus/questions/ENT-23.6.js`.
//
// Poids (décidés par Claude, délégation de Tristan du 26/10/2026) : préparer 4 (0,8 × 5) · l'ordre de prélèvement 2,5 (0,5 × 5) · le chariot 1,5 ·
// la réclamation 4,5 (1,5 × 3) · compte rendu 4,5 · « Avant de commencer » noté 3 = 20.

import { seanceFiches, proche } from './fabrique-fiches.js';
import { U_PREPA, SALUT, FIN } from './yves-rocher-commun.js';
import { DOC_SITE, DOC_PREPARER, DOC_REPONDRE, DOC_TOURNEES, docCommande, docChariot, docReclamation, blocsTypes, jalonsTypes, blocOrdre, jalonsOrdre,
  blocsReclam, jalonsReclam } from './yves-rocher.js';
import { jeu236, ordreDe, nomDe, PRODUITS, prochaine, totalA } from './yves-rocher-donnees.js';
import { QUESTIONS } from './questions/ENT-23.6.js';

export * from './yves-rocher.js';

const cmd = (db) => { const J = jeu236(db); return { boutique: J.boutique, lignes: J.lignes }; };
const rec = (db) => jeu236(db).reclam;
const chariot = (db) => { const J = jeu236(db); return [{ bac: 1, boutique: J.boutique, lignes: J.lignes }, { bac: 2, boutique: J.voisin.boutique, lignes: [{ prod: J.voisin.prod, qte: J.voisin.qte }] }]; };
const total = (db) => totalA(chariot(db), jeu236(db).voisin.prod);
const manque = (db) => rec(db).plaintes.find((p) => p.cas === 'manque');

const S = seanceFiches(U_PREPA, {
  id: 'yves-rocher-evaluation', prefixe: '236', titre: 'Évaluation : une commande et une réclamation', exercice: 'Évaluation : une commande et une réclamation',
  documents: [DOC_SITE, DOC_PREPARER, DOC_REPONDRE, DOC_TOURNEES, docCommande(cmd), docChariot(chariot), docReclamation(rec)],
  pas: [
    { id: 'types', libelle: 'Préparer', titre: 'Cartons complets ou détail ?', sousTitre: 'Les cinq lignes de la commande.',
      objet: 'Ta commande', pieces: ['commande', 'preparer'], documents: ['commande', 'preparer'],
      message: 'Bonjour {prenom}. Aujourd’hui, tu travailles seul(e). Voici la commande d’une boutique : comment prépares-tu chaque ligne ?',
      blocs: (db) => blocsTypes(cmd(db)), jalons: jalonsTypes(cmd, { poids: 0.8, groupe: 'Préparer' }) },
    { id: 'ordre', libelle: 'L’ordre', titre: 'Mon ordre de prélèvement', sousTitre: 'Range les produits dans l’ordre de ton parcours.',
      objet: 'Ton parcours', pieces: ['commande'], documents: ['commande', 'preparer'],
      message: 'Range maintenant les cinq produits dans l’ordre de ton parcours.',
      blocs: (db) => [blocOrdre(cmd(db))], jalons: jalonsOrdre(cmd, { poids: 0.5, groupe: 'L’ordre de prélèvement' }) },
    { id: 'chariot', libelle: 'Le chariot', titre: 'Une adresse partagée', sousTitre: 'Une autre boutique est sur ton chariot.',
      objet: 'Ton chariot', pieces: ['chariot'], documents: ['chariot', 'preparer'],
      message: 'Une deuxième boutique est sur ton chariot. Regarde « Ton chariot » : à l’adresse que vous partagez, combien d’articles prends-tu en une fois ?',
      blocs: (db) => { const p = jeu236(db).voisin.prod; return [{ type: 'nombre', id: 'total', lib: `À l’adresse ${PRODUITS[p].adr} (${nomDe(p).toLowerCase()}) : combien en prends-tu en tout ?`,
        unite: 'articles', min: 0, entier: true, manque: 'le nombre d’articles' }]; },
      jalons: [{ id: 'total', titre: 'Le chariot : l’adresse partagée', groupe: 'Le chariot', poids: 1.5, attendu: (db) => String(total(db)), juste: (v, db) => proche(v.total, total(db)) }] },
    { id: 'reclam', libelle: 'La réclamation', titre: 'Une réclamation', sousTitre: 'Inès te demande ton avis sur trois articles.',
      objet: 'Pour Inès', pieces: ['reclamation', 'repondre'], documents: ['reclamation', 'repondre', 'tournees'],
      message: 'Inès a reçu une réclamation et te demande ton aide. Pour chaque article, compare avec le bon de préparation et décide.',
      blocs: (db) => blocsReclam(rec(db)), jalons: jalonsReclam(rec, { poids: 1.5, groupe: 'La réclamation' }) },
  ],
  compteRendu: { objet: 'Ton compte rendu', poids: 4.5, message: 'Merci {prenom}. Écris-moi ton compte rendu, une phrase par ligne, puis rends ta copie : tu ne pourras plus rien modifier.',
    lignes: (prenom, db) => {
      const C = cmd(db), P = ordreDe(C.lignes)[0], M = manque(db), R = rec(db), J = prochaine(R.boutique, R.jour);
      return [SALUT('Soizic'),
        { id: 'premier', choix: [`Pour ${C.boutique}, je commence par : ${nomDe(P).toLowerCase()}, allée ${PRODUITS[P].adr.slice(0, 2)}.`,
          `Pour ${C.boutique}, je commence par : ${nomDe(C.lignes[C.lignes.length - 1].prod).toLowerCase()}, la dernière ligne du bon.`,
          `Pour ${C.boutique}, je commence par : ${nomDe(C.lignes[0].prod).toLowerCase()}, la première ligne du bon.`], juste: 0 },
        { id: 'manque', choix: [`Il manquait bien ${M.qte} ${nomDe(M.prod).toLowerCase()} à ${R.boutique} : ils partent ${J}, avec la prochaine livraison.`,
          `Il manquait bien ${M.qte} ${nomDe(M.prod).toLowerCase()} à ${R.boutique} : ils partent aujourd’hui.`,
          `Rien ne manquait à ${R.boutique} : la plateforme a tout préparé.`], juste: 0 },
        FIN(prenom)];
    } },
  accueil: ['Cartons complets ou détail, pour cinq lignes.', 'L’ordre de ton parcours.', 'Une adresse partagée du chariot.', 'Une réclamation : une décision par article.', 'Réponds à Soizic, puis rends ta copie.'],
  fin: 'Merci {prenom}. N’oublie pas de rendre ta copie.',
  questions: QUESTIONS,
  tirage: true,
});
export const { ID, FICHES, VOLET, ETAPES, SUITE, ACCUEIL, OPTIONS, fid, corrige } = S;
