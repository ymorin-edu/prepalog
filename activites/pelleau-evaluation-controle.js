// ENT-10.12 — Transports Pelleau, « évaluation : contrôler la réception ». Douzième et dernière séance de l'entreprise n° 10 (CAP OL), stagiaire en PFMP à l'entrepôt
// neuf de Gouesnou : ÉVALUATION de CAP-C1.4, contrôler la réception (brief `docs/briefs/ENT-10.12-pelleau-evaluation-controle.md` ; décisions du chef de chantier :
// `docs/briefs/COORDINATION-pelleau.md` §2). Précédentes : ENT-10.9 (guidage), ENT-10.10 et 10.11 (entraînements, dont l'erreur induite du froid).
//
// Avant de commencer (noté, 4 questions tirées, aucune aide), le quai A (inspection des palettes : compter, faire le tour, lire l'étiquette, décider ; réserves ; signature de
// Loïc ; le quai ne rend pas la copie), rendre compte à Erwan par phrases. Les palettes sont TIRÉES par élève : deux à problème (dont, une copie sur trois, la palette de la Ferme
// de Kervéguen à REFUSER dans un entrepôt ambiant), un piège de comptage, une conforme. Contenu : `contenus/pelleau-ent112.js` (données pures :
// `contenus/pelleau-ent112-donnees.js`), questions : `contenus/questions/ENT-10.12.js`, univers : `contenus/pelleau.js`.
//
// 16 points de jalons pondérés (palettes 8, réserves et signature 4, rendre compte 4) + 4 points d'ouverture (`part: 4`) = 20, poids validés par Tristan le 18/10/2026 à
// 22 h 03 (brief §5). Évaluation : `copie: true`, `noter` ; ni bonus ni niveau (comme ENT-8.6, 8.10 et 10.8) ; ni `parcours` (elle s'ouvre quand l'enseignant la coche), ni
// `correction`. Séance réservée au CAP : `competences: []`, `competencesCap: ['CAP-C1.4']`.

import { seanceEntreprise } from '../core/types/seance-entreprise.js';
import * as PELLEAU from '../contenus/pelleau.js';
import * as SEANCE from '../contenus/pelleau-ent112.js';
const s = seanceEntreprise(PELLEAU, SEANCE, {
  id: 'pelleau-evaluation-controle',
  code: 'ENT-10.12',
  titre: 'Transports Pelleau — évaluation : contrôler la réception',
  desc: 'Contrôler seul les palettes de la ramasse, décider pour chacune, écrire les réserves, les faire signer et rendre compte, sans aide.',
  niveaux: ['cap'],
  competences: [],
  competencesCap: ['CAP-C1.4'],
  temps: 'evaluation',
  bareme: 20,                                          // jalons pondérés (16) + questions d'ouverture (4), somme = 20
  copie: true,
  questions: 'ENT-10.12',
  pret: true,
  ouverture: 'prof',                                   // livrée fermée aux élèves : l'enseignant l'essaie, puis l'ouvre lui-même (Conduite de séance)
}, SEANCE.OPTIONS);
export const meta = s.meta;
export const rendre = s.rendre;
export const noter = s.noter;
