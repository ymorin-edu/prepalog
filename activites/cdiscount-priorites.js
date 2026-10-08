// ENT-2.6 — Cdiscount, BONUS « Cinq recomptages, pas un de plus » (C1.6, 1L). Entraînement,
// coefficient 1, « réservé à ceux qui ont fini » : Tristan l'ouvre lui-même à qui a fini.
//
// L'élève exporte un mois de lignes de préparation des allées A et B (export brut : lignes vides,
// doublons, dates en texte), le nettoie, compte les constats d'écart depuis le dernier inventaire
// (NB.SI.ENS), chiffre l'écart de chaque référence avec la feuille Tarifs (RECHERCHEV), dépose son
// fichier (retour « n résultats justes sur m ») et écrit à Nadia les cinq références où l'écart
// pèse le plus en euros. Écrite le 04/10/2026 (brief `docs/briefs/ENT-2.6-bonus.md`). Données :
// `contenus/cdiscount-priorites.js` ; geste : `core/types/export-tableur.js`.
//
// Livrée fermée (`pret: true, ouverture: 'prof'`).
// Trame élève et corrigé : déposés par Cowork, branchés le 04/10/2026 (brief `docs/briefs/CDISCOUNT-trames-eleve.md`).

import { seanceEntreprise } from '../core/types/seance-entreprise.js';
import * as CDISCOUNT from '../contenus/cdiscount.js';
import * as SEANCE from '../contenus/cdiscount-priorites.js';
const s = seanceEntreprise(CDISCOUNT, SEANCE, {
  id: 'cdiscount-priorites',
  code: 'ENT-2.6',
  titre: 'Cdiscount — cinq recomptages, pas un de plus',
  desc: "Bonus : nettoyer un export d'un mois sur deux allées, chiffrer les écarts et choisir les cinq références à recompter.",
  // Compétences et temps pédagogique : voir core/competences.js.
  competences: ['C1.6'],
  temps: 'entrainement',
  notation: 'avancement',
  trame: 'cdiscount-priorites',
  pret: true,
  ouverture: 'prof',
}, {
  // Les écrans de données du menu (05/10/2026) : ceux dont la séance se sert, et au moindre doute on les garde.
  menu: ['commandes'],
  exercice: SEANCE.EXERCICE,
  tableur: SEANCE.TABLEUR,
});
export const meta = s.meta;
export const rendre = s.rendre;
