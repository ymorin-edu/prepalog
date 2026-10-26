// ENT-11.2 — Mondial Relay, « première nuit au tri ». Deuxième séance de l'entreprise n° 11 (2de GATL, scénario S3 « Le pic de fin d'année »),
// poste C (agent de tri) : GUIDAGE de C2.1 (le tri des colis vers les tournées) et C1.4 (repérer un colis qui ne peut pas partir, dire pourquoi),
// seul temps de travail du tri avant l'évaluation ENT-11.3. Brief `docs/briefs/ENT-11.2-mondial-relay-au-tri.md` ; vue « Tri des colis »
// (`core/types/tri.js`). Contenu : `contenus/mondial-relay-ent112.js` ; colis : `contenus/mondial-relay-colis.js` ; questions :
// `contenus/questions/ENT-11.2.js`. 13 points de jalons + 7 de questions (dont 3 de sécurité) = 20, poids validés par Tristan le 26/10/2026.

import { seanceEntreprise } from '../core/types/seance-entreprise.js';
import * as MR from '../contenus/mondial-relay.js';
import * as SEANCE from '../contenus/mondial-relay-ent112.js';
const s = seanceEntreprise(MR, SEANCE, {
  id: 'mondial-relay-au-tri',
  code: 'ENT-11.2',
  titre: 'Mondial Relay — première nuit au tri',
  desc: 'Agent de tri au hub de Buchères : sécuriser son poste, lire les étiquettes, trier les colis vers les tournées du lendemain et mettre '
    + 'à l’écart ceux qui ne peuvent pas partir.',
  niveaux: ['2de'],
  competences: ['C2.1', 'C1.4'],
  domaines: ['D4'],
  temps: 'guidage',
  bareme: 20,
  niveauxPrevus: ['confirme', 'accompagne'],   // confirmé : deux colis à la limite en série 2 ; accompagné : 40 s par colis
  questions: 'ENT-11.2',
  corrige: false,
  pret: true,
  ouverture: 'prof',
}, SEANCE.OPTIONS);
export const meta = s.meta;
export const rendre = s.rendre;
