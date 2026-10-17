// Les questions d'ENT-8.8 — Action, on vérifie qu'il ne manque rien (brief `docs/briefs/ENT-8.8-action-controler.md` §4 bis et §4 ter, tranchés
// par Cowork sur délégation de Tristan le 16/10/2026, 19 h 02). Modifier ce fichier suffit : voir « Modifier les questions d'une séance » dans
// `activites/FICHE-SEANCE.md`. Personne CONSTRUITE : Samia, cheffe d'équipe à la réception (la tutrice).
//
// AU FIL (`part: 4`, une ligne au bandeau : « Les questions de Samia ») :
// - `trois-jours` (Q1, 1,5 point, tout de suite) : à la clôture du quai (geste `quai:action-quai2-controler:cloturer`). Éco-droit appliqué au cas :
//   C. com. L133-3, 1er alinéa (document « Le droit », joint au message de Samia de l'étape 1). Énoncé CALCULÉ sur le tirage de l'élève : la
//   palette du carton ouvert demain est P2 (texte de Cowork) quand l'élève l'a acceptée sans réserve, sinon sa palette conforme (adaptation :
//   « P2, acceptée sans réserve » serait faux chez un élève dont P2 avait un problème).
// - `pourquoi-signer` (Q2, 1,5 point, AU BILAN) : à la première palette validée (geste `quai:…:valider`) ; corrigée au bilan, sinon elle dirait
//   d'avance qu'il faut faire signer (jalon `signature`).
// - `qui-saisit` (Q3, 1 point, tout de suite) : au premier choix de la ligne « fin » du compte rendu (`messagerie:phrase:fin`).
// - `pourquoi-litiges` (Q4, réflexion, tout de suite) : à l'envoi du compte rendu (le message est parti : elle ne touche aucun jalon).
//
// AVANT DE COMMENCER : banque de 10 notions NON notées, 4 tirées par élève (3 de préparation, 1 image). `couches` : c et k TIRÉS (c de 3 à 6,
// k de 4 à 10), jamais les dimensions d'une palette du camion. Images : dessins en traits dans les documents de la séance (carton écrasé,
// étiquette : aucune image nouvelle), photo « palette filmée » de l'univers d'Action, dessin de la zone litiges déjà au dépôt (ENT-8.2).
//
// Ce fichier importe les DONNÉES de la séance (`contenus/action-ent88-donnees.js`), jamais le contenu (`contenus/action-ent88.js` l'importe).

import { apresGeste } from '../../core/declencheurs.js';
import { phrasesJustes } from '../../core/phrases.js';
import { EQUIPE, PHOTOS } from '../action.js';
import { ID, QUAI_ID, PHRASES_ID, PALETTES, jeuDeBase, paletteDeQ1, DOMMAGE } from '../action-ent88-donnees.js';

const GROUPE = 'Les questions de Samia';
const img = (id, court, titre, src, alt, credit) => ({ id, court, titre, type: 'images', images: [{ src, alt, credit }] });
// Les dimensions des palettes du camion (couches × cartons par couche) : jamais tirées pour la question `couches`.
const DU_CAMION = new Set(PALETTES.map((p) => `${p.couches}x${p.parCouche}`));
const varianteCouches = (h) => {
  let c, k;
  do { c = h.entier(3, 6); k = h.entier(4, 10); } while (DU_CAMION.has(`${c}x${k}`));
  return {
    enonce: `Une palette pleine de ${c} couches de ${k} cartons contient…`,
    libs: { juste: `${c * k} cartons`, somme: `${c + k} cartons`, moins: `${c * k - k} cartons` },
    retour: `${c} couches × ${k} cartons = ${c * k} cartons. Pleine : toutes les couches ont le même nombre de cartons.`,
  };
};

export const QUESTIONS = {
  id: ID,
  part: 4,
  personnes: { samia: EQUIPE.samia },
  ouverture: { id: 'avant-de-commencer', de: 'samia', titre: 'Avant de commencer', continuer: 'voir l’accueil',
    situation: 'Bonjour ! Les palettes du camion du Havre sont au sol. Avant de les contrôler, regarde les documents à gauche et réponds à mes questions.',
    documents: ['stage', 'bl-entete', 'palette-pleine', 'carton-ecrase', 'etiquette-palette',
      img('photo-film', 'Une palette', 'Une palette de la réception', PHOTOS.palette.src, PHOTOS.palette.alt, PHOTOS.palette.mention),
      img('photo-litiges', 'La zone litiges', 'Une zone litiges', './contenus/smoby/visite/visite-litiges-dessin.jpg',
        'Dessin d’une zone litiges : marquage au sol, panneau, deux emplacements, palettes bloquées', 'Dessin : ce qu’on doit voir dans une zone litiges.')],
    tirage: { preparation: 3, image: 1 },
    questions: ['reserve', 'avarie', 'manquant', 'couches', 'bl', 'lettre-voiture', 'zone-litiges', 'img-carton-ecrase', 'img-film', 'img-etiquette'] },
  liste: [
    // ── préparation (7 : l'élève en reçoit 3)
    { id: 'reserve', type: 'ouverture', de: 'samia', doc: 'stage', rubrique: 'preparation', cle: true,
      enonce: 'Une réserve, c’est…',
      aide: 'Clique sur le mot [[réserve]].',
      choix: [{ v: 'remarque', lib: 'une remarque écrite sur le document du transporteur, qui dit ce qui ne va pas' },
        { v: 'secours', lib: 'une palette de secours' }, { v: 'stock', lib: 'un carton en stock' }],
      juste: 'remarque',
      retour: 'Une réserve, c’est écrit sur le document du transporteur : ce qui ne va pas, sur quelle palette, combien.' },
    { id: 'avarie', type: 'ouverture', de: 'samia', doc: 'stage', rubrique: 'preparation', cle: true,
      enonce: 'Une avarie, c’est…',
      aide: 'Clique sur le mot [[avarie]].',
      choix: [{ v: 'abimee', lib: 'une marchandise abîmée pendant le transport' }, { v: 'retard', lib: 'une marchandise en retard' },
        { v: 'facture', lib: 'une erreur de facture' }],
      juste: 'abimee',
      retour: 'Une avarie : la marchandise a été abîmée pendant le transport (un carton écrasé, mouillé…).' },
    { id: 'manquant', type: 'ouverture', de: 'samia', doc: 'stage', rubrique: 'preparation',
      enonce: 'Un manquant, c’est…',
      aide: 'Clique sur le mot [[manquant]].',
      choix: [{ v: 'absent', lib: 'un carton prévu sur le bon de livraison mais qui n’est pas là' }, { v: 'abime', lib: 'un carton abîmé' },
        { v: 'trop', lib: 'un carton en trop' }],
      juste: 'absent',
      retour: 'Un manquant : le bon de livraison l’annonce, mais il n’est pas sur la palette.' },
    { id: 'couches', type: 'ouverture', de: 'samia', doc: 'palette-pleine', rubrique: 'preparation', cle: true, variante: varianteCouches,
      enonce: 'Une palette pleine de 3 couches de 7 cartons contient…',
      aide: 'Une couche, c’est un étage de cartons. Clique sur le mot [[couche]].',
      choix: [{ v: 'juste', lib: '21 cartons' }, { v: 'somme', lib: '10 cartons' }, { v: 'moins', lib: '14 cartons' }],
      juste: 'juste',
      retour: '3 couches × 7 cartons = 21 cartons. Pleine : toutes les couches ont le même nombre de cartons.' },
    { id: 'bl', type: 'ouverture', de: 'samia', doc: 'bl-entete', rubrique: 'preparation',
      enonce: 'Le bon de livraison dit…',
      aide: 'Regarde le document à gauche. Clique sur les mots [[bon de livraison]].',
      choix: [{ v: 'apporte', lib: 'ce que le camion apporte' }, { v: 'commande', lib: 'ce qu’Action a commandé' }, { v: 'prix', lib: 'le prix en magasin' }],
      juste: 'apporte',
      retour: 'Le bon de livraison dit ce que le camion apporte : on compare chaque palette à ce papier.' },
    { id: 'lettre-voiture', type: 'ouverture', de: 'samia', doc: 'bl-entete', rubrique: 'preparation',
      enonce: 'La lettre de voiture dit…',
      aide: 'Clique sur les mots [[lettre de voiture]].',
      choix: [{ v: 'transport', lib: 'qui transporte la marchandise, d’où à où' }, { v: 'vend', lib: 'ce que le magasin vend' },
        { v: 'range', lib: 'qui range les palettes' }],
      juste: 'transport',
      retour: 'La lettre de voiture, c’est le document du transporteur : qui transporte, d’où, jusqu’où. Les réserves s’y écrivent.' },
    { id: 'zone-litiges', type: 'ouverture', de: 'samia', doc: 'photo-litiges', rubrique: 'preparation',
      enonce: 'La zone litiges sert à…',
      aide: 'Regarde le dessin. Clique sur les mots [[zone litiges]].',
      choix: [{ v: 'cote', lib: 'mettre de côté la marchandise qui pose problème' }, { v: 'vides', lib: 'jeter les cartons vides' },
        { v: 'epi', lib: 'ranger les EPI' }],
      juste: 'cote',
      retour: 'En zone litiges, on met de côté ce qui pose problème, le temps de décider.' },
    // ── image (3 : l'élève en reçoit 1)
    { id: 'img-carton-ecrase', type: 'ouverture', de: 'samia', doc: 'carton-ecrase', rubrique: 'image',
      enonce: 'Ce carton est…',
      aide: 'Regarde le coin du carton. Clique sur le mot [[avarie]].',
      choix: [{ v: 'ecrase', lib: 'écrasé : la marchandise dedans est peut-être abîmée' }, { v: 'neuf', lib: 'neuf' }, { v: 'vide', lib: 'vide' }],
      juste: 'ecrase',
      retour: 'Il est écrasé : ce qu’il y a dedans est peut-être cassé. On le note, on ne le range pas avec les autres.' },
    { id: 'img-film', type: 'ouverture', de: 'samia', doc: 'photo-film', rubrique: 'image',
      enonce: 'Le film autour de la palette sert à…',
      aide: 'Regarde le plastique autour des cartons. Clique sur le mot [[filmer]].',
      choix: [{ v: 'tenir', lib: 'tenir les cartons ensemble pendant le transport' }, { v: 'froid', lib: 'garder les cartons au froid' },
        { v: 'cacher', lib: 'cacher l’étiquette' }],
      juste: 'tenir',
      retour: 'Le film tient les cartons ensemble : un film déchiré, c’est déjà un signe qu’il faut regarder de près.' },
    { id: 'img-etiquette', type: 'ouverture', de: 'samia', doc: 'etiquette-palette', rubrique: 'image',
      enonce: 'Cette étiquette sur la palette dit…',
      aide: 'Lis les lignes de l’étiquette.',
      choix: [{ v: 'contenu', lib: 'ce que contient la palette' }, { v: 'chauffeur', lib: 'le nom du chauffeur' }, { v: 'prix', lib: 'le prix en magasin' }],
      juste: 'contenu',
      retour: 'L’étiquette dit ce que contient la palette : on la compare à la ligne du bon de livraison.' },
    // ── au fil du travail (notées, une ligne au bandeau)
    { id: 'trois-jours', type: 'fil', de: 'samia', quand: apresGeste(`quai:${QUAI_ID}:cloturer`), poids: 1.5, groupe: GROUPE,
      enonce: 'Demain, Julie ouvre un carton d’assiettes (palette P2, acceptée sans réserve) : des assiettes sont cassées. Combien de temps a-t-on pour '
        + 'protester auprès du transporteur ? (Lis le document « Le droit », joint à mon message.)',
      selon: (db) => { const p = paletteDeQ1(jeuDeBase(db)), [de, dommage] = DOMMAGE[p.id];
        return { enonce: `Demain, Julie ouvre un carton ${de} (palette ${p.id}, acceptée sans réserve) : ${dommage}. Combien de temps a-t-on pour `
          + 'protester auprès du transporteur ? (Lis le document « Le droit », joint à mon message.)' }; },
      choix: [{ v: '3j', lib: '3 jours, sans compter les jours fériés, par lettre recommandée' }, { v: '1m', lib: '1 mois, par courriel' },
        { v: '1a', lib: '1 an' }, { v: 'rien', lib: 'plus rien n’est possible : on a signé' }],
      juste: '3j',
      retour: '3 jours, et par lettre recommandée. Après, c’est trop tard. C’est pour ça qu’on écrit des réserves précises aujourd’hui, devant le chauffeur.' },
    { id: 'pourquoi-signer', type: 'fil', de: 'samia', quand: apresGeste(`quai:${QUAI_ID}:valider`), poids: 1.5, groupe: GROUPE, apres: 'bilan',
      enonce: 'Pourquoi Marc doit-il signer sous tes réserves ?',
      choix: [{ v: 'reconnaitre', lib: 'pour reconnaître devant toi ce qui a été constaté' }, { v: 'paye', lib: 'pour être payé' },
        { v: 'partir', lib: 'pour pouvoir partir plus vite' }],
      juste: 'reconnaitre',
      retour: 'En signant, il reconnaît ce qu’on a vu ensemble. Sans sa signature, c’est notre parole contre la sienne.' },
    { id: 'qui-saisit', type: 'fil', de: 'samia', quand: apresGeste('messagerie:phrase:fin'), poids: 1, groupe: GROUPE,
      enonce: 'Ta réception, qui la saisit dans le WMS ?',
      choix: [{ v: 'julie', lib: 'Julie, l’agent administratif' }, { v: 'toi', lib: 'toi' }, { v: 'kevin', lib: 'Kevin' }, { v: 'marc', lib: 'Marc, le chauffeur' }],
      juste: 'julie',
      retour: 'Julie : elle saisit ce que tu as reçu, avec tes réserves. Le stock du WMS doit dire la vérité.' },
    { id: 'pourquoi-litiges', type: 'fil', de: 'samia', quand: (db) => phrasesJustes(db, PHRASES_ID).envoye, reflexion: true,
      enonce: 'Pourquoi les cartons abîmés vont en zone litiges, et pas en stock ?',
      choix: [{ v: 'magasin', lib: 'Pour ne pas les envoyer à un magasin' }, { v: 'voir', lib: 'Pour que le transporteur ou le fournisseur puisse les voir' },
        { v: 'stock', lib: 'Pour ne pas fausser le stock' }, { v: 'pas-pense', lib: 'Je n’y avais pas pensé' }],
      retour: 'Les trois : un carton abîmé ne part pas en magasin, il attend qu’on décide, et il ne compte pas dans le stock.' },
  ],
};
