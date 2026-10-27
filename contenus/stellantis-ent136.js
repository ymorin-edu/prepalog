// ENT-13.6 — Stellantis Sochaux, « le bord de ligne » : GUIDAGE de C2.3 (contribuer au processus de logistique industrielle), Terminale.
// L'élève apprend le kanban à deux contenants, tient une matinée guidée du bord de ligne (vue `core/types/ligne.js` : ralenti, couverture
// affichée, Karim arrête la ligne au premier geste), puis calcule ce que tient un poste. Brief : `docs/briefs/ENT-13.6-stellantis-bord-de-ligne.md`.
// Univers : `contenus/stellantis.js` ; données : `contenus/stellantis-ligne.js` ; questions : `contenus/questions/ENT-13.6.js`.
//
// Poids (décidés par Claude, délégation de Tristan du 27/10/2026) : le kanban 3 (1 × 3) · la matinée 9 (voitures 4, sans arrêt 3, robots bien
// remplis 2) · la couverture du poste 2 3 (1 × 3) · compte rendu 2 · questions au fil 3 = 20.

import { seanceFiches } from './fabrique-fiches.js';
import { U, SALUT, FIN, DOC_KANBAN, DOC_LIGNE, DOC_POSTE2, DOC_DROIT, POSTE2, TITRES_LIGNE, ligne136, matineeDe, ligneMatinee, LIGNE_GROUPER,
  blocsKanban, jalonsKanban, blocsCouverture, jalonsCouverture } from './stellantis-ligne.js';
import { QUESTIONS } from './questions/ENT-13.6.js';

export * from './stellantis.js';
export { CATALOGUE, SUPPLIERS, SUP_BY_ID, CUSTOMERS, CM, baseDeDepart } from './stellantis-ligne.js';

const ID = 'stellantis-bord-de-ligne';
const S = seanceFiches(U, {
  id: ID, prefixe: '136', titre: 'Le bord de ligne', exercice: 'Temps 2 : le bord de ligne, la matinée guidée',
  documents: [DOC_KANBAN, DOC_LIGNE, DOC_POSTE2, DOC_DROIT],
  pas: [
    { id: 'kanban', libelle: 'Le kanban', titre: 'Le kanban à deux contenants', sousTitre: 'La méthode est dans « Le kanban ».',
      objet: 'Bienvenue au bord de ligne', pieces: ['kanban'], documents: ['kanban', 'postes-ligne'],
      message: 'Bonjour {prenom}, aujourd’hui tu approvisionnes avec moi le bord de ligne du montage : la ligne Peugeot 3008 et 5008, une voiture par minute.\n\n'
        + 'D’abord, la méthode : lis « Le kanban » et réponds à mes trois questions.',
      blocs: blocsKanban(), jalons: jalonsKanban({ poids: 1, groupe: 'Le kanban' }) },
    { id: 'couverture', libelle: 'Le poste 2', titre: 'Combien de temps tient un poste ?', sousTitre: 'Ce que tu lis au poste est dans « Le poste 2 ».',
      objet: 'Le poste 2 à 6 h 40', pieces: ['poste-2'], documents: ['poste-2', 'postes-ligne'],
      message: 'Bravo pour ta première matinée. Maintenant, calcule à la main ce que l’écran t’affichait : combien de temps tient le poste 2 ?',
      blocs: blocsCouverture(), jalons: jalonsCouverture(POSTE2, { poids: 1, groupe: 'Le poste 2' }) },
  ],
  ligne: { apres: 0, decl: ligne136, poids: { voitures: 4, arret: 3, groupes: 2 }, titres: TITRES_LIGNE, groupe: 'La matinée', libelle: 'Bord de ligne',
    objet: 'La matinée guidée', pieces: ['postes-ligne'],
    message: 'Merci {prenom}. Maintenant, la ligne : ouvre « Bord de ligne » dans le menu. Ce matin, la ligne tourne au ralenti et je suis à côté de toi :\n'
      + 'j’arrête la ligne la première fois qu’il se passe quelque chose, pour t’expliquer.\n\nTon travail : envoyer les robots à temps pour que la ligne ne s’arrête jamais.' },
  compteRendu: { objet: 'Ton compte rendu', poids: 2, message: 'Merci {prenom}. Écris-moi ce que je dois retenir de ta matinée.',
    lignes: (prenom, db) => [SALUT,
      ligneMatinee(matineeDe(ligne136, ID, db).R, 60),
      { id: 'kanban', choix: ['Quand un contenant est vide, sa carte part dans la boîte : je rapporte un plein avant que l’autre soit vide.',
        'J’attends que les deux contenants d’un poste soient vides pour envoyer un robot.', 'J’envoie un robot toutes les dix minutes, carte ou pas.'], juste: 0 },
      LIGNE_GROUPER,
      FIN(prenom)] },
  accueil: ['Le kanban à deux contenants.', 'La matinée guidée, de 6 h à 7 h.', 'Ce que tient le poste 2.', 'Réponds à Karim, une phrase par ligne.'],
  fin: 'Merci {prenom}. Demain, la ligne ira plus vite, et je ne serai pas à côté de toi.',
  questions: QUESTIONS,
});
export const { FICHES, VOLET, ETAPES, SUITE, ACCUEIL, OPTIONS, fid, corrige } = S;
export { ID };
