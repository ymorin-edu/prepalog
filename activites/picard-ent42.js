// ENT-4.2 — Picard, « deux camions, un seul quai ». Deuxième séance de C1.4 « Traiter les
// opérations de réception de produits selon les procédures », et C1.3 « Préparer l'action de
// réception » (C1.3.2 : adapter l'organisation de la réception selon les aléas — décision de Tristan,
// 03/10/2026) : l'ENTRAÎNEMENT (brief `docs/briefs/ENT-4.2-picard-deux-camions.md`).
//
// Toute la séance se joue sur la vue « quai de réception » (`core/types/quai.js`), à plusieurs
// camions : deux tickets à lire, l'ordre de déchargement à choisir et à justifier, un camion qui se
// réchauffe tant qu'il attend, huit palettes dont quatre aléas, un temps hors froid par lot. Aucune
// aide : seul le bilan juste/faux reste, en fin de réception. Données dans `contenus/picard-ent42.js`.
//
// Pas de `reinitialisable` : réservé aux séances X.1 (décision du 02/10/2026) ; « Recommencer la
// réception » du bilan (la vue) ne remet à zéro que le quai de cette séance.
// Pas de `notation` : comme ENT-4.1, jalons et note sur 20 (le suivi ramène les 30 jalons sur 20).
// Pas de trame : elle viendra de Cowork après la validation à l'écran.

import { creerEntreprise } from '../core/types/entreprise.js';
import * as PICARD from '../contenus/picard.js';
import * as SEANCE from '../contenus/picard-ent42.js';

export const meta = {
  id: 'picard-ent42',
  code: 'ENT-4.2',
  titre: 'Picard — deux camions, un seul quai',
  desc: 'Deux camions de surgelés attendent au quai 32 : lire les deux tickets, choisir et justifier l’ordre de '
    + 'déchargement, puis réceptionner les deux lots sans aide (huit palettes, quatre aléas).',
  rubrique: 'logisim',
  niveaux: ['1re'],
  competences: ['C1.4', 'C1.3'],
  temps: 'entrainement',
  bareme: SEANCE.ETAPES.length,
  immersif: true,
  portee: 'eleve',
  tables: {},
  corrige: './contenus/corriges/ENT-4.2.js',
  pret: true,
  ouverture: 'prof',
};

const moteur = creerEntreprise({
  ENTREPRISE: PICARD.ENTREPRISE,
  VOCAB: PICARD.VOCAB,
  CATALOGUE: PICARD.catalogue(SEANCE.PRODUITS_ENT42),
  SUPPLIERS: PICARD.SUPPLIERS,
  SUP_BY_ID: PICARD.SUP_BY_ID,
  CUSTOMERS: PICARD.CUSTOMERS,
  CM: PICARD.CM,
  baseDeDepart: PICARD.baseDeDepart,
  THEME: PICARD.THEME,
  etapes: SEANCE.ETAPES,
  exercice: 'Séance 2 : deux camions, un seul quai',
  accueil: SEANCE.ACCUEIL,
  volet: SEANCE.VOLET,
  quai: SEANCE.QUAI_ENT42,
});

export function rendre(hote, ctx) { moteur.rendre(hote, ctx); }
