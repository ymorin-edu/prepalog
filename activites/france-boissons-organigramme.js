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
//
// LE MOTEUR FABRIQUÉ À L'OUVERTURE (manque du moteur, §7.3 du brief) : une fiche et ses documents sont des objets fixes,
// déclarés une fois pour toutes ; or ici chaque élève a SES cases vides (l'organigramme et les listes « Case A, B… »), SES
// situations (les lignes du tableau) et SON courrier (l'écran de « Corriger » de chaque message). En attendant que le
// moteur accepte une fiche et des documents « fonction de la base », `rendre` range d'abord le tirage de l'élève (comme le
// moteur l'aurait fait, voir `jeuAOuverture`), puis fabrique le moteur de la séance avec la fiche, les documents et les
// jalons de CE tirage. Le `meta` et le contrôle au chargement viennent d'un jeu « modèle ». Limite connue : après
// « Réinitialiser » avec un niveau changé entre-temps par l'enseignant, les écrans restent ceux de l'ancien tirage
// jusqu'à la réouverture de la séance (le tirage refait est le bon).

import { seanceEntreprise } from '../core/types/seance-entreprise.js';
import * as FB from '../contenus/france-boissons.js';
import * as SEANCE from '../contenus/france-boissons-ent61.js';

const META = {
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
};

const fabriquer = (jeu) => seanceEntreprise(FB, SEANCE, META, SEANCE.optionsPour(jeu));
const s = fabriquer(null);
export const meta = s.meta;
export function rendre(hote, ctx) {
  fabriquer(SEANCE.jeuAOuverture(ctx)).rendre(hote, ctx);
}
