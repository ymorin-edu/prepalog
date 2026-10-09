// Les questions d'ENT-6.1 — France Boissons, bienvenue à Buchelay (brief `docs/briefs/ENT-6.1-france-boissons-organigramme.md`,
// §4 étapes 3 et 4, §6). Modifier ce fichier suffit : voir « Modifier les questions d'une séance » dans
// `activites/FICHE-SEANCE.md`. Personnes et situations CONSTRUITES (organigramme de la plateforme reconstitué).
//
// - `qui-decide-conges` : point d'étape avec Inès, après l'envoi de la fiche « Qui fait quoi ? » (juste ou fausse),
//   NOTÉE (`part: 2`). Le courrier du matin n'arrive qu'après la réponse (condition du volet, `contenus/france-boissons-ent61.js`) ;
//   « Continuer » ouvre le message de Malo (`ferme: 'repondre:msg-malo'`).
// - `pourquoi-pas-helene` : question au fil de Karim, au PREMIER transfert d'un message (quel qu'il soit), réflexion,
//   NON notée.

import { apresFiche, apresGeste } from '../../core/declencheurs.js';
import { EQUIPE } from '../france-boissons.js';

export const QUESTIONS = {
  id: 'france-boissons-organigramme',
  part: 2,
  personnes: { ines: EQUIPE.ines, karim: EQUIPE.karim },
  etapes: [
    { id: 'avant-courrier', de: 'ines', apres: apresFiche('qui-fait-quoi'), ferme: 'repondre:msg-malo',
      titre: 'Point d’étape avant le courrier du matin', continuer: 'le courrier du matin',
      situation: 'Merci, j’ai ta fiche. Avant de te confier le courrier, une question.',
      questions: ['qui-decide-conges'] },
  ],
  liste: [
    { id: 'qui-decide-conges', type: 'transition', de: 'ines',
      enonce: 'Lucas m’écrit qu’il veut décaler ses congés d’été. D’après l’organigramme, à qui dois-je transmettre sa demande pour qu’elle soit décidée ?',
      choix: [{ v: 'karim', lib: 'Karim' }, { v: 'ines', lib: 'Moi, Inès' }, { v: 'nadia', lib: 'Nadia' }, { v: 'helene', lib: 'Hélène' }],
      juste: 'karim', groupe: 'Point d’étape : qui décide',
      retour: 'C’est Karim, son chef, qui décide : il connaît les tournées et sait qui peut remplacer Lucas. Moi, j’enregistre le congé une fois qu’il est décidé : c’est un lien fonctionnel.' },
    { id: 'pourquoi-pas-helene', type: 'fil', de: 'karim', quand: apresGeste('messagerie:transfert'), reflexion: true,
      enonce: 'Je te vois transférer le courrier. Pourquoi ne pas tout envoyer à Hélène, puisqu’elle dirige tout le monde ?',
      choix: [{ v: 'debordee', lib: 'Hélène serait débordée : chaque service traite ce qui le concerne' },
        { v: 'detail', lib: 'Hélène ne connaît pas le détail des tournées ou du quai' },
        { v: 'niveau', lib: 'On ne dérange la directrice que pour ce qu’elle seule peut décider' },
        { v: 'pas-pense', lib: 'Je n’y avais pas pensé' }],
      retour: 'Les trois premières raisons sont vraies toutes les trois ; un organigramme sert justement à envoyer chaque demande au bon niveau.' },
  ],
};
