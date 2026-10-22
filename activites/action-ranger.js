// ENT-8.11 — Action, « ranger à la bonne adresse ». Onzième séance de l'entreprise n° 8 (CAP OL), retour à l'entrepôt Action d'Ensuès-la-Redonne
// exploité par Geodis : GUIDAGE de CAP-C1.5 (mettre en stock), première séance du palettier à adresse donnée (brief
// `docs/briefs/ENT-8.11-action-ranger.md` ; décisions du chef de chantier : `docs/briefs/COORDINATION-palettier.md` §3). Précédente : ENT-8.9 (la
// dernière séance de travail du parcours ; l'évaluation ENT-8.10 n'en a pas). Suite : ENT-8.12 (l'inventaire tournant, le lendemain).
//
// L'élève lit une adresse (fiche), range au sol les palettes du picking, regarde la plaque de charge, confie la réserve à Kevin, signale la palette
// dont l'adresse dépasserait la plaque (le Terminal donne la nouvelle adresse), scanne chaque palette (la palette, puis l'emplacement), fait
// monter les palettes et répond à Kevin par phrases. Données dans `contenus/action-ent811-donnees.js` et `contenus/action-ent811.js`, questions
// dans `contenus/questions/ENT-8.11.js`, univers dans `contenus/action.js`.
//
// 16 points de jalons pondérés + 4 de questions (`part: 4`) = 20 (poids validés par Tristan, brief §5). `correction` : « Corriger » rouvre la fiche
// et les phrases ; jamais le rangement (dit par `finFige`). Séance réservée au CAP : `competences: []`, `competencesCap`. Niveaux (`niveauxPrevus`) :
// confirmé = une 6e palette (P6, jalons bonus cachés) ; accompagné = la somme de charge faite de près et l'adresse attendue après « Valider ».

import { seanceEntreprise } from '../core/types/seance-entreprise.js';
import * as ACTION from '../contenus/action.js';
import * as SEANCE from '../contenus/action-ent811.js';
const s = seanceEntreprise(ACTION, SEANCE, {
  id: 'action-ranger',
  code: 'ENT-8.11',
  titre: 'Action — ranger à la bonne adresse',
  desc: 'Lire une adresse de rangement, ranger au sol les palettes du picking, vérifier la plaque de charge et confier la réserve au cariste, puis scanner pour que le système sache où est chaque palette.',
  immersif: true,
  portee: 'eleve',
  niveaux: ['cap'],
  competences: [],
  competencesCap: ['CAP-C1.5'],
  temps: 'guidage',
  bareme: 20,
  parcours: true,
  correction: true,
  bilanDetail: true,
  precedente: 'action-palette-lucas',
  niveauxPrevus: ['confirme', 'accompagne'],   // confirmé : P6 (bonus caché) ; accompagné : somme de charge, adresse attendue après « Valider »
  questions: 'ENT-8.11',
  pret: true,
  ouverture: 'prof',
}, SEANCE.OPTIONS);
export const meta = s.meta;
export const rendre = s.rendre;
