// ENT-7.2 — Decathlon, « passer la commande ». Deuxième séance de l'entreprise n° 7 (1re), service transport amont de l'entrepôt de
// Rouvignies : GUIDAGE de C2.6, transmettre une commande de transport par le bon canal (brief
// `docs/briefs/ENT-7.2-decathlon-ordre-de-transport.md`). Précédente : ENT-7.1 (le choix). Suite : 7.3 (la barge ne passe plus), 7.4 (évaluation).
//
// Remplir et ENREGISTRER l'ordre de transport (écrit, recopié depuis l'avis), l'envoyer par COURRIEL au prestataire (pièce jointe),
// APPELER le chef de quai (oral, tu poli), poser son conteneur sur un créneau libre du planning. Contre la copie : le numéro, le scellé, le poids,
// la référence et les instructions fausses sont TIRÉS par élève.
// Données dans `contenus/decathlon-ent72.js` (et `-donnees.js`, pures), questions dans `contenus/questions/ENT-7.2.js`, univers dans `contenus/decathlon.js`.
//
// 10 jalons pondérés (somme 17) + 3 questions notées (`part: 3`), somme = 20 (`bareme: 20`), poids validés par Tristan le 14/10/2026.
// Pas de `correction` : l'ordre est figé à l'enregistrement et le courriel s'envoie quand on veut ; `suiteAuBilan` ouvre la suite quand tout est jugé.
// Livrée le 14/10/2026 (`pret: true, ouverture: 'prof'`) : Tristan l'essaie à l'écran et l'ouvre lui-même à son groupe.

import { seanceEntreprise } from '../core/types/seance-entreprise.js';
import * as DECATHLON from '../contenus/decathlon.js';
import * as SEANCE from '../contenus/decathlon-ent72.js';
const s = seanceEntreprise(DECATHLON, SEANCE, {
  id: 'decathlon-ordre-transport',
  code: 'ENT-7.2',   // provisoire, comme 7.1
  titre: 'Decathlon — passer la commande',
  desc: 'Alternant au service transport amont de l’entrepôt de Rouvignies : remplir l’ordre de transport d’un conteneur à partir de l’avis du terminal, '
    + 'l’envoyer par courriel au prestataire retenu, puis appeler le quai pour réserver le créneau d’arrivée.',
  niveaux: ['1re'],
  competences: ['C2.6'],
  temps: 'guidage',
  bareme: 20,           // jalons pondérés (17) + questions notées (3), somme = 20
  parcours: true,
  precedente: 'decathlon-choix-transporteur',
  suiteAuBilan: true,
  niveauxPrevus: ['confirme'],   // bonus du confirmé : une instruction fausse de plus (« hayon élévateur »)
  questions: 'ENT-7.2',
  pret: true,
  ouverture: 'prof',
}, SEANCE.OPTIONS);
export const meta = s.meta;
export const rendre = s.rendre;
