// ENT-25.1 — « Et si tu choisissais la Logistique ? » : la séance de la semaine des filières pour les 2de GATL. Voir `contenus/vitrine-logistique.js`.
// Une réception chez Spartoo (entrepôt Toolog), comme ENT-1.1 : la carte, le quai, la mise en stock, la saisie (14/11/2026). Non comptée dans les compétences.
import { seanceEntreprise } from '../core/types/seance-entreprise.js';
import * as SEANCE from '../contenus/vitrine-logistique.js';
import { QUESTIONS } from '../contenus/questions/ENT-25.1.js';   // « Avant de commencer » et questions au fil, aucune notée (14/11/2026)
const s = seanceEntreprise(SEANCE, SEANCE, {
  id: 'vitrine-logistique',
  code: 'ENT-25.1',
  titre: 'Et si tu choisissais la Logistique ?',
  desc: 'Une réception chez Spartoo, à l’entrepôt Toolog : situer l’entrepôt sur la carte, recevoir le camion et contrôler la palette (quantité et qualité), '
    + 'la ranger dans un emplacement, saisir l’entrée en stock. Semaine des filières de 2de, tout à l’écran.',
  niveaux: ['2de'],
  competences: [],
  temps: 'guidage',
  bareme: 20,
  parcours: true,
  bilanListe: true,       // bandeau de fin ✓/✗ par étape, sans « Corriger » : rien ne se corrige (carte au premier essai, BL signé, réception validée)
  bilanDetail: true,
  reinitialisable: true,
  questions: 'ENT-25.1',
  pret: true,
  ouverture: 'prof',
}, { ...SEANCE.OPTIONS, questions: QUESTIONS });
export const meta = s.meta;
export const rendre = s.rendre;
