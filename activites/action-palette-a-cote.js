// ENT-8.13 — Action, « la palette d'à côté ». Treizième séance de l'entreprise n° 8 (CAP OL), à l'entrepôt Action d'Ensuès-la-Redonne exploité par
// Geodis : ENTRAÎNEMENT de CAP-C1.5 (mettre en stock), avec ERREUR INDUITE (brief `docs/briefs/ENT-8.13-action-palette-a-cote.md` ; décisions du chef
// de chantier : `docs/briefs/COORDINATION-palettier.md` §3 et §4). Précédente : ENT-8.12 (l'inventaire tournant). Suite : ENT-8.14 (l'évaluation).
//
// Un jeudi soir, l'élève range deux palettes ; l'adresse de P3 est prise et Kevin le pousse à la poser « à côté ». Le lendemain, 6 h, Yanis ne trouve
// pas une palette : SA palette s'il ne l'a pas dit au système, sinon celle que Kevin a posée à côté sans scan. L'élève la retrouve, la transfère au
// Terminal et rend compte à Samia par phrases calculées sur son chemin. Données dans `contenus/action-ent813-donnees.js` et `contenus/action-ent813.js`,
// questions dans `contenus/questions/ENT-8.13.js`, univers dans `contenus/action.js`.
//
// 16 points de jalons pondérés + 4 de questions (`part: 4`) = 20 (poids validés par Tristan, brief §5) ; un élève piégé peut avoir 17. `correction` :
// « Corriger » rouvre le message à Samia ; jamais le palettier (dit par `finFige`). Séance réservée au CAP : `competences: []`, `competencesCap`.
// Niveaux (`niveauxPrevus`) : confirmé = la même enquête, « retrouvée » en 3 ouvertures au plus au lieu de 4 ; accompagné = Yanis dit « pas loin » et
// le produit, l'adresse attendue après « Valider mon transfert ».

import { seanceEntreprise } from '../core/types/seance-entreprise.js';
import * as ACTION from '../contenus/action.js';
import * as SEANCE from '../contenus/action-ent813.js';
const s = seanceEntreprise(ACTION, SEANCE, {
  id: 'action-palette-a-cote',
  code: 'ENT-8.13',
  titre: 'Action — la palette d’à côté',
  desc: 'Ranger en fin de poste quand l’adresse est prise, puis, le lendemain, retrouver une palette que le système croit ailleurs, la remettre en ordre au terminal et rendre compte.',
  immersif: true,
  portee: 'eleve',
  niveaux: ['cap'],
  competences: [],
  competencesCap: ['CAP-C1.5'],
  temps: 'entrainement',
  bareme: 20,
  parcours: true,
  correction: true,
  bilanDetail: true,
  precedente: 'action-inventaire-tournant',
  niveauxPrevus: ['confirme', 'accompagne'],   // confirmé : trouvée en 3 ouvertures ; accompagné : Yanis aide, adresse attendue au verdict
  questions: 'ENT-8.13',
  pret: true,
  ouverture: 'prof',
}, SEANCE.OPTIONS);
export const meta = s.meta;
export const rendre = s.rendre;
