// Les questions d'ENT-23.1 — Yves Rocher (2de, guidage C2.2). Décidées par Claude (délégation de Tristan du 26/10/2026). Soizic est CONSTRUITE.
// 3 questions notées au fil (part 4 sur 20) et une réflexion non notée. « Avant de commencer » : non noté, 3 questions tirées (2 de préparation,
// 1 de droit) dans la banque commune de `contenus/yves-rocher.js`.
import { apresFiche } from '../../core/declencheurs.js';
import { BANQUE_PREPA, OUVERTURE_PREPA, PERSONNES } from '../yves-rocher.js';

export const QUESTIONS = {
  id: 'yves-rocher-bienvenue',
  part: 4,
  personnes: PERSONNES,
  ouverture: OUVERTURE_PREPA(),
  liste: [
    ...BANQUE_PREPA,
    { id: 'filiale', type: 'fil', de: 'soizic', groupe: 'Le voyage', quand: apresFiche('f231-voyage'),
      enonce: 'Une filiale du groupe, c’est…',
      choix: [{ v: 'etranger', lib: 'une société du groupe qui vend la marque dans un autre pays' }, { v: 'boutique', lib: 'une boutique de La Gacilly' },
        { v: 'usine', lib: 'une usine qui fabrique les flacons' }],
      juste: 'etranger', retour: 'La plateforme livre les boutiques de France et les filiales à l’étranger.' },
    { id: 'colisage', type: 'fil', de: 'soizic', groupe: 'Préparer', quand: apresFiche('f231-types'),
      enonce: 'Le colisage du gel douche est de 24. Ça veut dire…',
      choix: [{ v: 'carton', lib: 'qu’un carton du fabricant contient 24 gels douche' }, { v: 'prix', lib: 'qu’un gel douche coûte 24 €' },
        { v: 'stock', lib: 'qu’il reste 24 gels douche en stock' }],
      juste: 'carton', retour: 'Le colisage dit combien d’articles il y a dans un carton.' },
    { id: 'pourquoi-ordre', type: 'fil', de: 'soizic', groupe: 'L’ordre de prélèvement', quand: apresFiche('f231-ordre'),
      enonce: 'Pourquoi passer allée par allée plutôt que dans l’ordre du bon ?',
      choix: [{ v: 'chemin', lib: 'Pour faire le chemin le plus court, sans revenir en arrière' }, { v: 'joli', lib: 'Parce que c’est plus joli' },
        { v: 'regle', lib: 'Parce que le bon est faux' }],
      juste: 'chemin', retour: 'Moins de pas, c’est plus de commandes préparées dans la journée, et moins de fatigue.' },
    { id: 'aimer', type: 'fil', de: 'soizic', reflexion: true, quand: apresFiche('f231-ordre'),
      enonce: 'Qu’est-ce qui te plairait le plus dans ce métier ?',
      choix: [{ v: 'bouger', lib: 'Bouger, ne pas rester assis(e)' }, { v: 'organiser', lib: 'Organiser son parcours' }, { v: 'equipe', lib: 'Travailler en équipe' }],
      retour: 'Merci : on en reparle à la fin de ton stage.' },
  ],
};
