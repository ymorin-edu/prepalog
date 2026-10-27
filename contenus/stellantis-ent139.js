// ENT-13.9 — Stellantis Sochaux, « évaluation : le bord de ligne » : ÉVALUATION de C2.3, Terminale, copie rendue. Seul(e), sur un jeu tiré
// d'après la graine de l'élève (quatre jeux : `JEUX_139`, contrôle d'équité au bloc de tests `stellantis-ligne`) : « Avant de commencer » noté,
// le poste du jour (tiré), une matinée de 90 minutes avec un camion en retard, aucun retour ni bilan, puis le compte rendu et la copie.
// Brief : `docs/briefs/ENT-13.9-stellantis-evaluation-ligne.md`. Univers : `contenus/stellantis.js` ; données : `contenus/stellantis-ligne.js` ;
// questions : `contenus/questions/ENT-13.9.js`.
//
// Poids (décidés par Claude, délégation de Tristan du 27/10/2026) : « Avant de commencer » noté 3 · le poste du jour 3 (1,5 × 2) · la matinée 11,5
// (voitures 3, sans arrêt 2, robots bien remplis 2, heure d'arrêt 2, voitures perdues 1, décision 1,5) · compte rendu 2,5 = 20.

import { seanceFiches } from './fabrique-fiches.js';
import { graineDeBase } from '../core/tirage.js';
import { U, SALUT, FIN, DOC_KANBAN, DOC_LIGNE, DOC_DROIT, TITRES_LIGNE, ligne139, posteJour, docPosteJour, LIGNE_GROUPER, LIGNE_DECISION,
  blocsCouverture, jalonsCouverture } from './stellantis-ligne.js';
import { QUESTIONS } from './questions/ENT-13.9.js';

export * from './stellantis.js';
export { CATALOGUE, SUPPLIERS, SUP_BY_ID, CUSTOMERS, CM, baseDeDepart } from './stellantis-ligne.js';

const ID = 'stellantis-evaluation-ligne';
const get = (db) => posteJour(graineDeBase(db));
const S = seanceFiches(U, {
  id: ID, prefixe: '139', titre: 'Évaluation : le bord de ligne', exercice: 'Temps 2 : évaluation, le bord de ligne', copie: true, tirage: true,
  documents: [docPosteJour(get), DOC_LIGNE, DOC_KANBAN, DOC_DROIT],
  pas: [
    { id: 'poste', libelle: 'Le poste du jour', titre: 'Combien de temps tient ce poste ?', sousTitre: 'Ce que tu lis au poste est dans « Le poste ».',
      objet: 'Évaluation : à toi seul(e)', pieces: ['poste-jour'], documents: ['poste-jour', 'postes-ligne'],
      message: 'Bonjour {prenom}. Aujourd’hui, c’est une évaluation : tu tiens le bord de ligne seul(e). Rien n’est corrigé avant que tu rendes ta copie.\n\n'
        + 'D’abord, un poste : combien de voitures il tient, et au plus tard quand envoyer le robot après la carte.',
      blocs: blocsCouverture({ vide: false }), jalons: jalonsCouverture(get, { poids: 1.5, groupe: 'Le poste du jour', vide: false }) },
  ],
  ligne: { apres: 0, decl: ligne139, poids: { voitures: 3, arret: 2, groupes: 2, heure: 2, perdues: 1, decision: 1.5 }, titres: TITRES_LIGNE,
    groupes: { heure: 'Le camion en retard', perdues: 'Le camion en retard', decision: 'Le camion en retard' }, groupe: 'La matinée', libelle: 'Bord de ligne',
    objet: 'La matinée de l’évaluation', pieces: ['postes-ligne'],
    message: 'Merci {prenom}. Ouvre « Bord de ligne » dans le menu : de 6 h à 7 h 30, la ligne est à toi. Une seule matinée, sans bilan.\n\n'
      + 'Il reste peu de racks de planches de bord au transstockeur : un camion de l’équipementier doit en livrer ce matin.' },
  compteRendu: { objet: 'Ton compte rendu', poids: 2.5, message: 'Merci {prenom}. Écris-moi ton compte rendu, puis rends ta copie : tu ne pourras plus rien modifier.',
    lignes: (prenom) => [SALUT, LIGNE_GROUPER, LIGNE_DECISION, FIN(prenom)] },
  accueil: ['Le poste du jour.', 'La matinée, seul(e), sans bilan.', 'Réponds à Karim, puis rends ta copie.'],
  fin: 'Merci {prenom}. N’oublie pas de rendre ta copie.',
  questions: QUESTIONS,
});
export const { FICHES, VOLET, ETAPES, SUITE, ACCUEIL, OPTIONS, fid, corrige } = S;
export { ID };
