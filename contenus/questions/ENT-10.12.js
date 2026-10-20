// Les questions d'ENT-10.12 — Transports Pelleau, évaluation « contrôler la réception » (brief `docs/briefs/ENT-10.12-pelleau-evaluation-controle.md`, §4 et §5 ;
// choix de Cowork sur délégation du 18/10/2026, à relire à l'écran par Tristan). Modifier ce fichier suffit : voir « Modifier les questions d'une séance » dans
// `activites/FICHE-SEANCE.md`. Personne CONSTRUITE : Erwan (responsable de l'entrepôt, tuteur).
//
// ÉVALUATION : AUCUNE question au fil (brief §4). Seul l'écran « Avant de commencer » est NOTÉ (`part: 4`) : 9 questions, l'élève en reçoit 4
// (`tirage: { preparation: 3, image: 1 }`) ; aucune aide, aucun mot cliquable, « Je ne sais pas » ajouté par le moteur ; juste +1, « Je ne sais pas » 0, fausse
// −1 ÷ (nombre de mauvaises réponses), plancher 0 ; « Réponse enregistrée. » sans correction. Les `retour` (jamais montrés en évaluation, lus par l'enseignant)
// sont ceux d'ENT-10.9 à 10.11.
//
// LA BANQUE : les questions ★ (`cle: true`) d'ENT-10.9 à 10.11 que le brief nomme — `reserve`, `avarie`, `couches` (valeurs TIRÉES), `depot`, `ambiant`, `img-sac` —
// plus `manquant`, `zone-litiges` et `img-carton-ecrase` : le moteur demande au moins le DOUBLE de ce qu'on tire dans chaque rubrique (6 de préparation pour 3, 2
// d'images pour 1). Même identifiants qu'ENT-10.11 (une réponse rangée là n'est pas lue ici : `db.questions` est cloisonné par séance). ÉCARTÉES : `conservation`
// et `img-thermometre` (« Conserver entre 4 et 8 °C » veut dire… : en évaluation, elles diraient la décision de la palette de Kervéguen) et `entrepot-froid`.
// `couches` : c et k TIRÉS (c de 3 à 6, k de 4 à 10), jamais les dimensions d'une palette de la séance (5 × 8, 4 × 10, 4 × 8).
//
// Ce fichier importe les DONNÉES de la séance (`contenus/pelleau-ent112-donnees.js`), jamais le contenu (`contenus/pelleau-ent112.js` l'importe).

import { EQUIPE, PALETTE_AR_VAG, PALETTE_AGRI, PALETTE_KERVEGUEN } from '../pelleau.js';
import { ID } from '../pelleau-ent112-donnees.js';

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
  ouverture: { id: 'avant-de-commencer', de: 'erwan', part: 4, titre: 'Avant de commencer', continuer: 'voir l’accueil',
    situation: 'Bonjour ! Les palettes de la ramasse de ce matin sont triées. Avant de les contrôler, réponds à mes questions, sans aide.',
    documents: ['matinee-112', 'feuille-entete-112', 'palette-pleine-112', 'droit-depot', 'pelleau-112', 'sac-perce-112', 'carton-ecrase-112',
      { id: 'photo-litiges-112', court: 'La zone litiges', titre: 'Une zone litiges', type: 'images', images: [LITIGES] }],
    tirage: { preparation: 3, image: 1 },
    questions: ['reserve', 'avarie', 'manquant', 'couches', 'depot', 'zone-litiges', 'ambiant', 'img-sac', 'img-carton-ecrase'] },
  liste: [
    // ── préparation (7 : l'élève en reçoit 3)
    { id: 'reserve', type: 'ouverture', de: 'erwan', doc: 'feuille-entete-112', rubrique: 'preparation', cle: true,
      enonce: 'Une réserve, c’est…',
      choix: [{ v: 'remarque', lib: 'une remarque écrite sur le document, qui dit ce qui ne va pas' }, { v: 'secours', lib: 'une palette de secours' },
        { v: 'stock', lib: 'un carton en stock' }],
      juste: 'remarque',
      retour: 'Une réserve s’écrit sur le document : ce qui ne va pas, sur quelle palette, combien.' },
    { id: 'avarie', type: 'ouverture', de: 'erwan', doc: 'matinee-112', rubrique: 'preparation', cle: true,
      enonce: 'Une avarie, c’est…',
      choix: [{ v: 'abimee', lib: 'une marchandise abîmée' }, { v: 'retard', lib: 'une marchandise en retard' }, { v: 'prix', lib: 'une erreur de prix' }],
      juste: 'abimee',
      retour: 'Une avarie : la marchandise est abîmée (un carton écrasé, un sac percé…).' },
    { id: 'manquant', type: 'ouverture', de: 'erwan', doc: 'matinee-112', rubrique: 'preparation',
      enonce: 'Un manquant, c’est…',
      choix: [{ v: 'absent', lib: 'un colis prévu sur le document mais qui n’est pas là' }, { v: 'abime', lib: 'un colis abîmé' },
        { v: 'trop', lib: 'un colis en trop' }],
      juste: 'absent',
      retour: 'Un manquant : le document l’annonce, mais il n’est pas sur la palette.' },
    { id: 'couches', type: 'ouverture', de: 'erwan', doc: 'palette-pleine-112', rubrique: 'preparation', cle: true, variante: varianteCouches,
      enonce: 'Une palette pleine de 3 couches de 7 colis contient…',
      choix: [{ v: 'juste', lib: '21 colis' }, { v: 'somme', lib: '10 colis' }, { v: 'moins', lib: '14 colis' }],
      juste: 'juste',
      retour: '3 couches × 7 colis = 21 colis. Pleine : toutes les couches ont le même nombre de colis.' },
    { id: 'depot', type: 'ouverture', de: 'erwan', doc: 'droit-depot', rubrique: 'preparation', cle: true,
      enonce: 'Quand Pelleau garde la marchandise d’un client, il doit…',
      choix: [{ v: 'rendre', lib: 'la lui rendre telle qu’il l’a reçue' }, { v: 'revendre', lib: 'la revendre' },
        { v: 'melanger', lib: 'la mélanger avec d’autres' }],
      juste: 'rendre',
      retour: 'Il rend la même marchandise, telle qu’il l’a reçue. D’où le contrôle dès l’arrivée : on sait dans quel état elle est entrée.' },
    { id: 'zone-litiges', type: 'ouverture', de: 'erwan', doc: 'photo-litiges-112', rubrique: 'preparation',
      enonce: 'La zone litiges sert à…',
      choix: [{ v: 'cote', lib: 'mettre de côté ce qui pose problème' }, { v: 'vides', lib: 'jeter les cartons vides' }, { v: 'epi', lib: 'ranger les EPI' }],
      juste: 'cote',
      retour: 'En zone litiges, on met de côté ce qui pose problème, le temps de décider avec le client.' },
    // D'ENT-10.1 (★) : l'entrepôt de Gouesnou est ambiant seulement (site Pelleau).
    { id: 'ambiant', type: 'ouverture', de: 'erwan', doc: 'pelleau-112', rubrique: 'preparation', cle: true,
      enonce: 'Un stockage « ambiant », c’est…',
      choix: [{ v: 'sans-froid', lib: 'sans froid : à la température de l’entrepôt' }, { v: 'congelateur', lib: 'au congélateur' },
        { v: 'parking', lib: 'dehors, sur le parking' }],
      juste: 'sans-froid',
      retour: 'L’entrepôt de Gouesnou n’a pas de froid : on n’y garde que ce qui supporte la température de l’entrepôt.' },
    // ── images (2 : l'élève en reçoit 1)
    { id: 'img-sac', type: 'ouverture', de: 'erwan', doc: 'sac-perce-112', rubrique: 'image', cle: true,
      enonce: 'Ce sac est…',
      choix: [{ v: 'perce', lib: 'percé : le terreau s’en échappe' }, { v: 'neuf', lib: 'neuf' }, { v: 'ferme', lib: 'fermé' }],
      juste: 'perce',
      retour: 'Il est percé : le terreau s’en va. C’est une avarie : on la note, on ne range pas ce sac avec les autres.' },
    { id: 'img-carton-ecrase', type: 'ouverture', de: 'erwan', doc: 'carton-ecrase-112', rubrique: 'image',
      enonce: 'Ce carton est…',
      choix: [{ v: 'ecrase', lib: 'écrasé : ce qu’il y a dedans est peut-être abîmé' }, { v: 'neuf', lib: 'neuf' }, { v: 'vide', lib: 'vide' }],
      juste: 'ecrase',
      retour: 'Il est écrasé : les biscuits dedans sont peut-être cassés. On le note.' },
  ],
};
