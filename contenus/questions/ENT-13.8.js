// Les questions d'ENT-13.8 — Stellantis, « le camion en retard » (Terminale, entraînement C2.3, erreur induite). Décidées par Claude (délégation de
// Tristan du 27/10/2026). 3 notées au fil (part 4), dont une d'éco-droit (l'activité partielle, R5122-1), et une réflexion. « Avant de commencer » : non noté.
import { apresFiche, apresGeste, apresMail } from '../../core/declencheurs.js';
import { BANQUE, OUVERTURE, PERSONNES, MAIL_KARIM } from '../stellantis-ligne.js';

export const QUESTIONS = {
  id: 'stellantis-camion-en-retard',
  part: 4,
  personnes: PERSONNES,
  ouverture: OUVERTURE(),
  liste: [
    ...BANQUE,
    { id: 'qui-prevenir', type: 'fil', de: 'karim', groupe: 'Le camion en retard', quand: apresGeste('ligne:st-ligne-138:fini'),
      enonce: 'Quand la ligne risque de s’arrêter faute de pièces, qui prévenir en premier ?',
      choix: [{ v: 'atelier', lib: 'La cheffe d’atelier du montage : c’est sa ligne et ses 1 200 personnes' }, { v: 'transporteur', lib: 'Le transporteur seulement' },
        { v: 'personne', lib: 'Personne, pour ne pas inquiéter' }],
      juste: 'atelier', retour: 'Prévenue tôt, Sandrine peut réorganiser l’atelier ; prévenue trop tard, elle subit l’arrêt.' },
    { id: 'pas-vider', type: 'fil', de: 'karim', groupe: 'La note de Julien', quand: apresFiche('f138-note'),
      enonce: 'Pourquoi ne pas vider tout de suite le transstockeur au bord de ligne quand un camion est en retard ?',
      choix: [{ v: 'total', lib: 'Le poste n’a que deux places, et ça ne change rien au nombre de pièces qui restent' },
        { v: 'interdit', lib: 'C’est interdit le matin' }, { v: 'lent', lib: 'Les robots iraient trop lentement' }],
      juste: 'total', retour: 'Rapprocher les pièces ne les multiplie pas : seul le convoi de secours en apporte d’autres.' },
    { id: 'indemnite', type: 'fil', de: 'karim', groupe: 'Le droit', quand: apresFiche('f138-note'),
      enonce: 'Avril 2023 : Sochaux s’arrête neuf jours faute de boîtes de vitesses, en activité partielle. Pendant ces jours-là, les salariés…',
      choix: [{ v: 'indemnite', lib: 'reçoivent une indemnité versée par l’employeur, en partie remboursée par l’État' },
        { v: 'rien', lib: 'ne reçoivent rien' }, { v: 'conges', lib: 'perdent leurs congés' }],
      juste: 'indemnite', retour: 'Code du travail, R5122-1 (« Le droit », à gauche) : les difficultés d’approvisionnement font partie des motifs.' },
    { id: 'ressenti', type: 'fil', de: 'karim', reflexion: true, quand: apresMail({ a: MAIL_KARIM }),
      enonce: 'Quand le message du camion est arrivé, tu t’es senti(e)…',
      choix: [{ v: 'calme', lib: 'Calme : j’avais de quoi calculer' }, { v: 'presse', lib: 'Pressé(e), mais j’ai trouvé' }, { v: 'perdu', lib: 'Perdu(e)' }],
      retour: 'Merci : on en reparle ensemble à la prochaine séance.' },
  ],
};
