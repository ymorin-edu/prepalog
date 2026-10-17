// ENT-8.8 — Action, « on vérifie qu'il ne manque rien ». Huitième séance de l'entreprise n° 8 (CAP OL), entrepôt Action d'Ensuès-la-Redonne
// exploité par Geodis : GUIDAGE de CAP-C1.4, contrôler les quantités et l'état de la livraison (brief `docs/briefs/ENT-8.8-action-controler.md` ;
// décisions du chef de chantier : `docs/briefs/COORDINATION-action.md` §8). Précédente : ENT-8.7 (on décharge ensemble), même camion du Havre.
//
// Le quai 2 s'ouvre au contrôle (palettes au sol, `commence: 'controle'`) : compter, faire le tour, lire l'étiquette, décider (anomalies TIRÉES
// par élève : `contenus/action-ent88-donnees.js`), réserves sur le « Bon de livraison — lettre de voiture », signature de Marc ; puis compte rendu
// à Samia par phrases calculées sur son tirage. Contenu : `contenus/action-ent88.js` ; questions : `contenus/questions/ENT-8.8.js`.
//
// 16 points de jalons pondérés + 4 de questions (`part: 4`) = 20, poids validés par Tristan le 16/10/2026 à 19 h 20. `correction` : « Corriger »
// rouvre le compte rendu ; jamais le quai ni une question (`finFige`). Pas de `niveauxPrevus` : la vue quai ne lit pas le niveau de l'élève, les
// aides de comptage sont allumées pour tous (décision §8.2 n° 4) et aucun cas bonus n'existe sans changer le socle.
// Une séance réservée au CAP : `competences: []`, `competencesCap: ['CAP-C1.4']`.

import { seanceEntreprise } from '../core/types/seance-entreprise.js';
import * as ACTION from '../contenus/action.js';
import * as SEANCE from '../contenus/action-ent88.js';
const s = seanceEntreprise(ACTION, SEANCE, {
  id: 'action-controler',
  code: 'ENT-8.8',
  titre: 'Action — on vérifie qu’il ne manque rien',
  desc: 'Contrôler les palettes du camion contre le bon de livraison, repérer les cartons abîmés ou manquants, écrire des réserves précises, faire signer le chauffeur et rendre compte.',
  niveaux: ['cap'],
  competences: [],
  competencesCap: ['CAP-C1.4'],
  temps: 'guidage',
  bareme: 20,
  parcours: true,
  correction: true,
  bilanDetail: true,
  precedente: 'action-decharger',
  questions: 'ENT-8.8',
  pret: true,
  ouverture: 'prof',
}, SEANCE.OPTIONS);
export const meta = s.meta;
export const rendre = s.rendre;
