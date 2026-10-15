// ENT-6.7 — France Boissons, « la commande de Malo à la voix ». Septième séance du scénario S2 de la 2de GATL, poste C (préparateur),
// entraînement de C2.1 (guidage : ENT-5.6 Smoby) (brief `docs/briefs/ENT-6.7-france-boissons-preparation.md`, chantier moteur D-7).
//
// En renfort au quai de Buchelay, jeudi 14 h : préparer à la voix la commande de La Cabane à Malo prise en ENT-6.2 (code lu de près,
// quantité, « Abîmé » pour le fût cabossé), poser chaque ligne sur l'une des deux palettes client ou « à côté », puis finir les palettes
// (film, étiquettes) et vérifier. Données dans `contenus/france-boissons-ent67.js` (et `-donnees.js`), questions dans
// `contenus/questions/ENT-6.7.js`, univers dans `contenus/france-boissons.js`.
//
// 10 jalons pondérés (somme 16) + 3 questions notées (`part: 4`), somme = 20 (`bareme: 20`), poids validés par Tristan le 12/10/2026.
// Une base par séance (pas de `jeuId`). Pas de trame pour l'instant (tout à l'écran). Corrigé calculé : `contenus/corriges/ENT-6.7.js`.

import { seanceEntreprise } from '../core/types/seance-entreprise.js';
import * as FB from '../contenus/france-boissons.js';
import * as SEANCE from '../contenus/france-boissons-ent67.js';
const s = seanceEntreprise(FB, SEANCE, {
  id: 'france-boissons-preparation',
  code: 'ENT-6.7',
  titre: 'France Boissons — la commande de Malo à la voix',
  desc: 'Préparateur à la plateforme de Buchelay : préparer à la voix la commande de La Cabane à Malo, signaler un fût abîmé avec le bon mot, '
    + 'monter deux palettes client, filmer et étiqueter.',
  niveaux: ['2de', 'cap'],
  competences: ['C2.1'],
  competencesCap: ['CAP-C3.1', 'CAP-C3.2', 'CAP-C3.4'],   // CAP OL 2026 : lu par un groupe CAP à la place de competences
  domaines: ['D4'],
  coeur: true,
  temps: 'entrainement',
  bareme: 20,           // jalons pondérés (16) + questions notées (4), somme = 20
  // Parcours strict : ne s'ouvre qu'à l'élève dont ENT-6.6 a son premier bilan (voir core/parcours.js).
  parcours: true,
  precedente: 'france-boissons-inventaire',
  // Aucun élève bloqué à la fin : les lignes du terminal ne se refont pas (pas de « Corriger »), la séance suivante s'ouvre au
  // premier bilan, juste ou faux. Le montage, lui, se reprend dans la vue et se revérifie.
  suiteAuBilan: true,
  questions: 'ENT-6.7',
  pret: true,
  ouverture: 'prof',
}, SEANCE.OPTIONS);
export const meta = s.meta;
export const rendre = s.rendre;
