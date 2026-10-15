// ENT-7.4 — Decathlon, évaluation « un conteneur pour Dourges ». Quatrième séance de l'entreprise n° 7 (1re), service transport amont : ÉVALUATION de
// C2.6.1 et C2.6.2 (brief `docs/briefs/ENT-7.4-decathlon-evaluation-dourges.md`). Précédentes : ENT-7.1 à 7.3.
//
// Autre entrepôt (Dourges, Delta 3), autre carte, autres offres : on vérifie la méthode, pas une réponse apprise. CONTRE LA COPIE (décision 22) : l'offre
// référencée en retard est tirée par élève (le rail ou la barge), donc la bonne réponse change. Aucune aide, aucune correction, aucun encadré ; les pastilles
// disent « fait », jamais « juste ». Seule, sans Claire : choisir (comparateur), puis transmettre (ordre de transport, courriel au prestataire retenu, appel au quai).
// Données dans `contenus/decathlon-ent74.js` (et `-donnees.js`, pures), questions dans `contenus/questions/ENT-7.4.js`, univers dans `contenus/decathlon.js`.
//
// 14 jalons pondérés (somme 17) + 3 points de questions clés (`part: 3`), somme = 20 (`bareme: 20`), poids validés par Tristan (13/10/2026, décision 14).
// Évaluation : `copie: true`, `noter` ; pas de parcours (elle s'ouvre quand l'enseignant la coche, comme Picard ENT-4.4 et Cdiscount ENT-2.5).
// Livrée le 15/10/2026 (`pret: true, ouverture: 'prof'`) : Tristan l'essaie à l'écran et l'ouvre lui-même à son groupe.

import { seanceEntreprise } from '../core/types/seance-entreprise.js';
import * as DECATHLON from '../contenus/decathlon.js';
import * as SEANCE from '../contenus/decathlon-ent74.js';
const s = seanceEntreprise(DECATHLON, SEANCE, {
  id: 'decathlon-evaluation-dourges',
  code: 'ENT-7.4',   // provisoire, comme 7.1 à 7.3
  titre: 'Decathlon — évaluation : un conteneur pour Dourges',
  desc: 'Choisir le transporteur d’un conteneur entre Anvers et l’entrepôt continental de Dourges dans la liste référencée, puis transmettre l’ordre de transport et prévenir le quai.',
  niveaux: ['1re'],
  competences: ['C2.6'],   // les sous-compétences C2.6.1 et C2.6.2 n'existent pas dans core/competences.js
  temps: 'evaluation',
  bareme: 20,           // jalons pondérés (17) + questions clés (3), somme = 20
  copie: true,
  questions: 'ENT-7.4',
  pret: true,
  ouverture: 'prof',
}, SEANCE.OPTIONS);
export const meta = s.meta;
export const rendre = s.rendre;
export const noter = s.noter;
