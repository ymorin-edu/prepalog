// ENT-22.7 — Schneider Electric, « ranger dans la cellule » : GUIDAGE de CAP-C1.5 (mettre en stock : implantation, stockage physique, actualiser
// les informations), CAP OL. Avec Julien, le cariste : ranger quatre palettes selon la plaque de charge (charge et hauteur par niveau), les gestes du
// rangement dans l'ordre, lire une adresse, une palette trop lourde pour le niveau proposé, puis le compte rendu à Nadia.
// Univers : `contenus/schneider.js` ; données : `R227` de `contenus/schneider-donnees.js` ; questions : `contenus/questions/ENT-22.7.js`.
//
// Poids (décidés par Claude, délégation de Tristan du 26/10/2026) : ranger 6 (1,5 × 4) · les gestes 2 (0,5 par geste à son rang) · l'adresse 2
// (0,5 × 4) · la plaque de charge 2 · compte rendu 4 · questions au fil 4 = 20.

import { seanceFiches } from './fabrique-fiches.js';
import { U, SALUT, FIN } from './schneider-commun.js';
import { DOC_SITE, DOC_RANGER, docEmplacements, blocsRangement, jalonsRangement, blocsAdresse, jalonsAdresse, blocPlaque, jalonPlaque } from './schneider.js';
import { R227, ADR227, GESTES227, DEPART227, SIT227 } from './schneider-donnees.js';
import { QUESTIONS } from './questions/ENT-22.7.js';

export * from './schneider.js';

const get = () => R227;
const S = seanceFiches(U, {
  id: 'schneider-ranger', prefixe: '227', titre: 'Ranger dans la cellule', exercice: 'Séance 7 : ranger dans la cellule',
  documents: [DOC_SITE, DOC_RANGER, docEmplacements(R227)],
  pas: [
    { id: 'ranger', libelle: 'Ranger les palettes', titre: 'Une adresse pour chaque palette', sousTitre: 'Les emplacements et les palettes sont à gauche. Respecte la plaque de charge.',
      objet: 'Avec Julien, en cellule C3', pieces: ['ranger', 'emplacements'], documents: ['ranger', 'emplacements'], largeurDocs: 1.3,
      message: 'Bonjour {prenom} ! Aujourd’hui, tu suis Julien, le cariste, dans la cellule C3. Quatre palettes du camion d’hier sont à ranger dans l’allée 12. '
        + 'Lis « Ranger une palette » : pour chaque palette, choisis une adresse libre qui respecte la plaque de charge.',
      blocs: blocsRangement(R227), jalons: jalonsRangement(get, { poids: 1.5, groupe: 'Ranger les palettes' }) },
    { id: 'gestes', libelle: 'Les gestes', titre: 'Les gestes du rangement', sousTitre: 'Range les gestes dans l’ordre.',
      objet: 'Les gestes', pieces: ['ranger'], documents: ['ranger'],
      message: 'Julien range la première palette. Remets ses gestes dans l’ordre.',
      blocs: [{ type: 'ordre', id: 'ordre', titre: 'Dans l’ordre', consigne: 'De la palette au quai jusqu’à l’adresse enregistrée.', choix: DEPART227.map((x) => GESTES227.find((g) => g.v === x)) }],
      jalons: GESTES227.map((g, k) => ({ id: `geste-${k + 1}`, titre: `Les gestes : « ${g.lib} » à sa place`, groupe: 'Les gestes', poids: 0.5,
        attendu: `geste ${k + 1}`, juste: (v) => Array.isArray(v.ordre) && v.ordre[k] === g.v })) },
    { id: 'adresse', libelle: 'Lire une adresse', titre: `Lire l’adresse ${ADR227}`, sousTitre: 'Que veut dire chaque partie ?',
      objet: 'Une adresse', pieces: ['ranger'], documents: ['ranger'],
      message: `Julien te montre l’étiquette d’un emplacement : ${ADR227}. Que veut dire chaque partie ?`,
      blocs: blocsAdresse(ADR227), jalons: jalonsAdresse({ poids: 0.5, groupe: 'Lire une adresse' }) },
    { id: 'plaque', libelle: 'La plaque de charge', titre: 'Une palette trop lourde ?', sousTitre: 'Regarde la plaque de charge.',
      objet: 'Une palette lourde', pieces: ['ranger'], documents: ['ranger'],
      message: 'Dernière palette de la journée. Le terminal donne une adresse à Julien : vérifie avec la plaque de charge.',
      blocs: [blocPlaque(SIT227)], jalons: [jalonPlaque(() => SIT227, { poids: 2, groupe: 'La plaque de charge' })] },
  ],
  compteRendu: { objet: 'Ton compte rendu', poids: 4, message: 'Merci {prenom}. Écris-moi ton compte rendu de la journée en cellule, une phrase par ligne.',
    lignes: (prenom) => [SALUT,
      { id: 'lourdes', choix: ['Les palettes d’armoires et d’onduleurs sont rangées au niveau 0 ou 1 : elles pèsent plus de 800 kg.', 'Les palettes d’armoires et d’onduleurs sont rangées au niveau 4.', 'Toutes les palettes sont au sol.'], juste: 0 },
      { id: 'scan', choix: ['Julien scanne l’emplacement après avoir posé la palette : le système enregistre l’adresse.', 'Julien ne scanne rien : le système devine.', 'Julien scanne l’emplacement avant de prendre la palette.'], juste: 0 },
      { id: 'plaque', choix: ['La palette de 950 kg ne monte pas au niveau 3 : je l’ai signalé.', 'La palette de 950 kg est montée au niveau 3.', 'La palette de 950 kg est restée dans l’allée.'], juste: 0 },
      FIN(prenom)] },
  accueil: ['Une adresse pour chaque palette.', 'Les gestes du rangement.', 'Lire une adresse.', 'Une palette trop lourde ?', 'Réponds à Nadia, une phrase par ligne.'],
  fin: 'Merci {prenom}. Demain, le drone passe dans la cellule C2 : tu suivras l’inventaire avec Julien.',
  questions: QUESTIONS,
});
export const { ID, FICHES, VOLET, ETAPES, SUITE, ACCUEIL, OPTIONS, fid, corrige } = S;
