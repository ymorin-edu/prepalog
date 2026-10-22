// ENT-8.12 — Action, « l'inventaire tournant du matin ». Douzième séance de l'entreprise n° 8 (CAP OL), entrepôt Action d'Ensuès-la-Redonne exploité par
// Geodis : GUIDAGE de CAP-C1.5 (participer à l'inventaire, C1.5.4 ; actualiser les informations, C1.5.3), le lendemain d'ENT-8.11, 6 h, dans la même
// allée (brief `docs/briefs/ENT-8.12-action-inventaire-tournant.md` ; décisions du chef de chantier : `docs/briefs/COORDINATION-palettier.md` §3). Précédente :
// ENT-8.11 (ranger à la bonne adresse). Suite : ENT-8.13 (la palette posée à côté).
//
// L'élève compte à l'aveugle, au Terminal, six adresses de la liste (palette dessinée, scan de l'étiquette, nombre de cartons), recompte quand le Terminal le
// propose, termine le comptage, signale à Samia chaque écart CONFIRMÉ (fiche « Mes écarts » : ce qu'il fait, ce qui a pu se passer) et répond par phrases.
// Données dans `contenus/action-ent812-donnees.js` et `contenus/action-ent812.js`, questions dans `contenus/questions/ENT-8.12.js`, univers dans
// `contenus/action.js`.
//
// 16 points de jalons pondérés + 4 de questions (`part: 4`) = 20 (poids validés par Tristan, brief §5). `correction` : « Corriger » rouvre la fiche et les
// phrases ; jamais le comptage (dit par `finFige`). Séance réservée au CAP : `competences: []`, `competencesCap`. Niveaux (`niveauxPrevus`) : confirmé = une
// 7e adresse (un second manque, jalons bonus cachés) ; accompagné = le nombre de cartons par couche de la palette ouverte.

import { seanceEntreprise } from '../core/types/seance-entreprise.js';
import * as ACTION from '../contenus/action.js';
import * as SEANCE from '../contenus/action-ent812.js';
const s = seanceEntreprise(ACTION, SEANCE, {
  id: 'action-inventaire-tournant',
  code: 'ENT-8.12',
  titre: 'Action — l’inventaire tournant du matin',
  desc: 'Compter des palettes à l’aveugle au Terminal, recompter quand le nombre ne colle pas, puis signaler les écarts à la cheffe d’équipe avec une cause possible, sans corriger le stock soi-même.',
  immersif: true,
  portee: 'eleve',
  niveaux: ['cap'],
  competences: [],
  competencesCap: ['CAP-C1.5'],
  temps: 'guidage',
  bareme: 20,
  parcours: true,
  correction: true,
  bilanDetail: true,
  precedente: 'action-ranger',
  niveauxPrevus: ['confirme', 'accompagne'],   // confirmé : 7e adresse (bonus caché) ; accompagné : cartons par couche de la palette ouverte
  questions: 'ENT-8.12',
  pret: true,
  ouverture: 'prof',
}, SEANCE.OPTIONS);
export const meta = s.meta;
export const rendre = s.rendre;
