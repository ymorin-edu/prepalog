// ENT-24.3 — Kuehne+Nagel, « le lundi chargé » : ENTRAÎNEMENT de C1.3 (préparer l'action de réception ; C1.3.2 : adapter l'organisation de la
// réception aux aléas), 1re Bac Pro. Seul(e) : le planning des quatre quais pour neuf envois (vue Planning ; « Vérifier mon planning » et l'aide
// « règles » seulement) ; envoyé, la porte froide du quai 2 se bloque : on reprend sans le quai 2, on dit qui prévenir, puis le compte rendu.
// Univers : `contenus/kuehne-nagel.js` ; données : `ENVOIS243`, `ALEA243` de `contenus/kuehne-nagel-donnees.js` ; questions : `contenus/questions/ENT-24.3.js`.
//
// Poids (décidés par Claude, délégation de Tristan du 26/10/2026) : le planning 5 (zones 1,5, heures 2, tout posé 1,5) · la reprise 5,5 (zones 1,5,
// heures 2,5, tout posé 1,5) · qui prévenir 2,5 · compte rendu 3 · questions au fil 4 = 20.

import { seanceFiches, memes } from './fabrique-fiches.js';
import { U, SALUT, FIN } from './kuehne-nagel-commun.js';
import { DOC_HUB, DOC_REGLES, DOC_DROIT, docPreAlertes, planningQuais } from './kuehne-nagel.js';
import { ENVOIS243, ALEA243 } from './kuehne-nagel-donnees.js';
import { QUESTIONS } from './questions/ENT-24.3.js';

export * from './kuehne-nagel.js';

export const PL = 'kn-planning-243';
export const PLANNING = planningQuais({ id: PL, date: 'lundi 9 novembre 2026', envois: ENVOIS243, temps: 'entrainement',
  alea: { ...ALEA243, texte: 'À 6 h 30, la <b>porte froide du quai 2</b> se bloque : le quai 2 ne reçoit plus rien ce matin. Il ne reste qu’<b>un quai froid</b>, le quai 1.' } });
const PREVENIR = [
  { v: 'karim', lib: 'Karim, à la chambre froide : tous les envois froids arrivent par le seul quai 1', juste: true },
  { v: 'client', lib: 'Le client des vaccins, pour lui dire que ses vaccins sont perdus', juste: false },
  { v: 'maintenance', lib: 'Le service maintenance, pour qu’il répare la porte du quai 2', juste: true },
  { v: 'compagnie', lib: 'La compagnie aérienne, pour qu’elle garde ses avions en l’air', juste: false },
];
const S = seanceFiches(U, {
  id: 'kuehne-nagel-lundi', prefixe: '243', titre: 'Le lundi chargé', exercice: 'Séance 3 : le lundi chargé',
  documents: [DOC_HUB, DOC_REGLES, DOC_DROIT, docPreAlertes(ENVOIS243, 'Les pré-alertes du lundi', 'Neuf envois annoncés pour ce matin')],
  pas: [
    { id: 'prevenir', libelle: 'Qui prévenir ?', titre: 'La panne du quai 2 : qui prévenir ?', sousTitre: 'Coche les personnes à prévenir, et seulement elles.',
      objet: 'Qui prévenir ?', pieces: ['regles'], documents: ['regles', 'prealertes'],
      message: 'Merci {prenom}. Avec la panne, il faut prévenir les bonnes personnes. Qui ?',
      blocs: [{ type: 'cases', id: 'qui', titre: 'Je préviens…', choix: PREVENIR.map(({ v, lib }) => ({ v, lib })) }],
      jalons: [{ id: 'prevenir', titre: 'Les personnes à prévenir', groupe: 'Qui prévenir ?', poids: 2.5, attendu: PREVENIR.filter((x) => x.juste).map((x) => x.lib).join(' ; '),
        juste: (v) => memes(v.qui || [], PREVENIR.filter((x) => x.juste).map((x) => x.v)) }] },
  ],
  planning: { apres: -1, decl: PLANNING, libelle: 'Le planning des quais', groupe: 'Le planning des quais',
    poids: { 'v1-zones': 1.5, 'v1-heures': 2, 'v1-poses': 1.5, 'v2-zones': 1.5, 'v2-heures': 2.5, 'v2-poses': 1.5 },
    objet: 'Le planning du lundi', pieces: ['prealertes', 'regles'],
    message: 'Bonjour {prenom} ! Le lundi est toujours chargé : neuf envois ce matin. Fais le planning des quais seul(e) : « Vérifier mon planning » te dit s’il reste un problème. '
      + 'Puis envoie-le-moi.',
    alea: { objet: 'Panne au quai 2', message: '{prenom}, la porte froide du quai 2 vient de se bloquer : il ne reçoit plus rien ce matin. Il ne reste que le quai 1 pour le froid. '
      + 'Reprends ton planning, puis renvoie-le-moi.' },
    solution: 'Une solution, sans le quai 2 : quai 1 A 6 h, B 6 h 45, C 7 h 30, D 8 h 15 ; quai 3 E 6 h 30, F 7 h 30 ; quai 4 G 6 h 30, H 7 h 15, K 8 h 15.' },
  compteRendu: { objet: 'Ton compte rendu', poids: 3, message: 'Merci {prenom}. Écris-moi ton compte rendu de la matinée, une phrase par ligne.',
    lignes: (prenom) => [SALUT,
      { id: 'panne', choix: ['Les quatre envois froids passent l’un après l’autre au quai 1, chacun avant son heure limite.', 'Les envois froids passent au quai 4, avec le fret général.',
        'Les envois froids attendront que le quai 2 soit réparé.'], juste: 0 },
      { id: 'prevenu', choix: ['J’ai prévenu Karim et le service maintenance.', 'J’ai prévenu le client des vaccins que tout était perdu.', 'Je n’ai prévenu personne.'], juste: 0 },
      FIN(prenom)] },
  accueil: ['Le planning des quais du lundi, puis la reprise après la panne.', 'Qui prévenir.', 'Réponds à Sophie, une phrase par ligne.'],
  fin: 'Merci {prenom}. La prochaine fois, tu vérifieras le planning de Lucas.',
  questions: QUESTIONS,
});
export const { ID, FICHES, VOLET, ETAPES, SUITE, ACCUEIL, OPTIONS, fid, corrige } = S;
