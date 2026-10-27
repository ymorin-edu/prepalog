// ENT-13.11 — Stellantis Sochaux, « un absent, une pointe de 5008 » : ENTRAÎNEMENT de C3.4, Terminale. Julien est absent ; Amel revient avec un avis
// du médecin du travail ; Inès, intérimaire, arrive ; la ligne monte à 45 % de 5008. L'élève réaffecte, calcule la charge des kits, demande un renfort,
// aménage le poste d'Amel et garde le secret médical. Écart au cadrage : en fiches, sans `planning` ni `dialogue` (voir `stellantis-equipe.js`).
// Univers : `contenus/stellantis.js` ; données : `contenus/stellantis-equipe.js` ; questions : `contenus/questions/ENT-13.11.js`.
//
// Poids (décidés par Claude, délégation de Tristan du 26/10/2026) : l'affectation 4 (1 × 4) · la charge 3,5 (1 + 1 + 1,5) · le renfort 1,5 ·
// l'aménagement 2 · le secret 1,5 · compte rendu 3,5 · questions au fil 4 = 20.

import { seanceFiches } from './fabrique-fiches.js';
import { U, SALUT, FIN, E1311, PART1311, DOC_POSTES, DOC_ACCUEIL, DOC_AVIS, docEquipe, docCharge, blocsAffectation, jalonsAffectation, blocsCharge, jalonsCharge,
  RENFORT, AMENAGEMENT, SECRET, charge, memes } from './stellantis-equipe.js';
import { QUESTIONS } from './questions/ENT-13.11.js';

export * from './stellantis.js';
export { CATALOGUE, SUPPLIERS, SUP_BY_ID, CUSTOMERS, CM, baseDeDepart } from './stellantis-equipe.js';

const get = () => E1311;
const C = charge(PART1311);
const fr = (x) => String(x).replace('.', ',');

const S = seanceFiches(U, {
  id: 'stellantis-equipe-pointe', prefixe: '1311', titre: 'Un absent, une pointe de 5008', exercice: 'Temps 2 : un absent, une pointe de 5008',
  documents: [DOC_POSTES, docEquipe(get, 'Mardi 16 mai 2028, prise de poste à 6 h — Julien est absent'), docCharge(PART1311), DOC_AVIS, DOC_ACCUEIL],
  pas: [
    { id: 'affectation', libelle: 'Les postes', titre: 'Sans Julien', sousTitre: 'Regarde bien qui a changé depuis mars.',
      objet: 'Julien est absent', pieces: ['equipe-matin', 'postes'], documents: ['equipe-matin', 'postes'], largeurDocs: 1.3,
      message: 'Bonjour {prenom}, Julien est absent ce matin et je suis en réunion jusqu’à 10 h : l’équipe est à toi.\n\n'
        + 'Amel revient aujourd’hui ; elle a été formée au bord de ligne en avril. Inès, intérimaire, arrive avec son CACES 5. Qui tient quel poste ?',
      blocs: blocsAffectation(E1311), jalons: jalonsAffectation(get, { poids: 1, groupe: 'Les postes' }) },
    { id: 'charge', libelle: 'Les kits', titre: 'La charge des kits', sousTitre: 'Les temps sont dans « Les kits ».',
      objet: 'Une pointe de 5008', pieces: ['charge'], documents: ['charge'],
      message: 'Ce matin, la ligne fait 45 % de 5008 : leurs kits sont plus longs à préparer. Combien de temps pour tous les kits, et combien de personnes faut-il ?',
      blocs: blocsCharge(), jalons: jalonsCharge(PART1311, { cinq: 1, minutes: 1, personnes: 1.5, groupe: 'La charge des kits' }) },
    { id: 'renfort', libelle: 'Le renfort', titre: 'Il manque quelqu’un', sousTitre: 'Tu n’as que Théo aux kits.',
      objet: 'Et maintenant ?', pieces: ['charge', 'equipe-matin'], documents: ['charge', 'equipe-matin'],
      message: 'Tu as fait ton calcul. Que fais-tu ?',
      blocs: [{ type: 'choix', id: 'renfort', lib: 'Aux kits, tu n’as que Théo', colonne: true, manque: 'ce que tu fais', choix: RENFORT }],
      jalons: [{ id: 'renfort', titre: 'Le renfort aux kits', groupe: 'Le renfort', poids: 1.5, attendu: RENFORT[0].lib, juste: (v) => v.renfort === 'karim' }] },
    { id: 'amel', libelle: 'Amel', titre: 'Le poste d’Amel', sousTitre: 'L’avis du médecin du travail.',
      objet: 'Le retour d’Amel', pieces: ['avis'], documents: ['avis', 'postes'],
      message: 'Les ressources humaines t’ont transmis l’avis du médecin du travail pour Amel. Coche ce que tu fais pour son poste.',
      blocs: [{ type: 'cases', id: 'amenagement', titre: 'Le poste d’Amel ce matin', choix: AMENAGEMENT.map(({ v, lib }) => ({ v, lib })) }],
      jalons: [{ id: 'amenagement', titre: 'L’aménagement du poste', groupe: 'Le poste d’Amel', poids: 2,
        attendu: AMENAGEMENT.filter((x) => x.juste).map((x) => x.lib).join(' ; '),
        juste: (v) => memes(v.amenagement || [], AMENAGEMENT.filter((x) => x.juste).map((x) => x.v)) }] },
    { id: 'secret', libelle: 'Le secret', titre: 'Une question de Sébastien', sousTitre: 'Une seule réponse.',
      objet: 'Sébastien pose une question', pieces: ['avis'], documents: ['avis'],
      message: 'À la pause, Sébastien te demande pourquoi Amel ne porte plus les bacs à la main. Que lui réponds-tu ?',
      blocs: [{ type: 'choix', id: 'secret', lib: 'Ta réponse à Sébastien', colonne: true, manque: 'ta réponse', choix: SECRET }],
      jalons: [{ id: 'secret', titre: 'Le secret médical', groupe: 'Le poste d’Amel', poids: 1.5, attendu: SECRET[0].lib, juste: (v) => v.secret === 'amenage' }] },
  ],
  compteRendu: { objet: 'Ton compte rendu', poids: 3.5, message: 'Merci {prenom}. Écris-moi ce que je dois savoir en sortant de réunion.',
    lignes: (prenom) => [SALUT,
      { id: 'postes', choix: ['Amel est au bord de ligne, Sébastien au quai, Inès aux racks et Théo aux kits.',
        'Sébastien est au bord de ligne, Amel au quai, Inès aux racks et Théo aux kits.', 'Amel est au bord de ligne, Inès au quai, Sébastien aux racks et Théo aux kits.'], juste: 0 },
      { id: 'renfort', choix: [`Les kits demandent ${fr(C.minutes)} minutes : il faut ${C.personnes} personnes, je t’ai demandé un renfort.`,
        `Les kits demandent ${fr(C.minutes)} minutes : Théo y arrivera seul.`, `Les kits demandent ${fr(Math.round(360 * 0.8 * 10) / 10)} minutes : Théo y arrivera seul.`], juste: 0 },
      { id: 'amel', choix: ['Le poste d’Amel est aménagé : les bacs lourds se déplacent au chariot.', 'J’ai expliqué à l’équipe ce qu’a eu Amel.',
        'Amel porte comme avant, elle fait attention.'], juste: 0 },
      FIN(prenom)] },
  accueil: ['Réaffecter sans Julien.', 'La charge des kits.', 'Le renfort.', 'Le poste d’Amel.', 'Une question de Sébastien.', 'Réponds à Karim, une phrase par ligne.'],
  fin: 'Merci {prenom}. La prochaine fois, c’est l’évaluation : une équipe et un imprévu, sans aide.',
  questions: QUESTIONS,
});
export const { ID, FICHES, VOLET, ETAPES, SUITE, ACCUEIL, OPTIONS, fid, corrige } = S;
