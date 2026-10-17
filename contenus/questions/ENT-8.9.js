// Les questions d'ENT-8.9 — Action, la palette de Lucas (brief `docs/briefs/ENT-8.9-action-labastide-reception.md` §4 bis et §4 ter, tranchés par
// Cowork sur délégation de Tristan le 17/10/2026). Modifier ce fichier suffit : voir « Modifier les questions d'une séance » dans
// `activites/FICHE-SEANCE.md`. Personnes CONSTRUITES : Romain (chef d'équipe, le tuteur), Inès (agent administratif).
//
// AU FIL (`part: 4`, une ligne au bandeau : « Les questions de Romain ») :
// - `qui-paie` (1,5 point, tout de suite) : à la clôture du quai (`quai:action-quai5-labastide:cloturer`). Éco-droit appliqué au cas : C. com. L133-1
//   (document « Le droit », joint au message de Romain « Le camion est à quai »). Énoncé CALCULÉ sur le tirage : SA palette à problème ; « abîmés »
//   quand c'est une avarie, « qui manquent… perdus » quand ce sont des manquants (adaptation de Claude Code : « abîmés » serait faux).
// - `refus-signer` (1,5 point, AU BILAN) : à la première palette validée (`quai:…:valider`) ; corrigée au bilan (proche du jalon de signature).
// - `rappel-lucas` (1 point, tout de suite) : à l'envoi de la fiche « La palette de Lucas » ; posée par Inès.
// - `se-comprendre` (réflexion, non notée) : à la fin de l'accueil de Jan (`dialogue:jan:fin`, ouverte au « Terminer »).
//
// AVANT DE COMMENCER : banque de 10 notions NON notées, 4 tirées par élève (3 de préparation, 1 image). `couches` : c et k TIRÉS (c de 3 à 6, k de
// 4 à 10), jamais les dimensions d'une palette du camion. Images : dessins en traits dans les documents de la séance (aucune image nouvelle). Les
// `aide` et les `retour` sont écrits par Claude Code quand le brief ne les donne pas : à relire.
//
// Ce fichier importe les DONNÉES de la séance (`contenus/action-ent89-donnees.js`), jamais le contenu (`contenus/action-ent89.js` l'importe).

import { apresGeste } from '../../core/declencheurs.js';
import { ID, QUAI_ID, FICHE_ID, DIALOGUE, PALETTES, jeuDeBase, quiPaie } from '../action-ent89-donnees.js';

const GROUPE = 'Les questions de Romain';
const PERSONNES = {
  romain: { nom: 'Romain', role: 'chef d’équipe à la réception (ton tuteur)', appel: 'Romain', registre: 'tu' },
  ines: { nom: 'Inès', role: 'agent administratif', appel: 'Inès', registre: 'tu' },
};
// Les dimensions des palettes du camion (couches × cartons par couche) : jamais tirées pour la question `couches`.
const DU_CAMION = new Set(PALETTES.map((p) => `${p.couches}x${p.parCouche}`));
const varianteCouches = (h) => {
  let c, k;
  do { c = h.entier(3, 6); k = h.entier(4, 10); } while (DU_CAMION.has(`${c}x${k}`));
  return {
    enonce: `Une palette pleine de ${c} couches de ${k} cartons contient…`,
    libs: { juste: `${c * k} cartons`, somme: `${c + k} cartons`, moins: `${c * k - k} cartons` },
    retour: `${c} couches × ${k} cartons = ${c * k} cartons. Pleine : toutes les couches ont le même nombre de cartons.`,
  };
};

export const QUESTIONS = {
  id: ID,
  part: 4,
  personnes: PERSONNES,
  ouverture: { id: 'avant-de-commencer', de: 'romain', titre: 'Avant de commencer', continuer: 'voir l’accueil',
    situation: 'Bonjour ! Ce matin, tu reçois seul un camion. Avant de commencer, regarde les documents à gauche et réponds à mes questions.',
    documents: ['stage', 'pictos', 'protocole-entete', 'palette-pleine', 'dessin-cale', 'carton-ecrase', 'dessin-feux'],
    tirage: { preparation: 3, image: 1 },
    questions: ['pictogramme', 'transporteur', 'reserve', 'avarie', 'jour-ferie', 'couches', 'protocole', 'img-cale', 'img-carton-ecrase', 'img-feux'] },
  liste: [
    // ── préparation (7 : l'élève en reçoit 3)
    { id: 'pictogramme', type: 'ouverture', de: 'romain', doc: 'pictos', rubrique: 'preparation', cle: true,
      enonce: 'Un pictogramme, c’est…',
      aide: 'Regarde les trois dessins à gauche. Clique sur le mot [[pictogramme]].',
      choix: [{ v: 'dessin', lib: 'un petit dessin qui se comprend sans lire' }, { v: 'signature', lib: 'une signature' }, { v: 'numero', lib: 'un numéro de quai' }],
      juste: 'dessin',
      retour: 'Un pictogramme se comprend sans lire : pratique avec un chauffeur qui parle peu français.' },
    { id: 'transporteur', type: 'ouverture', de: 'romain', doc: 'stage', rubrique: 'preparation', cle: true,
      enonce: 'Le transporteur, c’est…',
      aide: 'Clique sur le mot [[transporteur]].',
      choix: [{ v: 'emmene', lib: 'l’entreprise qui emmène la marchandise du fournisseur jusqu’à nous' }, { v: 'magasin', lib: 'le magasin' },
        { v: 'fabricant', lib: 'le fabricant' }],
      juste: 'emmene',
      retour: 'Le transporteur emmène la marchandise jusqu’à nous ; son chauffeur conduit le camion.' },
    { id: 'reserve', type: 'ouverture', de: 'romain', doc: 'stage', rubrique: 'preparation', cle: true,
      enonce: 'Une réserve, c’est…',
      aide: 'Clique sur le mot [[réserve]].',
      choix: [{ v: 'remarque', lib: 'une remarque écrite sur le document du transporteur, qui dit ce qui ne va pas' },
        { v: 'secours', lib: 'une palette de secours' }, { v: 'stock', lib: 'un carton en stock' }],
      juste: 'remarque',
      retour: 'Une réserve s’écrit sur le document du transporteur : quelle palette, quoi, combien.' },
    { id: 'avarie', type: 'ouverture', de: 'romain', doc: 'stage', rubrique: 'preparation',
      enonce: 'Une avarie, c’est…',
      aide: 'Clique sur le mot [[avarie]].',
      choix: [{ v: 'abimee', lib: 'une marchandise abîmée pendant le transport' }, { v: 'retard', lib: 'une marchandise en retard' },
        { v: 'facture', lib: 'une erreur de facture' }],
      juste: 'abimee',
      retour: 'Une avarie : la marchandise a été abîmée pendant le transport.' },
    { id: 'jour-ferie', type: 'ouverture', de: 'romain', doc: 'stage', rubrique: 'preparation',
      enonce: 'Un jour férié, c’est…',
      aide: 'Clique sur les mots [[jour férié]].',
      choix: [{ v: 'fete', lib: 'un jour de fête légale, en général non travaillé' }, { v: 'conge', lib: 'un jour de congé que tu choisis' },
        { v: 'fin-mois', lib: 'le dernier jour du mois' }],
      juste: 'fete',
      retour: 'Un jour férié est un jour de fête légale (le 25 décembre, par exemple) : en général, on ne travaille pas.' },
    { id: 'couches', type: 'ouverture', de: 'romain', doc: 'palette-pleine', rubrique: 'preparation', variante: varianteCouches,
      enonce: 'Une palette pleine de 3 couches de 7 cartons contient…',
      aide: 'Une couche, c’est un étage de cartons. Clique sur le mot [[couche]].',
      choix: [{ v: 'juste', lib: '21 cartons' }, { v: 'somme', lib: '10 cartons' }, { v: 'moins', lib: '14 cartons' }],
      juste: 'juste',
      retour: '3 couches × 7 cartons = 21 cartons. Pleine : toutes les couches ont le même nombre de cartons.' },
    { id: 'protocole', type: 'ouverture', de: 'romain', doc: 'protocole-entete', rubrique: 'preparation', cle: true,
      enonce: 'Le protocole de sécurité d’un quai est écrit…',
      aide: 'Regarde le haut du document à gauche. Clique sur les mots [[protocole de sécurité]].',
      choix: [{ v: 'avant', lib: 'avant la première livraison, par le site et le transporteur' }, { v: 'chauffeur', lib: 'par le chauffeur, en arrivant' },
        { v: 'action', lib: 'par Action' }],
      juste: 'avant',
      retour: 'Avant la première livraison, par le site (ici GXO) et le transporteur, ensemble.' },
    // ── image (3 : l'élève en reçoit 1)
    { id: 'img-cale', type: 'ouverture', de: 'romain', doc: 'dessin-cale', rubrique: 'image', cle: true,
      enonce: 'Cet objet devant la roue sert à…',
      aide: 'Regarde l’objet posé contre le pneu. Clique sur le mot [[cale]].',
      choix: [{ v: 'immobiliser', lib: 'empêcher le camion de bouger' }, { v: 'gonfler', lib: 'gonfler le pneu' }, { v: 'laver', lib: 'laver la roue' }],
      juste: 'immobiliser',
      retour: 'C’est une cale : posée contre la roue, elle empêche le camion de bouger pendant qu’on décharge.' },
    { id: 'img-carton-ecrase', type: 'ouverture', de: 'romain', doc: 'carton-ecrase', rubrique: 'image', cle: true,
      enonce: 'Ce carton est…',
      aide: 'Regarde le coin du carton. Clique sur le mot [[avarie]].',
      choix: [{ v: 'ecrase', lib: 'écrasé : la marchandise dedans est peut-être abîmée' }, { v: 'neuf', lib: 'neuf' }, { v: 'vide', lib: 'vide' }],
      juste: 'ecrase',
      retour: 'Il est écrasé : ce qu’il y a dedans est peut-être abîmé. On l’écrit en réserve, devant le chauffeur.' },
    { id: 'img-feux', type: 'ouverture', de: 'romain', doc: 'dessin-feux', rubrique: 'image',
      enonce: 'Ces feux au bord du quai servent à…',
      aide: 'Regarde où ils sont placés : à côté de la porte, du côté où arrive le camion.',
      choix: [{ v: 'chauffeur', lib: 'dire au chauffeur s’il peut bouger ou non' }, { v: 'eclairer', lib: 'éclairer la cour' }, { v: 'incendie', lib: 'signaler un incendie' }],
      juste: 'chauffeur',
      retour: 'Les feux de quai parlent au chauffeur : tant qu’on décharge, il ne doit pas bouger.' },
    // ── au fil du travail (textes du brief §4 bis ; une ligne au bandeau)
    { id: 'qui-paie', type: 'fil', de: 'romain', quand: apresGeste(`quai:${QUAI_ID}:cloturer`), poids: 1.5, groupe: GROUPE,
      enonce: 'Les cartons abîmés de ta palette l’ont été pendant le transport. Qui doit les rembourser ? (Lis le document « Le droit », joint au message de Romain.)',
      selon: (db) => quiPaie(jeuDeBase(db)),
      choix: [{ v: 'transporteur', lib: 'le transporteur : il répond des avaries pendant le transport' }, { v: 'gxo', lib: 'GXO' },
        { v: 'action', lib: 'Action' }, { v: 'jan', lib: 'Jan, de sa poche' }],
      juste: 'transporteur',
      retour: 'Le transporteur : il répond de ce qui arrive pendant le transport. Ta réserve signée, c’est la preuve.' },
    { id: 'refus-signer', type: 'fil', de: 'romain', quand: apresGeste(`quai:${QUAI_ID}:valider`), poids: 1.5, groupe: GROUPE, apres: 'bilan',
      enonce: 'Imagine : le chauffeur refuse de signer tes réserves. Que fais-tu ?',
      choix: [{ v: 'noter', lib: 'j’écris qu’il refuse de signer, et je préviens Romain' }, { v: 'retirer', lib: 'je retire mes réserves' },
        { v: 'laisser', lib: 'je le laisse partir sans rien dire' }],
      juste: 'noter',
      retour: 'On l’écrit sur le document, et on prévient le chef : le refus aussi est une preuve.' },
    { id: 'rappel-lucas', type: 'fil', de: 'ines', quand: apresGeste(`fiche:${FICHE_ID}:envoyer`), poids: 1, groupe: GROUPE,
      enonce: 'Lucas n’a pas fait exprès. Que faire pour que ça ne recommence pas ?',
      choix: [{ v: 'rappeler', lib: 'lui rappeler de faire le tour de chaque palette avant de signer' }, { v: 'renvoyer', lib: 'le renvoyer' },
        { v: 'rien', lib: 'ne rien dire' }, { v: 'signer', lib: 'signer à sa place' }],
      juste: 'rappeler',
      retour: 'On le lui rappelle, simplement. Tout le monde peut oublier ; la règle, elle, ne change pas.' },
    { id: 'se-comprendre', type: 'fil', de: 'romain', quand: apresGeste(`dialogue:${DIALOGUE}:fin`), reflexion: true,
      enonce: 'Jan parlait peu français. Qu’est-ce qui aide le plus ?',
      choix: [{ v: 'court', lib: 'Des phrases courtes' }, { v: 'pictos', lib: 'Montrer les pictogrammes du protocole' },
        { v: 'calme', lib: 'Parler calmement, avec des gestes' }, { v: 'pas-pense', lib: 'Je n’y avais pas pensé' }],
      retour: 'Les trois : court, montré, calme.' },
  ],
};
