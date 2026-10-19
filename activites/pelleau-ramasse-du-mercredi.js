// ENT-10.6 — Transports Pelleau, « la ramasse du mercredi ». Sixième séance de l'entreprise n° 10 (CAP OL), stagiaire en PFMP à l'entrepôt neuf de
// Gouesnou : ENTRAÎNEMENT de CAP-C1.3, prendre en charge les opérations de réception (brief `docs/briefs/ENT-10.6-pelleau-ramasse-du-mercredi.md` ;
// décisions du chef de chantier : `docs/briefs/COORDINATION-pelleau.md` §2). Précédente : ENT-10.5 (le camion de ramasse rentre). Suite : ENT-10.7.
//
// Le même déroulé qu'ENT-10.5, seul, sur le camion TIRÉ de chaque élève : la répartition des palettes entre les deux clients, leur ordre dans le camion, UN
// défaut du quai (cabine, cale, niveleur ou lampe) et l'écart éventuel avec les annonces sont tirés de la graine (`quai: quaiDe`, comme ENT-8.7). Loïc est
// moins bavard (deux tours), et Yann n'arrête pas l'élève qui dit « C'est bon » sans rien signaler (`securite.arret: false`). Contenu :
// `contenus/pelleau-ent106.js` (données pures : `contenus/pelleau-ent106-donnees.js`), questions : `contenus/questions/ENT-10.6.js`, univers :
// `contenus/pelleau.js`.
//
// 16 points de jalons pondérés + 4 de questions (`part: 4`) = 20, poids validés par Tristan le 18/10/2026 à 22 h 03 (brief §5). `correction` :
// « Corriger » rouvre « Préparer », « Rapprocher » et les phrases ; jamais le dialogue, le quai ni une question (`finFige`). Séance réservée au CAP :
// `competences: []`, `competencesCap: ['CAP-C1.3']`. Niveaux : Accompagné = contenu standard ; Confirmé : « Règles du quai » non jointes, aides du quai
// éteintes, une ligne de plus à « Préparer » (cachée).

import { seanceEntreprise } from '../core/types/seance-entreprise.js';
import * as PELLEAU from '../contenus/pelleau.js';
import * as SEANCE from '../contenus/pelleau-ent106.js';
const s = seanceEntreprise(PELLEAU, SEANCE, {
  id: 'pelleau-ramasse-du-mercredi',
  code: 'ENT-10.6',
  titre: 'Transports Pelleau — la ramasse du mercredi',
  desc: 'Recevoir seul le camion de ramasse : préparer, accueillir, vérifier le quai, trier les palettes par client et les rapprocher des annonces.',
  niveaux: ['cap'],
  competences: [],
  competencesCap: ['CAP-C1.3'],
  temps: 'entrainement',
  bareme: 20,
  parcours: true,
  correction: true,
  bilanDetail: true,
  precedente: 'pelleau-camion-de-ramasse',
  niveauxPrevus: ['confirme'],                         // confirmé : une ligne de plus à « Préparer » (cachée), aides du quai éteintes ; accompagné = standard
  questions: 'ENT-10.6',
  pret: true,
  ouverture: 'prof',                                   // livrée fermée aux élèves : l'enseignant l'essaie, puis l'ouvre lui-même (Conduite de séance)
}, SEANCE.OPTIONS);
export const meta = s.meta;
export const rendre = s.rendre;
