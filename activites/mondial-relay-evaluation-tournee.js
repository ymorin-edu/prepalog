// ENT-11.5 — Mondial Relay, évaluation « la tournée Sud et le colis bloqué ». Cinquième séance du scénario S3 de la 2de GATL (« le pic de fin
// d'année »), poste B (agent d'exploitation, transport) : ÉVALUATION d'OTM-C1.3 (itinéraire), OTM-C2.3 (suivre l'opération, rendre compte) et
// OTM-C2.1 (documents). Brief `docs/briefs/ENT-11.5-mondial-relay-evaluation-tournee.md`.
//
// Seul(e) à l'agence de Buchères un samedi de décembre : Avant de commencer (noté, 4 questions clés tirées), puis A — la tournée T3 Sud (cinq
// Points Relais, chacun avec ses heures d'ouverture TIRÉES par élève, une seule famille d'ordres justes ; plan schématique ; trois résultats à
// reporter), B — le colis bloqué (cause TIRÉE parmi trois ; deux courriels par phrases à choisir : au Point Relais et à l'expéditrice), puis
// « Rendre ma copie ». Rien n'est jugé à l'écran avant la remise.
// Contenu : `contenus/mondial-relay-ent115.js` (et `-donnees.js`) ; questions : `contenus/questions/ENT-11.5.js` ; corrigé : `contenus/corriges/ENT-11.5.js`.
//
// 16 points de jalons pondérés (tournée 9, colis 6, forme 1) + 4 points d'ouverture (`part: 4`) = 20 (`bareme: 20`), poids de Tristan (choix du 26/10/2026).
// Évaluation : `copie: true`, `noter` ; ni bonus ni niveau ni correction ; pas de parcours (elle s'ouvre quand l'enseignant la coche). Une base par
// séance (pas de `jeuId`).

import { seanceEntreprise } from '../core/types/seance-entreprise.js';
import * as MR from '../contenus/mondial-relay.js';
import * as SEANCE from '../contenus/mondial-relay-ent115.js';
const s = seanceEntreprise(MR, SEANCE, {
  id: 'mondial-relay-evaluation-tournee',
  code: 'ENT-11.5',
  titre: 'Mondial Relay — évaluation : la tournée Sud',
  desc: 'Agent d’exploitation à Buchères : ordonner la tournée des Points Relais du sud de l’Aube selon leurs heures d’ouverture, puis suivre un colis bloqué et prévenir les bonnes personnes.',
  niveaux: ['2de'],
  competences: ['OTM-C1.3', 'OTM-C2.3', 'OTM-C2.1'],
  domaines: ['D2', 'D1'],
  temps: 'evaluation',
  bareme: 20,           // jalons pondérés (16) + questions d'ouverture (4), somme = 20
  copie: true,
  questions: 'ENT-11.5',
  portee: 'eleve',
  pret: true,
  ouverture: 'prof',   // fermée aux élèves tant que Tristan ne l'a pas cochée dans « Conduite de séance »
}, SEANCE.OPTIONS);
export const meta = s.meta;
export const rendre = s.rendre;
export const noter = s.noter;
