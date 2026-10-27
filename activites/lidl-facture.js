// ENT-21.4 — la facture du fournisseur (2de GATL, AGO-2.2, AGO-1.3, guidage). Voir `contenus/lidl-ent214.js`.
// Jalons pondérés sur 20 (poids en tête du fichier de contenu, décidés par Claude, délégation de Tristan du 26/10/2026).
import { seanceEntreprise } from '../core/types/seance-entreprise.js';
import * as LIDL from '../contenus/lidl.js';
import * as SEANCE from '../contenus/lidl-ent214.js';
const s = seanceEntreprise(LIDL, SEANCE, {
  id: 'lidl-facture',
  code: 'ENT-21.4',
  titre: 'Lidl — la facture du fournisseur',
  desc: 'À la comptabilité : rapprocher commande, réception et facture, le montant à payer avec la TVA, la date limite de paiement, la fiche du fournisseur et un faux changement de RIB.',
  niveaux: ['2de'],
  competences: ['AGO-2.2', 'AGO-1.3'],
  temps: 'guidage',
  bareme: 20,
  parcours: true,
  correction: true,
  bilanDetail: true,
  precedente: 'lidl-transport',
  questions: 'ENT-21.4',
  pret: true,
  ouverture: 'prof',
}, SEANCE.OPTIONS);
export const meta = s.meta;
export const rendre = s.rendre;
