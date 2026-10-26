// ENT-11.4 — Mondial Relay, « évaluation : le samedi du pic ». Quatrième séance de l'entreprise n° 11 (2de, scénario S3, poste B : agent d'exploitation de
// l'agence de Buchères) : ÉVALUATION d'OTM-C2.2 (réserver les moyens, planifier) et d'OTM-C3.2 (temps de conduite et de repos), copie rendue (brief
// `docs/briefs/ENT-11.4-mondial-relay-evaluation-planning.md`). Précédentes pour ces compétences : France Boissons ENT-6.8 (entraînement) et Smoby ENT-5.7.
//
// Avant de commencer (noté, 4 points, aucune aide), affecter un chauffeur et un camion aux 5 tournées du samedi (vue Planning, sans « Vérifier »),
// reprendre le planning après l'imprévu de 5 h 30, rendre compte à Samia par phrases à choisir, puis « Rendre ma copie ». Contenu :
// `contenus/mondial-relay-ent114.js` (données pures et solveur : `contenus/mondial-relay-ent114-donnees.js`), questions : `contenus/questions/ENT-11.4.js`.
//
// 15 points de jalons de planning (5 × 3) + 1 point de message + 4 points d'ouverture (`part: 4`) = 20 ; poids du brief §5 acceptés par Tristan le 26/10/2026.
//
// UN PLANNING TIRÉ PAR ÉLÈVE (règle du 03/10/2026) : le moteur ne sait pas encore tirer un `planning` (l'option est un objet, compilé une fois). Contournement
// SANS toucher à `core/` : un moteur par graine, fabriqué à la demande (`instance`), son planning étant celui du jeu de l'élève (`planningDe(graine)`). La graine est
// celle que le moteur pose lui-même à l'ouverture (`db.tirage.graine` = identifiant de l'élève) ; `noter(db)` relit la même graine dans la base. Les jalons, les
// messages, les documents et les questions lisent le jeu dans la base de l'élève. Demande au moteur écrite dans la section 7 du brief (`planning` en fonction de la graine).

import { seanceEntreprise } from '../core/types/seance-entreprise.js';
import * as MR from '../contenus/mondial-relay.js';
import * as SEANCE from '../contenus/mondial-relay-ent114.js';
import { planningDe, graineDeBase } from '../contenus/mondial-relay-ent114-donnees.js';

const META = {
  id: 'mondial-relay-evaluation-planning',
  code: 'ENT-11.4',
  titre: 'Mondial Relay — évaluation : le samedi du pic',
  desc: 'Agent d’exploitation de l’agence de Buchères : affecter un chauffeur et un camion à chaque tournée des Points Relais du samedi, en respectant permis, '
    + 'temps de conduite et repos, puis replanifier après un imprévu.',
  niveaux: ['2de'],
  competences: ['OTM-C2.2', 'OTM-C3.2'],
  domaines: ['D2'],
  temps: 'evaluation',
  bareme: 20,                                          // jalons pondérés (16) + questions d'ouverture (4), somme = 20
  copie: true,
  questions: 'ENT-11.4',
  pret: true,
  ouverture: 'prof',                                   // livrée fermée aux élèves : l'enseignant l'essaie, puis l'ouvre lui-même (Conduite de séance)
};

const instances = new Map();
const instance = (graine) => {
  const g = String(graine || '');
  if (!instances.has(g)) instances.set(g, seanceEntreprise(MR, SEANCE, META, { ...SEANCE.OPTIONS, planning: planningDe(g) }));
  return instances.get(g);
};

export const meta = instance('').meta;
export const rendre = (hote, ctx) => {
  const db = (ctx.jeu && ctx.jeu.etat && ctx.jeu.etat()) || {};
  const prenom = ctx.profil.prenom || ctx.profil.nom || 'Élève';
  return instance(graineDeBase(db) || ctx.profil.uid || prenom).rendre(hote, ctx);
};
export const noter = (db) => instance(graineDeBase(db)).noter(db);
