// ENT-12.8 — IKEA, « évaluation : la facture de mars » (2de, poste A, gestion, évaluation de AGO-2.1). Voir `contenus/ikea-ent128.js`.
import { seanceEntreprise } from '../core/types/seance-entreprise.js';
import * as IKEA from '../contenus/ikea.js';
import * as SEANCE from '../contenus/ikea-ent128.js';
const s = seanceEntreprise(IKEA, SEANCE, {
  id: 'ikea-evaluation-gestion',
  code: 'ENT-12.8',
  titre: 'IKEA — évaluation : la facture de mars',
  desc: 'Sans aide : contrôler la facture du prestataire de livraison contre les bons signés et le tarif, calculer le bon montant et écrire la réclamation.',
  niveaux: ['2de'],
  competences: ['AGO-2.1'],
  domaines: ['D3'],
  temps: 'evaluation',
  bareme: 20,                                          // jalons pondérés (16) + « Avant de commencer » (4), somme = 20
  copie: true,
  questions: 'ENT-12.8',
  pret: true,
  ouverture: 'prof',                                   // livrée fermée aux élèves : l'enseignant l'essaie, puis l'ouvre lui-même (Conduite de séance)
}, SEANCE.OPTIONS);
export const meta = s.meta;
export const rendre = s.rendre;
export const noter = s.noter;
