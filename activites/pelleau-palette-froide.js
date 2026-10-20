// ENT-10.11 — Transports Pelleau, « la palette qui craint la chaleur ». Onzième séance de l'entreprise n° 10 (CAP OL), stagiaire en PFMP à l'entrepôt
// neuf de Gouesnou : ENTRAÎNEMENT de CAP-C1.4 AVEC ERREUR INDUITE, le piège du froid (brief `docs/briefs/ENT-10.11-pelleau-palette-froide.md` ; décisions
// du chef de chantier : `docs/briefs/COORDINATION-pelleau.md` §2). Précédente : ENT-10.10 (le contrôle, seul). Suite : ENT-10.12 (évaluation). Modèle : ENT-10.9.
//
// Dans la ramasse du matin, une palette de la Ferme de Kervéguen (fictive) : des plants de pommes de terre, « Conservation : entre 4 et 8 °C — craint le
// gel » sur l'étiquette. L'entrepôt est AMBIANT seulement. Loïc dit « Mets-la au rack, c'est pas grave » (erreur induite) : l'élève doit lire l'étiquette,
// REFUSER la mise en stock (quai iso, décision « Refuser »), contrôler les trois autres palettes (anomalie tirée), faire signer Loïc, dire ce que devient la
// palette (fiche à cases) et rendre compte à Erwan. Le rang de la palette de Kervéguen et l'anomalie des autres sont TIRÉS par élève. Contenu :
// `contenus/pelleau-ent111.js` ; questions : `contenus/questions/ENT-10.11.js`.
//
// 16 points de jalons pondérés + 4 de questions (`part: 4`) = 20, poids validés par Tristan le 18/10/2026 à 22 h 03 (brief §5). `correction` :
// « Corriger » rouvre la fiche et le compte rendu ; jamais le dialogue, le quai ni une question (`finFige`). Niveaux : confirmé = aides de comptage éteintes
// (brouillon libre), aucun bonus ; accompagné = standard. Séance réservée au CAP : `competences: []`, `competencesCap: ['CAP-C1.4']`.

import { seanceEntreprise } from '../core/types/seance-entreprise.js';
import * as PELLEAU from '../contenus/pelleau.js';
import * as SEANCE from '../contenus/pelleau-ent111.js';
const s = seanceEntreprise(PELLEAU, SEANCE, {
  id: 'pelleau-palette-froide',
  code: 'ENT-10.11',
  titre: 'Transports Pelleau — la palette qui craint la chaleur',
  desc: 'Lire les conditions de conservation sur l’étiquette, refuser de stocker ce que l’entrepôt ne sait pas garder, contrôler les autres palettes et rendre compte.',
  niveaux: ['cap'],
  competences: [],
  competencesCap: ['CAP-C1.4'],
  temps: 'entrainement',
  bareme: 20,
  parcours: true,
  correction: true,
  bilanDetail: true,
  precedente: 'pelleau-controle-seul',
  niveauxPrevus: ['confirme'],   // confirmé : aides de comptage éteintes (brouillon libre), aucun bonus ; accompagné = standard
  questions: 'ENT-10.11',
  pret: true,
  ouverture: 'prof',             // livrée fermée aux élèves : l'enseignant l'essaie, puis l'ouvre lui-même (Conduite de séance)
}, SEANCE.OPTIONS);
export const meta = s.meta;
export const rendre = s.rendre;
