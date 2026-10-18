// ENT-9.4 — CHEP, évaluation « la semaine de Légumes de la Lys ». Quatrième et dernière séance de l'entreprise n° 9 (1re), centre de service de
// Templemars : ÉVALUATION de C2.5, traiter les retours des supports de charge (les quatre indicateurs). Brief
// `docs/briefs/ENT-9.4-chep-evaluation.md` ; cadrage commun `docs/briefs/COORDINATION-chep.md`.
//
// L'élève est seul : Avant de commencer (noté, 4 questions clés tirées), puis trois parties dans l'ordre qu'il veut — A les déclarations et le
// relevé d'un client neuf (Légumes de la Lys), B le contrôle et le crédit d'un retour de palettes vides (Halles d'Artois, quatre piles), C la
// ramasse du jeudi (le site à camion complet, la tournée) — et « Rendre ma copie ». Tout est tiré par élève (graine = son identifiant) ; rien
// n'est jugé à l'écran avant la remise. Les écrans sont ceux d'ENT-9.1 et 9.2, par leurs fabriques, sans aide.
// Contenu : `contenus/chep-ent94.js` (et `-donnees.js`) ; questions : `contenus/questions/ENT-9.4.js` ; corrigé : `contenus/corriges/ENT-9.4.js`.
//
// 16 points de jalons pondérés (compte 6, retour 6, ramasse 4) + 4 points d'ouverture (`part: 4`) = 20 (`bareme: 20`), poids du brief §5 (Cowork,
// délégation de Tristan du 17/10/2026). Évaluation : `copie: true`, `noter` ; ni bonus ni niveau ; pas de parcours (elle s'ouvre quand
// l'enseignant la coche, comme ENT-8.10). Une base par séance (pas de `jeuId`).

import { seanceEntreprise } from '../core/types/seance-entreprise.js';
import * as CHEP from '../contenus/chep.js';
import * as SEANCE from '../contenus/chep-ent94.js';
const s = seanceEntreprise(CHEP, SEANCE, {
  id: 'chep-evaluation',
  code: 'ENT-9.4',
  titre: 'CHEP — évaluation : la semaine de Légumes de la Lys',
  desc: 'Seul au service clients de Templemars : préparer les déclarations d’un client et son solde, contrôler un retour de palettes vides et le '
    + 'créditer, organiser la ramasse du lendemain.',
  niveaux: ['1re'],
  competences: ['C2.5'],
  temps: 'evaluation',
  bareme: 20,           // jalons pondérés (16) + questions d'ouverture (4), somme = 20
  copie: true,
  questions: 'ENT-9.4',
  immersif: true,
  portee: 'eleve',
  pret: true,
  ouverture: 'prof',   // fermée aux élèves tant que Tristan ne l'a pas cochée dans « Conduite de séance »
}, SEANCE.OPTIONS);
export const meta = s.meta;
export const rendre = s.rendre;
export const noter = s.noter;
