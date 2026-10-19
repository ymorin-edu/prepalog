// ENT-10.3 — Transports Pelleau, « on commence quand même ? ». Troisième séance de l'entreprise n° 10 (CAP OL), stagiaire en PFMP à l'entrepôt neuf de
// Gouesnou : ENTRAÎNEMENT de CAP-C1.2, prendre son poste, avec ERREUR INDUITE TIRÉE (« le site n'est pas fini » ou « l'engin n'a pas été contrôlé »)
// (brief `docs/briefs/ENT-10.3-pelleau-on-commence-quand-meme.md` ; décisions du chef de chantier : `docs/briefs/COORDINATION-pelleau.md` §2).
// Précédente : ENT-10.2. Suite : ENT-10.4 (évaluation).
//
// Yann en face à face (deux fois), « Mon poste » (vue « Inspection du poste » : deux transpalettes, défaut tiré, pas d'arrêt), la fiche « Signalement »,
// le compte rendu à Erwan par phrases. Contenu : `contenus/pelleau-ent103.js` (données pures : `contenus/pelleau-ent103-donnees.js`), questions :
// `contenus/questions/ENT-10.3.js`, univers : `contenus/pelleau.js`.
//
// 16 points de jalons pondérés (avant le premier geste 1,5, mon poste 6, ne pas céder 3, signaler par écrit 3, rendre compte 2,5) + 4 de questions
// (`part: 4`) = 20 (`bareme: 20`), poids validés par Tristan le 18/10/2026 à 22 h 03. `correction: true` : « Corriger » rouvre la fiche et le compte
// rendu ; jamais les dialogues ni l'inspection (`finFige`). Niveaux : le confirmé n'a pas la liste « Ma prise de poste » (aide éteinte), aucun cas bonus ;
// accompagné = standard. Une séance réservée au CAP : `competences: []`, `competencesCap: ['CAP-C1.2']`.

import { seanceEntreprise } from '../core/types/seance-entreprise.js';
import * as PELLEAU from '../contenus/pelleau.js';
import * as SEANCE from '../contenus/pelleau-ent103.js';
const s = seanceEntreprise(PELLEAU, SEANCE, {
  id: 'pelleau-on-commence-quand-meme',
  code: 'ENT-10.3',
  titre: 'Transports Pelleau — on commence quand même ?',
  desc: 'Contrôler son poste et son engin même quand un collègue presse, refuser ce qui n’est pas sûr, le signaler par écrit et rendre compte.',
  niveaux: ['cap'],
  competences: [],
  competencesCap: ['CAP-C1.2'],
  temps: 'entrainement',
  bareme: 20,
  parcours: true,
  correction: true,
  bilanDetail: true,                // CAP : le bilan de fin descend à la case, avec « Corriger dans … » par ligne
  precedente: 'pelleau-premier-jour',
  niveauxPrevus: ['confirme'],      // confirmé : « Ma prise de poste » n'est pas jointe (aide éteinte), aucun cas bonus
  questions: 'ENT-10.3',
  pret: true,
  ouverture: 'prof',
}, SEANCE.OPTIONS);
export const meta = s.meta;
export const rendre = s.rendre;
