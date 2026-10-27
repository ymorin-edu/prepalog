// Les questions d'ENT-23.6 — Yves Rocher (2de, évaluation C2.2 et C2.1, copie rendue). Décidées par Claude (délégation de Tristan du 26/10/2026).
// « Avant de commencer » NOTÉ (`part: 3` sur 20), sans aide : trois questions tirées (2 de préparation, 1 de droit). Une réflexion au fil, non notée.
import { apresFiche } from '../../core/declencheurs.js';
import { BANQUE_PREPA, OUVERTURE_PREPA, PERSONNES } from '../yves-rocher.js';

export const QUESTIONS = {
  id: 'yves-rocher-evaluation',
  personnes: PERSONNES,
  ouverture: OUVERTURE_PREPA({ part: 3, situation: 'Bonjour ! Avant de commencer, lis « La plateforme » à gauche et réponds à mes questions, sans aide.' }),
  liste: [
    ...BANQUE_PREPA,
    { id: 'apres', type: 'fil', de: 'soizic', reflexion: true, quand: apresFiche('f236-reclam'),
      enonce: 'Qu’est-ce qui t’a paru le plus difficile ?',
      choix: [{ v: 'types', lib: 'Cartons complets ou détail' }, { v: 'ordre', lib: 'L’ordre de prélèvement' }, { v: 'chariot', lib: 'L’adresse partagée' },
        { v: 'reclam', lib: 'La réclamation' }],
      retour: 'Merci : on en reparle ensemble à la prochaine séance.' },
  ],
};
