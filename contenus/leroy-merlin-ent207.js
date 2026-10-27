// ENT-20.7 — Leroy Merlin, « les réponses de Jordan » : ERREUR INDUITE de C2.1, 1re Bac Pro. Jordan a promis une date à cinq clients : trois
// dates sont fausses (deux encombrants promis le lendemain, un colis promis un dimanche). L'élève vérifie, corrige, trouve les causes, rend compte.
// Univers : `contenus/leroy-merlin.js` ; données : `D207`, `promisJuste` ; questions : `contenus/questions/ENT-20.7.js`.
//
// Poids (décidés par Claude, délégation de Tristan du 26/10/2026) : vérifier 5 (1 × 5) · corriger 5 (1 × 5) · les causes 2 · compte rendu 4 ·
// questions au fil 4 = 20.

import { seanceFiches, memes } from './fabrique-fiches.js';
import { U_CLIENTS, SALUT, FIN } from './leroy-merlin-commun.js';
import { DOC_SITE, DOC_LIVRAISON, docJordan, datesPossibles, jourLong, livraison, encombrant } from './leroy-merlin.js';
import { D207, promisJuste } from './leroy-merlin-donnees.js';
import { QUESTIONS } from './questions/ENT-20.7.js';

export * from './leroy-merlin.js';

const C = D207.commandes;
const VERIF = [{ v: 'juste', lib: 'La date promise est juste' }, { v: 'faux', lib: 'La date promise est fausse' }];
export const CAUSES = [
  { v: 'dimanche', lib: 'Il compte le dimanche comme un jour de livraison', juste: true },
  { v: 'poids', lib: 'Il promet le lendemain sans vérifier le poids de toute la commande', juste: true },
  { v: 'interne', lib: 'Il confond clients internes et externes', juste: false },
  { v: 'samedi', lib: 'Il oublie qu’on livre le samedi', juste: false },
];

const S = seanceFiches(U_CLIENTS, {
  id: 'leroy-merlin-jordan', prefixe: '207', titre: 'Les réponses de Jordan', exercice: 'Séance 7 : les réponses de Jordan',
  documents: [DOC_SITE, DOC_LIVRAISON, docJordan(() => D207)],
  pas: [
    { id: 'verifier', libelle: 'Vérifier', titre: 'Vérifier les dates promises', sousTitre: 'Pour chaque commande : la date de Jordan est-elle juste ?',
      objet: 'Les réponses de Jordan', pieces: ['jordan', 'livraison'], documents: ['jordan', 'livraison'], largeurDocs: 1.4,
      message: 'Bonjour {prenom}. Deux clients ont appelé : leur commande n’est pas arrivée à la date que Jordan leur avait promise. '
        + 'Vérifie les cinq réponses qu’il a envoyées avec « Les règles ».',
      blocs: C.map((c) => ({ type: 'choix', id: `verif-${c.id}`, lib: `${c.id} (${c.client}) : promise ${jourLong(c.promis)}`, manque: `la commande ${c.id}`, choix: VERIF })),
      jalons: C.map((c, i) => ({ id: `verif-${i + 1}`, titre: `La date promise de la commande n° ${i + 1}`, groupe: 'Vérifier', poids: 1,
        attendu: promisJuste(c) ? 'juste' : 'fausse', juste: (v) => v[`verif-${c.id}`] === (promisJuste(c) ? 'juste' : 'faux') })) },
    { id: 'corriger', libelle: 'Corriger', titre: 'La bonne date de chaque commande', sousTitre: 'Pour les cinq commandes, même celles qui sont justes.',
      objet: 'Les bonnes dates', pieces: ['jordan'], documents: ['jordan', 'livraison'], largeurDocs: 1.3,
      message: 'Donne-moi la bonne date de livraison des cinq commandes : je rappelle les clients.',
      blocs: C.map((c) => ({ type: 'liste', id: `date-${c.id}`, lib: `${c.id} (${c.client})`, vide: 'Choisir la date…', manque: `la date de ${c.id}`,
        choix: datesPossibles(c).map((x) => ({ v: x, lib: jourLong(x) })) })),
      jalons: C.map((c, i) => ({ id: `date-${i + 1}`, titre: `La bonne date de la commande n° ${i + 1}`, groupe: 'Corriger', poids: 1,
        attendu: `${jourLong(livraison(c))} (${encombrant(c) ? 'encombrant, J+3' : 'colis, J+1'})`, juste: (v) => v[`date-${c.id}`] === livraison(c) })) },
    { id: 'causes', libelle: 'Les causes', titre: 'D’où viennent les erreurs ?', sousTitre: 'Coche toutes les causes.',
      objet: 'Pourquoi ?', pieces: ['jordan'], documents: ['jordan', 'livraison'],
      message: 'Pour que Jordan ne recommence pas : d’où viennent ses erreurs ? Coche toutes les causes.',
      blocs: [{ type: 'cases', id: 'causes', titre: 'Les causes', choix: CAUSES.map((x) => ({ v: x.v, lib: x.lib })) }],
      jalons: [{ id: 'causes', titre: 'Les causes des erreurs', groupe: 'Les causes', poids: 2, attendu: CAUSES.filter((x) => x.juste).map((x) => x.lib).join(' ; '),
        juste: (v) => memes(v.causes || [], CAUSES.filter((x) => x.juste).map((x) => x.v)) }] },
  ],
  compteRendu: { objet: 'Ton compte rendu', poids: 4, message: 'Merci {prenom}. Écris-moi ce que je dis aux clients, et à Jordan.',
    lignes: (prenom) => [SALUT('Nadia'),
      { id: 'morel', choix: ['Mme Morel : son pack WC de 38 kg est un encombrant, il arrive vendredi 27 novembre.', 'Mme Morel : sa commande arrive bien mercredi 25 novembre.', 'Mme Morel : sa commande arrive dimanche.'], juste: 0 },
      { id: 'blanc', choix: ['M. Blanc : commandé samedi, son colis est arrivé lundi 23 novembre, pas dimanche.', 'M. Blanc : son colis est arrivé dimanche 22 novembre.', 'M. Blanc : son colis arrive en trois jours.'], juste: 0 },
      { id: 'jordan', choix: ['Pour Jordan : additionner le poids de toute la commande, et ne jamais compter le dimanche.', 'Pour Jordan : promettre le lendemain à tout le monde.', 'Pour Jordan : rien à changer.'], juste: 0 },
      FIN(prenom)] },
  accueil: ['Vérifie les cinq dates promises.', 'Donne la bonne date de chaque commande.', 'Coche les causes des erreurs.', 'Réponds à Nadia, une phrase par ligne.'],
  fin: 'Merci {prenom}. Je rappelle Mme Morel et Mme Roux. La prochaine fois : l’évaluation.',
  questions: QUESTIONS,
});
export const { ID, FICHES, VOLET, ETAPES, SUITE, ACCUEIL, OPTIONS, fid, corrige } = S;
