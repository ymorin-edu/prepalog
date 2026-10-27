// Les questions d'ENT-22.8 — Schneider Electric (CAP, entraînement). Décidées par Claude (délégation de Tristan du 26/10/2026). 3 notées au fil
// (part 4) et une réflexion. « Avant de commencer » : non noté (banque de `contenus/schneider.js`).
import { apresFiche } from '../../core/declencheurs.js';
import { BANQUE, OUVERTURE, PERSONNES } from '../schneider.js';

export const QUESTIONS = {
  id: 'schneider-drone',
  part: 4,
  personnes: PERSONNES,
  ouverture: OUVERTURE(),
  liste: [
    ...BANQUE,
    { id: 'pourquoi-drone', type: 'fil', de: 'julien', groupe: 'Le relevé du drone', quand: apresFiche('f228-releve'),
      enonce: 'Pourquoi utiliser un drone pour l’inventaire ?',
      choix: [{ v: 'haut', lib: 'Il compte vite les palettes en hauteur, sans chariot ni nacelle' }, { v: 'jouer', lib: 'Pour s’amuser' }, { v: 'livrer', lib: 'Pour livrer les colis' }],
      juste: 'haut', retour: 'Le drone évite de monter en hauteur : moins de risque, moins de temps.' },
    { id: 'main', type: 'fil', de: 'julien', groupe: 'Les écarts', quand: apresFiche('f228-ecarts'),
      enonce: 'Le drone et le système ne sont pas d’accord. Qui croire ?',
      choix: [{ v: 'recompter', lib: 'Personne : on recompte à la main' }, { v: 'drone', lib: 'Le drone, il ne se trompe jamais' }, { v: 'systeme', lib: 'Le système, toujours' }],
      juste: 'recompter', retour: 'Le drone peut mal voir une étiquette : le recomptage tranche.' },
    { id: 'ecart-pourquoi', type: 'fil', de: 'julien', groupe: 'Ranger', quand: apresFiche('f228-ranger'),
      enonce: 'Il manque 3 colis de prises. Une raison possible ?',
      choix: [{ v: 'oubli', lib: 'Une palette rangée sans scanner l’adresse, ou une erreur de préparation' }, { v: 'magie', lib: 'Les colis ont disparu tout seuls' }, { v: 'drone', lib: 'Le drone les a pris' }],
      juste: 'oubli', retour: 'Un écart vient presque toujours d’un geste oublié : d’où l’importance du scan.' },
    { id: 'stock-juste', type: 'fil', de: 'nadia', reflexion: true, quand: apresFiche('f228-ranger'),
      enonce: 'À quoi sert un stock juste dans le système ?',
      choix: [{ v: 'promettre', lib: 'À promettre au client ce qu’on a vraiment' }, { v: 'joli', lib: 'À faire de jolis tableaux' }, { v: 'rien', lib: 'À rien' }],
      retour: 'Si le système croit avoir 60 colis et qu’il n’y en a que 57, une commande ne partira pas.' },
  ],
};
