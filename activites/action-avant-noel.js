// ENT-8.4 — Action, « la semaine avant Noël ». Quatrième séance de l'entreprise n° 8 (CAP OL), entrepôt Action de Labastide-Saint-Pierre
// exploité par GXO : ENTRAÎNEMENT de CAP-C1.2 avec une erreur induite (le camion mal placé par Romain). Brief
// `docs/briefs/ENT-8.4-action-avant-noel.md` ; décisions du chef de chantier : `docs/briefs/COORDINATION-action.md` §6.3.
// Précédente : ENT-8.3 (un autre site, un autre prestataire). Ensuite : l'évaluation C1.1 + C1.2 de janvier.
//
// Un écran par étape (§0 bis d'ENT-8.3) : repérer les lieux sur le plan dessiné, qui fait quoi, le planigramme (lire, trouver l'erreur), le
// planning des quais (replacer le camion posé à la place fausse), les documents du camion, rendre compte à Romain par phrases. Contenu dans
// `contenus/action-ent84.js` (données pures : `contenus/action-ent84-donnees.js`), questions dans `contenus/questions/ENT-8.4.js`.
//
// 16 points de jalons pondérés + 4 de questions (`part: 4`) = 20 (poids des blocs validés par Tristan le 15/10/2026). `correction` : « Corriger »
// rouvre les fiches, le planning et le compte rendu ; jamais une question (premier essai, dit par `finFige`).
// Une séance réservée au CAP : `competences: []` (elle n'entre dans aucune moyenne Bac Pro), `competencesCap: ['CAP-C1.2']`.

import { seanceEntreprise } from '../core/types/seance-entreprise.js';
import * as ACTION from '../contenus/action.js';
import * as SEANCE from '../contenus/action-ent84.js';
const s = seanceEntreprise(ACTION, SEANCE, {
  id: 'action-avant-noel',
  code: 'ENT-8.4',
  titre: 'Action — la semaine avant Noël',
  desc: 'Repérer les lieux d’une réception, dire qui fait quoi, trouver et corriger une erreur du planigramme, reconnaître les documents du camion et rendre compte à son tuteur.',
  niveaux: ['cap'],
  competences: [],
  competencesCap: ['CAP-C1.2'],
  temps: 'entrainement',
  bareme: 20,
  parcours: true,
  correction: true,
  bilanDetail: true,                // CAP : le bilan de fin descend à la case, avec « Corriger dans … » et la liste « À corriger »
  precedente: 'action-autre-site',
  niveauxPrevus: ['confirme'],      // bonus du confirmé : une tâche et une lecture de plus (cachés à l'élève) ; accompagné : contenu standard
  questions: 'ENT-8.4',
  pret: true,
  ouverture: 'prof',
}, SEANCE.OPTIONS);
export const meta = s.meta;
export const rendre = s.rendre;
