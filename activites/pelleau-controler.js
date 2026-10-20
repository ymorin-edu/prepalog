// ENT-10.9 — Transports Pelleau, « contrôler les palettes des clients ». Neuvième séance de l'entreprise n° 10 (CAP OL), stagiaire en PFMP à l'entrepôt
// neuf de Gouesnou : GUIDAGE de CAP-C1.4, contrôler les quantités et l'état de la livraison (brief `docs/briefs/ENT-10.9-pelleau-controler.md` ;
// décisions du chef de chantier : `docs/briefs/COORDINATION-pelleau.md` §2). Précédente : ENT-10.8 (évaluation de la réception). Suite : ENT-10.10
// (entraînement). Modèle : ENT-8.8 (Action).
//
// Le quai A s'ouvre au contrôle (palettes triées par client, `commence: 'controle'`) : compter, faire le tour, lire l'étiquette, décider (anomalies
// TIRÉES par élève : `contenus/pelleau-ent109-donnees.js`), réserves sur la feuille de ramasse, signature de Loïc ; puis compte rendu à Erwan par
// phrases calculées sur son tirage. Cartons (Ar Vag) et SACS dessinés (Agri-Kerlann) sur le même quai. Contenu : `contenus/pelleau-ent109.js` ;
// questions : `contenus/questions/ENT-10.9.js`.
//
// 16 points de jalons pondérés + 4 de questions (`part: 4`) = 20, poids validés par Tristan le 18/10/2026 à 22 h 03 (brief §5). `correction` :
// « Corriger » rouvre le compte rendu ; jamais le quai ni une question (`finFige`). Niveaux : confirmé = aides de comptage éteintes (brouillon libre),
// aucun bonus ; accompagné = standard. Séance réservée au CAP : `competences: []`, `competencesCap: ['CAP-C1.4']`.

import { seanceEntreprise } from '../core/types/seance-entreprise.js';
import * as PELLEAU from '../contenus/pelleau.js';
import * as SEANCE from '../contenus/pelleau-ent109.js';
const s = seanceEntreprise(PELLEAU, SEANCE, {
  id: 'pelleau-controler',
  code: 'ENT-10.9',
  titre: 'Transports Pelleau — contrôler les palettes des clients',
  desc: 'Compter les colis de chaque palette, repérer ce qui est abîmé ou manque, écrire des réserves précises sur la feuille de ramasse, les faire signer et rendre compte.',
  niveaux: ['cap'],
  competences: [],
  competencesCap: ['CAP-C1.4'],
  temps: 'guidage',
  bareme: 20,
  parcours: true,
  correction: true,
  bilanDetail: true,
  precedente: 'pelleau-evaluation-reception',
  niveauxPrevus: ['confirme'],   // confirmé : aides de comptage éteintes (brouillon libre), aucun bonus ; accompagné = standard
  questions: 'ENT-10.9',
  pret: true,
  ouverture: 'prof',
}, SEANCE.OPTIONS);
export const meta = s.meta;
export const rendre = s.rendre;
