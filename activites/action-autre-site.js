// ENT-8.3 — Action, « un autre site, un autre prestataire ». Troisième séance de l’entreprise n° 8 (CAP OL), nouvelle PFMP chez GXO à
// Labastide-Saint-Pierre : ENTRAÎNEMENT de CAP-C1.1, se situer dans un environnement professionnel (brief
// `docs/briefs/ENT-8.3-action-autre-site.md` ; décisions du chef de chantier : `docs/briefs/COORDINATION-action.md` §6.2). Précédente : ENT-8.2.
// Suite : ENT-8.4 (avant Noël).
//
// La carte de France (vue « Localiser » : Labastide, Roques, le port ; Onnaing chez un confirmé), « Qui est qui ? » (entrepôts et acteurs
// tirés, document « Le réseau d’Action » à gauche), « La chaîne de Romain » (deux cases fausses tirées, l’erreur induite, jugée sans ordre),
// « Ce que je change » (situations tirées, la remorque à deux planchers à gauche). Un écran par étape (décision de Tristan du 16/10/2026).
// Contenu : `contenus/action-ent83.js` (données pures : `contenus/action-ent83-donnees.js`), questions : `contenus/questions/ENT-8.3.js`.
//
// 16 points de jalons pondérés (carte 4,5, Qui est qui ? 4, chaîne 4, ce que je change 3,5) + 3 questions notées (`part: 4`) = 20,
// poids validés par Tristan le 15/10/2026. `correction: true` : « Corriger » rouvre les fiches fausses ; la carte et les questions se jouent
// au premier essai (`finFige`). Confirmé : un lieu bonus (Onnaing) et une situation bonus, cachés.
// Livrée le 16/10/2026 (`pret: true, ouverture: 'prof'`) : Tristan l’essaie à l’écran et l’ouvre lui-même à son groupe.

import { seanceEntreprise } from '../core/types/seance-entreprise.js';
import * as ACTION from '../contenus/action.js';
import * as SEANCE from '../contenus/action-ent83.js';
const s = seanceEntreprise(ACTION, SEANCE, {
  id: 'action-autre-site',
  code: 'ENT-8.3',
  titre: 'Action — un autre site, un autre prestataire',
  desc: 'Situer un autre entrepôt et un nouveau magasin d’Action, reconnaître qui exploite quel entrepôt, corriger la chaîne d’un produit et dire ce que change le travail de l’opérateur.',
  niveaux: ['cap'],
  competences: [],                  // séance réservée au CAP : elle ne compte que dans les compétences CAP (comme ENT-8.1)
  competencesCap: ['CAP-C1.1'],
  temps: 'entrainement',
  bareme: 20,                       // jalons pondérés (16) + questions notées (4), somme = 20
  parcours: true,
  precedente: 'action-prise-de-poste',
  correction: true,
  bilanDetail: true,                // CAP : le bilan de fin descend à la case, avec « Corriger dans … » par ligne et la liste « À corriger »
  niveauxPrevus: ['confirme', 'accompagne'],   // confirmé : lieu et situation bonus ; accompagné : la carte avec les noms (fiches standard)
  questions: 'ENT-8.3',
  pret: true,
  ouverture: 'prof',
}, SEANCE.OPTIONS);
export const meta = s.meta;
export const rendre = s.rendre;
