// Les questions d'ENT-6.1 — France Boissons, bienvenue à Buchelay (brief `docs/briefs/ENT-6.1-france-boissons-organigramme.md`,
// §4 étapes 3 et 4, §4 bis, §6 ; choix de Tristan du 10/10/2026). Modifier ce fichier suffit : voir « Modifier les questions d'une
// séance » dans `activites/FICHE-SEANCE.md`. Personnes et situations CONSTRUITES (organigramme de la plateforme reconstitué).
//
// QUESTIONS NOTÉES (`part: 5` : 2 + 1,5 + 1,5, une seule ligne au bandeau de fin, « Les questions d'Inès ») :
// - `qui-decide-conges` : point d'étape avec Inès, après l'envoi de la fiche « Qui fait quoi ? » (juste ou fausse), poids 2. Le courrier du
//   matin n'arrive qu'après les DEUX réponses du point d'étape (condition du volet, `contenus/france-boissons-ent61.js`) ;
//   « Continuer » ouvre le message de Malo (`ferme: 'repondre:msg-malo'`).
// - `qui-sanctionne` : la seconde question du même point d'étape, poids 1,5. Éco-droit : Code du travail L1331-1 (une sanction est
//   prise par l'employeur). Le texte est dans l'énoncé : l'écran du point d'étape n'a pas d'onglet de documents.
// - `qui-traite-malo` : question au fil d'Inès, au transfert du message de Malo (geste `messagerie:transfert:msg-malo`), poids 1,5,
//   corrigée au bilan seulement (elle donne le destinataire du jalon « message de Malo »).
// QUESTIONS NON NOTÉES :
// - `appui-chef` : question au fil de Karim, au choix du chef de Lucas dans la fiche (geste `fiche:qui-fait-quoi:chefLucas`), réflexion ;
//   « Merci, je note » à l'écran, ce qu'en pense Karim arrive avec le bandeau de fin (il soufflerait le jalon avant l'envoi de la fiche).
// - `pourquoi-pas-helene` : question au fil de Karim, au PREMIER transfert d'un message (quel qu'il soit), réflexion.
// Les énoncés ne reprennent pas le choix de l'élève (« tu as choisi… ») : un énoncé ne s'écrit pas encore d'après la base.
//
// L'écran « Avant de commencer » (brief `docs/briefs/MOTEUR-avant-de-commencer.md`) : une BANQUE de huit questions d'ouverture, NON
// notées (l'élève ne le sait pas), dont chaque élève reçoit quatre (2 de préparation, 2 de droit ; `tirage`). L'organigramme à gauche
// est celui de l'élève (ses cases vides), avec l'annuaire et « Le droit ». AUCUNE question ne porte sur une case de l'organigramme, sur
// un destinataire ni sur le chef de Lucas : ce sont les jalons de la séance. La calculette du site est sur l'écran (`calculette: true`,
// les questions de seuil donnent un nombre de salariés). `cle: true` = à reprendre en évaluation.
// `ri-obligatoire` (n de 55 à 150, jamais 80, l'effectif de Buchelay) et `cse-obligatoire` (n de 12 à 45) sont à VALEURS TIRÉES : la
// clé de la bonne réponse est la même pour tous, seul le nombre change.

import { apresFiche, apresGeste } from '../../core/declencheurs.js';
import { EQUIPE } from '../france-boissons.js';

const GROUPE = 'Les questions d’Inès';

// n salariés, jamais l'effectif de Buchelay (80) : le tirage ne rejoue pas les chiffres de la séance.
const varianteRI = (h) => {
  let n = h.entier(55, 149);
  if (n >= 80) n += 1;
  return {
    enonce: `Une plateforme logistique emploie ${n} salariés depuis plus d’un an. Doit-elle avoir un règlement intérieur ?`,
    libs: { oui50: 'Oui : il est obligatoire à partir de 50 salariés', non200: 'Non, seulement à partir de 200 salariés', facultatif: 'Non, c’est toujours facultatif' },
  };
};
const varianteCSE = (h) => {
  const n = h.entier(12, 45);
  return {
    enonce: `Une entreprise de transport emploie ${n} salariés depuis plus d’un an. Doit-elle avoir un CSE (comité social et économique) ?`,
    libs: { oui11: 'Oui : à partir de 11 salariés pendant 12 mois de suite', non50: 'Non, seulement à partir de 50 salariés', demande: 'Non, seulement si les salariés le demandent' },
  };
};

export const QUESTIONS = {
  id: 'france-boissons-organigramme',
  part: 5,
  personnes: { ines: EQUIPE.ines, karim: EQUIPE.karim },
  ouverture: { id: 'avant-de-commencer', de: 'ines', titre: 'Avant de commencer', continuer: 'voir l’accueil',
    situation: 'Bonjour, et bienvenue à Buchelay ! Avant ton premier matin à l’accueil, lis les documents à gauche et réponds à mes questions.',
    calculette: true,
    documents: ['organigramme', 'annuaire', 'droit'],
    tirage: { preparation: 2, droit: 2 },
    questions: ['fb-plateforme', 'organigramme-sert', 'trait-plein', 'rendre-compte',
      'ri-obligatoire', 'cse-obligatoire', 'malo-chef', 'zero-accident'] },
  etapes: [
    { id: 'avant-courrier', de: 'ines', apres: apresFiche('qui-fait-quoi'), ferme: 'repondre:msg-malo',
      titre: 'Point d’étape avant le courrier du matin', continuer: 'le courrier du matin',
      situation: 'Merci, j’ai ta fiche. Avant de te confier le courrier, deux questions.',
      questions: ['qui-decide-conges', 'qui-sanctionne'] },
  ],
  liste: [
    // ── ouverture : préparation (4 : l'élève en reçoit 2)
    { id: 'fb-plateforme', type: 'ouverture', de: 'ines', doc: 'annuaire', rubrique: 'preparation', cle: true,
      enonce: 'Que fait la plateforme de Buchelay ?',
      aide: 'Regarde ce que font Thomas à l’entrepôt, Karim avec les camions et Lucas avec sa tournée, dans l’annuaire.',
      choix: [{ v: 'distribue', lib: 'Elle stocke des boissons et les livre aux cafés, hôtels et restaurants' },
        { v: 'brasse', lib: 'Elle fabrique la bière' },
        { v: 'magasin', lib: 'Elle vend des boissons aux particuliers, en magasin' }],
      juste: 'distribue',
      retour: 'France Boissons ne brasse pas : elle distribue. La bière arrive des brasseries, repart chez les clients.' },
    { id: 'organigramme-sert', type: 'ouverture', de: 'ines', doc: 'organigramme', rubrique: 'preparation',
      enonce: 'À quoi sert un organigramme ?',
      aide: 'Regarde les traits entre les cases et ce qui est écrit dans chaque case. Un [[organigramme]], c’est un schéma.',
      choix: [{ v: 'qui', lib: 'À montrer qui dirige qui, et qui fait quoi dans l’entreprise' },
        { v: 'horaires', lib: 'À donner les horaires de chacun' },
        { v: 'clients', lib: 'À lister les clients de la plateforme' }],
      juste: 'qui',
      retour: 'Il montre les services et les chefs : c’est lui qui te dira à qui transmettre un message.' },
    { id: 'trait-plein', type: 'ouverture', de: 'ines', doc: 'organigramme', rubrique: 'preparation',
      enonce: 'Sur l’organigramme, que veut dire un trait plein entre deux cases ?',
      aide: 'Regarde sous le dessin : la légende explique les traits.',
      choix: [{ v: 'chef', lib: 'Un lien hiérarchique : l’un est le chef de l’autre' },
        { v: 'bureau', lib: 'Les deux travaillent dans le même bureau' },
        { v: 'silence', lib: 'Les deux ne se parlent jamais' }],
      juste: 'chef',
      retour: 'Trait plein : le chef. Pointillés : un service qui aide, sans être le chef.' },
    { id: 'rendre-compte', type: 'ouverture', de: 'ines', doc: 'annuaire', rubrique: 'preparation',
      enonce: 'Dans une fiche, « Thomas rend compte à Hélène » veut dire…',
      aide: 'Cherche « Rend compte à » dans une fiche de l’annuaire. Que signifie [[rendre compte]] ?',
      choix: [{ v: 'cheffe', lib: 'Hélène est sa cheffe : il lui dit ce qu’il a fait et ce qui se passe' },
        { v: 'comptes', lib: 'Thomas fait les comptes d’Hélène' },
        { v: 'explique', lib: 'Hélène doit expliquer son travail à Thomas' }],
      juste: 'cheffe',
      retour: 'Rendre compte, c’est informer son chef.' },
    // ── ouverture : droit (4 : l'élève en reçoit 2)
    { id: 'ri-obligatoire', type: 'ouverture', de: 'ines', doc: 'droit', rubrique: 'droit', variante: varianteRI,
      enonce: 'Une plateforme logistique emploie 60 salariés depuis plus d’un an. Doit-elle avoir un règlement intérieur ?',
      aide: 'Lis l’article L1311-2 dans l’onglet « Le droit » : à partir de combien de salariés ?',
      choix: [{ v: 'oui50', lib: 'Oui : il est obligatoire à partir de 50 salariés' },
        { v: 'non200', lib: 'Non, seulement à partir de 200 salariés' },
        { v: 'facultatif', lib: 'Non, c’est toujours facultatif' }],
      juste: 'oui50',
      retour: 'Le règlement intérieur fixe les règles de sécurité et de discipline. Buchelay, avec ses 80 salariés, en a un.' },
    { id: 'cse-obligatoire', type: 'ouverture', de: 'ines', doc: 'droit', rubrique: 'droit', variante: varianteCSE,
      enonce: 'Une entreprise de transport emploie 30 salariés depuis plus d’un an. Doit-elle avoir un CSE (comité social et économique) ?',
      aide: 'Lis l’article L2311-2 dans l’onglet « Le droit » : à partir de combien de salariés, et pendant combien de temps ?',
      choix: [{ v: 'oui11', lib: 'Oui : à partir de 11 salariés pendant 12 mois de suite' },
        { v: 'non50', lib: 'Non, seulement à partir de 50 salariés' },
        { v: 'demande', lib: 'Non, seulement si les salariés le demandent' }],
      juste: 'oui11',
      retour: 'Le CSE représente les salariés auprès de la direction.' },
    { id: 'malo-chef', type: 'ouverture', de: 'ines', doc: 'droit', rubrique: 'droit', cle: true,
      enonce: 'Malo, client, demande à Lucas de livrer plus tôt et de ranger les fûts dans sa cave. Malo est-il le chef de Lucas ?',
      aide: 'Lis la définition de la Cour de cassation dans l’onglet « Le droit » : qui donne des ordres, les contrôle et peut sanctionner ?',
      choix: [{ v: 'non', lib: 'Non : c’est son employeur, France Boissons, qui lui donne des ordres, les contrôle et peut le sanctionner' },
        { v: 'oui-paie', lib: 'Oui : Malo paie les boissons, donc il commande' },
        { v: 'oui-chez-lui', lib: 'Oui, tant que Lucas est chez lui' }],
      juste: 'non',
      retour: 'Le lien de subordination n’existe qu’avec l’employeur. Malo peut demander un service : c’est à France Boissons de décider.' },
    { id: 'zero-accident', type: 'ouverture', de: 'ines', doc: 'droit', rubrique: 'droit', cle: true,
      enonce: '« Objectif prioritaire : zéro accident. » D’après l’article L4121-1, qui doit prendre les mesures pour la sécurité des salariés ?',
      aide: 'Lis l’article L4121-1 dans l’onglet « Le droit » : la première phrase dit qui prend les mesures.',
      choix: [{ v: 'employeur', lib: 'L’employeur, France Boissons' },
        { v: 'salarie', lib: 'Chaque salarié, seul' },
        { v: 'inspection', lib: 'L’inspection du travail' }],
      juste: 'employeur',
      retour: 'L’employeur doit prévenir les risques, informer, former, organiser. Les salariés aussi ont un devoir : on le verra au quai.' },
    // ── point d'étape (après l'envoi de la fiche)
    { id: 'qui-decide-conges', type: 'transition', de: 'ines', poids: 2,
      enonce: 'Lucas m’écrit qu’il veut décaler ses congés d’été. D’après l’organigramme, à qui dois-je transmettre sa demande pour qu’elle soit décidée ?',
      choix: [{ v: 'karim', lib: 'Karim' }, { v: 'ines', lib: 'Moi, Inès' }, { v: 'nadia', lib: 'Nadia' }, { v: 'helene', lib: 'Hélène' }],
      juste: 'karim', groupe: GROUPE,
      retour: 'C’est Karim, son chef, qui décide : il connaît les tournées et sait qui peut remplacer Lucas. Moi, j’enregistre le congé une fois qu’il est décidé : c’est un lien fonctionnel.' },
    { id: 'qui-sanctionne', type: 'transition', de: 'ines', poids: 1.5,
      enonce: 'Lucas refuse la tournée que Karim lui donne. D’après l’article L1331-1 du Code du travail, une sanction est une mesure prise par l’employeur à la suite d’un agissement qu’il juge fautif. Qui peut sanctionner Lucas ?',
      choix: [{ v: 'employeur', lib: 'France Boissons, son employeur : Karim, son chef, le signale et propose' },
        { v: 'ines', lib: 'Inès, qui gère les papiers du personnel' },
        { v: 'malo', lib: 'Malo, le client qui attendait sa livraison' },
        { v: 'nadia', lib: 'Nadia, qui organise le quai' }],
      juste: 'employeur', groupe: GROUPE,
      retour: 'Une sanction est décidée par l’employeur. Karim, le chef de Lucas, signale ce qui s’est passé et propose : c’est l’entreprise qui décide. Ni moi, ni un client, ni un collègue d’un autre service.' },
    // ── au fil du travail
    { id: 'appui-chef', type: 'fil', de: 'karim', quand: apresGeste('fiche:qui-fait-quoi:chefLucas'), reflexion: true, apres: 'bilan',
      enonce: 'Je vois que tu choisis le chef de Lucas. Sur quoi t’es-tu appuyé ?',
      choix: [{ v: 'fiche', lib: 'Sa fiche dit à qui il rend compte' },
        { v: 'travail', lib: 'Il lui donne sa tournée' },
        { v: 'haut', lib: 'C’est le plus haut placé' },
        { v: 'hasard', lib: 'Au hasard' }],
      retour: 'Les deux premiers appuis sont bons : le chef, c’est celui à qui on rend compte, et celui qui vous donne votre travail. Le plus haut placé n’est pas forcément le chef direct.' },
    { id: 'pourquoi-pas-helene', type: 'fil', de: 'karim', quand: apresGeste('messagerie:transfert'), reflexion: true,
      enonce: 'Je te vois transférer le courrier. Pourquoi ne pas tout envoyer à Hélène, puisqu’elle dirige tout le monde ?',
      choix: [{ v: 'debordee', lib: 'Hélène serait débordée : chaque service traite ce qui le concerne' },
        { v: 'detail', lib: 'Hélène ne connaît pas le détail des tournées ou du quai' },
        { v: 'niveau', lib: 'On ne dérange la directrice que pour ce qu’elle seule peut décider' },
        { v: 'pas-pense', lib: 'Je n’y avais pas pensé' }],
      retour: 'Les trois premières raisons sont vraies toutes les trois ; un organigramme sert justement à envoyer chaque demande au bon niveau.' },
    { id: 'qui-traite-malo', type: 'fil', de: 'ines', quand: apresGeste('messagerie:transfert:msg-malo'), apres: 'bilan', poids: 1.5,
      enonce: 'Tu viens de transférer la commande de Malo. Dans l’entreprise, qui va la traiter demain ?',
      choix: [{ v: 'ines', lib: 'Inès, à l’administration des ventes' },
        { v: 'karim', lib: 'Karim, qui organise les tournées' },
        { v: 'nadia', lib: 'Nadia, qui prépare au quai' },
        { v: 'helene', lib: 'Hélène, la directrice' }],
      juste: 'ines', groupe: GROUPE,
      retour: 'Les commandes des clients arrivent à l’administration des ventes : c’est moi qui les traite. Karim et Nadia interviennent ensuite, pour la tournée et la préparation.' },
  ],
};
