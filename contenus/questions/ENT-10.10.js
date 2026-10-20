// Les questions d'ENT-10.10 — Transports Pelleau, le contrôle, seul (brief `docs/briefs/ENT-10.10-pelleau-controle-seul.md` §4 bis et §4 ter ; choix de Cowork sur
// délégation du 18/10/2026, à relire à l'écran par Tristan). Modifier ce fichier suffit : voir « Modifier les questions d'une séance » dans
// `activites/FICHE-SEANCE.md`. Personne CONSTRUITE : Erwan (responsable de l'entrepôt, le tuteur — au bureau dans cette séance, il parle par le panneau).
//
// AU FIL (`part: 4`, une ligne au bandeau : « Les questions ») — 3 questions, 1,5 + 1,5 + 1 :
// - `reserve-precise` (Q1, Erwan, 1,5 point, tout de suite) : à la CLÔTURE du quai (`quai:pelleau-quai-110:cloturer`). L'énoncé est CALCULÉ (`selon`) :
//   la bonne réponse nomme la palette « facile » de l'élève et ce qu'elle a (« P3 : 2 sacs percés » ou « P1 : 2 cartons écrasés » : le brief ne
//   donnait que l'exemple « P2 : 2 sacs percés », la palette et le colis sont tirés). Les deux fausses sont celles du brief.
// - `article-different` (Q2, Erwan, 1,5 point, AU BILAN) : à la première palette validée. **L'énoncé ne nomme pas le produit** (décision n° 12 du chef : il est
//   tiré, l'engrais n'existe que chez un élève sur trois) : « l'étiquette ne dit pas le même article que la feuille ». Corrigée au bilan : sinon elle
//   soufflerait le jalon des élèves qui ont tiré l'article différent.
// - `rendre-meme-3` (Q3, Erwan, 1 point, tout de suite) : au premier choix de la ligne « fin » du compte rendu (`messagerie:phrase:fin`). « Un colis » et non
//   « un sac » (tous les élèves n'ont pas un sac percé : la palette « facile » est un carton écrasé chez Ar Vag). C. civ. 1932.
//
// AVANT DE COMMENCER : banque de 10 notions NON notées, 4 tirées par élève (3 de préparation sur 7, 1 image sur 3). C'est la banque d'ENT-10.9 (mêmes ids),
// recopiée (une séance n'importe pas le fichier d'une autre), plus `article` et `img-etiquette` (brief §4 ter). `couches` : c et k TIRÉS (c de 3 à 6, k de 4 à
// 10), jamais les dimensions d'une palette de la séance. Les `aide` et les `retour` sont écrits par Claude Code (le brief ne les donne pas) : à relire.
// L'exemple de l'étiquette est un carton d'Ar Vag (jamais tiré en « article différent » : la notion n'annonce rien de la séance).
//
// Ce fichier importe les DONNÉES de la séance (`contenus/pelleau-ent110-donnees.js`), jamais le contenu (`contenus/pelleau-ent110.js` l'importe).

import { apresGeste } from '../../core/declencheurs.js';
import { EQUIPE, PALETTE_AR_VAG, PALETTE_AGRI } from '../pelleau.js';
import { ID, QUAI_ID, jeuDe, jeuDeBase, duRole, decrit, quantite } from '../pelleau-ent110-donnees.js';

const GROUPE = 'Les questions';
// Les dimensions des palettes de la séance (couches × colis par couche) : jamais tirées pour la question `couches`.
const DE_LA_SEANCE = new Set([PALETTE_AR_VAG, PALETTE_AGRI].map((p) => `${p.couches}x${p.parCouche}`));
const varianteCouches = (h) => {
  let c, k;
  do { c = h.entier(3, 6); k = h.entier(4, 10); } while (DE_LA_SEANCE.has(`${c}x${k}`));
  return {
    enonce: `Une palette pleine de ${c} couches de ${k} colis contient…`,
    libs: { juste: `${c * k} colis`, somme: `${c + k} colis`, moins: `${c * k - k} colis` },
    retour: `${c} couches × ${k} colis = ${c * k} colis. Pleine : toutes les couches ont le même nombre de colis.`,
  };
};
const LITIGES = { src: './contenus/smoby/visite/visite-litiges-dessin.jpg',
  alt: 'Dessin d’une zone litiges : marquage au sol, panneau, deux emplacements, palettes bloquées', credit: 'Dessin : ce qu’on doit voir dans une zone litiges.' };

// La réserve juste de la palette « facile » d'un jeu : « P3 : 2 sacs percés », « P1 : 2 cartons écrasés » (le nombre, la palette et le mot viennent du jeu).
const reserveFacile = (jeu) => {
  const F = duRole(jeu, 'facile'), d = decrit(F), n = quantite(F);
  return `${F.id} : ${n} ${n > 1 ? d.unitePl : d.unite} ${d.sacs ? (n > 1 ? 'percés' : 'percé') : (n > 1 ? 'écrasés' : 'écrasé')}`;
};

export const QUESTIONS = {
  id: ID,
  part: 4,
  personnes: { erwan: EQUIPE.erwan },
  ouverture: { id: 'avant-de-commencer', de: 'erwan', titre: 'Avant de commencer', continuer: 'voir l’accueil',
    situation: 'Bonjour ! Je suis au bureau ce matin : tu contrôles seul les palettes de la ramasse. Avant de commencer, regarde les documents à gauche et réponds à mes questions.',
    documents: ['matinee-110', 'feuille-entete-110', 'palette-pleine-110', 'droit-depot', 'sac-perce-110', 'carton-ecrase-110', 'etiquette-110',
      { id: 'photo-litiges-110', court: 'La zone litiges', titre: 'Une zone litiges', type: 'images', images: [LITIGES] }],
    tirage: { preparation: 3, image: 1 },
    questions: ['reserve', 'avarie', 'manquant', 'couches', 'depot', 'zone-litiges', 'article', 'img-sac', 'img-carton-ecrase', 'img-etiquette'] },
  liste: [
    // ── préparation (7 : l'élève en reçoit 3)
    { id: 'reserve', type: 'ouverture', de: 'erwan', doc: 'feuille-entete-110', rubrique: 'preparation', cle: true,
      enonce: 'Une réserve, c’est…',
      aide: 'Regarde la case « Réserves » du document à gauche. Le mot [[réserve]] est expliqué.',
      choix: [{ v: 'remarque', lib: 'une remarque écrite sur le document, qui dit ce qui ne va pas' }, { v: 'secours', lib: 'une palette de secours' },
        { v: 'stock', lib: 'un carton en stock' }],
      juste: 'remarque',
      retour: 'Une réserve s’écrit sur le document : ce qui ne va pas, sur quelle palette, combien.' },
    { id: 'avarie', type: 'ouverture', de: 'erwan', doc: 'matinee-110', rubrique: 'preparation', cle: true,
      enonce: 'Une avarie, c’est…',
      aide: 'Le mot [[avarie]] est expliqué.',
      choix: [{ v: 'abimee', lib: 'une marchandise abîmée' }, { v: 'retard', lib: 'une marchandise en retard' }, { v: 'prix', lib: 'une erreur de prix' }],
      juste: 'abimee',
      retour: 'Une avarie : la marchandise est abîmée (un carton écrasé, un sac percé…).' },
    { id: 'manquant', type: 'ouverture', de: 'erwan', doc: 'matinee-110', rubrique: 'preparation',
      enonce: 'Un manquant, c’est…',
      aide: 'Le mot [[manquant]] est expliqué.',
      choix: [{ v: 'absent', lib: 'un colis prévu sur le document mais qui n’est pas là' }, { v: 'abime', lib: 'un colis abîmé' },
        { v: 'trop', lib: 'un colis en trop' }],
      juste: 'absent',
      retour: 'Un manquant : le document l’annonce, mais il n’est pas sur la palette.' },
    { id: 'couches', type: 'ouverture', de: 'erwan', doc: 'palette-pleine-110', rubrique: 'preparation', cle: true, variante: varianteCouches,
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
    { id: 'zone-litiges', type: 'ouverture', de: 'erwan', doc: 'photo-litiges-110', rubrique: 'preparation',
      enonce: 'La zone litiges sert à…',
      aide: 'Regarde le dessin. Les mots [[zone litiges]] sont expliqués.',
      choix: [{ v: 'cote', lib: 'mettre de côté ce qui pose problème' }, { v: 'vides', lib: 'jeter les cartons vides' }, { v: 'epi', lib: 'ranger les EPI' }],
      juste: 'cote',
      retour: 'En zone litiges, on met de côté ce qui pose problème, le temps de décider avec le client.' },
    { id: 'article', type: 'ouverture', de: 'erwan', doc: 'etiquette-110', rubrique: 'preparation', cle: true,
      enonce: 'Un article différent, c’est…',
      aide: 'Regarde les deux papiers du dessin. Les mots [[article différent]] sont expliqués.',
      choix: [{ v: 'autre', lib: 'un produit qui n’est pas celui du document' }, { v: 'abime', lib: 'un produit abîmé' }, { v: 'retard', lib: 'un produit qui arrive en retard' }],
      juste: 'autre',
      retour: 'Un article différent : l’étiquette des colis dit un produit, la feuille de ramasse en dit un autre. Ce n’est ni un colis abîmé, ni un colis manquant.' },
    // ── image (3 : l'élève en reçoit 1)
    { id: 'img-sac', type: 'ouverture', de: 'erwan', doc: 'sac-perce-110', rubrique: 'image', cle: true,
      enonce: 'Ce sac est…',
      aide: 'Regarde le flanc du sac. Le mot [[avarie]] est expliqué.',
      choix: [{ v: 'perce', lib: 'percé : le terreau s’en échappe' }, { v: 'neuf', lib: 'neuf' }, { v: 'ferme', lib: 'fermé' }],
      juste: 'perce',
      retour: 'Il est percé : le terreau s’en va. C’est une avarie : on la note, on ne range pas ce sac avec les autres.' },
    { id: 'img-carton-ecrase', type: 'ouverture', de: 'erwan', doc: 'carton-ecrase-110', rubrique: 'image',
      enonce: 'Ce carton est…',
      aide: 'Regarde le coin du carton.',
      choix: [{ v: 'ecrase', lib: 'écrasé : ce qu’il y a dedans est peut-être abîmé' }, { v: 'neuf', lib: 'neuf' }, { v: 'vide', lib: 'vide' }],
      juste: 'ecrase',
      retour: 'Il est écrasé : les biscuits dedans sont peut-être cassés. On le note.' },
    { id: 'img-etiquette', type: 'ouverture', de: 'erwan', doc: 'etiquette-110', rubrique: 'image', cle: true,
      enonce: 'Ce carton, par rapport à la feuille de ramasse, est…',
      aide: 'Compare la référence et le nom des deux papiers. Les mots [[article différent]] sont expliqués.',
      choix: [{ v: 'autre', lib: 'un article différent : l’étiquette ne dit pas le même produit' }, { v: 'pareil', lib: 'le même article' }, { v: 'vide', lib: 'vide' }],
      juste: 'autre',
      retour: 'La feuille dit des biscuits au beurre, l’étiquette des biscuits au chocolat : c’est un article différent. On l’écrit en réserve, avec la référence lue sur l’étiquette.' },
    // ── au fil du travail (notées, une ligne au bandeau ; textes du brief §4 bis)
    { id: 'reserve-precise', type: 'fil', de: 'erwan', quand: apresGeste(`quai:${QUAI_ID}:cloturer`), poids: 1.5, groupe: GROUPE,
      enonce: 'Quelle réserve vaut quelque chose ?',
      choix: [{ v: 'precise', lib: reserveFacile(jeuDe('')) }, { v: 'etat', lib: 'Marchandise en mauvais état' }, { v: 'deballage', lib: 'Sous réserve de déballage' }],
      // La bonne réponse est celle de SA palette : « P3 : 2 sacs percés » ou « P1 : 2 cartons écrasés ». Les deux autres sont les mêmes pour tous.
      selon: (db) => ({ enonce: 'Quelle réserve vaut quelque chose ?', libs: { precise: reserveFacile(jeuDeBase(db)) } }),
      juste: 'precise',
      retour: 'Une réserve utile dit la palette, quoi et combien. « Mauvais état » ou « sous réserve de déballage » ne disent rien : elles ne te protègent de rien.' },
    { id: 'article-different', type: 'fil', de: 'erwan', quand: apresGeste(`quai:${QUAI_ID}:valider`), poids: 1.5, groupe: GROUPE, apres: 'bilan',
      enonce: 'Sur un colis, l’étiquette ne dit pas le même article que la feuille de ramasse. Tu fais quoi ?',
      choix: [{ v: 'reserve', lib: 'Je l’écris en réserve : article différent, et on prévient le client' }, { v: 'etiquette', lib: 'Je change l’étiquette' },
        { v: 'rien', lib: 'Rien, c’est pareil pour le client' }],
      juste: 'reserve',
      retour: 'Tu l’écris en réserve, avec la référence lue sur l’étiquette, et on prévient le client. On ne change jamais l’étiquette d’un client, et on ne laisse pas passer un autre article.' },
    { id: 'rendre-meme-3', type: 'fil', de: 'erwan', quand: apresGeste('messagerie:phrase:fin'), poids: 1, groupe: GROUPE,
      enonce: 'Pourquoi le client doit-il savoir qu’un colis était abîmé à l’arrivée ?',
      choix: [{ v: 'preuve', lib: 'Pour qu’on ne nous reproche pas, au départ, un colis abîmé dans nos racks' }, { v: 'payer', lib: 'Pour qu’il nous paie plus' },
        { v: 'regarde', lib: 'Ça ne le regarde pas' }],
      juste: 'preuve',
      retour: 'On doit rendre la marchandise telle qu’on l’a reçue (Code civil, article 1932). Écrit à l’arrivée, c’est la preuve qu’elle était déjà abîmée.' },
  ],
};
