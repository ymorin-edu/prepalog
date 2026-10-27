// Les questions d'ENT-13.7 — Stellantis, « la matinée sans aide » (Terminale, entraînement C2.3). Décidées par Claude (délégation de Tristan du 27/10/2026).
// 4 notées au fil (part 4), dont une d'éco-droit (la formation aux robots, L6321-1 et L6321-2), et une réflexion. « Avant de commencer » : non noté.
import { apresFiche, apresGeste, apresMail } from '../../core/declencheurs.js';
import { BANQUE, OUVERTURE, PERSONNES, MAIL_KARIM } from '../stellantis-ligne.js';

const fini = apresGeste('ligne:st-ligne-137:fini');
export const QUESTIONS = {
  id: 'stellantis-matinee-sans-aide',
  part: 4,
  personnes: PERSONNES,
  ouverture: OUVERTURE(),
  liste: [
    ...BANQUE,
    { id: 'piece-5008', type: 'fil', de: 'karim', groupe: 'Ce que consomme la ligne', quand: apresFiche('f137-conso'),
      enonce: 'Quelle pièce une 5008 prend-elle en plus d’une 3008, sur tes postes ?',
      choix: [{ v: 'siege', lib: 'Un siège du 3e rang : la 5008 a sept places' }, { v: 'roue', lib: 'Une cinquième roue' }, { v: 'rien', lib: 'Aucune : elles prennent les mêmes pièces' }],
      juste: 'siege', retour: 'Le poste 4 ne travaille que pour les 5008 : trois voitures sur dix.' },
    { id: 'roues-sept', type: 'fil', de: 'karim', groupe: 'La matinée', quand: fini,
      enonce: 'Une carte de roues vient de tomber : il reste la palette d’avance, 28 roues. Combien de minutes avant que le poste manque ?',
      choix: [{ v: '7', lib: '7 minutes (28 ÷ 4)' }, { v: '28', lib: '28 minutes' }, { v: '5', lib: '5 minutes, le temps du robot' }],
      juste: '7', retour: '28 roues, 4 par voiture, une voiture par minute : 7 minutes. Le robot en met 5 : il reste 2 minutes pour l’envoyer.' },
    { id: 'lourds', type: 'fil', de: 'karim', groupe: 'La matinée', quand: fini,
      enonce: 'Deux cartes attendent : roues (palette de 560 kg) et planches de bord (rack de 520 kg). Que fais-tu ?',
      choix: [{ v: 'deux', lib: 'Deux robots, un par carte : ensemble, 1 080 kg dépassent les 1 000 kg' }, { v: 'un', lib: 'Un seul robot : ce sont deux contenants' },
        { v: 'attendre', lib: 'J’attends une carte plus légère pour grouper' }],
      juste: 'deux', retour: 'Grouper, oui, mais dans la limite du robot : deux contenants ET 1 000 kg.' },
    { id: 'formation-robots', type: 'fil', de: 'karim', groupe: 'Le droit', quand: fini,
      enonce: 'Les robots ont remplacé les chariots au bord de ligne. La formation des caristes à ces robots se fait…',
      choix: [{ v: 'travail', lib: 'sur le temps de travail, payée : l’employeur adapte ses salariés à leur poste' },
        { v: 'samedi', lib: 'le samedi, à leurs frais' }, { v: 'demande', lib: 'seulement s’ils la demandent' }],
      juste: 'travail', retour: 'Code du travail, L6321-1 et L6321-2 (« Le droit », à gauche) : l’employeur adapte, la formation est du temps de travail.' },
    { id: 'ressenti', type: 'fil', de: 'karim', reflexion: true, quand: apresMail({ a: MAIL_KARIM }),
      enonce: 'Sans les chiffres affichés, lire les contenants t’a paru…',
      choix: [{ v: 'facile', lib: 'Facile' }, { v: 'normal', lib: 'Faisable, en comptant' }, { v: 'dur', lib: 'Difficile : ça va vite' }],
      retour: 'Merci : on en reparle ensemble à la prochaine séance.' },
  ],
};
