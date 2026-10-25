// ENT-8.17 — Action, « monter et conditionner sa palette ». Dix-septième séance de l'entreprise n° 8 (CAP OL) : GUIDAGE de CAP-C3.3 (brief
// `docs/briefs/ENT-8.17-action-conditionner.md`). Précédente : ENT-8.16. Suite : ENT-8.18.
//
// Un jeudi, 6 h : la fiche « Lire un carton » (trois cartons dessinés, tirés par élève), puis une commande de 6 lignes guidée à la voix (Plan
// d'entrepôt, chantier E-8) dont l'ordre du circuit casse toujours une règle de calage : poser « À côté », lourds en bas, fragiles en haut,
// poids et hauteur, film, étiquettes. Données dans `contenus/action-ent817-donnees.js` et `contenus/action-ent817.js`.
//
// 16 points de jalons + 4 de questions (`part: 4`) = 20 (poids validés par Tristan, brief §5). Niveaux : accompagné = une ligne d'aide par
// règle, la travée cernée et la classe du carton sous « Où poses-tu ? » ; confirmé = « Les règles » repliées (le 7e carton bonus du brief n'est
// pas fait : le moteur veut les mêmes jalons à tous les niveaux).

import { seanceEntreprise } from '../core/types/seance-entreprise.js';
import * as ACTION from '../contenus/action.js';
import * as SEANCE from '../contenus/action-ent817.js';
const s = seanceEntreprise(ACTION, SEANCE, {
  id: 'action-conditionner',
  code: 'ENT-8.17',
  titre: 'Action — monter et conditionner sa palette',
  desc: 'Les cartons arrivent dans l’ordre du circuit, pas dans celui de la palette : poser à côté pour mettre les lourds en bas et les fragiles en haut, tenir le poids et la hauteur, filmer, étiqueter pour le magasin.',
  immersif: true,
  portee: 'eleve',
  niveaux: ['cap'],
  competences: [],
  competencesCap: ['CAP-C3.3'],
  temps: 'guidage',
  bareme: 20,
  parcours: true,
  correction: true,
  bilanDetail: true,
  precedente: 'action-destocker',
  niveauxPrevus: ['confirme', 'accompagne'],
  questions: 'ENT-8.17',
  pret: true,
  ouverture: 'prof',
}, SEANCE.OPTIONS);
export const meta = s.meta;
export const rendre = s.rendre;
