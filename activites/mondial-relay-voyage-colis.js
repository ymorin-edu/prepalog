// ENT-11.1 — Mondial Relay, « le voyage d’un colis ». Première séance de l’entreprise n° 11 (2de GATL, scénario S3 « Le pic de fin d’année »,
// scénario d’ÉVALUATION de la 2de) : GUIDAGE-DÉCOUVERTE de C1.1, se situer dans l’entreprise et ses flux (brief
// `docs/briefs/ENT-11.1-mondial-relay-voyage-colis.md` ; cadrage `docs/briefs/mondial-relay/CADRAGE-S3-mondial-relay.md`).
//
// Décembre, au hub de Buchères (Aube). Romain, chef d’équipe du tri, accueille l’élève en renfort : la carte de France (vue « Localiser » :
// le hub, région et département notés), « Le voyage du colis » (ordre des 7 étapes du colis d’Inès, départ mélangé par élève) et « Peut-il
// voyager ? » (classer des colis : locker, Point Relais, refusé ; pièce fixe + colis tirés par élève, valeurs calculées depuis les règles).
// Contenu : `contenus/mondial-relay-ent111.js`, questions : `contenus/questions/ENT-11.1.js`, univers : `contenus/mondial-relay.js`.
//
// 16 jalons pondérés (carte 4 · voyage 6 · règles du colis 6) + 3 questions notées (`part: 4`) = 20 (`bareme: 20`), poids validés par Tristan
// le 26/10/2026. Confirmé : 2 colis bonus, cachés. Livrée le 26/10/2026 (`pret: true, ouverture: 'prof'`) : Tristan l’essaie à l’écran et
// l’ouvre lui-même à son groupe.

import { seanceEntreprise } from '../core/types/seance-entreprise.js';
import * as MR from '../contenus/mondial-relay.js';
import * as SEANCE from '../contenus/mondial-relay-ent111.js';
const s = seanceEntreprise(MR, SEANCE, {
  id: 'mondial-relay-voyage-colis',
  code: 'ENT-11.1',
  titre: 'Mondial Relay — le voyage d’un colis',
  desc: 'Découvrir le hub de Buchères : le situer sur la carte, suivre un colis du dépôt au retrait, connaître les règles qui décident s’il peut voyager.',
  niveaux: ['2de'],
  competences: ['C1.1'],
  domaines: ['D1'],
  temps: 'guidage',
  bareme: 20,                       // jalons pondérés (16) + questions notées (4), somme = 20
  niveauxPrevus: ['confirme'],      // confirmé : 2 colis bonus, cachés
  parcours: true,                   // première séance du scénario (pas de `precedente`) ; ENT-11.2 la suivra
  correction: true,
  questions: 'ENT-11.1',
  reinitialisable: true,            // première séance du scénario : l’enseignant peut remettre un élève à zéro (règle des X.1)
  pret: true,
  ouverture: 'prof',
}, SEANCE.OPTIONS);
export const meta = s.meta;
export const rendre = s.rendre;
