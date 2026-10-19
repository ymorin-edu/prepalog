// Les questions d'ENT-10.5 — Transports Pelleau, le camion de ramasse rentre (brief `docs/briefs/ENT-10.5-pelleau-camion-de-ramasse.md`, §4 bis et
// §4 ter ; choix de Cowork sur délégation du 18/10/2026, à relire à l'écran par Tristan). Modifier ce fichier suffit : voir « Modifier les
// questions d'une séance » dans `activites/FICHE-SEANCE.md`. Personnes CONSTRUITES : Erwan (tuteur), Yann (magasinier-cariste), Maëlys (bureau
// transport). Énoncés, choix et retours des questions au fil : textes du brief §4 bis, tels quels.
//
// QUESTIONS NOTÉES (`part: 4`, une seule ligne au bandeau de fin, « Les questions ») :
// - `pourquoi-trier` (A, Yann, 1 point) : à la première palette posée (`quai:pelleau-quai-105:depose`), corrigée tout de suite.
// - `rendre-meme` (B, Erwan, 1,5 point) : au premier choix de la 1re ligne de « Rapprocher » (`fiche:rapprocher-105:recues-ar-vag`), corrigée tout
//   de suite. Éco-droit appliqué au cas : Code civil 1927, 1932 (document « Le droit », à gauche de la fiche et joint au message d'Erwan).
// - `signature-ramasse` (C, Erwan, 1,5 point) : quand l'accueil de Loïc est fini (`dialogue:pelleau-loic-105:fin`), corrigée AU BILAN.
// QUESTION NON NOTÉE :
// - `quand-ecart` (D, Maëlys) : réflexion, à l'envoi du compte rendu par phrases (le mail à Maëlys : aucune vue ne publie de geste « phrases
//   envoyées », la condition est `apresMail`).
//
// AVANT DE COMMENCER (§4 ter) : 8 notions NON notées, 4 tirées par élève (`tirage: { preparation: 3, image: 1 }` : 6 ≥ 2 × 3, 2 ≥ 2 × 1).
// `cle: true` = ★ du brief (à reprendre dans l'ouverture notée d'ENT-10.8). ÉCART AVEC LE BRIEF : il n'y a pas d'image « rendu iso » au dépôt (une
// vue n'est pas une image) : `img-porteur-quai` montre la photo du quai d'Action (`quai-camion.jpg`), `img-sol` celle des palettes posées au sol
// d'Action (`zone-colis.jpg`), toutes deux déjà au dépôt (`contenus/images/action/CREDITS.md`) ; `zone-reception` montre « Ta matinée » (le plan
// d'ENT-10.2 est une vue). Les `retour` et les `aide` d'« Avant de commencer » sont écrits par Claude Code (le brief ne les donne pas) : à relire.
//
// Ce fichier importe les DONNÉES de la séance (`contenus/pelleau-ent105-donnees.js`), jamais le contenu (`contenus/pelleau-ent105.js` l'importe).

import { apresGeste, apresMail } from '../../core/declencheurs.js';
import { EQUIPE, PHOTOS, mailDe } from '../pelleau.js';
import { ID, QUAI_ID, DIALOGUE, FICHES, palettesDe, annonce, pal } from '../pelleau-ent105-donnees.js';

const GROUPE = 'Les questions';
const COLIS = { src: './contenus/images/action/zone-colis.jpg',
  alt: 'Des palettes de cartons filmés, posées à même le sol d’un entrepôt, avec un ruban orange peint par terre',
  mention: 'Photo d’un autre entrepôt — Freek Wolsink / Pexels' };
const img = (id, photo, court) => ({ id, court, titre: court, type: 'images', images: [{ src: photo.src, alt: photo.alt, credit: photo.mention, large: true }] });

export const QUESTIONS = {
  id: ID,
  part: 4,
  personnes: { erwan: EQUIPE.erwan, yann: EQUIPE.yann, maelys: EQUIPE.maelys },
  ouverture: { id: 'avant-de-commencer', de: 'erwan', titre: 'Avant de commencer', continuer: 'voir l’accueil',
    situation: 'Bonjour ! Ce matin, Loïc rentre de ramasse avec les palettes de plusieurs clients. Avant de commencer, regarde les documents à gauche et réponds à mes questions.',
    documents: ['matinee-105', 'feuille-ramasse-105', 'annonce-ar-vag-105', 'etiquette-105', 'regles-quai-105',
      img('photo-quai-105', PHOTOS.quai, 'Au quai'), img('photo-sol-105', COLIS, 'Au sol')],
    tirage: { preparation: 3, image: 1 },
    questions: ['annonce', 'feuille-ramasse', 'etiquette-palette', 'zone-reception', 'cale', 'gerber', 'img-porteur-quai', 'img-sol'] },
  liste: [
    // ── ouverture : préparation (6 : l'élève en reçoit 3)
    { id: 'annonce', type: 'ouverture', de: 'erwan', doc: 'annonce-ar-vag-105', rubrique: 'preparation', cle: true,
      enonce: 'Une annonce de livraison, c’est…',
      aide: 'Regarde le document à gauche : qui l’écrit, et à qui ? Le mot [[annonce]] est expliqué.',
      choix: [{ v: 'message', lib: 'un message du client qui dit ce qu’il va nous envoyer' }, { v: 'pub', lib: 'une publicité' },
        { v: 'facture', lib: 'une facture' }],
      juste: 'message',
      retour: 'Le client nous dit ce qu’il nous confie. On compare ensuite avec ce qui arrive vraiment.' },
    { id: 'feuille-ramasse', type: 'ouverture', de: 'erwan', doc: 'feuille-ramasse-105', rubrique: 'preparation', cle: true,
      enonce: 'La feuille de ramasse dit…',
      aide: 'Regarde les colonnes du document à gauche. Les mots [[feuille de ramasse]] sont expliqués.',
      choix: [{ v: 'charge', lib: 'ce que le conducteur a chargé chez chaque client' }, { v: 'salaire', lib: 'le salaire du conducteur' },
        { v: 'meteo', lib: 'la météo' }],
      juste: 'charge',
      retour: 'Une ligne par client : ce que Loïc a chargé chez lui, et sa signature.' },
    { id: 'etiquette-palette', type: 'ouverture', de: 'erwan', doc: 'etiquette-105', rubrique: 'preparation', cle: true,
      enonce: 'L’étiquette d’une palette dit…',
      aide: 'Regarde l’étiquette à gauche, ligne par ligne.',
      choix: [{ v: 'qui-quoi', lib: 'à qui elle est et ce qu’elle contient' }, { v: 'vitesse', lib: 'la vitesse du camion' },
        { v: 'prix', lib: 'le prix en magasin' }],
      juste: 'qui-quoi',
      retour: 'L’expéditeur, le contenu, le nombre de colis : c’est elle qu’on lit avant de poser la palette.' },
    { id: 'zone-reception', type: 'ouverture', de: 'erwan', doc: 'matinee-105', rubrique: 'preparation',
      enonce: 'La zone de réception sert à…',
      aide: 'Les mots [[zone de réception]] sont expliqués.',
      choix: [{ v: 'poser', lib: 'poser les palettes qui viennent d’arriver, avant de les contrôler' }, { v: 'stocker', lib: 'stocker pour longtemps' },
        { v: 'engins', lib: 'garer les engins' }],
      juste: 'poser',
      retour: 'Les palettes y attendent, devant les quais. Ensuite seulement, on les range dans les racks.' },
    { id: 'cale', type: 'ouverture', de: 'erwan', doc: 'regles-quai-105', rubrique: 'preparation',
      enonce: 'La cale sert à…',
      aide: 'Regarde la première règle du quai. Le mot [[cale]] est expliqué.',
      choix: [{ v: 'immobiliser', lib: 'empêcher le camion de bouger pendant le déchargement' }, { v: 'soulever', lib: 'soulever la palette' },
        { v: 'porte', lib: 'ouvrir la porte' }],
      juste: 'immobiliser',
      retour: 'Posée contre la roue, elle empêche le camion d’avancer pendant que Yann entre avec le chariot.' },
    { id: 'gerber', type: 'ouverture', de: 'erwan', doc: 'regles-quai-105', rubrique: 'preparation',
      enonce: '« Gerber », c’est…',
      aide: 'Regarde la dernière règle du quai. Le mot [[gerber]] est expliqué.',
      choix: [{ v: 'empiler', lib: 'poser une palette sur une autre' }, { v: 'filmer', lib: 'filmer une palette' }, { v: 'compter', lib: 'compter les colis' }],
      juste: 'empiler',
      retour: 'En zone de réception, on ne gerbe pas : chaque palette a sa place au sol.' },
    // ── ouverture : images (2 : l'élève en reçoit 1)
    { id: 'img-porteur-quai', type: 'ouverture', de: 'erwan', doc: 'photo-quai-105', rubrique: 'image', cle: true,
      enonce: 'Ces camions sont à quai : on peut décharger…',
      choix: [{ v: 'cale', lib: 'une fois le moteur coupé et la cale posée' }, { v: 'moteur', lib: 'moteur allumé, pour aller plus vite' },
        { v: 'marche', lib: 'pendant que le camion recule encore' }],
      juste: 'cale',
      retour: 'Moteur coupé, cale posée : le camion ne bouge plus. Là seulement, on décharge.' },
    { id: 'img-sol', type: 'ouverture', de: 'erwan', doc: 'photo-sol-105', rubrique: 'image',
      enonce: 'Ces marques au sol délimitent…',
      choix: [{ v: 'emplacements', lib: 'les emplacements de la zone de réception' }, { v: 'course', lib: 'une piste de course' },
        { v: 'parking', lib: 'le parking' }],
      juste: 'emplacements',
      retour: 'Chaque palette se pose dans un emplacement marqué. Chez nous, les emplacements portent le nom du client.' },
    // ── au fil du travail (une ligne au bandeau ; textes du brief §4 bis)
    { id: 'pourquoi-trier', type: 'fil', de: 'yann', quand: apresGeste(`quai:${QUAI_ID}:depose`), poids: 1, groupe: GROUPE,
      enonce: 'Pourquoi on ne mélange pas les palettes des deux clients ?',
      choix: [{ v: 'stock', lib: 'Chaque client a son stock : on doit lui rendre ses palettes à lui' }, { v: 'joli', lib: 'C’est plus joli' },
        { v: 'vite', lib: 'Pour aller plus vite au chariot' }],
      juste: 'stock',
      retour: 'Chaque client a son stock à lui. Mélangé, on ne sait plus à qui est quoi.' },
    { id: 'rendre-meme', type: 'fil', de: 'erwan', quand: apresGeste(`fiche:${FICHES.rapprocher}:recues-ar-vag`), poids: 1.5, groupe: GROUPE,
      enonce: 'Un jour, Agri-Kerlann reprendra ses palettes. Que doit-on lui rendre ? (Regarde « Le droit », à gauche.)',
      choix: [{ v: 'meme', lib: 'Exactement ce qu’il nous a confié' }, { v: 'poids', lib: 'Des palettes du même poids' },
        { v: 'reste', lib: 'Ce qui reste dans l’entrepôt' }, { v: 'rien', lib: 'Rien, il a payé' }],
      juste: 'meme',
      retour: 'La même chose, exactement : c’est la règle quand on garde la marchandise d’un autre. D’où le comptage dès l’arrivée.' },
    { id: 'signature-ramasse', type: 'fil', de: 'erwan', quand: apresGeste(`dialogue:${DIALOGUE}:fin`), apres: 'bilan', poids: 1.5, groupe: GROUPE,
      enonce: 'Pourquoi le client signe-t-il la feuille de ramasse quand Loïc charge ?',
      choix: [{ v: 'reconnaitre', lib: 'Pour reconnaître ce qu’il a remis à Loïc' }, { v: 'payer', lib: 'Pour payer Loïc' },
        { v: 'autographe', lib: 'Pour avoir un autographe' }],
      juste: 'reconnaitre',
      // Le chiffre se calcule (décision 13 du chef) : ce que Loïc a chargé chez Agri-Kerlann, et ce qu'Agri-Kerlann avait annoncé.
      retour: `En signant, il reconnaît ce qu’il a donné : ${pal(palettesDe('agri-kerlann').length)}, pas ${annonce('agri-kerlann')}.` },
    { id: 'quand-ecart', type: 'fil', de: 'maelys', quand: apresMail({ a: mailDe('maelys') }), reflexion: true,
      enonce: 'Quand il manque une palette, à qui ça sert de le dire tout de suite ?',
      choix: [{ v: 'client', lib: 'Au client, qui l’attend' }, { v: 'maelys', lib: 'À Maëlys, qui organise la prochaine ramasse' },
        { v: 'erwan', lib: 'À Erwan, qui répond du stock' }, { v: 'nsp', lib: 'Je ne sais pas' }],
      retour: 'Les trois.' },
  ],
};
