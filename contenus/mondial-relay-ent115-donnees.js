// ENT-11.5 — Mondial Relay, « évaluation : la tournée Sud et le colis bloqué » : les DONNÉES PURES de la séance (le plan, les cinq Points Relais, le
// tirage des horaires et de la cause du blocage, le calcul d'une journée). Brief : `docs/briefs/ENT-11.5-mondial-relay-evaluation-tournee.md` §5 et §6 bis.
// Le contenu (textes, documents, messages, jalons) est dans `contenus/mondial-relay-ent115.js` ; l'univers commun dans `contenus/mondial-relay.js`
// (lu, jamais modifié). Rien ici n'importe le moteur de vues (`core/types/`), qui ne se charge pas dans Node : le corrigé et le test « tirage sur
// quelques centaines de graines » relisent ce fichier hors navigateur. Le bloc de tests `mr-11.5` vérifie que `journee` rend la même chose que la vue
// Tournée du moteur sur plusieurs ordres (deux calculs qui divergeraient = test rouge).
//
// ── LE PLAN (schématique, CONSTRUIT) ───────────────────────────────────────────────────────────────────────────────────────────────────
// Le réseau n'étant pas joignable depuis la machine de construction (téléchargement OpenStreetMap refusé), la carte de l'Aube n'a pas pu être
// fabriquée : la tournée se joue sur un PLAN SCHÉMATIQUE (quadrillage, positions approchées des cinq communes, rien qui imite OpenStreetMap). La
// distance d'un trajet est la distance à vol d'oiseau entre deux points du plan, majorée de 30 % (`facteurRoute`) pour les routes : CONSTRUITE et dite
// comme telle à l'écran. Demande au moteur (carte de l'Aube, capture OpenStreetMap locale) : §7 du brief.
//
// ── LE TIRAGE (graine = l'identifiant de l'élève, rangée par le moteur dans `db.tirage.graine`) ───────────────────────────────────────────────
// Les MÊMES cinq Points Relais pour tous (ids fixes, positions fixes) ; les HORAIRES d'ouverture (une fenêtre par commerce, ou aucune) et la CAUSE du
// colis bloqué sont tirés par élève. Contraintes d'équité (`verifier`) : au moins quatre commerces ont un horaire ; il existe 1 à 4 ordres de passage
// justes (aucun horaire raté, retour avant l'heure fixée avec 10 min de marge, conduite sans pause) ; ils forment UNE SEULE FAMILLE (même suite, les deux
// communes de l'agglomération de Troyes comptées pour un seul « arrêt proche » : on peut les échanger) ; l'ordre « naturel » du nord au sud n'en est pas.
// Une fonction pure de la graine : changer la réserve ou le code de `tirer` change le jeu d'un élève qui a déjà commencé.

import { tirerJeu, graineDeBase, hasard } from '../core/tirage.js';

export const ID = 'mondial-relay-evaluation-tournee';
export const ID_VOLET = 'mr-ent115';
export const TOURNEE_ID = 'mr-tournee-sud';
export const MSG_RELAIS = 'reponse-relais';
export const MSG_EXPEDITEUR = 'reponse-expediteur';
// Samedi 19 décembre 2026 (le pic de fin d'année : l'histoire se passe en décembre, comme tout le scénario S3).
export const SCENARIO = { date: '2026-12-19', heure: '07:05' };

// Les personnes de la séance (construites, prénoms seuls) : Samia, au tu. Le Point Relais et l'expéditrice écrivent de l'extérieur (au vous).
export const EQUIPE = {
  samia: { nom: 'Samia', role: 'responsable d’exploitation de l’agence (ta tutrice)', appel: 'Samia', registre: 'tu' },
};
export const DOMAINE_MAIL = 'mr-bucheres.example';
export const mailDe = (id) => `${id}@${DOMAINE_MAIL}`;
// L'heure d'un message : celle du SCÉNARIO, jamais la date réelle (règle de Tristan du 10/10/2026). Avec `db` et `volet`, on ajoute le temps
// réellement passé depuis l'ouverture de la séance : un message déclenché arrive « quelques minutes après ».
export function heureScenario(iso, hhmm, { db, volet, decalage = 0 } = {}) {
  const [a, m, j] = iso.split('-').map(Number), [hh, mn] = hhmm.split(':').map(Number);
  const ouvert = db && db.volets && volet ? db.volets[volet] : 0;
  const ecoule = ouvert ? Math.max(0, Date.now() - ouvert) : 0;
  return new Date(a, m - 1, j, hh, mn).getTime() + ecoule + decalage;
}

const h = (hh, mm = 0) => hh * 60 + mm;
const pad = (n) => String(n).padStart(2, '0');
// « 9 h », « 12 h 30 » : l'heure dite, sans zéro inutile.
export const hDit = (m) => { const r = Math.round(m); return r % 60 ? `${Math.floor(r / 60)} h ${pad(r % 60)}` : `${Math.floor(r / 60)} h`; };
// « 07 h 30 » : l'heure écrite comme la vue Tournée l'affiche.
export const hhmm = (m) => { const r = Math.round(m); return `${pad(Math.floor(r / 60))} h ${pad(r % 60)}`; };

// ─────────────────────────────────────────────────────────────── la journée (fixe, CONSTRUITE)
export const JOUR = { depart: h(7, 30), limite: h(13, 30), vitesse: 40, service: 10, facteurRoute: 1.3, pause: { apres: 270, duree: 45 } };

// ─────────────────────────────────────────────────────────────── les lieux (plan schématique, positions APPROCHÉES des vraies communes)
export const PLAN_TAILLE = { largeur: 620, hauteur: 540 };
export const PX_PAR_KM = 13;
export const DEPART = { id: 'depart', nom: 'Buchères (départ)', lettre: 'B', x: 210, y: 110 };
export const ARRIVEE = { id: 'arrivee', nom: 'Retour à Buchères', x: 234, y: 132 };
// Les cinq Points Relais de la tournée T3 Sud : commune réelle, commerce CONSTRUIT (le nom de la quincaillerie est celui du fil rouge de l'univers).
export const LIEUX = [
  { id: 'sj', commune: 'Saint-Julien-les-Villas', commerce: 'Tabac-presse', x: 172, y: 64 },
  { id: 'br', commune: 'Bréviandes', commerce: 'Boulangerie', x: 66, y: 100 },
  { id: 'bs', commune: 'Bar-sur-Seine', commerce: 'Quincaillerie Régnier', x: 451, y: 316 },
  { id: 'ch', commune: 'Chaource', commerce: 'Café-épicerie', x: 225, y: 393 },
  { id: 'ri', commune: 'Les Riceys', commerce: 'Épicerie', x: 450, y: 494 },
];
export const IDS = LIEUX.map((l) => l.id);
export const lieu = (id) => LIEUX.find((l) => l.id === id) || null;
export const communeDe = (id) => (lieu(id) || {}).commune || id;
// L'ordre « naturel » du nord au sud, celui qu'un élève écrit sans réfléchir : il ne doit jamais être juste.
export const ORDRE_NATUREL = ['sj', 'br', 'bs', 'ch', 'ri'];

const XY = { depart: DEPART, arrivee: ARRIVEE, ...Object.fromEntries(LIEUX.map((l) => [l.id, l])) };
// La distance d'un trajet, comme `distanceKm` de la vue plan : à vol d'oiseau sur le plan, majorée pour les routes.
export const kmEntre = (a, b) => Math.hypot(XY[a].x - XY[b].x, XY[a].y - XY[b].y) / PX_PAR_KM * JOUR.facteurRoute;

// ─────────────────────────────────────────────────────────────── les horaires d'un commerce
// Une fenêtre `{ apres?, avant? }` (minutes depuis minuit), ou `{}` : le commerce est ouvert toute la matinée.
const APRES = [null, null, h(8, 30), h(9), h(9, 30), h(10), h(10, 30), h(11)];
const AVANT = [null, h(10), h(10, 30), h(11), h(11, 30), h(12), h(12, 30), h(13)];
export const libelleFenetre = (f) => (!f || (f.apres == null && f.avant == null) ? 'ouvert toute la matinée'
  : f.apres == null ? `ferme à ${hDit(f.avant)}`
    : f.avant == null ? `n’ouvre qu’à ${hDit(f.apres)}`
      : `ouvert de ${hDit(f.apres)} à ${hDit(f.avant)}`);

// ─────────────────────────────────────────────────────────────── la cause du colis bloqué (tirée)
export const CAUSES = [
  { id: 'ouvert', court: 'carton ouvert' },
  { id: 'etiquette', court: 'étiquette illisible' },
  { id: 'ferme', court: 'Point Relais fermé' },
];

// ─────────────────────────────────────────────────────────────── le calcul d'une journée (même formules que `bilanDe` de la vue Tournée)
// `ordre` : des ids de LIEUX ; `fen` : { id: fenêtre }. Rend le bilan de la vue, avec ce que lisent les jalons, les menus et le corrigé :
// `retenus`, `arrivees`, `attentes`, `departs`, `km`, `kmRetour`, `conduite`, `pauseDue`, `attente`, `service`, `minutes`, `arrivee` (heure de retour),
// `enRetard`, `creneauxRates` (ids), `complete` (les cinq Points Relais sont dans la tournée).
export function journee(ordre, fen) {
  const arrivees = {}, attentes = {}, departs = {}, troncons = {};
  let km = 0, servi = 0, attente = 0, prec = 'depart';
  const creneauxRates = [];
  ordre.forEach((id) => {
    const t = kmEntre(prec, id);
    km += t; troncons[id] = t;
    const a = JOUR.depart + km / JOUR.vitesse * 60 + servi + attente;
    const f = (fen && fen[id]) || {};
    const w = f.apres != null && a < f.apres ? f.apres - a : 0;
    arrivees[id] = a; attentes[id] = w; departs[id] = a + w + JOUR.service;
    if (f.avant != null && a + w > f.avant) creneauxRates.push(id);
    attente += w; servi += JOUR.service; prec = id;
  });
  const kmRetour = ordre.length ? kmEntre(prec, 'arrivee') : null;
  if (ordre.length) km += kmRetour;
  const conduite = ordre.length ? km / JOUR.vitesse * 60 : 0;
  const pauseDue = conduite > JOUR.pause.apres;
  const pause = pauseDue ? JOUR.pause.duree : 0;
  const minutes = ordre.length ? conduite + servi + attente + pause : 0;
  const arrivee = ordre.length ? JOUR.depart + minutes : null;
  return { retenus: ordre, troncons, kmRetour, arrivees, attentes, departs, km, conduite, pauseDue, pause, attente, service: servi, minutes, arrivee,
    enRetard: arrivee != null && arrivee > JOUR.limite, creneauxRates, complete: ordre.length === IDS.length };
}
export const tient = (b) => b.complete && !b.creneauxRates.length && !b.enRetard && !b.pauseDue;

const permutations = (L) => (L.length <= 1 ? [L] : L.flatMap((x, i) => permutations([...L.slice(0, i), ...L.slice(i + 1)]).map((p) => [x, ...p])));
export const ORDRES = permutations(IDS);
// Les ordres justes d'un jeu, et leur « famille » : les deux communes proches de Troyes (sj, br) comptent pour le même arrêt « N ».
export const ordresJustes = (jeu) => ORDRES.filter((o) => tient(journee(o, jeu.fenetres)));
export const familleDe = (ordre) => ordre.map((x) => (x === 'sj' || x === 'br' ? 'N' : x)).join('>');

// ─────────────────────────────────────────────────────────────── le tirage
function tirerFenetres(hz) {
  const F = {};
  for (const id of IDS) {
    let f;
    do {
      f = {};
      const a = hz.choisir(APRES), v = hz.choisir(AVANT);
      if (a != null) f.apres = a;
      if (v != null) f.avant = v;
    } while (f.apres != null && f.avant != null && f.avant - f.apres < 120);   // un commerce n'ouvre pas moins de deux heures
    F[id] = f;
  }
  return F;
}
export function ecartsFenetres(F) {
  const E = [];
  if (IDS.filter((id) => F[id] && (F[id].apres != null || F[id].avant != null)).length < 4) E.push('moins de quatre commerces ont un horaire');
  const J = ORDRES.filter((o) => tient(journee(o, F)));
  if (J.length < 1 || J.length > 4) E.push(`${J.length} ordres justes (il en faut de 1 à 4)`);
  else {
    if (new Set(J.map(familleDe)).size !== 1) E.push('les ordres justes ne forment pas une seule famille');
    if (J.some((o) => JOUR.limite - journee(o, F).arrivee < 10)) E.push('un ordre juste rentre à moins de 10 min de l’heure fixée');
  }
  if (tient(journee(ORDRE_NATUREL, F))) E.push('l’ordre du nord au sud est juste');
  return E;
}
// Les fenêtres sont tirées par essais successifs jusqu'à un jeu conforme (au plus 6 000 essais : en moyenne quelques centaines) ; `verifier` refait le contrôle.
function tirer(hz) {
  let F = null;
  for (let n = 0; n < 6000; n++) { F = tirerFenetres(hz); if (!ecartsFenetres(F).length) break; }
  return { fenetres: F, cause: hz.entier(0, CAUSES.length - 1) };
}
export function verifier(jeu) {
  if (!jeu || !jeu.fenetres) return ['pas de fenêtres'];
  const E = ecartsFenetres(jeu.fenetres);
  if (!Number.isInteger(jeu.cause) || jeu.cause < 0 || jeu.cause >= CAUSES.length) E.push('cause du blocage inconnue');
  return E;
}
// Le jeu de secours : un jeu conforme tiré une fois (jamais d'élève sans jeu).
const SECOURS = tirer(hasard('secours-mr-ent115'));
export const DECL = { tirer, verifier, essais: 40, secours: SECOURS };

const jeux = new Map();
export function jeuDe(graine) {
  const g = String(graine == null ? '' : graine);
  if (!jeux.has(g)) jeux.set(g, tirerJeu(DECL, `${g}|${ID}`).jeu);
  return jeux.get(g);
}
export const tirageDe = (graine) => tirerJeu(DECL, `${String(graine == null ? '' : graine)}|${ID}`);
export const jeuDeBase = (db) => jeuDe(graineDeBase(db || {}));
export const fenetresDeBase = (db) => jeuDeBase(db).fenetres;
export const causeDe = (db) => CAUSES[jeuDeBase(db).cause];

// ─────────────────────────────────────────────────────────────── les points de la tournée (positions fixes, horaires de l'élève)
const fenetreCreneau = (l, f) => (f && (f.apres != null || f.avant != null)
  ? { ...(f.apres != null ? { apres: f.apres } : {}), ...(f.avant != null ? { avant: f.avant } : {}),
    libelle: `${l.commerce} : ${libelleFenetre(f)}` } : null);
export const pointsDe = (fen) => LIEUX.map((l, k) => ({ id: l.id, numero: k + 1, nom: l.commune, zone: l.commerce, x: l.x, y: l.y,
  ...(fenetreCreneau(l, fen && fen[l.id]) ? { creneau: fenetreCreneau(l, fen[l.id]) } : {}) }));

// ─────────────────────────────────────────────────────────────── l'état de l'élève (lu par les jalons)
export const etatTournee = (db) => (db && db.transport && db.transport[ID] && db.transport[ID].tournee) || null;
export const ordreDe = (db) => { const e = etatTournee(db); return e && Array.isArray(e.ordre) ? e.ordre.map(String) : []; };
export const tourneeFaite = (db) => ordreDe(db).length > 0;
// Les cases « Heures » reportées, telles que tapées.
export const reportDe = (db) => { const e = etatTournee(db); return (e && e.report) || {}; };

// ─────────────────────────────────────────────────────────────── le suivi du colis bloqué (selon la cause)
export const COLIS = { numero: 'MR 5290 7731', expeditrice: { nom: 'Camille Brisset', boutique: 'Maison Brisset', ville: 'Reims' },
  relais: { commune: 'Bar-sur-Seine', commerce: 'Quincaillerie Régnier', gerant: 'Georges Régnier' }, deposeLe: 'mardi 15/12' };
export function evenementsSuivi(cause) {
  const tete = [
    ['mardi 15/12', '17 h 05', 'Pris en charge', `Colis déposé par l’expéditrice à Reims, à destination du Point Relais de ${COLIS.relais.commune}.`],
    ['mercredi 16/12', '02 h 38', 'Arrivé à l’agence de Buchères', 'Passage sur la machine de tri.'],
  ];
  const suite = {
    ouvert: [
      ['mercredi 16/12', '02 h 41', 'Écarté du tri', 'Emballage ouvert constaté : le colis ne continue pas sa route.'],
      ['mercredi 16/12', '07 h 15', 'Mis de côté', 'Colis conservé à l’agence, dans la zone des colis à contrôler.'],
    ],
    etiquette: [
      ['mercredi 16/12', '02 h 41', 'Écarté du tri', 'L’étiquette n’a pas pu être lue : la tournée du colis est inconnue.'],
      ['mercredi 16/12', '07 h 15', 'Mis de côté', 'Colis conservé à l’agence, en attente d’une nouvelle étiquette.'],
    ],
    ferme: [
      ['mercredi 16/12', '02 h 44', 'Trié', 'Colis envoyé vers la tournée T3 Sud.'],
      ['jeudi 17/12', '10 h 20', 'Présenté au Point Relais', `${COLIS.relais.commerce}, ${COLIS.relais.commune} : fermeture exceptionnelle du 17 au 18/12, colis non remis.`],
      ['jeudi 17/12', '10 h 35', 'Retour à l’agence', 'Colis ramené à l’agence de Buchères.'],
    ],
  }[cause.id];
  return [...tete, ...suite, ['samedi 19/12', '06 h 00', 'Statut affiché au client : « Pris en charge »', 'Aucun nouvel événement depuis le dernier ci-dessus.']];
}
