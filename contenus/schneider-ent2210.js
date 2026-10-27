// ENT-22.10 — Schneider Electric, « évaluation : mettre en stock » : ÉVALUATION de CAP-C1.5 (le positionnement EP1 de la mise en stock,
// progression CAP du 18/10/2026), CAP OL, copie rendue. Seul(e), sur un jeu NEUF tiré d'après la graine de l'élève (trois jeux :
// `TOUS_JEUX2210`) : ranger quatre palettes selon la plaque de charge, lire une adresse, une palette trop lourde, l'inventaire du drone sur trois
// adresses (le relevé, l'écart, le vrai nombre de colis), le compte rendu.
// Univers : `contenus/schneider.js` ; données : `jeu2210` de `contenus/schneider-donnees.js` ; questions : `contenus/questions/ENT-22.10.js`.
//
// Poids (décidés par Claude, délégation de Tristan du 26/10/2026) : ranger 6 (1,5 × 4) · l'adresse 2 (0,5 × 4) · la plaque de charge 1,5 ·
// le relevé 1,5 (0,5 × 3) · l'écart 1 · le vrai nombre 1 · compte rendu 4 · « Avant de commencer » noté 3 = 20.

import { seanceFiches, proche } from './fabrique-fiches.js';
import { U, SALUT, FIN } from './schneider-commun.js';
import { DOC_SITE, DOC_RANGER, docEmplacements, docDrone, docRecompte, blocsRangement, jalonsRangement, blocsAdresse, jalonsAdresse, blocPlaque, jalonPlaque,
  blocsReleve, jalonsReleve, blocsEcarts, jalonsEcarts, aRecompter } from './schneider.js';
import { jeu2210, niveauDe, ecartJuste } from './schneider-donnees.js';
import { QUESTIONS } from './questions/ENT-22.10.js';

export * from './schneider.js';

const get = (db) => jeu2210(db);
const inv = (db) => get(db).inv;
const ecart = (db) => aRecompter(inv(db))[0];
const S = seanceFiches(U, {
  id: 'schneider-evaluation-stock', prefixe: '2210', titre: 'Évaluation : mettre en stock', exercice: 'Séance 10 : évaluation, mettre en stock',
  documents: [DOC_SITE, DOC_RANGER, docEmplacements(get), docDrone(inv), docRecompte(inv)],
  pas: [
    { id: 'ranger', libelle: 'Ranger les palettes', titre: 'Une adresse pour chaque palette', sousTitre: 'Les emplacements et les palettes sont à gauche. Respecte la plaque de charge.',
      objet: 'Évaluation : à toi seul(e)', pieces: ['emplacements', 'ranger'], documents: ['emplacements', 'ranger'], largeurDocs: 1.3,
      message: 'Bonjour {prenom}. Aujourd’hui, c’est une évaluation : Julien est en formation, tu ranges seul(e). Rien n’est corrigé avant que tu rendes ta copie.\n\n'
        + 'Quatre palettes sont à ranger : pour chacune, choisis une adresse libre qui respecte la plaque de charge.',
      blocs: (db) => blocsRangement(get(db)), jalons: jalonsRangement(get, { poids: 1.5, groupe: 'Ranger les palettes' }) },
    { id: 'adresse', libelle: 'Lire une adresse', titre: 'Lire une adresse', sousTitre: 'Que veut dire chaque partie ?',
      objet: 'Une adresse', pieces: ['ranger'], documents: ['ranger'],
      message: 'Le terminal t’affiche une adresse : elle est écrite dans la fiche. Que veut dire chaque partie ?',
      blocs: (db) => blocsAdresse(get(db).adr), jalons: jalonsAdresse({ poids: 0.5, groupe: 'Lire une adresse' }) },
    { id: 'plaque', libelle: 'La plaque de charge', titre: 'Une palette trop lourde ?', sousTitre: 'Regarde la plaque de charge.',
      objet: 'Une palette lourde', pieces: ['ranger'], documents: ['ranger'],
      message: 'Une dernière palette. Le terminal te donne une adresse : vérifie avec la plaque de charge.',
      blocs: (db) => [blocPlaque(get(db).plaque)], jalons: [jalonPlaque((db) => get(db).plaque, { poids: 1.5, groupe: 'La plaque de charge' })] },
    { id: 'releve', libelle: 'Le relevé du drone', titre: 'Le drone et le système', sousTitre: 'Pour chaque adresse, sont-ils d’accord ?',
      objet: 'Le passage du drone', pieces: ['drone'], documents: ['drone'],
      message: 'Cette nuit, le drone d’inventaire est passé sur trois adresses. Compare ce qu’il a compté avec ce que dit le système.',
      blocs: (db) => blocsReleve(inv(db)), jalons: jalonsReleve(inv, { poids: 0.5, groupe: 'L’inventaire' }) },
    { id: 'ecarts', libelle: 'L’écart', titre: 'Après le recomptage', sousTitre: 'Une adresse a été recomptée à la main.',
      objet: 'Le recomptage', pieces: ['recompte'], documents: ['recompte'],
      message: 'L’adresse où le drone et le système n’étaient pas d’accord a été recomptée à la main. Qui a raison, et combien y a-t-il vraiment de colis ?',
      blocs: (db) => [...blocsEcarts(inv(db)), { type: 'nombre', id: 'vrai', lib: `${ecart(db).adr} : combien de colis y a-t-il vraiment ?`, unite: 'colis', min: 0, entier: true,
        manque: 'le vrai nombre de colis' }],
      jalons: [...jalonsEcarts(inv, { poids: 1, groupe: 'L’inventaire' }),
        { id: 'vrai', titre: 'L’inventaire : le vrai nombre de colis', groupe: 'L’inventaire', poids: 1, attendu: (db) => String(ecart(db).main),
          juste: (v, db) => proche(v.vrai, ecart(db).main) }] },
  ],
  compteRendu: { objet: 'Ton compte rendu', poids: 4, message: 'Merci {prenom}. Écris-moi ton compte rendu, une phrase par ligne, puis rends ta copie : tu ne pourras plus rien modifier.',
    lignes: (prenom, db) => {
      const I = ecart(db), d = Math.abs(I.main - I.systeme) || Math.abs(I.drone - I.systeme), P = get(db).plaque, niv = niveauDe(P.adr);
      return [SALUT,
        { id: 'ecart', choix: [`À ${I.adr}, le drone s’est trompé : il y a bien ${I.systeme} colis.`, `À ${I.adr}, il manque ${d} colis : je signale l’écart.`,
          `À ${I.adr}, il y a ${d} colis en trop : je signale l’écart.`], juste: ['drone', 'manque', 'trop'].indexOf(ecartJuste(I)) },
        { id: 'plaque', choix: [`La palette de ${P.kg} kg ne monte pas au niveau ${niv} : je l’ai signalé.`, `La palette de ${P.kg} kg est montée au niveau ${niv}.`,
          `La palette de ${P.kg} kg est restée dans l’allée.`], juste: 0 },
        FIN(prenom)];
    } },
  accueil: ['Une adresse pour chaque palette.', 'Lire une adresse.', 'Une palette trop lourde ?', 'Le relevé du drone.', 'Après le recomptage : qui a raison ?', 'Réponds à Nadia, puis rends ta copie.'],
  fin: 'Merci {prenom}. N’oublie pas de rendre ta copie.',
  questions: QUESTIONS,
  tirage: true,
});
export const { ID, FICHES, VOLET, ETAPES, SUITE, ACCUEIL, OPTIONS, fid, corrige } = S;
