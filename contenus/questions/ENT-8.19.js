// Les questions d'ENT-8.19 — Action, évaluation « préparer une commande dans un autre site » (brief `docs/briefs/ENT-8.19-action-evaluation-preparation.md`
// §4). Modifier ce fichier suffit : voir « Modifier les questions d'une séance » dans `activites/FICHE-SEANCE.md`.
//
// ÉVALUATION : AUCUNE question au fil. Seul l'écran « Avant de commencer » est NOTÉ (`part: 4`) : 8 questions clés reprises des séances ENT-8.15 à
// 8.18, deux par rubrique ; l'élève en reçoit 4, une par rubrique (`tirage: { preparation: 1, destocker: 1, conditionner: 1, ecodroit: 1 }`) :
// `q-circuit` ou `q-code` (8.15) ; `q-abime` ou `q-vide` (8.16) ; `q-lourd` ou `q-film` (8.17) ; éco-droit `q-nuit` (8.15) ou `q-retour` (8.18).
// Aucune aide, aucun mot cliquable, « Je ne sais pas » ajouté par le moteur ; juste +1, « Je ne sais pas » 0, fausse −1 ÷ (nombre de mauvaises
// réponses), plancher 0. RÉPONSES RÉÉCRITES : aucune phrase juste n'est identique à celle des séances de travail. `q-code` ajoutée par Claude Code
// (le moteur veut une banque double du tirage). Comme en ENT-8.14, les questions disent « ton tuteur », jamais son prénom (le moteur ne sait pas
// écrire le site dans une question d'ouverture). Les `retour` (jamais montrés en évaluation) sont écrits par Claude Code.

import { ID } from '../action-ent819-donnees.js';

export const TUTEUR = { nom: 'Ton tuteur', role: 'chef d’équipe', appel: 'Ton tuteur', registre: 'tu' };
const q = (id, rubrique, doc, enonce, choix, juste, retour) => ({ id, type: 'ouverture', de: 'tuteur', doc, rubrique, enonce, choix, juste, retour });

export const QUESTIONS = {
  id: ID,
  part: 4,
  personnes: { tuteur: TUTEUR },
  ouverture: { id: 'avant-de-commencer', de: 'tuteur', part: 4, titre: 'Avant de commencer', continuer: 'voir l’accueil',
    situation: 'Bonjour ! Avant de commencer ta journée, réponds à ces quatre questions. Elles comptent dans ta note.',
    documents: ['stage', 'droit'],
    tirage: { preparation: 1, destocker: 1, conditionner: 1, ecodroit: 1 },
    questions: ['q-circuit', 'q-code', 'q-abime', 'q-vide', 'q-lourd', 'q-film', 'q-nuit', 'q-retour'] },
  liste: [
    q('q-circuit', 'preparation', 'stage', 'Le terminal t’envoie d’une adresse à l’autre dans un ordre fixé. Pourquoi cet ordre ?',
      [{ v: 'court', lib: 'pour marcher le moins possible, sans revenir sur ses pas' }, { v: 'alpha', lib: 'pour suivre l’ordre alphabétique des produits' },
        { v: 'hasard', lib: 'il n’y a pas de raison' }], 'court', 'Le circuit : le chemin le plus court, toujours dans le même sens.'),
    q('q-code', 'preparation', 'stage', 'Tu tapes le code écrit sur la lisse. À quoi ça sert ?',
      [{ v: 'prouver', lib: 'le système sait que tu es devant le bon emplacement' }, { v: 'compter', lib: 'le système compte les cartons' },
        { v: 'ouvrir', lib: 'le carton se déverrouille' }], 'prouver', 'Le code de contrôle prouve l’emplacement.'),
    q('q-abime', 'destocker', 'stage', 'Pourquoi un carton abîmé ne part-il pas au magasin ?',
      [{ v: 'vendre', lib: 'le magasin ne pourrait pas le vendre : il reviendrait' }, { v: 'repare', lib: 'le magasin le réparerait' },
        { v: 'personne', lib: 'il partirait, personne ne regarde' }], 'vendre', 'Un abîmé envoyé, c’est un retour et de l’argent perdus.'),
    q('q-vide', 'destocker', 'stage', 'Un emplacement est vide. Qui descend une palette de la réserve ?',
      [{ v: 'cariste', lib: 'le cariste, avec un chariot qui monte' }, { v: 'moi', lib: 'moi, avec mon transpalette' }, { v: 'chauffeur', lib: 'le chauffeur du camion' }],
      'cariste', 'Le préparateur signale, le cariste descend.'),
    q('q-lourd', 'conditionner', 'stage', 'Pourquoi met-on les cartons lourds en bas de la palette ?',
      [{ v: 'tient', lib: 'elle tient mieux et rien n’écrase les cartons du dessous' }, { v: 'voir', lib: 'on les voit mieux' }, { v: 'vite', lib: 'ça va plus vite' }],
      'tient', 'Lourds en bas : une palette stable, pas de casse.'),
    q('q-film', 'conditionner', 'stage', 'À quoi sert le film autour de la palette ?',
      [{ v: 'tenir', lib: 'à garder les cartons ensemble jusqu’au magasin' }, { v: 'cacher', lib: 'à cacher les produits' }, { v: 'pluie', lib: 'à protéger de la pluie au magasin' }],
      'tenir', 'Le film tient la palette pendant le transport.'),
    q('q-nuit', 'ecodroit', 'droit', 'Tu as 16 ans. L’équipe commence à 5 h. Peux-tu commencer avec elle ? (Lis « Le droit ».)',
      [{ v: 'non', lib: 'non : avant 6 h, c’est du travail de nuit, interdit avant 18 ans' }, { v: 'oui', lib: 'oui, si mon tuteur est d’accord' },
        { v: 'paye', lib: 'oui, si je suis payé plus' }], 'non', 'L3163-1 et L3163-2 : pas de travail entre 22 h et 6 h avant 18 ans.'),
    q('q-retour', 'ecodroit', 'stage', 'Un carton est parti au mauvais magasin. Le renvoyer, ça coûte…',
      [{ v: 'transport', lib: 'un camion de plus : du carburant, du temps, de l’argent' }, { v: 'rien', lib: 'rien du tout' },
        { v: 'appel', lib: 'juste un coup de téléphone' }], 'transport', 'La bonne palette du premier coup : un transport de moins.'),
  ],
};
