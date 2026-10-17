// ENT-8.10 — Action, évaluation « recevoir un camion dans un nouveau site ». Dixième et dernière séance de l’entreprise n° 8 (CAP OL), le lendemain
// d’ENT-8.6, dans le MÊME site tiré par élève (Onnaing / GXO, ou Belleville-en-Beaujolais / Kuehne+Nagel) : ÉVALUATION de CAP-C1.3 et CAP-C1.4,
// recevoir seul un camion de bout en bout (brief `docs/briefs/ENT-8.10-action-evaluation-reception.md` ; décisions du chef de chantier :
// `docs/briefs/COORDINATION-action.md` §8.2 et §8.5 bis).
//
// Avant de commencer (noté, 4 questions clés tirées, « Le droit » à gauche), le protocole du quai 3 (3 situations tirées), l’accueil de Thomas en
// face à face (la première réponse compte), le quai 3 (inspection, dépose dirigée, contrôle, réserves, signature ; la clôture ne rend pas la
// copie), rendre compte par phrases. Contenu : `contenus/action-ent810.js` (données pures : `contenus/action-ent810-donnees.js`), questions :
// `contenus/questions/ENT-8.10.js`, univers : `contenus/action.js`.
//
// 16 points de jalons pondérés (protocole 3, accueil 3, avant de décharger 2,5, faire décharger 1, contrôler 3,5, réserves 2, rendre compte 1) +
// 4 points d’ouverture (`part: 4`) = 20, poids du brief §5 (Cowork, délégation de Tristan du 17/10/2026). Le moteur donne la MÊME note aux deux
// compétences CAP déclarées (`core/competences.js`, aucune répartition). Évaluation : `copie: true`, `noter` ; ni bonus ni niveau ; pas de
// parcours (elle s’ouvre quand l’enseignant la coche). Livrée le 17/10/2026 (`pret: true, ouverture: 'prof'`).

import { seanceEntreprise } from '../core/types/seance-entreprise.js';
import * as ACTION from '../contenus/action.js';
import * as SEANCE from '../contenus/action-ent810.js';
const s = seanceEntreprise(ACTION, SEANCE, {
  id: 'action-evaluation-reception',
  code: 'ENT-8.10',
  titre: 'Action — évaluation : recevoir un camion dans un nouveau site',
  desc: 'Appliquer le protocole de sécurité, accueillir le chauffeur, vérifier le quai et le camion, faire décharger, contrôler les palettes, écrire les réserves et rendre compte.',
  rubrique: 'simulog',
  immersif: true,
  portee: 'eleve',
  niveaux: ['cap'],
  competences: [],                  // séance réservée au CAP : elle ne compte que dans les compétences CAP
  competencesCap: ['CAP-C1.3', 'CAP-C1.4'],
  temps: 'evaluation',
  bareme: 20,                       // jalons pondérés (16) + questions d’ouverture (4), somme = 20
  copie: true,
  questions: 'ENT-8.10',
  pret: true,
  ouverture: 'prof',
}, SEANCE.OPTIONS);
export const meta = s.meta;
export const rendre = s.rendre;
export const noter = s.noter;
