// ENT-24.2 — Kuehne+Nagel, « le planning des quais » : GUIDAGE de C1.3 (préparer l'action de réception ; C1.3.2 : adapter l'organisation de la
// réception aux aléas), 1re Bac Pro. Le jeudi matin : la durée de trois réceptions, puis le planning des quatre quais (vue Planning, aides en direct) ;
// envoyé, il change : le vol de New York a une heure de retard et une pièce d'avion urgente (AOG) arrive de Toulouse. On reprend, puis le compte rendu.
// Univers : `contenus/kuehne-nagel.js` ; données : `ENVOIS242`, `ALEA242` de `contenus/kuehne-nagel-donnees.js` ; questions : `contenus/questions/ENT-24.2.js`.
//
// Poids (décidés par Claude, délégation de Tristan du 26/10/2026) : les durées 3 (1 × 3) · le planning 5,5 (zones 2, heures 2, tout posé 1,5) ·
// la reprise 4,5 (zones 1, heures 2, tout posé 1,5) · compte rendu 3 · questions au fil 4 = 20.

import { seanceFiches } from './fabrique-fiches.js';
import { U, SALUT, FIN } from './kuehne-nagel-commun.js';
import { DOC_HUB, DOC_REGLES, DOC_DROIT, docPreAlertes, blocsDurees, jalonsDurees, planningQuais } from './kuehne-nagel.js';
import { ENVOIS242, ALEA242, apresAlea } from './kuehne-nagel-donnees.js';
import { QUESTIONS } from './questions/ENT-24.2.js';

export * from './kuehne-nagel.js';

export const PL = 'kn-planning-242';
const DUREES = ['C', 'D', 'H'].map((id) => ENVOIS242.find((x) => x.id === id));
export const PLANNING = planningQuais({ id: PL, date: 'jeudi 5 novembre 2026', envois: ENVOIS242,
  alea: { ...ALEA242, texte: 'Le vol de New York a <b>une heure de retard</b> : l’envoi I sera disponible à 10 h, à recevoir avant midi. Et une <b>pièce d’avion urgente</b> '
    + '(AOG) arrive de Toulouse par la route : l’envoi J, disponible à 8 h, à recevoir avant 9 h.' } });
const S = seanceFiches(U, {
  id: 'kuehne-nagel-planning', prefixe: '242', titre: 'Le planning des quais', exercice: 'Séance 2 : le planning des quais',
  documents: [DOC_HUB, DOC_REGLES, DOC_DROIT, docPreAlertes(ENVOIS242, 'Les pré-alertes du jeudi', 'Neuf envois annoncés pour ce matin')],
  pas: [
    { id: 'durees', libelle: 'Les durées', titre: 'Combien de temps au quai ?', sousTitre: 'La règle de durée est dans « Préparer une réception ».',
      objet: 'Les pré-alertes du jeudi', pieces: ['prealertes', 'regles'], documents: ['regles', 'prealertes'], largeurDocs: 1.3,
      message: 'Bonjour {prenom} ! Aujourd’hui, c’est toi qui fais le planning des quais. Neuf envois sont annoncés. D’abord, calcule le temps de réception de trois d’entre eux.',
      blocs: blocsDurees(DUREES), jalons: jalonsDurees(() => DUREES, { poids: 1, groupe: 'Les durées' }) },
  ],
  planning: { apres: 0, decl: PLANNING, libelle: 'Le planning des quais', groupe: 'Le planning des quais',
    poids: { 'v1-zones': 2, 'v1-heures': 2, 'v1-poses': 1.5, 'v2-zones': 1, 'v2-heures': 2, 'v2-poses': 1.5 },
    objet: 'Le planning des quais', pieces: ['prealertes', 'regles'],
    message: 'Merci {prenom}. Maintenant, le planning : ouvre « Planning des quais » et pose les neuf envois. Le planning te signale tout de suite ce qui ne va pas. '
      + 'Quand tout est posé, envoie-le-moi.',
    alea: { objet: 'Ça change ce matin', message: '{prenom}, deux nouvelles : le vol de New York a une heure de retard (l’envoi I sera disponible à 10 h, à recevoir avant midi), '
      + 'et une pièce d’avion urgente arrive de Toulouse (l’envoi J, disponible à 8 h, à recevoir avant 9 h). Reprends ton planning, puis renvoie-le-moi.' },
    solution: 'Une solution : quai 1 A 6 h, C 7 h, B 7 h 30, I 9 h ; quai 3 D 6 h, E 8 h ; quai 4 G 6 h, H 6 h 30, F 7 h 45. Après l’aléa : I à 10 h ; '
      + 'quai 4 G 6 h, F 7 h 30, J 8 h 15, H 9 h (H n’a pas d’heure limite : il passe après les urgences).' },
  compteRendu: { objet: 'Ton compte rendu', poids: 3, message: 'Merci {prenom}. Écris-moi ton compte rendu du planning, une phrase par ligne.',
    lignes: (prenom) => [SALUT,
      { id: 'aog', choix: ['La pièce urgente J passe au quai 4 avant 9 h : j’ai reporté l’électronique H, qui n’a pas d’heure limite.',
        'La pièce urgente J attendra après l’électronique H.', 'La pièce urgente J est au quai 1, avec les vaccins.'], juste: 0 },
      { id: 'retard', choix: ['Les vaccins I sont reçus à partir de 10 h, avant midi.', 'Les vaccins I sont reçus à 9 h, comme prévu.', 'Les vaccins I sont reçus au quai 4.'], juste: 0 },
      FIN(prenom)] },
  accueil: ['Le temps au quai de trois envois.', 'Pose les neuf envois sur les quais, puis reprends le planning quand il change.', 'Réponds à Sophie, une phrase par ligne.'],
  fin: 'Merci {prenom}. La semaine prochaine, tu feras le planning d’un lundi chargé.',
  questions: QUESTIONS,
});
export const { ID, FICHES, VOLET, ETAPES, SUITE, ACCUEIL, OPTIONS, fid, corrige } = S;
// Les envois après l'aléa (corrigé, tests).
export const ENVOIS_APRES = apresAlea(ENVOIS242, ALEA242);
