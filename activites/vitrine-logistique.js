// ENT-25.1 — « Et si tu choisissais la Logistique ? » : la vitrine du Bac Pro Logistique pour les 2de GATL (semaine des filières). Voir `contenus/vitrine-logistique.js`.
// Pas une entreprise : un tour de quatre entreprises réelles déjà vérifiées (Amazon, Stellantis, Airbus Helicopters, Royal Canin). Non comptée dans les compétences.
import { seanceEntreprise } from '../core/types/seance-entreprise.js';
import * as SEANCE from '../contenus/vitrine-logistique.js';
const s = seanceEntreprise(SEANCE, SEANCE, {
  id: 'vitrine-logistique',
  code: 'ENT-25.1',
  titre: 'Et si tu choisissais la Logistique ?',
  desc: 'La visite de quatre entreprises où travaillent les logisticiens (Amazon, Stellantis, Airbus Helicopters, Royal Canin), un petit geste à chaque arrêt, '
    + 'puis le Bac Pro Logistique en bref. Pour la semaine des filières de 2de.',
  niveaux: ['2de'],
  competences: [],
  temps: 'guidage',
  bareme: 20,
  parcours: true,
  correction: true,
  bilanDetail: true,
  reinitialisable: true,
  pret: true,
  ouverture: 'prof',
}, SEANCE.OPTIONS);
export const meta = s.meta;
export const rendre = s.rendre;
