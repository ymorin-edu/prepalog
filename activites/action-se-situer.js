// ENT-8.1 — Action, « d’où viennent les produits du magasin de Nîmes ? ». Première séance de l’entreprise n° 8 (CAP OL), stagiaire en PFMP
// chez Geodis à Ensuès-la-Redonne : GUIDAGE de CAP-C1.1, se situer dans un environnement professionnel (brief
// `docs/briefs/ENT-8.1-action-se-situer.md` ; décisions du chef de chantier : `docs/briefs/COORDINATION-action.md` §3). Suite : ENT-8.2.
//
// « Qui est qui ? » (acteurs tirés), la carte de France (vue « Localiser » : magasin, entrepôt, port), « La chaîne » (ordre du chemin d’un
// produit, départ mélangé par élève), « Ce que je change » (situations tirées). Contenu : `contenus/action-ent81.js` (données pures :
// `contenus/action-ent81-donnees.js`), questions : `contenus/questions/ENT-8.1.js`, univers : `contenus/action.js`.
//
// 16 jalons pondérés (Qui est qui ? 4, carte 4,5, chaîne 4, ce que je change 3,5) + 3 questions notées (`part: 4`) = 20 (`bareme: 20`),
// poids validés par Tristan le 15/10/2026 (option B). `correction: true` : « Corriger » rouvre les fiches fausses ; la carte et les
// questions se jouent au premier essai (`finFige`). Confirmé : un lieu bonus (Labastide) et une situation bonus, cachés.
// Livrée le 15/10/2026 (`pret: true, ouverture: 'prof'`) : Tristan l’essaie à l’écran et l’ouvre lui-même à son groupe.

import { seanceEntreprise } from '../core/types/seance-entreprise.js';
import * as ACTION from '../contenus/action.js';
import * as SEANCE from '../contenus/action-ent81.js';
const s = seanceEntreprise(ACTION, SEANCE, {
  id: 'action-se-situer',
  code: 'ENT-8.1',
  titre: 'Action — d’où viennent les produits du magasin de Nîmes ?',
  desc: 'Situer l’entrepôt, le magasin et le port sur la carte de France, reconnaître qui fait quoi dans la chaîne d’Action et ce que change le travail de l’opérateur.',
  niveaux: ['cap'],
  competences: [],                  // séance réservée au CAP : elle ne compte que dans les compétences CAP (décision n° 1 du chef de chantier)
  competencesCap: ['CAP-C1.1'],
  temps: 'guidage',
  bareme: 20,                       // jalons pondérés (16) + questions notées (4), somme = 20
  parcours: true,                   // première séance du parcours Action (pas de `precedente`)
  correction: true,
  niveauxPrevus: ['confirme', 'accompagne'],   // confirmé : lieu et situation bonus ; accompagné : la carte avec les noms (fiches standard)
  questions: 'ENT-8.1',
  reinitialisable: true,            // première séance d’Action : l’enseignant peut remettre un élève à zéro (règle des X.1)
  pret: true,
  ouverture: 'prof',
}, SEANCE.OPTIONS);
export const meta = s.meta;
export const rendre = s.rendre;
