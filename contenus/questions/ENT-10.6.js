// Les questions d'ENT-10.6 — Transports Pelleau, la ramasse du mercredi (brief `docs/briefs/ENT-10.6-pelleau-ramasse-du-mercredi.md`, §4 bis et §4 ter ;
// choix de Cowork sur délégation du 18/10/2026, à relire à l'écran par Tristan). Modifier ce fichier suffit : voir « Modifier les questions d'une séance »
// dans `activites/FICHE-SEANCE.md`. Personnes CONSTRUITES : Erwan (tuteur), Yann (magasinier-cariste). Énoncés, choix et retours des questions au fil :
// textes du brief §4 bis, tels quels.
//
// QUESTIONS NOTÉES (`part: 4`, une seule ligne au bandeau de fin, « Les questions ») :
// - `pourquoi-cale` (A, Yann, 1,5 point) : au premier signalement envoyé sur la scène (`scene:pelleau-quai-106:signaler`), corrigée AU BILAN.
// - `ecart-qui-dit` (B, Erwan, 1 point) : au premier choix de la 1re ligne de « Rapprocher » (`fiche:rapprocher-106:recues-ar-vag`), corrigée tout de
//   suite. Son ÉNONCÉ SUIT L'ÉCART TIRÉ de l'élève (`selon`, calculé une fois à l'arrivée de la question) ; la bonne réponse reste « je le note et je le dis
//   à Maëlys tout de suite ». Sans écart (« aucun »), la question est posée en « imagine » : le brief ne dit pas ce cas, c'est un choix de Claude Code.
// - `rendre-meme-2` (C, Erwan, 1,5 point) : quand la dernière palette est posée (`quai:pelleau-quai-106:dechargement`), corrigée tout de suite.
//   Éco-droit appliqué au cas : Code civil 1932 (« rendre la chose même », vu en ENT-10.5 ; le document « Le droit » n'est pas sous les yeux sur le quai).
//
// AVANT DE COMMENCER (§4 ter) : la banque d'ENT-10.5 (mêmes ids), NON notée, 4 tirées par élève (`tirage: { preparation: 3, image: 1 }`). Les `retour` et
// les `aide` sont ceux d'ENT-10.5 (écrits par Claude Code, à relire). `img-porteur-quai` et `img-sol` : photos d'un autre quai / d'un autre entrepôt
// (Pexels, `contenus/images/action/CREDITS.md`), comme ENT-10.5.
//
// Ce fichier importe les DONNÉES de la séance (`contenus/pelleau-ent106-donnees.js`), jamais le contenu (`contenus/pelleau-ent106.js` l'importe).

import { apresGeste } from '../../core/declencheurs.js';
import { EQUIPE, PHOTOS } from '../pelleau.js';
import { ID, QUAI_ID, FICHES, NOM_DIT, jeuDeBase, annonce, compte, pal } from '../pelleau-ent106-donnees.js';

const GROUPE = 'Les questions';
const COLIS = { src: './contenus/images/action/zone-colis.jpg',
  alt: 'Des palettes de cartons filmés, posées à même le sol d’un entrepôt, avec un ruban orange peint par terre',
  mention: 'Photo d’un autre entrepôt — Freek Wolsink / Pexels' };
const img = (id, photo, court) => ({ id, court, titre: court, type: 'images', images: [{ src: photo.src, alt: photo.alt, credit: photo.mention, large: true }] });

// ── B : l'écart tiré de l'élève, dit avec les chiffres de SES documents (calculés, jamais écrits).
const choixEcartQuestion = {
  signaler: 'Je le note et je le dis à Maëlys tout de suite',
  completer: 'Je mets une palette d’Ar Vag avec Agri-Kerlann',
  rien: 'Rien, ça arrivera',
};
const selonEcart = (db) => {
  const jeu = jeuDeBase(db);
  const c = jeu.clientEcart;
  if (!c) {
    // Aucun écart : la question est posée « pour imaginer » (mêmes choix, mêmes clés).
    return { enonce: 'Tout correspond aux annonces. Imagine qu’il manque une palette d’un client. Que fais-tu ?' };
  }
  const autre = Object.keys(NOM_DIT).find((x) => x !== c);
  const dit = `${NOM_DIT[c]} a annoncé ${pal(annonce(jeu, c))}, on en reçoit ${compte(jeu, c)}. Que fais-tu ?`;
  return jeu.ecart === 'moins'
    ? { enonce: dit, libs: { completer: `Je mets une palette de ${NOM_DIT[autre]} avec ${NOM_DIT[c]}` } }
    : { enonce: dit, libs: { signaler: 'Je le note et je le dis à Maëlys tout de suite',
      completer: `Je mets la palette en trop avec celles de ${NOM_DIT[autre]}`, rien: 'Rien, l’annonce sera mise à jour' } };
};

export const QUESTIONS = {
  id: ID,
  part: 4,
  personnes: { erwan: EQUIPE.erwan, yann: EQUIPE.yann },
  ouverture: { id: 'avant-de-commencer', de: 'erwan', titre: 'Avant de commencer', continuer: 'voir l’accueil',
    situation: 'Bonjour ! Ce matin, Loïc rentre de ramasse avec les palettes de plusieurs clients. Avant de commencer, regarde les documents à gauche et réponds à mes questions.',
    documents: ['matinee-106', 'feuille-ramasse-106', 'annonce-ar-vag-106', 'etiquette-106', 'regles-quai-106',
      img('photo-quai-106', PHOTOS.quai, 'Au quai'), img('photo-sol-106', COLIS, 'Au sol')],
    tirage: { preparation: 3, image: 1 },
    questions: ['annonce', 'feuille-ramasse', 'etiquette-palette', 'zone-reception', 'cale', 'gerber', 'img-porteur-quai', 'img-sol'] },
  liste: [
    // ── ouverture : préparation (6 : l'élève en reçoit 3)
    { id: 'annonce', type: 'ouverture', de: 'erwan', doc: 'annonce-ar-vag-106', rubrique: 'preparation', cle: true,
      enonce: 'Une annonce de livraison, c’est…',
      aide: 'Regarde le document à gauche : qui l’écrit, et à qui ? Le mot [[annonce]] est expliqué.',
      choix: [{ v: 'message', lib: 'un message du client qui dit ce qu’il va nous envoyer' }, { v: 'pub', lib: 'une publicité' },
        { v: 'facture', lib: 'une facture' }],
      juste: 'message',
      retour: 'Le client nous dit ce qu’il nous confie. On compare ensuite avec ce qui arrive vraiment.' },
    { id: 'feuille-ramasse', type: 'ouverture', de: 'erwan', doc: 'feuille-ramasse-106', rubrique: 'preparation', cle: true,
      enonce: 'La feuille de ramasse dit…',
      aide: 'Regarde les colonnes du document à gauche. Les mots [[feuille de ramasse]] sont expliqués.',
      choix: [{ v: 'charge', lib: 'ce que le conducteur a chargé chez chaque client' }, { v: 'salaire', lib: 'le salaire du conducteur' },
        { v: 'meteo', lib: 'la météo' }],
      juste: 'charge',
      retour: 'Une ligne par client : ce que Loïc a chargé chez lui, et sa signature.' },
    { id: 'etiquette-palette', type: 'ouverture', de: 'erwan', doc: 'etiquette-106', rubrique: 'preparation', cle: true,
      enonce: 'L’étiquette d’une palette dit…',
      aide: 'Regarde l’étiquette à gauche, ligne par ligne.',
      choix: [{ v: 'qui-quoi', lib: 'à qui elle est et ce qu’elle contient' }, { v: 'vitesse', lib: 'la vitesse du camion' },
        { v: 'prix', lib: 'le prix en magasin' }],
      juste: 'qui-quoi',
      retour: 'L’expéditeur, le contenu, le nombre de colis : c’est elle qu’on lit avant de poser la palette.' },
    { id: 'zone-reception', type: 'ouverture', de: 'erwan', doc: 'matinee-106', rubrique: 'preparation',
      enonce: 'La zone de réception sert à…',
      aide: 'Les mots [[zone de réception]] sont expliqués.',
      choix: [{ v: 'poser', lib: 'poser les palettes qui viennent d’arriver, avant de les contrôler' }, { v: 'stocker', lib: 'stocker pour longtemps' },
        { v: 'engins', lib: 'garer les engins' }],
      juste: 'poser',
      retour: 'Les palettes y attendent, devant les quais. Ensuite seulement, on les range dans les racks.' },
    { id: 'cale', type: 'ouverture', de: 'erwan', doc: 'regles-quai-106', rubrique: 'preparation',
      enonce: 'La cale sert à…',
      aide: 'Regarde la première règle du quai. Le mot [[cale]] est expliqué.',
      choix: [{ v: 'immobiliser', lib: 'empêcher le camion de bouger pendant le déchargement' }, { v: 'soulever', lib: 'soulever la palette' },
        { v: 'porte', lib: 'ouvrir la porte' }],
      juste: 'immobiliser',
      retour: 'Posée contre la roue, elle empêche le camion d’avancer pendant que Yann entre avec le chariot.' },
    { id: 'gerber', type: 'ouverture', de: 'erwan', doc: 'regles-quai-106', rubrique: 'preparation',
      enonce: '« Gerber », c’est…',
      aide: 'Regarde la dernière règle du quai. Le mot [[gerber]] est expliqué.',
      choix: [{ v: 'empiler', lib: 'poser une palette sur une autre' }, { v: 'filmer', lib: 'filmer une palette' }, { v: 'compter', lib: 'compter les colis' }],
      juste: 'empiler',
      retour: 'En zone de réception, on ne gerbe pas : chaque palette a sa place au sol.' },
    // ── ouverture : images (2 : l'élève en reçoit 1)
    { id: 'img-porteur-quai', type: 'ouverture', de: 'erwan', doc: 'photo-quai-106', rubrique: 'image', cle: true,
      enonce: 'Ces camions sont à quai : on peut décharger…',
      choix: [{ v: 'cale', lib: 'une fois le moteur coupé et la cale posée' }, { v: 'moteur', lib: 'moteur allumé, pour aller plus vite' },
        { v: 'marche', lib: 'pendant que le camion recule encore' }],
      juste: 'cale',
      retour: 'Moteur coupé, cale posée : le camion ne bouge plus. Là seulement, on décharge.' },
    { id: 'img-sol', type: 'ouverture', de: 'erwan', doc: 'photo-sol-106', rubrique: 'image',
      enonce: 'Ces marques au sol délimitent…',
      choix: [{ v: 'emplacements', lib: 'les emplacements de la zone de réception' }, { v: 'course', lib: 'une piste de course' },
        { v: 'parking', lib: 'le parking' }],
      juste: 'emplacements',
      retour: 'Chaque palette se pose dans un emplacement marqué. Chez nous, les emplacements portent le nom du client.' },
    // ── au fil du travail (une ligne au bandeau ; textes du brief §4 bis)
    { id: 'pourquoi-cale', type: 'fil', de: 'yann', quand: apresGeste(`scene:${QUAI_ID}:signaler`), apres: 'bilan', poids: 1.5, groupe: GROUPE,
      enonce: 'Pourquoi le camion doit-il être calé et le moteur coupé avant qu’on entre dedans ?',
      choix: [{ v: 'bouge', lib: 'Pour qu’il ne bouge pas pendant que le chariot est dedans' }, { v: 'gasoil', lib: 'Pour économiser le gasoil' },
        { v: 'repos', lib: 'Pour que Loïc se repose' }],
      juste: 'bouge',
      retour: 'Un camion qui bouge pendant que le chariot est dedans, c’est l’accident.' },
    { id: 'ecart-qui-dit', type: 'fil', de: 'erwan', quand: apresGeste(`fiche:${FICHES.rapprocher}:recues-ar-vag`), poids: 1, groupe: GROUPE, selon: selonEcart,
      enonce: 'Tout correspond aux annonces. Imagine qu’il manque une palette d’un client. Que fais-tu ?',
      choix: [{ v: 'signaler', lib: choixEcartQuestion.signaler }, { v: 'completer', lib: choixEcartQuestion.completer }, { v: 'rien', lib: choixEcartQuestion.rien }],
      juste: 'signaler',
      retour: 'Dis-le tout de suite : Maëlys prévient le client et prévoit la prochaine ramasse.' },
    { id: 'rendre-meme-2', type: 'fil', de: 'erwan', quand: apresGeste(`quai:${QUAI_ID}:dechargement`), poids: 1.5, groupe: GROUPE,
      enonce: 'Ar Vag demande demain une de ses palettes. Peut-on lui donner une palette d’Agri-Kerlann du même poids ?',
      choix: [{ v: 'non', lib: 'Non : on lui rend la sienne, celle qu’il nous a confiée' }, { v: 'poids', lib: 'Oui, si le poids est le même' },
        { v: 'voit', lib: 'Oui, s’il ne voit pas la différence' }],
      juste: 'non',
      retour: 'Non : on rend la chose même qu’on a reçue.' },
  ],
};
