// ENT-6.9 — France Boissons, « la tournée de la côte » : les DONNÉES PURES de la séance (clients, journée, feuille de route).
// À part de `contenus/france-boissons-ent69.js` parce que ce fichier-ci se charge aussi hors navigateur : le corrigé
// (`contenus/corriges/ENT-6.9.js`) le lit, et le test « tout corrigé déclaré existe » l'importe dans Node, où `core/types/tournee.js`
// ne se charge pas. Rien ici n'importe le moteur, sauf `core/formules.js` (le calcul des cellules, sans écran).
//
// Calage retenu par Tristan le 12/10/2026 (jeu C, `docs/briefs/france-boissons/calage-6.9.py` et `calage-6.9-resultats.txt`) :
// 142 km d'autoroute mesurés (sortie de Touques), 45 km/h sur la côte, 20 min par arrêt ; café de Deauville avant 8 h 30,
// Villerville et Trouville avant 11 h 30, Malo pas avant 10 h, Houlgate avant 10 h 30, hôtel sans horaire. 42 ordres justes sur 720.
//
// `journee(ordre)` refait le calcul de `bilanDe` (`core/types/tournee.js`) pour le corrigé, les questions et les menus du SMS ; le bloc
// de tests `fb-6.9` vérifie qu'il rend la même chose que le moteur sur plusieurs ordres (deux calculs qui divergeraient = test rouge).

import { evaluerGrille } from '../core/formules.js';
import { CARTE } from './fb-ent69-carte.js';

export const ID = 'france-boissons-tournee';
export const TRANSPORT_ID = 'fb-ent69';
export const ID_VOLET = 'fb-ent69';
export const MSG_SMS = 'sms-lucas';
export const CLE_SMS = 'lucas';

// Vendredi 18 juin 2027, 6 h 30 (décision 66) : Lucas est parti de Buchelay à 6 h 00 avec T1.
export const SCENARIO = { date: '2027-06-18', heure: '06:30' };

const h = (hh, mm = 0) => hh * 60 + mm;
// La journée : données fixes (brief §4, §6). Vérifié : 90 km/h sur autoroute pour un camion de plus de 12 t ; 4 h 30 de conduite
// puis 45 min de pause (561/2006). Construit : 45 km/h de moyenne sur la côte, 20 min par arrêt, le départ à 6 h, le retour avant 15 h 30.
export const JOUR = {
  depart: h(6), limite: h(15, 30), vitesse: 45, service: 20,
  autoroute: { km: 142, vitesse: 90 },
  pause: { apres: 270, duree: 45 },
};
export const MIN_AUTOROUTE = JOUR.autoroute.km / JOUR.autoroute.vitesse * 60;

// ─────────────────────────────────────────────────────────────── les six clients (établissements inventés, rues réelles)
// Horaires CONSTRUITS (jeu C). Le marché de Deauville le vendredi (7 h – 13 h 30) est vérifié ; la règle « place fermée aux camions
// après 8 h 30 » est construite. Les commandes s'affichent pour le réalisme et ne jouent pas (pas de plafond de charge : le camion part
// plein ; les vides sont le sujet d'ENT-6.10).
export const CRENEAUX = {
  D: { avant: h(8, 30), libelle: 'vendredi, jour de marché : après 8 h 30, la place est fermée aux camions' },
  R: { avant: h(11, 30), libelle: 'livraison avant 11 h 30 : ensuite, la cuisine prépare le service du midi' },
  T: { avant: h(11, 30), libelle: 'rue des Bains, zone piétonne : livraisons le matin, avant 11 h 30' },
  M: { apres: h(10), libelle: 'Malo n’ouvre qu’à 10 h : personne pour réceptionner avant' },
  G: { avant: h(10, 30), libelle: 'livraison avant 10 h 30 : ensuite, la digue est aux piétons et aux terrasses' },
};
export const COMMANDES = {
  D: '4 fûts, 3 casiers',
  R: '3 fûts, 2 casiers',
  T: '6 fûts, 4 casiers',
  M: '2 palettes (la commande préparée jeudi : fûts et eau)',
  V: '5 fûts, 6 casiers',
  G: '3 fûts, 2 casiers',
};
export const VILLES = { D: 'Deauville', R: 'Villerville', T: 'Trouville-sur-Mer', M: 'Villers-sur-Mer', V: 'Villers-sur-Mer', G: 'Houlgate' };
// Les points de la carte, avec leur créneau (l'ordre est celui de la carte : il ne dit rien de l'ordre de passage).
export const POINTS = CARTE.clients.map((c) => ({ ...c, kg: 0, colis: 0, ...(CRENEAUX[c.id] ? { creneau: CRENEAUX[c.id] } : {}) }));
export const IDS = POINTS.map((p) => p.id);
export const nomDe = (id) => (POINTS.find((p) => p.id === id) || {}).nom || id;

// L'heure écrite comme la feuille l'affiche (« 07 h 35 ») et comme on la dit (« 7 h 35 », « 10 h »).
const pad = (n) => String(n).padStart(2, '0');
export const hhmm = (m) => { const r = Math.round(m); return `${pad(Math.floor(r / 60))} h ${pad(r % 60)}`; };
export const hDit = (m) => { const r = Math.round(m); return `${Math.floor(r / 60)} h ${pad(r % 60)}`; };
export const dureeDit = (m) => { const r = Math.round(m); return `${Math.floor(r / 60)} h ${pad(r % 60)}`; };

// ─────────────────────────────────────────────────────────────── la journée d'un ordre (le calcul de `bilanDe`)
const km1 = (a, b) => {
  const t = CARTE.trajets[`${a}|${b}`];
  if (!t) throw new Error(`ENT-6.9 : pas d'itinéraire de « ${a} » à « ${b} »`);
  return t.m / 1000;
};
// Même forme que le bilan du moteur pour ce que lisent la feuille et les jalons : `retenus`, `troncons`, `kmRetour`, `arrivees`,
// `attentes`, `departs`, `km` (sur la côte), `conduite`, `pauseDue`, `arrivee` (heure de retour à Buchelay), `enRetard`,
// `creneauxRates`. Un ordre incomplet se calcule aussi (les arrêts posés seulement), comme le moteur.
export function journee(ordre) {
  const retenus = ordre.map((id) => POINTS.find((p) => p.id === id)).filter(Boolean);
  const arrivees = {}, attentes = {}, departs = {}, troncons = {};
  let km = 0, servi = 0, attente = 0, prec = 'depart';
  retenus.forEach((p) => {
    const t = km1(prec, p.id);
    km += t;
    troncons[p.id] = t;
    const a = JOUR.depart + MIN_AUTOROUTE + km / JOUR.vitesse * 60 + servi + attente;
    const cr = p.creneau || {};
    const w = cr.apres != null && a < cr.apres ? cr.apres - a : 0;
    arrivees[p.id] = a; attentes[p.id] = w; departs[p.id] = a + w + JOUR.service;
    attente += w; servi += JOUR.service; prec = p.id;
  });
  const kmRetour = retenus.length ? km1(prec, 'arrivee') : null;
  if (retenus.length) km += kmRetour;
  const conduite = retenus.length ? 2 * MIN_AUTOROUTE + km / JOUR.vitesse * 60 : 0;
  const pauseDue = conduite > JOUR.pause.apres;
  const arrivee = retenus.length ? JOUR.depart + 2 * MIN_AUTOROUTE + km / JOUR.vitesse * 60 + servi + attente
    + (pauseDue ? JOUR.pause.duree : 0) : null;
  // Dans l'ordre de la carte, comme le moteur.
  const creneauxRates = POINTS.filter((p) => arrivees[p.id] != null && p.creneau && p.creneau.avant != null
    && arrivees[p.id] + attentes[p.id] > p.creneau.avant).map((p) => p.id);
  return { retenus, troncons, kmRetour, arrivees, attentes, departs, km, conduite, pauseDue, attente,
    arrivee, enRetard: arrivee != null && arrivee > JOUR.limite, creneauxRates };
}

// Les solutions de RÉFÉRENCE (corrigé ; les tests écrivent les leurs à la main) : la meilleure tournée du calage, et une autre juste.
export const SOLUTION = ['D', 'R', 'T', 'V', 'M', 'G'];
export const SOLUTION_2 = ['D', 'T', 'R', 'V', 'G', 'M'];

// ─────────────────────────────────────────────────────────────── la feuille de route (adresses STABLES)
// Bloc A (données, lignes 2 à 8), bloc B (l'aller, 10-11), bloc C (feuille de route, 13 à 18 dans l'ordre de la tournée, retour en 19),
// bloc D (le bilan, 21 à 25). Les heures comptent en minutes depuis minuit (06:00 = 360, `core/formules.js`). Les attendus du bloc C
// et du bilan se calculent sur LES SAISIES DE L'ÉLÈVE (`attendu: (lire) => …`) : une erreur ne se paie qu'une fois.
export const REF = {
  depart: 'B2', kmAuto: 'B3', vAuto: 'B4', vCote: 'B5', service: 'B6', conduiteMax: 'B7', limite: 'B8',
  tempsAuto: 'B10', sortie: 'B11',
  premiereLigne: 13, ligneRetour: 19,
  kmCote: 'B21', conduiteCote: 'B22', conduite: 'B23', pause: 'B24', retour: 'B25',
};
export const LIGNES_ARRETS = 6;
const arr1 = (x) => Math.round(x * 10) / 10;   // les km, au dixième, comme la feuille les affiche
const sec = (titre) => ({ A: titre, B: '', C: '', D: '', E: '', F: '', entete: true });
const lib = (valeur, type) => ({ valeur, type });
const vide = { A: '', B: '', C: '', D: '', E: '', F: '' };

export function lignesFeuille(b) {
  const L = [];
  // ── A · les données de la journée
  L.push(sec('A · Les données de la journée'));
  L.push({ ...vide, A: 'Départ de Buchelay', B: { valeur: JOUR.depart, format: 'heure' } });
  L.push({ ...vide, A: 'Km d’autoroute jusqu’à Touques (retour : pareil)', B: JOUR.autoroute.km });
  L.push({ ...vide, A: 'Vitesse sur autoroute (km/h)', B: JOUR.autoroute.vitesse });
  L.push({ ...vide, A: 'Vitesse sur la côte (km/h)', B: JOUR.vitesse });
  L.push({ ...vide, A: 'Temps par arrêt (min)', B: JOUR.service });
  L.push({ ...vide, A: lib('Conduite max. sans pause (min)', 'contrainte'), B: { valeur: JOUR.pause.apres, type: 'contrainte' } });
  L.push({ ...vide, A: lib('Retour à Buchelay avant', 'contrainte'), B: { valeur: JOUR.limite, format: 'heure', type: 'contrainte' } });
  // ── B · l'aller
  L.push(sec('B · L’aller'));
  L.push({ ...vide, A: lib('Étape 1 · Autoroute (min)', 'etape'),
    B: { saisie: true, formule: true, attendu: MIN_AUTOROUTE, tolerance: 0.5, type: 'etape', libelle: 'temps d’autoroute',
      aide: 'Km ÷ vitesse × 60 donne des minutes : =B3/B4*60.' } });
  L.push({ ...vide, A: lib('Étape 2 · Sortie à Touques', 'etape'),
    B: { saisie: true, formule: true, format: 'heure', tolerance: 0.5, type: 'etape', libelle: 'heure de sortie',
      attendu: (lire) => (lire('B2') == null || lire('B10') == null ? null : lire('B2') + lire('B10')),
      aide: 'Heure de départ + temps d’autoroute : =B2+B10.' } });
  // ── C · la feuille de route, dans l'ordre de la tournée (6 lignes réservées)
  L.push({ A: 'C · Feuille de route', B: 'Km', C: 'Arrivée', D: 'Départ', E: 'Ouvre à', F: 'Livrer avant', entete: true });
  for (let i = 0; i < LIGNES_ARRETS; i++) {
    const r = REF.premiereLigne + i;
    const p = b.retenus[i];
    if (!p) { L.push({ ...vide }); continue; }
    const cr = p.creneau || {};
    const prec = i === 0 ? 'B11' : `D${r - 1}`;
    const km = b.troncons[p.id] == null ? '' : arr1(b.troncons[p.id]);
    L.push({
      A: `${i + 1}. ${p.nom}`,
      B: km,
      C: { saisie: true, formule: true, format: 'heure', tolerance: 0.5, type: 'etape', libelle: `arrivée chez ${p.nom}`,
        attendu: (lire) => (lire(prec) == null || lire(`B${r}`) == null ? null : lire(prec) + lire(`B${r}`) / JOUR.vitesse * 60),
        aide: i === 0
          ? 'Étape 3 · Heure de sortie + km ÷ vitesse sur la côte × 60 : =B11+B13/B5*60.'
          : `Étape 3 · Départ de l’arrêt précédent + km ÷ vitesse sur la côte × 60 : =D${r - 1}+B${r}/B5*60.` },
      D: { saisie: true, formule: true, format: 'heure', tolerance: 0.5, type: 'etape', libelle: `départ de chez ${p.nom}`,
        attendu: (lire) => (lire(`C${r}`) == null ? null : Math.max(lire(`C${r}`), cr.apres == null ? -Infinity : cr.apres) + JOUR.service),
        aide: `Étape 4 · Arrivée + temps par arrêt : =C${r}+B6. S’il arrive avant l’ouverture, il attend : il repart plus tard `
          + `(ouverture + temps par arrêt : =E${r}+B6).` },
      E: cr.apres == null ? '—' : { valeur: cr.apres, format: 'heure' },
      F: cr.avant == null ? '—' : { valeur: cr.avant, format: 'heure' },
    });
  }
  L.push({ ...vide, A: 'Retour → sortie de Touques', B: b.kmRetour == null ? '' : arr1(b.kmRetour) });
  // ── D · le bilan
  const n = Math.min(b.retenus.length, LIGNES_ARRETS);
  const dernier = n ? `D${REF.premiereLigne + n - 1}` : null;
  L.push(sec('D · Le bilan'));
  L.push({ ...vide, A: lib('Étape 5 · Km sur la côte', 'etape'),
    B: { saisie: true, formule: true, tolerance: 0.15, type: 'etape', libelle: 'km sur la côte',
      attendu: (lire) => { let s = 0; for (let r = REF.premiereLigne; r <= REF.ligneRetour; r++) s += lire(`B${r}`) || 0; return n ? s : null; },
      aide: 'La somme des km de la feuille de route, retour compris : =SOMME(B13:B19).' } });
  L.push({ ...vide, A: lib('Étape 6 · Conduite côte (min)', 'etape'),
    B: { saisie: true, formule: true, tolerance: 0.5, type: 'etape', libelle: 'conduite sur la côte',
      attendu: (lire) => (lire('B21') == null ? null : lire('B21') / JOUR.vitesse * 60),
      aide: 'Km sur la côte ÷ vitesse sur la côte × 60 : =B21/B5*60. Le temps aux arrêts et l’attente ne sont pas de la conduite.' } });
  L.push({ ...vide, A: lib('Conduite totale (min)', 'resultat'),
    B: { saisie: true, formule: true, tolerance: 0.5, type: 'resultat', libelle: 'conduite totale',
      attendu: (lire) => (lire('B10') == null || lire('B22') == null ? null : 2 * lire('B10') + lire('B22')),
      aide: 'Aller + côte + retour : l’autoroute compte deux fois, =B10+B22+B10. À comparer à la conduite max. sans pause (B7 : 270 min = 4 h 30).' } });
  L.push({ ...vide, A: lib('Étape 7 · Pause (45 ou 0)', 'etape'),
    B: { saisie: true, formule: false, tolerance: 0, type: 'etape', libelle: 'pause',
      attendu: (lire) => (lire('B23') == null ? null : (lire('B23') > JOUR.pause.apres ? JOUR.pause.duree : 0)),
      aide: 'Une pause de 45 min s’il en faut une : compare ta conduite totale (B23) à 270 min (4 h 30). Au-delà, tape 45 ; sinon, tape 0.' } });
  L.push({ ...vide, A: lib('Retour à Buchelay', 'resultat'),
    B: { saisie: true, formule: true, format: 'heure', tolerance: 0.5, type: 'resultat', libelle: 'heure de retour',
      attendu: (lire) => (!dernier || [dernier, 'B19', 'B10', 'B24'].some((x) => lire(x) == null) ? null
        : lire(dernier) + lire('B19') / JOUR.vitesse * 60 + lire('B10') + lire('B24')),
      aide: `Départ du dernier arrêt + km du retour ÷ vitesse × 60 + autoroute + pause : =${dernier || 'D18'}+B19/B5*60+B10+B24. `
        + 'À comparer à 15:30 (B8).' } });
  return L;
}

// Les cellules de la feuille, comme la grille les donne à l'évaluateur (`cellulesDe` dans `core/types/grille.js`) : la donnée vaut
// son nombre, la cellule à remplir vaut ce que l'élève y a tapé. Pour lire une valeur de la feuille hors de l'écran (texte d'une
// question, menu du SMS, corrigé).
const COLS = ['A', 'B', 'C', 'D', 'E', 'F'];
export function valeursFeuille(lignes, cases) {
  const c = {};
  lignes.forEach((Lg, i) => COLS.forEach((col) => {
    const v = Lg[col], a = `${col}${i + 1}`;
    if (v && typeof v === 'object') {
      if (v.saisie) c[a] = cases && cases[a] != null ? String(cases[a]) : '';
      else if (v.valeur != null) c[a] = v.valeur;
    } else if (v != null) c[a] = v;
  }));
  return evaluerGrille(c).valeurs;
}
// Les formules de RÉFÉRENCE d'une tournée (corrigé, tests) : ce qu'un élève qui suit les aides écrit.
export function formulesReference(b) {
  const n = Math.min(b.retenus.length, LIGNES_ARRETS);
  const cases = { B10: '=B3/B4*60', B11: '=B2+B10', B21: '=SOMME(B13:B19)', B22: '=B21/B5*60', B23: '=B10+B22+B10' };
  for (let i = 0; i < n; i++) {
    const r = REF.premiereLigne + i, p = b.retenus[i];
    cases[`C${r}`] = `=${i === 0 ? 'B11' : `D${r - 1}`}+B${r}/B5*60`;
    cases[`D${r}`] = b.attentes[p.id] > 0 ? `=E${r}+B6` : `=C${r}+B6`;
  }
  cases.B24 = b.pauseDue ? '45' : '0';
  cases.B25 = `=D${REF.premiereLigne + n - 1}+B19/B5*60+B10+B24`;
  return cases;
}

// ─────────────────────────────────────────────────────────────── l'état de l'élève (lu par les jalons, les questions, le SMS)
export const etatTournee = (db) => (db && db.transport && db.transport[TRANSPORT_ID] && db.transport[TRANSPORT_ID].tournee) || null;
// « Envoyer la tournée à Lucas » (le bouton `termine` de la vue) : la carte et la feuille sont figées.
export const tourneeEnvoyee = (db) => { const e = etatTournee(db); return !!(e && e.termine); };
export const ordreDe = (db) => { const e = etatTournee(db); return e && Array.isArray(e.ordre) ? e.ordre.map(String) : []; };
export const casesDe = (db) => { const e = etatTournee(db); return (e && e.grille && e.grille.cases) || {}; };
// L'heure de retour que donne la feuille de l'élève (B25), ou `null`.
export function retourFeuille(db) {
  const b = journee(ordreDe(db));
  if (!b.retenus.length) return null;
  const v = valeursFeuille(lignesFeuille(b), casesDe(db))[REF.retour];
  return v == null || !Number.isFinite(v) ? null : v;
}

// ─────────────────────────────────────────────────────────────── le SMS à Lucas (menus calculés)
// L'heure de retour : 4 heures au quart d'heure, dont la plus proche du retour RÉEL (bilan) et celle de la feuille de l'élève.
const quart = (m) => Math.round(m / 15) * 15;
export function heuresSms(retourReel, retourFeuille) {
  const juste = quart(retourReel);
  const S = new Set([juste]);
  if (retourFeuille != null && Number.isFinite(retourFeuille)) S.add(quart(retourFeuille));
  for (const d of [15, -15, 30, -30, 45, -45, 60]) { if (S.size >= 4) break; S.add(juste + d); }
  const L = [...S].sort((a, b) => a - b).slice(0, 4);
  if (!L.includes(juste)) L[L.length - 1] = juste;
  return { heures: L.sort((a, b) => a - b), juste };
}
export const PHRASE_PAUSE = ['Pas de pause à prévoir.', 'Pense à ta pause de 45 min.'];
