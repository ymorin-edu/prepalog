// ENT-2.5 — Cdiscount, ÉVALUATION « Le compte à rebours » (C1.6, 1L, coefficient 3). Copie rendue.
//
// Seul, sur l'allée C (jamais vue dans la série) : exporter les lignes de préparation, analyser
// dans le tableur (Écart, SI, NB.SI), déposer son fichier (un dépôt, aucun retour), envoyer sa liste
// à Nadia, faire l'inventaire de cette liste (aucune correction à l'écran), rendre compte, rendre sa
// copie. UN JEU TIRÉ PAR ÉLÈVE (graine = son identifiant) : même structure pour tous (trois écarts,
// un de chaque sorte), chiffres différents. Douze jalons pondérés (somme des poids = 20, règle du 10/10/2026) ; note figée à la
// remise. Écrite le 04/10/2026 (brief `docs/briefs/ENT-2.5-compte-a-rebours.md`). Données et
// tirage : `contenus/cdiscount-compte-a-rebours.js` ; corrigé par élève :
// `contenus/corriges/ENT-2.5.js`. Pas de trame (décision de la série).
//
// Livrée fermée (`pret: true, ouverture: 'prof'`) : Tristan l'ouvre le jour de l'évaluation.

import { seanceEntreprise } from '../core/types/seance-entreprise.js';
import * as CDISCOUNT from '../contenus/cdiscount.js';
import * as SEANCE from '../contenus/cdiscount-compte-a-rebours.js';
const s = seanceEntreprise(CDISCOUNT, SEANCE, {
  id: 'cdiscount-compte-a-rebours',
  code: 'ENT-2.5',
  titre: 'Cdiscount — le compte à rebours',
  desc: 'Seul, sur une allée neuve : exporter, analyser, choisir quoi compter, compter, décider, rendre compte. Tu rends ta copie.',
  // Compétences et temps pédagogique : voir core/competences.js.
  competences: ['C1.6'],
  temps: 'evaluation',
  bareme: 20,           // jalons pondérés, somme des poids = 20
  copie: true,
  pret: true,
  ouverture: 'prof',
}, {
  // Les écrans de données du menu (05/10/2026) : ceux dont la séance se sert, et au moindre doute on les garde.
  menu: ['commandes', 'stock', 'catalogue', 'console'],
  exercice: SEANCE.EXERCICE,
  // L'inventaire est TIRÉ : une fonction de la graine de l'élève (le moteur la pose à l'ouverture).
  inventaire: SEANCE.inventaireDe,
  tableur: SEANCE.TABLEUR,
});
export const meta = s.meta;
export const rendre = s.rendre;
export const noter = s.noter;
