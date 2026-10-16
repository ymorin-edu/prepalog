// ENT-8.6 — Action, évaluation « ma prise de poste dans un nouveau site ». Sixième séance de l’entreprise n° 8 (CAP OL), le lendemain
// d’ENT-8.5, dans le MÊME site tiré par élève (Onnaing / GXO, ou Belleville-en-Beaujolais / Kuehne+Nagel) : ÉVALUATION de CAP-C1.2, prendre
// un poste en autonomie (brief `docs/briefs/ENT-8.6-action-evaluation-prise-de-poste.md` ; décisions du chef de chantier :
// `docs/briefs/COORDINATION-action.md` §7). Jumelle : ENT-8.5 (`contenus/action-eval-sites.js`).
//
// Avant de commencer (noté, 4 questions clés tirées, « Le droit » à gauche), Repérer mon poste (plan aux numéros tirés), Qui fait quoi ?, le
// planigramme (deux lectures tirées, puis le camion à poser au Planning des quais, `rendCopie: false`), les documents du camion (note du quai
// tirée), rendre compte par phrases. Contenu : `contenus/action-ent86.js` (données pures : `contenus/action-ent86-donnees.js`), questions :
// `contenus/questions/ENT-8.6.js`, univers : `contenus/action.js`.
//
// 16 points de jalons pondérés (repérer 2,5, qui fait quoi 2,5, planigramme 4, documents 4, rendre compte 3) + 4 points d’ouverture
// (`part: 4`) = 20, poids du brief §5 (Cowork, délégation de Tristan du 16/10/2026). Évaluation : `copie: true`, `noter` ; ni bonus ni niveau ;
// pas de parcours (elle s’ouvre quand l’enseignant la coche). Livrée le 16/10/2026 (`pret: true, ouverture: 'prof'`) : Tristan l’essaie à
// l’écran et l’ouvre lui-même à son groupe.

import { seanceEntreprise } from '../core/types/seance-entreprise.js';
import * as ACTION from '../contenus/action.js';
import * as SEANCE from '../contenus/action-ent86.js';
const s = seanceEntreprise(ACTION, SEANCE, {
  id: 'action-evaluation-prise-de-poste',
  code: 'ENT-8.6',                  // provisoire (brief §1)
  titre: 'Action — évaluation : ma prise de poste dans un nouveau site',
  desc: 'Repérer les lieux de la réception, dire qui fait quoi, lire le planigramme et y placer un camion, exploiter les documents du camion, vérifier qu’on peut l’ouvrir et rendre compte à son tuteur.',
  niveaux: ['cap'],
  competences: [],                  // séance réservée au CAP : elle ne compte que dans les compétences CAP (comme ENT-8.2 et 8.4)
  competencesCap: ['CAP-C1.2'],
  temps: 'evaluation',
  bareme: 20,                       // jalons pondérés (16) + questions d’ouverture (4), somme = 20
  copie: true,
  questions: 'ENT-8.6',
  pret: true,
  ouverture: 'prof',
}, SEANCE.OPTIONS);
export const meta = s.meta;
export const rendre = s.rendre;
export const noter = s.noter;
