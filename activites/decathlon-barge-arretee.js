// ENT-7.3 — Decathlon, « la barge ne passe plus ». Troisième séance de l'entreprise n° 7 (1re), service transport amont de l'entrepôt de
// Rouvignies : ENTRAÎNEMENT AVEC ERREUR INDUITE ET ALÉA de C2.6, réagir à un imprévu sans laisser le conteneur sans transport (brief
// `docs/briefs/ENT-7.3-decathlon-la-barge-ne-passe-plus.md`). Précédente : ENT-7.2 (passer la commande). Suite : 7.4 (évaluation).
//
// Commander la barge comme d'habitude (non noté), puis, quand l'Escaut s'arrête, rechoisir dans la liste référencée (sans céder à l'offre hors
// liste, moins chère et moins émettrice), commander au nouveau prestataire, ANNULER l'ancien au bon moment (après la confirmation écrite du
// nouveau) et prévenir le quai par téléphone. Contre la copie : le numéro, le scellé, le poids, la référence et les prix sont TIRÉS par élève.
// Données dans `contenus/decathlon-ent73.js` (et `-donnees.js`, pures), questions dans `contenus/questions/ENT-7.3.js`, univers dans `contenus/decathlon.js`.
//
// 7 jalons pondérés (somme 17) + 3 questions notées (`part: 3`), somme = 20 (`bareme: 20`), poids validés par Tristan le 15/10/2026.
// Pas de `correction` : `suiteAuBilan` ouvre la suite quand tout est jugé.
// EN CONSTRUCTION (`pret: false`) : lot 1 livré le 15/10/2026 ; la livraison (`pret: true, ouverture: 'prof'`) vient après les pièges et les sabotages.

import { seanceEntreprise } from '../core/types/seance-entreprise.js';
import * as DECATHLON from '../contenus/decathlon.js';
import * as SEANCE from '../contenus/decathlon-ent73.js';
const s = seanceEntreprise(DECATHLON, SEANCE, {
  id: 'decathlon-barge-arretee',
  code: 'ENT-7.3',   // provisoire, comme 7.1 et 7.2
  titre: 'Decathlon — la barge ne passe plus',
  desc: 'Alternant au transport amont de Rouvignies : commander le transport d’un conteneur, puis, quand l’Escaut ferme, rechoisir dans la liste référencée, '
    + 'commander au nouveau prestataire, annuler l’ancien au bon moment et prévenir le quai.',
  niveaux: ['1re'],
  competences: ['C2.6'],
  temps: 'erreur',
  bareme: 20,           // jalons pondérés (17) + questions notées (3), somme = 20
  parcours: true,
  precedente: 'decathlon-ordre-transport',
  suiteAuBilan: true,
  niveauxPrevus: ['confirme'],   // bonus du confirmé : une cinquième offre au comparateur n° 2
  questions: 'ENT-7.3',
  pret: false,
}, SEANCE.OPTIONS);
export const meta = s.meta;
export const rendre = s.rendre;
