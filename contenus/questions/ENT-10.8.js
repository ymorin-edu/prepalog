// Les questions d'ENT-10.8 — Transports Pelleau, évaluation « recevoir le camion de ramasse » (brief `docs/briefs/ENT-10.8-pelleau-evaluation-reception.md`,
// §4 et §4 ter ; choix de Cowork sur délégation du 18/10/2026, à relire à l'écran par Tristan). Modifier ce fichier suffit : voir « Modifier les questions
// d'une séance » dans `activites/FICHE-SEANCE.md`. Personne CONSTRUITE : Erwan (responsable de l'entrepôt, tuteur).
//
// ÉVALUATION : AUCUNE question au fil (brief §5). Seul l'écran « Avant de commencer » est NOTÉ (`part: 4`) : 8 questions, l'élève en reçoit 4
// (`tirage: { preparation: 3, image: 1 }`) ; aucune aide, aucun mot cliquable, « Je ne sais pas » ajouté par le moteur ; juste +1, « Je ne sais pas » 0,
// fausse −1 ÷ (nombre de mauvaises réponses), plancher 0 ; « Réponse enregistrée. » sans correction. Les `retour` (jamais montrés en évaluation, lus par
// l'enseignant) sont ceux d'ENT-10.5 et 10.6.
//
// LA BANQUE : les questions ★ (`cle: true`) d'ENT-10.5 à 10.7 — l'annonce, la feuille de ramasse, l'étiquette de palette, la photo des camions à quai —
// plus les quatre autres de la banque d'ENT-10.5 et 10.6 (la zone de réception, la cale, « gerber », les marques au sol) : le moteur demande au moins le
// DOUBLE de ce qu'on tire dans chaque rubrique (6 de préparation pour 3, 2 d'images pour 1). Même banque et mêmes identifiants qu'ENT-10.6 (une réponse
// rangée là n'est pas lue ici : `db.questions` est cloisonné par séance). Les documents sont ceux de CETTE séance (ids suffixés `-108`).
// `img-porteur-quai` et `img-sol` : photos d'un autre quai / d'un autre entrepôt (Pexels, `contenus/images/action/CREDITS.md`), comme ENT-10.5 et 10.6.
//
// Ce fichier importe les DONNÉES de la séance (`contenus/pelleau-ent108-donnees.js`), jamais le contenu (`contenus/pelleau-ent108.js` l'importe).

import { EQUIPE, PHOTOS } from '../pelleau.js';
import { ID } from '../pelleau-ent108-donnees.js';

const COLIS = { src: './contenus/images/action/zone-colis.jpg',
  alt: 'Des palettes de cartons filmés, posées à même le sol d’un entrepôt, avec un ruban orange peint par terre',
  mention: 'Photo d’un autre entrepôt — Freek Wolsink / Pexels' };
const img = (id, photo, court) => ({ id, court, titre: court, type: 'images', images: [{ src: photo.src, alt: photo.alt, credit: photo.mention, large: true }] });
const q = (id, rubrique, doc, enonce, choix, juste, retour, cle = false) => ({ id, type: 'ouverture', de: 'erwan', doc, rubrique, ...(cle ? { cle: true } : {}),
  enonce, choix, juste, retour });

export const QUESTIONS = {
  id: ID,
  part: 4,
  personnes: { erwan: EQUIPE.erwan },
  ouverture: { id: 'avant-de-commencer', de: 'erwan', part: 4, titre: 'Avant de commencer', continuer: 'voir l’accueil',
    situation: 'Bonjour ! Ce matin, Loïc rentre de ramasse avec les palettes de plusieurs clients. Avant de commencer, réponds à mes questions, sans aide.',
    documents: ['matinee-108', 'feuille-ramasse-108', 'annonce-ar-vag-108', 'etiquette-108', 'regles-quai-108',
      img('photo-quai-108', PHOTOS.quai, 'Au quai'), img('photo-sol-108', COLIS, 'Au sol')],
    tirage: { preparation: 3, image: 1 },
    questions: ['annonce', 'feuille-ramasse', 'etiquette-palette', 'zone-reception', 'cale', 'gerber', 'img-porteur-quai', 'img-sol'] },
  liste: [
    // ── préparation (6 : l'élève en reçoit 3)
    q('annonce', 'preparation', 'annonce-ar-vag-108', 'Une annonce de livraison, c’est…',
      [{ v: 'message', lib: 'un message du client qui dit ce qu’il va nous envoyer' }, { v: 'pub', lib: 'une publicité' }, { v: 'facture', lib: 'une facture' }],
      'message', 'Le client nous dit ce qu’il nous confie. On compare ensuite avec ce qui arrive vraiment.', true),
    q('feuille-ramasse', 'preparation', 'feuille-ramasse-108', 'La feuille de ramasse dit…',
      [{ v: 'charge', lib: 'ce que le conducteur a chargé chez chaque client' }, { v: 'salaire', lib: 'le salaire du conducteur' }, { v: 'meteo', lib: 'la météo' }],
      'charge', 'Une ligne par client : ce que Loïc a chargé chez lui, et sa signature.', true),
    q('etiquette-palette', 'preparation', 'etiquette-108', 'L’étiquette d’une palette dit…',
      [{ v: 'qui-quoi', lib: 'à qui elle est et ce qu’elle contient' }, { v: 'vitesse', lib: 'la vitesse du camion' }, { v: 'prix', lib: 'le prix en magasin' }],
      'qui-quoi', 'L’expéditeur, le contenu, le nombre de colis : c’est elle qu’on lit avant de poser la palette.', true),
    q('zone-reception', 'preparation', 'matinee-108', 'La zone de réception sert à…',
      [{ v: 'poser', lib: 'poser les palettes qui viennent d’arriver, avant de les contrôler' }, { v: 'stocker', lib: 'stocker pour longtemps' }, { v: 'engins', lib: 'garer les engins' }],
      'poser', 'Les palettes y attendent, devant les quais. Ensuite seulement, on les range dans les racks.'),
    q('cale', 'preparation', 'regles-quai-108', 'La cale sert à…',
      [{ v: 'immobiliser', lib: 'empêcher le camion de bouger pendant le déchargement' }, { v: 'soulever', lib: 'soulever la palette' }, { v: 'porte', lib: 'ouvrir la porte' }],
      'immobiliser', 'Posée contre la roue, elle empêche le camion d’avancer pendant que Yann entre avec le chariot.'),
    q('gerber', 'preparation', 'regles-quai-108', '« Gerber », c’est…',
      [{ v: 'empiler', lib: 'poser une palette sur une autre' }, { v: 'filmer', lib: 'filmer une palette' }, { v: 'compter', lib: 'compter les colis' }],
      'empiler', 'En zone de réception, on ne gerbe pas : chaque palette a sa place au sol.'),
    // ── images (2 : l'élève en reçoit 1)
    q('img-porteur-quai', 'image', 'photo-quai-108', 'Ces camions sont à quai : on peut décharger…',
      [{ v: 'cale', lib: 'une fois le moteur coupé et la cale posée' }, { v: 'moteur', lib: 'moteur allumé, pour aller plus vite' }, { v: 'marche', lib: 'pendant que le camion recule encore' }],
      'cale', 'Moteur coupé, cale posée : le camion ne bouge plus. Là seulement, on décharge.', true),
    q('img-sol', 'image', 'photo-sol-108', 'Ces marques au sol délimitent…',
      [{ v: 'emplacements', lib: 'les emplacements de la zone de réception' }, { v: 'course', lib: 'une piste de course' }, { v: 'parking', lib: 'le parking' }],
      'emplacements', 'Chaque palette se pose dans un emplacement marqué. Chez nous, les emplacements portent le nom du client.'),
  ],
};
