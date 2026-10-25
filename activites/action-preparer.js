// ENT-8.15 — Action, « prendre en charge une préparation ». Quinzième séance de l'entreprise n° 8 (CAP OL), à l'entrepôt Action d'Ensuès-la-Redonne
// exploité par Geodis : GUIDAGE de CAP-C3.1 (brief `docs/briefs/ENT-8.15-action-preparer.md`). Précédente : ENT-8.13 (la palette d'à côté, dernière
// séance d'entraînement du parcours C1.5). Suite : ENT-8.16.
//
// Un lundi, 6 h : l'élève vérifie son poste (inspection, deux défauts tirés), lit sa mission sur l'écran du terminal (fiche), prépare 5 lignes
// guidé à la voix (Plan d'entrepôt, chantier E-8), puis dit à Samia que la commande est prête. Données dans `contenus/action-ent815-donnees.js` et
// `contenus/action-ent815.js`, questions dans `contenus/questions/ENT-8.15.js`, univers dans `contenus/action.js`.
//
// 16 points de jalons pondérés + 4 de questions (`part: 4`) = 20 (poids validés par Tristan, brief §5). `correction` : « Corriger » rouvre la fiche et
// le message ; ni le poste ni la préparation (dit par `finFige`). Niveaux (`niveauxPrevus`) : accompagné = « Les règles » ouvertes et la travée de la
// ligne en cours cernée sur le plan ; confirmé = la même commande (la 6e ligne bonus du brief n'est pas faite : le moteur veut les mêmes jalons à
// tous les niveaux).

import { seanceEntreprise } from '../core/types/seance-entreprise.js';
import * as ACTION from '../contenus/action.js';
import * as SEANCE from '../contenus/action-ent815.js';
const s = seanceEntreprise(ACTION, SEANCE, {
  id: 'action-preparer',
  code: 'ENT-8.15',
  titre: 'Action — prendre en charge une préparation',
  desc: 'Prendre son poste de préparateur : vérifier son transpalette, lire sa mission, suivre le terminal vocal dans le circuit de prélèvement, puis dire à Samia que la commande est prête.',
  immersif: true,
  portee: 'eleve',
  niveaux: ['cap'],
  competences: [],
  competencesCap: ['CAP-C3.1'],
  temps: 'guidage',
  bareme: 20,
  parcours: true,
  correction: true,
  bilanDetail: true,
  precedente: 'action-palette-a-cote',
  niveauxPrevus: ['confirme', 'accompagne'],
  questions: 'ENT-8.15',
  pret: true,
  ouverture: 'prof',
}, SEANCE.OPTIONS);
export const meta = s.meta;
export const rendre = s.rendre;
