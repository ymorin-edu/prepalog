// ENT-8.18 — Action, « deux magasins, deux palettes ». Dix-huitième séance de l'entreprise n° 8 (CAP OL) : ENTRAÎNEMENT de CAP-C3.1 à C3.3,
// erreur induite (brief `docs/briefs/ENT-8.18-action-deux-magasins.md`). Précédente : ENT-8.17. Suite : ENT-8.19 (évaluation).
//
// Un vendredi, 6 h : deux commandes de magasins mélangées au terminal (Plan d'entrepôt, chantier E-8 lot 4), un carton abîmé ; Yanis pousse à
// tout mettre sur une palette ; « Contrôler mes palettes » avec la liste de colisage (les deux chemins y convergent) ; film et étiquettes du bon
// magasin ; puis la réponse à Yanis. Données dans `contenus/action-ent818-donnees.js` et `contenus/action-ent818.js`.
//
// 16 points de jalons + 4 de questions (`part: 4`) = 20 (poids validés par Tristan, brief §5). Niveaux : accompagné = règles ouvertes avec une
// aide, la travée cernée, la liste de colisage qui se coche d'elle-même ; confirmé = comme le standard (les 10 lignes bonus du brief ne sont pas
// faites : le moteur veut les mêmes jalons à tous les niveaux). Pas de `correction` : tous les jalons sont jugés en continu, le contrôle, le
// film et les étiquettes restent ouverts après « Vérifier mes palettes » (le moteur refuse « Corriger » sans écran à rouvrir).

import { seanceEntreprise } from '../core/types/seance-entreprise.js';
import * as ACTION from '../contenus/action.js';
import * as SEANCE from '../contenus/action-ent818.js';
const s = seanceEntreprise(ACTION, SEANCE, {
  id: 'action-deux-magasins',
  code: 'ENT-8.18',
  titre: 'Action — deux magasins, deux palettes',
  desc: 'Le terminal mélange les lignes de deux magasins : poser chaque carton sur la bonne palette, contrôler ses palettes avec la liste de colisage avant de filmer, étiqueter chacune pour son magasin.',
  immersif: true,
  portee: 'eleve',
  niveaux: ['cap'],
  competences: [],
  competencesCap: ['CAP-C3.1', 'CAP-C3.2', 'CAP-C3.3'],
  temps: 'entrainement',
  bareme: 20,
  parcours: true,
  bilanListe: true,       // bandeau de fin ✓/✗ par blocs, sans « Corriger » (26/10/2026, choix de Tristan)
  bilanDetail: true,
  precedente: 'action-conditionner',
  niveauxPrevus: ['confirme', 'accompagne'],
  questions: 'ENT-8.18',
  pret: true,
  ouverture: 'prof',
}, SEANCE.OPTIONS);
export const meta = s.meta;
export const rendre = s.rendre;
