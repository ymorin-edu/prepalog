// ENT-24.5 — Kuehne+Nagel, « évaluation : préparer la réception » : ÉVALUATION de C1.3, 1re Bac Pro, copie rendue. Seul(e), sur un jeu NEUF (le
// mercredi, huit envois) : la zone et la durée de réception des quatre premiers envois, puis le planning des quais (vue Planning, aucune aide,
// rien n'est signalé) ; envoyé, il change (un vol en retard, une pièce d'avion urgente) : on reprend, puis le compte rendu et la copie.
// Univers : `contenus/kuehne-nagel.js` ; données : `PRE245`, `ENVOIS245`, `ALEA245` de `contenus/kuehne-nagel-donnees.js` ; questions : `contenus/questions/ENT-24.5.js`.
//
// Poids (décidés par Claude, délégation de Tristan du 26/10/2026) : les zones 2 (0,5 × 4) · les durées 1,5 (0,75 × 2) · le planning 5 (zones 1,5,
// heures 2, tout posé 1,5) · la reprise 5 (zones 1, heures 2,5, tout posé 1,5) · compte rendu 3,5 · « Avant de commencer » noté 3 = 20.

import { seanceFiches } from './fabrique-fiches.js';
import { U, SALUT, FIN } from './kuehne-nagel-commun.js';
import { DOC_HUB, DOC_REGLES, DOC_DROIT, docPreAlertes, blocsZones, jalonsZones, blocsDurees, jalonsDurees, planningQuais } from './kuehne-nagel.js';
import { PRE245, ENVOIS245, ALEA245, apresAlea } from './kuehne-nagel-donnees.js';
import { QUESTIONS } from './questions/ENT-24.5.js';

export * from './kuehne-nagel.js';

export const PL = 'kn-planning-245';
const DUREES = ['A', 'D'].map((id) => PRE245.find((x) => x.id === id));
export const PLANNING = planningQuais({ id: PL, date: 'mercredi 18 novembre 2026', envois: ENVOIS245, temps: 'evaluation', rendCopie: false,
  alea: { ...ALEA245, texte: 'Le vol de Boston a <b>45 minutes de retard</b> : l’envoi E sera disponible à 7 h 15, à recevoir avant 9 h. Et une <b>pièce d’avion urgente</b> '
    + '(AOG) arrive de Bordeaux : l’envoi J, disponible à 8 h, à recevoir avant 9 h.' } });
const S = seanceFiches(U, {
  id: 'kuehne-nagel-evaluation', prefixe: '245', titre: 'Évaluation : préparer la réception', exercice: 'Séance 5 : évaluation, préparer la réception',
  documents: [DOC_HUB, DOC_REGLES, DOC_DROIT, docPreAlertes(ENVOIS245, 'Les pré-alertes du mercredi', 'Huit envois annoncés pour ce matin')],
  pas: [
    { id: 'zones', libelle: 'Les zones', titre: 'Dans quelle zone ?', sousTitre: 'Les quatre premiers envois des pré-alertes.',
      objet: 'Évaluation : à toi seul(e)', pieces: ['prealertes', 'regles'], documents: ['prealertes', 'regles'], largeurDocs: 1.4,
      message: 'Bonjour {prenom}. Aujourd’hui, c’est une évaluation : je suis en réunion, tu prépares la réception seul(e). Rien n’est corrigé avant que tu rendes ta copie.\n\n'
        + 'D’abord, la zone des quatre premiers envois.',
      blocs: blocsZones(PRE245), jalons: jalonsZones(() => PRE245, { poids: 0.5, groupe: 'Les zones' }) },
    { id: 'durees', libelle: 'Les durées', titre: 'Combien de temps au quai ?', sousTitre: 'La règle de durée est dans « Préparer une réception ».',
      objet: 'Combien de temps ?', pieces: ['regles'], documents: ['regles', 'prealertes'],
      message: 'Calcule le temps de réception de deux envois.',
      blocs: blocsDurees(DUREES), jalons: jalonsDurees(() => DUREES, { poids: 0.75, groupe: 'Les durées' }) },
  ],
  planning: { apres: 1, decl: PLANNING, libelle: 'Le planning des quais', groupe: 'Le planning des quais',
    poids: { 'v1-zones': 1.5, 'v1-heures': 2, 'v1-poses': 1.5, 'v2-zones': 1, 'v2-heures': 2.5, 'v2-poses': 1.5 },
    objet: 'Le planning du mercredi', pieces: ['prealertes', 'regles'],
    message: 'Maintenant, le planning des quais pour les huit envois. Rien ne te sera signalé : relis les règles avant d’envoyer.',
    alea: { objet: 'Ça change ce matin', message: '{prenom}, le vol de Boston a 45 minutes de retard (l’envoi E sera disponible à 7 h 15, à recevoir avant 9 h), et une pièce d’avion '
      + 'urgente arrive de Bordeaux (l’envoi J, disponible à 8 h, à recevoir avant 9 h). Reprends ton planning, puis renvoie-le-moi.' },
    solution: 'Une solution : quai 1 A 6 h, E 7 h, G 8 h ; quai 3 B 6 h 30, F 7 h 30 ; quai 4 D 6 h, C 7 h, H 7 h 45. Après l’aléa : quai 1 A 6 h, E 7 h 15, G 8 h ; '
      + 'quai 4 D 6 h, C 7 h, J 8 h, H 8 h 45 (H n’a pas d’heure limite).' },
  compteRendu: { objet: 'Ton compte rendu', poids: 3.5, message: 'Merci {prenom}. Écris-moi ton compte rendu, une phrase par ligne, puis rends ta copie : tu ne pourras plus rien modifier.',
    lignes: (prenom) => [SALUT,
      { id: 'aog', choix: ['La pièce urgente J passe au quai 4 avant 9 h ; les montres H passent après, elles n’ont pas d’heure limite.',
        'Les montres H passent avant la pièce urgente J.', 'La pièce urgente J passe au quai 1, avec les médicaments.'], juste: 0 },
      { id: 'retard', choix: ['Les vaccins E sont reçus au quai 1 à partir de 7 h 15, avant 9 h.', 'Les vaccins E sont reçus à 6 h 30, comme prévu.', 'Les vaccins E sont reçus au quai 3.'], juste: 0 },
      FIN(prenom)] },
  accueil: ['La zone de quatre envois.', 'Le temps au quai de deux envois.', 'Le planning des quais, puis la reprise quand il change.', 'Réponds à Sophie, puis rends ta copie.'],
  fin: 'Merci {prenom}. N’oublie pas de rendre ta copie.',
  questions: QUESTIONS,
});
export const { ID, FICHES, VOLET, ETAPES, SUITE, ACCUEIL, OPTIONS, fid, corrige } = S;
export const ENVOIS_APRES = apresAlea(ENVOIS245, ALEA245);
