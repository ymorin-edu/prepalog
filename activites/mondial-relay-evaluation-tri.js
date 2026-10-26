// ENT-11.3 — Mondial Relay, « évaluation : la ligne de tri ». Troisième séance de l'entreprise n° 11 (2de GATL, scénario S3 « Le pic de fin d'année »),
// poste C (agent de tri), ÉVALUATION de C1.2 (sécurité), C1.4 (contrôler, repérer une anomalie) et C2.1 (expédier : le tri). Seul au poste : sécuriser
// le quai avant de décharger la navette de Reims (deux défauts tirés parmi cinq), trier une série de 16 colis tirés par élève à la cadence du pic,
// écarter ceux qui ne peuvent pas partir. Brief `docs/briefs/ENT-11.3-mondial-relay-evaluation-tri.md` ; vues « Quai » (`core/types/quai.js`) et
// « Tri des colis » (`core/types/tri.js`). Contenu : `contenus/mondial-relay-ent113.js` ; colis : `contenus/mondial-relay-colis.js` ; questions :
// `contenus/questions/ENT-11.3.js` ; corrigé : `contenus/corriges/ENT-11.3.js`.
// 15 points de jalons (sécurité 4, tri 7, écarts 4) + 1 point de questions au fil + 4 d'« Avant de commencer » = 20, poids validés par Tristan le 26/10/2026.

import { seanceEntreprise } from '../core/types/seance-entreprise.js';
import * as MR from '../contenus/mondial-relay.js';
import * as SEANCE from '../contenus/mondial-relay-ent113.js';
const s = seanceEntreprise(MR, SEANCE, {
  id: 'mondial-relay-evaluation-tri',
  code: 'ENT-11.3',
  titre: 'Mondial Relay — évaluation : la ligne de tri',
  desc: 'Seul au poste : vérifier la sécurité avant de décharger la navette, trier une série de colis à la cadence du pic, écarter ceux qui ne peuvent pas partir.',
  niveaux: ['2de'],
  competences: ['C1.2', 'C1.4', 'C2.1'],
  domaines: ['D4', 'D5'],
  temps: 'evaluation',
  bareme: 20,
  copie: true,
  questions: 'ENT-11.3',
  pret: true,
  ouverture: 'prof',
}, SEANCE.OPTIONS);
export const meta = s.meta;
export const rendre = s.rendre;
export const noter = s.noter;
