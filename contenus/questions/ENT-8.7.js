// Les questions d'ENT-8.7 — Action, on décharge ensemble (brief `docs/briefs/ENT-8.7-action-decharger.md` §4 bis et §4 ter : M, L, N, P tranchés
// par Tristan le 16/10/2026 à 18 h 50 ; banque « Avant de commencer » validée à 18 h 51). Modifier ce fichier suffit : voir « Modifier les
// questions d'une séance » dans `activites/FICHE-SEANCE.md`. Personnes CONSTRUITES : Samia (cheffe d'équipe, la tutrice), Kevin (cariste).
//
// AU FIL (`part: 4`, une ligne au bandeau : « Les questions de Samia »), toutes corrigées tout de suite :
// - `qui-ecrit` (M, 1,5 point) : à l'envoi de la fiche du protocole. Droit appliqué au cas : C. trav. R4515-4 et R4515-8 (document « Le droit », à
//   gauche de la fiche : il reste lisible pendant la question).
// - `pourquoi-local` (L, réflexion, non notée) : juste après M, au même geste.
// - `decharge-quand-meme` (N, 1,5 point) : au premier signalement envoyé sur la scène du quai (`scene:<quai>:signaler`) ; posée par KEVIN.
// - `peut-partir` (P, 1 point) : quand la dernière palette est posée (`quai:<quai>:dechargement`, geste du lot 1).
//
// AVANT DE COMMENCER : banque de 10 notions NON notées, 4 tirées par élève (3 de préparation, 1 image). `img-cale` et `img-feux` : dessins en
// traits CONSTRUITS par Claude Code (documents de la séance, SVG dans la page : aucune image nouvelle) ; `img-niveleur` : la photo du quai intérieur
// de Smoby (Pexels 1267327), comme ENT-8.2 et 8.4. `zone-reception` : la photo de palettes posées au sol d'ENT-8.2 (le plan de la réception
// d'ENT-8.2 est une vue, pas une image : écart dit au compte rendu). Les `retour` et les `aide` de ces notions sont écrits par Claude Code (le
// brief ne les donne pas) : à relire.
//
// Ce fichier importe les DONNÉES de la séance (`contenus/action-ent87-donnees.js`), jamais le contenu (`contenus/action-ent87.js` l'importe).

import { apresGeste } from '../../core/declencheurs.js';
import { EQUIPE, PHOTOS } from '../action.js';
import { ID, QUAI_ID, FICHE_ID } from '../action-ent87-donnees.js';

const GROUPE = 'Les questions de Samia';
const img = (id, court, titre, src, alt, credit) => ({ id, court, titre, type: 'images', images: [{ src, alt, credit }] });

export const QUESTIONS = {
  id: ID,
  part: 4,
  personnes: { samia: EQUIPE.samia, kevin: EQUIPE.kevin },
  ouverture: { id: 'avant-de-commencer', de: 'samia', titre: 'Avant de commencer', continuer: 'voir l’accueil',
    situation: 'Bonjour ! Le camion du Havre arrive bientôt : on le décharge ensemble. Avant de commencer, regarde les documents à gauche et réponds à mes questions.',
    documents: ['stage', 'protocole-entete', 'dessin-cale', 'dessin-feux',
      img('photo-niveleur', 'Le bord du quai', 'Au bord du quai', './contenus/smoby/quai-interieur.jpg',
        'Une porte de quai ouverte sur l’intérieur d’une remorque ; au sol, une plaque bleue au bord du quai',
        'Photo d’un autre entrepôt — Pexels n° 1267327, marques effacées'),
      img('photo-colis', 'Devant les quais', 'Devant les quais', PHOTOS.colis.src, PHOTOS.colis.alt, PHOTOS.colis.mention)],
    tirage: { preparation: 3, image: 1 },
    questions: ['protocole', 'plan-circulation', 'anomalie', 'zone-reception', 'remorque', 'caces', 'vouvoiement',
      'img-cale', 'img-feux', 'img-niveleur'] },
  liste: [
    // ── préparation (7 : l'élève en reçoit 3)
    { id: 'protocole', type: 'ouverture', de: 'samia', doc: 'protocole-entete', rubrique: 'preparation', cle: true,
      enonce: 'Un protocole de sécurité, c’est…',
      aide: 'Regarde le document à gauche : son titre et ses rubriques. Clique sur les mots [[protocole de sécurité]].',
      choix: [{ v: 'document', lib: 'un document qui dit comment livrer et décharger sans danger sur ce site' }, { v: 'contrat', lib: 'un contrat de vente' },
        { v: 'planning', lib: 'le planning des camions' }],
      juste: 'document',
      retour: 'C’est le document qui dit comment livrer et décharger sans danger, ici, sur ce site.' },
    { id: 'plan-circulation', type: 'ouverture', de: 'samia', doc: 'stage', rubrique: 'preparation', cle: true,
      enonce: 'Le plan de circulation d’un site montre…',
      aide: 'Sur un site, des camions roulent et des gens marchent. Par où passe chacun ?',
      choix: [{ v: 'passages', lib: 'par où passent les camions et les piétons' }, { v: 'rayons', lib: 'les rayons du magasin' },
        { v: 'horaires', lib: 'les horaires de l’équipe' }],
      juste: 'passages',
      retour: 'Le plan de circulation montre par où roulent les camions et par où passent les piétons, pour qu’ils ne se croisent pas.' },
    { id: 'anomalie', type: 'ouverture', de: 'samia', doc: 'stage', rubrique: 'preparation', cle: true,
      enonce: 'Une anomalie, c’est…',
      aide: 'Clique sur le mot [[anomalie]].',
      choix: [{ v: 'signale', lib: 'quelque chose qui n’est pas normal et qu’on signale' }, { v: 'palette', lib: 'une palette de plus' }, { v: 'pause', lib: 'une pause' }],
      juste: 'signale',
      retour: 'Une anomalie, c’est ce qui n’est pas normal : on ne la règle pas seul, on me la signale.' },
    { id: 'zone-reception', type: 'ouverture', de: 'samia', doc: 'photo-colis', rubrique: 'preparation',
      enonce: 'La zone de réception, c’est…',
      aide: 'Regarde la photo. Clique sur les mots [[zone de réception]].',
      choix: [{ v: 'devant', lib: 'l’endroit devant les quais où on pose les palettes déchargées' }, { v: 'parking', lib: 'le parking des camions' },
        { v: 'stock', lib: 'le stock' }],
      juste: 'devant',
      retour: 'La zone de réception est devant les quais : les palettes déchargées y attendent le contrôle.' },
    { id: 'remorque', type: 'ouverture', de: 'samia', doc: 'stage', rubrique: 'preparation',
      enonce: 'La remorque, c’est…',
      aide: 'Un camion a deux parties : celle où l’on conduit, et l’autre.',
      choix: [{ v: 'marchandise', lib: 'la partie du camion qui porte la marchandise' }, { v: 'cabine', lib: 'la cabine du chauffeur' }, { v: 'quai', lib: 'le quai' }],
      juste: 'marchandise',
      retour: 'La remorque porte la marchandise ; le chauffeur, lui, est dans la cabine.' },
    { id: 'caces', type: 'ouverture', de: 'samia', doc: 'stage', rubrique: 'preparation',
      enonce: 'Le CACES prouve que…',
      aide: 'Clique sur le mot [[CACES]].',
      choix: [{ v: 'engin', lib: 'tu as appris à conduire un engin en sécurité' }, { v: 'permis', lib: 'tu as le permis voiture' },
        { v: 'chef', lib: 'tu es chef d’équipe' }],
      juste: 'engin',
      retour: 'Le CACES prouve qu’on a appris à conduire un engin en sécurité. Il faut en plus l’autorisation de l’entreprise.' },
    { id: 'vouvoiement', type: 'ouverture', de: 'samia', doc: 'stage', rubrique: 'preparation',
      enonce: 'Au chauffeur, que tu ne connais pas, tu dis…',
      aide: 'Le chauffeur ne travaille pas chez nous : c’est une personne extérieure.',
      choix: [{ v: 'vous', lib: '« vous »' }, { v: 'tu', lib: '« tu »' }, { v: 'salut', lib: '« salut »' }],
      juste: 'vous',
      retour: '« Vous » : il vient d’une autre entreprise, tu ne le connais pas. Entre collègues, on se tutoie.' },
    // ── image (3 : l'élève en reçoit 1)
    { id: 'img-cale', type: 'ouverture', de: 'samia', doc: 'dessin-cale', rubrique: 'image', cle: true,
      enonce: 'Cet objet devant la roue sert à…',
      aide: 'Regarde l’objet posé contre le pneu. Clique sur le mot [[cale]].',
      choix: [{ v: 'immobiliser', lib: 'empêcher le camion de bouger' }, { v: 'gonfler', lib: 'gonfler le pneu' }, { v: 'laver', lib: 'laver la roue' }],
      juste: 'immobiliser',
      retour: 'C’est une cale : posée contre la roue, elle empêche le camion de bouger pendant qu’on décharge.' },
    { id: 'img-feux', type: 'ouverture', de: 'samia', doc: 'dessin-feux', rubrique: 'image',
      enonce: 'Ces feux au bord du quai servent à…',
      aide: 'Regarde où ils sont placés : à côté de la porte, du côté où arrive le camion.',
      choix: [{ v: 'chauffeur', lib: 'dire au chauffeur s’il peut bouger ou non' }, { v: 'eclairer', lib: 'éclairer la cour' }, { v: 'incendie', lib: 'signaler un incendie' }],
      juste: 'chauffeur',
      retour: 'Les feux de quai parlent au chauffeur : tant qu’on décharge, il ne doit pas bouger.' },
    { id: 'img-niveleur', type: 'ouverture', de: 'samia', doc: 'photo-niveleur', rubrique: 'image',
      enonce: 'La plaque bleue au bord du quai sert à…',
      aide: 'Regarde le bas de la photo, entre le quai et la remorque. Clique sur le mot [[niveleur]].',
      choix: [{ v: 'passer', lib: 'passer du quai au camion avec l’engin' }, { v: 'bloquer', lib: 'bloquer les roues du camion' }, { v: 'peser', lib: 'peser la palette' }],
      juste: 'passer',
      retour: 'C’est le niveleur : il fait le pont entre le quai et le plancher du camion.' },
    // ── au fil du travail (une ligne au bandeau, corrigées tout de suite ; textes du brief §4 bis)
    { id: 'qui-ecrit', type: 'fil', de: 'samia', quand: apresGeste(`fiche:${FICHE_ID}:envoyer`), poids: 1.5, groupe: GROUPE,
      enonce: 'Ce protocole, qui l’a écrit ? (Regarde le document « Le droit », à gauche.)',
      choix: [{ v: 'ensemble', lib: 'Geodis et le transporteur, ensemble, avant la première livraison' }, { v: 'chauffeur', lib: 'le chauffeur, seul' },
        { v: 'action', lib: 'Action' }, { v: 'inspection', lib: 'l’inspection du travail' }],
      juste: 'ensemble',
      retour: 'Les deux employeurs, ensemble, avant la première livraison : Geodis pour le site, le transporteur pour son camion. Pour un camion qui revient tous les jours, un seul protocole suffit.' },
    { id: 'pourquoi-local', type: 'fil', de: 'samia', quand: apresGeste(`fiche:${FICHE_ID}:envoyer`), reflexion: true,
      enonce: 'Pourquoi le chauffeur attend-il au local et pas à côté de son camion ?',
      choix: [{ v: 'chariots', lib: 'Pour ne pas être sur le passage des chariots' }, { v: 'repartir', lib: 'Pour ne pas repartir pendant qu’on décharge' },
        { v: 'accident', lib: 'Pour que chacun sache qui est où en cas d’accident' }, { v: 'pas-pense', lib: 'Je n’y avais pas pensé' }],
      retour: 'Les trois : loin des chariots, il est en sécurité ; avec ses clés chez nous, le camion ne bouge pas ; et on sait où il est.' },
    { id: 'decharge-quand-meme', type: 'fil', de: 'kevin', quand: apresGeste(`scene:${QUAI_ID}:signaler`), poids: 1.5, groupe: GROUPE,
      enonce: 'On a du retard. Je décharge quand même pendant que Samia regarde ?',
      choix: [{ v: 'attendre', lib: 'Non : on attend que Samia ait réglé le problème' }, { v: 'oui', lib: 'Oui, vas-y' },
        { v: 'moi', lib: 'Je décharge moi-même' }, { v: 'renvoyer', lib: 'On renvoie le camion' }],
      juste: 'attendre',
      retour: 'On attend. Un camion pas sûr, on n’y entre pas, même en retard.' },
    { id: 'peut-partir', type: 'fil', de: 'samia', quand: apresGeste(`quai:${QUAI_ID}:dechargement`), poids: 1, groupe: GROUPE,
      enonce: 'Kevin a posé la dernière palette. Marc peut-il repartir ?',
      choix: [{ v: 'attendre', lib: 'Pas encore : il attend la fin du contrôle et la signature des documents' }, { v: 'oui', lib: 'Oui, tout de suite' },
        { v: 'kevin', lib: 'Oui, dès que Kevin est sorti du camion' }],
      juste: 'attendre',
      retour: 'Pas encore : on contrôle d’abord, on écrit les réserves s’il y en a, il signe, et là seulement je lui rends ses clés.' },
  ],
};
