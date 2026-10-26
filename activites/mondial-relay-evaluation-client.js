// ENT-11.7 — Mondial Relay, évaluation « la lampe d'Inès ». Septième séance de l'entreprise n° 11 (2de GATL, poste A : conseiller(ère) au service
// client, AGOrA) : ÉVALUATION de AGO-1.1 et AGO-1.2 (brief `docs/briefs/ENT-11.7-mondial-relay-evaluation-client.md` ; choix de Tristan du 26/10/2026,
// `docs/briefs/mondial-relay/A-TRANCHER.md`). Une cliente fâchée appelle : son colis est arrivé cassé au Point Relais. L'élève l'écoute (vue Téléphone,
// en évaluation), applique les articles 11 et 12 des conditions de vente à SON cas, enregistre le dossier de réclamation et répond par écrit.
// UN CAS TIRÉ PAR ÉLÈVE parmi quatre (refusé sans assurance · refusé avec assurance · retiré · hors délai), prix de la lampe et dates tirés.
//
// Avant de commencer (noté, 4 questions tirées, sans aide) puis l'appel, deux fiches (la règle, le dossier) et un courriel par phrases. Contenu :
// `contenus/mondial-relay-ent117.js` (données pures : `contenus/mondial-relay-ent117-donnees.js`), questions : `contenus/questions/ENT-11.7.js`, univers :
// `contenus/mondial-relay.js`.
//
// 16 points de jalons pondérés (écoute 3, la règle 4, le montant 3, le dossier 3, le courriel 2, le ton 1) + 4 points d'ouverture (`part: 4`) = 20
// (`bareme: 20`). Évaluation : `copie: true`, `noter` ; ni bonus ni niveau ; pas de parcours (elle s'ouvre quand l'enseignant la coche).

import { seanceEntreprise } from '../core/types/seance-entreprise.js';
import * as MR from '../contenus/mondial-relay.js';
import * as SEANCE from '../contenus/mondial-relay-ent117.js';
const s = seanceEntreprise(MR, SEANCE, {
  id: 'mondial-relay-evaluation-client',
  code: 'ENT-11.7',
  titre: 'Mondial Relay — évaluation : la lampe d’Inès',
  desc: 'Conseiller(ère) au service client : écouter une expéditrice dont le colis est arrivé cassé, appliquer les conditions de vente, '
    + 'ouvrir la réclamation et lui répondre par écrit.',
  niveaux: ['2de'],
  competences: ['AGO-1.1', 'AGO-1.2'],
  domaines: ['D1'],
  temps: 'evaluation',
  bareme: 20,                       // jalons pondérés (16) + questions d'ouverture (4), somme = 20
  copie: true,
  questions: 'ENT-11.7',
  pret: true,
  ouverture: 'prof',
}, SEANCE.OPTIONS);
export const meta = s.meta;
export const rendre = s.rendre;
export const noter = s.noter;
