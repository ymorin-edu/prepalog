// ENT-10.4 — Transports Pelleau, évaluation « prendre son poste ». Quatrième séance de l'entreprise n° 10 (CAP OL), stagiaire en PFMP à
// l'entrepôt neuf de Gouesnou : ÉVALUATION de CAP-C1.2, prendre son poste (brief `docs/briefs/ENT-10.4-pelleau-evaluation-prise-de-poste.md` ;
// décisions du chef de chantier : `docs/briefs/COORDINATION-pelleau.md` §2). Structure d'ENT-10.2 (inspection, planning, phrases), modèle
// d'évaluation d'ENT-8.6 (copie rendue, ouverture notée, `rendCopie: false`).
//
// Avant de commencer (noté, 4 questions clés tirées, sans aide), « Où est-ce ? » (plan aux numéros tirés), « Mon poste » (inspection en copie :
// deux défauts tirés, un point en ordre, avertisseur à essayer), Yann (il presse : une réplique juste calculée sur le défaut du site), « Lire
// le planning » (deux lectures tirées), le planning des quais (une carte à poser) et le compte rendu à Erwan par phrases. Contenu :
// `contenus/pelleau-ent104.js` (données pures : `contenus/pelleau-ent104-donnees.js`), questions : `contenus/questions/ENT-10.4.js`, univers :
// `contenus/pelleau.js`.
//
// 16 points de jalons pondérés (où est-ce 2, mon poste 6, ne pas céder 2, le planning 3, rendre compte 3) + 4 points d'ouverture (`part: 4`) = 20
// (`bareme: 20`), poids du brief §5 validés par Tristan le 18/10/2026 à 22 h 03. Évaluation : `copie: true`, `noter` ; ni bonus ni niveau ; pas de
// parcours (elle s'ouvre quand l'enseignant la coche). Une séance réservée au CAP : `competences: []` (aucune moyenne Bac Pro),
// `competencesCap: ['CAP-C1.2']`.

import { seanceEntreprise } from '../core/types/seance-entreprise.js';
import * as PELLEAU from '../contenus/pelleau.js';
import * as SEANCE from '../contenus/pelleau-ent104.js';
const s = seanceEntreprise(PELLEAU, SEANCE, {
  id: 'pelleau-evaluation-prise-de-poste',
  code: 'ENT-10.4',
  titre: 'Transports Pelleau — évaluation : prendre son poste',
  desc: 'Repérer son poste, contrôler le poste et l’engin, refuser ce qui n’est pas sûr, lire le planning des quais et rendre compte, sans aide.',
  niveaux: ['cap'],
  competences: [],                  // séance réservée au CAP : elle ne compte que dans les compétences CAP
  competencesCap: ['CAP-C1.2'],
  temps: 'evaluation',
  bareme: 20,                       // jalons pondérés (16) + questions d'ouverture (4), somme = 20
  copie: true,
  questions: 'ENT-10.4',
  pret: true,
  ouverture: 'prof',
}, SEANCE.OPTIONS);
export const meta = s.meta;
export const rendre = s.rendre;
export const noter = s.noter;
