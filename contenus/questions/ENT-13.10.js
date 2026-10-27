// Les questions d'ENT-13.10 — Stellantis, « l'équipe du matin » (Terminale, guidage C3.4). Décidées par Claude (délégation de Tristan du 26/10/2026).
// 3 notées au fil (part 4), dont une d'éco-droit (qui organise la formation renforcée, L4154-2), et une réflexion. « Avant de commencer » : non noté.
import { apresFiche, apresMail } from '../../core/declencheurs.js';
import { BANQUE, OUVERTURE, PERSONNES, MAIL_KARIM } from '../stellantis-equipe.js';

export const QUESTIONS = {
  id: 'stellantis-equipe-matin',
  part: 4,
  personnes: PERSONNES,
  ouverture: OUVERTURE(),
  liste: [
    ...BANQUE,
    { id: 'pourquoi-ligne', type: 'fil', de: 'karim', groupe: 'Les postes', quand: apresFiche('f1310-affectation'),
      enonce: 'Pourquoi affecte-t-on d’abord le bord de ligne ?',
      choix: [{ v: 'arret', lib: 'Si la ligne manque de pièces, elle s’arrête, et avec elle des centaines de personnes' }, { v: 'agreable', lib: 'C’est le poste le plus agréable' },
        { v: 'hasard', lib: 'Peu importe l’ordre' }],
      juste: 'arret', retour: 'Une chaîne à l’arrêt immobilise environ 1 200 personnes : le bord de ligne passe avant tout.' },
    { id: 'qui-forme', type: 'fil', de: 'karim', groupe: 'L’accueil de Théo', quand: apresFiche('f1310-accueil'),
      enonce: 'Qui doit organiser la formation renforcée à la sécurité de Théo ?',
      choix: [{ v: 'usine', lib: 'L’usine, où il travaille : c’est elle qui connaît les risques du poste' }, { v: 'agence', lib: 'L’agence d’intérim, une fois pour toutes' },
        { v: 'personne', lib: 'Personne : il est intérimaire' }],
      juste: 'usine', retour: 'Code du travail, L4154-2 : la formation renforcée se fait dans l’entreprise où l’intérimaire est mis à disposition.' },
    { id: 'consigne-ecrite', type: 'fil', de: 'karim', groupe: 'La consigne', quand: apresFiche('f1310-consigne'),
      enonce: 'Pourquoi écrire la consigne du jour, plutôt que la dire seulement ?',
      choix: [{ v: 'relire', lib: 'Chacun peut la relire, et la relève sait ce qui a été décidé' }, { v: 'punir', lib: 'Pour pouvoir sanctionner ceux qui ne la suivent pas' },
        { v: 'rien', lib: 'Ça ne sert à rien, c’est l’habitude' }],
      juste: 'relire', retour: 'Une consigne écrite évite les oublis et les « on ne m’avait pas dit » ; elle ne dit rien de personnel.' },
    { id: 'ressenti', type: 'fil', de: 'karim', reflexion: true, quand: apresMail({ a: MAIL_KARIM }),
      enonce: 'Tenir l’équipe, même une matinée, ça t’a paru…',
      choix: [{ v: 'facile', lib: 'Plus facile que prévu' }, { v: 'normal', lib: 'Faisable, avec les documents' }, { v: 'dur', lib: 'Difficile : il faut penser à tout' }],
      retour: 'Merci : on en reparle ensemble à la prochaine séance.' },
  ],
};
