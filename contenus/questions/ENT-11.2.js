// Questions d'ENT-11.2 — Mondial Relay, première nuit au tri (2de, guidage). Brief `docs/briefs/ENT-11.2-mondial-relay-au-tri.md`,
// §4 bis et §4 ter, tous retenus par Tristan le 26/10/2026.
//
// Notées (part 7 sur 20) : la sécurité du poste, trois questions d'un point d'étape AVANT la ligne de tri (poids 1 chacune : 3 points,
// jalon n° 1 du brief) ; le colis trop lourd, le colis d'Inès, le travail de nuit (poids 4/3 chacune : 4 points, « questions au fil »).
// Réflexions (non notées) : le piège de Bar-sur-Aube, ce qui a fait perdre du temps à la cadence.
// « Avant de commencer » : non noté (séance de travail), toute la banque du §4 ter.
//
// VÉRIFIÉ : Code du travail, art. L3122-2 (définition du travail de nuit, relevée le 26/10/2026) et art. R4323-95 (les équipements de
// protection individuelle sont fournis gratuitement par l'employeur ; reformulé) ; règles du colis (conditions de vente, art. 2.1).
// CONSTRUIT : les horaires de la nuit (22 h - 5 h), Romain, tous les textes. La raison du plafond de 30 kg (le commerçant porte le
// colis seul) est une explication de bon sens, pas une phrase de Mondial Relay.

import { apresGeste } from '../../core/declencheurs.js';
import { EQUIPE as EQUIPE_MR } from '../mondial-relay.js';

export const ID_TRI = 'mr-tri-112';
const serieFinie = (db, s) => !!(db && db.tris && db.tris['mondial-relay-au-tri'] && db.tris['mondial-relay-au-tri'][ID_TRI]
  && db.tris['mondial-relay-au-tri'][ID_TRI].series && db.tris['mondial-relay-au-tri'][ID_TRI].series[s]
  && db.tris['mondial-relay-au-tri'][ID_TRI].series[s].fait);

export const GROUPES = {
  securite: 'La sécurité du poste',
  regles: 'Les règles du colis',
  ines: 'Le colis d’Inès',
  nuit: 'Le travail de nuit',
};

export const QUESTIONS = {
  id: 'mondial-relay-au-tri',
  part: 7,
  personnes: { romain: { nom: EQUIPE_MR.romain.prenom, role: EQUIPE_MR.romain.poste, appel: 'Romain' } },
  ouverture: { id: 'avant-de-commencer', de: 'romain', titre: 'Avant de commencer', continuer: 'voir l’accueil',
    situation: 'Salut ! Ce soir, c’est ta première nuit au tri. Lis les documents à gauche et réponds à mes questions avant de venir sur la ligne.',
    documents: ['poste-112', 'etiquette-112', 'regles-112', 'droit-112'],
    questions: ['etiquette-tournee', 'colis-32kg', 'somme-cotes', 'bouton-rouge', 'interim-contrat', 'chaussures'] },
  etapes: [
    { id: 'securite', de: 'romain', apres: () => true, ferme: 'ecran:tri',
      titre: 'Avant de prendre ta place sur la ligne', continuer: 'aller sur la ligne de tri',
      situation: 'Avant de te mettre au poste, trois questions de sécurité. Sur une ligne de tri, le tapis ne s’arrête pas pour toi.',
      questions: ['tapis-bloque', 'tenue', 'soulever'] },
    { id: 'avant-cadence', de: 'romain', apres: (db) => serieFinie(db, 's1'), ferme: 'ecran:tri',
      titre: 'Avant la série à la cadence', continuer: 'reprendre la ligne de tri',
      situation: 'Bien. Maintenant, on passe à la cadence de la nuit. Une question avant : lis l’article du Code du travail dans « Le droit ».',
      questions: ['travail-nuit'] },
  ],
  liste: [
    // ── Avant de commencer (non noté)
    { id: 'etiquette-tournee', type: 'ouverture', de: 'romain', doc: 'etiquette-112',
      enonce: 'Sur l’étiquette, qu’est-ce qui décide de la tournée du colis ?',
      aide: 'Regarde l’étiquette à gauche, puis le [[plan de tri]].',
      choix: [{ v: 'commune', lib: 'La commune et son code postal' }, { v: 'numero', lib: 'Le numéro du colis' },
        { v: 'commerce', lib: 'Le nom du commerce' }],
      juste: 'commune',
      retour: 'La commune et son code postal. Le plan de tri dit dans quelle tournée elle est.' },
    { id: 'colis-32kg', type: 'ouverture', de: 'romain', doc: 'regles-112',
      enonce: 'Un colis pèse 32 kg. Que devient-il ?',
      aide: 'Lis les règles du poste à gauche.',
      choix: [{ v: 'non', lib: 'Il ne part pas en Point Relais : on le met à l’écart' }, { v: 'locker', lib: 'Il part en locker' },
        { v: 'emballe', lib: 'Il part s’il est bien emballé' }],
      juste: 'non',
      retour: 'Plus de 30 kg : il ne part pas en Point Relais. On le met à l’écart.' },
    { id: 'somme-cotes', type: 'ouverture', de: 'romain', doc: 'regles-112',
      enonce: 'Un colis mesure 60 cm, 50 cm et 45 cm. Peut-il partir ?',
      aide: 'Lis les règles du poste : additionne les trois côtés.',
      choix: [{ v: 'non', lib: 'Non : 60 + 50 + 45 = 155 cm, plus de 150 cm' }, { v: 'oui', lib: 'Oui : aucun côté ne dépasse 120 cm' },
        { v: 'oui-60', lib: 'Oui : son plus grand côté fait 60 cm' }],
      juste: 'non',
      retour: 'Deux règles de taille : pas plus de 120 cm de long, ET pas plus de 150 cm en tout. Ici, 155 cm : à l’écart.' },
    { id: 'bouton-rouge', type: 'ouverture', de: 'romain', doc: 'poste-112',
      enonce: 'Le gros bouton rouge au bord du tapis sert à…',
      aide: 'Lis « Ton poste » à gauche.',
      choix: [{ v: 'arret', lib: 'Arrêter la ligne en urgence' }, { v: 'demarrer', lib: 'Démarrer la ligne' },
        { v: 'chef', lib: 'Appeler le chef d’équipe' }],
      juste: 'arret',
      retour: 'C’est l’arrêt d’urgence. Un doigt, une manche coincée : on appuie, sans réfléchir.' },
    { id: 'interim-contrat', type: 'ouverture', de: 'romain', doc: 'poste-112',
      enonce: 'Au pic, beaucoup de renforts sont intérimaires. Un intérimaire signe son contrat de travail avec…',
      aide: 'Lis « Ton poste » à gauche.',
      choix: [{ v: 'agence', lib: 'L’agence d’intérim' }, { v: 'mr', lib: 'Mondial Relay' }, { v: 'chef', lib: 'Le chef d’équipe' }],
      juste: 'agence',
      retour: 'L’agence d’intérim l’embauche et le paie ; il vient travailler chez nous. On en reparlera.' },
    { id: 'chaussures', type: 'ouverture', de: 'romain', doc: 'droit-112',
      enonce: 'Tes chaussures de sécurité, qui les paie ?',
      aide: 'Lis l’article R4323-95 dans « Le droit ».',
      choix: [{ v: 'employeur', lib: 'L’employeur : il les fournit gratuitement' }, { v: 'salarie', lib: 'Le salarié' },
        { v: 'france-travail', lib: 'France Travail' }],
      juste: 'employeur',
      retour: 'L’employeur fournit les équipements de protection, gratuitement, et les entretient.' },
    // ── Point d'étape « sécurité » (notées, 1 point chacune)
    { id: 'tapis-bloque', type: 'transition', de: 'romain', groupe: GROUPES.securite,
      enonce: 'Un colis se coince sous le tapis, qui tourne. Que fais-tu ?',
      choix: [{ v: 'arret', lib: 'J’appuie sur l’arrêt d’urgence et j’appelle Romain' },
        { v: 'main', lib: 'Je passe la main dessous pour le dégager vite' },
        { v: 'laisse', lib: 'Je laisse : il finira bien par passer' }],
      juste: 'arret',
      retour: 'Jamais la main sous un tapis en marche. On arrête la ligne, puis on dégage.' },
    { id: 'tenue', type: 'transition', de: 'romain', groupe: GROUPES.securite,
      enonce: 'Pour ta nuit au tri, tu portes…',
      choix: [{ v: 'epi', lib: 'Des chaussures de sécurité et un gilet haute visibilité' },
        { v: 'baskets', lib: 'Des baskets : c’est plus confortable pour piétiner' },
        { v: 'gilet', lib: 'Un gilet seulement : les colis sont légers' }],
      juste: 'epi',
      retour: 'Un colis de 20 kg qui tombe sur le pied, un engin qui passe : chaussures et gilet, toute la nuit.' },
    { id: 'soulever', type: 'transition', de: 'romain', groupe: GROUPES.securite,
      enonce: 'Un colis de 25 kg arrive sur le tapis. Pour le soulever…',
      choix: [{ v: 'jambes', lib: 'Jambes fléchies, dos droit, colis près du corps' },
        { v: 'dos', lib: 'Dos courbé, jambes tendues, d’un coup' },
        { v: 'bras', lib: 'Bras tendus, en tirant sur la sangle' }],
      juste: 'jambes',
      retour: 'Ce sont les jambes qui travaillent, pas le dos. Toute une nuit, ça compte.' },
    // ── Au fil
    { id: 'pourquoi-30kg', type: 'fil', de: 'romain', groupe: GROUPES.regles, poids: 4 / 3, quand: apresGeste(`tri:${ID_TRI}:lourd`),
      enonce: 'Ce colis de Romilly pesait plus de 30 kg. Pourquoi ne part-il pas en Point Relais ?',
      choix: [{ v: 'porter', lib: 'Le commerçant doit pouvoir le porter seul, sans se blesser' },
        { v: 'camion', lib: 'Le camion de la tournée est trop petit' },
        { v: 'prix', lib: 'Il coûterait plus cher à l’expéditeur' }],
      juste: 'porter',
      retour: 'Un Point Relais, c’est une boulangerie, un tabac : le commerçant range et rend les colis seul. Au-delà de 30 kg, il risque de se blesser.' },
    { id: 'piege-bar', type: 'fil', de: 'romain', reflexion: true, quand: apresGeste(`tri:${ID_TRI}:bar`),
      enonce: 'Bar-sur-Aube, Bar-sur-Seine : qu’est-ce qui permet de ne pas se tromper ?',
      choix: [{ v: 'cp', lib: 'Le code postal' }, { v: 'couleur', lib: 'La couleur de l’étiquette' },
        { v: 'commerce', lib: 'Le nom du commerce' }],
      retour: 'Le code postal : 10200, c’est Bar-sur-Aube (T5) ; 10110, Bar-sur-Seine (T3). Quand deux noms se ressemblent, je regarde le code.' },
    { id: 'colis-ines', type: 'fil', de: 'romain', groupe: GROUPES.ines, poids: 4 / 3, apres: 'bilan', quand: apresGeste(`tri:${ID_TRI}:ines`),
      enonce: 'Le dernier colis avait un coin enfoncé, mais son carton était fermé et son scotch tenait. Pouvait-il partir ?',
      choix: [{ v: 'oui', lib: 'Oui : il est marqué, mais fermé ; rien ne peut tomber' },
        { v: 'non-abime', lib: 'Non : un carton abîmé reste toujours au hub' },
        { v: 'non-refaire', lib: 'Non : il faut d’abord le remballer' }],
      juste: 'oui',
      retour: 'Un carton marqué mais fermé part. Ce qu’on écarte, c’est un carton OUVERT : le contenu peut tomber ou être volé. C’était le colis d’Inès, une lampe : on la reverra.' },
    { id: 'travail-nuit', type: 'transition', de: 'romain', groupe: GROUPES.nuit, poids: 4 / 3,
      enonce: 'Tu tries de 22 h à 5 h. D’après le Code du travail, est-ce du travail de nuit ?',
      choix: [{ v: 'oui', lib: 'Oui : tes heures sont dans la période de nuit, qui va au plus de 21 h à 7 h' },
        { v: 'non-7h', lib: 'Non : il faudrait travailler jusqu’à 7 h' },
        { v: 'non-minuit', lib: 'Non : seul le travail après minuit compte' }],
      juste: 'oui',
      retour: 'Oui. La période de nuit dure au moins 9 heures, entre 21 h et 7 h, et comprend minuit - 5 h. Tes heures de 22 h à 5 h y sont.' },
    { id: 'temps-perdu', type: 'fil', de: 'romain', reflexion: true, quand: apresGeste(`tri:${ID_TRI}:s2:fini`),
      enonce: 'À la cadence, qu’est-ce qui t’a fait perdre du temps ?',
      choix: [{ v: 'plan', lib: 'Chercher la commune dans le plan de tri' }, { v: 'etiquette', lib: 'Lire l’étiquette' },
        { v: 'ecart', lib: 'Hésiter sur un colis à mettre à l’écart' }],
      retour: 'Au début, tout le monde cherche dans le plan. Avec l’habitude, on retient les communes de chaque tournée, et les codes postaux.' },
  ],
};
