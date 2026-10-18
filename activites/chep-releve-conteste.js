// ENT-9.3 — CHEP, « le relevé contesté ». Troisième séance de l'entreprise n° 9 (1re), service relation clients et flux du centre de
// service de Templemars : ENTRAÎNEMENT de C2.5, avec une ERREUR INDUITE (le retour validé par Grégory sans compter les piles : le compte de la
// cliente a été trop crédité). Les quatre indicateurs (la ramasse en un seul geste). Brief `docs/briefs/ENT-9.3-chep-releve-conteste.md` ;
// cadrage commun `docs/briefs/COORDINATION-chep.md`. Précédente : ENT-9.2. Suite : ENT-9.4 (évaluation).
//
// Une cliente conteste son relevé : l'élève reprend ses documents et les nôtres, dit ce qui est faux et qui le corrige (l'émetteur ses
// déclarations, CHEP ses crédits de retour), refait le solde (grille, formules), puis répond honnêtement, y compris sur l'erreur de CHEP qui
// était en faveur de la cliente. Contre la copie : sa pièce (un transfert absent, ou une quantité déclarée fausse), toutes les quantités et
// l'ordre de ses bordereaux sont tirés par élève ; un confirmé reçoit les deux pièces (la seconde en bonus).
// Contenu : `contenus/chep-ent93.js` (et `-donnees.js`, pures) ; questions : `contenus/questions/ENT-9.3.js` ; corrigé : `contenus/corriges/ENT-9.3.js`.
//
// 11 jalons pondérés (somme 17) + 3 questions notées (`part: 3`) = 20 (`bareme: 20`) : poids fixés par Cowork sur délégation de Tristan
// (17/10/2026), codés tels quels, listés au compte rendu du brief. Une base par séance (pas de `jeuId`). Pas de trame pour l'instant.

import { seanceEntreprise } from '../core/types/seance-entreprise.js';
import * as CHEP from '../contenus/chep.js';
import * as SEANCE from '../contenus/chep-ent93.js';
const s = seanceEntreprise(CHEP, SEANCE, {
  id: 'chep-releve-conteste',
  code: 'ENT-9.3',
  titre: 'CHEP — le relevé contesté',
  desc: 'Une cliente conteste son relevé de palettes : retrouver dans ses documents et dans les nôtres ce qui manque ou ce qui est faux (y compris '
    + 'une erreur de notre centre), dire qui corrige quoi, refaire le solde et lui répondre honnêtement.',
  niveaux: ['1re'],
  competences: ['C2.5'],
  temps: 'entrainement',
  bareme: 20,           // jalons pondérés (17) + questions notées (3), somme = 20
  // Parcours strict : ne s'ouvre qu'à l'élève dont ENT-9.2 a son premier bilan (la séance s'appuie sur le contrôle d'un retour).
  parcours: true,
  precedente: 'chep-ramasse-retours',
  // Règle du premier bilan : « Corriger » rouvre l'enquête, le relevé corrigé ou la réponse dont un jalon est faux.
  correction: true,
  niveauxPrevus: ['confirme'],   // cas bonus du confirmé : l'autre document de la cliente (les deux anomalies A2 et A3)
  questions: 'ENT-9.3',
  pret: true,
  ouverture: 'prof',   // fermée aux élèves tant que Tristan ne l'a pas cochée dans « Conduite de séance »
}, SEANCE.OPTIONS);
export const meta = s.meta;
export const rendre = s.rendre;
