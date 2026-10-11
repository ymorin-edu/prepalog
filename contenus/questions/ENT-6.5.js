// Les questions d'ENT-6.5 — France Boissons, ranger les fûts (brief `docs/briefs/ENT-6.5-france-boissons-rangement.md`, §4 bis et §4 ter :
// propositions de Cowork du 10/10/2026, « tout gardé » par Tristan, puis tranché le 11/10/2026). Modifier ce fichier suffit : voir
// « Modifier les questions d'une séance » dans `activites/FICHE-SEANCE.md`. Personnes et situations CONSTRUITES.
//
// AU FIL (3, dont 2 NOTÉES : `part: 3`, 1,5 + 1,5), énoncé fixe (aucune valeur tirée). Aucune sur le FIFO : les deux questions de
// l'animation sont déjà des jalons. La question « charges lourdes » (R4541-3, n° 2 de Cowork) est RETIRÉE (choix de Tristan du
// 11/10/2026) : elle faisait doublon avec `manutention-meca` de la banque, et le geste « poser » ne dit pas quelle palette.
// - `verifie-avant-poser` : à la première palette posée (`entrepot:fb-ent65-masse:poser`), RÉFLEXION, corrigée au bilan (le retour
//   donnerait les critères de rangement avant « Valider »).
// - `futs-p3` : à la saisie des fûts entrés de P3 (`fiche:entree-stock:P3-futs`), NOTÉE 1,5, corrigée au bilan (sinon elle corrige
//   le jalon 9 avant l'envoi).
// - `lot-tracabilite` : au choix du lot de P1 (`fiche:entree-stock:P1-lot`), NOTÉE 1,5, corrigée tout de suite (le lot n'est pas noté :
//   rien n'est soufflé). Éco-droit appliqué : règlement (CE) 178/2002, article 18, cité dans l'énoncé.
//
// AVANT DE COMMENCER : une banque de 10 questions NON notées, 5 tirées par élève : `{ preparation: 2, droit: 2, image: 1 }`, la
// calculette du site. Aucune question sur un couloir, un lot devant un autre ou la hauteur de gerbage (règles et jalons), ni sur
// « ce qui est vraiment entré » face au BL (pièges de P2 et P3). `lot-ancien` et `stock-apres` sont à VALEURS TIRÉES (jamais celles de la
// séance) ; `stock-apres` frôle l'étape 3 (même calcul, d'autres nombres : gardé par Tristan). `cle: true` = à reprendre en évaluation.
//
// TEXTES (relus le 11/10/2026) : Code du travail R4541-3, L4122-1, L4121-1 sur code.travail.gouv.fr ; règlements 178/2002 (art. 18) et
// 1169/2011 (art. 2 et annexe X) sur EUR-Lex (versions consolidées). À relire sur Légifrance avant ouverture aux élèves.

import { apresGeste } from '../../core/declencheurs.js';
import { EQUIPE } from '../france-boissons.js';

const IMG = './contenus/images/france-boissons/';
// Deux nombres différents de [a, b], hors de ceux de la séance.
const tirerHors = (h, a, b, exclus) => { let x; do { x = h.entier(a, b); } while (exclus.includes(x)); return x; };

// « Deux lots de la même bière : S{a} et S{b}. Lequel est le plus ancien ? » (a, b de 10 à 30, jamais 18, 19, 20, 24, différents).
const varianteLot = (h) => {
  const exclus = [18, 19, 20, 24];
  const a = tirerHors(h, 10, 30, exclus), b = tirerHors(h, 10, 30, exclus.concat(a));
  const vieux = Math.min(a, b), jeune = Math.max(a, b);
  return { enonce: `Deux lots de la même bière : S${a} et S${b}. Lequel est le plus ancien ?`,
    libs: { ancien: `S${vieux}`, recent: `S${jeune}`, meme: 'Ils ont le même âge' } };
};
// « Il y avait s fûts en stock ; il en entre e. Combien après ? » (s de 10 à 40, e de 3 à 9, jamais les couples de la séance).
const varianteStock = (h) => {
  const seance = ['16+8', '24+8', '2+7', '24+7'];
  let s, e;
  // s ≠ 2 × e : sinon le piège « s − e » vaut le piège « e » (deux choix identiques).
  do { s = h.entier(10, 40); e = h.entier(3, 9); } while (seance.includes(`${s}+${e}`) || s === 2 * e);
  return { enonce: `Il y avait ${s} fûts en stock ; il en entre ${e}. Combien y en a-t-il après ?`,
    libs: { somme: `${s + e} fûts`, difference: `${s - e} fûts`, entree: `${e} fûts` } };
};

export const QUESTIONS = {
  id: 'france-boissons-rangement',
  part: 3,
  personnes: { nadia: EQUIPE.nadia, thomas: EQUIPE.thomas },
  ouverture: { id: 'avant-de-commencer', de: 'nadia', titre: 'Avant de commencer', continuer: 'voir l’accueil',
    situation: 'Re-bonjour ! Tout à l’heure, on range les palettes de Mons. Avant, lis les documents à gauche et réponds à mes questions.',
    calculette: true,
    documents: ['mots',
      { id: 'photos', court: 'Photos et dessins', titre: 'Racks, chariot frontal, palette de rétention', type: 'images', images: [
        { src: IMG + 'entrepot-racks.jpg', alt: 'Un grand entrepôt : des palettes rangées dans des racks sur plusieurs étages',
          credit: 'Photo : AFINIS Group, Unsplash' },
        { src: IMG + 'materiel-chariot-frontal.svg', alt: 'Un engin à fourches qui pose une palette sur une autre palette',
          credit: 'Dessin — document pédagogique', large: true },
        { src: IMG + 'materiel-palette-retention.svg', alt: 'Une palette noire avec une grille, huit fûts dessus ; un fût fuit dans le bac',
          credit: 'Dessin — document pédagogique', large: true }] },
      'droit'],
    tirage: { preparation: 2, droit: 2, image: 1 },
    questions: ['masse-cest-quoi', 'gerber', 'lot-ancien', 'stock-apres',
      'ddm-biere', 'manutention-meca', 'securite-collegue', 'sol-glissant',
      'palette-retention', 'racks-ou-sol'] },
  liste: [
    // ── préparation (4 : l'élève en reçoit 2)
    { id: 'masse-cest-quoi', type: 'ouverture', de: 'nadia', doc: 'mots', rubrique: 'preparation',
      enonce: 'En stockage de masse, les palettes pleines sont…',
      aide: 'Regarde « Mots de la zone de masse » à gauche, puis le mot [[stockage de masse]] dans le lexique.',
      choix: [{ v: 'sol', lib: 'Posées au sol, les unes sur les autres, sans racks' },
        { v: 'racks', lib: 'Rangées dans des racks à plusieurs étages' },
        { v: 'camion', lib: 'Laissées dans le camion' }],
      juste: 'sol',
      retour: 'Pas de rack pour les fûts pleins : on pose au sol et on gerbe.' },
    { id: 'gerber', type: 'ouverture', de: 'nadia', doc: 'photos', rubrique: 'preparation',
      enonce: 'Gerber une palette, c’est…',
      aide: 'Regarde le dessin du chariot à gauche, puis le mot [[gerber]] dans le lexique.',
      choix: [{ v: 'poser-dessus', lib: 'La poser sur une autre palette' },
        { v: 'filmer', lib: 'La filmer' },
        { v: 'peser', lib: 'La peser' }],
      juste: 'poser-dessus',
      retour: 'On ne gerbe pas sans limite : la hauteur dépend du poids.' },
    { id: 'lot-ancien', type: 'ouverture', de: 'nadia', doc: 'mots', rubrique: 'preparation', variante: varianteLot,
      enonce: 'Deux lots de la même bière : S12 et S27. Lequel est le plus ancien ?',
      aide: 'Regarde « Mots de la zone de masse » : que veut dire le numéro d’un lot ?',
      choix: [{ v: 'ancien', lib: 'S12' }, { v: 'recent', lib: 'S27' }, { v: 'meme', lib: 'Ils ont le même âge' }],
      juste: 'ancien',
      retour: 'Le numéro, c’est la semaine de fabrication : plus il est petit, plus le lot est ancien.' },
    { id: 'stock-apres', type: 'ouverture', de: 'nadia', doc: 'mots', rubrique: 'preparation', variante: varianteStock,
      enonce: 'Il y avait 30 fûts en stock ; il en entre 5. Combien y en a-t-il après ?',
      aide: 'Regarde « Mots de la zone de masse » : comment met-on un stock à jour ? La calculette du site est là pour toi.',
      choix: [{ v: 'somme', lib: '35 fûts' }, { v: 'difference', lib: '25 fûts' }, { v: 'entree', lib: '5 fûts' }],
      juste: 'somme',
      retour: 'Stock après = stock avant + ce qui est vraiment entré.' },
    // ── droit (4 : l'élève en reçoit 2)
    { id: 'ddm-biere', type: 'ouverture', de: 'nadia', doc: 'droit', rubrique: 'droit',
      enonce: 'Une bière à 5 % d’alcool porte une date « à consommer de préférence avant ». Pourquoi fait-on partir d’abord le lot le plus ancien ?',
      aide: 'Lis le règlement 1169/2011 dans « Le droit » : jusqu’à quand la bière garde-t-elle ses propriétés ?',
      choix: [{ v: 'avant-date', lib: 'Pour qu’il parte chez le client avant cette date' },
        { v: 'un-mois', lib: 'La loi interdit de garder une bière plus d’un mois' },
        { v: 'leger', lib: 'Les vieux fûts sont plus légers' }],
      juste: 'avant-date',
      retour: 'La bière garde son goût jusqu’à cette date : on fait partir l’ancien d’abord.' },
    { id: 'manutention-meca', type: 'ouverture', de: 'nadia', doc: 'droit', rubrique: 'droit', cle: true,
      enonce: 'Une palette de 8 fûts de 30 L pèse environ 350 kg. Comment l’employeur doit-il la faire déplacer ?',
      aide: 'Lis l’article R4541-3 dans « Le droit » : quels moyens l’employeur doit-il utiliser ?',
      choix: [{ v: 'mecanique', lib: 'Avec un équipement mécanique : la loi demande d’éviter de porter les charges à la main' },
        { v: 'deux', lib: 'À deux salariés, à la main' },
        { v: 'fut-par-fut', lib: 'Fût par fût, à la main' }],
      juste: 'mecanique',
      retour: 'D’où le chariot frontal, et plus tard le portique à fûts.' },
    { id: 'securite-collegue', type: 'ouverture', de: 'nadia', doc: 'droit', rubrique: 'droit', cle: true,
      enonce: 'Un collègue passe sous une palette levée par le chariot. Est-ce ton affaire ?',
      aide: 'Lis l’article L4122-1 dans « Le droit » : de la sécurité de qui chaque travailleur prend-il soin ?',
      choix: [{ v: 'oui', lib: 'Oui : chaque salarié veille à sa sécurité et à celle des autres' },
        { v: 'chef', lib: 'Non, c’est le rôle du chef' },
        { v: 'equipe', lib: 'Non, s’il n’est pas de mon équipe' }],
      juste: 'oui',
      retour: 'Tu le préviens, tu préviens Nadia. La sécurité, c’est aussi celle des autres.' },
    { id: 'sol-glissant', type: 'ouverture', de: 'nadia', doc: 'droit', rubrique: 'droit',
      enonce: 'Une fuite de bière rend le sol glissant. Qui doit prévoir les moyens pour éviter les chutes ?',
      aide: 'Lis l’article L4121-1 dans « Le droit » : qui prend les mesures nécessaires ?',
      choix: [{ v: 'employeur', lib: 'L’employeur : c’est son obligation de sécurité' },
        { v: 'client', lib: 'Le client qui a commandé la bière' },
        { v: 'personne', lib: 'Personne : c’est un accident' }],
      juste: 'employeur',
      retour: 'La palette de rétention, le nettoyage, le marquage au sol : ce sont des mesures de prévention.' },
    // ── image (2 : l'élève en reçoit 1)
    { id: 'palette-retention', type: 'ouverture', de: 'nadia', doc: 'photos', rubrique: 'image',
      enonce: 'Pourquoi les fûts sont-ils posés sur cette palette noire, avec une grille ?',
      aide: 'Regarde le dessin de la palette noire à gauche, puis le mot [[palette de rétention]] dans le lexique.',
      choix: [{ v: 'bac', lib: 'Si un fût fuit, la bière coule dans le bac et pas sur le sol' },
        { v: 'frais', lib: 'Pour garder les fûts au frais' },
        { v: 'plus-haut', lib: 'Pour pouvoir les empiler plus haut' }],
      juste: 'bac',
      retour: 'Un sol mouillé, c’est une chute. Ici, c’est un choix de l’exercice.' },
    { id: 'racks-ou-sol', type: 'ouverture', de: 'nadia', doc: 'photos', rubrique: 'image',
      enonce: 'Sur la photo, les palettes sont dans des racks. À Buchelay, où sont les palettes de fûts pleins ?',
      aide: 'Regarde la photo à gauche, puis relis le message de Nadia : « la réserve n’est pas dans des racks ».',
      choix: [{ v: 'sol', lib: 'Au sol, en stockage de masse' },
        { v: 'racks', lib: 'Dans des racks, comme sur la photo' },
        { v: 'dehors', lib: 'Dehors, devant les quais' }],
      juste: 'sol',
      retour: 'Les racks servent ailleurs ; les fûts pleins sont au sol.' },
    // ── au fil du travail
    { id: 'verifie-avant-poser', type: 'fil', de: 'nadia', quand: apresGeste('entrepot:fb-ent65-masse:poser'), reflexion: true, apres: 'bilan',
      enonce: 'Tu viens de poser ta première palette. Qu’as-tu vérifié avant de choisir sa place ?',
      choix: [{ v: 'reference', lib: 'La référence du couloir' },
        { v: 'lot', lib: 'Le lot' },
        { v: 'hauteur', lib: 'La hauteur de la pile' },
        { v: 'rien', lib: 'Rien de spécial' }],
      retour: 'Les trois comptent à chaque palette : même référence, même lot, pas trop haut, et le couloir se remplit par le fond.' },
    { id: 'futs-p3', type: 'fil', de: 'nadia', quand: apresGeste('fiche:entree-stock:P3-futs'), apres: 'bilan',
      enonce: 'Tu as noté les fûts entrés pour la palette P3. D’où vient ce nombre ?',
      choix: [{ v: 'vraiment', lib: 'Des fûts vraiment arrivés en stock, ceux qui sont sur la palette' },
        { v: 'bl', lib: 'Du BL' },
        { v: 'pleine', lib: 'D’une palette pleine : 8 fûts' }],
      juste: 'vraiment', poids: 1.5, groupe: 'Question de Nadia : les fûts entrés',
      retour: 'Le fût qui fuit est en zone litiges : il n’entre pas en stock. On saisit ce qui est vraiment là, pas ce que dit le papier.' },
    { id: 'lot-tracabilite', type: 'fil', de: 'thomas', quand: apresGeste('fiche:entree-stock:P1-lot'),
      enonce: 'Tu as noté le lot de la palette P1. À quoi servira ce numéro ? (Règlement (CE) 178/2002, article 18 : les entreprises du secteur alimentaire « doivent être en mesure d’identifier toute personne leur ayant fourni une denrée alimentaire » et « disposent de systèmes et de procédures permettant d’identifier les entreprises auxquelles leurs produits ont été fournis ».)',
      choix: [{ v: 'tracer', lib: 'À faire partir le plus ancien d’abord, et à retrouver les fûts si la brasserie les rappelle' },
        { v: 'prix', lib: 'À calculer le prix' },
        { v: 'rien', lib: 'À rien : c’est pour la brasserie' }],
      juste: 'tracer', poids: 1.5, groupe: 'Question de Thomas : à quoi sert le lot',
      retour: 'Le lot, c’est la traçabilité : si un lot pose problème, on sait où sont ses fûts et chez quels clients ils sont partis.' },
  ],
};
