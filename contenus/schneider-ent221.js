// ENT-22.1 — Schneider Electric, « bienvenue à Évreux » : ENTRAÎNEMENT de CAP-C1.1 (se situer dans un environnement professionnel), CAP OL.
// C1.1 a déjà ses guidages (Action, Pelleau, Amazon) : l'élève refait seul(e) le geste dans une entreprise nouvelle. Quatre écrans, une consigne
// chacun : qui fait quoi (l'équipe), la carte de France (trois sites), le voyage d'un disjoncteur, les outils du centre.
// Univers et documents : `contenus/schneider.js` ; fabrique : `contenus/fabrique-fiches.js` ; questions : `contenus/questions/ENT-22.1.js`.
//
// Poids (décidés par Claude, délégation de Tristan du 26/10/2026, choix du 27/10 « les quatre, dans l'ordre ») : qui fait quoi 4 (1 par tâche) ·
// carte 6 (région et département des 3 sites, 1 chacun) · le voyage 3 (0,5 par étape à son rang) · les outils 3 · questions au fil 4 = 20.

import { seanceFiches, memes } from './fabrique-fiches.js';
import { U } from './schneider-commun.js';
import { DOC_SITE, DOC_EQUIPE, LOCALISER } from './schneider.js';
import { QUESTIONS } from './questions/ENT-22.1.js';

export * from './schneider.js';

const PERS = [{ v: 'nadia', lib: 'Nadia' }, { v: 'mehdi', lib: 'Mehdi' }, { v: 'julien', lib: 'Julien' }, { v: 'moi', lib: 'Moi, le ou la stagiaire' }];
export const TACHES = [
  { id: 't1', texte: 'Ranger une palette dans une cellule, à l’adresse du terminal', qui: 'julien' },
  { id: 't2', texte: 'Décider quoi faire d’un camion qui n’est pas sur le planigramme', qui: 'nadia' },
  { id: 't3', texte: 'Lire le planigramme et aider au pré-contrôle avec Mehdi', qui: 'moi' },
  { id: 't4', texte: 'Accueillir le chauffeur et décharger le camion', qui: 'mehdi' },
];
export const VOYAGE = [
  { v: 'usine', lib: 'Le disjoncteur est fabriqué dans une usine du groupe' },
  { v: 'quai', lib: 'Le camion de l’usine arrive au quai d’Évreux' },
  { v: 'controle', lib: 'On décharge et on contrôle la livraison' },
  { v: 'cellule', lib: 'La palette est rangée dans une cellule' },
  { v: 'commande', lib: 'Un distributeur commande : on prépare sa commande' },
  { v: 'electricien', lib: 'Le colis part ; un électricien pose le disjoncteur chez un client' },
];
// Le départ : aucune étape à son rang (envoyer sans toucher vaut 0).
const DEPART = ['controle', 'electricien', 'usine', 'commande', 'quai', 'cellule'];
export const OUTILS = [
  { v: 'drone', lib: 'Un drone compte les colis dans les rayonnages', juste: true },
  { v: 'exo', lib: 'Un exosquelette aide à porter les cartons de plus de 25 kg', juste: true },
  { v: 'chariots', lib: 'Des chariots automatisés circulent dans le centre', juste: true },
  { v: 'robot-camion', lib: 'Des robots conduisent les camions jusqu’aux clients', juste: false },
  { v: 'drone-range', lib: 'Le drone range les palettes à leur adresse', juste: false },
];

const S = seanceFiches(U, {
  id: 'schneider-bienvenue', prefixe: '221', titre: 'Bienvenue à Évreux', exercice: 'Séance 1 : bienvenue à Évreux',
  documents: [DOC_SITE, DOC_EQUIPE],
  pas: [
    { id: 'qui', libelle: 'Qui fait quoi ?', titre: 'Qui fait quoi ?', sousTitre: 'Pour chaque tâche, choisis qui la fait. Le document est à gauche.',
      objet: 'Bienvenue chez Schneider Electric', pieces: ['site', 'equipe'], documents: ['equipe'],
      message: 'Bonjour {prenom}, bienvenue au centre de distribution d’Évreux ! Je suis Nadia, la cheffe d’équipe de la réception, et ta tutrice pendant ton stage.\n\n'
        + 'Commence par l’équipe : lis « L’équipe », puis remplis la fiche « Qui fait quoi ? ».',
      blocs: TACHES.map((t, i) => ({ type: 'liste', id: `tache-${i + 1}`, lib: t.texte, vide: 'Choisir…', manque: `la tâche ${i + 1}`, choix: PERS })),
      jalons: TACHES.map((t, i) => ({ id: `qui-${i + 1}`, titre: `Qui fait quoi ? : « ${t.texte} »`, groupe: 'Qui fait quoi ?', poids: 1,
        attendu: PERS.find((x) => x.v === t.qui).lib, juste: (v) => v[`tache-${i + 1}`] === t.qui })) },
    { id: 'voyage', libelle: 'Le voyage d’un disjoncteur', titre: 'Le voyage d’un disjoncteur', sousTitre: 'Range les étapes dans l’ordre, de l’usine à l’électricien.',
      objet: 'Le voyage d’un disjoncteur', pieces: ['site'], documents: ['site'],
      message: 'Un disjoncteur fait tout un voyage avant d’arriver chez un client. Lis « Le centre d’Évreux » et remets les étapes dans l’ordre.',
      blocs: [{ type: 'ordre', id: 'ordre', titre: 'Dans l’ordre', consigne: 'De l’usine à l’électricien.', choix: DEPART.map((x) => VOYAGE.find((e) => e.v === x)) }],
      jalons: VOYAGE.map((e, k) => ({ id: `voyage-${k + 1}`, titre: `Le voyage : « ${e.lib} » à sa place`, groupe: 'Le voyage d’un disjoncteur', poids: 0.5,
        attendu: `étape ${k + 1}`, juste: (v) => Array.isArray(v.ordre) && v.ordre[k] === e.v })) },
    { id: 'outils', libelle: 'Les outils du centre', titre: 'Les outils du centre', sousTitre: 'Coche ce qui est vrai à Évreux.',
      objet: 'Les outils du centre', pieces: ['site'], documents: ['site'],
      message: 'Dernière fiche : le centre d’Évreux a des outils numériques. Coche ce qui est vrai.',
      blocs: [{ type: 'cases', id: 'outils', titre: 'Ce qui est vrai', choix: OUTILS.map((x) => ({ v: x.v, lib: x.lib })) }],
      jalons: [{ id: 'outils', titre: 'Les outils du centre', groupe: 'Les outils du centre', poids: 3, attendu: OUTILS.filter((x) => x.juste).map((x) => x.lib).join(' ; '),
        juste: (v) => memes(v.outils || [], OUTILS.filter((x) => x.juste).map((x) => x.v)) }] },
  ],
  localiser: { ...LOCALISER, apres: 0 },
  accueil: ['Pour chaque tâche, choisis qui la fait.', 'Place chaque site : sa région, son département, sa ville.', 'Range les étapes dans l’ordre.', 'Coche ce qui est vrai.'],
  fin: 'Merci {prenom}. Demain, tu viens au quai avec Mehdi : chaussures de sécurité et gilet, comme toujours.',
  questions: QUESTIONS,
});
export const { ID, FICHES, VOLET, ETAPES, SUITE, ACCUEIL, OPTIONS, fid, corrige } = S;
