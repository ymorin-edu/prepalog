// Les questions d'ENT-22.9 — Schneider Electric (CAP, entraînement C3.7 et C3.6). Décidées par Claude (délégation de Tristan du 26/10/2026).
// 3 notées au fil (part 4) et une réflexion. « Avant de commencer » : non noté (banque de `contenus/schneider.js`).
import { apresFiche } from '../../core/declencheurs.js';
import { BANQUE, OUVERTURE, PERSONNES } from '../schneider.js';

export const QUESTIONS = {
  id: 'schneider-circulaire',
  part: 4,
  personnes: PERSONNES,
  ouverture: OUVERTURE(),
  liste: [
    ...BANQUE,
    { id: 'pourquoi-trier', type: 'fil', de: 'nadia', groupe: 'Le tri au quai', quand: apresFiche('f229-tri'),
      enonce: 'Pourquoi séparer le carton et le film plastique ?',
      choix: [{ v: 'recycler', lib: 'Ils ne se recyclent pas de la même façon : mélangés, on ne peut rien recycler' }, { v: 'poids', lib: 'Pour que la benne soit moins lourde' }, { v: 'rien', lib: 'Pour rien' }],
      juste: 'recycler', retour: 'Une benne de carton sale de plastique part à l’incinération.' },
    { id: 'argent', type: 'fil', de: 'nadia', groupe: 'Les faits', quand: apresFiche('f229-faits'),
      enonce: 'Moins d’énergie et moins de palettes neuves, pour l’entreprise, c’est…',
      choix: [{ v: 'economies', lib: 'Des économies, et moins de pollution' }, { v: 'pertes', lib: 'Des pertes d’argent' }, { v: 'rien', lib: 'Ça ne change rien' }],
      juste: 'economies', retour: 'Un geste écologique est souvent aussi un geste économique.' },
    { id: 'part', type: 'fil', de: 'nadia', groupe: 'Un calcul', quand: apresFiche('f229-calcul'),
      enonce: 'Et les cartons qui ne sont pas recyclés, combien par jour ?',
      choix: [{ v: '2200', lib: '2 200' }, { v: '2800', lib: '2 800' }, { v: '5000', lib: '5 000' }],
      juste: '2200', retour: '5 000 − 2 800 = 2 200 : il reste des progrès à faire.' },
    { id: 'chez-moi', type: 'fil', de: 'nadia', reflexion: true, quand: apresFiche('f229-gestes'),
      enonce: 'Un écogeste que tu fais aussi chez toi ?',
      choix: [{ v: 'tri', lib: 'Trier les déchets' }, { v: 'lumiere', lib: 'Éteindre la lumière' }, { v: 'reparer', lib: 'Réparer plutôt que jeter' }, { v: 'aucun', lib: 'Aucun pour l’instant' }],
      retour: 'Ce sont les mêmes gestes, au quai comme à la maison.' },
  ],
};
