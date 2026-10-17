// ENT-8.7 — Action, « on décharge ensemble ». Septième séance de l'entreprise n° 8 (CAP OL), entrepôt Action d'Ensuès-la-Redonne exploité par
// Geodis : GUIDAGE de CAP-C1.3, prendre en charge les opérations de réception (brief `docs/briefs/ENT-8.7-action-decharger.md` ; décisions du chef
// de chantier : `docs/briefs/COORDINATION-action.md` §8). Précédente : ENT-8.4. Suite : ENT-8.8 (le contrôle du même camion).
//
// Le protocole de sécurité du quai 2 (situations tirées, « qui décharge »), l'accueil du chauffeur en face à face, l'inspection du quai sur la
// scène (une anomalie tirée) et la dépose dirigée des 4 palettes ; le quai s'arrête quand elles sont au sol. Données dans
// `contenus/action-ent87-donnees.js` et `contenus/action-ent87.js`, questions dans `contenus/questions/ENT-8.7.js`, univers dans `contenus/action.js`.
//
// 16 points de jalons pondérés + 4 de questions (`part: 4`) = 20, poids validés par Tristan le 16/10/2026 à 18 h 54. `correction` : « Corriger »
// rouvre la fiche et le dialogue (« Revenir le voir ») ; jamais le quai ni une question (dit par `finFige`). Une séance réservée au CAP :
// `competences: []`, `competencesCap: ['CAP-C1.3']`. Niveaux : Accompagné = contenu standard (COORDINATION §8.2 n° 4) ; Confirmé : une situation de plus.

import { seanceEntreprise } from '../core/types/seance-entreprise.js';
import * as ACTION from '../contenus/action.js';
import * as SEANCE from '../contenus/action-ent87.js';
const s = seanceEntreprise(ACTION, SEANCE, {
  id: 'action-decharger',
  code: 'ENT-8.7',
  titre: 'Action — on décharge ensemble',
  desc: 'Appliquer le protocole de sécurité du quai, accueillir le chauffeur, vérifier que le quai et le camion sont sûrs avant de décharger, et diriger le déchargement.',
  niveaux: ['cap'],
  competences: [],
  competencesCap: ['CAP-C1.3'],
  temps: 'guidage',
  bareme: 20,
  parcours: true,
  correction: true,
  bilanDetail: true,
  precedente: 'action-avant-noel',
  niveauxPrevus: ['confirme', 'accompagne'],   // confirmé : une situation et un danger de scène de plus (cachés) ; accompagné : 2 réponses par réplique, la consigne dit où regarder (lot 4)
  questions: 'ENT-8.7',
  pret: true,
  ouverture: 'prof',
}, SEANCE.OPTIONS);
export const meta = s.meta;
export const rendre = s.rendre;
