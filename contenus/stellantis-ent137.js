// ENT-13.7 — Stellantis Sochaux, « la matinée sans aide » : ENTRAÎNEMENT de C2.3, Terminale. L'élève compte d'abord ce que consomme la ligne
// en une heure (d'où : il faut grouper les cartes), puis tient seul(e) une matinée de 90 minutes, plus rapide, couverture cachée, bilan à la fin.
// Le confirmé a un cinquième poste (faisceaux électriques) ; l'accompagné, une ligne plus lente. Brief : `docs/briefs/ENT-13.7-stellantis-matinee-sans-aide.md`.
// Univers : `contenus/stellantis.js` ; données : `contenus/stellantis-ligne.js` ; questions : `contenus/questions/ENT-13.7.js`.
//
// Poids (décidés par Claude, délégation de Tristan du 27/10/2026) : ce que consomme la ligne 5 (1 × 5) · la matinée 9 (voitures 4, sans arrêt 3,
// robots bien remplis 2) · compte rendu 2 · questions au fil 4 = 20.

import { seanceFiches } from './fabrique-fiches.js';
import { U, SALUT, FIN, DOC_KANBAN, DOC_LIGNE, DOC_HEURE, DOC_DROIT, TITRES_LIGNE, ligne137, matineeDe, ligneMatinee, blocsConso, jalonsConso } from './stellantis-ligne.js';
import { QUESTIONS } from './questions/ENT-13.7.js';

export * from './stellantis.js';
export { CATALOGUE, SUPPLIERS, SUP_BY_ID, CUSTOMERS, CM, baseDeDepart } from './stellantis-ligne.js';

const ID = 'stellantis-matinee-sans-aide';
const S = seanceFiches(U, {
  id: ID, prefixe: '137', titre: 'La matinée sans aide', exercice: 'Temps 2 : le bord de ligne, la matinée sans aide',
  documents: [DOC_HEURE, DOC_LIGNE, DOC_KANBAN, DOC_DROIT],
  pas: [
    { id: 'conso', libelle: 'La ligne en une heure', titre: 'Ce que consomme la ligne', sousTitre: 'Les données sont dans « Une heure ».',
      objet: 'Avant la matinée', pieces: ['ligne-heure'], documents: ['ligne-heure', 'postes-ligne'],
      message: 'Bonjour {prenom}. Aujourd’hui, tu tiens le bord de ligne seul(e), de 6 h à 7 h 30, et la ligne tourne à sa vraie vitesse.\n\n'
        + 'Avant de commencer, compte ce que la ligne consomme en une heure : tu comprendras ce qui t’attend.',
      blocs: blocsConso(), jalons: jalonsConso({ poids: 1, groupe: 'Ce que consomme la ligne' }) },
  ],
  ligne: { apres: 0, decl: ligne137, poids: { voitures: 4, arret: 3, groupes: 2 }, titres: TITRES_LIGNE, groupe: 'La matinée', libelle: 'Bord de ligne',
    objet: 'La matinée sans aide', pieces: ['postes-ligne'],
    message: 'Merci {prenom}. Ouvre « Bord de ligne » dans le menu. Cette fois, je ne suis pas à côté de toi : l’écran n’affiche plus ce que tient chaque poste,\n'
      + 'à toi de le lire dans les contenants. Tu auras le bilan à la fin ; tu pourras rejouer, mais c’est ta première matinée qui compte.' },
  compteRendu: { objet: 'Ton compte rendu', poids: 2, message: 'Merci {prenom}. Écris-moi comment s’est passée ta matinée.',
    lignes: (prenom, db) => { const { D, R } = matineeDe(ligne137, ID, db); return [SALUT,
      ligneMatinee(R, D.minutes),
      { id: 'conso', choix: ['La ligne vide plus de 20 contenants par heure : je groupe deux cartes par robot dès que le poids le permet.',
        'La ligne vide 4 contenants par heure : un robot suffit.', 'La ligne vide plus de 20 contenants par heure : j’envoie tout en appel urgent.'], juste: 0 },
      FIN(prenom)]; } },
  accueil: ['Ce que la ligne consomme en une heure.', 'La matinée, seul(e), de 6 h à 7 h 30.', 'Réponds à Karim, une phrase par ligne.'],
  fin: 'Merci {prenom}. Demain, un camion de l’équipementier risque d’être en retard : on verra comment tu t’en sors.',
  questions: QUESTIONS,
});
export const { FICHES, VOLET, ETAPES, SUITE, ACCUEIL, OPTIONS, fid, corrige } = S;
export { ID };
