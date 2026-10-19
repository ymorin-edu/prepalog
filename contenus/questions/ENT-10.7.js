// Les questions d'ENT-10.7 — Transports Pelleau, la feuille de ramasse se trompe (brief `docs/briefs/ENT-10.7-pelleau-feuille-de-ramasse.md`, §4 bis et
// §4 ter ; choix de Cowork sur délégation du 18/10/2026, à relire à l'écran par Tristan). Modifier ce fichier suffit : voir « Modifier les
// questions d'une séance » dans `activites/FICHE-SEANCE.md`. Personnes CONSTRUITES : Erwan (tuteur), Maëlys (bureau transport).
//
// QUESTIONS NOTÉES (`part: 4`, une seule ligne au bandeau de fin, « Les questions ») :
// - `croire-quoi` (A, Erwan, 1,5 point) : quand l'accueil de Loïc est fini (`dialogue:pelleau-loic-107:fin`), corrigée AU BILAN (la corriger tout de
//   suite donnerait la dépose). ÉCART AVEC LE BRIEF : l'énoncé est une hypothèse (« Imagine que la feuille et l'étiquette… »), pas une constatation : à
//   ce moment-là de la séance l'élève n'a pas encore vu l'étiquette, et la question ne doit pas lui annoncer l'erreur.
// - `si-on-suit` (B, Erwan, 1,5 point) : à l'envoi de « Rapprocher » (`fiche:rapprocher-107:envoyer`), corrigée tout de suite. Éco-droit appliqué au cas :
//   Code civil 1932 (document « Le droit », à gauche de la fiche). L'énoncé et le choix juste CITENT les clients de l'élève (`selon` : le sens de l'erreur
//   est tiré par la graine) ; jamais le numéro de la palette ni un nombre.
// - `qui-corrige` (C, Maëlys, 1 point) : à l'envoi de « La feuille de ramasse » (`fiche:corriger-107:envoyer`), corrigée tout de suite.
//
// AVANT DE COMMENCER (§4 ter) : la banque d'ENT-10.5 (8 notions NON notées, 4 tirées par élève : `tirage: { preparation: 3, image: 1 }`, 6 ≥ 2 × 3, 2 ≥ 2 × 1),
// ids de documents suffixés `-107`. `cle: true` = ★ du brief (à reprendre dans l'ouverture notée d'ENT-10.8). ÉCART AVEC LE BRIEF : pas d'image « rendu
// iso » au dépôt : `img-porteur-quai` montre la photo du quai d'Action, `img-sol` celle des palettes posées au sol d'Action, toutes deux déjà au dépôt
// (`contenus/images/action/CREDITS.md`). Les `retour` et les `aide` sont écrits par Claude Code (le brief ne les donne pas) : à relire.
//
// Ce fichier importe les DONNÉES de la séance (`contenus/pelleau-ent107-donnees.js`), jamais le contenu (`contenus/pelleau-ent107.js` l'importe).

import { apresGeste } from '../../core/declencheurs.js';
import { EQUIPE, PHOTOS } from '../pelleau.js';
import { ID, DIALOGUE, FICHES, NOM_DIT, jeuDe } from '../pelleau-ent107-donnees.js';
import { graineDeBase } from '../../core/tirage.js';

const GROUPE = 'Les questions';
const COLIS = { src: './contenus/images/action/zone-colis.jpg',
  alt: 'Des palettes de cartons filmés, posées à même le sol d’un entrepôt, avec un ruban orange peint par terre',
  mention: 'Photo d’un autre entrepôt — Freek Wolsink / Pexels' };
const img = (id, photo, court) => ({ id, court, titre: court, type: 'images', images: [{ src: photo.src, alt: photo.alt, credit: photo.mention, large: true }] });

export const QUESTIONS = {
  id: ID,
  part: 4,
  personnes: { erwan: EQUIPE.erwan, maelys: EQUIPE.maelys },
  ouverture: { id: 'avant-de-commencer', de: 'erwan', titre: 'Avant de commencer', continuer: 'voir l’accueil',
    situation: 'Bonjour ! Ce matin, Loïc rentre de ramasse avec les palettes de plusieurs clients. Avant de commencer, regarde les documents à gauche et réponds à mes questions.',
    documents: ['matinee-107', 'feuille-ramasse-107', 'annonce-ar-vag-107', 'etiquette-107', 'regles-quai-107',
      img('photo-quai-107', PHOTOS.quai, 'Au quai'), img('photo-sol-107', COLIS, 'Au sol')],
    tirage: { preparation: 3, image: 1 },
    questions: ['annonce', 'feuille-ramasse', 'etiquette-palette', 'zone-reception', 'cale', 'gerber', 'img-porteur-quai', 'img-sol'] },
  liste: [
    // ── ouverture : préparation (6 : l'élève en reçoit 3)
    { id: 'annonce', type: 'ouverture', de: 'erwan', doc: 'annonce-ar-vag-107', rubrique: 'preparation', cle: true,
      enonce: 'Une annonce de livraison, c’est…',
      aide: 'Regarde le document à gauche : qui l’écrit, et à qui ? Le mot [[annonce]] est expliqué.',
      choix: [{ v: 'message', lib: 'un message du client qui dit ce qu’il va nous envoyer' }, { v: 'pub', lib: 'une publicité' },
        { v: 'facture', lib: 'une facture' }],
      juste: 'message',
      retour: 'Le client nous dit ce qu’il nous confie. On compare ensuite avec ce qui arrive vraiment.' },
    { id: 'feuille-ramasse', type: 'ouverture', de: 'erwan', doc: 'feuille-ramasse-107', rubrique: 'preparation', cle: true,
      enonce: 'La feuille de ramasse dit…',
      aide: 'Regarde les colonnes du document à gauche. Les mots [[feuille de ramasse]] sont expliqués.',
      choix: [{ v: 'charge', lib: 'ce que le conducteur a chargé chez chaque client' }, { v: 'salaire', lib: 'le salaire du conducteur' },
        { v: 'meteo', lib: 'la météo' }],
      juste: 'charge',
      retour: 'Une ligne par client : ce que Loïc a chargé chez lui, et sa signature.' },
    { id: 'etiquette-palette', type: 'ouverture', de: 'erwan', doc: 'etiquette-107', rubrique: 'preparation', cle: true,
      enonce: 'L’étiquette d’une palette dit…',
      aide: 'Regarde l’étiquette à gauche, ligne par ligne.',
      choix: [{ v: 'qui-quoi', lib: 'à qui elle est et ce qu’elle contient' }, { v: 'vitesse', lib: 'la vitesse du camion' },
        { v: 'prix', lib: 'le prix en magasin' }],
      juste: 'qui-quoi',
      retour: 'L’expéditeur, le contenu, le nombre de colis : c’est elle qu’on lit avant de poser la palette.' },
    { id: 'zone-reception', type: 'ouverture', de: 'erwan', doc: 'matinee-107', rubrique: 'preparation',
      enonce: 'La zone de réception sert à…',
      aide: 'Les mots [[zone de réception]] sont expliqués.',
      choix: [{ v: 'poser', lib: 'poser les palettes qui viennent d’arriver, avant de les contrôler' }, { v: 'stocker', lib: 'stocker pour longtemps' },
        { v: 'engins', lib: 'garer les engins' }],
      juste: 'poser',
      retour: 'Les palettes y attendent, devant les quais. Ensuite seulement, on les range dans les racks.' },
    { id: 'cale', type: 'ouverture', de: 'erwan', doc: 'regles-quai-107', rubrique: 'preparation',
      enonce: 'La cale sert à…',
      aide: 'Regarde la première règle du quai. Le mot [[cale]] est expliqué.',
      choix: [{ v: 'immobiliser', lib: 'empêcher le camion de bouger pendant le déchargement' }, { v: 'soulever', lib: 'soulever la palette' },
        { v: 'porte', lib: 'ouvrir la porte' }],
      juste: 'immobiliser',
      retour: 'Posée contre la roue, elle empêche le camion d’avancer pendant que Yann entre avec le chariot.' },
    { id: 'gerber', type: 'ouverture', de: 'erwan', doc: 'regles-quai-107', rubrique: 'preparation',
      enonce: '« Gerber », c’est…',
      aide: 'Regarde la dernière règle du quai. Le mot [[gerber]] est expliqué.',
      choix: [{ v: 'empiler', lib: 'poser une palette sur une autre' }, { v: 'filmer', lib: 'filmer une palette' }, { v: 'compter', lib: 'compter les colis' }],
      juste: 'empiler',
      retour: 'En zone de réception, on ne gerbe pas : chaque palette a sa place au sol.' },
    // ── ouverture : images (2 : l'élève en reçoit 1)
    { id: 'img-porteur-quai', type: 'ouverture', de: 'erwan', doc: 'photo-quai-107', rubrique: 'image', cle: true,
      enonce: 'Ces camions sont à quai : on peut décharger…',
      choix: [{ v: 'cale', lib: 'une fois le moteur coupé et la cale posée' }, { v: 'moteur', lib: 'moteur allumé, pour aller plus vite' },
        { v: 'marche', lib: 'pendant que le camion recule encore' }],
      juste: 'cale',
      retour: 'Moteur coupé, cale posée : le camion ne bouge plus. Là seulement, on décharge.' },
    { id: 'img-sol', type: 'ouverture', de: 'erwan', doc: 'photo-sol-107', rubrique: 'image',
      enonce: 'Ces marques au sol délimitent…',
      choix: [{ v: 'emplacements', lib: 'les emplacements de la zone de réception' }, { v: 'course', lib: 'une piste de course' },
        { v: 'parking', lib: 'le parking' }],
      juste: 'emplacements',
      retour: 'Chaque palette se pose dans un emplacement marqué. Chez nous, les emplacements portent le nom du client.' },
    // ── au fil du travail (une ligne au bandeau ; textes du brief §4 bis)
    { id: 'croire-quoi', type: 'fil', de: 'erwan', quand: apresGeste(`dialogue:${DIALOGUE}:fin`), apres: 'bilan', poids: 1.5, groupe: GROUPE,
      enonce: 'Imagine que la feuille et l’étiquette d’une palette ne disent pas la même chose. Tu crois…',
      choix: [{ v: 'etiquette', lib: 'L’étiquette, posée sur la palette par le client' }, { v: 'feuille', lib: 'La feuille, c’est Loïc qui l’a écrite' },
        { v: 'arrange', lib: 'Ce qui t’arrange' }],
      juste: 'etiquette',
      retour: 'L’étiquette est collée par le client sur sa palette : c’est elle qui dit à qui est la palette. Une feuille écrite à la main peut se tromper.' },
    // Le sens de l'erreur est tiré par la graine (décision 14 du chef) : l'énoncé et le choix juste citent LES clients de l'élève (jamais un nombre, jamais
    // le numéro de la palette). Les libellés de repli (base vide) sont ceux d'un jeu quelconque.
    { id: 'si-on-suit', type: 'fil', de: 'erwan', quand: apresGeste(`fiche:${FICHES.rapprocher}:envoyer`), poids: 1.5, groupe: GROUPE,
      enonce: 'Si on avait suivi la feuille, que se passerait-il le jour où un client reprend ses palettes ? (Regarde « Le droit », à gauche.)',
      selon: (db) => { const J = jeuDe(graineDeBase(db)), note = NOM_DIT[J.note], vrai = NOM_DIT[J.vrai];
        return { enonce: `Si on avait suivi la feuille, que se passerait-il le jour où ${note} reprend ses palettes ? (Regarde « Le droit », à gauche.)`,
          libs: { erreur: `On lui rendrait une palette d’${vrai}`, rien: 'Rien, ça ne changerait rien', paie: `${note} paierait moins` },
          retour: `On lui rendrait une palette d’${vrai} : ce n’est pas ce qu’il nous a confié. La règle (Code civil 1932) : rendre la chose même.` }; },
      choix: [{ v: 'erreur', lib: 'On lui rendrait une palette d’un autre client' }, { v: 'rien', lib: 'Rien, ça ne changerait rien' }, { v: 'paie', lib: 'Le client paierait moins' }],
      juste: 'erreur',
      retour: 'On lui rendrait une palette d’un autre client : ce n’est pas ce qu’il nous a confié. La règle (Code civil 1932) : rendre la chose même.' },
    { id: 'qui-corrige', type: 'fil', de: 'maelys', quand: apresGeste(`fiche:${FICHES.corriger}:envoyer`), poids: 1, groupe: GROUPE,
      enonce: 'Pourquoi ne pas raturer seul la feuille ?',
      choix: [{ v: 'preuve', lib: 'Elle est signée : on la corrige avec celui qui l’a écrite, pour qu’elle reste une preuve' },
        { v: 'vite', lib: 'Pour aller plus vite' }, { v: 'rien', lib: 'Ça ne change rien' }],
      juste: 'preuve',
      retour: 'Les clients ont signé cette feuille : elle prouve ce que Loïc a chargé. On la corrige avec celui qui l’a écrite, pour qu’elle reste une preuve.' },
  ],
};
