// ENT-11.4 — Mondial Relay, « évaluation : le samedi du pic » : le contenu de la séance (brief
// `docs/briefs/ENT-11.4-mondial-relay-evaluation-planning.md`). Univers commun : `contenus/mondial-relay.js`. Données pures (le jeu tiré, le planning,
// le solveur) : `contenus/mondial-relay-ent114-donnees.js`. Activité : `activites/mondial-relay-evaluation-planning.js`. Questions :
// `contenus/questions/ENT-11.4.js`. Corrigé : `contenus/corriges/ENT-11.4.js`.
//
// Samedi 12 décembre 2026, 5 h (le pic). 2de, poste B (agent d'exploitation de l'agence de Buchères), ÉVALUATION d'OTM-C2.2 et d'OTM-C3.2, copie rendue :
//   Avant de commencer (noté, 4 points, aucune aide) → le planning des 5 tournées (vue Planning, sans « Vérifier ») → l'imprévu de 5 h 30 (1 parmi 3,
//   tiré par élève) → le planning repris → le message à Samia (phrases à choisir, au tu) → « Rendre ma copie ». Rien ne dit juste ou faux à l'écran.
// Un jeu par élève (règle du 03/10/2026) : le planning lui-même est tiré. Le moteur ne sait pas encore tirer un `planning` : l'activité fabrique un
// moteur par graine (voir `activites/mondial-relay-evaluation-planning.js` et la section 7 du brief) ; le reste (jalons, messages, documents, questions)
// lit le jeu dans la base de l'élève.
//
// 5 jalons de planning à 3 points + le message à Samia 1 point = 16, plus 4 points d'« Avant de commencer » (`part: 4`) = 20. Poids du brief §5, acceptés
// par Tristan le 26/10/2026. Rien n'est vrai avant l'envoi : copie vide = 0.
// CONSTRUIT (dit à l'écran) : tournées, horaires, chauffeurs, camions, renforts, messages. RÉEL : voir `MENTION` (univers).

import { apresMail, apresPlanning } from '../core/declencheurs.js';
import { jalonsPlanning } from '../core/types/planning.js';
import { phrasesJustes } from '../core/phrases.js';
import { catalogueSimple } from './entreprise-commun.js';
import { MENTION as MENTION_MR, VOCAB } from './mondial-relay.js';
import { QUESTIONS, PERSONNES } from './questions/ENT-11.4.js';
import {
  ID, PL, MSG, ID_VOLET, SCENARIO, jeuDeBase, planningDe, graineDeBase, TOURNEES_114, CAMIONS_114, IDS_CHAUFFEURS, chauffeursDe, texteAlea, sansBalises,
  phrasesSamia, ech, duree, mm,
} from './mondial-relay-ent114-donnees.js';

export { ID, PL, MSG, ID_VOLET } from './mondial-relay-ent114-donnees.js';

// ─────────────────────────────────────────────────────────────── les clés d'univers que `contenus/mondial-relay.js` ne porte pas (séance sans article)
export const CATALOGUE = catalogueSimple([]);
export const SUPPLIERS = [];
export const SUP_BY_ID = {};
export const CUSTOMERS = [];
export const CM = {};
export function baseDeDepart() {
  return { v: 1, created: Date.now(), stock: {}, moves: [], mails: [], orders: [], receptions: [], customers: [], suppliers: [], seq: 1, _depart: [] };
}
export const EQUIPE = PERSONNES;
export const mailDe = (id) => `${id}@${VOCAB.mailDomain}`;

// L'heure d'un message : celle du SCÉNARIO (jamais la date réelle) + le temps réellement passé depuis l'ouverture (`db.volets[<volet>]`).
export function heureScenario(iso, hhmm, { db, volet, decalage = 0 } = {}) {
  const [a, m, j] = iso.split('-').map(Number), [h, mn] = hhmm.split(':').map(Number);
  const ouvert = db && db.volets && volet ? db.volets[volet] : 0;
  const ecoule = ouvert ? Math.max(0, Date.now() - ouvert) : 0;
  return new Date(a, m - 1, j, h, mn).getTime() + ecoule + decalage;
}

// ─────────────────────────────────────────────────────────────── les documents (construits ; pied imposé ; aucun mot cliquable : évaluation)
const PIED = 'Document pédagogique — reconstitution, non contractuel. Tournées, horaires, chauffeurs et camions construits pour l’exercice.';
const pied = (t = PIED) => `<p class="mr-pied">${ech(t)}</p>`;
const entete = (titre, lignes) => `<p class="mr-t">${ech(titre)}</p><p class="mr-st">${lignes.map(ech).join(' · ')}</p>`;

export const DOC_TOURNEES = { id: 'tournees-114', titre: 'Les 5 tournées du samedi', court: 'Les tournées',
  html: (db) => { const j = jeuDeBase(db); return `<article class="mr-doc" aria-label="Les 5 tournées du samedi">
    ${entete('Les 5 tournées du samedi 12 décembre', ['Mondial Relay', 'agence de Buchères', 'exploitation'])}
    <table class="mr-tab"><thead><tr><th scope="col">Tournée</th><th scope="col">Communes</th><th scope="col">Horaires</th><th scope="col">Service (dont conduite)</th><th scope="col">Camion</th></tr></thead>
    <tbody>${TOURNEES_114.map((t) => { const c = t.id === 't5' ? j.t5 : t.conduite; return `<tr><td>${ech(t.court)}</td><td>${ech(t.lieux)}</td>
      <td>Départ dès ${t.des}<br>retour avant ${t.avant}</td><td>${duree(t.service)} (${duree(c)})</td><td>${t.camion === 'porteur' ? 'porteur 12 t' : 'fourgon ou porteur'}</td></tr>`; }).join('')}</tbody></table>
    <p class="mr-note">Les Points Relais sont livrés du mardi au samedi, pendant leurs heures d’ouverture. Au pic, le volume double.</p>
    ${pied()}
  </article>`; } };

export const DOC_MOYENS = { id: 'moyens-114', titre: 'Chauffeurs et camions du samedi', court: 'Chauffeurs et camions',
  html: (db) => { const j = jeuDeBase(db); return `<article class="mr-doc" aria-label="Chauffeurs et camions du samedi">
    ${entete('Chauffeurs et camions du samedi', ['Mondial Relay', 'agence de Buchères', 'exploitation'])}
    <table class="mr-tab"><thead><tr><th scope="col">Chauffeur</th><th scope="col">Permis</th><th scope="col">Fin de service hier</th></tr></thead>
    <tbody>${chauffeursDe(j, 1).map((c) => `<tr><td>${ech(c.nom)}</td><td>${c.permis}</td><td>${c.finHier || 'en repos'}</td></tr>`).join('')}</tbody></table>
    <table class="mr-tab"><thead><tr><th scope="col">Camion</th><th scope="col">Type</th><th scope="col">Permis</th></tr></thead>
    <tbody>${CAMIONS_114.map((k) => `<tr><td>${k.nom}</td><td>${ech(k.note.split(' · ')[0])}</td><td>${k.genre === 'fourgon' ? 'B ou C' : 'C'}</td></tr>`).join('')}</tbody></table>
    ${pied()}
  </article>`; } };

export const DOC_REGLES = { id: 'regles-114', titre: 'Les règles de la journée', court: 'Les règles',
  html: `<article class="mr-doc" aria-label="Les règles de la journée">
    ${entete('Les règles de la journée', ['Mondial Relay', 'agence de Buchères', 'exploitation (Samia)'])}
    <ol class="mr-ul">
      <li>Un chauffeur et un camion font <b>une seule tournée</b> dans la journée.</li>
      <li>Porteur 12 t : permis C ; fourgon 3,5 t : permis B ou C.</li>
      <li>Chaque tournée part quand ses colis sont prêts et rentre au hub avant son heure limite.</li>
      <li><b>11 h de repos</b> depuis la fin de service d’hier ; <b>4 h 30</b> de conduite au plus sans pause ; <b>9 h</b> de conduite au plus dans la journée.</li>
    </ol>
    ${pied()}
  </article>` };

// Textes de loi : règlement (CE) n° 561/2006, articles 2, 4 g, 6 et 7, et Code du travail L1132-1, repris des documents d'ENT-6.8 (relus mot pour mot le
// 12/10/2026 : Office des publications de l'Union européenne ; Légifrance). Rien de plus : le texte de l'arrêt maladie n'a pas été relu (voir les questions).
const src = (t) => `<p class="mr-st" style="margin-top:14px">${t}</p>`;
export const DOC_DROIT = { id: 'droit-114', titre: 'Le droit : temps de conduite et de repos', court: 'Le droit',
  html: `<article class="mr-doc" aria-label="Le droit">
    <p class="mr-t">Le droit : temps de conduite et de repos</p>
    ${src('Règlement (CE) n° 561/2006, article 2 (extrait)')}<p>« 1. Le présent règlement s’applique au transport routier: a) de marchandises par des véhicules, y compris des véhicules à remorque ou à semi-remorque, dont la masse maximale autorisée dépasse 3,5 tonnes […] »</p>
    ${src('Règlement (CE) n° 561/2006, article 4 g (extrait)')}<p>« “temps de repos journalier normal”: toute période de repos d’au moins onze heures. »</p>
    ${src('Règlement (CE) n° 561/2006, article 6 (extrait)')}<p>« 1. La durée de conduite journalière ne dépasse pas neuf heures. La durée de conduite journalière peut, toutefois, être prolongée jusqu’à dix heures maximum, mais pas plus de deux fois au cours de la semaine. »</p>
    ${src('Règlement (CE) n° 561/2006, article 7')}<p>« Après un temps de conduite de quatre heures et demie, un conducteur observe une pause ininterrompue d’au moins quarante-cinq minutes, à moins qu’il ne prenne un temps de repos. Cette pause peut être remplacée par une pause d’au moins quinze minutes suivie d’une pause d’au moins trente minutes réparties au cours de la période de manière à se conformer aux dispositions du premier alinéa. »</p>
    ${src('Code du travail, article L1132-1 (extrait)')}<p>« […] aucun salarié ne peut être sanctionné, licencié ou faire l’objet d’une mesure discriminatoire, directe ou indirecte, […] notamment en matière de rémunération, […] d’affectation, […] en raison de son origine, de son sexe, […] de son âge, […] »</p>
    <p class="mr-pied">Textes de loi (réels) — sources : Office des publications de l’Union européenne (règlement) ; Légifrance (Code du travail)</p>
  </article>` };

export const DOCUMENTS = [DOC_TOURNEES, DOC_MOYENS, DOC_REGLES, DOC_DROIT];
const PIECES = [DOC_TOURNEES.id, DOC_MOYENS.id, DOC_REGLES.id];
export const STYLE_DOCUMENTS = `
--douce:#555047;
.mr-doc{padding:14px 18px 0}
.mr-doc p{margin:0 0 8px}
.mr-t{margin:0; font-size:1.05rem; font-weight:800}
.mr-st{margin:2px 0 10px; font-size:.82rem; color:var(--douce)}
.mr-tab{border-collapse:collapse; width:100%; font-size:.88rem; margin:4px 0 10px}
.mr-tab th,.mr-tab td{border-bottom:1px solid var(--filet); padding:5px 6px; text-align:left; vertical-align:top}
.mr-tab th{color:var(--douce); font-weight:600}
.mr-note{margin:6px 0 0; font-size:.86rem}
.mr-ul{margin:6px 0 0; padding-left:20px; font-size:.92rem}
.mr-ul li{margin:4px 0}
.mr-pied{margin:12px -18px 0; font-size:.72rem; color:var(--douce); border-top:1px solid var(--filet); padding:6px 18px; text-align:right}
`;

// ─────────────────────────────────────────────────────────────── les messages (au tu ; samedi 12 décembre 2026 ; jamais juste ni faux)
const SAMIA = { nom: PERSONNES.samia.nom, mail: mailDe('samia') };
const MIN = 60000;
const mail = (prenom, de, subject, text, o = {}) => ({ folder: 'in',
  ts: heureScenario(SCENARIO.date, o.heure || '05:00', { db: o.db, volet: ID_VOLET, decalage: (o.decalage || 0) * MIN }),
  from: de.nom, fromMail: de.mail, to: prenom, subject, kind: 'text', text, ...(o.extra || {}) });
export const SUJETS = { depart: 'Le planning du samedi', imprevu: 'Imprévu : planning à reprendre', changement: 'Qu’est-ce qui change ?', fin: 'Merci' };

export const VOLET = {
  id: ID_VOLET,
  semer: (prenom, db) => ({ mails: [
    mail(prenom, SAMIA, SUJETS.depart,
      `Salut ${prenom} !\n\nCe samedi, c’est le pic de décembre : les volumes sont doublés. Je te confie le planning des 5 tournées des Points Relais : `
        + 'un chauffeur et un camion pour chacune.\n\nLes tournées, les chauffeurs, les camions et les règles sont en pièces jointes. Ouvre le planning dans le menu.\n\nSamia',
      { db, extra: { pieces: PIECES } }),
  ] }),
  declencheurs: [
    // Le 1er planning envoyé (juste ou faux) : l'imprévu, et la vue passe à la reprise.
    { id: 'imprevu', quand: apresPlanning(PL), phasePlanning: 2,
      semer: (prenom, db) => ({ mails: [mail(prenom, SAMIA, SUJETS.imprevu, `${prenom}, ${sansBalises(texteAlea(jeuDeBase(db)))}\n\nSamia`, { db, heure: '05:30', decalage: 1 })] }) },
    // Le planning repris et renvoyé : Samia demande ce qui change (phrases à choisir).
    { id: 'changement', quand: apresPlanning(PL, 2),
      semer: (prenom, db) => ({ mails: [mail(prenom, SAMIA, SUJETS.changement,
        'Merci pour le planning. Dis-moi ce qui a changé, et pourquoi tu as organisé la journée comme ça.\n\nClique sur « Répondre » et choisis une phrase par ligne.\n\nSamia',
        { db, heure: '05:45', decalage: 2, extra: { phrases: phrasesSamia(prenom, jeuDeBase(db)) } })] }) },
    // La fin : neutre (Samia ne reprend pas ce que l'élève a écrit), et la remise.
    { id: 'fin', quand: apresMail({ a: SAMIA.mail }),
      semer: (prenom, db) => ({ mails: [mail(prenom, SAMIA, SUJETS.fin,
        `Merci ${prenom}.\n\nQuand tu as fini, clique sur « Rendre ma copie », en haut de l’écran.\n\nSamia`, { db, heure: '06:00', decalage: 3 })] }) },
  ],
};

// ─────────────────────────────────────────────────────────────── les jalons (16 + 4 d'« Avant de commencer » = 20)
export const POIDS = { 'v1-tous': 3, 'v1-permis': 3, 'v1-repos': 3, 'v1-conduite': 3, 'v2-replanifier': 3, message: 1 };
export const GROUPES = { v1: 'Le planning du samedi', v2: 'Après l’imprévu', message: 'Rendre compte' };
const attente = { status: 'attente' }, ok = { status: 'ok' }, ko = { status: 'ko' };
const TITRES = { 'v1-tous': 'Planning : chaque tournée a un chauffeur et un camion, et part à son heure', 'v1-permis': 'Planning : le bon permis, le bon type de camion, une tournée chacun',
  'v1-repos': 'Planning : le repos de 11 h', 'v1-conduite': 'Planning : conduite et pause', 'v2-replanifier': 'Après l’imprévu : planning complet et dans les règles' };
// Le planning DE CET ÉLÈVE : la ligne de la vue (`jalonsPlanning` sur le planning de sa graine).
const jalonPlanning = (id) => ({ id, titre: TITRES[id], groupe: id.startsWith('v1') ? GROUPES.v1 : GROUPES.v2, poids: POIDS[id], ecran: `planning:${PL}`,
  verifier(db) {
    const l = jalonsPlanning(db, planningDe(graineDeBase(db))).L.find((x) => x.id === id);
    if (!l) throw new Error(`jalon de planning « ${id} » absent`);
    return !l.envoye ? attente : l.ok ? ok : ko;
  } });
export const ETAPES = [
  ...['v1-tous', 'v1-permis', 'v1-repos', 'v1-conduite', 'v2-replanifier'].map(jalonPlanning),
  { id: 'message', titre: 'Rendre compte à Samia : ce qui change et pourquoi', groupe: GROUPES.message, poids: POIDS.message, ecran: `phrases:${MSG}`,
    verifier(db) { const r = phrasesJustes(db, MSG); if (!r.envoye) return attente; return ['changement', 'raison'].every((l) => r.justes.includes(l)) ? ok : ko; } },
];

// ─────────────────────────────────────────────────────────────── l'accueil et les options
export const MENTION_114 = `${MENTION_MR} Pour cette séance : les tournées du samedi, leurs horaires, les chauffeurs, les camions et les renforts sont construits.`;
export const ACCUEIL = {
  titre: 'Évaluation : le samedi du pic',
  kpis: ['mail'],
  etapes: [
    ['Lire le message de Samia', 'Menu Messagerie : les tournées, les chauffeurs, les camions et les règles sont en pièces jointes.'],
    ['Faire le planning', 'Menu « Planning du samedi » : un chauffeur et un camion pour chaque tournée, puis envoie le planning.'],
    ['Reprendre après l’imprévu', 'Un message t’annonce un imprévu : reprends le planning et renvoie-le.'],
    ['Rendre compte à Samia', 'Réponds-lui : « Répondre », puis une phrase par ligne.'],
    ['Rendre ma copie', 'Quand tu as fini, clique sur « Rendre ma copie » en haut de l’écran. Une seule remise.'],
    ['Bon à savoir', MENTION_114],
  ],
};
export const OPTIONS = {
  menu: [],
  exercice: 'Évaluation : le samedi du pic',
  sansTrame: 'Tout se fait à l’écran',
  lexique: {},
  equipe: EQUIPE,
  documents: DOCUMENTS,
  documentsStyle: STYLE_DOCUMENTS,
  questions: QUESTIONS,
  tirage: true,                                        // la graine (l'identifiant de l'élève) est posée à la première ouverture
};
export { QUESTIONS, IDS_CHAUFFEURS, mm };
