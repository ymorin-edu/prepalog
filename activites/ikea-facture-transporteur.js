// ENT-12.4 — IKEA, « la facture du transporteur » (2de, poste A, gestion, guidage). Voir `contenus/ikea-ent124.js`.
import { seanceEntreprise } from '../core/types/seance-entreprise.js';
import * as IKEA from '../contenus/ikea.js';
import * as SEANCE from '../contenus/ikea-ent124.js';
const s = seanceEntreprise(IKEA, SEANCE, {
  id: 'ikea-facture-transporteur',
  code: 'ENT-12.4',
  titre: 'IKEA — la facture du transporteur',
  desc: 'Assistant(e) de gestion au centre de Gennevilliers : contrôler la facture du prestataire de livraison contre les bons de livraison signés et le tarif, '
    + 'trouver les lignes fausses, calculer le bon montant et écrire la réclamation.',
  niveaux: ['2de'],
  competences: ['AGO-2.1'],
  domaines: ['D3'],
  temps: 'guidage',
  bareme: 20,
  questions: 'ENT-12.4',
  pret: true,
  ouverture: 'prof',
}, SEANCE.OPTIONS);
export const meta = s.meta;
export const rendre = s.rendre;
