// ENT-6.8 — France Boissons, « chauffeurs et camions du vendredi ». Huitième séance du scénario S2 de la 2de GATL, poste B (agent
// d'exploitation), entraînement d'OTM-C2.2 et OTM-C3.2 (brief `docs/briefs/ENT-6.8-france-boissons-planning.md`, chantiers moteur D-8 et
// « questions à texte calculé » du 12/10/2026).
//
// En renfort à l'exploitation, vendredi 5 h : affecter un chauffeur et un camion aux 5 tournées de Karim (vue Planning, sans « Vérifier » :
// un seul bouton d'envoi), reprendre le planning après la panne de T2 (louer un porteur ou sous-traiter à un transporteur), confirmer la
// location au loueur (phrases au vous, non noté), puis dire quels documents partent à bord (compte propre / compte d'autrui). Données dans
// `contenus/france-boissons-ent68.js`, questions dans `contenus/questions/ENT-6.8.js`, univers dans `contenus/france-boissons.js`.
//
// 13 jalons pondérés (somme 17) + 2 questions notées (`part: 3`), somme = 20 (`bareme: 20`), poids validés par Tristan le 12/10/2026.
// Une base par séance (pas de `jeuId`). Pas de trame pour l'instant (tout à l'écran). Corrigé calculé : `contenus/corriges/ENT-6.8.js`.

import { seanceEntreprise } from '../core/types/seance-entreprise.js';
import * as FB from '../contenus/france-boissons.js';
import * as SEANCE from '../contenus/france-boissons-ent68.js';
const s = seanceEntreprise(FB, SEANCE, {
  id: 'france-boissons-planning',
  code: 'ENT-6.8',
  titre: 'France Boissons — chauffeurs et camions du vendredi',
  desc: 'Agent d’exploitation à la plateforme de Buchelay : affecter un chauffeur et un camion aux 5 tournées du vendredi, puis, après une '
    + 'panne, louer un camion ou confier une tournée à un transporteur, et dire quel document part à bord.',
  niveaux: ['2de'],
  competences: ['OTM-C2.2', 'OTM-C3.2'],
  domaines: ['D2'],
  temps: 'entrainement',
  bareme: 20,           // jalons pondérés (17) + questions notées (3), somme = 20
  // Parcours strict. ENT-6.7 n'est pas encore construite : en attendant, la séance suit ENT-6.6 (à passer à ENT-6.7 quand elle existera).
  parcours: true,
  precedente: 'france-boissons-inventaire',
  // Règle du premier bilan : « Corriger » rouvre le planning (1re version fausse d'abord) et la fiche « Documents à bord ».
  correction: true,
  questions: 'ENT-6.8',
  pret: true,
  ouverture: 'prof',
}, SEANCE.OPTIONS);
export const meta = s.meta;
export const rendre = s.rendre;
