// Les questions d'ENT-2.8 — Cdiscount, « une tournée pour cinq commandes » (entraînement). Décidées par Claude (délégation de Tristan du 26/10/2026).
// 3 questions notées au fil (part 4 sur 20) et une réflexion d'éco-droit (la santé des préparateurs). « Avant de commencer » : non noté (banque commune).

import { apresGeste, apresFiche, apresMail } from '../../core/declencheurs.js';
import { BANQUE, OUVERTURE, PERSONNES, MAIL_NADIA } from '../cdiscount-noel.js';

const F = 'fiche-28';

export const QUESTIONS = {
  id: 'cdiscount-par-lots',
  part: 4,
  personnes: PERSONNES,
  ouverture: OUVERTURE(),
  liste: [
    ...BANQUE,
    { id: 'le-plus-loin', type: 'fil', de: 'nadia', groupe: 'Les deux méthodes', quand: apresGeste(`fiche:${F}:cmd`),
      enonce: 'La commande C-4808 a trois lignes, en M-09, M-02 et M-07. Combien de mètres pour elle seule ?',
      choix: [{ v: '72', lib: '72 m : jusqu’à M-09 et retour, on passe devant les deux autres' }, { v: '144', lib: '144 m : un aller-retour par ligne' },
        { v: '36', lib: '36 m : seulement l’aller' }],
      juste: '72', retour: 'La tournée va jusqu’au plus loin (36 m) et revient : 72 m. M-02 et M-07 sont sur le chemin.' },
    { id: 'pourquoi-tri', type: 'fil', de: 'nadia', groupe: 'Les deux méthodes', quand: apresGeste(`fiche:${F}:tri`),
      enonce: 'Pourquoi les lots ajoutent-ils du temps au poste d’emballage ?',
      choix: [{ v: 'melange', lib: 'Les articles de cinq commandes arrivent ensemble : il faut les répartir par commande' },
        { v: 'lourd', lib: 'Le chariot est plus lourd' }, { v: 'pause', lib: 'Le préparateur fait une pause entre deux lots' }],
      juste: 'melange', retour: 'Le tri est le prix des lots : c’est pour ça qu’on compare la marche gagnée au tri ajouté, et pas la marche seule.' },
    { id: 'express', type: 'fil', de: 'nadia', groupe: 'Les deux méthodes', quand: apresFiche(F),
      enonce: 'Une commande express doit partir dans 10 minutes. Tu la mets dans le prochain lot ?',
      choix: [{ v: 'seule', lib: 'Non : je la prépare seule, tout de suite' }, { v: 'lot', lib: 'Oui : un lot, c’est plus efficace' },
        { v: 'fin', lib: 'Je la garde pour la fin de la vague' }],
      juste: 'seule', retour: 'Un lot attend d’être complet puis trié : une commande pressée passe avant l’efficacité.' },
    { id: 'sante', type: 'fil', de: 'nadia', reflexion: true, quand: apresMail({ a: MAIL_NADIA }),
      enonce: 'Moins de mètres marchés chaque jour, à part le temps gagné, qu’est-ce que ça change ?',
      choix: [{ v: 'sante', lib: 'Moins de fatigue pour les préparateurs, et moins de risques pour leur santé' }, { v: 'rien', lib: 'Rien d’autre' },
        { v: 'salaire', lib: 'Les préparateurs sont moins payés' }],
      retour: 'L’employeur doit protéger la santé et la sécurité de ses salariés (Code du travail) : réduire la marche et les gestes répétés en fait partie, surtout pendant le pic.' },
  ],
};
