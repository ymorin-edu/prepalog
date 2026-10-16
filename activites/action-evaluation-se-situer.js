// ENT-8.5 — Action, évaluation « se situer dans un nouveau site ». Cinquième séance de l’entreprise n° 8 (CAP OL), troisième stage dans un site
// TIRÉ par élève (Onnaing / GXO / La Sentinelle, ou Belleville-en-Beaujolais / Kuehne+Nagel / Villefranche-sur-Saône) : ÉVALUATION de CAP-C1.1,
// se situer dans un environnement professionnel (brief `docs/briefs/ENT-8.5-action-evaluation-se-situer.md` ; décisions du chef de chantier :
// `docs/briefs/COORDINATION-action.md` §7). Jumelle : ENT-8.6 (même site pour un même élève, `contenus/action-eval-sites.js`).
//
// Avant de commencer (noté, 4 questions clés tirées), la carte de France (vue « Localiser » en évaluation : niveau standard pour tous, aide
// après deux erreurs, note au premier essai), « Qui est qui ? » (rôles), « La chaîne » (ordre du chemin d’un produit, sa place), « Ce que je
// change » (situations tirées). Contenu : `contenus/action-ent85.js` (données pures : `contenus/action-ent85-donnees.js`), questions :
// `contenus/questions/ENT-8.5.js`, univers : `contenus/action.js`.
//
// 16 points de jalons pondérés (carte 4,5, Qui est qui ? 4, chaîne 3,5, ce que je change 4) + 4 points d’ouverture (`part: 4`) = 20, poids
// du brief §5 (Cowork, délégation de Tristan du 16/10/2026). Évaluation : `copie: true`, `noter` ; ni bonus ni niveau ; pas de parcours (elle
// s’ouvre quand l’enseignant la coche). Livrée le 16/10/2026 (`pret: true, ouverture: 'prof'`) : Tristan l’essaie à l’écran et l’ouvre
// lui-même à son groupe.

import { seanceEntreprise } from '../core/types/seance-entreprise.js';
import * as ACTION from '../contenus/action.js';
import * as SEANCE from '../contenus/action-ent85.js';
const s = seanceEntreprise(ACTION, SEANCE, {
  id: 'action-evaluation-se-situer',
  code: 'ENT-8.5',                  // provisoire (brief §1)
  titre: 'Action — évaluation : se situer dans un nouveau site',
  desc: 'Situer un nouvel entrepôt, son magasin et le port, dire qui fait quoi, remettre dans l’ordre le chemin d’un produit et dire ce que change le travail de l’opérateur.',
  niveaux: ['cap'],
  competences: [],                  // séance réservée au CAP : elle ne compte que dans les compétences CAP (comme ENT-8.1 et 8.3)
  competencesCap: ['CAP-C1.1'],
  temps: 'evaluation',
  bareme: 20,                       // jalons pondérés (16) + questions d’ouverture (4), somme = 20
  copie: true,
  questions: 'ENT-8.5',
  pret: true,
  ouverture: 'prof',
}, SEANCE.OPTIONS);
export const meta = s.meta;
export const rendre = s.rendre;
export const noter = s.noter;
