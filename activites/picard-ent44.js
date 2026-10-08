// ENT-4.4 — Picard, « le rush du lundi ». Quatrième et dernière séance de C1.4 « Traiter les
// opérations de réception de produits selon les procédures » : l'ÉVALUATION (brief
// `docs/briefs/ENT-4.4-picard-evaluation.md`).
//
// Un camion TIRÉ POUR CHAQUE ÉLÈVE (graine = son identifiant, `core/tirage.js`, décision du
// 03/10/2026) : six palettes, les mêmes six aléas pour tous dans un ordre et avec des produits et
// des valeurs propres à chacun (`contenus/picard-ent44.js`). Aucune aide ; le chrono MESURE le temps
// réel, il ne coupe rien ; « Clore la réception et rendre ma copie » ; aucun verdict à l'écran.
//
// Note sur 20 (`noteQuai`) : 15 points de réception (jalons) + 5 de rapidité (3 hors froid, 2 temps
// réel, seuils × 4/3 en tiers-temps), seulement si la réception est complète, en proportion des
// palettes justes. Les seuils se règlent dans `NOTE_ENT44` (contenu). Pas de `reinitialisable`.
// Pas de trame (décision de Tristan : l'écran suffit). Corrigé : par élève (onglet Corrigés).

import { seanceEntreprise } from '../core/types/seance-entreprise.js';
import * as PICARD from '../contenus/picard.js';
import * as SEANCE from '../contenus/picard-ent44.js';
const s = seanceEntreprise(PICARD, SEANCE, {
  id: 'picard-ent44',
  code: 'ENT-4.4',
  titre: 'Picard — le rush du lundi',
  desc: 'Évaluation : réceptionner seul un camion de six palettes de surgelés au quai 32, sans aide, '
    + 'sur un camion tiré pour toi. La note tient compte de la réception et de la rapidité.',
  niveaux: ['1re'],
  competences: ['C1.4'],
  temps: 'evaluation',
  copie: true,
  pret: true,
  ouverture: 'prof',
}, {
  // Les écrans de données du menu (05/10/2026) : ceux dont la séance se sert, et au moindre doute on les garde.
  menu: [],
  CATALOGUE: PICARD.catalogue(SEANCE.RESERVE, 'F-CDD'),
  exercice: 'Séance 4 : le rush du lundi (évaluation)',
  // Une fonction de la graine : le quai de chaque élève (voir `core/types/entreprise.js`).
  quai: SEANCE.quaiDe,
});
export const meta = s.meta;
export const rendre = s.rendre;
export const noter = s.noter;
