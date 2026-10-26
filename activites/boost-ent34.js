// ENT-3.4 — Boost, « évaluation de la tournée ». Quatrième séance de C2.4 « Organiser une tournée de livraison » :
// l'ÉVALUATION, après le guidage (3.1), l'entraînement (3.2) et l'erreur induite (3.3).
//
// Une journée NEUVE, seul(e), sans verdict : situer quatre nouveaux clients, décider ce qui reste à quai, construire une
// tournée qui tient le train et le créneau en roulant le moins possible, calculer ses heures dans la feuille, puis rendre
// sa copie, une seule fois. Brief : `docs/briefs/ENT-3.4-boost-evaluation-tournee.md` ; contenu et jalons :
// `contenus/boost-ent34.js` ; journée : `contenus/boost-ent34-carte.js` (généré).
//
// Livrée fermée aux élèves (`ouverture: 'prof'`) : Tristan l'essaie, puis l'ouvre lui-même dans « Conduite de séance ».

import { seanceEntreprise } from '../core/types/seance-entreprise.js';
import * as BOOST from '../contenus/boost.js';
import * as SEANCE from '../contenus/boost-ent34.js';
const s = seanceEntreprise(BOOST, SEANCE, {
  id: 'boost-evaluation',
  code: 'ENT-3.4',
  titre: 'Boost — évaluation de la tournée',
  desc: 'Organiser seul(e) la tournée du vélo-cargo sur une journée neuve : situer les nouveaux clients, décider ce qui reste '
    + 'à quai, tenir le train et le créneau par le trajet le plus court, calculer ses heures, puis rendre sa copie.',
  niveaux: ['1re'],
  competences: ['C2.4'],
  temps: 'evaluation',
  bareme: 20,           // jalons pondérés, somme des poids = 20 (règle du 10/10/2026)
  copie: true,
  // Elle ne remet pas à zéro la base commune de Boost (ENT-3.1 à 3.3) : sa tournée et sa carte sont cloisonnées par
  // `transportId`, son message par son volet.
  reinitialisable: false,
  jeuId: 'boost',
  pret: true,
  ouverture: 'prof',
}, {
  menu: ['clients'],
  exercice: 'Évaluation : la tournée du vélo-cargo',
  sansTrame: 'Tout se fait à l’écran',
  transportSection: 'Tournées',
  transportId: SEANCE.TRANSPORT_ID,
  plan: SEANCE.PLAN,
  tournee: SEANCE.TOURNEE,
});
export const meta = s.meta;
export const rendre = s.rendre;
export const noter = s.noter;
