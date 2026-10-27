// ENT-21.6 — évaluation : la facture du fournisseur (2de GATL, AGO-2.2, AGO-1.3, évaluation). Voir `contenus/lidl-ent216.js`.
// Jalons pondérés sur 20 (poids en tête du fichier de contenu, décidés par Claude, délégation de Tristan du 26/10/2026).
import { seanceEntreprise } from '../core/types/seance-entreprise.js';
import * as LIDL from '../contenus/lidl.js';
import * as SEANCE from '../contenus/lidl-ent216.js';
const s = seanceEntreprise(LIDL, SEANCE, {
  id: 'lidl-evaluation-facture',
  code: 'ENT-21.6',
  titre: 'Lidl — évaluation : la facture du fournisseur',
  desc: 'Seul(e) : contrôler une facture, le montant à payer, la date limite, la fiche du fournisseur, puis rendre sa copie.',
  niveaux: ['2de'],
  competences: ['AGO-2.2', 'AGO-1.3'],
  temps: 'evaluation',
  bareme: 20,
  copie: true,
  questions: 'ENT-21.6',
  pret: true,
  ouverture: 'prof',
}, SEANCE.OPTIONS);
export const meta = s.meta;
export const rendre = s.rendre;
export const noter = s.noter;
