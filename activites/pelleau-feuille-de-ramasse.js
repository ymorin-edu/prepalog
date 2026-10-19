// ENT-10.7 — Transports Pelleau, « la feuille de ramasse se trompe ». Septième séance de l'entreprise n° 10 (CAP OL), stagiaire en PFMP à l'entrepôt
// neuf de Gouesnou : ENTRAÎNEMENT de CAP-C1.3 avec ERREUR INDUITE (brief `docs/briefs/ENT-10.7-pelleau-feuille-de-ramasse.md` ; décisions du chef de
// chantier : `docs/briefs/COORDINATION-pelleau.md` §2, dont 13 et 14). Précédente : ENT-10.6 (« la ramasse du mercredi »). Suite : ENT-10.8 (évaluation).
//
// Loïc, pressé, a rempli sa feuille de ramasse trop vite : UNE palette y est notée chez le mauvais client (laquelle, et dans quel sens, est TIRÉ par la
// graine de l'élève). Il dit : « Pose comme c'est écrit sur la feuille ». L'élève prépare la réception, accueille Loïc, inspecte le quai (un défaut
// tiré), fait poser chaque palette dans la zone de SON client en lisant l'ÉTIQUETTE (dépose par client), rapproche ce qui est arrivé des annonces,
// dit si la feuille est juste, répond qui la fait corriger, et rend compte à Maëlys. Contenu : `contenus/pelleau-ent107.js` (données pures et jeu
// tiré : `contenus/pelleau-ent107-donnees.js`), questions : `contenus/questions/ENT-10.7.js`, univers : `contenus/pelleau.js`.
//
// 16 points de jalons pondérés + 4 de questions (`part: 4`) = 20, poids validés par Tristan le 18/10/2026 à 22 h 03 (brief §5). `correction` :
// « Corriger » rouvre « Préparer », « Rapprocher », « La feuille de ramasse » et les phrases ; jamais le dialogue, le quai ni une question (`finFige`).
// Séance réservée au CAP : `competences: []`, `competencesCap: ['CAP-C1.3']`. Niveaux : Accompagné = contenu standard ; Confirmé : le document « Règles du
// quai » n'est pas joint (aide éteinte), aucun cas bonus.

import { seanceEntreprise } from '../core/types/seance-entreprise.js';
import * as PELLEAU from '../contenus/pelleau.js';
import * as SEANCE from '../contenus/pelleau-ent107.js';
const s = seanceEntreprise(PELLEAU, SEANCE, {
  id: 'pelleau-feuille-de-ramasse',
  code: 'ENT-10.7',
  titre: 'Transports Pelleau — la feuille de ramasse se trompe',
  desc: 'Trier les palettes d’après leur étiquette même quand la feuille dit autre chose, trouver l’erreur d’écriture et la faire corriger.',
  niveaux: ['cap'],
  competences: [],
  competencesCap: ['CAP-C1.3'],
  temps: 'entrainement',
  bareme: 20,
  parcours: true,
  correction: true,
  bilanDetail: true,
  precedente: 'pelleau-ramasse-du-mercredi',   // ENT-10.6 (brief §1) : l'élève reste fermé tant qu'elle n'a pas son bilan (l'enseignant peut débloquer)
  niveauxPrevus: ['confirme'],                   // confirmé : les « Règles du quai » ne sont pas jointes, aucun cas bonus ; accompagné = standard
  questions: 'ENT-10.7',
  pret: true,
  ouverture: 'prof',
}, SEANCE.OPTIONS);
export const meta = s.meta;
export const rendre = s.rendre;
