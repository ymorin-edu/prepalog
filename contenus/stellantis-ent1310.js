// ENT-13.10 — Stellantis Sochaux, « l'équipe du matin » : GUIDAGE de C3.4 (coordonner une petite équipe logistique), Terminale. Karim est en
// formation : l'élève, chef d'équipe remplaçant, affecte quatre personnes à quatre postes, accueille Théo (intérimaire, premier jour), écrit la
// consigne du jour et dit ce qui est vrai des droits de Théo. Écart au cadrage : en fiches, sans `planning` ni `dialogue` (voir `stellantis-equipe.js`).
// Univers : `contenus/stellantis.js` ; données : `contenus/stellantis-equipe.js` ; questions : `contenus/questions/ENT-13.10.js`.
//
// Poids (décidés par Claude, délégation de Tristan du 26/10/2026) : l'affectation 4 (1 × 4) · l'accueil 2,5 (0,5 × 5) · la consigne 3,5 · les droits
// de Théo 2 · compte rendu 4 · questions au fil 4 = 20.

import { seanceFiches } from './fabrique-fiches.js';
import { U, SALUT, FIN, E1310, DOC_POSTES, DOC_ACCUEIL, docEquipe, blocsAffectation, jalonsAffectation, blocAccueil, jalonsAccueil,
  blocConsigne, jalonConsigne, blocDroits, jalonDroits } from './stellantis-equipe.js';
import { QUESTIONS } from './questions/ENT-13.10.js';

export * from './stellantis.js';
export { CATALOGUE, SUPPLIERS, SUP_BY_ID, CUSTOMERS, CM, baseDeDepart } from './stellantis-equipe.js';

const get = () => E1310;

const S = seanceFiches(U, {
  id: 'stellantis-equipe-matin', prefixe: '1310', titre: 'L’équipe du matin', exercice: 'Temps 2 : l’équipe du matin',
  documents: [DOC_POSTES, docEquipe(get, 'Lundi 6 mars 2028, prise de poste à 6 h'), DOC_ACCUEIL],
  pas: [
    { id: 'affectation', libelle: 'Les postes', titre: 'Qui tient quel poste ?', sousTitre: 'Les exigences sont dans « Les postes ».',
      objet: 'Je te confie l’équipe du matin', pieces: ['postes', 'equipe-matin'], documents: ['postes', 'equipe-matin'], largeurDocs: 1.3,
      message: 'Bonjour {prenom}, je suis en formation toute la journée : je te confie l’équipe du matin du secteur réception et approvisionnement.\n\n'
        + 'Quatre postes, quatre personnes. Lis « Les postes » et « L’équipe », puis dis-moi qui tient quel poste, en suivant la règle de l’équipe.',
      blocs: blocsAffectation(E1310), jalons: jalonsAffectation(get, { poids: 1, groupe: 'Les postes' }) },
    { id: 'accueil', libelle: 'L’accueil', titre: 'Accueillir Théo', sousTitre: 'Le livret est dans « L’accueil ».',
      objet: 'Théo arrive à 6 h', pieces: ['accueil'], documents: ['accueil'],
      message: 'Théo, l’intérimaire, arrive à 6 h : c’est son premier jour. Remets dans l’ordre ce que tu fais avec lui, de son arrivée à la fin de sa matinée.',
      blocs: [blocAccueil()], jalons: jalonsAccueil({ poids: 0.5, groupe: 'L’accueil de Théo' }) },
    { id: 'consigne', libelle: 'La consigne', titre: 'La consigne du jour', sousTitre: 'Elle est affichée pour toute l’équipe.',
      objet: 'La consigne affichée', pieces: ['equipe-matin'], documents: ['equipe-matin', 'postes'],
      message: 'Chaque matin, j’affiche une consigne au tableau de l’équipe. Coche ce que tu y écris aujourd’hui, et seulement ça.',
      blocs: [blocConsigne()], jalons: [jalonConsigne({ poids: 3.5, groupe: 'La consigne' })] },
    { id: 'droits', libelle: 'Les droits', titre: 'Théo, intérimaire', sousTitre: 'Coche tout ce qui est vrai.',
      objet: 'Une question de Théo', pieces: ['accueil'], documents: ['accueil'],
      message: 'Théo te demande ce qui l’attend aujourd’hui. Coche ce qui est vrai pour lui.',
      blocs: [blocDroits()], jalons: [jalonDroits({ poids: 2, groupe: 'Les droits de Théo' })] },
  ],
  compteRendu: { objet: 'Ton compte rendu', poids: 4, message: 'Merci {prenom}. Écris-moi ce que je dois savoir en rentrant de formation.',
    lignes: (prenom) => [SALUT,
      { id: 'postes', choix: ['Julien est au bord de ligne, Amel au quai, Sébastien aux racks et Théo aux kits.',
        'Amel est au bord de ligne, Julien au quai, Sébastien aux racks et Théo aux kits.', 'Julien est au bord de ligne, Théo au quai, Sébastien aux racks et Amel aux kits.'], juste: 0 },
      { id: 'theo', choix: ['Théo a eu l’accueil sécurité avant d’aller aux kits ; il ne conduit aucun chariot.', 'Théo est allé directement au quai pour gagner du temps.',
        'Théo a conduit le chariot du quai, Julien lui a montré.'], juste: 0 },
      { id: 'consigne', choix: ['La consigne du jour est affichée : les postes, le tuteur de Théo, le rappel sécurité et la relève.',
        'La consigne du jour dit ce que je pense de chacun.', 'Je n’ai pas écrit de consigne : tout le monde sait ce qu’il a à faire.'], juste: 0 },
      FIN(prenom)] },
  accueil: ['Qui tient quel poste.', 'Accueillir Théo, dans l’ordre.', 'La consigne du jour.', 'Les droits de Théo.', 'Réponds à Karim, une phrase par ligne.'],
  fin: 'Merci {prenom}. La prochaine fois, ce sera plus compliqué : une absence, une pointe de 5008.',
  questions: QUESTIONS,
});
export const { ID, FICHES, VOLET, ETAPES, SUITE, ACCUEIL, OPTIONS, fid, corrige } = S;
