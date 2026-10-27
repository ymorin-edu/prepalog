// ENT-22.8 — Schneider Electric, « l'inventaire du drone » : ENTRAÎNEMENT de CAP-C1.5 (mettre en stock : actualiser les informations,
// inventaire), CAP OL. Le drone d'inventaire (réel à Évreux) a compté cinq adresses : l'élève repère les adresses à recompter, lit le recomptage de
// Julien et dit l'écart (le drone s'est trompé, il manque, il y en a trop), puis range deux palettes selon la plaque de charge.
// Univers : `contenus/schneider.js` ; données : `INV228`, `R228` de `contenus/schneider-donnees.js` ; questions : `contenus/questions/ENT-22.8.js`.
//
// Poids (décidés par Claude, délégation de Tristan du 26/10/2026) : le relevé 5 (1 × 5) · les écarts 3 (1,5 × 2) · le nombre manquant 1,5 ·
// ranger 2 (1 × 2) · compte rendu 4,5 · questions au fil 4 = 20.

import { seanceFiches, proche } from './fabrique-fiches.js';
import { U, SALUT, FIN } from './schneider-commun.js';
import { DOC_SITE, DOC_RANGER, docDrone, docRecompte, docEmplacements, blocsReleve, jalonsReleve, blocsEcarts, jalonsEcarts, blocsRangement, jalonsRangement } from './schneider.js';
import { INV228, R228, nomDe } from './schneider-donnees.js';
import { QUESTIONS } from './questions/ENT-22.8.js';

export * from './schneider.js';

const MANQUE = INV228.find((I) => I.main < I.systeme);
const S = seanceFiches(U, {
  id: 'schneider-drone', prefixe: '228', titre: 'L’inventaire du drone', exercice: 'Séance 8 : l’inventaire du drone',
  documents: [DOC_SITE, DOC_RANGER, docDrone(INV228), docRecompte(INV228), docEmplacements(R228)],
  pas: [
    { id: 'releve', libelle: 'Le relevé du drone', titre: 'Le drone et le système', sousTitre: 'Pour chaque adresse, sont-ils d’accord ?',
      objet: 'Le passage du drone', pieces: ['drone'], documents: ['drone'],
      message: 'Bonjour {prenom}. Cette nuit, le drone d’inventaire est passé dans l’allée 04 de la cellule C2. Compare ce qu’il a compté avec ce que dit le système.',
      blocs: blocsReleve(INV228), jalons: jalonsReleve(() => INV228, { poids: 1, groupe: 'Le relevé du drone' }) },
    { id: 'ecarts', libelle: 'Les écarts', titre: 'Après le recomptage', sousTitre: 'Julien a recompté à la main. Pour chaque adresse à recompter, que dis-tu ?',
      objet: 'Le recomptage', pieces: ['recompte'], documents: ['recompte'],
      message: 'Julien a recompté toutes les adresses à la main. Pour celles où le drone et le système n’étaient pas d’accord, dis-moi qui a raison.',
      blocs: [...blocsEcarts(INV228), { type: 'nombre', id: 'combien', lib: `${MANQUE.adr} : combien de colis manquent ?`, unite: 'colis', min: 0, entier: true, manque: 'le nombre de colis manquants' }],
      jalons: [...jalonsEcarts(() => INV228, { poids: 1.5, groupe: 'Les écarts' }),
        { id: 'combien', titre: 'Les écarts : le nombre de colis manquants', groupe: 'Les écarts', poids: 1.5, attendu: String(MANQUE.systeme - MANQUE.main),
          juste: (v) => proche(v.combien, MANQUE.systeme - MANQUE.main) }] },
    { id: 'ranger', libelle: 'Ranger', titre: 'Deux palettes à ranger', sousTitre: 'Une adresse libre qui respecte la plaque de charge.',
      objet: 'Deux palettes', pieces: ['emplacements', 'ranger'], documents: ['emplacements', 'ranger'],
      message: 'Avant de partir, Julien a deux palettes à ranger dans l’allée 05. Choisis leur adresse.',
      blocs: blocsRangement(R228), jalons: jalonsRangement(() => R228, { poids: 1, groupe: 'Ranger' }) },
  ],
  compteRendu: { objet: 'Ton compte rendu', poids: 4.5, message: 'Merci {prenom}. Écris-moi ton compte rendu de l’inventaire, une phrase par ligne.',
    lignes: (prenom) => [SALUT,
      { id: 'drone', choix: [`À ${INV228[1].adr}, le drone s’est trompé : il y a bien ${INV228[1].systeme} colis.`, `À ${INV228[1].adr}, il manque 4 colis.`, `À ${INV228[1].adr}, tout était d’accord.`], juste: 0 },
      { id: 'manque', choix: [`À ${MANQUE.adr}, il manque ${MANQUE.systeme - MANQUE.main} colis de ${nomDe(MANQUE.prod).replace(/ \(.*\)$/, '').toLowerCase()} : je signale l’écart.`,
        `À ${MANQUE.adr}, le drone s’est trompé.`, `À ${MANQUE.adr}, il y a ${MANQUE.systeme - MANQUE.main} colis en trop.`], juste: 0 },
      FIN(prenom)] },
  accueil: ['Pour chaque adresse : le drone et le système sont-ils d’accord ?', 'Après le recomptage, qui a raison ?', 'Deux palettes à ranger.', 'Réponds à Nadia, une phrase par ligne.'],
  fin: 'Merci {prenom}. L’écart part au service stock : il cherchera où sont passés les colis.',
  questions: QUESTIONS,
});
export const { ID, FICHES, VOLET, ETAPES, SUITE, ACCUEIL, OPTIONS, fid, corrige } = S;
