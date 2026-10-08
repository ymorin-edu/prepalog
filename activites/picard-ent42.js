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
// Trame élève Word/PDF déclarée le 03/10/2026, relue et validée par Tristan (générateur dans `outils/`,
// brief `docs/briefs/PICARD-trames-eleve.md`) ; son corrigé s'ajoute au corrigé calculé (`meta.corrige`).

import { seanceEntreprise } from '../core/types/seance-entreprise.js';
import * as PICARD from '../contenus/picard.js';
import * as SEANCE from '../contenus/picard-ent42.js';
const s = seanceEntreprise(PICARD, SEANCE, {
  id: 'picard-ent42',
  code: 'ENT-4.2',
  titre: 'Picard — deux camions, un seul quai',
  desc: 'Deux camions de surgelés attendent au quai 32 : lire les deux tickets, choisir et justifier l’ordre de '
    + 'déchargement, puis réceptionner les deux lots sans aide (huit palettes, quatre aléas).',
  niveaux: ['1re'],
  competences: ['C1.4', 'C1.3'],
  temps: 'entrainement',
  trame: 'picard-deux-camions',
  pret: true,
  ouverture: 'prof',
}, {
  // Les écrans de données du menu (05/10/2026) : ceux dont la séance se sert, et au moindre doute on les garde.
  menu: [],
  CATALOGUE: PICARD.catalogue(SEANCE.PRODUITS_ENT42),
  exercice: 'Séance 2 : deux camions, un seul quai',
  quai: SEANCE.QUAI_ENT42,
});
export const meta = s.meta;
export const rendre = s.rendre;
