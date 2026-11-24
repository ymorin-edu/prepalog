// Stratelog, Avant l'Hiver : la partie de classe, partagée en temps réel entre les postes (calcul pur, sans écran ni base).
//
// QUI ÉCRIT QUOI. La partie vit dans la base de classe de la séance (portée 'groupe', Realtime Database). Les règles de
// sécurité déjà publiées suffisent : l'enseignant écrit partout, un élève n'écrit QUE la ligne qui porte son uid.
//   - table `seigneur`, ligne `etat` : l'état de la partie (phase, villes, membres, présents, la partie du moteur de règles,
//     les dépôts ramassés, la chronique…). Écrite par le Seigneur seul.
//   - table `photos` : une photo de l'état avant chaque geste du Seigneur, pour revenir en arrière. Lue par lui seul.
//   - tables `j_A`, `j_B`… (une par ville) : la ligne de chaque élève, à la clé de son uid. Il y écrit sa présence, le lot
//     de rôles qu'il prend, les cases de SES rôles, le choix du nom et du blason, et le dépôt du registre (l'Argentier).
//     Une table par ville : chaque poste n'écoute que sa ville, ce qui garde la bande passante d'une classe raisonnable.
// Chaque ligne porte un seul champ `json` (le contenu en texte) : la base ne garde ni les tableaux vides ni les trous.
//
// Ce que le Seigneur fait est un « geste » : une fonction ci-dessous, qui rend un NOUVEL état (photo prise avant par l'écran).

import * as R from './regles.js';
import { planDepart } from './dessins.js';

export const VERSION = 1;
export const TABLE_ETAT = 'seigneur';
export const LIGNE_ETAT = 'etat';
export const TABLE_PHOTOS = 'photos';
export const IDS = ['A', 'B', 'C', 'D', 'E'];
export const tableVille = (id) => `j_${id}`;
// Une présence vaut 20 minutes : l'écran de l'élève la renouvelle toutes les 4 minutes tant qu'il est ouvert.
export const VIE_PRESENCE = 20 * 60000;

export const ROLES = { I: 'Intendant des greniers', M: 'Marchand', O: "Maître d'œuvre", B: 'Argentier' };
export const ROLES_COURTS = { I: 'Intendant', M: 'Marchand', O: 'Maître d’œuvre', B: 'Argentier' };
// Lots de rôles selon le nombre de présents dans la ville (fusions décidées le 05/10, noms du 24/11).
export const LOTS = { 4: [['I'], ['M'], ['O'], ['B']], 3: [['I', 'B'], ['M'], ['O']], 2: [['M', 'I'], ['O', 'B']], 1: [['I', 'M', 'O', 'B']] };
export const lotsPour = (n) => LOTS[Math.min(4, n)] || [];

export const NOMS_VILLES = ['Valbrume', 'Hautepierre', 'Grisemoulin', 'Bellerive', 'Combefroide', 'Roncevaux-le-Bourg', 'Fontfroide',
  'Brumecourt', 'Saint-Aubin-des-Bois', 'Pierrefeu', 'Montrelais', 'Clairefontaine', 'Boisfleuri', 'Malpertuis', 'Montagrier',
  'Vauclair', 'Beaulieu-sur-Loue', 'Chantemerle', 'Rochebrune', 'Aigueblanche', 'Froidmont', 'Courtebotte', 'Haute-Seille', 'Mortemer',
  'Bonneval', 'Longuerive', 'Corbières-la-Tour', 'Champfleury', 'Belcastel', 'Vieux-Moulin'];

const clone = (x) => JSON.parse(JSON.stringify(x));
const melange = (t, r = Math.random) => { const l = [...t]; for (let i = l.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [l[i], l[j]] = [l[j], l[i]]; } return l; };
export function tirerNoms(n, pris = [], r = Math.random) { return melange(NOMS_VILLES.filter((x) => !pris.includes(x)), r).slice(0, n); }
const num = (x) => (x === '' || x === null || x === undefined || Number.isNaN(Number(x)) ? undefined : Number(x));
export const rempli = (x) => x !== '' && x !== null && x !== undefined;

// ------------------------------------------------------------------------------------------------- l'état du Seigneur
export function etatNeuf() {
  return {
    v: VERSION, phase: 'preparation',
    reglages: { nbVilles: 3, nommage: 'liste', rotation: false, aide: true, calc: true, minutes: 12 },
    mode: null,             // 'hasard' | 'main' : comment les villes ont été formées
    villes: [],             // [{ id, nom, nommee, blason: { fig, teinte } | null }]
    membres: {},            // uid → id de ville
    noms: {},               // uid → « Prénom N. » (affiché aux camarades de ville et au tableau projeté)
    presence: {},           // uid → true | false : présence forcée par le Seigneur avant l'ouverture du tour
    presents: {},           // id de ville → [uid] : figé à l'ouverture du tour, puis corrigé par le Seigneur
    attrib: {},             // id de ville → { tour, n, k, L: { lot: uid | null }, bloque: { lot: { uid: t } } }
    vides: {},              // id de ville → 'consomme' | 'sommeil' (ville sans présent)
    ouv: {},                // id de ville → compteur : registre rouvert par le Seigneur (un dépôt plus ancien ne compte plus)
    partie: null,           // la partie du moteur de règles (regles.js)
    plans: {}, plansApres: null,
    equipesPrec: {},
    depots: {}, force: {},  // registres ramassés à la clôture (ou forcés)
    carte: null, journal: null, apres: null, notes: null,
    chrono: { fin: null, restant: 12 * 60000 },
    hist: {}, histCourant: {}, // rôles tenus au tour précédent (règle « garder son rôle » / « changer de rôle »)
    joues: {},              // uid → id de la ville où il a joué (au moins un tour) : sa note de fin
    choixVus: {},           // uid → date du dernier choix de ville déjà reporté
    notesPosees: false, nPhotos: 0,
  };
}

export const villeDe = (E, id) => (E.villes || []).find((v) => v.id === id) || null;
export const membresDe = (E, id) => Object.keys(E.membres || {}).filter((u) => E.membres[u] === id)
  .sort((a, b) => String(E.noms[a] || a).localeCompare(String(E.noms[b] || b), 'fr'));
export const tour = (E) => (E.partie ? E.partie.tour : 0);
export const enTour = (E) => E.phase === 'tour';

// Lignes de la base (`[{ id, json }]`) → { uid: objet }. Une ligne illisible est ignorée. L'uid est la clé de la ligne,
// jamais ce que dit son contenu ; en mode réel la base y ajoute `_par` (l'auteur) : une ligne posée par un autre que
// son titulaire (un élève qui écrirait à la place d'un camarade absent) est ignorée.
export function lireLignes(lignes) {
  const L = {};
  (lignes || []).forEach((l) => {
    if (!l || !l.id || (l._par && l._par !== l.id)) return;
    try { const o = typeof l.json === 'string' ? JSON.parse(l.json) : null; if (o && typeof o === 'object') L[l.id] = { ...o, uid: l.id }; } catch (e) { /* ignorée */ }
  });
  return L;
}
export function lireEtat(lignes) {
  const l = (lignes || []).find((x) => x.id === LIGNE_ETAT);
  if (!l) return null;
  try { const E = JSON.parse(l.json); return E && E.v === VERSION ? E : null; } catch (e) { return null; }
}

// --------------------------------------------------------------------------------------------------------- présence
// Vu dans les 20 dernières minutes (horloge du poste qui lit), et pas déclaré absent par le Seigneur.
export function presentEnDirect(E, L, uid, maintenant) {
  if (E.presence && E.presence[uid] === false) return false;
  if (E.presence && E.presence[uid] === true) return true;
  const l = L[uid];
  return !!(l && l.vu && maintenant - l.vu < VIE_PRESENCE);
}
// Les présents d'une ville : figés pendant le tour, en direct avant.
export function presentsDe(E, L, id, maintenant) {
  if (E.phase !== 'preparation' && E.phase !== 'avant-tour' && E.presents && E.presents[id]) return E.presents[id].filter((u) => E.membres[u] === id);
  return membresDe(E, id).filter((u) => presentEnDirect(E, L, u, maintenant));
}
// Arrivé après l'ouverture du tour : vu récemment, membre, mais pas dans les présents figés.
export function retardataires(E, L, id, maintenant) {
  if (!enTour(E)) return [];
  const p = new Set(presentsDe(E, L, id, maintenant));
  return membresDe(E, id).filter((u) => !p.has(u) && E.presence[u] !== false && L[u] && L[u].vu && maintenant - L[u].vu < VIE_PRESENCE);
}

// ----------------------------------------------------------------------------------------------------- les rôles
// Qui tient quel lot. Ordre : l'attribution du Seigneur (rôle gardé du tour précédent, ou réattribué d'un clic) d'abord,
// sauf si l'élève l'a rendue ; puis les élèves qui ont cliqué « Je prends », le premier arrivé l'emporte.
export function titulaires(E, L, id, maintenant = Date.now()) {
  const pres = presentsDe(E, L, id, maintenant);
  const n = Math.min(4, pres.length);
  const lots = lotsPour(n);
  const t = tour(E);
  const lot = {};
  const pris = new Set();
  const A = E.attrib && E.attrib[id];
  const okA = !!(A && A.tour === t && A.n === n);
  if (okA) {
    lots.forEach((_, i) => {
      const u = A.L ? A.L[i] : null;
      if (!u || !pres.includes(u) || pris.has(u)) return;
      const r = L[u] && L[u].lache;
      if (r && r.tour === t && r.n === n && r.lot === i && r.k === A.k) return;
      lot[i] = u; pris.add(u);
    });
  }
  const demandes = pres.filter((u) => !pris.has(u)).map((u) => [u, L[u] && L[u].claim])
    .filter(([, c]) => c && c.tour === t && c.n === n && lots[c.lot])
    .sort((a, b) => (a[1].t - b[1].t) || (a[0] < b[0] ? -1 : 1));
  demandes.forEach(([u, c]) => {
    if (pris.has(u) || lot[c.lot]) return;
    if (okA && A.bloque && A.bloque[c.lot] && A.bloque[c.lot][u] === c.t) return;   // le Seigneur a libéré ce lot
    if (lotInterdit(E, n, c.lot, u)) return;
    lot[c.lot] = u; pris.add(u);
  });
  const role = {};
  lots.forEach((l, i) => l.forEach((r) => { role[r] = lot[i] || null; }));
  const rolesDe = (u) => Object.keys(role).filter((r) => role[r] === u);
  return { n, lots, lot, role, rolesDe, tous: lots.length > 0 && lots.every((_, i) => lot[i]), presents: pres };
}
// Partie « obliger à changer de rôle » : le lot qui contient un rôle tenu au tour précédent est fermé, s'il en reste un autre.
export function lotInterdit(E, n, i, u) {
  if (!E.reglages.rotation || tour(E) === 0) return false;
  const avant = E.hist && E.hist[u];
  if (!avant || !avant.length) return false;
  const lots = lotsPour(n);
  if (lots.length < 2) return false;
  if (!lots.some((l) => !l.some((r) => avant.includes(r)))) return false;
  return lots[i].some((r) => avant.includes(r));
}

// ------------------------------------------------------------------------------------------- le brouillon de la ville
// Chaque rôle remplit sa part ; le brouillon de la ville les réunit. Pour un rôle, on prend la part de son titulaire s'il
// en a une pour ce tour, sinon la plus récente (celle de l'élève qui le tenait avant une réattribution).
const partDe = (L, uids, r, t, titulaire) => {
  const lp = (u) => L[u] && L[u].parts && L[u].parts[r] && L[u].parts[r].tour === t ? L[u].parts[r] : null;
  if (titulaire && lp(titulaire)) return lp(titulaire);
  return uids.map(lp).filter(Boolean).sort((a, b) => b.t - a.t)[0] || null;
};
export function parts(E, L, id, tit) {
  const t = tour(E);
  const uids = membresDe(E, id);
  const P = {};
  ['I', 'M', 'O', 'B'].forEach((r) => { P[r] = partDe(L, uids, r, t, tit ? tit.role[r] : null); });
  return P;
}
export function postesMax(v, saison) {
  return { champ: R.equipesParChamp(saison) * (v.bats.champ || 0), dech: 99, bucheron: v.bats.bucheron || 0,
    carriere: saison === 'Hiver' ? 0 : (v.bats.carriere || 0), atelier: v.bats.atelier || 0, guet: v.bats.guet ? 1 : 0 };
}
// Par défaut, les équipes restent où elles étaient (dans la limite de ce que la saison permet) ; le quai repart de zéro.
export function equipesBornees(v, saison, eq) {
  const e = { champ: 0, dech: 0, bucheron: 0, carriere: 0, atelier: 0, guet: 0, ...(eq || {}) };
  const max = postesMax(v, saison);
  let libres = R.equipesDe(v.hab);
  Object.keys(e).forEach((k) => { e[k] = Math.max(0, Math.min(e[k] || 0, max[k] ?? 0, libres)); libres -= e[k]; });
  e.dech = 0;
  return e;
}
export function brouillon(E, L, id, tit) {
  const P = parts(E, L, id, tit);
  const v = E.partie.etat[id];
  const saison = R.saisonDu(tour(E));
  const I = P.I || {}; const M = P.M || {}; const O = P.O || {}; const B = P.B || {};
  // Sans tour précédent joué (début de partie, ville qui dormait), les équipes de départ : 9 aux champs, 1 au bûcheron.
  const defaut = E.equipesPrec[id] || { champ: 9, bucheron: 1 };
  return {
    ops: (M.ops || []).map((o) => ({ ...o, recu: I.recus && I.recus[o.id] !== undefined ? I.recus[o.id] : '' })),
    chantiers: (O.chantiers || []).map((c) => c.k),
    places: (O.chantiers || []).map((c) => c.place || null),
    equipes: I.equipes ? { champ: 0, dech: 0, bucheron: 0, carriere: 0, atelier: 0, guet: 0, ...I.equipes } : equipesBornees(v, saison, defaut),
    coup: B.coup || null,
    reserve: !!I.reserve,
    reg: { besoin: I.besoin ?? '', grenier: I.grenier ?? '', halle: O.halle ?? '', caisse: B.caisse ?? '' },
  };
}
// Ce que le titulaire d'un rôle écrit dans sa ligne : sa part, recopiée du brouillon de la ville, avec le changement.
export function partEcrite(r, dr, t, maintenant) {
  const base = { tour: t, t: maintenant };
  if (r === 'I') return { ...base, equipes: { ...dr.equipes }, reserve: !!dr.reserve, besoin: dr.reg.besoin, grenier: dr.reg.grenier,
    recus: Object.fromEntries(dr.ops.filter((o) => o.sens === 'achat').map((o) => [o.id, o.recu ?? ''])) };
  if (r === 'M') return { ...base, ops: dr.ops.map(({ recu, ...o }) => ({ ...o })) };
  if (r === 'O') return { ...base, chantiers: dr.chantiers.map((k, i) => ({ k, place: dr.places[i] || null })), halle: dr.reg.halle };
  return { ...base, coup: dr.coup ? { ...dr.coup } : null, caisse: dr.reg.caisse };
}

// Le brouillon en décisions pour le moteur de règles (opérations incomplètes écartées).
export function decisionsDe(dr) {
  const ok = (o) => R.MARCHANDISES.includes(o.m) && num(o.q) > 0;
  const achats = dr.ops.filter((o) => o.sens === 'achat' && ok(o));
  const ventes = dr.ops.filter((o) => o.sens === 'vente' && ok(o));
  return {
    achats: achats.map((o) => ({ m: o.m, q: num(o.q), charrettes: num(o.ch) || 0 })),
    ventes: ventes.map((o) => ({ m: o.m, q: num(o.q), charrettes: num(o.ch) || 0 })),
    chantiers: [...dr.chantiers],
    equipes: { ...dr.equipes },
    coup: dr.coup && dr.coup.cible && dr.coup.butin ? { ...dr.coup } : null,
    reserve: dr.reserve,
    registre: { besoin: num(dr.reg.besoin), grenier: num(dr.reg.grenier), halle: num(dr.reg.halle), caisse: num(dr.reg.caisse),
      achats: achats.map((o) => ({ cout: num(o.montant), recu: num(o.recu) })), ventes: ventes.map((o) => ({ recette: num(o.montant) })) },
  };
}
// Ce qui empêche le dépôt (registre rouge).
export function erreurs(partie, id, dr) {
  const e = R.valider(partie, id, decisionsDe(dr));
  dr.ops.forEach((o, i) => {
    if (!(num(o.q) > 0)) e.push(`Opération ${i + 1} au Marché : la quantité manque.`);
    else if (!(num(o.ch) > 0)) e.push(`Opération ${i + 1} au Marché : le nombre de charrettes manque.`);
  });
  if (dr.coup && !(dr.coup.cible && dr.coup.butin)) e.push('Larcin : choisir la ville et le butin.');
  return [...new Set(e)];
}
// Cases notées encore vides (registre orange).
export const vides = (partie, id, dr) => R.corriger(partie, id, decisionsDe(dr)).cases.filter((c) => c.donne === null && typeof c.attendu !== 'boolean').length;
export const paUtilises = (dr) => dr.ops.length + dr.chantiers.length + (dr.coup ? 1 : 0);

// Rendu forcé : ce qui est rempli part tel quel ; une opération incomplète est ignorée ; si le reste ne tient pas
// (caisse, points d'action), seules les équipes et les cases du registre partent.
export function forcer(partie, id, dr) {
  const d = decisionsDe(dr);
  if (R.valider(partie, id, d).length) {
    d.achats = []; d.ventes = []; d.chantiers = []; d.coup = null; d.registre.achats = []; d.registre.ventes = [];
    if (R.valider(partie, id, d).length) d.equipes = R.equipesDOffice(partie.etat[id], R.saisonDu(partie.tour));
  }
  return d;
}

// Le dépôt d'une ville pour ce tour (écrit par l'Argentier dans sa ligne), ou null.
export function depotDe(E, L, id) {
  const t = tour(E); const o = (E.ouv && E.ouv[id]) || 0;
  const ds = membresDe(E, id).map((u) => L[u] && L[u].depot).filter((d) => d && d.tour === t && (d.o || 0) === o);
  return ds.sort((a, b) => a.t - b.t)[0] || null;
}
// Une ville a-t-elle rendu son registre (déposé par l'Argentier, ou ramassé par le Seigneur) ?
export function aRendu(E, L, id) { return !!((E.depots && E.depots[id] !== undefined) || depotDe(E, L, id)); }

// ------------------------------------------------------------------------------------------------- gestes du Seigneur
// Chacun rend un nouvel état ; l'écran prend la photo de l'ancien avant de l'écrire.
export function regler(E0, patch) { const E = clone(E0); Object.assign(E.reglages, patch); if (patch.minutes && !E.chrono.fin) E.chrono.restant = patch.minutes * 60000; return E; }

export function formerVilles(E0, eleves, mode, r = Math.random) {
  const E = clone(E0);
  const n = E.reglages.nbVilles;
  const noms = tirerNoms(n, [], r);
  E.villes = IDS.slice(0, n).map((id, i) => ({ id, nom: E.reglages.nommage === 'eleves' ? `Ville ${i + 1}` : noms[i], nommee: E.reglages.nommage !== 'eleves', blason: null }));
  E.membres = {};
  E.noms = { ...E.noms };
  eleves.forEach((e) => { E.noms[e.uid] = e.nom; });
  if (mode === 'hasard') melange(eleves.map((e) => e.uid), r).forEach((u, i) => { E.membres[u] = E.villes[i % n].id; });
  E.mode = mode;
  return E;
}
export function renommerNommage(E0, nommage, r = Math.random) {
  const E = clone(E0);
  E.reglages.nommage = nommage;
  const noms = tirerNoms(E.villes.length, [], r);
  E.villes.forEach((v, i) => { v.nom = nommage === 'eleves' ? `Ville ${i + 1}` : noms[i]; v.nommee = nommage !== 'eleves'; });
  return E;
}
export function nommer(E0, id, nom) { const E = clone(E0); const v = villeDe(E, id); const t = String(nom || '').trim().slice(0, 28); if (v && t) { v.nom = t; v.nommee = true; } return E; }
export function poserBlason(E0, id, blason) { const E = clone(E0); const v = villeDe(E, id); if (v) v.blason = blason ? { fig: blason.fig, teinte: blason.teinte } : null; return E; }

// Un élève change de ville (ou sort de toute ville) : à tout moment. Les rôles des deux villes sont refaits.
export function deplacer(E0, uid, id) {
  const E = clone(E0);
  const avant = E.membres[uid];
  if (id) E.membres[uid] = id; else delete E.membres[uid];
  if (enTour(E)) {
    [avant, id].filter(Boolean).forEach((x) => {
      const p = (E.presents[x] || []).filter((u) => u !== uid);
      if (x === id && E.presence[uid] !== false) p.push(uid);
      E.presents[x] = p;
    });
  }
  return E;
}
export const nbOk = (E) => E.villes.every((v) => { const n = membresDe(E, v.id).length; return n >= 1 && n <= 4; });

export function villesPretes(E0, graine = 1 + Math.floor(Math.random() * 1e6)) {
  const E = clone(E0);
  E.partie = R.nouvellePartie({ villes: E.villes.map((v) => v.id), graine });
  E.plans = Object.fromEntries(E.villes.map((v) => [v.id, planDepart()]));
  E.phase = 'avant-tour';
  E.presence = {}; E.vides = {};
  return E;
}

// Présence forcée par le Seigneur. Avant le tour : pour l'ouverture. Pendant le tour : ajoute ou retire l'élève des présents.
export function marquerPresence(E0, uid, present) {
  const E = clone(E0);
  E.presence[uid] = present;
  const id = E.membres[uid];
  if (enTour(E) && id) {
    const p = (E.presents[id] || []).filter((u) => u !== uid);
    if (present) p.push(uid);
    E.presents[id] = p;
  }
  return E;
}
export function choisirVide(E0, id, choix) { const E = clone(E0); E.vides[id] = choix; return E; }

// Ce qui manque avant d'ouvrir le tour (vide = on peut ouvrir).
export function manquesOuverture(E, L, maintenant) {
  const m = [];
  E.villes.forEach((v) => {
    if (!v.nommee || !v.blason) m.push(`${v.nom} : il manque ${!v.nommee ? 'le nom' : ''}${!v.nommee && !v.blason ? ' et ' : ''}${!v.blason ? 'le blason' : ''}.`);
    if (!presentsDe(E, L, v.id, maintenant).length && !E.vides[v.id]) m.push(`${v.nom} : aucun élève présent, choisis ce qui lui arrive.`);
  });
  return m;
}

export function ouvrirTour(E0, L, maintenant) {
  const E = clone(E0);
  const t = tour(E);
  E.presents = {}; E.attrib = {};
  E.villes.forEach((v) => {
    const pres = presentsDe(E0, L, v.id, maintenant);
    E.presents[v.id] = pres;
    const n = Math.min(4, pres.length);
    const avant = E.histCourant[v.id];
    const A = { tour: t, n, k: 1, L: {}, bloque: {} };
    // Par défaut, chacun garde son rôle du tour précédent, si la ville a le même nombre de présents (Tristan, 21/11).
    if (!E.reglages.rotation && avant && avant.n === n) Object.keys(avant.L).forEach((i) => { if (pres.includes(avant.L[i])) A.L[i] = avant.L[i]; });
    E.attrib[v.id] = A;
  });
  E.phase = 'tour';
  E.depots = {}; E.force = {}; E.ouv = {};
  E.chrono = { fin: null, restant: E.reglages.minutes * 60000 };
  return E;
}

// Réattribuer un lot d'un clic (uid, ou null pour le libérer). `tit` : les titulaires tels que le Seigneur les voit.
export function reattribuer(E0, L, id, i, uid, tit) {
  const E = clone(E0);
  const t = tour(E);
  const A0 = E.attrib[id] && E.attrib[id].tour === t && E.attrib[id].n === tit.n ? E.attrib[id] : { tour: t, n: tit.n, k: 0, L: {}, bloque: {} };
  const A = { ...A0, k: (A0.k || 0) + 1, L: {}, bloque: {} };
  // Les autres lots restent à leur titulaire actuel ; l'élève choisi quitte son lot précédent.
  Object.keys(tit.lot).forEach((j) => { if (tit.lot[j] && tit.lot[j] !== uid) A.L[j] = tit.lot[j]; });
  if (uid) A.L[i] = uid; else A.L[i] = null;
  // Les demandes en cours ne reprennent pas un lot que le Seigneur vient de fixer ou de libérer.
  tit.lots.forEach((_, j) => {
    A.bloque[j] = {};
    tit.presents.forEach((u) => { const c = L[u] && L[u].claim; if (c && c.tour === t && c.n === tit.n && c.lot === j && A.L[j] !== u) A.bloque[j][u] = c.t; });
  });
  E.attrib[id] = A;
  return E;
}
// Rouvrir le registre d'une ville qui a déposé (elle peut corriger, puis redéposer).
export function rouvrir(E0, id) { const E = clone(E0); E.ouv[id] = ((E.ouv && E.ouv[id]) || 0) + 1; delete E.depots[id]; delete E.force[id]; return E; }

// Compte à rebours (heure du poste du Seigneur).
export const restant = (E, maintenant = Date.now()) => Math.max(0, E.chrono.fin ? E.chrono.fin - maintenant : E.chrono.restant);
export function chrono(E0, geste, maintenant = Date.now()) {
  const E = clone(E0); const c = E.chrono;
  if (geste === 'lancer') c.fin = maintenant + c.restant;
  else if (geste === 'pause') { c.restant = restant(E0, maintenant); c.fin = null; }
  else if (geste === 'plus1') { if (c.fin) c.fin += 60000; else c.restant += 60000; }
  else if (geste === 'remise') { c.fin = null; c.restant = E.reglages.minutes * 60000; }
  return E;
}

// Forcer le rendu : chaque ville qui a des présents et n'a pas déposé est ramassée telle qu'elle est remplie.
export function forcerRendu(E0, L, maintenant) {
  const E = clone(E0);
  E.villes.forEach((v) => {
    if (aRendu(E0, L, v.id) || !presentsDe(E0, L, v.id, maintenant).length) return;
    const tit = titulaires(E0, L, v.id, maintenant);
    const dr = brouillon(E0, L, v.id, tit);
    E.depots[v.id] = { ...forcer(E0.partie, v.id, dr), places: dr.places };
    E.force[v.id] = true;
  });
  return E;
}
// Villes qui doivent encore rendre (au moins un présent, pas de dépôt).
export const enAttente = (E, L, maintenant) => E.villes.filter((v) => presentsDe(E, L, v.id, maintenant).length && !aRendu(E, L, v.id));

// Clore les registres et tirer la carte de la saison.
export function clore(E0, L, maintenant, r = Math.random) {
  const E = clone(E0);
  E.villes.forEach((v) => {
    if (E.depots[v.id] !== undefined) return;
    const d = depotDe(E0, L, v.id);
    if (d) E.depots[v.id] = { ...d.d, places: d.places || [] };
    else if (!presentsDe(E0, L, v.id, maintenant).length) E.depots[v.id] = E.vides[v.id] === 'sommeil' ? 'sommeil' : null;
    else E.depots[v.id] = null;
  });
  E.chrono = { fin: null, restant: restant(E0, maintenant) };
  E.carte = R.tirerCarte(E.partie, r);
  E.phase = 'carte';
  return E;
}

export function resoudre(E0, L, maintenant) {
  const E = clone(E0);
  const dec = {};
  E.villes.forEach((v) => { const d = E.depots[v.id]; dec[v.id] = d && d !== 'sommeil' ? (({ places, ...x }) => x)(d) : d ?? null; });
  const r = R.resoudreTour(E.partie, dec, E.carte || {});
  E.apres = r.partie; E.journal = r.journal;
  // Le plan suit : les chantiers déposés prennent leur case ; ceux qui s'achèvent passent « faits ».
  E.plansApres = {};
  E.villes.forEach((v) => {
    const plan = (E.plans[v.id] || []).map((p) => ({ ...p }));
    const d = E.depots[v.id];
    if (d && d !== 'sommeil' && !r.journal[v.id].sansDepot) d.chantiers.forEach((k, i) => {
      const pl = (d.places || [])[i];
      if (k === 'nef') { const ch = plan.find((p) => p.k === 'choeur'); if (ch) plan.splice(plan.indexOf(ch), 1); }
      plan.push({ k, x: pl ? pl[0] : -1, y: pl ? pl[1] : -1, fait: false });
    });
    (r.journal[v.id].acheves || []).forEach((k) => { const p = plan.find((x) => x.k === k && !x.fait); if (p) p.fait = true; });
    E.plansApres[v.id] = plan;
    // Rôles tenus ce tour : gardés au tour suivant, ou interdits si la partie oblige à changer.
    const tit = titulaires(E0, L, v.id, maintenant);
    E.histCourant[v.id] = { n: tit.n, L: { ...tit.lot } };
    tit.presents.forEach((u) => { E.hist[u] = tit.rolesDe(u); if (d !== 'sommeil') E.joues[u] = v.id; });
  });
  E.phase = 'resolu';
  return E;
}

export function suivant(E0) {
  const E = clone(E0);
  const fin = E.partie.tour === R.DERNIER_TOUR;
  const essai = E.partie.tour === 0;
  E.villes.forEach((v) => { const d = E.depots[v.id]; E.equipesPrec[v.id] = d && d !== 'sommeil' ? d.equipes : (E.equipesPrec[v.id] || null); });
  E.plans = essai ? Object.fromEntries(E.villes.map((v) => [v.id, planDepart()])) : E.plansApres;
  E.partie = essai ? R.remettreAZero(E.apres) : E.apres;
  if (essai) E.joues = {};   // les équipes du tour d'essai restent en place pour le tour 1
  E.plansApres = null;
  E.depots = {}; E.force = {}; E.carte = null; E.journal = null; E.apres = null;
  E.presents = {}; E.attrib = {}; E.vides = {}; E.presence = {}; E.ouv = {};
  E.chrono = { fin: null, restant: E.reglages.minutes * 60000 };
  if (fin) {
    E.phase = 'fin';
    E.notes = R.notes(Object.fromEntries(E.villes.map((v) => [v.id, R.score(E.partie.etat[v.id])])));
  } else E.phase = 'avant-tour';
  return E;
}

// Les choix de ville faits par les élèves (nom, blason), reportés dans l'état par le poste du Seigneur.
export function reporterChoix(E0, L) {
  let E = null;
  Object.values(L).forEach((l) => {
    const c = l.choix; const id = E0.membres[l.uid];
    if (!c || !id || !(c.t > ((E || E0).choixVus[l.uid] || 0))) return;
    E = E || clone(E0);
    const v = villeDe(E, id);
    if (v) {
      if (c.nom && E.reglages.nommage === 'eleves') { v.nom = String(c.nom).trim().slice(0, 28) || v.nom; v.nommee = true; }
      if (c.fig !== undefined && c.fig !== null) v.blason = { fig: c.fig, teinte: c.teinte || 'gueules' };
    }
    E.choixVus[l.uid] = c.t;
  });
  return E;
}

// Les notes de fin de partie, élève par élève : la note de la ville où il a joué au moins un tour (décision du 21/11).
export function notesEleves(E) {
  if (!E.notes) return {};
  const res = {};
  Object.keys(E.joues || {}).forEach((u) => { const n = E.notes[E.joues[u]]; if (n) res[u] = { ...n, ville: E.joues[u] }; });
  return res;
}
