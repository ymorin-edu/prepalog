// ENT-6.3 — France Boissons, « les congés d'été ». Troisième séance du scénario S2 de la 2de GATL
// (brief `docs/briefs/ENT-6.3-france-boissons-conges.md`, règles de `docs/briefs/FRANCE-BOISSONS-refonte.md` §0).
//
// En renfort auprès d'Inès, en entraînement : placer les congés d'été des chauffeurs-livreurs sur 9 semaines (vue Planning,
// sans « Vérifier » : un seul bouton d'envoi), reprendre le planning après le départ de Kevin, répondre à Lucas dont le congé
// est décalé (phrases à choisir, au tu), puis rédiger l'annonce du chauffeur saisonnier (mentions interdites). Données dans
// `contenus/france-boissons-ent63.js`, questions dans `contenus/questions/ENT-6.3.js`, univers dans `contenus/france-boissons.js`.
//
// 27 jalons pondérés + 2 questions notées (`part: 3`), somme = 20 (`bareme: 20`). Une base par séance (pas de `jeuId`).
// Pas de trame (tout à l'écran). Corrigé calculé : `contenus/corriges/ENT-6.3.js`.

import { seanceEntreprise } from '../core/types/seance-entreprise.js';
import * as FB from '../contenus/france-boissons.js';
import * as SEANCE from '../contenus/france-boissons-ent63.js';
const s = seanceEntreprise(FB, SEANCE, {
  id: 'france-boissons-conges',
  code: 'ENT-6.3',
  titre: 'France Boissons — les congés d’été',
  desc: 'Planifier les congés d’été des chauffeurs-livreurs de la tournée de la côte, replanifier après un départ, rédiger l’annonce '
    + 'du chauffeur saisonnier et répondre à un chauffeur dont le congé est décalé.',
  niveaux: ['2de'],
  competences: ['AGO-3.2', 'AGO-3.1'],
  domaines: ['D2', 'D3'],
  temps: 'entrainement',
  bareme: 20,           // jalons pondérés + questions notées, somme = 20
  // Parcours strict : ne s'ouvre qu'à l'élève dont ENT-6.2 a son premier bilan (voir core/parcours.js).
  parcours: true,
  precedente: 'france-boissons-commande',
  // Règle du premier bilan : « Corriger » rouvre le planning (1re version fausse d'abord), l'annonce et le message à Lucas.
  correction: true,
  questions: 'ENT-6.3',
  // Pas de `reinitialisable` : la remise à zéro est réservée aux séances X.1.
  pret: true,
  ouverture: 'prof',
}, SEANCE.OPTIONS);
export const meta = s.meta;
export const rendre = s.rendre;
