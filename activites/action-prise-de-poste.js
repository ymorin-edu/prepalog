// ENT-8.2 — Action, « ma prise de poste à la réception ». Deuxième séance de l'entreprise n° 8 (CAP OL), entrepôt Action d'Ensuès-la-Redonne
// exploité par Geodis : GUIDAGE de CAP-C1.2, prendre un poste en autonomie (brief `docs/briefs/ENT-8.2-action-prise-de-poste.md`).
// Précédente : ENT-8.1 (se situer). Suite : C1.3, la réception (« on décharge ensemble »).
//
// Visite de la réception (premier essai), « Qui fait quoi ? » (tâches tirées), planigramme (lectures tirées, calculées sur la grille) et
// planning des quais (une carte à poser), les trois documents du camion (n° et quantités tirés) et « Avant d'ouvrir le camion », compte
// rendu à Samia par phrases. Données dans `contenus/action-ent82.js`, questions dans `contenus/questions/ENT-8.2.js`, univers dans
// `contenus/action.js`.
//
// 16 points de jalons pondérés + 4 de questions (`part: 4`) = 20, poids validés par Tristan le 15/10/2026 à 19 h 18. `correction` : « Corriger »
// rouvre les fiches, le planning et le compte rendu ; jamais la visite ni une question (premier essai, dit par `finFige`).
// Une séance réservée au CAP : `competences: []` (elle n'entre dans aucune moyenne Bac Pro), `competencesCap: ['CAP-C1.2']`.

import { seanceEntreprise } from '../core/types/seance-entreprise.js';
import * as ACTION from '../contenus/action.js';
import * as SEANCE from '../contenus/action-ent82.js';
const s = seanceEntreprise(ACTION, SEANCE, {
  id: 'action-prise-de-poste',
  code: 'ENT-8.2',
  titre: 'Action — ma prise de poste à la réception',
  desc: 'Repérer son poste et l’équipe de la réception, lire le planigramme, reconnaître les documents du camion et rendre compte à sa cheffe d’équipe.',
  niveaux: ['cap'],
  competences: [],
  competencesCap: ['CAP-C1.2'],
  temps: 'guidage',
  bareme: 20,
  parcours: true,
  correction: true,
  bilanDetail: true,                // CAP : le bilan de fin descend à la case, avec « Corriger dans … » par ligne et la liste « À corriger » (16/10/2026)
  precedente: 'action-se-situer',
  niveauxPrevus: ['confirme'],   // bonus du confirmé : une tâche et une lecture de plus (cachés à l'élève)
  questions: 'ENT-8.2',
  trame: 'action-prise-de-poste',  // contenus/trames/ENT-8.2-action-prise-de-poste-trame-eleve.pdf|docx (Cowork, relue par Tristan le 16/10/2026)
  pret: true,
  ouverture: 'prof',
}, SEANCE.OPTIONS);
export const meta = s.meta;
export const rendre = s.rendre;
