// ENT-6.1 — France Boissons, « bienvenue à Buchelay : qui fait quoi ». Première séance du scénario S2 de la 2de GATL
// (brief `docs/briefs/ENT-6.1-france-boissons-organigramme.md`).
//
// En renfort à l'accueil de la plateforme de Buchelay, en guidage : lire l'organigramme (avec ses cases vides) et les
// fiches de chacun, distinguer lien hiérarchique et lien fonctionnel, puis transférer chaque message du courrier du
// matin à la bonne personne (« Transférer à… », chantier D-1). Données dans `contenus/france-boissons-ent61.js`, univers
// commun dans `contenus/france-boissons.js`, questions dans `contenus/questions/ENT-6.1.js`.
//
// Jalons pondérés, somme des poids = 20 (13 jalons de la séance + la question du point d'étape, `part: 2`). Une base par
// séance (pas de `jeuId`). Pas de trame pour l'instant (Cowork, après validation à l'écran).
// Les écrans tirés par élève (organigramme, fiche, écran de « Corriger » de chaque message) sont déclarés « fonction de la
// base » dans le contenu (chantier D-1 bis, brief §7.3) : la séance se déclare comme les autres.

import { seanceEntreprise } from '../core/types/seance-entreprise.js';
import * as FB from '../contenus/france-boissons.js';
import * as SEANCE from '../contenus/france-boissons-ent61.js';
const s = seanceEntreprise(FB, SEANCE, {
  id: 'france-boissons-organigramme',
  code: 'ENT-6.1',
  titre: 'France Boissons — bienvenue à Buchelay',
  desc: 'Lire l’organigramme de la plateforme de Buchelay, distinguer qui dirige et qui aide, et transmettre chaque message à la bonne personne.',
  niveaux: ['2de'],
  competences: ['C1.1'],
  domaines: ['D1'],
  temps: 'guidage',
  bareme: 20,           // jalons pondérés, somme des poids = 20
  // Parcours strict, première séance du scénario (pas de `precedente`) : ENT-6.2 s'ouvrira au premier bilan.
  parcours: true,
  // Règle du premier bilan : « Corriger » rouvre la fiche « Qui fait quoi ? » et les seuls messages mal transférés,
  // la note est la moyenne du premier bilan et de l'état à la première correction (voir core/types/entreprise.js).
  correction: true,
  reinitialisable: true,
  niveauxPrevus: ['confirme'],   // cas bonus du confirmé : une case, deux liens, deux messages
  questions: 'ENT-6.1',
  pret: true,
  ouverture: 'prof',
}, SEANCE.OPTIONS);
export const meta = s.meta;
export const rendre = s.rendre;
