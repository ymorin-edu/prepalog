// Les questions d'ENT-13.6 — Stellantis, « le bord de ligne » (Terminale, guidage C2.3). Décidées par Claude (délégation de Tristan du 27/10/2026).
// 3 notées au fil (part 3), dont une d'éco-droit (pourquoi si peu de stock au bord de ligne), et une réflexion. « Avant de commencer » : non noté.
import { apresFiche, apresGeste, apresMail } from '../../core/declencheurs.js';
import { BANQUE, OUVERTURE, PERSONNES, MAIL_KARIM } from '../stellantis-ligne.js';

export const QUESTIONS = {
  id: 'stellantis-bord-de-ligne',
  part: 3,
  personnes: PERSONNES,
  ouverture: OUVERTURE(),
  liste: [
    ...BANQUE,
    { id: 'deux-vides', type: 'fil', de: 'karim', groupe: 'Le kanban', quand: apresFiche('f136-kanban'),
      enonce: 'Si la logistique attend que les deux contenants d’un poste soient vides, que se passe-t-il ?',
      choix: [{ v: 'arret', lib: 'Le poste n’a plus de pièces pendant le trajet du robot : la ligne s’arrête' }, { v: 'rien', lib: 'Rien : le robot arrive tout de suite' },
        { v: 'gain', lib: 'On gagne du temps : un seul voyage pour deux contenants' }],
      juste: 'arret', retour: 'Le contenant d’avance sert à ça : tenir le poste pendant que le robot rapporte un plein.' },
    { id: 'pourquoi-grouper', type: 'fil', de: 'karim', groupe: 'La matinée', quand: apresGeste('ligne:st-ligne-136:fini'),
      enonce: 'Pourquoi mettre deux cartes dans le même robot quand le poids le permet ?',
      choix: [{ v: 'libre', lib: 'L’autre robot reste libre pour la carte suivante' }, { v: 'joli', lib: 'Pour que le robot soit plus beau à voir' },
        { v: 'vite', lib: 'Un robot chargé roule plus vite' }],
      juste: 'libre', retour: 'Deux robots pour quatre postes : chaque voyage à moitié vide, c’est un robot qui manquera plus tard.' },
    { id: 'peu-de-stock', type: 'fil', de: 'karim', groupe: 'Le poste 2', quand: apresFiche('f136-couverture'),
      enonce: 'Le poste 2 ne tient que 21 voitures, une vingtaine de minutes. Pourquoi l’usine garde-t-elle si peu de pièces au bord de ligne ?',
      choix: [{ v: 'cout', lib: 'Un stock prend de la place et immobilise de l’argent : en échange, les livraisons doivent être sûres' },
        { v: 'oubli', lib: 'Parce qu’elle oublie de commander' }, { v: 'loi', lib: 'Parce que la loi interdit d’en avoir plus' }],
      juste: 'cout', retour: 'C’est le flux tendu : moins de stock, donc moins d’argent immobilisé, mais aucun droit à l’erreur sur les livraisons.' },
    { id: 'ressenti', type: 'fil', de: 'karim', reflexion: true, quand: apresMail({ a: MAIL_KARIM }),
      enonce: 'Dans la matinée, le plus dur, c’était…',
      choix: [{ v: 'temps', lib: 'Aller assez vite' }, { v: 'poids', lib: 'Penser au poids des contenants' }, { v: 'choisir', lib: 'Choisir quelle carte envoyer d’abord' }],
      retour: 'Merci : on en reparle ensemble à la prochaine séance.' },
  ],
};
