// ENT-4.1 — Picard, « le premier camion ». Première séance de C1.4 « Traiter les opérations de
// réception de produits selon les procédures » : le GUIDAGE (brief
// `docs/briefs/ENT-4.1-picard-premier-camion.md`). Suivent ENT-4.2 (entraînement, deux camions),
// ENT-4.3 (erreur induite, réception de nuit), ENT-4.4 (évaluation).
//
// Toute la séance se joue sur la vue « quai de réception » (`core/types/quai.js`) : un camion,
// cinq palettes, un aléa par palette, toutes les aides (règle des couches, détail du comptage,
// repère P1, chef de quai, consignes). Données dans `contenus/picard-ent41.js` (maquette v8),
// univers commun dans `contenus/picard.js` (vérifié / construit en tête du fichier).
//
// ── Pas de `notation` ───────────────────────────────────────────────────────────────────
// Comme Boost : jalons et note sur 20 (le suivi ramène les 18 jalons sur 20). Le temps réel passé
// est mesuré et rangé dans la base (`db.quais['picard-ent41'].reel`, et `detail.quai.reel` du
// score), sans note, pour caler les seuils de rapidité d'ENT-4.4.
// Trame élève Word/PDF déclarée le 03/10/2026, relue et validée par Tristan (générateur dans `outils/`,
// brief `docs/briefs/PICARD-trames-eleve.md`) ; son corrigé s'ajoute au corrigé calculé (`meta.corrige`).

import { creerEntreprise } from '../core/types/entreprise.js';
import * as PICARD from '../contenus/picard.js';
import * as SEANCE from '../contenus/picard-ent41.js';

export const meta = {
  id: 'picard-ent41',
  code: 'ENT-4.1',
  titre: 'Picard — le premier camion',
  desc: 'Réceptionner un camion de surgelés au quai 32 : lire le ticket de température, faire décharger, '
    + 'contrôler chaque palette, refuser ou émettre des réserves précises, rentrer le lot en chambre froide.',
  rubrique: 'logisim',
  niveaux: ['1re'],
  competences: ['C1.4'],
  temps: 'guidage',
  bareme: SEANCE.ETAPES.length,
  immersif: true,
  portee: 'eleve',
  reinitialisable: true,
  tables: {},
  trame: {
    pdf: './contenus/trames/ENT-4.1-picard-premier-camion-trame-eleve.pdf',
    docx: './contenus/trames/ENT-4.1-picard-premier-camion-trame-eleve.docx',
  },
  corrige: './contenus/corriges/ENT-4.1.js',
  pret: true,
  ouverture: 'prof',
};

const moteur = creerEntreprise({
  ENTREPRISE: PICARD.ENTREPRISE,
  VOCAB: PICARD.VOCAB,
  CATALOGUE: PICARD.catalogue(SEANCE.PALETTES_ENT41),
  SUPPLIERS: PICARD.SUPPLIERS,
  SUP_BY_ID: PICARD.SUP_BY_ID,
  CUSTOMERS: PICARD.CUSTOMERS,
  CM: PICARD.CM,
  baseDeDepart: PICARD.baseDeDepart,
  THEME: PICARD.THEME,
  etapes: SEANCE.ETAPES,
  exercice: 'Séance 1 : le premier camion',
  accueil: SEANCE.ACCUEIL,
  volet: SEANCE.VOLET,
  quai: SEANCE.QUAI_ENT41,
});

export function rendre(hote, ctx) { moteur.rendre(hote, ctx); }
