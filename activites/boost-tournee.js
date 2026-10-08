// ENT-3.1 — Boost, « la tournée du vélo-cargo ». Première séance de l'environnement Boost,
// et première des quatre séances de C2.4 « Organiser une tournée de livraison ».
//
// Séance de GUIDAGE : la notion est entièrement nouvelle. Suivront ENT-3.2 (entraînement),
// ENT-3.3 (entraînement par l'erreur induite) et ENT-3.4 (évaluation notée). Le découpage
// est dans `claude/prepalog-progression-pedagogique.md`, le contenu dans
// `contenus/boost-tournee.js`, l'univers commun dans `contenus/boost.js`.
//
// ── Pourquoi cette séance ne déclare PAS `notation: 'avancement'` ───────────────────────
// Les trois séances Spartoo le déclarent, et n'ont donc que des jalons d'avancement. Ici,
// Tristan veut les jalons **et** une note sur 20, pour l'utiliser au bulletin avec un petit
// coefficient. `noteConvertie` de `core/notes.js` rend vrai dès qu'un module ne déclare pas
// de `notation` : il suffit donc d'omettre la ligne, et le suivi de classe affiche la note
// sur 20 en gardant le score brut en jalons dans son infobulle. Rien à ajouter au moteur —
// vérifié dans le code, pas supposé.
//
// ── Trame élève ─────────────────────────────────────────────────────────────────────────
// Déclarée le 03/10/2026 après relecture point par point avec Tristan. Les consignes vivent
// dans la trame (Word / PDF, générée par `outils/trame-boost-tournee.py`), pas dans le site :
// le bandeau n'affiche que les deux liens de téléchargement.

import { seanceEntreprise } from '../core/types/seance-entreprise.js';
import * as BOOST from '../contenus/boost.js';
import * as SEANCE from '../contenus/boost-tournee.js';
const s = seanceEntreprise(BOOST, SEANCE, {
  id: 'boost-tournee',
  code: 'ENT-3.1',
  titre: 'Boost — la tournée du vélo-cargo',
  desc: 'Situer sept clients sur un plan de Nîmes, choisir ce que le vélo-cargo peut emporter, '
    + 'puis ordonner les arrêts pour attraper le train de 16 h 10.',
  // Compétences et temps pédagogique : voir core/competences.js (validé par Tristan, 02/10/2026).
  competences: ['C2.4'],
  temps: 'guidage',
  // Remise à zéro de la base par l'élève : seulement en séance X.1, qui ouvre la chaîne. Une
  // séance X.2 ou X.3 reprend le travail de la précédente ; l'effacer ferait perdre les séances d'avant.
  reinitialisable: true,
  // Base commune à toutes les séances ENT-3.x de Boost. L'état des deux vues de transport
  // est cloisonné par séance via `transportId`, donc deux séances Boost ne s'écrasent pas.
  jeuId: 'boost',
  // Trame élève : la déclarer, c'est la valider (relue par Tristan). Le corrigé se déduit du code.
  trame: 'boost-tournee',
  pret: true,
}, {
  // Les écrans de données du menu (05/10/2026) : ceux dont la séance se sert, et au moindre doute on les garde.
  menu: ['clients'],
  exercice: 'Séance 1 : organiser la tournée du vélo-cargo',
  // Les deux vues de transport. Déclarées ici, donc présentes ; une séance qui ne les
  // déclare pas n'a aucune entrée de menu en plus.
  transportSection: 'Tournées',
  transportId: SEANCE.TRANSPORT_ID,
  plan: SEANCE.PLAN,
  tournee: SEANCE.TOURNEE,
});
export const meta = s.meta;
export const rendre = s.rendre;
