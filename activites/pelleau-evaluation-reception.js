// ENT-10.8 — Transports Pelleau, « évaluation : recevoir le camion de ramasse ». Huitième séance de l'entreprise n° 10 (CAP OL), stagiaire en PFMP à
// l'entrepôt neuf de Gouesnou : ÉVALUATION de CAP-C1.3, prendre en charge les opérations de réception (brief
// `docs/briefs/ENT-10.8-pelleau-evaluation-reception.md` ; décisions du chef de chantier : `docs/briefs/COORDINATION-pelleau.md` §2). Précédentes :
// ENT-10.5 (guidage), ENT-10.6 et 10.7 (entraînements).
//
// Avant de commencer (noté, 4 questions clés tirées, aucune aide), préparer la réception (l'heure et le quai de Loïc lus dans le planning tiré), l'accueil
// de Loïc en face à face (la première réponse compte), le quai (inspection, dépose par client, le premier clic pose ; le quai s'arrête au déchargement et
// ne rend pas la copie), rapprocher des annonces et juger la feuille de ramasse (une erreur d'écriture est parfois tirée), rendre compte par phrases.
// Contenu : `contenus/pelleau-ent108.js` (données pures : `contenus/pelleau-ent108-donnees.js`), questions : `contenus/questions/ENT-10.8.js`, univers :
// `contenus/pelleau.js`.
//
// 16 points de jalons pondérés (préparer 2, accueillir 2, avant de décharger 3, trier par client 4, rapprocher 3, rendre compte 2) + 4 points d'ouverture
// (`part: 4`) = 20, poids validés par Tristan le 18/10/2026 à 22 h 03 (brief §5). Évaluation : `copie: true`, `noter` ; ni bonus ni niveau (comme ENT-8.6 et
// 8.10) ; ni `parcours` (elle s'ouvre quand l'enseignant la coche), ni `correction`. Séance réservée au CAP : `competences: []`, `competencesCap: ['CAP-C1.3']`.

import { seanceEntreprise } from '../core/types/seance-entreprise.js';
import * as PELLEAU from '../contenus/pelleau.js';
import * as SEANCE from '../contenus/pelleau-ent108.js';
const s = seanceEntreprise(PELLEAU, SEANCE, {
  id: 'pelleau-evaluation-reception',
  code: 'ENT-10.8',
  titre: 'Transports Pelleau — évaluation : recevoir le camion de ramasse',
  desc: 'Recevoir seul un camion de ramasse : préparer, accueillir, vérifier le quai, trier par client, rapprocher des annonces et rendre compte, sans aide.',
  niveaux: ['cap'],
  competences: [],
  competencesCap: ['CAP-C1.3'],
  temps: 'evaluation',
  bareme: 20,                                          // jalons pondérés (16) + questions d'ouverture (4), somme = 20
  copie: true,
  questions: 'ENT-10.8',
  pret: true,
  ouverture: 'prof',                                   // livrée fermée aux élèves : l'enseignant l'essaie, puis l'ouvre lui-même (Conduite de séance)
}, SEANCE.OPTIONS);
export const meta = s.meta;
export const rendre = s.rendre;
export const noter = s.noter;
