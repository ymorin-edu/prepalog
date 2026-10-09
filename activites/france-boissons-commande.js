// ENT-6.2 — France Boissons, « la commande de La Cabane à Malo ». Deuxième séance du scénario S2 de la 2de GATL
// (brief `docs/briefs/ENT-6.2-france-boissons-commande.md`).
//
// En renfort à l'administration des ventes de Buchelay, en entraînement : lire la commande d'un bar de plage pour la Fête de
// la musique, la confronter au stock et aux conditions de vente (minimum de commande, jour de tournée), remplir le bon de
// commande (cases « nombre », chantier D-2), puis répondre au client par phrases à choisir, au vous. Données dans
// `contenus/france-boissons-ent62.js`, univers commun dans `contenus/france-boissons.js`.
//
// 8 jalons à 1 point (pas de `poids`, pas de `notation`) : la note est ramenée sur 20. Une base par séance (pas de `jeuId`).
// Pas de trame pour l'instant (Cowork, après validation à l'écran). Corrigé calculé : `contenus/corriges/ENT-6.2.js`.

import { seanceEntreprise } from '../core/types/seance-entreprise.js';
import * as FB from '../contenus/france-boissons.js';
import * as SEANCE from '../contenus/france-boissons-ent62.js';
const s = seanceEntreprise(FB, SEANCE, {
  id: 'france-boissons-commande',
  code: 'ENT-6.2',
  titre: 'France Boissons — la commande de La Cabane à Malo',
  desc: 'Renfort à l’administration des ventes de la plateforme de Buchelay : prendre la commande d’un bar de plage pour la '
    + 'Fête de la musique, vérifier le stock et les conditions de vente, proposer un remplacement, confirmer au client.',
  niveaux: ['2de'],
  competences: ['AGO-1.1', 'AGO-1.2'],
  domaines: ['D1', 'D3'],
  temps: 'entrainement',
  // Parcours strict : ne s'ouvre qu'à l'élève dont ENT-6.1 a son premier bilan (voir core/parcours.js).
  parcours: true,
  precedente: 'france-boissons-organigramme',
  // Règle du premier bilan : « Corriger » rouvre le bon de commande et la réponse à Malo, la note est la moyenne du premier
  // bilan et de l'état à la première correction ; ENT-6.3 s'ouvre au premier bilan (voir core/types/entreprise.js).
  correction: true,
  // Pas de `reinitialisable` : la remise à zéro est réservée aux séances X.1 (décision du 02/10/2026, test du bloc `transport`).
  pret: true,
  ouverture: 'prof',
}, SEANCE.OPTIONS);
export const meta = s.meta;
export const rendre = s.rendre;
