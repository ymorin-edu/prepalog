// Les questions d'ENT-10.11 — Transports Pelleau, la palette qui craint la chaleur (brief `docs/briefs/ENT-10.11-pelleau-palette-froide.md` §4 bis et §4 ter ;
// choix de Cowork sur délégation du 18/10/2026, à relire à l'écran par Tristan). Modifier ce fichier suffit : voir « Modifier les questions d'une
// séance » dans `activites/FICHE-SEANCE.md`. Personne CONSTRUITE : Erwan (responsable de l'entrepôt, le tuteur).
// Énoncés, choix et retours des questions au fil : textes du brief §4 bis, tels quels, sauf ce qui est dit plus bas (ÉCARTS).
//
// AU FIL (`part: 4`, une ligne au bandeau : « Les questions ») :
// - `qui-repond-plants` (Q1, Erwan, 1,5 point, tout de suite) : à la première case cochée de la fiche « Que devient la palette ? » (geste
//   `fiche:kerveguen-111:devient`). Éco-droit appliqué au cas : Code civil 1927, 1928 (document « Le droit », joint).
// - `lire-etiquette` (Q2, Erwan, 1 point, AU BILAN) : à la fin de l'entretien avec Loïc (`dialogue:pelleau-loic-111:fin`). Corrigée au bilan : sinon elle
//   dirait d'avance comment décider.
// - `chaine-froid` (Q3, Erwan, 1,5 point, tout de suite) : à la clôture du quai (`quai:pelleau-quai-111:cloturer`).
// - `dire-non-2` (Q4, réflexion, tout de suite) : à l'envoi du compte rendu ; elle ne touche aucun jalon.
// ÉCARTS avec le brief : Q3 dit « deux jours » et non « jusqu'à lundi » (décision n° 9 du chef : jamais le jour de la semaine) ; les `retour` de Q1 à Q3
// sont écrits par Claude Code (le brief ne les donne pas).
//
// AVANT DE COMMENCER (§4 ter) : banque de 11 notions NON notées, 4 tirées par élève (3 de préparation sur 8, 1 image sur 3). `cle: true` = ★ du brief.
// Banque d'ENT-10.9 (recopiée : une séance n'importe pas le fichier d'une autre), plus `ambiant` (d'ENT-10.1, ★), `conservation` et `img-thermometre`.
// ÉCARTÉE : `entrepot-froid` (« Notre entrepôt a-t-il du froid ? » donnerait la décision). `conservation` « non tirée chez le confirmé » (brief) : clé
// `niveaux: ['accompagne', 'standard']` (décision de Tristan, 20/10/2026) ; le confirmé tire ses 3 notions parmi les 7 autres. `couches` : c et k TIRÉS (c de 3 à 6, k de 4 à 10),
// jamais les dimensions d'une palette de la séance (5 × 8, 4 × 10, 4 × 8).
//
// Ce fichier importe les DONNÉES de la séance (`contenus/pelleau-ent111-donnees.js`), jamais le contenu (`contenus/pelleau-ent111.js` l'importe).

import { apresGeste } from '../../core/declencheurs.js';
import { phrasesJustes } from '../../core/phrases.js';
import { EQUIPE, PALETTE_AR_VAG, PALETTE_AGRI, PALETTE_KERVEGUEN } from '../pelleau.js';
import { ID, QUAI_ID, DIALOGUE, FICHES, BLOC_DEVIENT, PHRASES_ID, FOURCHETTE } from '../pelleau-ent111-donnees.js';

const GROUPE = 'Les questions';
// Les dimensions des palettes de la séance (couches × colis par couche) : jamais tirées pour la question `couches`.
const DE_LA_SEANCE = new Set([PALETTE_AR_VAG, PALETTE_AGRI, PALETTE_KERVEGUEN].map((p) => `${p.couches}x${p.parCouche}`));
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

export const QUESTIONS = {
  id: ID,
  part: 4,
  personnes: { erwan: EQUIPE.erwan },
  ouverture: { id: 'avant-de-commencer', de: 'erwan', titre: 'Avant de commencer', continuer: 'voir l’accueil',
    situation: 'Bonjour ! Les palettes de la ramasse de ce matin sont triées. Avant de les contrôler, regarde les documents à gauche et réponds à mes questions.',
    documents: ['matinee-111', 'feuille-entete-111', 'palette-pleine-111', 'droit-depot', 'pelleau', 'sac-perce-111', 'carton-ecrase-111', 'thermometre-111',
      { id: 'photo-litiges-111', court: 'La zone litiges', titre: 'Une zone litiges', type: 'images', images: [LITIGES] }],
    tirage: { preparation: 3, image: 1 },
    questions: ['reserve', 'avarie', 'manquant', 'couches', 'depot', 'zone-litiges', 'ambiant', 'conservation', 'img-sac', 'img-carton-ecrase', 'img-thermometre'] },
  liste: [
    // ── préparation (8 : l'élève en reçoit 3)
    { id: 'reserve', type: 'ouverture', de: 'erwan', doc: 'feuille-entete-111', rubrique: 'preparation', cle: true,
      enonce: 'Une réserve, c’est…',
      aide: 'Regarde la case « Réserves » du document à gauche. Le mot [[réserve]] est expliqué.',
      choix: [{ v: 'remarque', lib: 'une remarque écrite sur le document, qui dit ce qui ne va pas' }, { v: 'secours', lib: 'une palette de secours' },
        { v: 'stock', lib: 'un carton en stock' }],
      juste: 'remarque',
      retour: 'Une réserve s’écrit sur le document : ce qui ne va pas, sur quelle palette, combien.' },
    { id: 'avarie', type: 'ouverture', de: 'erwan', doc: 'matinee-111', rubrique: 'preparation', cle: true,
      enonce: 'Une avarie, c’est…',
      aide: 'Le mot [[avarie]] est expliqué.',
      choix: [{ v: 'abimee', lib: 'une marchandise abîmée' }, { v: 'retard', lib: 'une marchandise en retard' }, { v: 'prix', lib: 'une erreur de prix' }],
      juste: 'abimee',
      retour: 'Une avarie : la marchandise est abîmée (un carton écrasé, un sac percé…).' },
    { id: 'manquant', type: 'ouverture', de: 'erwan', doc: 'matinee-111', rubrique: 'preparation',
      enonce: 'Un manquant, c’est…',
      aide: 'Le mot [[manquant]] est expliqué.',
      choix: [{ v: 'absent', lib: 'un colis prévu sur le document mais qui n’est pas là' }, { v: 'abime', lib: 'un colis abîmé' },
        { v: 'trop', lib: 'un colis en trop' }],
      juste: 'absent',
      retour: 'Un manquant : le document l’annonce, mais il n’est pas sur la palette.' },
    { id: 'couches', type: 'ouverture', de: 'erwan', doc: 'palette-pleine-111', rubrique: 'preparation', cle: true, variante: varianteCouches,
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
    { id: 'zone-litiges', type: 'ouverture', de: 'erwan', doc: 'photo-litiges-111', rubrique: 'preparation',
      enonce: 'La zone litiges sert à…',
      aide: 'Regarde le dessin. Les mots [[zone litiges]] sont expliqués.',
      choix: [{ v: 'cote', lib: 'mettre de côté ce qui pose problème' }, { v: 'vides', lib: 'jeter les cartons vides' }, { v: 'epi', lib: 'ranger les EPI' }],
      juste: 'cote',
      retour: 'En zone litiges, on met de côté ce qui pose problème, le temps de décider avec le client.' },
    // D'ENT-10.1 (★) : l'entrepôt de Gouesnou est ambiant seulement (site Pelleau).
    { id: 'ambiant', type: 'ouverture', de: 'erwan', doc: 'pelleau', rubrique: 'preparation', cle: true,
      enonce: 'Un stockage « ambiant », c’est…',
      aide: 'Le mot [[stock ambiant]] est expliqué.',
      choix: [{ v: 'sans-froid', lib: 'sans froid : à la température de l’entrepôt' }, { v: 'congelateur', lib: 'au congélateur' },
        { v: 'parking', lib: 'dehors, sur le parking' }],
      juste: 'sans-froid',
      retour: 'L’entrepôt de Gouesnou n’a pas de froid : on n’y garde que ce qui supporte la température de l’entrepôt.' },
    // Brief §4 ter. Générique : ne parle d'aucune palette de la séance. Le sens de « 4 à 8 » est écrit dans le retour, avec la fourchette de l'univers.
    // `niveaux` (20/10/2026) : le confirmé ne la reçoit jamais (brief §4 ter) ; il reste 7 questions de préparation pour lui (3 tirées, il en faut 6).
    { id: 'conservation', type: 'ouverture', de: 'erwan', doc: 'thermometre-111', rubrique: 'preparation', cle: true, niveaux: ['accompagne', 'standard'],
      enonce: `« Conserver ${FOURCHETTE} » veut dire…`,
      aide: 'Regarde le thermomètre à gauche : le trait dit la température.',
      choix: [{ v: 'frais', lib: 'le produit doit rester au frais, sans geler' }, { v: 'congelateur', lib: 'il peut aller au congélateur' },
        { v: 'partout', lib: 'il se garde n’importe où' }],
      juste: 'frais',
      retour: 'Une étiquette qui donne une température dit où le produit se garde : ni trop chaud, ni gelé.' },
    // ── image (3 : l'élève en reçoit 1)
    { id: 'img-sac', type: 'ouverture', de: 'erwan', doc: 'sac-perce-111', rubrique: 'image', cle: true,
      enonce: 'Ce sac est…',
      aide: 'Regarde le flanc du sac. Le mot [[avarie]] est expliqué.',
      choix: [{ v: 'perce', lib: 'percé : le terreau s’en échappe' }, { v: 'neuf', lib: 'neuf' }, { v: 'ferme', lib: 'fermé' }],
      juste: 'perce',
      retour: 'Il est percé : le terreau s’en va. C’est une avarie : on la note, on ne range pas ce sac avec les autres.' },
    { id: 'img-carton-ecrase', type: 'ouverture', de: 'erwan', doc: 'carton-ecrase-111', rubrique: 'image',
      enonce: 'Ce carton est…',
      aide: 'Regarde le coin du carton.',
      choix: [{ v: 'ecrase', lib: 'écrasé : ce qu’il y a dedans est peut-être abîmé' }, { v: 'neuf', lib: 'neuf' }, { v: 'vide', lib: 'vide' }],
      juste: 'ecrase',
      retour: 'Il est écrasé : les biscuits dedans sont peut-être cassés. On le note.' },
    // Brief §4 ter (`img-thermometre`) : le dessin est CONSTRUIT (aucune photo au dépôt) ; il montre 20 °C, la température d'un entrepôt sans froid.
    { id: 'img-thermometre', type: 'ouverture', de: 'erwan', doc: 'thermometre-111', rubrique: 'image', cle: true,
      enonce: 'Ce thermomètre indique…',
      aide: 'Lis le chiffre en face du haut du trait.',
      choix: [{ v: 'vingt', lib: '20 °C' }, { v: 'dix', lib: '10 °C' }, { v: 'trente', lib: '30 °C' }],
      juste: 'vingt',
      retour: '20 °C : la température d’une pièce, sans froid. C’est celle de l’entrepôt de Gouesnou.' },
    // ── au fil du travail (notées, une ligne au bandeau ; textes du brief §4 bis)
    { id: 'qui-repond-plants', type: 'fil', de: 'erwan', quand: apresGeste(`fiche:${FICHES.devient}:${BLOC_DEVIENT}`), poids: 1.5, groupe: GROUPE,
      enonce: 'Si on avait rangé les plants au rack à 20 °C et qu’ils avaient germé, qui en aurait répondu ? (Regarde « Le droit ».)',
      choix: [{ v: 'pelleau', lib: 'Pelleau, qui les gardait et était payé pour ça' }, { v: 'ferme', lib: 'La ferme' }, { v: 'loic', lib: 'Loïc' },
        { v: 'personne', lib: 'Personne' }],
      juste: 'pelleau',
      retour: 'Pelleau : on répond de ce qu’on garde, et avec plus de rigueur quand on est payé pour ça (art. 1928).' },
    { id: 'lire-etiquette', type: 'fil', de: 'erwan', quand: apresGeste(`dialogue:${DIALOGUE}:fin`), poids: 1, groupe: GROUPE, apres: 'bilan',
      enonce: 'Où vois-tu à quelle température garder un produit ?',
      choix: [{ v: 'etiquette', lib: 'Sur son étiquette' }, { v: 'facture', lib: 'Sur la facture' }, { v: 'cabine', lib: 'Dans la cabine du camion' }],
      juste: 'etiquette',
      retour: 'Sur son étiquette : c’est là que le client écrit comment garder son produit.' },
    { id: 'chaine-froid', type: 'fil', de: 'erwan', quand: apresGeste(`quai:${QUAI_ID}:cloturer`), poids: 1.5, groupe: GROUPE,
      enonce: 'Pourquoi ne pas la laisser deux jours sur le quai ?',
      choix: [{ v: 'chaud', lib: 'Le quai n’est pas froid : les plants s’abîmeraient' }, { v: 'passage', lib: 'Elle gênerait le passage' },
        { v: 'reprendre', lib: 'Kervéguen la reprendra lui-même' }],
      juste: 'chaud',
      retour: 'Le quai n’est pas froid non plus : les plants s’y abîmeraient comme au rack.' },
    { id: 'dire-non-2', type: 'fil', de: 'erwan', quand: (db) => phrasesJustes(db, PHRASES_ID).envoye, reflexion: true,
      enonce: 'Loïc disait « c’est pas grave ». Qu’est-ce qui t’a aidé à décider ?',
      choix: [{ v: 'etiquette', lib: 'L’étiquette' }, { v: 'regle', lib: 'La règle de l’entrepôt : pas de froid ici' }, { v: 'erwan', lib: 'Demander à Erwan' },
        { v: 'rien', lib: 'Rien, j’ai hésité' }],
      retour: 'Dire non à un collègue, c’est plus facile avec l’étiquette, la règle de l’entrepôt, ou un appel au responsable.' },
  ],
};
