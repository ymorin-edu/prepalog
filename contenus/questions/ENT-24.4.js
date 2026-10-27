// Les questions d'ENT-24.4 — Kuehne+Nagel (1re, entraînement, erreur induite). Décidées par Claude (délégation de Tristan du 26/10/2026). 3 notées
// au fil (part 4), dont une d'éco-droit appliquée au cas, et une réflexion. « Avant de commencer » : non noté.
import { apresFiche } from '../../core/declencheurs.js';
import { BANQUE, OUVERTURE, PERSONNES } from '../kuehne-nagel.js';

export const QUESTIONS = {
  id: 'kuehne-nagel-lucas',
  part: 4,
  personnes: PERSONNES,
  ouverture: OUVERTURE(),
  liste: [
    ...BANQUE,
    { id: 'verifier', type: 'fil', de: 'sophie', groupe: 'Les défauts', quand: apresFiche('f244-defauts'),
      enonce: 'Pourquoi vérifier le planning d’un collègue avant de le lancer ?',
      choix: [{ v: 'tot', lib: 'Parce qu’une erreur trouvée avant l’arrivée des camions ne coûte rien' }, { v: 'chef', lib: 'Pour montrer qu’on est meilleur que lui' },
        { v: 'jamais', lib: 'On ne vérifie jamais le travail d’un collègue' }],
      juste: 'tot', retour: 'Une fois les vaccins sur le quai, il est trop tard pour se rendre compte qu’il n’y a pas de place au froid.' },
    { id: 'chevauche', type: 'fil', de: 'lucas', groupe: 'Corriger', quand: apresFiche('f244-corriger'),
      enonce: 'Pourquoi pas la pièce d’avion C à 7 h 30 ?',
      choix: [{ v: 'E', lib: 'Parce que le quai 4 reçoit encore l’électronique E jusqu’à 7 h 35' }, { v: 'tot', lib: 'Parce qu’elle n’est pas disponible' },
        { v: 'zone', lib: 'Parce que ce n’est pas sa zone' }],
      juste: 'E', retour: 'E commence à 6 h 30 et dure 65 minutes : le quai 4 est pris jusqu’à 7 h 35.' },
    { id: 'droit-salarie', type: 'fil', de: 'sophie', groupe: 'Les règles oubliées', quand: apresFiche('f244-regles'),
      enonce: 'Lucas s’est trompé. D’après le Code du travail, l’employeur doit d’abord…',
      choix: [{ v: 'former', lib: 'former ses salariés aux règles et aux risques de leur poste' }, { v: 'sanctionner', lib: 'le sanctionner tout de suite' },
        { v: 'rien', lib: 'ne rien faire' }],
      juste: 'former', retour: 'L’employeur a une obligation de formation à la sécurité et d’adaptation au poste : une erreur se corrige d’abord en expliquant.' },
    { id: 'collegue', type: 'fil', de: 'sophie', reflexion: true, quand: apresFiche('f244-regles'),
      enonce: 'Comment dire à un collègue qu’il s’est trompé ?',
      choix: [{ v: 'seul', lib: 'Seul à seul, en montrant la règle' }, { v: 'tous', lib: 'Devant toute l’équipe' }, { v: 'chef', lib: 'En le disant seulement à la cheffe' }],
      retour: 'Merci : chacun a sa façon, l’important est que l’erreur ne se reproduise pas.' },
  ],
};
