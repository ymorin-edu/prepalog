// ENT-11.6 — Mondial Relay, « évaluation : les renforts de décembre ». Sixième séance de l'entreprise n° 11 (2de, scénario S3 « Le pic de fin d'année »), poste A
// (gestion, AGOrA) : ÉVALUATION d'AGO-3.2 (planifier présences et congés) et d'AGO-3.1 (procédures d'entrée, contrats) (brief
// `docs/briefs/ENT-11.6-mondial-relay-evaluation-renforts.md` ; cadrage `docs/briefs/mondial-relay/CADRAGE-S3-mondial-relay.md`). Travaillées avant : ENT-5.1, 5.2 et 6.3
// (Smoby, France Boissons).
//
// Avant de commencer (noté, 4 questions tirées, aucune aide), le planning des nuits du 7 au 19 décembre (une décision par demande de congé, puis les renforts à prévoir nuit
// par nuit), la demande de recrutement des renforts en CDD saisonnier (l'intérim n'est qu'une question de réflexion non notée : règle 15, décision de Tristan du 26/10/2026),
// la réponse à l'agent dont le congé est refusé (phrases à choisir). Contenu : `contenus/mondial-relay-ent116.js` (données pures : `contenus/mondial-relay-ent116-donnees.js`),
// questions : `contenus/questions/ENT-11.6.js`, univers : `contenus/mondial-relay.js`.
//
// 16 points de jalons pondérés (nuits couvertes 4, congés 3, contrat des renforts 3, demande de recrutement 3, réponse à l'agent 2, ton 1) + 4 points d'ouverture (`part: 4`) = 20.
// Évaluation : `copie: true`, `noter` ; ni `parcours` (elle s'ouvre quand l'enseignant la coche), ni `correction`, ni niveau. Un jeu TIRÉ par élève (`core/tirage.js`).

import { seanceEntreprise } from '../core/types/seance-entreprise.js';
import * as MR from '../contenus/mondial-relay.js';
import * as SEANCE from '../contenus/mondial-relay-ent116.js';
const s = seanceEntreprise(MR, SEANCE, {
  id: 'mondial-relay-evaluation-renforts',
  code: 'ENT-11.6',
  titre: 'Mondial Relay — évaluation : les renforts de décembre',
  desc: 'Assistant(e) RH du hub de Buchères : traiter les demandes de congé, couvrir les nuits de tri du pic avec des renforts en CDD saisonnier, '
    + 'remplir la demande de recrutement et répondre à un agent, sans aide.',
  niveaux: ['2de'],
  competences: ['AGO-3.2', 'AGO-3.1'],
  domaines: ['D2', 'D3'],
  temps: 'evaluation',
  bareme: 20,                                          // jalons pondérés (16) + questions d'ouverture (4), somme = 20
  copie: true,
  questions: 'ENT-11.6',
  pret: true,
  ouverture: 'prof',                                   // livrée fermée aux élèves : l'enseignant l'essaie, puis l'ouvre lui-même (Conduite de séance)
}, SEANCE.OPTIONS);
export const meta = s.meta;
export const rendre = s.rendre;
export const noter = s.noter;
