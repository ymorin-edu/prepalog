// ENT-8.16 — Action, « déstocker et signaler ». Seizième séance de l'entreprise n° 8 (CAP OL) : GUIDAGE de CAP-C3.2 (brief
// `docs/briefs/ENT-8.16-action-destocker.md`). Précédente : ENT-8.15. Suite : ENT-8.17.
//
// Le lendemain, 6 h : une commande de 7 lignes guidée à la voix (Plan d'entrepôt, chantier E-8), avec un carton abîmé à signaler et un emplacement
// vide (Kevin descend la réserve) ; puis la fiche « Le stock après ma préparation », jugée sur ce que l'élève a dit au terminal ; puis le compte rendu
// à Samia (seule la forme est notée). Données dans `contenus/action-ent816-donnees.js` et `contenus/action-ent816.js`.
//
// 16 points de jalons + 4 de questions (`part: 4`) = 20 (poids validés par Tristan, brief §5). Niveaux : accompagné = une ligne d'aide par mot du
// terminal et la travée cernée ; confirmé = « Les mots du terminal » repliés (la 8e ligne « manquant » bonus du brief n'est pas faite : le moteur
// veut les mêmes jalons à tous les niveaux).

import { seanceEntreprise } from '../core/types/seance-entreprise.js';
import * as ACTION from '../contenus/action.js';
import * as SEANCE from '../contenus/action-ent816.js';
const s = seanceEntreprise(ACTION, SEANCE, {
  id: 'action-destocker',
  code: 'ENT-8.16',
  titre: 'Action — déstocker et signaler',
  desc: 'Une commande plus longue : un carton abîmé à laisser, un emplacement vide à signaler pour que le cariste descende la réserve, et le stock que le système doit connaître.',
  immersif: true,
  portee: 'eleve',
  niveaux: ['cap'],
  competences: [],
  competencesCap: ['CAP-C3.2'],
  temps: 'guidage',
  bareme: 20,
  parcours: true,
  correction: true,
  bilanDetail: true,
  precedente: 'action-preparer',
  niveauxPrevus: ['confirme', 'accompagne'],
  questions: 'ENT-8.16',
  pret: true,
  ouverture: 'prof',
}, SEANCE.OPTIONS);
export const meta = s.meta;
export const rendre = s.rendre;
