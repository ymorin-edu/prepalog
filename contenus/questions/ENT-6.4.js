// Les questions d'ENT-6.4 — France Boissons, le camion de la brasserie (brief `docs/briefs/ENT-6.4-france-boissons-reception.md`,
// §4 bis et §4 ter, choix de Tristan du 10/10/2026). Modifier ce fichier suffit : voir « Modifier les questions d'une séance » dans
// `activites/FICHE-SEANCE.md`. Personnes et situations CONSTRUITES (Nadia est un personnage).
//
// AU FIL (5, dont 3 NOTÉES : `part: 4`, poids 1,5 + 1 + 1,5 = 4 points sur 20), toutes posées par Nadia, énoncé fixe (aucune valeur tirée),
// aucune ne nomme la cabine, la cale, le niveleur, ni ne dit quelle palette est fausse :
// - `avant-d-entrer` : au clic « C'est bon, on peut décharger » (geste `scene:fb-ent64:decharger`), NOTÉE 1,5, corrigée au bilan (la scène
//   répare sans un mot un défaut oublié : la question ne doit rien dire de la scène). Groupe sécurité.
// - `droit-de-conduire` : au premier déchargement au chariot frontal (`quai:fb-ent64:decharger`), NOTÉE 1, corrigée tout de suite.
//   Éco-droit appliqué : Code du travail R4323-56, cité dans l'énoncé (la vue quai n'a pas de volet « à gauche »).
// - `ce-qu-on-compare` : à la première palette validée (`quai:fb-ent64:valider`), RÉFLEXION, corrigée au bilan (le retour soufflerait le
//   piège de P4 avant qu'elle soit comptée).
// - `delai-protestation` : point d'étape après le BL signé ; il garde fermé « Répondre » à Nadia ; NOTÉE 1,5, corrigée tout de suite.
//   Éco-droit appliqué : Code de commerce L133-3, alinéa 1, cité dans l'énoncé. Ne dit pas quelles réserves étaient justes.
// - `fut-abime-stock` : au premier choix de la phrase « fût qui fuit » du message à Nadia, RÉFLEXION, corrigée au bilan (le retour
//   donnerait la phrase juste avant l'envoi).
//
// AVANT DE COMMENCER : une banque de 10 questions NON notées (l'élève ne le sait pas), 5 tirées par élève : `{ preparation: 2, droit: 2,
// image: 1 }`, la calculette du site. Documents à gauche : le BL MON-27-0617, l'annuaire, « Photos et dessins », « Le droit ». Pas le dessin
// de la scène du quai (c'est l'exercice), pas d'onglet « Mots du quai ». Écartées exprès : `protestation` et `autorisation-conduite` (posées
// au fil et notées), `huit-futs`, `zone-litiges`, `bl-signature` (elles frôlent P4, le jalon « zone litiges » et le BL signé), « faut-il
// faire le tour de la palette ? », « une palette incomplète est-elle fausse ? », « où va un fût qui fuit ? ». `cle: true` = à reprendre en
// évaluation (l'élève ne le voit pas). Jamais le dessin `materiel-palette-retention.svg` (il montre le fût qui fuit) ni `chariot-boissons.jpg`
// (un chariot à mât rétractable, pas un frontal).
//
// TEXTES DE LOI (relevés le 10/10/2026 sur des reprises du Code de commerce et du Code du travail) : L133-3 al. 1 (relu sur Légifrance le
// 03/10/2026 pour ENT-4.1 et 4.3), R4515-4 et L4131-1 (relus par Cowork sur code.travail.gouv.fr). **À RELIRE SUR LÉGIFRANCE AVANT
// OUVERTURE AUX ÉLÈVES : L133-1 et R4323-56** (R4323-56 : version en vigueur depuis le 01/10/2025, décret 2025-355 ; on n'en cite qu'un
// extrait, avec […]).

import { apresGeste } from '../../core/declencheurs.js';
import { EQUIPE } from '../france-boissons.js';

// Le point d'étape suit le BL signé : l'état du quai de la séance (cloisonné par `QUAI_ID`, jamais partagé).
const QUAI_ID = 'fb-ent64';
const blSigne = (db) => !!(db && db.quais && db.quais[QUAI_ID] && db.quais[QUAI_ID].signe);

export const QUESTIONS = {
  id: 'france-boissons-reception',
  part: 4,
  personnes: { nadia: EQUIPE.nadia },
  ouverture: { id: 'avant-de-commencer', de: 'nadia', titre: 'Avant de commencer', continuer: 'voir l’accueil',
    situation: 'Bonjour ! Un camion de la brasserie arrive tout à l’heure au quai. Avant de décharger, lis les documents à gauche et réponds à mes questions.',
    calculette: true,
    documents: ['bl', 'annuaire',
      { id: 'photos', court: 'Photos et dessins', titre: 'Fûts et chariot frontal', type: 'images', images: [
        { src: './contenus/images/france-boissons/futs-vrac.jpg', alt: 'Des objets cylindriques en métal, empilés les uns sur les autres',
          credit: 'Photo : Belinda Fewings, Unsplash' },
        { src: './contenus/images/france-boissons/materiel-chariot-frontal.svg', alt: 'Un engin à fourches qui pose une palette sur une autre palette',
          credit: 'Dessin — document pédagogique' }] },
      'droit'],
    tirage: { preparation: 2, droit: 2, image: 1 },
    questions: ['bl-cest-quoi', 'reserve-cest-quoi', 'reassort', 'qui-organise-quai',
      'transporteur-garant', 'reserve-motivee', 'protocole', 'droit-retrait',
      'fut-cest-quoi', 'chariot-frontal'] },
  etapes: [
    { id: 'avant-compte-rendu', de: 'nadia', apres: blSigne, ferme: 'repondre:compte-rendu-nadia',
      titre: 'Point d’étape avant le compte rendu', continuer: 'répondre à Nadia',
      situation: 'Le chauffeur est reparti avec le BL signé. Avant que tu me fasses ton compte rendu, une question.',
      questions: ['delai-protestation'] },
  ],
  liste: [
    // ── préparation (4 : l'élève en reçoit 2)
    { id: 'bl-cest-quoi', type: 'ouverture', de: 'nadia', doc: 'bl', rubrique: 'preparation', cle: true,
      enonce: 'Le BL que te donne le chauffeur, c’est…',
      aide: 'Regarde le document à gauche : il liste les palettes, les références et les quantités. Le mot [[BL]] est dans le lexique.',
      choix: [{ v: 'liste', lib: 'Le bon de livraison : la liste de ce que le camion doit livrer' },
        { v: 'facture', lib: 'La facture à payer au chauffeur' },
        { v: 'commande', lib: 'Le bon de commande de Malo' }],
      juste: 'liste',
      retour: 'On compare ce qui arrive au BL, avant de signer.' },
    { id: 'reserve-cest-quoi', type: 'ouverture', de: 'nadia', doc: 'bl', rubrique: 'preparation', cle: true,
      enonce: 'Écrire une réserve sur le BL, c’est…',
      aide: 'Une réserve s’écrit sur le BL, avant que le chauffeur signe. Le mot [[reserve|réserve]] est dans le lexique.',
      choix: [{ v: 'preciser', lib: 'Écrire précisément ce qui ne va pas, avant de signer' },
        { v: 'refuser', lib: 'Refuser tout le camion' },
        { v: 'plus-tard', lib: 'Signer sans rien dire et prévenir plus tard' }],
      juste: 'preciser',
      retour: 'Une réserve précise (quoi, combien) protège la plateforme.' },
    { id: 'reassort', type: 'ouverture', de: 'nadia', doc: 'bl', rubrique: 'preparation',
      enonce: 'Ce camion apporte du réassort d’Affligem. Pourquoi l’attendait-on ?',
      aide: 'Souviens-toi de la commande de Malo : l’Affligem était presque épuisé.',
      choix: [{ v: 'rupture', lib: 'Mardi, il n’en restait que 2 fûts pour la commande de Malo' },
        { v: 'annulee', lib: 'Malo a annulé sa commande' },
        { v: 'inventaire', lib: 'C’est pour un inventaire' }],
      juste: 'rupture',
      retour: 'Le fil de la semaine : ce que tu reçois aujourd’hui, d’autres le livreront.' },
    { id: 'qui-organise-quai', type: 'ouverture', de: 'nadia', doc: 'annuaire', rubrique: 'preparation',
      enonce: 'Qui organise le quai et les réceptions des brasseries ?',
      aide: 'Regarde l’annuaire : qui dirige les caristes et organise le quai ?',
      choix: [{ v: 'nadia', lib: 'Nadia, cheffe d’équipe quai et préparation' },
        { v: 'karim', lib: 'Karim' }, { v: 'thomas', lib: 'Thomas' }, { v: 'ines', lib: 'Inès' }],
      juste: 'nadia',
      retour: 'C’est moi : je dirige les préparateurs et les caristes, et j’organise le quai.' },
    // ── droit (4 : l'élève en reçoit 2)
    { id: 'transporteur-garant', type: 'ouverture', de: 'nadia', doc: 'droit', rubrique: 'droit', cle: true,
      enonce: 'Une palette de casiers d’eau tombe du camion pendant le trajet et des bouteilles se cassent. D’après l’article L133-1, qui est garant des dommages pendant le transport ?',
      aide: 'Lis l’article L133-1 dans « Le droit » : de qui parle-t-il, le « voiturier » ?',
      choix: [{ v: 'voiturier', lib: 'Le transporteur (le « voiturier »), sauf force majeure ou vice propre de la marchandise' },
        { v: 'fb', lib: 'France Boissons, qui a signé le BL' },
        { v: 'brasserie', lib: 'La brasserie, qui a chargé le camion' }],
      juste: 'voiturier',
      retour: 'Le transporteur répond de la marchandise du départ à l’arrivée ; c’est à lui qu’on s’adresse en cas de casse.' },
    { id: 'reserve-motivee', type: 'ouverture', de: 'nadia', doc: 'droit', rubrique: 'droit', cle: true,
      enonce: 'Le chauffeur te dit : « Écris plutôt “sous réserve de déballage”, c’est plus rapide. » D’après l’article L133-3, est-ce que cela suffit pour garder un recours ?',
      aide: 'Lis l’article L133-3 dans « Le droit » : de quelle sorte de protestation parle-t-il ?',
      choix: [{ v: 'motivee', lib: 'Non : la loi demande une protestation motivée, qui dit ce qui ne va pas' },
        { v: 'toute', lib: 'Oui, toute réserve suffit' },
        { v: 'accord', lib: 'Oui, si le chauffeur est d’accord' }],
      juste: 'motivee',
      retour: 'Une réserve sans motif ne protège de rien : on écrit ce qui ne va pas, et combien.' },
    { id: 'protocole', type: 'ouverture', de: 'nadia', doc: 'droit', rubrique: 'droit', cle: true,
      enonce: 'Un transporteur vient décharger à Buchelay. Quel document écrit encadre la sécurité de ce déchargement ?',
      aide: 'Lis l’article R4515-4 dans « Le droit » : comment s’appelle le document ?',
      choix: [{ v: 'protocole', lib: 'Le protocole de sécurité' },
        { v: 'bl', lib: 'Le bon de livraison' },
        { v: 'permis', lib: 'Le permis du chauffeur' }],
      juste: 'protocole',
      retour: 'Le protocole dit qui fait quoi quand un camion est déchargé : il est écrit à l’avance.' },
    { id: 'droit-retrait', type: 'ouverture', de: 'nadia', doc: 'droit', rubrique: 'droit', cle: true,
      enonce: 'Une lisse de rack est pliée et une palette penche au-dessus de l’allée. Que peux-tu faire ?',
      aide: 'Lis l’article L4131-1 dans « Le droit » : que doit faire le travailleur, et que peut-il faire ?',
      choix: [{ v: 'alerter', lib: 'Alerter tout de suite mon responsable et me retirer de ce danger' },
        { v: 'continuer', lib: 'Continuer : ce n’est pas mon rôle' },
        { v: 'redresser', lib: 'Redresser la lisse moi-même' }],
      juste: 'alerter',
      retour: 'Alerter, c’est un devoir ; se retirer d’un danger grave et imminent, c’est un droit.' },
    // ── image (2 : l'élève en reçoit 1)
    { id: 'fut-cest-quoi', type: 'ouverture', de: 'nadia', doc: 'photos', rubrique: 'image',
      enonce: 'Sur cette photo, que sont ces objets en métal ?',
      aide: 'Regarde la photo à gauche, puis le mot [[fût]] dans le lexique.',
      choix: [{ v: 'futs', lib: 'Des fûts : ils contiennent la bière pression et reviennent vides' },
        { v: 'gaz', lib: 'Des bouteilles de gaz' },
        { v: 'poubelles', lib: 'Des poubelles' }],
      juste: 'futs',
      retour: 'Un fût plein de 30 L pèse environ 40 kg : on ne le porte pas, on le déplace au chariot.' },
    { id: 'chariot-frontal', type: 'ouverture', de: 'nadia', doc: 'photos', rubrique: 'image',
      enonce: 'Sur ce dessin, le chariot frontal sert à…',
      aide: 'Regarde le dessin à gauche, puis le mot [[chariot frontal]] dans le lexique.',
      choix: [{ v: 'palettes', lib: 'Soulever et déplacer les palettes, et les poser l’une sur l’autre (« gerber »)' },
        { v: 'livrer', lib: 'Livrer les fûts chez les clients' },
        { v: 'laver', lib: 'Laver les fûts' }],
      juste: 'palettes',
      retour: 'Fourches baissées pour rouler, jamais personne sous une charge levée.' },
    // ── au fil du travail
    { id: 'avant-d-entrer', type: 'fil', de: 'nadia', quand: apresGeste('scene:fb-ent64:decharger'), apres: 'bilan',
      enonce: 'Tu me dis qu’on peut décharger. Avant d’entrer dans une remorque avec le chariot, qu’est-ce qui doit être vrai ?',
      choix: [{ v: 'immobile', lib: 'Le camion ne peut plus bouger et le passage vers la remorque est sûr' },
        { v: 'chauffeur', lib: 'Le chauffeur nous dit que tout va bien' },
        { v: 'propre', lib: 'Le quai est propre et rangé' },
        { v: 'retard', lib: 'On a du retard, il faut aller vite' }],
      juste: 'immobile', poids: 1.5, groupe: 'Question de Nadia : avant d’entrer dans la remorque',
      retour: 'Camion immobile, passage sûr : on vérifie les deux avant d’entrer, jamais pendant.' },
    { id: 'droit-de-conduire', type: 'fil', de: 'nadia', quand: apresGeste('quai:fb-ent64:decharger'),
      enonce: 'Tu conduis le chariot frontal. Qu’est-ce qui te donne le droit de le conduire ici ? (Code du travail, article R4323-56 : « La conduite de certains équipements présentant des risques particuliers, en raison de leurs caractéristiques […] est subordonnée à l’obtention d’une autorisation de conduite délivrée par l’employeur. »)',
      choix: [{ v: 'formation-autorisation', lib: 'Une formation (comme le CACES) et l’autorisation de conduite donnée par France Boissons' },
        { v: 'permis', lib: 'Le permis B' },
        { v: 'rien', lib: 'Rien : tout salarié peut le conduire' },
        { v: 'chauffeur', lib: 'L’accord du chauffeur' }],
      juste: 'formation-autorisation', poids: 1, groupe: 'Question de Nadia : conduire le chariot',
      retour: 'Le CACES prouve la formation ; l’autorisation, c’est l’employeur qui la donne.' },
    { id: 'ce-qu-on-compare', type: 'fil', de: 'nadia', quand: apresGeste('quai:fb-ent64:valider'), reflexion: true, apres: 'bilan',
      enonce: 'Tu viens de valider une palette. Pour l’accepter, tu compares ce que tu as compté à…',
      choix: [{ v: 'bl', lib: 'Ce qu’annonce le BL' },
        { v: 'pleine', lib: 'Une palette pleine, 8 fûts' },
        { v: 'chauffeur', lib: 'Ce que dit le chauffeur' },
        { v: 'voisine', lib: 'La palette d’à côté' }],
      retour: 'Ce qu’on accepte, c’est ce que le BL annonce, pas ce qu’on suppose d’avance.' },
    { id: 'delai-protestation', type: 'transition', de: 'nadia',
      enonce: 'Tu as signé le BL. Si on découvre demain, sous un film, un dommage que personne n’avait vu, combien de temps a-t-on pour protester auprès du transporteur ? (Code de commerce, article L133-3 : « La réception des objets transportés éteint toute action contre le voiturier pour avarie ou perte partielle si, dans les trois jours, non compris les jours fériés, qui suivent celui de cette réception, le destinataire n’a pas notifié au voiturier, par acte extrajudiciaire ou par lettre recommandée, sa protestation motivée. »)',
      choix: [{ v: 'trois-jours', lib: '3 jours, jours fériés non compris, par lettre recommandée, en expliquant pourquoi' },
        { v: 'un-mois', lib: '1 mois, par un simple mail' },
        { v: 'jour-meme', lib: 'Le jour même seulement' },
        { v: 'jamais', lib: 'Plus du tout' }],
      juste: 'trois-jours', poids: 1.5, groupe: 'Question de Nadia : protester après la signature',
      retour: 'Sans protestation dans les 3 jours, le transporteur n’a plus à répondre ; une réserve écrite sur le BL règle tout de suite.' },
    { id: 'fut-abime-stock', type: 'fil', de: 'nadia', quand: apresGeste('messagerie:phrase:fut-fuit'), reflexion: true, apres: 'bilan',
      enonce: 'Pourquoi ne met-on pas un fût abîmé en stock avec les autres ?',
      choix: [{ v: 'a-part', lib: 'Il est abîmé : on le met à part, le temps de régler avec la brasserie et le transporteur' },
        { v: 'place', lib: 'Il prendrait trop de place' },
        { v: 'client', lib: 'Il peut encore être livré à un client' },
        { v: 'chauffeur', lib: 'Il faut le rendre au chauffeur tout de suite' }],
      retour: 'Un fût abîmé n’est pas du stock : on le met à part le temps de régler.' },
  ],
};
