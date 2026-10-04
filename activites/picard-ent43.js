// ENT-4.3 — Picard, « la réception de nuit ». Troisième séance de C1.4 « Traiter les opérations de réception de
// produits selon les procédures » (C1.4.2 : contribuer à l'ouverture d'un dossier litige) : l'ERREUR INDUITE
// (brief `docs/briefs/ENT-4.3-picard-reception-de-nuit.md`).
//
// Deux temps, comme ENT-3.3 : contrôler le travail figé de Mathis (réceptionnaire de nuit, personnage fictif) sur la
// vue quai en mode « déjà réceptionné », répondre au chef de quai ; puis, après sa réponse, bloquer la palette
// douteuse, protester auprès du transporteur, « J'ai terminé ». Pas d'aide : indices dans les documents seulement,
// bilan à la fin. Données dans `contenus/picard-ent43.js`.
//
// Pas de `reinitialisable` (réservé aux séances X.1). Pas de `notation` : dix jalons ramenés sur 20.
// Trame élève Word/PDF déclarée le 03/10/2026, relue et validée par Tristan (générateur dans `outils/`,
// brief `docs/briefs/PICARD-trames-eleve.md`) ; son corrigé s'ajoute au corrigé calculé (`meta.corrige`).

import { creerEntreprise } from '../core/types/entreprise.js';
import * as PICARD from '../contenus/picard.js';
import * as SEANCE from '../contenus/picard-ent43.js';

export const meta = {
  id: 'picard-ent43',
  code: 'ENT-4.3',
  titre: 'Picard — la réception de nuit',
  desc: 'Mathis a réceptionné un camion à 3 h : contrôler son travail à partir des documents et des palettes en chambre '
    + 'froide, puis bloquer ce qui doit l’être et protester auprès du transporteur dans le délai.',
  rubrique: 'logisim',
  niveaux: ['1re'],
  competences: ['C1.4'],
  temps: 'erreur',
  bareme: SEANCE.ETAPES.length,
  immersif: true,
  portee: 'eleve',
  tables: {},
  corrige: './contenus/corriges/ENT-4.3.js',
  pret: true,
  ouverture: 'prof',
};

const moteur = creerEntreprise({
  ENTREPRISE: PICARD.ENTREPRISE,
  VOCAB: PICARD.VOCAB,
  CATALOGUE: PICARD.catalogue(SEANCE.PRODUITS_ENT43),
  SUPPLIERS: PICARD.SUPPLIERS,
  SUP_BY_ID: PICARD.SUP_BY_ID,
  CUSTOMERS: PICARD.CUSTOMERS,
  CM: PICARD.CM,
  baseDeDepart: PICARD.baseDeDepart,
  THEME: PICARD.THEME,
  etapes: SEANCE.ETAPES,
  exercice: 'Séance 3 : la réception de nuit',
  accueil: SEANCE.ACCUEIL,
  volet: SEANCE.VOLET,
  quai: SEANCE.QUAI_ENT43,
  trame: {
    pdf: './contenus/trames/ENT-4.3-picard-reception-de-nuit-trame-eleve.pdf',
    docx: './contenus/trames/ENT-4.3-picard-reception-de-nuit-trame-eleve.docx',
  },
});

export function rendre(hote, ctx) { moteur.rendre(hote, ctx); }
