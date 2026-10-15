// ENT-6.10 — France Boissons, « le retour de Lucas ». Dixième et dernière séance du scénario S2 de la 2de GATL, poste B (agent
// d'exploitation) : ENTRAÎNEMENT d'OTM-C2.3 (guidage en ENT-5.8) et DÉCOUVERTE de LOG-C2.5 (premier et seul temps en 2de, reprise en 1re)
// (brief `docs/briefs/ENT-6.10-france-boissons-retour.md` ; chantier moteur D-10 : feuille de calcul dans une fiche, dessin en document avec
// loupe, pastilles d'étape, animation qui n'apparaît qu'à son tour).
//
// Vendredi 17 h, quai 14 : compter les vides de Malo et trouver l'erreur du ticket signé, tenir le compte de consignes de Malo dans une
// feuille de calcul, prévenir Malo et Inès par phrases à choisir, puis la boucle des vides (animation) et le chiffrage du réemploi.
// Animation « la boucle des vides » : scène trajet du kit iso (chantier D-10, lot 2). Données dans `contenus/france-boissons-ent610.js` (et `-donnees.js`, pures), questions dans `contenus/questions/ENT-6.10.js`, univers
// dans `contenus/france-boissons.js`.
//
// 12 jalons pondérés (somme 16) + 3 questions notées (`part: 4`), somme = 20 (`bareme: 20`), poids validés par Tristan le 13/10/2026.
// Une base par séance (pas de `jeuId`). Pas de trame pour l'instant (tout à l'écran ; trame courte par Cowork après validation).
// Livrée le 13/10/2026 (`pret: true, ouverture: 'prof'`) : Tristan l'essaie à l'écran et l'ouvre lui-même à son groupe.

import { seanceEntreprise } from '../core/types/seance-entreprise.js';
import * as FB from '../contenus/france-boissons.js';
import * as SEANCE from '../contenus/france-boissons-ent610.js';
const s = seanceEntreprise(FB, SEANCE, {
  id: 'france-boissons-retour',
  code: 'ENT-6.10',
  titre: 'France Boissons — le retour de Lucas',
  desc: 'Agent d’exploitation à Buchelay : contrôler au quai les vides rapportés de chez Malo, trouver l’erreur du ticket signé, tenir le '
    + 'compte de consignes du client dans la feuille de calcul, prévenir Malo et la facturation, puis chiffrer ce que rapporte un fût qui revient.',
  niveaux: ['2de', 'cap'],
  competences: ['OTM-C2.3', 'C2.5'],
  competencesCap: ['CAP-C3.7'],   // CAP OL 2026 : lu par un groupe CAP à la place de competences
  domaines: ['D3', 'D1'],
  temps: 'entrainement',
  bareme: 20,           // jalons pondérés (16) + questions notées (4), somme = 20
  // Parcours strict : ne s'ouvre qu'à l'élève dont ENT-6.9 a son premier bilan (même règle que les séances précédentes).
  parcours: true,
  precedente: 'france-boissons-tournee',
  questions: 'ENT-6.10',
  pret: true,
  ouverture: 'prof',
}, SEANCE.OPTIONS);
export const meta = s.meta;
export const rendre = s.rendre;
