// ENT-8.9 — Action, « la palette de Lucas ». Neuvième séance de l'entreprise n° 8 (CAP OL), entrepôt Action de Labastide-Saint-Pierre exploité par
// GXO : ENTRAÎNEMENT de CAP-C1.3 et CAP-C1.4, avec une ERREUR INDUITE (brief `docs/briefs/ENT-8.9-action-labastide-reception.md` ; décisions du chef
// de chantier : `docs/briefs/COORDINATION-action.md` §8.5). Précédente : ENT-8.8. Suite : ENT-8.10 (l'évaluation de la réception).
//
// L'élève reçoit SEUL un camion de jouets : il accueille Jan en face à face, inspecte le quai sur la scène (deux anomalies tirées), dirige la dépose
// des 4 palettes, les contrôle, écrit ses réserves et fait signer Jan ; puis il traite la palette de peluches acceptée sans réserve par Lucas (date de
// réception tirée : on peut encore protester, ou plus) et rend compte à Romain. Données dans `contenus/action-ent89-donnees.js` et
// `contenus/action-ent89.js`, questions dans `contenus/questions/ENT-8.9.js`, univers dans `contenus/action.js`.
//
// 16 points de jalons pondérés + 4 de questions (`part: 4`) = 20 (poids du brief §5). `correction` : « Corriger » rouvre le dialogue (« Revenir le
// voir »), la fiche de Lucas et les phrases ; jamais le quai (dit par `finFige`). Séance réservée au CAP : `competences: []`, `competencesCap`.
// Niveaux (`niveauxPrevus`, lot 4 du 17/10/2026) : le quai reçoit le niveau de l'élève — confirmé : une 3e anomalie de scène (jalon bonus) ;
// accompagné : aides de comptage allumées et 2 réponses par réplique du dialogue.

import { seanceEntreprise } from '../core/types/seance-entreprise.js';
import * as ACTION from '../contenus/action.js';
import * as SEANCE from '../contenus/action-ent89.js';
const s = seanceEntreprise(ACTION, SEANCE, {
  id: 'action-palette-lucas',
  code: 'ENT-8.9',
  titre: 'Action — la palette de Lucas',
  desc: 'Recevoir seul un camion de jouets à Labastide, de l’accueil du chauffeur aux réserves, puis traiter une palette abîmée acceptée sans réserve la veille.',
  immersif: true,
  portee: 'eleve',
  niveaux: ['cap'],
  competences: [],
  competencesCap: ['CAP-C1.3', 'CAP-C1.4'],
  temps: 'entrainement',
  bareme: 20,
  parcours: true,
  correction: true,
  bilanDetail: true,
  precedente: 'action-controler',
  niveauxPrevus: ['confirme', 'accompagne'],   // confirmé : 3e anomalie de scène (cachée) ; accompagné : aides de comptage, 2 réponses par réplique (lot 4)
  questions: 'ENT-8.9',
  pret: true,
  ouverture: 'prof',
}, SEANCE.OPTIONS);
export const meta = s.meta;
export const rendre = s.rendre;
