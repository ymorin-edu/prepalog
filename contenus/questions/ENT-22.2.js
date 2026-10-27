// Les questions d'ENT-22.2 — Schneider Electric (CAP, guidage). Décidées par Claude (délégation de Tristan du 26/10/2026). 3 notées au fil (part 4)
// et une réflexion. « Avant de commencer » : non noté (banque de `contenus/schneider.js`).
import { apresFiche } from '../../core/declencheurs.js';
import { BANQUE, OUVERTURE, PERSONNES } from '../schneider.js';

export const QUESTIONS = {
  id: 'schneider-accueil',
  part: 4,
  personnes: PERSONNES,
  ouverture: OUVERTURE(),
  liste: [
    ...BANQUE,
    { id: 'cles', type: 'fil', de: 'nadia', groupe: 'Le protocole', quand: apresFiche('f222-protocole'),
      enonce: 'Pourquoi le chauffeur te remet-il ses clés ?',
      choix: [{ v: 'partir', lib: 'Pour que le camion ne parte pas pendant que je décharge' }, { v: 'garder', lib: 'Pour que je garde le camion le soir' }, { v: 'rien', lib: 'Pour rien' }],
      juste: 'partir', retour: 'Un camion qui avance pendant le déchargement peut faire tomber le chariot et le cariste du quai.' },
    { id: 'scelle-pourquoi', type: 'fil', de: 'nadia', groupe: 'Le pré-contrôle', quand: apresFiche('f222-precontrole'),
      enonce: 'Le scellé n’a pas le bon numéro. Que peut-il s’être passé ?',
      choix: [{ v: 'ouvert', lib: 'Quelqu’un a peut-être ouvert le camion pendant le transport' }, { v: 'joli', lib: 'Le chauffeur a changé de scellé pour faire joli' }, { v: 'normal', lib: 'C’est normal, ça arrive tout le temps' }],
      juste: 'ouvert', retour: 'Il manque peut-être de la marchandise : c’est Nadia qui décide de la suite.' },
    { id: 'chauffeur', type: 'fil', de: 'nadia', groupe: 'Les colis lourds', quand: apresFiche('f222-lourds'),
      enonce: 'Pendant le déchargement, où attend le chauffeur ?',
      choix: [{ v: 'salle', lib: 'En salle des chauffeurs' }, { v: 'quai', lib: 'Sur le quai, pour m’aider' }, { v: 'cabine', lib: 'Dans sa cabine, moteur allumé' }],
      juste: 'salle', retour: 'Le chauffeur ne monte pas sur le quai : c’est le protocole.' },
    { id: 'apres-quai', type: 'fil', de: 'nadia', reflexion: true, quand: apresFiche('f222-lourds'),
      enonce: 'Qu’est-ce qui t’a paru le plus important au quai ?',
      choix: [{ v: 'securite', lib: 'La sécurité : les clés, les colis lourds' }, { v: 'scelle', lib: 'Le scellé' }, { v: 'palettes', lib: 'Compter les palettes' }],
      retour: 'Tout compte : le protocole protège l’équipe et la marchandise.' },
  ],
};
