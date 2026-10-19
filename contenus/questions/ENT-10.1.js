// Les questions d'ENT-10.1 — Transports Pelleau, de Plabennec à l'entrepôt neuf (brief `docs/briefs/ENT-10.1-pelleau-se-situer.md`, §4 bis et
// §4 ter ; choix de Cowork sur délégation du 18/10/2026, à relire à l'écran par Tristan). Modifier ce fichier suffit : voir « Modifier les
// questions d'une séance » dans `activites/FICHE-SEANCE.md`. Erwan et ses phrases sont CONSTRUITS ; formulations de Cowork écrites telles quelles.
//
// QUESTIONS NOTÉES (`part: 4`, une seule ligne au bandeau de fin, « Les questions d'Erwan ») :
// - `rungis` (A) : à la fin de l'étape « département » de Rungis sur la carte (`localiser:rungis:departement`), poids 1, corrigée tout de suite.
// - `pourquoi-stocker` (B) : à l'envoi de « Ce que fait Pelleau » (`fiche:metiers:envoyer`), poids 1,5, corrigée tout de suite.
// - `qui-paie-garde` (D) : au premier choix de la 1re ligne de « Ce que je change » (`fiche:changer:situation-1`), poids 1,5, corrigée AU BILAN
//   (proche du jalon « ce que je change »). Éco-droit appliqué au cas : Code civil 1927, 1928, 1932, document « Le droit » joint au message
//   de l'étape 5 et montré à gauche de la fiche.
// QUESTION NON NOTÉE :
// - `fierte` (C) : réflexion, à l'envoi de « Ce que je change » (`fiche:changer:envoyer`).
//
// AVANT DE COMMENCER (§4 ter) : 9 questions NON notées, 4 tirées par élève (`tirage: { preparation: 3, image: 1 }` : 6 notions ≥ 2 × 3,
// 3 images ≥ 2 × 1). `cle: true` = question clé, à reprendre dans l'ouverture notée d'ENT-10.4. Écartées (brief) : `holding` et `germicopa`
// (elles donneraient des étapes de la frise).
// ÉCART AVEC LE BRIEF : le site de Pelleau n'a pas de photo de porteur ni de porte-voitures isolés. `img-racks` et `img-semi` (à la place de
// `img-porteur`) montrent deux photos de Pelleau (`contenus/images/pelleau/`, récupérées avec l'accord de Tristan le 19/10/2026) ; `img-chariot`
// (à la place de `img-porte-voitures`) garde la photo d'un chariot d'Action, déjà au dépôt. Les ids `img-porteur` et `img-porte-voitures`
// restent libres.

import { EQUIPE, PHOTOS } from '../pelleau.js';
import { apresGeste } from '../../core/declencheurs.js';

const GROUPE = 'Les questions d’Erwan';

const img = (id, photo, court) => ({ id, court, titre: court, type: 'images',
  images: [{ src: PHOTOS[photo].src, alt: PHOTOS[photo].alt, credit: PHOTOS[photo].mention, large: true }] });

export const QUESTIONS = {
  id: 'pelleau-se-situer',
  part: 4,
  personnes: { erwan: EQUIPE.erwan },
  ouverture: { id: 'avant-de-commencer', de: 'erwan', titre: 'Avant de commencer', continuer: 'voir l’accueil',
    situation: 'Bonjour, et bienvenue chez Pelleau ! Avant ton premier matin, lis le document à gauche et réponds à mes questions.',
    documents: ['pelleau', 'equipe', img('photo-racks', 'racks', 'Une allée'), img('photo-semi', 'semi', 'Sur la route'),
      img('photo-chariot', 'chariot', 'Dans l’entrepôt')],
    tirage: { preparation: 3, image: 1 },
    questions: ['transporteur', 'entreposeur', 'ramasse', 'tuteur', 'ambiant', 'rack', 'img-racks', 'img-semi', 'img-chariot'] },
  liste: [
    // ── ouverture : préparation (6 : l'élève en reçoit 3)
    { id: 'transporteur', type: 'ouverture', de: 'erwan', doc: 'pelleau', rubrique: 'preparation', cle: true,
      enonce: 'Un transporteur…',
      aide: 'Le mot [[transporteur]] est expliqué.',
      choix: [{ v: 'deplace', lib: 'déplace la marchandise d’un lieu à un autre' }, { v: 'fabrique', lib: 'fabrique la marchandise' },
        { v: 'vend', lib: 'vend en magasin' }],
      juste: 'deplace',
      retour: 'C’est le premier métier de Pelleau : ses camions emmènent la marchandise de ses clients.' },
    { id: 'entreposeur', type: 'ouverture', de: 'erwan', doc: 'pelleau', rubrique: 'preparation', cle: true,
      enonce: 'Un entreposeur…',
      aide: 'Le mot [[entreposeur]] est expliqué.',
      choix: [{ v: 'garde', lib: 'garde la marchandise de ses clients dans son entrepôt' }, { v: 'transporte', lib: 'la transporte jusqu’au client' },
        { v: 'fabrique', lib: 'la fabrique' }],
      juste: 'garde',
      retour: 'C’est le nouveau métier de Pelleau, depuis l’entrepôt de Gouesnou.' },
    { id: 'ramasse', type: 'ouverture', de: 'erwan', doc: 'pelleau', rubrique: 'preparation', cle: true,
      enonce: 'Une ramasse, c’est…',
      aide: 'Le mot [[ramasse]] est expliqué.',
      choix: [{ v: 'tournee', lib: 'une tournée pour aller chercher la marchandise chez les expéditeurs' },
        { v: 'livraison', lib: 'une livraison au magasin' }, { v: 'inventaire', lib: 'un inventaire' }],
      juste: 'tournee',
      retour: 'Chaque matin, Loïc fait sa ramasse chez les producteurs.' },
    { id: 'tuteur', type: 'ouverture', de: 'erwan', doc: 'equipe', rubrique: 'preparation',
      enonce: 'Pendant ton stage, ton tuteur…',
      aide: 'Le mot [[tuteur]] est expliqué.',
      choix: [{ v: 'suit', lib: 't’accueille, te donne les consignes et suit ton travail' }, { v: 'paie', lib: 'te paie' },
        { v: 'fait', lib: 'fait ton travail à ta place' }],
      juste: 'suit',
      retour: 'Ici, ton tuteur, c’est moi.' },
    { id: 'ambiant', type: 'ouverture', de: 'erwan', doc: 'pelleau', rubrique: 'preparation', cle: true,
      enonce: 'Un stockage « ambiant », c’est…',
      aide: 'Le mot [[stock ambiant]] est expliqué.',
      choix: [{ v: 'sans-froid', lib: 'sans froid : à la température de l’entrepôt' }, { v: 'congelateur', lib: 'au congélateur' },
        { v: 'parking', lib: 'dehors, sur le parking' }],
      juste: 'sans-froid',
      retour: 'L’entrepôt de Gouesnou n’a pas de froid : on n’y garde que ce qui supporte la température de l’entrepôt.' },
    { id: 'rack', type: 'ouverture', de: 'erwan', doc: 'photo-racks', rubrique: 'preparation',
      enonce: 'Un rack, c’est…',
      aide: 'Regarde la photo. Le mot [[rack]] est expliqué.',
      choix: [{ v: 'rayonnage', lib: 'un rayonnage où l’on range les palettes en hauteur' }, { v: 'camion', lib: 'un camion' },
        { v: 'document', lib: 'un document du chauffeur' }],
      juste: 'rayonnage',
      retour: 'Chaque palette a sa place dans le rack : c’est comme ça qu’on la retrouve.' },
    // ── ouverture : images (3 : l'élève en reçoit 1)
    { id: 'img-racks', type: 'ouverture', de: 'erwan', doc: 'photo-racks', rubrique: 'image', cle: true,
      enonce: 'Ici, on…',
      choix: [{ v: 'stocke', lib: 'stocke des palettes en hauteur' }, { v: 'gare', lib: 'gare les camions' },
        { v: 'charge', lib: 'charge les batteries' }],
      juste: 'stocke',
      retour: 'Des racks : chez nous, deux allées comme celle-ci.' },
    { id: 'img-semi', type: 'ouverture', de: 'erwan', doc: 'photo-semi', rubrique: 'image',
      enonce: 'Comment s’appelle ce camion ?',
      choix: [{ v: 'semi', lib: 'Une semi-remorque : un tracteur tire une remorque' }, { v: 'porte-voitures', lib: 'Un porte-voitures' },
        { v: 'tracteur', lib: 'Un tracteur agricole' }],
      juste: 'semi',
      retour: 'Une semi-remorque. Chez Pelleau, il y a aussi des porteurs et des porte-voitures.' },
    { id: 'img-chariot', type: 'ouverture', de: 'erwan', doc: 'photo-chariot', rubrique: 'image',
      enonce: 'Comment s’appelle cet engin ?',
      choix: [{ v: 'chariot', lib: 'Un chariot élévateur' }, { v: 'transpalette', lib: 'Un transpalette' },
        { v: 'tracteur', lib: 'Un tracteur agricole' }],
      juste: 'chariot',
      retour: 'Un chariot élévateur : il monte les palettes en haut des racks. Ici, c’est Yann qui le conduit.' },
    // ── au fil du travail
    { id: 'rungis', type: 'fil', de: 'erwan', quand: apresGeste('localiser:rungis:departement'), poids: 1, groupe: GROUPE,
      enonce: 'Rungis est à près de 600 km. Un camion parti de Gouesnou à 22 h arrive vers…',
      choix: [{ v: '6h', lib: '6 h du matin, le lendemain' }, { v: '22h30', lib: '22 h 30, le même soir' },
        { v: 'midi', lib: 'midi, deux jours plus tard' }],
      juste: '6h',
      retour: 'Vers 6 h : on roule de nuit pour que les primeurs soient à Rungis au matin.' },
    { id: 'pourquoi-stocker', type: 'fil', de: 'erwan', quand: apresGeste('fiche:metiers:envoyer'), poids: 1.5, groupe: GROUPE,
      enonce: 'Pourquoi un transporteur se met-il aussi à stocker ?',
      choix: [{ v: 'garder', lib: 'Pour garder ses clients : il transporte et il garde leur marchandise' },
        { v: 'vendre', lib: 'Pour vendre des biscuits' }, { v: 'loi', lib: 'Parce que la loi l’oblige' }],
      juste: 'garder',
      retour: 'Un client qui nous confie son transport peut aussi nous confier son stock : on travaille plus pour lui, et il reste chez nous.' },
    { id: 'qui-paie-garde', type: 'fil', de: 'erwan', quand: apresGeste('fiche:changer:situation-1'), apres: 'bilan', poids: 1.5, groupe: GROUPE,
      enonce: 'La Biscuiterie Ar Vag laisse ses palettes chez nous et paie pour ça. Si une palette est abîmée dans nos racks, qui doit en répondre ?',
      choix: [{ v: 'pelleau', lib: 'Pelleau, qui la garde' }, { v: 'client', lib: 'La Biscuiterie' }, { v: 'personne', lib: 'Personne' },
        { v: 'loic', lib: 'Loïc, le conducteur' }],
      juste: 'pelleau',
      retour: 'Pelleau : quand on garde la marchandise d’un client, on doit en prendre soin et la lui rendre telle qu’on l’a reçue. C’est pour ça qu’on contrôle tout à l’arrivée.' },
    { id: 'fierte', type: 'fil', de: 'erwan', quand: apresGeste('fiche:changer:envoyer'), reflexion: true,
      enonce: 'Dans un entrepôt qui ouvre, qu’est-ce qui compte le plus pour toi ?',
      choix: [{ v: 'gestes', lib: 'Apprendre les bons gestes dès le début' }, { v: 'confiance', lib: 'Que les clients aient confiance' },
        { v: 'securite', lib: 'Travailler en sécurité' }, { v: 'pas-pense', lib: 'Je n’y avais pas pensé' }],
      retour: 'Les trois. Les habitudes du premier mois restent.' },
  ],
};
