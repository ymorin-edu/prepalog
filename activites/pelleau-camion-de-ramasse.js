// ENT-10.5 — Transports Pelleau, « le camion de ramasse rentre ». Cinquième séance de l'entreprise n° 10 (CAP OL), stagiaire en PFMP à l'entrepôt
// neuf de Gouesnou : GUIDAGE de CAP-C1.3, prendre en charge les opérations de réception (brief `docs/briefs/ENT-10.5-pelleau-camion-de-ramasse.md` ;
// décisions du chef de chantier : `docs/briefs/COORDINATION-pelleau.md` §2). Précédente : ENT-10.4 (évaluation de la prise de poste). Suite :
// ENT-10.6 (entraînement).
//
// « Un camion, plusieurs clients » : préparer la réception (feuille de ramasse, annonces), accueillir Loïc en face à face, inspecter le quai sur la
// scène (la lampe éteinte), faire poser chaque palette dans la zone de SON client (dépose par client), rapprocher ce qui est arrivé des annonces,
// rendre compte à Maëlys. Contenu : `contenus/pelleau-ent105.js` (données pures : `contenus/pelleau-ent105-donnees.js`), questions :
// `contenus/questions/ENT-10.5.js`, univers : `contenus/pelleau.js`.
//
// 16 points de jalons pondérés + 4 de questions (`part: 4`) = 20, poids validés par Tristan le 18/10/2026 à 22 h 03 (brief §5). `correction` :
// « Corriger » rouvre « Préparer », « Rapprocher » et les phrases ; jamais le dialogue, le quai ni une question (`finFige`). Séance réservée au CAP :
// `competences: []`, `competencesCap: ['CAP-C1.3']`. Niveaux : Accompagné = contenu standard ; Confirmé : une ligne de plus à « Préparer » (cachée).

import { seanceEntreprise } from '../core/types/seance-entreprise.js';
import * as PELLEAU from '../contenus/pelleau.js';
import * as SEANCE from '../contenus/pelleau-ent105.js';
const s = seanceEntreprise(PELLEAU, SEANCE, {
  id: 'pelleau-camion-de-ramasse',
  code: 'ENT-10.5',
  titre: 'Transports Pelleau — le camion de ramasse rentre',
  desc: 'Préparer la réception, accueillir le conducteur, vérifier le quai, faire décharger en séparant les palettes de chaque client, puis les rapprocher de ce que chaque client a annoncé.',
  niveaux: ['cap'],
  competences: [],
  competencesCap: ['CAP-C1.3'],
  temps: 'guidage',
  bareme: 20,
  parcours: true,
  correction: true,
  bilanDetail: true,
  precedente: 'pelleau-evaluation-prise-de-poste',   // ENT-10.4 (brief §1) : pas encore construite — l'élève reste fermé tant qu'elle n'existe pas (l'enseignant peut débloquer)
  niveauxPrevus: ['confirme'],                         // confirmé : une ligne de plus à « Préparer » (cachée) ; accompagné = standard
  questions: 'ENT-10.5',
  pret: true,
  ouverture: 'prof',
}, SEANCE.OPTIONS);
export const meta = s.meta;
export const rendre = s.rendre;
