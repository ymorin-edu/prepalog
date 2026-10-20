// ENT-10.10 — Transports Pelleau, « le contrôle, seul ». Dixième séance de l'entreprise n° 10 (CAP OL), stagiaire en PFMP à l'entrepôt neuf de Gouesnou :
// ENTRAÎNEMENT de CAP-C1.4, contrôler les quantités et l'état de la livraison (brief `docs/briefs/ENT-10.10-pelleau-controle-seul.md` ; décisions du chef de
// chantier : `docs/briefs/COORDINATION-pelleau.md` §2). Précédente : ENT-10.9 (guidage, Erwan à côté). Suite : ENT-10.11 (le piège du froid). Modèle : ENT-10.9.
//
// Même séance qu'ENT-10.9, SEUL : Erwan est au bureau, aides de comptage éteintes (brouillon libre), et un cas de plus au tirage : l'ARTICLE DIFFÉRENT (l'étiquette
// des sacs d'Agri-Kerlann dit l'engrais, la feuille de ramasse dit le terreau). Le quai A s'ouvre au contrôle (palettes triées par client, `commence:
// 'controle'`) : compter, faire le tour, lire l'étiquette, décider (anomalies TIRÉES par élève : `contenus/pelleau-ent110-donnees.js`), réserves sur la feuille
// de ramasse, signature de Loïc ; puis compte rendu à Erwan par phrases calculées sur son tirage. Contenu : `contenus/pelleau-ent110.js` ; questions :
// `contenus/questions/ENT-10.10.js`.
//
// 16 points de jalons pondérés + 4 de questions (`part: 4`) = 20, poids « comme ENT-10.9 » validés par Tristan le 18/10/2026 à 22 h 03 (brief §5).
// `correction` : « Corriger » rouvre le compte rendu ; jamais le quai ni une question (`finFige`). Niveaux : standard et confirmé = aides éteintes, aucun bonus
// (même camion) ; accompagné = le rappel « Fais le tour de la palette ». Séance réservée au CAP : `competences: []`, `competencesCap: ['CAP-C1.4']`.

import { seanceEntreprise } from '../core/types/seance-entreprise.js';
import * as PELLEAU from '../contenus/pelleau.js';
import * as SEANCE from '../contenus/pelleau-ent110.js';
const s = seanceEntreprise(PELLEAU, SEANCE, {
  id: 'pelleau-controle-seul',
  code: 'ENT-10.10',
  titre: 'Transports Pelleau — le contrôle, seul',
  desc: 'Contrôler seul les palettes de la ramasse, écrire les réserves, les faire signer et rendre compte.',
  niveaux: ['cap'],
  competences: [],
  competencesCap: ['CAP-C1.4'],
  temps: 'entrainement',
  bareme: 20,
  parcours: true,
  correction: true,
  bilanDetail: true,
  precedente: 'pelleau-controler',
  niveauxPrevus: ['confirme', 'accompagne'],   // confirmé = standard (aucun bonus) ; accompagné : rappel « Fais le tour de la palette »
  questions: 'ENT-10.10',
  pret: true,
  ouverture: 'prof',
}, SEANCE.OPTIONS);
export const meta = s.meta;
export const rendre = s.rendre;
