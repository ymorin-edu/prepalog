// ENT-12.1 — IKEA, « une commande, deux chemins » (2de, tous les postes, découverte de C1.1). Voir `contenus/ikea-ent121.js`.
import { seanceEntreprise } from '../core/types/seance-entreprise.js';
import * as IKEA from '../contenus/ikea.js';
import * as SEANCE from '../contenus/ikea-ent121.js';
const s = seanceEntreprise(IKEA, SEANCE, {
  id: 'ikea-deux-chemins',
  code: 'ENT-12.1',
  titre: 'IKEA — une commande, deux chemins',
  desc: 'Découvrir le centre de distribution clients d’IKEA à Gennevilliers : le situer sur la carte, suivre la commande de Mme Benali de l’entrepôt jusque chez elle '
    + 'et comprendre pourquoi sa lampe et son armoire ne prennent pas le même chemin.',
  niveaux: ['2de'],
  competences: ['C1.1'],
  domaines: ['D1'],
  temps: 'guidage',
  bareme: 20,
  questions: 'ENT-12.1',
  parcours: true,
  correction: true,
  reinitialisable: true,
  pret: true,
  ouverture: 'prof',
}, SEANCE.OPTIONS);
export const meta = s.meta;
export const rendre = s.rendre;
