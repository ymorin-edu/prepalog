// ENT-8.14 — Action, évaluation « ranger et compter dans le site d'évaluation ». Quatorzième et dernière séance de l'entreprise n° 8 sur le palettier (CAP OL), dans le
// MÊME site tiré par élève qu'ENT-8.5, 8.6 et 8.10 (Onnaing / GXO, ou Belleville-en-Beaujolais / Kuehne+Nagel) : ÉVALUATION de CAP-C1.5 (mettre en stock : repérer les adresses,
// ranger, voir une plaque de charge, traiter une adresse prise, scanner, compter, signaler un écart), en copie rendue (brief `docs/briefs/ENT-8.14-action-evaluation-stock.md` ;
// décisions du chef de chantier : `docs/briefs/COORDINATION-palettier.md` §3 et §4).
//
// Avant de commencer (noté, 4 questions clés tirées, « Le droit » à gauche), le plan de l'entrepôt du site (5 palettes à ranger : deux au sol, une à confier au cariste, une dont
// l'adresse dépasserait la plaque à signaler, une dont l'adresse est prise ; scanner), « Passer au comptage » (4 adresses à compter à l'aveugle au Terminal, dont un écart), la
// fiche « Signaler l'écart » (une ligne par écart confirmé de l'élève), « Rendre ma copie » (le bandeau du moteur : l'entrepôt ne rend jamais la copie, `rendCopie: false`).
// Contenu : `contenus/action-ent814.js` (données pures : `contenus/action-ent814-donnees.js`), questions : `contenus/questions/ENT-8.14.js`, univers : `contenus/action.js`.
//
// 16 points de jalons pondérés (repérer les adresses 3, ranger et voir la plaque 4, adresse prise 2, scanner 3, comptages 2, écart signalé 2) + 4 points d'ouverture (`part: 4`)
// = 20, poids du brief §5 (validés par Tristan le 21/10/2026). Le moteur donne la MÊME note à la compétence CAP déclarée. Évaluation : `copie: true`, `noter` ; ni bonus ni niveau ; pas
// de parcours (elle s'ouvre quand l'enseignant la coche).

import { seanceEntreprise } from '../core/types/seance-entreprise.js';
import * as ACTION from '../contenus/action.js';
import * as SEANCE from '../contenus/action-ent814.js';
const s = seanceEntreprise(ACTION, SEANCE, {
  id: 'action-evaluation-stock',
  code: 'ENT-8.14',
  titre: 'Action — évaluation : ranger et compter dans un nouveau site',
  desc: 'Dans un entrepôt inconnu : ranger des palettes à leur adresse, voir une plaque de charge dépassée, traiter une adresse prise, scanner, compter des adresses et signaler un écart.',
  rubrique: 'simulog',
  immersif: true,
  portee: 'eleve',
  niveaux: ['cap'],
  competences: [],                  // séance réservée au CAP : elle ne compte que dans les compétences CAP
  competencesCap: ['CAP-C1.5'],
  temps: 'evaluation',
  bareme: 20,                       // jalons pondérés (16) + questions d'ouverture (4), somme = 20
  copie: true,
  questions: 'ENT-8.14',
  pret: true,
  ouverture: 'prof',
}, SEANCE.OPTIONS);
export const meta = s.meta;
export const rendre = s.rendre;
export const noter = s.noter;
