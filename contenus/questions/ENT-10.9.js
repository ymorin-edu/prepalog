// Les questions d'ENT-10.9 — Transports Pelleau, contrôler les palettes des clients (brief `docs/briefs/ENT-10.9-pelleau-controler.md` §4 bis et §4 ter ;
// choix de Cowork sur délégation du 18/10/2026, à relire à l'écran par Tristan). Modifier ce fichier suffit : voir « Modifier les questions d'une
// séance » dans `activites/FICHE-SEANCE.md`. Personnes CONSTRUITES : Erwan (responsable de l'entrepôt, le tuteur), Yann (magasinier-cariste).
// Énoncés, choix et retours des questions au fil : textes du brief §4 bis, tels quels.
//
// AU FIL (`part: 4`, une ligne au bandeau : « Les questions ») :
// - `collegue-reserves` (Q1, Erwan, 1,5 point, AU BILAN) : à la première palette validée (geste `quai:pelleau-quai-109:valider`). Éco-droit appliqué
//   au cas : Code civil 1927, 1932 (document « Le droit », joint au message d'Erwan). Corrigée au bilan : sinon elle dirait d'avance d'écrire des
//   réserves.
// - `sac-perce` (Q2, Yann, 1 point, tout de suite) : quand une palette d'Agri-Kerlann est VALIDÉE (le geste `valider` ne dit pas quelle palette :
//   la condition lit l'état du quai). L'énoncé ne nomme aucune palette : il ne dit pas où est le sac percé, ni s'il y en a un.
// - `qui-saisit` (Q3, Erwan, 1,5 point, tout de suite) : au premier choix de la ligne « fin » du compte rendu (`messagerie:phrase:fin`).
// - `stock-juste` (Q4, réflexion, tout de suite) : à l'envoi du compte rendu (le message est parti : elle ne touche aucun jalon).
//
// AVANT DE COMMENCER (§4 ter) : banque de 8 notions NON notées, 4 tirées par élève (3 de préparation sur 6, 1 image sur 2). `cle: true` = ★ du brief.
// `couches` : c et k TIRÉS (c de 3 à 6, k de 4 à 10), jamais les dimensions d'une palette de la séance (5 × 8, 4 × 10). Images : dessins en traits
// de la séance (sac percé, carton écrasé : il n'y a pas de photo au dépôt, brief « photo libre ») ; la zone litiges : le dessin déjà au dépôt (Smoby,
// repris par ENT-8.8). Les `aide` et les `retour` d'« Avant de commencer » sont écrits par Claude Code (le brief ne les donne pas) : à relire.
//
// Ce fichier importe les DONNÉES de la séance (`contenus/pelleau-ent109-donnees.js`), jamais le contenu (`contenus/pelleau-ent109.js` l'importe).

import { apresGeste } from '../../core/declencheurs.js';
import { phrasesJustes } from '../../core/phrases.js';
import { EQUIPE } from '../pelleau.js';
import { ID, QUAI_ID, PHRASES_ID, PALETTES, palettesDuClient } from '../pelleau-ent109-donnees.js';

const GROUPE = 'Les questions';
// Les dimensions des palettes de la séance (couches × colis par couche) : jamais tirées pour la question `couches`.
const DE_LA_SEANCE = new Set(PALETTES.map((p) => `${p.L}x${p.W * p.D}`));
const varianteCouches = (h) => {
  let c, k;
  do { c = h.entier(3, 6); k = h.entier(4, 10); } while (DE_LA_SEANCE.has(`${c}x${k}`));
  return {
    enonce: `Une palette pleine de ${c} couches de ${k} colis contient…`,
    libs: { juste: `${c * k} colis`, somme: `${c + k} colis`, moins: `${c * k - k} colis` },
    retour: `${c} couches × ${k} colis = ${c * k} colis. Pleine : toutes les couches ont le même nombre de colis.`,
  };
};
// Une palette d'Agri-Kerlann validée (l'état du quai, pas le geste : `valider` ne dit pas quelle palette).
const IDS_AGRI = palettesDuClient('agri-kerlann').map((p) => p.id);
const agriValidee = (db) => { const q = db && db.quais && db.quais[QUAI_ID]; return !!q && IDS_AGRI.some((id) => q.palettes && q.palettes[id] && q.palettes[id].valide); };
const LITIGES = { src: './contenus/smoby/visite/visite-litiges-dessin.jpg',
  alt: 'Dessin d’une zone litiges : marquage au sol, panneau, deux emplacements, palettes bloquées', credit: 'Dessin : ce qu’on doit voir dans une zone litiges.' };

export const QUESTIONS = {
  id: ID,
  part: 4,
  personnes: { erwan: EQUIPE.erwan, yann: EQUIPE.yann },
  ouverture: { id: 'avant-de-commencer', de: 'erwan', titre: 'Avant de commencer', continuer: 'voir l’accueil',
    situation: 'Bonjour ! Les palettes de la ramasse de ce matin sont triées. Avant de les contrôler, regarde les documents à gauche et réponds à mes questions.',
    documents: ['matinee-109', 'feuille-entete-109', 'palette-pleine-109', 'droit-depot', 'sac-perce-109', 'carton-ecrase-109',
      { id: 'photo-litiges-109', court: 'La zone litiges', titre: 'Une zone litiges', type: 'images', images: [LITIGES] }],
    tirage: { preparation: 3, image: 1 },
    questions: ['reserve', 'avarie', 'manquant', 'couches', 'depot', 'zone-litiges', 'img-sac', 'img-carton-ecrase'] },
  liste: [
    // ── préparation (6 : l'élève en reçoit 3)
    { id: 'reserve', type: 'ouverture', de: 'erwan', doc: 'feuille-entete-109', rubrique: 'preparation', cle: true,
      enonce: 'Une réserve, c’est…',
      aide: 'Regarde la case « Réserves » du document à gauche. Le mot [[réserve]] est expliqué.',
      choix: [{ v: 'remarque', lib: 'une remarque écrite sur le document, qui dit ce qui ne va pas' }, { v: 'secours', lib: 'une palette de secours' },
        { v: 'stock', lib: 'un carton en stock' }],
      juste: 'remarque',
      retour: 'Une réserve s’écrit sur le document : ce qui ne va pas, sur quelle palette, combien.' },
    { id: 'avarie', type: 'ouverture', de: 'erwan', doc: 'matinee-109', rubrique: 'preparation', cle: true,
      enonce: 'Une avarie, c’est…',
      aide: 'Le mot [[avarie]] est expliqué.',
      choix: [{ v: 'abimee', lib: 'une marchandise abîmée' }, { v: 'retard', lib: 'une marchandise en retard' }, { v: 'prix', lib: 'une erreur de prix' }],
      juste: 'abimee',
      retour: 'Une avarie : la marchandise est abîmée (un carton écrasé, un sac percé…).' },
    { id: 'manquant', type: 'ouverture', de: 'erwan', doc: 'matinee-109', rubrique: 'preparation',
      enonce: 'Un manquant, c’est…',
      aide: 'Le mot [[manquant]] est expliqué.',
      choix: [{ v: 'absent', lib: 'un colis prévu sur le document mais qui n’est pas là' }, { v: 'abime', lib: 'un colis abîmé' },
        { v: 'trop', lib: 'un colis en trop' }],
      juste: 'absent',
      retour: 'Un manquant : le document l’annonce, mais il n’est pas sur la palette.' },
    { id: 'couches', type: 'ouverture', de: 'erwan', doc: 'palette-pleine-109', rubrique: 'preparation', cle: true, variante: varianteCouches,
      enonce: 'Une palette pleine de 3 couches de 7 colis contient…',
      aide: 'Une couche, c’est un étage de colis. Le mot [[couche]] est expliqué.',
      choix: [{ v: 'juste', lib: '21 colis' }, { v: 'somme', lib: '10 colis' }, { v: 'moins', lib: '14 colis' }],
      juste: 'juste',
      retour: '3 couches × 7 colis = 21 colis. Pleine : toutes les couches ont le même nombre de colis.' },
    { id: 'depot', type: 'ouverture', de: 'erwan', doc: 'droit-depot', rubrique: 'preparation', cle: true,
      enonce: 'Quand Pelleau garde la marchandise d’un client, il doit…',
      aide: 'Lis l’article 1932 du document « Le droit », à gauche. Le mot [[dépôt]] est expliqué.',
      choix: [{ v: 'rendre', lib: 'la lui rendre telle qu’il l’a reçue' }, { v: 'revendre', lib: 'la revendre' },
        { v: 'melanger', lib: 'la mélanger avec d’autres' }],
      juste: 'rendre',
      retour: 'Il rend la même marchandise, telle qu’il l’a reçue. D’où le contrôle dès l’arrivée : on sait dans quel état elle est entrée.' },
    { id: 'zone-litiges', type: 'ouverture', de: 'erwan', doc: 'photo-litiges-109', rubrique: 'preparation',
      enonce: 'La zone litiges sert à…',
      aide: 'Regarde le dessin. Les mots [[zone litiges]] sont expliqués.',
      choix: [{ v: 'cote', lib: 'mettre de côté ce qui pose problème' }, { v: 'vides', lib: 'jeter les cartons vides' }, { v: 'epi', lib: 'ranger les EPI' }],
      juste: 'cote',
      retour: 'En zone litiges, on met de côté ce qui pose problème, le temps de décider avec le client.' },
    // ── image (2 : l'élève en reçoit 1)
    { id: 'img-sac', type: 'ouverture', de: 'erwan', doc: 'sac-perce-109', rubrique: 'image', cle: true,
      enonce: 'Ce sac est…',
      aide: 'Regarde le flanc du sac. Le mot [[avarie]] est expliqué.',
      choix: [{ v: 'perce', lib: 'percé : le terreau s’en échappe' }, { v: 'neuf', lib: 'neuf' }, { v: 'ferme', lib: 'fermé' }],
      juste: 'perce',
      retour: 'Il est percé : le terreau s’en va. C’est une avarie : on la note, on ne range pas ce sac avec les autres.' },
    { id: 'img-carton-ecrase', type: 'ouverture', de: 'erwan', doc: 'carton-ecrase-109', rubrique: 'image',
      enonce: 'Ce carton est…',
      aide: 'Regarde le coin du carton.',
      choix: [{ v: 'ecrase', lib: 'écrasé : ce qu’il y a dedans est peut-être abîmé' }, { v: 'neuf', lib: 'neuf' }, { v: 'vide', lib: 'vide' }],
      juste: 'ecrase',
      retour: 'Il est écrasé : les biscuits dedans sont peut-être cassés. On le note.' },
    // ── au fil du travail (notées, une ligne au bandeau ; textes du brief §4 bis)
    { id: 'collegue-reserves', type: 'fil', de: 'erwan', quand: apresGeste(`quai:${QUAI_ID}:valider`), poids: 1.5, groupe: GROUPE, apres: 'bilan',
      enonce: 'Loïc est de la maison. Pourquoi écrire quand même des réserves ? (Regarde « Le droit », joint à mon message.)',
      choix: [{ v: 'prouver', lib: 'On garde la marchandise du client : il doit savoir dans quel état elle est entrée, et on doit pouvoir le prouver' },
        { v: 'embeter', lib: 'Pour embêter Loïc' }, { v: 'inutile', lib: 'Ce n’est pas utile entre collègues' }, { v: 'payer', lib: 'Pour que Loïc paie' }],
      juste: 'prouver',
      retour: 'Parce qu’on répond de ce qu’on garde. Écrit et signé, c’est une preuve.' },
    { id: 'sac-perce', type: 'fil', de: 'yann', quand: agriValidee, poids: 1, groupe: GROUPE,
      enonce: 'Un sac de terreau percé, on le met où ?',
      choix: [{ v: 'litiges', lib: 'En zone litiges, avec une étiquette' }, { v: 'rack', lib: 'Au rack avec les autres' },
        { v: 'poubelle', lib: 'À la poubelle tout de suite' }],
      juste: 'litiges',
      retour: 'En zone litiges, étiqueté : on décide avec le client.' },
    { id: 'qui-saisit', type: 'fil', de: 'erwan', quand: apresGeste('messagerie:phrase:fin'), poids: 1.5, groupe: GROUPE,
      enonce: 'Ton contrôle, qui le saisit dans l’ordinateur ?',
      choix: [{ v: 'maelys', lib: 'Maëlys' }, { v: 'toi', lib: 'Toi' }, { v: 'loic', lib: 'Loïc' }, { v: 'client', lib: 'Le client' }],
      juste: 'maelys',
      retour: 'Maëlys : elle saisit ce que tu as reçu, réserves comprises.' },
    { id: 'stock-juste', type: 'fil', de: 'erwan', quand: (db) => phrasesJustes(db, PHRASES_ID).envoye, reflexion: true,
      enonce: 'Pourquoi le stock de l’ordinateur doit-il dire exactement ce qu’il y a ?',
      choix: [{ v: 'rendre', lib: 'Pour rendre au client ce qu’il a confié' }, { v: 'preparer', lib: 'Pour préparer ses commandes sans surprise' },
        { v: 'facturer', lib: 'Pour facturer juste' }, { v: 'sais-pas', lib: 'Je ne sais pas' }],
      retour: 'Les trois.' },
  ],
};
