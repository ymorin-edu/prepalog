// ENT-2.1 — Cdiscount, séance « Le stock raconte ». Première séance de l'environnement
// Cdiscount (C1.6, suivi des stocks et inventaire, 1L).
//
// Guidage : une commande a été annulée ce matin (rayon vide, site « en stock »). L'élève lit le
// stock et ses mouvements, relie chaque mouvement à son document, recalcule le stock d'inventaire
// et compare chaque document à son mouvement jusqu'au constat de casse mal saisi. Il répond par
// écrit à la cheffe d'équipe ; les jalons lisent sa réponse. Détail et données :
// `contenus/cdiscount-mouvements.js`.
//
// Recadrée le 03/10/2026 (brief `docs/briefs/ENT-2.1-recadrage.md`) : six jalons au lieu de cinq,
// commande annulée, « Stock trouvé » sur le stock réel, niveau confirmé (trois documents de plus).
// Livrée fermée (`ouverture: 'prof'`, demandé dans `docs/decisions.md`) : Tristan la rouvre lui-même
// dans « Conduite de séance » après l'avoir essayée.
//
// Trame élève et corrigé : déposés par Cowork, branchés le 04/10/2026 (brief `docs/briefs/CDISCOUNT-trames-eleve.md`).

import { seanceEntreprise } from '../core/types/seance-entreprise.js';
import * as CDISCOUNT from '../contenus/cdiscount.js';
import * as SEANCE from '../contenus/cdiscount-mouvements.js';
const s = seanceEntreprise(CDISCOUNT, SEANCE, {
  id: 'cdiscount-mouvements',
  code: 'ENT-2.1',
  titre: 'Cdiscount — le stock raconte',
  desc: "Une cliente n'a pas reçu ses écouteurs : remonter les mouvements de stock jusqu'à l'erreur.",
  // Compétences et temps pédagogique : voir core/competences.js.
  competences: ['C1.6'],
  temps: 'guidage',
  // Volume déclaré (`claude/prepalog-montee-en-competences.md`) : guidage = peu d'opérations.
  volume: SEANCE.VOLUME,
  notation: 'avancement',
  // Chaque séance Cdiscount a sa propre base (une journée différente à l'entrepôt) : l'élève
  // peut donc repartir de zéro sans rien perdre d'une autre séance.
  reinitialisable: true,
  trame: 'cdiscount-mouvements',
  pret: true,
  ouverture: 'prof',
}, {
  // Les écrans de données du menu (05/10/2026) : ceux dont la séance se sert, et au moindre doute on les garde.
  menu: ['commandes', 'receptions', 'stock', 'catalogue', 'console'],
  exercice: SEANCE.EXERCICE,
});
export const meta = s.meta;
export const rendre = s.rendre;
