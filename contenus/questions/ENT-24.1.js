// Les questions d'ENT-24.1 — Kuehne+Nagel (1re, guidage). Décidées par Claude (délégation de Tristan du 26/10/2026). 3 notées au fil (part 4), dont
// une d'éco-droit appliquée au cas (les bonnes pratiques de distribution des médicaments), et une réflexion. « Avant de commencer » : non noté.
import { apresFiche } from '../../core/declencheurs.js';
import { BANQUE, OUVERTURE, PERSONNES } from '../kuehne-nagel.js';

export const QUESTIONS = {
  id: 'kuehne-nagel-prealertes',
  part: 4,
  personnes: PERSONNES,
  ouverture: OUVERTURE(),
  liste: [
    ...BANQUE,
    { id: 'congele', type: 'fil', de: 'karim', groupe: 'Les zones', quand: apresFiche('f241-zones'),
      enonce: 'Des vaccins « +2 °C à +8 °C » rangés par erreur à -20 °C : on peut les livrer ?',
      choix: [{ v: 'part', lib: 'Non : je les mets à part et je préviens, on vérifie s’ils sont encore bons' }, { v: 'oui', lib: 'Oui : le froid, ça conserve mieux' },
        { v: 'jeter', lib: 'Je les jette sans rien dire' }],
      juste: 'part', retour: 'Trop froid abîme un vaccin autant que trop chaud : c’est la température de l’étiquette, ni plus ni moins.' },
    { id: 'pourquoi-duree', type: 'fil', de: 'sophie', groupe: 'Les durées', quand: apresFiche('f241-durees'),
      enonce: 'Pourquoi calculer la durée de chaque réception à l’avance ?',
      choix: [{ v: 'quai', lib: 'Pour réserver chaque quai le temps qu’il faut, sans le bloquer pour rien' }, { v: 'paie', lib: 'Pour calculer la paie de l’équipe' },
        { v: 'rien', lib: 'Ça ne sert à rien' }],
      juste: 'quai', retour: 'Les quais froids sont rares : chaque quart d’heure compte.' },
    { id: 'droit-bpd', type: 'fil', de: 'sophie', groupe: 'Préparer', quand: apresFiche('f241-preparer'),
      enonce: 'D’après les bonnes pratiques de distribution des médicaments, la température d’un médicament doit être…',
      choix: [{ v: 'tout', lib: 'respectée, surveillée et enregistrée pendant tout le stockage et le transport' }, { v: 'arrivee', lib: 'vérifiée seulement à l’arrivée chez le client' },
        { v: 'libre', lib: 'choisie par le transporteur' }],
      juste: 'tout', retour: 'C’est ce qui permet de prouver qu’un médicament est resté bon tout au long du voyage.' },
    { id: 'ordre', type: 'fil', de: 'sophie', reflexion: true, quand: apresFiche('f241-premier'),
      enonce: 'À ton avis, qu’est-ce qui décide le plus de l’ordre des réceptions ?',
      choix: [{ v: 'limite', lib: 'L’heure limite des envois' }, { v: 'dispo', lib: 'L’heure où ils sont disponibles' }, { v: 'valeur', lib: 'Le prix de la marchandise' }],
      retour: 'Merci. On le verra demain sur le planning des quais.' },
  ],
};
