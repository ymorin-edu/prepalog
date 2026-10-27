// ENT-19.1 — Amazon, « bienvenue à Brétigny » : GUIDAGE de CAP-C1.1 (se situer dans un environnement professionnel), CAP OL.
// Quatre écrans, une consigne chacun : qui fait quoi (l'équipe), la carte de France (trois centres), le voyage d'un article, ce que font les robots.
// Univers et documents : `contenus/amazon.js` ; fabrique : `contenus/fabrique-fiches.js` ; questions : `contenus/questions/ENT-19.1.js`.
//
// Poids (décidés par Claude, délégation de Tristan du 27/10/2026, « comme pour les blocs du 26/10 ») : qui fait quoi 4 (1 par tâche) · carte 6
// (région et département des 3 centres, 1 chacun) · le voyage 3 (0,5 par étape à son rang) · les robots 3 · questions au fil 4 = 20.

import { seanceFiches, memes } from './fabrique-fiches.js';
import { U } from './amazon-commun.js';
import { DOC_SITE, DOC_EQUIPE, LOCALISER } from './amazon.js';
import { QUESTIONS } from './questions/ENT-19.1.js';

export * from './amazon.js';

const PERS = [{ v: 'karima', lib: 'Karima' }, { v: 'theo', lib: 'Théo' }, { v: 'ines', lib: 'Inès' }, { v: 'moi', lib: 'Moi, le ou la stagiaire' }];
export const TACHES = [
  { id: 't1', texte: 'Régler le problème d’un article abîmé', qui: 'theo' },
  { id: 't2', texte: 'Donner sa mission au stagiaire et suivre son travail', qui: 'karima' },
  { id: 't3', texte: 'Fermer le carton et coller l’étiquette du colis', qui: 'ines' },
  { id: 't4', texte: 'Poser les articles du bac dans les cases de l’armoire', qui: 'moi' },
];
export const VOYAGE = [
  { v: 'reception', lib: 'Le camion du vendeur arrive au quai de réception' },
  { v: 'rangement', lib: 'L’article est rangé dans une case d’une armoire' },
  { v: 'prelevement', lib: 'Un client commande : l’armoire vient au poste, on prend l’article' },
  { v: 'emballage', lib: 'L’article est emballé dans le carton désigné' },
  { v: 'pesee', lib: 'Le colis est pesé et reçoit son étiquette' },
  { v: 'expedition', lib: 'Le colis part en camion vers le client' },
];
// Le départ : aucune étape à son rang (envoyer sans toucher vaut 0).
const DEPART = ['emballage', 'reception', 'pesee', 'expedition', 'prelevement', 'rangement'];
export const ROBOTS = [
  { v: 'apporte', lib: 'Le robot soulève l’armoire et l’apporte devant mon poste', juste: true },
  { v: 'allees', lib: 'Je ne marche plus dans les allées pour chercher les articles', juste: true },
  { v: 'systeme', lib: 'Le système sait dans quelle case est chaque article', juste: true },
  { v: 'emballe', lib: 'Le robot emballe les colis', juste: false },
  { v: 'decide', lib: 'Le robot décide si un article est abîmé', juste: false },
];

const S = seanceFiches(U, {
  id: 'amazon-bienvenue', prefixe: '191', titre: 'Bienvenue à Brétigny', exercice: 'Séance 1 : bienvenue à Brétigny',
  documents: [DOC_SITE, DOC_EQUIPE],
  pas: [
    { id: 'qui', libelle: 'Qui fait quoi ?', titre: 'Qui fait quoi ?', sousTitre: 'Pour chaque tâche, choisis qui la fait. Le document est à gauche.',
      objet: 'Bienvenue chez Amazon', pieces: ['site', 'equipe'], documents: ['equipe'],
      message: 'Bonjour {prenom}, bienvenue à Brétigny ! Je suis Karima, la manageuse de la zone, et ta tutrice pendant ton stage.\n\n'
        + 'Commence par l’équipe : lis « L’équipe », puis remplis la fiche « Qui fait quoi ? ».',
      blocs: TACHES.map((t, i) => ({ type: 'liste', id: `tache-${i + 1}`, lib: t.texte, vide: 'Choisir…', manque: `la tâche ${i + 1}`, choix: PERS })),
      jalons: TACHES.map((t, i) => ({ id: `qui-${i + 1}`, titre: `Qui fait quoi ? : « ${t.texte} »`, groupe: 'Qui fait quoi ?', poids: 1,
        attendu: PERS.find((p) => p.v === t.qui).lib, juste: (v) => v[`tache-${i + 1}`] === t.qui })) },
    { id: 'voyage', libelle: 'Le voyage d’un article', titre: 'Le voyage d’un article', sousTitre: 'Range les étapes dans l’ordre, de l’arrivée au départ.',
      objet: 'Le voyage d’un article', pieces: ['site'], documents: ['site'],
      message: 'Un article fait tout un voyage dans le centre. Lis « Le centre de Brétigny » et remets les étapes dans l’ordre.',
      blocs: [{ type: 'ordre', id: 'ordre', titre: 'Dans l’ordre', consigne: 'De l’arrivée du camion au départ du colis.',
        choix: DEPART.map((x) => VOYAGE.find((e) => e.v === x)) }],
      jalons: VOYAGE.map((e, k) => ({ id: `voyage-${k + 1}`, titre: `Le voyage : « ${e.lib} » à sa place`, groupe: 'Le voyage d’un article', poids: 0.5,
        attendu: `étape ${k + 1}`, juste: (v) => Array.isArray(v.ordre) && v.ordre[k] === e.v })) },
    { id: 'robots', libelle: 'Les robots', titre: 'Ce que font les robots', sousTitre: 'Coche ce qui est vrai à Brétigny.',
      objet: 'Les robots', pieces: ['site'], documents: ['site'],
      message: 'Dernière fiche : les robots. Coche ce qui est vrai dans notre centre.',
      blocs: [{ type: 'cases', id: 'robots', titre: 'Ce qui est vrai', choix: ROBOTS.map((x) => ({ v: x.v, lib: x.lib })) }],
      jalons: [{ id: 'robots', titre: 'Ce que font les robots', groupe: 'Les robots', poids: 3, attendu: ROBOTS.filter((x) => x.juste).map((x) => x.lib).join(' ; '),
        juste: (v) => memes(v.robots || [], ROBOTS.filter((x) => x.juste).map((x) => x.v)) }] },
  ],
  localiser: { ...LOCALISER, apres: 0 },
  accueil: ['Pour chaque tâche, choisis qui la fait.', 'Place chaque centre : sa région, son département, sa ville.', 'Range les étapes dans l’ordre.', 'Coche ce qui est vrai.'],
  fin: 'Merci {prenom}. Demain, tu prends ton poste de rangement : n’oublie pas tes chaussures de sécurité.',
  questions: QUESTIONS,
});
export const { ID, FICHES, VOLET, ETAPES, SUITE, ACCUEIL, OPTIONS, fid, corrige } = S;
