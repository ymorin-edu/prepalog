// Les questions d'ENT-21.2 — Lidl (2de, entraînement C1.3). Décidées par Claude (délégation de Tristan du 26/10/2026). 3 notées au fil (part 4),
// dont une d'éco-droit, et une réflexion. « Avant de commencer » : non noté.
import { apresFiche, apresMail } from '../../core/declencheurs.js';
import { BANQUE_RECEPTION, OUVERTURE_RECEPTION, PERSONNES, MAIL_FATOU } from '../lidl.js';

export const QUESTIONS = {
  id: 'lidl-planning',
  part: 4,
  personnes: PERSONNES,
  ouverture: OUVERTURE_RECEPTION(),
  liste: [
    ...BANQUE_RECEPTION,
    { id: 'ordre', type: 'fil', de: 'fatou', groupe: 'Les créneaux', quand: apresFiche('f212-creneaux'),
      enonce: 'Trois camions de frais demandent 6 h, et il n’y a que deux quais de frais. Lequel passe à 7 h ?',
      choix: [{ v: 'dernier', lib: 'Celui dont la demande est arrivée la dernière' }, { v: 'gros', lib: 'Le plus gros camion' }, { v: 'hasard', lib: 'Au hasard' }],
      juste: 'dernier', retour: 'Une règle connue de tous (l’ordre des demandes) évite les disputes au quai.' },
    { id: 'attente', type: 'fil', de: 'fatou', groupe: 'La durée', quand: apresFiche('f212-duree'),
      enonce: 'Un camion qui dépasse son créneau, qu’est-ce que ça provoque ?',
      choix: [{ v: 'retard', lib: 'Le camion suivant attend : tout le planning prend du retard' }, { v: 'rien', lib: 'Rien du tout' }, { v: 'gain', lib: 'On gagne du temps' }],
      juste: 'retard', retour: 'C’est pour ça qu’on calcule la durée avant de donner le créneau.' },
    { id: 'droit-temps', type: 'fil', de: 'fatou', groupe: 'Le retard', quand: apresFiche('f212-retard'),
      enonce: 'Le chauffeur en retard te dit qu’il roule depuis très longtemps. Peut-il repartir tout de suite sans pause ?',
      choix: [{ v: 'non', lib: 'Non : la loi limite son temps de conduite et lui impose des pauses' }, { v: 'oui', lib: 'Oui, s’il est pressé' },
        { v: 'chef', lib: 'Oui, si Fatou l’accepte' }],
      juste: 'non', retour: 'Temps de conduite et pauses sont fixés par la réglementation européenne : c’est la sécurité de tous sur la route.' },
    { id: 'planning', type: 'fil', de: 'fatou', reflexion: true, quand: apresMail({ a: MAIL_FATOU }),
      enonce: 'Faire un planning, pour toi, c’est plutôt…',
      choix: [{ v: 'calcul', lib: 'Un calcul : des heures, des quais, des minutes' }, { v: 'choix', lib: 'Des choix : qui passe avant qui' }, { v: 'les-deux', lib: 'Les deux' }],
      retour: 'Merci : on en reparle en classe.' },
  ],
};
