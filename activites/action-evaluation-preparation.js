// ENT-8.19 — Action, évaluation « préparer une commande dans un autre site ». Dix-neuvième séance de l'entreprise n° 8 (CAP OL), dans le MÊME site
// tiré par élève qu'ENT-8.5, 8.6, 8.10 et 8.14 (Onnaing / GXO, ou Belleville-en-Beaujolais / Kuehne+Nagel) : ÉVALUATION de CAP-C3.1 à C3.3 (prendre
// en charge, déstocker, conditionner), en copie rendue (brief `docs/briefs/ENT-8.19-action-evaluation-preparation.md`). Précédente : ENT-8.18.
//
// Avant de commencer (noté, 4 questions tirées), Prendre mon poste (inspection en copie, un défaut tiré), Lire ma mission (fiche), Préparer et
// monter (E-8 en copie : 7 lignes, un abîmé, un emplacement vide, film, étiquettes ; le montage jugé sur ce qui est posé), « Rendre ma copie ».
// Contenu : `contenus/action-ent819.js` (données pures : `contenus/action-ent819-donnees.js`), questions : `contenus/questions/ENT-8.19.js`.
//
// 16 points de jalons (prendre en charge 4, déstocker 6, conditionner 6) + 4 d'ouverture (`part: 4`) = 20 (poids validés par Tristan, brief §5).
// Évaluation : `copie: true`, `noter` ; ni bonus ni niveau ; pas de parcours (elle s'ouvre quand l'enseignant la coche).

import { seanceEntreprise } from '../core/types/seance-entreprise.js';
import * as ACTION from '../contenus/action.js';
import * as SEANCE from '../contenus/action-ent819.js';
const s = seanceEntreprise(ACTION, SEANCE, {
  id: 'action-evaluation-preparation',
  code: 'ENT-8.19',
  titre: 'Action — évaluation : préparer une commande dans un autre site',
  desc: 'Dans un entrepôt que tu ne connais pas : prendre ton poste, lire ta mission, suivre le terminal, signaler ce qui ne va pas, monter, filmer et étiqueter ta palette.',
  rubrique: 'simulog',
  immersif: true,
  portee: 'eleve',
  niveaux: ['cap'],
  competences: [],
  competencesCap: ['CAP-C3.1', 'CAP-C3.2', 'CAP-C3.3'],
  temps: 'evaluation',
  bareme: 20,
  copie: true,
  questions: 'ENT-8.19',
  pret: true,
  ouverture: 'prof',
}, SEANCE.OPTIONS);
export const meta = s.meta;
export const rendre = s.rendre;
export const noter = s.noter;
