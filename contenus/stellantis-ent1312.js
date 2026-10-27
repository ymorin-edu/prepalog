// ENT-13.12 — Stellantis Sochaux, « évaluation : l'équipe du matin » : ÉVALUATION de C3.4, Terminale, copie rendue. Seul(e), sur un jeu NEUF tiré
// d'après la graine de l'élève (trois jeux : `TOUS_JEUX1312`) : affecter quatre personnes, la charge des kits, un imprévu (une restriction médicale,
// un intérimaire absent, un conflit pour un poste). Écart au cadrage : en fiches, sans `planning` ni `dialogue` (voir `stellantis-equipe.js`).
// Univers : `contenus/stellantis.js` ; données : `jeu1312` ; questions : `contenus/questions/ENT-13.12.js`.
//
// Poids (décidés par Claude, délégation de Tristan du 26/10/2026) : l'affectation 6 (1,5 × 4) · la charge 4,5 (1,5 × 3) · l'imprévu 3,5 ·
// compte rendu 3 · « Avant de commencer » noté 3 = 20.

import { seanceFiches } from './fabrique-fiches.js';
import { U, SALUT, FIN, jeu1312, ALEAS, DOC_POSTES, DOC_ACCUEIL, docEquipe, docCharge, blocsAffectation, jalonsAffectation, blocsCharge, jalonsCharge,
  affectation, charge } from './stellantis-equipe.js';
import { QUESTIONS } from './questions/ENT-13.12.js';

export * from './stellantis.js';
export { CATALOGUE, SUPPLIERS, SUP_BY_ID, CUSTOMERS, CM, baseDeDepart } from './stellantis-equipe.js';

const get = (db) => jeu1312(db).equipe;
const part = (db) => jeu1312(db).part;
const alea = (db) => ALEAS[jeu1312(db).alea];
const fr = (x) => String(x).replace('.', ',');
// Les noms des postes, dans les phrases.
const phrasePostes = (E, A) => { const nom = (id) => E.find((p) => p.id === id).nom;
  return `Prévu ce matin : ${nom(A.ligne)} au bord de ligne, ${nom(A.quai)} au quai, ${nom(A.racks)} aux racks et ${nom(A.kits)} aux kits.`; };

const S = seanceFiches(U, {
  id: 'stellantis-evaluation-equipe', prefixe: '1312', titre: 'Évaluation : l’équipe du matin', exercice: 'Temps 2 : évaluation, l’équipe du matin',
  documents: [DOC_POSTES, docEquipe(get, (db) => `${jeu1312(db).jour[0].toUpperCase()}${jeu1312(db).jour.slice(1)}, prise de poste à 6 h`), docCharge(part), DOC_ACCUEIL],
  pas: [
    { id: 'affectation', libelle: 'Les postes', titre: 'Qui tient quel poste ?', sousTitre: 'Les exigences sont dans « Les postes ».',
      objet: 'Évaluation : à toi seul(e)', pieces: ['postes', 'equipe-matin'], documents: ['postes', 'equipe-matin'], largeurDocs: 1.3,
      message: 'Bonjour {prenom}. Aujourd’hui, c’est une évaluation : je suis en formation, tu tiens l’équipe seul(e). Rien n’est corrigé avant que tu rendes ta copie.\n\n'
        + 'D’abord, qui tient quel poste ce matin ?',
      blocs: (db) => blocsAffectation(get(db)), jalons: jalonsAffectation(get, { poids: 1.5, groupe: 'Les postes' }) },
    { id: 'charge', libelle: 'Les kits', titre: 'La charge des kits', sousTitre: 'Les temps sont dans « Les kits ».',
      objet: 'La charge des kits', pieces: ['charge'], documents: ['charge'],
      message: 'Combien de 5008 ce matin, combien de temps pour tous les kits, et combien de personnes faut-il aux kits ?',
      blocs: blocsCharge(), jalons: jalonsCharge(part, { cinq: 1.5, minutes: 1.5, personnes: 1.5, groupe: 'La charge des kits' }) },
    { id: 'alea', libelle: 'L’imprévu', titre: 'Un imprévu', sousTitre: 'Une seule réponse.',
      objet: 'Un imprévu', pieces: ['equipe-matin'], documents: ['equipe-matin', 'postes', 'accueil'],
      message: 'Il se passe quelque chose dans l’équipe. Que fais-tu ?',
      blocs: (db) => [{ type: 'choix', id: 'alea', lib: alea(db).texte, colonne: true, manque: 'ce que tu fais', choix: alea(db).choix }],
      jalons: [{ id: 'alea', titre: 'L’imprévu', groupe: 'L’imprévu', poids: 3.5, attendu: (db) => alea(db).choix.find((c) => c.v === alea(db).juste).lib, juste: (v, db) => v.alea === alea(db).juste }] },
  ],
  compteRendu: { objet: 'Ton compte rendu', poids: 3, message: 'Merci {prenom}. Écris-moi ton compte rendu, puis rends ta copie : tu ne pourras plus rien modifier.',
    lignes: (prenom, db) => { const E = get(db); const A = affectation(E); const C = charge(part(db));
      // Deux répartitions fausses : le bord de ligne et le quai échangés ; les racks et les kits échangés.
      const faux1 = { ...A, ligne: A.quai, quai: A.ligne }; const faux2 = { ...A, racks: A.kits, kits: A.racks };
      return [SALUT,
        { id: 'postes', choix: [phrasePostes(E, A), phrasePostes(E, faux1), phrasePostes(E, faux2)], juste: 0 },
        { id: 'kits', choix: [`Les kits demandent ${fr(C.minutes)} minutes : il faut ${C.personnes} personne${C.personnes > 1 ? 's' : ''} aux kits.`,
          `Les kits demandent ${fr(C.minutes)} minutes : il faut ${C.personnes + 1} personnes aux kits.`,
          `Les kits demandent ${fr(Math.round(360 * 0.8 * 10) / 10)} minutes : il faut une personne aux kits.`], juste: 0 },
        FIN(prenom)]; } },
  accueil: ['Qui tient quel poste.', 'La charge des kits.', 'Un imprévu.', 'Réponds à Karim, puis rends ta copie.'],
  fin: 'Merci {prenom}. N’oublie pas de rendre ta copie.',
  questions: QUESTIONS,
  tirage: true,
});
export const { ID, FICHES, VOLET, ETAPES, SUITE, ACCUEIL, OPTIONS, fid, corrige } = S;
