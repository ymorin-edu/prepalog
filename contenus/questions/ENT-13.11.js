// Les questions d'ENT-13.11 — Stellantis, « un absent, une pointe de 5008 » (Terminale, entraînement C3.4). Décidées par Claude (délégation de Tristan
// du 26/10/2026). 3 notées au fil (part 4), dont une d'éco-droit (l'aménagement raisonnable, L5213-6), et une réflexion. « Avant de commencer » : non noté.
import { apresFiche, apresMail } from '../../core/declencheurs.js';
import { BANQUE, OUVERTURE, PERSONNES, MAIL_KARIM } from '../stellantis-equipe.js';

export const QUESTIONS = {
  id: 'stellantis-equipe-pointe',
  part: 4,
  personnes: PERSONNES,
  ouverture: OUVERTURE(),
  liste: [
    ...BANQUE,
    { id: 'prevenir', type: 'fil', de: 'karim', groupe: 'Les postes', quand: apresFiche('f1311-affectation'),
      enonce: 'Ta nouvelle répartition, quand l’annonces-tu à l’équipe ?',
      choix: [{ v: 'avant', lib: 'Avant la prise de poste, à toute l’équipe en même temps' }, { v: 'pause', lib: 'À la pause, quand tout le monde est là' },
        { v: 'jamais', lib: 'Je ne dis rien : chacun verra bien' }],
      juste: 'avant', retour: 'Chacun doit savoir où il est avant de commencer : sinon deux personnes vont au même poste, et un autre reste vide.' },
    { id: 'pointe', type: 'fil', de: 'karim', groupe: 'La charge des kits', quand: apresFiche('f1311-charge'),
      enonce: 'Pourquoi plus de 5008 demande-t-il plus de monde aux kits ?',
      choix: [{ v: 'pieces', lib: 'Un kit de 5008 a plus de pièces : il prend plus de temps' }, { v: 'voitures', lib: 'La ligne fait plus de voitures' },
        { v: 'lourd', lib: 'Les 5008 sont plus lourdes à pousser' }],
      juste: 'pieces', retour: 'Même nombre de voitures, mais des kits plus longs : c’est la part de 5008 qui fait la charge.' },
    { id: 'droit-amenagement', type: 'fil', de: 'karim', groupe: 'Le poste d’Amel', quand: apresFiche('f1311-amel'),
      enonce: 'Aménager le poste d’un travailleur handicapé, pour l’employeur, c’est…',
      choix: [{ v: 'obligation', lib: 'Une obligation : prendre les mesures appropriées, sauf si elles coûtent de façon disproportionnée' },
        { v: 'faveur', lib: 'Une faveur, s’il le veut bien' }, { v: 'interdit', lib: 'Interdit : tout le monde doit avoir le même poste' }],
      juste: 'obligation', retour: 'Code du travail, L5213-6 : c’est l’« aménagement raisonnable ». Garder Amel à son poste, c’est la règle, pas un cadeau.' },
    { id: 'ressenti', type: 'fil', de: 'karim', reflexion: true, quand: apresMail({ a: MAIL_KARIM }),
      enonce: 'Qu’est-ce qui t’a paru le plus difficile ce matin ?',
      choix: [{ v: 'postes', lib: 'Réaffecter les postes' }, { v: 'calcul', lib: 'Le calcul des kits' }, { v: 'amel', lib: 'Le poste d’Amel' },
        { v: 'secret', lib: 'Répondre à Sébastien' }],
      retour: 'Merci : on en reparle ensemble à la prochaine séance.' },
  ],
};
