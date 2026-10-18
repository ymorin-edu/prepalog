// ENT-9.2 — CHEP, « un retour à contrôler, une ramasse à organiser ». Deuxième séance de l'entreprise n° 9 (1re), centre de service de
// Templemars : GUIDAGE de C2.5, traiter les retours des supports de charge (indicateurs « contrôle qualitatif et quantitatif des retours »
// et « organisation de la ramasse » ; rappel de la mise à jour de la base de données, par le crédit). Brief
// `docs/briefs/ENT-9.2-chep-ramasse-et-retours.md` ; cadrage commun `docs/briefs/COORDINATION-chep.md`. Précédente : ENT-9.1.
//
// Le matin, au quai des retours (vue quai iso, piles de palettes vides, MOTEUR-chep lot B) : contrôler le camion d'Opale Frais, écrire les
// réserves, puis préparer le crédit (fiche). L'après-midi, avec l'exploitant : préparer la ramasse du mercredi (fiche), puis construire la
// tournée sur la carte du Nord (vue Tournée, profil de charge, MOTEUR-chep lot A). Piles et plate-forme à reporter TIRÉES par élève.
// Contenu : `contenus/chep-ent92.js` (et `-donnees.js`) ; questions : `contenus/questions/ENT-9.2.js` ; corrigé : `contenus/corriges/ENT-9.2.js`.
//
// 15 jalons pondérés (somme 17) + 3 questions notées (`part: 3`) = 20 (`bareme: 20`) : poids fixés par Cowork sur délégation de Tristan
// (17/10/2026), codés tels quels, listés au compte rendu du brief. Une base par séance (pas de `jeuId`). Pas de trame pour l'instant.

import { seanceEntreprise } from '../core/types/seance-entreprise.js';
import * as CHEP from '../contenus/chep.js';
import * as SEANCE from '../contenus/chep-ent92.js';
const s = seanceEntreprise(CHEP, SEANCE, {
  id: 'chep-ramasse-retours',
  code: 'ENT-9.2',
  titre: 'CHEP — un retour à contrôler, une ramasse à organiser',
  desc: 'Au centre CHEP de Templemars : contrôler un camion de palettes vides au quai (compter, repérer les palettes d’un autre pool et les '
    + 'palettes abîmées, écrire les réserves), créditer le compte du distributeur, puis organiser la collecte du lendemain.',
  niveaux: ['1re'],
  competences: ['C2.5'],
  temps: 'guidage',
  bareme: 20,           // jalons pondérés (17) + questions notées (3), somme = 20
  // Parcours strict : ne s'ouvre qu'à l'élève dont ENT-9.1 a son premier bilan.
  parcours: true,
  precedente: 'chep-compte-palettes',
  // Règle du premier bilan : « Corriger » rouvre les fiches (crédit, besoin) dont un jalon est faux ; jamais le quai ni la tournée (`finFige`).
  correction: true,
  niveauxPrevus: ['confirme'],   // cas bonus du confirmé : une 6e pile (deux palettes abîmées, de l'arrière)
  questions: 'ENT-9.2',
  immersif: true,
  portee: 'eleve',
  pret: true,
  ouverture: 'prof',   // fermée aux élèves tant que Tristan ne l'a pas cochée dans « Conduite de séance »
}, SEANCE.OPTIONS);
export const meta = s.meta;
export const rendre = s.rendre;
